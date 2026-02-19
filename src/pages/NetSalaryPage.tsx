import { useMemo, useState } from 'react';
import { Card } from '@/ui/components/Card';
import { Input } from '@/ui/components/Input';
import { computeNet } from '@/domain/rd/engine/computeNet';
import { loadConfigState, resolveActiveConfig } from '@/domain/rd/config/store';
import { money } from '@/ui/lib/utils';
import { extractFromText } from '@/ai/extract/rulesFallback';
import { Button } from '@/ui/components/Button';

export function NetSalaryPage() {
  const config = useMemo(() => resolveActiveConfig(loadConfigState()), []);
  const [gross, setGross] = useState(85000);
  const [extra, setExtra] = useState(5000);
  const [text, setText] = useState('');
  const result = computeNet({ gross, frequency: 'monthly', bonusesMonthly: extra, config });
  return <div className="grid gap-4 lg:grid-cols-2"><Card><h2 className="mb-3 text-lg font-semibold">Calculadora de neto</h2><label className="text-sm">Salario bruto mensual</label><Input type="number" value={gross} onChange={(e) => setGross(Number(e.target.value))} /><label className="mt-2 block text-sm">Bonos + beneficios mensuales</label><Input type="number" value={extra} onChange={(e) => setExtra(Number(e.target.value))} /><p className="mt-3 text-sm text-muted-foreground">Neto mensual: {money(result.monthlyNet)}</p><p className="text-sm">Neto anual: {money(result.annualNet)}</p><p className="text-sm">ISR anual: {money(result.annualISR)}</p><p className="text-sm">TSS (AFP + SFS): {money(result.tss.total)}</p></Card><Card><h3 className="mb-2 font-semibold">Auto-detectar desde texto (fallback reglas)</h3><textarea className="h-44 w-full rounded-md border border-input bg-background p-2 text-sm" value={text} onChange={(e) => setText(e.target.value)} /><Button className="mt-2" onClick={() => { const extracted = extractFromText(text); if (extracted.salary) setGross(extracted.salary); if (extracted.bonus) setExtra(extracted.bonus); }}>Extraer datos</Button></Card></div>;
}
