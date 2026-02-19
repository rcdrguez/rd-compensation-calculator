import type { PaymentFrequency, RDConfig } from '../types';
import { computeISR } from './computeISR';
import { computeTSS } from './computeTSS';

export function computeNet(params: { gross: number; frequency: PaymentFrequency; bonusesMonthly?: number; benefitsMonthly?: number; config: RDConfig }) {
  const monthlyGross = params.frequency === 'biweekly' ? params.gross * 2 : params.gross;
  const extraMonthly = (params.bonusesMonthly ?? 0) + (params.benefitsMonthly ?? 0);
  const tss = computeTSS(monthlyGross, params.config);
  const annualTaxable = (monthlyGross - tss.total + extraMonthly) * 12;
  const annualISR = computeISR(annualTaxable, params.config);
  const monthlyISR = annualISR / 12;
  const monthlyNet = monthlyGross + extraMonthly - tss.total - monthlyISR;
  return {
    monthlyGross,
    monthlyNet,
    annualNet: monthlyNet * 12,
    annualISR,
    tss,
    totalCompAnnual: (monthlyGross + extraMonthly) * 12
  };
}
