import type { Card as CardType } from '../types';

interface CardProps {
  card: CardType;
  hidden?: boolean;
}

const SUIT_SYMBOLS: Record<CardType['suit'], string> = {
  hearts: '♥',
  diamonds: '♦',
  clubs: '♣',
  spades: '♠',
};

const SUIT_COLORS: Record<CardType['suit'], string> = {
  hearts: 'text-red-600',
  diamonds: 'text-red-600',
  clubs: 'text-gray-900',
  spades: 'text-gray-900',
};

export function Card({ card, hidden = false }: CardProps) {
  if (hidden) {
    return (
      <div className="w-20 h-28 bg-blue-700 rounded-lg border-2 border-blue-900 shadow-lg flex items-center justify-center">
        <div className="w-14 h-22 bg-blue-600 rounded border border-blue-800 flex items-center justify-center">
          <span className="text-blue-400 text-2xl">?</span>
        </div>
      </div>
    );
  }

  const suitSymbol = SUIT_SYMBOLS[card.suit];
  const colorClass = SUIT_COLORS[card.suit];

  return (
    <div className="w-20 h-28 bg-white rounded-lg border-2 border-gray-300 shadow-lg flex flex-col p-1.5 relative">
      <div className={`text-sm font-bold ${colorClass} leading-none`}>
        {card.rank}
      </div>
      <div className={`text-xs ${colorClass} leading-none`}>
        {suitSymbol}
      </div>
      <div className={`absolute inset-0 flex items-center justify-center text-3xl ${colorClass}`}>
        {suitSymbol}
      </div>
      <div className={`absolute bottom-1.5 right-1.5 text-sm font-bold ${colorClass} leading-none rotate-180`}>
        {card.rank}
      </div>
    </div>
  );
}
