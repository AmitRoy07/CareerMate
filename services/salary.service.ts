export interface SalaryInput {
  ctc: number;
  basicPercent: number;
  hraPercent: number;
}

export interface SalaryBreakup {
  yearlyCtc: number;
  monthlyGross: number;
  basicMonthly: number;
  hraMonthly: number;
  pfMonthly: number;
  professionalTaxMonthly: number;
  estimatedTaxMonthly: number;
  inHandMonthly: number;
  inHandYearly: number;
}

export function calculateIndianSalary(input: SalaryInput): SalaryBreakup {
  const yearlyCtc = Math.max(0, input.ctc);
  const monthlyGross = yearlyCtc / 12;
  const basicMonthly = monthlyGross * (input.basicPercent / 100);
  const hraMonthly = basicMonthly * (input.hraPercent / 100);
  const pfMonthly = Math.min(basicMonthly * 0.12, 1800);
  const professionalTaxMonthly = monthlyGross > 15000 ? 200 : 0;
  const annualTaxable = Math.max(0, yearlyCtc - 75000);
  const annualTax = estimateNewRegimeTax(annualTaxable);
  const estimatedTaxMonthly = annualTax / 12;
  const inHandMonthly = Math.max(0, monthlyGross - pfMonthly - professionalTaxMonthly - estimatedTaxMonthly);

  return {
    yearlyCtc,
    monthlyGross,
    basicMonthly,
    hraMonthly,
    pfMonthly,
    professionalTaxMonthly,
    estimatedTaxMonthly,
    inHandMonthly,
    inHandYearly: inHandMonthly * 12,
  };
}

function estimateNewRegimeTax(taxableIncome: number) {
  const slabs = [
    { upto: 300000, rate: 0 },
    { upto: 600000, rate: 0.05 },
    { upto: 900000, rate: 0.1 },
    { upto: 1200000, rate: 0.15 },
    { upto: 1500000, rate: 0.2 },
    { upto: Number.POSITIVE_INFINITY, rate: 0.3 },
  ];
  let previous = 0;
  let tax = 0;

  for (const slab of slabs) {
    const amount = Math.min(taxableIncome, slab.upto) - previous;
    if (amount > 0) tax += amount * slab.rate;
    previous = slab.upto;
    if (taxableIncome <= slab.upto) break;
  }

  return tax * 1.04;
}

