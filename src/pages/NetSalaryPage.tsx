import { useMemo, useState } from 'react';
import { Card } from '@/ui/components/Card';
import { Input } from '@/ui/components/Input';
import { computeNet } from '@/domain/rd/engine/computeNet';
import { loadConfigState, resolveActiveConfig } from '@/domain/rd/config/store';
import { money } from '@/ui/lib/utils';
import { Button } from '@/ui/components/Button';
import { computeNotice } from '@/domain/rd/engine/computeNotice';
import { computeRegalia } from '@/domain/rd/engine/computeRegalia';
import { computeSeverance } from '@/domain/rd/engine/computeSeverance';
import { computeVacations } from '@/domain/rd/engine/computeVacations';

type Benefit = {
  id: string;
  name: string;
  amount: number;
  taxable: boolean;
};

const defaultBenefits: Benefit[] = [
  { id: crypto.randomUUID(), name: 'Bono de desempeño', amount: 5000, taxable: true },
  { id: crypto.randomUUID(), name: 'Subsidio de internet', amount: 2500, taxable: false }
];

const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

export function NetSalaryPage() {
  const config = useMemo(() => resolveActiveConfig(loadConfigState()), []);
  const [gross, setGross] = useState(85000);
  const [benefits, setBenefits] = useState<Benefit[]>(defaultBenefits);
  const [startDate, setStartDate] = useState('2022-01-01');
  const [endDate, setEndDate] = useState(new Date().toISOString().slice(0, 10));
  const [pendingVacationDays, setPendingVacationDays] = useState(8);

  const taxableBenefits = benefits.filter((item) => item.taxable).reduce((total, item) => total + item.amount, 0);
  const nonTaxableBenefits = benefits.filter((item) => !item.taxable).reduce((total, item) => total + item.amount, 0);

  const result = computeNet({
    gross,
    frequency: 'monthly',
    benefitsMonthly: taxableBenefits,
    nonTaxableBenefitsMonthly: nonTaxableBenefits,
    config
  });

  const monthlyRows = monthNames.map((month) => ({
    month,
    grossIncome: result.monthlyGross,
    taxableExtras: result.taxableExtrasMonthly,
    nonTaxableExtras: result.nonTaxableBenefitsMonthly,
    tss: result.tss.total,
    isr: result.monthlyISR,
    net: result.monthlyNet
  }));

  const tenureMonths = Math.max(1, (new Date(endDate).getTime() - new Date(startDate).getTime()) / (1000 * 60 * 60 * 24 * 30.4));
  const noticeAmount = computeNotice(tenureMonths, gross, config, false);
  const severanceAmount = computeSeverance(tenureMonths, gross, config);
  const vacations = computeVacations({
    monthlySalary: gross,
    pendingDays: pendingVacationDays,
    entitlementDays: config.labor.vacationDaysPerYear
  });
  const regaliaAmount = computeRegalia(gross, Math.min(12, tenureMonths % 12 || 12), config.labor.regaliaMonthFactor);
  const resignationEstimate = vacations.amount + regaliaAmount;
  const dismissalEstimate = resignationEstimate + noticeAmount + severanceAmount;

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">Calculadora de neto</h2>
        <p className="mb-4 text-sm text-muted-foreground">Vista tipo tablero: entiende rápido cuánto ganas, cuánto descuentan y cuánto recibes mes por mes.</p>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <label className="text-sm font-medium">Salario bruto mensual</label>
            <Input type="number" value={gross} onChange={(e) => setGross(Number(e.target.value) || 0)} />
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-xs uppercase text-muted-foreground">Neto mensual estimado</p>
            <p className="mt-2 text-2xl font-semibold text-primary">{money(result.monthlyNet)}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-xs uppercase text-muted-foreground">Ingreso neto anual</p>
            <p className="mt-2 text-2xl font-semibold">{money(result.annualNet)}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Beneficios y bonos</h3>
            <Button
              className="bg-secondary text-secondary-foreground"
              onClick={() => setBenefits((prev) => [...prev, { id: crypto.randomUUID(), name: `Beneficio ${prev.length + 1}`, amount: 0, taxable: true }])}
            >
              Agregar beneficio
            </Button>
          </div>

          {benefits.map((benefit, index) => (
            <div key={benefit.id} className="grid gap-2 rounded-lg border border-border p-3 md:grid-cols-[1fr_140px_150px_auto]">
              <Input
                value={benefit.name}
                onChange={(e) =>
                  setBenefits((prev) => prev.map((item, idx) => (idx === index ? { ...item, name: e.target.value } : item)))
                }
              />
              <Input
                type="number"
                value={benefit.amount}
                onChange={(e) =>
                  setBenefits((prev) => prev.map((item, idx) => (idx === index ? { ...item, amount: Number(e.target.value) || 0 } : item)))
                }
              />
              <select
                className="rounded-md border border-input bg-background px-3 text-sm"
                value={benefit.taxable ? 'yes' : 'no'}
                onChange={(e) =>
                  setBenefits((prev) => prev.map((item, idx) => (idx === index ? { ...item, taxable: e.target.value === 'yes' } : item)))
                }
              >
                <option value="yes">Con impuestos</option>
                <option value="no">Sin impuestos</option>
              </select>
              <Button className="bg-transparent px-2 text-foreground hover:bg-muted" onClick={() => setBenefits((prev) => prev.filter((_, idx) => idx !== index))}>
                Eliminar
              </Button>
            </div>
          ))}
        </div>
      </Card>

      <Card>
        <div className="mb-3 flex items-center justify-between">
          <h3 className="font-semibold">Detalle de ingresos y descuentos por mes</h3>
          <p className="text-sm text-muted-foreground">12 meses del año fiscal</p>
        </div>
        <div className="overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-3 py-2">Mes</th>
                <th className="px-3 py-2 text-right">Bruto</th>
                <th className="px-3 py-2 text-right">Beneficios gravados</th>
                <th className="px-3 py-2 text-right">Beneficios no gravados</th>
                <th className="px-3 py-2 text-right text-red-600">TSS</th>
                <th className="px-3 py-2 text-right text-red-600">ISR</th>
                <th className="px-3 py-2 text-right font-semibold">Neto</th>
              </tr>
            </thead>
            <tbody>
              {monthlyRows.map((row) => (
                <tr key={row.month} className="border-t border-border">
                  <td className="px-3 py-2 font-medium">{row.month}</td>
                  <td className="px-3 py-2 text-right">{money(row.grossIncome)}</td>
                  <td className="px-3 py-2 text-right">{money(row.taxableExtras)}</td>
                  <td className="px-3 py-2 text-right">{money(row.nonTaxableExtras)}</td>
                  <td className="px-3 py-2 text-right text-red-600">-{money(row.tss)}</td>
                  <td className="px-3 py-2 text-right text-red-600">-{money(row.isr)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{money(row.net)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-primary/40 bg-primary/5 font-semibold">
                <td className="px-3 py-2">Total anual</td>
                <td className="px-3 py-2 text-right">{money(result.monthlyGross * 12)}</td>
                <td className="px-3 py-2 text-right">{money(result.taxableExtrasMonthly * 12)}</td>
                <td className="px-3 py-2 text-right">{money(result.nonTaxableBenefitsMonthly * 12)}</td>
                <td className="px-3 py-2 text-right text-red-600">-{money(result.tss.total * 12)}</td>
                <td className="px-3 py-2 text-right text-red-600">-{money(result.annualISR)}</td>
                <td className="px-3 py-2 text-right">{money(result.annualNet)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="font-semibold">Prestaciones estimadas (más claro e intuitivo)</h3>
        <p className="mb-4 text-sm text-muted-foreground">Configura fechas y vacaciones pendientes para ver un estimado de renuncia o desahucio.</p>

        <div className="grid gap-3 md:grid-cols-4">
          <div>
            <label className="text-sm font-medium">Fecha de inicio</label>
            <Input type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Fecha de cálculo</label>
            <Input type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
          <div>
            <label className="text-sm font-medium">Vacaciones pendientes</label>
            <Input type="number" value={pendingVacationDays} onChange={(e) => setPendingVacationDays(Number(e.target.value) || 0)} />
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-xs uppercase text-muted-foreground">Antigüedad aproximada</p>
            <p className="mt-2 text-xl font-semibold">{tenureMonths.toFixed(1)} meses</p>
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
                <td className="px-3 py-2 text-muted-foreground">Se paga por días pendientes al salario diario.</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2">Regalía proporcional</td>
                <td className="px-3 py-2 text-right">{money(regaliaAmount)}</td>
                <td className="px-3 py-2 text-muted-foreground">Corresponde al tiempo trabajado del año actual.</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2">Preaviso</td>
                <td className="px-3 py-2 text-right">{money(noticeAmount)}</td>
                <td className="px-3 py-2 text-muted-foreground">Aplica en escenario de terminación por empleador.</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2">Cesantía</td>
                <td className="px-3 py-2 text-right">{money(severanceAmount)}</td>
                <td className="px-3 py-2 text-muted-foreground">Depende de la antigüedad acumulada.</td>
              </tr>
              <tr className="border-t border-border bg-muted/20 font-semibold">
                <td className="px-3 py-2">Total si renuncias</td>
                <td className="px-3 py-2 text-right">{money(resignationEstimate)}</td>
                <td className="px-3 py-2">Vacaciones + regalía</td>
              </tr>
              <tr className="border-t border-border bg-primary/5 font-semibold">
                <td className="px-3 py-2">Total si te despiden</td>
                <td className="px-3 py-2 text-right">{money(dismissalEstimate)}</td>
                <td className="px-3 py-2">Incluye preaviso y cesantía.</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
