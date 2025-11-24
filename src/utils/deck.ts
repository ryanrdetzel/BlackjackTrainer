import type { Card, Suit, Rank, HandValue } from '../types';

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

export function createShoe(numDecks: number = 6): Card[] {
  const shoe: Card[] = [];
  for (let i = 0; i < numDecks; i++) {
    shoe.push(...createDeck());
  }
  return shuffleDeck(shoe);
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
