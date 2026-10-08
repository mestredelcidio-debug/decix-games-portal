/**
 * DECIX GAMES – Core Game Catalog Service
 * Gerencia a lista unificada de jogos, categorias, busca, ordenação,
 * paginação e camada de persistência em memória.
 */

import { DecixGame, GameCategory, GameListResponse, SystemStats, StrategicCategoryConfig } from '../../src/types/game.js';
import { INITIAL_GAMES } from '../data/initialGames.js';
import { INITIAL_CATEGORIES } from '../data/categories.js';
import { INITIAL_STRATEGIC_CATEGORIES } from '../data/campaignCategories.js';
import { globalCache } from './cache.service.js';
import { gamePixService, GamePixSyncResult } from './gamepix.service.js';
import { createSlug } from './normalization.service.js';

export interface GameFilterOptions {
  category?: string;
  search?: string;
  provider?: string;
  isFeatured?: boolean;
  isNew?: boolean;
  sortBy?: 'popular' | 'new' | 'az' | 'rating';
  page?: number;
  limit?: number;
}

export class GameService {
  private games: DecixGame[] = [...INITIAL_GAMES];
  private categories: GameCategory[] = [...INITIAL_CATEGORIES];
  private strategicCategories: StrategicCategoryConfig[] = [...INITIAL_STRATEGIC_CATEGORIES];

  constructor() {
    this.refreshCategoryCounts();
  }

  private refreshCategoryCounts(): void {
    const counts = new Map<string, number>();
    for (const game of this.games) {
      const slug = game.categorySlug;
      counts.set(slug, (counts.get(slug) || 0) + 1);
    }

    this.categories = this.categories.map((cat) => ({
      ...cat,
      count: counts.get(cat.slug) || 0
    }));
  }

  /**
   * Retorna as categorias estratégicas configuradas para campanhas de divulgação.
   */
  public getStrategicCategories(): StrategicCategoryConfig[] {
    return this.strategicCategories
      .filter((c) => c.active)
      .sort((a, b) => a.priority - b.priority);
  }

  /**
   * Atualiza ou adiciona configuração de categoria estratégica.
   */
  public updateStrategicCategory(config: StrategicCategoryConfig): void {
    const idx = this.strategicCategories.findIndex((c) => c.slug === config.slug);
    if (idx >= 0) {
      this.strategicCategories[idx] = config;
    } else {
      this.strategicCategories.push(config);
    }
  }

  /**
   * Retorna resumo detalhado de uma categoria (metadados, contagem, mais jogados e novos).
   */
  public getCategorySummary(slug: string) {
    const catSlug = slug.toLowerCase();
    const category = this.categories.find((c) => c.slug === catSlug || c.slug === createSlug(catSlug));
    const allInCat = this.games.filter(
      (g) => g.categorySlug.toLowerCase() === catSlug || g.category.toLowerCase() === catSlug
    );

    const popular = [...allInCat].sort((a, b) => b.popularity - a.popularity).slice(0, 4);
    const newest = [...allInCat].sort((a, b) => new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime()).slice(0, 4);

    return {
      category: category || {
        id: 'cat-' + catSlug,
        slug: catSlug,
        name: catSlug.charAt(0).toUpperCase() + catSlug.slice(1),
        description: `Jogos da categoria ${catSlug} na DECIX GAMES.`,
        icon: 'Gamepad2',
        color: '#06b6d4',
        count: allInCat.length
      },
      total: allInCat.length,
      popular,
      newest
    };
  }

  /**
   * Retorna jogos filtrados com suporte a paginação e cache.
   */
  public getGames(options: GameFilterOptions = {}): GameListResponse {
    const page = Math.max(1, options.page || 1);
    const limit = Math.min(48, Math.max(1, options.limit || 24));
    const cacheKey = `games:filter:${JSON.stringify(options)}`;

    const cached = globalCache.get<GameListResponse>(cacheKey);
    if (cached) {
      return { ...cached, cached: true };
    }

    let filtered = [...this.games];

    // Filtro por Categoria
    if (options.category && options.category !== 'todas' && options.category !== 'all') {
      const catSlug = options.category.toLowerCase();
      filtered = filtered.filter(
        (g) => g.categorySlug.toLowerCase() === catSlug || g.category.toLowerCase() === catSlug
      );
    }

    // Filtro por Provedor
    if (options.provider) {
      filtered = filtered.filter((g) => g.provider === options.provider);
    }

    // Filtro por Destaque
    if (options.isFeatured !== undefined) {
      filtered = filtered.filter((g) => g.isFeatured === options.isFeatured);
    }

    // Filtro por Novo
    if (options.isNew !== undefined) {
      filtered = filtered.filter((g) => g.isNew === options.isNew);
    }

    // Pesquisa Textual
    if (options.search && options.search.trim().length > 0) {
      const query = options.search.toLowerCase().trim();
      filtered = filtered.filter((g) => {
        const inTitle = g.title.toLowerCase().includes(query);
        const inDesc = g.description.toLowerCase().includes(query);
        const inCategory = g.category.toLowerCase().includes(query);
        const inTags = g.tags.some((t) => t.toLowerCase().includes(query));
        return inTitle || inDesc || inCategory || inTags;
      });
    }

    // Ordenação
    const sortBy = options.sortBy || 'popular';
    filtered.sort((a, b) => {
      if (sortBy === 'new') {
        return new Date(b.releaseDate).getTime() - new Date(a.releaseDate).getTime();
      }
      if (sortBy === 'az') {
        return a.title.localeCompare(b.title);
      }
      if (sortBy === 'rating') {
        return (b.rating || 0) - (a.rating || 0);
      }
      // default: popular
      return b.popularity - a.popularity;
    });

    const total = filtered.length;
    const totalPages = Math.ceil(total / limit) || 1;
    const startIndex = (page - 1) * limit;
    const paginatedGames = filtered.slice(startIndex, startIndex + limit);

    const response: GameListResponse = {
      games: paginatedGames,
      total,
      page,
      limit,
      totalPages,
      hasMore: page < totalPages,
      cached: false
    };

    globalCache.set(cacheKey, response, 120); // 2 minutos
    return response;
  }

  /**
   * Busca um jogo por slug ou id.
   */
  public getGameBySlugOrId(slugOrId: string): DecixGame | null {
    const target = slugOrId.toLowerCase().trim();
    return this.games.find((g) => g.slug.toLowerCase() === target || g.id.toLowerCase() === target) || null;
  }

  /**
   * Retorna jogos relacionados para exibir na página individual.
   */
  public getRelatedGames(game: DecixGame, limit = 6): DecixGame[] {
    return this.games
      .filter((g) => g.id !== game.id && (g.categorySlug === game.categorySlug || g.provider === game.provider))
      .slice(0, limit);
  }

  /**
   * Retorna todas as categorias disponíveis.
   */
  public getCategories(): GameCategory[] {
    return this.categories;
  }

  /**
   * Adiciona uma nova categoria dinâmica.
   */
  public addCategory(cat: Omit<GameCategory, 'id' | 'count'>): GameCategory {
    const slug = createSlug(cat.name);
    const existing = this.categories.find((c) => c.slug === slug);
    if (existing) return existing;

    const newCategory: GameCategory = {
      ...cat,
      id: 'cat-' + slug,
      slug,
      count: 0
    };
    this.categories.push(newCategory);
    this.refreshCategoryCounts();
    globalCache.deletePattern('games:');
    return newCategory;
  }

  /**
   * Adiciona um novo jogo (jogos próprios da DECIX ou parceiros).
   */
  public addGame(game: DecixGame): DecixGame {
    const existingIndex = this.games.findIndex((g) => g.id === game.id || g.slug === game.slug);
    if (existingIndex >= 0) {
      this.games[existingIndex] = game;
    } else {
      this.games.unshift(game);
    }
    this.refreshCategoryCounts();
    globalCache.deletePattern('games:');
    return game;
  }

  /**
   * Alterna o status de destaque de um jogo (Área administrativa).
   */
  public toggleFeatured(id: string): DecixGame | null {
    const game = this.games.find((g) => g.id === id);
    if (!game) return null;
    game.isFeatured = !game.isFeatured;
    globalCache.deletePattern('games:');
    return game;
  }

  /**
   * Registra reprodução do jogo (incrementa contador).
   */
  public registerPlay(id: string): void {
    const game = this.games.find((g) => g.id === id);
    if (game) {
      game.playCount = (game.playCount || 0) + 1;
    }
  }

  /**
   * Executa a sincronização com a GamePix e atualiza o repositório em memória.
   */
  public async syncWithGamePix(): Promise<GamePixSyncResult> {
    const { syncResult, updatedCatalog } = await gamePixService.syncCatalog(this.games);
    if (syncResult.success) {
      this.games = updatedCatalog;
      this.refreshCategoryCounts();
      globalCache.deletePattern('games:');
    }
    return syncResult;
  }

  /**
   * Estatísticas gerais do portal.
   */
  public getStats(): SystemStats {
    const providerBreakdown: Record<string, number> = {
      DECIX: 0,
      GAMEPIX: 0,
      PARTNER: 0
    };

    let featuredCount = 0;
    for (const g of this.games) {
      providerBreakdown[g.provider] = (providerBreakdown[g.provider] || 0) + 1;
      if (g.isFeatured) featuredCount++;
    }

    return {
      totalGames: this.games.length,
      totalCategories: this.categories.length,
      featuredCount,
      providerBreakdown: providerBreakdown as Record<'DECIX' | 'GAMEPIX' | 'PARTNER', number>,
      gamepixConfigured: gamePixService.isConfigured(),
      cacheStatus: globalCache.getStats()
    };
  }
}

export const gameService = new GameService();
