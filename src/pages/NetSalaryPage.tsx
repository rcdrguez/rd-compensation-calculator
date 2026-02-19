import { useMemo, useState } from 'react';
import { Card } from '@/ui/components/Card';
import { Input } from '@/ui/components/Input';
import { loadConfigState, resolveActiveConfig } from '@/domain/rd/config/store';
import { money } from '@/ui/lib/utils';
import { Button } from '@/ui/components/Button';
import { computeISR } from '@/domain/rd/engine/computeISR';
import { computeTSS } from '@/domain/rd/engine/computeTSS';

type Benefit = {
  id: string;
  name: string;
  amount: number;
  taxable: boolean;
};

type MonthlyExtraIncome = {
  month: string;
  amount: number;
  taxable: boolean;
};

const defaultBenefits: Benefit[] = [
  { id: crypto.randomUUID(), name: 'Bono de desempeño', amount: 5000, taxable: true },
  { id: crypto.randomUUID(), name: 'Subsidio de internet', amount: 2500, taxable: false }
];

const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

const defaultMonthlyExtras: MonthlyExtraIncome[] = monthNames.map((month) => ({
  month,
  amount: 0,
  taxable: true
}));

export function NetSalaryPage() {
  const config = useMemo(() => resolveActiveConfig(loadConfigState()), []);
  const [gross, setGross] = useState(85000);
  const [benefits, setBenefits] = useState<Benefit[]>(defaultBenefits);
  const [monthlyExtras, setMonthlyExtras] = useState<MonthlyExtraIncome[]>(defaultMonthlyExtras);

  const taxableBenefits = benefits.filter((item) => item.taxable).reduce((total, item) => total + item.amount, 0);
  const nonTaxableBenefits = benefits.filter((item) => !item.taxable).reduce((total, item) => total + item.amount, 0);
  const tss = computeTSS(gross, config);

  const annualTaxableExtras = monthlyExtras.reduce((total, item) => total + (item.taxable ? item.amount : 0), 0);
  const annualNonTaxableExtras = monthlyExtras.reduce((total, item) => total + (!item.taxable ? item.amount : 0), 0);

  const annualTaxableIncome = (gross - tss.total + taxableBenefits) * 12 + annualTaxableExtras;
  const annualISR = computeISR(annualTaxableIncome, config);
  const monthlyISR = annualISR / 12;

  const monthlyRows = monthNames.map((month, index) => {
    const monthExtra = monthlyExtras[index];
    const taxableMonthExtra = monthExtra.taxable ? monthExtra.amount : 0;
    const nonTaxableMonthExtra = monthExtra.taxable ? 0 : monthExtra.amount;
    const grossPackage = gross + taxableBenefits + nonTaxableBenefits + monthExtra.amount;
    const net = gross + taxableBenefits + nonTaxableBenefits + monthExtra.amount - tss.total - monthlyISR;

    return {
      month,
      grossIncome: gross,
      taxableExtras: taxableBenefits + taxableMonthExtra,
      nonTaxableExtras: nonTaxableBenefits + nonTaxableMonthExtra,
      tss: tss.total,
      isr: monthlyISR,
      grossPackage,
      net
    };
  });

  const annualGrossPackage = monthlyRows.reduce((total, row) => total + row.grossPackage, 0);
  const annualNet = monthlyRows.reduce((total, row) => total + row.net, 0);
  const averageMonthlyGrossPackage = annualGrossPackage / 12;
  const averageMonthlyNet = annualNet / 12;

  return (
    <div className="space-y-4">
      <Card>
        <h2 className="text-lg font-semibold">Calculadora de neto</h2>
        <p className="mb-4 text-sm text-muted-foreground">Agrega tus ingresos fijos y variables por mes para estimar tu paquete bruto y neto real.</p>

        <div className="grid gap-3 md:grid-cols-3">
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <label className="text-sm font-medium">Salario bruto mensual</label>
            <Input type="number" value={gross} onChange={(e) => setGross(Number(e.target.value) || 0)} />
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-xs uppercase text-muted-foreground">Neto mensual promedio estimado</p>
            <p className="mt-2 text-2xl font-semibold text-primary">{money(averageMonthlyNet)}</p>
          </div>
          <div className="rounded-lg border border-border bg-muted/20 p-3">
            <p className="text-xs uppercase text-muted-foreground">Paquete bruto anual estimado</p>
            <p className="mt-2 text-2xl font-semibold">{money(annualGrossPackage)}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="font-semibold">Beneficios fijos mensuales</h3>
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
              <Button
                className="bg-transparent px-2 text-foreground"
                onClick={() => setBenefits((prev) => prev.filter((_, idx) => idx !== index))}
              >
                Eliminar
              </Button>
            </div>
          ))}
        </div>

        <div className="mt-6 space-y-3">
          <h3 className="font-semibold">Otros ingresos por mes (paquete actual)</h3>
          <p className="text-sm text-muted-foreground">Puedes indicar ingresos específicos por mes y marcar si pagan impuestos o no.</p>
          <div className="grid gap-2 md:grid-cols-2 lg:grid-cols-3">
            {monthlyExtras.map((extra, index) => (
              <div key={extra.month} className="grid grid-cols-[70px_1fr_140px] items-center gap-2 rounded-lg border border-border p-2">
                <span className="text-sm font-medium">{extra.month}</span>
                <Input
                  type="number"
                  value={extra.amount}
                  onChange={(e) =>
                    setMonthlyExtras((prev) => prev.map((item, idx) => (idx === index ? { ...item, amount: Number(e.target.value) || 0 } : item)))
                  }
                />
                <select
                  className="rounded-md border border-input bg-background px-3 py-2 text-sm"
                  value={extra.taxable ? 'yes' : 'no'}
                  onChange={(e) =>
                    setMonthlyExtras((prev) => prev.map((item, idx) => (idx === index ? { ...item, taxable: e.target.value === 'yes' } : item)))
                  }
                >
                  <option value="yes">Con impuestos</option>
                  <option value="no">Sin impuestos</option>
                </select>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-6 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-3 py-2">Mes</th>
                <th className="px-3 py-2 text-right">Salario bruto</th>
                <th className="px-3 py-2 text-right">Ingresos gravados</th>
                <th className="px-3 py-2 text-right">Ingresos no gravados</th>
                <th className="px-3 py-2 text-right text-red-600">TSS</th>
                <th className="px-3 py-2 text-right text-red-600">ISR</th>
                <th className="px-3 py-2 text-right">Paquete bruto</th>
                <th className="px-3 py-2 text-right font-semibold">Paquete neto</th>
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
                  <td className="px-3 py-2 text-right">{money(row.grossPackage)}</td>
                  <td className="px-3 py-2 text-right font-semibold">{money(row.net)}</td>
                </tr>
              ))}
              <tr className="border-t-2 border-primary/40 bg-primary/5 font-semibold">
                <td className="px-3 py-2">Total anual</td>
                <td className="px-3 py-2 text-right">{money(gross * 12)}</td>
                <td className="px-3 py-2 text-right">{money(taxableBenefits * 12 + annualTaxableExtras)}</td>
                <td className="px-3 py-2 text-right">{money(nonTaxableBenefits * 12 + annualNonTaxableExtras)}</td>
                <td className="px-3 py-2 text-right text-red-600">-{money(tss.total * 12)}</td>
                <td className="px-3 py-2 text-right text-red-600">-{money(annualISR)}</td>
                <td className="px-3 py-2 text-right">{money(annualGrossPackage)}</td>
                <td className="px-3 py-2 text-right">{money(annualNet)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>
    </div>
  );
}
