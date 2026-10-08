/**
 * DECIX GAMES – Normalization Service
 * Camada de transformação resiliente de dados externos da GamePix e parceiros
 * para o padrão unificado da DECIX GAMES.
 * NUNCA quebra caso campos estejam ausentes ou com formato inesperado.
 */

import { DecixGame, GameOrientation, GameEmbedType } from '../../src/types/game.js';

export function createSlug(text: string): string {
  if (!text) return 'jogo-' + Math.random().toString(36).substring(2, 8);
  return text
    .toString()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // remove acentos
    .trim()
    .replace(/[^a-z0-9 -]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-');
}

/**
 * Normaliza um item da GamePix ou de qualquer API externa em um DecixGame estruturado.
 */
export function normalizeGamePixItem(item: Record<string, unknown>): DecixGame {
  // Id handling
  const rawId = item.id || item.game_id || item.sid || item.uuid;
  const id = String(rawId || 'gpx-' + Math.random().toString(36).substring(2, 9));

  // Title handling
  const title = String(item.title || item.name || item.game_name || 'Jogo Sem Título').trim();

  // Slug
  const rawSlug = typeof item.slug === 'string' && item.slug ? item.slug : createSlug(title);
  const slug = rawSlug || 'jogo-' + id;

  // Description
  const description = String(
    item.description || item.desc || item.short_description || 'Desafie sua mente neste incrível jogo da DECIX GAMES.'
  ).trim();

  // Thumbnail handling
  const thumbnail = String(
    item.thumbnail ||
    item.image ||
    item.thumb ||
    item.cover ||
    item.banner ||
    '/src/assets/images/decix_hero_showcase_1791322352592.jpg'
  );

  // Game URL handling
  const gameUrl = String(
    item.url ||
    item.gameUrl ||
    item.game_url ||
    item.play_url ||
    (item.id ? `https://games.gamepix.com/play/${item.id}` : '')
  );

  // Category normalization & mapping to DECIX categories
  const rawCat = String(item.category || item.genre || item.category_name || 'Raciocínio').trim();
  const categorySlug = mapToDecixCategorySlug(rawCat);
  const category = getDecixCategoryDisplayName(categorySlug, rawCat);

  // Tags handling
  let tags: string[] = [];
  if (Array.isArray(item.tags)) {
    tags = item.tags.map((t) => String(t).toLowerCase().trim()).filter(Boolean);
  } else if (typeof item.tags === 'string') {
    tags = item.tags.split(',').map((t) => t.trim().toLowerCase()).filter(Boolean);
  }
  if (!tags.includes(categorySlug)) {
    tags.unshift(categorySlug);
  }

  // Dimensions
  const width = typeof item.width === 'number' ? item.width : 800;
  const height = typeof item.height === 'number' ? item.height : 600;

  // Orientation
  let orientation: GameOrientation = 'any';
  const rawOrientation = String(item.orientation || '').toLowerCase();
  if (rawOrientation.includes('land') || rawOrientation === 'horizontal') {
    orientation = 'landscape';
  } else if (rawOrientation.includes('port') || rawOrientation === 'vertical') {
    orientation = 'portrait';
  }

  // Publisher
  const publisher = String(item.publisher || item.developer || item.author || 'GamePix Partner').trim();

  // Release date
  const releaseDate = String(item.release_date || item.date || item.created_at || new Date().toISOString().split('T')[0]);

  // Is New & Is Featured
  const isNew = Boolean(item.isNew || item.new || item.is_new || false);
  const isFeatured = Boolean(item.isFeatured || item.featured || item.is_featured || false);

  // Popularity & Rating
  const popularity = typeof item.popularity === 'number'
    ? Math.min(100, Math.max(0, item.popularity))
    : (typeof item.quality_score === 'number' ? Math.round(item.quality_score * 100) : 80);

  const rating = typeof item.rating === 'number' ? Number(item.rating.toFixed(1)) : 4.5;
  const playCount = typeof item.playCount === 'number' ? item.playCount : (typeof item.views === 'number' ? item.views : Math.floor(Math.random() * 5000 + 1000));

  // Embed Type
  let embedType: GameEmbedType = 'iframe';
  if (gameUrl.startsWith('builtin:')) {
    embedType = 'internal';
  } else if (gameUrl.endsWith('.html') || gameUrl.includes('play')) {
    embedType = 'iframe';
  }

  return {
    id,
    slug,
    title,
    description,
    thumbnail,
    bannerUrl: typeof item.banner === 'string' ? item.banner : undefined,
    gameUrl,
    category,
    categorySlug,
    tags,
    width,
    height,
    orientation,
    publisher,
    releaseDate,
    isNew,
    isFeatured,
    popularity,
    rating,
    playCount,
    provider: 'GAMEPIX',
    embedType,
    monetization: {
      hasAds: true,
      bannerSupported: true,
      interstitialSupported: true,
      rewardedSupported: false,
      provider: 'GAMEPIX'
    },
    instructions: typeof item.instructions === 'string' ? item.instructions : undefined
  };
}

/**
 * Converte qualquer categoria externa para as categorias padrão DECIX
 */
function mapToDecixCategorySlug(raw: string): string {
  const lower = raw.toLowerCase();
  if (lower.includes('word') || lower.includes('palavr') || lower.includes('crossword') || lower.includes('text')) {
    return 'palavras';
  }
  if (lower.includes('math') || lower.includes('matemat') || lower.includes('number') || lower.includes('calcul')) {
    return 'matematica';
  }
  if (lower.includes('memor') || lower.includes('pair')) {
    return 'memoria';
  }
  if (lower.includes('board') || lower.includes('tabuleir') || lower.includes('chess') || lower.includes('xadrez') || lower.includes('checkers')) {
    return 'tabuleiro';
  }
  if (lower.includes('puzzl') || lower.includes('quebra') || lower.includes('block') || lower.includes('match') || lower.includes('jigsaw')) {
    return 'quebra-cabeca';
  }
  if (lower.includes('logic') || lower.includes('logica') || lower.includes('brain') || lower.includes('cerebro') || lower.includes('quiz')) {
    return 'logica';
  }
  if (lower.includes('strateg') || lower.includes('estrateg')) {
    return 'estrategia';
  }
  if (lower.includes('race') || lower.includes('corrid') || lower.includes('car') || lower.includes('drive')) {
    return 'corrida';
  }
  if (lower.includes('sport') || lower.includes('esport') || lower.includes('foot') || lower.includes('socc') || lower.includes('basket')) {
    return 'esportes';
  }
  if (lower.includes('advent') || lower.includes('aventur') || lower.includes('quest') || lower.includes('rpg')) {
    return 'aventura';
  }
  if (lower.includes('act') || lower.includes('acao') || lower.includes('fight') || lower.includes('shoot')) {
    return 'acao';
  }
  if (lower.includes('multi') || lower.includes('pvp') || lower.includes('io') || lower.includes('online')) {
    return 'multiplayer';
  }
  if (lower.includes('arcade') || lower.includes('retro') || lower.includes('pinball')) {
    return 'arcade';
  }
  if (lower.includes('casual') || lower.includes('relax') || lower.includes('clicker')) {
    return 'casual';
  }
  return createSlug(raw) || 'raciocinio';
}

function getDecixCategoryDisplayName(slug: string, fallback: string): string {
  const map: Record<string, string> = {
    'raciocinio': 'Raciocínio',
    'logica': 'Lógica',
    'palavras': 'Palavras',
    'quebra-cabeca': 'Quebra-Cabeça',
    'matematica': 'Matemática',
    'memoria': 'Memória',
    'tabuleiro': 'Tabuleiro',
    'estrategia': 'Estratégia',
    'arcade': 'Arcade',
    'acao': 'Ação',
    'aventura': 'Aventura',
    'corrida': 'Corrida',
    'esportes': 'Esportes',
    'casual': 'Casual',
    'multiplayer': 'Multiplayer'
  };
  return map[slug] || fallback || slug;
}
