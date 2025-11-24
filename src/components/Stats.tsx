interface StatsProps {
  correct: number;
  total: number;
  onReset: () => void;
}

export function Stats({ correct, total, onReset }: StatsProps) {
  const percentage = total > 0 ? Math.round((correct / total) * 100) : 0;

  return (
    <div className="flex items-center gap-4 text-gray-300">
      <div className="text-sm">
        <span className="font-bold text-white">{correct}</span>/{total} correct
        {total > 0 && (
          <span className={`ml-2 font-bold ${percentage >= 80 ? 'text-green-400' : percentage >= 60 ? 'text-yellow-400' : 'text-red-400'}`}>
            ({percentage}%)
          </span>
        )}
      </div>
      {total > 0 && (
        <button
          onClick={onReset}
          className="text-xs px-2 py-1 bg-gray-700 hover:bg-gray-600 rounded transition-colors"
        >
          Reset
        </button>
      )}
    </div>
  );
}
