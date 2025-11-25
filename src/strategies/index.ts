// Strategy exports
export { BaseStrategy, type StrategyTable } from './BaseStrategy';
export { BasicStrategyS17, basicStrategyS17 } from './BasicStrategyS17';
export { BasicStrategyH17, basicStrategyH17 } from './BasicStrategyH17';

import type { CasinoRules, StrategyProvider } from '../types';
import { basicStrategyS17 } from './BasicStrategyS17';
import { basicStrategyH17 } from './BasicStrategyH17';

// All available strategies
export const availableStrategies: StrategyProvider[] = [
  basicStrategyS17,
  basicStrategyH17,
];

// Default strategy (S17 is most common player-friendly rule)
export const defaultStrategy: StrategyProvider = basicStrategyS17;

/**
 * Get a strategy provider based on casino rules
 * Currently selects based on the H17/S17 rule, which has the biggest impact
 */
export function getStrategyForRules(rules: Partial<CasinoRules>): StrategyProvider {
  if (rules.dealerHitsSoft17) {
    return basicStrategyH17;
  }
  return basicStrategyS17;
}

/**
 * Get a strategy provider by name
 */
export function getStrategyByName(name: string): StrategyProvider | undefined {
  return availableStrategies.find(s => s.name === name);
}

/**
 * Get a list of strategy names for UI selection
 */
export function getStrategyNames(): string[] {
  return availableStrategies.map(s => s.name);
}
