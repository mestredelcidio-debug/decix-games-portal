import React, { useState, useEffect } from 'react';
import { HelpCircle, RefreshCw, CheckCircle, Trophy, Lightbulb } from 'lucide-react';

interface CrosswordGameProps {
  onGameComplete?: (score: number) => void;
  onRequestReward?: () => void;
}

interface Clue {
  number: number;
  direction: 'across' | 'down';
  clue: string;
  answer: string;
  row: number;
  col: number;
}

const CLUES: Clue[] = [
  // Horizontais
  { number: 1, direction: 'across', row: 0, col: 0, answer: 'LOGICA', clue: 'Estudo do raciocínio e dedução válida' },
  { number: 3, direction: 'across', row: 2, col: 0, answer: 'ENIGMA', clue: 'Charada, mistério ou quebra-cabeça desafiador' },
  { number: 5, direction: 'across', row: 4, col: 0, answer: 'XADREZ', clue: 'Milenar jogo de tabuleiro estratégico com reis e rainhas' },
  // Verticais
  { number: 1, direction: 'down', row: 0, col: 0, answer: 'LEX', clue: 'Lei em latim' },
  { number: 2, direction: 'down', row: 0, col: 2, answer: 'GENIO', clue: 'Pessoa dotada de extraordinária inteligência' },
  { number: 4, direction: 'down', row: 0, col: 5, answer: 'AZAR', clue: 'O oposto da sorte nos jogos' },
];

export const CrosswordGame: React.FC<CrosswordGameProps> = ({ onGameComplete, onRequestReward }) => {
  const gridSize = 6;
  const [grid, setGrid] = useState<string[][]>(() =>
    Array(gridSize).fill(null).map(() => Array(gridSize).fill(''))
  );
  const [selectedCell, setSelectedCell] = useState<{ r: number; c: number }>({ r: 0, c: 0 });
  const [direction, setDirection] = useState<'across' | 'down'>('across');
  const [hintsLeft, setHintsLeft] = useState(3);
  const [isCompleted, setIsCompleted] = useState(false);
  const [timer, setTimer] = useState(0);

  // Mapa de células ativas
  const activeCells = new Set<string>();
  CLUES.forEach((clue) => {
    for (let i = 0; i < clue.answer.length; i++) {
      const r = clue.direction === 'across' ? clue.row : clue.row + i;
      const c = clue.direction === 'across' ? clue.col + i : clue.col;
      activeCells.add(`${r},${c}`);
    }
  });

  // Timer
  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  // Verificar vitória
  useEffect(() => {
    let allCorrect = true;
    for (const clue of CLUES) {
      for (let i = 0; i < clue.answer.length; i++) {
        const r = clue.direction === 'across' ? clue.row : clue.row + i;
        const c = clue.direction === 'across' ? clue.col + i : clue.col;
        if (grid[r][c] !== clue.answer[i]) {
          allCorrect = false;
          break;
        }
      }
      if (!allCorrect) break;
    }

    if (allCorrect && !isCompleted) {
      setIsCompleted(true);
      if (onGameComplete) onGameComplete(1000 - timer);
    }
  }, [grid, isCompleted, timer, onGameComplete]);

  const handleCellClick = (r: number, c: number) => {
    if (!activeCells.has(`${r},${c}`)) return;
    if (selectedCell.r === r && selectedCell.c === c) {
      setDirection((d) => (d === 'across' ? 'down' : 'across'));
    } else {
      setSelectedCell({ r, c });
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (isCompleted) return;
    const key = e.key.toUpperCase();

    if (/^[A-Z]$/.test(key)) {
      const newGrid = grid.map((row) => [...row]);
      newGrid[selectedCell.r][selectedCell.c] = key;
      setGrid(newGrid);

      // Avançar cursor
      if (direction === 'across' && selectedCell.c < gridSize - 1 && activeCells.has(`${selectedCell.r},${selectedCell.c + 1}`)) {
        setSelectedCell({ r: selectedCell.r, c: selectedCell.c + 1 });
      } else if (direction === 'down' && selectedCell.r < gridSize - 1 && activeCells.has(`${selectedCell.r + 1},${selectedCell.c}`)) {
        setSelectedCell({ r: selectedCell.r + 1, c: selectedCell.c });
      }
    } else if (e.key === 'Backspace') {
      const newGrid = grid.map((row) => [...row]);
      newGrid[selectedCell.r][selectedCell.c] = '';
      setGrid(newGrid);
      // Voltar cursor
      if (direction === 'across' && selectedCell.c > 0 && activeCells.has(`${selectedCell.r},${selectedCell.c - 1}`)) {
        setSelectedCell({ r: selectedCell.r, c: selectedCell.c - 1 });
      } else if (direction === 'down' && selectedCell.r > 0 && activeCells.has(`${selectedCell.r - 1},${selectedCell.c}`)) {
        setSelectedCell({ r: selectedCell.r - 1, c: selectedCell.c });
      }
    } else if (e.key === ' ' || e.key === 'Space') {
      e.preventDefault();
      setDirection((d) => (d === 'across' ? 'down' : 'across'));
    }
  };

  const useHint = () => {
    if (hintsLeft <= 0) {
      if (onRequestReward) onRequestReward();
      return;
    }
    // Revela a letra correta na célula selecionada
    for (const clue of CLUES) {
      for (let i = 0; i < clue.answer.length; i++) {
        const r = clue.direction === 'across' ? clue.row : clue.row + i;
        const c = clue.direction === 'across' ? clue.col + i : clue.col;
        if (r === selectedCell.r && c === selectedCell.c) {
          const newGrid = grid.map((row) => [...row]);
          newGrid[r][c] = clue.answer[i];
          setGrid(newGrid);
          setHintsLeft((h) => h - 1);
          return;
        }
      }
    }
  };

  const resetGame = () => {
    setGrid(Array(gridSize).fill(null).map(() => Array(gridSize).fill('')));
    setIsCompleted(false);
    setTimer(0);
  };

  return (
    <div
      tabIndex={0}
      onKeyDown={handleKeyDown}
      className="w-full flex flex-col items-center bg-gray-950 p-4 sm:p-6 rounded-2xl select-none outline-none focus:ring-1 focus:ring-cyan-500/50"
    >
      {/* Top HUD */}
      <div className="w-full max-w-2xl flex items-center justify-between pb-4 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-cyan-400">Palavras Cruzadas Master</span>
          <span className="text-slate-500">·</span>
          <span>Tempo: <strong className="font-mono text-slate-100">{timer}s</strong></span>
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={useHint}
            className="flex items-center gap-1.5 px-3 py-1 bg-cyan-950/70 border border-cyan-800/80 hover:bg-cyan-900/60 text-cyan-300 rounded-lg transition-colors"
          >
            <Lightbulb className="w-3.5 h-3.5" />
            <span>Dica ({hintsLeft})</span>
          </button>
          <button
            onClick={resetGame}
            className="p-1.5 text-slate-400 hover:text-slate-200 hover:bg-slate-850 rounded-lg transition-colors"
            title="Reiniciar"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Main Board & Clues Split */}
      <div className="w-full max-w-2xl grid grid-cols-1 md:grid-cols-2 gap-6 mt-6 items-start">
        {/* Crossword Grid */}
        <div className="flex flex-col items-center">
          <div className="grid grid-cols-6 gap-1 bg-gray-900 p-2.5 rounded-xl border border-slate-800">
            {grid.map((row, r) =>
              row.map((cell, c) => {
                const isActive = activeCells.has(`${r},${c}`);
                const isSelected = selectedCell.r === r && selectedCell.c === c;
                const clueNumber = CLUES.find((cl) => cl.row === r && cl.col === c)?.number;

                return (
                  <button
                    key={`${r}-${c}`}
                    onClick={() => handleCellClick(r, c)}
                    disabled={!isActive}
                    className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-lg font-bold text-lg flex items-center justify-center transition-all ${
                      !isActive
                        ? 'bg-gray-950 opacity-40 cursor-default'
                        : isSelected
                        ? 'bg-cyan-500 text-gray-950 ring-2 ring-cyan-300 shadow-md shadow-cyan-500/40'
                        : cell
                        ? 'bg-slate-800 text-cyan-300 hover:bg-slate-750'
                        : 'bg-slate-850 text-slate-200 hover:bg-slate-800 border border-slate-750'
                    }`}
                  >
                    {clueNumber && (
                      <span className="absolute top-0.5 left-1 text-[9px] font-mono text-slate-400">
                        {clueNumber}
                      </span>
                    )}
                    {cell}
                  </button>
                );
              })
            )}
          </div>
          <p className="text-[11px] text-slate-500 mt-3 text-center">
            Clique na casa e digite pelo teclado. Barra de Espaço alterna a direção.
          </p>
        </div>

        {/* Clues Panel */}
        <div className="space-y-4 bg-gray-900/60 p-4 rounded-xl border border-slate-800/80 text-xs">
          <div>
            <h4 className="font-display font-semibold text-cyan-400 mb-2 uppercase tracking-wider text-[11px]">
              Horizontais →
            </h4>
            <div className="space-y-1.5 text-slate-300">
              {CLUES.filter((c) => c.direction === 'across').map((c) => (
                <div key={c.number} className="flex gap-2">
                  <span className="font-mono text-cyan-400 font-bold shrink-0">{c.number}.</span>
                  <span>{c.clue}</span>
                </div>
              ))}
            </div>
          </div>

          <div className="pt-2 border-t border-slate-800">
            <h4 className="font-display font-semibold text-sky-400 mb-2 uppercase tracking-wider text-[11px]">
              Verticais ↓
            </h4>
            <div className="space-y-1.5 text-slate-300">
              {CLUES.filter((c) => c.direction === 'down').map((c) => (
                <div key={c.number} className="flex gap-2">
                  <span className="font-mono text-sky-400 font-bold shrink-0">{c.number}.</span>
                  <span>{c.clue}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Victory Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-cyan-500/60 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
            <Trophy className="w-14 h-14 text-cyan-400 mx-auto mb-3 animate-bounce" />
            <h3 className="font-display font-bold text-xl text-white">Parabéns!</h3>
            <p className="text-xs text-slate-300 mt-1">
              Você completou todas as palavras em <strong className="text-cyan-400">{timer} segundos</strong>!
            </p>
            <button
              onClick={resetGame}
              className="mt-5 w-full py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 font-bold text-gray-950 rounded-xl text-sm"
            >
              Jogar Novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
