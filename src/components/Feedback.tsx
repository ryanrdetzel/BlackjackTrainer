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
      className={`px-6 py-4 rounded-lg text-center font-bold text-lg ${
        isCorrect
          ? 'bg-green-900/50 border-2 border-green-500 text-green-300'
          : 'bg-red-900/50 border-2 border-red-500 text-red-300'
      }`}
    >
      {isCorrect ? (
        <div>
          <span className="text-2xl">✓</span> Correct! {getActionName(lastAction)} was the right play.
        </div>
      ) : (
        <div>
          <span className="text-2xl">✗</span> Incorrect. You chose {getActionName(lastAction)}, but the correct play was{' '}
          <span className="underline">{getActionName(correctAction)}</span>.
        </div>
      )}
    </div>
  );
}
