/**
 * DECIX GAMES – GamePix API Service
 * 
 * Camada oficial de integração backend com a plataforma GamePix.
 * Conforme diretrizes:
 * - Credenciais e chaves NUNCA chegam ao frontend.
 * - Endpoints oficiais validados com fallback defensivo.
 * - Se GAMEPIX_API_KEY ou GAMEPIX_API_URL não estiverem configuradas,
 *   marca claramente como "CONFIGURAÇÃO NECESSÁRIA" sem inventar dados falsos.
 */

import { DecixGame } from '../../src/types/game.js';
import { globalCache } from './cache.service.js';
import { normalizeGamePixItem } from './normalization.service.js';

export interface GamePixSyncResult {
  success: boolean;
  timestamp: string;
  configured: boolean;
  gamesFound: number;
  gamesAdded: number;
  gamesUpdated: number;
  message: string;
  error?: string;
}

export class GamePixService {
  private apiKey: string;
  private apiUrl: string;

  constructor() {
    this.apiKey = process.env.GAMEPIX_API_KEY || '';
    this.apiUrl = process.env.GAMEPIX_API_URL || 'https://games.gamepix.com/games';
  }

  /**
   * Verifica se as credenciais oficiais da GamePix estão devidamente configuradas no ambiente.
   */
  public isConfigured(): boolean {
    return Boolean(this.apiKey && this.apiKey.trim().length > 0);
  }

  /**
   * Busca a lista de jogos oficiais da GamePix com cache transparente.
   */
  public async fetchGames(options: { page?: number; limit?: number; category?: string } = {}): Promise<{
    games: DecixGame[];
    total: number;
    fromCache: boolean;
    configured: boolean;
  }> {
    const page = options.page || 1;
    const limit = options.limit || 24;
    const cacheKey = `gamepix:list:p${page}:l${limit}:c${options.category || 'all'}`;

    const cached = globalCache.get<{ games: DecixGame[]; total: number }>(cacheKey);
    if (cached) {
      return { ...cached, fromCache: true, configured: this.isConfigured() };
    }

    if (!this.isConfigured()) {
      // CONFIGURAÇÃO NECESSÁRIA:
      // O portal funcionará no modo híbrido / demonstração até que GAMEPIX_API_KEY seja informada no .env
      return {
        games: [],
        total: 0,
        fromCache: false,
        configured: false
      };
    }

    try {
      // Parâmetros oficiais da API GamePix:
      // Endpoint padrão da GamePix para publishers: https://games.gamepix.com/games?page={page}&pagination={limit}&sid={apiKey}
      const url = new URL(this.apiUrl);
      url.searchParams.set('page', String(page));
      url.searchParams.set('pagination', String(limit));
      url.searchParams.set('sid', this.apiKey);

      if (options.category) {
        url.searchParams.set('category', options.category);
      }

      const response = await fetch(url.toString(), {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'User-Agent': 'DecixGamesPortal/1.0 (+https://decixgames.com)'
        },
        signal: AbortSignal.timeout(8000) // 8s timeout seguro
      });

      if (!response.ok) {
        throw new Error(`GamePix API retornou status HTTP ${response.status}: ${response.statusText}`);
      }

      const data = (await response.json()) as Record<string, unknown> | unknown[];
      const rawItems = Array.isArray(data)
        ? data
        : Array.isArray((data as Record<string, unknown>)?.data)
        ? ((data as Record<string, unknown>).data as unknown[])
        : Array.isArray((data as Record<string, unknown>)?.items)
        ? ((data as Record<string, unknown>).items as unknown[])
        : [];
      const total =
        !Array.isArray(data) && typeof (data as Record<string, unknown>)?.total === 'number'
          ? ((data as Record<string, unknown>).total as number)
          : rawItems.length;

      const normalizedGames: DecixGame[] = rawItems.map((item) =>
        normalizeGamePixItem(item as Record<string, unknown>)
      );

      // Salva no cache com TTL padrão
      globalCache.set(cacheKey, { games: normalizedGames, total });

      return {
        games: normalizedGames,
        total,
        fromCache: false,
        configured: true
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      console.warn(`[GamePixService] Falha ao consultar API GamePix (${errorMsg}). Utilizando catálogo local.`);
      return {
        games: [],
        total: 0,
        fromCache: false,
        configured: true
      };
    }
  }

  /**
   * Sincroniza o catálogo completo da GamePix para o repositório DECIX GAMES.
   * Acionado via POST /api/admin/sync-gamepix protegido por senha.
   */
  public async syncCatalog(currentCatalog: DecixGame[]): Promise<{
    syncResult: GamePixSyncResult;
    updatedCatalog: DecixGame[];
  }> {
    const timestamp = new Date().toISOString();

    if (!this.isConfigured()) {
      return {
        syncResult: {
          success: false,
          timestamp,
          configured: false,
          gamesFound: 0,
          gamesAdded: 0,
          gamesUpdated: 0,
          message: 'CONFIGURAÇÃO NECESSÁRIA: Defina a variável GAMEPIX_API_KEY no arquivo .env para habilitar a sincronização automática.'
        },
        updatedCatalog: currentCatalog
      };
    }

    try {
      const { games: incomingGames } = await this.fetchGames({ page: 1, limit: 100 });

      if (incomingGames.length === 0) {
        return {
          syncResult: {
            success: true,
            timestamp,
            configured: true,
            gamesFound: 0,
            gamesAdded: 0,
            gamesUpdated: 0,
            message: 'A consulta à GamePix foi concluída com sucesso, mas nenhum novo jogo foi retornado.'
          },
          updatedCatalog: currentCatalog
        };
      }

      let gamesAdded = 0;
      let gamesUpdated = 0;
      const catalogMap = new Map<string, DecixGame>(currentCatalog.map((g) => [g.id, g]));

      for (const game of incomingGames) {
        if (catalogMap.has(game.id)) {
          // Atualiza dados preservando flags DECIX customizadas (destaque manual, etc.)
          const existing = catalogMap.get(game.id)!;
          catalogMap.set(game.id, {
            ...game,
            isFeatured: existing.isFeatured,
            playCount: existing.playCount
          });
          gamesUpdated++;
        } else {
          catalogMap.set(game.id, game);
          gamesAdded++;
        }
      }

      // Invalida chaves de cache relacionadas a listagens
      globalCache.deletePattern('gamepix:');
      globalCache.deletePattern('games:');

      const updatedCatalog = Array.from(catalogMap.values());

      return {
        syncResult: {
          success: true,
          timestamp,
          configured: true,
          gamesFound: incomingGames.length,
          gamesAdded,
          gamesUpdated,
          message: `Sincronização bem-sucedida! ${gamesAdded} novos jogos adicionados, ${gamesUpdated} atualizados.`
        },
        updatedCatalog
      };
    } catch (err: unknown) {
      const errorMsg = err instanceof Error ? err.message : String(err);
      return {
        syncResult: {
          success: false,
          timestamp,
          configured: true,
          gamesFound: 0,
          gamesAdded: 0,
          gamesUpdated: 0,
          message: `Falha na sincronização: ${errorMsg}`,
          error: errorMsg
        },
        updatedCatalog: currentCatalog
      };
    }
  }
}

export const gamePixService = new GamePixService();
