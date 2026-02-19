import { useMemo, useState } from 'react';
import { Card } from '@/ui/components/Card';
import { Input } from '@/ui/components/Input';
import { computeNet } from '@/domain/rd/engine/computeNet';
import { loadConfigState, resolveActiveConfig } from '@/domain/rd/config/store';
import { money } from '@/ui/lib/utils';
import { extractFromText } from '@/ai/extract/rulesFallback';
import { Button } from '@/ui/components/Button';

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

export function NetSalaryPage() {
  const config = useMemo(() => resolveActiveConfig(loadConfigState()), []);
  const [gross, setGross] = useState(85000);
  const [text, setText] = useState('');
  const [benefits, setBenefits] = useState<Benefit[]>(defaultBenefits);

  const taxableBenefits = benefits.filter((item) => item.taxable).reduce((total, item) => total + item.amount, 0);
  const nonTaxableBenefits = benefits.filter((item) => !item.taxable).reduce((total, item) => total + item.amount, 0);

  const result = computeNet({
    gross,
    frequency: 'monthly',
    benefitsMonthly: taxableBenefits,
    nonTaxableBenefitsMonthly: nonTaxableBenefits,
    config
  });

  return (
    <div className="grid gap-4 lg:grid-cols-[1.2fr_1fr]">
      <Card>
        <h2 className="text-lg font-semibold">Calculadora de neto</h2>
        <p className="mb-4 text-sm text-muted-foreground">Visualiza un desglose claro de descuentos, impuestos y beneficios gravados/no gravados.</p>

        <div className="rounded-lg border border-border bg-muted/20 p-3">
          <label className="text-sm font-medium">Salario bruto mensual</label>
          <Input type="number" value={gross} onChange={(e) => setGross(Number(e.target.value) || 0)} />
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

        <div className="mt-4 overflow-x-auto rounded-lg border border-border">
          <table className="w-full text-sm">
            <thead className="bg-muted/40 text-left">
              <tr>
                <th className="px-3 py-2">Detalle</th>
                <th className="px-3 py-2 text-right">Mensual</th>
                <th className="px-3 py-2 text-right">Anual</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-t border-border">
                <td className="px-3 py-2">Salario bruto</td>
                <td className="px-3 py-2 text-right">{money(result.monthlyGross)}</td>
                <td className="px-3 py-2 text-right">{money(result.monthlyGross * 12)}</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2">Beneficios gravados</td>
                <td className="px-3 py-2 text-right">{money(result.taxableExtrasMonthly)}</td>
                <td className="px-3 py-2 text-right">{money(result.taxableExtrasMonthly * 12)}</td>
              </tr>
              <tr className="border-t border-border">
                <td className="px-3 py-2">Beneficios no gravados</td>
                <td className="px-3 py-2 text-right">{money(result.nonTaxableBenefitsMonthly)}</td>
                <td className="px-3 py-2 text-right">{money(result.nonTaxableBenefitsMonthly * 12)}</td>
              </tr>
              <tr className="border-t border-border text-red-600">
                <td className="px-3 py-2">TSS (AFP + SFS)</td>
                <td className="px-3 py-2 text-right">-{money(result.tss.total)}</td>
                <td className="px-3 py-2 text-right">-{money(result.tss.total * 12)}</td>
              </tr>
              <tr className="border-t border-border text-red-600">
                <td className="px-3 py-2">ISR</td>
                <td className="px-3 py-2 text-right">-{money(result.monthlyISR)}</td>
                <td className="px-3 py-2 text-right">-{money(result.annualISR)}</td>
              </tr>
              <tr className="border-t border-border bg-primary/5 font-semibold">
                <td className="px-3 py-2">Neto final</td>
                <td className="px-3 py-2 text-right">{money(result.monthlyNet)}</td>
                <td className="px-3 py-2 text-right">{money(result.annualNet)}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="mb-2 font-semibold">Auto-detectar desde texto</h3>
        <p className="mb-2 text-sm text-muted-foreground">Pega una oferta y extraemos salario y bono aproximado (fallback por reglas).</p>
        <textarea
          className="h-44 w-full rounded-md border border-input bg-background p-2 text-sm"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
        <Button
          className="mt-2"
          onClick={() => {
            const extracted = extractFromText(text);
            if (extracted.salary) setGross(extracted.salary);
            if (extracted.bonus) {
              setBenefits((prev) => {
                const next = [...prev];
                const idx = next.findIndex((item) => item.name.toLowerCase().includes('bono'));
                if (idx >= 0) {
                  next[idx] = { ...next[idx], amount: extracted.bonus, taxable: true };
                } else {
                  next.push({ id: crypto.randomUUID(), name: 'Bono detectado', amount: extracted.bonus, taxable: true });
                }
                return next;
              });
            }
          }}
        >
          Extraer datos
        </Button>
      </Card>
    </div>
  );
}
