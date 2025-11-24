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
  18: { 2: 'double', 3: 'double', 4: 'double', 5: 'double', 6: 'double', 7: 'stand', 8: 'stand', 9: 'hit', 10: 'hit', 11: 'hit' },
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
        // For soft hands, if double is recommended but not available, usually hit
        if (handValue.value >= 19) return 'stand';
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
