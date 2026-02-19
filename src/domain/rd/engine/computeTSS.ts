import type { RDConfig } from '../types';

export function computeTSS(monthlyGross: number, config: RDConfig) {
  const contributable = Math.min(monthlyGross, config.tss.maxContributionSalary);
  const afp = contributable * config.tss.afpEmployeeRate;
  const sfs = contributable * config.tss.sfsEmployeeRate;
  return { afp, sfs, total: afp + sfs };
}
