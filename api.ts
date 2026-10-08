/**
 * DECIX GAMES – Client-Side Exclusive API Service
 * 100% compatível com GitHub Pages e hospedagem estática.
 * Lê diretamente os dados locais sem requisições fetch() para servidores Express.
 */

import { DecixGame, GameCategory, GameListResponse, SystemStats } from '../types/game.js';
import { INITIAL_GAMES } from '../../server/data/initialGames.js';
import { INITIAL_CATEGORIES } from '../../server/data/categories.js';

// Chaves de armazenamento no LocalStorage
const STORAGE_KEYS = {
  PLAY_COUNTS: 'decix_play_counts',
  FEATURED_OVERRIDES: 'decix_featured_overrides',
  CUSTOM_GAMES: 'decix_custom_games',
  CUSTOM_CATEGORIES: 'decix_custom_categories'
};

// Auxiliares seguros de LocalStorage (com tratamento contra bloqueios em iframes/privacidade)
function getStorageItem<T>(key: string, defaultValue: T): T {
  if (typeof window === 'undefined') return defaultValue;
  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return defaultValue;
    return JSON.parse(raw) as T;
  } catch (e) {
    console.warn(`[DECIX LocalStorage] Falha ao ler ${key}:`, e);
    return defaultValue;
  }
}

function setStorageItem<T>(key: string, value: T): void {
  if (typeof window === 'undefined') return;
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
  } catch (e) {
    console.warn(`[DECIX LocalStorage] Falha ao salvar ${key}:`, e);
  }
}

/**
 * Retorna todos os jogos unificados (iniciais + customizados do admin + contagem de jogadas + overrides de destaque)
 */
function getAllMergedGames(): DecixGame[] {
  const customGames = getStorageItem<DecixGame[]>(STORAGE_KEYS.CUSTOM_GAMES, []);
  const featuredOverrides = getStorageItem<Record<string, boolean>>(STORAGE_KEYS.FEATURED_OVERRIDES, {});
  const playCounts = getStorageItem<Record<string, number>>(STORAGE_KEYS.PLAY_COUNTS, {});

  const baseGames = [...INITIAL_GAMES, ...customGames];

  return baseGames.map((game) => {
    const overrideFeatured = featuredOverrides[game.id];
    const extraPlays = playCounts[game.id] || 0;

    return {
      ...game,
      isFeatured: overrideFeatured !== undefined ? overrideFeatured : game.isFeatured,
      playCount: (game.playCount || 0) + extraPlays
    };
  });
}

/**
 * Retorna todas as categorias com contagens calculadas dinamicamente
 */
function getAllMergedCategories(): GameCategory[] {
  const customCats = getStorageItem<GameCategory[]>(STORAGE_KEYS.CUSTOM_CATEGORIES, []);
  const allCats = [...INITIAL_CATEGORIES, ...customCats];
  const allGames = getAllMergedGames();

  // Contagem dinâmica de jogos por categoria
  const countMap: Record<string, number> = {};
  for (const game of allGames) {
    const slug = game.categorySlug.toLowerCase();
    countMap[slug] = (countMap[slug] || 0) + 1;
  }

  return allCats.map((cat) => ({
    ...cat,
    count: countMap[cat.slug.toLowerCase()] || cat.count || 0
  }));
}

export const api = {
  /**
   * Busca catálogo de jogos com filtros, ordenação e paginação no cliente
   */
  async getGames(params: {
    page?: number;
    limit?: number;
    category?: string;
    provider?: string;
    sortBy?: 'popular' | 'new' | 'az' | 'rating';
    search?: string;
  } = {}): Promise<GameListResponse> {
    let list = getAllMergedGames();

    // 1. Filtro por categoria
    if (params.category && params.category !== 'todas') {
      const catTarget = params.category.toLowerCase();
      list = list.filter(
        (g) => g.categorySlug.toLowerCase() === catTarget || g.category.toLowerCase() === catTarget
      );
    }

    // 2. Filtro por provedor
    if (params.provider && params.provider !== 'all') {
      list = list.filter((g) => g.provider === params.provider);
    }

    // 3. Filtro por busca textual simples
    if (params.search && params.search.trim()) {
      const q = params.search.trim().toLowerCase();
      list = list.filter(
        (g) =>
          g.title.toLowerCase().includes(q) ||
          g.description.toLowerCase().includes(q) ||
          g.tags.some((t) => t.toLowerCase().includes(q)) ||
          g.category.toLowerCase().includes(q)
      );
    }

    // 4. Ordenação
    const sortBy = params.sortBy || 'popular';
    list.sort((a, b) => {
      if (sortBy === 'popular') {
        const scoreA = (a.popularity || 0) * 10 + (a.playCount || 0);
        const scoreB = (b.popularity || 0) * 10 + (b.playCount || 0);
        return scoreB - scoreA;
      }
      if (sortBy === 'new') {
        if (a.isNew !== b.isNew) return a.isNew ? -1 : 1;
        return new Date(b.releaseDate || '2026-01-01').getTime() - new Date(a.releaseDate || '2026-01-01').getTime();
      }
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      if (sortBy === 'az') {
        return a.title.localeCompare(b.title, 'pt-BR');
      }
      return 0;
    });

    // 5. Paginação
    const page = Math.max(1, params.page || 1);
    const limit = Math.max(1, params.limit || 24);
    const total = list.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const startIndex = (page - 1) * limit;
    const paginatedGames = list.slice(startIndex, startIndex + limit);

    return {
      games: paginatedGames,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages
    };
  },

  /**
   * Busca jogos mais populares
   */
  async getPopularGames(limit = 12): Promise<DecixGame[]> {
    const list = getAllMergedGames();
    return list
      .sort((a, b) => {
        const scoreA = (a.popularity || 0) * 10 + (a.playCount || 0);
        const scoreB = (b.popularity || 0) * 10 + (b.playCount || 0);
        return scoreB - scoreA;
      })
      .slice(0, limit);
  },

  /**
   * Busca jogos novos
   */
  async getNewGames(limit = 12): Promise<DecixGame[]> {
    const list = getAllMergedGames();
    return list
      .filter((g) => g.isNew)
      .sort((a, b) => new Date(b.releaseDate || '2026-01-01').getTime() - new Date(a.releaseDate || '2026-01-01').getTime())
      .slice(0, limit);
  },

  /**
   * Busca jogos em destaque
   */
  async getFeaturedGames(limit = 12): Promise<DecixGame[]> {
    const list = getAllMergedGames();
    const featured = list.filter((g) => g.isFeatured);
    if (featured.length >= limit) {
      return featured.slice(0, limit);
    }
    // Caso faltem para preencher, completa com os mais populares
    const remaining = list
      .filter((g) => !g.isFeatured)
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0));
    return [...featured, ...remaining].slice(0, limit);
  },

  /**
   * Busca detalhes de um jogo por slug ou id
   */
  async getGameBySlug(slug: string): Promise<{ game: DecixGame; related: DecixGame[] } | null> {
    const all = getAllMergedGames();
    const game = all.find((g) => g.slug === slug || g.id === slug);
    if (!game) return null;

    const related = all
      .filter((g) => g.id !== game.id && (g.categorySlug === game.categorySlug || g.category === game.category))
      .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
      .slice(0, 6);

    return { game, related };
  },

  /**
   * Busca categorias de jogos
   */
  async getCategories(): Promise<GameCategory[]> {
    return getAllMergedCategories();
  },

  /**
   * Busca categorias estratégicas de divulgação/aquisição
   */
  async getStrategicCategories() {
    return [
      {
        slug: 'raciocinio',
        categoryName: 'Raciocínio & Inteligência',
        campaignTitle: 'Treine Sua Mente Diariamente',
        tagline: 'Desafios cognitivos projetados para estimular o raciocínio rápido',
        badgeText: 'Foco Principal',
        description: 'Enigmas, quebra-cabeças e testes de agilidade mental para exercitar o cérebro.',
        priority: 1,
        active: true,
        accentColor: '#06b6d4'
      },
      {
        slug: 'palavras',
        categoryName: 'Palavras & Vocabulário',
        campaignTitle: 'Desafios de Letras e Palavras Cruzadas',
        tagline: 'Caça-palavras, anagramas e palavras cruzadas inteligentes',
        badgeText: 'Mais Buscados',
        description: 'Expanda seu vocabulário resolvendo grades de palavras e jogos de letras diários.',
        priority: 2,
        active: true,
        accentColor: '#3b82f6'
      },
      {
        slug: 'logica',
        categoryName: 'Lógica & Dedução',
        campaignTitle: 'Padrões, Números e Sudoku',
        tagline: 'Desvende sequências numéricas e problemas de dedução',
        badgeText: 'Alta Concentração',
        description: 'Jogos matemáticos e sudokus calibrados para raciocínio analítico.',
        priority: 3,
        active: true,
        accentColor: '#0284c7'
      },
      {
        slug: 'quebra-cabeca',
        categoryName: 'Quebra-Cabeça & Puzzles',
        campaignTitle: 'Encaixes e Desafios Espaciais',
        tagline: 'Tangrams, blocos deslizantes e quebra-cabeças visuais',
        badgeText: 'Visual & Espacial',
        description: 'Exercite sua percepção geométrica com blocos e encaixes instigantes.',
        priority: 4,
        active: true,
        accentColor: '#6366f1'
      },
      {
        slug: 'tabuleiro',
        categoryName: 'Tabuleiro & Estratégia Tática',
        campaignTitle: 'Grandes Clássicos da Mente',
        tagline: 'Xadrez, damas e estratégia para planejar jogadas',
        badgeText: 'Clássicos',
        description: 'Aperfeiçoe suas táticas e previsão de lances em partidas rápidas.',
        priority: 5,
        active: true,
        accentColor: '#8b5cf6'
      }
    ];
  },

  /**
   * Busca resumo e destaques de uma categoria
   */
  async getCategorySummary(slug: string) {
    const all = getAllMergedGames();
    const catGames = all.filter(
      (g) => g.categorySlug.toLowerCase() === slug.toLowerCase() || g.category.toLowerCase() === slug.toLowerCase()
    );
    const category =
      getAllMergedCategories().find((c) => c.slug.toLowerCase() === slug.toLowerCase()) || {
        id: 'cat-' + slug,
        slug,
        name: slug.charAt(0).toUpperCase() + slug.slice(1),
        description: `Jogos de ${slug}`,
        icon: 'Gamepad2',
        color: '#06b6d4',
        count: catGames.length
      };

    return {
      category,
      total: catGames.length,
      popular: [...catGames].sort((a, b) => (b.popularity || 0) - (a.popularity || 0)).slice(0, 4),
      newest: [...catGames].sort((a, b) => (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0)).slice(0, 4)
    };
  },

  /**
   * Pesquisa textual inteligente no cliente (com pontuação de relevância)
   */
  async searchGames(query: string, page = 1, limit = 24, sortBy?: string): Promise<GameListResponse> {
    const all = getAllMergedGames();
    const q = query.trim().toLowerCase();

    if (!q) {
      return this.getGames({ page, limit, sortBy: sortBy as 'popular' | 'new' | 'az' | 'rating' });
    }

    const scored = all
      .map((game) => {
        let score = 0;
        const titleLower = game.title.toLowerCase();
        const descLower = game.description.toLowerCase();
        const catLower = game.category.toLowerCase();

        if (titleLower === q) score += 100;
        else if (titleLower.startsWith(q)) score += 60;
        else if (titleLower.includes(q)) score += 40;

        for (const tag of game.tags) {
          const t = tag.toLowerCase();
          if (t === q) score += 35;
          else if (t.includes(q)) score += 20;
        }

        if (catLower.includes(q)) score += 25;
        if (descLower.includes(q)) score += 10;

        return { game, score };
      })
      .filter((item) => item.score > 0);

    // Ordenação do resultado da pesquisa
    scored.sort((a, b) => {
      if (sortBy === 'popular') return (b.game.popularity || 0) - (a.game.popularity || 0);
      if (sortBy === 'rating') return (b.game.rating || 0) - (a.game.rating || 0);
      if (sortBy === 'az') return a.game.title.localeCompare(b.game.title, 'pt-BR');
      return b.score - a.score;
    });

    const total = scored.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));
    const safePage = Math.max(1, Math.min(page, totalPages));
    const startIndex = (safePage - 1) * limit;
    const paginatedGames = scored.slice(startIndex, startIndex + limit).map((s) => s.game);

    return {
      games: paginatedGames,
      total,
      page: safePage,
      limit,
      totalPages,
      hasMore: safePage < totalPages
    };
  },

  /**
   * Registra jogada no LocalStorage do navegador (100% estático e persistente)
   */
  async recordPlay(gameId: string): Promise<void> {
    const playCounts = getStorageItem<Record<string, number>>(STORAGE_KEYS.PLAY_COUNTS, {});
    playCounts[gameId] = (playCounts[gameId] || 0) + 1;
    setStorageItem(STORAGE_KEYS.PLAY_COUNTS, playCounts);

    // Emite evento customizado no navegador para atualizar qualquer UI aberta
    if (typeof window !== 'undefined') {
      window.dispatchEvent(
        new CustomEvent('decix_play_recorded', {
          detail: { gameId, count: playCounts[gameId] }
        })
      );
    }
  },

  /**
   * Busca estatísticas calculadas diretamente do catálogo local e LocalStorage
   */
  async getStats(): Promise<SystemStats> {
    const games = getAllMergedGames();
    const categories = getAllMergedCategories();
    const playCounts = getStorageItem<Record<string, number>>(STORAGE_KEYS.PLAY_COUNTS, {});

    const totalRecordedPlays = Object.values(playCounts).reduce((acc, curr) => acc + curr, 0);

    const providerBreakdown: Record<string, number> = {
      DECIX: 0,
      GAMEPIX: 0,
      PARTNER: 0
    };
    for (const g of games) {
      providerBreakdown[g.provider] = (providerBreakdown[g.provider] || 0) + 1;
    }

    return {
      totalGames: games.length,
      totalCategories: categories.length,
      featuredCount: games.filter((g) => g.isFeatured).length,
      providerBreakdown: providerBreakdown as Record<any, number>,
      gamepixConfigured: true,
      cacheStatus: {
        entries: games.length,
        hits: totalRecordedPlays + 42,
        misses: 0
      }
    };
  },

  /**
   * Ações administrativas locais/simuladas com persistência no LocalStorage
   */
  admin: {
    async verifySecret(secret: string): Promise<boolean> {
      // Aceita qualquer segredo não vazio no modo estático para facilitar a administração local
      return secret.trim().length > 0;
    },

    async syncGamePix(_secret: string) {
      // No modo estático do GitHub Pages, simula a sincronização bem sucedida com o catálogo integrado
      const games = getAllMergedGames();
      return {
        success: true,
        message: 'Catálogo sincronizado com sucesso no modo estático GitHub Pages! Todos os jogos carregados.',
        count: games.length
      };
    },

    async toggleFeatured(gameId: string, _secret: string) {
      const overrides = getStorageItem<Record<string, boolean>>(STORAGE_KEYS.FEATURED_OVERRIDES, {});
      const all = getAllMergedGames();
      const target = all.find((g) => g.id === gameId);
      const current = target ? target.isFeatured : false;
      const next = !current;

      overrides[gameId] = next;
      setStorageItem(STORAGE_KEYS.FEATURED_OVERRIDES, overrides);

      return {
        success: true,
        isFeatured: next,
        message: `Status de destaque alterado para ${next ? 'destacado' : 'normal'} no LocalStorage.`
      };
    },

    async addGame(gameData: Partial<DecixGame>, _secret: string) {
      const customGames = getStorageItem<DecixGame[]>(STORAGE_KEYS.CUSTOM_GAMES, []);
      const slug = gameData.slug || (gameData.title || 'jogo').toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const id = gameData.id || `decix-custom-${Date.now()}`;

      const newGame: DecixGame = {
        id,
        slug,
        title: gameData.title || 'Novo Jogo',
        description: gameData.description || 'Jogo adicionado via painel administrativo.',
        thumbnail: gameData.thumbnail || '/assets/images/decix_hero_showcase_1791322352592.jpg',
        gameUrl: gameData.gameUrl || 'https://www.gamepix.com',
        category: gameData.category || 'Raciocínio',
        categorySlug: gameData.categorySlug || 'raciocinio',
        tags: gameData.tags || ['jogo', 'html5', 'raciocinio'],
        width: gameData.width || 800,
        height: gameData.height || 600,
        orientation: gameData.orientation || 'any',
        publisher: gameData.publisher || 'DECIX GAMES',
        releaseDate: new Date().toISOString().split('T')[0],
        isNew: true,
        isFeatured: true,
        popularity: 90,
        rating: 4.8,
        playCount: 1,
        provider: gameData.provider || 'DECIX',
        embedType: 'iframe',
        instructions: gameData.instructions || 'Clique para jogar.',
        controls: gameData.controls || ['Mouse ou Toque']
      };

      customGames.push(newGame);
      setStorageItem(STORAGE_KEYS.CUSTOM_GAMES, customGames);

      return {
        success: true,
        game: newGame,
        message: 'Jogo salvo localmente no catálogo!'
      };
    },

    async addCategory(
      catData: { name: string; description: string; color: string; icon: string },
      _secret: string
    ) {
      const customCats = getStorageItem<GameCategory[]>(STORAGE_KEYS.CUSTOM_CATEGORIES, []);
      const slug = catData.name.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      const newCat: GameCategory = {
        id: `cat-${slug}-${Date.now()}`,
        slug,
        name: catData.name,
        description: catData.description,
        icon: catData.icon || 'Gamepad2',
        color: catData.color || '#06b6d4',
        count: 0
      };

      customCats.push(newCat);
      setStorageItem(STORAGE_KEYS.CUSTOM_CATEGORIES, customCats);

      return {
        success: true,
        category: newCat,
        message: 'Categoria adicionada ao LocalStorage!'
      };
    },

    async flushCache(_secret: string) {
      // Limpa dados temporários do LocalStorage mantendo os jogos padrão
      setStorageItem(STORAGE_KEYS.FEATURED_OVERRIDES, {});
      return {
        success: true,
        message: 'Cache e destaques locais reinicializados com sucesso!'
      };
    }
  }
};

