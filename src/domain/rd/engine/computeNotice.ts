import type { RDConfig } from '../types';

export function computeNotice(tenureMonths: number, monthlySalary: number, config: RDConfig, noticeGiven: boolean): number {
  if (noticeGiven) return 0;
  const rule = config.labor.noticeDaysByTenureMonths.find((item) => tenureMonths >= item.minMonths && (item.maxMonths === null || tenureMonths < item.maxMonths));
  return ((rule?.days ?? 0) * monthlySalary) / 23.83;
}
