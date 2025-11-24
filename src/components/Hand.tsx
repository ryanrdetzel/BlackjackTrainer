import type { Card as CardType } from '../types';
import { Card } from './Card';
import { getHandValue } from '../utils/deck';

interface HandProps {
  cards: CardType[];
  label: string;
  hideSecondCard?: boolean;
  showValue?: boolean;
}

export function Hand({ cards, label, hideSecondCard = false, showValue = true }: HandProps) {
  const handValue = getHandValue(hideSecondCard ? [cards[0]] : cards);
  const displayValue = hideSecondCard ? getHandValue([cards[0]]) : handValue;

  return (
    <div className="flex flex-col items-center gap-2">
      <div className="text-gray-300 text-sm font-medium">
        {label}
        {showValue && cards.length > 0 && (
          <span className="ml-2 text-white font-bold">
            ({displayValue.isSoft && displayValue.value <= 21 ? 'Soft ' : ''}{displayValue.value})
          </span>
        )}
      </div>
      <div className="flex gap-2">
        {cards.map((card, index) => (
          <Card
            key={`${card.suit}-${card.rank}-${index}`}
            card={card}
            hidden={hideSecondCard && index === 1}
          />
        ))}
      </div>
    </div>
  );
}
