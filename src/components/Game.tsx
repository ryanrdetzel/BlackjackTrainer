import { useEffect, useState, useCallback, useRef } from 'react';
import { useGame } from '../hooks/useGame';
import { Hand } from './Hand';
import { Controls } from './Controls';
import { Feedback } from './Feedback';
import { Stats } from './Stats';
import type { Card } from '../types';

export function Game() {
  const {
    state,
    strategy,
    dealNewHand,
    makeAction,
    resetStats,
    canDoubleDown,
    canSplitHand,
  } = useGame();

  // Track the hand that was played for showing in modal
  const [feedbackHand, setFeedbackHand] = useState<{
    playerHand: Card[];
    dealerUpCard: Card | null;
  }>({ playerHand: [], dealerUpCard: null });
  const [showFeedback, setShowFeedback] = useState(false);
  const [showCorrectMessage, setShowCorrectMessage] = useState(false);
  const [countdown, setCountdown] = useState<number | null>(null);
  const countdownRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Deal initial hand on mount
  useEffect(() => {
    dealNewHand();
  }, []);

  // Show feedback when a result is available
  useEffect(() => {
    if (state.isCorrect !== null && state.lastAction !== null) {
      setFeedbackHand({
        playerHand: state.playerHand,
        dealerUpCard: state.dealerHand[0] || null,
      });

      if (state.isCorrect) {
        // For correct moves, show inline message briefly
        setShowCorrectMessage(true);
        const timer = setTimeout(() => {
          setShowCorrectMessage(false);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // For incorrect moves, show the modal
        setShowFeedback(true);
      }
    }
  }, [state.isCorrect, state.lastAction]);

  // Auto-deal countdown when hand is complete
  useEffect(() => {
    // Start countdown when: game is in result phase, no feedback showing, no correct message
    if (state.gamePhase === 'result' && !showFeedback && !showCorrectMessage) {
      setCountdown(3);

      countdownRef.current = setInterval(() => {
        setCountdown((prev) => {
          if (prev === null || prev <= 1) {
            if (countdownRef.current) {
              clearInterval(countdownRef.current);
              countdownRef.current = null;
            }
            return null;
          }
          return prev - 1;
        });
      }, 1000);

      const dealTimer = setTimeout(() => {
        dealNewHand();
        setCountdown(null);
      }, 3000);

      return () => {
        clearTimeout(dealTimer);
        if (countdownRef.current) {
          clearInterval(countdownRef.current);
          countdownRef.current = null;
        }
        setCountdown(null);
      };
    }
  }, [state.gamePhase, showFeedback, showCorrectMessage, dealNewHand]);

  const dismissFeedback = useCallback(() => {
    setShowFeedback(false);
  }, []);

  const isPlaying = state.gamePhase === 'playing';

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

        {/* Status - Middle */}
        <div className="shrink-0 px-3 py-2 flex items-center justify-center">
          {showCorrectMessage ? (
            <div className="text-green-400 text-2xl sm:text-3xl font-bold animate-pulse">
              ✓ Correct!
            </div>
          ) : (
            <div className="text-gray-400 text-sm sm:text-lg text-center">
              {isPlaying ? 'Make your decision...' : countdown !== null ? `Dealing in ${countdown}...` : 'Press Deal to start'}
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
              {countdown !== null ? `Deal New Hand (${countdown})` : 'Deal New Hand'}
            </button>
          </div>
        )}
      </div>

      {/* Feedback Modal */}
      {showFeedback && (
        <Feedback
          isCorrect={state.isCorrect}
          lastAction={state.lastAction}
          correctAction={state.correctAction}
          playerHand={feedbackHand.playerHand}
          dealerUpCard={feedbackHand.dealerUpCard}
          strategy={strategy}
          onDismiss={dismissFeedback}
        />
      )}
    </div>
  );
}
