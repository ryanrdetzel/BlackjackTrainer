import type { Action } from '../types';

interface ControlsProps {
  onAction: (action: Action) => void;
  canDouble: boolean;
  canSplit: boolean;
  disabled: boolean;
}

export function Controls({ onAction, canDouble, canSplit, disabled }: ControlsProps) {
  return (
    <div className="flex gap-3 flex-wrap justify-center">
      <button
        onClick={() => onAction('hit')}
        disabled={disabled}
        className="px-6 py-3 bg-green-600 hover:bg-green-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-lg"
      >
        Hit
      </button>
      <button
        onClick={() => onAction('stand')}
        disabled={disabled}
        className="px-6 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-lg"
      >
        Stand
      </button>
      <button
        onClick={() => onAction('double')}
        disabled={disabled || !canDouble}
        className="px-6 py-3 bg-yellow-600 hover:bg-yellow-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-lg"
      >
        Double
      </button>
      <button
        onClick={() => onAction('split')}
        disabled={disabled || !canSplit}
        className="px-6 py-3 bg-purple-600 hover:bg-purple-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors shadow-lg"
      >
        Split
      </button>
    </div>
  );
}
