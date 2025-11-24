import { useState, useCallback } from 'react';
import type { Action, GameState } from '../types';
import { createShoe, getHandValue, canDouble, canSplit } from '../utils/deck';
import { getCorrectAction } from '../utils/strategy';

const INITIAL_STATS = { correct: 0, total: 0 };

function createInitialState(): GameState {
  return {
    deck: createShoe(6),
    playerHand: [],
    dealerHand: [],
    gamePhase: 'betting',
    lastAction: null,
    correctAction: null,
    isCorrect: null,
    stats: INITIAL_STATS,
  };
}

export function useGame() {
  const [state, setState] = useState<GameState>(createInitialState);

  const dealNewHand = useCallback(() => {
    setState((prev) => {
      let deck = prev.deck.length < 20 ? createShoe(6) : prev.deck;

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
      };
    });
  }, []);

  const makeAction = useCallback((action: Action) => {
    setState((prev) => {
      if (prev.gamePhase !== 'playing') return prev;

      const dealerUpCard = prev.dealerHand[0];
      const canDoubleDown = canDouble(prev.playerHand);
      const correctAction = getCorrectAction(prev.playerHand, dealerUpCard, canDoubleDown);
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
        stats: newStats,
      };
    });
  }, []);

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
    dealNewHand,
    makeAction,
    resetStats,
    playerHandValue,
    dealerUpCardValue,
    canDoubleDown: canDouble(state.playerHand),
    canSplitHand: canSplit(state.playerHand),
  };
}
