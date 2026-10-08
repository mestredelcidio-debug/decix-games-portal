import React, { useState, useEffect } from 'react';
import { Filter, Search, ArrowUpDown, ChevronLeft, ChevronRight, SlidersHorizontal, Gamepad2 } from 'lucide-react';
import { DecixGame, GameCategory } from '../types/game.js';
import { api } from '../services/api.js';
import { GameCard } from '../components/common/GameCard.js';
import { SkeletonCard } from '../components/common/SkeletonCard.js';
import { AdBanner } from '../components/ads/AdBanner.js';
import { useSeo } from '../hooks/useSeo.js';

interface CatalogPageProps {
  onPlayGame: (game: DecixGame) => void;
  onNavigate: (path: string) => void;
  initialCategory?: string;
}

export const CatalogPage: React.FC<CatalogPageProps> = ({ onPlayGame, onNavigate, initialCategory }) => {
  const [games, setGames] = useState<DecixGame[]>([]);
  const [categories, setCategories] = useState<GameCategory[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>(initialCategory || 'todas');
  const [selectedProvider, setSelectedProvider] = useState<string>('todos');
  const [sortBy, setSortBy] = useState<'popular' | 'new' | 'az' | 'rating'>('popular');
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [totalGames, setTotalGames] = useState(0);
  const [loading, setLoading] = useState(true);

  useSeo({
    title: 'Catálogo de Jogos HTML5 – DECIX GAMES',
    description: 'Explore todos os jogos de inteligência, lógica, palavras cruzadas, matemática e quebra-cabeças da DECIX GAMES.',
    url: window.location.href
  });

  // Carrega categorias uma vez
  useEffect(() => {
    api.getCategories().then(setCategories).catch(console.error);
  }, []);

  // Carrega jogos ao alterar filtros
  useEffect(() => {
    async function loadGames() {
      setLoading(true);
      try {
        const res = await api.getGames({
          page,
          limit: 16,
          category: selectedCategory !== 'todas' ? selectedCategory : undefined,
          provider: selectedProvider !== 'todos' ? selectedProvider : undefined,
          sortBy,
          search: searchTerm.trim() || undefined
        });

        setGames(res.games);
        setTotalPages(res.totalPages);
        setTotalGames(res.total);
      } catch (err) {
        console.error('Erro ao carregar jogos:', err);
      } finally {
        setLoading(false);
      }
    }
    loadGames();
  }, [page, selectedCategory, selectedProvider, sortBy, searchTerm]);

  const handleCategoryChange = (slug: string) => {
    setSelectedCategory(slug);
    setPage(1);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Page Header */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
            Catálogo de Jogos
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Desafie seu intelecto com centenas de jogos selecionados e sem downloads
          </p>
        </div>
        <div className="text-xs text-slate-400 tabular-nums">
          Mostrando <strong className="text-cyan-400">{games.length}</strong> de <strong className="text-slate-200">{totalGames}</strong> jogos
        </div>
      </div>

      {/* Filter and Control Bar */}
      <div className="bg-gray-900/80 border border-slate-800 rounded-2xl p-4 space-y-4">
        {/* Top Controls: Search + Sort + Provider */}
        <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
          {/* Search Input */}
          <div className="sm:col-span-5 relative">
            <input
              type="text"
              placeholder="Filtrar por nome ou tag..."
              value={searchTerm}
              onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-xs bg-gray-950 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
            />
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          </div>

          {/* Sort By Dropdown */}
          <div className="sm:col-span-4 flex items-center gap-2">
            <ArrowUpDown className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={sortBy}
              onChange={(e) => { setSortBy(e.target.value as 'popular' | 'new' | 'az' | 'rating'); setPage(1); }}
              className="w-full py-2 px-3 text-xs bg-gray-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="popular">Mais Populares</option>
              <option value="new">Mais Recentes</option>
              <option value="rating">Melhor Avaliados</option>
              <option value="az">Ordem Alfabética (A-Z)</option>
            </select>
          </div>

          {/* Provider Filter */}
          <div className="sm:col-span-3 flex items-center gap-2">
            <Gamepad2 className="w-4 h-4 text-slate-500 shrink-0" />
            <select
              value={selectedProvider}
              onChange={(e) => { setSelectedProvider(e.target.value); setPage(1); }}
              className="w-full py-2 px-3 text-xs bg-gray-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-cyan-500"
            >
              <option value="todos">Todos os Provedores</option>
              <option value="DECIX">Originais DECIX</option>
              <option value="GAMEPIX">GamePix API</option>
              <option value="PARTNER">Parceiros Globais</option>
            </select>
          </div>
        </div>

        {/* Category Filter Pills (Functional Buttons) */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-1 pt-1 no-scrollbar">
          <button
            onClick={() => handleCategoryChange('todas')}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
              selectedCategory === 'todas'
                ? 'bg-cyan-500 text-gray-950 font-bold'
                : 'bg-gray-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-850'
            }`}
          >
            Todas as Categorias
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => handleCategoryChange(cat.slug)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat.slug
                  ? 'bg-cyan-500 text-gray-950 font-bold'
                  : 'bg-gray-950 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-850'
              }`}
            >
              {cat.name} {cat.count !== undefined ? `(${cat.count})` : ''}
            </button>
          ))}
        </div>
      </div>

      {/* Games Grid */}
      {loading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {Array(8).fill(0).map((_, i) => <SkeletonCard key={i} />)}
        </div>
      ) : games.length > 0 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          {games.map((game) => (
            <GameCard key={game.id} game={game} onPlay={onPlayGame} />
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-slate-800/80 p-8">
          <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
          <h3 className="font-display font-bold text-lg text-slate-200">Nenhum jogo encontrado</h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
            Tente ajustar os filtros de categoria ou remover os termos da pesquisa.
          </p>
          <button
            onClick={() => { setSelectedCategory('todas'); setSelectedProvider('todos'); setSearchTerm(''); }}
            className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
          >
            Limpar Filtros
          </button>
        </div>
      )}

      {/* Pagination Controls */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-3 pt-6 border-t border-slate-850">
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

      {/* Ad slot */}
      <AdBanner position="bottom" />
    </div>
  );
};
