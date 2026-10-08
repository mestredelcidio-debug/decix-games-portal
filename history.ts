/**
 * DECIX GAMES – History & "Continue Jogando" Service
 * Registra o histórico local de jogos acessados com timestamps.
 * Arquitetura preparada para migração com contas autenticadas.
 */

import { DecixGame, GameHistoryEntry } from '../types/game.js';

const HISTORY_KEY = 'decix_play_history_v1';
const MAX_HISTORY_ENTRIES = 20;

export const historyService = {
  getHistory(): GameHistoryEntry[] {
    try {
      const data = localStorage.getItem(HISTORY_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  recordGamePlay(game: DecixGame): void {
    try {
      let list = this.getHistory();
      // Remove previous entry of the same game to bring to top
      list = list.filter((item) => item.gameId !== game.id);

      const entry: GameHistoryEntry = {
        gameId: game.id,
        slug: game.slug,
        title: game.title,
        thumbnail: game.thumbnail,
        category: game.category,
        categorySlug: game.categorySlug,
        lastPlayedAt: new Date().toISOString()
      };

      list.unshift(entry);
      if (list.length > MAX_HISTORY_ENTRIES) {
        list = list.slice(0, MAX_HISTORY_ENTRIES);
      }

      localStorage.setItem(HISTORY_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('decix_history_updated', { detail: { entry } }));
    } catch {
      // noop
    }
  },

  clearHistory(): void {
    try {
      localStorage.removeItem(HISTORY_KEY);
      window.dispatchEvent(new CustomEvent('decix_history_updated', { detail: {} }));
    } catch {
      // noop
    }
  }
};
