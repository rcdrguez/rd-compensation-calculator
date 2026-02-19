import type { PaymentFrequency, RDConfig } from '../types';
import { computeISR } from './computeISR';
import { computeTSS } from './computeTSS';

export function computeNet(params: {
  gross: number;
  frequency: PaymentFrequency;
  bonusesMonthly?: number;
  benefitsMonthly?: number;
  nonTaxableBenefitsMonthly?: number;
  config: RDConfig;
}) {
  const monthlyGross = params.frequency === 'biweekly' ? params.gross * 2 : params.gross;
  const taxableExtrasMonthly = (params.bonusesMonthly ?? 0) + (params.benefitsMonthly ?? 0);
  const nonTaxableBenefitsMonthly = params.nonTaxableBenefitsMonthly ?? 0;
  const tss = computeTSS(monthlyGross, params.config);
  const annualTaxable = (monthlyGross - tss.total + taxableExtrasMonthly) * 12;
  const annualISR = computeISR(annualTaxable, params.config);
  const monthlyISR = annualISR / 12;
  const monthlyNet = monthlyGross + taxableExtrasMonthly + nonTaxableBenefitsMonthly - tss.total - monthlyISR;
  return {
    monthlyGross,
    taxableExtrasMonthly,
    nonTaxableBenefitsMonthly,
    monthlyNet,
    annualNet: monthlyNet * 12,
    annualISR,
    monthlyISR,
    tss,
    totalCompAnnual: (monthlyGross + taxableExtrasMonthly + nonTaxableBenefitsMonthly) * 12
  };
}
