import type { Action } from '../types';
import { getActionName } from '../utils/strategy';

interface FeedbackProps {
  isCorrect: boolean | null;
  lastAction: Action | null;
  correctAction: Action | null;
}

export function Feedback({ isCorrect, lastAction, correctAction }: FeedbackProps) {
  if (isCorrect === null || lastAction === null || correctAction === null) {
    return null;
  }

  return (
    <div
      className={`px-4 py-3 sm:px-6 sm:py-4 rounded-lg text-center font-bold text-sm sm:text-lg max-w-sm sm:max-w-none mx-auto ${
        isCorrect
          ? 'bg-green-900/50 border-2 border-green-500 text-green-300'
          : 'bg-red-900/50 border-2 border-red-500 text-red-300'
      }`}
    >
      {isCorrect ? (
        <div>
          <span className="text-xl sm:text-2xl">✓</span> Correct! {getActionName(lastAction)} was the right play.
        </div>
      ) : (
        <div>
          <span className="text-xl sm:text-2xl">✗</span> Incorrect. You chose {getActionName(lastAction)}, but correct was{' '}
          <span className="underline">{getActionName(correctAction)}</span>.
        </div>
      )}
    </div>
  );
}
