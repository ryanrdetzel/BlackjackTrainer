import { useState, useCallback, useMemo } from 'react';
import type { Action, GameState, CasinoRules } from '../types';
import { DEFAULT_CASINO_RULES } from '../types';
import { createShoe, getHandValue, canDouble, canSplit, isPair, getCardValue } from '../utils/deck';
import type { Card, ShoeMode, Mistake } from '../types';

// Load mistakes from localStorage for wrong-history mode validation
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

// Check if the dealt hand matches the criteria for the current practice mode
function isValidHandForMode(
  playerHand: Card[],
  dealerHand: Card[],
  mode: ShoeMode
): boolean {
  const playerValue = getHandValue(playerHand);
  const dealerUpCardValue = getCardValue(dealerHand[0]);

  switch (mode) {
    case 'splits':
      // Require a pair
      return isPair(playerHand);

    case 'soft-heavy':
      // Require a soft hand (Ace counting as 11)
      return playerValue.isSoft && playerValue.value < 21;

    case 'hard-12-16':
      // Require hard total between 12-16
      return !playerValue.isSoft && playerValue.value >= 12 && playerValue.value <= 16;

    case 'dealer-ace-ten':
      // Require dealer showing Ace or 10-value card
      return dealerUpCardValue === 11 || dealerUpCardValue === 10;

    case 'doubling':
      // Require player total of 9, 10, or 11
      return playerValue.value >= 9 && playerValue.value <= 11;

    case 'stiff-hands':
      // Require hard 12-16 AND dealer showing 2-6
      return !playerValue.isSoft &&
        playerValue.value >= 12 &&
        playerValue.value <= 16 &&
        dealerUpCardValue >= 2 &&
        dealerUpCardValue <= 6;

    case 'wrong-history': {
      // Check if this hand matches any recorded mistake scenario
      const mistakes = loadMistakes();
      if (mistakes.length === 0) return true; // Fall back to accepting any hand

      // Check if current hand matches any mistake scenario
      return mistakes.some(mistake => {
        const mistakePlayerValue = getHandValue(mistake.playerHand);
        const mistakeDealerValue = getCardValue(mistake.dealerUpCard);

        // Match by hand value and soft/hard status, plus dealer upcard value
        return playerValue.value === mistakePlayerValue.value &&
          playerValue.isSoft === mistakePlayerValue.isSoft &&
          dealerUpCardValue === mistakeDealerValue;
      });
    }

    case 'standard':
    case 'no-tens':
    default:
      // No filtering needed for these modes
      return true;
  }
}
import { getStrategyForRules } from '../strategies';

const INITIAL_STATS = { correct: 0, total: 0 };

function createInitialState(rules: CasinoRules): GameState {
  return {
    deck: createShoe(rules.numDecks, rules.shoeMode),
    playerHand: [],
    dealerHand: [],
    gamePhase: 'betting',
    lastAction: null,
    correctAction: null,
    isCorrect: null,
    originalPlayerHand: null,
    stats: INITIAL_STATS,
  };
}

export function useGame(rules: CasinoRules = DEFAULT_CASINO_RULES) {
  const [state, setState] = useState<GameState>(() => createInitialState(rules));

  // Get the appropriate strategy based on the rules
  const strategy = useMemo(() => getStrategyForRules(rules), [rules]);

  const dealNewHand = useCallback(() => {
    setState((prev) => {
      let deck = prev.deck.length < 20 ? createShoe(rules.numDecks, rules.shoeMode) : prev.deck;

      // For splits mode, we need to find a pair for the player
      // Try up to 50 times to find a valid hand, then give up and use what we have
      let playerHand;
      let dealerHand;
      let remainingDeck = deck;
      let attempts = 0;
      const maxAttempts = 50;

      do {
        // Ensure we have enough cards
        if (remainingDeck.length < 4) {
          remainingDeck = createShoe(rules.numDecks, rules.shoeMode);
        }

        const [playerCard1, deck1] = [remainingDeck[0], remainingDeck.slice(1)];
        const [dealerCard1, deck2] = [deck1[0], deck1.slice(1)];
        const [playerCard2, deck3] = [deck2[0], deck2.slice(1)];
        const [dealerCard2, deck4] = [deck3[0], deck3.slice(1)];

        playerHand = [playerCard1, playerCard2];
        dealerHand = [dealerCard1, dealerCard2];
        remainingDeck = deck4;
        attempts++;

        // Check if hand is valid for the current practice mode
        if (!isValidHandForMode(playerHand, dealerHand, rules.shoeMode) && attempts < maxAttempts) {
          continue;
        }

        break;
      } while (attempts < maxAttempts);

      // Check for blackjack
      const playerValue = getHandValue(playerHand);
      if (playerValue.value === 21) {
        // Player has blackjack, deal a new hand
        return {
          ...prev,
          deck: remainingDeck,
          playerHand,
          dealerHand,
          gamePhase: 'result',
          lastAction: null,
          correctAction: null,
          isCorrect: null,
          originalPlayerHand: null,
        };
      }

      return {
        ...prev,
        deck: remainingDeck,
        playerHand,
        dealerHand,
        gamePhase: 'playing',
        lastAction: null,
        correctAction: null,
        isCorrect: null,
        originalPlayerHand: null,
      };
    });
  }, [rules.numDecks, rules.shoeMode]);

  // Check if doubling is allowed based on rules and hand value
  const canDoubleWithRules = useCallback((hand: typeof state.playerHand): boolean => {
    if (!canDouble(hand)) return false;

    const handValue = getHandValue(hand);
    const total = handValue.value;

    switch (rules.doubleOn) {
      case '9-11':
        return total >= 9 && total <= 11;
      case '10-11':
        return total >= 10 && total <= 11;
      case 'any':
      default:
        return true;
    }
  }, [rules.doubleOn]);

  const makeAction = useCallback((action: Action) => {
    setState((prev) => {
      if (prev.gamePhase !== 'playing') return prev;

      const dealerUpCard = prev.dealerHand[0];
      const canDoubleDown = canDoubleWithRules(prev.playerHand);
      const canSplitHand = canSplit(prev.playerHand);
      const correctAction = strategy.getAction(prev.playerHand, dealerUpCard, canDoubleDown, canSplitHand);
      const isCorrect = action === correctAction;

      // Update stats
      const newStats = {
        correct: prev.stats.correct + (isCorrect ? 1 : 0),
        total: prev.stats.total + 1,
      };

      // Handle the action
      let newPlayerHand = [...prev.playerHand];
      let newDeck = prev.deck;
      let newPhase: GameState['gamePhase'] = 'result';

      if (action === 'hit') {
        const [newCard, remainingDeck] = [newDeck[0], newDeck.slice(1)];
        newPlayerHand = [...newPlayerHand, newCard];
        newDeck = remainingDeck;

        const handValue = getHandValue(newPlayerHand);
        if (handValue.value < 21) {
          newPhase = 'playing';
        }
      } else if (action === 'double') {
        const [newCard, remainingDeck] = [newDeck[0], newDeck.slice(1)];
        newPlayerHand = [...newPlayerHand, newCard];
        newDeck = remainingDeck;
        newPhase = 'result';
      } else if (action === 'split') {
        // For simplicity, we'll just show the result and move to next hand
        // Full split handling would be more complex
        newPhase = 'result';
      }
      // Stand just ends the hand

      return {
        ...prev,
        deck: newDeck,
        playerHand: newPlayerHand,
        gamePhase: newPhase,
        lastAction: action,
        correctAction,
        isCorrect,
        originalPlayerHand: prev.playerHand,
        stats: newStats,
      };
    });
  }, [strategy, canDoubleWithRules]);

  const resetStats = useCallback(() => {
    setState((prev) => ({
      ...prev,
      stats: INITIAL_STATS,
    }));
  }, []);

  const playerHandValue = getHandValue(state.playerHand);
  const dealerUpCardValue = state.dealerHand[0] ? getHandValue([state.dealerHand[0]]) : null;

  return {
    state,
    strategy,
    rules,
    dealNewHand,
    makeAction,
    resetStats,
    playerHandValue,
    dealerUpCardValue,
    canDoubleDown: canDoubleWithRules(state.playerHand),
    canSplitHand: canSplit(state.playerHand),
  };
}
