import React, { useState, useEffect } from 'react';
import { Play, Sparkles, Flame, Brain, ArrowRight, Star, History, Compass, LayoutGrid, Zap, BookOpen, Target, ChevronRight } from 'lucide-react';
import { DecixGame, GameCategory, StrategicCategoryConfig } from '../types/game.js';
import { api } from '../services/api.js';
import { GameCard } from '../components/common/GameCard.js';
import { CategoryCard } from '../components/common/CategoryCard.js';
import { SkeletonCard } from '../components/common/SkeletonCard.js';
import { AdBanner } from '../components/ads/AdBanner.js';
import { useHistory } from '../hooks/useHistory.js';
import { useSeo } from '../hooks/useSeo.js';

interface HomePageProps {
  onPlayGame: (game: DecixGame) => void;
  onNavigate: (path: string) => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onPlayGame, onNavigate }) => {
  const [featuredGames, setFeaturedGames] = useState<DecixGame[]>([]);
  const [popularGames, setPopularGames] = useState<DecixGame[]>([]);
  const [newGames, setNewGames] = useState<DecixGame[]>([]);
  const [strategicCategories, setStrategicCategories] = useState<StrategicCategoryConfig[]>([]);
  const [strategicGamesMap, setStrategicGamesMap] = useState<Record<string, DecixGame[]>>({});
  const [allCategories, setAllCategories] = useState<GameCategory[]>([]);
  const [loading, setLoading] = useState(true);

  const { history } = useHistory();

  useSeo({
    title: 'DECIX GAMES – Portal de Jogos de Raciocínio, Lógica e Inteligência',
    description: 'Portal profissional de jogos online HTML5 com foco em raciocínio, lógica, quebra-cabeças, palavras cruzadas e desafios intelectuais sem download.',
    url: window.location.origin
  });

  useEffect(() => {
    async function loadHomeData() {
      try {
        setLoading(true);
        const [feat, pop, nw, stratCats, cats] = await Promise.all([
          api.getFeaturedGames(6),
          api.getPopularGames(8),
          api.getNewGames(8),
          api.getStrategicCategories(),
          api.getCategories()
        ]);

        setFeaturedGames(feat);
        setPopularGames(pop);
        setNewGames(nw);
        setStrategicCategories(stratCats);
        setAllCategories(cats);

        // Carrega vitrines para as 2 primeiras categorias estratégicas
        const stratMap: Record<string, DecixGame[]> = {};
        await Promise.all(
          stratCats.slice(0, 3).map(async (strat: StrategicCategoryConfig) => {
            const res = await api.getGames({ category: strat.slug, limit: 4 });
            stratMap[strat.slug] = res.games;
          })
        );
        setStrategicGamesMap(stratMap);
      } catch (err) {
        console.error('Erro ao carregar homepage:', err);
      } finally {
        setLoading(false);
      }
    }
    loadHomeData();
  }, []);

  const heroGame = featuredGames[0] || popularGames[0];

  return (
    <div className="w-full space-y-12 pb-20">
      {/* Top Banner Ad slot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <AdBanner position="top" />
      </div>

      {/* 1. HERO SECTION (DESTAQUE PRINCIPAL) */}
      {heroGame && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative rounded-3xl overflow-hidden border border-cyan-500/30 bg-gradient-to-r from-gray-950 via-gray-900 to-cyan-950/40 p-6 sm:p-10 lg:p-12 shadow-[0_0_50px_-15px_rgba(6,182,212,0.25)]">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              {/* Hero Copy */}
              <div className="lg:col-span-7 space-y-5 z-10">
                <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-cyan-950/80 border border-cyan-500/40 text-cyan-300 text-xs font-semibold tracking-wide uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-cyan-400" />
                  <span>Destaque da Semana</span>
                </div>

                <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white tracking-tight leading-tight">
                  {heroGame.title}
                </h1>

                <p className="text-slate-300 text-sm sm:text-base leading-relaxed max-w-xl">
                  {heroGame.description}
                </p>

                {/* Hero Metadata */}
                <div className="flex items-center gap-3 text-xs text-slate-400 pt-1">
                  <span className="text-cyan-400 font-semibold">{heroGame.category}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span>{heroGame.publisher}</span>
                  <span aria-hidden="true" className="text-slate-600">·</span>
                  <span className="flex items-center gap-1 text-amber-300 font-mono">
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    {heroGame.rating || '4.9'}
                  </span>
                </div>

                {/* CTA Buttons */}
                <div className="flex flex-wrap items-center gap-4 pt-2">
                  <button
                    onClick={() => onPlayGame(heroGame)}
                    className="inline-flex items-center gap-2 px-6 py-3.5 bg-gradient-to-r from-cyan-400 via-sky-500 to-blue-600 hover:from-cyan-300 hover:to-sky-400 text-gray-950 font-display font-bold text-sm rounded-xl shadow-lg shadow-cyan-500/30 transition-all transform hover:-translate-y-0.5 active:translate-y-0 cursor-pointer"
                  >
                    <Play className="w-4 h-4 fill-current" />
                    <span>JOGAR AGORA</span>
                  </button>

                  <button
                    onClick={() => onNavigate(`/jogos/${heroGame.slug}`)}
                    className="inline-flex items-center gap-1.5 px-5 py-3.5 bg-gray-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 text-sm font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <span>Ver Detalhes</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>

              {/* Hero Image Showcase */}
              <div className="lg:col-span-5 relative">
                <div
                  onClick={() => onPlayGame(heroGame)}
                  className="group relative aspect-[4/3] rounded-2xl overflow-hidden border border-cyan-500/30 shadow-2xl cursor-pointer"
                >
                  <img
                    src={heroGame.bannerUrl || heroGame.thumbnail}
                    alt={heroGame.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-950/80 via-transparent to-transparent opacity-60 group-hover:opacity-40 transition-opacity" />
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-16 h-16 rounded-full bg-cyan-500/90 text-gray-950 flex items-center justify-center shadow-xl group-hover:scale-110 transition-transform">
                      <Play className="w-7 h-7 fill-current ml-1" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* 2. CONTINUE JOGANDO (HISTÓRICO RECENTE) */}
      {history.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <History className="w-5 h-5 text-cyan-400" />
              <h2 className="font-display font-bold text-xl text-white">Continue Jogando</h2>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3 sm:gap-4">
            {history.slice(0, 6).map((item) => (
              <button
                key={item.gameId}
                onClick={() => onNavigate(`/jogos/${item.slug}`)}
                className="group flex flex-col bg-gray-900 rounded-xl border border-slate-800 hover:border-cyan-500/40 p-2.5 text-left transition-all hover:-translate-y-0.5 select-none"
              >
                <div className="aspect-[4/3] rounded-lg overflow-hidden bg-gray-950 mb-2 relative">
                  <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform" />
                  <div className="absolute inset-0 bg-black/30 group-hover:bg-transparent transition-colors flex items-center justify-center">
                    <Play className="w-5 h-5 text-cyan-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                </div>
                <h4 className="font-display font-semibold text-xs text-slate-200 truncate group-hover:text-cyan-300">
                  {item.title}
                </h4>
                <span className="text-[10px] text-slate-500 truncate">{item.category}</span>
              </button>
            ))}
          </div>
        </section>
      )}

      {/* 3. CATEGORIAS ESTRATÉGICAS PARA DIVULGAÇÃO (AQUISIÇÃO) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-cyan-400" />
            <div>
              <h2 className="font-display font-bold text-2xl text-white">Modalidades em Destaque</h2>
              <p className="text-xs text-slate-400">Categorias especialmente selecionadas para treinamento mental</p>
            </div>
          </div>
          <button
            onClick={() => onNavigate('/categorias')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>Todas as Categorias</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {strategicCategories.slice(0, 3).map((strat) => (
            <div
              key={strat.slug}
              onClick={() => onNavigate(`/categoria/${strat.slug}`)}
              className="group relative rounded-2xl p-5 bg-gradient-to-br from-gray-900 to-gray-950 border border-slate-800 hover:border-cyan-500/50 cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-[10px] font-bold tracking-wider uppercase px-2 py-0.5 rounded-full bg-cyan-950 text-cyan-300 border border-cyan-800">
                    {strat.badgeText || 'Especial'}
                  </span>
                  <ChevronRight className="w-4 h-4 text-slate-500 group-hover:text-cyan-300 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-display font-bold text-lg text-white group-hover:text-cyan-300 transition-colors">
                  {strat.categoryName}
                </h3>
                <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                  {strat.tagline}
                </p>
              </div>

              <div className="pt-4 mt-2 border-t border-slate-800/80 flex items-center justify-between text-xs text-cyan-400 font-semibold">
                <span>Jogar Agora</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. SEÇÃO: MAIS JOGADOS (POPULARES) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Flame className="w-5 h-5 text-amber-400" />
            <h2 className="font-display font-bold text-2xl text-white">Mais Jogados</h2>
          </div>
          <button
            onClick={() => onNavigate('/populares')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>Ver mais</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading
            ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : popularGames.slice(0, 4).map((game) => (
                <GameCard key={game.id} game={game} onPlay={onPlayGame} />
              ))}
        </div>
      </section>

      {/* 5. VITRINE DE CATEGORIA ESTRATÉGICA 1 (Raciocínio & Palavras) */}
      {strategicCategories.slice(0, 2).map((strat) => {
        const games = strategicGamesMap[strat.slug] || [];
        if (games.length === 0) return null;

        return (
          <section key={strat.slug} className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-cyan-400" />
                <div>
                  <h2 className="font-display font-bold text-2xl text-white">{strat.campaignTitle}</h2>
                  <p className="text-xs text-slate-400">{strat.description}</p>
                </div>
              </div>
              <button
                onClick={() => onNavigate(`/categoria/${strat.slug}`)}
                className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
              >
                <span>Ver todos de {strat.slug}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {games.map((game) => (
                <GameCard key={game.id} game={game} onPlay={onPlayGame} />
              ))}
            </div>
          </section>
        );
      })}

      {/* 6. SEÇÃO: NOVOS JOGOS (LANÇAMENTOS) */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <Sparkles className="w-5 h-5 text-emerald-400" />
            <h2 className="font-display font-bold text-2xl text-white">Novos Jogos Adicionados</h2>
          </div>
          <button
            onClick={() => onNavigate('/novos')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>Ver novidades</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {loading
            ? Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)
            : newGames.slice(0, 4).map((game) => (
                <GameCard key={game.id} game={game} onPlay={onPlayGame} />
              ))}
        </div>
      </section>

      {/* 7. SEÇÃO: TODAS AS CATEGORIAS DO PORTAL */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="font-display font-bold text-2xl text-white">Catálogo de Categorias</h2>
            <p className="text-xs text-slate-400">Navegue por todas as modalidades disponíveis no portal</p>
          </div>
          <button
            onClick={() => onNavigate('/categorias')}
            className="text-xs font-semibold text-cyan-400 hover:text-cyan-300 flex items-center gap-1 transition-colors"
          >
            <span>Página de Categorias</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-3 gap-3.5">
          {allCategories.slice(0, 9).map((cat) => (
            <CategoryCard
              key={cat.id}
              category={cat}
              onClick={(slug) => onNavigate(`/categoria/${slug}`)}
            />
          ))}
        </div>
      </section>

      {/* Bottom Ad slot */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-4">
        <AdBanner position="bottom" />
      </div>
    </div>
  );
};
