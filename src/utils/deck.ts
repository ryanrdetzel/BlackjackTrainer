import type { Card, Suit, Rank, HandValue, ShoeMode, Mistake } from '../types';

const SUITS: Suit[] = ['hearts', 'diamonds', 'clubs', 'spades'];
const RANKS: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9', '10', 'J', 'Q', 'K'];

export function createDeck(): Card[] {
  const deck: Card[] = [];
  for (const suit of SUITS) {
    for (const rank of RANKS) {
      deck.push({ suit, rank });
    }
  }
  return deck;
}

// Load mistakes from localStorage for wrong-history mode
function loadMistakes(): Mistake[] {
  try {
    const stored = localStorage.getItem('blackjack-trainer-mistakes');
    if (stored) {
      return JSON.parse(stored);
    }
  } catch (e) {
    console.error('Failed to load mistakes:', e);
  }
  return [];
}

// Standard shoe creation
function createStandardShoe(numDecks: number): Card[] {
  const shoe: Card[] = [];
  for (let i = 0; i < numDecks; i++) {
    shoe.push(...createDeck());
  }
  return shuffleDeck(shoe);
}

// No 10s mode - removes all 10-value cards (10, J, Q, K)
function createNoTensShoe(numDecks: number): Card[] {
  const shoe: Card[] = [];
  const filteredRanks: Rank[] = ['A', '2', '3', '4', '5', '6', '7', '8', '9'];

  for (let i = 0; i < numDecks; i++) {
    for (const suit of SUITS) {
      for (const rank of filteredRanks) {
        shoe.push({ suit, rank });
      }
    }
  }
  return shuffleDeck(shoe);
}

// Wrong history mode - creates hands based on mistakes
function createWrongHistoryShoe(numDecks: number): Card[] {
  const mistakes = loadMistakes();

  if (mistakes.length === 0) {
    // Fall back to standard shoe if no mistakes
    return createStandardShoe(numDecks);
  }

  // Extract unique cards from mistakes to bias the deck
  const mistakeCards: Card[] = [];
  mistakes.forEach(mistake => {
    mistakeCards.push(...mistake.playerHand);
    mistakeCards.push(mistake.dealerUpCard);
  });

  // Create a shoe with extra copies of mistake-related cards
  const shoe: Card[] = [];
  for (let i = 0; i < numDecks; i++) {
    shoe.push(...createDeck());
  }

  // Add extra copies of cards from mistakes (3x frequency)
  mistakeCards.forEach(card => {
    for (let i = 0; i < 3; i++) {
      shoe.push({ ...card });
    }
  });

  return shuffleDeck(shoe);
}

// Soft-heavy mode - more Aces for soft hand practice
function createSoftHeavyShoe(numDecks: number): Card[] {
  const shoe: Card[] = [];

  for (let i = 0; i < numDecks; i++) {
    shoe.push(...createDeck());
  }

  // Add 4x more Aces
  for (let i = 0; i < numDecks * 4; i++) {
    for (const suit of SUITS) {
      shoe.push({ suit, rank: 'A' });
    }
  }

  return shuffleDeck(shoe);
}

// Splits mode - more pairs for split practice
function createSplitsShoe(numDecks: number): Card[] {
  const shoe: Card[] = [];

  for (let i = 0; i < numDecks; i++) {
    shoe.push(...createDeck());
  }

  // Add 3x more of each rank to increase pair probability
  for (let i = 0; i < numDecks * 3; i++) {
    for (const rank of RANKS) {
      for (const suit of SUITS) {
        shoe.push({ suit, rank });
      }
    }
  }

  return shuffleDeck(shoe);
}

// Hard 12-16 mode - focus on hard 12-16 totals
function createHard1216Shoe(numDecks: number): Card[] {
  const shoe: Card[] = [];

  // Base deck
  for (let i = 0; i < numDecks; i++) {
    shoe.push(...createDeck());
  }

  // Add more cards that create 12-16 totals
  // 10 + 2-6, or 5-9 + 7-9, or 4-8 + 4-8
  const hardCards: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];
  for (let i = 0; i < numDecks * 3; i++) {
    for (const rank of hardCards) {
      for (const suit of SUITS) {
        shoe.push({ suit, rank });
      }
    }
  }

  return shuffleDeck(shoe);
}

// Dealer Ace/10 mode - more dealer Ace or 10
function createDealerAceTenShoe(numDecks: number): Card[] {
  const shoe: Card[] = [];

  for (let i = 0; i < numDecks; i++) {
    shoe.push(...createDeck());
  }

  // Add 4x more Aces and 10-value cards
  const dealerCards: Rank[] = ['A', '10', 'J', 'Q', 'K'];
  for (let i = 0; i < numDecks * 4; i++) {
    for (const rank of dealerCards) {
      for (const suit of SUITS) {
        shoe.push({ suit, rank });
      }
    }
  }

  return shuffleDeck(shoe);
}

// Doubling mode - focus on 9, 10, 11 totals
function createDoublingShoe(numDecks: number): Card[] {
  const shoe: Card[] = [];

  for (let i = 0; i < numDecks; i++) {
    shoe.push(...createDeck());
  }

  // Add more cards that create 9, 10, 11
  // 9: 2-7, 3-6, 4-5
  // 10: 2-8, 3-7, 4-6
  // 11: 2-9, 3-8, 4-7, 5-6
  const doublingCards: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9'];
  for (let i = 0; i < numDecks * 4; i++) {
    for (const rank of doublingCards) {
      for (const suit of SUITS) {
        shoe.push({ suit, rank });
      }
    }
  }

  return shuffleDeck(shoe);
}

// Stiff hands mode - hard 12-16 vs dealer 2-6
function createStiffHandsShoe(numDecks: number): Card[] {
  const shoe: Card[] = [];

  for (let i = 0; i < numDecks; i++) {
    shoe.push(...createDeck());
  }

  // Add more low cards (2-6 for dealer) and mid cards (for player 12-16)
  const stiffCards: Rank[] = ['2', '3', '4', '5', '6', '7', '8', '9', '10'];
  for (let i = 0; i < numDecks * 4; i++) {
    for (const rank of stiffCards) {
      for (const suit of SUITS) {
        shoe.push({ suit, rank });
      }
    }
  }

  return shuffleDeck(shoe);
}

// Main shoe creation function with mode support
export function createShoe(numDecks: number = 6, mode: ShoeMode = 'standard'): Card[] {
  switch (mode) {
    case 'no-tens':
      return createNoTensShoe(numDecks);
    case 'wrong-history':
      return createWrongHistoryShoe(numDecks);
    case 'soft-heavy':
      return createSoftHeavyShoe(numDecks);
    case 'splits':
      return createSplitsShoe(numDecks);
    case 'hard-12-16':
      return createHard1216Shoe(numDecks);
    case 'dealer-ace-ten':
      return createDealerAceTenShoe(numDecks);
    case 'doubling':
      return createDoublingShoe(numDecks);
    case 'stiff-hands':
      return createStiffHandsShoe(numDecks);
    case 'standard':
    default:
      return createStandardShoe(numDecks);
  }
}

export function shuffleDeck(deck: Card[]): Card[] {
  const shuffled = [...deck];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }
  return shuffled;
}

export function getCardValue(card: Card): number {
  if (card.rank === 'A') return 11;
  if (['K', 'Q', 'J'].includes(card.rank)) return 10;
  return parseInt(card.rank);
}

export function getHandValue(hand: Card[]): HandValue {
  let value = 0;
  let aces = 0;

  for (const card of hand) {
    if (card.rank === 'A') {
      aces++;
      value += 11;
    } else if (['K', 'Q', 'J'].includes(card.rank)) {
      value += 10;
    } else {
      value += parseInt(card.rank);
    }
  }

  let softAces = aces;
  while (value > 21 && softAces > 0) {
    value -= 10;
    softAces--;
  }

  return {
    value,
    isSoft: softAces > 0,
  };
}

export function getDealerUpCardValue(card: Card): number {
  if (card.rank === 'A') return 11;
  if (['K', 'Q', 'J', '10'].includes(card.rank)) return 10;
  return parseInt(card.rank);
}

export function isPair(hand: Card[]): boolean {
  if (hand.length !== 2) return false;
  const v1 = getCardValue(hand[0]);
  const v2 = getCardValue(hand[1]);
  return v1 === v2;
}

export function canSplit(hand: Card[]): boolean {
  return isPair(hand);
}

export function canDouble(hand: Card[]): boolean {
  return hand.length === 2;
}
