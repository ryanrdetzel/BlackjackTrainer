import type { Action } from '../types';

interface ControlsProps {
  onAction: (action: Action) => void;
  canDouble: boolean;
  canSplit: boolean;
  disabled: boolean;
}

export function Controls({ onAction, canDouble, canSplit, disabled }: ControlsProps) {
  return (
    <div className="grid grid-cols-4 gap-2 sm:flex sm:gap-3 sm:justify-center max-w-lg mx-auto">
      <button
        onClick={() => onAction('hit')}
        disabled={disabled}
        className="py-4 sm:px-6 sm:py-3 bg-green-600 hover:bg-green-700 active:bg-green-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-lg transition-colors shadow-lg"
      >
        Hit
      </button>
      <button
        onClick={() => onAction('stand')}
        disabled={disabled}
        className="py-4 sm:px-6 sm:py-3 bg-red-600 hover:bg-red-700 active:bg-red-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-lg transition-colors shadow-lg"
      >
        Stand
      </button>
      <button
        onClick={() => onAction('double')}
        disabled={disabled || !canDouble}
        className="py-4 sm:px-6 sm:py-3 bg-yellow-600 hover:bg-yellow-700 active:bg-yellow-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-lg transition-colors shadow-lg"
      >
        Double
      </button>
      <button
        onClick={() => onAction('split')}
        disabled={disabled || !canSplit}
        className="py-4 sm:px-6 sm:py-3 bg-purple-600 hover:bg-purple-700 active:bg-purple-800 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold text-sm sm:text-base rounded-xl sm:rounded-lg transition-colors shadow-lg"
      >
        Split
      </button>
    </div>
  );
}
