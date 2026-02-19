import { useMemo, useState } from 'react';
import { Card } from '@/ui/components/Card';
import { Button } from '@/ui/components/Button';
import { Input } from '@/ui/components/Input';
import { compareOffers } from '@/domain/rd/engine/compareOffers';
import { recommendCounteroffer } from '@/domain/rd/engine/recommend';
import { loadConfigState, resolveActiveConfig } from '@/domain/rd/config/store';
import type { Offer } from '@/domain/rd/types';
import { Tabs } from '@/ui/components/Tabs';

const baseOffer = (id: string, name: string): Offer => ({ id, name, monthlyBaseSalary: 90000, workMode: 'hybrid', monthlyCosts: 5000, growthScore: 70, qolScore: 75, bonuses: [{ name: 'Performance', multiplier: 0.2, vesting: 'prorated', vestingMonths: 12, probability: 0.7, tiers: [{ minMonths: 12, multiplier: 0.3 }] }], benefits: [{ name: 'Internet', amount: 2000, vesting: 'immediate' }] });

export function CompareOffersPage() {
  const config = useMemo(() => resolveActiveConfig(loadConfigState()), []);
  const [offers, setOffers] = useState([baseOffer('a', 'Oferta A'), baseOffer('b', 'Oferta B')]);
  const horizons = [12, 24, 36];
  return <div className="space-y-4"><div className="grid gap-3 lg:grid-cols-2">{offers.map((offer, i) => <Card key={offer.id}><h3 className="font-semibold">{offer.name}</h3><label className="text-sm">Salario mensual</label><Input type="number" value={offer.monthlyBaseSalary} onChange={(e) => setOffers((prev) => prev.map((item, idx) => idx === i ? { ...item, monthlyBaseSalary: Number(e.target.value) } : item))} /></Card>)}</div><Button onClick={() => setOffers((prev) => [...prev, baseOffer(crypto.randomUUID(), `Oferta ${String.fromCharCode(65 + prev.length)}`)])}>Agregar oferta</Button><Tabs items={horizons.map((months) => { const result = compareOffers(offers, months, config.scoring.defaultMode, config.scoring, config); const counter = offers[1] ? recommendCounteroffer(offers[0], offers[1], months, config) : null; return { id: String(months), label: `${months} meses`, content: <Card><h4 className="font-semibold">Ganador: {result.winner.name}</h4><ul className="list-disc pl-5 text-sm">{result.reasons.map((reason) => <li key={reason}>{reason}</li>)}</ul>{counter ? <div className="mt-3 text-sm"><p className="font-medium">Para que te convenga cambiarte pide:</p><p>Base requerida: {counter.baseRequiredToMatch.toFixed(2)}</p><p>Bono garantizado: {counter.guaranteedBonusRequiredToMatch.toFixed(2)}</p></div> : null}</Card> }; })} /></div>;
}
