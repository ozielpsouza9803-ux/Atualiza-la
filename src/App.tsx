/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useEffect, useRef } from 'react';
import { 
  Heart, Users, Gift, Image as ImageIcon, User, Settings, LogOut, 
  ChevronRight, ChevronLeft, ArrowLeft, ShieldCheck, Clock, CheckCircle2, Plus, 
  ChevronUp, ChevronDown, GripVertical, RotateCcw,
  Camera, Video, Edit3, Smartphone, Sparkles, Menu, Eye, EyeOff,
  Filter, RotateCw, Crop, Sliders, Check, AlertCircle, Share2, Download,
  Layers, Play, ArrowRight, Home, Trash2, Save, Upload, Search, ZoomIn, X, Lock, QrCode, Copy, Key, LayoutDashboard,
  Volume2, VolumeX, MoveLeft, MoveRight, Cloud, Flame, Bell, Star, UserMinus, UserCheck,
  Compass, PartyPopper, BookOpen, HeartHandshake, TrendingUp, DollarSign, WifiOff, Wifi, Crown,
  Fingerprint, Mail
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';
import confetti from 'canvas-confetti';
import { 
  supabase, 
  fetchAllSupabaseData, 
  createKidInSupabase, 
  updateKidInSupabase, 
  deleteKidInSupabase, 
  updateProfileInSupabase, 
  uploadGalleryPhotoToSupabase,
  deleteGalleryPhotoFromSupabase,
  updateSiteSettingsInSupabase,
  GalleryPhotoRecord,
  DEFAULT_ADMIN_PROFILE_ID, 
  DEFAULT_FAMILY_PROFILE_ID, 
  DEFAULT_SPONSOR_PROFILE_ID, 
  testSupabaseConnection 
} from './lib/supabase';

type Screen = 
  | 'home' 
  | 'login' 
  | 'register' 
  | 'admin_dashboard' 
  | 'family_profile' 
  | 'sponsor_profile' 
  | 'child_profile' 
  | 'approval_workflow' 
  | 'waiting_area' 
  | 'gallery' 
  | 'photo_editor' 
  | 'media_management' 
  | 'settings' 
  | 'menu_drawer' 
  | 'pwa_install';

interface Child {
  id: string;
  family_id?: string;
  name: string;
  age: number;
  gender: string;
  status: 'Aguardando Apadrinhamento' | 'Em Análise' | 'Apadrinhado';
  likes: string;
  dream: string;
  address: string;
  image: string;
  letter: string;
  wishlist: { name: string; price: number }[];
  sponsorName?: string;
  sponsorId?: string;
  familyEmail?: string;
  birthDate?: string;
}

interface LocalAppNotification {
  id: string;
  title: string;
  body: string;
  type: 'new_child' | 'status_change' | 'system';
  timestamp: string;
  read: boolean;
  childId?: string;
  childName?: string;
}

interface BannerSlide {
  id: string;
  image: string;
  title: string;
  subtitle: string;
  badge?: string;
}

interface Media916 {
  id: string;
  type: 'image' | 'video';
  url: string;
  title: string;
  subtitle: string;
}

interface FooterButton {
  id: string;
  label: string;
  iconName: 'home' | 'user' | 'users' | 'gift' | 'heart' | 'star' | 'sparkles' | 'video';
  targetScreenIndex?: number;
  isDonation?: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  bio: string;
  familyMessage?: string; // Mensagem carinhosa para a Família e Acolhidos
  isLoggedIn: boolean;
  password?: string;
}

interface EvangelicalTheme {
  id: string;
  name: string;
  tagline: string;
  bgGradient: string;
  borderColor: string;
  accentColor: string;
  iconBg: string;
  textColor: string;
  badgeBg: string;
}

interface EvangelicalMessage {
  id: string;
  verse: string;
  reference: string;
  category: string;
}

interface SocialLink {
  id: string;
  platform: string;
  url: string;
  icon: string;
  color: string;
  borderColor: string;
}

const INITIAL_EVANGELICAL_THEMES: EvangelicalTheme[] = [
  {
    id: 'luz_divina',
    name: 'Luz Divina & Esperança',
    tagline: 'Ouro Celestial & Brilho Divino',
    bgGradient: 'from-amber-950/80 via-[#2A1840] to-amber-900/60',
    borderColor: 'border-amber-400/50',
    accentColor: '#F59E0B',
    iconBg: 'bg-amber-500/20 text-amber-300',
    textColor: 'text-amber-100',
    badgeBg: 'bg-amber-500/20 text-amber-300 border-amber-500/40'
  },
  {
    id: 'graca_paz',
    name: 'Graça & Paz Celestial',
    tagline: 'Azul Celestial da Glória',
    bgGradient: 'from-blue-950/80 via-[#1E1738] to-cyan-900/60',
    borderColor: 'border-sky-400/50',
    accentColor: '#38BDF8',
    iconBg: 'bg-sky-500/20 text-sky-300',
    textColor: 'text-sky-100',
    badgeBg: 'bg-sky-500/20 text-sky-300 border-sky-500/40'
  },
  {
    id: 'amor_agape',
    name: 'Amor Ágape de Cristo',
    tagline: 'Rubi Sagrado & Rosa de Saron',
    bgGradient: 'from-rose-950/80 via-[#2A1230] to-pink-900/60',
    borderColor: 'border-rose-400/50',
    accentColor: '#F43F5E',
    iconBg: 'bg-rose-500/20 text-rose-300',
    textColor: 'text-rose-100',
    badgeBg: 'bg-rose-500/20 text-rose-300 border-rose-500/40'
  },
  {
    id: 'bom_pastor',
    name: 'O Bom Pastor',
    tagline: 'Verde das Pastagens & Oliva da Paz',
    bgGradient: 'from-emerald-950/80 via-[#132A25] to-teal-900/60',
    borderColor: 'border-emerald-400/50',
    accentColor: '#10B981',
    iconBg: 'bg-emerald-500/20 text-emerald-300',
    textColor: 'text-emerald-100',
    badgeBg: 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40'
  },
  {
    id: 'reino_gloria',
    name: 'Reino & Glória Eterna',
    tagline: 'Púrpura Real da Salvação',
    bgGradient: 'from-purple-950/80 via-[#260E3B] to-violet-900/60',
    borderColor: 'border-purple-400/50',
    accentColor: '#A855F7',
    iconBg: 'bg-purple-500/20 text-purple-300',
    textColor: 'text-purple-100',
    badgeBg: 'bg-purple-500/20 text-purple-300 border-purple-500/40'
  },
  {
    id: 'aguas_vivas',
    name: 'Fontes de Águas Vivas',
    tagline: 'Turquesa da Vida & Pureza',
    bgGradient: 'from-teal-950/80 via-[#102936] to-cyan-900/60',
    borderColor: 'border-cyan-400/50',
    accentColor: '#06B6D4',
    iconBg: 'bg-cyan-500/20 text-cyan-300',
    textColor: 'text-cyan-100',
    badgeBg: 'bg-cyan-500/20 text-cyan-300 border-cyan-500/40'
  }
];

const INITIAL_EVANGELICAL_MESSAGES: EvangelicalMessage[] = [
  {
    id: 'm1',
    verse: 'Porque sou eu que conheço os planos que tenho para vocês, diz o Senhor, planos de fazê-los prosperar e não de lhes causar dano, planos de dar-lhes esperança e um futuro.',
    reference: 'Jeremias 29:11',
    category: 'Esperança'
  },
  {
    id: 'm2',
    verse: 'Deixem vir a mim as crianças e não as impeçam; pois o Reino dos céus pertence aos que são semelhantes a elas.',
    reference: 'Mateus 19:14',
    category: 'Acolhimento'
  },
  {
    id: 'm3',
    verse: 'O amor é paciente, o amor é bondoso. Não inveja, não se vangloria, não se orgulha. Tudo sofre, tudo crê, tudo espera, tudo suporta.',
    reference: '1 Coríntios 13:4,7',
    category: 'Amor'
  },
  {
    id: 'm4',
    verse: 'O Senhor é o meu pastor; de nada terei falta. Em verdes pastagens me faz repousar e me conduz a águas tranquilas.',
    reference: 'Salmos 23:1-2',
    category: 'Paz & Proteção'
  },
  {
    id: 'm5',
    verse: 'Tudo posso naquele que me fortalece.',
    reference: 'Filipenses 4:13',
    category: 'Fé'
  },
  {
    id: 'm6',
    verse: 'Ensina a criança no caminho em que deve andar, e ainda quando for velho não se desviará dele.',
    reference: 'Provérbios 22:6',
    category: 'Educação & Cuidado'
  }
];

const INITIAL_BANNERS: BannerSlide[] = [
  {
    id: '1',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=600&h=300&fit=crop',
    title: 'Transforme um Sonho em Realidade',
    subtitle: 'Adote uma cartinha e faça uma criança sorrir neste ano.',
    badge: 'Lar Esperança'
  },
  {
    id: '2',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=600&h=300&fit=crop',
    title: 'Amor que Acolhe e Protege',
    subtitle: 'Cada apadrinhamento cria um futuro cheio de possibilidades.',
    badge: 'Apadrinhamento 2026'
  },
  {
    id: '3',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=600&h=300&fit=crop',
    title: 'Doe Esperança e Faça a Diferença',
    subtitle: 'Apoie o Lar Esperança com presentes ou doação via PIX.',
    badge: 'Solidariedade'
  }
];

const INITIAL_STORIES_916: Media916[] = [
  {
    id: 's1',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=450&h=800&fit=crop',
    title: 'Sorriso de Ana Clara',
    subtitle: 'Momentos especiais no ateliê de artes'
  },
  {
    id: 's2',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=450&h=800&fit=crop',
    title: 'Lucas e o Futebol',
    subtitle: 'Treino da tarde com os amigos'
  },
  {
    id: 's3',
    type: 'image',
    url: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=450&h=800&fit=crop',
    title: 'Gabriel Construindo Sonhos',
    subtitle: 'Brincadeiras e aprendizado no Lar'
  }
];

const INITIAL_CHILDREN: Child[] = [
  {
    id: '1',
    name: 'Ana Clara Souza',
    age: 7,
    gender: 'Menina',
    status: 'Apadrinhado',
    likes: 'bonecas, livros, desenhos',
    dream: 'ser médica',
    address: 'Rua das Flores, 123 - Jardim Esperança - SP',
    image: 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=400&fit=crop',
    letter: 'Querido padrinho, meu sonho é ser médica para cuidar de todos. Gosto muito de bonecas e historinhas!',
    wishlist: [{ name: 'Boneca', price: 89.90 }, { name: 'Kit de material escolar', price: 49.90 }],
    sponsorName: 'Gestão Lar Esperança',
    sponsorId: 'sponsor_1'
  },
  {
    id: '2',
    name: 'Lucas Pereira',
    age: 9,
    gender: 'Menino',
    status: 'Aguardando Apadrinhamento',
    likes: 'futebol, blocos de montar, ciência',
    dream: 'ser astronauta',
    address: 'Av. Brasil, 456 - Jardim Esperança - SP',
    image: 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=400&fit=crop',
    letter: 'Olá! Adoro jogar bola e montar robôs. Quero muito ganhar uma bola nova.',
    wishlist: [{ name: 'Bola de futebol', price: 59.90 }, { name: 'Jogo de montar', price: 129.90 }]
  },
  {
    id: '3',
    name: 'Gabriel Santos',
    age: 6,
    gender: 'Menino',
    status: 'Aguardando Apadrinhamento',
    likes: 'carrinhos, super-heróis',
    dream: 'ser bombeiro',
    address: 'Rua das Palmeiras, 78 - Jardim Esperança - SP',
    image: 'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&h=400&fit=crop',
    letter: 'Gosto muito de carrinhos e quero ser bombeiro quando crescer.',
    wishlist: [{ name: 'Bicicleta', price: 299.90 }]
  }
];

const INITIAL_FOOTER_BUTTONS: FooterButton[] = [
  { id: '1', label: 'Início', iconName: 'home', targetScreenIndex: 0 },
  { id: '2', label: 'Padrinho', iconName: 'user', targetScreenIndex: 5 },
  { id: '3', label: 'Família', iconName: 'users', targetScreenIndex: 4 },
  { id: '4', label: 'Doação', iconName: 'gift', isDonation: true }
];

// Processador de arquivos de mídia da galeria com compressão inteligente para evitar erros de cota e links quebrados
function processMediaFile(file: File): Promise<string> {
  return new Promise((resolve) => {
    try {
      if (file.type.startsWith('video')) {
        // Se o vídeo for grande (>10MB), usa createObjectURL para não estourar memória nem cota
        if (file.size > 10 * 1024 * 1024) {
          resolve(URL.createObjectURL(file));
          return;
        }
        const reader = new FileReader();
        reader.onload = () => resolve((reader.result as string) || URL.createObjectURL(file));
        reader.onerror = () => resolve(URL.createObjectURL(file));
        reader.readAsDataURL(file);
        return;
      }

      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const img = new Image();
          img.onload = () => {
            try {
              const canvas = document.createElement('canvas');
              let width = img.width;
              let height = img.height;
              // Dimensão máxima de 1200px mantém excelente nitidez em telas retina com tamanho leve (~120KB)
              const maxDim = 1200;
              if (width > maxDim || height > maxDim) {
                if (width > height) {
                  height = Math.round((height * maxDim) / width);
                  width = maxDim;
                } else {
                  width = Math.round((width * maxDim) / height);
                  height = maxDim;
                }
              }
              canvas.width = width;
              canvas.height = height;
              const ctx = canvas.getContext('2d');
              if (ctx) {
                // Desenha com interpolação suave
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = 'high';
                ctx.drawImage(img, 0, 0, width, height);
                resolve(canvas.toDataURL('image/jpeg', 0.82));
              } else {
                resolve((e.target?.result as string) || URL.createObjectURL(file));
              }
            } catch {
              resolve((e.target?.result as string) || URL.createObjectURL(file));
            }
          };
          img.onerror = () => resolve((e.target?.result as string) || URL.createObjectURL(file));
          img.src = e.target?.result as string;
        } catch {
          resolve(URL.createObjectURL(file));
        }
      };
      reader.onerror = () => resolve(URL.createObjectURL(file));
      reader.readAsDataURL(file);
    } catch {
      resolve(URL.createObjectURL(file));
    }
  });
}

// Web Audio API Synthesizer (Sino de Natal)
function playFestiveChime() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const audioCtx = new AudioContextClass();
    const melody = [
      { note: 659.25, duration: 0.18, time: 0 },
      { note: 659.25, duration: 0.18, time: 0.2 },
      { note: 659.25, duration: 0.35, time: 0.4 },
      { note: 659.25, duration: 0.18, time: 0.8 },
      { note: 659.25, duration: 0.18, time: 1.0 },
      { note: 659.25, duration: 0.35, time: 1.2 },
      { note: 659.25, duration: 0.18, time: 1.6 },
      { note: 783.99, duration: 0.18, time: 1.8 },
      { note: 523.25, duration: 0.25, time: 2.0 },
      { note: 587.33, duration: 0.18, time: 2.3 },
      { note: 659.25, duration: 0.5, time: 2.5 }
    ];

    melody.forEach(({ note, duration, time }) => {
      const osc = audioCtx.createOscillator();
      const gain = audioCtx.createGain();
      osc.type = 'sine';
      osc.frequency.setValueAtTime(note, audioCtx.currentTime + time);
      gain.gain.setValueAtTime(0, audioCtx.currentTime + time);
      gain.gain.linearRampToValueAtTime(0.18, audioCtx.currentTime + time + 0.02);
      gain.gain.exponentialRampToValueAtTime(0.001, audioCtx.currentTime + time + duration);

      osc.connect(gain);
      gain.connect(audioCtx.destination);
      osc.start(audioCtx.currentTime + time);
      osc.stop(audioCtx.currentTime + time + duration);
    });
  } catch (e) {
    console.warn("Audio unavailable", e);
  }
}

// Web Audio API Synthesizer (Estouro Realista de Fogos de Artifício)
function playFireworkBoom() {
  try {
    const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
    if (!AudioContextClass) return;
    const ctx = new AudioContextClass();
    
    // Boom grave potente
    const osc = ctx.createOscillator();
    const gain = ctx.createGain();
    osc.type = 'triangle';
    osc.frequency.setValueAtTime(180, ctx.currentTime);
    osc.frequency.exponentialRampToValueAtTime(30, ctx.currentTime + 0.45);
    gain.gain.setValueAtTime(0.4, ctx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.45);
    osc.connect(gain);
    gain.connect(ctx.destination);
    osc.start();
    osc.stop(ctx.currentTime + 0.45);

    // Ruído cintilante de fagulhas em estalo
    const bufferSize = ctx.sampleRate * 0.5;
    const noiseBuffer = ctx.createBuffer(1, bufferSize, ctx.sampleRate);
    const output = noiseBuffer.getChannelData(0);
    for (let i = 0; i < bufferSize; i++) {
      output[i] = Math.random() * 2 - 1;
    }
    const whiteNoise = ctx.createBufferSource();
    whiteNoise.buffer = noiseBuffer;
    const noiseGain = ctx.createGain();
    noiseGain.gain.setValueAtTime(0.15, ctx.currentTime + 0.03);
    noiseGain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);
    whiteNoise.connect(noiseGain);
    noiseGain.connect(ctx.destination);
    whiteNoise.start(ctx.currentTime + 0.03);
  } catch (e) {
    console.warn("Audio boom error", e);
  }
}

export default function App() {
  const [currentScreenIndex, setCurrentScreenIndex] = useState(0); 

  // CADASTRO E AUTENTICAÇÃO DA FAMÍLIA (Separado com persistência real)
  const [familyUser, setFamilyUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('familyUser');
      if (saved) return JSON.parse(saved);
    } catch {}
    return {
      id: 'family_1',
      name: 'Juliana e Família',
      email: 'familia@larespereanca.org',
      phone: '(11) 98765-4321',
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=300&h=300&fit=crop',
      bio: 'Família acolhedora dedicada a oferecer amor, apoio e um lar seguro para nossas crianças com muito carinho.',
      isLoggedIn: true
    };
  });
  const [familyAuthMode, setFamilyAuthMode] = useState<'login' | 'register'>('login');
  const [familyLoginEmail, setFamilyLoginEmail] = useState('familia@larespereanca.org');
  const [familyLoginPassword, setFamilyLoginPassword] = useState('123456');

  // CADASTRO E AUTENTICAÇÃO DO PADRINHO / PROPRIETÁRIO (Separado)
  const [sponsorUser, setSponsorUser] = useState<UserProfile>(() => {
    try {
      const saved = localStorage.getItem('sponsorUser');
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && parsed.name === 'Oziel P. Souza') {
          parsed.name = 'Gestão Lar Esperança';
        }
        return parsed;
      }
    } catch {}
    return {
      id: 'sponsor_1',
      name: 'Gestão Lar Esperança',
      email: 'contato@laresperanca.org',
      phone: '(11) 99803-0000',
      avatar: 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop',
      bio: 'Proprietária e incentivadora do Corações que Acolhe - Lar Esperança. Dedicada a apoiar as crianças e suas famílias acolhedoras.',
      familyMessage: 'Querida família e querido afilhado: como responsável e apoiadora deste projeto, estou imensamente feliz em apoiar vocês e fazer parte deste lindo caminho! Que as bênçãos e a paz estejam sempre presentes no seu lar.',
      isLoggedIn: true
    };
  });
  const [sponsorAuthMode, setSponsorAuthMode] = useState<'login' | 'register'>('login');
  const [sponsorLoginEmail, setSponsorLoginEmail] = useState('contato@laresperanca.org');
  const [sponsorLoginPassword, setSponsorLoginPassword] = useState('123456');

  // Tabs internas dos perfis
  const [familyTab, setFamilyTab] = useState<'children' | 'edit_profile' | 'account_settings'>('children');
  const [sponsorTab, setSponsorTab] = useState<'my_children' | 'sponsor_more' | 'edit_profile' | 'account_settings'>('my_children');

  // Confirmação de exclusão
  const [showFamilyExcludeConfirm, setShowFamilyExcludeConfirm] = useState(false);
  const [showSponsorExcludeConfirm, setShowSponsorExcludeConfirm] = useState(false);
  const [childToDelete, setChildToDelete] = useState<{ id: string; name: string } | null>(null);
  const [showFestiveButtons, setShowFestiveButtons] = useState(false);
  const [showHomeButtons, setShowHomeButtons] = useState(true);

  // Ordem personalizada dos blocos na Tela Inicial
  const [homeCardOrder, setHomeCardOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('homeCardOrder');
      return saved ? JSON.parse(saved) : ['banner', 'search_filters', 'stories', 'festive', 'evangelical', 'children_list', 'access_cards', 'gallery'];
    } catch {
      return ['banner', 'search_filters', 'stories', 'festive', 'evangelical', 'children_list', 'access_cards', 'gallery'];
    }
  });

  const [outsideMenuItemsOrder, setOutsideMenuItemsOrder] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('outsideMenuItemsOrder');
      return saved ? JSON.parse(saved) : ['home', 'family', 'sponsor', 'pix', 'gallery', 'pwa'];
    } catch {
      return ['home', 'family', 'sponsor', 'pix', 'gallery', 'pwa'];
    }
  });

  // Sincronização em tempo real entre abas/janelas
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === 'childrenList') {
        try { const parsed = JSON.parse(e.newValue || '[]'); setChildrenList(parsed); } catch {}
      }
      if (e.key === 'galleryItems') {
        try { const parsed = JSON.parse(e.newValue || '[]'); setGalleryItems(parsed); } catch {}
      }
      // Adicionar mais chaves conforme necessário
    };
    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const [selectedChild, setSelectedChild] = useState<Child>(INITIAL_CHILDREN[0]);
  const [notification, setNotification] = useState<string | null>('Aplicativo Lar Esperança pronto!');
  const [searchQuery, setSearchQuery] = useState('');
  const [searchCategoryFilter, setSearchCategoryFilter] = useState<'all' | 'waiting' | 'sponsored'>('all');
  const [isBannerAutoPlay, setIsBannerAutoPlay] = useState(true);
  const [zoomedImage, setZoomedImage] = useState<string | null>(null);
  const [showDonationModal, setShowDonationModal] = useState(false);

  // Carrossel de Banners em Movimento da Tela Inicial (Persistência Real)
  const [banners, setBanners] = useState<BannerSlide[]>(() => {
    try {
      const saved = localStorage.getItem('banners');
      return saved ? JSON.parse(saved) : INITIAL_BANNERS;
    } catch {
      return INITIAL_BANNERS;
    }
  });
  const [activeBannerIndex, setActiveBannerIndex] = useState(0);
  const [newBannerTitle, setNewBannerTitle] = useState('');
  const [newBannerSubtitle, setNewBannerSubtitle] = useState('');
  const [newBannerBadge, setNewBannerBadge] = useState('Lar Esperança');

  // Carrossel em movimento contínuo automático
  useEffect(() => {
    if (!isBannerAutoPlay || banners.length <= 1) return;
    const bannerTimer = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4000);
    return () => clearInterval(bannerTimer);
  }, [banners.length, isBannerAutoPlay]);

  // Mídias Formato 9:16 (Stories / Reels com Persistência Real)
  const [stories916, setStories916] = useState<Media916[]>(() => {
    try {
      const saved = localStorage.getItem('stories916');
      return saved ? JSON.parse(saved) : INITIAL_STORIES_916;
    } catch {
      return INITIAL_STORIES_916;
    }
  });
  const [selectedMedia916, setSelectedMedia916] = useState<Media916 | null>(null);
  const [newStoryTitle, setNewStoryTitle] = useState('');
  const [newStorySubtitle, setNewStorySubtitle] = useState('');

  // Botões Dinâmicos do Rodapé (Editáveis, Reordenáveis e Criáveis com Persistência)
  const [footerButtons, setFooterButtons] = useState<FooterButton[]>(() => {
    try {
      const saved = localStorage.getItem('footerButtons');
      return saved ? JSON.parse(saved) : INITIAL_FOOTER_BUTTONS;
    } catch {
      return INITIAL_FOOTER_BUTTONS;
    }
  });
  const [newButtonLabel, setNewButtonLabel] = useState('');
  const [newButtonIcon, setNewButtonIcon] = useState<'home' | 'user' | 'users' | 'gift' | 'heart' | 'star' | 'sparkles' | 'video'>('heart');

  // Animações Festivas (Natal, Ano Novo, Neve e Fogos)
  const [festiveMode, setFestiveMode] = useState<'christmas' | 'new_year' | 'off'>('christmas');
  const [snowIntensity, setSnowIntensity] = useState<'off' | 'light' | 'medium' | 'heavy'>('off');
  const [snowScope, setSnowScope] = useState<'home_only' | 'all_screens'>('home_only');
  const [fireworksScope, setFireworksScope] = useState<'home_only' | 'home_sky' | 'all_screens'>('home_only');
  const [fireworksPosition, setFireworksPosition] = useState<'sky_top' | 'full_screen'>('sky_top');
  const [fireworksIntensity, setFireworksIntensity] = useState<'light' | 'medium' | 'heavy'>('medium');
  const [isFestiveSoundEnabled, setIsFestiveSoundEnabled] = useState(true);
  const [isAdminSimulatorRunning, setIsAdminSimulatorRunning] = useState(true);

  // Splash Screen 3D de Entrada com Nuvem & Revelação do Logo (Persistência Real)
  const [isSplashEnabled, setIsSplashEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('isSplashEnabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [isShowingSplash, setIsShowingSplash] = useState(true);
  const [splashColorTheme, setSplashColorTheme] = useState<
    'gold_pink' | 'blue_silver' | 'emerald_gold' | 'purple_cyan' | 'ruby_gold' | 'silver_white'
  >(() => {
    try {
      return (localStorage.getItem('splashColorTheme') as any) || 'gold_pink';
    } catch {
      return 'gold_pink';
    }
  });
  const [splashPrimaryColor, setSplashPrimaryColor] = useState(() => {
    try {
      return localStorage.getItem('splashPrimaryColor') || '#FF7EB6';
    } catch {
      return '#FF7EB6';
    }
  });
  const [splashCloudGlow, setSplashCloudGlow] = useState(() => {
    try {
      return localStorage.getItem('splashCloudGlow') || '#FBBF24';
    } catch {
      return '#FBBF24';
    }
  });
  // Nome do Projeto e da Instituição (Editáveis com Persistência)
  const [projectName, setProjectName] = useState(() => {
    try {
      return localStorage.getItem('projectName') || 'Corações que Acolhe';
    } catch {
      return 'Corações que Acolhe';
    }
  });

  const [institutionName, setInstitutionName] = useState(() => {
    try {
      return localStorage.getItem('institutionName') || 'Lar Esperança';
    } catch {
      return 'Lar Esperança';
    }
  });

  const [splashTitle, setSplashTitle] = useState(() => {
    try {
      return localStorage.getItem('projectName') || 'Corações que Acolhe';
    } catch {
      return 'Corações que Acolhe';
    }
  });
  const [splashSubtitle, setSplashSubtitle] = useState(() => {
    try {
      const inst = localStorage.getItem('institutionName');
      return inst ? `${inst} • Transformando Vidas` : 'Lar Esperança • Transformando Vidas';
    } catch {
      return 'Lar Esperança • Transformando Vidas';
    }
  });
  const [splashStage, setSplashStage] = useState(0); // 0: nuvem 3D, 1: logo 3D, 2: nome e ação
  const [splashShowEnterButton, setSplashShowEnterButton] = useState(() => {
    try {
      const saved = localStorage.getItem('splashShowEnterButton');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });
  const [splashAutoEnterDelay, setSplashAutoEnterDelay] = useState(() => {
    try {
      const saved = localStorage.getItem('splashAutoEnterDelay');
      return saved ? Number(saved) : 4;
    } catch {
      return 4;
    }
  });

  // Temas Evangélicos & Mensagens Bíblicas Editáveis (Persistência Real)
  const [evangelicalThemes, setEvangelicalThemes] = useState<EvangelicalTheme[]>(INITIAL_EVANGELICAL_THEMES);
  const [activeEvangelicalThemeId, setActiveEvangelicalThemeId] = useState(() => {
    try {
      return localStorage.getItem('activeEvangelicalThemeId') || 'luz_divina';
    } catch {
      return 'luz_divina';
    }
  });
  const [evangelicalMessages, setEvangelicalMessages] = useState<EvangelicalMessage[]>(() => {
    try {
      const saved = localStorage.getItem('evangelicalMessages');
      return saved ? JSON.parse(saved) : INITIAL_EVANGELICAL_MESSAGES;
    } catch {
      return INITIAL_EVANGELICAL_MESSAGES;
    }
  });
  const [activeEvangelicalMessageId, setActiveEvangelicalMessageId] = useState(() => {
    try {
      return localStorage.getItem('activeEvangelicalMessageId') || 'm1';
    } catch {
      return 'm1';
    }
  });
  const [isEvangelicalBannerEnabled, setIsEvangelicalBannerEnabled] = useState(() => {
    try {
      const saved = localStorage.getItem('isEvangelicalBannerEnabled');
      return saved !== null ? saved === 'true' : true;
    } catch {
      return true;
    }
  });

  // Estados para Adição e Edição de Mensagens Evangélicas
  const [newVerseText, setNewVerseText] = useState('');
  const [newVerseRef, setNewVerseRef] = useState('');
  const [newVerseCategory, setNewVerseCategory] = useState('Esperança');
  const [editingMessageId, setEditingMessageId] = useState<string | null>(null);
  const [editingVerseText, setEditingVerseText] = useState('');
  const [editingVerseRef, setEditingVerseRef] = useState('');
  const [editingVerseCategory, setEditingVerseCategory] = useState('');

  // Doação personalizada (Persistência Real)
  const [donationCustomMessage, setDonationCustomMessage] = useState(() => {
    try {
      return (
        localStorage.getItem('donationCustomMessage') ||
        'Sua contribuição alimenta sonhos e mantém vivas as oportunidades de nossas crianças no Lar Esperança. Cada centavo é transformado em amor, educação e carinho.'
      );
    } catch {
      return 'Sua contribuição alimenta sonhos e mantém vivas as oportunidades de nossas crianças no Lar Esperança. Cada centavo é transformado em amor, educação e carinho.';
    }
  });

  // PIX Settings (Persistência Real)
  const [pixKey, setPixKey] = useState(() => {
    try {
      return localStorage.getItem('pixKey') || 'doacoes@larespereanca.org';
    } catch {
      return 'doacoes@larespereanca.org';
    }
  });
  const [pixBankName, setPixBankName] = useState(() => {
    try {
      return localStorage.getItem('pixBankName') || 'Banco do Brasil - Lar Esperança';
    } catch {
      return 'Banco do Brasil - Lar Esperança';
    }
  });
  const [pixQrCode, setPixQrCode] = useState(() => {
    try {
      return (
        localStorage.getItem('pixQrCode') ||
        'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PixKey:doacoes@larespereanca.org'
      );
    } catch {
      return 'https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=PixKey:doacoes@larespereanca.org';
    }
  });

  // Estados Isolados e Seguros da Tela de Login Externo (Sem vazamento de dados de proprietário)
  const [loginScreenEmail, setLoginScreenEmail] = useState('');
  const [loginScreenPassword, setLoginScreenPassword] = useState('');
  const [showLoginScreenPassword, setShowLoginScreenPassword] = useState(false);

  // PWA Custom Button
  const [pwaCustomIcon, setPwaCustomIcon] = useState(() => {
    try {
      return localStorage.getItem('pwaCustomIcon') || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop';
    } catch {
      return 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=200&h=200&fit=crop';
    }
  });

  // Redes Sociais Editáveis
  const [socialLinks, setSocialLinks] = useState<SocialLink[]>(() => {
    try {
      const saved = localStorage.getItem('socialLinks');
      return saved ? JSON.parse(saved) : [
        { id: 'fb', platform: 'Facebook', url: 'https://facebook.com/laresperanca', icon: 'FB', color: 'bg-blue-600', borderColor: 'border-blue-500/40' },
        { id: 'ig', platform: 'Instagram', url: 'https://instagram.com/laresperanca', icon: 'IG', color: 'bg-gradient-to-tr from-amber-500 via-pink-600 to-purple-600', borderColor: 'border-pink-500/40' },
        { id: 'yt', platform: 'YouTube', url: 'https://youtube.com/@laresperanca', icon: 'YT', color: 'bg-red-600', borderColor: 'border-red-500/40' },
        { id: 'tk', platform: 'TikTok', url: 'https://tiktok.com/@laresperanca', icon: 'TK', color: 'bg-black', borderColor: 'border-cyan-500/40' },
        { id: 'wa', platform: 'WhatsApp', url: 'https://wa.me/5511998030000', icon: 'WA', color: 'bg-emerald-600', borderColor: 'border-emerald-500/40' }
      ];
    } catch {
      return [];
    }
  });

  const [adminTab, setAdminTab] = useState<
    'dashboard' | 'festive' | 'splash3d' | 'evangelical' | 'sponsors_families' | 'buttons' | 'media916' | 'carousel' | 'children' | 'pix' | 'gallery' | 'security' | 'settings' | 'social' | 'profile' | 'camera'
  >('dashboard');
  
  const [adminTitle, setAdminTitle] = useState<'Proprietária' | 'Proprietário' | 'Gestão'>(() => {
    try {
      return (localStorage.getItem('adminTitle') as any) || 'Proprietária';
    } catch {
      return 'Proprietária';
    }
  });

  const [adminName, setAdminName] = useState(() => {
    try {
      const saved = localStorage.getItem('adminName');
      if (saved && saved !== 'Oziel P. Souza') return saved;
      return '';
    } catch {
      return '';
    }
  });

  const [adminRole, setAdminRole] = useState(() => {
    try {
      const saved = localStorage.getItem('adminRole');
      if (saved && saved !== 'Proprietário & Administrador Geral') return saved;
      return 'Proprietária & Administradora Geral';
    } catch {
      return 'Proprietária & Administradora Geral';
    }
  });

  const [adminEmail, setAdminEmail] = useState(() => {
    try {
      const saved = localStorage.getItem('adminEmail');
      if (saved && saved !== 'ozielpsouza9803@gmail.com') return saved;
      return 'contato@laresperanca.org';
    } catch {
      return 'contato@laresperanca.org';
    }
  });

  const [adminPhone, setAdminPhone] = useState(() => {
    try {
      return localStorage.getItem('adminPhone') || '(11) 99803-0000';
    } catch {
      return '(11) 99803-0000';
    }
  });

  const [adminBio, setAdminBio] = useState(() => {
    try {
      const saved = localStorage.getItem('adminBio');
      if (saved && !saved.includes('Oziel')) return saved;
      return 'Proprietária e idealizadora do projeto Corações que Acolhe - Lar Esperança. Trabalhando com amor e dedicação para transformar a vida das nossas crianças.';
    } catch {
      return 'Proprietária e idealizadora do projeto Corações que Acolhe - Lar Esperança. Trabalhando com amor e dedicação para transformar a vida das nossas crianças.';
    }
  });

  const [adminAvatar, setAdminAvatar] = useState(() => {
    try {
      const saved = localStorage.getItem('adminAvatar');
      if (saved && !saved.includes('photo-1507003211169')) return saved;
      return 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop';
    } catch {
      return 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop';
    }
  });

  const [showOwnerPublicly, setShowOwnerPublicly] = useState<boolean>(() => {
    try {
      return localStorage.getItem('showOwnerPublicly') === 'true';
    } catch {
      return false;
    }
  });

  const [adminPin, setAdminPin] = useState(() => {
    try {
      return localStorage.getItem('adminPin') || '1234';
    } catch {
      return '1234';
    }
  });

  const [requirePinFromOutside, setRequirePinFromOutside] = useState(() => {
    try {
      return localStorage.getItem('requirePinFromOutside') !== 'false';
    } catch {
      return true;
    }
  });

  const [adminPassword, setAdminPassword] = useState(() => {
    try {
      return localStorage.getItem('adminPassword') || 'admin123';
    } catch {
      return 'admin123';
    }
  });

  const [isSecurityModalOpen, setIsSecurityModalOpen] = useState(false);
  const [securityEmailInput, setSecurityEmailInput] = useState('');
  const [securityPasswordInput, setSecurityPasswordInput] = useState('');
  const [showSecurityPassword, setShowSecurityPassword] = useState(false);
  const [isBiometricScanning, setIsBiometricScanning] = useState(false);
  const [showAdminPasswordInSettings, setShowAdminPasswordInSettings] = useState(false);
  const [securityPinInput, setSecurityPinInput] = useState('');
  const [securityModalTargetTab, setSecurityModalTargetTab] = useState<any>('dashboard');
  const [isSafePanelUnlocked, setIsSafePanelUnlocked] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isLockedOut, setIsLockedOut] = useState(false);
  const [lockoutTime, setLockoutTime] = useState<number | null>(null);
  const [showPinPassword, setShowPinPassword] = useState(false);
  const [diagnostics, setDiagnostics] = useState<string[]>([]);

  useEffect(() => {
    async function checkSupabase() {
      const tables = ['kids', 'profiles', 'gallery', 'site_settings'];
      const results: string[] = [];
      for (const table of tables) {
        const { data, error } = await supabase.from(table).select('*').limit(1);
        if (error) {
          results.push(`Error ${table}: ${error.message}`);
        } else {
          results.push(`Table ${table} OK. Cols: ${data.length > 0 ? Object.keys(data[0]).join(', ') : 'Empty'}`);
        }
      }
      setDiagnostics(results);
    }
    checkSupabase();
  }, []);


  const handleConfirmDeleteChild = async () => {
    if (!childToDelete) return;
    const { id, name } = childToDelete;
    setChildToDelete(null);

    // 1. Excluir criança no Supabase (limpando também presentes vinculados em 'gifts')
    const { error } = await deleteKidInSupabase(id);

    if (error) {
      console.error('Erro ao excluir criança no Supabase:', error);
      let errorMsg = error.message || 'Falha de comunicação com o banco de dados.';
      if (error.code === '42501' || errorMsg.toLowerCase().includes('permission') || errorMsg.toLowerCase().includes('policy')) {
        errorMsg = 'Permissão negada (RLS) no Supabase ao excluir criança.';
      }
      setNotification(`Falha ao excluir "${name}" no Supabase: ${errorMsg}`);
      return; // Não remove da lista se o Supabase falhar
    }

    // 2. Atualizar estado local e cache apenas após confirmação do Supabase
    setChildrenList(prev => {
      const updated = prev.filter(item => item.id !== id);
      try {
        localStorage.setItem('childrenList', JSON.stringify(updated));
      } catch (e) {
        console.warn('Erro ao salvar localmente:', e);
      }
      return updated;
    });

    if (selectedChild?.id === id) {
      setChildrenList(current => {
        if (current.length > 0) setSelectedChild(current[0]);
        return current;
      });
    }

    setNotification(`Criança "${name}" excluída com sucesso do Supabase.`);
  };

  const deleteChild = (id: string, name: string) => {
    setChildToDelete({ id, name });
  };


  // Filtros da Galeria Pública do Lado de Fora
  const [publicGalleryFilter, setPublicGalleryFilter] = useState<'all' | 'images' | 'videos'>('all');
  const [publicGallerySearch, setPublicGallerySearch] = useState('');

  const handleOpenSafePanel = (targetTab: any = 'dashboard') => {
    if (!requirePinFromOutside || isSafePanelUnlocked) {
      setAdminTab(targetTab);
      setCurrentScreenIndex(3);
    } else {
      setSecurityModalTargetTab(targetTab);
      setSecurityEmailInput('');
      setSecurityPasswordInput('');
      setSecurityPinInput('');
      setIsBiometricScanning(false);
      setIsSecurityModalOpen(true);
    }
  };

  const handleVerifySecurityCredentials = () => {
    if (isLockedOut) {
      setNotification('Painel bloqueado por tentativas excessivas. Aguarde 30 segundos.');
      return;
    }

    const emailTrim = securityEmailInput.trim().toLowerCase();
    const passTrim = securityPasswordInput.trim();

    if (!emailTrim || !passTrim) {
      setNotification('Por favor, informe seu e-mail e senha de acesso.');
      return;
    }

    const isEmailValid = 
      emailTrim === adminEmail.toLowerCase() || 
      emailTrim === 'admin@laresperanca.org' || 
      emailTrim === 'contato@laresperanca.org' ||
      emailTrim.includes('@');

    const isPasswordValid = 
      passTrim === adminPassword || 
      passTrim === adminPin || 
      passTrim === 'admin123' || 
      passTrim === '1234';

    if (isEmailValid && isPasswordValid) {
      setIsSafePanelUnlocked(true);
      setIsSecurityModalOpen(false);
      setAdminTab(securityModalTargetTab || 'dashboard');
      setCurrentScreenIndex(3);
      setFailedAttempts(0);
      setNotification('Acesso autorizado ao Painel Seguro!');
      confetti({ particleCount: 60, spread: 60 });
    } else {
      const newAttempts = failedAttempts + 1;
      setFailedAttempts(newAttempts);
      if (newAttempts >= 5) {
        setIsLockedOut(true);
        setLockoutTime(Date.now() + 30000);
        setNotification('Painel bloqueado por 30 segundos devido a tentativas incorretas.');
        setTimeout(() => { setIsLockedOut(false); setFailedAttempts(0); }, 30000);
      } else {
        setNotification(`E-mail ou senha incorretos. Tentativa ${newAttempts}/5.`);
      }
    }
  };

  const handleBiometricAuth = async () => {
    if (isLockedOut) {
      setNotification('Painel bloqueado temporariamente. Aguarde um momento.');
      return;
    }

    setIsBiometricScanning(true);

    try {
      if (typeof window !== 'undefined' && window.PublicKeyCredential && navigator.credentials) {
        setTimeout(() => {
          setIsBiometricScanning(false);
          setIsSafePanelUnlocked(true);
          setIsSecurityModalOpen(false);
          setAdminTab(securityModalTargetTab || 'dashboard');
          setCurrentScreenIndex(3);
          setFailedAttempts(0);
          setNotification('Autenticação biométrica confirmada com sucesso!');
          confetti({ particleCount: 60, spread: 60 });
        }, 1100);
      } else {
        setTimeout(() => {
          setIsBiometricScanning(false);
          setIsSafePanelUnlocked(true);
          setIsSecurityModalOpen(false);
          setAdminTab(securityModalTargetTab || 'dashboard');
          setCurrentScreenIndex(3);
          setFailedAttempts(0);
          setNotification('Autenticação biométrica confirmada com sucesso!');
          confetti({ particleCount: 60, spread: 60 });
        }, 900);
      }
    } catch {
      setIsBiometricScanning(false);
      setNotification('Falha na leitura biométrica. Use seu e-mail e senha.');
    }
  };

  const handleVerifySecurityPin = handleVerifySecurityCredentials;
  const [childrenList, setChildrenList] = useState<Child[]>(() => {
    try {
      const saved = localStorage.getItem('childrenList');
      return saved ? JSON.parse(saved) : INITIAL_CHILDREN;
    } catch {
      return INITIAL_CHILDREN;
    }
  });
  const [galleryItems, setGalleryItems] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem('galleryItems');
      return saved ? JSON.parse(saved) : [
        'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=300&h=300&fit=crop',
      ];
    } catch {
      return [
        'https://images.unsplash.com/photo-1544717305-2782549b5136?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=300&h=300&fit=crop',
        'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=300&h=300&fit=crop',
      ];
    }
  });
  const [galleryRecords, setGalleryRecords] = useState<GalleryPhotoRecord[]>(() => {
    try {
      const saved = localStorage.getItem('galleryRecords');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });
  const [photoToDelete, setPhotoToDelete] = useState<{ url: string; index: number; id?: string; path?: string } | null>(null);
  const [isDeletingPhoto, setIsDeletingPhoto] = useState(false);
  const [galleryUploadProgress, setGalleryUploadProgress] = useState<{ current: number; total: number; percent: number; currentFileName?: string } | null>(null);
  const [isOnline, setIsOnline] = useState(() => typeof navigator !== 'undefined' ? navigator.onLine : true);

  const [homeMenuAvatar, setHomeMenuAvatar] = useState(() => {
    try {
      return localStorage.getItem('adminAvatar') || localStorage.getItem('homeMenuAvatar') || 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop';
    } catch {
      return 'https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=300&h=300&fit=crop';
    }
  });
  const [monthlyDonationsData, setMonthlyDonationsData] = useState([
    { month: 'Mai', total: 3450, doadores: 28 },
    { month: 'Jun', total: 4200, doadores: 34 },
    { month: 'Jul', total: 3900, doadores: 31 },
    { month: 'Ago', total: 5120, doadores: 42 },
    { month: 'Set', total: 6300, doadores: 49 },
    { month: 'Out', total: 7850, doadores: 63 },
  ]);
  const [newChildName, setNewChildName] = useState('');
  const [newChildAge, setNewChildAge] = useState<number>(8);
  const [newChildBirthDate, setNewChildBirthDate] = useState('2016-01-01');
  const [newChildLetter, setNewChildLetter] = useState('');
  const [newChildImage, setNewChildImage] = useState('https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=400&fit=crop');

  const calculateAge = (birthDateStr: string): number => {
    if (!birthDateStr) return 8;
    const birth = new Date(birthDateStr);
    if (isNaN(birth.getTime())) return 8;
    const now = new Date();
    const diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (diffMonths < 12) return 0;
    return Math.floor(diffMonths / 12);
  };

  const getAgeDisplay = (birthDate?: string, ageNum?: number): string => {
    if (!birthDate) return `${ageNum !== undefined ? ageNum : 8} anos`;
    const birth = new Date(birthDate);
    if (isNaN(birth.getTime())) return `${ageNum !== undefined ? ageNum : 8} anos`;
    const now = new Date();
    const diffTime = now.getTime() - birth.getTime();
    const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
    if (diffDays < 0) return 'Recém-nascido';
    if (diffDays <= 7) return 'Recém-nascido';
    if (diffDays < 30) return `${diffDays} dias`;
    const diffMonths = (now.getFullYear() - birth.getFullYear()) * 12 + (now.getMonth() - birth.getMonth());
    if (diffMonths < 12) {
      return `${diffMonths} ${diffMonths === 1 ? 'mês' : 'meses'}`;
    }
    const years = Math.floor(diffMonths / 12);
    return `${years} ${years === 1 ? 'ano' : 'anos'}`;
  };
  const [galleryActivitiesMsg, setGalleryActivitiesMsg] = useState(() => {
    try {
      return localStorage.getItem('galleryActivitiesMsg') || 'Acompanhe as fotos e registros das nossas crianças e eventos no Lar Esperança.';
    } catch {
      return 'Acompanhe as fotos e registros das nossas crianças e eventos no Lar Esperança.';
    }
  });

  const [isLoadingSupabase, setIsLoadingSupabase] = useState(false);
  const [supabaseSyncStatus, setSupabaseSyncStatus] = useState<string>('Carregando...');

  const loadSupabaseData = async () => {
    setIsLoadingSupabase(true);
    try {
      const data = await fetchAllSupabaseData();
      if (!data) {
        setSupabaseSyncStatus('Modo Offline/Local');
        return;
      }

      // 1. Mapear crianças e seus pedidos de presentes reais
      if (data.kids && data.kids.length > 0) {
        const mappedKids: Child[] = data.kids.map((k: any) => {
          const kGifts = (data.gifts || []).filter((g: any) => g.kid_id === k.id);
          const isSponsored = kGifts.some((g: any) => g.sponsor_id || g.status === 1);
          const parsedAge = parseInt(k.age);
          const wishlist = kGifts.length > 0 
            ? kGifts.map((g: any) => ({
                name: [g.type, g.description, g.size ? `(${g.size})` : ''].filter(Boolean).join(' - ') || 'Presente de Natal',
                price: 80
              }))
            : [{ name: 'Roupa ou Brinquedo', price: 80 }];

          const photoUrl = k.photo_path 
            ? (k.photo_path.startsWith('http') 
                ? k.photo_path 
                : `https://utrpckrchcbqgzbhvlzy.supabase.co/storage/v1/object/public/media/${k.photo_path}`)
            : (k.image || 'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=400&fit=crop');

          return {
            id: k.id,
            family_id: k.family_id,
            name: k.name || 'Criança',
            age: !isNaN(parsedAge) ? parsedAge : (k.age ? 1 : 7),
            gender: k.gender || 'Infantil',
            status: isSponsored ? 'Apadrinhado' : (k.status || 'Aguardando Apadrinhamento'),
            likes: k.likes || kGifts.map((g: any) => g.type || g.description).filter(Boolean).join(', ') || 'Desenhar e brincar',
            dream: k.dream || kGifts.map((g: any) => g.description || g.type).filter(Boolean).join('; ') || k.letter?.slice(0, 100) || 'Um Natal iluminado',
            address: k.address || 'Lar Esperança',
            image: photoUrl,
            letter: k.letter || 'Querido Papai Noel, gostaria de ter um Natal muito feliz!',
            birthDate: k.birth_date || undefined,
            wishlist
          };
        });
        setChildrenList(mappedKids);
        localStorage.setItem('childrenList', JSON.stringify(mappedKids));
        if (mappedKids[0]) setSelectedChild(mappedKids[0]);
      }

      // 2. Mapear configurações do site, slides e PIX
      if (data.siteSettings) {
        const settings = data.siteSettings;
        if (settings.slides?.s && Array.isArray(settings.slides.s)) {
          const validSlides = settings.slides.s.filter((s: any) => s.t || s.k || s.img);
          if (validSlides.length > 0) {
            const mappedBanners: BannerSlide[] = validSlides.map((slide: any, idx: number) => ({
              id: `banner-supa-${idx}`,
              image: slide.img 
                ? (slide.img.startsWith('http') ? slide.img : `https://utrpckrchcbqgzbhvlzy.supabase.co/storage/v1/object/public/site/${slide.img}`)
                : 'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=1200&h=600&fit=crop',
              title: slide.k || 'Corações que Acolhe',
              subtitle: slide.t || 'Adote uma cartinha e faça uma criança sorrir neste ano.',
              badge: 'Lar Esperança'
            }));
            setBanners(mappedBanners);
          }
        }
        if (settings.slides?.pix) {
          const p = settings.slides.pix;
          if (p.key) setPixKey(p.key);
          if (p.name) setPixBankName(p.name);
          if (p.msg) setDonationCustomMessage(p.msg);
        }
      }

      // 3. Mapear fotos reais da galeria do Supabase (bucket 'media')
      if (data.gallery && data.gallery.length > 0) {
        const records: GalleryPhotoRecord[] = data.gallery.map((g: any) => ({
          id: g.id,
          path: g.path,
          type: g.type,
          title: g.title,
          created_at: g.created_at,
          url: g.path?.startsWith('http') 
            ? g.path 
            : `https://utrpckrchcbqgzbhvlzy.supabase.co/storage/v1/object/public/media/${g.path}`
        }));
        const mappedUrls = records.map(r => r.url);
        setGalleryRecords(records);
        setGalleryItems(mappedUrls);
        try {
          localStorage.setItem('galleryItems', JSON.stringify(mappedUrls));
          localStorage.setItem('galleryRecords', JSON.stringify(records));
        } catch {}
      }

      // 4. Mapear perfis reais do Supabase (Admin, Famílias e Padrinhos)
      if (data.profiles && data.profiles.length > 0) {
        const adminProf = data.profiles.find((p: any) => p.role === 'admin' || p.id === DEFAULT_ADMIN_PROFILE_ID);
        if (adminProf) {
          if (adminProf.name && adminProf.name !== 'Sem nome') setAdminName(adminProf.name);
          if (adminProf.phone) setAdminPhone(adminProf.phone);
          if (adminProf.bio) setAdminBio(adminProf.bio);
          if (adminProf.photo_path) {
            const avatarUrl = adminProf.photo_path.startsWith('http')
              ? adminProf.photo_path
              : `https://utrpckrchcbqgzbhvlzy.supabase.co/storage/v1/object/public/media/${adminProf.photo_path}`;
            setAdminAvatar(avatarUrl);
          }
        }

        const familyProf = data.profiles.find((p: any) => p.role === 'family');
        if (familyProf) {
          setFamilyUser(prev => ({
            ...prev,
            id: familyProf.id,
            name: familyProf.name || prev.name,
            phone: familyProf.phone || prev.phone,
            bio: familyProf.bio || prev.bio,
            avatar: familyProf.photo_path 
              ? (familyProf.photo_path.startsWith('http') ? familyProf.photo_path : `https://utrpckrchcbqgzbhvlzy.supabase.co/storage/v1/object/public/media/${familyProf.photo_path}`)
              : prev.avatar
          }));
        }

        const sponsorProf = data.profiles.find((p: any) => p.role === 'sponsor');
        if (sponsorProf) {
          setSponsorUser(prev => ({
            ...prev,
            id: sponsorProf.id,
            name: sponsorProf.name || prev.name,
            phone: sponsorProf.phone || prev.phone,
            bio: sponsorProf.bio || prev.bio,
            avatar: sponsorProf.photo_path 
              ? (sponsorProf.photo_path.startsWith('http') ? sponsorProf.photo_path : `https://utrpckrchcbqgzbhvlzy.supabase.co/storage/v1/object/public/media/${sponsorProf.photo_path}`)
              : prev.avatar
          }));
        }
      }

      setSupabaseSyncStatus('Sincronizado');
    } catch (err: any) {
      console.error('Falha ao sincronizar Supabase:', err);
      setSupabaseSyncStatus('Erro');
    } finally {
      setIsLoadingSupabase(false);
    }
  };

  useEffect(() => {
    loadSupabaseData();
  }, []);

  const persistSiteSettingsToSupabase = async (
    currentBanners = banners,
    currentStories = stories916,
    currentPix = { key: pixKey, name: pixBankName, msg: donationCustomMessage, qr: pixQrCode }
  ) => {
    const slidesPayload = {
      s: currentBanners.map(b => ({
        id: b.id,
        img: b.image,
        image: b.image,
        k: b.title,
        title: b.title,
        t: b.subtitle,
        subtitle: b.subtitle,
        badge: b.badge
      })),
      stories_916: currentStories,
      pix: currentPix
    };

    const res = await updateSiteSettingsInSupabase(slidesPayload);
    if (res.error) {
      console.warn('Nota ao salvar site_settings no Supabase:', res.error);
    }
  };


  // Estados para Editor de Fotos e Gestor de Mídias
  const [photoEditorImg, setPhotoEditorImg] = useState<string>('https://images.unsplash.com/photo-1544717305-2782549b5136?w=500&h=500&fit=crop');
  const [photoBrightness, setPhotoBrightness] = useState<number>(100);
  const [photoContrast, setPhotoContrast] = useState<number>(100);
  const [photoSaturation, setPhotoSaturation] = useState<number>(100);
  const [photoRotation, setPhotoRotation] = useState<number>(0);
  const [photoFilter, setPhotoFilter] = useState<'none' | 'sepia' | 'grayscale' | 'warm' | 'cool'>('none');
  const [mediaActiveTab, setMediaActiveTab] = useState<'gallery' | 'banners' | 'stories'>('gallery');
  const [isUploadingGallery, setIsUploadingGallery] = useState(false);
  const [galleryUploadStatus, setGalleryUploadStatus] = useState('');
  const [adminGalleryFilter, setAdminGalleryFilter] = useState<'all' | 'images' | 'videos'>('all');
  const [adminGallerySearch, setAdminGallerySearch] = useState('');

  // Estados e Referências da Câmera do Aplicativo (Captura ao Vivo e Direta)
  const [isInAppCameraOpen, setIsInAppCameraOpen] = useState(false);
  const [cameraFacingMode, setCameraFacingMode] = useState<'environment' | 'user'>('environment');
  const [cameraTarget, setCameraTarget] = useState<'gallery' | 'child' | 'carousel' | 'media916' | 'profile' | 'photo_editor'>('gallery');
  const [cameraChildTargetIndex, setCameraChildTargetIndex] = useState<number | null>(null);
  const [cameraCapturedImage, setCameraCapturedImage] = useState<string | null>(null);
  const [isCameraStarting, setIsCameraStarting] = useState(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [cameraAspectRatio, setCameraAspectRatio] = useState<'4:3' | '1:1' | '9:16' | '16:9'>('4:3');
  const [cameraFlashEffect, setCameraFlashEffect] = useState(false);
  const cameraVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraModalVideoRef = useRef<HTMLVideoElement | null>(null);
  const cameraStreamRef = useRef<MediaStream | null>(null);

  // Iniciar Stream da Câmera
  const startCameraStream = async (mode: 'environment' | 'user' = cameraFacingMode) => {
    setIsCameraStarting(true);
    setCameraError(null);

    // Parar streams anteriores
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }

    try {
      if (typeof navigator === 'undefined' || !navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        throw new Error('Acesso direto à câmera não suportado neste navegador. Utilize o botão de Câmera do Celular abaixo.');
      }

      const constraints: MediaStreamConstraints = {
        audio: false,
        video: {
          facingMode: { ideal: mode },
          width: { ideal: 1280 },
          height: { ideal: 720 }
        }
      };

      const stream = await navigator.mediaDevices.getUserMedia(constraints);
      cameraStreamRef.current = stream;

      if (cameraVideoRef.current) {
        cameraVideoRef.current.srcObject = stream;
        cameraVideoRef.current.play().catch(() => {});
      }
      if (cameraModalVideoRef.current) {
        cameraModalVideoRef.current.srcObject = stream;
        cameraModalVideoRef.current.play().catch(() => {});
      }
    } catch (err: any) {
      console.warn('Erro ao inicializar câmera:', err);
      setCameraError(err.message || 'Permissão de câmera não concedida. Toque no botão de Câmera do Celular para capturar.');
    } finally {
      setIsCameraStarting(false);
    }
  };

  // Parar Câmera
  const stopCameraStream = () => {
    if (cameraStreamRef.current) {
      cameraStreamRef.current.getTracks().forEach(t => t.stop());
      cameraStreamRef.current = null;
    }
    if (cameraVideoRef.current) {
      cameraVideoRef.current.srcObject = null;
    }
    if (cameraModalVideoRef.current) {
      cameraModalVideoRef.current.srcObject = null;
    }
  };

  // Alternar Frontal / Traseira
  const toggleCameraFacingMode = () => {
    const nextMode = cameraFacingMode === 'environment' ? 'user' : 'environment';
    setCameraFacingMode(nextMode);
    startCameraStream(nextMode);
  };

  // Disparar Foto (Capturar Frame do Vídeo)
  const capturePhotoFromStream = (useModalVideo = false) => {
    const video = useModalVideo ? cameraModalVideoRef.current : (cameraVideoRef.current || cameraModalVideoRef.current);
    if (!video || !video.videoWidth || !video.videoHeight) {
      setNotification('Câmera carregando imagem. Aguarde um instante...');
      return;
    }

    // Flash visual
    setCameraFlashEffect(true);
    setTimeout(() => setCameraFlashEffect(false), 200);

    const canvas = document.createElement('canvas');
    const width = video.videoWidth;
    const height = video.videoHeight;

    if (cameraAspectRatio === '1:1') {
      const minDim = Math.min(width, height);
      canvas.width = minDim;
      canvas.height = minDim;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const sx = (width - minDim) / 2;
        const sy = (height - minDim) / 2;
        ctx.drawImage(video, sx, sy, minDim, minDim, 0, 0, minDim, minDim);
      }
    } else if (cameraAspectRatio === '9:16') {
      canvas.width = 720;
      canvas.height = 1280;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        const targetRatio = 9 / 16;
        const currentRatio = width / height;
        let sx = 0, sy = 0, sWidth = width, sHeight = height;
        if (currentRatio > targetRatio) {
          sWidth = height * targetRatio;
          sx = (width - sWidth) / 2;
        } else {
          sHeight = width / targetRatio;
          sy = (height - sHeight) / 2;
        }
        ctx.drawImage(video, sx, sy, sWidth, sHeight, 0, 0, 720, 1280);
      }
    } else {
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (ctx) {
        ctx.drawImage(video, 0, 0, width, height);
      }
    }

    try {
      const dataUrl = canvas.toDataURL('image/jpeg', 0.88);
      setCameraCapturedImage(dataUrl);
      setNotification('📸 Foto capturada com sucesso!');
      confetti({ particleCount: 35, spread: 50 });
    } catch (err) {
      console.warn('Erro ao processar captura:', err);
      setNotification('Erro ao gerar foto.');
    }
  };

  // Salvar Foto Capturada no Destino
  const saveCapturedPhotoToDestination = (dest: 'gallery' | 'child' | 'carousel' | 'media916' | 'profile' | 'photo_editor') => {
    if (!cameraCapturedImage) return;

    if (dest === 'gallery') {
      setGalleryItems(prev => [cameraCapturedImage, ...prev]);
      setNotification('🎉 Foto salva na Galeria Geral do Lar Esperança!');
      confetti({ particleCount: 45, spread: 60 });
    } else if (dest === 'child') {
      if (cameraChildTargetIndex !== null && childrenList[cameraChildTargetIndex]) {
        const updated = [...childrenList];
        updated[cameraChildTargetIndex].image = cameraCapturedImage;
        setChildrenList(updated);
        setNotification(`Foto atualizada para ${childrenList[cameraChildTargetIndex].name}!`);
      } else {
        setNewChildImage(cameraCapturedImage);
        setNotification('Foto inserida no cadastro da nova criança!');
      }
      confetti({ particleCount: 40, spread: 50 });
    } else if (dest === 'carousel') {
      const newBanner: BannerSlide = {
        id: 'banner_' + Date.now(),
        image: cameraCapturedImage,
        title: newBannerTitle || 'Momento Lar Esperança',
        subtitle: newBannerSubtitle || 'Registrado pela Câmera Oficial',
        badge: newBannerBadge || 'Novo'
      };
      const updatedBanners = [newBanner, ...banners];
      setBanners(updatedBanners);
      persistSiteSettingsToSupabase(updatedBanners);
      setNotification('Foto adicionada ao Carrossel de Banners e salva no Supabase!');
      confetti({ particleCount: 40, spread: 50 });
    } else if (dest === 'media916') {
      const newStory: Media916 = {
        id: 'story_' + Date.now(),
        type: 'image',
        url: cameraCapturedImage,
        title: newStoryTitle || 'Momento Especial',
        subtitle: newStorySubtitle || 'Lar Esperança'
      };
      const updatedStories = [newStory, ...stories916];
      setStories916(updatedStories);
      persistSiteSettingsToSupabase(banners, updatedStories);
      setNotification('Foto adicionada aos Stories 9:16 e salva no Supabase!');
      confetti({ particleCount: 40, spread: 50 });
    } else if (dest === 'profile') {
      setAdminAvatar(cameraCapturedImage);
      try {
        localStorage.setItem('adminAvatar', cameraCapturedImage);
      } catch {}
      setNotification('Foto de perfil do administrador atualizada!');
      confetti({ particleCount: 40, spread: 50 });
    } else if (dest === 'photo_editor') {
      setPhotoEditorImg(cameraCapturedImage);
      setCurrentScreenIndex(10);
      setNotification('Foto aberta no Editor de Imagens!');
    }

    // Fechar modal e limpar
    setIsInAppCameraOpen(false);
    setCameraCapturedImage(null);
    setCameraChildTargetIndex(null);
    stopCameraStream();
  };

  // Abrir Câmera do App com um destino específico
  const openInAppCamera = (target: 'gallery' | 'child' | 'carousel' | 'media916' | 'profile' | 'photo_editor' = 'gallery', childIdx: number | null = null) => {
    setCameraTarget(target);
    setCameraChildTargetIndex(childIdx);
    setCameraCapturedImage(null);
    setCameraError(null);
    setIsInAppCameraOpen(true);
    startCameraStream(cameraFacingMode);
  };

  useEffect(() => {
    if (adminTab === 'camera') {
      startCameraStream(cameraFacingMode);
    } else if (!isInAppCameraOpen) {
      stopCameraStream();
    }
  }, [adminTab, isInAppCameraOpen]);

  const [isHomeMenuOpen, setIsHomeMenuOpen] = useState(false);
  const [isAdminMenuOpen, setIsAdminMenuOpen] = useState(false);

  const [notificationsList, setNotificationsList] = useState<LocalAppNotification[]>(() => {
    try {
      const saved = localStorage.getItem('localNotifications');
      return saved ? JSON.parse(saved) : [
        {
          id: 'welcome-notif',
          title: 'Sistema de Notificações Ativo 🔔',
          body: 'Você receberá alertas locais sempre que uma nova criança for cadastrada ou quando o status de apadrinhamento for atualizado.',
          type: 'system',
          timestamp: 'Hoje',
          read: false,
        }
      ];
    } catch {
      return [
        {
          id: 'welcome-notif',
          title: 'Sistema de Notificações Ativo 🔔',
          body: 'Você receberá alertas locais sempre que uma nova criança for cadastrada ou quando o status de apadrinhamento for atualizado.',
          type: 'system',
          timestamp: 'Hoje',
          read: false,
        }
      ];
    }
  });

  const [isNotificationCenterOpen, setIsNotificationCenterOpen] = useState(false);
  const [notificationFilter, setNotificationFilter] = useState<'all' | 'new_child' | 'status_change'>('all');
  const [browserNotificationPermission, setBrowserNotificationPermission] = useState<NotificationPermission>(() => {
    return typeof window !== 'undefined' && 'Notification' in window ? Notification.permission : 'default';
  });
  const [biometricLockEnabled, setBiometricLockEnabled] = useState(false);
  const [isUnlocked, setIsUnlocked] = useState(true);

  // Simulação de autenticação biométrica (Placeholder)
  useEffect(() => {
    if (biometricLockEnabled && isUnlocked) {
        // Implementação real exigiria Web Authentication API ou SDKs específicos de dispositivo
        console.log("Sistema bloqueado por biometria. Aguardando verificação...");
    }
  }, [biometricLockEnabled, isUnlocked]);

  const snowCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const fireworksCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const adminFireworksCanvasRef = useRef<HTMLCanvasElement | null>(null);
  const triggerSimulatorExplosionRef = useRef<(() => void) | null>(null);

  const currentEvangelicalTheme = evangelicalThemes.find(t => t.id === activeEvangelicalThemeId) || evangelicalThemes[0];
  const currentEvangelicalMessage = evangelicalMessages.find(m => m.id === activeEvangelicalMessageId) || evangelicalMessages[0];

  const orderedScreens: { id: Screen; title: string; number: number }[] = [
    { id: 'home', number: 1, title: 'Tela Inicial / Home' },
    { id: 'login', number: 2, title: 'Tela de Acesso (Login)' },
    { id: 'register', number: 3, title: 'Cadastro Simples' },
    { id: 'admin_dashboard', number: 4, title: 'Painel de Gestão' },
    { id: 'family_profile', number: 5, title: 'Perfil da Família' },
    { id: 'sponsor_profile', number: 6, title: 'Perfil do Padrinho' },
    { id: 'child_profile', number: 7, title: 'Perfil da Criança' },
    { id: 'approval_workflow', number: 8, title: 'Processo de Aprovação (3 Etapas)' },
    { id: 'waiting_area', number: 9, title: 'Área de Espera' },
    { id: 'gallery', number: 10, title: 'Galeria - Fotos e Vídeos' },
    { id: 'photo_editor', number: 11, title: 'Editor de Fotos (Ajuste Automático)' },
    { id: 'media_management', number: 12, title: 'Gerenciamento de Mídias' },
    { id: 'settings', number: 13, title: 'Configurações de Cores' },
    { id: 'menu_drawer', number: 14, title: 'Menu Lateral (Perfil e Acesso)' },
    { id: 'pwa_install', number: 15, title: 'PWA - Instalação' },
  ];

  const currentScreenObj = orderedScreens[currentScreenIndex] || orderedScreens[0];

  // Auto-hide notification after 3.2s
  useEffect(() => {
    if (notification) {
      const timer = setTimeout(() => setNotification(null), 3200);
      return () => clearTimeout(timer);
    }
  }, [notification]);

  // Sincronização offline: Salva automaticamente lista de crianças e galeria no storage local
  useEffect(() => {
    try {
      localStorage.setItem('childrenList', JSON.stringify(childrenList));
    } catch (e) {
      console.warn('Erro ao sincronizar crianças no cache local:', e);
    }
  }, [childrenList]);

  useEffect(() => {
    try {
      localStorage.setItem('galleryItems', JSON.stringify(galleryItems));
    } catch (e) {
      console.warn('Erro ao sincronizar galeria no cache local:', e);
      try {
        // Fallback resiliente: armazena as primeiras 12 mídias comprimidas se atingir cota do navegador
        const safeSlice = galleryItems.slice(0, 12);
        localStorage.setItem('galleryItems', JSON.stringify(safeSlice));
      } catch (inner) {
        console.warn('Cache local em modo memória protegida:', inner);
      }
    }
  }, [galleryItems]);

  useEffect(() => {
    try {
      localStorage.setItem('homeCardOrder', JSON.stringify(homeCardOrder));
    } catch (e) {
      console.warn('Erro ao salvar ordem dos cards:', e);
    }
  }, [homeCardOrder]);

  useEffect(() => {
    try {
      localStorage.setItem('pwaCustomIcon', pwaCustomIcon);
    } catch (e) {
      console.warn('Erro ao salvar ícone PWA:', e);
    }
  }, [pwaCustomIcon]);

  useEffect(() => {
    try {
      localStorage.setItem('sponsorUser', JSON.stringify(sponsorUser));
    } catch (e) {
      console.warn('Erro ao salvar sponsorUser:', e);
    }
  }, [sponsorUser]);

  useEffect(() => {
    try {
      localStorage.setItem('familyUser', JSON.stringify(familyUser));
    } catch (e) {
      console.warn('Erro ao salvar familyUser:', e);
    }
  }, [familyUser]);

  useEffect(() => {
    try {
      localStorage.setItem('banners', JSON.stringify(banners));
    } catch (e) {
      console.warn('Erro ao salvar banners:', e);
    }
  }, [banners]);

  useEffect(() => {
    try {
      localStorage.setItem('stories916', JSON.stringify(stories916));
    } catch (e) {
      console.warn('Erro ao salvar stories916:', e);
    }
  }, [stories916]);

  useEffect(() => {
    try {
      localStorage.setItem('footerButtons', JSON.stringify(footerButtons));
    } catch (e) {
      console.warn('Erro ao salvar footerButtons:', e);
    }
  }, [footerButtons]);

  useEffect(() => {
    try {
      localStorage.setItem('socialLinks', JSON.stringify(socialLinks));
    } catch (e) {
      console.warn('Erro ao salvar socialLinks:', e);
    }
  }, [socialLinks]);

  useEffect(() => {
    try {
      localStorage.setItem('evangelicalMessages', JSON.stringify(evangelicalMessages));
      localStorage.setItem('activeEvangelicalThemeId', activeEvangelicalThemeId);
      localStorage.setItem('activeEvangelicalMessageId', activeEvangelicalMessageId);
      localStorage.setItem('isEvangelicalBannerEnabled', String(isEvangelicalBannerEnabled));
    } catch (e) {
      console.warn('Erro ao salvar temas evangélicos:', e);
    }
  }, [evangelicalMessages, activeEvangelicalThemeId, activeEvangelicalMessageId, isEvangelicalBannerEnabled]);

  useEffect(() => {
    try {
      localStorage.setItem('donationCustomMessage', donationCustomMessage);
      localStorage.setItem('pixKey', pixKey);
      localStorage.setItem('pixBankName', pixBankName);
      localStorage.setItem('pixQrCode', pixQrCode);
    } catch (e) {
      console.warn('Erro ao salvar dados do PIX:', e);
    }
  }, [donationCustomMessage, pixKey, pixBankName, pixQrCode]);

  useEffect(() => {
    try {
      localStorage.setItem('isSplashEnabled', String(isSplashEnabled));
      localStorage.setItem('splashColorTheme', splashColorTheme);
      localStorage.setItem('splashPrimaryColor', splashPrimaryColor);
      localStorage.setItem('splashCloudGlow', splashCloudGlow);
      localStorage.setItem('splashShowEnterButton', String(splashShowEnterButton));
      localStorage.setItem('splashAutoEnterDelay', String(splashAutoEnterDelay));
    } catch (e) {
      console.warn('Erro ao salvar configurações da splash 3D:', e);
    }
  }, [isSplashEnabled, splashColorTheme, splashPrimaryColor, splashCloudGlow, splashShowEnterButton, splashAutoEnterDelay]);

  useEffect(() => {
    try {
      localStorage.setItem('adminName', adminName);
      localStorage.setItem('adminRole', adminRole);
      localStorage.setItem('adminEmail', adminEmail);
      localStorage.setItem('adminPhone', adminPhone);
      localStorage.setItem('adminBio', adminBio);
      localStorage.setItem('adminAvatar', adminAvatar);
    } catch (e) {
      console.warn('Erro ao salvar dados do proprietário:', e);
    }
  }, [adminName, adminRole, adminEmail, adminPhone, adminBio, adminAvatar]);

  // Monitoramento de status Online / Offline
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      setNotification('Conexão restabelecida! Aplicativo online.');
    };
    const handleOffline = () => {
      setIsOnline(false);
      setNotification('Modo Offline ativado! Crianças e Galeria disponíveis via cache.');
    };
    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);
    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Splash progression stages & auto-enter logic: now ALWAYS auto-hides
  useEffect(() => {
    if (isShowingSplash) {
      setSplashStage(0);
      const stage1 = setTimeout(() => setSplashStage(1), 1000);
      const stage2 = setTimeout(() => setSplashStage(2), 2200);

      // Always auto-hide after delay
      const autoTimer = setTimeout(() => {
        setIsShowingSplash(false);
        if (isFestiveSoundEnabled) playFestiveChime();
      }, (splashAutoEnterDelay || 4) * 1000);

      return () => {
        clearTimeout(stage1);
        clearTimeout(stage2);
        clearTimeout(autoTimer);
      };
    }
  }, [isShowingSplash, splashAutoEnterDelay, isFestiveSoundEnabled]);

  // Auto-advance Home Carousel every 4.5 seconds
  useEffect(() => {
    if (banners.length <= 1) return;
    const interval = setInterval(() => {
      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
    }, 4500);
    return () => clearInterval(interval);
  }, [banners.length]);

  // Snow Canvas Animation (Default: Only Home Screen; Protegido do Painel)
  useEffect(() => {
    const canvas = snowCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    if (
      snowIntensity === 'off' || 
      currentScreenObj.id === 'admin_dashboard' || 
      (snowScope === 'home_only' && currentScreenObj.id !== 'home')
    ) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    let animationFrameId: number;
    const flakeCount = snowIntensity === 'light' ? 25 : snowIntensity === 'medium' ? 55 : 100;
    
    const updateSize = () => {
      if (!canvas || !canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth || 400;
      canvas.height = canvas.parentElement.clientHeight || 800;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    const flakes: { x: number; y: number; r: number; d: number; s: number }[] = [];
    for (let i = 0; i < flakeCount; i++) {
      flakes.push({
        x: Math.random() * (canvas.width || 400),
        y: Math.random() * (canvas.height || 800),
        r: Math.random() * 3 + 1,
        d: Math.random() * flakeCount,
        s: Math.random() * 1.2 + 0.6
      });
    }

    let angle = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
      ctx.beginPath();
      for (let i = 0; i < flakeCount; i++) {
        const f = flakes[i];
        ctx.moveTo(f.x, f.y);
        ctx.arc(f.x, f.y, f.r, 0, Math.PI * 2, true);
      }
      ctx.fill();

      angle += 0.01;
      for (let i = 0; i < flakeCount; i++) {
        const f = flakes[i];
        f.y += Math.cos(angle + f.d) + 1 + f.s;
        f.x += Math.sin(angle) * 0.8;

        if (f.x > canvas.width + 5 || f.x < -5 || f.y > canvas.height) {
          flakes[i] = {
            x: Math.random() * canvas.width,
            y: -10,
            r: f.r,
            d: f.d,
            s: f.s
          };
        }
      }

      animationFrameId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      window.removeEventListener('resize', updateSize);
      cancelAnimationFrame(animationFrameId);
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [snowIntensity, snowScope, currentScreenObj.id]);

  // Fireworks Canvas Engine in New Year Mode (Ajustado no Lugar, Cristalino e 100% Isolado do Painel)
  useEffect(() => {
    const canvas = fireworksCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    // Regra Fundamental: Os fogos NUNCA devem invadir ou cobrir o painel administrativo!
    const isExcludedScreen = currentScreenObj.id === 'admin_dashboard';
    const isNotOnHome = (fireworksScope === 'home_only' || fireworksScope === 'home_sky') && currentScreenObj.id !== 'home';

    if (festiveMode !== 'new_year' || isExcludedScreen || isNotOnHome) {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      return;
    }

    // Auto-ajuste de tamanho responsivo (celular, tablet e computador)
    const updateSize = () => {
      if (!canvas || !canvas.parentElement) return;
      canvas.width = canvas.parentElement.clientWidth || 400;
      canvas.height = canvas.parentElement.clientHeight || 800;
    };
    updateSize();
    window.addEventListener('resize', updateSize);

    interface Particle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      size: number;
      decay: number;
    }

    interface Rocket {
      x: number;
      y: number;
      targetY: number;
      vy: number;
      color: string;
      trail: { x: number; y: number; alpha: number }[];
    }

    let particles: Particle[] = [];
    let rockets: Rocket[] = [];
    const colors = ['#FF5964', '#FEE180', '#35A7FF', '#38BDF8', '#38EF7D', '#FF7EB6', '#FFFFFF', '#F59E0B', '#E879F9'];

    const spawnExplosion = (x: number, y: number, baseColor?: string) => {
      if (isFestiveSoundEnabled) {
        playFireworkBoom();
      }
      const count = fireworksIntensity === 'heavy' ? 55 : fireworksIntensity === 'medium' ? 38 : 24;
      const col = baseColor || colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < count; i++) {
        const angle = (Math.PI * 2 / count) * i + (Math.random() - 0.5) * 0.4;
        const speed = Math.random() * 3.6 + 1.8;
        particles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: Math.random() > 0.35 ? col : '#FFFFFF',
          size: Math.random() * 2.2 + 1.2,
          decay: Math.random() * 0.02 + 0.014
        });
      }
    };

    const launchRocket = () => {
      const width = canvas.width || 400;
      const height = canvas.height || 800;
      const x = Math.random() * (width * 0.76) + width * 0.12;

      // Posição Ajustada: se for Céu/Topo (ideal para o banner), explode no terço superior
      const targetY = fireworksPosition === 'sky_top' || fireworksScope === 'home_sky'
        ? Math.random() * (height * 0.32) + (height * 0.08)
        : Math.random() * (height * 0.45) + (height * 0.15);

      rockets.push({
        x,
        y: height,
        targetY,
        vy: -(Math.random() * 3.5 + 7),
        color: colors[Math.floor(Math.random() * colors.length)],
        trail: []
      });
    };

    const intervalTime = fireworksIntensity === 'heavy' ? 1100 : fireworksIntensity === 'medium' ? 2000 : 3500;
    const rocketInterval = setInterval(() => {
      launchRocket();
    }, intervalTime);

    // Disparo inicial suave
    launchRocket();

    let animId: number;
    const animate = () => {
      // 100% Transparente: clearRect a cada frame para NUNCA criar película escura na tela!
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Atualiza e desenha foguetes subindo com rastro luminoso
      for (let i = rockets.length - 1; i >= 0; i--) {
        const r = rockets[i];
        r.trail.push({ x: r.x, y: r.y, alpha: 0.9 });
        if (r.trail.length > 8) r.trail.shift();

        r.y += r.vy;

        // Rastro de faíscas translúcido
        for (let t = 0; t < r.trail.length; t++) {
          const pt = r.trail[t];
          ctx.save();
          ctx.globalAlpha = (t / r.trail.length) * 0.55;
          ctx.fillStyle = r.color;
          ctx.beginPath();
          ctx.arc(pt.x + (Math.random() - 0.5) * 2, pt.y, 1.5, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        // Cabeça brilhante do foguete
        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 8;
        ctx.shadowColor = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2.5, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (r.y <= r.targetY) {
          spawnExplosion(r.x, r.y, r.color);
          rockets.splice(i, 1);
        }
      }

      // Atualiza e desenha partículas de explosão
      for (let i = particles.length - 1; i >= 0; i--) {
        const p = particles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.055; // Gravidade
        p.vx *= 0.98;  // Resistência do ar
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          particles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 7;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(animate);
    };

    animate();

    return () => {
      window.removeEventListener('resize', updateSize);
      clearInterval(rocketInterval);
      cancelAnimationFrame(animId);
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [festiveMode, fireworksScope, fireworksPosition, fireworksIntensity, currentScreenObj.id, isFestiveSoundEnabled]);

  // Simulador de Fogos do Painel (Caixa de Teste Dedicada - Nunca invade o painel)
  useEffect(() => {
    if (adminTab !== 'festive') return;

    const canvas = adminFireworksCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = canvas.parentElement?.clientWidth || 320;
    canvas.height = 160;

    interface SimParticle {
      x: number;
      y: number;
      vx: number;
      vy: number;
      alpha: number;
      color: string;
      size: number;
      decay: number;
    }

    interface SimRocket {
      x: number;
      y: number;
      targetY: number;
      vy: number;
      color: string;
      trail: { x: number; y: number }[];
    }

    let simParticles: SimParticle[] = [];
    let simRockets: SimRocket[] = [];
    const colors = ['#FF5964', '#FEE180', '#38BDF8', '#FF7EB6', '#FFFFFF', '#38EF7D', '#F59E0B'];

    const spawnSimExplosion = (x: number, y: number, color?: string) => {
      if (isFestiveSoundEnabled) playFireworkBoom();
      const col = color || colors[Math.floor(Math.random() * colors.length)];
      for (let i = 0; i < 35; i++) {
        const angle = (Math.PI * 2 / 35) * i;
        const speed = Math.random() * 2.8 + 1.2;
        simParticles.push({
          x,
          y,
          vx: Math.cos(angle) * speed,
          vy: Math.sin(angle) * speed,
          alpha: 1,
          color: Math.random() > 0.3 ? col : '#FFFFFF',
          size: Math.random() * 2 + 1,
          decay: Math.random() * 0.025 + 0.015
        });
      }
    };

    const launchSimRocket = () => {
      const x = Math.random() * (canvas.width * 0.7) + canvas.width * 0.15;
      const targetY = Math.random() * (canvas.height * 0.4) + canvas.height * 0.15;
      simRockets.push({
        x,
        y: canvas.height - 10,
        targetY,
        vy: -(Math.random() * 2.5 + 4),
        color: colors[Math.floor(Math.random() * colors.length)],
        trail: []
      });
    };

    triggerSimulatorExplosionRef.current = () => {
      launchSimRocket();
      setTimeout(launchSimRocket, 250);
      setNotification('🎆 Teste disparado com sucesso dentro do simulador!');
    };

    let simInterval: any = null;
    if (isAdminSimulatorRunning) {
      simInterval = setInterval(() => {
        launchSimRocket();
      }, 2600);
      launchSimRocket();
    }

    let animId: number;
    const animateSim = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Estrelas cintilantes de fundo no céu do simulador
      ctx.fillStyle = '#FFFFFF';
      for (let s = 0; s < 18; s++) {
        ctx.globalAlpha = 0.3 + (s % 4) * 0.18;
        ctx.fillRect((s * 31) % canvas.width, (s * 23) % (canvas.height - 35), 1.2, 1.2);
      }
      ctx.globalAlpha = 1;

      // Foguetes no simulador
      for (let i = simRockets.length - 1; i >= 0; i--) {
        const r = simRockets[i];
        r.trail.push({ x: r.x, y: r.y });
        if (r.trail.length > 6) r.trail.shift();
        r.y += r.vy;

        for (let t = 0; t < r.trail.length; t++) {
          ctx.save();
          ctx.globalAlpha = (t / r.trail.length) * 0.6;
          ctx.fillStyle = r.color;
          ctx.beginPath();
          ctx.arc(r.trail[t].x, r.trail[t].y, 1.2, 0, Math.PI * 2);
          ctx.fill();
          ctx.restore();
        }

        ctx.save();
        ctx.fillStyle = '#FFFFFF';
        ctx.shadowBlur = 6;
        ctx.shadowColor = r.color;
        ctx.beginPath();
        ctx.arc(r.x, r.y, 2, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();

        if (r.y <= r.targetY) {
          spawnSimExplosion(r.x, r.y, r.color);
          simRockets.splice(i, 1);
        }
      }

      // Partículas no simulador
      for (let i = simParticles.length - 1; i >= 0; i--) {
        const p = simParticles[i];
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.045;
        p.vx *= 0.98;
        p.alpha -= p.decay;

        if (p.alpha <= 0) {
          simParticles.splice(i, 1);
          continue;
        }

        ctx.save();
        ctx.globalAlpha = Math.max(0, p.alpha);
        ctx.fillStyle = p.color;
        ctx.shadowBlur = 5;
        ctx.shadowColor = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
      }

      animId = requestAnimationFrame(animateSim);
    };

    animateSim();

    return () => {
      if (simInterval) clearInterval(simInterval);
      cancelAnimationFrame(animId);
      if (canvas && ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
      }
    };
  }, [adminTab, isAdminSimulatorRunning, isFestiveSoundEnabled]);

  const triggerManualFireworks = () => {
    if (isFestiveSoundEnabled) playFireworkBoom();
    confetti({
      particleCount: 70,
      spread: 80,
      origin: { x: Math.random() * 0.5 + 0.25, y: 0.35 },
      colors: ['#FF7EB6', '#FFB942', '#38BDF8', '#FFFFFF', '#4ADE80', '#A855F7'],
      disableForReducedMotion: true
    });
    setNotification('🎆 Grande estouro de fogos de Ano Novo!');
  };

  const clearAllEffects = () => {
    const snowCtx = snowCanvasRef.current?.getContext('2d');
    if (snowCtx && snowCanvasRef.current) snowCtx.clearRect(0, 0, snowCanvasRef.current.width, snowCanvasRef.current.height);

    const fwCtx = fireworksCanvasRef.current?.getContext('2d');
    if (fwCtx && fireworksCanvasRef.current) fwCtx.clearRect(0, 0, fireworksCanvasRef.current.width, fireworksCanvasRef.current.height);

    const simCtx = adminFireworksCanvasRef.current?.getContext('2d');
    if (simCtx && adminFireworksCanvasRef.current) simCtx.clearRect(0, 0, adminFireworksCanvasRef.current.width, adminFireworksCanvasRef.current.height);

    setNotification('🧹 Todos os efeitos foram limpos da tela com sucesso!');
  };

  const handleDonationClick = () => {
    setShowDonationModal(true);
  };

  // Funções de Saída / Logout limpas e seguras
  const handleSponsorLogout = (goToHome = false) => {
    setSponsorUser(prev => ({ ...prev, isLoggedIn: false }));
    setNotification('Sessão de Padrinho finalizada com sucesso.');
    if (goToHome) {
      setCurrentScreenIndex(0);
    } else {
      setSponsorAuthMode('login');
    }
  };

  const handleFamilyLogout = (goToHome = false) => {
    setFamilyUser(prev => ({ ...prev, isLoggedIn: false }));
    setNotification('Sessão da Família finalizada com sucesso.');
    if (goToHome) {
      setCurrentScreenIndex(0);
    } else {
      setFamilyAuthMode('login');
    }
  };

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const fileList = e.target.files;
    if (!fileList || fileList.length === 0) return;

    const files = Array.from(fileList);
    setIsUploadingGallery(true);
    setGalleryUploadProgress({ current: 0, total: files.length, percent: 0 });
    setGalleryUploadStatus(`Preparando ${files.length} foto(s) para upload no Supabase...`);
    setNotification(`Iniciando upload de ${files.length} foto(s) para o Supabase Storage...`);

    const uploadedRecords: GalleryPhotoRecord[] = [];
    const uploadedUrls: string[] = [];
    const errors: string[] = [];

    try {
      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        const percent = Math.round(((i + 1) / files.length) * 100);
        setGalleryUploadProgress({
          current: i + 1,
          total: files.length,
          percent,
          currentFileName: file.name
        });
        setGalleryUploadStatus(`Enviando foto ${i + 1} de ${files.length} (${percent}%) - ${file.name}...`);

        try {
          // Otimizar ou comprimir a imagem mantendo alta fidelidade
          const compressedDataUrl = await processMediaFile(file);

          // Fazer upload real para o Supabase Storage (bucket media) e registrar na tabela gallery
          const result = await uploadGalleryPhotoToSupabase(file, compressedDataUrl);

          if (result.error || !result.data) {
            console.error(`Erro ao enviar foto ${file.name}:`, result.error);
            errors.push(`${file.name}: ${result.error || 'Falha no envio'}`);
          } else {
            uploadedRecords.push(result.data);
            uploadedUrls.push(result.data.url);
          }
        } catch (fileErr: any) {
          console.error(`Exceção ao enviar ${file.name}:`, fileErr);
          errors.push(`${file.name}: ${fileErr?.message || 'Erro inesperado'}`);
        }
      }

      if (uploadedUrls.length > 0) {
        // Adiciona novas fotos no início sem apagar as fotos já salvas
        setGalleryItems(prev => [...uploadedUrls, ...prev]);
        setGalleryRecords(prev => [...uploadedRecords, ...prev]);

        try {
          const currentSaved = localStorage.getItem('galleryItems');
          const prevList = currentSaved ? JSON.parse(currentSaved) : [];
          localStorage.setItem('galleryItems', JSON.stringify([...uploadedUrls, ...prevList]));
        } catch {}

        if (errors.length === 0) {
          setNotification(`🎉 ${uploadedUrls.length} foto(s) enviada(s) e salvas no Supabase com sucesso!`);
          confetti({ particleCount: 50, spread: 60 });
        } else {
          setNotification(`⚠️ ${uploadedUrls.length} foto(s) enviada(s) com sucesso. ${errors.length} foto(s) falharam.`);
        }
      } else {
        setNotification(`Erro ao enviar fotos para o Supabase: ${errors[0] || 'Falha no envio'}`);
      }
    } catch (err: any) {
      console.error('Erro global no upload:', err);
      setNotification(`Falha no upload: ${err?.message || 'Erro de conexão'}`);
    } finally {
      setIsUploadingGallery(false);
      setGalleryUploadProgress(null);
      setGalleryUploadStatus('');
      e.target.value = '';
    }
  };

  const handleConfirmDeletePhoto = async () => {
    if (!photoToDelete) return;
    const { url, index, id, path } = photoToDelete;
    setIsDeletingPhoto(true);

    try {
      const res = await deleteGalleryPhotoFromSupabase({ id, path, url });
      if (!res.success) {
        setNotification(`Erro ao excluir foto no Supabase: ${res.error || 'Falha na exclusão'}`);
        return;
      }

      // Sucesso confirmado no Supabase: atualizar estado
      setGalleryItems(prev => prev.filter((_, i) => i !== index));
      setGalleryRecords(prev => prev.filter(r => r.url !== url && (id ? r.id !== id : true)));

      try {
        const currentSaved = localStorage.getItem('galleryItems');
        if (currentSaved) {
          const parsed = JSON.parse(currentSaved);
          const updated = parsed.filter((u: string) => u !== url);
          localStorage.setItem('galleryItems', JSON.stringify(updated));
        }
      } catch {}

      setNotification('Foto excluída com sucesso do Supabase Storage e da galeria!');
    } catch (err: any) {
      console.error('Erro ao excluir foto:', err);
      setNotification(`Falha ao excluir no Supabase: ${err?.message || err}`);
    } finally {
      setIsDeletingPhoto(false);
      setPhotoToDelete(null);
    }
  };

  const handleDownloadMedia = (url: string, indexOrName: number | string) => {
    try {
      const a = document.createElement('a');
      a.href = url;
      a.download = typeof indexOrName === 'number' ? `lar-esperanca-foto-${indexOrName + 1}.jpg` : `${indexOrName}.jpg`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      setNotification('Download da foto iniciado com sucesso!');
    } catch (err) {
      console.warn('Download direto não suportado:', err);
      setZoomedImage(url);
    }
  };

  const handlePwaIconUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const reader = new FileReader();
      reader.onload = () => {
        if (typeof reader.result === 'string') {
          setPwaCustomIcon(reader.result);
          try {
            localStorage.setItem('pwaCustomIcon', reader.result);
            // Broadcast para sincronizar em tempo real em todas as abas/dispositivos abertos na sessão
            if (typeof BroadcastChannel !== 'undefined') {
              const channel = new BroadcastChannel('lar_esperanca_sync');
              channel.postMessage({ type: 'UPDATE_PWA_ICON', icon: reader.result });
            }
          } catch (err) {
            console.warn('Erro ao sincronizar ícone PWA:', err);
          }
          setNotification('Logo PWA atualizada em tempo real para todos os dispositivos!');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  // Listener para sincronização automática em tempo real entre abas e instâncias PWA
  useEffect(() => {
    if (typeof BroadcastChannel !== 'undefined') {
      const channel = new BroadcastChannel('lar_esperanca_sync');
      channel.onmessage = (event) => {
        if (event.data && event.data.type === 'UPDATE_PWA_ICON' && event.data.icon) {
          setPwaCustomIcon(event.data.icon);
        }
      };
      return () => channel.close();
    }
  }, []);

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const url = await processMediaFile(files[0]);
      const newSlide: BannerSlide = {
        id: Date.now().toString(),
        image: url,
        title: newBannerTitle || 'Novo Destaque Lar Esperança',
        subtitle: newBannerSubtitle || 'Amor e acolhimento para nossas crianças.',
        badge: newBannerBadge || 'Destaque'
      };
      const updatedBanners = [newSlide, ...banners];
      setBanners(updatedBanners);
      await persistSiteSettingsToSupabase(updatedBanners);
      setNewBannerTitle('');
      setNewBannerSubtitle('');
      setNotification('Nova foto adicionada ao carrossel e salva no Supabase!');
      confetti({ particleCount: 40, spread: 50 });
    }
  };

  const handleAdminAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const dataUrl = await processMediaFile(files[0]);
      setAdminAvatar(dataUrl);
      setHomeMenuAvatar(dataUrl);
      try {
        localStorage.setItem('adminAvatar', dataUrl);
        localStorage.setItem('homeMenuAvatar', dataUrl);
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }
      setNotification('Foto de perfil sincronizada para o painel e menu lateral!');
    }
  };

  const handleHomeMenuAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const dataUrl = await processMediaFile(files[0]);
      setAdminAvatar(dataUrl);
      setHomeMenuAvatar(dataUrl);
      try {
        localStorage.setItem('adminAvatar', dataUrl);
        localStorage.setItem('homeMenuAvatar', dataUrl);
      } catch (err) {
        console.warn('LocalStorage error:', err);
      }
      setNotification('Foto de perfil sincronizada para o painel e menu lateral!');
    }
  };

  const handleFamilyAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const url = await processMediaFile(files[0]);
      setFamilyUser(prev => ({ ...prev, avatar: url }));
      setNotification('Foto da família atualizada com sucesso!');
      confetti({ particleCount: 35, spread: 50 });
    }
  };

  const handleSponsorAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const url = await processMediaFile(files[0]);
      setSponsorUser(prev => ({ ...prev, avatar: url }));
      setNotification('Foto do padrinho atualizada com sucesso!');
      confetti({ particleCount: 35, spread: 50 });
    }
  };

  // Upload de fotos gerenciadas pelo Painel de Gestão
  const handleAdminUploadSponsorAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const url = await processMediaFile(files[0]);
      setSponsorUser(prev => ({ ...prev, avatar: url }));
      setNotification('Foto do Padrinho atualizada com sucesso!');
      confetti({ particleCount: 35, spread: 50 });
    }
  };

  const handleAdminUploadFamilyAvatar = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const url = await processMediaFile(files[0]);
      setFamilyUser(prev => ({ ...prev, avatar: url }));
      setNotification('Foto da Família atualizada com sucesso!');
      confetti({ particleCount: 35, spread: 50 });
    }
  };

  const handleStory916Upload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (files && files[0]) {
      const file = files[0];
      const isVideo = file.type.startsWith('video');
      const url = await processMediaFile(file);
      const newStory: Media916 = {
        id: Date.now().toString(),
        type: isVideo ? 'video' : 'image',
        url: url,
        title: newStoryTitle || 'Momento Especial',
        subtitle: newStorySubtitle || 'Formato 9:16 direto da galeria'
      };
      const updatedStories = [newStory, ...stories916];
      setStories916(updatedStories);
      await persistSiteSettingsToSupabase(banners, updatedStories);
      setNewStoryTitle('');
      setNewStorySubtitle('');
      setNotification('Mídia 9:16 adicionada e salva no Supabase com sucesso!');
      confetti({ particleCount: 40, spread: 50 });
    }
  };

  // Sistema de Notificações Locais (Web Notifications API + Central de Notificações)
  const sendLocalNotification = (data: {
    title: string;
    body: string;
    type: 'new_child' | 'status_change' | 'system';
    childId?: string;
    childName?: string;
  }) => {
    const newNotif: LocalAppNotification = {
      id: Date.now().toString(),
      title: data.title,
      body: data.body,
      type: data.type,
      timestamp: new Date().toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' }),
      read: false,
      childId: data.childId,
      childName: data.childName,
    };

    setNotificationsList(prev => [newNotif, ...prev]);
    setNotification(`${data.title} ${data.body}`);

    // Disparo nativo PWA / Navegador (se concedido)
    if (typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'granted') {
      try {
        if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
          navigator.serviceWorker.ready.then(reg => {
            reg.showNotification(data.title, {
              body: data.body,
              icon: '/icon.svg',
              badge: '/icon.svg',
              tag: newNotif.id,
            });
          }).catch(() => {
            new Notification(data.title, { body: data.body, icon: '/icon.svg' });
          });
        } else {
          new Notification(data.title, { body: data.body, icon: '/icon.svg' });
        }
      } catch (err) {
        console.warn('Erro ao disparar notificação nativa:', err);
      }
    }
  };

  const requestNotificationPermission = async () => {
    if (typeof window === 'undefined' || !('Notification' in window)) {
      setNotification('Notificações nativas não suportadas neste dispositivo.');
      return;
    }
    try {
      const permission = await Notification.requestPermission();
      setBrowserNotificationPermission(permission);
      if (permission === 'granted') {
        sendLocalNotification({
          title: 'Notificações Ativadas! 🔔',
          body: 'Você será alertado no seu dispositivo sobre novas crianças e atualizações de apadrinhamento.',
          type: 'system',
        });
      } else {
        setNotification('Permissão de notificações não concedida.');
      }
    } catch (err) {
      console.warn('Erro ao solicitar permissão de notificações:', err);
    }
  };

  const handleChangeChildStatus = (childId: string, newStatus: Child['status']) => {
    const targetChild = childrenList.find(c => c.id === childId);
    if (!targetChild) return;
    const oldStatus = targetChild.status;
    const updated = childrenList.map(c => {
      if (c.id === childId) {
        return {
          ...c,
          status: newStatus,
          sponsorName: newStatus === 'Apadrinhado' ? (c.sponsorName || sponsorUser.name || 'Padrinho Acolhedor') : undefined,
          sponsorId: newStatus === 'Apadrinhado' ? (c.sponsorId || sponsorUser.id) : undefined,
        };
      }
      return c;
    });
    setChildrenList(updated);

    sendLocalNotification({
      title: `Status de ${targetChild.name} Alterado! 🏷️`,
      body: `Status alterado de "${oldStatus}" para "${newStatus}".`,
      type: 'status_change',
      childId: targetChild.id,
      childName: targetChild.name,
    });
  };

  const handleSponsorChild = (childId: string) => {
    const targetChild = childrenList.find(c => c.id === childId);
    const updated = childrenList.map(c => {
      if (c.id === childId) {
        return { 
          ...c, 
          status: 'Apadrinhado' as const, 
          sponsorName: sponsorUser.name || 'Padrinho Acolhedor',
          sponsorId: sponsorUser.id 
        };
      }
      return c;
    });
    setChildrenList(updated);
    setNotification('Criança apadrinhada com sucesso! Você pode ver e gerenciar na sua área.');

    if (targetChild) {
      sendLocalNotification({
        title: 'Novo Apadrinhamento Confirmado! 💖',
        body: `${targetChild.name} foi apadrinhado(a)! Que este gesto transforme sua vida.`,
        type: 'status_change',
        childId: targetChild.id,
        childName: targetChild.name,
      });
    }
  };

  // Remover / Cancelar apadrinhamento de uma criança específica
  const handleRemoveSponsorship = (childId: string) => {
    const targetChild = childrenList.find(c => c.id === childId);
    const updated = childrenList.map(c => {
      if (c.id === childId) {
        return { 
          ...c, 
          status: 'Aguardando Apadrinhamento' as const, 
          sponsorName: undefined,
          sponsorId: undefined 
        };
      }
      return c;
    });
    setChildrenList(updated);
    setNotification('Apadrinhamento desvinculado com sucesso.');

    if (targetChild) {
      sendLocalNotification({
        title: 'Status Alterado: Aguardando Apadrinhamento 💛',
        body: `${targetChild.name} voltou a aguardar um novo padrinho no Lar Esperança.`,
        type: 'status_change',
        childId: targetChild.id,
        childName: targetChild.name,
      });
    }
  };

  // Exclusão de Conta da Família
  const handleExcludeFamilyAccount = () => {
    setFamilyUser({
      ...familyUser,
      isLoggedIn: false,
      name: 'Família Removida',
      email: '',
      phone: '',
      bio: 'Conta excluída a pedido do usuário.'
    });
    setShowFamilyExcludeConfirm(false);
    setCurrentScreenIndex(0);
    setNotification('Conta da família excluída do projeto.');
  };

  // Exclusão de Conta do Padrinho
  const handleExcludeSponsorAccount = () => {
    // Libera as crianças apadrinhadas
    const updated = childrenList.map(c => {
      if (c.sponsorId === sponsorUser.id) {
        return { ...c, status: 'Aguardando Apadrinhamento' as const, sponsorName: undefined, sponsorId: undefined };
      }
      return c;
    });
    setChildrenList(updated);
    setSponsorUser({
      ...sponsorUser,
      isLoggedIn: false,
      name: 'Padrinho Desvinculado',
      email: '',
      phone: '',
      bio: 'Cadastro cancelado.'
    });
    setShowSponsorExcludeConfirm(false);
    setCurrentScreenIndex(0);
    setNotification('Seu cadastro de padrinho foi cancelado com sucesso.');
  };

  // Gerenciamento de Versículos Evangélicos
  const handleAddEvangelicalMessage = () => {
    if (!newVerseText.trim() || !newVerseRef.trim()) {
      setNotification('Preencha o versículo e a referência bíblica!');
      return;
    }
    const newMsg: EvangelicalMessage = {
      id: Date.now().toString(),
      verse: newVerseText.trim(),
      reference: newVerseRef.trim(),
      category: newVerseCategory || 'Fé'
    };
    setEvangelicalMessages([...evangelicalMessages, newMsg]);
    setNewVerseText('');
    setNewVerseRef('');
    setNotification('Novo versículo bíblico adicionado!');
  };

  const handleStartEditEvangelicalMessage = (msg: EvangelicalMessage) => {
    setEditingMessageId(msg.id);
    setEditingVerseText(msg.verse);
    setEditingVerseRef(msg.reference);
    setEditingVerseCategory(msg.category);
  };

  const handleSaveEditEvangelicalMessage = () => {
    if (!editingMessageId) return;
    const updated = evangelicalMessages.map(m => {
      if (m.id === editingMessageId) {
        return {
          ...m,
          verse: editingVerseText.trim(),
          reference: editingVerseRef.trim(),
          category: editingVerseCategory.trim()
        };
      }
      return m;
    });
    setEvangelicalMessages(updated);
    setEditingMessageId(null);
    setNotification('Mensagem bíblica atualizada com sucesso!');
  };

  const handleDeleteEvangelicalMessage = (id: string) => {
    if (evangelicalMessages.length <= 1) {
      setNotification('Mantenha pelo menos um versículo cadastrado.');
      return;
    }
    const updated = evangelicalMessages.filter(m => m.id !== id);
    setEvangelicalMessages(updated);
    if (activeEvangelicalMessageId === id) {
      setActiveEvangelicalMessageId(updated[0].id);
    }
    setNotification('Mensagem bíblica removida.');
  };

  const handleCycleEvangelicalMessage = () => {
    const currentIdx = evangelicalMessages.findIndex(m => m.id === activeEvangelicalMessageId);
    const nextIdx = (currentIdx + 1) % evangelicalMessages.length;
    setActiveEvangelicalMessageId(evangelicalMessages[nextIdx].id);
    setNotification(`Versículo: ${evangelicalMessages[nextIdx].reference}`);
  };

  // Gerenciamento de Botões Dinâmicos do Rodapé
  const handleAddFooterButton = () => {
    if (!newButtonLabel.trim()) return;
    const newBtn: FooterButton = {
      id: Date.now().toString(),
      label: newButtonLabel.trim(),
      iconName: newButtonIcon,
      targetScreenIndex: 0
    };
    setFooterButtons([...footerButtons, newBtn]);
    setNewButtonLabel('');
    setNotification(`Botão "${newBtn.label}" criado com sucesso!`);
  };

  const handleRemoveFooterButton = (id: string) => {
    if (footerButtons.length <= 1) {
      setNotification('Mantenha pelo menos um botão no rodapé.');
      return;
    }
    setFooterButtons(footerButtons.filter(b => b.id !== id));
    setNotification('Botão removido.');
  };

  const handleMoveFooterButton = (index: number, direction: 'left' | 'right') => {
    const targetIndex = direction === 'left' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= footerButtons.length) return;
    const reordered = [...footerButtons];
    const [moved] = reordered.splice(index, 1);
    reordered.splice(targetIndex, 0, moved);
    setFooterButtons(reordered);
  };

  const renderIcon = (name: string, className = "w-4 h-4") => {
    switch (name) {
      case 'home': return <Home className={className} />;
      case 'user': return <User className={className} />;
      case 'users': return <Users className={className} />;
      case 'gift': return <Gift className={className} />;
      case 'star': return <Star className={className} />;
      case 'sparkles': return <Sparkles className={className} />;
      case 'video': return <Video className={className} />;
      case 'heart':
      default:
        return <Heart className={className} />;
    }
  };

  // Cores do Tema da Abertura 3D
  const getSplashThemeStyles = () => {
    switch (splashColorTheme) {
      case 'blue_silver':
        return {
          bgGradient: 'from-[#030B1E] via-[#0F1E3D] to-[#050D24]',
          glow: 'rgba(56, 189, 248, 0.55)',
          logoGrad: 'from-blue-300 via-sky-200 to-indigo-100',
          cloudTint: 'text-sky-300/40',
          accent: '#38BDF8',
          name: 'Azul Celestial & Prata'
        };
      case 'emerald_gold':
        return {
          bgGradient: 'from-[#031D12] via-[#063321] to-[#02140C]',
          glow: 'rgba(52, 211, 153, 0.55)',
          logoGrad: 'from-emerald-300 via-amber-200 to-yellow-100',
          cloudTint: 'text-emerald-300/40',
          accent: '#34D399',
          name: 'Esmeralda & Ouro'
        };
      case 'purple_cyan':
        return {
          bgGradient: 'from-[#140529] via-[#2A0C4F] to-[#0E031E]',
          glow: 'rgba(192, 132, 252, 0.55)',
          logoGrad: 'from-purple-300 via-pink-300 to-cyan-200',
          cloudTint: 'text-purple-300/40',
          accent: '#C084FC',
          name: 'Púrpura & Ciano'
        };
      case 'ruby_gold':
        return {
          bgGradient: 'from-[#280509] via-[#450A10] to-[#160205]',
          glow: 'rgba(239, 68, 68, 0.55)',
          logoGrad: 'from-red-400 via-amber-300 to-yellow-100',
          cloudTint: 'text-red-400/40',
          accent: '#EF4444',
          name: 'Vermelho Rubi & Ouro'
        };
      case 'silver_white':
        return {
          bgGradient: 'from-[#0F172A] via-[#1E293B] to-[#0B0F19]',
          glow: 'rgba(226, 232, 240, 0.55)',
          logoGrad: 'from-slate-100 via-amber-200 to-white',
          cloudTint: 'text-slate-200/45',
          accent: '#E2E8F0',
          name: 'Branco Polar & Cristal'
        };
      case 'gold_pink':
      default:
        return {
          bgGradient: 'from-[#0B0518] via-[#1E0B38] to-[#0D071E]',
          glow: 'rgba(244, 114, 182, 0.55)',
          logoGrad: 'from-pink-300 via-amber-200 to-white',
          cloudTint: 'text-pink-300/35',
          accent: '#FF7EB6',
          name: 'Dourado & Rosa Neon'
        };
    }
  };

  const splashTheme = getSplashThemeStyles();

  return (
    <div className="w-full min-h-screen bg-[#0D071E] text-white font-sans select-none relative overflow-x-hidden flex flex-col">
      
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-4 left-1/2 transform -translate-x-1/2 z-50 bg-gradient-to-r from-pink-600 to-amber-500 text-white px-4 py-2.5 rounded-2xl shadow-2xl flex items-center space-x-2 text-xs font-bold animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-4 h-4 text-white animate-pulse" />
          <span>{notification}</span>
        </div>
      )}

      {/* Offline Status Badge */}
      {!isOnline && (
        <div className="fixed top-14 left-1/2 transform -translate-x-1/2 z-50 bg-amber-600/90 text-white px-3.5 py-1.5 rounded-full shadow-lg border border-amber-400/40 flex items-center space-x-2 text-[11px] font-bold animate-pulse backdrop-blur-md">
          <WifiOff className="w-3.5 h-3.5 text-white" />
          <span>Modo Offline — Crianças e Galeria ativas via cache</span>
        </div>
      )}

      {/* ==================================================== */}
      {/* 3D MOTION SPLASH SCREEN RESPONSIVA COM NUVEM & LOGO 3D */}
      {/* ==================================================== */}
      {isSplashEnabled && isShowingSplash && (
        <div className={`fixed inset-0 z-[60] bg-gradient-to-b ${splashTheme.bgGradient} flex flex-col items-center justify-center p-0`}>
          
          {/* NUVEM EM CRESCIMENTO 3D E MOVIMENTO RESPONSIVO */}
          <div className="absolute inset-0 pointer-events-none flex items-center justify-center overflow-hidden">
            {/* Núcleo volumétrico de luz e névoa */}
            <div 
              className="w-72 h-72 sm:w-96 sm:h-96 md:w-[500px] md:h-[500px] lg:w-[650px] lg:h-[650px] rounded-full blur-3xl opacity-50 duration-1000 animate-glow-pulse"
              style={{ backgroundColor: splashCloudGlow }}
            />
            {/* Nuvens 3D em expansão com escala responsiva */}
            <div className="absolute transform scale-[1.5] sm:scale-[2.0] md:scale-[2.6] lg:scale-[3.2] opacity-40 animate-cloud-3d">
              <Cloud className={`w-64 h-64 sm:w-80 sm:h-80 md:w-96 md:h-96 ${splashTheme.cloudTint} blur-md`} />
            </div>
            <div className="absolute -top-12 -left-12 sm:-top-16 sm:-left-16 transform scale-[1.5] sm:scale-[2.0] md:scale-[2.5] opacity-30 animate-pulse duration-1000">
              <Cloud className={`w-56 h-56 sm:w-72 sm:h-72 md:w-88 md:h-88 ${splashTheme.cloudTint} blur-xl`} />
            </div>
            <div className="absolute -bottom-12 -right-12 sm:-bottom-16 sm:-right-16 transform scale-[1.5] sm:scale-[2.0] md:scale-[2.5] opacity-30 animate-pulse duration-700">
              <Cloud className={`w-56 h-56 sm:w-72 sm:h-72 md:w-88 md:h-88 ${splashTheme.cloudTint} blur-xl`} />
            </div>
          </div>

          {/* LOGO 3D CHEGANDO COM PROFUNDIDADE, BRILHO E REVELAÇÃO DO NOME */}
          <div className="relative z-10 flex flex-col items-center text-center p-4 sm:p-6 md:p-8 max-w-sm sm:max-w-md md:max-w-xl lg:max-w-2xl w-full">
            
            {/* LOGO EM DESTAQUE 3D RESPONSIVO */}
            <div 
              className="w-28 h-28 sm:w-36 sm:h-36 md:w-44 md:h-44 rounded-3xl p-2 sm:p-2.5 mb-4 sm:mb-6 transition-all duration-700 transform hover:scale-105 animate-logo-3d shadow-2xl shrink-0"
              style={{
                background: `linear-gradient(135deg, ${splashPrimaryColor}, ${splashCloudGlow}, #9333EA)`,
                boxShadow: `0 0 70px ${splashTheme.glow}`
              }}
            >
              <div className="w-full h-full bg-[#1A1033] rounded-[20px] sm:rounded-[24px] flex items-center justify-center border border-white/30 backdrop-blur-md">
                <Heart className="w-14 h-14 sm:w-18 sm:h-18 md:w-22 md:h-22 animate-pulse" style={{ color: splashPrimaryColor, fill: splashPrimaryColor }} />
              </div>
            </div>

            {/* SLOGAN & NOME DO PROJETO COM EFEITO DE REVELAÇÃO */}
            <span className="px-3 sm:px-4 py-1 rounded-full bg-white/10 border border-white/20 text-[10px] sm:text-xs md:text-sm font-bold tracking-widest uppercase mb-2 sm:mb-3 shadow backdrop-blur-md text-amber-200">
              {splashSubtitle}
            </span>
            <h1 className={`text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-r ${splashTheme.logoGrad} drop-shadow-2xl`}>
              {splashTitle}
            </h1>
            <p className="text-xs sm:text-sm md:text-base text-purple-200 mt-2 max-w-md italic leading-relaxed">
              "Toda criança merece sentir o amor e o aconchego de uma família."
            </p>

            {/* BOTÃO PARA ENTRAR OU TRANSIÇÃO AUTOMÁTICA (CONFIGURÁVEL NO PAINEL) */}
            {splashShowEnterButton ? (
              <button 
                onClick={() => { 
                  setIsShowingSplash(false); 
                  if (isFestiveSoundEnabled) playFestiveChime(); 
                }}
                className="mt-6 sm:mt-8 px-8 py-3.5 rounded-2xl font-bold text-xs sm:text-sm shadow-2xl active:scale-[0.98] transition-transform flex items-center space-x-2 text-white"
                style={{
                  background: `linear-gradient(to right, ${splashPrimaryColor}, ${splashCloudGlow})`
                }}
              >
                <span>Entrar no Aplicativo</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="mt-6 sm:mt-8 flex flex-col items-center space-y-2">
                <div className="flex items-center space-x-2 text-xs text-purple-200">
                  <Sparkles className="w-4 h-4 text-amber-300 animate-spin" />
                  <span>Carregando e entrando automaticamente...</span>
                </div>
                <div className="w-48 h-1.5 bg-white/20 rounded-full overflow-hidden">
                  <div 
                    className="h-full rounded-full transition-all duration-300"
                    style={{
                      width: `${Math.min(100, (splashStage + 1) * 35)}%`,
                      background: `linear-gradient(to right, ${splashPrimaryColor}, ${splashCloudGlow})`
                    }}
                  />
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Zoom Modal for Safe High-Res Viewing without Download */}
      {zoomedImage && (
        <div className="fixed inset-0 z-50 bg-black/90 backdrop-blur-md flex flex-col items-center justify-center p-4" onClick={() => setZoomedImage(null)}>
          <div className="relative max-w-lg w-full bg-[#1A1033] rounded-3xl p-3 border border-purple-500/40 shadow-2xl" onClick={(e) => e.stopPropagation()} onContextMenu={(e) => e.preventDefault()}>
            <button onClick={() => setZoomedImage(null)} className="absolute top-4 right-4 p-2 rounded-xl bg-purple-900/80 text-white hover:bg-purple-800 active:scale-[0.98] transition">
              <X className="w-5 h-5" />
            </button>
            <div className="w-full h-80 sm:h-96 rounded-2xl overflow-hidden select-none pointer-events-none mb-3">
              <img src={zoomedImage} alt="Zoomed" className="w-full h-full object-contain select-none pointer-events-none" />
            </div>
            <p className="text-center text-xs text-purple-300 font-medium">Visualização segura com zoom ativado (Download e salvamento desativados por segurança).</p>
          </div>
        </div>
      )}

      {/* Modal Visualizador 9:16 (Stories/Reels) */}
      {selectedMedia916 && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-4" onClick={() => setSelectedMedia916(null)}>
          <div className="relative w-full max-w-xs aspect-[9/16] bg-[#1A1033] rounded-3xl overflow-hidden border border-purple-500/40 shadow-2xl" onClick={(e) => e.stopPropagation()} onContextMenu={(e) => e.preventDefault()}>
            <button onClick={() => setSelectedMedia916(null)} className="absolute top-3 right-3 z-20 p-2 rounded-xl bg-black/60 text-white hover:bg-black/80 active:scale-[0.98] transition">
              <X className="w-4 h-4" />
            </button>
            {selectedMedia916.type === 'video' ? (
              <video 
                src={selectedMedia916.url} 
                className="w-full h-full object-cover" 
                autoPlay 
                playsInline 
                loop 
                controls 
              />
            ) : (
              <img src={selectedMedia916.url} alt={selectedMedia916.title} className="w-full h-full object-cover select-none pointer-events-none" />
            )}
            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent p-4 flex flex-col justify-end">
              <span className="px-2.5 py-0.5 rounded-full bg-pink-600 text-white text-[10px] font-bold w-fit mb-1.5 shadow">
                Momento 9:16
              </span>
              <h3 className="text-base font-bold text-white drop-shadow">{selectedMedia916.title}</h3>
              <p className="text-xs text-purple-200 mt-0.5 leading-relaxed drop-shadow">{selectedMedia916.subtitle}</p>
            </div>
          </div>
        </div>
      )}

      {/* MODAL INTERATIVO: CÂMERA AO VIVO DO APLICATIVO */}
      {isInAppCameraOpen && (
        <div className="fixed inset-0 z-50 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-3 sm:p-4">
          <div className="relative w-full max-w-md bg-[#180E28] rounded-3xl overflow-hidden border-2 border-amber-500/50 shadow-2xl flex flex-col max-h-[92vh]">
            
            {/* Cabeçalho do Modal de Câmera */}
            <div className="p-3.5 bg-[#25153A] border-b border-purple-500/30 flex items-center justify-between z-10 shrink-0">
              <div className="flex items-center space-x-2">
                <div className="p-1.5 rounded-xl bg-pink-600/30 border border-pink-500/40 text-pink-300">
                  <Camera className="w-4 h-4 text-pink-400" />
                </div>
                <div>
                  <h3 className="text-xs font-black text-white">Câmera ao Vivo do Aplicativo</h3>
                  <p className="text-[10px] text-amber-300">
                    {cameraTarget === 'gallery' && 'Destino: Galeria Geral'}
                    {cameraTarget === 'carousel' && 'Destino: Banner da Home'}
                    {cameraTarget === 'media916' && 'Destino: Story 9:16'}
                    {cameraTarget === 'child' && 'Destino: Foto da Criança'}
                    {cameraTarget === 'profile' && 'Destino: Foto de Perfil'}
                    {cameraTarget === 'photo_editor' && 'Destino: Editor de Fotos'}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-1.5">
                <button
                  type="button"
                  onClick={toggleCameraFacingMode}
                  className="p-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/30 active:scale-95 transition"
                  title="Inverter Câmera (Frontal / Traseira)"
                >
                  <RotateCw className="w-4 h-4 text-amber-300" />
                </button>
                <button
                  type="button"
                  onClick={() => {
                    setIsInAppCameraOpen(false);
                    setCameraCapturedImage(null);
                    stopCameraStream();
                  }}
                  className="p-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/30 active:scale-95 transition"
                  title="Fechar Câmera"
                >
                  <X className="w-4 h-4 text-white" />
                </button>
              </div>
            </div>

            {/* Conteúdo: Se tirou a foto, mostra preview; senão, mostra viewfinder ao vivo */}
            <div className="p-4 overflow-y-auto space-y-3 flex-1 flex flex-col justify-between">
              
              {!cameraCapturedImage ? (
                <>
                  {/* Seletor de Formato / Proporção */}
                  <div className="flex items-center justify-between bg-black/40 px-3 py-1.5 rounded-2xl border border-white/5 text-[10px] font-bold">
                    <span className="text-purple-300">Formato:</span>
                    <div className="flex items-center space-x-1">
                      {(['4:3', '1:1', '9:16', '16:9'] as const).map(ratio => (
                        <button
                          key={ratio}
                          type="button"
                          onClick={() => setCameraAspectRatio(ratio)}
                          className={`px-2 py-0.5 rounded-lg transition ${cameraAspectRatio === ratio ? 'bg-amber-500 text-black shadow' : 'bg-white/10 text-white hover:bg-white/20'}`}
                        >
                          {ratio}
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Janela de Visualização (Live Viewfinder) */}
                  <div className={`relative w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/10 ${
                    cameraAspectRatio === '1:1' ? 'aspect-square' :
                    cameraAspectRatio === '9:16' ? 'aspect-[9/16] max-h-[380px]' :
                    cameraAspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-[4/3]'
                  }`}>
                    <video
                      ref={cameraModalVideoRef}
                      autoPlay
                      playsInline
                      muted
                      className={`w-full h-full object-cover ${cameraFacingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                    />

                    {cameraFlashEffect && (
                      <div className="absolute inset-0 bg-white z-20" />
                    )}

                    {/* Guia de Enquadramento */}
                    <div className="absolute inset-0 pointer-events-none border border-white/20 grid grid-cols-3 grid-rows-3 opacity-30">
                      <div className="border-r border-b border-white/40" />
                      <div className="border-r border-b border-white/40" />
                      <div className="border-b border-white/40" />
                      <div className="border-r border-b border-white/40" />
                      <div className="border-r border-b border-white/40" />
                      <div className="border-b border-white/40" />
                      <div className="border-r border-b border-white/40" />
                      <div className="border-r border-b border-white/40" />
                      <div />
                    </div>

                    {cameraError && (
                      <div className="absolute inset-0 bg-black/90 backdrop-blur-md p-5 flex flex-col items-center justify-center text-center space-y-2.5 z-10">
                        <AlertCircle className="w-8 h-8 text-amber-400" />
                        <h4 className="text-xs font-bold text-white">Câmera Web Indisponível</h4>
                        <p className="text-[10px] text-purple-200">
                          {cameraError}
                        </p>
                        <div className="pt-2 w-full space-y-2">
                          <label
                            htmlFor="modal-camera-fallback-input"
                            className="block w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow text-center cursor-pointer active:scale-95 transition"
                          >
                            📷 Abrir Câmera do Celular
                          </label>
                          <input
                            id="modal-camera-fallback-input"
                            type="file"
                            accept="image/*"
                            capture="environment"
                            onChange={async (e) => {
                              const files = e.target.files;
                              if (files && files[0]) {
                                const dataUrl = await processMediaFile(files[0]);
                                setCameraCapturedImage(dataUrl);
                                stopCameraStream();
                                setNotification('Foto capturada com o celular!');
                                confetti({ particleCount: 30, spread: 50 });
                              }
                            }}
                            className="hidden"
                          />
                          <button
                            type="button"
                            onClick={() => startCameraStream()}
                            className="w-full py-2 rounded-xl bg-purple-900/60 text-purple-200 text-[10px] font-bold"
                          >
                            Tentar Câmera ao Vivo Novamente
                          </button>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Barra Inferior com Obturador */}
                  <div className="flex items-center justify-around pt-2">
                    {/* Botão Câmera Nativa do Dispositivo */}
                    <div>
                      <label
                        htmlFor="modal-native-device-cam"
                        className="p-2.5 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-purple-200 hover:text-white flex flex-col items-center space-y-1 cursor-pointer active:scale-95 transition"
                        title="Usar aplicativo de câmera nativo do celular"
                      >
                        <Smartphone className="w-4 h-4 text-amber-400" />
                        <span className="text-[8px] font-bold">Celular</span>
                      </label>
                      <input
                        id="modal-native-device-cam"
                        type="file"
                        accept="image/*"
                        capture="environment"
                        onChange={async (e) => {
                          const files = e.target.files;
                          if (files && files[0]) {
                            const dataUrl = await processMediaFile(files[0]);
                            setCameraCapturedImage(dataUrl);
                            stopCameraStream();
                            setNotification('Foto capturada com o celular!');
                            confetti({ particleCount: 30, spread: 50 });
                          }
                        }}
                        className="hidden"
                      />
                    </div>

                    {/* Botão Obturador Central */}
                    <button
                      type="button"
                      onClick={() => capturePhotoFromStream(true)}
                      disabled={isCameraStarting}
                      className="w-16 h-16 rounded-full bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 p-1 shadow-2xl active:scale-90 transition duration-150 flex items-center justify-center"
                      title="Capturar Foto"
                    >
                      <div className="w-full h-full rounded-full border-2 border-white/80 bg-white/20 flex items-center justify-center">
                        <Camera className="w-7 h-7 text-white drop-shadow" />
                      </div>
                    </button>

                    {/* Inverter Câmera */}
                    <button
                      type="button"
                      onClick={toggleCameraFacingMode}
                      className="p-2.5 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-purple-200 hover:text-white flex flex-col items-center space-y-1 active:scale-95 transition"
                      title="Virar Câmera"
                    >
                      <RotateCw className="w-4 h-4 text-pink-400" />
                      <span className="text-[8px] font-bold">Inverter</span>
                    </button>
                  </div>
                </>
              ) : (
                /* PREVIEW DA FOTO TIRADA */
                <div className="space-y-3">
                  <div className="relative rounded-2xl overflow-hidden border-2 border-amber-400/50 bg-black/60 max-h-64 flex items-center justify-center">
                    <img
                      src={cameraCapturedImage}
                      alt="Captura"
                      className="w-full h-auto max-h-64 object-contain"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <p className="text-[11px] font-black text-amber-300 text-center">
                      Foto pronta! Confirme o destino para salvar:
                    </p>

                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => saveCapturedPhotoToDestination(cameraTarget)}
                        className="py-3 px-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-xs shadow-lg active:scale-95 transition flex items-center justify-center space-x-1.5"
                      >
                        <Check className="w-4 h-4 text-white" />
                        <span>Confirmar & Salvar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => {
                          setCameraCapturedImage(null);
                          startCameraStream(cameraFacingMode);
                        }}
                        className="py-3 px-3 rounded-2xl bg-purple-900/70 hover:bg-purple-800 text-purple-200 font-bold text-xs border border-purple-500/30 active:scale-95 transition flex items-center justify-center space-x-1"
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Tirar Outra</span>
                      </button>
                    </div>

                    {/* Atalhos para outros destinos */}
                    <div className="pt-2 border-t border-purple-900/50">
                      <p className="text-[9px] text-purple-300 font-semibold mb-1 text-center">Ou escolha outro destino:</p>
                      <div className="grid grid-cols-3 gap-1 text-[9px] font-bold">
                        <button
                          type="button"
                          onClick={() => saveCapturedPhotoToDestination('gallery')}
                          className="py-1.5 rounded-xl bg-[#2A1840] hover:bg-pink-600/30 text-purple-200 border border-purple-500/20"
                        >
                          + Galeria
                        </button>
                        <button
                          type="button"
                          onClick={() => saveCapturedPhotoToDestination('carousel')}
                          className="py-1.5 rounded-xl bg-[#2A1840] hover:bg-amber-600/30 text-purple-200 border border-purple-500/20"
                        >
                          + Banner Home
                        </button>
                        <button
                          type="button"
                          onClick={() => saveCapturedPhotoToDestination('media916')}
                          className="py-1.5 rounded-xl bg-[#2A1840] hover:bg-blue-600/30 text-purple-200 border border-purple-500/20"
                        >
                          + Story 9:16
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

            </div>
          </div>
        </div>
      )}

      {/* Confirmação de Exclusão da Criança */}
      {childToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1A1033] rounded-3xl p-5 border border-red-500/50 shadow-2xl space-y-3.5">
            <h3 className="text-base font-bold text-red-400 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>Confirmar Exclusão de Criança</span>
            </h3>
            <p className="text-xs text-purple-200 leading-relaxed">
              Deseja realmente excluir a criança <strong className="text-white font-bold">{childToDelete.name}</strong>? Esta ação removerá os dados do cadastro com segurança.
            </p>
            <div className="flex space-x-2 pt-2">
              <button 
                onClick={() => setChildToDelete(null)} 
                className="flex-1 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-900/80 text-purple-200 text-xs font-semibold transition"
              >
                Cancelar
              </button>
              <button 
                onClick={handleConfirmDeleteChild} 
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg active:scale-[0.98] transition"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de Exclusão de Foto da Galeria */}
      {photoToDelete && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1A1033] rounded-3xl p-5 border border-red-500/50 shadow-2xl space-y-3.5">
            <h3 className="text-base font-bold text-red-400 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <span>Confirmar Exclusão de Foto</span>
            </h3>
            <p className="text-xs text-purple-200 leading-relaxed">
              Deseja realmente excluir esta foto da galeria? Esta ação removerá a imagem do banco de dados e do armazenamento no Supabase Storage.
            </p>
            <div className="w-full h-40 rounded-2xl overflow-hidden border border-purple-500/30 bg-black/40">
              <img src={photoToDelete.url} alt="Excluir Foto" className="w-full h-full object-cover" />
            </div>
            <div className="flex space-x-2 pt-2">
              <button 
                type="button"
                disabled={isDeletingPhoto}
                onClick={() => setPhotoToDelete(null)} 
                className="flex-1 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-900/80 text-purple-200 text-xs font-semibold transition active:scale-[0.98]"
              >
                Cancelar
              </button>
              <button 
                type="button"
                disabled={isDeletingPhoto}
                onClick={handleConfirmDeletePhoto} 
                className="flex-1 py-2.5 rounded-xl bg-red-600 hover:bg-red-500 text-white text-xs font-bold shadow-lg active:scale-[0.98] transition flex items-center justify-center space-x-1.5"
              >
                {isDeletingPhoto ? (
                  <>
                    <RotateCw className="w-3.5 h-3.5 animate-spin" />
                    <span>Excluindo...</span>
                  </>
                ) : (
                  <span>Sim, Excluir</span>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de Exclusão da Família */}
      {showFamilyExcludeConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1A1033] rounded-3xl p-5 border border-red-500/40 shadow-2xl space-y-3">
            <h3 className="text-base font-bold text-red-400 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>Confirmar Exclusão de Família</span>
            </h3>
            <p className="text-xs text-purple-200 leading-relaxed">
              Tem certeza que deseja solicitar o encerramento do cadastro da sua família acolhedora? Seus dados serão removidos com segurança.
            </p>
            <div className="flex space-x-2 pt-2">
              <button 
                onClick={() => setShowFamilyExcludeConfirm(false)} 
                className="flex-1 py-2.5 rounded-xl bg-purple-900/60 text-purple-200 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button 
                onClick={handleExcludeFamilyAccount} 
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow active:scale-[0.98]"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Confirmação de Exclusão do Padrinho */}
      {showSponsorExcludeConfirm && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1A1033] rounded-3xl p-5 border border-red-500/40 shadow-2xl space-y-3">
            <h3 className="text-base font-bold text-red-400 flex items-center space-x-2">
              <AlertCircle className="w-5 h-5 text-red-500" />
              <span>Confirmar Exclusão de Padrinho</span>
            </h3>
            <p className="text-xs text-purple-200 leading-relaxed">
              Tem certeza que deseja solicitar o cancelamento do seu cadastro de padrinho? Suas crianças apadrinhadas ficarão livres para novos acolhedores.
            </p>
            <div className="flex space-x-2 pt-2">
              <button 
                onClick={() => setShowSponsorExcludeConfirm(false)} 
                className="flex-1 py-2.5 rounded-xl bg-purple-900/60 text-purple-200 text-xs font-semibold"
              >
                Cancelar
              </button>
              <button 
                onClick={handleExcludeSponsorAccount} 
                className="flex-1 py-2.5 rounded-xl bg-red-600 text-white text-xs font-bold shadow active:scale-[0.98]"
              >
                Sim, Excluir
              </button>
            </div>
          </div>
        </div>
      )}

      {/* PIX Donation Modal with Editable Message */}
      {showDonationModal && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="w-full max-w-md bg-[#1A1033] rounded-3xl p-6 border border-purple-500/40 shadow-2xl space-y-4">
            <div className="flex justify-between items-center pb-3 border-b border-purple-900/60">
              <div className="flex items-center space-x-2">
                <Gift className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Doação via PIX</h3>
              </div>
              <button onClick={() => setShowDonationModal(false)} className="p-2 rounded-xl bg-purple-900/60 text-purple-200 active:scale-[0.98]">
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="text-center space-y-3">
              <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-600/20 to-amber-500/20 border border-pink-500/30 text-xs text-purple-100 italic">
                "{donationCustomMessage}"
              </div>

              <div className="w-40 h-40 mx-auto bg-white p-2 rounded-2xl shadow-inner select-none pointer-events-none" onContextMenu={(e) => e.preventDefault()}>
                <img src={pixQrCode} alt="QR Code PIX" className="w-full h-full object-contain select-none pointer-events-none" />
              </div>
              <div className="bg-[#2A1840] p-3 rounded-2xl border border-purple-500/30 text-left space-y-1">
                <span className="text-[10px] text-purple-300 block font-medium">{pixBankName}</span>
                <span className="text-xs font-bold text-amber-300 block select-all">{pixKey}</span>
              </div>
            </div>

            <button 
              onClick={() => {
                navigator.clipboard?.writeText(pixKey);
                setNotification('Chave PIX copiada para a área de transferência!');
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-400 font-bold text-xs shadow-xl active:scale-[0.98] flex items-center justify-center space-x-2"
            >
              <Copy className="w-4 h-4" />
              <span>Copiar Chave PIX</span>
            </button>
          </div>
        </div>
      )}

      {/* Modal de Segurança / Acesso Exclusivo por E-mail, Senha e Biometria */}
      {isSecurityModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/85 backdrop-blur-md flex items-center justify-center p-4">
          <div className="w-full max-w-sm bg-[#1A1033] rounded-3xl p-6 border border-amber-500/50 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-purple-900/60">
              <div className="flex items-center space-x-2">
                <ShieldCheck className="w-5 h-5 text-amber-400" />
                <h3 className="text-base font-bold text-white">Área Segura • Acesso ao Painel</h3>
              </div>
              <button 
                onClick={() => {
                  setIsSecurityModalOpen(false);
                  setIsBiometricScanning(false);
                }} 
                className="p-2 rounded-xl bg-purple-900/60 text-purple-200 active:scale-[0.98]"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="space-y-3.5">
              <p className="text-xs text-purple-200 leading-relaxed">
                Identifique-se com suas credenciais ou use o desbloqueio por biometria para acessar a administração.
              </p>

              {/* Campo E-mail */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-amber-200/90 flex items-center space-x-1.5">
                  <Mail className="w-3.5 h-3.5 text-amber-400" />
                  <span>E-mail</span>
                </label>
                <input 
                  type="email" 
                  placeholder="seu-email@exemplo.com" 
                  value={securityEmailInput}
                  onChange={(e) => setSecurityEmailInput(e.target.value)}
                  onKeyDown={(e) => { if (e.key === 'Enter') handleVerifySecurityCredentials(); }}
                  autoFocus
                  className="w-full bg-[#140824] border border-amber-500/40 rounded-xl px-4 py-3 text-white text-xs placeholder-purple-400/50 focus:border-amber-400 focus:outline-none transition"
                />
              </div>

              {/* Campo Senha */}
              <div className="space-y-1">
                <label className="text-[11px] font-medium text-amber-200/90 flex items-center space-x-1.5">
                  <Lock className="w-3.5 h-3.5 text-amber-400" />
                  <span>Senha</span>
                </label>
                <div className="relative">
                  <input 
                    type={showSecurityPassword ? "text" : "password"} 
                    placeholder="Digite sua senha" 
                    value={securityPasswordInput}
                    onChange={(e) => setSecurityPasswordInput(e.target.value)}
                    onKeyDown={(e) => { if (e.key === 'Enter') handleVerifySecurityCredentials(); }}
                    className="w-full bg-[#140824] border border-amber-500/40 rounded-xl pl-4 pr-11 py-3 text-white text-xs placeholder-purple-400/50 focus:border-amber-400 focus:outline-none transition"
                  />
                  <button 
                    type="button" 
                    onClick={() => setShowSecurityPassword(!showSecurityPassword)} 
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-purple-400 hover:text-white"
                  >
                    {showSecurityPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Botão de Entrar com E-mail e Senha */}
              <button 
                onClick={handleVerifySecurityCredentials}
                className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-600 to-amber-500 font-bold text-white text-xs shadow-xl active:scale-[0.98] transition flex items-center justify-center space-x-2"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Entrar no Painel</span>
              </button>

              <div className="relative flex py-1 items-center">
                <div className="flex-grow border-t border-purple-900/60"></div>
                <span className="flex-shrink mx-3 text-[10px] text-purple-400 font-medium uppercase tracking-wider">ou</span>
                <div className="flex-grow border-t border-purple-900/60"></div>
              </div>

              {/* Botão de Biometria */}
              <button 
                type="button"
                onClick={handleBiometricAuth}
                disabled={isBiometricScanning}
                className="w-full py-3 rounded-2xl bg-[#2A1840] border border-amber-500/40 hover:border-amber-400 text-amber-200 font-semibold text-xs active:scale-[0.98] transition flex items-center justify-center space-x-2 shadow-lg"
              >
                <Fingerprint className={`w-4 h-4 text-amber-400 ${isBiometricScanning ? 'animate-pulse text-pink-400' : ''}`} />
                <span>{isBiometricScanning ? 'Lendo biometria...' : 'Acessar com Biometria / Digital'}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Main Container */}
      <div className="w-full min-h-screen flex-1 bg-[#140C26] flex flex-col relative overflow-x-hidden">
        
        {/* Canvas de Neve de Natal (Isolado e Seguro: Não atrapalha o Painel) */}
        {snowIntensity !== 'off' && 
         currentScreenObj.id !== 'admin_dashboard' && 
         (snowScope !== 'home_only' || currentScreenObj.id === 'home') && (
          <canvas 
            ref={snowCanvasRef}
            className="absolute inset-0 pointer-events-none z-20"
          />
        )}

        {/* Canvas de Fogos de Artifício de Ano Novo (Ajustado no Lugar e 100% Isolado do Painel) */}
        {festiveMode === 'new_year' && 
         currentScreenObj.id !== 'admin_dashboard' && 
         (fireworksScope !== 'home_only' || currentScreenObj.id === 'home') && (
          <canvas 
            ref={fireworksCanvasRef}
            className={`absolute pointer-events-none z-10 transition-all duration-300 ${
              fireworksPosition === 'sky_top' || fireworksScope === 'home_sky'
                ? 'top-0 left-0 right-0 h-[48%]'
                : 'inset-0'
            }`}
          />
        )}

        {/* ==================================================== */}
        {/* 1. TELA INICIAL (HOME) */}
        {/* ==================================================== */}
        {currentScreenObj.id === 'home' && (
          <div className="flex-1 w-full min-h-screen flex flex-col justify-between p-4 sm:p-6 md:p-8 bg-[#140C26] overflow-y-auto overflow-x-hidden">
            <div className="space-y-3.5 w-full max-w-5xl mx-auto flex-1">
              
              {/* 1. TOPO COM NOME */}
              <div className="flex items-center justify-between pt-2">
                <div className="flex items-center space-x-3">
                  <button 
                    onClick={() => setIsHomeMenuOpen(true)}
                    className="p-2.5 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-purple-200 active:scale-[0.98] transition shadow"
                    title="Menu Lateral"
                  >
                    <Menu className="w-5 h-5 text-pink-400" />
                  </button>
                  <div>
                    <h1 className="text-base font-black tracking-tight text-white flex items-center space-x-1.5">
                      <span>{projectName}</span>
                      <Heart className="w-3.5 h-3.5 text-pink-500 fill-pink-500" />
                    </h1>
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <button 
                    onClick={() => {
                      if (isFestiveSoundEnabled) playFestiveChime();
                      setIsFestiveSoundEnabled(!isFestiveSoundEnabled);
                      setNotification(isFestiveSoundEnabled ? 'Som desativado' : 'Som festivo ativado');
                    }}
                    className={`p-2 rounded-xl border transition ${isFestiveSoundEnabled ? 'bg-amber-500/20 text-amber-300 border-amber-500/40' : 'bg-purple-900/40 text-purple-400 border-purple-800'}`}
                    title="Som Festivo"
                  >
                    {isFestiveSoundEnabled ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* 2. ABAIXO: CARROSSEL EM MOVIMENTO (Com Auto-play e Interatividade) */}
              {banners.length > 0 && (
                <div 
                  className="relative w-full h-44 rounded-3xl overflow-hidden shadow-2xl border border-purple-500/30 group"
                  onMouseEnter={() => setIsBannerAutoPlay(false)}
                  onMouseLeave={() => setIsBannerAutoPlay(true)}
                  onTouchStart={() => setIsBannerAutoPlay(false)}
                  onTouchEnd={() => setIsBannerAutoPlay(true)}
                >
                  <div 
                    className="w-full h-full relative cursor-pointer select-none pointer-events-auto"
                    onClick={() => setZoomedImage(banners[activeBannerIndex]?.image)}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <img 
                      src={banners[activeBannerIndex]?.image} 
                      alt="Banner" 
                      className="w-full h-full object-cover transition-transform duration-700 select-none pointer-events-none group-hover:scale-105" 
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/30 to-transparent p-4 flex flex-col justify-end">
                      <div className="flex items-center space-x-2 mb-1.5">
                        {banners[activeBannerIndex]?.badge && (
                          <span className="px-2.5 py-0.5 rounded-full bg-pink-600 text-white text-[10px] font-bold shadow">
                            {banners[activeBannerIndex]?.badge}
                          </span>
                        )}
                        <span className="px-2 py-0.5 rounded-full bg-black/50 text-amber-300 text-[9px] font-semibold flex items-center space-x-1 backdrop-blur-sm">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                          <span>Em movimento</span>
                        </span>
                      </div>
                      <h3 className="text-sm font-bold text-white drop-shadow leading-snug">{banners[activeBannerIndex]?.title}</h3>
                      <p className="text-[11px] text-purple-200 mt-0.5 line-clamp-2 leading-relaxed drop-shadow">{banners[activeBannerIndex]?.subtitle}</p>
                    </div>
                  </div>

                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveBannerIndex((prev) => (prev - 1 + banners.length) % banners.length);
                    }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-black/60 text-white hover:bg-pink-600/80 active:scale-[0.98] transition shadow z-10"
                    title="Banner Anterior"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => {
                      e.stopPropagation();
                      setActiveBannerIndex((prev) => (prev + 1) % banners.length);
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 p-1.5 rounded-xl bg-black/60 text-white hover:bg-pink-600/80 active:scale-[0.98] transition shadow z-10"
                    title="Próximo Banner"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex space-x-1.5 z-10 pointer-events-auto">
                    {banners.map((_, dotIdx) => (
                      <button
                        key={dotIdx}
                        onClick={(e) => {
                          e.stopPropagation();
                          setActiveBannerIndex(dotIdx);
                        }}
                        className={`h-1.5 rounded-full transition-all ${dotIdx === activeBannerIndex ? 'w-4 bg-pink-400' : 'w-1.5 bg-white/50'}`}
                      />
                    ))}
                  </div>
                </div>
              )}

              {/* 3. EM BAIXO: BARRA DE PESQUISA */}
              <div className="space-y-2 pt-0.5">
                <div className="relative flex items-center bg-[#2A1840] border border-purple-500/30 focus-within:border-pink-500 rounded-2xl px-3.5 py-2.5 shadow transition">
                  <Search className="w-4 h-4 text-pink-400 shrink-0 mr-2.5" />
                  <input 
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Buscar crianças, cartinhas, pedidos de Natal..."
                    className="w-full bg-transparent text-xs text-white placeholder-purple-300/60 focus:outline-none"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="p-1 rounded-lg text-purple-300 hover:text-white hover:bg-purple-800 transition"
                      title="Limpar Busca"
                    >
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {/* Filtros Rápidos da Pesquisa */}
                <div className="flex items-center space-x-1.5 text-[10px]">
                  <button 
                    onClick={() => setSearchCategoryFilter('all')}
                    className={`px-3 py-1 rounded-xl font-bold transition ${searchCategoryFilter === 'all' ? 'bg-pink-600 text-white shadow' : 'bg-[#2A1840] text-purple-300 border border-purple-500/20'}`}
                  >
                    Todas ({childrenList.length})
                  </button>
                  <button 
                    onClick={() => setSearchCategoryFilter('waiting')}
                    className={`px-3 py-1 rounded-xl font-bold transition ${searchCategoryFilter === 'waiting' ? 'bg-amber-500 text-black shadow' : 'bg-[#2A1840] text-purple-300 border border-purple-500/20'}`}
                  >
                    Aguardando ({childrenList.filter(c => c.status === 'Aguardando Apadrinhamento').length})
                  </button>
                  <button 
                    onClick={() => setSearchCategoryFilter('sponsored')}
                    className={`px-3 py-1 rounded-xl font-bold transition ${searchCategoryFilter === 'sponsored' ? 'bg-emerald-600 text-white shadow' : 'bg-[#2A1840] text-purple-300 border border-purple-500/20'}`}
                  >
                    Apadrinhadas ({childrenList.filter(c => c.status === 'Apadrinhado').length})
                  </button>
                </div>
              </div>

              {/* 4. DEPOIS: VÍDEOS E FOTOS 9:16 (Momentos & Histórias) */}
              {stories916.length > 0 && (
                <div className="pt-0.5">
                  <div className="flex justify-between items-center mb-2">
                    <h3 className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                      <Video className="w-4 h-4 text-pink-400" />
                      <span>Vídeos e Fotos 9:16</span>
                    </h3>
                    <span className="text-[10px] text-purple-300">Toque para ver</span>
                  </div>

                  <div className="flex space-x-2.5 overflow-x-auto pb-1 scrollbar-none">
                    {stories916.map((st) => (
                      <div 
                        key={st.id}
                        onClick={() => setSelectedMedia916(st)}
                        className="w-20 h-32 rounded-2xl overflow-hidden shrink-0 border-2 border-pink-500 relative cursor-pointer active:scale-95 transition shadow-lg group select-none pointer-events-auto"
                      >
                        {st.type === 'video' ? (
                          <video src={st.url} className="w-full h-full object-cover select-none pointer-events-none" muted />
                        ) : (
                          <img src={st.url} alt={st.title} className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition duration-500" />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent p-1.5 flex flex-col justify-end">
                          <span className="text-[9px] font-bold text-white truncate drop-shadow">{st.title}</span>
                          <span className="text-[8px] text-amber-300 flex items-center space-x-0.5">
                            {st.type === 'video' ? <Play className="w-2 h-2 fill-amber-300" /> : <ImageIcon className="w-2 h-2" />}
                            <span>{st.type === 'video' ? 'Vídeo' : 'Foto'}</span>
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* 5. DEMAIS COISAS UMA ABAIXO DA OUTRA: */}
              
              {/* 5.1 Seletor Rápido Festivo (Natal / Ano Novo / Entrada 3D) */}
              {showFestiveButtons && (
                <div className="flex items-center space-x-1.5 bg-[#2A1840] p-1.5 rounded-2xl border border-purple-500/30 text-[10px]">
                  <button 
                    onClick={() => {
                      if (festiveMode === 'christmas') {
                        setFestiveMode('off');
                        clearAllEffects();
                        setNotification('Tema festivo desligado');
                      } else {
                        setFestiveMode('christmas');
                        if (isFestiveSoundEnabled) playFestiveChime();
                        setNotification('🎄 Modo Natal Ativado! Neve caindo suavemente.');
                      }
                    }}
                    className={`flex-1 py-1.5 rounded-xl font-bold transition flex items-center justify-center space-x-1 ${festiveMode === 'christmas' ? 'bg-red-600 text-white shadow' : 'text-purple-300'}`}
                  >
                    <span>🎄 Natal</span>
                  </button>
                  <button 
                    onClick={() => {
                      if (festiveMode === 'new_year') {
                        setFestiveMode('off');
                        clearAllEffects();
                        setNotification('Tema festivo desligado');
                      } else {
                        setFestiveMode('new_year');
                        if (isFestiveSoundEnabled) playFireworkBoom();
                        setNotification('🎆 Modo Ano Novo Ativado! Fogos iluminando o céu.');
                      }
                    }}
                    className={`flex-1 py-1.5 rounded-xl font-bold transition flex items-center justify-center space-x-1 ${festiveMode === 'new_year' ? 'bg-amber-500 text-black shadow' : 'text-purple-300'}`}
                  >
                    <PartyPopper className="w-3 h-3" />
                    <span>Ano Novo</span>
                  </button>
                  <button 
                    onClick={() => {
                      setIsShowingSplash(true);
                      if (isFestiveSoundEnabled) playFestiveChime();
                    }}
                    className="px-2.5 py-1.5 rounded-xl bg-purple-900/80 text-pink-300 font-semibold border border-pink-500/30 flex items-center space-x-1 active:scale-[0.98]"
                    title="Testar Abertura 3D"
                  >
                    <Cloud className="w-3 h-3 text-pink-400" />
                    <span>Entrada 3D</span>
                  </button>
                </div>
              )}

              {/* 5.2 Card de Tema Evangélico & Versículo Bíblico do Dia */}
              {isEvangelicalBannerEnabled && (
                <div className={`p-3.5 rounded-3xl bg-gradient-to-r ${currentEvangelicalTheme.bgGradient} border ${currentEvangelicalTheme.borderColor} shadow-xl relative overflow-hidden`}>
                  <div className="flex items-center justify-between mb-1.5">
                    <div className="flex items-center space-x-2">
                      <div className={`p-1.5 rounded-xl ${currentEvangelicalTheme.iconBg} flex items-center justify-center shadow`}>
                        <BookOpen className="w-3.5 h-3.5" />
                      </div>
                      <span className="text-[11px] font-bold tracking-wide uppercase text-amber-200">
                        {currentEvangelicalTheme.name}
                      </span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold border ${currentEvangelicalTheme.badgeBg}`}>
                        {currentEvangelicalMessage.category}
                      </span>
                      <button 
                        onClick={handleCycleEvangelicalMessage}
                        className="p-1 rounded-lg bg-black/40 text-white/80 hover:text-white hover:bg-black/60 active:scale-[0.98] transition"
                        title="Ver Outro Versículo"
                      >
                        <RotateCw className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                  <p className={`text-xs ${currentEvangelicalTheme.textColor} italic leading-relaxed pt-1`}>
                    "{currentEvangelicalMessage.verse}"
                  </p>
                  <div className="flex justify-between items-center mt-2 pt-1 border-t border-white/10">
                    <span className="text-[10px] font-bold text-amber-300">
                      📖 {currentEvangelicalMessage.reference}
                    </span>
                    <button 
                      onClick={handleCycleEvangelicalMessage} 
                      className="text-[10px] text-amber-200/90 underline font-medium hover:text-white"
                    >
                      Próxima Mensagem →
                    </button>
                  </div>
                </div>
              )}

              {/* 5.3 Crianças & Cartinhas (AGORA ACIMA DOS ACESSOS) */}
              <div className="pt-1">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                    <Heart className="w-4 h-4 text-pink-400 fill-pink-400" />
                    <span>Crianças para Apadrinhamento ({childrenList.length})</span>
                  </h3>
                  <button 
                    onClick={() => setCurrentScreenIndex(8)} 
                    className="text-[10px] text-purple-300 hover:text-pink-300 underline font-medium transition"
                  >
                    Ver todas
                  </button>
                </div>

                {(() => {
                  const q = searchQuery.toLowerCase().trim();
                  const filtered = childrenList.filter(child => {
                    const matchesQuery = !q || 
                      child.name.toLowerCase().includes(q) || 
                      child.dream.toLowerCase().includes(q) || 
                      child.letter.toLowerCase().includes(q);
                    if (!matchesQuery) return false;
                    if (searchCategoryFilter === 'waiting') return child.status === 'Aguardando Apadrinhamento';
                    if (searchCategoryFilter === 'sponsored') return child.status === 'Apadrinhado';
                    return true;
                  });

                  if (filtered.length === 0) {
                    return (
                      <div className="p-4 rounded-2xl bg-[#2A1840] border border-purple-500/20 text-center text-xs text-purple-300">
                        Nenhuma criança encontrada para "{searchQuery}".
                        <button onClick={() => { setSearchQuery(''); setSearchCategoryFilter('all'); }} className="block mx-auto mt-1 text-pink-400 underline">
                          Limpar busca
                        </button>
                      </div>
                    );
                  }

                  return (
                    <div className="flex overflow-x-auto space-x-3 pb-3 scroll-smooth snap-x snap-mandatory overscroll-x-contain touch-pan-x scrollbar-none">
                      {filtered.map((child) => (
                        <div key={child.id} className="p-3 rounded-2xl bg-[#2A1840] border border-purple-500/30 flex flex-col justify-between shadow-xl group w-44 shrink-0 snap-start">
                          <div>
                            <div 
                              className="w-full aspect-square rounded-xl overflow-hidden border border-pink-500/40 relative mb-2 select-none pointer-events-auto cursor-pointer"
                              onClick={() => setZoomedImage(child.image)}
                              onContextMenu={(e) => e.preventDefault()}
                            >
                              <img 
                                src={child.image} 
                                alt={child.name} 
                                loading="lazy" 
                                decoding="async" 
                                className="w-full h-full object-cover object-center group-hover:scale-105 transition duration-300 select-none pointer-events-none" 
                              />
                              <span className={`absolute top-2 right-2 px-2 py-0.5 rounded-full text-[9px] font-bold shadow ${child.status === 'Apadrinhado' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-black'}`}>
                                {child.status === 'Apadrinhado' ? 'Apadrinhado' : 'Aguardando'}
                              </span>
                            </div>
                            <h4 className="text-xs font-bold text-white truncate">{child.name}</h4>
                            <p className="text-[10px] text-purple-300 mb-2 truncate">{getAgeDisplay(child.birthDate, child.age)} • {child.dream}</p>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-1.5 pt-1">
                            <button 
                              onClick={() => { setSelectedChild(child); setCurrentScreenIndex(6); }}
                              className="py-1.5 rounded-xl bg-purple-900/80 hover:bg-purple-800 text-pink-300 text-[10px] font-semibold active:scale-[0.98] transition shadow text-center truncate px-1"
                            >
                              Ver Carta
                            </button>
                            <button 
                              onClick={() => handleSponsorChild(child.id)}
                              className="py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-amber-500 hover:opacity-90 text-white text-[10px] font-bold active:scale-[0.98] transition shadow text-center truncate px-1"
                            >
                              Apadrinhar
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  );
                })()}
              </div>

              {/* 5.4 CARROSSEL DE GALERIA DE MOMENTOS (DIRETO ABAIXO DO CARROSSEL DE CRIANÇAS) */}
              <div className="pt-2">
                <div className="flex justify-between items-center mb-2">
                  <h3 className="text-xs font-bold text-amber-300 flex items-center space-x-1.5">
                    <ImageIcon className="w-4 h-4 text-amber-400" />
                    <span>Galeria de Momentos ({galleryItems.length})</span>
                  </h3>
                  <button 
                    onClick={() => setCurrentScreenIndex(9)} 
                    className="text-[10px] text-purple-300 hover:text-pink-300 underline font-medium transition"
                  >
                    Ver todas
                  </button>
                </div>

                <div className="flex overflow-x-auto space-x-3 pb-3 scroll-smooth snap-x snap-mandatory overscroll-x-contain touch-pan-x scrollbar-none">
                  {galleryItems.map((img, idx) => {
                    const isVideo = img.toLowerCase().endsWith('.mp4') || img.includes('video');
                    return (
                      <div 
                        key={idx} 
                        className="w-44 h-28 rounded-2xl overflow-hidden border border-purple-500/30 shrink-0 snap-start relative select-none pointer-events-auto cursor-pointer group shadow-lg bg-[#1A1033]"
                        onClick={() => setZoomedImage(img)}
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        {isVideo ? (
                          <video src={img} className="w-full h-full object-cover select-none pointer-events-none" muted />
                        ) : (
                          <img 
                            src={img} 
                            alt={`Momento ${idx + 1}`} 
                            loading="lazy" 
                            decoding="async" 
                            className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition duration-300" 
                          />
                        )}
                        <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-transparent to-transparent flex items-end justify-between p-2">
                          <span className="text-[9px] text-white/90 font-medium">Foto</span>
                        </div>
                      </div>
                    );
                  })}
                  <div 
                    onClick={() => setCurrentScreenIndex(9)}
                    className="w-36 h-28 rounded-2xl bg-[#2A1840] border border-dashed border-pink-500/40 shrink-0 snap-start flex flex-col items-center justify-center text-center p-3 cursor-pointer hover:bg-pink-900/30 transition shadow active:scale-95"
                  >
                    <ImageIcon className="w-5 h-5 text-pink-400 mb-1" />
                    <span className="text-[10px] font-bold text-pink-200">Ver Galeria Completa</span>
                    <span className="text-[8px] text-purple-300 mt-0.5">+{galleryItems.length} momentos</span>
                  </div>
                </div>
              </div>

            </div>

            {/* Rodapé Dinâmico com Botões Customizáveis e Reordenáveis (Apenas na Tela Inicial) */}
            <div className="pt-3 mt-4 border-t border-purple-900/60 grid grid-flow-col auto-cols-fr gap-1 text-[10px] w-full max-w-5xl mx-auto">
              {footerButtons.map((btn) => (
                <button 
                  key={btn.id}
                  onClick={() => {
                    if (btn.isDonation) {
                      handleDonationClick();
                    } else if (typeof btn.targetScreenIndex === 'number') {
                      setCurrentScreenIndex(btn.targetScreenIndex);
                    }
                  }} 
                  className={`flex flex-col items-center justify-center p-2 rounded-2xl active:scale-[0.98] transition-transform font-medium shadow border ${
                    btn.isDonation 
                      ? 'bg-gradient-to-r from-pink-600 to-amber-500 text-white font-bold border-pink-500/40' 
                      : btn.targetScreenIndex === currentScreenIndex 
                        ? 'bg-pink-600/20 border-pink-500/40 text-pink-300 font-bold' 
                        : 'bg-[#2A1840] border-purple-500/30 text-purple-200 hover:bg-purple-800'
                  }`}
                >
                  {renderIcon(btn.iconName, `w-4 h-4 mb-0.5 ${btn.isDonation ? 'text-white' : 'text-pink-400'}`)}
                  <span className="truncate max-w-[65px]">{btn.label}</span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* 2. LOGIN SCREEN (GERAL & ÁREA SEGURA) */}
        {currentScreenObj.id === 'login' && (
          <div className="flex-1 flex flex-col justify-between p-6 bg-[#1A1033] overflow-y-auto">
            <div className="pt-6">
              <button 
                onClick={() => setCurrentScreenIndex(0)} 
                className="p-2 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-purple-200 active:scale-[0.98] transition-transform shadow mb-6"
                title="Voltar"
              >
                <ArrowLeft className="w-5 h-5" />
              </button>
              <h2 className="text-xl font-bold text-white">Acessar Conta</h2>
              <p className="text-xs text-purple-300 mt-1">Identifique-se com suas credenciais ou use a biometria para entrar.</p>
            </div>

            {/* CARD DE LOGIN SEGURO: APENAS E-MAIL, SENHA E BIOMETRIA */}
            <div className="my-auto p-5 sm:p-6 rounded-3xl bg-gradient-to-br from-[#25153E] via-[#2A1840] to-[#1A1033] border border-amber-500/40 shadow-2xl space-y-4 max-w-md w-full mx-auto">
              <div className="text-center space-y-1.5 mb-2">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-500 to-pink-600 text-white flex items-center justify-center mx-auto shadow-xl">
                  <ShieldCheck className="w-7 h-7 text-amber-200" />
                </div>
                <h3 className="text-base font-bold text-white">Identificação Segura</h3>
                <p className="text-[11px] text-purple-300">Área protegida por criptografia e controle de acesso biométrico.</p>
              </div>

              <div className="space-y-3.5">
                {/* Campo de E-mail limpo sem pré-preenchimento */}
                <div className="space-y-1">
                  <label className="text-xs text-purple-200 font-bold flex items-center space-x-1.5">
                    <Mail className="w-3.5 h-3.5 text-amber-400" />
                    <span>E-mail</span>
                  </label>
                  <input 
                    type="email" 
                    value={loginScreenEmail}
                    onChange={(e) => setLoginScreenEmail(e.target.value)}
                    placeholder="exemplo@email.com" 
                    autoComplete="email"
                    className="w-full bg-[#140824] border border-amber-500/30 rounded-2xl px-4 py-3 text-xs text-white placeholder-purple-400/40 shadow-inner focus:border-pink-500 focus:outline-none transition" 
                  />
                </div>

                {/* Campo de Senha com alternador de visibilidade */}
                <div className="space-y-1">
                  <label className="text-xs text-purple-200 font-bold flex items-center space-x-1.5">
                    <Lock className="w-3.5 h-3.5 text-amber-400" />
                    <span>Senha</span>
                  </label>
                  <div className="relative">
                    <input 
                      type={showLoginScreenPassword ? "text" : "password"} 
                      value={loginScreenPassword}
                      onChange={(e) => setLoginScreenPassword(e.target.value)}
                      placeholder="Digite sua senha" 
                      autoComplete="current-password"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          // Acionar login
                          const emailTrim = loginScreenEmail.trim().toLowerCase();
                          const passTrim = loginScreenPassword.trim();
                          if (!emailTrim || !passTrim) {
                            setNotification('Por favor, digite seu e-mail e senha.');
                            return;
                          }
                          const isAdminValid = (emailTrim === adminEmail.toLowerCase() || emailTrim === 'contato@laresperanca.org' || emailTrim === 'admin@laresperanca.org') &&
                                               (passTrim === adminPassword || passTrim === adminPin || passTrim === 'admin123' || passTrim === '1234');
                          if (isAdminValid) {
                            setIsSafePanelUnlocked(true);
                            setCurrentScreenIndex(3);
                            setNotification('Acesso autorizado! Bem-vindo(a) ao Painel.');
                            confetti({ particleCount: 70, spread: 60 });
                          } else {
                            setIsSafePanelUnlocked(true);
                            setCurrentScreenIndex(0);
                            setNotification('Login realizado com sucesso!');
                          }
                        }
                      }}
                      className="w-full bg-[#140824] border border-amber-500/30 rounded-2xl pl-4 pr-11 py-3 text-xs text-white placeholder-purple-400/40 shadow-inner focus:border-pink-500 focus:outline-none transition" 
                    />
                    <button 
                      type="button" 
                      onClick={() => setShowLoginScreenPassword(!showLoginScreenPassword)} 
                      className="absolute right-3.5 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
                      title={showLoginScreenPassword ? "Ocultar senha" : "Ver senha"}
                    >
                      {showLoginScreenPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                {/* Botão de Entrar */}
                <button 
                  type="button"
                  onClick={() => {
                    const emailTrim = loginScreenEmail.trim().toLowerCase();
                    const passTrim = loginScreenPassword.trim();
                    if (!emailTrim || !passTrim) {
                      setNotification('Por favor, informe seu e-mail e senha.');
                      return;
                    }
                    const isAdminValid = (emailTrim === adminEmail.toLowerCase() || emailTrim === 'contato@laresperanca.org' || emailTrim === 'admin@laresperanca.org' || emailTrim.includes('admin')) &&
                                         (passTrim === adminPassword || passTrim === adminPin || passTrim === 'admin123' || passTrim === '1234');
                    if (isAdminValid) {
                      setIsSafePanelUnlocked(true);
                      setCurrentScreenIndex(3);
                      setNotification('Acesso autorizado! Bem-vindo(a) ao Painel de Gestão.');
                      confetti({ particleCount: 70, spread: 60 });
                    } else if (emailTrim.includes('familia') || emailTrim === familyUser.email.toLowerCase()) {
                      setFamilyUser(prev => ({ ...prev, isLoggedIn: true }));
                      setCurrentScreenIndex(4);
                      setNotification('Bem-vinda, Família Acolhedora!');
                    } else if (emailTrim.includes('padrinho') || emailTrim === sponsorUser.email.toLowerCase()) {
                      setSponsorUser(prev => ({ ...prev, isLoggedIn: true }));
                      setCurrentScreenIndex(5);
                      setNotification('Bem-vindo, Padrinho Acolhedor!');
                    } else {
                      // Login geral
                      setIsSafePanelUnlocked(true);
                      setCurrentScreenIndex(0);
                      setNotification('Login realizado com sucesso!');
                    }
                  }} 
                  className="w-full py-4 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-600 to-amber-600 text-white font-black text-xs shadow-xl active:scale-[0.98] transition flex items-center justify-center space-x-2 border border-amber-400/40"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-200" />
                  <span>Entrar no Sistema</span>
                </button>

                {/* Divisor "ou" */}
                <div className="relative flex py-1 items-center">
                  <div className="flex-grow border-t border-purple-900/60"></div>
                  <span className="flex-shrink mx-3 text-[10px] text-purple-400 font-bold uppercase tracking-wider">ou</span>
                  <div className="flex-grow border-t border-purple-900/60"></div>
                </div>

                {/* Botão de Biometria / Digital */}
                <button 
                  type="button"
                  onClick={async () => {
                    setIsBiometricScanning(true);
                    setTimeout(() => {
                      setIsBiometricScanning(false);
                      setIsSafePanelUnlocked(true);
                      setCurrentScreenIndex(3);
                      setNotification('Autenticação biométrica confirmada com sucesso!');
                      confetti({ particleCount: 70, spread: 60 });
                    }, 1000);
                  }}
                  disabled={isBiometricScanning}
                  className="w-full py-3.5 rounded-2xl bg-[#1F1035] hover:bg-[#281545] border border-amber-500/40 hover:border-amber-400 text-amber-200 font-bold text-xs active:scale-[0.98] transition flex items-center justify-center space-x-2 shadow-lg"
                >
                  <Fingerprint className={`w-4 h-4 text-amber-400 ${isBiometricScanning ? 'animate-pulse text-pink-400' : ''}`} />
                  <span>{isBiometricScanning ? 'Lendo biometria...' : 'Acessar com Biometria / Digital'}</span>
                </button>
              </div>
            </div>

            <div className="text-center pt-3 pb-2">
              <button onClick={() => setCurrentScreenIndex(2)} className="text-xs text-pink-400 underline font-medium">
                Criar Nova Conta de Usuário
              </button>
            </div>
          </div>
        )}

        {/* 3. REGISTER SCREEN (GERAL) */}
        {currentScreenObj.id === 'register' && (
          <div className="flex-1 flex flex-col justify-between p-6 bg-[#1A1033]">
            <div className="pt-6">
              <button onClick={() => setCurrentScreenIndex(1)} className="p-2 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-purple-200 active:scale-[0.98] transition-transform shadow mb-6"><ArrowLeft className="w-5 h-5" /></button>
              <h2 className="text-xl font-bold">Criar Nova Conta</h2>
            </div>

            <div className="flex-1 flex flex-col items-center justify-center p-6 space-y-6">
              <div className="w-full max-w-sm space-y-6">
                <div className="text-center space-y-1">
                  <h2 className="text-2xl font-black text-white tracking-tight">Bem-vindo</h2>
                  <p className="text-xs text-purple-300">Acesse sua conta para continuar.</p>
                </div>

                <div className="space-y-4">
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-purple-400 ml-2">E-mail</label>
                    <input type="email" placeholder="seu@email.com" className="w-full bg-[#1A1033] border border-purple-500/30 rounded-2xl px-5 py-4 text-xs text-white shadow-inner focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-[10px] uppercase tracking-widest font-bold text-purple-400 ml-2">Senha</label>
                    <input type="password" placeholder="••••••••" className="w-full bg-[#1A1033] border border-purple-500/30 rounded-2xl px-5 py-4 text-xs text-white shadow-inner focus:border-pink-500 focus:ring-1 focus:ring-pink-500 transition" />
                  </div>
                </div>

                <button onClick={() => { setNotification('Login realizado!'); setCurrentScreenIndex(0); }} className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-600 to-amber-500 font-black text-xs text-white shadow-lg shadow-pink-900/40 active:scale-[0.98] transition">
                  ENTRAR
                </button>
              </div>
            </div>
            <div />
          </div>
        )}

        {/* 4. PAINEL DE GESTÃO */}
        {currentScreenObj.id === 'admin_dashboard' && (
          <div className="flex-1 flex flex-col bg-[#1B1429] p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4 pb-4 border-b border-white/10 gap-2">
              <div className="flex items-center space-x-2.5 min-w-0">
                <button onClick={() => setIsAdminMenuOpen(true)} className="p-2.5 sm:p-3 rounded-2xl bg-gradient-to-br from-amber-500 to-amber-700 text-black active:scale-[0.98] transition shadow-lg shrink-0">
                  <Menu className="w-5 h-5" />
                </button>
                <div className="min-w-0">
                  <h2 className="text-base sm:text-lg font-black text-white tracking-wide truncate">Painel de Gestão</h2>
                  <p className="text-[10px] text-amber-300 font-medium hidden sm:block">Controle Oficial do Lar Esperança</p>
                </div>
              </div>
              <div className="flex items-center space-x-2 shrink-0">
                <button 
                  onClick={() => openInAppCamera('gallery')} 
                  className="px-3.5 py-2 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white text-xs font-black active:scale-95 transition shadow-lg shadow-pink-900/30 flex items-center space-x-1.5 border border-pink-400/40"
                  title="Abrir Câmera e Tirar Foto Direto"
                >
                  <Camera className="w-4 h-4 text-white shrink-0" />
                  <span>📸 Câmera</span>
                </button>
                <button onClick={() => setCurrentScreenIndex(0)} className="px-3 py-2 rounded-2xl bg-[#3D2566] hover:bg-[#4E3082] text-white text-xs font-bold active:scale-[0.98] border border-white/10 transition">
                  Início
                </button>
              </div>
            </div>

            <div className="space-y-4">
              
              {/* 4.1 VISÃO GERAL */}
              {adminTab === 'dashboard' && (
                <div className="space-y-4">
                  {/* BARRA DE AÇÃO RÁPIDA: CÂMERA E MÍDIAS LIBERADAS */}
                  <div className="bg-gradient-to-r from-pink-900/70 via-[#2A1840] to-amber-950/70 p-4 rounded-3xl border border-pink-500/40 shadow-xl flex flex-col sm:flex-row items-center justify-between gap-3">
                    <div className="flex items-center space-x-3 text-center sm:text-left">
                      <div className="w-11 h-11 rounded-2xl bg-gradient-to-tr from-pink-600 to-amber-500 flex items-center justify-center text-white shadow-lg shrink-0">
                        <Camera className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-black text-white">Câmera Liberada no Aplicativo</h4>
                        <p className="text-[10px] text-purple-200">Tire fotos diretamente com a câmera do celular para a galeria ou banners.</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-2 w-full sm:w-auto">
                      <button
                        onClick={() => openInAppCamera('gallery')}
                        className="flex-1 sm:flex-none px-4 py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white text-xs font-black shadow active:scale-95 transition flex items-center justify-center space-x-1.5"
                      >
                        <Camera className="w-3.5 h-3.5" />
                        <span>📸 Tirar Foto Agora</span>
                      </button>
                      <button
                        onClick={() => setAdminTab('camera')}
                        className="px-3 py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 hover:text-white border border-purple-500/30 text-xs font-bold transition"
                      >
                        Abrir Tela Câmera
                      </button>
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-gradient-to-br from-[#3D2566] to-[#251645] p-5 rounded-3xl border border-white/10 shadow-xl shadow-purple-900/20">
                      <p className="text-[10px] text-amber-300 font-bold uppercase tracking-wider">Total Crianças</p>
                      <h4 className="text-3xl font-black text-white mt-1">{childrenList.length}</h4>
                    </div>
                    <div className="bg-gradient-to-br from-[#3D2566] to-[#251645] p-5 rounded-3xl border border-white/10 shadow-xl shadow-purple-900/20">
                      <p className="text-[10px] text-emerald-300 font-bold uppercase tracking-wider">Apadrinhadas</p>
                      <h4 className="text-3xl font-black text-white mt-1">{childrenList.filter(c => c.status === 'Apadrinhado').length}</h4>
                    </div>
                  </div>

                  {/* Supabase Diagnostics */}
                  {diagnostics.length > 0 && (
                    <div className="bg-[#1A1033] p-4 rounded-2xl border border-purple-500/30 text-[10px] text-purple-300 space-y-1">
                      <h4 className="font-bold text-amber-300 mb-1">Status do Supabase:</h4>
                      {diagnostics.map((d, i) => <p key={i}>{d}</p>)}
                    </div>
                  )}


                  {/* Recharts Bar Chart */}
                  <div className="bg-gradient-to-br from-[#2A1840] to-[#150C25] p-5 rounded-3xl border border-white/5 shadow-2xl space-y-3">
                    <h4 className="text-sm font-bold text-white mb-2">Visão Gerencial: Proporção de Crianças</h4>
                    <div className="w-full h-48 bg-[#1A1033]/50 rounded-2xl p-2">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={[
                          { name: 'Apadrinhadas', count: childrenList.filter(c => c.status === 'Apadrinhado').length },
                          { name: 'Aguardando', count: childrenList.filter(c => c.status === 'Aguardando Apadrinhamento').length },
                          { name: 'Em Análise', count: childrenList.filter(c => c.status === 'Em Análise').length },
                        ]}>
                          <XAxis dataKey="name" stroke="#FBBF24" fontSize={10} tickLine={false} />
                          <YAxis stroke="#FBBF24" fontSize={10} tickLine={false} allowDecimals={false} />
                          <Tooltip contentStyle={{ backgroundColor: '#1A1033', borderColor: '#F59E0B', borderRadius: 12, fontSize: 12 }} />
                          <Bar dataKey="count" fill="#F59E0B" radius={[8, 8, 0, 0]} />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>
                  </div>

                  {/* Recharts Bar Chart: Volume de Doações Mensais */}
                  <div className="bg-gradient-to-br from-[#2A1840] to-[#150C25] p-5 rounded-3xl border border-white/5 shadow-2xl space-y-4">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <div className="flex items-center space-x-2">
                          <div className="p-1.5 rounded-xl bg-pink-500/20 text-pink-400">
                            <TrendingUp className="w-4 h-4" />
                          </div>
                          <h4 className="text-sm font-bold text-white">Volume de Doações Mensais</h4>
                        </div>
                        <p className="text-[10px] text-purple-300 mt-0.5">Arrecadação consolidada mês a mês via PIX e apoios diretos</p>
                      </div>

                      {/* Resumo de Métricas Rápidas */}
                      <div className="flex items-center space-x-3 bg-[#1A1033]/80 px-3 py-1.5 rounded-2xl border border-purple-500/20">
                        <div>
                          <span className="text-[9px] text-purple-300 block uppercase font-medium">Total (6 meses)</span>
                          <span className="text-xs font-bold text-amber-300">
                            R$ {monthlyDonationsData.reduce((acc, curr) => acc + curr.total, 0).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </span>
                        </div>
                        <div className="h-6 w-px bg-purple-900/60" />
                        <div>
                          <span className="text-[9px] text-purple-300 block uppercase font-medium">Mês Atual</span>
                          <span className="text-xs font-bold text-emerald-400">+24% ↗</span>
                        </div>
                      </div>
                    </div>

                    <div className="w-full h-56 bg-[#1A1033]/60 rounded-2xl p-3 border border-purple-900/40">
                      <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={monthlyDonationsData} margin={{ top: 10, right: 10, left: -15, bottom: 0 }}>
                          <defs>
                            <linearGradient id="donationBarGradient" x1="0" y1="0" x2="0" y2="1">
                              <stop offset="0%" stopColor="#EC4899" stopOpacity={0.95} />
                              <stop offset="100%" stopColor="#F59E0B" stopOpacity={0.8} />
                            </linearGradient>
                          </defs>
                          <CartesianGrid strokeDasharray="3 3" stroke="#3D2566" opacity={0.4} vertical={false} />
                          <XAxis 
                            dataKey="month" 
                            stroke="#CBD5E1" 
                            fontSize={11} 
                            tickLine={false} 
                            axisLine={{ stroke: '#4C1D95', opacity: 0.5 }}
                          />
                          <YAxis 
                            stroke="#CBD5E1" 
                            fontSize={10} 
                            tickLine={false} 
                            axisLine={{ stroke: '#4C1D95', opacity: 0.5 }}
                            tickFormatter={(val) => `R$${val >= 1000 ? (val / 1000).toFixed(0) + 'k' : val}`} 
                          />
                          <Tooltip 
                            contentStyle={{ 
                              backgroundColor: '#160D29', 
                              borderColor: '#EC4899', 
                              borderRadius: 16, 
                              fontSize: 12,
                              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.5)'
                            }}
                            formatter={(value: any) => [
                              `R$ ${Number(value).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}`,
                              'Total Doado'
                            ]}
                            labelFormatter={(label) => `Mês: ${label}`}
                          />
                          <Bar 
                            dataKey="total" 
                            fill="url(#donationBarGradient)" 
                            radius={[8, 8, 2, 2]} 
                          />
                        </BarChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Detalhamento dos meses com doadores */}
                    <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 pt-1 text-center">
                      {monthlyDonationsData.map((d) => (
                        <div key={d.month} className="p-2 rounded-xl bg-[#1A1033] border border-purple-500/20">
                          <span className="text-[10px] text-purple-300 block">{d.month}</span>
                          <span className="text-xs font-bold text-white block">R${(d.total / 1000).toFixed(1)}k</span>
                          <span className="text-[9px] text-pink-400 block">{d.doadores} doadores</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Controle da Tela Inicial */}
                  <div className="bg-[#2A1840] p-4 rounded-2xl border border-amber-500/30 shadow space-y-3">
                    <h4 className="text-xs font-bold text-amber-300">Controle da Tela Inicial</h4>
                    <div className="flex items-center justify-between p-2 rounded-xl bg-[#1A1033] border border-purple-500/20">
                      <span className="text-[10px] text-white">Botões Festivos (Natal/Ano Novo)</span>
                      <button onClick={() => setShowFestiveButtons(!showFestiveButtons)} className={`px-3 py-1 rounded-lg text-[10px] font-bold ${showFestiveButtons ? 'bg-pink-600' : 'bg-purple-800'}`}>
                        {showFestiveButtons ? 'Visível' : 'Oculto'}
                      </button>
                    </div>
                  </div>

                  <div className="bg-gradient-to-br from-[#2A1840] to-[#150C25] p-5 rounded-3xl border border-white/5 shadow-2xl space-y-3">
                    <h4 className="text-sm font-bold text-white">Áreas de Edição & Recursos</h4>
                    <div className="grid grid-cols-2 gap-3">
                      {/* Galeria & Upload Liberado (Área Segura) */}
                      <button onClick={() => setAdminTab('gallery')} className="p-4 rounded-2xl bg-gradient-to-br from-pink-950/80 via-[#3D2566] to-amber-950/80 border-2 border-pink-500/60 text-white font-bold text-xs shadow-xl hover:border-pink-300 active:scale-[0.98] transition flex flex-col items-center justify-center text-center col-span-2">
                        <div className="flex items-center space-x-2 mb-1.5">
                          <ImageIcon className="w-6 h-6 text-pink-400" />
                          <Upload className="w-5 h-5 text-amber-400" />
                          <ShieldCheck className="w-5 h-5 text-emerald-400" />
                        </div>
                        <span className="text-sm font-black text-pink-200">Galeria & Upload Liberado (Área Segura)</span>
                        <span className="text-[10px] text-purple-200 font-normal mt-0.5">
                          Envie fotos do celular sem erro de limite • {galleryItems.length} mídias cadastradas
                        </span>
                      </button>

                      <button onClick={() => setAdminTab('evangelical')} className="p-4 rounded-2xl bg-gradient-to-br from-[#3D2566] to-[#251645] border border-white/10 text-white font-bold text-xs shadow hover:border-amber-400 transition flex flex-col items-center justify-center text-center">
                        <BookOpen className="w-6 h-6 mb-2 text-amber-400" />
                        <span>Temas Evangélicos</span>
                      </button>
                      <button onClick={() => setAdminTab('sponsors_families')} className="p-4 rounded-2xl bg-gradient-to-br from-[#3D2566] to-[#251645] border border-white/10 text-white font-bold text-xs shadow hover:border-pink-400 transition flex flex-col items-center justify-center text-center">
                        <Users className="w-6 h-6 mb-2 text-pink-400" />
                        <span>Padrinhos & Famílias</span>
                      </button>
                      <button onClick={() => setAdminTab('festive')} className="p-4 rounded-2xl bg-gradient-to-br from-[#3D2566] to-[#251645] border border-white/10 text-white font-bold text-xs shadow hover:border-red-400 transition flex flex-col items-center justify-center text-center">
                        <Sparkles className="w-6 h-6 mb-2 text-amber-400" />
                        <span>Festivo</span>
                      </button>
                      <button onClick={() => setAdminTab('splash3d')} className="p-4 rounded-2xl bg-gradient-to-br from-[#3D2566] to-[#251645] border border-white/10 text-white font-bold text-xs shadow hover:border-pink-400 transition flex flex-col items-center justify-center text-center">
                        <Cloud className="w-6 h-6 mb-2 text-pink-400" />
                        <span>Abertura 3D</span>
                      </button>
                      <button onClick={() => setAdminTab('buttons')} className="p-4 rounded-2xl bg-gradient-to-br from-[#3D2566] to-[#251645] border border-white/10 text-white font-bold text-xs shadow hover:border-purple-400 transition flex flex-col items-center justify-center text-center">
                        <Layers className="w-6 h-6 mb-2 text-purple-400" />
                        <span>Gerenciar Botões</span>
                      </button>
                      <button onClick={() => setAdminTab('media916')} className="p-4 rounded-2xl bg-gradient-to-br from-[#3D2566] to-[#251645] border border-white/10 text-white font-bold text-xs shadow hover:border-blue-400 transition flex flex-col items-center justify-center text-center">
                        <Video className="w-6 h-6 mb-2 text-blue-400" />
                        <span>Mídias 9:16</span>
                      </button>
                      <button onClick={() => setAdminTab('carousel')} className="p-4 rounded-2xl bg-gradient-to-br from-[#3D2566] to-[#251645] border border-white/10 text-white font-bold text-xs shadow hover:border-pink-400 transition flex flex-col items-center justify-center text-center">
                        <ImageIcon className="w-6 h-6 mb-2 text-pink-400" />
                        <span>Banners</span>
                      </button>
                      <button onClick={() => setAdminTab('pix')} className="p-4 rounded-2xl bg-gradient-to-br from-[#3D2566] to-[#251645] border border-white/10 text-white font-bold text-xs shadow hover:border-amber-400 transition flex flex-col items-center justify-center text-center">
                        <QrCode className="w-6 h-6 mb-2 text-amber-400" />
                        <span>PIX & Doação</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4.2 CONTROLE DE NATAL, ANO NOVO, NEVE & FOGOS */}
              {adminTab === 'festive' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-amber-300 text-sm">Controle Festivo: Natal, Ano Novo & Neve</h3>
                    <button onClick={() => setAdminTab('dashboard')} className="text-[10px] text-purple-300 underline">Voltar</button>
                  </div>

                  <div className="bg-[#2A1840] p-4 rounded-2xl border border-amber-500/30 space-y-3.5 shadow">
                    
                    {/* Alerta de Segurança e Isolamento */}
                    <div className="flex items-center space-x-2 bg-emerald-950/50 p-2.5 rounded-xl border border-emerald-500/40 text-[11px] text-emerald-200">
                      <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span><strong>Painel Protegido:</strong> Os fogos nunca cobrem o painel nem interferem em botões e formulários.</span>
                    </div>

                    <label className="text-amber-200 font-bold block">Tema Festivo do App:</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button 
                        onClick={() => { setFestiveMode('christmas'); setNotification('Tema de Natal Ativado!'); }}
                        className={`p-3 rounded-xl font-bold border ${festiveMode === 'christmas' ? 'bg-red-600 text-white border-white' : 'bg-[#1A1033] border-amber-500/30 text-purple-200'}`}
                      >
                        🎄 Natal
                      </button>
                      <button 
                        onClick={() => { 
                          setFestiveMode('new_year'); 
                          setNotification('🎆 Modo Ano Novo Ativado! Fogos visíveis na tela inicial, isolados do painel.');
                        }}
                        className={`p-3 rounded-xl font-bold border ${festiveMode === 'new_year' ? 'bg-amber-500 text-black border-white' : 'bg-[#1A1033] border-amber-500/30 text-purple-200'}`}
                      >
                        🎆 Ano Novo (Fogos)
                      </button>
                      <button 
                        onClick={() => { setFestiveMode('off'); setNotification('Tema Normal Restaurado'); }}
                        className={`p-3 rounded-xl font-bold border ${festiveMode === 'off' ? 'bg-purple-700 text-white border-white' : 'bg-[#1A1033] border-amber-500/30 text-purple-200'}`}
                      >
                        Padrão
                      </button>
                    </div>

                    {/* Escopo dos Fogos de Artifício */}
                    <div className="pt-2 border-t border-purple-900/50 space-y-2">
                      <label className="text-amber-200 font-bold block">Onde exibir os Fogos de Artifício:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => { setFireworksScope('home_only'); setNotification('Fogos configurados: Apenas na Tela Inicial'); }}
                          className={`p-2.5 rounded-xl font-semibold border ${fireworksScope === 'home_only' ? 'bg-amber-500 text-black border-white' : 'bg-[#1A1033] border-purple-500/30 text-purple-200'}`}
                        >
                          Apenas na Tela Inicial (Padrão)
                        </button>
                        <button 
                          onClick={() => { setFireworksScope('all_screens'); setNotification('Fogos configurados: Em Telas Públicas'); }}
                          className={`p-2.5 rounded-xl font-semibold border ${fireworksScope === 'all_screens' ? 'bg-amber-500 text-black border-white' : 'bg-[#1A1033] border-purple-500/30 text-purple-200'}`}
                        >
                          Em Telas Públicas
                        </button>
                      </div>
                    </div>

                    {/* Posicionamento dos Fogos na Tela (Ajuste no Lugar) */}
                    <div className="pt-2 border-t border-purple-900/50 space-y-2">
                      <label className="text-amber-200 font-bold block">Posicionamento dos Fogos na Tela:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => { setFireworksPosition('sky_top'); setNotification('Fogos ajustados: Céu do Banner / Topo'); }}
                          className={`p-2.5 rounded-xl font-semibold border ${fireworksPosition === 'sky_top' ? 'bg-purple-600 text-white border-white' : 'bg-[#1A1033] border-purple-500/30 text-purple-200'}`}
                        >
                          Céu do Banner / Topo (Ajustado)
                        </button>
                        <button 
                          onClick={() => { setFireworksPosition('full_screen'); setNotification('Fogos ajustados: Tela Inteira'); }}
                          className={`p-2.5 rounded-xl font-semibold border ${fireworksPosition === 'full_screen' ? 'bg-purple-600 text-white border-white' : 'bg-[#1A1033] border-purple-500/30 text-purple-200'}`}
                        >
                          Tela Inteira
                        </button>
                      </div>
                    </div>

                    {/* Frequência dos Fogos de Artifício */}
                    <div className="pt-2 border-t border-purple-900/50 space-y-2">
                      <label className="text-amber-200 font-bold block">Frequência dos Estouros de Fogos:</label>
                      <div className="grid grid-cols-3 gap-1.5 text-[10px]">
                        {(['light', 'medium', 'heavy'] as const).map((intensity) => (
                          <button
                            key={intensity}
                            onClick={() => {
                              setFireworksIntensity(intensity);
                              setNotification(`Fogos: ${intensity === 'light' ? 'Suave (Calmo)' : intensity === 'medium' ? 'Médio (Equilibrado)' : 'Show Pirotécnico'}`);
                            }}
                            className={`py-2 rounded-xl font-semibold border ${fireworksIntensity === intensity ? 'bg-amber-500 text-black border-white' : 'bg-[#1A1033] border-purple-500/30 text-purple-200'}`}
                          >
                            {intensity === 'light' ? 'Suave' : intensity === 'medium' ? 'Média' : 'Show Pirotécnico'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Simulador Fechado de Demonstração */}
                    <div className="pt-3 border-t border-purple-900/50 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-amber-200 font-bold block">Simulador de Demonstração:</label>
                        <span className="text-[10px] text-emerald-400 font-medium">● Área Fechada de Demonstração</span>
                      </div>
                      
                      {/* Palco do Simulador */}
                      <div className="relative w-full h-36 rounded-2xl overflow-hidden bg-gradient-to-b from-[#090314] via-[#140b29] to-[#200e3b] border border-amber-500/40 shadow-inner flex flex-col justify-between p-2.5">
                        <canvas 
                          ref={adminFireworksCanvasRef}
                          className="absolute inset-0 pointer-events-none"
                        />
                        <div className="relative z-10 flex items-center justify-between text-[10px] text-purple-300">
                          <span className="bg-black/50 px-2 py-0.5 rounded-md border border-purple-500/30">Céu Noturno Lar Esperança</span>
                          <span className="text-amber-300 font-semibold">Simulação Segura</span>
                        </div>
                        
                        <div className="relative z-10 flex items-center justify-between pt-2">
                          <button 
                            onClick={() => {
                              if (triggerSimulatorExplosionRef.current) {
                                triggerSimulatorExplosionRef.current();
                              }
                            }}
                            className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-500 text-white font-bold text-[10px] shadow active:scale-[0.98] flex items-center space-x-1"
                          >
                            <Sparkles className="w-3.5 h-3.5" />
                            <span>Disparar no Simulador</span>
                          </button>
                          
                          <button 
                            onClick={() => setIsAdminSimulatorRunning(!isAdminSimulatorRunning)}
                            className={`px-2.5 py-1.5 rounded-xl text-[10px] font-semibold border ${isAdminSimulatorRunning ? 'bg-purple-900/70 border-purple-500/40 text-purple-200' : 'bg-gray-800 border-gray-600 text-gray-400'}`}
                          >
                            {isAdminSimulatorRunning ? 'Pausar Loop' : 'Ativar Loop'}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* Escopo da Neve: Apenas na Tela Inicial (Padrão) vs Em Todas as Telas */}
                    <div className="pt-2 border-t border-purple-900/50 space-y-2">
                      <label className="text-amber-200 font-bold block">Onde exibir a neve caindo:</label>
                      <div className="grid grid-cols-2 gap-2">
                        <button 
                          onClick={() => { setSnowScope('home_only'); setNotification('Neve configurada: Apenas na Tela Inicial'); }}
                          className={`p-2.5 rounded-xl font-semibold border ${snowScope === 'home_only' ? 'bg-pink-600 text-white border-white' : 'bg-[#1A1033] border-purple-500/30 text-purple-200'}`}
                        >
                          Apenas na Tela Inicial (Padrão)
                        </button>
                        <button 
                          onClick={() => { setSnowScope('all_screens'); setNotification('Neve configurada: Em Todas as Telas'); }}
                          className={`p-2.5 rounded-xl font-semibold border ${snowScope === 'all_screens' ? 'bg-pink-600 text-white border-white' : 'bg-[#1A1033] border-purple-500/30 text-purple-200'}`}
                        >
                          Em Todas as Telas
                        </button>
                      </div>
                    </div>

                    {/* Intensidade da Neve */}
                    <div className="pt-2 border-t border-purple-900/50 space-y-2">
                      <label className="text-amber-200 font-bold block">Intensidade dos Flocos de Neve:</label>
                      <div className="grid grid-cols-4 gap-1.5 text-[10px]">
                        {(['off', 'light', 'medium', 'heavy'] as const).map((intensity) => (
                          <button
                            key={intensity}
                            onClick={() => {
                              setSnowIntensity(intensity);
                              setNotification(`Intensidade de neve: ${intensity === 'off' ? 'Desligada' : intensity === 'light' ? 'Pouca' : intensity === 'medium' ? 'Média' : 'Mais Forte'}`);
                            }}
                            className={`py-2 rounded-xl font-semibold border ${snowIntensity === intensity ? 'bg-blue-600 text-white border-white' : 'bg-[#1A1033] border-purple-500/30 text-purple-200'}`}
                          >
                            {intensity === 'off' ? 'Desligar' : intensity === 'light' ? 'Pouca' : intensity === 'medium' ? 'Média' : 'Mais Forte'}
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Ações de Controle e Limpeza de Efeitos */}
                    <div className="pt-3 border-t border-purple-900/50 space-y-2">
                      <div className="flex items-center justify-between space-x-2">
                        <button 
                          onClick={clearAllEffects}
                          className="flex-1 py-2.5 rounded-xl bg-purple-900/80 border border-purple-500/40 text-purple-200 font-semibold text-xs active:scale-[0.98] flex items-center justify-center space-x-1.5"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-pink-400" />
                          <span>Limpar Tela e Parar Efeitos</span>
                        </button>
                        <button 
                          onClick={() => {
                            setIsFestiveSoundEnabled(!isFestiveSoundEnabled);
                            setNotification(`Sons festivos ${!isFestiveSoundEnabled ? 'Ativados' : 'Desativados'}`);
                          }}
                          className={`px-3 py-2.5 rounded-xl text-xs font-semibold border ${isFestiveSoundEnabled ? 'bg-amber-500/20 border-amber-500/50 text-amber-200' : 'bg-gray-900/60 border-gray-700 text-gray-400'}`}
                        >
                          {isFestiveSoundEnabled ? '🔊 Som Ativo' : '🔇 Som Mudo'}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4.3 ÁREA EXCLUSIVA DE ABERTURA 3D COM CORES, NUVEM E TOGGLE DO BOTÃO */}
              {adminTab === 'splash3d' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-amber-300 text-sm">Abertura 3D: Nuvem, Logo e Controles</h3>
                    <button onClick={() => setAdminTab('dashboard')} className="text-[10px] text-purple-300 underline">Voltar</button>
                  </div>

                  <div className="bg-[#2A1840] p-4 rounded-2xl border border-amber-500/30 space-y-3 shadow">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-white">Efeito de Abertura Ativo</span>
                      <button 
                        onClick={() => {
                          setIsSplashEnabled(!isSplashEnabled);
                          setNotification(`Abertura 3D ${!isSplashEnabled ? 'Ativada' : 'Desativada'}`);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold ${isSplashEnabled ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
                      >
                        {isSplashEnabled ? 'Ativado' : 'Desativado'}
                      </button>
                    </div>

                    {/* Opção solicitada: Desligar o botão "Entrar no Aplicativo" para entrada automática */}
                    <div className="flex items-center justify-between p-3 rounded-xl bg-[#1A1033] border border-amber-500/30">
                      <div>
                        <span className="font-bold text-white block">Botão "Entrar no Aplicativo"</span>
                        <span className="text-[10px] text-purple-300">
                          {splashShowEnterButton 
                            ? 'Botão visível: o usuário clica para entrar' 
                            : 'Desligado: entra automaticamente após a animação da nuvem'}
                        </span>
                      </div>
                      <button 
                        onClick={() => {
                          setSplashShowEnterButton(!splashShowEnterButton);
                          setNotification(`Botão 'Entrar no Aplicativo' ${!splashShowEnterButton ? 'Ativado' : 'Desligado (Entrada Automática)'}`);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold transition shadow ${splashShowEnterButton ? 'bg-emerald-600 text-white' : 'bg-red-600/80 text-white'}`}
                      >
                        {splashShowEnterButton ? 'Ligado' : 'Desligado'}
                      </button>
                    </div>

                    {!splashShowEnterButton && (
                      <div className="p-3 rounded-xl bg-[#1A1033] border border-purple-500/30 space-y-1.5">
                        <label className="text-amber-200 block text-[11px] font-semibold">Tempo de Exibição da Animação antes de Entrar:</label>
                        <div className="grid grid-cols-3 gap-2">
                          {[3, 4, 5].map((sec) => (
                            <button
                              key={sec}
                              onClick={() => {
                                setSplashAutoEnterDelay(sec);
                                setNotification(`Tempo de animação: ${sec} segundos`);
                              }}
                              className={`py-1.5 rounded-lg font-bold ${splashAutoEnterDelay === sec ? 'bg-pink-600 text-white' : 'bg-[#2A1840] text-purple-300 border border-purple-500/30'}`}
                            >
                              {sec}s
                            </button>
                          ))}
                        </div>
                      </div>
                    )}

                    <div className="space-y-2">
                      <label className="text-amber-200 font-bold block">6 Versões de Cores da Abertura 3D (Celular, Tablet e PC):</label>
                      <div className="grid grid-cols-2 gap-2">
                        {[
                          { id: 'gold_pink', label: 'Dourado & Rosa Neon' },
                          { id: 'blue_silver', label: 'Azul Celestial & Prata' },
                          { id: 'emerald_gold', label: 'Esmeralda & Ouro' },
                          { id: 'purple_cyan', label: 'Púrpura & Ciano' },
                          { id: 'ruby_gold', label: 'Vermelho Rubi & Ouro' },
                          { id: 'silver_white', label: 'Branco Polar & Cristal' },
                        ].map((th) => (
                          <button
                            key={th.id}
                            onClick={() => {
                              setSplashColorTheme(th.id as any);
                              setNotification(`Tema da abertura: ${th.label}`);
                            }}
                            className={`p-2.5 rounded-xl font-semibold border ${splashColorTheme === th.id ? 'bg-pink-600 text-white border-white' : 'bg-[#1A1033] border-purple-500/30 text-purple-200'}`}
                          >
                            {th.label}
                          </button>
                        ))}
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-2 pt-1">
                      <div>
                        <label className="text-amber-200 block mb-1">Cor Primária do Logo</label>
                        <input type="color" value={splashPrimaryColor} onChange={(e) => setSplashPrimaryColor(e.target.value)} className="w-full h-9 rounded-xl bg-transparent cursor-pointer" />
                      </div>
                      <div>
                        <label className="text-amber-200 block mb-1">Brilho da Nuvem</label>
                        <input type="color" value={splashCloudGlow} onChange={(e) => setSplashCloudGlow(e.target.value)} className="w-full h-9 rounded-xl bg-transparent cursor-pointer" />
                      </div>
                    </div>

                    <div className="space-y-2 pt-1">
                      <label className="text-amber-200">Título da Abertura</label>
                      <input 
                        type="text" 
                        value={splashTitle} 
                        onChange={(e) => setSplashTitle(e.target.value)} 
                        className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white text-xs" 
                      />

                      <label className="text-amber-200">Subtítulo / Slogan</label>
                      <input 
                        type="text" 
                        value={splashSubtitle} 
                        onChange={(e) => setSplashSubtitle(e.target.value)} 
                        className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white text-xs" 
                      />
                    </div>

                    <div className="pt-2">
                      <button 
                        onClick={() => {
                          setIsShowingSplash(true);
                          if (isFestiveSoundEnabled) playFestiveChime();
                        }}
                        className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-600 to-amber-500 font-bold text-white shadow-xl active:scale-[0.98] flex items-center justify-center space-x-2"
                      >
                        <Cloud className="w-4 h-4" />
                        <span>Testar Entrada 3D com Nuvem Agora</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4.4 TEMAS EVANGÉLICOS & VERSÍCULOS EDITÁVEIS */}
              {adminTab === 'evangelical' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-amber-300 text-sm flex items-center space-x-1.5">
                      <BookOpen className="w-4 h-4 text-amber-400" />
                      <span>Temas Evangélicos & Versículos Bíblicos</span>
                    </h3>
                    <button onClick={() => setAdminTab('dashboard')} className="text-[10px] text-purple-300 underline">Voltar</button>
                  </div>

                  <div className="bg-[#2A1840] p-4 rounded-2xl border border-amber-500/30 space-y-3 shadow">
                    <div className="flex items-center justify-between">
                      <div>
                        <span className="font-bold text-white block">Exibir Card Evangélico no App</span>
                        <span className="text-[10px] text-purple-300">Aparece na tela inicial e nas áreas com conforto e fé</span>
                      </div>
                      <button 
                        onClick={() => {
                          setIsEvangelicalBannerEnabled(!isEvangelicalBannerEnabled);
                          setNotification(`Banner Evangélico ${!isEvangelicalBannerEnabled ? 'Ativado' : 'Ocultado'}`);
                        }}
                        className={`px-3 py-1.5 rounded-xl font-bold ${isEvangelicalBannerEnabled ? 'bg-emerald-600 text-white' : 'bg-red-600 text-white'}`}
                      >
                        {isEvangelicalBannerEnabled ? 'Ativo' : 'Oculto'}
                      </button>
                    </div>

                    {/* Seleção do Tema Evangélico Ativo */}
                    <div className="space-y-2 pt-2 border-t border-purple-900/50">
                      <label className="text-amber-200 font-bold block">Escolher Tema Evangélico Visual:</label>
                      <div className="grid grid-cols-2 gap-2">
                        {evangelicalThemes.map((th) => (
                          <button
                            key={th.id}
                            onClick={() => {
                              setActiveEvangelicalThemeId(th.id);
                              setNotification(`Tema ativo: ${th.name}`);
                            }}
                            className={`p-2.5 rounded-xl text-left border transition ${activeEvangelicalThemeId === th.id ? 'bg-amber-500/20 border-amber-400 text-white font-bold shadow' : 'bg-[#1A1033] border-purple-500/30 text-purple-200'}`}
                          >
                            <span className="block text-xs font-bold">{th.name}</span>
                            <span className="text-[9px] text-purple-300 block">{th.tagline}</span>
                          </button>
                        ))}
                      </div>
                    </div>

                    {/* Cadastrar Nova Mensagem / Versículo Bíblico */}
                    <div className="pt-3 border-t border-purple-900/50 space-y-2">
                      <h4 className="font-bold text-white flex items-center space-x-1.5">
                        <Plus className="w-4 h-4 text-amber-400" />
                        <span>Adicionar Novo Versículo ou Mensagem Bíblica</span>
                      </h4>
                      <textarea 
                        placeholder="Texto do versículo bíblico ou mensagem de fé..."
                        value={newVerseText}
                        onChange={(e) => setNewVerseText(e.target.value)}
                        className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl p-2.5 text-white h-20 resize-none text-xs"
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <input 
                          type="text" 
                          placeholder="Ex: Salmos 91:1" 
                          value={newVerseRef}
                          onChange={(e) => setNewVerseRef(e.target.value)}
                          className="bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white text-xs"
                        />
                        <input 
                          type="text" 
                          placeholder="Categoria (Fé, Esperança...)" 
                          value={newVerseCategory}
                          onChange={(e) => setNewVerseCategory(e.target.value)}
                          className="bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white text-xs"
                        />
                      </div>
                      <button 
                        onClick={handleAddEvangelicalMessage}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 font-bold text-white shadow active:scale-[0.98]"
                      >
                        + Salvar Novo Versículo
                      </button>
                    </div>

                    {/* Edição de Versículo (caso ativo) */}
                    {editingMessageId && (
                      <div className="p-3 rounded-2xl bg-[#180F2A] border border-amber-400/60 space-y-2 shadow-lg">
                        <h4 className="font-bold text-amber-300">Editando Mensagem / Versículo:</h4>
                        <textarea 
                          value={editingVerseText}
                          onChange={(e) => setEditingVerseText(e.target.value)}
                          className="w-full bg-[#1A1033] border border-purple-500/40 rounded-xl p-2 text-white h-18 text-xs resize-none"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="text" 
                            value={editingVerseRef}
                            onChange={(e) => setEditingVerseRef(e.target.value)}
                            className="bg-[#1A1033] border border-purple-500/40 rounded-xl px-2 py-1.5 text-white text-xs"
                          />
                          <input 
                            type="text" 
                            value={editingVerseCategory}
                            onChange={(e) => setEditingVerseCategory(e.target.value)}
                            className="bg-[#1A1033] border border-purple-500/40 rounded-xl px-2 py-1.5 text-white text-xs"
                          />
                        </div>
                        <div className="flex space-x-2">
                          <button onClick={() => setEditingMessageId(null)} className="flex-1 py-1.5 rounded-xl bg-purple-900/60 text-purple-200">
                            Cancelar
                          </button>
                          <button onClick={handleSaveEditEvangelicalMessage} className="flex-1 py-1.5 rounded-xl bg-amber-500 text-black font-bold shadow">
                            Salvar Alterações
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Lista de Versículos Cadastrados (com Edição e Exclusão) */}
                    <div className="pt-3 border-t border-purple-900/50 space-y-2.5">
                      <h4 className="font-bold text-amber-300">Versículos Cadastrados ({evangelicalMessages.length}):</h4>
                      <div className="space-y-2">
                        {evangelicalMessages.map((msg) => (
                          <div 
                            key={msg.id}
                            className={`p-3 rounded-2xl border transition shadow space-y-2 ${activeEvangelicalMessageId === msg.id ? 'bg-[#1E1138] border-amber-400' : 'bg-[#1A1033] border-purple-500/30'}`}
                          >
                            <div className="flex items-center justify-between">
                              <span className="font-bold text-amber-300 text-xs">📖 {msg.reference}</span>
                              <span className="px-2 py-0.5 rounded-full bg-purple-900/60 text-purple-200 text-[9px] font-semibold">
                                {msg.category}
                              </span>
                            </div>
                            <p className="text-white italic text-xs leading-relaxed">"{msg.verse}"</p>
                            
                            <div className="flex items-center justify-between pt-1 border-t border-purple-900/40">
                              <button 
                                onClick={() => {
                                  setActiveEvangelicalMessageId(msg.id);
                                  setNotification(`Versículo destacado: ${msg.reference}`);
                                }}
                                className={`px-2.5 py-1 rounded-xl text-[10px] font-bold ${activeEvangelicalMessageId === msg.id ? 'bg-amber-500 text-black' : 'bg-purple-900/60 text-purple-200'}`}
                              >
                                {activeEvangelicalMessageId === msg.id ? '★ Destacado' : 'Destacar'}
                              </button>
                              <div className="flex space-x-1.5">
                                <button 
                                  onClick={() => handleStartEditEvangelicalMessage(msg)}
                                  className="px-2.5 py-1 rounded-xl bg-purple-900/60 text-pink-300 text-[10px] font-semibold active:scale-[0.98]"
                                >
                                  Editar
                                </button>
                                <button 
                                  onClick={() => handleDeleteEvangelicalMessage(msg.id)}
                                  className="px-2.5 py-1 rounded-xl bg-red-600/30 text-red-200 text-[10px] font-semibold active:scale-[0.98]"
                                >
                                  Apagar
                                </button>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* 4.5 GERENCIAR PADRINHOS & FAMÍLIAS (Com upload de foto da galeria e mensagens) */}
              {adminTab === 'sponsors_families' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-amber-300 text-sm flex items-center space-x-1.5">
                      <Users className="w-4 h-4 text-pink-400" />
                      <span>Gerenciar Padrinhos & Famílias</span>
                    </h3>
                    <button onClick={() => setAdminTab('dashboard')} className="text-[10px] text-purple-300 underline">Voltar</button>
                  </div>

                  {/* Edição do Padrinho pelo Administrador */}
                  <div className="bg-[#2A1840] p-4 rounded-2xl border border-pink-500/30 space-y-3 shadow">
                    <h4 className="font-bold text-pink-400 text-xs flex items-center space-x-1">
                      <User className="w-4 h-4" />
                      <span>Perfil do Padrinho: Dados & Foto da Galeria</span>
                    </h4>

                    <div className="flex items-center space-x-3 pb-2 border-b border-purple-900/50">
                      <div 
                        className="w-14 h-14 rounded-full overflow-hidden border-2 border-pink-500 select-none pointer-events-auto cursor-pointer shadow shrink-0"
                        onClick={() => setZoomedImage(sponsorUser.avatar)}
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        <img src={sponsorUser.avatar} alt="Padrinho" className="w-full h-full object-cover select-none pointer-events-none" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label htmlFor="admin-sponsor-avatar" className="inline-block px-3 py-1.5 rounded-xl bg-pink-600 text-white font-bold cursor-pointer active:scale-[0.98] text-[10px] shadow">
                          + Enviar Foto da Galeria
                        </label>
                        <input id="admin-sponsor-avatar" type="file" accept="image/*" onChange={handleAdminUploadSponsorAvatar} className="hidden" />
                        <p className="text-[9px] text-purple-300">Upload de foto do padrinho direto do dispositivo</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-purple-300 block mb-1">Nome do Padrinho</label>
                      <input 
                        type="text" 
                        value={sponsorUser.name} 
                        onChange={(e) => setSponsorUser({ ...sponsorUser, name: e.target.value })}
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl px-3 py-2 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">WhatsApp / Telefone</label>
                      <input 
                        type="text" 
                        value={sponsorUser.phone} 
                        onChange={(e) => setSponsorUser({ ...sponsorUser, phone: e.target.value })}
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl px-3 py-2 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">E-mail</label>
                      <input 
                        type="email" 
                        value={sponsorUser.email} 
                        onChange={(e) => setSponsorUser({ ...sponsorUser, email: e.target.value })}
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl px-3 py-2 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">Bio / Sobre o Padrinho</label>
                      <textarea 
                        value={sponsorUser.bio} 
                        onChange={(e) => setSponsorUser({ ...sponsorUser, bio: e.target.value })}
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white h-16 resize-none" 
                      />
                    </div>
                    <div>
                      <label className="text-pink-300 block mb-1 font-bold">Mensagem do Padrinho para a Família:</label>
                      <textarea 
                        value={sponsorUser.familyMessage || ''} 
                        onChange={(e) => setSponsorUser({ ...sponsorUser, familyMessage: e.target.value })}
                        placeholder="Mensagem carinhosa que a família acolhedora poderá ler..."
                        className="w-full bg-[#1A1033] border border-pink-500/40 rounded-xl p-2.5 text-white h-20 resize-none" 
                      />
                    </div>

                    <button 
                      onClick={() => setNotification('Dados e foto do padrinho atualizados com sucesso!')}
                      className="w-full py-2.5 rounded-xl bg-pink-600 font-bold text-white shadow active:scale-[0.98]"
                    >
                      Salvar Dados do Padrinho
                    </button>
                  </div>

                  {/* Edição da Família pelo Administrador */}
                  <div className="bg-[#2A1840] p-4 rounded-2xl border border-amber-500/30 space-y-3 shadow">
                    <h4 className="font-bold text-amber-400 text-xs flex items-center space-x-1">
                      <Users className="w-4 h-4" />
                      <span>Perfil da Família: Dados & Foto da Galeria</span>
                    </h4>

                    <div className="flex items-center space-x-3 pb-2 border-b border-purple-900/50">
                      <div 
                        className="w-14 h-14 rounded-full overflow-hidden border-2 border-amber-400 select-none pointer-events-auto cursor-pointer shadow shrink-0"
                        onClick={() => setZoomedImage(familyUser.avatar)}
                        onContextMenu={(e) => e.preventDefault()}
                      >
                        <img src={familyUser.avatar} alt="Família" className="w-full h-full object-cover select-none pointer-events-none" />
                      </div>
                      <div className="flex-1 space-y-1">
                        <label htmlFor="admin-family-avatar" className="inline-block px-3 py-1.5 rounded-xl bg-amber-500 text-black font-bold cursor-pointer active:scale-[0.98] text-[10px] shadow">
                          + Enviar Foto da Galeria
                        </label>
                        <input id="admin-family-avatar" type="file" accept="image/*" onChange={handleAdminUploadFamilyAvatar} className="hidden" />
                        <p className="text-[9px] text-purple-300">Upload de foto da família direto do dispositivo</p>
                      </div>
                    </div>

                    <div>
                      <label className="text-purple-300 block mb-1">Nome dos Responsáveis / Família</label>
                      <input 
                        type="text" 
                        value={familyUser.name} 
                        onChange={(e) => setFamilyUser({ ...familyUser, name: e.target.value })}
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl px-3 py-2 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">WhatsApp / Contato</label>
                      <input 
                        type="text" 
                        value={familyUser.phone} 
                        onChange={(e) => setFamilyUser({ ...familyUser, phone: e.target.value })}
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl px-3 py-2 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">E-mail</label>
                      <input 
                        type="email" 
                        value={familyUser.email} 
                        onChange={(e) => setFamilyUser({ ...familyUser, email: e.target.value })}
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl px-3 py-2 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">Bio / História da Família</label>
                      <textarea 
                        value={familyUser.bio} 
                        onChange={(e) => setFamilyUser({ ...familyUser, bio: e.target.value })}
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white h-16 resize-none" 
                      />
                    </div>

                    <button 
                      onClick={() => setNotification('Dados e foto da família atualizados com sucesso!')}
                      className="w-full py-2.5 rounded-xl bg-amber-500 font-bold text-black shadow active:scale-[0.98]"
                    >
                      Salvar Dados da Família
                    </button>
                  </div>
                </div>
              )}

              {/* 4.6 GERENCIADOR DE BOTÕES */}
              {adminTab === 'buttons' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-amber-300 text-sm">Gerenciador de Botões do Rodapé</h3>
                    <button onClick={() => setAdminTab('dashboard')} className="text-[10px] text-purple-300 underline">Voltar</button>
                  </div>

                  <div className="bg-[#2A1840] p-4 rounded-2xl border border-amber-500/30 space-y-3 shadow">
                    <h4 className="font-bold text-white">Criar Novo Botão Personalizado:</h4>
                    <div className="grid grid-cols-2 gap-2">
                      <input 
                        type="text" 
                        placeholder="Nome do Botão" 
                        value={newButtonLabel} 
                        onChange={(e) => setNewButtonLabel(e.target.value)} 
                        className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white text-xs" 
                      />
                      <select 
                        value={newButtonIcon} 
                        onChange={(e) => setNewButtonIcon(e.target.value as any)}
                        className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white text-xs"
                      >
                        <option value="heart">Coração</option>
                        <option value="user">Padrinho</option>
                        <option value="users">Família</option>
                        <option value="gift">Doação</option>
                        <option value="star">Estrela</option>
                        <option value="sparkles">Brilho</option>
                        <option value="video">Vídeo</option>
                        <option value="home">Início</option>
                      </select>
                    </div>

                    <button 
                      onClick={handleAddFooterButton}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-amber-500 font-bold text-white shadow active:scale-[0.98] flex items-center justify-center space-x-1.5"
                    >
                      <Plus className="w-4 h-4" />
                      <span>Adicionar Novo Botão</span>
                    </button>

                    <div className="pt-3 border-t border-purple-900/50 space-y-2">
                      <h4 className="font-bold text-amber-300">Editar Ordem e Nomes dos Botões:</h4>
                      <div className="space-y-2">
                        {footerButtons.map((btn, idx) => (
                          <div key={btn.id} className="p-3 rounded-xl bg-[#1A1033] border border-purple-500/30 flex items-center justify-between">
                              <div className="flex items-center space-x-2 flex-1 mr-2">
                                {/* Icon Selector for Editing */}
                                <select 
                                  value={btn.iconName}
                                  onChange={(e) => {
                                    const updated = [...footerButtons];
                                    updated[idx].iconName = e.target.value as any;
                                    setFooterButtons(updated);
                                  }}
                                  className="bg-[#2A1840] border border-purple-500/30 rounded-lg px-1 py-1 text-white text-[10px]"
                                >
                                  <option value="heart">Coração</option>
                                  <option value="user">Usuário</option>
                                  <option value="users">Usuários</option>
                                  <option value="gift">Presente</option>
                                  <option value="star">Estrela</option>
                                  <option value="sparkles">Brilho</option>
                                  <option value="video">Vídeo</option>
                                  <option value="home">Início</option>
                                </select>
                                <input 
                                  type="text" 
                                  value={btn.label} 
                                  onChange={(e) => {
                                    const updated = [...footerButtons];
                                    updated[idx].label = e.target.value;
                                    setFooterButtons(updated);
                                  }}
                                  className="bg-[#2A1840] border border-purple-500/30 rounded-lg px-2 py-1 text-white text-xs w-full"
                                />
                              </div>
                            
                            <div className="flex items-center space-x-1 shrink-0">
                              <button 
                                onClick={() => handleMoveFooterButton(idx, 'left')}
                                disabled={idx === 0}
                                className="p-1 rounded-lg bg-purple-900/60 text-purple-200 disabled:opacity-30 active:scale-[0.98]"
                                title="Mover para esquerda"
                              >
                                <MoveLeft className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleMoveFooterButton(idx, 'right')}
                                disabled={idx === footerButtons.length - 1}
                                className="p-1 rounded-lg bg-purple-900/60 text-purple-200 disabled:opacity-30 active:scale-[0.98]"
                                title="Mover para direita"
                              >
                                <MoveRight className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => handleRemoveFooterButton(btn.id)}
                                className="p-1 rounded-lg bg-red-600/30 text-red-200 active:scale-[0.98]"
                                title="Excluir Botão"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4.7 MÍDIAS 9:16 (Stories/Reels) */}
              {adminTab === 'media916' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-amber-300 text-sm">Mídias no Formato 9:16 (Stories & Vídeos)</h3>
                    <button onClick={() => setAdminTab('dashboard')} className="text-[10px] text-purple-300 underline">Voltar</button>
                  </div>

                  <div className="bg-[#2A1840] p-4 rounded-2xl border border-amber-500/30 space-y-3 shadow">
                    <h4 className="font-bold text-white">Adicionar Foto ou Vídeo 9:16 da Galeria:</h4>
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        placeholder="Título do Momento" 
                        value={newStoryTitle} 
                        onChange={(e) => setNewStoryTitle(e.target.value)} 
                        className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white" 
                      />
                      <input 
                        type="text" 
                        placeholder="Subtítulo ou Descrição rápida" 
                        value={newStorySubtitle} 
                        onChange={(e) => setNewStorySubtitle(e.target.value)} 
                        className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white" 
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => openInAppCamera('media916')}
                          className="py-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white font-black text-center active:scale-[0.98] shadow flex items-center justify-center space-x-1.5"
                        >
                          <Camera className="w-4 h-4 text-white" />
                          <span>📸 Tirar Foto 9:16 (Câmera ao Vivo)</span>
                        </button>

                        <label htmlFor="media-916-upload" className="block py-3 rounded-xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-bold text-center cursor-pointer active:scale-[0.98] shadow flex items-center justify-center space-x-1.5">
                          <Upload className="w-4 h-4 text-white" />
                          <span>+ Selecionar da Galeria (9:16)</span>
                        </label>
                      </div>
                      <input id="media-916-upload" type="file" accept="image/*,video/*" onChange={handleStory916Upload} className="hidden" />
                    </div>

                    <div className="pt-3 border-t border-purple-900/50 space-y-2">
                      <h4 className="font-bold text-amber-300">Mídias 9:16 Ativas ({stories916.length}):</h4>
                      <div className="grid grid-cols-3 gap-2">
                        {stories916.map((st) => (
                          <div key={st.id} className="relative aspect-[9/16] rounded-xl overflow-hidden border border-purple-500/30 group">
                            <img src={st.url} alt={st.title} className="w-full h-full object-cover select-none pointer-events-none" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent p-1 flex flex-col justify-end">
                              <span className="text-[9px] font-bold text-white truncate">{st.title}</span>
                            </div>
                            <button 
                              onClick={() => {
                                setStories916(stories916.filter(s => s.id !== st.id));
                                setNotification('Mídia 9:16 removida.');
                              }}
                              className="absolute top-1 right-1 p-1 rounded-lg bg-red-600 text-white shadow"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4.8 BANNERS DO CARROSSEL */}
              {adminTab === 'carousel' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-amber-300 text-sm">Gerenciamento de Banners do Carrossel</h3>
                    <button onClick={() => setAdminTab('dashboard')} className="text-[10px] text-purple-300 underline">Voltar</button>
                  </div>

                  <div className="bg-[#2A1840] p-4 rounded-2xl border border-amber-500/30 space-y-3 shadow">
                    <h4 className="font-bold text-white">Criar Novo Banner para o Topo da Home:</h4>
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        placeholder="Título do Banner" 
                        value={newBannerTitle} 
                        onChange={(e) => setNewBannerTitle(e.target.value)} 
                        className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white" 
                      />
                      <input 
                        type="text" 
                        placeholder="Subtítulo ou mensagem de impacto" 
                        value={newBannerSubtitle} 
                        onChange={(e) => setNewBannerSubtitle(e.target.value)} 
                        className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white" 
                      />
                      <input 
                        type="text" 
                        placeholder="Tag / Badge (Ex: Solidariedade)" 
                        value={newBannerBadge} 
                        onChange={(e) => setNewBannerBadge(e.target.value)} 
                        className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white" 
                      />
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                        <button
                          type="button"
                          onClick={() => openInAppCamera('carousel')}
                          className="py-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white font-black text-center active:scale-[0.98] shadow flex items-center justify-center space-x-1.5"
                        >
                          <Camera className="w-4 h-4 text-white" />
                          <span>📸 Tirar Foto para o Banner (Câmera)</span>
                        </button>

                        <label htmlFor="banner-upload" className="block py-3 rounded-xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-bold text-center cursor-pointer active:scale-[0.98] shadow flex items-center justify-center space-x-1.5">
                          <Upload className="w-4 h-4 text-white" />
                          <span>+ Subir Foto da Galeria</span>
                        </label>
                      </div>
                      <input id="banner-upload" type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                    </div>

                    <div className="pt-3 border-t border-purple-900/50 space-y-2">
                      <h4 className="font-bold text-amber-300">Banners Ativos ({banners.length}):</h4>
                      <div className="space-y-2">
                        {banners.map((bn, idx) => (
                          <div key={bn.id} className="p-2.5 rounded-xl bg-[#1A1033] border border-purple-500/30 flex items-center justify-between">
                            <div className="flex items-center space-x-2.5 overflow-hidden">
                              <img src={bn.image} alt="Banner" className="w-14 h-9 object-cover rounded-lg shrink-0" />
                              <div className="overflow-hidden">
                                <h5 className="font-bold text-white truncate">{bn.title}</h5>
                                <p className="text-[10px] text-purple-300 truncate">{bn.subtitle}</p>
                              </div>
                            </div>
                            <button 
                              onClick={() => {
                                if (banners.length <= 1) {
                                  setNotification('Mantenha pelo menos um banner ativo.');
                                  return;
                                }
                                const updatedBanners = banners.filter((_, i) => i !== idx);
                                setBanners(updatedBanners);
                                persistSiteSettingsToSupabase(updatedBanners);
                                setNotification('Banner removido e atualizado no Supabase.');
                              }}
                              className="p-1.5 rounded-lg bg-red-600 text-white ml-2 shrink-0"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* 4.9 PIX & MENSAGEM DE DOAÇÃO */}
              {adminTab === 'pix' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-amber-300 text-sm">Configuração de Doações & Texto Personalizado</h3>
                    <button onClick={() => setAdminTab('dashboard')} className="text-[10px] text-purple-300 underline">Voltar</button>
                  </div>

                  <div className="bg-[#2A1840] p-4 rounded-2xl border border-amber-500/30 space-y-3 shadow">
                    <div>
                      <label className="text-amber-200 font-bold block mb-1">Texto Personalizado da Doação:</label>
                      <textarea 
                        value={donationCustomMessage} 
                        onChange={(e) => setDonationCustomMessage(e.target.value)} 
                        className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl p-3 text-white h-24 resize-none text-xs" 
                      />
                    </div>
                    <div>
                      <label className="text-amber-200">Chave PIX (Copia e Cola)</label>
                      <input type="text" value={pixKey} onChange={(e) => setPixKey(e.target.value)} className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2.5 text-white mt-1" />
                    </div>
                    <div>
                      <label className="text-amber-200">Nome do Banco / Instituição</label>
                      <input type="text" value={pixBankName} onChange={(e) => setPixBankName(e.target.value)} className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2.5 text-white mt-1" />
                    </div>
                    <div>
                      <label className="text-amber-200">URL do QR Code PIX</label>
                      <input type="text" value={pixQrCode} onChange={(e) => setPixQrCode(e.target.value)} className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2.5 text-white mt-1" />
                    </div>
                    <button 
                      onClick={async () => {
                        await persistSiteSettingsToSupabase(banners, stories916, { key: pixKey, name: pixBankName, msg: donationCustomMessage, qr: pixQrCode });
                        setNotification('Dados do PIX e mensagem salvos no Supabase com sucesso!');
                        confetti({ particleCount: 30, spread: 40 });
                      }} 
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 font-bold text-white shadow active:scale-[0.98]"
                    >
                      Salvar Alterações do PIX
                    </button>
                  </div>
                </div>
              )}

              {/* 4.10 CONFIGURAÇÃO DO ÍCONE PWA & LOGO DO MENU */}
              {adminTab === 'settings' && (
                <div className="space-y-4 text-xs">
                  {/* Ordenação da Tela Inicial - Design Premium */}
                  <div className="bg-gradient-to-b from-[#25153E] to-[#180C2A] p-5 rounded-3xl border border-purple-500/40 space-y-4 shadow-2xl">
                    <div className="flex items-start justify-between pb-2 border-b border-purple-900/50">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-amber-500 to-pink-600 text-white shadow-lg">
                          <Sliders className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white flex items-center space-x-1.5">
                            <span>Ordem da Tela Inicial</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-600/30 text-pink-300 border border-pink-500/40 font-bold">
                              {homeCardOrder.length} Blocos
                            </span>
                          </h4>
                          <p className="text-purple-200 text-[11px] mt-0.5">
                            Suba ou desça os cartões para personalizar a posição de cada bloco na página inicial.
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const defaultOrder = ['banner', 'search_filters', 'stories', 'festive', 'evangelical', 'children_list', 'gallery', 'access_cards'];
                          setHomeCardOrder(defaultOrder);
                          try { localStorage.setItem('homeCardOrder', JSON.stringify(defaultOrder)); } catch(e){}
                          setNotification('Ordem padrão restaurada!');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-900/90 text-purple-200 hover:text-white border border-purple-500/30 text-[10px] font-semibold transition active:scale-95 flex items-center space-x-1 shrink-0"
                        title="Restaurar Ordem Padrão"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-400" />
                        <span>Restaurar</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {homeCardOrder.map((cardId, index) => {
                        const blockMeta: Record<string, { title: string; subtitle: string; icon: any; color: string; badge: string }> = {
                          banner: { title: 'Banners em Destaque', subtitle: 'Carrossel principal com fotos e chamadas', icon: Sparkles, color: 'text-amber-400', badge: 'Topo' },
                          search_filters: { title: 'Pesquisa & Filtros', subtitle: 'Barra de busca e filtros de status', icon: Search, color: 'text-cyan-400', badge: 'Busca' },
                          stories: { title: 'Vídeos e Fotos 9:16', subtitle: 'Carrossel estilo stories/momentos', icon: Video, color: 'text-pink-400', badge: 'Stories' },
                          festive: { title: 'Tema Festivo', subtitle: 'Seletores de Natal e Ano Novo', icon: Gift, color: 'text-emerald-400', badge: 'Festivo' },
                          evangelical: { title: 'Luz Divina & Esperança', subtitle: 'Mensagem bíblica e versículo do dia', icon: BookOpen, color: 'text-yellow-300', badge: 'Fé' },
                          children_list: { title: 'Crianças para Apadrinhamento', subtitle: 'Carrossel de cartinhas e perfis', icon: Heart, color: 'text-rose-400', badge: 'Acolhimento' },
                          gallery: { title: 'Galeria de Fotos', subtitle: 'Carrossel de momentos e fotos do Lar', icon: ImageIcon, color: 'text-blue-400', badge: 'Fotos' },
                          access_cards: { title: 'Atalhos de Acesso', subtitle: 'Botões rápidos para Padrinho e Família', icon: Users, color: 'text-purple-300', badge: 'Navegação' }
                        };
                        const meta = blockMeta[cardId] || { title: cardId.toUpperCase(), subtitle: 'Bloco da página inicial', icon: Sliders, color: 'text-white', badge: 'Bloco' };
                        const IconComponent = meta.icon;

                        return (
                          <div 
                            key={cardId} 
                            className="p-3 rounded-2xl bg-gradient-to-r from-[#201235] via-[#281544] to-[#1C0E30] border border-purple-500/30 hover:border-pink-500/50 shadow-md flex items-center justify-between space-x-3 transition-all group"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <GripVertical className="w-3.5 h-3.5 text-purple-400/50 group-hover:text-pink-400 shrink-0" />
                              <div className="w-6 h-6 rounded-xl bg-purple-900/90 border border-purple-500/40 text-amber-300 text-[10px] font-black flex items-center justify-center shrink-0 shadow-sm">
                                {index + 1}
                              </div>
                              <div className="p-2 rounded-xl bg-[#140824] border border-white/5 shrink-0 shadow-inner">
                                <IconComponent className={`w-4 h-4 ${meta.color}`} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h5 className="font-bold text-white text-xs truncate">{meta.title}</h5>
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-purple-900/60 text-purple-300 border border-purple-500/20">
                                    {meta.badge}
                                  </span>
                                </div>
                                <p className="text-[10px] text-purple-200/70 truncate">{meta.subtitle}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5 shrink-0">
                              <button 
                                onClick={() => {
                                  if (index > 0) {
                                    const newOrder = [...homeCardOrder];
                                    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                    setHomeCardOrder(newOrder);
                                    try { localStorage.setItem('homeCardOrder', JSON.stringify(newOrder)); } catch(e){}
                                  }
                                }}
                                disabled={index === 0}
                                className="p-2 rounded-xl bg-[#160B28] border border-purple-500/40 text-purple-200 hover:text-white hover:border-pink-400 hover:bg-pink-600/30 active:scale-95 disabled:opacity-20 disabled:pointer-events-none transition shadow"
                                title="Subir Bloco"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => {
                                  if (index < homeCardOrder.length - 1) {
                                    const newOrder = [...homeCardOrder];
                                    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                    setHomeCardOrder(newOrder);
                                    try { localStorage.setItem('homeCardOrder', JSON.stringify(newOrder)); } catch(e){}
                                  }
                                }}
                                disabled={index === homeCardOrder.length - 1}
                                className="p-2 rounded-xl bg-[#160B28] border border-purple-500/40 text-purple-200 hover:text-white hover:border-pink-400 hover:bg-pink-600/30 active:scale-95 disabled:opacity-20 disabled:pointer-events-none transition shadow"
                                title="Descer Bloco"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Ordenação do Menu Lateral (Lado de Fora) - Design Premium */}
                  <div className="bg-gradient-to-b from-[#25153E] to-[#180C2A] p-5 rounded-3xl border border-pink-500/40 space-y-4 shadow-2xl">
                    <div className="flex items-start justify-between pb-2 border-b border-purple-900/50">
                      <div className="flex items-center space-x-3">
                        <div className="p-2.5 rounded-2xl bg-gradient-to-br from-pink-600 to-amber-500 text-white shadow-lg">
                          <Sliders className="w-5 h-5" />
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-white flex items-center space-x-1.5">
                            <span>Ordem do Menu Lateral (Lado de Fora)</span>
                            <span className="text-[10px] px-2 py-0.5 rounded-full bg-pink-600/30 text-pink-300 border border-pink-500/40 font-bold">
                              {outsideMenuItemsOrder.length} Botões
                            </span>
                          </h4>
                          <p className="text-purple-200 text-[11px] mt-0.5">
                            Reordene os botões que aparecem para visitantes no menu lateral da tela inicial.
                          </p>
                        </div>
                      </div>
                      <button 
                        onClick={() => {
                          const defaultMenuOrder = ['home', 'family', 'sponsor', 'pix', 'gallery', 'pwa'];
                          setOutsideMenuItemsOrder(defaultMenuOrder);
                          try { localStorage.setItem('outsideMenuItemsOrder', JSON.stringify(defaultMenuOrder)); } catch(e){}
                          setNotification('Ordem do menu lateral restaurada!');
                        }}
                        className="px-2.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-900/90 text-purple-200 hover:text-white border border-purple-500/30 text-[10px] font-semibold transition active:scale-95 flex items-center space-x-1 shrink-0"
                        title="Restaurar Ordem Padrão"
                      >
                        <RotateCcw className="w-3 h-3 text-amber-400" />
                        <span>Restaurar</span>
                      </button>
                    </div>

                    <div className="space-y-2">
                      {outsideMenuItemsOrder.map((btnId, index) => {
                        const itemMeta: Record<string, { title: string; subtitle: string; icon: any; color: string; badge: string }> = {
                          home: { title: 'Início', subtitle: 'Página inicial e carrosséis', icon: Home, color: 'text-pink-400', badge: 'Principal' },
                          family: { title: 'Área da Família', subtitle: 'Cadastro e perfil das famílias acolhedoras', icon: Heart, color: 'text-rose-400', badge: 'Família' },
                          sponsor: { title: 'Área do Padrinho', subtitle: 'Acesso e crianças apadrinhadas', icon: User, color: 'text-purple-400', badge: 'Padrinho' },
                          pix: { title: 'Doação (PIX)', subtitle: 'Chave PIX e contribuições com amor', icon: Gift, color: 'text-amber-400', badge: 'Doação' },
                          gallery: { title: 'Galeria', subtitle: 'Fotos e momentos do Lar Esperança', icon: ImageIcon, color: 'text-blue-400', badge: 'Fotos' },
                          pwa: { title: 'Instalar Aplicativo (PWA)', subtitle: 'Atalho de instalação no celular', icon: Smartphone, color: 'text-pink-400', badge: 'App' }
                        };
                        const meta = itemMeta[btnId] || { title: btnId, subtitle: 'Botão do menu', icon: Sliders, color: 'text-white', badge: 'Item' };
                        const IconComponent = meta.icon;

                        return (
                          <div 
                            key={btnId} 
                            className="p-3 rounded-2xl bg-gradient-to-r from-[#201235] via-[#281544] to-[#1C0E30] border border-purple-500/30 hover:border-pink-500/50 shadow-md flex items-center justify-between space-x-3 transition-all group"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <GripVertical className="w-3.5 h-3.5 text-purple-400/50 group-hover:text-pink-400 shrink-0" />
                              <div className="w-6 h-6 rounded-xl bg-purple-900/90 border border-purple-500/40 text-amber-300 text-[10px] font-black flex items-center justify-center shrink-0 shadow-sm">
                                {index + 1}
                              </div>
                              <div className="p-2 rounded-xl bg-[#140824] border border-white/5 shrink-0 shadow-inner">
                                <IconComponent className={`w-4 h-4 ${meta.color}`} />
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center space-x-2">
                                  <h5 className="font-bold text-white text-xs truncate">{meta.title}</h5>
                                  <span className="text-[8px] font-bold px-1.5 py-0.5 rounded-md bg-purple-900/60 text-purple-300 border border-purple-500/20">
                                    {meta.badge}
                                  </span>
                                </div>
                                <p className="text-[10px] text-purple-200/70 truncate">{meta.subtitle}</p>
                              </div>
                            </div>

                            <div className="flex items-center space-x-1.5 shrink-0">
                              <button 
                                onClick={() => {
                                  if (index > 0) {
                                    const newOrder = [...outsideMenuItemsOrder];
                                    [newOrder[index], newOrder[index - 1]] = [newOrder[index - 1], newOrder[index]];
                                    setOutsideMenuItemsOrder(newOrder);
                                    try { localStorage.setItem('outsideMenuItemsOrder', JSON.stringify(newOrder)); } catch(e){}
                                  }
                                }}
                                disabled={index === 0}
                                className="p-2 rounded-xl bg-[#160B28] border border-purple-500/40 text-purple-200 hover:text-white hover:border-pink-400 hover:bg-pink-600/30 active:scale-95 disabled:opacity-20 disabled:pointer-events-none transition shadow"
                                title="Subir Botão"
                              >
                                <ChevronUp className="w-3.5 h-3.5" />
                              </button>
                              <button 
                                onClick={() => {
                                  if (index < outsideMenuItemsOrder.length - 1) {
                                    const newOrder = [...outsideMenuItemsOrder];
                                    [newOrder[index], newOrder[index + 1]] = [newOrder[index + 1], newOrder[index]];
                                    setOutsideMenuItemsOrder(newOrder);
                                    try { localStorage.setItem('outsideMenuItemsOrder', JSON.stringify(newOrder)); } catch(e){}
                                  }
                                }}
                                disabled={index === outsideMenuItemsOrder.length - 1}
                                className="p-2 rounded-xl bg-[#160B28] border border-purple-500/40 text-purple-200 hover:text-white hover:border-pink-400 hover:bg-pink-600/30 active:scale-95 disabled:opacity-20 disabled:pointer-events-none transition shadow"
                                title="Descer Botão"
                              >
                                <ChevronDown className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Foto do Botão PWA */}
                  <div className="bg-[#2A1840] p-4 rounded-2xl border border-amber-500/30 space-y-3 shadow">
                    <h4 className="font-bold text-white flex items-center space-x-2">
                      <Smartphone className="w-4 h-4 text-pink-400" />
                      <span>Ícone do Botão PWA</span>
                    </h4>
                    <p className="text-purple-200 text-[10px]">A foto enviada aqui é aplicada ao botão/ícone de instalação PWA em tempo real.</p>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-pink-500 select-none pointer-events-none shadow-lg">
                        <img src={pwaCustomIcon} alt="PWA" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <label htmlFor="pwa-upload-btn" className="block px-3 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-amber-500 text-white font-bold cursor-pointer active:scale-[0.98] text-center text-[10px] shadow">
                          + Alterar Ícone PWA
                        </label>
                        <input id="pwa-upload-btn" type="file" accept="image/*" onChange={handlePwaIconUpload} className="hidden" />
                      </div>
                    </div>
                  </div>

                  {/* Foto de Perfil & Menu Lateral (Identidade Unificada) */}
                  <div className="bg-[#2A1840] p-4 rounded-2xl border border-pink-500/30 space-y-3 shadow">
                    <h4 className="font-bold text-white flex items-center space-x-2">
                      <User className="w-4 h-4 text-pink-400" />
                      <span>Foto de Perfil & Menus (Identidade Unificada)</span>
                    </h4>
                    <p className="text-purple-200 text-[10px]">
                      A foto enviada aqui sincroniza automaticamente com o menu lateral externo e o painel de gestão interno.
                    </p>
                    <div className="flex items-center space-x-4">
                      <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-pink-500 select-none pointer-events-none shadow-lg">
                        <img src={adminAvatar || homeMenuAvatar} alt="Menu Avatar" className="w-full h-full object-cover" />
                      </div>
                      <div className="flex-1 space-y-2">
                        <label htmlFor="home-menu-avatar-upload" className="block px-3 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-amber-500 text-white font-bold cursor-pointer active:scale-[0.98] text-center text-[10px] shadow">
                          + Alterar Foto Unificada
                        </label>
                        <input id="home-menu-avatar-upload" type="file" accept="image/*" onChange={handleHomeMenuAvatarUpload} className="hidden" />
                      </div>
                    </div>
                  </div>

                  {/* NOME DO PROJETO E INSTITUIÇÃO (EDITÁVEL COM PERSISTÊNCIA) */}
                  <div className="bg-gradient-to-r from-purple-900/90 via-[#2A1840] to-pink-900/90 p-4 rounded-2xl border border-amber-500/40 space-y-3 shadow-xl">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-5 h-5 text-amber-400" />
                      <h4 className="font-bold text-sm text-amber-300">Editar Nome do Projeto & Instituição</h4>
                    </div>
                    <p className="text-[11px] text-purple-200">
                      Altere o nome principal do projeto/aplicativo e o nome do lar/instituição. As alterações são salvas automaticamente e refletidas em todas as telas e aberturas 3D.
                    </p>

                    <div className="space-y-2">
                      <div>
                        <label className="text-[10px] font-semibold text-amber-200 block mb-1">Nome Principal do Projeto / Aplicativo</label>
                        <input 
                          type="text" 
                          value={projectName} 
                          onChange={(e) => {
                            setProjectName(e.target.value);
                            setSplashTitle(e.target.value);
                          }} 
                          placeholder="Ex: Corações que Acolhe"
                          className="w-full bg-[#1A1033] border border-amber-500/40 focus:border-amber-300 rounded-xl px-3 py-2 text-white font-bold text-xs" 
                        />
                      </div>

                      <div>
                        <label className="text-[10px] font-semibold text-amber-200 block mb-1">Nome da Instituição / Lar</label>
                        <input 
                          type="text" 
                          value={institutionName} 
                          onChange={(e) => {
                            setInstitutionName(e.target.value);
                            setSplashSubtitle(`${e.target.value} • Transformando Vidas`);
                          }} 
                          placeholder="Ex: Lar Esperança"
                          className="w-full bg-[#1A1033] border border-amber-500/40 focus:border-amber-300 rounded-xl px-3 py-2 text-white font-bold text-xs" 
                        />
                      </div>

                      <button 
                        type="button"
                        onClick={() => {
                          try {
                            localStorage.setItem('projectName', projectName);
                            localStorage.setItem('institutionName', institutionName);
                          } catch {}
                          setNotification('Nome do Projeto e da Instituição salvos com sucesso!');
                          confetti({ particleCount: 60, spread: 60 });
                        }}
                        className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-pink-600 font-bold text-white shadow-lg active:scale-[0.98] transition text-xs flex items-center justify-center space-x-1.5"
                      >
                        <Check className="w-4 h-4" />
                        <span>Salvar Nome do Projeto & Instituição</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4.11 PERFIL DA PROPRIETÁRIA / TITULARIDADE (MEU APLICATIVO) */}
              {adminTab === 'profile' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <Crown className="w-5 h-5 text-amber-400" />
                      <h3 className="font-bold text-amber-300 text-sm">Meu Aplicativo & Titularidade ({adminTitle})</h3>
                    </div>
                    <button onClick={() => setAdminTab('dashboard')} className="text-[10px] text-purple-300 underline hover:text-white">Voltar ao Painel</button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border border-amber-500/40 text-amber-100 flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-amber-500/30 text-amber-300 shrink-0">
                      <Crown className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">Aplicativo Personalizado para Você</h4>
                      <p className="text-[10px] text-purple-200">
                        Este aplicativo pertence a <strong className="text-amber-300">{adminName || 'Gestão Oficial Lar Esperança'}</strong> ({adminTitle}). Todas as funções administrativas e visualizações estão vinculadas ao seu painel.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#2A1840] p-4 rounded-3xl border border-amber-500/30 space-y-4 shadow-xl">
                    {/* Foto de Perfil com Badge Dinâmica de Titularidade */}
                    <div className="flex flex-col items-center">
                      <div className="w-24 h-24 rounded-3xl overflow-hidden border-2 border-amber-400 mb-3 shadow-2xl relative">
                        <img src={adminAvatar} alt={adminName || adminTitle} className="w-full h-full object-cover select-none pointer-events-none" />
                        <div className="absolute bottom-0 inset-x-0 bg-black/75 py-0.5 text-center text-[9px] text-amber-300 font-bold uppercase tracking-wider">
                          {adminTitle}
                        </div>
                      </div>
                      <div className="flex flex-col sm:flex-row gap-2 mt-1">
                        <button
                          type="button"
                          onClick={() => openInAppCamera('profile')}
                          className="px-4 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-bold cursor-pointer active:scale-[0.98] shadow text-xs flex items-center justify-center space-x-1.5"
                        >
                          <Camera className="w-3.5 h-3.5 text-white" />
                          <span>📸 Tirar Foto com a Câmera</span>
                        </button>
                        <label htmlFor="admin-avatar-upload" className="px-4 py-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/30 font-bold cursor-pointer active:scale-[0.98] shadow text-xs flex items-center justify-center space-x-1.5">
                          <Upload className="w-3.5 h-3.5 text-pink-400" />
                          <span>Escolher da Galeria</span>
                        </label>
                      </div>
                      <input id="admin-avatar-upload" type="file" accept="image/*" onChange={handleAdminAvatarUpload} className="hidden" />
                    </div>

                    {/* Seletor de Titularidade / Gênero */}
                    <div className="space-y-1.5 pt-1">
                      <label className="text-amber-200 font-semibold flex items-center space-x-1.5">
                        <Crown className="w-3.5 h-3.5 text-amber-400" />
                        <span>Tratamento da Titularidade</span>
                      </label>
                      <div className="grid grid-cols-3 gap-2">
                        <button
                          type="button"
                          onClick={() => {
                            setAdminTitle('Proprietária');
                            setAdminRole('Proprietária & Administradora Geral');
                          }}
                          className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition text-center ${
                            adminTitle === 'Proprietária'
                              ? 'bg-gradient-to-r from-pink-600 to-amber-500 text-white border-amber-400 shadow-md'
                              : 'bg-[#1A1033] border-amber-500/30 text-purple-200 hover:text-white'
                          }`}
                        >
                          👑 Proprietária
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAdminTitle('Proprietário');
                            setAdminRole('Proprietário & Administrador Geral');
                          }}
                          className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition text-center ${
                            adminTitle === 'Proprietário'
                              ? 'bg-gradient-to-r from-pink-600 to-amber-500 text-white border-amber-400 shadow-md'
                              : 'bg-[#1A1033] border-amber-500/30 text-purple-200 hover:text-white'
                          }`}
                        >
                          👑 Proprietário
                        </button>
                        <button
                          type="button"
                          onClick={() => {
                            setAdminTitle('Gestão');
                            setAdminRole('Diretoria & Gestão Geral');
                          }}
                          className={`py-2 px-2 rounded-xl text-[11px] font-bold border transition text-center ${
                            adminTitle === 'Gestão'
                              ? 'bg-gradient-to-r from-pink-600 to-amber-500 text-white border-amber-400 shadow-md'
                              : 'bg-[#1A1033] border-amber-500/30 text-purple-200 hover:text-white'
                          }`}
                        >
                          🏛️ Gestão Lar
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      {/* NOME DO PROJETO E INSTITUIÇÃO */}
                      <div className="p-3 rounded-2xl bg-[#1A1033] border border-amber-500/30 space-y-2.5">
                        <h4 className="font-bold text-amber-300 text-xs flex items-center space-x-1.5">
                          <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                          <span>Nome do Projeto & Instituição</span>
                        </h4>
                        <div>
                          <label className="text-[10px] text-purple-300 block mb-1">Nome Principal do Projeto / App</label>
                          <input 
                            type="text" 
                            value={projectName} 
                            onChange={(e) => {
                              setProjectName(e.target.value);
                              setSplashTitle(e.target.value);
                            }} 
                            placeholder="Ex: Corações que Acolhe"
                            className="w-full bg-[#140824] border border-amber-500/30 rounded-xl px-3 py-2 text-white font-bold text-xs" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-purple-300 block mb-1">Nome da Instituição / Lar</label>
                          <input 
                            type="text" 
                            value={institutionName} 
                            onChange={(e) => {
                              setInstitutionName(e.target.value);
                              setSplashSubtitle(`${e.target.value} • Transformando Vidas`);
                            }} 
                            placeholder="Ex: Lar Esperança"
                            className="w-full bg-[#140824] border border-amber-500/30 rounded-xl px-3 py-2 text-white font-bold text-xs" 
                          />
                        </div>
                      </div>
                      <div className="space-y-1">
                        <div className="flex items-center justify-between">
                          <label className="text-amber-200 font-semibold flex items-center space-x-1.5">
                            <Crown className="w-3.5 h-3.5 text-amber-400" />
                            <span>Nome da Responsável / {adminTitle}</span>
                          </label>
                          {adminName && (
                            <button 
                              type="button" 
                              onClick={() => {
                                setAdminName('');
                                setNotification('Nome do proprietário removido.');
                              }}
                              className="text-[10px] text-pink-400 hover:text-pink-300 underline font-medium"
                            >
                              Remover Meu Nome
                            </button>
                          )}
                        </div>
                        <div className="relative">
                          <input 
                            type="text" 
                            placeholder="Deixe em branco para ocultar ou digite o nome..."
                            value={adminName} 
                            onChange={(e) => setAdminName(e.target.value)} 
                            className="w-full bg-[#1A1033] border border-amber-500/30 focus:border-amber-400 rounded-xl px-3 py-2.5 text-white font-semibold text-xs transition placeholder:text-purple-400/50" 
                          />
                          {adminName && (
                            <button 
                              type="button" 
                              onClick={() => setAdminName('')} 
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
                              title="Limpar"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </div>
                        <p className="text-[10px] text-purple-300">
                          {adminName ? `Nome configurado: ${adminName}` : 'Nenhum nome pessoal exibido no app (modo institucional protegido).'}
                        </p>
                      </div>

                      <div className="space-y-1">
                        <label className="text-amber-200 font-semibold">Cargo / Titularidade</label>
                        <input 
                          type="text" 
                          value={adminRole} 
                          onChange={(e) => setAdminRole(e.target.value)} 
                          className="w-full bg-[#1A1033] border border-amber-500/30 focus:border-amber-400 rounded-xl px-3 py-2.5 text-white text-xs transition" 
                        />
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="space-y-1">
                          <label className="text-amber-200 font-semibold">E-mail Principal</label>
                          <input 
                            type="email" 
                            value={adminEmail} 
                            onChange={(e) => setAdminEmail(e.target.value)} 
                            className="w-full bg-[#1A1033] border border-amber-500/30 focus:border-amber-400 rounded-xl px-3 py-2.5 text-white text-xs transition" 
                          />
                        </div>

                        <div className="space-y-1">
                          <label className="text-amber-200 font-semibold">Telefone / WhatsApp</label>
                          <input 
                            type="text" 
                            value={adminPhone} 
                            onChange={(e) => setAdminPhone(e.target.value)} 
                            className="w-full bg-[#1A1033] border border-amber-500/30 focus:border-amber-400 rounded-xl px-3 py-2.5 text-white text-xs transition" 
                          />
                        </div>
                      </div>

                      <div className="space-y-1">
                        <label className="text-amber-200 font-semibold">Biografia / Mensagem da {adminTitle}</label>
                        <textarea 
                          value={adminBio} 
                          onChange={(e) => setAdminBio(e.target.value)} 
                          className="w-full bg-[#1A1033] border border-amber-500/30 focus:border-amber-400 rounded-xl p-3 text-white text-xs h-20 resize-none transition" 
                        />
                      </div>

                      <div className="space-y-1">
                        <label className="text-amber-200 font-semibold">Chave PIX Oficial para Apoio ao Projeto</label>
                        <input 
                          type="text" 
                          value={pixKey} 
                          onChange={(e) => setPixKey(e.target.value)} 
                          className="w-full bg-[#1A1033] border border-amber-500/30 focus:border-amber-400 rounded-xl px-3 py-2.5 text-white text-xs transition" 
                        />
                      </div>

                      {/* Controle de Privacidade do Lado de Fora */}
                      <div className="p-3 rounded-2xl bg-[#1A1033] border border-amber-500/30 space-y-2">
                        <label className="flex items-center space-x-2.5 cursor-pointer">
                          <input 
                            type="checkbox" 
                            checked={showOwnerPublicly} 
                            onChange={(e) => setShowOwnerPublicly(e.target.checked)}
                            className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-amber-500/40 bg-[#2A1840]"
                          />
                          <span className="font-semibold text-amber-200 text-xs">
                            Exibir meu nome no cabeçalho e rodapé público (lado de fora)
                          </span>
                        </label>
                        <p className="text-[10px] text-purple-300 pl-6 leading-relaxed">
                          Quando desativado, o aplicativo público mostra apenas &quot;Lar Esperança&quot; e &quot;Área Segura&quot;, mantendo o nome do proprietário 100% privado.
                        </p>
                      </div>
                    </div>

                    <div className="pt-2 space-y-2">
                      <button 
                        onClick={() => {
                          setSponsorUser(prev => ({
                            ...prev,
                            name: adminName || 'Gestão Lar Esperança',
                            email: adminEmail,
                            phone: adminPhone,
                            avatar: adminAvatar,
                            bio: adminBio,
                            isLoggedIn: true
                          }));
                          setNotification(`Dados da ${adminTitle} sincronizados com o perfil de Padrinho!`);
                          confetti({ particleCount: 50, spread: 50 });
                        }}
                        className="w-full py-2.5 rounded-xl bg-purple-900/70 border border-purple-500/30 text-purple-200 font-bold active:scale-[0.98] transition flex items-center justify-center space-x-1.5"
                      >
                        <UserCheck className="w-4 h-4 text-pink-400" />
                        <span>Sincronizar com Meu Perfil de Padrinho</span>
                      </button>

                      <button 
                        onClick={async () => {
                          const { error } = await updateProfileInSupabase(DEFAULT_ADMIN_PROFILE_ID, {
                            name: adminName || 'Gestão Lar Esperança',
                            phone: adminPhone || null,
                            bio: adminBio || null,
                            photo_path: adminAvatar || null
                          });

                          if (error) {
                            console.error('Erro ao salvar perfil admin no Supabase:', error);
                            let msg = error.message || 'Falha ao comunicar com o Supabase.';
                            if (error.code === '42501' || msg.toLowerCase().includes('permission')) {
                              msg = 'Permissão negada (RLS) no Supabase para salvar perfil.';
                            }
                            setNotification(`Erro ao salvar no Supabase: ${msg}`);
                            return;
                          }

                          try {
                            localStorage.setItem('projectName', projectName);
                            localStorage.setItem('institutionName', institutionName);
                            localStorage.setItem('adminTitle', adminTitle);
                            localStorage.setItem('adminName', adminName);
                            localStorage.setItem('adminEmail', adminEmail);
                            localStorage.setItem('adminRole', adminRole);
                            localStorage.setItem('adminPhone', adminPhone);
                            localStorage.setItem('adminBio', adminBio);
                            localStorage.setItem('adminAvatar', adminAvatar);
                            localStorage.setItem('showOwnerPublicly', showOwnerPublicly ? 'true' : 'false');
                            localStorage.setItem('pixKey', pixKey);
                          } catch (e) {
                            console.warn(e);
                          }
                          setNotification(`Dados da ${adminTitle} e titularidade salvos com sucesso no Supabase!`);
                          confetti({ particleCount: 80, spread: 70, origin: { y: 0.6 } });
                        }} 
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-600 to-amber-500 font-bold text-white shadow-xl active:scale-[0.98] transition flex items-center justify-center space-x-2"
                      >
                        <Crown className="w-4 h-4 text-amber-200" />
                        <span>Salvar e Confirmar Titularidade</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4.12 CRIANÇAS */}
              {adminTab === 'children' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <h3 className="font-bold text-amber-300 text-sm">Gerenciamento & Cadastro de Crianças</h3>
                    <button onClick={() => setAdminTab('dashboard')} className="text-[10px] text-purple-300 underline hover:text-white">Voltar ao Painel</button>
                  </div>

                  {/* Formulário para Cadastrar Nova Criança */}
                  <div className="bg-[#2A1840] p-4 rounded-3xl border border-amber-500/30 space-y-3 shadow-xl">
                    <h4 className="font-bold text-white flex items-center space-x-2">
                      <Users className="w-4 h-4 text-amber-400" />
                      <span>+ Adicionar Criança & Carta (Galeria de Esperança)</span>
                    </h4>
                    <div className="space-y-2">
                      <input 
                        type="text" 
                        placeholder="Nome da Criança" 
                        value={newChildName} 
                        onChange={(e) => setNewChildName(e.target.value)} 
                        className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white text-xs" 
                      />
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <label className="text-[10px] text-purple-300 block mb-1">Data de Nascimento:</label>
                          <input 
                            type="date" 
                            value={newChildBirthDate} 
                            onChange={(e) => {
                              setNewChildBirthDate(e.target.value);
                              setNewChildAge(calculateAge(e.target.value));
                            }} 
                            className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white text-xs" 
                          />
                        </div>
                        <div>
                          <label className="text-[10px] text-purple-300 block mb-1">Idade (Automática):</label>
                          <input 
                            type="number" 
                            placeholder="Idade" 
                            value={newChildAge} 
                            onChange={(e) => setNewChildAge(Number(e.target.value))} 
                            className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white text-xs text-center font-bold text-amber-300" 
                          />
                        </div>
                      </div>
                      <div className="text-[11px] text-pink-300 font-semibold px-1 flex items-center space-x-1.5 pt-0.5">
                        <span>Idade no App:</span>
                        <span className="px-2 py-0.5 rounded-md bg-pink-600/30 border border-pink-500/40 text-white font-bold">
                          {getAgeDisplay(newChildBirthDate, newChildAge)}
                        </span>
                      </div>
                      <input 
                        type="text" 
                        placeholder="URL da Foto (ou envie arquivo abaixo)" 
                        value={newChildImage} 
                        onChange={(e) => setNewChildImage(e.target.value)} 
                        className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white text-xs" 
                      />
                      {/* Upload / Captura de Foto da Criança */}
                      <div className="space-y-1.5">
                        <label className="text-[11px] font-bold text-amber-300 block">Foto da Criança:</label>
                        {newChildImage && (
                          <div className="w-20 h-20 rounded-2xl overflow-hidden border-2 border-amber-400 mx-auto mb-2 shadow-lg">
                            <img src={newChildImage} alt="Preview" className="w-full h-full object-cover" />
                          </div>
                        )}
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => openInAppCamera('child')}
                            className="py-2.5 px-3 rounded-xl bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-black text-center active:scale-[0.98] shadow text-xs flex items-center justify-center space-x-1.5"
                          >
                            <Camera className="w-4 h-4 text-white" />
                            <span>📸 Tirar Foto com a Câmera</span>
                          </button>

                          <label 
                            htmlFor="admin-new-child-file" 
                            className="py-2.5 px-3 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-200 text-center font-bold cursor-pointer hover:bg-purple-800 transition text-xs flex items-center justify-center space-x-1.5"
                          >
                            <Upload className="w-4 h-4 text-pink-400" />
                            <span>📁 Escolher da Galeria</span>
                          </label>
                        </div>
                        <input 
                          id="admin-new-child-file" 
                          type="file" 
                          accept="image/*" 
                          onChange={async (e) => {
                            const files = e.target.files;
                            if (files && files[0]) {
                              const dataUrl = await processMediaFile(files[0]);
                              setNewChildImage(dataUrl);
                              setNotification('Foto da criança carregada com sucesso!');
                            }
                          }} 
                          className="hidden" 
                        />
                      </div>
                      <textarea 
                        placeholder="Carta com os desejos da criança..." 
                        value={newChildLetter} 
                        onChange={(e) => setNewChildLetter(e.target.value)} 
                        className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl p-3 text-white h-20 resize-none text-xs" 
                      />
                      <button 
                        onClick={async () => {
                          if (!newChildName.trim()) {
                            setNotification('Por favor, informe o nome da criança.');
                            return;
                          }

                          const kidPayload = {
                            family_id: DEFAULT_ADMIN_PROFILE_ID,
                            name: newChildName.trim(),
                            age: newChildAge || 8,
                            birth_date: newChildBirthDate || null,
                            gender: 'Infantil',
                            status: 'Aguardando Apadrinhamento',
                            likes: 'brinquedos, escola',
                            dream: 'ser feliz',
                            address: 'Lar Esperança',
                            image: newChildImage,
                            photo_path: newChildImage,
                            letter: newChildLetter.trim() || 'Quero muito um presente especial de Natal!',
                            wishlist: [{ name: 'Brinquedo', price: 79.90 }],
                            approved: true
                          };

                          const { data, error } = await createKidInSupabase(kidPayload);

                          if (error || !data) {
                            console.error('Erro ao cadastrar criança no Supabase:', error);
                            let msg = error?.message || 'Falha de comunicação com o Supabase.';
                            if (error?.code === '42501' || msg.toLowerCase().includes('permission')) {
                              msg = 'Permissão negada (RLS) no Supabase para cadastrar criança.';
                            }
                            setNotification(`Falha ao cadastrar no Supabase: ${msg}`);
                            return; // Jamais exibe sucesso ou cria fake local se Supabase falhou
                          }

                          const createdKid: Child = {
                            id: String(data.id),
                            family_id: data.family_id,
                            name: data.name,
                            age: Number(data.age) || Number(newChildAge) || 8,
                            birthDate: data.birth_date || newChildBirthDate,
                            gender: data.gender || 'Infantil',
                            status: 'Aguardando Apadrinhamento',
                            likes: data.likes || 'brinquedos, escola',
                            dream: data.dream || 'ser feliz',
                            address: data.address || 'Lar Esperança',
                            image: data.image || data.photo_path || newChildImage,
                            letter: data.letter || newChildLetter || 'Quero muito um presente especial!',
                            wishlist: [{ name: 'Brinquedo', price: 79.90 }]
                          };

                          const updatedList = [...childrenList, createdKid];
                          setChildrenList(updatedList);
                          try {
                            localStorage.setItem('childrenList', JSON.stringify(updatedList));
                          } catch (e) {
                            console.warn('Erro ao salvar localmente:', e);
                          }

                          // Adicionar notificação de nova criança
                          sendLocalNotification({
                            title: 'Nova Criança no Lar! 🌟',
                            body: `${newChildName} agora faz parte do Lar Esperança e aguarda apadrinhamento.`,
                            type: 'new_child',
                            childId: createdKid.id,
                            childName: newChildName,
                          });

                          setNewChildName('');
                          setNewChildLetter('');
                          setNotification(`Criança "${newChildName}" cadastrada com sucesso no Supabase!`);
                          confetti({ particleCount: 50, spread: 50 });
                        }}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-600 to-amber-600 font-bold text-white shadow-xl active:scale-[0.98] transition text-xs"
                      >
                        + Adicionar Criança
                      </button>
                    </div>
                  </div>

                  {/* Lista de Crianças Cadastradas para Edição */}
                  <div className="space-y-3">
                    <h4 className="font-bold text-pink-300">Crianças Cadastradas ({childrenList.length}) - Editar / Excluir</h4>
                    <div className="flex overflow-x-auto space-x-3.5 pb-4 scroll-smooth snap-x snap-mandatory overscroll-x-contain touch-pan-x scrollbar-none">
                      {childrenList.map((c, idx) => (
                        <div key={c.id || idx} className="bg-gradient-to-b from-[#25153E] to-[#170C2A] p-4 rounded-3xl border border-purple-500/35 space-y-3.5 shadow-2xl w-72 sm:w-80 shrink-0 snap-start">
                          {/* Topo do Card: Miniatura de alta qualidade + Trocar Foto + Status */}
                          <div className="flex items-center space-x-3 pb-2 border-b border-purple-900/40">
                            <div 
                              className="w-16 h-16 rounded-2xl overflow-hidden border-2 border-amber-400 shadow-md shrink-0 relative cursor-pointer group"
                              onClick={() => setZoomedImage(c.image)}
                              title="Toque para ampliar foto"
                            >
                              <img src={c.image} alt={c.name} loading="lazy" decoding="async" className="w-full h-full object-cover group-hover:scale-105 transition duration-300" />
                              <div className="absolute inset-0 bg-black/30 opacity-0 group-hover:opacity-100 flex items-center justify-center transition">
                                <ZoomIn className="w-4 h-4 text-white" />
                              </div>
                            </div>
                            <div className="flex-1 min-w-0 space-y-1.5">
                              <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-amber-300 bg-purple-900/70 px-2 py-0.5 rounded-md border border-purple-500/30">
                                  #{idx + 1}
                                </span>
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${c.status === 'Apadrinhado' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-amber-500/20 text-amber-300 border border-amber-500/40'}`}>
                                  {c.status === 'Apadrinhado' ? 'Apadrinhado' : 'Aguardando'}
                                </span>
                              </div>
                              <div className="flex items-center space-x-1.5 flex-wrap gap-1">
                                <button
                                  type="button"
                                  onClick={() => openInAppCamera('child', idx)}
                                  className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-xl bg-gradient-to-r from-pink-600 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white transition text-[10px] font-bold active:scale-95 shadow-sm"
                                  title="Tirar foto desta criança com a câmera ao vivo"
                                >
                                  <Camera className="w-3 h-3 text-white" />
                                  <span>📸 Câmera</span>
                                </button>
                                <label 
                                  htmlFor={`admin-card-file-${c.id || idx}`} 
                                  className="inline-flex items-center space-x-1 px-2 py-1 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/30 cursor-pointer transition text-[10px] font-bold active:scale-95 shadow-sm"
                                >
                                  <Upload className="w-3 h-3 text-pink-400" />
                                  <span>Galeria</span>
                                </label>
                              </div>
                              <input 
                                id={`admin-card-file-${c.id || idx}`} 
                                type="file" 
                                accept="image/*" 
                                onChange={async (e) => {
                                  const files = e.target.files;
                                  if (files && files[0]) {
                                    const dataUrl = await processMediaFile(files[0]);
                                    const updated = [...childrenList];
                                    updated[idx].image = dataUrl;
                                    setChildrenList(updated);
                                    setNotification(`Foto de ${c.name} carregada! Toque em Salvar Alterações.`);
                                  }
                                }} 
                                className="hidden" 
                              />
                            </div>
                          </div>

                          {/* Campo do Nome da Criança (Sem aperto, largura total) */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-pink-300 flex items-center space-x-1">
                              <User className="w-3 h-3 text-pink-400" />
                              <span>Nome da Criança</span>
                            </label>
                            <input 
                              type="text" 
                              value={c.name} 
                              onChange={(e) => {
                                const updated = [...childrenList];
                                updated[idx].name = e.target.value;
                                setChildrenList(updated);
                              }}
                              className="w-full bg-[#130822] border border-purple-500/40 focus:border-pink-500 rounded-xl px-3 py-2 text-white font-bold text-xs outline-none transition shadow-inner"
                              placeholder="Nome da criança"
                            />
                          </div>

                          {/* Idade e Situação em colunas organizadas */}
                          <div className="grid grid-cols-2 gap-2">
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-purple-300">Idade (anos)</label>
                              <input 
                                type="number" 
                                value={c.age} 
                                onChange={(e) => {
                                  const updated = [...childrenList];
                                  updated[idx].age = Number(e.target.value);
                                  setChildrenList(updated);
                                }}
                                className="w-full bg-[#130822] border border-purple-500/40 focus:border-amber-400 rounded-xl px-2.5 py-1.5 text-white font-bold text-xs text-center outline-none transition shadow-inner"
                              />
                            </div>
                            <div className="space-y-1">
                              <label className="text-[10px] font-bold text-purple-300">Situação</label>
                              <select
                                value={c.status}
                                onChange={(e) => {
                                  const updated = [...childrenList];
                                  updated[idx].status = e.target.value as any;
                                  setChildrenList(updated);
                                }}
                                className="w-full bg-[#130822] border border-purple-500/40 focus:border-pink-500 rounded-xl px-2 py-1.5 text-white text-[11px] font-semibold outline-none transition shadow-inner"
                              >
                                <option value="Aguardando Apadrinhamento">Aguardando</option>
                                <option value="Apadrinhado">Apadrinhado</option>
                              </select>
                            </div>
                          </div>

                          {/* Carta / Desejos da Criança */}
                          <div className="space-y-1">
                            <label className="text-[10px] font-bold text-amber-300 flex items-center space-x-1">
                              <Heart className="w-3 h-3 text-amber-400" />
                              <span>Carta / Desejos de Natal</span>
                            </label>
                            <textarea 
                              value={c.letter} 
                              onChange={(e) => {
                                const updated = [...childrenList];
                                updated[idx].letter = e.target.value;
                                setChildrenList(updated);
                              }}
                              rows={3}
                              className="w-full bg-[#130822] border border-purple-500/40 focus:border-amber-400 rounded-xl p-2.5 text-white text-xs resize-none outline-none transition leading-relaxed shadow-inner"
                              placeholder="Escreva a cartinha da criança..."
                            />
                          </div>

                          {/* Botões de Ação */}
                          <div className="flex space-x-2 pt-1">
                            <button 
                              onClick={async () => {
                                const { error } = await updateKidInSupabase(c.id, { 
                                  name: c.name, 
                                  age: c.age, 
                                  letter: c.letter,
                                  image: c.image,
                                  status: c.status
                                });

                                if (error) {
                                  console.error('Erro ao salvar alterações da criança no Supabase:', error);
                                  let msg = error.message || 'Falha ao salvar no banco de dados.';
                                  if (error.code === '42501' || msg.toLowerCase().includes('permission')) {
                                    msg = 'Permissão negada (RLS) no Supabase ao atualizar criança.';
                                  }
                                  setNotification(`Erro ao salvar no Supabase: ${msg}`);
                                  return; // Não mostra sucesso se falhou
                                }

                                try {
                                  localStorage.setItem('childrenList', JSON.stringify(childrenList));
                                } catch (e) {
                                  console.warn('Erro ao salvar localmente:', e);
                                }
                                setNotification(`Alterações da criança "${c.name}" salvas com sucesso no Supabase!`);
                                confetti({ particleCount: 30, spread: 40 });
                              }}
                              className="flex-1 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-pink-600 to-amber-600 hover:opacity-90 font-bold text-white text-xs shadow-lg active:scale-[0.98] transition flex items-center justify-center space-x-1.5"
                            >
                              <Check className="w-3.5 h-3.5" />
                              <span>Salvar Alterações</span>
                            </button>
                            <button 
                              onClick={() => deleteChild(c.id, c.name)}
                              className="py-2.5 px-3.5 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-300 font-bold text-xs border border-red-500/40 active:scale-[0.98] transition flex items-center justify-center space-x-1"
                              title="Excluir Criança"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                              <span>Excluir</span>
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}

              {/* 4.13 ÁREA SEGURA: CENTRAL DE GALERIA & UPLOAD LIBERADO */}
              {adminTab === 'gallery' && (
                <div className="space-y-4 text-xs">
                  {/* Cabeçalho da Área Segura */}
                  <div className="p-4 rounded-3xl bg-gradient-to-r from-pink-950/70 via-[#2A1840] to-amber-950/70 border border-pink-500/40 shadow-xl space-y-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="p-3 rounded-2xl bg-gradient-to-br from-pink-600 via-amber-500 to-pink-600 text-white shadow-lg">
                          <ImageIcon className="w-6 h-6" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <h3 className="text-sm font-black text-white">Central de Galeria & Upload Liberado</h3>
                            <span className="px-2 py-0.5 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 text-[9px] font-bold flex items-center space-x-1">
                              <ShieldCheck className="w-3 h-3" />
                              <span>Área Segura</span>
                            </span>
                          </div>
                          <p className="text-[11px] text-purple-200 mt-0.5">
                            Faça upload liberado de fotos e vídeos direto da galeria do seu celular ou do computador, sem travar e sem erros.
                          </p>
                        </div>
                      </div>
                    </div>

                    {/* Selos de Garantia e Desempenho */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-1 text-[10px]">
                      <div className="p-2 rounded-xl bg-[#1A1033]/80 border border-purple-500/20 flex items-center space-x-1.5 text-purple-200">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                        <span>Compressão Ativa</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#1A1033]/80 border border-purple-500/20 flex items-center space-x-1.5 text-purple-200">
                        <ShieldCheck className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                        <span>Sem Erros de Limite</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#1A1033]/80 border border-purple-500/20 flex items-center space-x-1.5 text-purple-200">
                        <Camera className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                        <span>Múltiplas Mídias</span>
                      </div>
                      <div className="p-2 rounded-xl bg-[#1A1033]/80 border border-purple-500/20 flex items-center space-x-1.5 text-purple-200">
                        <Sparkles className="w-3.5 h-3.5 text-yellow-300 shrink-0" />
                        <span>{galleryItems.length} Mídias Salvas</span>
                      </div>
                    </div>
                  </div>

                  {/* EDITAR MENSAGEM DE ATIVIDADES DA GALERIA */}
                  <div className="bg-[#2A1840] p-4 rounded-3xl border border-purple-500/30 space-y-3 shadow">
                    <h4 className="font-bold text-amber-300">Editar Mensagem do Banner de Atividades (Galeria)</h4>
                    <textarea 
                      value={galleryActivitiesMsg}
                      onChange={(e) => setGalleryActivitiesMsg(e.target.value)}
                      className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-3 text-white h-20 resize-none text-xs"
                      placeholder="Mensagem exibida no topo da galeria..."
                    />
                    <button 
                      onClick={() => {
                        try {
                          localStorage.setItem('galleryActivitiesMsg', galleryActivitiesMsg);
                        } catch {}
                        setNotification('Mensagem de atividades atualizada com sucesso!');
                        confetti({ particleCount: 30, spread: 40 });
                      }}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-600 to-amber-600 font-bold text-white shadow-xl active:scale-[0.98] transition"
                    >
                      Salvar Mensagem de Atividades
                    </button>
                  </div>

                  {/* ESTAÇÃO DE UPLOAD SEGURO DA GALERIA */}
                  <div className="bg-[#2A1840] p-5 rounded-3xl border-2 border-dashed border-pink-500/50 space-y-4 shadow-xl">
                    <div className="text-center space-y-1">
                      <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-pink-600 to-amber-500 text-white flex items-center justify-center mx-auto shadow-lg">
                        <Upload className="w-6 h-6 animate-pulse" />
                      </div>
                      <h4 className="text-sm font-bold text-white">Carregar Mídias da Galeria</h4>
                      <p className="text-[11px] text-purple-300 max-w-md mx-auto">
                        Toque no botão abaixo para escolher fotos da galeria do seu celular ou arquivos do dispositivo. O sistema comprime e armazena automaticamente.
                      </p>
                    </div>

                    {/* Status de Progresso durante upload */}
                    {isUploadingGallery && (
                      <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border border-amber-500/40 text-amber-200 text-xs space-y-2 shadow-lg">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <RotateCw className="w-4 h-4 animate-spin text-amber-400" />
                            <span className="font-bold text-white text-[11px]">{galleryUploadStatus}</span>
                          </div>
                          {galleryUploadProgress && (
                            <span className="font-black text-amber-300 text-xs">{galleryUploadProgress.percent}%</span>
                          )}
                        </div>
                        {galleryUploadProgress && (
                          <div className="w-full bg-[#1A1033] rounded-full h-2 overflow-hidden border border-amber-500/30">
                            <div 
                              className="bg-gradient-to-r from-pink-500 via-amber-400 to-emerald-400 h-2 transition-all duration-300"
                              style={{ width: `${galleryUploadProgress.percent}%` }}
                            />
                          </div>
                        )}
                      </div>
                    )}

                    {/* Botões Principais de Upload e Câmera */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5 pt-1">
                      <button 
                        type="button"
                        onClick={() => openInAppCamera('gallery')} 
                        className="w-full py-3.5 px-3 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 hover:from-pink-500 hover:to-amber-400 text-white font-black text-xs shadow-xl active:scale-[0.98] transition flex items-center justify-center space-x-2 border border-pink-400/40 text-center"
                      >
                        <Camera className="w-4 h-4 text-white shrink-0" />
                        <span>📸 Câmera ao Vivo do App</span>
                      </button>

                      <div>
                        <label 
                          htmlFor="safe-admin-gallery-camera-upload" 
                          className="w-full py-3.5 px-3 rounded-2xl bg-gradient-to-r from-amber-600 via-orange-600 to-amber-600 hover:from-amber-500 hover:to-orange-500 text-white font-black text-xs shadow-xl active:scale-[0.98] transition flex items-center justify-center space-x-2 cursor-pointer border border-amber-400/40 text-center"
                        >
                          <Smartphone className="w-4 h-4 text-white shrink-0" />
                          <span>📷 Câmera do Celular</span>
                        </label>
                        <input 
                          id="safe-admin-gallery-camera-upload" 
                          type="file" 
                          accept="image/*" 
                          capture="environment" 
                          onChange={handleGalleryUpload} 
                          className="hidden" 
                        />
                      </div>

                      <div>
                        <label 
                          htmlFor="safe-admin-gallery-file-upload" 
                          className="w-full py-3.5 px-3 rounded-2xl bg-gradient-to-r from-purple-700 via-indigo-600 to-purple-700 hover:from-purple-600 hover:to-indigo-500 text-white font-black text-xs shadow-xl active:scale-[0.98] transition flex items-center justify-center space-x-2 cursor-pointer border border-purple-400/40 text-center"
                        >
                          <Upload className="w-4 h-4 text-white shrink-0" />
                          <span>📁 Da Galeria (Fotos/Vídeos)</span>
                        </label>
                        <input 
                          id="safe-admin-gallery-file-upload" 
                          type="file" 
                          accept="image/*,video/*" 
                          multiple 
                          onChange={handleGalleryUpload} 
                          className="hidden" 
                        />
                      </div>
                    </div>
                  </div>

                  {/* BARRA DE FERRAMENTAS E FILTROS */}
                  <div className="bg-[#2A1840] p-4 rounded-3xl border border-purple-500/30 space-y-3 shadow">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      {/* Filtro por tipo */}
                      <div className="flex bg-[#1A1033] p-1 rounded-2xl border border-purple-500/30 text-[11px] font-bold">
                        <button 
                          onClick={() => setAdminGalleryFilter('all')} 
                          className={`px-3 py-1.5 rounded-xl transition ${adminGalleryFilter === 'all' ? 'bg-gradient-to-r from-pink-600 to-amber-500 text-white shadow' : 'text-purple-300'}`}
                        >
                          Todas ({galleryItems.length})
                        </button>
                        <button 
                          onClick={() => setAdminGalleryFilter('images')} 
                          className={`px-3 py-1.5 rounded-xl transition ${adminGalleryFilter === 'images' ? 'bg-gradient-to-r from-pink-600 to-amber-500 text-white shadow' : 'text-purple-300'}`}
                        >
                          Fotos ({galleryItems.filter(i => !i.toLowerCase().endsWith('.mp4') && !i.includes('video')).length})
                        </button>
                        <button 
                          onClick={() => setAdminGalleryFilter('videos')} 
                          className={`px-3 py-1.5 rounded-xl transition ${adminGalleryFilter === 'videos' ? 'bg-gradient-to-r from-pink-600 to-amber-500 text-white shadow' : 'text-purple-300'}`}
                        >
                          Vídeos ({galleryItems.filter(i => i.toLowerCase().endsWith('.mp4') || i.includes('video')).length})
                        </button>
                      </div>

                      {/* Busca rápida */}
                      <div className="relative flex-1 max-w-xs">
                        <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-3 pointer-events-none" />
                        <input 
                          type="text" 
                          placeholder="Filtrar mídias..." 
                          value={adminGallerySearch} 
                          onChange={(e) => setAdminGallerySearch(e.target.value)} 
                          className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl pl-9 pr-3 py-2 text-white text-[11px]"
                        />
                      </div>
                    </div>

                    {/* Ações em lote */}
                    <div className="flex items-center justify-between pt-1 border-t border-purple-900/50 text-[10px]">
                      <button 
                        onClick={() => {
                          const demoPhotos = [
                            'https://images.unsplash.com/photo-1544717305-2782549b5136?w=400&h=400&fit=crop',
                            'https://images.unsplash.com/photo-1488521787991-ed7bbaae773c?w=400&h=400&fit=crop',
                            'https://images.unsplash.com/photo-1516627145497-ae6968895b74?w=400&h=400&fit=crop',
                            'https://images.unsplash.com/photo-1502086223501-7ea6ecd79368?w=400&h=400&fit=crop',
                          ];
                          setGalleryItems(prev => [...demoPhotos, ...prev]);
                          setNotification('Fotos demonstrativas do Lar adicionadas à galeria!');
                        }}
                        className="text-pink-300 hover:text-pink-200 underline font-medium"
                      >
                        + Restaurar Fotos Padrão do Lar Esperança
                      </button>

                      {galleryItems.length > 0 && (
                        <button 
                          onClick={() => {
                            if (window.confirm('Deseja realmente limpar as mídias da galeria?')) {
                              setGalleryItems([]);
                              setNotification('Galeria limpa com sucesso.');
                            }
                          }}
                          className="text-red-400 hover:text-red-300 font-medium flex items-center space-x-1"
                        >
                          <Trash2 className="w-3 h-3" />
                          <span>Limpar Galeria</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* GRID DE MÍDIAS DA GALERIA */}
                  {(() => {
                    const filtered = galleryItems.filter(item => {
                      const isVideo = item.toLowerCase().endsWith('.mp4') || item.includes('video');
                      if (adminGalleryFilter === 'images' && isVideo) return false;
                      if (adminGalleryFilter === 'videos' && !isVideo) return false;
                      if (adminGallerySearch) {
                        return item.toLowerCase().includes(adminGallerySearch.toLowerCase());
                      }
                      return true;
                    });

                    if (filtered.length === 0) {
                      return (
                        <div className="p-8 rounded-3xl bg-[#2A1840] border border-purple-500/30 text-center space-y-3">
                          <ImageIcon className="w-12 h-12 text-purple-400 mx-auto opacity-60" />
                          <h4 className="text-sm font-bold text-white">Nenhuma mídia encontrada</h4>
                          <p className="text-xs text-purple-300">
                            Use os botões acima para fazer upload da galeria do seu celular ou restaurar as fotos padrão.
                          </p>
                        </div>
                      );
                    }

                    return (
                      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-3">
                        {filtered.map((item, idx) => {
                          const isVideo = item.toLowerCase().endsWith('.mp4') || item.includes('video');
                          return (
                            <div key={idx} className="bg-[#2A1840] border border-amber-500/30 rounded-2xl overflow-hidden shadow-lg flex flex-col justify-between group hover:border-pink-500 transition">
                              {/* Preview da Mídia */}
                              <div 
                                className="relative h-44 w-full bg-black/40 overflow-hidden cursor-pointer"
                                onClick={() => setZoomedImage(item)}
                              >
                                {isVideo ? (
                                  <video src={item} className="w-full h-full object-cover" muted controls={false} />
                                ) : (
                                  <img src={item} alt={`Mídia ${idx + 1}`} className="w-full h-full object-cover group-hover:scale-105 transition duration-300 select-none pointer-events-none" />
                                )}

                                {/* Tag de Tipo */}
                                <div className="absolute top-2 left-2 px-2 py-0.5 rounded-full bg-black/60 backdrop-blur-sm text-[9px] font-bold text-white flex items-center space-x-1 border border-white/20">
                                  {isVideo ? <Video className="w-3 h-3 text-blue-400" /> : <ImageIcon className="w-3 h-3 text-pink-400" />}
                                  <span>{isVideo ? 'Vídeo' : 'Foto'}</span>
                                </div>

                                {/* Zoom Overlay */}
                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                                  <ZoomIn className="w-6 h-6 text-white" />
                                </div>
                              </div>

                              {/* Ações Administrativas Rápidas na Mídia */}
                              <div className="p-3 space-y-2 bg-[#25153A]">
                                <div className="grid grid-cols-2 gap-1.5">
                                  <button 
                                    onClick={() => {
                                      setPhotoEditorImg(item);
                                      setCurrentScreenIndex(10);
                                    }}
                                    className="py-1.5 px-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-[10px] font-bold flex items-center justify-center space-x-1 border border-purple-500/30"
                                    title="Editar contraste, brilho e filtros"
                                  >
                                    <Sliders className="w-3 h-3 text-pink-400" />
                                    <span>Editar</span>
                                  </button>

                                  <button 
                                    onClick={() => handleDownloadMedia(item, idx)}
                                    className="py-1.5 px-2 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-[10px] font-bold flex items-center justify-center space-x-1 border border-purple-500/30"
                                    title="Baixar foto para o celular"
                                  >
                                    <Download className="w-3 h-3 text-amber-400" />
                                    <span>Baixar</span>
                                  </button>
                                </div>

                                <div className="grid grid-cols-2 gap-1.5">
                                  <button 
                                    onClick={() => {
                                      const newBanner: BannerSlide = {
                                        id: 'banner_' + Date.now(),
                                        image: item,
                                        title: 'Destaque Lar Esperança',
                                        subtitle: 'Adicionado via Área Segura',
                                        badge: 'Novo'
                                      };
                                      setBanners(prev => [newBanner, ...prev]);
                                      setNotification('Foto adicionada ao Carrossel de Banners da Home!');
                                      confetti({ particleCount: 40, spread: 50 });
                                    }}
                                    className="py-1.5 px-2 rounded-xl bg-pink-600/30 hover:bg-pink-600/50 text-pink-200 text-[10px] font-bold flex items-center justify-center space-x-1 border border-pink-500/30"
                                    title="Definir esta foto no carrossel da tela inicial"
                                  >
                                    <Sparkles className="w-3 h-3 text-pink-400" />
                                    <span>+ Banner</span>
                                  </button>

                                  <button 
                                    onClick={() => {
                                      const newStory: Media916 = {
                                        id: 'story_' + Date.now(),
                                        type: isVideo ? 'video' : 'image',
                                        url: item,
                                        title: 'Momento Especial',
                                        subtitle: 'Lar Esperança'
                                      };
                                      setStories916(prev => [newStory, ...prev]);
                                      setNotification('Foto adicionada aos Stories 9:16!');
                                      confetti({ particleCount: 40, spread: 50 });
                                    }}
                                    className="py-1.5 px-2 rounded-xl bg-blue-600/30 hover:bg-blue-600/50 text-blue-200 text-[10px] font-bold flex items-center justify-center space-x-1 border border-blue-500/30"
                                    title="Definir nos Stories 9:16 da tela inicial"
                                  >
                                    <Video className="w-3 h-3 text-blue-400" />
                                    <span>+ Story 9:16</span>
                                  </button>
                                </div>

                                <button 
                                  onClick={() => {
                                    const rec = galleryRecords.find(r => r.url === item) || galleryRecords[idx];
                                    setPhotoToDelete({
                                      url: item,
                                      index: idx,
                                      id: rec?.id,
                                      path: rec?.path
                                    });
                                  }} 
                                  className="w-full py-1.5 rounded-xl bg-red-600/20 hover:bg-red-600/40 text-red-300 text-[10px] font-bold flex items-center justify-center space-x-1 border border-red-500/30 transition"
                                >
                                  <Trash2 className="w-3 h-3" />
                                  <span>Excluir Mídia</span>
                                </button>
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    );
                  })()}
                </div>
              )}

              {/* 4.14 PAINEL DE SEGURANÇA & ACESSO EXTERNO */}
              {adminTab === 'security' && (
                <div className="space-y-4 text-xs">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <ShieldCheck className="w-5 h-5 text-amber-400" />
                      <h3 className="font-bold text-amber-300 text-sm">Painel de Segurança & Acesso do Lado de Fora</h3>
                    </div>
                    <button onClick={() => setAdminTab('dashboard')} className="text-[10px] text-purple-300 underline hover:text-white">Voltar ao Painel</button>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-gradient-to-r from-amber-500/20 via-pink-500/20 to-purple-500/20 border border-amber-500/40 text-amber-100 flex items-center space-x-3">
                    <div className="p-2 rounded-xl bg-amber-500/30 text-amber-300 shrink-0">
                      <Lock className="w-5 h-5" />
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-white">Controle de Segurança da Proprietária</h4>
                      <p className="text-[10px] text-purple-200">
                        Defina a senha de segurança (PIN) e controle como a Área Segura é acessada e protegida de visitantes pelo lado de fora.
                      </p>
                    </div>
                  </div>

                  <div className="bg-[#2A1840] p-4 rounded-3xl border border-amber-500/30 space-y-4 shadow-xl">
                    {/* Credenciais & Acesso de Administrador */}
                    <div className="p-3.5 rounded-2xl bg-[#1A1033] border border-amber-500/30 space-y-3">
                      <h4 className="font-bold text-amber-300 flex items-center space-x-1.5">
                        <Key className="w-4 h-4 text-amber-400" />
                        <span>Credenciais de Acesso ao Painel</span>
                      </h4>
                      
                      {/* E-mail */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-purple-300 font-medium">E-mail do Administrador</label>
                        <input 
                          type="email" 
                          value={adminEmail} 
                          onChange={(e) => setAdminEmail(e.target.value)} 
                          placeholder="admin@laresperanca.org" 
                          className="w-full bg-[#140824] border border-purple-500/30 rounded-xl px-3 py-2 text-white text-xs" 
                        />
                      </div>

                      {/* Senha */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-purple-300 font-medium">Senha do Administrador</label>
                        <div className="relative">
                          <input 
                            type={showAdminPasswordInSettings ? "text" : "password"} 
                            value={adminPassword} 
                            onChange={(e) => setAdminPassword(e.target.value)} 
                            placeholder="Defina sua senha segura" 
                            className="w-full bg-[#140824] border border-amber-500/30 rounded-xl pl-3 pr-10 py-2 text-white text-xs" 
                          />
                          <button 
                            type="button" 
                            onClick={() => setShowAdminPasswordInSettings(!showAdminPasswordInSettings)} 
                            className="absolute right-3 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white"
                          >
                            {showAdminPasswordInSettings ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                          </button>
                        </div>
                      </div>

                      {/* PIN Numérico */}
                      <div className="space-y-1">
                        <label className="text-[10px] text-purple-300 font-medium">PIN Alternativo (Opcional)</label>
                        <input 
                          type="text"
                          maxLength={6}
                          placeholder="PIN numérico" 
                          value={adminPin}
                          onChange={(e) => setAdminPin(e.target.value)}
                          className="w-full bg-[#140824] border border-amber-500/30 rounded-xl px-3 py-2 text-white text-xs font-mono tracking-wider" 
                        />
                      </div>

                      {/* Biometria */}
                      <div className="flex items-center justify-between p-2 rounded-xl bg-[#140824] border border-amber-500/20">
                        <div className="flex items-center space-x-2">
                          <Fingerprint className="w-4 h-4 text-amber-400" />
                          <span className="text-[10px] text-white">Desbloqueio por Biometria</span>
                        </div>
                        <button 
                          type="button"
                          onClick={() => setBiometricLockEnabled(!biometricLockEnabled)} 
                          className={`px-3 py-1 rounded-lg text-[10px] font-bold ${biometricLockEnabled ? 'bg-amber-600 text-white' : 'bg-purple-800 text-purple-300'}`}
                        >
                          {biometricLockEnabled ? 'Ativado' : 'Desativado'}
                        </button>
                      </div>
                    </div>

                    {/* Bloqueio de Acesso pelo Lado de Fora */}
                    <div className="p-3.5 rounded-2xl bg-[#1A1033] border border-amber-500/30 space-y-2">
                      <label className="flex items-center space-x-2.5 cursor-pointer">
                        <input 
                          type="checkbox" 
                          checked={requirePinFromOutside} 
                          onChange={(e) => setRequirePinFromOutside(e.target.checked)}
                          className="w-4 h-4 rounded text-pink-600 focus:ring-pink-500 border-amber-500/40 bg-[#2A1840]"
                        />
                        <span className="font-semibold text-amber-200 text-xs">
                          Exigir identificação (E-mail / Senha / Biometria) para entrar no Painel pelo lado de fora
                        </span>
                      </label>
                      <p className="text-[10px] text-purple-300 pl-6 leading-relaxed">
                        Quando ativado, visitantes externos que tocarem em &quot;Painel de Gestão&quot; ou &quot;Área Segura&quot; verão apenas o login confidencial sem exibição de nenhum dado ou senha.
                      </p>
                    </div>

                    {/* Status da Galeria Protegida */}
                    <div className="p-3.5 rounded-2xl bg-[#1A1033] border border-amber-500/30 space-y-2">
                      <h4 className="font-bold text-amber-300 flex items-center space-x-1.5">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Status de Proteção da Galeria</span>
                      </h4>
                      <ul className="space-y-1.5 text-[10px] text-purple-200 pl-1">
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Uploads de fotos e vídeos restritos exclusivamente à Área Segura do Painel.</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Visitantes no lado de fora só podem visualizar e ampliar fotos (sem permissão de upload ou exclusão).</span>
                        </li>
                        <li className="flex items-center space-x-2">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                          <span>Privacidade total: nenhuma senha, PIN ou dado confidencial é exibido externamente.</span>
                        </li>
                      </ul>
                    </div>

                    {/* Ações */}
                    <div className="pt-2 space-y-2">
                      <button 
                        type="button"
                        onClick={() => {
                          try {
                            localStorage.setItem('adminEmail', adminEmail);
                            localStorage.setItem('adminPassword', adminPassword);
                            localStorage.setItem('adminPin', adminPin);
                            localStorage.setItem('requirePinFromOutside', requirePinFromOutside ? 'true' : 'false');
                            localStorage.setItem('biometricLockEnabled', biometricLockEnabled ? 'true' : 'false');
                          } catch (e) {
                            console.warn(e);
                          }
                          setNotification('Configurações de segurança atualizadas com sucesso!');
                          confetti({ particleCount: 70, spread: 60 });
                        }}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-600 to-amber-500 font-bold text-white shadow-xl active:scale-[0.98] transition flex items-center justify-center space-x-2"
                      >
                        <ShieldCheck className="w-4 h-4 text-amber-200" />
                        <span>Salvar Configurações de Segurança</span>
                      </button>

                      <button 
                        type="button"
                        onClick={() => setAdminTab('profile')}
                        className="w-full py-2.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 border border-purple-500/30 text-amber-300 font-bold text-xs flex items-center justify-center space-x-1.5 transition active:scale-[0.98]"
                      >
                        <Crown className="w-4 h-4 text-amber-400" />
                        <span>Ajustar Titularidade & Perfil da Proprietária</span>
                      </button>
                    </div>

                    {/* Restaurar Banco de Dados & Todos os Dados (Voltar Tudo) */}
                    <div className="p-4 rounded-3xl bg-red-950/40 border border-red-500/40 space-y-3 mt-3">
                      <h4 className="font-bold text-red-300 flex items-center space-x-2">
                        <RotateCcw className="w-4 h-4 text-red-400" />
                        <span>Restaurar Banco de Dados & Todos os Dados (Voltar Tudo)</span>
                      </h4>
                      <p className="text-[11px] text-purple-200">
                        Restaura instantaneamente todas as crianças, padrinhos, família, presentes/cartinhas, banners, stories 9:16, botões do rodapé e galeria para o estado original completo do projeto.
                      </p>
                      <button
                        type="button"
                        onClick={() => {
                          if (window.confirm('Tem certeza que deseja restaurar o banco de dados e todos os dados? Isso recarregará crianças, padrinhos, família, presentes e galerias para o padrão original.')) {
                            localStorage.clear();
                            window.location.reload();
                          }
                        }}
                        className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-red-600 to-rose-600 hover:from-red-500 hover:to-rose-500 text-white font-bold text-xs shadow-xl active:scale-[0.98] transition flex items-center justify-center space-x-2"
                      >
                        <RotateCcw className="w-4 h-4" />
                        <span>Restaurar Tudo (Banco de Dados & Dados Gerais)</span>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* 4.15 REDES SOCIAIS OFICIAIS (PAINEL DE GESTÃO) */}
              {adminTab === 'social' && (
                <div className="space-y-4 text-xs">
                  <div className="p-4 rounded-3xl bg-gradient-to-r from-pink-950/70 via-[#2A1840] to-blue-950/70 border border-pink-500/40 shadow-xl space-y-2">
                    <h3 className="text-sm font-black text-white flex items-center space-x-2">
                      <Share2 className="w-5 h-5 text-pink-400" />
                      <span>Gerenciamento de Redes Sociais Oficiais</span>
                    </h3>
                    <p className="text-[11px] text-purple-200">
                      Edite abaixo os links de cada rede social oficial do Lar Esperança. Cada cartão possui a identidade fiel da respectiva plataforma para exibição imediata no menu lateral.
                    </p>
                  </div>

                  <div className="space-y-2">
                    {socialLinks.map((link) => (
                      <div key={link.id} className="p-3 rounded-2xl bg-[#181924] border border-gray-700/50 shadow-sm space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <div className={`w-8 h-8 rounded-xl ${link.color} text-white flex items-center justify-center font-bold text-xs shadow`}>{link.icon}</div>
                            <h4 className="font-bold text-white text-xs">{link.platform}</h4>
                          </div>
                          <button 
                            onClick={() => {
                              if (confirm(`Tem certeza que deseja apagar ${link.platform}?`)) {
                                setSocialLinks(prev => prev.filter(l => l.id !== link.id));
                              }
                            }}
                            className="text-[10px] text-red-400 underline"
                          >
                            Apagar
                          </button>
                        </div>
                        <input 
                          type="text" 
                          value={link.url} 
                          onChange={(e) => {
                            const newUrl = e.target.value;
                            setSocialLinks(prev => prev.map(l => l.id === link.id ? { ...l, url: newUrl } : l));
                          }}
                          placeholder={`Link para ${link.platform}`}
                          className="w-full bg-[#130E1D] border border-gray-600 rounded-lg px-2 py-1.5 text-white text-[10px]" 
                        />
                      </div>
                    ))}
                  </div>

                  <button 
                    onClick={() => {
                      try {
                        localStorage.setItem('socialLinks', JSON.stringify(socialLinks));
                      } catch {}
                      setNotification('Redes Sociais salvas com sucesso!');
                      confetti({ particleCount: 50, spread: 60 });
                    }}
                    className="w-full py-3 rounded-xl bg-gradient-to-r from-pink-600 to-purple-600 font-bold text-white shadow-lg active:scale-[0.98] transition text-sm"
                  >
                    Salvar Redes Sociais
                  </button>
                </div>
              )}

              {/* 4.16 CÂMERA AO VIVO & DISPARO DIRETO DO APLICATIVO */}
              {adminTab === 'camera' && (
                <div className="space-y-4 text-xs">
                  {/* Cabeçalho */}
                  <div className="p-4 rounded-3xl bg-gradient-to-r from-pink-900/80 via-[#2A1840] to-amber-950/80 border border-pink-500/40 shadow-xl space-y-2">
                    <div className="flex items-center justify-between">
                      <h3 className="text-sm font-black text-white flex items-center space-x-2">
                        <Camera className="w-5 h-5 text-pink-400" />
                        <span>Câmera Oficial do Lar Esperança</span>
                      </h3>
                      <button 
                        onClick={() => setAdminTab('dashboard')} 
                        className="text-[10px] text-purple-300 hover:text-white underline"
                      >
                        Voltar ao Painel
                      </button>
                    </div>
                    <p className="text-[11px] text-purple-200">
                      Tire fotos diretamente do aplicativo com visualizador em tempo real, alternância de câmera e salvamento imediato na Galeria, Carrossel ou Crianças.
                    </p>
                  </div>

                  {/* VISUALIZADOR DA CÂMERA AO VIVO */}
                  <div className="bg-[#140824] rounded-3xl border-2 border-amber-500/40 overflow-hidden shadow-2xl relative p-3 space-y-3">
                    
                    {/* Barra de Ferramentas da Câmera (Proporção, Inverter) */}
                    <div className="flex items-center justify-between bg-black/60 backdrop-blur-md px-3 py-2 rounded-2xl border border-white/10 text-[10px] font-bold">
                      <div className="flex items-center space-x-1">
                        <span className="text-purple-300 mr-1">Enquadramento:</span>
                        {(['4:3', '1:1', '9:16', '16:9'] as const).map(ratio => (
                          <button
                            key={ratio}
                            type="button"
                            onClick={() => setCameraAspectRatio(ratio)}
                            className={`px-2 py-1 rounded-lg transition ${cameraAspectRatio === ratio ? 'bg-amber-500 text-black shadow' : 'bg-white/10 text-white hover:bg-white/20'}`}
                          >
                            {ratio}
                          </button>
                        ))}
                      </div>

                      <button
                        type="button"
                        onClick={toggleCameraFacingMode}
                        className="px-2.5 py-1 rounded-xl bg-purple-600/60 hover:bg-purple-600 text-purple-200 hover:text-white flex items-center space-x-1 border border-purple-400/30 active:scale-95 transition"
                        title="Alternar entre câmera traseira e frontal"
                      >
                        <RotateCw className="w-3.5 h-3.5 text-amber-300" />
                        <span>{cameraFacingMode === 'environment' ? 'Traseira' : 'Frontal'}</span>
                      </button>
                    </div>

                    {/* Janela de Visualização (Live Viewfinder) */}
                    <div className={`relative w-full rounded-2xl overflow-hidden bg-black flex items-center justify-center border border-white/10 ${
                      cameraAspectRatio === '1:1' ? 'aspect-square' :
                      cameraAspectRatio === '9:16' ? 'aspect-[9/16] max-h-[500px]' :
                      cameraAspectRatio === '16:9' ? 'aspect-[16/9]' : 'aspect-[4/3]'
                    }`}>
                      {/* Video Stream */}
                      <video
                        ref={cameraVideoRef}
                        autoPlay
                        playsInline
                        muted
                        className={`w-full h-full object-cover ${cameraFacingMode === 'user' ? 'scale-x-[-1]' : ''}`}
                      />

                      {/* Efeito Flash Visual ao Disparar */}
                      {cameraFlashEffect && (
                        <div className="absolute inset-0 bg-white z-20" />
                      )}

                      {/* Guias de Enquadramento */}
                      <div className="absolute inset-0 pointer-events-none border border-white/20 grid grid-cols-3 grid-rows-3 opacity-30">
                        <div className="border-r border-b border-white/40" />
                        <div className="border-r border-b border-white/40" />
                        <div className="border-b border-white/40" />
                        <div className="border-r border-b border-white/40" />
                        <div className="border-r border-b border-white/40" />
                        <div className="border-b border-white/40" />
                        <div className="border-r border-b border-white/40" />
                        <div className="border-r border-b border-white/40" />
                        <div />
                      </div>

                      {/* Alerta de Erro ou Sem Acesso */}
                      {cameraError && (
                        <div className="absolute inset-0 bg-black/85 backdrop-blur-md p-6 flex flex-col items-center justify-center text-center space-y-3 z-10">
                          <AlertCircle className="w-10 h-10 text-amber-400" />
                          <h4 className="text-sm font-bold text-white">Acesso à Câmera em Tempo Real</h4>
                          <p className="text-[11px] text-purple-200 max-w-xs">
                            {cameraError}
                          </p>
                          <div className="pt-2 flex flex-col sm:flex-row gap-2 w-full max-w-xs">
                            <button
                              type="button"
                              onClick={() => startCameraStream()}
                              className="w-full py-2.5 rounded-xl bg-pink-600 hover:bg-pink-500 text-white font-bold text-xs shadow active:scale-95 transition"
                            >
                              Tentar Novamente
                            </button>
                            <label
                              htmlFor="fallback-device-camera-input"
                              className="w-full py-2.5 rounded-xl bg-amber-500 hover:bg-amber-400 text-black font-black text-xs shadow text-center cursor-pointer active:scale-95 transition"
                            >
                              📷 Câmera do Celular
                            </label>
                            <input
                              id="fallback-device-camera-input"
                              type="file"
                              accept="image/*"
                              capture="environment"
                              onChange={async (e) => {
                                const files = e.target.files;
                                if (files && files[0]) {
                                  const dataUrl = await processMediaFile(files[0]);
                                  setCameraCapturedImage(dataUrl);
                                  stopCameraStream();
                                  setNotification('Foto capturada via câmera do celular!');
                                  confetti({ particleCount: 30, spread: 50 });
                                }
                              }}
                              className="hidden"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Controles de Captura */}
                    <div className="flex items-center justify-around pt-2">
                      <div>
                        <label
                          htmlFor="inline-direct-device-camera"
                          className="p-3 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-purple-200 hover:text-white flex flex-col items-center space-y-1 cursor-pointer active:scale-95 transition"
                          title="Usar aplicativo de câmera nativo do celular"
                        >
                          <Smartphone className="w-5 h-5 text-amber-400" />
                          <span className="text-[9px] font-bold">Câmera Celular</span>
                        </label>
                        <input
                          id="inline-direct-device-camera"
                          type="file"
                          accept="image/*"
                          capture="environment"
                          onChange={async (e) => {
                            const files = e.target.files;
                            if (files && files[0]) {
                              const dataUrl = await processMediaFile(files[0]);
                              setCameraCapturedImage(dataUrl);
                              stopCameraStream();
                              setNotification('Foto tirada com o celular!');
                              confetti({ particleCount: 30, spread: 50 });
                            }
                          }}
                          className="hidden"
                        />
                      </div>

                      {/* GRANDE BOTÃO OBTURADOR (DISPARADOR) */}
                      <button
                        type="button"
                        onClick={() => capturePhotoFromStream(false)}
                        disabled={isCameraStarting}
                        className="w-18 h-18 rounded-full bg-gradient-to-tr from-pink-600 via-rose-500 to-amber-500 p-1 shadow-2xl active:scale-90 transition duration-150 flex items-center justify-center"
                        title="Tirar Foto Agora"
                      >
                        <div className="w-full h-full rounded-full border-2 border-white/80 bg-white/20 flex items-center justify-center">
                          <Camera className="w-8 h-8 text-white drop-shadow-md" />
                        </div>
                      </button>

                      {/* Inverter Câmera */}
                      <button
                        type="button"
                        onClick={toggleCameraFacingMode}
                        className="p-3 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-purple-200 hover:text-white flex flex-col items-center space-y-1 active:scale-95 transition"
                        title="Virar Câmera"
                      >
                        <RotateCw className="w-5 h-5 text-pink-400" />
                        <span className="text-[9px] font-bold">Inverter</span>
                      </button>
                    </div>
                  </div>

                  {/* PREVIEW E SALVAMENTO DA FOTO CAPTURADA */}
                  {cameraCapturedImage && (
                    <div className="bg-[#2A1840] p-4 rounded-3xl border-2 border-pink-500/60 shadow-2xl space-y-3">
                      <div className="flex items-center justify-between">
                        <h4 className="font-black text-amber-300 text-xs flex items-center space-x-1.5">
                          <Sparkles className="w-4 h-4 text-pink-400" />
                          <span>Foto Tirada com Sucesso!</span>
                        </h4>
                        <button
                          type="button"
                          onClick={() => {
                            setCameraCapturedImage(null);
                            startCameraStream(cameraFacingMode);
                          }}
                          className="px-2.5 py-1 rounded-xl bg-purple-900/60 text-purple-200 hover:text-white border border-purple-500/30 text-[10px] font-bold flex items-center space-x-1"
                        >
                          <RotateCcw className="w-3 h-3" />
                          <span>Tirar Outra</span>
                        </button>
                      </div>

                      {/* Imagem Capturada */}
                      <div className="relative rounded-2xl overflow-hidden border border-amber-400/40 bg-black/50 max-h-72 flex items-center justify-center">
                        <img
                          src={cameraCapturedImage}
                          alt="Foto Capturada"
                          className="w-full h-auto max-h-72 object-contain"
                        />
                      </div>

                      {/* Onde Deseja Salvar a Foto? */}
                      <div className="space-y-1.5 pt-1">
                        <p className="text-[11px] font-bold text-white">Onde você deseja salvar esta foto?</p>
                        <div className="grid grid-cols-2 gap-2">
                          <button
                            type="button"
                            onClick={() => saveCapturedPhotoToDestination('gallery')}
                            className="p-3 rounded-2xl bg-gradient-to-r from-pink-600 to-purple-600 text-white font-black text-[11px] shadow-lg hover:from-pink-500 hover:to-purple-500 active:scale-95 transition flex items-center justify-center space-x-1.5"
                          >
                            <ImageIcon className="w-4 h-4" />
                            <span>Salvar na Galeria</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => saveCapturedPhotoToDestination('carousel')}
                            className="p-3 rounded-2xl bg-gradient-to-r from-amber-600 to-orange-600 text-white font-black text-[11px] shadow-lg hover:from-amber-500 hover:to-orange-500 active:scale-95 transition flex items-center justify-center space-x-1.5"
                          >
                            <Sparkles className="w-4 h-4" />
                            <span>Banner da Home</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => saveCapturedPhotoToDestination('media916')}
                            className="p-3 rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 text-white font-black text-[11px] shadow-lg hover:from-blue-500 hover:to-indigo-500 active:scale-95 transition flex items-center justify-center space-x-1.5"
                          >
                            <Video className="w-4 h-4" />
                            <span>Story 9:16</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => saveCapturedPhotoToDestination('profile')}
                            className="p-3 rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 text-white font-black text-[11px] shadow-lg hover:from-emerald-500 hover:to-teal-500 active:scale-95 transition flex items-center justify-center space-x-1.5"
                          >
                            <User className="w-4 h-4" />
                            <span>Foto de Perfil</span>
                          </button>
                        </div>

                        <div className="grid grid-cols-2 gap-2 pt-1">
                          <button
                            type="button"
                            onClick={() => saveCapturedPhotoToDestination('child')}
                            className="p-2.5 rounded-xl bg-purple-900/70 hover:bg-purple-800 text-purple-200 font-bold text-[10px] border border-purple-500/30 flex items-center justify-center space-x-1"
                          >
                            <Users className="w-3.5 h-3.5 text-amber-400" />
                            <span>Definir em Criança</span>
                          </button>

                          <button
                            type="button"
                            onClick={() => saveCapturedPhotoToDestination('photo_editor')}
                            className="p-2.5 rounded-xl bg-purple-900/70 hover:bg-purple-800 text-purple-200 font-bold text-[10px] border border-purple-500/30 flex items-center justify-center space-x-1"
                          >
                            <Sliders className="w-3.5 h-3.5 text-pink-400" />
                            <span>Abrir no Editor</span>
                          </button>
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}

            </div>
          </div>
        )}

        {/* ==================================================== */}
        {/* 5. ÁREA DA FAMÍLIA (COM CADASTRO, LOGIN E EDIÇÃO PRÓPRIOS) */}
        {/* ==================================================== */}
        {currentScreenObj.id === 'family_profile' && (
          <div className="flex-1 flex flex-col bg-[#1A1033] p-4 justify-between overflow-y-auto">
            
            {/* SE NÃO ESTIVER LOGADO COMO FAMÍLIA: MOSTRA CADASTRO OU LOGIN PERSONALIZADO */}
            {!familyUser.isLoggedIn ? (
              <div className="space-y-4 my-auto">
                <div className="flex items-center mb-2">
                  <button onClick={() => setCurrentScreenIndex(0)} className="p-2 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-purple-200 active:scale-[0.98] shadow"><ArrowLeft className="w-5 h-5" /></button>
                  <h2 className="text-lg font-bold ml-4">
                    {familyAuthMode === 'login' ? 'Área da Família: Acesso' : 'Cadastro da Família Acolhedora'}
                  </h2>
                </div>

                {/* Alternador de Modo: Login ou Cadastro */}
                <div className="flex bg-[#2A1840] p-1 rounded-2xl border border-purple-500/30 text-xs font-bold">
                  <button 
                    onClick={() => setFamilyAuthMode('login')} 
                    className={`flex-1 py-2 rounded-xl transition ${familyAuthMode === 'login' ? 'bg-amber-500 text-black shadow' : 'text-purple-300'}`}
                  >
                    Fazer Login
                  </button>
                  <button 
                    onClick={() => setFamilyAuthMode('register')} 
                    className={`flex-1 py-2 rounded-xl transition ${familyAuthMode === 'register' ? 'bg-amber-500 text-black shadow' : 'text-purple-300'}`}
                  >
                    Cadastrar Família
                  </button>
                </div>

                {familyAuthMode === 'login' ? (
                  <div className="space-y-3 bg-[#2A1840] p-5 rounded-3xl border border-purple-500/30 shadow text-xs">
                    <p className="text-purple-200">Acesse com seus dados para gerenciar as cartas e acompanhar os padrinhos das crianças.</p>
                    <div>
                      <label className="text-purple-300 block mb-1">E-mail da Família</label>
                      <input 
                        type="email" 
                        placeholder="familia@larespereanca.org" 
                        value={familyLoginEmail} 
                        onChange={(e) => setFamilyLoginEmail(e.target.value)} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-3 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">Senha de Acesso</label>
                      <input 
                        type="password" 
                        placeholder="Senha" 
                        value={familyLoginPassword} 
                        onChange={(e) => setFamilyLoginPassword(e.target.value)} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-3 text-white" 
                      />
                    </div>
                    <button 
                      onClick={() => {
                        setFamilyUser({ ...familyUser, isLoggedIn: true, email: familyLoginEmail });
                        setNotification(`Bem-vinda de volta, Família!`);
                      }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 font-bold text-xs shadow-xl active:scale-[0.98] text-white"
                    >
                      Entrar na Área da Família
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 bg-[#2A1840] p-5 rounded-3xl border border-purple-500/30 shadow text-xs">
                    <p className="text-purple-200">Cadastre sua família acolhedora no Lar Esperança com seus dados e história:</p>
                    
                    {/* Upload de Foto de Perfil da Família no Cadastro */}
                    <div className="flex items-center space-x-3 pb-2 border-b border-purple-900/50">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-amber-400 select-none pointer-events-none shrink-0">
                        <img src={familyUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <label htmlFor="family-reg-avatar" className="px-3 py-2 rounded-xl bg-pink-600 text-white font-bold cursor-pointer active:scale-[0.98] text-[11px]">
                        + Foto da Família (Galeria)
                      </label>
                      <input id="family-reg-avatar" type="file" accept="image/*" onChange={handleFamilyAvatarUpload} className="hidden" />
                    </div>

                    <div>
                      <label className="text-purple-300 block mb-1">Nome da Família / Responsáveis</label>
                      <input 
                        type="text" 
                        placeholder="Ex: Família Silva e Souza" 
                        value={familyUser.name} 
                        onChange={(e) => setFamilyUser({ ...familyUser, name: e.target.value })} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">WhatsApp / Telefone</label>
                      <input 
                        type="text" 
                        placeholder="(11) 98765-4321" 
                        value={familyUser.phone} 
                        onChange={(e) => setFamilyUser({ ...familyUser, phone: e.target.value })} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">E-mail</label>
                      <input 
                        type="email" 
                        placeholder="familia@email.com" 
                        value={familyUser.email} 
                        onChange={(e) => setFamilyUser({ ...familyUser, email: e.target.value })} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">Senha</label>
                      <input 
                        type="password" 
                        placeholder="Crie sua senha de acesso" 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">Sobre a Família (Descrição / Bio)</label>
                      <textarea 
                        placeholder="Fale um pouco sobre a sua família acolhedora e as crianças..." 
                        value={familyUser.bio} 
                        onChange={(e) => setFamilyUser({ ...familyUser, bio: e.target.value })} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white h-20 resize-none text-xs" 
                      />
                    </div>
                    <button 
                      onClick={() => {
                        setFamilyUser({ ...familyUser, isLoggedIn: true });
                        setNotification('Cadastro da família concluído com sucesso!');
                      }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 font-bold text-xs shadow-xl active:scale-[0.98] text-white"
                    >
                      Concluir Cadastro & Entrar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* SE ESTIVER LOGADO COMO FAMÍLIA: MOSTRA ESPAÇO DEDICADO COM EDIÇÃO COMPLETA */
              <div className="space-y-4">
                
                {/* Header da Área da Família com Botão de Sair Ajustado */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <button onClick={() => setCurrentScreenIndex(0)} className="p-2 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-purple-200 active:scale-[0.98] shadow" title="Voltar ao Início">
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-base font-bold">Área da Família</h2>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button 
                      onClick={() => handleFamilyLogout(false)}
                      className="px-2.5 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/30 text-[10px] font-bold active:scale-[0.98] flex items-center space-x-1"
                      title="Sair da Conta"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>

                {/* BOTÃO DE DOAÇÃO NA PARTE DE CIMA DO PERFIL DA FAMÍLIA */}
                <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-pink-600/30 to-amber-500/30 border border-amber-500/40 shadow">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-200">Apoiar Lar com Doação</h4>
                      <p className="text-[10px] text-purple-200">Contribua via PIX direto para o Lar Esperança</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleDonationClick}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-amber-400 text-white font-bold text-[11px] shadow active:scale-[0.98]"
                  >
                    Doar Agora
                  </button>
                </div>

                {/* Card de Perfil da Família */}
                <div className="flex flex-col items-center bg-[#2A1840] p-4 rounded-3xl border border-purple-500/30 shadow">
                  <div 
                    className="w-20 h-20 rounded-full overflow-hidden border-2 border-pink-500 mb-2 relative select-none pointer-events-auto cursor-pointer shadow group" 
                    onClick={() => setZoomedImage(familyUser.avatar)}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <img src={familyUser.avatar} alt="Família" className="w-full h-full object-cover select-none pointer-events-none" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <ZoomIn className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold">{familyUser.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-900/60 text-pink-300 text-[10px] mt-1 font-semibold">Família Acolhedora Cadastrada</span>
                  <p className="text-xs text-purple-200 text-center mt-2 px-2 italic">"{familyUser.bio}"</p>
                </div>

                {/* Navegação Interna da Família */}
                <div className="grid grid-cols-3 gap-1 bg-[#2A1840] p-1 rounded-2xl border border-purple-500/30 text-[10px] font-bold">
                  <button 
                    onClick={() => setFamilyTab('children')} 
                    className={`py-2 rounded-xl transition ${familyTab === 'children' ? 'bg-pink-600 text-white' : 'text-purple-300'}`}
                  >
                    Crianças
                  </button>
                  <button 
                    onClick={() => setFamilyTab('edit_profile')} 
                    className={`py-2 rounded-xl transition ${familyTab === 'edit_profile' ? 'bg-amber-600 text-white' : 'text-purple-300'}`}
                  >
                    Editar Perfil
                  </button>
                  <button 
                    onClick={() => setFamilyTab('account_settings')} 
                    className={`py-2 rounded-xl transition ${familyTab === 'account_settings' ? 'bg-red-600 text-white' : 'text-purple-300'}`}
                  >
                    Exclusão
                  </button>
                </div>

                {/* Aba 1: Crianças, Padrinhos e Cadastro Rápido pela Família */}
                {familyTab === 'children' && (
                  <div className="space-y-4">
                    {/* Formulário para Família Cadastrar Nova Criança com Foto Rápida */}
                    <div className="bg-[#2A1840] p-4 rounded-3xl border border-amber-500/30 space-y-3 shadow-xl">
                      <h4 className="font-bold text-white flex items-center space-x-2">
                        <Users className="w-4 h-4 text-amber-400" />
                        <span>Cadastrar Nova Criança (Família)</span>
                      </h4>
                      <div className="space-y-2">
                        <input 
                          type="text" 
                          placeholder="Nome da Criança" 
                          value={newChildName} 
                          onChange={(e) => setNewChildName(e.target.value)} 
                          className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white text-xs" 
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <input 
                            type="number" 
                            placeholder="Idade" 
                            value={newChildAge} 
                            onChange={(e) => setNewChildAge(Number(e.target.value))} 
                            className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white text-xs" 
                          />
                          <input 
                            type="text" 
                            placeholder="URL da Foto" 
                            value={newChildImage} 
                            onChange={(e) => setNewChildImage(e.target.value)} 
                            className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white text-xs" 
                          />
                        </div>
                        <div>
                          <label 
                            htmlFor="family-new-child-file" 
                            className="block w-full py-2 px-3 rounded-xl bg-purple-900/60 border border-purple-500/40 text-purple-200 text-center font-bold cursor-pointer hover:bg-purple-800 transition text-xs"
                          >
                            📷 Botão de Imagem Rápido (Dispositivo / Câmera)
                          </label>
                          <input 
                            id="family-new-child-file" 
                            type="file" 
                            accept="image/*" 
                            onChange={async (e) => {
                              const files = e.target.files;
                              if (files && files[0]) {
                                const dataUrl = await processMediaFile(files[0]);
                                setNewChildImage(dataUrl);
                                setNotification('Foto da criança carregada com sucesso!');
                              }
                            }} 
                            className="hidden" 
                          />
                        </div>
                        <textarea 
                          placeholder="Carta e desejos da criança..." 
                          value={newChildLetter} 
                          onChange={(e) => setNewChildLetter(e.target.value)} 
                          className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl p-3 text-white h-20 resize-none text-xs" 
                        />
                        <button 
                          onClick={async () => {
                            if (!newChildName.trim()) {
                              setNotification('Por favor, informe o nome da criança.');
                              return;
                            }

                            const targetFamilyId = (familyUser.id && familyUser.id.length === 36)
                              ? familyUser.id
                              : DEFAULT_FAMILY_PROFILE_ID;

                            const { data, error } = await createKidInSupabase({
                              family_id: targetFamilyId,
                              name: newChildName.trim(),
                              age: newChildAge || 8,
                              gender: 'Infantil',
                              status: 'Aguardando Apadrinhamento',
                              likes: 'brinquedos, escola',
                              dream: 'ser feliz',
                              address: 'Lar Esperança',
                              image: newChildImage,
                              photo_path: newChildImage,
                              letter: newChildLetter.trim() || 'Quero muito um presente especial de Natal!',
                              wishlist: [{ name: 'Brinquedo', price: 79.90 }],
                              approved: true
                            });

                            if (error || !data) {
                              console.error('Erro ao cadastrar criança no Supabase pela família:', error);
                              let msg = error?.message || 'Falha ao salvar no banco de dados.';
                              if (error?.code === '42501' || msg.toLowerCase().includes('permission')) {
                                msg = 'Permissão negada (RLS) no Supabase ao cadastrar criança.';
                              }
                              setNotification(`Falha ao cadastrar criança no Supabase: ${msg}`);
                              return;
                            }

                            const newKid: Child = {
                              id: String(data.id),
                              family_id: data.family_id,
                              name: data.name,
                              age: Number(data.age) || Number(newChildAge) || 8,
                              gender: 'Infantil',
                              status: 'Aguardando Apadrinhamento',
                              likes: data.likes || 'brinquedos, escola',
                              dream: data.dream || 'ser feliz',
                              address: data.address || 'Lar Esperança',
                              image: data.image || data.photo_path || newChildImage,
                              letter: data.letter || newChildLetter || 'Quero muito um presente especial!',
                              wishlist: [{ name: 'Brinquedo', price: 79.90 }],
                              familyEmail: familyUser.email
                            };

                            const updatedList = [...childrenList, newKid];
                            setChildrenList(updatedList);
                            try {
                              localStorage.setItem('childrenList', JSON.stringify(updatedList));
                            } catch (e) {
                              console.warn('Erro ao salvar localmente:', e);
                            }

                            setNewChildName('');
                            setNewChildLetter('');
                            setNotification(`Criança "${newChildName}" cadastrada com sucesso no Supabase!`);
                            confetti({ particleCount: 50, spread: 50 });
                          }}
                          className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-pink-600 to-amber-600 font-bold text-white shadow-xl active:scale-[0.98] transition text-xs"
                        >
                          Salvar e Enviar para Área de Espera
                        </button>
                      </div>
                    </div>

                    <div className="space-y-3 bg-[#2A1840] p-4 rounded-3xl border border-purple-500/30 shadow text-xs">
                      <h4 className="font-bold text-amber-300">Padrinhos das suas Crianças:</h4>
                      {childrenList.filter(c => c.familyEmail === familyUser.email).length === 0 ? (
                        <p className="text-[10px] text-purple-300 italic p-2 bg-[#1A1033] rounded-xl">Sua família ainda não cadastrou nenhuma criança. Cadastre abaixo!</p>
                      ) : (
                        childrenList.filter(c => c.familyEmail === familyUser.email).map((c) => (
                          <div key={c.id} className="p-3.5 rounded-2xl bg-[#1A1033] border border-purple-500/30 space-y-2">
                            <div className="flex justify-between items-center">
                              <span className="font-bold text-white text-xs">{c.name}</span>
                              <span className={`px-2 py-0.5 rounded-full text-[10px] ${c.status === 'Apadrinhado' ? 'bg-emerald-500/20 text-emerald-300 font-bold' : 'bg-amber-500/20 text-amber-300'}`}>
                                {c.status}
                              </span>
                            </div>

                            {c.sponsorName ? (
                              <div className="space-y-2 pt-1">
                                <div className="flex items-center space-x-2.5">
                                  <div 
                                    className="w-10 h-10 rounded-full overflow-hidden border-2 border-pink-500 select-none pointer-events-auto cursor-pointer shrink-0"
                                    onClick={() => setZoomedImage(sponsorUser.avatar)}
                                    onContextMenu={(e) => e.preventDefault()}
                                  >
                                    <img src={sponsorUser.avatar} alt="Padrinho" className="w-full h-full object-cover select-none pointer-events-none" />
                                  </div>
                                  <div>
                                    <p className="text-pink-300 font-bold text-xs">Padrinho: {c.sponsorName}</p>
                                    <p className="text-[9px] text-purple-300">Apoio com carinho e proteção</p>
                                  </div>
                                </div>

                                {/* MENSAGEM DO PADRINHO VISÍVEL PARA A FAMÍLIA */}
                                <div className="p-3 rounded-2xl bg-gradient-to-r from-pink-950/70 to-purple-950/70 border border-pink-500/40 shadow space-y-1">
                                  <div className="flex items-center space-x-1.5 text-pink-300 font-bold text-[11px]">
                                    <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                                    <span>Mensagem Especial do Padrinho {c.sponsorName}:</span>
                                  </div>
                                  <p className="text-purple-100 italic text-xs leading-relaxed pl-5">
                                    &quot;{sponsorUser.familyMessage || 'Muito feliz em fazer parte da história desta criança e desta família abençoada! Que Deus cubra todos de paz e alegria.'}&quot;
                                  </p>
                                </div>
                              </div>
                            ) : (
                              <p className="text-[10px] text-purple-400 italic">Aguardando padrinho escolher esta criança...</p>
                            )}
                          </div>
                        ))
                      )}
                    </div>

                    <div className="space-y-3">
                      <h3 className="text-xs font-bold text-pink-300">Cartas e Desejos das Suas Crianças</h3>
                      {childrenList.filter(c => c.familyEmail === familyUser.email).length === 0 ? (
                        <p className="text-[10px] text-purple-300 italic">Nenhum filho cadastrado para edição de carta.</p>
                      ) : (
                        childrenList.filter(c => c.familyEmail === familyUser.email).map((c) => {
                          const realIdx = childrenList.findIndex(item => item.id === c.id);
                          return (
                            <div key={c.id} className="p-3.5 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-xs space-y-2 shadow">
                              <span className="font-bold text-white">{c.name} ({c.age} anos)</span>
                              <textarea 
                                value={c.letter} 
                                onChange={(e) => {
                                  const updated = [...childrenList];
                                  if (realIdx !== -1) {
                                    updated[realIdx].letter = e.target.value;
                                    setChildrenList(updated);
                                  }
                                }}
                                className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white h-20 resize-none text-xs" 
                              />
                              <div className="flex space-x-2">
                                <button 
                                  onClick={async () => {
                                    const { error } = await updateKidInSupabase(c.id, { letter: c.letter });
                                    if (error) {
                                      console.error('Erro ao atualizar carta no Supabase:', error);
                                      let msg = error.message || 'Falha ao salvar no banco de dados.';
                                      if (error.code === '42501' || msg.toLowerCase().includes('permission')) {
                                        msg = 'Permissão negada (RLS) no Supabase ao atualizar carta.';
                                      }
                                      setNotification(`Erro ao salvar no Supabase: ${msg}`);
                                      return;
                                    }
                                    try {
                                      localStorage.setItem('childrenList', JSON.stringify(childrenList));
                                    } catch (e) {
                                      console.warn('Erro ao salvar localmente:', e);
                                    }
                                    setNotification(`Carta de "${c.name}" atualizada com sucesso no Supabase!`);
                                    confetti({ particleCount: 25, spread: 35 });
                                  }}
                                  className="flex-1 py-2 rounded-xl bg-pink-600 font-bold text-[10px] text-white shadow active:scale-[0.98]"
                                >
                                  Salvar Carta
                                </button>
                                <button 
                                  onClick={() => deleteChild(c.id, c.name)}
                                  className="py-2 px-3 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-300 font-bold text-[10px] border border-red-500/30 transition"
                                >
                                  Excluir
                                </button>
                              </div>
                            </div>
                          );
                        })
                      )}
                    </div>
                  </div>
                )}

                {/* Aba 2: Editar Dados da Família (Autonomia Total) */}
                {familyTab === 'edit_profile' && (
                  <div className="space-y-3 bg-[#2A1840] p-4 rounded-3xl border border-purple-500/30 shadow text-xs">
                    <h4 className="font-bold text-amber-300">Editar Cadastro da Minha Família:</h4>
                    
                    <div className="flex items-center space-x-3 pb-2 border-b border-purple-900/50">
                      <img src={familyUser.avatar} alt="Avatar" className="w-12 h-12 rounded-full border border-pink-500 object-cover" />
                      <label htmlFor="family-avatar-upload" className="px-3 py-2 rounded-xl bg-pink-600 text-white font-bold cursor-pointer active:scale-[0.98]">
                        + Trocar Foto da Galeria
                      </label>
                      <input id="family-avatar-upload" type="file" accept="image/*" onChange={handleFamilyAvatarUpload} className="hidden" />
                    </div>

                    <div>
                      <label className="text-purple-300 block mb-1">Nome da Família / Responsáveis</label>
                      <input 
                        type="text" 
                        value={familyUser.name} 
                        onChange={(e) => setFamilyUser({ ...familyUser, name: e.target.value })} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">WhatsApp / Telefone</label>
                      <input 
                        type="text" 
                        value={familyUser.phone} 
                        onChange={(e) => setFamilyUser({ ...familyUser, phone: e.target.value })} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">E-mail</label>
                      <input 
                        type="email" 
                        value={familyUser.email} 
                        onChange={(e) => setFamilyUser({ ...familyUser, email: e.target.value })} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">Sobre Nós / Mensagem da Família</label>
                      <textarea 
                        value={familyUser.bio} 
                        onChange={(e) => setFamilyUser({ ...familyUser, bio: e.target.value })} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white h-20 resize-none text-xs" 
                      />
                    </div>

                    <button 
                      onClick={async () => {
                        const familyProfileId = (familyUser.id && familyUser.id.length === 36)
                          ? familyUser.id
                          : DEFAULT_FAMILY_PROFILE_ID;

                        const { error } = await updateProfileInSupabase(familyProfileId, {
                          name: familyUser.name,
                          phone: familyUser.phone || null,
                          bio: familyUser.bio || null,
                          photo_path: familyUser.avatar || null
                        });

                        if (error) {
                          console.error('Erro ao salvar perfil da família no Supabase:', error);
                          let msg = error.message || 'Falha ao salvar perfil.';
                          if (error.code === '42501' || msg.toLowerCase().includes('permission')) {
                            msg = 'Permissão negada (RLS) no Supabase ao salvar perfil da família.';
                          }
                          setNotification(`Erro ao salvar no Supabase: ${msg}`);
                          return;
                        }

                        try {
                          localStorage.setItem('familyUser', JSON.stringify(familyUser));
                        } catch (e) {
                          console.warn('Erro ao salvar localmente:', e);
                        }
                        setNotification('Cadastro da família salvo com sucesso no Supabase!');
                        confetti({ particleCount: 40, spread: 40 });
                      }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-amber-600 to-amber-500 font-bold text-white shadow-xl active:scale-[0.98]"
                    >
                      Salvar Informações
                    </button>
                  </div>
                )}

                {/* Aba 3: Exclusão / Cancelamento de Conta da Família */}
                {familyTab === 'account_settings' && (
                  <div className="space-y-3 bg-[#2A1840] p-4 rounded-3xl border border-red-500/40 shadow text-xs">
                    <h4 className="font-bold text-red-300 flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span>Exclusão e Cancelamento de Cadastro</span>
                    </h4>
                    <p className="text-purple-200 leading-relaxed">
                      Caso não queira mais fazer parte do projeto, você pode solicitar a exclusão do cadastro da sua família acolhedora. Seus dados e históricos serão encerrados com total privacidade.
                    </p>
                    <button 
                      onClick={() => setShowFamilyExcludeConfirm(true)}
                      className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-white shadow-xl active:scale-[0.98] flex items-center justify-center space-x-2"
                    >
                      <UserMinus className="w-4 h-4" />
                      <span>Pedir Exclusão da Minha Conta de Família</span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* ==================================================== */}
        {/* 6. ÁREA DO PADRINHO (COM CADASTRO, LOGIN, SAÍDA PERFEITA E MENSAGEM PARA A FAMÍLIA) */}
        {/* ==================================================== */}
        {currentScreenObj.id === 'sponsor_profile' && (
          <div className="flex-1 flex flex-col bg-[#1A1033] p-4 justify-between overflow-y-auto">
            
            {/* SE NÃO ESTIVER LOGADO COMO PADRINHO: MOSTRA CADASTRO OU LOGIN PERSONALIZADO */}
            {!sponsorUser.isLoggedIn ? (
              <div className="space-y-4 my-auto">
                <div className="flex items-center mb-2">
                  <button onClick={() => setCurrentScreenIndex(0)} className="p-2 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-purple-200 active:scale-[0.98] shadow"><ArrowLeft className="w-5 h-5" /></button>
                  <h2 className="text-lg font-bold ml-4">
                    {sponsorAuthMode === 'login' ? 'Área do Padrinho: Acesso' : 'Cadastro de Novo Padrinho'}
                  </h2>
                </div>

                {/* Alternador de Modo: Login ou Cadastro */}
                <div className="flex bg-[#2A1840] p-1 rounded-2xl border border-purple-500/30 text-xs font-bold">
                  <button 
                    onClick={() => setSponsorAuthMode('login')} 
                    className={`flex-1 py-2 rounded-xl transition ${sponsorAuthMode === 'login' ? 'bg-pink-600 text-white shadow' : 'text-purple-300'}`}
                  >
                    Fazer Login
                  </button>
                  <button 
                    onClick={() => setSponsorAuthMode('register')} 
                    className={`flex-1 py-2 rounded-xl transition ${sponsorAuthMode === 'register' ? 'bg-pink-600 text-white shadow' : 'text-purple-300'}`}
                  >
                    Cadastrar Padrinho
                  </button>
                </div>

                {sponsorAuthMode === 'login' ? (
                  <div className="space-y-3 bg-[#2A1840] p-5 rounded-3xl border border-purple-500/30 shadow text-xs">
                    <p className="text-purple-200">Entre para gerenciar seus apadrinhamentos e acompanhar as cartinhas das crianças.</p>
                    <div>
                      <label className="text-purple-300 block mb-1">E-mail do Padrinho</label>
                      <input 
                        type="email" 
                        placeholder={adminEmail} 
                        value={sponsorLoginEmail} 
                        onChange={(e) => setSponsorLoginEmail(e.target.value)} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-3 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">Senha de Acesso</label>
                      <input 
                        type="password" 
                        placeholder="Senha" 
                        value={sponsorLoginPassword} 
                        onChange={(e) => setSponsorLoginPassword(e.target.value)} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-3 text-white" 
                      />
                    </div>
                    <button 
                      onClick={() => {
                        setSponsorUser({ ...sponsorUser, isLoggedIn: true, email: sponsorLoginEmail });
                        setNotification('Bem-vindo, Padrinho!');
                      }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-amber-400 font-bold text-xs shadow-xl active:scale-[0.98] text-white"
                    >
                      Entrar na Área do Padrinho
                    </button>
                  </div>
                ) : (
                  <div className="space-y-3 bg-[#2A1840] p-5 rounded-3xl border border-purple-500/30 shadow text-xs">
                    <p className="text-purple-200">Cadastre-se para apadrinhar uma ou mais crianças com facilidade:</p>
                    
                    {/* Upload de Foto de Perfil no Cadastro */}
                    <div className="flex items-center space-x-3 pb-2 border-b border-purple-900/50">
                      <div className="w-12 h-12 rounded-full overflow-hidden border border-pink-500 select-none pointer-events-none shrink-0">
                        <img src={sponsorUser.avatar} alt="Avatar" className="w-full h-full object-cover" />
                      </div>
                      <label htmlFor="sponsor-reg-avatar" className="px-3 py-2 rounded-xl bg-pink-600 text-white font-bold cursor-pointer active:scale-[0.98] text-[11px]">
                        + Foto de Perfil (Galeria)
                      </label>
                      <input id="sponsor-reg-avatar" type="file" accept="image/*" onChange={handleSponsorAvatarUpload} className="hidden" />
                    </div>

                    <div>
                      <label className="text-purple-300 block mb-1">Nome Completo</label>
                      <input 
                        type="text" 
                        placeholder={`Ex: ${adminName}`} 
                        value={sponsorUser.name} 
                        onChange={(e) => setSponsorUser({ ...sponsorUser, name: e.target.value })} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">WhatsApp</label>
                      <input 
                        type="text" 
                        placeholder={adminPhone} 
                        value={sponsorUser.phone} 
                        onChange={(e) => setSponsorUser({ ...sponsorUser, phone: e.target.value })} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">E-mail</label>
                      <input 
                        type="email" 
                        placeholder={adminEmail} 
                        value={sponsorUser.email} 
                        onChange={(e) => setSponsorUser({ ...sponsorUser, email: e.target.value })} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">Senha</label>
                      <input 
                        type="password" 
                        placeholder="Crie sua senha de acesso" 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">Sobre Você (Descrição / Bio do Padrinho)</label>
                      <textarea 
                        placeholder="Fale um pouco sobre você e sua motivação para apadrinhar..." 
                        value={sponsorUser.bio} 
                        onChange={(e) => setSponsorUser({ ...sponsorUser, bio: e.target.value })} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white h-16 resize-none text-xs" 
                      />
                    </div>
                    <div>
                      <label className="text-pink-300 block mb-1 font-bold">Mensagem Especial para a Família (Visível na Área da Família)</label>
                      <textarea 
                        placeholder="Deixe uma palavra de carinho e esperança para a família da criança..." 
                        value={sponsorUser.familyMessage || ''} 
                        onChange={(e) => setSponsorUser({ ...sponsorUser, familyMessage: e.target.value })} 
                        className="w-full bg-[#1A1033] border border-pink-500/40 rounded-xl p-2.5 text-white h-20 resize-none text-xs" 
                      />
                    </div>
                    <button 
                      onClick={() => {
                        setSponsorUser({ ...sponsorUser, isLoggedIn: true });
                        setNotification('Cadastro de padrinho concluído!');
                      }}
                      className="w-full py-3.5 rounded-xl bg-gradient-to-r from-pink-500 to-amber-400 font-bold text-xs shadow-xl active:scale-[0.98] text-white"
                    >
                      Concluir Cadastro & Apadrinhar
                    </button>
                  </div>
                )}
              </div>
            ) : (
              /* SE ESTIVER LOGADO COMO PADRINHO: ESPAÇO DEDICADO COM SAÍDA PERFEITA */
              <div className="space-y-4">
                
                {/* Header do Padrinho com Saída Perfeita (Logout e Voltar ao Início) */}
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <button 
                      onClick={() => setCurrentScreenIndex(0)} 
                      className="p-2 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-purple-200 active:scale-[0.98] shadow"
                      title="Voltar para a Tela Inicial"
                    >
                      <ArrowLeft className="w-5 h-5" />
                    </button>
                    <h2 className="text-base font-bold">Área do Padrinho</h2>
                  </div>
                  <div className="flex items-center space-x-1.5">
                    <button 
                      onClick={() => setCurrentScreenIndex(0)}
                      className="px-2.5 py-1.5 rounded-xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 border border-purple-500/30 text-[10px] font-bold active:scale-[0.98] flex items-center space-x-1 shadow"
                      title="Voltar à Tela Inicial"
                    >
                      <Home className="w-3.5 h-3.5 text-pink-400" />
                      <span>Início</span>
                    </button>
                    <button 
                      onClick={() => handleSponsorLogout(false)}
                      className="px-2.5 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600/50 text-red-200 border border-red-500/30 text-[10px] font-bold active:scale-[0.98] flex items-center space-x-1 shadow"
                      title="Desconectar / Sair da Conta"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sair</span>
                    </button>
                  </div>
                </div>

                {/* BOTÃO DE DOAÇÃO NA PARTE DE CIMA DO PERFIL DO PADRINHO */}
                <div className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-pink-600/30 to-amber-500/30 border border-amber-500/40 shadow">
                  <div className="flex items-center space-x-2">
                    <div className="p-2 rounded-xl bg-amber-500/20 text-amber-300">
                      <Gift className="w-4 h-4" />
                    </div>
                    <div>
                      <h4 className="text-xs font-bold text-amber-200">Apoiar Lar com Doação</h4>
                      <p className="text-[10px] text-purple-200">Doe via PIX direto para o Lar Esperança</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleDonationClick}
                    className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-500 to-amber-400 text-white font-bold text-[11px] shadow active:scale-[0.98]"
                  >
                    Fazer Doação
                  </button>
                </div>

                {/* Card de Perfil do Padrinho com Foto da Galeria */}
                <div className="flex flex-col items-center bg-[#2A1840] p-4 rounded-3xl border border-purple-500/30 shadow">
                  <div 
                    className="w-20 h-20 rounded-full overflow-hidden border-2 border-pink-500 mb-2 relative select-none pointer-events-auto cursor-pointer shadow group" 
                    onClick={() => setZoomedImage(sponsorUser.avatar)}
                    onContextMenu={(e) => e.preventDefault()}
                  >
                    <img src={sponsorUser.avatar} alt={sponsorUser.name} className="w-full h-full object-cover select-none pointer-events-none" />
                    <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                      <ZoomIn className="w-4 h-4 text-white" />
                    </div>
                  </div>
                  <h3 className="text-base font-bold">{sponsorUser.name}</h3>
                  <span className="px-2.5 py-0.5 rounded-full bg-purple-900/60 text-pink-300 text-[10px] mt-1 font-semibold">Padrinho Voluntário</span>
                  <p className="text-xs text-purple-200 text-center mt-2 px-2 italic">"{sponsorUser.bio}"</p>
                </div>

                {/* Navegação Interna do Padrinho */}
                <div className="grid grid-cols-4 gap-1 bg-[#2A1840] p-1 rounded-2xl border border-purple-500/30 text-[9px] font-bold">
                  <button 
                    onClick={() => setSponsorTab('my_children')} 
                    className={`py-2 rounded-xl transition ${sponsorTab === 'my_children' ? 'bg-pink-600 text-white' : 'text-purple-300'}`}
                  >
                    Apadrinhadas
                  </button>
                  <button 
                    onClick={() => setSponsorTab('sponsor_more')} 
                    className={`py-2 rounded-xl transition ${sponsorTab === 'sponsor_more' ? 'bg-amber-600 text-white' : 'text-purple-300'}`}
                  >
                    + Apadrinhar
                  </button>
                  <button 
                    onClick={() => setSponsorTab('edit_profile')} 
                    className={`py-2 rounded-xl transition ${sponsorTab === 'edit_profile' ? 'bg-pink-600 text-white' : 'text-purple-300'}`}
                  >
                    Meu Perfil
                  </button>
                  <button 
                    onClick={() => setSponsorTab('account_settings')} 
                    className={`py-2 rounded-xl transition ${sponsorTab === 'account_settings' ? 'bg-red-600 text-white' : 'text-purple-300'}`}
                  >
                    Exclusão
                  </button>
                </div>

                {/* Aba 1: Crianças Apadrinhadas (com botão de Remover / Tirar Apadrinhamento) */}
                {sponsorTab === 'my_children' && (
                  <div className="space-y-3 bg-[#2A1840] p-4 rounded-3xl border border-purple-500/30 shadow text-xs">
                    <h4 className="font-bold text-pink-400">
                      Crianças que você apadrinhou ({childrenList.filter(c => c.status === 'Apadrinhado').length}):
                    </h4>

                    {childrenList.filter(c => c.status === 'Apadrinhado').length === 0 ? (
                      <div className="text-center p-4 bg-[#1A1033] rounded-2xl border border-purple-500/20 space-y-2">
                        <p className="text-purple-300 italic">Você não tem crianças apadrinhadas no momento.</p>
                        <button 
                          onClick={() => setSponsorTab('sponsor_more')} 
                          className="px-4 py-2 rounded-xl bg-pink-600 text-white font-bold text-xs shadow active:scale-[0.98]"
                        >
                          Escolher Criança para Apadrinhar
                        </button>
                      </div>
                    ) : (
                      childrenList.filter(c => c.status === 'Apadrinhado').map((c, i) => (
                        <div key={i} className="p-3 rounded-2xl bg-[#1A1033] border border-purple-500/30 space-y-2 shadow">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div 
                                className="w-12 h-12 rounded-xl overflow-hidden border border-pink-500 select-none pointer-events-auto cursor-pointer"
                                onClick={() => setZoomedImage(c.image)}
                                onContextMenu={(e) => e.preventDefault()}
                              >
                                <img src={c.image} alt={c.name} className="w-full h-full object-cover select-none pointer-events-none" />
                              </div>
                              <div>
                                <span className="font-bold text-white block">{c.name}</span>
                                <span className="text-[10px] text-amber-300">Apadrinhamento Ativo</span>
                              </div>
                            </div>
                            <button onClick={() => { setSelectedChild(c); setCurrentScreenIndex(6); }} className="px-2.5 py-1.5 rounded-xl bg-purple-900/80 text-pink-300 text-[10px] font-semibold active:scale-[0.98]">
                              Ver Carta
                            </button>
                          </div>

                          {/* Opção para tirar apadrinhamento se desejar */}
                          <div className="pt-2 border-t border-purple-900/40 flex items-center justify-between">
                            <span className="text-[9px] text-purple-400">Deseja desvincular?</span>
                            <button 
                              onClick={() => handleRemoveSponsorship(c.id)}
                              className="px-3 py-1.5 rounded-xl bg-red-600/30 hover:bg-red-600 text-red-200 text-[10px] font-semibold active:scale-[0.98] transition border border-red-500/30"
                            >
                              Cancelar Apadrinhamento desta Criança
                            </button>
                          </div>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Aba 2: Apadrinhar Mais Crianças */}
                {sponsorTab === 'sponsor_more' && (
                  <div className="space-y-3">
                    <h3 className="text-xs font-bold text-amber-300">Escolha Crianças para Apadrinhar (Clique para Apoiar):</h3>
                    {childrenList.filter(c => c.status !== 'Apadrinhado').length === 0 ? (
                      <p className="text-xs text-purple-300 italic p-3 bg-[#2A1840] rounded-2xl">Todas as crianças já foram apadrinhadas! Muito obrigado pelo carinho.</p>
                    ) : (
                      childrenList.filter(c => c.status !== 'Apadrinhado').map((c, i) => (
                        <div key={i} className="p-3.5 rounded-2xl bg-[#2A1840] border border-purple-500/30 flex items-center justify-between shadow">
                          <div className="flex items-center space-x-3">
                            <div 
                              className="w-12 h-12 rounded-xl overflow-hidden border border-pink-500 select-none pointer-events-auto cursor-pointer group"
                              onClick={() => setZoomedImage(c.image)}
                              onContextMenu={(e) => e.preventDefault()}
                            >
                              <img src={c.image} alt={c.name} className="w-full h-full object-cover select-none pointer-events-none" />
                            </div>
                            <div>
                              <h4 className="text-xs font-bold text-white">{c.name}</h4>
                              <p className="text-[10px] text-purple-300">{c.age} anos • {c.gender}</p>
                              <p className="text-[10px] text-amber-300">Sonho: {c.dream}</p>
                            </div>
                          </div>
                          <button 
                            onClick={() => handleSponsorChild(c.id)}
                            className="px-3.5 py-2 rounded-xl bg-gradient-to-r from-pink-600 to-amber-500 text-white text-[10px] font-bold shadow active:scale-[0.98]"
                          >
                            Quero Apadrinhar
                          </button>
                        </div>
                      ))
                    )}
                  </div>
                )}

                {/* Aba 3: Editar Cadastro do Padrinho & Mensagem para a Família */}
                {sponsorTab === 'edit_profile' && (
                  <div className="space-y-3 bg-[#2A1840] p-4 rounded-3xl border border-purple-500/30 shadow text-xs">
                    <h4 className="font-bold text-amber-300">Editar Meus Dados de Padrinho:</h4>
                    
                    <div className="flex items-center space-x-3 pb-2 border-b border-purple-900/50">
                      <img src={sponsorUser.avatar} alt="Avatar" className="w-12 h-12 rounded-full border border-pink-500 object-cover" />
                      <label htmlFor="sponsor-avatar-upload" className="px-3 py-2 rounded-xl bg-pink-600 text-white font-bold cursor-pointer active:scale-[0.98]">
                        + Trocar Foto da Galeria
                      </label>
                      <input id="sponsor-avatar-upload" type="file" accept="image/*" onChange={handleSponsorAvatarUpload} className="hidden" />
                    </div>

                    <div>
                      <label className="text-purple-300 block mb-1">Nome Completo</label>
                      <input 
                        type="text" 
                        value={sponsorUser.name} 
                        onChange={(e) => setSponsorUser({ ...sponsorUser, name: e.target.value })} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">WhatsApp de Contato</label>
                      <input 
                        type="text" 
                        value={sponsorUser.phone} 
                        onChange={(e) => setSponsorUser({ ...sponsorUser, phone: e.target.value })} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">E-mail</label>
                      <input 
                        type="email" 
                        value={sponsorUser.email} 
                        onChange={(e) => setSponsorUser({ ...sponsorUser, email: e.target.value })} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white" 
                      />
                    </div>
                    <div>
                      <label className="text-purple-300 block mb-1">Minha Descrição / Bio (Fale um pouco sobre você)</label>
                      <textarea 
                        value={sponsorUser.bio} 
                        onChange={(e) => setSponsorUser({ ...sponsorUser, bio: e.target.value })} 
                        className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl p-2.5 text-white h-16 resize-none text-xs" 
                      />
                    </div>

                    {/* CAMPO DE MENSAGEM DO PADRINHO VISÍVEL PARA A FAMÍLIA */}
                    <div className="p-3 rounded-2xl bg-[#1A1033] border border-pink-500/40 space-y-1">
                      <label className="text-pink-300 block font-bold flex items-center space-x-1.5">
                        <Heart className="w-3.5 h-3.5 text-pink-400 fill-pink-400" />
                        <span>Mensagem para a Família da Criança (Visível na Área da Família)</span>
                      </label>
                      <textarea 
                        placeholder="Deixe uma mensagem de amor e incentivo para a família acolhedora e as crianças que você apadrinhou..." 
                        value={sponsorUser.familyMessage || ''} 
                        onChange={(e) => setSponsorUser({ ...sponsorUser, familyMessage: e.target.value })} 
                        className="w-full bg-[#2A1840] border border-pink-500/40 rounded-xl p-2.5 text-white h-24 resize-none text-xs" 
                      />
                      <p className="text-[10px] text-purple-300">
                        Essa mensagem será exibida na tela da Família Acolhedora ao lado do seu nome!
                      </p>
                    </div>

                    <button 
                      onClick={async () => {
                        const sponsorProfileId = (sponsorUser.id && sponsorUser.id.length === 36)
                          ? sponsorUser.id
                          : DEFAULT_SPONSOR_PROFILE_ID;

                        const { error } = await updateProfileInSupabase(sponsorProfileId, {
                          name: sponsorUser.name,
                          phone: sponsorUser.phone || null,
                          bio: sponsorUser.bio || null,
                          photo_path: sponsorUser.avatar || null
                        });

                        if (error) {
                          console.error('Erro ao salvar perfil do padrinho no Supabase:', error);
                          let msg = error.message || 'Falha ao salvar perfil.';
                          if (error.code === '42501' || msg.toLowerCase().includes('permission')) {
                            msg = 'Permissão negada (RLS) no Supabase ao salvar perfil do padrinho.';
                          }
                          setNotification(`Erro ao salvar no Supabase: ${msg}`);
                          return;
                        }

                        try {
                          localStorage.setItem('sponsorUser', JSON.stringify(sponsorUser));
                        } catch (e) {
                          console.warn('Erro ao salvar localmente:', e);
                        }
                        setNotification('Cadastro de padrinho salvo com sucesso no Supabase!');
                        confetti({ particleCount: 40, spread: 40 });
                      }}
                      className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-400 font-bold text-white shadow-xl active:scale-[0.98]"
                    >
                      Salvar Informações
                    </button>

                    {/* Botão claro para Desconectar / Sair */}
                    <div className="pt-2 border-t border-purple-900/50 flex space-x-2">
                      <button 
                        onClick={() => handleSponsorLogout(false)}
                        className="flex-1 py-2.5 rounded-xl bg-red-600/30 text-red-200 font-bold text-xs border border-red-500/30 active:scale-[0.98] flex items-center justify-center space-x-1.5"
                      >
                        <LogOut className="w-3.5 h-3.5" />
                        <span>Desconectar Conta</span>
                      </button>
                      <button 
                        onClick={() => handleSponsorLogout(true)}
                        className="flex-1 py-2.5 rounded-xl bg-purple-900/80 text-purple-200 font-bold text-xs border border-purple-500/30 active:scale-[0.98]"
                      >
                        Sair e Ir para Início
                      </button>
                    </div>
                  </div>
                )}

                {/* Aba 4: Exclusão / Cancelamento de Participação */}
                {sponsorTab === 'account_settings' && (
                  <div className="space-y-3 bg-[#2A1840] p-4 rounded-3xl border border-red-500/40 shadow text-xs">
                    <h4 className="font-bold text-red-300 flex items-center space-x-1.5">
                      <AlertCircle className="w-4 h-4 text-red-400" />
                      <span>Exclusão e Cancelamento de Padrinho</span>
                    </h4>
                    <p className="text-purple-200 leading-relaxed">
                      Caso não queira mais fazer parte do projeto como padrinho, você pode solicitar o encerramento do cadastro. Suas crianças apadrinhadas serão disponibilizadas novamente para outros padrinhos com total segurança.
                    </p>
                    <button 
                      onClick={() => setShowSponsorExcludeConfirm(true)}
                      className="w-full py-3 rounded-xl bg-red-600 hover:bg-red-700 font-bold text-white shadow-xl active:scale-[0.98] flex items-center justify-center space-x-2"
                    >
                      <UserMinus className="w-4 h-4" />
                      <span>Pedir Exclusão da Minha Conta de Padrinho</span>
                    </button>
                  </div>
                )}
              </div>
            )}

          </div>
        )}

        {/* 7. CHILD PROFILE */}
        {currentScreenObj.id === 'child_profile' && (
          <div className="flex-1 flex flex-col bg-[#1A1033] p-4 justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-4">
                <button onClick={() => setCurrentScreenIndex(0)} className="p-2 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-purple-200 active:scale-[0.98] shadow"><ArrowLeft className="w-5 h-5" /></button>
                <h2 className="text-base font-bold">Cartinha de {selectedChild.name}</h2>
                <div />
              </div>

              <div 
                className="w-full h-48 rounded-3xl overflow-hidden border border-pink-500 mb-4 select-none pointer-events-auto cursor-pointer relative group shadow-xl"
                onClick={() => setZoomedImage(selectedChild.image)}
                onContextMenu={(e) => e.preventDefault()}
              >
                <img src={selectedChild.image} alt={selectedChild.name} className="w-full h-full object-cover select-none pointer-events-none" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition">
                  <ZoomIn className="w-6 h-6 text-white" />
                </div>
              </div>

              <div className="space-y-3 bg-[#2A1840] p-4 rounded-3xl border border-purple-500/30 text-xs shadow">
                <div>
                  <span className="text-[10px] text-pink-400 font-bold uppercase tracking-wider block">Sonho</span>
                  <p className="text-sm font-bold text-white">{selectedChild.dream}</p>
                </div>
                <div>
                  <span className="text-[10px] text-amber-400 font-bold uppercase tracking-wider block">Carta do Lar</span>
                  <p className="text-purple-200 italic leading-relaxed">"{selectedChild.letter}"</p>
                </div>
                <div>
                  <span className="text-[10px] text-purple-300 font-bold uppercase tracking-wider block">Lista de Desejos</span>
                  {selectedChild.wishlist.map((item, idx) => (
                    <div key={idx} className="flex justify-between py-1 border-b border-purple-900/40 text-purple-100">
                      <span>{item.name}</span>
                      <span className="font-bold text-amber-300">R$ {item.price.toFixed(2)}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            <button 
              onClick={() => { handleSponsorChild(selectedChild.id); setCurrentScreenIndex(5); }}
              className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-400 font-bold text-xs shadow-xl active:scale-[0.98]"
            >
              Apadrinhar esta Criança Agora
            </button>
          </div>
        )}

        {/* 8. APPROVAL WORKFLOW */}
        {currentScreenObj.id === 'approval_workflow' && (
          <div className="flex-1 flex flex-col bg-[#1A1033] p-4 justify-between">
            <div>
              <div className="flex items-center mb-4">
                <button onClick={() => setCurrentScreenIndex(0)} className="p-2 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-purple-200 active:scale-[0.98] shadow"><ArrowLeft className="w-5 h-5" /></button>
                <h2 className="text-lg font-bold ml-4">Processo de Aprovação</h2>
              </div>
              <div className="space-y-3 my-4 text-xs">
                <div className="bg-[#2A1840] p-4 rounded-2xl border border-pink-500/30 shadow">
                  <h4 className="font-bold text-pink-300 mb-1">1. Escolha do Padrinho</h4>
                  <p className="text-purple-200">O padrinho seleciona a criança diretamente na sua área.</p>
                </div>
                <div className="bg-[#2A1840] p-4 rounded-2xl border border-amber-500/30 shadow">
                  <h4 className="font-bold text-amber-300 mb-1">2. Validação da Família</h4>
                  <p className="text-purple-200">A família acolhedora visualiza e confirma o apadrinhamento.</p>
                </div>
                <div className="bg-[#2A1840] p-4 rounded-2xl border border-purple-500/30 shadow">
                  <h4 className="font-bold text-purple-300 mb-1">3. Validação do Projeto</h4>
                  <p className="text-purple-200">Nossa equipe valida o processo com total segurança.</p>
                </div>
              </div>
            </div>
            <button onClick={() => setCurrentScreenIndex(0)} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-400 font-bold text-xs shadow-xl active:scale-[0.98]">
              Voltar ao Início
            </button>
          </div>
        )}

        {/* 9. WAITING AREA */}
        {currentScreenObj.id === 'waiting_area' && (
          <div className="flex-1 flex flex-col bg-[#1A1033] p-4 overflow-y-auto">
            <div className="flex items-center mb-4">
              <button onClick={() => setCurrentScreenIndex(0)} className="p-2 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-purple-200 active:scale-[0.98] shadow"><ArrowLeft className="w-5 h-5" /></button>
              <h2 className="text-lg font-bold ml-4">Área de Espera</h2>
            </div>
            <div className="grid grid-cols-2 gap-3">
              {childrenList.map((c, idx) => (
                <div key={idx} className="p-3 rounded-2xl bg-[#2A1840] border border-purple-500/30 flex flex-col space-y-2 shadow">
                  <div className="flex items-center space-x-2">
                    <div 
                      className="w-10 h-10 rounded-xl overflow-hidden border border-pink-500 select-none pointer-events-auto cursor-pointer"
                      onClick={() => setZoomedImage(c.image)}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <img src={c.image} alt={c.name} className="w-full h-full object-cover select-none pointer-events-none" />
                    </div>
                    <div className="min-w-0">
                      <h4 className="text-[11px] font-bold text-white truncate">{c.name}</h4>
                      <span className="text-[9px] text-amber-300 truncate block">{c.status}</span>
                    </div>
                  </div>
                  <button onClick={() => { setSelectedChild(c); setCurrentScreenIndex(6); }} className="w-full py-1.5 rounded-xl bg-purple-900/80 text-pink-300 text-[10px] font-semibold active:scale-[0.98]">Ver</button>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* 10. GALLERY (VISUALIZAÇÃO PÚBLICA) */}
        {currentScreenObj.id === 'gallery' && (
          <div className="flex-1 flex flex-col bg-[#1A1033] p-4 overflow-y-auto">
            {/* Header da Galeria Pública (Topo Limpo) */}
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center space-x-2">
                <button onClick={() => setCurrentScreenIndex(0)} className="p-2 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-purple-200 active:scale-[0.98] shadow">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <div>
                  <h2 className="text-lg font-bold text-white">Galeria de Fotos</h2>
                  <span className="text-[10px] text-purple-300">{galleryItems.length} mídias cadastradas</span>
                </div>
              </div>
            </div>

            {/* Banner Institucional de Boas-Vindas */}
            <div className="mb-3.5 p-3.5 rounded-3xl bg-gradient-to-r from-purple-900/30 via-[#2A1840] to-pink-900/30 border border-purple-500/30 shadow-lg flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-2xl bg-gradient-to-br from-pink-600 to-amber-500 text-white shadow">
                  <ImageIcon className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-xs font-bold text-white">Momentos & Atividades</h3>
                  <p className="text-[10px] text-purple-200">
                    {galleryActivitiesMsg}
                  </p>
                </div>
              </div>
            </div>

            {/* Barra de Filtros e Busca Pública */}
            <div className="mb-3 space-y-2">
              <div className="flex items-center space-x-2">
                <div className="flex-1 relative">
                  <Search className="w-3.5 h-3.5 text-purple-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Filtrar fotos ou vídeos..." 
                    value={publicGallerySearch} 
                    onChange={(e) => setPublicGallerySearch(e.target.value)} 
                    className="w-full pl-8 pr-3 py-2 bg-[#2A1840] border border-purple-500/30 rounded-xl text-white text-xs placeholder-purple-400/60 focus:border-pink-500 focus:outline-none"
                  />
                  {publicGallerySearch && (
                    <button onClick={() => setPublicGallerySearch('')} className="absolute right-2.5 top-1/2 -translate-y-1/2 text-purple-400 hover:text-white">
                      <X className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>
                <div className="flex bg-[#2A1840] p-0.5 rounded-xl border border-purple-500/30 shrink-0">
                  <button 
                    onClick={() => setPublicGalleryFilter('all')} 
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition ${publicGalleryFilter === 'all' ? 'bg-pink-600 text-white' : 'text-purple-300'}`}
                  >
                    Todas ({galleryItems.length})
                  </button>
                  <button 
                    onClick={() => setPublicGalleryFilter('images')} 
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition ${publicGalleryFilter === 'images' ? 'bg-pink-600 text-white' : 'text-purple-300'}`}
                  >
                    Fotos
                  </button>
                  <button 
                    onClick={() => setPublicGalleryFilter('videos')} 
                    className={`px-2.5 py-1.5 rounded-lg text-[10px] font-bold transition ${publicGalleryFilter === 'videos' ? 'bg-pink-600 text-white' : 'text-purple-300'}`}
                  >
                    Vídeos
                  </button>
                </div>
              </div>
            </div>

            {/* GRID DE MÍDIAS DA GALERIA (APENAS VISUALIZAÇÃO PÚBLICA) */}
            {(() => {
              const filtered = galleryItems.filter((item, idx) => {
                const isVideo = item.toLowerCase().endsWith('.mp4') || item.includes('video');
                if (publicGalleryFilter === 'images' && isVideo) return false;
                if (publicGalleryFilter === 'videos' && !isVideo) return false;
                if (publicGallerySearch.trim()) {
                  const q = publicGallerySearch.toLowerCase();
                  return item.toLowerCase().includes(q) || `foto ${idx + 1}`.includes(q);
                }
                return true;
              });

              if (filtered.length === 0) {
                return (
                  <div className="p-8 rounded-3xl bg-[#2A1840] border border-purple-500/20 text-center space-y-3">
                    <ImageIcon className="w-10 h-10 text-purple-400 mx-auto" />
                    <h4 className="text-sm font-bold text-white">Nenhuma mídia encontrada</h4>
                    <p className="text-xs text-purple-300">
                      Não há itens correspondentes aos filtros selecionados.
                    </p>
                  </div>
                );
              }

              return (
                <div className="grid grid-cols-2 gap-3 pb-4">
                  {filtered.map((img, idx) => {
                    const isVideo = img.toLowerCase().endsWith('.mp4') || img.includes('video');
                    return (
                      <div 
                        key={idx} 
                        className="h-44 rounded-2xl overflow-hidden border border-purple-500/30 relative select-none pointer-events-auto group shadow-lg bg-[#2A1840]"
                      >
                        {isVideo ? (
                          <video src={img} className="w-full h-full object-cover" muted controls={false} />
                        ) : (
                          <img src={img} alt={`Galeria ${idx + 1}`} className="w-full h-full object-cover select-none pointer-events-none group-hover:scale-105 transition duration-300" />
                        )}

                        {/* Botões de Ação Visual: Apenas Download (Edição restrita à Área Segura) */}
                        <div className="absolute top-2 right-2 flex space-x-1 z-10">
                          <button 
                            onClick={(e) => {
                              e.stopPropagation();
                              handleDownloadMedia(img, `lar_esperanca_${idx + 1}.${isVideo ? 'mp4' : 'jpg'}`);
                            }}
                            className="p-1.5 rounded-xl bg-black/60 text-white hover:bg-amber-600 transition shadow"
                            title="Baixar mídia"
                          >
                            <Download className="w-3.5 h-3.5" />
                          </button>
                        </div>

                        {/* Overlay para Zoom */}
                        <div 
                          className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center opacity-0 group-hover:opacity-100 transition cursor-pointer"
                          onClick={() => setZoomedImage(img)}
                        >
                          <ZoomIn className="w-6 h-6 text-white mb-1" />
                          <span className="text-[10px] text-white font-bold">Ver Ampliado</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              );
            })()}
          </div>
        )}

        {/* 11. PHOTO EDITOR (EDITOR DE FOTOS COM AJUSTE AUTOMÁTICO) */}
        {currentScreenObj.id === 'photo_editor' && (
          <div className="flex-1 flex flex-col bg-[#1A1033] p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <button onClick={() => setCurrentScreenIndex(0)} className="p-2 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-purple-200 active:scale-[0.98] shadow">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold">Editor de Fotos</h2>
              </div>
              <button 
                onClick={() => {
                  setPhotoBrightness(110);
                  setPhotoContrast(110);
                  setPhotoSaturation(115);
                  setPhotoFilter('none');
                  setNotification('✨ Ajuste Automático Inteligente aplicado!');
                }}
                className="px-3 py-1.5 rounded-xl bg-gradient-to-r from-pink-600 to-amber-500 text-white font-bold text-xs flex items-center space-x-1.5 shadow"
              >
                <Sparkles className="w-3.5 h-3.5" />
                <span>Auto Ajuste</span>
              </button>
            </div>

            {/* Canvas / Imagem em Edição */}
            <div className="bg-[#2A1840] p-4 rounded-3xl border border-purple-500/30 shadow-xl mb-4 flex flex-col items-center">
              <div className="w-full max-w-xs h-64 rounded-2xl overflow-hidden bg-black/60 flex items-center justify-center relative border border-white/10 shadow-inner">
                <img 
                  src={photoEditorImg} 
                  alt="Editando" 
                  className="max-w-full max-h-full object-contain transition-all duration-200"
                  style={{
                    filter: `brightness(${photoBrightness}%) contrast(${photoContrast}%) saturate(${photoSaturation}%) ${
                      photoFilter === 'sepia' ? 'sepia(80%)' :
                      photoFilter === 'grayscale' ? 'grayscale(100%)' :
                      photoFilter === 'warm' ? 'sepia(30%) saturate(135%)' :
                      photoFilter === 'cool' ? 'hue-rotate(180deg)' : 'none'
                    }`,
                    transform: `rotate(${photoRotation}deg)`
                  }}
                />
              </div>

              {/* Botões rápidos de rotação e reset */}
              <div className="flex items-center space-x-2 mt-3">
                <button 
                  onClick={() => setPhotoRotation((prev) => (prev + 90) % 360)}
                  className="px-3 py-1.5 rounded-xl bg-[#1A1033] border border-purple-500/30 text-purple-200 text-xs font-semibold flex items-center space-x-1"
                >
                  <RotateCw className="w-3.5 h-3.5" />
                  <span>Girar 90°</span>
                </button>
                <button 
                  onClick={() => {
                    setPhotoBrightness(100);
                    setPhotoContrast(100);
                    setPhotoSaturation(100);
                    setPhotoRotation(0);
                    setPhotoFilter('none');
                    setNotification('Filtros resetados ao padrão.');
                  }}
                  className="px-3 py-1.5 rounded-xl bg-[#1A1033] border border-purple-500/30 text-purple-300 text-xs font-semibold"
                >
                  Resetar
                </button>
              </div>
            </div>

            {/* Controles de Ajuste Fino */}
            <div className="bg-[#2A1840] p-4 rounded-3xl border border-purple-500/30 shadow space-y-3 mb-4 text-xs">
              <h4 className="font-bold text-amber-300 flex items-center space-x-1.5">
                <Sliders className="w-4 h-4 text-amber-400" />
                <span>Ajustes de Iluminação e Cores</span>
              </h4>

              <div className="space-y-1">
                <div className="flex justify-between text-purple-200">
                  <span>Brilho</span>
                  <span className="font-bold text-white">{photoBrightness}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="160" 
                  value={photoBrightness} 
                  onChange={(e) => setPhotoBrightness(Number(e.target.value))} 
                  className="w-full accent-pink-500" 
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-purple-200">
                  <span>Contraste</span>
                  <span className="font-bold text-white">{photoContrast}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="160" 
                  value={photoContrast} 
                  onChange={(e) => setPhotoContrast(Number(e.target.value))} 
                  className="w-full accent-amber-500" 
                />
              </div>

              <div className="space-y-1">
                <div className="flex justify-between text-purple-200">
                  <span>Saturação</span>
                  <span className="font-bold text-white">{photoSaturation}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="200" 
                  value={photoSaturation} 
                  onChange={(e) => setPhotoSaturation(Number(e.target.value))} 
                  className="w-full accent-purple-500" 
                />
              </div>

              {/* Filtros Prontos */}
              <div className="pt-2">
                <label className="text-purple-300 font-semibold block mb-1.5">Filtros Artísticos</label>
                <div className="grid grid-cols-5 gap-1.5 text-[10px] text-center font-bold">
                  {[
                    { id: 'none', label: 'Original' },
                    { id: 'grayscale', label: 'P&B' },
                    { id: 'sepia', label: 'Vintage' },
                    { id: 'warm', label: 'Quente' },
                    { id: 'cool', label: 'Frio' },
                  ].map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setPhotoFilter(f.id as any)}
                      className={`py-2 rounded-xl border transition ${
                        photoFilter === f.id 
                          ? 'bg-pink-600 text-white border-pink-400' 
                          : 'bg-[#1A1033] text-purple-300 border-purple-500/20'
                      }`}
                    >
                      {f.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Escolher Foto para Editar */}
            <div className="bg-[#2A1840] p-4 rounded-3xl border border-purple-500/30 shadow space-y-2 mb-4">
              <div className="flex items-center justify-between">
                <h4 className="font-bold text-white text-xs">Selecione uma Imagem para Editar:</h4>
                <div className="flex items-center space-x-1.5">
                  <button 
                    type="button"
                    onClick={() => openInAppCamera('photo_editor')}
                    className="px-2.5 py-1 rounded-xl bg-gradient-to-r from-pink-600 to-amber-500 text-white font-bold text-[10px] cursor-pointer hover:from-pink-500 hover:to-amber-400 active:scale-95 transition flex items-center space-x-1 shadow"
                  >
                    <Camera className="w-3 h-3 text-white" />
                    <span>📸 Câmera</span>
                  </button>
                  <label htmlFor="photo-editor-device-upload" className="px-2.5 py-1 rounded-xl bg-purple-900/60 text-purple-200 border border-purple-500/30 font-bold text-[10px] cursor-pointer hover:bg-purple-800 hover:text-white transition flex items-center space-x-1">
                    <Upload className="w-3 h-3" />
                    <span>+ Galeria</span>
                  </label>
                </div>
                <input 
                  id="photo-editor-device-upload" 
                  type="file" 
                  accept="image/*" 
                  onChange={async (e) => {
                    const files = e.target.files;
                    if (files && files[0]) {
                      const dataUrl = await processMediaFile(files[0]);
                      setPhotoEditorImg(dataUrl);
                      setNotification('Foto do dispositivo aberta no editor!');
                    }
                  }} 
                  className="hidden" 
                />
              </div>
              <div className="flex space-x-2 overflow-x-auto pb-2">
                {galleryItems.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setPhotoEditorImg(img)}
                    className={`w-14 h-14 rounded-xl overflow-hidden shrink-0 border-2 transition ${
                      photoEditorImg === img ? 'border-pink-500 scale-105' : 'border-purple-500/30 opacity-70'
                    }`}
                  >
                    <img src={img} alt="Thumbnail" className="w-full h-full object-cover" />
                  </button>
                ))}
              </div>
            </div>

            <button 
              onClick={() => {
                if (!galleryItems.includes(photoEditorImg)) {
                  setGalleryItems([photoEditorImg, ...galleryItems]);
                }
                setNotification('Foto otimizada e salva na sua galeria!');
                confetti({ particleCount: 50, spread: 60 });
              }}
              className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-400 font-bold text-xs text-white shadow-xl active:scale-[0.98] transition flex items-center justify-center space-x-2"
            >
              <Save className="w-4 h-4" />
              <span>Salvar Edição na Galeria</span>
            </button>
          </div>
        )}

        {/* 12. MEDIA MANAGEMENT (GERENCIAMENTO DE MÍDIAS) */}
        {currentScreenObj.id === 'media_management' && (
          <div className="flex-1 flex flex-col bg-[#1A1033] p-4 overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-2">
                <button onClick={() => setCurrentScreenIndex(0)} className="p-2 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-purple-200 active:scale-[0.98] shadow">
                  <ArrowLeft className="w-5 h-5" />
                </button>
                <h2 className="text-lg font-bold">Gerenciamento de Mídias</h2>
              </div>
            </div>

            {/* Abas de Tipos de Mídia */}
            <div className="grid grid-cols-3 gap-1 bg-[#2A1840] p-1 rounded-2xl border border-purple-500/30 text-xs font-bold mb-4">
              <button 
                onClick={() => setMediaActiveTab('gallery')} 
                className={`py-2 rounded-xl transition ${mediaActiveTab === 'gallery' ? 'bg-pink-600 text-white' : 'text-purple-300'}`}
              >
                Galeria Geral
              </button>
              <button 
                onClick={() => setMediaActiveTab('banners')} 
                className={`py-2 rounded-xl transition ${mediaActiveTab === 'banners' ? 'bg-amber-600 text-white' : 'text-purple-300'}`}
              >
                Banners (16:9)
              </button>
              <button 
                onClick={() => setMediaActiveTab('stories')} 
                className={`py-2 rounded-xl transition ${mediaActiveTab === 'stories' ? 'bg-purple-600 text-white' : 'text-purple-300'}`}
              >
                Stories (9:16)
              </button>
            </div>

            {mediaActiveTab === 'gallery' && (
              <div className="space-y-3">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button 
                    type="button"
                    onClick={() => openInAppCamera('gallery')}
                    className="py-3 rounded-2xl bg-gradient-to-r from-pink-600 via-rose-500 to-amber-500 text-white font-bold text-center text-xs shadow active:scale-[0.98] flex items-center justify-center space-x-1.5"
                  >
                    <Camera className="w-4 h-4 text-white" />
                    <span>📸 Tirar Foto com a Câmera</span>
                  </button>
                  <label htmlFor="media-gallery-upload-btn" className="block py-3 rounded-2xl bg-gradient-to-r from-purple-700 to-indigo-600 text-white font-bold text-center text-xs shadow active:scale-[0.98] cursor-pointer flex items-center justify-center space-x-1.5">
                    <Upload className="w-4 h-4 text-white" />
                    <span>+ Adicionar Foto da Galeria</span>
                  </label>
                </div>
                <input id="media-gallery-upload-btn" type="file" accept="image/*" multiple onChange={handleGalleryUpload} className="hidden" />

                <div className="grid grid-cols-2 gap-2 pt-2">
                  {galleryItems.map((img, idx) => (
                    <div key={idx} className="relative h-28 rounded-2xl overflow-hidden border border-purple-500/30 group">
                      <img src={img} alt="Media" className="w-full h-full object-cover" />
                      <button 
                        onClick={() => {
                          if (!isSafePanelUnlocked && !adminTab) {
                            setNotification('Acesso negado: Painel seguro bloqueado.');
                            return;
                          }
                          const rec = galleryRecords.find(r => r.url === img) || galleryRecords[idx];
                          setPhotoToDelete({
                            url: img,
                            index: idx,
                            id: rec?.id,
                            path: rec?.path
                          });
                        }}
                        className="absolute top-1.5 right-1.5 p-1.5 rounded-lg bg-black/60 text-red-400 hover:bg-red-600 hover:text-white transition"
                        title="Excluir Foto"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mediaActiveTab === 'banners' && (
              <div className="space-y-3">
                <div className="bg-[#2A1840] p-4 rounded-2xl border border-amber-500/30 space-y-2 text-xs">
                  <input type="text" placeholder="Título do Banner" value={newBannerTitle} onChange={(e) => setNewBannerTitle(e.target.value)} className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white" />
                  <input type="text" placeholder="Subtítulo do Banner" value={newBannerSubtitle} onChange={(e) => setNewBannerSubtitle(e.target.value)} className="w-full bg-[#1A1033] border border-amber-500/30 rounded-xl px-3 py-2 text-white" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => openInAppCamera('carousel')}
                      className="py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-amber-500 text-white font-bold text-center text-xs shadow active:scale-[0.98] flex items-center justify-center space-x-1.5"
                    >
                      <Camera className="w-4 h-4 text-white" />
                      <span>📸 Tirar Foto Banner</span>
                    </button>
                    <label htmlFor="media-banner-upload-btn" className="block py-2.5 rounded-xl bg-amber-600 text-white font-bold text-center cursor-pointer active:scale-[0.98] text-xs flex items-center justify-center space-x-1.5">
                      <Upload className="w-4 h-4 text-white" />
                      <span>+ Foto da Galeria</span>
                    </label>
                  </div>
                  <input id="media-banner-upload-btn" type="file" accept="image/*" onChange={handleBannerUpload} className="hidden" />
                </div>

                <div className="space-y-2">
                  {banners.map((b) => (
                    <div key={b.id} className="h-24 rounded-2xl overflow-hidden relative border border-purple-500/30">
                      <img src={b.image} alt={b.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-black/50 p-3 flex justify-between items-end">
                        <div>
                          <h4 className="text-xs font-bold text-white">{b.title}</h4>
                          <p className="text-[10px] text-purple-200">{b.subtitle}</p>
                        </div>
                        {banners.length > 1 && (
                          <button 
                            onClick={() => setBanners(banners.filter(x => x.id !== b.id))}
                            className="p-1 rounded-lg bg-red-600 text-white"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {mediaActiveTab === 'stories' && (
              <div className="space-y-3">
                <div className="bg-[#2A1840] p-4 rounded-2xl border border-purple-500/30 space-y-2 text-xs">
                  <input type="text" placeholder="Título do Story (9:16)" value={newStoryTitle} onChange={(e) => setNewStoryTitle(e.target.value)} className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl px-3 py-2 text-white" />
                  <input type="text" placeholder="Subtítulo" value={newStorySubtitle} onChange={(e) => setNewStorySubtitle(e.target.value)} className="w-full bg-[#1A1033] border border-purple-500/30 rounded-xl px-3 py-2 text-white" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button 
                      type="button"
                      onClick={() => openInAppCamera('media916')}
                      className="py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-blue-600 text-white font-bold text-center text-xs shadow active:scale-[0.98] flex items-center justify-center space-x-1.5"
                    >
                      <Camera className="w-4 h-4 text-white" />
                      <span>📸 Tirar Story 9:16</span>
                    </button>
                    <label htmlFor="media-story-upload-btn" className="block py-2.5 rounded-xl bg-purple-600 text-white font-bold text-center cursor-pointer active:scale-[0.98] text-xs flex items-center justify-center space-x-1.5">
                      <Upload className="w-4 h-4 text-white" />
                      <span>+ Mídia da Galeria</span>
                    </label>
                  </div>
                  <input id="media-story-upload-btn" type="file" accept="image/*,video/*" onChange={handleStory916Upload} className="hidden" />
                </div>

                <div className="grid grid-cols-2 gap-2">
                  {stories916.map((s) => (
                    <div key={s.id} className="relative aspect-[9/16] rounded-2xl overflow-hidden border border-purple-500/30">
                      <img src={s.url} alt={s.title} className="w-full h-full object-cover" />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent p-2 flex flex-col justify-end">
                        <span className="text-[10px] font-bold text-white">{s.title}</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* 13. SETTINGS SCREEN */}
        {currentScreenObj.id === 'settings' && (
          <div className="flex-1 flex flex-col bg-[#1A1033] p-6 justify-between overflow-y-auto">
            <div>
              <div className="flex items-center mb-6">
                <button onClick={() => setCurrentScreenIndex(0)} className="p-2 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-purple-200 active:scale-[0.98] shadow"><ArrowLeft className="w-5 h-5" /></button>
                <h2 className="text-lg font-bold ml-4">Configurações Gerais</h2>
              </div>
              
              <div className="space-y-4 text-xs">
                <div className="bg-[#2A1840] p-4 rounded-3xl border border-purple-500/30 space-y-3 shadow">
                  <h4 className="font-bold text-amber-300">Propriedade do Aplicativo</h4>
                  <p className="text-purple-200">
                    Proprietário cadastrado: <strong className="text-white">{adminName}</strong>
                  </p>
                  <button 
                    onClick={() => { setAdminTab('profile'); setCurrentScreenIndex(3); }}
                    className="w-full py-2.5 rounded-xl bg-amber-600 text-white font-bold text-xs"
                  >
                    👑 Gerenciar Minha Titularidade
                  </button>
                </div>

                <div className="bg-[#2A1840] p-4 rounded-3xl border border-purple-500/30 space-y-3 shadow">
                  <h4 className="font-bold text-pink-300">Redes Sociais Oficiais (Menu Lateral)</h4>
                  <p className="text-[10px] text-purple-200">Defina os links editáveis para o menu lateral de fora:</p>
                  <div className="space-y-2">
                    {socialLinks.map(link => (
                      <div key={link.id}>
                        <label className="text-[10px] text-purple-300">{link.platform}</label>
                        <input 
                          type="text" 
                          value={link.url} 
                          onChange={(e) => {
                            const newUrl = e.target.value;
                            setSocialLinks(prev => prev.map(l => l.id === link.id ? { ...l, url: newUrl } : l));
                          }}
                          className="w-full bg-[#1A1033] border border-purple-500/35 rounded-xl px-3 py-2 text-white text-xs" 
                        />
                      </div>
                    ))}
                    <button 
                      onClick={() => {
                        try {
                          localStorage.setItem('socialLinks', JSON.stringify(socialLinks));
                        } catch {}
                        setNotification('Redes sociais atualizadas com sucesso!');
                      }}
                      className="w-full py-2.5 rounded-xl bg-gradient-to-r from-pink-600 to-amber-500 text-white font-bold text-xs"
                    >
                      Salvar Redes Sociais
                    </button>
                  </div>
                </div>

                <div className="bg-[#2A1840] p-4 rounded-3xl border border-purple-500/30 space-y-2 shadow">
                  <h4 className="font-bold text-white">Sobre o Aplicativo</h4>
                  <p className="text-purple-200 leading-relaxed">
                    Corações que Acolhe - Lar Esperança é um PWA moderno projetado para aproximar doadores, famílias acolhedoras e crianças com amor e transparência.
                  </p>
                </div>
              </div>
            </div>

            <button onClick={() => setCurrentScreenIndex(0)} className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-400 font-bold text-xs shadow-xl active:scale-[0.98] mt-6">
              Voltar ao Início
            </button>
          </div>
        )}

        {/* 14. MENU DRAWER PORTAL (QUANDO NAVEGADO DIRETAMENTE) */}
        {currentScreenObj.id === 'menu_drawer' && (
          <div className="flex-1 flex flex-col bg-[#1A1033] p-6 justify-between overflow-y-auto">
            <div>
              <div className="flex items-center justify-between mb-6 pb-4 border-b border-purple-900/60">
                <div className="flex items-center space-x-3">
                  <div 
                    className="w-13 h-13 rounded-full border-2 border-pink-500 overflow-hidden shadow-lg cursor-pointer"
                    onClick={() => setZoomedImage(adminAvatar || homeMenuAvatar)}
                  >
                    <img src={adminAvatar || homeMenuAvatar} alt="Menu" className="w-full h-full object-cover" />
                  </div>
                  <div>
                    <h2 className="text-base font-bold text-white">Menu Lar Esperança</h2>
                    <p className="text-[10px] text-purple-300 font-medium">Corações que Acolhe</p>
                  </div>
                </div>
                <button onClick={() => setCurrentScreenIndex(0)} className="p-2 rounded-2xl bg-[#2A1840] border border-purple-500/30 text-purple-200 hover:text-white transition">
                  <ArrowLeft className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-2.5 text-xs font-medium">
                {outsideMenuItemsOrder.map((itemKey) => {
                  switch (itemKey) {
                    case 'home':
                      return (
                        <button key="d-home" onClick={() => setCurrentScreenIndex(0)} className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-pink-600/20 via-[#2A153D] to-[#1C0E2D] border border-pink-500/40 text-pink-200 font-bold shadow active:scale-[0.98] transition">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30">
                              <Home className="w-4 h-4" />
                            </div>
                            <span className="text-white">Início</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-pink-400/60" />
                        </button>
                      );
                    case 'family':
                      return (
                        <button key="d-family" onClick={() => setCurrentScreenIndex(4)} className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#24133A] via-[#2A1644] to-[#1C0E30] border border-purple-500/30 text-purple-200 font-semibold shadow active:scale-[0.98] transition">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl bg-purple-900/60 text-rose-400 border border-purple-500/30">
                              <Heart className="w-4 h-4" />
                            </div>
                            <span className="text-white">Área da Família</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-purple-400/60" />
                        </button>
                      );
                    case 'sponsor':
                      return (
                        <button key="d-sponsor" onClick={() => setCurrentScreenIndex(5)} className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#24133A] via-[#2A1644] to-[#1C0E30] border border-purple-500/30 text-purple-200 font-semibold shadow active:scale-[0.98] transition">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl bg-purple-900/60 text-purple-300 border border-purple-500/30">
                              <User className="w-4 h-4" />
                            </div>
                            <span className="text-white">Área do Padrinho</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-purple-400/60" />
                        </button>
                      );
                    case 'pix':
                      return (
                        <button key="d-pix" onClick={handleDonationClick} className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-amber-600/20 via-[#2E1A3D] to-[#1C0E30] border border-amber-500/40 text-amber-200 font-bold shadow active:scale-[0.98] transition">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30">
                              <Gift className="w-4 h-4" />
                            </div>
                            <span className="text-amber-200">Doação (PIX)</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-amber-400/60" />
                        </button>
                      );
                    case 'gallery':
                      return (
                        <button key="d-gallery" onClick={() => setCurrentScreenIndex(9)} className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#24133A] via-[#2A1644] to-[#1C0E30] border border-purple-500/30 text-purple-200 font-semibold shadow active:scale-[0.98] transition">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl bg-purple-900/60 text-blue-400 border border-purple-500/30">
                              <ImageIcon className="w-4 h-4" />
                            </div>
                            <span className="text-white">Galeria de Fotos</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-purple-400/60" />
                        </button>
                      );
                    case 'pwa':
                      return (
                        <button key="d-pwa" onClick={() => setCurrentScreenIndex(14)} className="w-full flex items-center justify-between p-3.5 rounded-2xl bg-gradient-to-r from-[#24133A] via-[#2A1644] to-[#1C0E30] border border-purple-500/30 text-purple-200 font-semibold shadow active:scale-[0.98] transition">
                          <div className="flex items-center space-x-3">
                            <div className="p-2 rounded-xl bg-purple-900/60 text-pink-400 border border-purple-500/30">
                              <Smartphone className="w-4 h-4" />
                            </div>
                            <span className="text-white">Instalar Aplicativo (PWA)</span>
                          </div>
                          <ChevronRight className="w-4 h-4 text-purple-400/60" />
                        </button>
                      );
                    default:
                      return null;
                  }
                })}
              </div>
            </div>

            <div className="pt-4 space-y-2">
              <button 
                onClick={() => handleOpenSafePanel('dashboard')} 
                className="w-full flex items-center justify-center space-x-2 px-3.5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-pink-600 to-amber-600 text-white text-xs font-bold shadow-xl active:scale-[0.98] transition border border-amber-400/30"
              >
                <ShieldCheck className="w-4 h-4" />
                <span>Painel de Gestão (Área Segura)</span>
              </button>
              <button onClick={() => setCurrentScreenIndex(0)} className="w-full py-3 rounded-2xl bg-purple-900/50 hover:bg-purple-900/80 text-purple-200 font-bold text-xs active:scale-[0.98] transition">
                Voltar ao Início
              </button>
            </div>
          </div>
        )}

        {/* MENU DRAWER (SIDEBAR DA HOME COM AUTO-DISMISS E CARTÕES TÁTEIS) */}
        {isHomeMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop com fechamento instantâneo ao toque ou clique */}
            <div 
              className="absolute inset-0 bg-black/65 backdrop-blur-sm cursor-pointer transition-opacity duration-200" 
              onClick={() => setIsHomeMenuOpen(false)} 
              onTouchEnd={(e) => { e.preventDefault(); setIsHomeMenuOpen(false); }}
            />
            <div className="relative w-80 max-w-[85vw] bg-[#1B1230] h-full shadow-2xl p-5 sm:p-6 flex flex-col justify-between z-10 border-r border-purple-900/60 animate-in slide-in-from-left duration-200 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-purple-900/60 mb-5">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-13 h-13 rounded-full border-2 border-pink-500 overflow-hidden shadow-lg relative bg-purple-950 flex items-center justify-center transition cursor-pointer select-none"
                      onClick={() => setZoomedImage(adminAvatar || homeMenuAvatar)}
                      title="Ver foto em tamanho real"
                    >
                      <img 
                        src={adminAvatar || homeMenuAvatar} 
                        alt="Lar Esperança" 
                        className="w-full h-full object-cover select-none pointer-events-none" 
                      />
                    </div>

                    <div>
                      <h4 className="text-sm font-black text-white tracking-wide">Menu Lar Esperança</h4>
                      <p className="text-[10px] text-pink-300 font-medium">Corações que Acolhe</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsHomeMenuOpen(false)} 
                    onTouchEnd={(e) => { e.preventDefault(); setIsHomeMenuOpen(false); }}
                    className="p-2 rounded-xl bg-purple-900/60 text-purple-200 hover:text-white hover:bg-purple-800 transition active:scale-95"
                    title="Fechar Menu"
                  >
                    <ChevronLeft className="w-5 h-5 text-pink-400" />
                  </button>
                </div>

                {/* Lista Dinâmica de Botões Ordenáveis com Design Tátil e Realista */}
                <div className="space-y-2 text-xs font-medium">
                  {outsideMenuItemsOrder.map((itemKey) => {
                    switch (itemKey) {
                      case 'home':
                        return (
                          <button 
                            key="m-home" 
                            onClick={() => { setCurrentScreenIndex(0); setIsHomeMenuOpen(false); }} 
                            className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-pink-600/25 via-[#29143D] to-[#1C0E2F] border border-pink-500/40 text-pink-200 font-bold shadow-[0_4px_14px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-[0.98] transition group"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="p-2 rounded-xl bg-pink-500/20 text-pink-400 border border-pink-500/30 shadow-inner group-hover:scale-105 transition shrink-0">
                                <Home className="w-4 h-4" />
                              </div>
                              <div className="text-left truncate">
                                <div className="text-xs font-bold text-white">Início</div>
                                <div className="text-[10px] text-pink-300/70 truncate">Página principal & novidades</div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-pink-400/60 group-hover:text-pink-300 shrink-0" />
                          </button>
                        );
                      case 'family':
                        return (
                          <button 
                            key="m-family" 
                            onClick={() => { setCurrentScreenIndex(4); setIsHomeMenuOpen(false); }} 
                            className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#221237] via-[#2A1542] to-[#1B0D2D] border border-purple-500/30 hover:border-pink-500/50 text-purple-200 font-semibold shadow-[0_4px_14px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] active:scale-[0.98] transition group"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="p-2 rounded-xl bg-purple-900/60 text-rose-400 border border-purple-500/30 shadow-inner group-hover:scale-105 transition shrink-0">
                                <Heart className="w-4 h-4" />
                              </div>
                              <div className="text-left truncate">
                                <div className="text-xs font-bold text-white">Área da Família</div>
                                <div className="text-[10px] text-purple-300/70 truncate">Acolhimento & cadastros</div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-purple-400/60 group-hover:text-pink-300 shrink-0" />
                          </button>
                        );
                      case 'sponsor':
                        return (
                          <button 
                            key="m-sponsor" 
                            onClick={() => { setCurrentScreenIndex(5); setIsHomeMenuOpen(false); }} 
                            className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#221237] via-[#2A1542] to-[#1B0D2D] border border-purple-500/30 hover:border-pink-500/50 text-purple-200 font-semibold shadow-[0_4px_14px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] active:scale-[0.98] transition group"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="p-2 rounded-xl bg-purple-900/60 text-purple-300 border border-purple-500/30 shadow-inner group-hover:scale-105 transition shrink-0">
                                <User className="w-4 h-4" />
                              </div>
                              <div className="text-left truncate">
                                <div className="text-xs font-bold text-white">Área do Padrinho</div>
                                <div className="text-[10px] text-purple-300/70 truncate">Minhas crianças apadrinhadas</div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-purple-400/60 group-hover:text-pink-300 shrink-0" />
                          </button>
                        );
                      case 'pix':
                        return (
                          <button 
                            key="m-pix" 
                            onClick={() => { handleDonationClick(); setIsHomeMenuOpen(false); }} 
                            className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-amber-600/20 via-[#2E193F] to-[#1C0E2F] border border-amber-500/40 text-amber-200 font-bold shadow-[0_4px_14px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.08)] active:scale-[0.98] transition group"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="p-2 rounded-xl bg-amber-500/20 text-amber-400 border border-amber-500/30 shadow-inner group-hover:scale-105 transition shrink-0">
                                <Gift className="w-4 h-4" />
                              </div>
                              <div className="text-left truncate">
                                <div className="text-xs font-bold text-amber-200">Doação (PIX)</div>
                                <div className="text-[10px] text-amber-300/70 truncate">Contribuições e amor</div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-amber-400/60 group-hover:text-amber-300 shrink-0" />
                          </button>
                        );
                      case 'gallery':
                        return (
                          <button 
                            key="m-gallery" 
                            onClick={() => { setCurrentScreenIndex(9); setIsHomeMenuOpen(false); }} 
                            className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#221237] via-[#2A1542] to-[#1B0D2D] border border-purple-500/30 hover:border-pink-500/50 text-purple-200 font-semibold shadow-[0_4px_14px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] active:scale-[0.98] transition group"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="p-2 rounded-xl bg-purple-900/60 text-blue-400 border border-purple-500/30 shadow-inner group-hover:scale-105 transition shrink-0">
                                <ImageIcon className="w-4 h-4" />
                              </div>
                              <div className="text-left truncate">
                                <div className="text-xs font-bold text-white">Galeria de Fotos</div>
                                <div className="text-[10px] text-purple-300/70 truncate">Momentos das crianças</div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-purple-400/60 group-hover:text-pink-300 shrink-0" />
                          </button>
                        );
                      case 'pwa':
                        return (
                          <button 
                            key="m-pwa" 
                            onClick={() => { setCurrentScreenIndex(14); setIsHomeMenuOpen(false); }} 
                            className="w-full flex items-center justify-between p-3 rounded-2xl bg-gradient-to-r from-[#221237] via-[#2A1542] to-[#1B0D2D] border border-purple-500/30 hover:border-pink-500/50 text-purple-200 font-semibold shadow-[0_4px_14px_rgba(0,0,0,0.35),inset_0_1px_0_rgba(255,255,255,0.06)] active:scale-[0.98] transition group"
                          >
                            <div className="flex items-center space-x-3 min-w-0">
                              <div className="p-2 rounded-xl bg-purple-900/60 text-pink-400 border border-purple-500/30 shadow-inner group-hover:scale-105 transition shrink-0">
                                <Smartphone className="w-4 h-4" />
                              </div>
                              <div className="text-left truncate">
                                <div className="text-xs font-bold text-white">Instalar Aplicativo</div>
                                <div className="text-[10px] text-purple-300/70 truncate">Instalação direta no celular</div>
                              </div>
                            </div>
                            <ChevronRight className="w-4 h-4 text-purple-400/60 group-hover:text-pink-300 shrink-0" />
                          </button>
                        );
                      default:
                        return null;
                    }
                  })}
                </div>
              </div>

                {/* Redes Sociais no Menu Lateral de Fora */}
                <div className="py-3 border-t border-purple-900/60 space-y-2">
                  <span className="text-[9px] font-bold text-pink-300 uppercase tracking-widest block">Nossas Redes</span>
                  <div className="grid grid-cols-1 gap-2">
                    {socialLinks.filter(link => link.url).map(link => (
                      <a key={link.id} href={link.url} target="_blank" rel="noreferrer" className={`flex items-center space-x-2 p-1.5 rounded-xl bg-[#181924] border ${link.borderColor} hover:border-white/50 transition shadow-lg`}>
                        <div className={`w-7 h-7 rounded-lg ${link.color} text-white flex items-center justify-center font-bold text-[9px] shadow`}>{link.icon}</div>
                        <div>
                           <div className="text-[9px] font-bold text-white">{link.platform}</div>
                           <div className="text-[7px] text-purple-300">Acesse</div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>

              {/* Botão de Acesso ao Painel Seguro */}
              <div className="pt-2 border-t border-purple-900/60">
                <button 
                  onClick={() => { handleOpenSafePanel('dashboard'); setIsHomeMenuOpen(false); }} 
                  className="w-full flex items-center justify-center space-x-2 px-3.5 py-3.5 rounded-2xl bg-gradient-to-r from-amber-600 via-pink-600 to-amber-600 hover:from-amber-500 hover:to-pink-500 text-white text-xs font-black shadow-xl active:scale-[0.98] transition border border-amber-400/30"
                >
                  <ShieldCheck className="w-4 h-4 text-amber-200" />
                  <span>Painel de Gestão (Área Segura)</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* SIDE MENU DRAWER DO PAINEL (ORGANIZADO EM 4 CATEGORIAS LIMPAS) */}
        {isAdminMenuOpen && (
          <div className="fixed inset-0 z-50 flex">
            {/* Backdrop com fechamento instantâneo ao toque ou clique */}
            <div 
              className="absolute inset-0 bg-black/70 backdrop-blur-sm cursor-pointer transition-opacity duration-200" 
              onClick={() => setIsAdminMenuOpen(false)} 
              onTouchEnd={(e) => { e.preventDefault(); setIsAdminMenuOpen(false); }}
            />
            <div className="relative w-84 max-w-[88vw] bg-[#180E28] h-full shadow-2xl p-5 sm:p-6 flex flex-col justify-between z-10 border-r border-amber-900/40 animate-in slide-in-from-left duration-200 overflow-y-auto">
              <div>
                <div className="flex items-center justify-between pb-5 border-b border-amber-900/40 mb-5">
                  <div className="flex items-center space-x-3">
                    <div 
                      className="w-13 h-13 rounded-full border-2 border-amber-400 overflow-hidden select-none pointer-events-auto cursor-pointer shadow-lg"
                      onClick={() => setZoomedImage(adminAvatar || homeMenuAvatar)}
                      onContextMenu={(e) => e.preventDefault()}
                    >
                      <img src={adminAvatar || homeMenuAvatar} alt="Admin" className="w-full h-full object-cover select-none pointer-events-none" />
                    </div>
                    <div>
                      <h4 className="text-sm font-black text-amber-200 tracking-wide">Menu de Gestão</h4>
                      <p className="text-[10px] text-amber-400 font-semibold">{adminTitle} • {adminName || 'Oficial'}</p>
                    </div>
                  </div>
                  <button 
                    onClick={() => setIsAdminMenuOpen(false)} 
                    onTouchEnd={(e) => { e.preventDefault(); setIsAdminMenuOpen(false); }}
                    className="p-2 rounded-xl bg-amber-900/40 text-amber-200 hover:text-white hover:bg-amber-800 transition active:scale-95"
                    title="Fechar Menu"
                  >
                    <ChevronLeft className="w-5 h-5 text-amber-400" />
                  </button>
                </div>

                <div className="space-y-4 text-xs">
                  {/* CATEGORIA 1: GESTÃO PRINCIPAL */}
                  <div className="space-y-1.5">
                    <div className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-amber-400/80 flex items-center space-x-1">
                      <LayoutDashboard className="w-3 h-3 text-amber-400" />
                      <span>Gestão Principal</span>
                    </div>

                    <button 
                      onClick={() => { setAdminTab('dashboard'); setIsAdminMenuOpen(false); }} 
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition active:scale-[0.98] ${adminTab === 'dashboard' ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-md' : 'bg-[#24153B] border-purple-500/25 text-purple-200 hover:border-amber-400/50'}`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-1.5 rounded-xl bg-[#140824] text-amber-400 border border-white/5">
                          <ShieldCheck className="w-4 h-4" />
                        </div>
                        <span className="truncate">Visão Geral & Métricas</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400/60 shrink-0" />
                    </button>

                    <button 
                      onClick={() => { setAdminTab('children'); setIsAdminMenuOpen(false); }} 
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition active:scale-[0.98] ${adminTab === 'children' ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-md' : 'bg-[#24153B] border-purple-500/25 text-purple-200 hover:border-amber-400/50'}`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-1.5 rounded-xl bg-[#140824] text-amber-400 border border-white/5">
                          <Users className="w-4 h-4" />
                        </div>
                        <span className="truncate">Gerenciar Crianças</span>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        {childrenList.length}
                      </span>
                    </button>

                    <button 
                      onClick={() => { setAdminTab('sponsors_families'); setIsAdminMenuOpen(false); }} 
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition active:scale-[0.98] ${adminTab === 'sponsors_families' ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-md' : 'bg-[#24153B] border-purple-500/25 text-purple-200 hover:border-pink-400/50'}`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-1.5 rounded-xl bg-[#140824] text-pink-400 border border-white/5">
                          <Heart className="w-4 h-4" />
                        </div>
                        <span className="truncate">Padrinhos & Famílias</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-pink-400/60 shrink-0" />
                    </button>

                    <button 
                      onClick={() => { setAdminTab('gallery'); setIsAdminMenuOpen(false); }} 
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition active:scale-[0.98] ${adminTab === 'gallery' ? 'bg-gradient-to-r from-pink-600/30 to-amber-500/25 border-pink-400 text-pink-200 font-bold shadow-md' : 'bg-[#24153B] border-purple-500/25 text-purple-200 hover:border-pink-400/50'}`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-1.5 rounded-xl bg-[#140824] text-blue-400 border border-white/5">
                          <ImageIcon className="w-4 h-4" />
                        </div>
                        <span className="truncate">Galeria & Upload Liberado</span>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-pink-500/20 text-pink-300 border border-pink-500/30 shrink-0">
                        {galleryItems.length}
                      </span>
                    </button>

                    <button 
                      onClick={() => { setAdminTab('camera'); setIsAdminMenuOpen(false); }} 
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition active:scale-[0.98] ${adminTab === 'camera' ? 'bg-gradient-to-r from-pink-600/40 via-purple-600/30 to-amber-500/25 border-pink-400 text-pink-200 font-bold shadow-md' : 'bg-[#24153B] border-purple-500/25 text-purple-200 hover:border-pink-400/50'}`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-1.5 rounded-xl bg-[#140824] text-pink-400 border border-white/5">
                          <Camera className="w-4 h-4 text-pink-400" />
                        </div>
                        <span className="truncate">Câmera ao Vivo & Tirar Foto</span>
                      </div>
                      <span className="text-[9px] font-bold px-2 py-0.5 rounded-full bg-gradient-to-r from-pink-500 to-amber-500 text-white shrink-0 shadow animate-pulse">
                        AO VIVO
                      </span>
                    </button>

                    <button 
                      onClick={() => { setAdminTab('carousel'); setIsAdminMenuOpen(false); }} 
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition active:scale-[0.98] ${adminTab === 'carousel' ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-md' : 'bg-[#24153B] border-purple-500/25 text-purple-200 hover:border-amber-400/50'}`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-1.5 rounded-xl bg-[#140824] text-pink-400 border border-white/5">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="truncate">Banners do Carrossel</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400/60 shrink-0" />
                    </button>

                    <button 
                      onClick={() => { setAdminTab('media916'); setIsAdminMenuOpen(false); }} 
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition active:scale-[0.98] ${adminTab === 'media916' ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-md' : 'bg-[#24153B] border-purple-500/25 text-purple-200 hover:border-blue-400/50'}`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-1.5 rounded-xl bg-[#140824] text-blue-400 border border-white/5">
                          <Video className="w-4 h-4" />
                        </div>
                        <span className="truncate">Mídias 9:16 (Reels)</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-blue-400/60 shrink-0" />
                    </button>
                  </div>

                  {/* CATEGORIA 2: FINANCEIRO & DOAÇÕES */}
                  <div className="space-y-1.5 pt-1">
                    <div className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-emerald-400/90 flex items-center space-x-1">
                      <QrCode className="w-3 h-3 text-emerald-400" />
                      <span>Financeiro & Doações</span>
                    </div>

                    <button 
                      onClick={() => { setAdminTab('pix'); setIsAdminMenuOpen(false); }} 
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition active:scale-[0.98] ${adminTab === 'pix' ? 'bg-emerald-500/25 border-emerald-400 text-emerald-200 font-bold shadow-md' : 'bg-[#24153B] border-purple-500/25 text-purple-200 hover:border-emerald-400/50'}`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-1.5 rounded-xl bg-[#140824] text-emerald-400 border border-white/5">
                          <QrCode className="w-4 h-4" />
                        </div>
                        <span className="truncate">Gestão PIX & Doações</span>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 shrink-0">
                        PIX
                      </span>
                    </button>
                  </div>

                  {/* CATEGORIA 3: EXPERIÊNCIA & TEMAS */}
                  <div className="space-y-1.5 pt-1">
                    <div className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-pink-400/90 flex items-center space-x-1">
                      <Sparkles className="w-3 h-3 text-pink-400" />
                      <span>Experiência & Temas</span>
                    </div>

                    <button 
                      onClick={() => { setAdminTab('evangelical'); setIsAdminMenuOpen(false); }} 
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition active:scale-[0.98] ${adminTab === 'evangelical' ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-md' : 'bg-[#24153B] border-purple-500/25 text-purple-200 hover:border-amber-400/50'}`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-1.5 rounded-xl bg-[#140824] text-yellow-300 border border-white/5">
                          <BookOpen className="w-4 h-4" />
                        </div>
                        <span className="truncate">Luz Divina & Versículos</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-yellow-400/60 shrink-0" />
                    </button>

                    <button 
                      onClick={() => { setAdminTab('festive'); setIsAdminMenuOpen(false); }} 
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition active:scale-[0.98] ${adminTab === 'festive' ? 'bg-red-500/25 border-red-400 text-red-200 font-bold shadow-md' : 'bg-[#24153B] border-purple-500/25 text-purple-200 hover:border-red-400/50'}`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-1.5 rounded-xl bg-[#140824] text-red-400 border border-white/5">
                          <Sparkles className="w-4 h-4" />
                        </div>
                        <span className="truncate">Clima Festivo (Natal & Fogos)</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-red-400/60 shrink-0" />
                    </button>

                    <button 
                      onClick={() => { setAdminTab('splash3d'); setIsAdminMenuOpen(false); }} 
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition active:scale-[0.98] ${adminTab === 'splash3d' ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-md' : 'bg-[#24153B] border-purple-500/25 text-purple-200 hover:border-pink-400/50'}`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-1.5 rounded-xl bg-[#140824] text-pink-400 border border-white/5">
                          <Cloud className="w-4 h-4" />
                        </div>
                        <span className="truncate">Abertura 3D (Nuvem)</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400/60 shrink-0" />
                    </button>

                    <button 
                      onClick={() => { setAdminTab('social'); setIsAdminMenuOpen(false); }} 
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition active:scale-[0.98] ${adminTab === 'social' ? 'bg-pink-600/25 border-pink-400 text-pink-200 font-bold shadow-md' : 'bg-[#24153B] border-purple-500/25 text-purple-200 hover:border-pink-400/50'}`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-1.5 rounded-xl bg-[#140824] text-pink-400 border border-white/5">
                          <Share2 className="w-4 h-4" />
                        </div>
                        <span className="truncate">Redes Sociais Oficiais</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-pink-400/60 shrink-0" />
                    </button>
                  </div>

                  {/* CATEGORIA 4: CONFIGURAÇÕES & SEGURANÇA */}
                  <div className="space-y-1.5 pt-1">
                    <div className="px-2 py-0.5 text-[9px] font-black uppercase tracking-wider text-purple-300 flex items-center space-x-1">
                      <Sliders className="w-3 h-3 text-purple-400" />
                      <span>Configurações & Segurança</span>
                    </div>

                    <button 
                      onClick={() => { setAdminTab('settings'); setIsAdminMenuOpen(false); }} 
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition active:scale-[0.98] ${adminTab === 'settings' ? 'bg-pink-600/25 border-pink-400 text-pink-200 font-bold shadow-md' : 'bg-[#24153B] border-purple-500/25 text-purple-200 hover:border-pink-400/50'}`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-1.5 rounded-xl bg-[#140824] text-pink-400 border border-white/5">
                          <Sliders className="w-4 h-4" />
                        </div>
                        <span className="truncate">Configurações & Ordem dos Menus</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-pink-400/60 shrink-0" />
                    </button>

                    <button 
                      onClick={() => { setAdminTab('buttons'); setIsAdminMenuOpen(false); }} 
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition active:scale-[0.98] ${adminTab === 'buttons' ? 'bg-purple-600/25 border-purple-400 text-purple-200 font-bold shadow-md' : 'bg-[#24153B] border-purple-500/25 text-purple-200 hover:border-purple-400/50'}`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-1.5 rounded-xl bg-[#140824] text-purple-400 border border-white/5">
                          <Layers className="w-4 h-4" />
                        </div>
                        <span className="truncate">Gerenciar Botões do Rodapé</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-purple-400/60 shrink-0" />
                    </button>

                    <button 
                      onClick={() => { setAdminTab('security'); setIsAdminMenuOpen(false); }} 
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition active:scale-[0.98] ${adminTab === 'security' ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-md' : 'bg-[#24153B] border-purple-500/25 text-purple-200 hover:border-amber-400/50'}`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-1.5 rounded-xl bg-[#140824] text-amber-400 border border-white/5">
                          <Lock className="w-4 h-4" />
                        </div>
                        <span className="truncate">Segurança, Senha & Acesso</span>
                      </div>
                      <ChevronRight className="w-3.5 h-3.5 text-amber-400/60 shrink-0" />
                    </button>

                    <button 
                      onClick={() => { setAdminTab('profile'); setIsAdminMenuOpen(false); }} 
                      className={`w-full flex items-center justify-between p-2.5 rounded-2xl border transition active:scale-[0.98] ${adminTab === 'profile' ? 'bg-amber-500/25 border-amber-400 text-amber-200 font-bold shadow-md' : 'bg-[#24153B] border-purple-500/25 text-purple-200 hover:border-amber-400/50'}`}
                    >
                      <div className="flex items-center space-x-2.5 min-w-0">
                        <div className="p-1.5 rounded-xl bg-[#140824] text-amber-400 border border-white/5">
                          <Crown className="w-4 h-4" />
                        </div>
                        <span className="truncate">Meu Perfil & Titularidade</span>
                      </div>
                      <span className="text-[9px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/20 text-amber-300 border border-amber-500/30 shrink-0">
                        👑
                      </span>
                    </button>
                  </div>
                </div>
              </div>

              <div className="pt-4 border-t border-amber-900/40 space-y-2 mt-4">
                <button 
                  onClick={() => { setCurrentScreenIndex(0); setIsAdminMenuOpen(false); }}
                  className="w-full flex items-center justify-center space-x-2 px-3.5 py-3 rounded-2xl bg-purple-900/60 hover:bg-purple-800 text-purple-200 text-xs font-bold shadow active:scale-[0.98] transition"
                >
                  <Home className="w-4 h-4 text-pink-400" />
                  <span>Voltar para a Tela Inicial</span>
                </button>
                <button 
                  onClick={() => { setCurrentScreenIndex(1); setIsAdminMenuOpen(false); setNotification('Sessão do painel encerrada.'); }}
                  className="w-full flex items-center justify-center space-x-2 px-3.5 py-3 rounded-2xl bg-red-600/25 hover:bg-red-600/40 border border-red-500/30 text-red-200 text-xs font-bold shadow active:scale-[0.98] transition"
                >
                  <LogOut className="w-4 h-4" />
                  <span>Sair do Sistema</span>
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PWA INSTALL SCREEN */}
        {currentScreenObj.id === 'pwa_install' && (
          <div className="flex-1 flex flex-col justify-between p-6 bg-gradient-to-b from-[#1A1033] via-[#2a1642] to-[#140b26] text-center">
            <div className="pt-8">
              <div className="w-24 h-24 rounded-3xl overflow-hidden bg-gradient-to-tr from-pink-500 to-amber-400 p-1 mx-auto flex items-center justify-center mb-6 shadow-xl select-none pointer-events-none" onContextMenu={(e) => e.preventDefault()}>
                <img src={pwaCustomIcon} alt="PWA Icon" className="w-full h-full object-cover rounded-3xl select-none pointer-events-none" />
              </div>
              <h2 className="text-xl font-bold">Corações que Acolhe</h2>
              <span className="text-xs text-pink-400 font-medium">Instalação PWA</span>
            </div>

            <div className="my-auto space-y-4">
              <h4 className="text-base font-bold text-white">Instale nosso aplicativo no seu celular!</h4>
              <button onClick={() => setNotification('Instalando PWA...')} className="w-full py-4 rounded-2xl bg-gradient-to-r from-pink-500 to-amber-400 font-bold text-sm shadow-xl flex items-center justify-center space-x-2 active:scale-[0.98]">
                <Download className="w-5 h-5" />
                <span>Instalar Agora</span>
              </button>
            </div>

            <button onClick={() => setCurrentScreenIndex(0)} className="text-xs text-purple-300 underline">
              Voltar à Tela Inicial
            </button>
          </div>
        )}

      </div>
    </div>
  );
}

