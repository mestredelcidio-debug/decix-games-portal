import React, { useState, useEffect } from 'react';
import { LayoutGrid, Sparkles, ArrowRight, ArrowLeft, Gamepad2, Brain, Cpu, BookOpen, Puzzle, Binary, Compass, Flame, Coffee, Trophy, MapPin, Activity, Users } from 'lucide-react';
import { GameCategory, DecixGame } from '../types/game.js';
import { api } from '../services/api.js';
import { GameCard } from '../components/common/GameCard.js';
import { AdBanner } from '../components/ads/AdBanner.js';
import { useSeo } from '../hooks/useSeo.js';

interface CategoriesHubPageProps {
  onPlayGame: (game: DecixGame) => void;
  onNavigate: (path: string) => void;
}

export const CategoriesHubPage: React.FC<CategoriesHubPageProps> = ({ onPlayGame, onNavigate }) => {
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [categoryPreviews, setCategoryPreviews] = useState<Record<string, DecixGame[]>>({});
  const [loading, setLoading] = useState(true);

  useSeo({
    title: 'Todas as Categorias de Jogos – DECIX GAMES',
    description: 'Navegue por todas as categorias do portal DECIX GAMES: Raciocínio, Lógica, Palavras, Puzzles, Matemática, Tabuleiro, Arcade e muito mais.',
    url: window.location.href
  });

  const getCategoryIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain': return <Brain className="w-5 h-5 text-cyan-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-sky-400" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-blue-400" />;
      case 'Puzzle': return <Puzzle className="w-5 h-5 text-indigo-400" />;
      case 'Binary': return <Binary className="w-5 h-5 text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'LayoutGrid': return <LayoutGrid className="w-5 h-5 text-violet-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-pink-400" />;
      case 'Gamepad2': return <Gamepad2 className="w-5 h-5 text-rose-400" />;
      case 'Flame': return <Flame className="w-5 h-5 text-red-400" />;
      case 'MapPin': return <MapPin className="w-5 h-5 text-amber-500" />;
      case 'Trophy': return <Trophy className="w-5 h-5 text-yellow-400" />;
      case 'Activity': return <Activity className="w-5 h-5 text-lime-400" />;
      case 'Coffee': return <Coffee className="w-5 h-5 text-teal-400" />;
      case 'Users': return <Users className="w-5 h-5 text-cyan-300" />;
      default: return <Gamepad2 className="w-5 h-5 text-cyan-400" />;
    }
  };

  useEffect(() => {
    async function loadHubData() {
      setLoading(true);
      try {
        const cats = await api.getCategories();
        setCategories(cats);

        // Busca preview dos primeiros jogos das categorias principais
        const previews: Record<string, DecixGame[]> = {};
        await Promise.all(
          cats.slice(0, 6).map(async (cat) => {
            const res = await api.getGames({ category: cat.slug, limit: 3 });
            previews[cat.slug] = res.games;
          })
        );
        setCategoryPreviews(previews);
      } catch (err) {
        console.error('Erro ao carregar categorias hub:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHubData();
  }, []);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-10">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <button
            onClick={() => onNavigate('/jogos')}
            className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-cyan-300 transition-colors mb-2"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Voltar aos Jogos</span>
          </button>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Todas as Categorias
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Explore o acervo completo da DECIX GAMES organizado por modalidades e estilos de jogo
          </p>
        </div>
        <span className="text-xs text-slate-400 tabular-nums">
          <strong className="text-cyan-400">{categories.length}</strong> categorias disponíveis
        </span>
      </div>

      {/* Grid de Todas as Categorias (Cards Rápidos) */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3.5">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => onNavigate(`/categoria/${cat.slug}`)}
            className="group flex flex-col p-4 rounded-2xl bg-gray-900/90 border border-slate-800 hover:border-cyan-500/50 hover:bg-gray-850/80 transition-all text-left select-none hover:-translate-y-1 hover:shadow-lg"
          >
            <div className="flex items-center justify-between mb-3">
              <div className="p-2.5 rounded-xl bg-gray-950 border border-slate-800 group-hover:border-cyan-500/40 transition-colors">
                {getCategoryIcon(cat.icon)}
              </div>
              <ArrowRight className="w-4 h-4 text-slate-600 group-hover:text-cyan-400 group-hover:translate-x-0.5 transition-all" />
            </div>

            <h3 className="font-display font-bold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
              {cat.name}
            </h3>
            <p className="text-xs text-slate-400 line-clamp-2 mt-1 leading-relaxed">
              {cat.description}
            </p>
            <span className="text-[11px] text-cyan-400/90 font-mono mt-3 tabular-nums">
              {cat.count !== undefined ? `${cat.count} jogos` : 'Explorar'}
            </span>
          </button>
        ))}
      </div>

      {/* Vitrines por Categoria em Destaque com Jogos */}
      <div className="space-y-10 pt-4 border-t border-slate-850">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-cyan-400" />
            <h2 className="font-display font-bold text-2xl text-white">Exploração por Categoria</h2>
          </div>
        </div>

        {categories.slice(0, 5).map((cat) => {
          const previewList = categoryPreviews[cat.slug] || [];
          if (previewList.length === 0 && !loading) return null;

          return (
            <div key={cat.id} className="bg-gray-900/40 rounded-3xl border border-slate-800/80 p-6 sm:p-8 space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-xl bg-gray-950 border border-slate-800">
                    {getCategoryIcon(cat.icon)}
                  </div>
                  <div>
                    <h3 className="font-display font-bold text-xl text-white">{cat.name}</h3>
                    <p className="text-xs text-slate-400">{cat.description}</p>
                  </div>
                </div>

                <button
                  onClick={() => onNavigate(`/categoria/${cat.slug}`)}
                  className="inline-flex items-center gap-1.5 text-xs font-semibold text-cyan-400 hover:text-cyan-300 transition-colors self-start sm:self-auto"
                >
                  <span>Ver todos ({cat.count || previewList.length})</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
                {previewList.map((game) => (
                  <GameCard key={game.id} game={game} onPlay={onPlayGame} />
                ))}
              </div>
            </div>
          );
        })}
      </div>

      {/* Ad slot */}
      <AdBanner position="bottom" />
    </div>
  );
};
