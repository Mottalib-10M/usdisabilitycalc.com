/**
 * One case, one figure on every screen (audit and naive testers of 2026-11-09). The home page showed $556 a week of
 * short-term disability and the short-term page $558 for the same case, because their hidden defaults differed; the
 * tax calculator added payroll tax into a line called "Federal tax"; the needs calculator called the whole budget
 * "Gap to fill". Each test locks one of these repairs.
 */
import { describe, expect, it } from 'vitest';
import { getTool, usd, EX, EX_WAIT_MONTHS } from '../src/lib/tool-specs';
import { ltd, std, PRIVATE } from '../src/lib/engine/cover';
import type { V } from '../src/lib/tool-types';

const run = (kind: string, over: V = {}) => {
  const s = getTool(kind);
  const v = { ...Object.fromEntries(s.inputs.map((i) => [i.id, i.def])), ...over } as V;
  return { out: s.run(v), v, s };
};
const row = (rows: Array<[string, string, number?]>, re: RegExp) => rows.find(([l]) => re.test(l))?.[1];
const example = () => ltd({ salary: EX.sal, pct: 0.6, cap: 10000, ssdi: 0, otherOffsets: 0, minBenefit: 0, payer: 'employer', employeeShare: 0, st: 'single', otherIncome: 0, elimDays: EX.elimDays });

describe('same case, same figure on every screen', () => {
  it('home and short-term page: same defaults, same weekly check', () => {
    const home = run('all').out, page = run('std');
    expect(page.v.sal).toBe(EX.sal);
    expect(page.v.wk).toBe(EX.stdWeeks);
    expect(page.v.wait).toBe(EX.stdWait);
    expect(row(home.rows, /short-term disability, a week after tax/)).toBe(page.out.value);
  });
  it('home and long-term page: same monthly check and same payroll tax line', () => {
    const home = run('all').out, page = run('ltd').out;
    expect(home.value).toBe(page.value);
    expect(row(home.rows, /^Social Security and Medicare/)).toBeDefined();
    expect(row(home.rows, /^Social Security and Medicare/)).toBe(row(page.rows, /^Social Security and Medicare/));
  });
  it('the elimination period sets the number of checks that carry payroll tax', () => {
    const r = example();
    expect(r.ficaMonths).toBe(6 - EX_WAIT_MONTHS);
    expect(r.ficaMonthly * r.ficaMonths).toBeCloseTo(r.ficaFirstYear, 1);
    expect(r.inHandFirst).toBeCloseTo(r.inHand - r.ficaMonthly, 2);
  });
  it('tax calculator: income tax and payroll tax on separate lines, the headline is what you keep', () => {
    const { out } = run('tax');
    expect(out.label).not.toMatch(/federal tax on/i);
    expect(out.label).toMatch(/keep/i);
    // Same $3,000 benefit as the long-term example: same payroll tax over the same checks.
    expect(row(out.rows, /^Social Security and Medicare/)).toBe(usd(example().ficaFirstYear));
  });
  it('pre-tax election: the tax on a one-year claim equals the tax calculator for the same benefit', () => {
    const pre = run('premium').out, tax = run('tax').out;
    expect(row(pre.rows, /^Income tax on them/)).toBe(row(tax.rows, /^Federal income tax added/));
    expect(row(pre.rows, /^Social Security and Medicare/)).toBe(row(tax.rows, /^Social Security and Medicare/));
    expect(pre.value).toMatch(/years$/);
  });
  it('needs calculator: the group plan after tax is taken off, the rest is the policy to buy', () => {
    const { out, v } = run('need');
    expect(out.rows.map(([l]) => l).join(' ')).not.toMatch(/gap to fill/i);
    const group = ltd({ salary: Number(v.sal), pct: Number(v.pct) / 100, cap: Number(v.cap), ssdi: 0, otherOffsets: 0, minBenefit: 0, payer: 'employer', employeeShare: 0, st: 'single', otherIncome: 0, elimDays: EX.elimDays }).inHand;
    expect(out.value).toBe(usd(Number(v.need) - group));
    expect(run('need', { pct: 0 }).out.value).toBe(usd(Number(v.need)));
  });
  it('the home short-term line is the engine at the plan medians and the shared absence', () => {
    const s = std({ salary: EX.sal, pct: (PRIVATE.std_median_pct ?? 60) / 100, capWeekly: PRIVATE.std_max_weekly_p50 ?? 1000, weeks: EX.stdWeeks, waitDays: EX.stdWait, payer: 'employer', employeeShare: 0, st: 'single' });
    expect(row(run('all').out.rows, /short-term/)).toBe(usd(s.netWeekly));
  });
  it('claim calculator: a claim at 61 runs to the end age, after the wait', () => {
    const { out } = run('claim', { age: 61 });
    expect(out.label).toBe(`Paid from age 61 to ${EX.endAge}, before tax`);
    expect(out.value).toBe(usd(example().net * Math.round((EX.endAge - 61) * 12 - EX.elimDays / 30.4375)));
  });
});

describe('words on the screens', () => {
  it('no "Your my", no "paid by my employer", no double negative, no "Gap to fill"', () => {
    const all = ['all', 'ltd', 'std', 'tax', 'premium', 'cost', 'need', 'claim'].map((k) => { const { out, s } = run(k); return JSON.stringify([out, s.inputs]); }).join(' ');
    expect(all).not.toMatch(/Your my/);
    expect(all).not.toMatch(/paid by my /);
    expect(all).not.toMatch(/not noncancelable/);
    expect(all).not.toMatch(/Gap to fill/);
  });
});
