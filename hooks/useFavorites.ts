import { useState, useEffect, useCallback } from 'react';
import { favoritesService } from '../services/favorites.js';
import { analytics } from '../services/analytics.js';

export function useFavorites() {
  const [favoriteIds, setFavoriteIds] = useState<string[]>(() => favoritesService.getFavoriteIds());

  useEffect(() => {
    const handleUpdate = () => {
      setFavoriteIds(favoritesService.getFavoriteIds());
    };

    window.addEventListener('decix_favorites_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('decix_favorites_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const isFavorite = useCallback(
    (gameId: string) => favoriteIds.includes(gameId),
    [favoriteIds]
  );

  const toggleFavorite = useCallback((gameId: string) => {
    const isNowFav = favoritesService.toggleFavorite(gameId);
    analytics.trackFavoriteToggle(gameId, isNowFav);
    return isNowFav;
  }, []);

  const removeFavorite = useCallback((gameId: string) => {
    favoritesService.removeFavorite(gameId);
    analytics.trackFavoriteToggle(gameId, false);
  }, []);

  return {
    favoriteIds,
    count: favoriteIds.length,
    isFavorite,
    toggleFavorite,
    removeFavorite
  };
}
