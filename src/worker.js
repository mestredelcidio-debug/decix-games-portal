const GAMEPIX_FEED = 'https://feeds.gamepix.com/v2/json?sid=902E1&pagination=12&page=';
const CACHE_TTL = 10 * 60;

function toStringValue(value, fallback = '') {
  return value === undefined || value === null ? fallback : String(value);
}

function slugify(value) {
  return toStringValue(value, 'jogo')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .replace(/[^a-z0-9 -]/g, '')
    .trim()
    .replace(/\\s+/g, '-')
    .replace(/-+/g, '-') || 'jogo';
}

function findItems(payload) {
  if (Array.isArray(payload)) return payload;
  if (!payload || typeof payload !== 'object') return [];

  for (const key of ['games', 'items', 'results', 'data', 'list']) {
    if (Array.isArray(payload[key])) return payload[key];
  }

  for (const value of Object.values(payload)) {
    if (Array.isArray(value) && value.some((item) => item && typeof item === 'object')) {
      return value;
    }
  }

  return [];
}

function normalize(item) {
  const id = toStringValue(item.id || item.game_id || item.uuid || item.sid);
  const title = toStringValue(item.title || item.name || item.game_name, 'Jogo GamePix');
  const gameUrl = toStringValue(
    item.url || item.gameUrl || item.game_url || item.play_url,
    id ? `https://games.gamepix.com/play/${id}` : ''
  );

  if (!id || !gameUrl) return null;

  const categoryRaw = toStringValue(item.category || item.genre || item.category_name, 'Raciocínio');
  const categoryLower = categoryRaw.toLowerCase();
  let categorySlug = 'raciocinio';
  if (/word|palavr|crossword|text/.test(categoryLower)) categorySlug = 'palavras';
  else if (/math|matemat|number|calcul/.test(categoryLower)) categorySlug = 'matematica';
  else if (/memor|pair/.test(categoryLower)) categorySlug = 'memoria';
  else if (/board|tabuleir|chess|xadrez|checkers/.test(categoryLower)) categorySlug = 'tabuleiro';
  else if (/puzzl|quebra|block|match|jigsaw/.test(categoryLower)) categorySlug = 'quebra-cabeca';
  else if (/logic|logica|brain|cerebro|quiz/.test(categoryLower)) categorySlug = 'logica';
  else if (/strateg|estrateg/.test(categoryLower)) categorySlug = 'estrategia';
  else if (/race|corrid|\\bcar\\b|drive/.test(categoryLower)) categorySlug = 'corrida';
  else if (/sport|esport|foot|socc|basket/.test(categoryLower)) categorySlug = 'esportes';
  else if (/advent|aventur|quest|rpg/.test(categoryLower)) categorySlug = 'aventura';
  else if (/act|acao|fight|shoot/.test(categoryLower)) categorySlug = 'acao';
  else if (/arcade|retro|pinball/.test(categoryLower)) categorySlug = 'arcade';
  else if (/casual|relax|clicker/.test(categoryLower)) categorySlug = 'casual';

  const categoryNames = {
    raciocinio: 'Raciocínio', logica: 'Lógica', palavras: 'Palavras',
    'quebra-cabeca': 'Quebra-Cabeça', matematica: 'Matemática',
    memoria: 'Memória', tabuleiro: 'Tabuleiro', estrategia: 'Estratégia',
    arcade: 'Arcade', acao: 'Ação', aventura: 'Aventura',
    corrida: 'Corrida', esportes: 'Esportes', casual: 'Casual'
  };

  const thumbnail = toStringValue(
    item.thumbnail || item.image || item.thumb || item.cover || item.banner,
    '/src/assets/images/decix_hero_showcase_1791322352592.jpg'
  );

  const rawTags = Array.isArray(item.tags)
    ? item.tags.map((tag) => toStringValue(tag).toLowerCase()).filter(Boolean)
    : toStringValue(item.tags).split(',').map((tag) => tag.trim().toLowerCase()).filter(Boolean);

  const tags = rawTags.includes(categorySlug) ? rawTags : [categorySlug, ...rawTags];

  const popularity = Number(item.popularity ?? item.quality_score ?? 80);
  const rating = Number(item.rating ?? 4.5);
  const playCount = Number(item.playCount ?? item.views ?? 0);

  return {
    id: `gamepix-${id}`,
    slug: `${slugify(item.slug || title)}-${id}`,
    title,
    description: toStringValue(item.description || item.desc || item.short_description, 'Jogue grátis na DECIX GAMES.'),
    thumbnail,
    bannerUrl: typeof item.banner === 'string' ? item.banner : thumbnail,
    gameUrl,
    category: categoryNames[categorySlug] || categoryRaw,
    categorySlug,
    tags,
    width: Number(item.width) || 800,
    height: Number(item.height) || 600,
    orientation: /portrait|vertical/i.test(toStringValue(item.orientation)) ? 'portrait' : /landscape|horizontal/i.test(toStringValue(item.orientation)) ? 'landscape' : 'any',
    publisher: toStringValue(item.publisher || item.developer || item.author, 'GamePix Partner'),
    releaseDate: toStringValue(item.release_date || item.date || item.created_at, new Date().toISOString().slice(0, 10)),
    isNew: Boolean(item.isNew || item.new || item.is_new),
    isFeatured: Boolean(item.isFeatured || item.featured || item.is_featured),
    popularity: Math.min(100, Math.max(0, Number.isFinite(popularity) ? popularity : 80)),
    rating: Number.isFinite(rating) ? Math.min(5, Math.max(0, rating)) : 4.5,
    playCount: Number.isFinite(playCount) ? playCount : 0,
    provider: 'GAMEPIX',
    embedType: 'iframe',
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

async function getGamePixGames(request) {
  const url = new URL(request.url);
  const page = Math.max(1, Number(url.searchParams.get('page') || 1));
  const limit = Math.min(120, Math.max(12, Number(url.searchParams.get('limit') || 120)));
  const pages = Math.max(1, Math.ceil(limit / 12));
  const cache = caches.default;
  const cacheKey = new Request(`${url.origin}/__decix_gamepix_cache?page=${page}&limit=${limit}`);
  const cached = await cache.match(cacheKey);

  if (cached) return cached;

  const all = [];
  for (let p = page; p < page + pages; p += 1) {
    const feedResponse = await fetch(`${GAMEPIX_FEED}${p}`, {
      headers: { Accept: 'application/json' }
    });

    if (!feedResponse.ok) throw new Error(`GamePix respondeu HTTP ${feedResponse.status}`);

    const payload = await feedResponse.json();
    const items = findItems(payload);

    for (const item of items) {
      const normalized = normalize(item);
      if (normalized && !all.some((game) => game.id === normalized.id)) all.push(normalized);
    }

    if (items.length < 12) break;
  }

  const response = new Response(JSON.stringify({
    games: all,
    total: all.length,
    page,
    limit,
    hasMore: all.length >= limit
  }), {
    headers: {
      'content-type': 'application/json; charset=utf-8',
      'cache-control': `public, max-age=${CACHE_TTL}`,
      'access-control-allow-origin': '*'
    }
  });

  await cache.put(cacheKey, response.clone());
  return response;
}

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === '/api/gamepix') {
      try {
        return await getGamePixGames(request);
      } catch (error) {
        return new Response(JSON.stringify({
          games: [],
          total: 0,
          error: error instanceof Error ? error.message : 'Falha ao consultar GamePix'
        }), {
          status: 502,
          headers: {
            'content-type': 'application/json; charset=utf-8',
            'access-control-allow-origin': '*'
          }
        });
      }
    }

    return env.ASSETS.fetch(request);
  }
};
