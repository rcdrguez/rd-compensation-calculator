import type { Offer, RDConfig } from '../types';
import { computeNet } from './computeNet';
import { resolveItemAmount } from './utils';

export function simulateOffer(offer: Offer, months: number, config: RDConfig) {
  let totalNet = 0;
  let variableComp = 0;
  for (let month = 1; month <= months; month += 1) {
    const bonuses = offer.bonuses.reduce((sum, bonus) => sum + resolveItemAmount(bonus, offer.monthlyBaseSalary, month), 0);
    const benefits = offer.benefits.reduce((sum, benefit) => sum + resolveItemAmount(benefit, offer.monthlyBaseSalary, month), 0);
    variableComp += bonuses + benefits;
    const net = computeNet({ gross: offer.monthlyBaseSalary, frequency: 'monthly', bonusesMonthly: bonuses + benefits - offer.monthlyCosts, config }).monthlyNet;
    totalNet += net;
  }
  return { offerId: offer.id, totalNet, averageMonthlyNet: totalNet / months, variableComp };
}
