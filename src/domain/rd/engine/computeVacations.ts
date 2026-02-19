export function computeVacations(params: { monthlySalary: number; pendingDays?: number; takenDays?: number; entitlementDays: number }) {
  const pending = params.pendingDays ?? Math.max(0, params.entitlementDays - (params.takenDays ?? 0));
  const dailySalary = params.monthlySalary / 23.83;
  return { pendingDays: pending, amount: pending * dailySalary };
}
