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
    <div className="min-h-[100dvh] bg-gradient-to-b from-green-900 to-green-950 flex flex-col overflow-hidden">
      {/* Compact Header with Stats */}
      <header className="px-3 py-2 flex justify-between items-center border-b border-green-800 shrink-0">
        <h1 className="text-base sm:text-xl font-bold text-white truncate">Blackjack Trainer</h1>
        <Stats correct={state.stats.correct} total={state.stats.total} onReset={resetStats} />
      </header>

      {/* Main game area - vertical layout optimized for mobile */}
      <main className="flex-1 flex flex-col min-h-0">
        {/* Dealer Section - Top */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6">
          {state.dealerHand.length > 0 && (
            <Hand
              cards={state.dealerHand}
              label="Dealer"
              hideSecondCard={isPlaying}
              showValue={true}
            />
          )}
        </div>

        {/* Feedback - Middle */}
        <div className="shrink-0 px-3 py-2 flex items-center justify-center">
          {showResult && state.isCorrect !== null ? (
            <Feedback
              isCorrect={state.isCorrect}
              lastAction={state.lastAction}
              correctAction={state.correctAction}
            />
          ) : (
            <div className="text-gray-400 text-sm sm:text-lg text-center">
              {isPlaying ? 'Make your decision...' : 'Press Deal to start'}
            </div>
          )}
        </div>

        {/* Player Section - Bottom */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6">
          {state.playerHand.length > 0 && (
            <Hand cards={state.playerHand} label="Your Hand" showValue={true} />
          )}
        </div>
      </main>

      {/* Controls - Fixed at bottom for easy thumb access */}
      <div className="shrink-0 px-3 py-4 sm:py-6 border-t border-green-800 bg-green-950/50">
        {isPlaying ? (
          <Controls
            onAction={makeAction}
            canDouble={canDoubleDown}
            canSplit={canSplitHand}
            disabled={!isPlaying}
          />
        ) : (
          <div className="flex justify-center">
            <button
              onClick={dealNewHand}
              className="w-full max-w-sm px-8 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-lg rounded-xl transition-colors shadow-lg"
            >
              Deal New Hand
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
