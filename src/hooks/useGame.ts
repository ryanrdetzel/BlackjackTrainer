import { useState, useCallback, useMemo } from 'react';
import type { Action, GameState, CasinoRules } from '../types';
import { DEFAULT_CASINO_RULES } from '../types';
import { createShoe, getHandValue, canDouble, canSplit } from '../utils/deck';
import { getStrategyForRules } from '../strategies';

const INITIAL_STATS = { correct: 0, total: 0 };

function createInitialState(numDecks: number): GameState {
  return {
    deck: createShoe(numDecks),
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
  const [state, setState] = useState<GameState>(() => createInitialState(rules.numDecks));

  // Get the appropriate strategy based on the rules
  const strategy = useMemo(() => getStrategyForRules(rules), [rules]);

  const dealNewHand = useCallback(() => {
    setState((prev) => {
      const deck = prev.deck.length < 20 ? createShoe(rules.numDecks) : prev.deck;

      const [playerCard1, deck1] = [deck[0], deck.slice(1)];
      const [dealerCard1, deck2] = [deck1[0], deck1.slice(1)];
      const [playerCard2, deck3] = [deck2[0], deck2.slice(1)];
      const [dealerCard2, deck4] = [deck3[0], deck3.slice(1)];

      const playerHand = [playerCard1, playerCard2];
      const dealerHand = [dealerCard1, dealerCard2];

      // Check for blackjack
      const playerValue = getHandValue(playerHand);
      if (playerValue.value === 21) {
        // Player has blackjack, deal a new hand
        return {
          ...prev,
          deck: deck4,
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
        deck: deck4,
        playerHand,
        dealerHand,
        gamePhase: 'playing',
        lastAction: null,
        correctAction: null,
        isCorrect: null,
        originalPlayerHand: null,
      };
    });
  }, [rules.numDecks]);

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
