import React, { useState, useEffect } from 'react';
import { RefreshCw, Trophy, Sparkles, Zap } from 'lucide-react';

interface MemoryCard {
  id: number;
  symbol: string;
  label: string;
  matched: boolean;
}

const SYMBOLS = [
  { symbol: '🧠', label: 'Cérebro' },
  { symbol: '⚡', label: 'Energia' },
  { symbol: '🧩', label: 'Puzzle' },
  { symbol: '🔬', label: 'Ciência' },
  { symbol: '🎯', label: 'Foco' },
  { symbol: '🌐', label: 'Rede' },
  { symbol: '🔑', label: 'Chave' },
  { symbol: '💎', label: 'Cristal' },
];

export const MemoryNeuralGame: React.FC<{ onGameComplete?: (score: number) => void }> = ({ onGameComplete }) => {
  const [cards, setCards] = useState<MemoryCard[]>([]);
  const [flipped, setFlipped] = useState<number[]>([]);
  const [moves, setMoves] = useState(0);
  const [matches, setMatches] = useState(0);
  const [streak, setStreak] = useState(0);
  const [timer, setTimer] = useState(0);
  const [isCompleted, setIsCompleted] = useState(false);

  // Sintetizador Web Audio API seguro
  const playSound = (freq = 440, type: OscillatorType = 'sine', duration = 0.15) => {
    try {
      const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.type = type;
      osc.frequency.setValueAtTime(freq, ctx.currentTime);
      gain.gain.setValueAtTime(0.08, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + duration);
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.start();
      osc.stop(ctx.currentTime + duration);
    } catch {
      // Audio fallback silent
    }
  };

  const initGame = () => {
    const deck: MemoryCard[] = [];
    let id = 0;
    SYMBOLS.forEach((item) => {
      deck.push({ id: id++, symbol: item.symbol, label: item.label, matched: false });
      deck.push({ id: id++, symbol: item.symbol, label: item.label, matched: false });
    });
    // Embaralha deck
    for (let i = deck.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [deck[i], deck[j]] = [deck[j], deck[i]];
    }
    setCards(deck);
    setFlipped([]);
    setMoves(0);
    setMatches(0);
    setStreak(0);
    setTimer(0);
    setIsCompleted(false);
  };

  useEffect(() => {
    initGame();
  }, []);

  useEffect(() => {
    if (isCompleted) return;
    const interval = setInterval(() => setTimer((t) => t + 1), 1000);
    return () => clearInterval(interval);
  }, [isCompleted]);

  const handleCardClick = (index: number) => {
    if (flipped.length === 2 || cards[index].matched || flipped.includes(index)) return;

    playSound(520, 'sine', 0.1);
    const newFlipped = [...flipped, index];
    setFlipped(newFlipped);

    if (newFlipped.length === 2) {
      setMoves((m) => m + 1);
      const [first, second] = newFlipped;
      if (cards[first].symbol === cards[second].symbol) {
        // Match!
        setTimeout(() => {
          playSound(880, 'triangle', 0.25);
          setCards((prev) =>
            prev.map((card, idx) =>
              idx === first || idx === second ? { ...card, matched: true } : card
            )
          );
          setFlipped([]);
          setMatches((m) => {
            const next = m + 1;
            if (next === SYMBOLS.length) {
              setIsCompleted(true);
              playSound(1046, 'sine', 0.5);
              if (onGameComplete) onGameComplete(1500 - moves * 20);
            }
            return next;
          });
          setStreak((s) => s + 1);
        }, 400);
      } else {
        // No match
        setTimeout(() => {
          setFlipped([]);
          setStreak(0);
        }, 900);
      }
    }
  };

  return (
    <div className="w-full flex flex-col items-center bg-gray-950 p-4 sm:p-6 rounded-2xl select-none">
      {/* HUD */}
      <div className="w-full max-w-md flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-300">
        <div className="flex items-center gap-3">
          <span className="font-semibold text-cyan-400">Memória Neural Pro</span>
          <span>Movimentos: <strong className="font-mono text-slate-100">{moves}</strong></span>
          {streak > 1 && (
            <span className="flex items-center gap-0.5 text-amber-400 font-bold">
              <Zap className="w-3 h-3" /> {streak}x Combo
            </span>
          )}
        </div>
        <div className="flex items-center gap-3">
          <span>Tempo: <strong className="font-mono text-slate-100">{timer}s</strong></span>
          <button onClick={initGame} className="p-1 text-slate-400 hover:text-slate-200">
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* 4x4 Grid */}
      <div className="mt-6 grid grid-cols-4 gap-2.5 sm:gap-3.5 max-w-md w-full">
        {cards.map((card, idx) => {
          const isFlipped = flipped.includes(idx) || card.matched;

          return (
            <button
              key={card.id}
              onClick={() => handleCardClick(idx)}
              disabled={card.matched}
              className={`aspect-square rounded-2xl font-bold text-3xl flex items-center justify-center transition-all duration-300 transform perspective-1000 ${
                isFlipped
                  ? card.matched
                    ? 'bg-cyan-950/80 border-2 border-cyan-400/80 text-cyan-200 shadow-md shadow-cyan-500/20'
                    : 'bg-slate-800 border-2 border-cyan-400 text-white scale-105'
                  : 'bg-gray-900 border border-slate-800 hover:border-cyan-500/50 hover:bg-gray-850 hover:-translate-y-0.5'
              }`}
            >
              {isFlipped ? (
                <span>{card.symbol}</span>
              ) : (
                <div className="w-4 h-4 rounded-full border border-cyan-500/30 bg-cyan-950/40" />
              )}
            </button>
          );
        })}
      </div>

      {/* Victory Modal */}
      {isCompleted && (
        <div className="fixed inset-0 z-50 bg-black/80 flex items-center justify-center p-4">
          <div className="bg-gray-900 border border-cyan-500/60 p-6 rounded-2xl max-w-sm w-full text-center shadow-2xl">
            <Trophy className="w-14 h-14 text-cyan-400 mx-auto mb-3 animate-bounce" />
            <h3 className="font-display font-bold text-xl text-white">Memória Brilhante!</h3>
            <p className="text-xs text-slate-300 mt-1">
              Todos os {SYMBOLS.length} pares encontrados em {moves} jogadas e {timer} segundos!
            </p>
            <button
              onClick={initGame}
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
