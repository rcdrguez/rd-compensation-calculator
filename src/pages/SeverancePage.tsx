import { useMemo, useState } from 'react';
import { Card } from '@/ui/components/Card';
import { Input } from '@/ui/components/Input';
import { computeNotice } from '@/domain/rd/engine/computeNotice';
import { computeSeverance } from '@/domain/rd/engine/computeSeverance';
import { computeVacations } from '@/domain/rd/engine/computeVacations';
import { computeRegalia } from '@/domain/rd/engine/computeRegalia';
import { loadConfigState, resolveActiveConfig } from '@/domain/rd/config/store';
import { money } from '@/ui/lib/utils';

export function SeverancePage() {
  const config = useMemo(() => resolveActiveConfig(loadConfigState()), []);
  const [salary, setSalary] = useState(80000);
  const [start, setStart] = useState('2023-01-01');
  const [end, setEnd] = useState(new Date().toISOString().slice(0, 10));
  const [pendingDays, setPendingDays] = useState(8);
  const months = Math.max(1, (new Date(end).getTime() - new Date(start).getTime()) / (1000 * 60 * 60 * 24 * 30.4));
  const vacations = computeVacations({ monthlySalary: salary, pendingDays, entitlementDays: config.labor.vacationDaysPerYear });
  const resignationTotal = vacations.amount + computeRegalia(salary, Math.min(12, months % 12), config.labor.regaliaMonthFactor);
  const dismissalTotal = resignationTotal + computeNotice(months, salary, config, false) + computeSeverance(months, salary, config);
  return <Card><h2 className="mb-3 text-lg font-semibold">Prestaciones</h2><div className="grid gap-2 lg:grid-cols-4"><Input type="date" value={start} onChange={(e) => setStart(e.target.value)} /><Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} /><Input type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value))} placeholder="Salario base" /><Input type="number" value={pendingDays} onChange={(e) => setPendingDays(Number(e.target.value))} placeholder="Vacaciones pendientes" /></div><div className="mt-4 text-sm"><p>Si renuncias hoy: {money(resignationTotal)}</p><p>Si te despiden hoy: {money(dismissalTotal)}</p></div></Card>;
}
