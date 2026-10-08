import React, { useState, useEffect } from 'react';
import { Flame, ArrowLeft } from 'lucide-react';
import { DecixGame } from '../types/game.js';
import { api } from '../services/api.js';
import { GameCard } from '../components/common/GameCard.js';
import { SkeletonCard } from '../components/common/SkeletonCard.js';
import { useSeo } from '../hooks/useSeo.js';

export const PopularPage: React.FC<{ onPlayGame: (g: DecixGame) => void; onNavigate: (p: string) => void }> = ({
  onPlayGame,
  onNavigate
}) => {
  const [games, setGames] = useState<DecixGame[]>([]);
  const [loading, setLoading] = useState(true);

  useSeo({
    title: 'Jogos Mais Populares – DECIX GAMES',
    description: 'Confira os jogos mais acessados e jogados no portal DECIX GAMES.',
    url: window.location.href
  });

  useEffect(() => {
    api.getPopularGames(24).then(setGames).finally(() => setLoading(false));
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      <div className="flex items-center justify-between border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-2.5 rounded-xl bg-amber-950/60 border border-amber-800/80 text-amber-400">
            <Flame className="w-6 h-6" />
          </div>
          <div>
            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">Jogos Mais Populares</h1>
            <p className="text-xs text-slate-400">Os desafios de raciocínio preferidos da nossa comunidade</p>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {games.map((g) => <GameCard key={g.id} game={g} onPlay={onPlayGame} />)}
        </div>
      )}
    </div>
  );
};
