import { useEffect, useState, useRef } from 'react';
import { useGame } from '../hooks/useGame';
import { useMistakes } from '../hooks/useMistakes';
import { useSettings } from '../hooks/useSettings';
import { Hand } from './Hand';
import { Controls } from './Controls';
import { Feedback } from './Feedback';
import { Stats } from './Stats';
import { SettingsModal } from './SettingsModal';
import type { Card } from '../types';

export function Game() {
  const { settings, updateSettings, resetSettings } = useSettings();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);

  const {
    state,
    strategy,
    dealNewHand,
    makeAction,
    resetStats,
    canDoubleDown,
    canSplitHand,
  } = useGame(settings);

  const { mistakes, addMistake, clearMistakes } = useMistakes();

  // Track the hand that was played for showing feedback
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
      const dealerUpCard = state.dealerHand[0] || null;
      // Use the original hand (before action) for feedback display
      const handForFeedback = state.originalPlayerHand || state.playerHand;

      setFeedbackHand({
        playerHand: handForFeedback,
        dealerUpCard,
      });

      if (state.isCorrect) {
        // For correct moves, show inline message briefly
        setShowCorrectMessage(true);
        setShowFeedback(false);
        const timer = setTimeout(() => {
          setShowCorrectMessage(false);
        }, 1000);
        return () => clearTimeout(timer);
      } else {
        // For incorrect moves, save to mistakes and show inline feedback
        if (dealerUpCard && state.correctAction) {
          addMistake(
            handForFeedback,
            dealerUpCard,
            state.lastAction,
            state.correctAction
          );
        }
        setShowFeedback(true);
        setShowCorrectMessage(false);
      }
    }
  }, [state.isCorrect, state.lastAction, state.playerHand, state.dealerHand, state.correctAction, state.originalPlayerHand, addMistake]);

  // Auto-deal countdown when hand is complete
  useEffect(() => {
    // Start countdown when game is in result phase and correct message is done
    // Only auto-deal for correct answers - let user take their time on wrong answers
    if (state.gamePhase === 'result' && !showCorrectMessage && !showFeedback) {
      const delayTime = 3;
      setCountdown(delayTime);

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
        setShowFeedback(false);
      }, delayTime * 1000);

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

  const isPlaying = state.gamePhase === 'playing';

  return (
    <div className="min-h-[100dvh] bg-gradient-to-b from-green-900 to-green-950 flex flex-col overflow-hidden">
      {/* Compact Header with Stats */}
      <header className="px-3 py-2 flex justify-between items-center border-b border-green-800 shrink-0">
        <div className="flex items-center gap-2">
          <h1 className="text-base sm:text-xl font-bold text-white truncate">Blackjack Trainer</h1>
          <button
            onClick={() => setIsSettingsOpen(true)}
            className="p-1.5 text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-green-800/50"
            aria-label="Open settings"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
          </button>
        </div>
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
              showValue={false}
            />
          )}
        </div>

        {/* Status / Feedback - Middle */}
        <div className="shrink-0 px-3 py-2 flex flex-col items-center justify-center gap-2">
          {showCorrectMessage ? (
            <div className="text-green-400 text-2xl sm:text-3xl font-bold animate-pulse">
              ✓ Correct!
            </div>
          ) : showFeedback ? (
            <Feedback
              isCorrect={state.isCorrect}
              lastAction={state.lastAction}
              correctAction={state.correctAction}
              playerHand={feedbackHand.playerHand}
              dealerUpCard={feedbackHand.dealerUpCard}
              strategy={strategy}
            />
          ) : (
            <div className="text-gray-400 text-sm sm:text-lg text-center">
              {isPlaying ? 'Make your decision...' : countdown !== null ? `Dealing in ${countdown}...` : 'Press Deal to start'}
            </div>
          )}
        </div>

        {/* Player Section - Bottom */}
        <div className="flex-1 flex flex-col items-center justify-center p-3 sm:p-6">
          {state.playerHand.length > 0 && (
            <Hand cards={state.playerHand} label="Your Hand" showValue={false} />
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
              onClick={() => {
                dealNewHand();
                setShowFeedback(false);
              }}
              className="w-full max-w-sm px-8 py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-lg rounded-xl transition-colors shadow-lg"
            >
              {countdown !== null ? `Deal New Hand (${countdown})` : 'Deal New Hand'}
            </button>
          </div>
        )}
      </div>

      {/* Settings Modal */}
      <SettingsModal
        isOpen={isSettingsOpen}
        onClose={() => setIsSettingsOpen(false)}
        settings={settings}
        onUpdateSettings={updateSettings}
        onResetSettings={resetSettings}
        mistakeCount={mistakes.length}
        onClearMistakes={clearMistakes}
      />
    </div>
  );
}
