export type PaymentFrequency = 'monthly' | 'biweekly';
export type TerminationType = 'resignation' | 'employer_termination';
export type WorkMode = 'remote' | 'hybrid' | 'onsite';

export interface ISRBracket { from: number; to: number | null; rate: number; fixedFee: number }
export interface TSSConfig { afpEmployeeRate: number; sfsEmployeeRate: number; maxContributionSalary: number }
export interface LaborConfig {
  vacationDaysPerYear: number;
  noticeDaysByTenureMonths: Array<{ minMonths: number; maxMonths: number | null; days: number }>;
  severanceDaysByTenureMonths: Array<{ minMonths: number; maxMonths: number | null; daysPerYear: number; fixedDays?: number }>;
  regaliaMonthFactor: number;
}
export interface ScoringWeights { money: number; risk: number; growth: number; qol: number; defaultMode: 'balanced' | 'conservative' | 'aggressive' }
export interface RDConfig {
  id: string;
  year: number;
  currency: 'DOP';
  tss: TSSConfig;
  isrBrackets: ISRBracket[];
  labor: LaborConfig;
  scoring: ScoringWeights;
}

export interface CompensationItem {
  name: string;
  amount?: number;
  multiplier?: number;
  percent?: number;
  taxable?: boolean;
  vesting: 'immediate' | 'afterMonths' | 'prorated';
  vestingMonths?: number;
  probability?: number;
  tiers?: Array<{ minMonths: number; amount?: number; multiplier?: number; percent?: number }>;
}

export interface MonthlyCompensationAdjustment {
  month: number;
  name: string;
  amount: number;
  taxable?: boolean;
}

export interface Offer {
  id: string;
  name: string;
  monthlyBaseSalary: number;
  workMode: WorkMode;
  monthlyCosts: number;
  growthScore: number;
  qolScore: number;
  bonuses: CompensationItem[];
  benefits: CompensationItem[];
  monthlyAdjustments?: MonthlyCompensationAdjustment[];
}
