import type { Action, Card, StrategyProvider } from '../types';

interface FeedbackProps {
  isCorrect: boolean | null;
  lastAction: Action | null;
  correctAction: Action | null;
  playerHand: Card[];
  dealerUpCard: Card | null;
  strategy: StrategyProvider;
}

function getActionName(action: Action): string {
  switch (action) {
    case 'hit': return 'Hit';
    case 'stand': return 'Stand';
    case 'double': return 'Double Down';
    case 'split': return 'Split';
  }
}

// Inline feedback component shown between dealer and player
export function Feedback({
  isCorrect,
  lastAction,
  correctAction,
  playerHand,
  dealerUpCard,
  strategy,
}: FeedbackProps) {
  if (isCorrect === null || isCorrect === true || lastAction === null || correctAction === null || !dealerUpCard) {
    return null;
  }

  const explanation = strategy.getExplanation(playerHand, dealerUpCard, correctAction);

  return (
    <div className="w-full max-w-md mx-auto px-3">
      <div className="bg-gray-900/95 border border-red-500/50 rounded-lg p-3 shadow-lg">
        {/* Header with X and action comparison */}
        <div className="flex items-center gap-3 mb-2">
          <span className="text-red-400 text-2xl shrink-0">✗</span>
          <div className="flex-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
            <span className="text-gray-400">
              You: <span className="text-red-400 font-semibold">{getActionName(lastAction)}</span>
            </span>
            <span className="text-gray-500">→</span>
            <span className="text-gray-400">
              Correct: <span className="text-green-400 font-semibold">{getActionName(correctAction)}</span>
            </span>
          </div>
        </div>

        {/* Explanation */}
        <div className="bg-gray-800/50 rounded p-2">
          <p className="text-gray-300 text-xs sm:text-sm leading-relaxed">
            <span className="text-yellow-400 font-medium">Why?</span> {explanation}
          </p>
        </div>
      </div>
    </div>
  );
}
