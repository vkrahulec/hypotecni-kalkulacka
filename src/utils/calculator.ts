// Pure mortgage calculation logic — easy to unit test

export type PaymentType = 'annuity' | 'progressive';

export interface MortgageInput {
  propertyPrice: number;
  downPayment: number;
  loanAmount: number;
  annualInterestRate: number; // in percent, e.g. 5.5
  fixationYears: number;
  totalYears: number;
  paymentType: PaymentType;
  propertyInsuranceMonthly: number;
  lifeInsuranceMonthly: number;
  arrangementFee: number;
  valuationFee: number;
}

export interface AmortizationRow {
  month: number;
  payment: number;
  principal: number;
  interest: number;
  remainingBalance: number;
}

export interface YearlyAmortizationRow {
  year: number;
  totalPayment: number;
  totalPrincipal: number;
  totalInterest: number;
  remainingBalance: number;
}

export interface MortgageResult {
  monthlyPayment: number;
  totalPaid: number;
  totalInterest: number;
  totalCostWithExtras: number;
  ltv: number;
  amortizationTable: AmortizationRow[];
  yearlyAmortizationTable: YearlyAmortizationRow[];
}

export interface ValidationError {
  field: string;
  message: string;
}

export function validateInputs(input: MortgageInput): ValidationError[] {
  const errors: ValidationError[] = [];

  if (!input.propertyPrice || input.propertyPrice <= 0) {
    errors.push({ field: 'propertyPrice', message: 'Zadejte platnou cenu nemovitosti.' });
  }

  if (input.downPayment < 0) {
    errors.push({ field: 'downPayment', message: 'Vlastní zdroje nemohou být záporné.' });
  }

  if (input.downPayment >= input.propertyPrice && input.propertyPrice > 0) {
    errors.push({ field: 'downPayment', message: 'Vlastní zdroje musí být nižší než cena nemovitosti.' });
  }

  if (!input.loanAmount || input.loanAmount <= 0) {
    errors.push({ field: 'loanAmount', message: 'Výše úvěru musí být kladná.' });
  }

  if (input.annualInterestRate <= 0 || input.annualInterestRate > 30) {
    errors.push({ field: 'annualInterestRate', message: 'Úroková sazba musí být v rozmezí 0,01 % – 30 %.' });
  }

  if (input.totalYears < 5 || input.totalYears > 30) {
    errors.push({ field: 'totalYears', message: 'Doba splácení musí být 5 až 30 let.' });
  }

  if (input.propertyInsuranceMonthly < 0) {
    errors.push({ field: 'propertyInsuranceMonthly', message: 'Pojištění nemovitosti nemůže být záporné.' });
  }

  if (input.lifeInsuranceMonthly < 0) {
    errors.push({ field: 'lifeInsuranceMonthly', message: 'Životní pojištění nemůže být záporné.' });
  }

  if (input.arrangementFee < 0) {
    errors.push({ field: 'arrangementFee', message: 'Poplatek za zpracování nemůže být záporný.' });
  }

  if (input.valuationFee < 0) {
    errors.push({ field: 'valuationFee', message: 'Poplatek za odhad nemůže být záporný.' });
  }

  return errors;
}

export function calculateLTV(loanAmount: number, propertyPrice: number): number {
  if (!propertyPrice || propertyPrice === 0) return 0;
  return (loanAmount / propertyPrice) * 100;
}

/**
 * Calculate annuity monthly payment using the standard formula:
 * M = P * [r(1+r)^n] / [(1+r)^n - 1]
 */
export function calculateAnnuityPayment(
  principal: number,
  annualRatePercent: number,
  totalMonths: number
): number {
  const r = annualRatePercent / 100 / 12;
  if (r === 0) return principal / totalMonths;
  const factor = Math.pow(1 + r, totalMonths);
  return (principal * r * factor) / (factor - 1);
}

/**
 * Generate full amortization table for annuity mortgage.
 */
function buildAnnuityTable(
  principal: number,
  annualRatePercent: number,
  totalMonths: number
): AmortizationRow[] {
  const r = annualRatePercent / 100 / 12;
  const monthlyPayment = calculateAnnuityPayment(principal, annualRatePercent, totalMonths);
  const rows: AmortizationRow[] = [];
  let balance = principal;

  for (let month = 1; month <= totalMonths; month++) {
    const interest = balance * r;
    const principalPart = monthlyPayment - interest;
    balance = Math.max(0, balance - principalPart);

    rows.push({
      month,
      payment: Math.round(monthlyPayment * 100) / 100,
      principal: Math.round(principalPart * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      remainingBalance: Math.round(balance * 100) / 100,
    });
  }

  return rows;
}

/**
 * Progressive (degressive) mortgage: fixed principal per month, decreasing interest.
 * Monthly principal = P / n, interest = remaining balance * r.
 */
function buildProgressiveTable(
  principal: number,
  annualRatePercent: number,
  totalMonths: number
): AmortizationRow[] {
  const r = annualRatePercent / 100 / 12;
  const fixedPrincipal = principal / totalMonths;
  const rows: AmortizationRow[] = [];
  let balance = principal;

  for (let month = 1; month <= totalMonths; month++) {
    const interest = balance * r;
    const payment = fixedPrincipal + interest;
    balance = Math.max(0, balance - fixedPrincipal);

    rows.push({
      month,
      payment: Math.round(payment * 100) / 100,
      principal: Math.round(fixedPrincipal * 100) / 100,
      interest: Math.round(interest * 100) / 100,
      remainingBalance: Math.round(balance * 100) / 100,
    });
  }

  return rows;
}

function buildYearlyTable(monthly: AmortizationRow[]): YearlyAmortizationRow[] {
  const yearMap = new Map<number, YearlyAmortizationRow>();

  for (const row of monthly) {
    const year = Math.ceil(row.month / 12);
    const existing = yearMap.get(year);
    if (existing) {
      existing.totalPayment += row.payment;
      existing.totalPrincipal += row.principal;
      existing.totalInterest += row.interest;
      existing.remainingBalance = row.remainingBalance;
    } else {
      yearMap.set(year, {
        year,
        totalPayment: row.payment,
        totalPrincipal: row.principal,
        totalInterest: row.interest,
        remainingBalance: row.remainingBalance,
      });
    }
  }

  return Array.from(yearMap.values()).map((r) => ({
    ...r,
    totalPayment: Math.round(r.totalPayment * 100) / 100,
    totalPrincipal: Math.round(r.totalPrincipal * 100) / 100,
    totalInterest: Math.round(r.totalInterest * 100) / 100,
    remainingBalance: Math.round(r.remainingBalance * 100) / 100,
  }));
}

export function calculate(input: MortgageInput): MortgageResult {
  const totalMonths = input.totalYears * 12;
  const ltv = calculateLTV(input.loanAmount, input.propertyPrice);

  const amortizationTable =
    input.paymentType === 'annuity'
      ? buildAnnuityTable(input.loanAmount, input.annualInterestRate, totalMonths)
      : buildProgressiveTable(input.loanAmount, input.annualInterestRate, totalMonths);

  const yearlyAmortizationTable = buildYearlyTable(amortizationTable);

  const monthlyPayment = amortizationTable[0]?.payment ?? 0;
  const totalPaid = amortizationTable.reduce((sum, r) => sum + r.payment, 0);
  const totalInterest = amortizationTable.reduce((sum, r) => sum + r.interest, 0);

  const totalInsurance =
    (input.propertyInsuranceMonthly + input.lifeInsuranceMonthly) * totalMonths;
  const oneTimeFees = input.arrangementFee + input.valuationFee;
  const totalCostWithExtras =
    Math.round((totalPaid + totalInsurance + oneTimeFees) * 100) / 100;

  return {
    monthlyPayment: Math.round(monthlyPayment * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalCostWithExtras,
    ltv: Math.round(ltv * 100) / 100,
    amortizationTable,
    yearlyAmortizationTable,
  };
}
