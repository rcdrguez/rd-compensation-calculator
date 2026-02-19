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
  const regalia = computeRegalia(salary, Math.min(12, months % 12 || 12), config.labor.regaliaMonthFactor);
  const notice = computeNotice(months, salary, config, false);
  const severance = computeSeverance(months, salary, config);
  const resignationTotal = vacations.amount + regalia;
  const dismissalTotal = resignationTotal + notice + severance;

  return (
    <Card>
      <h2 className="text-lg font-semibold">Prestaciones estimadas</h2>
      <p className="mb-4 text-sm text-muted-foreground">Vista más clara e intuitiva para estimar pagos por renuncia o despido según tus datos actuales.</p>

      <div className="grid gap-3 md:grid-cols-4">
        <div>
          <label className="text-sm font-medium">Fecha de inicio</label>
          <Input type="date" value={start} onChange={(e) => setStart(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Fecha de cálculo</label>
          <Input type="date" value={end} onChange={(e) => setEnd(e.target.value)} />
        </div>
        <div>
          <label className="text-sm font-medium">Salario base mensual</label>
          <Input type="number" value={salary} onChange={(e) => setSalary(Number(e.target.value) || 0)} />
        </div>
        <div>
          <label className="text-sm font-medium">Vacaciones pendientes</label>
          <Input type="number" value={pendingDays} onChange={(e) => setPendingDays(Number(e.target.value) || 0)} />
        </div>
      </div>

      <div className="mt-4 grid gap-3 md:grid-cols-3">
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <p className="text-xs uppercase text-muted-foreground">Antigüedad aproximada</p>
          <p className="mt-2 text-xl font-semibold">{months.toFixed(1)} meses</p>
        </div>
        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <p className="text-xs uppercase text-muted-foreground">Total si renuncias</p>
          <p className="mt-2 text-xl font-semibold">{money(resignationTotal)}</p>
        </div>
        <div className="rounded-lg border border-border bg-primary/5 p-3">
          <p className="text-xs uppercase text-muted-foreground">Total si te despiden</p>
          <p className="mt-2 text-xl font-semibold text-primary">{money(dismissalTotal)}</p>
        </div>
      </div>

      <div className="mt-4 overflow-x-auto rounded-lg border border-border">
        <table className="w-full text-sm">
          <thead className="bg-muted/40 text-left">
            <tr>
              <th className="px-3 py-2">Concepto</th>
              <th className="px-3 py-2 text-right">Monto estimado</th>
              <th className="px-3 py-2">Guía rápida</th>
            </tr>
          </thead>
          <tbody>
            <tr className="border-t border-border">
              <td className="px-3 py-2">Vacaciones no disfrutadas</td>
              <td className="px-3 py-2 text-right">{money(vacations.amount)}</td>
              <td className="px-3 py-2 text-muted-foreground">Pago por días pendientes al salario diario.</td>
            </tr>
            <tr className="border-t border-border">
              <td className="px-3 py-2">Regalía proporcional</td>
              <td className="px-3 py-2 text-right">{money(regalia)}</td>
              <td className="px-3 py-2 text-muted-foreground">Proporcional al tiempo trabajado en el año.</td>
            </tr>
            <tr className="border-t border-border">
              <td className="px-3 py-2">Preaviso</td>
              <td className="px-3 py-2 text-right">{money(notice)}</td>
              <td className="px-3 py-2 text-muted-foreground">Normalmente aplica cuando termina el empleador.</td>
            </tr>
            <tr className="border-t border-border">
              <td className="px-3 py-2">Cesantía</td>
              <td className="px-3 py-2 text-right">{money(severance)}</td>
              <td className="px-3 py-2 text-muted-foreground">Depende de tu antigüedad acumulada.</td>
            </tr>
            <tr className="border-t border-border bg-muted/20 font-semibold">
              <td className="px-3 py-2">Total si renuncias</td>
              <td className="px-3 py-2 text-right">{money(resignationTotal)}</td>
              <td className="px-3 py-2">Vacaciones + regalía.</td>
            </tr>
            <tr className="border-t border-border bg-primary/5 font-semibold">
              <td className="px-3 py-2">Total si te despiden</td>
              <td className="px-3 py-2 text-right">{money(dismissalTotal)}</td>
              <td className="px-3 py-2">Incluye preaviso y cesantía.</td>
            </tr>
          </tbody>
        </table>
      </div>
    </Card>
  );
}
