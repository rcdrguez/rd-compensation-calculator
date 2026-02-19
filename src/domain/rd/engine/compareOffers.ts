import type { Offer, RDConfig, ScoringWeights } from '../types';
import { simulateOffer } from './simulateOffer';

export function compareOffers(offers: Offer[], months: number, mode: ScoringWeights['defaultMode'], weights: ScoringWeights, config: RDConfig) {
  const adjusted = mode === 'conservative' ? { ...weights, risk: weights.risk + 0.15 } : mode === 'aggressive' ? { ...weights, growth: weights.growth + 0.15 } : weights;
  const scores = offers.map((offer) => {
    const simulation = simulateOffer(offer, months, config);
    const riskScore = 100 - Math.min(100, (offer.bonuses.reduce((acc, item) => acc + (item.probability ?? 1), 0) / Math.max(1, offer.bonuses.length)) * 100);
    const score = simulation.totalNet * adjusted.money + riskScore * adjusted.risk + offer.growthScore * adjusted.growth + offer.qolScore * adjusted.qol;
    return { offer, simulation, score, riskScore };
  });
  const ranking = scores.sort((a, b) => b.score - a.score);
  const winner = ranking[0];
  const runnerUp = ranking[1];
  const reasons = [
    `Ventaja económica estimada: RD$ ${(winner.simulation.totalNet - (runnerUp?.simulation.totalNet ?? 0)).toFixed(2)} en ${months} meses`,
    `Score total ponderado: ${winner.score.toFixed(2)}`,
    `Compensación variable esperada: RD$ ${winner.simulation.variableComp.toFixed(2)}`
  ];
  return { winner: winner.offer, ranking, reasons };
}

export function compareOffersWithOptions(
  offers: Offer[],
  months: number,
  mode: ScoringWeights['defaultMode'],
  weights: ScoringWeights,
  config: RDConfig,
  options?: { includeTaxes?: boolean }
) {
  const adjusted = mode === 'conservative' ? { ...weights, risk: weights.risk + 0.15 } : mode === 'aggressive' ? { ...weights, growth: weights.growth + 0.15 } : weights;
  const scores = offers.map((offer) => {
    const simulation = simulateOffer(offer, months, config, options);
    const riskScore = 100 - Math.min(100, (offer.bonuses.reduce((acc, item) => acc + (item.probability ?? 1), 0) / Math.max(1, offer.bonuses.length)) * 100);
    const score = simulation.totalNet * adjusted.money + riskScore * adjusted.risk + offer.growthScore * adjusted.growth + offer.qolScore * adjusted.qol;
    return { offer, simulation, score, riskScore };
  });
  const ranking = scores.sort((a, b) => b.score - a.score);
  const winner = ranking[0];
  const runnerUp = ranking[1];
  const reasons = [
    `Ventaja económica estimada: RD$ ${(winner.simulation.totalNet - (runnerUp?.simulation.totalNet ?? 0)).toFixed(2)} en ${months} meses`,
    `Score total ponderado: ${winner.score.toFixed(2)}`,
    `Compensación variable esperada: RD$ ${winner.simulation.variableComp.toFixed(2)}`
  ];
  return { winner: winner.offer, ranking, reasons };
}
