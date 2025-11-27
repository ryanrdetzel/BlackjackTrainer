import type { Card, Action } from '../types';
import { getHandValue, getDealerUpCardValue, isPair, getCardValue } from './deck';

// Basic Strategy Chart
// H = Hit, S = Stand, D = Double (hit if not allowed), P = Split
// Based on standard 4-8 deck, dealer stands on soft 17

// Hard totals: player hand value (no usable ace) vs dealer upcard (2-11 for A)
const HARD_STRATEGY: Record<number, Record<number, Action>> = {
  // Player total: { dealerUpcard: action }
  4:  { 2: 'hit', 3: 'hit', 4: 'hit', 5: 'hit', 6: 'hit', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  5:  { 2: 'hit', 3: 'hit', 4: 'hit', 5: 'hit', 6: 'hit', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  6:  { 2: 'hit', 3: 'hit', 4: 'hit', 5: 'hit', 6: 'hit', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  7:  { 2: 'hit', 3: 'hit', 4: 'hit', 5: 'hit', 6: 'hit', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  8:  { 2: 'hit', 3: 'hit', 4: 'hit', 5: 'hit', 6: 'hit', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  9:  { 2: 'hit', 3: 'double', 4: 'double', 5: 'double', 6: 'double', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  10: { 2: 'double', 3: 'double', 4: 'double', 5: 'double', 6: 'double', 7: 'double', 8: 'double', 9: 'double', 10: 'hit', 11: 'hit' },
  11: { 2: 'double', 3: 'double', 4: 'double', 5: 'double', 6: 'double', 7: 'double', 8: 'double', 9: 'double', 10: 'double', 11: 'double' },
  12: { 2: 'hit', 3: 'hit', 4: 'stand', 5: 'stand', 6: 'stand', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  13: { 2: 'stand', 3: 'stand', 4: 'stand', 5: 'stand', 6: 'stand', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  14: { 2: 'stand', 3: 'stand', 4: 'stand', 5: 'stand', 6: 'stand', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  15: { 2: 'stand', 3: 'stand', 4: 'stand', 5: 'stand', 6: 'stand', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  16: { 2: 'stand', 3: 'stand', 4: 'stand', 5: 'stand', 6: 'stand', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  17: { 2: 'stand', 3: 'stand', 4: 'stand', 5: 'stand', 6: 'stand', 7: 'stand', 8: 'stand', 9: 'stand', 10: 'stand', 11: 'stand' },
  18: { 2: 'stand', 3: 'stand', 4: 'stand', 5: 'stand', 6: 'stand', 7: 'stand', 8: 'stand', 9: 'stand', 10: 'stand', 11: 'stand' },
  19: { 2: 'stand', 3: 'stand', 4: 'stand', 5: 'stand', 6: 'stand', 7: 'stand', 8: 'stand', 9: 'stand', 10: 'stand', 11: 'stand' },
  20: { 2: 'stand', 3: 'stand', 4: 'stand', 5: 'stand', 6: 'stand', 7: 'stand', 8: 'stand', 9: 'stand', 10: 'stand', 11: 'stand' },
  21: { 2: 'stand', 3: 'stand', 4: 'stand', 5: 'stand', 6: 'stand', 7: 'stand', 8: 'stand', 9: 'stand', 10: 'stand', 11: 'stand' },
};

// Soft totals: player has ace counted as 11 (A,2 = soft 13, etc)
const SOFT_STRATEGY: Record<number, Record<number, Action>> = {
  // Soft total: { dealerUpcard: action }
  13: { 2: 'hit', 3: 'hit', 4: 'hit', 5: 'double', 6: 'double', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  14: { 2: 'hit', 3: 'hit', 4: 'hit', 5: 'double', 6: 'double', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  15: { 2: 'hit', 3: 'hit', 4: 'double', 5: 'double', 6: 'double', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  16: { 2: 'hit', 3: 'hit', 4: 'double', 5: 'double', 6: 'double', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  17: { 2: 'hit', 3: 'double', 4: 'double', 5: 'double', 6: 'double', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  18: { 2: 'stand', 3: 'double', 4: 'double', 5: 'double', 6: 'double', 7: 'stand', 8: 'stand', 9: 'hit', 10: 'hit', 11: 'hit' },
  19: { 2: 'stand', 3: 'stand', 4: 'stand', 5: 'stand', 6: 'double', 7: 'stand', 8: 'stand', 9: 'stand', 10: 'stand', 11: 'stand' },
  20: { 2: 'stand', 3: 'stand', 4: 'stand', 5: 'stand', 6: 'stand', 7: 'stand', 8: 'stand', 9: 'stand', 10: 'stand', 11: 'stand' },
  21: { 2: 'stand', 3: 'stand', 4: 'stand', 5: 'stand', 6: 'stand', 7: 'stand', 8: 'stand', 9: 'stand', 10: 'stand', 11: 'stand' },
};

// Pairs: what card value the pair consists of
const PAIR_STRATEGY: Record<number, Record<number, Action>> = {
  // Pair value: { dealerUpcard: action }
  2:  { 2: 'split', 3: 'split', 4: 'split', 5: 'split', 6: 'split', 7: 'split', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  3:  { 2: 'split', 3: 'split', 4: 'split', 5: 'split', 6: 'split', 7: 'split', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  4:  { 2: 'hit', 3: 'hit', 4: 'hit', 5: 'split', 6: 'split', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  5:  { 2: 'double', 3: 'double', 4: 'double', 5: 'double', 6: 'double', 7: 'double', 8: 'double', 9: 'double', 10: 'hit', 11: 'hit' },
  6:  { 2: 'split', 3: 'split', 4: 'split', 5: 'split', 6: 'split', 7: 'hit', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  7:  { 2: 'split', 3: 'split', 4: 'split', 5: 'split', 6: 'split', 7: 'split', 8: 'hit', 9: 'hit', 10: 'hit', 11: 'hit' },
  8:  { 2: 'split', 3: 'split', 4: 'split', 5: 'split', 6: 'split', 7: 'split', 8: 'split', 9: 'split', 10: 'split', 11: 'split' },
  9:  { 2: 'split', 3: 'split', 4: 'split', 5: 'split', 6: 'split', 7: 'stand', 8: 'split', 9: 'split', 10: 'stand', 11: 'stand' },
  10: { 2: 'stand', 3: 'stand', 4: 'stand', 5: 'stand', 6: 'stand', 7: 'stand', 8: 'stand', 9: 'stand', 10: 'stand', 11: 'stand' },
  11: { 2: 'split', 3: 'split', 4: 'split', 5: 'split', 6: 'split', 7: 'split', 8: 'split', 9: 'split', 10: 'split', 11: 'split' }, // Aces
};

export function getCorrectAction(playerHand: Card[], dealerUpCard: Card, canDoubleDown: boolean = true): Action {
  const dealerValue = getDealerUpCardValue(dealerUpCard);
  const handValue = getHandValue(playerHand);

  // Check for pairs first (only on initial 2 cards)
  if (playerHand.length === 2 && isPair(playerHand)) {
    const pairValue = getCardValue(playerHand[0]);
    const pairAction = PAIR_STRATEGY[pairValue]?.[dealerValue];

    if (pairAction === 'split') {
      return 'split';
    }
    // If not splitting, fall through to soft/hard strategy
    if (pairAction === 'double' && canDoubleDown) {
      return 'double';
    }
    if (pairAction === 'double' && !canDoubleDown) {
      return 'hit';
    }
    // For pairs that recommend stand/hit, continue to check soft/hard
  }

  // Check for soft hands
  if (handValue.isSoft && handValue.value <= 21) {
    const softAction = SOFT_STRATEGY[handValue.value]?.[dealerValue];
    if (softAction) {
      if (softAction === 'double' && !canDoubleDown) {
        // If we can't double, check if we should hit or stand instead
        // For soft 18+, stand when doubling isn't available. For soft 17 or less, hit.
        if (handValue.value >= 18) return 'stand';
        return 'hit';
      }
      return softAction;
    }
  }

  // Hard hands
  const hardTotal = handValue.value;
  const hardAction = HARD_STRATEGY[hardTotal]?.[dealerValue];

  if (hardAction) {
    if (hardAction === 'double' && !canDoubleDown) {
      return 'hit';
    }
    return hardAction;
  }

  // Default fallback
  if (hardTotal >= 17) return 'stand';
  return 'hit';
}

export function getActionName(action: Action): string {
  switch (action) {
    case 'hit': return 'Hit';
    case 'stand': return 'Stand';
    case 'double': return 'Double Down';
    case 'split': return 'Split';
  }
}

export function getStrategyExplanation(
  playerHand: Card[],
  dealerUpCard: Card,
  correctAction: Action
): string {
  const handValue = getHandValue(playerHand);
  const dealerValue = getDealerUpCardValue(dealerUpCard);
  const dealerCardName = dealerUpCard.rank === 'A' ? 'Ace' : dealerUpCard.rank;
  const isPairHand = playerHand.length === 2 && isPair(playerHand);
  const pairValue = isPairHand ? getCardValue(playerHand[0]) : 0;
  const pairName = isPairHand ? (playerHand[0].rank === 'A' ? 'Aces' : `${playerHand[0].rank}s`) : '';

  // Pair explanations
  if (isPairHand && correctAction === 'split') {
    if (pairValue === 11) {
      return `Always split Aces. Each Ace gives you a strong starting point with a potential for 21, and playing two hands of Ace-X is far better than a single hand of 12.`;
    }
    if (pairValue === 8) {
      return `Always split 8s. A total of 16 is the worst hand in blackjack. Splitting gives you two chances to improve with a starting point of 8 each.`;
    }
    if (pairValue === 2 || pairValue === 3) {
      return `Split ${pairName} against a dealer ${dealerCardName}. The dealer's weak upcard (2-7) means they're likely to bust, and splitting gives you two chances to capitalize.`;
    }
    if (pairValue === 6) {
      return `Split 6s against a dealer ${dealerCardName}. With a weak dealer card, two hands starting at 6 have better odds than one hand of 12.`;
    }
    if (pairValue === 7) {
      return `Split 7s against a dealer ${dealerCardName}. Two potential 17s are better than one 14, especially against a weak dealer.`;
    }
    if (pairValue === 9) {
      return `Split 9s against a dealer ${dealerCardName}. While 18 is decent, two hands with 9 each can achieve 19 or better, and the dealer's card isn't strong enough to stand pat.`;
    }
    if (pairValue === 4) {
      return `Split 4s against a dealer ${dealerCardName}. Against dealer 5-6, you want to maximize your bet when the dealer is most likely to bust.`;
    }
  }

  // Don't split explanations
  if (isPairHand && correctAction !== 'split') {
    if (pairValue === 10) {
      return `Never split 10s. A total of 20 is an excellent hand that will win most of the time. Don't risk breaking it up.`;
    }
    if (pairValue === 5) {
      return `Never split 5s. Treat them as a hard 10 and ${correctAction === 'double' ? 'double down' : 'hit'}. A hard 10 is a strong starting point for doubling.`;
    }
  }

  // Soft hand explanations
  if (handValue.isSoft) {
    if (correctAction === 'double') {
      return `Double down on soft ${handValue.value} against dealer ${dealerCardName}. The dealer's weak card combined with your flexible ace means you should maximize your bet. You can't bust and might improve significantly.`;
    }
    if (correctAction === 'hit') {
      if (handValue.value <= 17) {
        return `Hit on soft ${handValue.value}. Your hand is too weak to stand, but the ace gives you flexibility. You can't bust on the next card, so try to improve.`;
      }
      if (dealerValue >= 9) {
        return `Hit on soft ${handValue.value} against dealer ${dealerCardName}. Against a strong dealer card (9, 10, A), soft 18 isn't strong enough to stand. Try to improve.`;
      }
      return `Hit on soft ${handValue.value} against dealer ${dealerCardName}. Try to improve your hand.`;
    }
    if (correctAction === 'stand') {
      return `Stand on soft ${handValue.value}. This is a strong enough total, and the risk of hitting and getting a worse hand outweighs the potential benefit.`;
    }
  }

  // Hard hand explanations
  if (correctAction === 'double') {
    if (handValue.value === 11) {
      return `Double down on 11. This is the best doubling hand in blackjack. You have the best chance of hitting 21 with any 10-value card.`;
    }
    if (handValue.value === 10) {
      return `Double down on 10 against dealer ${dealerCardName}. With a weak dealer showing and your strong total, maximize your bet. Any face card gives you 20.`;
    }
    if (handValue.value === 9) {
      return `Double down on 9 against dealer ${dealerCardName}. The dealer shows weakness (3-6), and any 10, J, Q, K, or A gives you 19-20.`;
    }
  }

  if (correctAction === 'stand') {
    if (handValue.value >= 17) {
      return `Stand on ${handValue.value}. With 17 or higher, the risk of busting is too great. Let the dealer take their chances.`;
    }
    if (handValue.value >= 13 && dealerValue <= 6) {
      return `Stand on ${handValue.value} against dealer ${dealerCardName}. The dealer has a "bust card" (2-6 showing) and must hit until 17. Let them take the risk of busting.`;
    }
    if (handValue.value === 12 && dealerValue >= 4 && dealerValue <= 6) {
      return `Stand on 12 against dealer ${dealerCardName}. Against dealer 4-6, even your weak 12 should stand. The dealer is very likely to bust with these cards.`;
    }
  }

  if (correctAction === 'hit') {
    if (handValue.value <= 11) {
      return `Hit on ${handValue.value}. You cannot bust, so always take a card to improve your hand.`;
    }
    if (handValue.value === 12 && (dealerValue <= 3 || dealerValue >= 7)) {
      return `Hit on 12 against dealer ${dealerCardName}. With only 4 cards that can bust you (10, J, Q, K), it's better to try to improve than stand on such a weak total against a strong dealer.`;
    }
    if (handValue.value >= 13 && handValue.value <= 16) {
      return `Hit on ${handValue.value} against dealer ${dealerCardName}. The dealer's strong card (7-A) means they'll likely make a hand of 17+. You need to take the risk and try to improve.`;
    }
  }

  // Generic fallback
  return `Basic strategy recommends ${getActionName(correctAction).toLowerCase()} with ${handValue.value} against dealer ${dealerCardName}.`;
}
