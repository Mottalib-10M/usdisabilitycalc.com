/**
 * Engine of the site: pure functions, every figure read from src/data/params-2026.json (IRS, OPM) and
 * src/data/bls-ncs-2026.json (BLS, March 2026). No network call, nothing typed by hand.
 *
 * Federal income tax: 2026 brackets and standard deduction (Rev. Proc. 2025-32), no credit, no other deduction.
 * Benefit taxation: Pub. 525 (employer-paid or pre-tax premiums make the benefit taxable; after-tax premiums
 * make it tax-free; a split plan is taxable in the employer's share). Sick pay payroll tax: Pub. 15-A (2026),
 * Social Security and Medicare on the employer-funded part for the first 6 calendar months after the last month
 * worked. Social Security benefits: Pub. 915 worksheet (base and adjusted base amounts).
 */
import P from '../../data/params-2026.json';
import B from '../../data/bls-ncs-2026.json';

export type Status = 'single' | 'mfj' | 'hoh';
/** Who paid the disability premium: employer; employee through a pre-tax (cafeteria) deduction; employee after tax;
 *  a split plan (employee share after tax); an individual policy bought with after-tax money. */
export type Payer = 'employer' | 'pretax' | 'aftertax' | 'split' | 'own';

export const FED = P.federal;
export const LTC = P.ltc;
export const HSA = P.hsa;
export const ADD = P.fegliADD;
export const BLS = B;
export const RETRIEVED = P.retrieved_at;
export const PRIVATE = B.provisions.private;
export const CIVILIAN = B.provisions.civilian;
export const GOVERNMENT = B.provisions.government;

const r2 = (x: number) => Math.round(x * 100) / 100;

/** Federal income tax on taxable income (after deductions). */
export function bracketTax(taxable: number, st: Status): number {
  let tax = 0, low = 0;
  for (const [top, rate] of FED.brackets[st] as Array<[number | null, number]>) {
    const hi = top ?? Infinity;
    if (taxable > low) tax += (Math.min(taxable, hi) - low) * rate;
    if (taxable <= hi) break;
    low = hi;
  }
  return r2(tax);
}
/** Tax on gross income with the standard deduction. */
export const taxOn = (gross: number, st: Status) => bracketTax(Math.max(0, gross - FED.standardDeduction[st]), st);
/** Tax that an extra taxable amount adds on top of other income. */
export const taxAdded = (extra: number, other: number, st: Status) => r2(taxOn(other + Math.max(0, extra), st) - taxOn(other, st));
/** Marginal federal rate at a gross income (next dollar). */
export function marginalRate(gross: number, st: Status): number {
  const t = Math.max(0, gross - FED.standardDeduction[st]);
  if (gross <= FED.standardDeduction[st]) return 0;
  for (const [top, rate] of FED.brackets[st] as Array<[number | null, number]>) if (top === null || t < top) return rate;
  return 0.37;
}
/** Employee Social Security and Medicare on wages (no Additional Medicare Tax). */
export const fica = (wages: number) => r2(Math.min(wages, FED.socialSecurityWageBase) * FED.socialSecurityRate + wages * FED.medicareRate);
/** Yearly take-home pay: gross minus federal income tax and payroll tax. State tax is left out. */
export function takeHome(salary: number, st: Status) {
  const fed = taxOn(salary, st), ss = fica(salary);
  return { gross: salary, fed, fica: ss, net: r2(salary - fed - ss) };
}

/** Share of a benefit that is taxable income, by who paid the premium (Pub. 525). `employeeShare` = part of the
 *  premium paid by the employee with after-tax money in a split plan (0 to 1), over the 3 prior policy years (Pub. 15-A). */
export function taxableShare(payer: Payer, employeeShare = 0): number {
  if (payer === 'aftertax' || payer === 'own') return 0;
  if (payer === 'split') return Math.min(1, Math.max(0, 1 - employeeShare));
  return 1;
}
/** Payroll tax on sick pay: the employer-funded (taxable) part, paid within the first 6 calendar months after the last
 *  month worked. `months` = months of benefit falling in that window. Individual policies are not sick pay from an employer. */
export function sickPayFica(monthlyBenefit: number, share: number, months: number, payer: Payer): number {
  if (payer === 'own') return 0;
  const m = Math.max(0, Math.min(months, FED.sickPayFicaMonths));
  return r2(monthlyBenefit * share * m * (FED.socialSecurityRate + FED.medicareRate));
}

/** Taxable part of Social Security benefits for the year (Pub. 915 worksheet). `other` = other income counted. */
export function ssTaxable(ss: number, other: number, st: Status): number {
  if (ss <= 0) return 0;
  const base = FED.socialSecurityBenefitBase[st], adj = FED.socialSecurityBenefitAdjustedBase[st];
  const prov = other + ss / 2;
  if (prov <= base) return 0;
  if (prov <= adj) return r2(Math.min(ss / 2, (prov - base) / 2));
  return r2(Math.min(0.85 * ss, 0.85 * (prov - adj) + Math.min(ss / 2, (adj - base) / 2)));
}

/* ------------------------------------------------------------------ LTD */
export interface LtdIn {
  salary: number; pct: number; cap: number; ssdi: number; otherOffsets: number; minBenefit: number;
  payer: Payer; employeeShare: number; st: Status; otherIncome: number; elimDays: number;
}
/** Monthly long-term disability: gross from the plan formula, offsets, net LTD, SSDI, federal tax, money in hand. */
export function ltd(x: LtdIn) {
  const formula = (x.salary / 12) * x.pct;
  const gross = Math.min(formula, x.cap > 0 ? x.cap : Infinity);
  const capped = x.cap > 0 && formula > x.cap;
  const offsets = Math.max(0, x.ssdi) + Math.max(0, x.otherOffsets);
  const afterOffsets = gross - offsets;
  const net = Math.max(afterOffsets, Math.min(x.minBenefit, gross), 0);
  const floorApplied = afterOffsets < net;
  const share = taxableShare(x.payer, x.employeeShare);
  const ltdTaxableYear = net * 12 * share;
  const ssYear = Math.max(0, x.ssdi) * 12;
  const ssTax = ssTaxable(ssYear, x.otherIncome + ltdTaxableYear, x.st);
  const fedYear = taxAdded(ltdTaxableYear + ssTax, x.otherIncome, x.st);
  const ficaMonths = Math.max(0, FED.sickPayFicaMonths - Math.ceil(x.elimDays / 30.4375));
  const ficaFirstYear = sickPayFica(net, share, ficaMonths, x.payer);
  const inHand = net + Math.max(0, x.ssdi) - fedYear / 12;
  const th = takeHome(x.salary, x.st);
  return {
    formula: r2(formula), gross: r2(gross), capped, offsets: r2(offsets), net: r2(net), floorApplied, share,
    ltdTaxableYear: r2(ltdTaxableYear), ssTaxableYear: ssTax, fedMonthly: r2(fedYear / 12), ficaFirstYear, ficaMonths,
    inHand: r2(inHand), takeHomeMonthly: r2(th.net / 12), replaced: th.net > 0 ? inHand / (th.net / 12) : 0,
  };
}
/** Total payable from the start of benefits to the end of the benefit period (age or months), no cost-of-living rider. */
export function ltdTotal(monthly: number, ageAtStart: number, endAge: number, elimDays: number) {
  const months = Math.max(0, Math.round((endAge - ageAtStart) * 12 - elimDays / 30.4375));
  return { months, total: r2(monthly * months) };
}
/** Where a monthly cap stands among plans with a cap (BLS percentiles, private industry). */
export function capRank(cap: number, src = PRIVATE): string {
  const p = [[10, src.ltd_max_monthly_p10], [25, src.ltd_max_monthly_p25], [50, src.ltd_max_monthly_p50], [75, src.ltd_max_monthly_p75], [90, src.ltd_max_monthly_p90]] as Array<[number, number | null]>;
  let below = 0;
  for (const [q, v] of p) if (v !== null && cap >= v) below = q;
  return below === 0 ? 'below the 10th percentile' : below === 90 ? 'at or above the 90th percentile' : `at or above the ${below}th percentile`;
}

/* ------------------------------------------------------------------ STD */
export interface StdIn { salary: number; pct: number; capWeekly: number; weeks: number; waitDays: number; payer: Payer; employeeShare: number; st: Status }
export function std(x: StdIn) {
  const formula = (x.salary / 52) * x.pct;
  const weekly = Math.min(formula, x.capWeekly > 0 ? x.capWeekly : Infinity);
  const capped = x.capWeekly > 0 && formula > x.capWeekly;
  const total = weekly * x.weeks;
  const share = taxableShare(x.payer, x.employeeShare);
  const waitWeeks = x.waitDays / 7;
  const worked = Math.max(0, x.salary * (52 - x.weeks - waitWeeks) / 52);
  const fed = taxAdded(total * share, worked, x.st);
  // Weeks paid inside the 6 calendar months after the last month worked: 26 weeks at most.
  const ficaWeeks = Math.max(0, Math.min(x.weeks, 26 - waitWeeks));
  const ficaTax = x.payer === 'own' ? 0 : r2(weekly * share * ficaWeeks * (FED.socialSecurityRate + FED.medicareRate));
  const thWeekly = takeHome(x.salary, x.st).net / 52;
  const net = total - fed - ficaTax;
  return { formula: r2(formula), weekly: r2(weekly), capped, total: r2(total), share, fed, fica: ficaTax, net: r2(net), netWeekly: x.weeks > 0 ? r2(net / x.weeks) : 0, takeHomeWeekly: r2(thWeekly), unpaidWait: r2(thWeekly * waitWeeks) };
}

/* ------------------------------------------------------------------ Premium: pre-tax or after-tax */
export function premiumChoice(x: { salary: number; premium: number; benefit: number; months: number; st: Status }) {
  const m = marginalRate(x.salary, x.st);
  const payroll = x.salary < FED.socialSecurityWageBase ? FED.socialSecurityRate + FED.medicareRate : FED.medicareRate;
  const extraYearly = r2(x.premium * (m + payroll));
  const preTaxCost = r2(x.premium - extraYearly);
  // A claim of `months` with no other income: federal tax on the benefit plus payroll tax for the first 6 months.
  const claim = x.benefit * x.months;
  const taxOnClaim = r2(taxAdded(claim, 0, x.st) + sickPayFica(x.benefit, 1, Math.min(6, x.months), 'pretax'));
  return { marginal: m, payroll, extraYearly, preTaxCost, afterTaxCost: x.premium, claim: r2(claim), taxOnClaim, yearsCovered: extraYearly > 0 ? taxOnClaim / extraYearly : 0 };
}

/* ------------------------------------------------------------------ Elimination period */
export function bridge(x: { expenses: number; elimDays: number; sickPay: number; savings: number }) {
  const months = x.elimDays / 30.4375;
  const need = x.expenses * months;
  const covered = Math.min(need, x.sickPay * months);
  const gap = Math.max(0, need - covered);
  return { months: r2(months), need: r2(need), covered: r2(covered), gap: r2(gap), shortfall: r2(Math.max(0, gap - x.savings)), savingsMonths: x.expenses > 0 ? x.savings / x.expenses : 0 };
}

/* ------------------------------------------------------------------ Own occupation */
export function ownOcc(x: { benefit: number; age: number; ownMonths: number; endAge: number }) {
  const all = Math.max(0, Math.round((x.endAge - x.age) * 12));
  const own = Math.min(all, x.ownMonths);
  return { allMonths: all, ownMonths: own, atRisk: all - own, totalOwn: r2(x.benefit * all), totalAny: r2(x.benefit * own), difference: r2(x.benefit * (all - own)) };
}

/* ------------------------------------------------------------------ Social Security offset over time */
export function offsetOverTime(x: { gross: number; ssdi: number; family: number; other: number; minBenefit: number; cola: number; years: number; frozen: boolean }) {
  const off0 = x.ssdi + x.family + x.other;
  const ltd0 = Math.max(x.gross - off0, Math.min(x.minBenefit, x.gross), 0);
  const grow = Math.pow(1 + x.cola, x.years);
  const ssdiN = (x.ssdi + x.family) * grow;
  const offN = (x.frozen ? x.ssdi + x.family : ssdiN) + x.other;
  const ltdN = Math.max(x.gross - offN, Math.min(x.minBenefit, x.gross), 0);
  return { offset: r2(off0), ltdNow: r2(ltd0), totalNow: r2(ltd0 + x.ssdi + x.family + x.other), ssdiLater: r2(ssdiN), ltdLater: r2(ltdN), totalLater: r2(ltdN + ssdiN + x.other) };
}

/* ------------------------------------------------------------------ Benefit needed */
/** Gross monthly benefit that leaves `need` in hand after federal tax, with the taxable share of the benefit. */
export function benefitNeeded(x: { need: number; otherMonthly: number; payer: Payer; employeeShare: number; st: Status }) {
  const share = taxableShare(x.payer, x.employeeShare);
  const target = Math.max(0, x.need - x.otherMonthly);
  let lo = 0, hi = target * 3 + 1000;
  for (let i = 0; i < 60; i++) {
    const mid = (lo + hi) / 2;
    const after = mid - taxAdded(mid * 12 * share, 0, x.st) / 12;
    if (after < target) lo = mid; else hi = mid;
  }
  return { target: r2(target), gross: Math.ceil(hi), share };
}

/* ------------------------------------------------------------------ Long-term care: premium limit and deduction */
export function ltcLimit(age: number, year: 2025 | 2026 = 2026): number {
  const t = (year === 2026 ? LTC.premiumLimits2026 : LTC.premiumLimits2025) as Array<[number | null, number]>;
  for (const [top, v] of t) if (top === null || age <= top) return v;
  return 0;
}
export interface LtcDedIn { age: number; premium: number; income: number; otherMedical: number; otherItemized: number; st: Status; path: 'itemize' | 'self' | 'hsa'; seProfit: number }
export function ltcDeduction(x: LtcDedIn) {
  const limit = ltcLimit(x.age);
  const eligible = Math.min(x.premium, limit);
  const m = marginalRate(x.income, x.st);
  if (x.path === 'self') {
    const ded = Math.min(eligible, Math.max(0, x.seProfit));
    const saved = r2(taxOn(x.income, x.st) - taxOn(x.income - ded, x.st));
    return { limit, eligible, counted: ded, saved, floor: 0, itemizes: false, marginal: m };
  }
  if (x.path === 'hsa') {
    return { limit, eligible, counted: eligible, saved: r2(eligible * m), floor: 0, itemizes: false, marginal: m };
  }
  const floor = r2(x.income * FED.medicalExpenseFloor);
  const std0 = FED.standardDeduction[x.st];
  const itemized = (med: number) => Math.max(0, med - floor) + x.otherItemized;
  const taxWith = (med: number) => bracketTax(Math.max(0, x.income - Math.max(std0, itemized(med))), x.st);
  const saved = r2(taxWith(x.otherMedical) - taxWith(x.otherMedical + eligible));
  const counted = r2(Math.max(0, x.otherMedical + eligible - floor) - Math.max(0, x.otherMedical - floor));
  return { limit, eligible, counted, saved, floor, itemizes: itemized(x.otherMedical + eligible) > std0, marginal: m };
}

/* ------------------------------------------------------------------ Long-term care: per diem exclusion (Pub. 525, Form 8853) */
export function perDiem(x: { daily: number; days: number; costs: number; reimbursed: number }) {
  const paid = x.daily * x.days;
  const limitTotal = LTC.perDiem2026 * x.days;
  const excludable = Math.max(0, Math.max(limitTotal, x.costs) - x.reimbursed);
  const taxable = Math.max(0, paid - excludable);
  return { paid: r2(paid), limitTotal: r2(limitTotal), excludable: r2(excludable), taxable: r2(taxable) };
}

/* ------------------------------------------------------------------ Long-term care: what a premium buys */
export type Inflation = 'none' | 'simple3' | 'compound3' | 'compound5';
export function ltcPool(x: { age: number; claimAge: number; daily: number; years: number; inflation: Inflation; premium: number }) {
  const n = Math.max(0, x.claimAge - x.age);
  const f = x.inflation === 'simple3' ? 1 + 0.03 * n : x.inflation === 'compound3' ? Math.pow(1.03, n) : x.inflation === 'compound5' ? Math.pow(1.05, n) : 1;
  const poolNow = x.daily * 365 * x.years;
  const dailyAtClaim = x.daily * f;
  const poolAtClaim = poolNow * f;
  const premiums = x.premium * n;
  return { yearsPaying: n, poolNow: r2(poolNow), dailyAtClaim: r2(dailyAtClaim), poolAtClaim: r2(poolAtClaim), premiums: r2(premiums), ratio: premiums > 0 ? poolAtClaim / premiums : 0, deductibleNow: Math.min(x.premium, ltcLimit(x.age)), perDiemGap: r2(Math.max(0, dailyAtClaim - LTC.perDiem2026)) };
}

/* ------------------------------------------------------------------ Hybrid life / long-term care */
export function hybrid(x: { death: number; pctMonth: number; months: number; careCost: number }) {
  const monthly = x.death * x.pctMonth;
  const exhaust = x.pctMonth > 0 ? Math.ceil(1 / x.pctMonth) : 0;
  const paidMonths = Math.min(x.months, exhaust);
  const perDiemMonth = LTC.perDiem2026 * 365 / 12;
  const taxableMonth = Math.max(0, monthly - Math.max(perDiemMonth, x.careCost));
  return { monthly: r2(monthly), exhaust, paid: r2(monthly * paidMonths), left: r2(Math.max(0, x.death - monthly * paidMonths)), perDiemMonth: r2(perDiemMonth), taxableMonth: r2(taxableMonth) };
}

/* ------------------------------------------------------------------ AD&D (FEGLI schedule as published by OPM) */
export type AddLoss = 'death' | 'one' | 'two';
export function addPayout(face: number, losses: AddLoss[]) {
  let total = 0;
  for (const l of losses) total += face * (l === 'death' ? ADD.death : l === 'one' ? ADD.oneLoss : ADD.twoOrMore);
  return r2(Math.min(total, face * ADD.capPerAccident));
}

/* ------------------------------------------------------------------ Fixed cash benefits against a health plan */
export function cashVsPlan(x: { payout: number; premium: number; deductible: number; oop: number }) {
  const gapCovered = Math.min(x.payout, x.oop);
  return { deductibleShare: x.deductible > 0 ? Math.min(1, x.payout / x.deductible) : 0, oopShare: x.oop > 0 ? Math.min(1, x.payout / x.oop) : 0, gapCovered: r2(gapCovered), leftOver: r2(Math.max(0, x.payout - x.oop)), yearsOfPremium: x.premium > 0 ? x.payout / x.premium : 0, unpaidAfter: r2(Math.max(0, x.oop - x.payout)) };
}

/* ------------------------------------------------------------------ BLS lookup */
export type BlsKind = 'all' | 'industry' | 'size' | 'region' | 'union' | 'hours' | 'wage';
export const GROUPS = BLS.groups as Array<{ kind: BlsKind; label: string; std: number | null; ltd: number | null; ltc: number | null }>;
export const groupOf = (label: string) => GROUPS.find((g) => g.label === label) ?? GROUPS[0];
