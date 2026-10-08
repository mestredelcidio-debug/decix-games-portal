import React, { useState, useEffect } from 'react';
import { RefreshCw, CheckCircle, Trophy, PenTool, Eraser, Lightbulb } from 'lucide-react';

interface SudokuGameProps {
  onGameComplete?: (score: number) => void;
  onRequestReward?: () => void;
}

// Preset Sudoku Puzzle (0 = empty)
const PUZZLE_EASY = [
  [5, 3, 0, 0, 7, 0, 0, 0, 0],
  [6, 0, 0, 1, 9, 5, 0, 0, 0],
  [0, 9, 8, 0, 0, 0, 0, 6, 0],
  [8, 0, 0, 0, 6, 0, 0, 0, 3],
  [4, 0, 0, 8, 0, 3, 0, 0, 1],
  [7, 0, 0, 0, 2, 0, 0, 0, 6],
  [0, 6, 0, 0, 0, 0, 2, 8, 0],
  [0, 0, 0, 4, 1, 9, 0, 0, 5],
  [0, 0, 0, 0, 8, 0, 0, 7, 9],
];

const SOLUTION_EASY = [
  [5, 3, 4, 6, 7, 8, 9, 1, 2],
  [6, 7, 2, 1, 9, 5, 3, 4, 8],
  [1, 9, 8, 3, 4, 2, 5, 6, 7],
  [8, 5, 9, 7, 6, 1, 4, 2, 3],
  [4, 2, 6, 8, 5, 3, 7, 9, 1],
  [7, 1, 3, 9, 2, 4, 8, 5, 6],
  [9, 6, 1, 5, 3, 7, 2, 8, 4],
  [2, 8, 7, 4, 1, 9, 6, 3, 5],
  [3, 4, 5, 2, 8, 6, 1, 7, 9],
];

export const SudokuGame: React.FC<SudokuGameProps> = ({ onGameComplete }) => {
  const [board, setBoard] = useState<number[][]>(() => PUZZLE_EASY.map((r) => [...r]));
  const [initialBoard] = useState<number[][]>(() => PUZZLE_EASY.map((r) => [...r]));
  const [selected, setSelected] = useState<[number, number] | null>([0, 2]);
  const [mistakes, setMistakes] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  const handleCellClick = (r: number, c: number) => {
    setSelected([r, c]);
  };

  const handleNumberInput = (num: number) => {
    if (!selected || isCompleted) return;
    const [r, c] = selected;
    if (initialBoard[r][c] !== 0) return; // célula fixa

    const newBoard = board.map((row) => [...row]);
    newBoard[r][c] = num;
    setBoard(newBoard);

    // Validação
    if (num !== 0 && num !== SOLUTION_EASY[r][c]) {
      setMistakes((m) => m + 1);
    } else {
      // Verificar vitória
      let completed = true;
      for (let i = 0; i < 9; i++) {
        for (let j = 0; j < 9; j++) {
          if (newBoard[i][j] !== SOLUTION_EASY[i][j]) {
            completed = false;
            break;
          }
        }
        if (!completed) break;
      }
      if (completed) {
        setIsCompleted(true);
        if (onGameComplete) onGameComplete(2000 - mistakes * 100);
      }
    }
  };

  const resetGame = () => {
    setBoard(PUZZLE_EASY.map((r) => [...r]));
    setMistakes(0);
    setTimer(0);
    setIsCompleted(false);
  };

  return (
    <div className="w-full flex flex-col items-center bg-gray-950 p-4 sm:p-6 rounded-2xl select-none">
      {/* Top HUD */}
      <div className="w-full max-w-lg flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-300">
        <div>
          <span className="font-semibold text-cyan-400">Sudoku Neural</span>
          <span className="text-slate-500 mx-2">·</span>
          <span>Erros: <strong className="text-rose-400 font-mono">{mistakes}</strong></span>
        </div>
        <div className="flex items-center gap-3">
          <span>Tempo: <strong className="font-mono text-slate-100">{timer}s</strong></span>
          <button onClick={resetGame} className="p-1 text-slate-400 hover:text-slate-200">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 9x9 Board */}
      <div className="mt-5 grid grid-cols-9 gap-0.5 bg-slate-800 p-1.5 rounded-xl border border-slate-700 shadow-xl max-w-[380px] sm:max-w-[420px] w-full">
        {board.map((row, r) =>
          row.map((val, c) => {
            const isInitial = initialBoard[r][c] !== 0;
            const isSelected = selected && selected[0] === r && selected[1] === c;
            const isError = val !== 0 && !isInitial && val !== SOLUTION_EASY[r][c];

            const borderRight = (c + 1) % 3 === 0 && c !== 8 ? 'border-r-2 border-r-slate-600' : '';
            const borderBottom = (r + 1) % 3 === 0 && r !== 8 ? 'border-b-2 border-b-slate-600' : '';

            return (
              <button
                key={`${r}-${c}`}
                onClick={() => handleCellClick(r, c)}
                className={`aspect-square flex items-center justify-center font-bold text-base sm:text-lg transition-colors ${borderRight} ${borderBottom} ${
                  isSelected
                    ? 'bg-cyan-500 text-gray-950 ring-2 ring-cyan-300 z-10'
                    : isError
                    ? 'bg-rose-950 text-rose-300'
                    : isInitial
                    ? 'bg-gray-900 text-slate-100'
                    : val !== 0
                    ? 'bg-gray-850 text-cyan-400'
                    : 'bg-gray-950 hover:bg-gray-900 text-slate-400'
                }`}
              >
                {val !== 0 ? val : ''}
              </button>
            );
          })
        )}
      </div>

      {/* Number Pad */}
      <div className="mt-5 flex flex-wrap items-center justify-center gap-2 max-w-[380px]">
        {[1, 2, 3, 4, 5, 6, 7, 8, 9].map((n) => (
          <button
            key={n}
            onClick={() => handleNumberInput(n)}
            className="w-10 h-10 sm:w-11 sm:h-11 rounded-xl bg-gray-900 hover:bg-cyan-950 border border-slate-800 hover:border-cyan-500 font-bold text-base text-slate-100 hover:text-cyan-300 transition-all flex items-center justify-center"
          >
            {n}
          </button>
        ))}
        <button
          onClick={() => handleNumberInput(0)}
          className="px-3 h-10 sm:h-11 rounded-xl bg-gray-900 hover:bg-slate-800 border border-slate-800 text-slate-300 flex items-center gap-1 text-xs"
          title="Apagar célula"
        >
          <Eraser className="w-4 h-4" />
          <span>Limpar</span>
        </button>
      </div>

      {/* Victory Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-cyan-500/60 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
            <Trophy className="w-14 h-14 text-cyan-400 mx-auto mb-3 animate-bounce" />
            <h3 className="font-display font-bold text-xl text-white">Sudoku Resolvido!</h3>
            <p className="text-xs text-slate-300 mt-1">
              Finalizado em {timer} segundos com apenas {mistakes} erros!
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
