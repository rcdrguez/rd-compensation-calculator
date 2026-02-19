import type { RDConfig } from '../types';

export function computeSeverance(tenureMonths: number, monthlySalary: number, config: RDConfig): number {
  const tenureYears = tenureMonths / 12;
  const rule = config.labor.severanceDaysByTenureMonths.find((item) => tenureMonths >= item.minMonths && (item.maxMonths === null || tenureMonths < item.maxMonths));
  if (!rule) return 0;
  const days = (rule.fixedDays ?? 0) + rule.daysPerYear * tenureYears;
  return (days * monthlySalary) / 23.83;
}
