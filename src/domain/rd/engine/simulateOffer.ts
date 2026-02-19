import type { Offer, RDConfig } from '../types';
import { computeNet } from './computeNet';
import { resolveItemAmount } from './utils';

export function simulateOffer(offer: Offer, months: number, config: RDConfig, options?: { includeTaxes?: boolean }) {
  let totalNet = 0;
  let variableComp = 0;
  const includeTaxes = options?.includeTaxes ?? true;

  for (let month = 1; month <= months; month += 1) {
    const bonuses = offer.bonuses.reduce((sum, bonus) => {
      const amount = resolveItemAmount(bonus, offer.monthlyBaseSalary, month);
      if (!includeTaxes) return sum + amount;
      return bonus.taxable === false ? sum : sum + amount;
    }, 0);

    const taxableBenefits = offer.benefits.reduce((sum, benefit) => {
      const amount = resolveItemAmount(benefit, offer.monthlyBaseSalary, month);
      if (!includeTaxes) return sum + amount;
      return benefit.taxable === false ? sum : sum + amount;
    }, 0);

    const nonTaxableBenefits = offer.benefits.reduce((sum, benefit) => {
      const amount = resolveItemAmount(benefit, offer.monthlyBaseSalary, month);
      return benefit.taxable === false ? sum + amount : sum;
    }, 0);

    const monthlyAdjustments = (offer.monthlyAdjustments ?? []).filter((item) => item.month === month);
    const taxableAdjustments = monthlyAdjustments.reduce((sum, item) => {
      if (!includeTaxes) return sum + item.amount;
      return item.taxable === false ? sum : sum + item.amount;
    }, 0);
    const nonTaxableAdjustments = monthlyAdjustments.reduce((sum, item) => (item.taxable === false ? sum + item.amount : sum), 0);

    variableComp += bonuses + taxableBenefits + nonTaxableBenefits + taxableAdjustments + nonTaxableAdjustments;

    const monthlyCost = offer.monthlyCosts;
    if (!includeTaxes) {
      totalNet += offer.monthlyBaseSalary + bonuses + taxableBenefits + nonTaxableBenefits + taxableAdjustments + nonTaxableAdjustments - monthlyCost;
      continue;
    }

    const net = computeNet({
      gross: offer.monthlyBaseSalary,
      frequency: 'monthly',
      bonusesMonthly: bonuses + taxableAdjustments - monthlyCost,
      benefitsMonthly: taxableBenefits,
      nonTaxableBenefitsMonthly: nonTaxableBenefits + nonTaxableAdjustments,
      config
    }).monthlyNet;
    totalNet += net;
  }

  return { offerId: offer.id, totalNet, averageMonthlyNet: totalNet / months, variableComp };
}
