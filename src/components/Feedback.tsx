import type { Action, Card } from '../types';
import { getActionName, getStrategyExplanation } from '../utils/strategy';

interface FeedbackProps {
  isCorrect: boolean | null;
  lastAction: Action | null;
  correctAction: Action | null;
  playerHand: Card[];
  dealerUpCard: Card | null;
  onDismiss: () => void;
}

export function Feedback({
  isCorrect,
  lastAction,
  correctAction,
  playerHand,
  dealerUpCard,
  onDismiss,
}: FeedbackProps) {
  if (isCorrect === null || lastAction === null || correctAction === null || !dealerUpCard) {
    return null;
  }

  const explanation = getStrategyExplanation(playerHand, dealerUpCard, correctAction);

  // For correct answers, show a simple toast-style notification
  if (isCorrect) {
    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div className="absolute inset-0 bg-black/40" onClick={onDismiss} />
        <div className="relative bg-green-900 border-2 border-green-500 rounded-xl shadow-2xl p-4 sm:p-6 max-w-sm w-full mx-4 text-center">
          <div className="text-green-300 mb-3">
            <span className="text-4xl">✓</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-bold text-green-300 mb-2">
            Correct!
          </h3>
          <p className="text-green-200 text-sm sm:text-base">
            {getActionName(lastAction)} was the right play.
          </p>
          <button
            onClick={onDismiss}
            className="mt-4 w-full py-3 bg-green-700 hover:bg-green-600 active:bg-green-800 text-white font-bold rounded-lg transition-colors"
          >
            Continue
          </button>
        </div>
      </div>
    );
  }

  // For incorrect answers, show a detailed modal with explanation
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60" onClick={onDismiss} />
      <div className="relative bg-gray-900 border-2 border-red-500 rounded-xl shadow-2xl p-4 sm:p-6 max-w-md w-full mx-4 max-h-[85vh] overflow-y-auto">
        <div className="text-red-400 mb-3 text-center">
          <span className="text-4xl">✗</span>
        </div>

        <h3 className="text-xl sm:text-2xl font-bold text-red-400 text-center mb-4">
          Incorrect
        </h3>

        <div className="space-y-4">
          <div className="bg-gray-800 rounded-lg p-3 sm:p-4">
            <div className="flex justify-between items-center text-sm sm:text-base">
              <span className="text-gray-400">You chose:</span>
              <span className="text-red-400 font-semibold">{getActionName(lastAction)}</span>
            </div>
            <div className="flex justify-between items-center text-sm sm:text-base mt-2">
              <span className="text-gray-400">Correct play:</span>
              <span className="text-green-400 font-semibold">{getActionName(correctAction)}</span>
            </div>
          </div>

          <div className="bg-gray-800/50 rounded-lg p-3 sm:p-4">
            <h4 className="text-yellow-400 font-semibold text-sm sm:text-base mb-2">
              Why {getActionName(correctAction).toLowerCase()}?
            </h4>
            <p className="text-gray-300 text-sm sm:text-base leading-relaxed">
              {explanation}
            </p>
          </div>
        </div>

        <button
          onClick={onDismiss}
          className="mt-5 w-full py-3 sm:py-4 bg-blue-600 hover:bg-blue-700 active:bg-blue-800 text-white font-bold text-base sm:text-lg rounded-lg transition-colors"
        >
          Got it
        </button>
      </div>
    </div>
  );
}
