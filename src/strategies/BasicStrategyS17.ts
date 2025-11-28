import type { CasinoRules, Action as GameAction } from '../types';
import { BaseStrategy, type StrategyTable } from './BaseStrategy';
import { basicStrategy, type Action as ChartAction } from '../utils/blackjackBasicStrategy';

/**
 * Basic Strategy for multi-deck (4-8 decks) where dealer STANDS on soft 17 (S17)
 *
 * This is the most player-friendly common rule set.
 * Used in many Vegas casinos and is the "standard" basic strategy most people learn.
 */
export class BasicStrategyS17 extends BaseStrategy {
  name = 'Basic Strategy (S17)';
  description = 'Multi-deck basic strategy where dealer stands on soft 17. Most common favorable rules.';

  rules: CasinoRules = {
    numDecks: 6,
    dealerHitsSoft17: false,  // S17 - dealer stands on soft 17
    doubleAfterSplit: true,
    doubleOn: 'any',
    surrenderAllowed: false,
    shoeMode: 'standard',
  };

  /**
   * Convert chart action to game action
   * @param chartAction Action from the strategy chart (H, S, D, Ds, Y, N, Y_N, SUR, "")
   * @param dealerAfterSplit Whether double after split is allowed (for Y_N)
   * @param fallbackAction Fallback action if chart action doesn't result in split
   */
  private chartActionToGameAction(
    chartAction: ChartAction,
    doubleAfterSplit: boolean = true,
    fallbackAction?: GameAction
  ): GameAction | null {
    switch (chartAction) {
      case 'H': return 'hit';
      case 'S': return 'stand';
      case 'D': return 'double';
      case 'Ds': return 'double'; // Will be handled by BaseStrategy to fall back to stand if can't double
      case 'Y': return 'split';
      case 'N': return null; // Fall through to soft/hard strategy
      case 'Y_N': return doubleAfterSplit ? 'split' : null; // Split if DAS, otherwise fall through
      case 'SUR': return 'hit'; // Surrender not supported yet, default to hit
      case '': return fallbackAction || null;
      default: return null;
    }
  }

  /**
   * Get dealer upcard index for the chart (0-9 for dealer upcards 2-A)
   */
  private getDealerIndex(dealerValue: number): number {
    // dealerValue is 2-11 (11 for Ace)
    // Chart indices: 0=2, 1=3, 2=4, 3=5, 4=6, 5=7, 6=8, 7=9, 8=10, 9=A
    if (dealerValue === 11) return 9; // Ace
    return dealerValue - 2; // 2-10
  }

  // Hard totals: player hand value vs dealer upcard (2-11 for Ace)
  protected hardStrategy: StrategyTable = (() => {
    const table: StrategyTable = {};

    // Convert chart hard totals to strategy table
    for (const [totalStr, actions] of Object.entries(basicStrategy.hardTotals)) {
      const total = parseInt(totalStr);
      table[total] = {};

      for (let dealerValue = 2; dealerValue <= 11; dealerValue++) {
        const idx = this.getDealerIndex(dealerValue);
        const chartAction = actions[idx];
        const gameAction = this.chartActionToGameAction(chartAction);
        table[total][dealerValue] = gameAction || 'hit';
      }
    }

    // Add missing hard totals (4-7) that aren't in the chart - all hit
    for (let total = 4; total <= 7; total++) {
      if (!table[total]) {
        table[total] = {};
        for (let dealerValue = 2; dealerValue <= 11; dealerValue++) {
          table[total][dealerValue] = 'hit';
        }
      }
    }

    // Add higher totals (18-21) - all stand
    for (let total = 18; total <= 21; total++) {
      if (!table[total]) {
        table[total] = {};
        for (let dealerValue = 2; dealerValue <= 11; dealerValue++) {
          table[total][dealerValue] = 'stand';
        }
      }
    }

    return table;
  })();

  // Soft totals: player has ace counted as 11 (A,2 = soft 13, etc)
  protected softStrategy: StrategyTable = (() => {
    const table: StrategyTable = {};

    // Convert chart soft totals to strategy table
    // Chart uses "A,2" format, we use soft total (13 for A,2, 14 for A,3, etc.)
    const softHandMap: Record<string, number> = {
      'A,2': 13,
      'A,3': 14,
      'A,4': 15,
      'A,5': 16,
      'A,6': 17,
      'A,7': 18,
      'A,8': 19,
      'A,9': 20,
    };

    for (const [hand, total] of Object.entries(softHandMap)) {
      const actions = basicStrategy.softTotals[hand];
      if (!actions) continue;

      table[total] = {};
      for (let dealerValue = 2; dealerValue <= 11; dealerValue++) {
        const idx = this.getDealerIndex(dealerValue);
        const chartAction = actions[idx];
        const gameAction = this.chartActionToGameAction(chartAction);
        table[total][dealerValue] = gameAction || 'stand';
      }
    }

    // Add soft 21 - always stand
    table[21] = {};
    for (let dealerValue = 2; dealerValue <= 11; dealerValue++) {
      table[21][dealerValue] = 'stand';
    }

    return table;
  })();

  // Pairs: what card value the pair consists of (11 = Aces)
  protected pairStrategy: StrategyTable = (() => {
    const table: StrategyTable = {};

    // Map chart pair notation to card values
    const pairMap: Record<string, number> = {
      'A,A': 11,
      'T,T': 10,
      '9,9': 9,
      '8,8': 8,
      '7,7': 7,
      '6,6': 6,
      '5,5': 5,
      '4,4': 4,
      '3,3': 3,
      '2,2': 2,
    };

    for (const [pair, cardValue] of Object.entries(pairMap)) {
      const actions = basicStrategy.pairSplitting[pair];
      if (!actions) continue;

      table[cardValue] = {};
      for (let dealerValue = 2; dealerValue <= 11; dealerValue++) {
        const idx = this.getDealerIndex(dealerValue);
        const chartAction = actions[idx];
        const gameAction = this.chartActionToGameAction(chartAction, this.rules.doubleAfterSplit);

        // For pairs, if chart says don't split, we need to fall through to hard/soft
        // For now, use the hard total of the pair
        if (gameAction === null) {
          // Use hard strategy for the pair total
          const pairTotal = cardValue === 11 ? 12 : cardValue * 2;
          const hardAction = this.hardStrategy[pairTotal]?.[dealerValue];
          table[cardValue][dealerValue] = hardAction || 'hit';
        } else {
          table[cardValue][dealerValue] = gameAction;
        }
      }
    }

    return table;
  })();
}

// Export singleton instance for convenience
export const basicStrategyS17 = new BasicStrategyS17();
