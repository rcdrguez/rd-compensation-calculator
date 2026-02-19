import type { ExtractedSlots } from './slots';
import { parseCurrency } from './slots';

export function extractFromText(text: string): ExtractedSlots {
  const salaryMatch = text.match(/(rd\$|dop|salario)\s*([\d,\.]+)/i) ?? text.match(/([\d,\.]+)\s*(mensual|quincenal)/i);
  const bonusMatch = text.match(/bono[s]?:?\s*([\d,\.]+)/i);
  const startMatch = text.match(/ingreso:?\s*(\d{4}-\d{2}-\d{2})/i);
  const endMatch = text.match(/salida:?\s*(\d{4}-\d{2}-\d{2})/i);
  return {
    salary: salaryMatch ? parseCurrency(salaryMatch[2] ?? salaryMatch[1]) : undefined,
    frequency: /quincenal/i.test(text) ? 'biweekly' : 'monthly',
    bonus: bonusMatch ? parseCurrency(bonusMatch[1]) : undefined,
    startDate: startMatch?.[1],
    endDate: endMatch?.[1]
  };
}
