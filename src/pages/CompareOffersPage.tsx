import { useMemo, useState } from 'react';
import { Card } from '@/ui/components/Card';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { compareOffersWithOptions } from '@/domain/rd/engine/compareOffers';
import { recommendCounteroffer } from '@/domain/rd/engine/recommend';
import { loadConfigState, resolveActiveConfig } from '@/domain/rd/config/store';
import type { MonthlyCompensationAdjustment, Offer } from '@/domain/rd/types';
import { Tabs } from '@/ui/components/Tabs';

const baseOffer = (id: string, name: string): Offer => ({
  id,
  name,
  monthlyBaseSalary: 90000,
  workMode: 'hybrid',
  monthlyCosts: 5000,
  growthScore: 70,
  qolScore: 75,
  bonuses: [{ name: 'Performance', multiplier: 0.2, taxable: true, vesting: 'prorated', vestingMonths: 12, probability: 0.7, tiers: [{ minMonths: 12, multiplier: 0.3 }] }],
  benefits: [
    { name: 'Internet', amount: 2000, taxable: false, vesting: 'immediate' },
    { name: 'Gym', amount: 1500, taxable: true, vesting: 'immediate' }
  ],
  monthlyAdjustments: []
});

const horizons = [12, 24, 36];

export function CompareOffersPage() {
  const config = useMemo(() => resolveActiveConfig(loadConfigState()), []);
  const [offers, setOffers] = useState([baseOffer('a', 'Oferta A'), baseOffer('b', 'Oferta B')]);
  const [includeTaxes, setIncludeTaxes] = useState(true);

  const addMonthlyAdjustment = (offerIndex: number) => {
    setOffers((prev) => prev.map((offer, idx) => {
      if (idx !== offerIndex) return offer;
      const nextItem: MonthlyCompensationAdjustment = { month: 1, name: 'Ingreso puntual', amount: 0, taxable: true };
      return { ...offer, monthlyAdjustments: [...(offer.monthlyAdjustments ?? []), nextItem] };
    }));
  };

  const updateMonthlyAdjustment = (offerIndex: number, adjustmentIndex: number, patch: Partial<MonthlyCompensationAdjustment>) => {
    setOffers((prev) => prev.map((offer, idx) => {
      if (idx !== offerIndex) return offer;
      const nextAdjustments = (offer.monthlyAdjustments ?? []).map((item, itemIdx) => itemIdx === adjustmentIndex ? { ...item, ...patch } : item);
      return { ...offer, monthlyAdjustments: nextAdjustments };
    }));
  };

  const removeMonthlyAdjustment = (offerIndex: number, adjustmentIndex: number) => {
    setOffers((prev) => prev.map((offer, idx) => {
      if (idx !== offerIndex) return offer;
      return { ...offer, monthlyAdjustments: (offer.monthlyAdjustments ?? []).filter((_, itemIdx) => itemIdx !== adjustmentIndex) };
    }));
  };

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">Comparador de ofertas más claro</h2>
        <p className="mt-1 text-sm text-muted-foreground">Puedes evaluar tus ofertas con impuestos incluidos o sin impuestos para comparar bruto vs neto.</p>
        <label className="mt-3 flex items-center gap-2 text-sm">
          <input type="checkbox" checked={includeTaxes} onChange={(e) => setIncludeTaxes(e.target.checked)} />
          Incluir ISR y TSS en el cálculo
        </label>
      </Card>

      <div className="grid gap-3 lg:grid-cols-2">
        {offers.map((offer, i) => (
          <Card key={offer.id}>
            <h3 className="font-semibold">{offer.name}</h3>
            <div className="mt-2 grid gap-2 md:grid-cols-2">
              <label className="text-sm">Salario mensual
                <Input type="number" value={offer.monthlyBaseSalary} onChange={(e) => setOffers((prev) => prev.map((item, idx) => idx === i ? { ...item, monthlyBaseSalary: Number(e.target.value) } : item))} />
              </label>
              <label className="text-sm">Costos mensuales
                <Input type="number" value={offer.monthlyCosts} onChange={(e) => setOffers((prev) => prev.map((item, idx) => idx === i ? { ...item, monthlyCosts: Number(e.target.value) } : item))} />
              </label>
            </div>

            <div className="mt-4 space-y-2">
              <h4 className="text-sm font-medium">Beneficios de referencia</h4>
              {offer.benefits.map((benefit, benefitIndex) => (
                <div key={`${offer.id}-benefit-${benefitIndex}`} className="grid grid-cols-12 gap-2 text-sm">
                  <span className="col-span-4 self-center">{benefit.name}</span>
                  <Input
                    className="col-span-4"
                    type="number"
                    value={benefit.amount ?? 0}
                    onChange={(e) => setOffers((prev) => prev.map((item, idx) => idx === i ? {
                      ...item,
                      benefits: item.benefits.map((candidate, cIdx) => cIdx === benefitIndex ? { ...candidate, amount: Number(e.target.value) } : candidate)
                    } : item))}
                  />
                  <label className="col-span-4 flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={benefit.taxable !== false}
                      onChange={(e) => setOffers((prev) => prev.map((item, idx) => idx === i ? {
                        ...item,
                        benefits: item.benefits.map((candidate, cIdx) => cIdx === benefitIndex ? { ...candidate, taxable: e.target.checked } : candidate)
                      } : item))}
                    />
                    Grava
                  </label>
                </div>
              ))}
            </div>

            <div className="mt-4 space-y-2">
              <div className="flex items-center justify-between">
                <h4 className="text-sm font-medium">Ingresos/descuentos por mes</h4>
                <Button className="px-2 py-1 text-xs" onClick={() => addMonthlyAdjustment(i)}>Agregar fila</Button>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full min-w-[520px] text-left text-xs">
                  <thead>
                    <tr className="border-b">
                      <th className="px-2 py-1">Mes</th>
                      <th className="px-2 py-1">Concepto</th>
                      <th className="px-2 py-1">Monto</th>
                      <th className="px-2 py-1">Impuesto</th>
                      <th className="px-2 py-1">Acción</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(offer.monthlyAdjustments ?? []).map((adjustment, adjustmentIndex) => (
                      <tr key={`${offer.id}-adj-${adjustmentIndex}`} className="border-b last:border-b-0">
                        <td className="px-2 py-1">
                          <Input type="number" min={1} max={36} value={adjustment.month} onChange={(e) => updateMonthlyAdjustment(i, adjustmentIndex, { month: Number(e.target.value) })} />
                        </td>
                        <td className="px-2 py-1">
                          <Input value={adjustment.name} onChange={(e) => updateMonthlyAdjustment(i, adjustmentIndex, { name: e.target.value })} />
                        </td>
                        <td className="px-2 py-1">
                          <Input type="number" value={adjustment.amount} onChange={(e) => updateMonthlyAdjustment(i, adjustmentIndex, { amount: Number(e.target.value) })} />
                        </td>
                        <td className="px-2 py-1">
                          <label className="flex items-center gap-1">
                            <input type="checkbox" checked={adjustment.taxable !== false} onChange={(e) => updateMonthlyAdjustment(i, adjustmentIndex, { taxable: e.target.checked })} />
                            Grava
                          </label>
                        </td>
                        <td className="px-2 py-1">
                          <Button className="bg-destructive px-2 py-1 text-xs text-destructive-foreground" onClick={() => removeMonthlyAdjustment(i, adjustmentIndex)}>Quitar</Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </Card>
        ))}
      </div>

      <Button onClick={() => setOffers((prev) => [...prev, baseOffer(crypto.randomUUID(), `Oferta ${String.fromCharCode(65 + prev.length)}`)])}>Agregar oferta</Button>

      <Tabs items={horizons.map((months) => {
        const result = compareOffersWithOptions(offers, months, config.scoring.defaultMode, config.scoring, config, { includeTaxes });
        const counter = offers[1] ? recommendCounteroffer(offers[0], offers[1], months, config) : null;
        return {
          id: String(months),
          label: `${months} meses`,
          content: (
            <Card>
              <h4 className="font-semibold">Ganador: {result.winner.name}</h4>
              <ul className="mt-2 list-disc pl-5 text-sm">
                {result.reasons.map((reason) => <li key={reason}>{reason}</li>)}
              </ul>
              <div className="mt-3 overflow-x-auto">
                <table className="w-full min-w-[640px] text-sm">
                  <thead>
                    <tr className="border-b text-left">
                      <th className="px-2 py-1">Oferta</th>
                      <th className="px-2 py-1">Total {includeTaxes ? 'neto' : 'bruto'}</th>
                      <th className="px-2 py-1">Promedio mensual</th>
                      <th className="px-2 py-1">Variable</th>
                      <th className="px-2 py-1">Riesgo</th>
                    </tr>
                  </thead>
                  <tbody>
                    {result.ranking.map((row) => (
                      <tr key={row.offer.id} className="border-b last:border-b-0">
                        <td className="px-2 py-1 font-medium">{row.offer.name}</td>
                        <td className="px-2 py-1">RD$ {row.simulation.totalNet.toFixed(2)}</td>
                        <td className="px-2 py-1">RD$ {row.simulation.averageMonthlyNet.toFixed(2)}</td>
                        <td className="px-2 py-1">RD$ {row.simulation.variableComp.toFixed(2)}</td>
                        <td className="px-2 py-1">{row.riskScore.toFixed(1)}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              {counter ? (
                <div className="mt-3 text-sm">
                  <p className="font-medium">Para que te convenga cambiarte pide:</p>
                  <p>Base requerida: {counter.baseRequiredToMatch.toFixed(2)}</p>
                  <p>Bono garantizado: {counter.guaranteedBonusRequiredToMatch.toFixed(2)}</p>
                </div>
              ) : null}
            </Card>
          )
        };
      })}
      />
    </div>
  );
}
