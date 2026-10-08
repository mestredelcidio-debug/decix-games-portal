import React, { useState, useEffect, useCallback, useRef } from 'react';
import { RefreshCw, Trophy, ArrowUp, ArrowDown, ArrowLeft, ArrowRight } from 'lucide-react';

export const Logic2048Game: React.FC<{ onGameComplete?: (score: number) => void }> = ({ onGameComplete }) => {
  const [board, setBoard] = useState<number[][]>(() => createEmptyBoard());
  const [score, setScore] = useState(0);
  const [bestScore, setBestScore] = useState(() => {
    try {
      return parseInt(localStorage.getItem('decix_2048_best') || '0', 10);
    } catch {
      return 0;
    }
  });
  const [gameOver, setGameOver] = useState(false);
  const [won, setWon] = useState(false);
  const touchStartRef = useRef<{ x: number; y: number } | null>(null);

  function createEmptyBoard() {
    const b = Array(4).fill(0).map(() => Array(4).fill(0));
    addRandomTile(b);
    addRandomTile(b);
    return b;
  }

  function addRandomTile(b: number[][]) {
    const emptyCells: [number, number][] = [];
    for (let r = 0; r < 4; r++) {
      for (let c = 0; c < 4; c++) {
        if (b[r][c] === 0) emptyCells.push([r, c]);
      }
    }
    if (emptyCells.length === 0) return;
    const [r, c] = emptyCells[Math.floor(Math.random() * emptyCells.length)];
    b[r][c] = Math.random() < 0.9 ? 2 : 4;
  }

  const move = useCallback((direction: 'UP' | 'DOWN' | 'LEFT' | 'RIGHT') => {
    if (gameOver) return;

    setBoard((currentBoard) => {
      const b = currentBoard.map((row) => [...row]);
      let moved = false;
      let addedScore = 0;

      const slideAndMerge = (row: number[]) => {
        let arr = row.filter((x) => x !== 0);
        for (let i = 0; i < arr.length - 1; i++) {
          if (arr[i] === arr[i + 1]) {
            arr[i] *= 2;
            addedScore += arr[i];
            arr.splice(i + 1, 1);
          }
        }
        while (arr.length < 4) arr.push(0);
        return arr;
      };

      if (direction === 'LEFT') {
        for (let r = 0; r < 4; r++) {
          const original = [...b[r]];
          b[r] = slideAndMerge(b[r]);
          if (b[r].some((val, idx) => val !== original[idx])) moved = true;
        }
      } else if (direction === 'RIGHT') {
        for (let r = 0; r < 4; r++) {
          const original = [...b[r]];
          b[r] = slideAndMerge(b[r].reverse()).reverse();
          if (b[r].some((val, idx) => val !== original[idx])) moved = true;
        }
      } else if (direction === 'UP') {
        for (let c = 0; c < 4; c++) {
          let col = [b[0][c], b[1][c], b[2][c], b[3][c]];
          const original = [...col];
          col = slideAndMerge(col);
          for (let r = 0; r < 4; r++) b[r][c] = col[r];
          if (col.some((val, idx) => val !== original[idx])) moved = true;
        }
      } else if (direction === 'DOWN') {
        for (let c = 0; c < 4; c++) {
          let col = [b[3][c], b[2][c], b[1][c], b[0][c]];
          const original = [...col];
          col = slideAndMerge(col);
          b[3][c] = col[0];
          b[2][c] = col[1];
          b[1][c] = col[2];
          b[0][c] = col[3];
          if (col.some((val, idx) => val !== original[idx])) moved = true;
        }
      }

      if (moved) {
        addRandomTile(b);
        setScore((s) => {
          const newScore = s + addedScore;
          if (newScore > bestScore) {
            setBestScore(newScore);
            try { localStorage.setItem('decix_2048_best', String(newScore)); } catch {}
          }
          return newScore;
        });

        // Checar vitória
        if (!won) {
          for (let r = 0; r < 4; r++) {
            for (let c = 0; c < 4; c++) {
              if (b[r][c] === 2048) {
                setWon(true);
                if (onGameComplete) onGameComplete(addedScore);
              }
            }
          }
        }

        // Checar game over
        let canMove = false;
        for (let r = 0; r < 4; r++) {
          for (let c = 0; c < 4; c++) {
            if (b[r][c] === 0) canMove = true;
            if (r < 3 && b[r][c] === b[r + 1][c]) canMove = true;
            if (c < 3 && b[r][c] === b[r][c + 1]) canMove = true;
          }
        }
        if (!canMove) setGameOver(true);
      }

      return moved ? b : currentBoard;
    });
  }, [gameOver, won, bestScore, onGameComplete]);

  // Teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
        e.preventDefault();
        if (e.key === 'ArrowUp') move('UP');
        if (e.key === 'ArrowDown') move('DOWN');
        if (e.key === 'ArrowLeft') move('LEFT');
        if (e.key === 'ArrowRight') move('RIGHT');
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [move]);

  // Touch Swipe
  const handleTouchStart = (e: React.TouchEvent) => {
    const touch = e.touches[0];
    touchStartRef.current = { x: touch.clientX, y: touch.clientY };
  };

  const handleTouchEnd = (e: React.TouchEvent) => {
    if (!touchStartRef.current) return;
    const touch = e.changedTouches[0];
    const dx = touch.clientX - touchStartRef.current.x;
    const dy = touch.clientY - touchStartRef.current.y;
    const absX = Math.abs(dx);
    const absY = Math.abs(dy);

    if (Math.max(absX, absY) > 30) {
      if (absX > absY) {
        if (dx > 0) move('RIGHT');
        else move('LEFT');
      } else {
        if (dy > 0) move('DOWN');
        else move('UP');
      }
    }
    touchStartRef.current = null;
  };

  const restart = () => {
    setBoard(createEmptyBoard());
    setScore(0);
    setGameOver(false);
    setWon(false);
  };

  const getTileColor = (val: number) => {
    switch (val) {
      case 2: return 'bg-slate-800 text-slate-100';
      case 4: return 'bg-cyan-950 text-cyan-200 border border-cyan-800';
      case 8: return 'bg-cyan-800 text-white';
      case 16: return 'bg-sky-700 text-white';
      case 32: return 'bg-blue-600 text-white';
      case 64: return 'bg-indigo-600 text-white';
      case 128: return 'bg-amber-600 text-white font-extrabold';
      case 256: return 'bg-amber-500 text-white font-extrabold shadow-lg shadow-amber-500/20';
      case 512: return 'bg-emerald-600 text-white font-extrabold shadow-lg shadow-emerald-500/30';
      case 1024: return 'bg-rose-600 text-white font-extrabold text-xl shadow-lg';
      case 2048: return 'bg-gradient-to-br from-cyan-400 to-sky-500 text-gray-950 font-black text-xl shadow-xl shadow-cyan-400/50';
      default: return 'bg-gray-900/60 text-transparent';
    }
  };

  return (
    <div
      onTouchStart={handleTouchStart}
      onTouchEnd={handleTouchEnd}
      className="w-full flex flex-col items-center bg-gray-950 p-4 sm:p-6 rounded-2xl select-none"
    >
      {/* HUD */}
      <div className="w-full max-w-sm flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-300">
        <div>
          <span className="font-semibold text-cyan-400">Conexão 2048</span>
        </div>
        <div className="flex items-center gap-3">
          <div className="bg-gray-900 px-2.5 py-1 rounded-lg border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">PONTOS</span>
            <span className="font-mono font-bold text-slate-100">{score}</span>
          </div>
          <div className="bg-gray-900 px-2.5 py-1 rounded-lg border border-slate-800 text-center">
            <span className="text-[10px] text-slate-500 block">RECORDE</span>
            <span className="font-mono font-bold text-cyan-300">{bestScore}</span>
          </div>
          <button onClick={restart} className="p-2 text-slate-400 hover:text-slate-200">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4x4 Grid */}
      <div className="mt-5 grid grid-cols-4 gap-2.5 bg-gray-900 p-3 rounded-2xl border border-slate-800 max-w-sm w-full aspect-square">
        {board.map((row, r) =>
          row.map((val, c) => (
            <div
              key={`${r}-${c}`}
              className={`rounded-xl flex items-center justify-center font-display font-bold text-2xl sm:text-3xl transition-transform duration-100 ${getTileColor(val)}`}
            >
              {val !== 0 ? val : ''}
            </div>
          ))
        )}
      </div>

      {/* Mobile Touch Controls */}
      <div className="mt-4 flex flex-col items-center gap-1.5 sm:hidden">
        <button onClick={() => move('UP')} className="p-2 bg-gray-900 rounded-lg text-slate-300 border border-slate-800">
          <ArrowUp className="w-4 h-4" />
        </button>
        <div className="flex gap-4">
          <button onClick={() => move('LEFT')} className="p-2 bg-gray-900 rounded-lg text-slate-300 border border-slate-800">
            <ArrowLeft className="w-4 h-4" />
          </button>
          <button onClick={() => move('DOWN')} className="p-2 bg-gray-900 rounded-lg text-slate-300 border border-slate-800">
            <ArrowDown className="w-4 h-4" />
          </button>
          <button onClick={() => move('RIGHT')} className="p-2 bg-gray-900 rounded-lg text-slate-300 border border-slate-800">
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Game Over Modal */}
      {gameOver && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-slate-700 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
            <h3 className="font-display font-bold text-xl text-rose-400">Fim de Jogo!</h3>
            <p className="text-xs text-slate-300 mt-1">Sua pontuação final: <strong className="text-cyan-400">{score}</strong></p>
            <button
              onClick={restart}
              className="mt-5 w-full py-2.5 bg-gradient-to-r from-cyan-500 to-sky-600 font-bold text-gray-950 rounded-xl text-sm"
            >
              Tentar Novamente
            </button>
          </div>
        </div>
      )}
    </div>
  );
};
