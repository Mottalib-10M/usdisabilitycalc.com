/** Engine tests: the official worked examples (IRS, OPM) and the 2026 limits, checked by hand against the sources. */
import { describe, expect, it } from 'vitest';
import {
  bracketTax, taxOn, taxAdded, marginalRate, fica, taxableShare, sickPayFica, ssTaxable, ltd, std, premiumChoice, bridge, ownOcc,
  offsetOverTime, benefitNeeded, ltcLimit, ltcDeduction, perDiem, ltcPool, hybrid, addPayout, cashVsPlan, capRank, GROUPS, PRIVATE,
} from '../src/lib/engine/cover';
import { getTool, TOOL_KINDS } from '../src/lib/tool-specs';

describe('federal income tax 2026 (Rev. Proc. 2025-32)', () => {
  it('bracket edges, single', () => { expect(bracketTax(12400, 'single')).toBeCloseTo(1240, 2); expect(bracketTax(50400, 'single')).toBeCloseTo(5800, 2); expect(bracketTax(105700, 'single')).toBeCloseTo(17966, 2); });
  it('bracket edge, married filing jointly', () => expect(bracketTax(100800, 'mfj')).toBeCloseTo(11600, 2));
  it('bracket edge, head of household', () => expect(bracketTax(17700, 'hoh')).toBeCloseTo(1770, 2));
  it('standard deduction $16,100 single', () => { expect(taxOn(16100, 'single')).toBe(0); expect(taxOn(26100, 'single')).toBeCloseTo(1000, 2); });
  it('tax added on top of other income', () => expect(taxAdded(10000, 40000, 'single')).toBeCloseTo(1200, 2));
  it('marginal rates', () => { expect(marginalRate(10000, 'single')).toBe(0); expect(marginalRate(60000, 'single')).toBe(0.12); expect(marginalRate(90000, 'single')).toBe(0.22); });
  it('payroll tax stops at the $184,500 wage base', () => { expect(fica(100000)).toBeCloseTo(7650, 2); expect(fica(200000)).toBeCloseTo(184500 * 0.062 + 200000 * 0.0145, 2); });
});

describe('who paid the premium (Pub. 525, Pub. 15-A)', () => {
  it('employer and pre-tax premiums make the benefit taxable, after-tax premiums tax-free', () => {
    expect(taxableShare('employer')).toBe(1); expect(taxableShare('pretax')).toBe(1);
    expect(taxableShare('aftertax')).toBe(0); expect(taxableShare('own')).toBe(0);
  });
  it('Alan (Pub. 15-A): employer paid 70%, $1,400 of each $2,000 is taxable sick pay', () => {
    expect(2000 * taxableShare('split', 0.3)).toBeCloseTo(1400, 6);
  });
  it('payroll tax on the taxable part, 6 calendar months at most (Ralph)', () => {
    expect(sickPayFica(2000, 0.7, 3, 'split')).toBeCloseTo(1400 * 3 * 0.0765, 2);
    expect(sickPayFica(2000, 1, 9, 'employer')).toBeCloseTo(2000 * 6 * 0.0765, 2);
    expect(sickPayFica(2000, 1, 9, 'own')).toBe(0);
  });
});

describe('Social Security benefits (Pub. 915 worksheet)', () => {
  it('nothing taxable under the base amount', () => expect(ssTaxable(12000, 10000, 'single')).toBe(0));
  it('the worksheet example: line 10 at $13,500 married, benefits $10,000, taxable $6,275', () => expect(ssTaxable(10000, 32000 + 13500 - 5000, 'mfj')).toBeCloseTo(6275, 2));
  it('never more than 85%', () => expect(ssTaxable(20000, 500000, 'single')).toBeCloseTo(17000, 2));
});

describe('disability benefits', () => {
  const base = { salary: 120000, pct: 0.6, cap: 5000, ssdi: 0, otherOffsets: 0, minBenefit: 0, payer: 'employer' as const, employeeShare: 0, st: 'single' as const, otherIncome: 0, elimDays: 90 };
  it('long-term: formula, cap and offsets', () => {
    const r = ltd(base);
    expect(r.formula).toBe(6000); expect(r.gross).toBe(5000); expect(r.capped).toBe(true);
    expect(ltd({ ...base, ssdi: 2000 }).net).toBe(3000);
  });
  it('long-term: the plan minimum holds when offsets exceed the benefit', () => { const r = ltd({ ...base, ssdi: 6000, minBenefit: 100 }); expect(r.net).toBe(100); expect(r.floorApplied).toBe(true); });
  it('long-term: an individual policy pays tax-free', () => { const r = ltd({ ...base, payer: 'own' }); expect(r.fedMonthly).toBe(0); expect(r.inHand).toBe(5000); });
  it('long-term: a 90-day wait leaves 3 months of payroll tax', () => expect(ltd(base).ficaMonths).toBe(3));
  it('short-term: 60% of weekly pay with a weekly cap', () => {
    const r = std({ salary: 52000, pct: 0.6, capWeekly: 500, weeks: 13, waitDays: 7, payer: 'aftertax', employeeShare: 0, st: 'single' });
    expect(r.formula).toBe(600); expect(r.weekly).toBe(500); expect(r.total).toBe(6500); expect(r.fed).toBe(0); expect(r.fica).toBe(0);
  });
  it('BLS cap percentiles', () => { expect(capRank(PRIVATE.ltd_max_monthly_p50!)).toBe('at or above the 50th percentile'); expect(capRank(1000)).toBe('below the 10th percentile'); });
  it('pre-tax premium: savings a year and tax on a claim', () => {
    const r = premiumChoice({ salary: 60000, premium: 300, benefit: 3000, months: 12, st: 'single' });
    expect(r.marginal).toBe(0.12); expect(r.extraYearly).toBeCloseTo(300 * 0.1965, 2); expect(r.taxOnClaim).toBeGreaterThan(0);
  });
  it('waiting period bridge', () => { const r = bridge({ expenses: 3000, elimDays: 90, sickPay: 1000, savings: 2000 }); expect(r.need).toBeCloseTo(3000 * 90 / 30.4375, 1); expect(r.shortfall).toBeGreaterThan(0); });
  it('own occupation for 24 months from 40 to 65', () => { const r = ownOcc({ benefit: 5000, age: 40, ownMonths: 24, endAge: 65 }); expect(r.allMonths).toBe(300); expect(r.difference).toBe(5000 * 276); });
  it('offset frozen: later Social Security raises stay with you', () => {
    const r = offsetOverTime({ gross: 5000, ssdi: 2000, family: 0, other: 0, minBenefit: 0, cola: 0.02, years: 10, frozen: true });
    expect(r.ltdNow).toBe(3000); expect(r.ltdLater).toBe(3000); expect(r.totalLater).toBeGreaterThan(5000);
    expect(offsetOverTime({ gross: 5000, ssdi: 2000, family: 0, other: 0, minBenefit: 0, cola: 0.02, years: 10, frozen: false }).totalLater).toBeCloseTo(5000, 0);
  });
  it('benefit needed: a tax-free benefit equals the need', () => {
    expect(benefitNeeded({ need: 4000, otherMonthly: 0, payer: 'own', employeeShare: 0, st: 'single' }).gross).toBe(4000);
    expect(benefitNeeded({ need: 4000, otherMonthly: 0, payer: 'employer', employeeShare: 0, st: 'single' }).gross).toBeGreaterThan(4000);
  });
});

describe('long-term care (Rev. Proc. 2025-32 and 2024-40)', () => {
  it('2026 premium limits by age, upper bound included', () => {
    expect(ltcLimit(40)).toBe(500); expect(ltcLimit(41)).toBe(930); expect(ltcLimit(50)).toBe(930); expect(ltcLimit(60)).toBe(1860);
    expect(ltcLimit(70)).toBe(4960); expect(ltcLimit(71)).toBe(6200);
  });
  it('2025 limits', () => { expect(ltcLimit(65, 2025)).toBe(4810); expect(ltcLimit(80, 2025)).toBe(6020); expect(ltcLimit(30, 2025)).toBe(480); });
  it('itemizing below the standard deduction saves nothing', () => expect(ltcDeduction({ age: 65, premium: 3000, income: 60000, otherMedical: 0, otherItemized: 0, st: 'single', path: 'itemize', seProfit: 0 }).saved).toBe(0));
  it('self-employed: up to the age limit and the profit', () => {
    const r = ltcDeduction({ age: 65, premium: 6000, income: 80000, otherMedical: 0, otherItemized: 0, st: 'single', path: 'self', seProfit: 80000 });
    expect(r.counted).toBe(4960); expect(r.saved).toBeCloseTo(4960 * 0.22, 0);
  });
  it('per diem: $430 a day or actual costs, whichever is larger', () => {
    const r = perDiem({ daily: 500, days: 365, costs: 120000, reimbursed: 0 });
    expect(r.limitTotal).toBe(430 * 365); expect(r.excludable).toBe(430 * 365); expect(r.taxable).toBe((500 - 430) * 365);
    expect(perDiem({ daily: 500, days: 365, costs: 200000, reimbursed: 0 }).taxable).toBe(0);
  });
  it('benefit pool with 3% compound growth', () => { const r = ltcPool({ age: 55, claimAge: 80, daily: 200, years: 3, inflation: 'compound3', premium: 3000 }); expect(r.poolAtClaim).toBeCloseTo(200 * 365 * 3 * Math.pow(1.03, 25), 0); expect(r.premiums).toBe(75000); });
  it('hybrid: 4% a month lasts 25 months', () => { const r = hybrid({ death: 200000, pctMonth: 0.04, months: 36, careCost: 6000 }); expect(r.monthly).toBe(8000); expect(r.exhaust).toBe(25); expect(r.left).toBe(0); });
});

describe('AD&D (OPM FEGLI Handbook)', () => {
  it('Ileana: BIA $42,000, one arm $21,000, both eyes later, total capped at $42,000', () => {
    expect(addPayout(42000, ['one'])).toBe(21000);
    expect(addPayout(42000, ['one', 'two'])).toBe(42000);
    expect(addPayout(42000, ['one', 'death'])).toBe(42000);
  });
  it('death pays the full amount', () => expect(addPayout(100000, ['death'])).toBe(100000));
});

describe('cash benefits and BLS data', () => {
  it('payment against the out-of-pocket maximum', () => { const r = cashVsPlan({ payout: 5000, premium: 250, deductible: 1700, oop: 8500 }); expect(r.unpaidAfter).toBe(3500); expect(r.yearsOfPremium).toBe(20); });
  it('37 BLS groups, civilian first', () => { expect(GROUPS).toHaveLength(37); expect(GROUPS[0].ltd).toBe(38); });
});

describe('calculators', () => {
  for (const k of TOOL_KINDS) it(`${k} runs with its defaults and never shows NaN`, () => {
    const spec = getTool(k);
    const v = Object.fromEntries(spec.inputs.map((i) => [i.id, i.def]));
    expect(JSON.stringify(spec.run(v))).not.toMatch(/NaN|undefined|Infinity/);
  });
  it('every payer and status in the home calculator', () => {
    for (const payer of ['employer', 'pretax', 'aftertax', 'split', 'own']) for (const fs of ['single', 'mfj', 'hoh']) {
      const spec = getTool('all', { payer, fs });
      expect(JSON.stringify(spec.run(Object.fromEntries(spec.inputs.map((i) => [i.id, i.def]))))).not.toMatch(/NaN|undefined|Infinity/);
    }
  });
  it('zero inputs never break a calculator', () => {
    for (const k of TOOL_KINDS) { const spec = getTool(k); const v = Object.fromEntries(spec.inputs.map((i) => [i.id, i.kind === 'choice' || i.kind === 'select' ? i.def : 0])); expect(JSON.stringify(spec.run(v)), k).not.toMatch(/NaN|undefined|Infinity/); }
  });
});
