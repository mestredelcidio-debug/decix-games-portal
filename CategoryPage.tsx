import React, { useState, useEffect } from 'react';
import { ArrowLeft, Search, ArrowUpDown, Flame, Sparkles, Gamepad2, ChevronLeft, ChevronRight } from 'lucide-react';
import { DecixGame, GameCategory } from '../types/game.js';
import { api } from '../services/api.js';
import { GameCard } from '../components/common/GameCard.js';
import { SkeletonCard } from '../components/common/SkeletonCard.js';
import { AdBanner } from '../components/ads/AdBanner.js';
import { useSeo } from '../hooks/useSeo.js';

interface CategoryPageProps {
  categorySlug: string;
  onPlayGame: (game: DecixGame) => void;
  onNavigate: (path: string) => void;
}

export const CategoryPage: React.FC<CategoryPageProps> = ({ categorySlug, onPlayGame, onNavigate }) => {
  const [games, setGames] = useState<DecixGame[]>([]);
  const [category, setCategory] = useState<GameCategory | null>(null);
  const [popularInCategory, setPopularInCategory] = useState<DecixGame[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<'popular' | 'new' | 'az' | 'rating'>('popular');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const [loading, setLoading] = useState(true);

  // Carrega metadados e jogos da categoria
  useEffect(() => {
    async function loadCategoryGames() {
      setLoading(true);
      try {
        const [cats, gamesRes] = await Promise.all([
          api.getCategories(),
          api.getGames({
            category: categorySlug,
            page,
            limit: 16,
            sortBy,
            search: searchTerm.trim() || undefined
          })
        ]);

        const current = cats.find((c) => c.slug === categorySlug);
        setCategory(current || null);
        setGames(gamesRes.games);
        setTotalPages(gamesRes.totalPages);
        setTotalGames(gamesRes.total);

        // Populares na categoria (apenas na 1ª página para destaque)
        if (page === 1 && !searchTerm) {
          const sortedPop = [...gamesRes.games].sort((a, b) => b.popularity - a.popularity).slice(0, 3);
          setPopularInCategory(sortedPop);
        }
      } catch (err) {
        console.error('Erro ao buscar jogos da categoria:', err);
      } finally {
        setLoading(false);
      }
    }
    loadCategoryGames();
  }, [categorySlug, page, sortBy, searchTerm]);

  const catName = category?.name || categorySlug.charAt(0).toUpperCase() + categorySlug.slice(1);

  useSeo({
    title: `Jogos de ${catName} Grátis – DECIX GAMES`,
    description: category?.description || `Explore e jogue online os melhores jogos de ${catName} no portal DECIX GAMES sem download.`,
    url: window.location.href
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Category Header Banner */}
      <div className="relative rounded-3xl overflow-hidden border border-slate-800 bg-gradient-to-r from-gray-950 via-gray-900 to-cyan-950/40 p-6 sm:p-10 shadow-xl">
        <div className="flex items-center gap-2 text-xs text-slate-400 mb-3">
          <button
            onClick={() => onNavigate('/categorias')}
            className="flex items-center gap-1 hover:text-cyan-300 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Todas as Categorias</span>
          </button>
          <span>/</span>
          <span className="text-cyan-400 font-semibold">{catName}</span>
        </div>

        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <h1 className="font-display font-extrabold text-3xl sm:text-4xl lg:text-5xl text-white">
              Jogos de {catName}
            </h1>
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed">
              {category?.description || 'Desafie suas habilidades e exercite seu raciocínio com os melhores jogos desta categoria.'}
            </p>
          </div>

          <div className="bg-gray-950/80 px-5 py-3 rounded-2xl border border-slate-800 text-center shrink-0 self-start md:self-auto">
            <span className="text-[10px] text-slate-500 uppercase tracking-wider block font-semibold">Total no Catálogo</span>
            <span className="font-display font-extrabold text-2xl text-cyan-400 font-mono tabular-nums">{totalGames}</span>
          </div>
        </div>
      </div>

      {/* Internal Filter and Search Bar for Category */}
      <div className="bg-gray-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row items-center justify-between gap-3">
        {/* Search within category */}
        <div className="w-full sm:w-72 relative">
          <input
            type="text"
            placeholder={`Pesquisar em ${catName}...`}
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-9 pr-3 py-2 text-xs bg-gray-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
          />
          <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>

        {/* Sort selector */}
        <div className="w-full sm:w-auto flex items-center gap-2">
          <ArrowUpDown className="w-4 h-4 text-slate-500 shrink-0" />
          <select
            value={sortBy}
            onChange={(e) => { setSortBy(e.target.value as 'popular' | 'new' | 'az' | 'rating'); setPage(1); }}
            className="w-full sm:w-auto py-2 px-3 text-xs bg-gray-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
          >
            <option value="popular">Mais Populares</option>
            <option value="new">Lançamentos Recentes</option>
            <option value="rating">Melhor Avaliados</option>
            <option value="az">Ordem Alfabética (A-Z)</option>
          </select>
        </div>
      </div>

      {/* Games Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : games.length > 0 ? (
        <div className="space-y-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {games.map((game) => (
              <GameCard key={game.id} game={game} onPlay={onPlayGame} />
            ))}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-center gap-3 pt-4 border-t border-slate-850">
              <button
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1}
                className="p-2 rounded-xl bg-gray-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="text-xs font-medium text-slate-400 tabular-nums">
                Página <strong className="text-slate-100">{page}</strong> de <strong className="text-slate-100">{totalPages}</strong>
              </span>

              <button
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page >= totalPages}
                className="p-2 rounded-xl bg-gray-900 border border-slate-800 text-slate-300 disabled:opacity-30 disabled:cursor-not-allowed hover:bg-slate-800"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-slate-800 p-8">
          <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-slate-200">
            Nenhum jogo encontrado {searchTerm ? `para "${searchTerm}"` : 'nesta categoria'}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tente buscar com outro termo ou explore outras categorias da plataforma.
          </p>
          <button
            onClick={() => { setSearchTerm(''); setSortBy('popular'); }}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Ad slot */}
      <AdBanner position="bottom" />
    </div>
  );
};
