import { createClient } from '@supabase/supabase-js';

// Configurações do Supabase para o projeto Lar Esperança
const rawUrl = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_URL) || 'https://utrpckrchcbqgzbhvlzy.supabase.co';
const match = rawUrl.match(/https:\/\/[a-z0-9-]+\.supabase\.co/);
export const SUPABASE_URL = match ? match[0] : rawUrl.trim();
export const SUPABASE_ANON_KEY = (typeof import.meta !== 'undefined' && import.meta.env?.VITE_SUPABASE_ANON_KEY) || 'sb_publishable_YkRZNDptF3UTgjhFjL2wVw_InE5wV7L';

// Cliente Supabase público seguro (usa chave anônima/publicável)
export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

// IDs dos perfis mestres existentes no Supabase para garantir integridade referencial
export const DEFAULT_ADMIN_PROFILE_ID = 'ab0ffd20-0846-44c0-9660-b79b6a3015f3';
export const DEFAULT_FAMILY_PROFILE_ID = '18df26ac-e2f3-4160-b872-30dfb55ba6c0';
export const DEFAULT_SPONSOR_PROFILE_ID = '7a3e5cac-f4cc-4f8b-b3e7-488ffb4fef13';

export interface SupabaseDataResult {
  kids: any[];
  gifts: any[];
  siteSettings: any | null;
  gallery: any[];
  profiles: any[];
  error?: string | null;
}

export async function testSupabaseConnection(): Promise<{ ok: boolean; message: string }> {
  try {
    const { data, error } = await supabase.from('kids').select('id').limit(1);
    if (error) {
      return { ok: false, message: `Erro ao conectar com Supabase: ${error.message}` };
    }
    return { ok: true, message: 'Conexão com Supabase ativa e respondendo com sucesso.' };
  } catch (err: any) {
    return { ok: false, message: `Falha de rede/conexão: ${err?.message || err}` };
  }
}

export async function fetchAllSupabaseData(): Promise<SupabaseDataResult | null> {
  // 1. Tentar rota de API backend se disponível
  try {
    const apiRes = await fetch('/api/supabase/data');
    if (apiRes.ok) {
      const json = await apiRes.json();
      return json;
    }
  } catch {
    // API backend não disponível (ex: hospedagem puramente estática no Netlify), prossegue com cliente Supabase direto
  }

  // 2. Consulta direta via cliente Supabase
  try {
    const [kidsRes, giftsRes, settingsRes, galleryRes, profilesRes] = await Promise.all([
      supabase.from('kids').select('*').order('created_at', { ascending: true }),
      supabase.from('gifts').select('*'),
      supabase.from('site_settings').select('*').limit(1),
      supabase.from('gallery').select('*').order('sort_order', { ascending: true }),
      supabase.from('profiles').select('*')
    ]);

    const errors: string[] = [];
    if (kidsRes.error) errors.push(`Kids: ${kidsRes.error.message}`);
    if (giftsRes.error) errors.push(`Gifts: ${giftsRes.error.message}`);
    if (settingsRes.error) errors.push(`Settings: ${settingsRes.error.message}`);
    if (galleryRes.error) errors.push(`Gallery: ${galleryRes.error.message}`);
    if (profilesRes.error) errors.push(`Profiles: ${profilesRes.error.message}`);

    return {
      kids: kidsRes.data || [],
      gifts: giftsRes.data || [],
      siteSettings: settingsRes.data?.[0] || null,
      gallery: galleryRes.data || [],
      profiles: profilesRes.data || [],
      error: errors.length > 0 ? errors.join(' | ') : null
    };
  } catch (err: any) {
    console.error('Error fetching data from Supabase:', err);
    return {
      kids: [],
      gifts: [],
      siteSettings: null,
      gallery: [],
      profiles: [],
      error: err?.message || 'Falha imprevista na conexão com o Supabase'
    };
  }
}

export interface KidInput {
  family_id?: string;
  name: string;
  age?: number | string;
  birth_date?: string | null;
  gender?: string;
  status?: string;
  likes?: string;
  dream?: string;
  address?: string;
  image?: string;
  photo_path?: string;
  letter: string;
  wishlist?: any;
  approved?: boolean;
}

/**
 * Insere uma nova criança na tabela 'kids' do Supabase garantindo a chave estrangeira family_id
 */
export async function createKidInSupabase(input: KidInput) {
  const targetFamilyId = (input.family_id && input.family_id.length === 36)
    ? input.family_id 
    : DEFAULT_ADMIN_PROFILE_ID;

  const row = {
    family_id: targetFamilyId,
    name: input.name.trim(),
    age: input.age !== undefined ? String(input.age) : '8',
    birth_date: input.birth_date || null,
    gender: input.gender || 'Infantil',
    status: input.status || 'Aguardando Apadrinhamento',
    likes: input.likes || null,
    dream: input.dream || null,
    address: input.address || null,
    photo_path: input.photo_path || input.image || null,
    image: input.image || input.photo_path || null,
    letter: input.letter?.trim() || 'Querido Papai Noel, gostaria de ganhar um presente especial de Natal!',
    wishlist: input.wishlist || null,
    approved: input.approved !== undefined ? input.approved : true
  };

  // 1. Tentar via backend proxy se disponível
  try {
    const apiRes = await fetch('/api/supabase/kids', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row)
    });
    if (apiRes.ok) {
      const json = await apiRes.json();
      return { data: json.data, error: null };
    }
  } catch {
    // Prosseguir para fallback direto do cliente Supabase
  }

  // 2. Fallback direto via cliente Supabase
  const { data, error } = await supabase.from('kids').insert([row]).select();
  return { data: data?.[0] || null, error };
}

/**
 * Atualiza os dados de uma criança existente na tabela 'kids' do Supabase
 */
export async function updateKidInSupabase(id: string, updates: Partial<KidInput>) {
  const row: Record<string, any> = {};
  if (updates.name !== undefined) row.name = updates.name.trim();
  if (updates.age !== undefined) row.age = String(updates.age);
  if (updates.letter !== undefined) row.letter = updates.letter.trim();
  if (updates.image !== undefined) {
    row.image = updates.image;
    row.photo_path = updates.image;
  }
  if (updates.photo_path !== undefined) {
    row.photo_path = updates.photo_path;
  }
  if (updates.birth_date !== undefined) row.birth_date = updates.birth_date;
  if (updates.gender !== undefined) row.gender = updates.gender;
  if (updates.status !== undefined) row.status = updates.status;
  if (updates.likes !== undefined) row.likes = updates.likes;
  if (updates.dream !== undefined) row.dream = updates.dream;
  if (updates.address !== undefined) row.address = updates.address;
  if (updates.wishlist !== undefined) row.wishlist = updates.wishlist;
  if (updates.approved !== undefined) row.approved = updates.approved;

  // 1. Tentar via backend proxy
  try {
    const apiRes = await fetch(`/api/supabase/kids/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row)
    });
    if (apiRes.ok) {
      const json = await apiRes.json();
      return { data: json.data, error: null };
    }
  } catch {
    // Prosseguir para cliente direto
  }

  // 2. Cliente direto
  const { data, error } = await supabase.from('kids').update(row).eq('id', id).select();
  return { data: data?.[0] || null, error };
}

/**
 * Exclui uma criança na tabela 'kids' do Supabase, limpando também presentes vinculados em 'gifts'
 */
export async function deleteKidInSupabase(id: string) {
  // 1. Tentar via backend proxy
  try {
    const apiRes = await fetch(`/api/supabase/kids/${id}`, {
      method: 'DELETE'
    });
    if (apiRes.ok) {
      return { error: null };
    }
  } catch {
    // Prosseguir para cliente direto
  }

  // 2. Limpar presentes vinculados primeiro
  try {
    await supabase.from('gifts').delete().eq('kid_id', id);
  } catch (giftErr) {
    console.warn('Nota ao excluir presentes vinculados:', giftErr);
  }

  const { error } = await supabase.from('kids').delete().eq('id', id);
  return { error };
}

export interface ProfileUpdateInput {
  name?: string;
  phone?: string | null;
  bio?: string | null;
  photo_path?: string | null;
  birth_date?: string | null;
  address_line?: string | null;
  city?: string | null;
  state?: string | null;
  postal_code?: string | null;
}

/**
 * Atualiza um perfil na tabela 'profiles' do Supabase
 */
export async function updateProfileInSupabase(id: string, updates: ProfileUpdateInput) {
  const row: Record<string, any> = {
    updated_at: new Date().toISOString()
  };

  if (updates.name !== undefined) row.name = updates.name.trim();
  if (updates.phone !== undefined) row.phone = updates.phone;
  if (updates.bio !== undefined) row.bio = updates.bio;
  if (updates.photo_path !== undefined) row.photo_path = updates.photo_path;
  if (updates.birth_date !== undefined) row.birth_date = updates.birth_date;
  if (updates.address_line !== undefined) row.address_line = updates.address_line;
  if (updates.city !== undefined) row.city = updates.city;
  if (updates.state !== undefined) row.state = updates.state;
  if (updates.postal_code !== undefined) row.postal_code = updates.postal_code;

  // 1. Tentar via backend proxy
  try {
    const apiRes = await fetch(`/api/supabase/profiles/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(row)
    });
    if (apiRes.ok) {
      const json = await apiRes.json();
      return { data: json.data, error: null };
    }
  } catch {
    // Prosseguir para cliente direto
  }

  // 2. Cliente direto
  const { data, error } = await supabase.from('profiles').update(row).eq('id', id).select();
  return { data: data?.[0] || null, error };
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = (e) => reject(e);
    reader.readAsDataURL(file);
  });
}

export interface GalleryPhotoRecord {
  id: string;
  path: string;
  url: string;
  type?: string;
  title?: string | null;
  created_at?: string;
}

/**
 * Faz upload real de foto para o Supabase Storage (bucket 'media') e grava na tabela 'gallery'
 */
export async function uploadGalleryPhotoToSupabase(
  file: File,
  base64Data?: string
): Promise<{ data?: GalleryPhotoRecord; error?: string }> {
  try {
    const base64 = base64Data || (await fileToBase64(file));

    // 1. Tentar upload seguro via backend proxy (com credenciais do servidor)
    try {
      const apiRes = await fetch('/api/supabase/gallery/upload', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          fileName: file.name,
          contentType: file.type || 'image/jpeg',
          base64
        })
      });

      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.data) {
          return { data: json.data, error: undefined };
        }
      } else {
        const errJson = await apiRes.json().catch(() => null);
        if (errJson?.error) {
          return { error: errJson.error };
        }
      }
    } catch {
      // Backend não alcançável, tentar cliente direto
    }

    // 2. Fallback direto via cliente Supabase (usando bucket 'media')
    const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg';
    const uniqueName = `gallery_${Date.now()}_${Math.random().toString(36).substring(2, 7)}.${ext}`;
    const storagePath = `gallery/${uniqueName}`;

    const { error: upErr } = await supabase.storage
      .from('media')
      .upload(storagePath, file, { contentType: file.type || 'image/jpeg', upsert: true });

    if (upErr) {
      return { error: `Erro no Supabase Storage: ${upErr.message}` };
    }

    const { data: dbData, error: dbErr } = await supabase
      .from('gallery')
      .insert({
        path: storagePath,
        type: file.type?.startsWith('video') ? 'v' : 'i',
        section: 'home',
        is_active: true,
        sort_order: 0
      })
      .select();

    if (dbErr) {
      return { error: `Erro na tabela gallery: ${dbErr.message}` };
    }

    const inserted = dbData?.[0];
    const url = `${SUPABASE_URL}/storage/v1/object/public/media/${storagePath}`;

    return {
      data: {
        id: inserted?.id || uniqueName,
        path: storagePath,
        url,
        created_at: inserted?.created_at
      }
    };
  } catch (err: any) {
    return { error: err?.message || 'Erro inesperado no upload da foto.' };
  }
}

/**
 * Exclui uma foto do Supabase Storage e da tabela 'gallery'
 */
export async function deleteGalleryPhotoFromSupabase(target: {
  id?: string;
  path?: string;
  url?: string;
}): Promise<{ success: boolean; error?: string }> {
  try {
    // 1. Tentar via backend proxy
    try {
      const apiRes = await fetch('/api/supabase/gallery', {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(target)
      });
      if (apiRes.ok) {
        return { success: true };
      } else {
        const errJson = await apiRes.json().catch(() => null);
        if (errJson?.error) {
          return { success: false, error: errJson.error };
        }
      }
    } catch {
      // Backend não alcançável, tentar cliente direto
    }

    // 2. Fallback direto via cliente Supabase
    let path = target.path;
    if (!path && target.url) {
      const marker = '/storage/v1/object/public/media/';
      if (target.url.includes(marker)) {
        path = target.url.split(marker)[1];
      }
    }

    if (target.id) {
      const { error: dbErr } = await supabase.from('gallery').delete().eq('id', target.id);
      if (dbErr) return { success: false, error: dbErr.message };
    } else if (path) {
      const { error: dbErr } = await supabase.from('gallery').delete().eq('path', path);
      if (dbErr) return { success: false, error: dbErr.message };
    }

    if (path) {
      try {
        await supabase.storage.from('media').remove([path]);
      } catch (rmErr) {
        console.warn('Aviso ao remover do Storage:', rmErr);
      }
    }

    return { success: true };
  } catch (err: any) {
    return { success: false, error: err?.message || 'Erro ao excluir foto.' };
  }
}

/**
 * Busca fotos salvas no Supabase
 */
export async function fetchGalleryFromSupabase(): Promise<GalleryPhotoRecord[]> {
  try {
    // 1. Tentar backend
    try {
      const apiRes = await fetch('/api/supabase/gallery');
      if (apiRes.ok) {
        const json = await apiRes.json();
        if (json.data && Array.isArray(json.data)) {
          return json.data;
        }
      }
    } catch {}

    // 2. Consulta direta
    const { data, error } = await supabase
      .from('gallery')
      .select('*')
      .order('created_at', { ascending: false });

    if (error || !data) return [];

    return data.map((row) => ({
      id: row.id,
      path: row.path,
      type: row.type,
      created_at: row.created_at,
      title: row.title,
      url: row.path?.startsWith('http')
        ? row.path
        : `${SUPABASE_URL}/storage/v1/object/public/media/${row.path}`
    }));
  } catch {
    return [];
  }
}

/**
 * Salva e atualiza as configurações do site, banners, carrossel e PIX na tabela 'site_settings' do Supabase
 */
export async function updateSiteSettingsInSupabase(slidesData: any) {
  try {
    // 1. Tentar via backend proxy se disponível
    try {
      const apiRes = await fetch('/api/supabase/settings', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slides: slidesData })
      });
      if (apiRes.ok) {
        const json = await apiRes.json();
        return { data: json.data, error: null };
      }
    } catch {
      // Prosseguir para cliente Supabase direto
    }

    // 2. Fallback via cliente Supabase direto
    const { data: existing } = await supabase.from('site_settings').select('id').limit(1);
    const targetId = existing?.[0]?.id;

    if (targetId) {
      const { data, error } = await supabase
        .from('site_settings')
        .update({ slides: slidesData, updated_at: new Date().toISOString() })
        .eq('id', targetId)
        .select();
      return { data: data?.[0] || null, error };
    } else {
      const { data, error } = await supabase
        .from('site_settings')
        .insert({ slides: slidesData, updated_at: new Date().toISOString() })
        .select();
      return { data: data?.[0] || null, error };
    }
  } catch (err: any) {
    return { data: null, error: err?.message || 'Erro ao salvar configurações do site.' };
  }
}

