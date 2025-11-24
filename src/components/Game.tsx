import { useEffect } from 'react';
import { useGame } from '../hooks/useGame';
import { Hand } from './Hand';
import { Controls } from './Controls';
import { Feedback } from './Feedback';
import { Stats } from './Stats';

export function Game() {
  const {
    state,
    dealNewHand,
    makeAction,
    resetStats,
    canDoubleDown,
    canSplitHand,
  } = useGame();

  // Deal initial hand on mount
  useEffect(() => {
    dealNewHand();
  }, []);

  const isPlaying = state.gamePhase === 'playing';
  const showResult = state.gamePhase === 'result' || state.isCorrect !== null;

  return (
    <div className="min-h-screen bg-gradient-to-b from-green-900 to-green-950 flex flex-col">
      {/* Header */}
      <header className="p-4 flex justify-between items-center border-b border-green-800">
        <h1 className="text-2xl font-bold text-white">Blackjack Strategy Trainer</h1>
        <Stats correct={state.stats.correct} total={state.stats.total} onReset={resetStats} />
      </header>

      {/* Main game area */}
      <main className="flex-1 flex flex-col items-center justify-center gap-8 p-4">
        {/* Dealer's hand */}
        {state.dealerHand.length > 0 && (
          <Hand
            cards={state.dealerHand}
            label="Dealer"
            hideSecondCard={isPlaying}
            showValue={true}
          />
        )}

        {/* Feedback */}
        <div className="min-h-[80px] flex items-center">
          {showResult && state.isCorrect !== null ? (
            <Feedback
              isCorrect={state.isCorrect}
              lastAction={state.lastAction}
              correctAction={state.correctAction}
            />
          ) : (
            <div className="text-gray-400 text-lg">
              {isPlaying ? 'Make your decision...' : 'Press Deal to start'}
            </div>
          )}
        </div>

        {/* Player's hand */}
        {state.playerHand.length > 0 && (
          <Hand cards={state.playerHand} label="Your Hand" showValue={true} />
        )}

        {/* Controls */}
        <div className="mt-4">
          {isPlaying ? (
            <Controls
              onAction={makeAction}
              canDouble={canDoubleDown}
              canSplit={canSplitHand}
              disabled={!isPlaying}
            />
          ) : (
            <button
              onClick={dealNewHand}
              className="px-8 py-4 bg-blue-600 hover:bg-blue-700 text-white font-bold text-lg rounded-lg transition-colors shadow-lg"
            >
              Deal New Hand
            </button>
          )}
        </div>
      </main>

      {/* Footer */}
      <footer className="p-4 text-center text-gray-500 text-sm border-t border-green-800">
        Practice basic blackjack strategy. Learn when to hit, stand, double, or split.
      </footer>
    </div>
  );
}
