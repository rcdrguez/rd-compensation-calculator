export interface ExtractedSlots {
  salary?: number;
  frequency?: 'monthly' | 'biweekly';
  bonus?: number;
  startDate?: string;
  endDate?: string;
}

export function parseCurrency(raw: string): number {
  return Number(raw.replace(/[^\d.]/g, ''));
}
