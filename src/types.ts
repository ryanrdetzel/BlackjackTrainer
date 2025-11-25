export type Suit = 'hearts' | 'diamonds' | 'clubs' | 'spades';
export type Rank = 'A' | '2' | '3' | '4' | '5' | '6' | '7' | '8' | '9' | '10' | 'J' | 'Q' | 'K';

export interface Card {
  suit: Suit;
  rank: Rank;
}

export type Action = 'hit' | 'stand' | 'double' | 'split';

export interface GameState {
  deck: Card[];
  playerHand: Card[];
  dealerHand: Card[];
  gamePhase: 'betting' | 'playing' | 'result';
  lastAction: Action | null;
  correctAction: Action | null;
  isCorrect: boolean | null;
  originalPlayerHand: Card[] | null; // Hand before action was taken (for feedback display)
  stats: {
    correct: number;
    total: number;
  };
}

export interface HandValue {
  value: number;
  isSoft: boolean;
}

// Casino rule configurations that affect basic strategy
export interface CasinoRules {
  numDecks: 1 | 2 | 4 | 6 | 8;
  dealerHitsSoft17: boolean;  // H17 (true) vs S17 (false)
  doubleAfterSplit: boolean;
  doubleOn: 'any' | '9-11' | '10-11';
  surrenderAllowed: boolean;
}

// Strategy provider interface for swappable strategies
export interface StrategyProvider {
  name: string;
  description: string;
  rules: CasinoRules;
  getAction(
    playerHand: Card[],
    dealerUpCard: Card,
    canDoubleDown: boolean,
    canSplit: boolean
  ): Action;
  getExplanation(
    playerHand: Card[],
    dealerUpCard: Card,
    correctAction: Action
  ): string;
}

// Default casino rules (most common Vegas rules)
export const DEFAULT_CASINO_RULES: CasinoRules = {
  numDecks: 6,
  dealerHitsSoft17: false,  // S17 - dealer stands on soft 17
  doubleAfterSplit: true,
  doubleOn: 'any',
  surrenderAllowed: false,
};

// Mistake tracking for incorrect decisions
export interface Mistake {
  id: string;
  timestamp: number;
  playerHand: Card[];
  dealerUpCard: Card;
  actionTaken: Action;
  correctAction: Action;
}
