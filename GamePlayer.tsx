import React, { useState, useEffect, useRef } from 'react';
import { Maximize2, Minimize2, RotateCcw, AlertTriangle, Share2, Heart, Shield, Volume2, VolumeX, Sparkles, Gamepad2 } from 'lucide-react';
import { DecixGame } from '../../types/game.js';
import { DecixLogo } from '../common/DecixLogo.js';
import { useFavorites } from '../../hooks/useFavorites.js';
import { useHistory } from '../../hooks/useHistory.js';
import { analytics } from '../../services/analytics.js';
import { api } from '../../services/api.js';
import { CrosswordGame } from './builtins/CrosswordGame.js';
import { SudokuGame } from './builtins/SudokuGame.js';
import { MemoryNeuralGame } from './builtins/MemoryNeuralGame.js';
import { Logic2048Game } from './builtins/Logic2048Game.js';
import { AdGame } from '../ads/AdGame.js';

interface GamePlayerProps {
  game: DecixGame;
  onBackToCatalog?: () => void;
}

export const GamePlayer: React.FC<GamePlayerProps> = ({ game, onBackToCatalog }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [isMuted, setIsMuted] = useState(false);
  const [showShareNotification, setShowShareNotification] = useState(false);

  const containerRef = useRef<HTMLDivElement>(null);
  const { isFavorite, toggleFavorite } = useFavorites();
  const { recordPlay } = useHistory();
  const fav = isFavorite(game.id);

  // Efeito ao carregar jogo
  useEffect(() => {
    setIsLoading(true);
    setHasError(false);
    recordPlay(game);
    api.recordPlay(game.id);
    analytics.trackGameStart(game.id, game.title, game.category, game.provider);

    // Timeout de carregamento para iframe
    if (game.embedType === 'iframe') {
      const timeout = setTimeout(() => {
        setIsLoading(false);
      }, 1400);
      return () => clearTimeout(timeout);
    } else {
      // Jogos internos carregam imediatamente
      const timeout = setTimeout(() => setIsLoading(false), 400);
      return () => clearTimeout(timeout);
    }
  }, [game.id]);

  // Listener de tela cheia
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(Boolean(document.fullscreenElement));
    };
    document.addEventListener('fullscreenchange', handleFullscreenChange);
    return () => document.removeEventListener('fullscreenchange', handleFullscreenChange);
  }, []);

  const toggleFullscreen = async () => {
    if (!containerRef.current) return;
    try {
      if (!document.fullscreenElement) {
        await containerRef.current.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fallback
    }
  };

  const handleShare = async () => {
    const shareData = {
      title: `${game.title} – DECIX GAMES`,
      text: `Jogue ${game.title} no portal DECIX GAMES!`,
      url: window.location.href
    };

    if (navigator.share) {
      try {
        await navigator.share(shareData);
      } catch {
        // noop
      }
    } else {
      navigator.clipboard.writeText(window.location.href);
      setShowShareNotification(true);
      setTimeout(() => setShowShareNotification(false), 2500);
    }
  };

  const handleReload = () => {
    setIsLoading(true);
    setHasError(false);
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <div className="w-full flex flex-col items-center">
      {/* Player Frame Container */}
      <div
        ref={containerRef}
        className={`relative w-full rounded-2xl overflow-hidden bg-black border border-slate-800 shadow-2xl transition-all ${
          isFullscreen ? 'h-screen w-screen rounded-none border-0' : 'aspect-video max-h-[720px] min-h-[380px] sm:min-h-[460px]'
        }`}
      >
        {/* Loading Overlay */}
        {isLoading && (
          <div className="absolute inset-0 z-30 bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
            <DecixLogo size="xl" className="animate-pulse mb-6" />
            <div className="w-48 h-1.5 bg-gray-900 rounded-full overflow-hidden mb-3 border border-slate-800">
              <div className="w-full h-full bg-gradient-to-r from-sky-500 via-cyan-400 to-sky-300 animate-[pulse_1.2s_ease-in-out_infinite]" />
            </div>
            <p className="text-xs text-cyan-300 font-medium">Carregando {game.title}...</p>
            <span className="text-[11px] text-slate-500 mt-1">Ambiente seguro DECIX GAMES</span>
          </div>
        )}

        {/* Error Overlay */}
        {hasError && (
          <div className="absolute inset-0 z-30 bg-gray-950 flex flex-col items-center justify-center p-6 text-center">
            <AlertTriangle className="w-12 h-12 text-amber-400 mb-3" />
            <h3 className="font-display font-bold text-lg text-slate-100">
              Não foi possível carregar este jogo.
            </h3>
            <p className="text-xs text-slate-400 mt-1 max-w-sm">
              O provedor de conexão do jogo pode estar temporariamente indisponível.
            </p>
            <button
              onClick={handleReload}
              className="mt-5 inline-flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 font-bold text-gray-950 text-xs rounded-xl shadow-lg"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Tentar Novamente</span>
            </button>
          </div>
        )}

        {/* Game Render Logic based on EmbedType */}
        <div className="w-full h-full flex items-center justify-center bg-gray-950">
          {game.embedType === 'internal' ? (
            <div className="w-full h-full overflow-y-auto flex items-center justify-center p-2">
              {game.gameUrl === 'builtin:crossword' && <CrosswordGame />}
              {game.gameUrl === 'builtin:sudoku' && <SudokuGame />}
              {game.gameUrl === 'builtin:memory' && <MemoryNeuralGame />}
              {game.gameUrl === 'builtin:2048' && <Logic2048Game />}
            </div>
          ) : (
            <iframe
              src={game.gameUrl}
              title={game.title}
              className="w-full h-full border-0"
              allow="autoplay; fullscreen; accelerometer; gyroscope; screen-wake-lock"
              sandbox="allow-scripts allow-same-origin allow-popups allow-forms"
              onLoad={() => setIsLoading(false)}
              onError={() => {
                setIsLoading(false);
                setHasError(true);
              }}
            />
          )}
        </div>

        {/* Floating Game Controls HUD Bar (bottom on player) */}
        <div className="absolute bottom-0 inset-x-0 bg-gradient-to-t from-gray-950/95 via-gray-950/70 to-transparent p-3 sm:p-4 flex items-center justify-between pointer-events-auto opacity-90 hover:opacity-100 transition-opacity">
          <div className="flex items-center gap-2">
            <span className="font-display font-semibold text-xs text-slate-200 hidden sm:inline">
              {game.title}
            </span>
            <span className="text-[10px] text-cyan-400 font-mono uppercase bg-cyan-950/70 border border-cyan-800/80 px-2 py-0.5 rounded">
              {game.provider}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Share */}
            <button
              onClick={handleShare}
              className="p-2 rounded-lg bg-gray-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors"
              title="Compartilhar"
              aria-label="Compartilhar jogo"
            >
              <Share2 className="w-4 h-4" />
            </button>

            {/* Favorite */}
            <button
              onClick={() => toggleFavorite(game.id)}
              className={`p-2 rounded-lg bg-gray-900/80 hover:bg-slate-800 border border-slate-800 transition-colors ${
                fav ? 'text-rose-500 fill-rose-500' : 'text-slate-300 hover:text-rose-400'
              }`}
              title={fav ? 'Remover dos favoritos' : 'Favoritar'}
              aria-label="Favoritar"
            >
              <Heart className={`w-4 h-4 ${fav ? 'fill-current' : ''}`} />
            </button>

            {/* Reload */}
            <button
              onClick={handleReload}
              className="p-2 rounded-lg bg-gray-900/80 hover:bg-slate-800 text-slate-300 hover:text-cyan-300 border border-slate-800 transition-colors"
              title="Recarregar"
              aria-label="Recarregar jogo"
            >
              <RotateCcw className="w-4 h-4" />
            </button>

            {/* Fullscreen */}
            <button
              onClick={toggleFullscreen}
              className="p-2 rounded-lg bg-gradient-to-r from-cyan-500 to-sky-600 text-gray-950 font-bold hover:brightness-110 shadow-sm transition-all"
              title={isFullscreen ? 'Sair da tela cheia' : 'Tela cheia'}
              aria-label="Tela cheia"
            >
              {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
          </div>
        </div>

        {/* Share Feedback Toast */}
        {showShareNotification && (
          <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-cyan-900/90 text-cyan-200 border border-cyan-500/50 px-4 py-2 rounded-xl text-xs font-semibold shadow-xl backdrop-blur-md animate-fade-in">
            Link copiado para a área de transferência!
          </div>
        )}
      </div>

      {/* Publicidade integrada do jogo */}
      <AdGame gameId={game.id} />
    </div>
  );
};
