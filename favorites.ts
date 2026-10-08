/**
 * DECIX GAMES – Favorites Service
 * Armazena localmente os jogos favoritos do usuário com eventos reativos.
 * Arquitetura desacoplada pronta para sincronização com banco de dados ou conta de usuário.
 */

const FAVORITES_KEY = 'decix_favorites_v1';

export const favoritesService = {
  getFavoriteIds(): string[] {
    try {
      const data = localStorage.getItem(FAVORITES_KEY);
      return data ? JSON.parse(data) : [];
    } catch {
      return [];
    }
  },

  isFavorite(gameId: string): boolean {
    const list = this.getFavoriteIds();
    return list.includes(gameId);
  },

  toggleFavorite(gameId: string): boolean {
    try {
      const list = this.getFavoriteIds();
      const index = list.indexOf(gameId);
      let isNowFavorite = false;

      if (index >= 0) {
        list.splice(index, 1);
        isNowFavorite = false;
      } else {
        list.unshift(gameId);
        isNowFavorite = true;
      }

      localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('decix_favorites_updated', { detail: { gameId, isNowFavorite } }));
      return isNowFavorite;
    } catch {
      return false;
    }
  },

  removeFavorite(gameId: string): void {
    const list = this.getFavoriteIds().filter((id) => id !== gameId);
    try {
      localStorage.setItem(FAVORITES_KEY, JSON.stringify(list));
      window.dispatchEvent(new CustomEvent('decix_favorites_updated', { detail: { gameId, isNowFavorite: false } }));
    } catch {
      // noop
    }
  },

  clearAll(): void {
    try {
      localStorage.removeItem(FAVORITES_KEY);
      window.dispatchEvent(new CustomEvent('decix_favorites_updated', { detail: {} }));
    } catch {
      // noop
    }
  }
};
