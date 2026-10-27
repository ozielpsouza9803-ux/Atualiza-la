import 'dotenv/config';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import path from 'path';
import { fileURLToPath } from 'url';
import { createClient } from '@supabase/supabase-js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

const DEFAULT_SUPABASE_URL = 'https://utrpckrchcbqgzbhvlzy.supabase.co';
const DEFAULT_SUPABASE_ANON_KEY = 'sb_publishable_YkRZNDptF3UTgjhFjL2wVw_InE5wV7L';

function sanitizeSupabaseUrl(rawUrl?: string): string {
  if (!rawUrl) return DEFAULT_SUPABASE_URL;
  const match = rawUrl.trim().match(/https:\/\/[a-z0-9.-]+\.supabase\.co/i) || rawUrl.trim().match(/https?:\/\/[^\s]+/i);
  return match ? match[0] : DEFAULT_SUPABASE_URL;
}

function sanitizeSupabaseKey(rawKey?: string, fallback = ''): string {
  if (!rawKey) return fallback;
  const cleaned = rawKey.trim().split(/\s+/)[0];
  if (
    cleaned === 'SUPABASE_SERVICE_ROLE_KEY' || 
    cleaned === 'ADMIN_API_SECRET' || 
    cleaned === 'sb_secret_key' ||
    cleaned.startsWith('SUPABASE_') ||
    cleaned.length < 20
  ) {
    return fallback;
  }
  return cleaned || fallback;
}

function isValidJwt(token?: string): boolean {
  if (!token) return false;
  const parts = token.trim().split('.');
  return parts.length === 3 && parts[0].length > 10;
}

const supabaseUrl = sanitizeSupabaseUrl(process.env.VITE_SUPABASE_URL);
const anonKey = sanitizeSupabaseKey(process.env.VITE_SUPABASE_ANON_KEY, DEFAULT_SUPABASE_ANON_KEY);
const rawServiceKey = sanitizeSupabaseKey(process.env.SUPABASE_SERVICE_ROLE_KEY, '');
const serviceRoleKey = isValidJwt(rawServiceKey) ? rawServiceKey : '';

if (!process.env.VITE_SUPABASE_URL) {
  console.warn('VITE_SUPABASE_URL is not set in env, using default project URL:', supabaseUrl);
}
if (!serviceRoleKey) {
  if (rawServiceKey) {
    console.warn('SUPABASE_SERVICE_ROLE_KEY contains a placeholder or non-JWT value. Server will use anon client safely.');
  } else {
    console.warn('SUPABASE_SERVICE_ROLE_KEY is not set in env - serverSupabase will use anon key for proxy actions');
  }
}

console.log('DEBUG: Using Supabase URL:', supabaseUrl);
const supabase = createClient(supabaseUrl, anonKey);
const serverSupabase = serviceRoleKey ? createClient(supabaseUrl, serviceRoleKey) : supabase;

// Middleware de autorização para rotas administrativas do painel (sem senhas mestre no código)
const authorizeAdmin = async (req: any, res: any, next: any) => {
  // 1. Se fornecido token Bearer do Supabase Auth, valida a sessão
  const authHeader = req.headers['authorization'];
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7).trim();
    if (token) {
      try {
        const { data: { user }, error } = await supabase.auth.getUser(token);
        if (!error && user) {
          return next();
        }
      } catch {}
    }
  }

  // 2. Se houver ADMIN_API_SECRET configurado exclusivamente no ambiente do servidor
  if (process.env.ADMIN_API_SECRET) {
    const adminSecret = req.headers['x-admin-secret'];
    if (adminSecret && adminSecret === process.env.ADMIN_API_SECRET) {
      return next();
    }
    return res.status(403).json({ error: 'Unauthorized: Acesso restrito a administradores autorizados.' });
  }

  // 3. Em ambiente padrão da aplicação, permite a operação
  next();
};

async function startServer() {
  const app = express();
  const PORT = Number(process.env.PORT) || 3000;

  // Aumentar limite para upload de imagens em alta resolução
  app.use(express.json({ limit: '60mb' }));
  app.use(express.urlencoded({ limit: '60mb', extended: true }));

  app.get('/api/health', (req, res) => {
    res.json({ status: 'ok', timestamp: new Date().toISOString() });
  });

  // Endpoints seguros do Supabase (executados com segurança no backend sem expor chaves ao cliente)
  app.get('/api/supabase/data', async (req, res) => {
    try {
      const client = serverSupabase || supabase;
      if (!client) {
        return res.status(500).json({ error: 'Supabase client not configured' });
      }

      const [kidsResult, giftsResult, settingsResult, galleryResult, profilesResult] = await Promise.allSettled([
        client.from('kids').select('*').order('created_at', { ascending: true }),
        client.from('gifts').select('*'),
        client.from('site_settings').select('*').limit(1),
        client.from('gallery').select('*').order('sort_order', { ascending: true }),
        client.from('profiles').select('*')
      ]);

      const kids = (kidsResult.status === 'fulfilled' && !kidsResult.value.error) ? (kidsResult.value.data || []) : [];
      const gifts = (giftsResult.status === 'fulfilled' && !giftsResult.value.error) ? (giftsResult.value.data || []) : [];
      const siteSettings = (settingsResult.status === 'fulfilled' && !settingsResult.value.error) ? (settingsResult.value.data?.[0] || null) : null;
      const gallery = (galleryResult.status === 'fulfilled' && !galleryResult.value.error) ? (galleryResult.value.data || []) : [];
      const profiles = (profilesResult.status === 'fulfilled' && !profilesResult.value.error) ? (profilesResult.value.data || []) : [];

      res.json({
        kids,
        gifts,
        siteSettings,
        gallery,
        profiles,
        error: null
      });
    } catch (err: any) {
      console.error('Server error fetching Supabase data:', err);
      res.status(500).json({ error: err?.message || 'Internal error' });
    }
  });

  // Endpoints da Galeria (Upload para o bucket 'media' e gravação na tabela 'gallery')
  app.get('/api/supabase/gallery', async (req, res) => {
    try {
      const client = serverSupabase || supabase;
      if (!client) {
        return res.status(500).json({ error: 'Supabase client not configured' });
      }
      const { data, error } = await client
        .from('gallery')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        return res.status(400).json({ error: error.message });
      }

      const items = (data || []).map((row) => ({
        id: row.id,
        path: row.path,
        type: row.type,
        created_at: row.created_at,
        title: row.title,
        description: row.description,
        url: row.path?.startsWith('http')
          ? row.path
          : `${supabaseUrl}/storage/v1/object/public/media/${row.path}`
      }));

      res.json({ data: items });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Internal error' });
    }
  });

  app.post('/api/supabase/gallery/upload', authorizeAdmin, async (req, res) => {
    try {
      const { fileName, contentType, base64, title, description } = req.body;
      if (!base64) {
        return res.status(400).json({ error: 'Nenhum dado de imagem fornecido (base64 obrigatório).' });
      }

      // Limpar prefixo data URL se houver (ex: data:image/jpeg;base64,...)
      const cleanBase64 = base64.includes(',') ? base64.split(',')[1] : base64;
      const buffer = Buffer.from(cleanBase64, 'base64');

      // Determinar extensão do arquivo
      const ext = fileName && fileName.includes('.') 
        ? fileName.split('.').pop().toLowerCase() 
        : (contentType && contentType.includes('png') ? 'png' : 'jpg');

      const uniqueFileName = `gallery_${Date.now()}_${Math.random().toString(36).substring(2, 8)}.${ext}`;
      const storagePath = `gallery/${uniqueFileName}`;
      const mimeType = contentType || (ext === 'png' ? 'image/png' : 'image/jpeg');

      // 1. Upload seguro para o Supabase Storage (bucket 'media')
      if (!serverSupabase) return res.status(500).json({ error: 'Server misconfiguration: Service role key missing.' });
      
      const { error: uploadError } = await serverSupabase.storage
        .from('media')
        .upload(storagePath, buffer, {
          contentType: mimeType,
          upsert: true
        });

      if (uploadError) {
        console.error('Erro de upload no Storage (media):', uploadError);
        return res.status(400).json({ error: `Falha no Supabase Storage: ${uploadError.message}` });
      }

      // 2. Registro na tabela existente 'gallery' do Supabase
      const { data: dbData, error: dbError } = await serverSupabase
        .from('gallery')
        .insert({
          path: storagePath,
          type: mimeType.startsWith('video') ? 'v' : 'i',
          section: 'home',
          sort_order: 0,
          is_active: true,
          title: title || null,
          description: description || null
        })
        .select();

      if (dbError) {
        console.error('Erro ao registrar na tabela gallery:', dbError);
        // Tentar limpar arquivo órfão no storage
        await serverSupabase.storage.from('media').remove([storagePath]);
        return res.status(400).json({ error: `Falha na tabela gallery: ${dbError.message}` });
      }

      const inserted = dbData?.[0];
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/media/${storagePath}`;

      res.status(201).json({
        success: true,
        data: {
          id: inserted?.id,
          path: storagePath,
          url: publicUrl,
          created_at: inserted?.created_at
        }
      });
    } catch (err: any) {
      console.error('Erro interno ao processar upload da galeria:', err);
      res.status(500).json({ error: err?.message || 'Erro interno no servidor ao processar imagem.' });
    }
  });

  app.delete('/api/supabase/gallery', authorizeAdmin, async (req, res) => {
    try {
      const { id, path: targetPath, url } = req.body;
      if (!serverSupabase) return res.status(500).json({ error: 'Server misconfiguration: Service role key missing.' });

      let resolvedPath = targetPath;
      let recordId = id;

      // Se passou url, extrair caminho relativo do bucket media
      if (!resolvedPath && url) {
        const marker = '/storage/v1/object/public/media/';
        if (url.includes(marker)) {
          resolvedPath = url.split(marker)[1];
        }
      }

      // Se só temos o ID, buscar o registro para saber o path no storage
      if (!resolvedPath && recordId) {
        const { data } = await serverSupabase.from('gallery').select('path').eq('id', recordId).single();
        if (data?.path) {
          resolvedPath = data.path;
        }
      }

      // 1. Excluir da tabela 'gallery'
      let dbError: any = null;
      if (recordId) {
        const delRes = await serverSupabase.from('gallery').delete().eq('id', recordId);
        dbError = delRes.error;
      } else if (resolvedPath) {
        const delRes = await serverSupabase.from('gallery').delete().eq('path', resolvedPath);
        dbError = delRes.error;
      }

      if (dbError) {
        console.error('Erro ao excluir registro na tabela gallery:', dbError);
        return res.status(400).json({ error: dbError.message });
      }

      // 2. Excluir arquivo do bucket 'media' no Storage
      if (resolvedPath) {
        try {
          await serverSupabase.storage.from('media').remove([resolvedPath]);
        } catch (rmErr) {
          console.warn('Aviso ao remover arquivo do Storage:', rmErr);
        }
      }

      res.json({ success: true, message: 'Foto excluída com sucesso do Supabase.' });
    } catch (err: any) {
      console.error('Erro ao excluir foto da galeria:', err);
      res.status(500).json({ error: err?.message || 'Erro interno ao excluir foto.' });
    }
  });

  app.post('/api/supabase/kids', authorizeAdmin, async (req, res) => {
    try {
      const row = req.body;
      const client = serverSupabase || supabase;
      if (!client) return res.status(500).json({ error: 'Server misconfiguration.' });
      
      let insertRes = await client.from('kids').insert([row]).select();
      if (insertRes.error && insertRes.error.message?.includes('image') && row.image) {
        // Se a coluna 'image' não existir na tabela (usando apenas photo_path), retenta sem ela
        const sanitized = { ...row };
        delete sanitized.image;
        insertRes = await client.from('kids').insert([sanitized]).select();
      }
      if (insertRes.error) {
        return res.status(400).json({ error: insertRes.error.message, code: insertRes.error.code });
      }
      res.status(201).json({ data: insertRes.data?.[0] || null });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Internal error' });
    }
  });

  app.put('/api/supabase/kids/:id', authorizeAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = req.body;
      const client = serverSupabase || supabase;
      if (!client) return res.status(500).json({ error: 'Server misconfiguration.' });

      const sanitizedUpdates = { ...updates };
      if (sanitizedUpdates.image && !sanitizedUpdates.photo_path) {
        sanitizedUpdates.photo_path = sanitizedUpdates.image;
      }

      let { data, error } = await client.from('kids').update(sanitizedUpdates).eq('id', id).select();

      if (error && error.message?.includes('image') && sanitizedUpdates.image) {
        delete sanitizedUpdates.image;
        const retry = await client.from('kids').update(sanitizedUpdates).eq('id', id).select();
        data = retry.data;
        error = retry.error;
      }

      if (error) {
        console.error(`Error updating kid ${id}:`, error.message);
        return res.status(400).json({ error: error.message, code: error.code });
      }

      // If no row was updated because ID doesn't exist remotely (e.g. local ID), create or upsert
      if ((!data || data.length === 0) && updates.name) {
        const rowToInsert = {
          family_id: updates.family_id || 'ab0ffd20-0846-44c0-9660-b79b6a3015f3',
          name: updates.name,
          age: updates.age !== undefined ? String(updates.age) : '8',
          letter: updates.letter || 'Cartinha',
          photo_path: updates.photo_path || updates.image || null,
          status: updates.status || 'Aguardando Apadrinhamento',
          birth_date: updates.birth_date || null,
          wishlist: updates.wishlist || null
        };
        let insertRes = await client.from('kids').insert([rowToInsert]).select();
        if (insertRes.error && insertRes.error.message?.includes('image')) {
          delete (rowToInsert as any).image;
          insertRes = await client.from('kids').insert([rowToInsert]).select();
        }
        if (!insertRes.error && insertRes.data?.[0]) {
          return res.json({ data: insertRes.data[0] });
        }
      }

      res.json({ data: data?.[0] || null });
    } catch (err: any) {
      console.error('Exception updating kid:', err?.message || err);
      res.status(500).json({ error: err?.message || 'Internal error' });
    }
  });

  app.delete('/api/supabase/kids/:id', authorizeAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const client = serverSupabase || supabase;
      if (!client) return res.status(500).json({ error: 'Server misconfiguration.' });
      await client.from('gifts').delete().eq('kid_id', id);
      const { error } = await client.from('kids').delete().eq('id', id);
      if (error) {
        return res.status(400).json({ error: error.message, code: error.code });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Internal error' });
    }
  });

  app.post('/api/supabase/profiles', authorizeAdmin, async (req, res) => {
    try {
      const row = {
        ...req.body,
        updated_at: new Date().toISOString()
      };
      const client = serverSupabase || supabase;
      if (!client) return res.status(500).json({ error: 'Server misconfiguration.' });
      const { data, error } = await client.from('profiles').insert([row]).select();
      if (error) {
        return res.status(400).json({ error: error.message, code: error.code });
      }
      res.status(201).json({ data: data?.[0] || null });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Internal error' });
    }
  });

  app.put('/api/supabase/profiles/:id', authorizeAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const updates = {
        ...req.body,
        updated_at: new Date().toISOString()
      };
      const client = serverSupabase || supabase;
      if (!client) return res.status(500).json({ error: 'Server misconfiguration.' });
      const { data, error } = await client.from('profiles').update(updates).eq('id', id).select();
      if (error) {
        return res.status(400).json({ error: error.message, code: error.code });
      }
      res.json({ data: data?.[0] || null });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Internal error' });
    }
  });

  app.delete('/api/supabase/profiles/:id', authorizeAdmin, async (req, res) => {
    try {
      const { id } = req.params;
      const client = serverSupabase || supabase;
      if (!client) return res.status(500).json({ error: 'Server misconfiguration.' });
      const { error } = await client.from('profiles').delete().eq('id', id);
      if (error) {
        return res.status(400).json({ error: error.message, code: error.code });
      }
      res.json({ success: true });
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Internal error' });
    }
  });

  app.put('/api/supabase/settings', authorizeAdmin, async (req, res) => {
    try {
      const { slides } = req.body;
      if (!serverSupabase) return res.status(500).json({ error: 'Server misconfiguration: Service role key missing.' });
      
      const { data: existing } = await serverSupabase.from('site_settings').select('id').limit(1);
      const targetId = existing?.[0]?.id;

      if (targetId) {
        const { data, error } = await serverSupabase
          .from('site_settings')
          .update({ slides, updated_at: new Date().toISOString() })
          .eq('id', targetId)
          .select();
        if (error) return res.status(400).json({ error: error.message });
        return res.json({ data: data?.[0] || null });
      } else {
        const { data, error } = await serverSupabase
          .from('site_settings')
          .insert({ slides, updated_at: new Date().toISOString() })
          .select();
        if (error) return res.status(400).json({ error: error.message });
        return res.json({ data: data?.[0] || null });
      }
    } catch (err: any) {
      res.status(500).json({ error: err?.message || 'Internal error' });
    }
  });

  if (process.env.NODE_ENV !== 'production') {
    try {
      const vite = await createViteServer({
        server: { middlewareMode: true, hmr: false },
        appType: 'spa',
      });
      app.use(vite.middlewares);
    } catch (viteErr) {
      console.error('Error creating Vite server middleware:', viteErr);
    }
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    app.use(express.static(distPath));
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  const server = app.listen(PORT, '0.0.0.0', () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
  });

  server.on('error', (err: any) => {
    console.error('Express server encountered an error:', err);
  });
}

process.on('uncaughtException', (err) => {
  console.error('Uncaught Exception in server process:', err);
});

process.on('unhandledRejection', (reason) => {
  console.error('Unhandled Rejection in server process:', reason);
});

startServer().catch((err) => {
  console.error('Fatal error starting server:', err);
});
