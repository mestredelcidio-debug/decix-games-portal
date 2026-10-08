import { useState, useEffect } from 'react';
import { GameHistoryEntry, DecixGame } from '../types/game.js';
import { historyService } from '../services/history.js';

export function useHistory() {
  const [history, setHistory] = useState<GameHistoryEntry[]>(() => historyService.getHistory());

  useEffect(() => {
    const handleUpdate = () => {
      setHistory(historyService.getHistory());
    };

    window.addEventListener('decix_history_updated', handleUpdate);
    window.addEventListener('storage', handleUpdate);

    return () => {
      window.removeEventListener('decix_history_updated', handleUpdate);
      window.removeEventListener('storage', handleUpdate);
    };
  }, []);

  const recordPlay = (game: DecixGame) => {
    historyService.recordGamePlay(game);
  };

  const clearHistory = () => {
    historyService.clearHistory();
  };

  return {
    history,
    count: history.length,
    recordPlay,
    clearHistory
  };
}
