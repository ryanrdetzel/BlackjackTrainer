import type { CasinoRules } from '../types';

interface SettingsModalProps {
  isOpen: boolean;
  onClose: () => void;
  settings: CasinoRules;
  onUpdateSettings: (updates: Partial<CasinoRules>) => void;
  onResetSettings: () => void;
}

export function SettingsModal({
  isOpen,
  onClose,
  settings,
  onUpdateSettings,
  onResetSettings,
}: SettingsModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-black/70"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-gray-900 rounded-xl shadow-2xl w-full max-w-md max-h-[90vh] overflow-y-auto border border-gray-700">
        {/* Header */}
        <div className="sticky top-0 bg-gray-900 px-4 py-3 border-b border-gray-700 flex justify-between items-center">
          <h2 className="text-lg font-bold text-white">Table Rules</h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white transition-colors p-1"
            aria-label="Close settings"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-4 space-y-5">
          {/* Dealer Soft 17 */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Dealer on Soft 17
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateSettings({ dealerHitsSoft17: false })}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                  !settings.dealerHitsSoft17
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Stands (S17)
              </button>
              <button
                onClick={() => onUpdateSettings({ dealerHitsSoft17: true })}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                  settings.dealerHitsSoft17
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Hits (H17)
              </button>
            </div>
            <p className="text-xs text-gray-500">
              H17 gives the house ~0.2% more edge
            </p>
          </div>

          {/* Number of Decks */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Number of Decks
            </label>
            <div className="flex gap-2">
              {([1, 2, 4, 6, 8] as const).map((num) => (
                <button
                  key={num}
                  onClick={() => onUpdateSettings({ numDecks: num })}
                  className={`flex-1 py-2 px-2 rounded-lg font-medium transition-colors ${
                    settings.numDecks === num
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {num}
                </button>
              ))}
            </div>
          </div>

          {/* Double After Split */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Double After Split (DAS)
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateSettings({ doubleAfterSplit: true })}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                  settings.doubleAfterSplit
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Allowed
              </button>
              <button
                onClick={() => onUpdateSettings({ doubleAfterSplit: false })}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                  !settings.doubleAfterSplit
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Not Allowed
              </button>
            </div>
          </div>

          {/* Double On */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Double Down On
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateSettings({ doubleOn: 'any' })}
                className={`flex-1 py-2 px-2 rounded-lg font-medium transition-colors text-sm ${
                  settings.doubleOn === 'any'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Any
              </button>
              <button
                onClick={() => onUpdateSettings({ doubleOn: '9-11' })}
                className={`flex-1 py-2 px-2 rounded-lg font-medium transition-colors text-sm ${
                  settings.doubleOn === '9-11'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                9-11
              </button>
              <button
                onClick={() => onUpdateSettings({ doubleOn: '10-11' })}
                className={`flex-1 py-2 px-2 rounded-lg font-medium transition-colors text-sm ${
                  settings.doubleOn === '10-11'
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                10-11
              </button>
            </div>
          </div>

          {/* Surrender */}
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-300">
              Surrender
            </label>
            <div className="flex gap-2">
              <button
                onClick={() => onUpdateSettings({ surrenderAllowed: true })}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                  settings.surrenderAllowed
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Allowed
              </button>
              <button
                onClick={() => onUpdateSettings({ surrenderAllowed: false })}
                className={`flex-1 py-2 px-3 rounded-lg font-medium transition-colors ${
                  !settings.surrenderAllowed
                    ? 'bg-blue-600 text-white'
                    : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                }`}
              >
                Not Allowed
              </button>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="sticky bottom-0 bg-gray-900 px-4 py-3 border-t border-gray-700 flex justify-between">
          <button
            onClick={onResetSettings}
            className="px-4 py-2 text-sm font-medium text-gray-400 hover:text-white transition-colors"
          >
            Reset to Defaults
          </button>
          <button
            onClick={onClose}
            className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
}
