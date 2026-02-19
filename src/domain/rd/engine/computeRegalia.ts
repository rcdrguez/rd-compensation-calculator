export function computeRegalia(monthlySalary: number, workedMonthsInYear: number, regaliaMonthFactor: number): number {
  return (monthlySalary / regaliaMonthFactor) * Math.min(workedMonthsInYear, 12);
}
