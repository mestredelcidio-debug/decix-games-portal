import React, { useState } from 'react';
import { Play, Heart, Star, Sparkles, Gamepad2 } from 'lucide-react';
import { DecixGame } from '../../types/game.js';
import { useFavorites } from '../../hooks/useFavorites.js';

interface GameCardProps {
  game: DecixGame;
  onPlay: (game: DecixGame) => void;
  priority?: boolean;
}

export const GameCard: React.FC<GameCardProps> = ({ game, onPlay }) => {
  const [imageError, setImageError] = useState(false);
  const { isFavorite, toggleFavorite } = useFavorites();
  const fav = isFavorite(game.id);

  const handleFavClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    toggleFavorite(game.id);
  };

  return (
    <div
      onClick={() => onPlay(game)}
      className="group relative flex flex-col bg-gray-900/90 rounded-2xl border border-slate-800/80 hover:border-cyan-500/50 overflow-hidden cursor-pointer transition-all duration-200 hover:-translate-y-1 hover:shadow-[0_10px_25px_-5px_rgba(6,182,212,0.25)] select-none"
    >
      {/* Thumbnail Aspect Box */}
      <div className="relative aspect-[4/3] w-full overflow-hidden bg-gray-950">
        {!imageError ? (
          <img
            src={game.thumbnail}
            alt={game.title}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageError(true)}
            className="w-full h-full object-cover object-center transition-transform duration-300 group-hover:scale-105"
          />
        ) : (
          /* Styled Fallback Container (Zero-Broken-Image Policy) */
          <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gradient-to-br from-gray-900 to-cyan-950/40 text-cyan-400">
            <Gamepad2 className="w-10 h-10 mb-2 opacity-80" />
            <span className="text-xs font-semibold text-center text-slate-300 line-clamp-1">{game.title}</span>
          </div>
        )}

        {/* Subtle Gradient Scrim at Bottom */}
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950/90 via-transparent to-transparent opacity-80 group-hover:opacity-60 transition-opacity" />

        {/* Indicators on top corners */}
        <div className="absolute top-2.5 left-2.5 right-2.5 flex items-center justify-between pointer-events-none">
          <div className="flex items-center gap-1.5">
            {game.isNew && (
              <span className="text-[11px] font-bold text-cyan-300 bg-gray-950/90 px-2 py-0.5 rounded-md border border-cyan-500/40 tracking-wide uppercase">
                Novo
              </span>
            )}
            {game.provider === 'DECIX' && (
              <span className="text-[10px] font-bold text-sky-300 bg-gray-950/90 px-1.5 py-0.5 rounded-md border border-sky-500/30 tracking-wide uppercase">
                Original
              </span>
            )}
          </div>

          {/* Favorite Toggle Button */}
          <button
            onClick={handleFavClick}
            className="pointer-events-auto p-1.5 rounded-full bg-gray-950/70 hover:bg-gray-900 text-slate-300 hover:text-rose-400 backdrop-blur-sm transition-colors"
            title={fav ? 'Remover dos favoritos' : 'Adicionar aos favoritos'}
            aria-label="Favoritar jogo"
          >
            <Heart className={`w-4 h-4 transition-transform active:scale-125 ${fav ? 'text-rose-500 fill-rose-500' : ''}`} />
          </button>
        </div>

        {/* Desktop Hover Overlay with "JOGAR" Button */}
        <div className="absolute inset-0 bg-gray-950/40 backdrop-blur-[2px] opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
          <span className="inline-flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-cyan-500 to-sky-600 text-gray-950 font-bold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-cyan-500/30 transform scale-95 group-hover:scale-100 transition-transform">
            <Play className="w-3.5 h-3.5 fill-current" />
            Jogar Agora
          </span>
        </div>
      </div>

      {/* Info Container */}
      <div className="p-3.5 flex flex-col justify-between flex-1">
        <div>
          <h3 className="font-display font-bold text-sm text-slate-100 line-clamp-1 group-hover:text-cyan-300 transition-colors">
            {game.title}
          </h3>

          {/* Unboxed Metadata (Zero-Pill Discipline) */}
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-1">
            <span className="text-cyan-400/90 font-medium">{game.category}</span>
            <span aria-hidden="true" className="text-slate-600">·</span>
            {game.rating && (
              <span className="flex items-center gap-0.5 text-amber-300/90 font-mono text-[11px]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                {game.rating}
              </span>
            )}
            {game.popularity >= 90 && (
              <>
                <span aria-hidden="true" className="text-slate-600">·</span>
                <span className="text-slate-400 text-[11px]">Alta demanda</span>
              </>
            )}
          </div>
        </div>

        {/* Short description on larger cards */}
        <p className="text-xs text-slate-400/90 line-clamp-2 mt-2 leading-relaxed">
          {game.description}
        </p>
      </div>
    </div>
  );
};
