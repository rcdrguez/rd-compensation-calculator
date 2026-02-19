import type { Offer, RDConfig } from '../types';
import { simulateOffer } from './simulateOffer';

export function recommendCounteroffer(currentOffer: Offer, targetOffer: Offer, months: number, config: RDConfig) {
  const current = simulateOffer(currentOffer, months, config);
  const target = simulateOffer(targetOffer, months, config);
  const gap = Math.max(0, target.totalNet - current.totalNet);
  return {
    baseRequiredToMatch: currentOffer.monthlyBaseSalary + gap / months,
    guaranteedBonusRequiredToMatch: gap,
    bullets: [
      `Brecha actual: RD$ ${gap.toFixed(2)} para el horizonte de ${months} meses.`,
      `Con salario base de RD$ ${(currentOffer.monthlyBaseSalary + gap / months).toFixed(2)} igualas la oferta objetivo.`,
      `Alternativa: bono garantizado único de RD$ ${gap.toFixed(2)}.`
    ]
  };
}
