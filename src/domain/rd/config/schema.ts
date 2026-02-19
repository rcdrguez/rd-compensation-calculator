import { z } from 'zod';

const isrBracketSchema = z.object({
  from: z.number().min(0),
  to: z.number().nullable(),
  rate: z.number().min(0).max(1),
  fixedFee: z.number().min(0)
});

export const rdConfigSchema = z.object({
  id: z.string().min(2),
  year: z.number().int().min(2020),
  currency: z.literal('DOP'),
  tss: z.object({
    afpEmployeeRate: z.number().min(0).max(1),
    sfsEmployeeRate: z.number().min(0).max(1),
    maxContributionSalary: z.number().positive()
  }),
  isrBrackets: z.array(isrBracketSchema).min(1),
  labor: z.object({
    vacationDaysPerYear: z.number().positive(),
    noticeDaysByTenureMonths: z.array(z.object({ minMonths: z.number(), maxMonths: z.number().nullable(), days: z.number().min(0) })),
    severanceDaysByTenureMonths: z.array(z.object({ minMonths: z.number(), maxMonths: z.number().nullable(), daysPerYear: z.number().min(0), fixedDays: z.number().optional() })),
    regaliaMonthFactor: z.number().positive()
  }),
  scoring: z.object({
    money: z.number().min(0),
    risk: z.number().min(0),
    growth: z.number().min(0),
    qol: z.number().min(0),
    defaultMode: z.enum(['balanced', 'conservative', 'aggressive'])
  })
});

export type RDConfigSchema = z.infer<typeof rdConfigSchema>;
