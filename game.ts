/**
 * DECIX GAMES – Core Type Definitions
 * Modelos padronizados de dados de jogos, categorias e provedores
 */

export type GameProvider = 'GAMEPIX' | 'DECIX' | 'PARTNER';

export type GameOrientation = 'landscape' | 'portrait' | 'any';

export type GameEmbedType = 'iframe' | 'internal' | 'html5' | 'sdk';

export interface GameMonetizationConfig {
  hasAds: boolean;
  bannerSupported?: boolean;
  interstitialSupported?: boolean;
  rewardedSupported?: boolean;
  provider?: 'GAMEPIX' | 'DECIX' | 'CUSTOM';
}

export interface DecixGame {
  id: string;
  slug: string;
  title: string;
  description: string;
  thumbnail: string;
  bannerUrl?: string;
  gameUrl: string;
  category: string;
  categorySlug: string;
  tags: string[];
  width?: number;
  height?: number;
  orientation: GameOrientation;
  publisher: string;
  releaseDate: string;
  isNew: boolean;
  isFeatured: boolean;
  popularity: number;
  rating?: number;
  playCount?: number;
  provider: GameProvider;
  embedType: GameEmbedType;
  monetization?: GameMonetizationConfig;
  instructions?: string;
  controls?: string[];
}

export interface GameCategory {
  id: string;
  slug: string;
  name: string;
  description: string;
  icon: string;
  color: string;
  isPrimary?: boolean;
  count?: number;
}

export interface StrategicCategoryConfig {
  slug: string;
  categoryName: string;
  campaignTitle: string;
  tagline: string;
  badgeText?: string;
  description: string;
  priority: number; // 1 = highest
  active: boolean;
  bannerUrl?: string;
  accentColor?: string;
  featuredGameSlugs?: string[];
}

export interface GameListResponse {
  games: DecixGame[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  hasMore: boolean;
  cached?: boolean;
}

export interface GameHistoryEntry {
  gameId: string;
  slug: string;
  title: string;
  thumbnail: string;
  category: string;
  categorySlug: string;
  lastPlayedAt: string; // ISO Date
  playDurationSeconds?: number;
}

export interface SystemStats {
  totalGames: number;
  totalCategories: number;
  featuredCount: number;
  providerBreakdown: Record<GameProvider, number>;
  gamepixConfigured: boolean;
  cacheStatus: {
    entries: number;
    hits: number;
    misses: number;
  };
}
