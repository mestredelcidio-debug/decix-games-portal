import React from 'react';
import { GameCategory } from '../../types/game.js';
import { Brain, Cpu, BookOpen, Puzzle, Binary, Sparkles, LayoutGrid, Compass, Coffee, Gamepad2 } from 'lucide-react';

interface CategoryCardProps {
  category: GameCategory;
  onClick: (slug: string) => void;
  selected?: boolean;
}

export const CategoryCard: React.FC<CategoryCardProps> = ({ category, onClick, selected }) => {
  const getIcon = (iconName: string) => {
    switch (iconName) {
      case 'Brain': return <Brain className="w-5 h-5 text-cyan-400" />;
      case 'Cpu': return <Cpu className="w-5 h-5 text-sky-400" />;
      case 'BookOpen': return <BookOpen className="w-5 h-5 text-blue-400" />;
      case 'Puzzle': return <Puzzle className="w-5 h-5 text-indigo-400" />;
      case 'Binary': return <Binary className="w-5 h-5 text-emerald-400" />;
      case 'Sparkles': return <Sparkles className="w-5 h-5 text-amber-400" />;
      case 'LayoutGrid': return <LayoutGrid className="w-5 h-5 text-violet-400" />;
      case 'Compass': return <Compass className="w-5 h-5 text-pink-400" />;
      case 'Coffee': return <Coffee className="w-5 h-5 text-teal-400" />;
      default: return <Gamepad2 className="w-5 h-5 text-cyan-400" />;
    }
  };

  return (
    <button
      onClick={() => onClick(category.slug)}
      className={`group flex items-center gap-3.5 p-3.5 rounded-xl border text-left transition-all duration-200 select-none ${
        selected
          ? 'bg-cyan-950/70 border-cyan-500 shadow-[0_0_15px_-3px_rgba(6,182,212,0.3)]'
          : 'bg-gray-900/80 border-slate-800/80 hover:border-cyan-500/40 hover:bg-gray-800/70'
      }`}
    >
      <div className="p-2.5 rounded-lg bg-gray-950/80 border border-slate-800 group-hover:border-cyan-500/30 transition-colors shrink-0">
        {getIcon(category.icon)}
      </div>
      <div className="min-w-0 flex-1">
        <h4 className="font-display font-semibold text-sm text-slate-100 group-hover:text-cyan-300 transition-colors truncate">
          {category.name}
        </h4>
        <span className="text-xs text-slate-400 tabular-nums">
          {category.count !== undefined ? `${category.count} jogos` : 'Ver jogos'}
        </span>
      </div>
    </button>
  );
};
