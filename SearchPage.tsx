import React, { useState, useEffect } from 'react';
import { Search, X, Gamepad2, ArrowUpDown } from 'lucide-react';
import { DecixGame } from '../types/game.js';
import { api } from '../services/api.js';
import { GameCard } from '../components/common/GameCard.js';
import { SkeletonCard } from '../components/common/SkeletonCard.js';
import { analytics } from '../services/analytics.js';
import { useSeo } from '../hooks/useSeo.js';

interface SearchPageProps {
  initialQuery?: string;
  onPlayGame: (game: DecixGame) => void;
  onNavigate: (path: string) => void;
}

export const SearchPage: React.FC<SearchPageProps> = ({ initialQuery = '', onPlayGame, onNavigate }) => {
  const [query, setQuery] = useState(initialQuery);
  const [results, setResults] = useState<DecixGame[]>([]);
  const [loading, setLoading] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  useSeo({
    title: query ? `Pesquisa: "${query}" – DECIX GAMES` : 'Pesquisar Jogos – DECIX GAMES',
    description: 'Pesquise centenas de jogos de lógica, palavras, inteligência e quebra-cabeças no portal DECIX GAMES.',
    url: window.location.href
  });

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      setHasSearched(false);
      return;
    }

    const timer = setTimeout(async () => {
      setLoading(true);
      try {
        const res = await api.searchGames(query.trim(), 1, 32);
        setResults(res.games);
        setHasSearched(true);
        analytics.trackSearch(query.trim(), res.games.length);
      } catch (err) {
        console.error('Erro na busca:', err);
      } finally {
        setLoading(false);
      }
    }, 250);

    return () => clearTimeout(timer);
  }, [query]);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
      {/* Search Header Form */}
      <div className="max-w-2xl mx-auto text-center space-y-4">
        <h1 className="font-display font-extrabold text-3xl sm:text-4xl text-white">
          Pesquisar Jogos
        </h1>
        <p className="text-xs sm:text-sm text-slate-400">
          Encontre jogos por título, categoria, mecânica ou palavras-chave
        </p>

        <div className="relative">
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Digite palavras-cruzadas, sudoku, raciocínio, memória..."
            autoFocus
            className="w-full pl-11 pr-10 py-3.5 bg-gray-900 border border-slate-700/80 rounded-2xl text-slate-100 placeholder-slate-500 focus:outline-none focus:border-cyan-500 text-sm shadow-xl"
          />
          <Search className="w-5 h-5 text-slate-400 absolute left-4 top-1/2 -translate-y-1/2 pointer-events-none" />
          {query && (
            <button
              onClick={() => setQuery('')}
              className="p-1 rounded-full text-slate-400 hover:text-white absolute right-3.5 top-1/2 -translate-y-1/2"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>

        {/* Quick Suggestion Pills */}
        <div className="flex flex-wrap items-center justify-center gap-1.5 pt-1 text-xs text-slate-400">
          <span className="text-[11px] text-slate-500">Sugestões:</span>
          {['Palavras', 'Sudoku', 'Xadrez', '2048', 'Memória', 'Tangram'].map((tag) => (
            <button
              key={tag}
              onClick={() => setQuery(tag)}
              className="px-2.5 py-1 rounded-lg bg-gray-900 border border-slate-800 hover:border-cyan-500/40 text-slate-300 hover:text-cyan-300 transition-colors"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>

      {/* Results Section */}
      <div className="space-y-4">
        {hasSearched && (
          <div className="text-xs text-slate-400 border-b border-slate-850 pb-2">
            Resultados para <strong className="text-cyan-400">"{query}"</strong>: {results.length} jogos encontrados
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {Array(4).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : results.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {results.map((game) => (
              <GameCard key={game.id} game={game} onPlay={onPlayGame} />
            ))}
          </div>
        ) : hasSearched ? (
          <div className="text-center py-16 bg-gray-900/50 rounded-2xl border border-slate-800 p-8 max-w-lg mx-auto">
            <Gamepad2 className="w-12 h-12 text-slate-600 mx-auto mb-3" />
            <h3 className="font-display font-bold text-lg text-slate-200">
              Nenhum resultado para "{query}"
            </h3>
            <p className="text-xs text-slate-500 mt-1">
              Verifique a ortografia ou tente buscar por termos mais genéricos como "lógica" ou "puzzle".
            </p>
            <button
              onClick={() => setQuery('')}
              className="mt-4 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl text-xs font-semibold"
            >
              Limpar Pesquisa
            </button>
          </div>
        ) : (
          <div className="text-center py-12 text-slate-500 text-xs">
            Digite acima para iniciar sua pesquisa no acervo da DECIX GAMES.
          </div>
        )}
      </div>
    </div>
  );
};
