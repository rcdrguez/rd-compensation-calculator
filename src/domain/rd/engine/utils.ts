import type { CompensationItem } from '../types';

export function resolveItemAmount(item: CompensationItem, monthlySalary: number, tenureMonths: number): number {
  const tier = item.tiers?.slice().sort((a, b) => b.minMonths - a.minMonths).find((candidate) => tenureMonths >= candidate.minMonths);
  const amount = tier?.amount ?? item.amount ?? 0;
  const multiplier = tier?.multiplier ?? item.multiplier ?? 0;
  const percent = tier?.percent ?? item.percent ?? 0;
  const raw = amount + monthlySalary * multiplier + monthlySalary * percent;
  const probability = item.probability ?? 1;
  if (item.vesting === 'afterMonths' && tenureMonths < (item.vestingMonths ?? 0)) return 0;
  if (item.vesting === 'prorated' && (item.vestingMonths ?? 0) > 0) return raw * Math.min(1, tenureMonths / (item.vestingMonths ?? 1)) * probability;
  return raw * probability;
}
