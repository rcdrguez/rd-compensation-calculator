import type { RDConfig } from '../types';

export function computeISR(annualTaxable: number, config: RDConfig): number {
  const bracket = config.isrBrackets.find((item) => annualTaxable >= item.from && (item.to === null || annualTaxable <= item.to));
  if (!bracket) return 0;
  return Math.max(0, bracket.fixedFee + (annualTaxable - bracket.from) * bracket.rate);
}
