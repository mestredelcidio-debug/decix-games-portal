import React, { useState, useEffect } from 'react';
import { Heart, Trash2, Gamepad2, ArrowRight } from 'lucide-react';
import { DecixGame } from '../types/game.js';
import { api } from '../services/api.js';
import { useFavorites } from '../hooks/useFavorites.js';
import { GameCard } from '../components/common/GameCard.js';
import { SkeletonCard } from '../components/common/SkeletonCard.js';
import { useSeo } from '../hooks/useSeo.js';

export const FavoritesPage: React.FC<{ onPlayGame: (g: DecixGame) => void; onNavigate: (p: string) => void }> = ({
  onPlayGame,
  onNavigate
}) => {
  const { favoriteIds } = useFavorites();
  const [favoriteGames, setFavoriteGames] = useState<DecixGame[]>([]);
  const [loading, setLoading] = useState(true);

  useSeo({
    title: 'Meus Jogos Favoritos – DECIX GAMES',
    description: 'Acesse rapidamente seus jogos e enigmas favoritos salvos no portal DECIX GAMES.',
    url: window.location.href
  });

  useEffect(() => {
    async function loadFavGames() {
      setLoading(true);
      try {
        const res = await api.getGames({ limit: 100 });
        const favs = res.games.filter((g) => favoriteIds.includes(g.id));
        setFavoriteGames(favs);
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    loadFavGames();
  }, [favoriteIds]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-rose-950/60 border border-rose-800/80 text-rose-400">
            <Heart className="w-6 h-6 fill-rose-500/30" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">Meus Favoritos</h1>
            <p className="text-xs text-slate-400">Sua coleção pessoal de desafios salvos</p>
          </div>
        </div>

        <span className="text-xs text-slate-400 font-mono">
          {favoriteGames.length} {favoriteGames.length === 1 ? 'jogo' : 'jogos'}
        </span>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : favoriteGames.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {favoriteGames.map((game) => (
            <GameCard key={game.id} game={game} onPlay={onPlayGame} />
          ))}
        </div>
      ) : (
        <div className="text-center py-20 bg-gray-900/40 rounded-2xl border border-slate-800 p-8 max-w-md mx-auto">
          <Heart className="w-14 h-14 text-slate-700 mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-slate-200">
            Você ainda não favoritou nenhum jogo
          </h3>
          <p className="text-xs text-slate-500 mt-1">
            Clique no ícone de coração em qualquer jogo do catálogo para salvá-lo aqui.
          </p>
          <button
            onClick={() => onNavigate('/jogos')}
            className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 text-gray-950 font-bold rounded-xl text-xs"
          >
            <span>Explorar Catálogo</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}
    </div>
  );
};
