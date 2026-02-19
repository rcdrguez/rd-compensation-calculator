import { describe, expect, it } from 'vitest';
import preset from '../src/domain/rd/config/presets/rd-2025.json';
import { computeNet } from '../src/domain/rd/engine/computeNet';
import { computeSeverance } from '../src/domain/rd/engine/computeSeverance';
import { compareOffers } from '../src/domain/rd/engine/compareOffers';
import type { Offer } from '../src/domain/rd/types';

const config = preset as any;

describe('rd engine', () => {
  it('computes net salary', () => {
    const result = computeNet({ gross: 100000, frequency: 'monthly', config });
    expect(result.monthlyNet).toBeGreaterThan(0);
    expect(result.annualISR).toBeGreaterThanOrEqual(0);
  });

  it('includes non-taxable benefits without raising ISR', () => {
    const withoutNonTaxable = computeNet({ gross: 100000, frequency: 'monthly', benefitsMonthly: 5000, config });
    const withNonTaxable = computeNet({ gross: 100000, frequency: 'monthly', benefitsMonthly: 5000, nonTaxableBenefitsMonthly: 5000, config });
    expect(withNonTaxable.monthlyNet).toBeGreaterThan(withoutNonTaxable.monthlyNet);
    expect(withNonTaxable.annualISR).toBe(withoutNonTaxable.annualISR);
  });

  it('computes severance for tenure', () => {
    const amount = computeSeverance(24, 90000, config);
    expect(amount).toBeGreaterThan(0);
  });

  it('compares offers deterministically', () => {
    const offers: Offer[] = [
      { id: 'a', name: 'A', monthlyBaseSalary: 90000, workMode: 'remote', monthlyCosts: 0, growthScore: 60, qolScore: 70, bonuses: [], benefits: [] },
      { id: 'b', name: 'B', monthlyBaseSalary: 100000, workMode: 'onsite', monthlyCosts: 4000, growthScore: 60, qolScore: 70, bonuses: [], benefits: [] }
    ];
    const result = compareOffers(offers, 12, 'balanced', config.scoring, config);
    expect(result.winner.id).toBe('b');
  });
});
