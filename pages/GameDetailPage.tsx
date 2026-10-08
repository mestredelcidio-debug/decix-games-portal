import React, { useState, useEffect } from 'react';
import { ArrowLeft, Star, Calendar, ShieldCheck, HelpCircle, Gamepad2, Share2, Heart, Sparkles, Tag } from 'lucide-react';
import { DecixGame } from '../types/game.js';
import { api } from '../services/api.js';
import { GamePlayer } from '../components/player/GamePlayer.js';
import { GameCard } from '../components/common/GameCard.js';
import { AdBanner } from '../components/ads/AdBanner.js';
import { useSeo } from '../hooks/useSeo.js';

interface GameDetailPageProps {
  slug: string;
  onPlayGame: (game: DecixGame) => void;
  onNavigate: (path: string) => void;
}

export const GameDetailPage: React.FC<GameDetailPageProps> = ({ slug, onPlayGame, onNavigate }) => {
  const [game, setGame] = useState<DecixGame | null>(null);
  const [relatedGames, setRelatedGames] = useState<DecixGame[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function loadGameDetails() {
      setLoading(true);
      try {
        const res = await api.getGameBySlug(slug);
        if (res) {
          setGame(res.game);
          setRelatedGames(res.related);
        } else {
          setGame(null);
        }
      } catch (err) {
        console.error('Erro ao buscar detalhes do jogo:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGameDetails();
  }, [slug]);

  // SEO Dinâmico e Schema.org JSON-LD para o jogo
  useSeo({
    title: game ? `${game.title} – Jogar Grátis Online` : 'Jogo – DECIX GAMES',
    description: game ? game.description : 'Jogue agora na DECIX GAMES',
    image: game?.bannerUrl || game?.thumbnail,
    schema: game ? {
      "@context": "https://schema.org",
      "@type": "Game",
      "name": game.title,
      "description": game.description,
      "genre": game.category,
      "author": { "@type": "Organization", "name": game.publisher },
      "operatingSystem": "All",
      "offers": { "@type": "Offer", "price": "0", "priceCurrency": "BRL" }
    } : undefined
  });

  if (loading) {
    return (
      <div className="max-w-7xl mx-auto px-4 py-16 flex flex-col items-center justify-center min-h-[50vh]">
        <div className="w-12 h-12 border-4 border-cyan-500/20 border-t-cyan-400 rounded-full animate-spin mb-4" />
        <p className="text-sm text-slate-400">Carregando jogo...</p>
      </div>
    );
  }

  if (!game) {
    return (
      <div className="max-w-2xl mx-auto px-4 py-20 text-center">
        <Gamepad2 className="w-16 h-16 text-slate-600 mx-auto mb-4" />
        <h2 className="font-display font-bold text-2xl text-white">Ops! Esse jogo parece ter desaparecido.</h2>
        <p className="text-xs text-slate-400 mt-2">
          Não localizamos o jogo solicitado em nosso catálogo ativo.
        </p>
        <button
          onClick={() => onNavigate('/jogos')}
          className="mt-6 px-6 py-3 bg-gradient-to-r from-cyan-500 to-sky-600 text-gray-950 font-bold rounded-xl text-sm"
        >
          Voltar para os jogos
        </button>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8">
      {/* Breadcrumb & Back */}
      <div className="flex items-center justify-between text-xs text-slate-400">
        <button
          onClick={() => onNavigate('/jogos')}
          className="flex items-center gap-1.5 hover:text-cyan-300 transition-colors font-medium"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Voltar ao Catálogo</span>
        </button>

        <div className="flex items-center gap-2">
          <span className="hover:text-slate-200 cursor-pointer" onClick={() => onNavigate('/')}>Início</span>
          <span>/</span>
          <span className="hover:text-slate-200 cursor-pointer" onClick={() => onNavigate(`/categoria/${game.categorySlug}`)}>{game.category}</span>
          <span>/</span>
          <span className="text-cyan-400 truncate max-w-[140px] sm:max-w-none">{game.title}</span>
        </div>
      </div>

      {/* GAME PLAYER COMPONENT */}
      <section className="w-full">
        <GamePlayer game={game} onBackToCatalog={() => onNavigate('/jogos')} />
      </section>

      {/* GAME INFO & INSTRUCTIONS */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Col: Details & Description */}
        <div className="lg:col-span-8 bg-gray-900/70 border border-slate-800 rounded-2xl p-6 sm:p-8 space-y-6">
          <div className="border-b border-slate-800 pb-5">
            <div className="flex flex-wrap items-center gap-2 text-xs text-slate-400 mb-2">
              <span className="text-cyan-400 font-bold uppercase tracking-wider">{game.category}</span>
              <span>·</span>
              <span className="font-medium text-slate-300">Publicado por {game.publisher}</span>
              <span>·</span>
              <span className="flex items-center gap-1 text-amber-300 font-mono">
                <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                {game.rating || '4.8'}
              </span>
            </div>

            <h1 className="font-display font-extrabold text-2xl sm:text-3xl text-white">
              {game.title}
            </h1>
          </div>

          {/* Description */}
          <div className="space-y-3">
            <h3 className="font-display font-semibold text-slate-200 text-sm uppercase tracking-wider">
              Sobre o Jogo
            </h3>
            <p className="text-slate-300 text-sm leading-relaxed">
              {game.description}
            </p>
          </div>

          {/* Instructions & Controls */}
          {(game.instructions || game.controls) && (
            <div className="space-y-3 pt-3 border-t border-slate-800/80">
              <h3 className="font-display font-semibold text-slate-200 text-sm uppercase tracking-wider flex items-center gap-1.5">
                <HelpCircle className="w-4 h-4 text-cyan-400" />
                <span>Como Jogar</span>
              </h3>
              {game.instructions && (
                <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
                  {game.instructions}
                </p>
              )}
              {game.controls && game.controls.length > 0 && (
                <div className="mt-2 space-y-1">
                  <span className="text-xs font-semibold text-slate-400">Controles:</span>
                  <ul className="list-disc list-inside text-xs text-slate-300 space-y-1">
                    {game.controls.map((ctrl, i) => (
                      <li key={i}>{ctrl}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          )}

          {/* Tags */}
          {game.tags && game.tags.length > 0 && (
            <div className="pt-3 border-t border-slate-800/80 flex flex-wrap items-center gap-2">
              <Tag className="w-3.5 h-3.5 text-slate-500" />
              <span className="text-xs text-slate-500">Palavras-chave:</span>
              <div className="flex flex-wrap gap-1.5">
                {game.tags.map((t) => (
                  <button
                    key={t}
                    onClick={() => onNavigate(`/pesquisa?q=${encodeURIComponent(t)}`)}
                    className="text-xs text-slate-400 hover:text-cyan-300 bg-gray-950 px-2 py-0.5 rounded border border-slate-800 hover:border-cyan-500/30 transition-colors"
                  >
                    #{t}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Col: Technical Specs & Ad Slot */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-gray-900/70 border border-slate-800 rounded-2xl p-5 space-y-4 text-xs">
            <h4 className="font-display font-semibold text-slate-200 text-xs uppercase tracking-wider border-b border-slate-800 pb-2">
              Ficha Técnica
            </h4>

            <div className="space-y-2.5 text-slate-300">
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Provedor:</span>
                <span className="font-semibold text-cyan-400">{game.provider}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Modo de Execução:</span>
                <span className="font-mono text-slate-300">{game.embedType === 'internal' ? 'HTML5 Nativo' : 'HTML5 Sandbox'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Orientação Recomendada:</span>
                <span className="capitalize">{game.orientation === 'landscape' ? 'Horizontal' : game.orientation === 'portrait' ? 'Vertical' : 'Qualquer'}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Data de Adição:</span>
                <span className="font-mono">{game.releaseDate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-slate-500">Partidas Registradas:</span>
                <span className="font-mono tabular-nums text-slate-200">{game.playCount || 1000}+</span>
              </div>
            </div>
          </div>

          {/* Ad slot in sidebar */}
          <AdBanner position="sidebar" />
        </div>
      </div>

      {/* RELATED GAMES */}
      {relatedGames.length > 0 && (
        <section className="pt-6 border-t border-slate-850">
          <div className="flex items-center justify-between mb-5">
            <div className="flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-cyan-400" />
              <h2 className="font-display font-bold text-2xl text-white">Jogos Relacionados</h2>
            </div>
            <button
              onClick={() => onNavigate(`/categoria/${game.categorySlug}`)}
              className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Ver mais de {game.category}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
            {relatedGames.slice(0, 3).map((rel) => (
              <GameCard key={rel.id} game={rel} onPlay={onPlayGame} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
};
