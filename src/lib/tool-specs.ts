/**
 * The calculators of the site, rendered by components/calc/SpecTool.tsx (full tool) and MiniSim.tsx (mini-simulator).
 * Every amount comes from the engine (lib/engine/cover.ts) and its data files (IRS 2026 limits, BLS March 2026).
 * The reader enters only facts from a pay slip, a plan summary or a quote: no premium price is assumed anywhere.
 * `arg` overrides the default of any field by its id. This file ships to the browser.
 */
import type { ToolSpec, V, Input, ToolOut } from './tool-types';
import { formatMoney, formatPercent, formatNumber } from './format';
import {
  ltd, std, takeHome, taxableShare, taxAdded, sickPayFica, ssTaxable, premiumChoice, bridge, ownOcc, offsetOverTime,
  benefitNeeded, ltcLimit, ltcDeduction, perDiem, ltcPool, hybrid, addPayout, cashVsPlan, capRank, marginalRate,
  GROUPS, groupOf, PRIVATE, LTC, HSA, FED, type Payer, type Status, type Inflation, type AddLoss,
} from './engine/cover';

export const usd = (x: number) => `${x < -0.5 ? '-' : ''}${formatMoney(Math.abs(Math.round(x)), 0)}`;
export const pct = (x: number, d = 0) => formatPercent(x, d);
const n = (v: V, k: string) => Number(v[k]) || 0;
const s = (v: V, k: string) => String(v[k]);
const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
export const longDate = (iso: string) => `${MONTHS[Number(iso.slice(5, 7)) - 1]} ${Number(iso.slice(8, 10))}, ${iso.slice(0, 4)}`;
const mo = (x: number) => `${formatNumber(x, Number.isInteger(x) ? 0 : 1)} month${x === 1 ? '' : 's'}`;
const yr = (x: number) => `${formatNumber(x, Number.isInteger(x) ? 0 : 1)} year${x === 1 ? '' : 's'}`;

/* Fields shared by several calculators. */
const SAL = (def = 60000): Input => ({ id: 'sal', label: 'Yearly salary before tax', def, unit: '$', max: 5000000, help: 'Base pay the plan counts, usually without bonus' });
const FS: Input = { kind: 'select', id: 'fs', label: 'Tax filing status', def: 'single', adv: true, options: [{ value: 'single', label: 'Single' }, { value: 'mfj', label: 'Married filing jointly' }, { value: 'hoh', label: 'Head of household' }] };
export const PAYERS: Array<{ value: Payer; label: string }> = [
  { value: 'employer', label: 'My employer' },
  { value: 'pretax', label: 'Me, by pre-tax payroll deduction' },
  { value: 'aftertax', label: 'Me, by after-tax payroll deduction' },
  { value: 'split', label: 'Both: employer and my after-tax share' },
  { value: 'own', label: 'Me, an individual policy' },
];
const PAYER = (def: Payer = 'employer'): Input => ({ kind: 'select', id: 'payer', label: 'Who pays the premium', def, options: PAYERS, help: 'Your pay slip or benefits portal says whether the deduction is pre-tax' });
const SHARE: Input = { id: 'share', label: 'Your after-tax share of the premium, for a split plan', def: 30, unit: '%', max: 100, adv: true, help: 'Over the 3 policy years before this one' };
const PCT = (id: string, label: string, def: number, help?: string, adv = false): Input => ({ id, label, def, unit: '%', max: 100, help, adv });
const MONEY = (id: string, label: string, def: number, help?: string, adv = false, max = 10000000): Input => ({ id, label, def, unit: '$', max, help, adv });
const NUM = (id: string, label: string, def: number, unit: string, max: number, help?: string, adv = false): Input => ({ id, label, def, unit, max, help, adv });

const fsOf = (v: V) => (s(v, 'fs') || 'single') as Status;
const payerOf = (v: V) => (s(v, 'payer') || 'employer') as Payer;
const shareOf = (v: V) => n(v, 'share') / 100;
const payerName = (p: Payer) => PAYERS.find((x) => x.value === p)!.label.toLowerCase();
const taxWord = (share: number) => (share === 0 ? 'tax-free' : share === 1 ? 'fully taxable' : `${pct(share)} taxable`);

/** Applies `arg` to the defaults of a list of fields. */
function spec(inputs: Input[], arg: Record<string, number | string>, run: (v: V) => ToolOut): ToolSpec {
  return {
    inputs: inputs.map((i) => (arg[i.id] === undefined ? i : { ...i, def: (i.kind === 'choice' || i.kind === 'select') ? String(arg[i.id]) : Number(arg[i.id]) } as Input)),
    run,
  };
}

const ltdIn = (v: V) => ({
  salary: n(v, 'sal'), pct: n(v, 'pct') / 100, cap: n(v, 'cap'), ssdi: n(v, 'ssdi'), otherOffsets: n(v, 'oth'), minBenefit: n(v, 'min'),
  payer: payerOf(v), employeeShare: shareOf(v), st: fsOf(v), otherIncome: n(v, 'inc'), elimDays: v.elim === undefined ? 90 : n(v, 'elim'),
});

type Arg = Record<string, number | string>;
const SPECS: Record<string, (arg?: Arg) => ToolSpec> = {
  /** Home: one salary, the plan formulas, who pays, and both benefits after tax. */
  all: (arg = {}) => spec([
    SAL(), PAYER(), PCT('pct', 'Long-term disability: share of pay', PRIVATE.ltd_median_pct ?? 60, 'From your plan summary'),
    MONEY('cap', 'Long-term disability: monthly maximum', PRIVATE.ltd_max_monthly_p50 ?? 10000, 'From your plan summary; 0 if none'),
    PCT('spct', 'Short-term disability: share of pay', PRIVATE.std_median_pct ?? 60, undefined, true),
    MONEY('scap', 'Short-term disability: weekly maximum', PRIVATE.std_max_weekly_p50 ?? 1000, undefined, true),
    MONEY('ssdi', 'Social Security disability you expect, a month', 0, 'Your my Social Security statement shows it; plans subtract it', true),
    SHARE, FS,
  ], arg, (v) => {
    const r = ltd(ltdIn(v));
    const sd = std({ salary: n(v, 'sal'), pct: n(v, 'spct') / 100, capWeekly: n(v, 'scap'), weeks: 13, waitDays: 7, payer: payerOf(v), employeeShare: shareOf(v), st: fsOf(v) });
    const rows: ToolOut['rows'] = [
      ['Take-home pay now, a month', usd(r.takeHomeMonthly), r.takeHomeMonthly],
      ['Long-term disability before tax, a month', usd(r.net), r.net],
      ['Federal income tax on it, a month', usd(r.fedMonthly)],
      ['Short-term disability, a week before tax', usd(sd.weekly)],
      ['Short-term disability, a week after tax', usd(sd.netWeekly)],
    ];
    const table = {
      caption: 'The same plan, by who pays the premium: long-term disability in hand each month, after federal income tax',
      headers: ['Premium paid by', 'Benefit is', 'In hand a month'],
      rows: PAYERS.map((p) => { const x = ltd({ ...ltdIn(v), payer: p.value }); return [p.label, taxWord(x.share), usd(x.inHand)]; }),
      align: ['l', 'l', 'r'] as Array<'l' | 'r'>,
    };
    return {
      label: 'Long-term disability in hand, a month', value: usd(r.inHand), sub: `${pct(r.replaced)} of your take-home pay${r.capped ? ', held down by the monthly maximum' : ''}`,
      rows, table,
      note: `Federal income tax with the 2026 brackets and standard deduction; ${taxWord(r.share)} because the premium is paid by ${payerName(payerOf(v))}. State tax left out. Payroll tax applies to employer-funded benefits for the first 6 calendar months.`,
    };
  }),

  /** Long-term disability, a month. */
  ltd: (arg = {}) => spec([
    SAL(), PCT('pct', 'Share of pay the plan replaces', PRIVATE.ltd_median_pct ?? 60, 'From your plan summary'),
    MONEY('cap', 'Monthly maximum benefit', PRIVATE.ltd_max_monthly_p50 ?? 10000, 'From your plan summary; 0 if none'),
    PAYER(), MONEY('ssdi', 'Social Security disability, a month', 0, 'Primary and family benefits the plan subtracts'),
    MONEY('oth', 'Other income the plan subtracts, a month', 0, 'Workers’ compensation, state disability, pension', true),
    MONEY('min', 'Minimum monthly benefit in your plan', 0, 'From your plan summary; 0 if none', true),
    NUM('elim', 'Elimination period', 90, 'days', 730, 'Days before benefits start', true),
    MONEY('inc', 'Other taxable income of the household, a year', 0, 'A spouse’s pay, interest', true),
    SHARE, FS,
  ], arg, (v) => {
    const r = ltd(ltdIn(v));
    const rows: ToolOut['rows'] = [
      ['Plan formula before the maximum', usd(r.formula)],
      ['Benefit before offsets', usd(r.gross), r.gross],
      ['Offsets subtracted', usd(r.offsets), r.offsets],
      ['Paid by the plan', usd(r.net), r.net],
      ['Federal income tax, a month', usd(r.fedMonthly)],
      ['Social Security and Medicare, first months', `${usd(r.ficaFirstYear)} over ${mo(r.ficaMonths)}`],
      ['Take-home pay now, a month', usd(r.takeHomeMonthly)],
    ];
    return {
      label: 'Long-term disability in hand, a month', value: usd(r.inHand), sub: `${pct(r.replaced)} of take-home pay · plan pays ${usd(r.net)}${r.floorApplied ? ' (plan minimum)' : ''}`,
      rows,
      note: r.capped ? `The formula gives ${usd(r.formula)}, the maximum cuts it to ${usd(r.gross)}: that maximum sits ${capRank(n(v, 'cap'))} of private plans with a maximum (BLS, March 2026).` : `The benefit is ${taxWord(r.share)} for federal income tax because the premium is paid by ${payerName(payerOf(v))}.`,
    };
  }),

  /** Short-term disability, a week and in total. */
  std: (arg = {}) => spec([
    SAL(), PCT('pct', 'Share of pay the plan replaces', PRIVATE.std_median_pct ?? 60),
    MONEY('cap', 'Weekly maximum benefit', PRIVATE.std_max_weekly_p50 ?? 1000, 'From your plan summary; 0 if none'),
    NUM('wk', 'Weeks the plan pays', PRIVATE.std_weeks_p50 ?? 26, 'wk', 52, 'Your absence, up to the plan limit'),
    PAYER(), NUM('wait', 'Waiting period', 7, 'days', 180, 'Days unpaid before benefits start, from your plan', true), SHARE, FS,
  ], arg, (v) => {
    const r = std({ salary: n(v, 'sal'), pct: n(v, 'pct') / 100, capWeekly: n(v, 'cap'), weeks: n(v, 'wk'), waitDays: n(v, 'wait'), payer: payerOf(v), employeeShare: shareOf(v), st: fsOf(v) });
    return {
      label: 'Short-term disability, a week after tax', value: usd(r.netWeekly), sub: `${usd(r.weekly)} before tax${r.capped ? ' (weekly maximum)' : ''} · ${r.takeHomeWeekly > 0 ? pct(r.netWeekly / r.takeHomeWeekly) : '0%'} of take-home pay`,
      rows: [
        ['Total for the absence, before tax', usd(r.total), r.total],
        ['Federal income tax', usd(r.fed), r.fed],
        ['Social Security and Medicare', usd(r.fica), r.fica],
        ['Total in hand', usd(r.net), r.net],
        ['Take-home pay now, a week', usd(r.takeHomeWeekly)],
        ['Pay lost in the waiting period', usd(r.unpaidWait)],
      ],
      note: `The benefit is ${taxWord(r.share)}; employer-funded short-term disability is sick pay, with Social Security and Medicare withheld (IRS Pub. 15-A).`,
    };
  }),

  /** Tax on a disability benefit by premium payer. */
  tax: (arg = {}) => spec([
    MONEY('ben', 'Disability benefit, a month', 3000), NUM('mo', 'Months paid this year', 12, 'mo', 12), PAYER(),
    MONEY('inc', 'Other taxable income this year', 0, 'Wages before the disability, a spouse’s pay'),
    MONEY('ssdi', 'Social Security disability, a month', 0, undefined, true), SHARE, FS,
  ], arg, (v) => {
    const ben = n(v, 'ben'), m = n(v, 'mo'), p = payerOf(v), sh = taxableShare(p, shareOf(v)), st = fsOf(v), inc = n(v, 'inc');
    const year = ben * m, taxable = year * sh, ss = n(v, 'ssdi') * m;
    const ssT = ssTaxable(ss, inc + taxable, st);
    const fed = taxAdded(taxable + ssT, inc, st);
    const fica = sickPayFica(ben, sh, Math.min(m, 6), p);
    return {
      label: 'Federal tax on the benefit this year', value: usd(fed + fica), sub: `${taxWord(sh)} · ${usd(year - fed - fica)} left of ${usd(year)}`,
      rows: [
        ['Benefit received', usd(year), year],
        ['Part counted as income', usd(taxable), taxable],
        ['Federal income tax added', usd(fed), fed],
        ['Social Security and Medicare (6 months at most)', usd(fica), fica],
        ...(ss > 0 ? [['Taxable part of Social Security', usd(ssT)] as [string, string]] : []),
      ],
      table: { caption: 'The same benefit under each premium arrangement', headers: ['Premium paid by', 'Taxable', 'Tax this year'], align: ['l', 'r', 'r'],
        rows: PAYERS.map((x) => { const sh2 = taxableShare(x.value, shareOf(v)); const t = taxAdded(year * sh2 + ssTaxable(ss, inc + year * sh2, st), inc, st) + sickPayFica(ben, sh2, Math.min(m, 6), x.value); return [x.label, usd(year * sh2), usd(t)]; }) },
      note: 'Federal income tax with the 2026 brackets and standard deduction, no credit. Payroll tax counts the first 6 calendar months after the last month worked; your plan may pay it from the first day.',
    };
  }),

  /** Pre-tax or after-tax premium: the election. */
  premium: (arg = {}) => spec([
    SAL(), MONEY('prem', 'Your yearly premium for the coverage', 300, 'From your benefits enrollment page'),
    MONEY('ben', 'Monthly benefit it would pay', 3000, 'Plan formula and maximum'), NUM('mo', 'Length of a claim to test', 12, 'mo', 480), FS,
  ], arg, (v) => {
    const r = premiumChoice({ salary: n(v, 'sal'), premium: n(v, 'prem'), benefit: n(v, 'ben'), months: n(v, 'mo'), st: fsOf(v) });
    return {
      label: 'Years of pre-tax savings one claim would cost', value: formatNumber(r.yearsCovered, 1), sub: `pre-tax saves ${usd(r.extraYearly)} a year; a ${mo(n(v, 'mo'))} claim then costs ${usd(r.taxOnClaim)} in tax`,
      rows: [
        ['Premium paid after tax, a year', usd(r.afterTaxCost)],
        ['Same premium paid pre-tax, real cost', usd(r.preTaxCost)],
        ['Your marginal federal rate', pct(r.marginal)],
        ['Benefits over the claim', usd(r.claim), r.claim],
        ['Tax on them if the premium was pre-tax', usd(r.taxOnClaim), r.taxOnClaim],
      ],
      note: 'After-tax premiums make the benefit tax-free (IRS Pub. 525). The tax on a claim assumes no other income that year; with other income it is higher.',
    };
  }),

  /** What a quoted premium costs against what it can pay. No price is assumed: the reader enters the quote. */
  cost: (arg = {}) => spec([
    MONEY('prem', 'Monthly premium on your quote', 120), MONEY('ben', 'Monthly benefit it buys', 4000), SAL(),
    NUM('yrs', 'Years you expect to pay the premium', 25, 'yr', 50), PAYER('own'), FS,
  ], arg, (v) => {
    const prem = n(v, 'prem'), ben = n(v, 'ben'), sal = n(v, 'sal'), yrs = n(v, 'yrs'), p = payerOf(v), st = fsOf(v);
    const paid = prem * 12 * yrs;
    const sh = taxableShare(p, shareOf(v));
    const netBen = ben - taxAdded(ben * 12 * sh, 0, st) / 12;
    const pre = p === 'pretax' ? prem * 12 * (marginalRate(sal, st) + FED.socialSecurityRate + FED.medicareRate) : 0;
    return {
      label: 'Months of claim that return all the premiums', value: netBen > 0 ? formatNumber(Math.ceil((paid - pre * yrs) / netBen), 0) : '0', sub: `${usd(paid)} of premiums over ${yr(yrs)}`,
      rows: [
        ['Premium as a share of salary', sal > 0 ? pct(prem * 12 / sal, 1) : '0%'],
        ['Premium for each $100 of monthly benefit', ben > 0 ? formatMoney(prem / ben * 100, 2) : '$0'],
        ['Benefit in hand, a month', usd(netBen)],
        ['Tax saved on the premium, a year', usd(pre)],
      ],
      note: 'The site publishes no premium rates: enter the figure on your own quote or enrollment page. Premiums can change if the policy is not noncancelable.',
    };
  }),

  /** Elimination period: the gap before benefits start. */
  bridge: (arg = {}) => spec([
    MONEY('exp', 'Monthly spending you cannot cut', 4000), NUM('elim', 'Elimination period', 90, 'days', 730, 'From the policy or plan summary'),
    MONEY('sick', 'Sick pay or short-term disability, a month', 0, 'Paid during the waiting period'), MONEY('sav', 'Savings you can use', 10000),
  ], arg, (v) => {
    const r = bridge({ expenses: n(v, 'exp'), elimDays: n(v, 'elim'), sickPay: n(v, 'sick'), savings: n(v, 'sav') });
    return {
      label: 'Money missing before the first check', value: usd(r.shortfall), sub: `${usd(r.gap)} to bridge over ${formatNumber(r.months, 1)} months`,
      rows: [
        ['Spending during the waiting period', usd(r.need), r.need], ['Covered by sick pay', usd(r.covered), r.covered], ['Left to pay', usd(r.gap), r.gap],
        ['Months your savings last', formatNumber(r.savingsMonths, 1)],
      ],
      note: 'A plan that pays monthly in arrears sends the first check about a month after the waiting period ends. Add that month if your plan works that way.',
    };
  }),

  /** Own occupation against any occupation. */
  ownocc: (arg = {}) => spec([
    MONEY('ben', 'Monthly benefit', 5000), NUM('age', 'Age when the disability starts', 40, 'yr', 70),
    NUM('own', 'Own-occupation period in the contract', 24, 'mo', 600, 'Months; read the definition of disability'), NUM('end', 'Benefits end at age', 65, 'yr', 75, 'From the contract'),
  ], arg, (v) => {
    const r = ownOcc({ benefit: n(v, 'ben'), age: n(v, 'age'), ownMonths: n(v, 'own'), endAge: n(v, 'end') });
    return {
      label: 'Benefits that depend on the any-occupation test', value: usd(r.difference), sub: `${mo(r.atRisk)} of ${mo(r.allMonths)} if you could do some other job`,
      rows: [['Paid in full to the end age', usd(r.totalOwn), r.totalOwn], ['Paid if the any-occupation test stops it', usd(r.totalAny), r.totalAny], ['Months under your own job', mo(r.ownMonths)]],
      note: 'No cost-of-living raise. A true own-occupation contract keeps paying even if you work in another field; a modified one stops when you do.',
    };
  }),

  /** Social Security offset now and later. */
  offset: (arg = {}) => spec([
    MONEY('gross', 'Plan benefit before offsets, a month', 5000), MONEY('ssdi', 'Your Social Security disability, a month', 2000),
    MONEY('fam', 'Family benefits paid on your record, a month', 0, 'Children, spouse'), MONEY('oth', 'Other offsets, a month', 0, 'Workers’ compensation, state disability', true),
    MONEY('min', 'Plan minimum benefit', 0, 'From your plan; 0 if none', true), PCT('cola', 'Yearly Social Security raise to assume', 2, 'An assumption, not a forecast', true),
    NUM('yrs', 'Years later', 10, 'yr', 40, undefined, true),
    { kind: 'choice', id: 'frz', label: 'Offset frozen at the first award', def: 'yes', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], help: 'Read the offset clause of your plan', adv: true },
  ], arg, (v) => {
    const r = offsetOverTime({ gross: n(v, 'gross'), ssdi: n(v, 'ssdi'), family: n(v, 'fam'), other: n(v, 'oth'), minBenefit: n(v, 'min'), cola: n(v, 'cola') / 100, years: n(v, 'yrs'), frozen: s(v, 'frz') !== 'no' });
    return {
      label: 'Plan check after the offset, a month', value: usd(r.ltdNow), sub: `${usd(r.totalNow)} a month from the plan and Social Security together`,
      rows: [['Subtracted by the plan', usd(r.offset), r.offset], ['Plan check', usd(r.ltdNow), r.ltdNow], [`Social Security in ${yr(n(v, 'yrs'))}`, usd(r.ssdiLater)], [`Plan check in ${yr(n(v, 'yrs'))}`, usd(r.ltdLater)], [`Both together in ${yr(n(v, 'yrs'))}`, usd(r.totalLater)]],
      note: 'An award that comes late is often paid as a lump sum for past months; the plan then asks back what it overpaid.',
    };
  }),

  /** Benefit needed to keep a monthly budget. */
  need: (arg = {}) => spec([
    MONEY('need', 'Money you need each month, after tax', 4000), SAL(), PAYER(), MONEY('oth', 'Other money that keeps coming, a month', 0, 'A spouse’s pay, rent'),
    PCT('pct', 'Your plan: share of pay', PRIVATE.ltd_median_pct ?? 60, undefined, true), MONEY('cap', 'Your plan: monthly maximum', PRIVATE.ltd_max_monthly_p50 ?? 10000, '0 if no group plan', true), SHARE, FS,
  ], arg, (v) => {
    const r = benefitNeeded({ need: n(v, 'need'), otherMonthly: n(v, 'oth'), payer: payerOf(v), employeeShare: shareOf(v), st: fsOf(v) });
    const plan = Math.min(n(v, 'sal') / 12 * n(v, 'pct') / 100, n(v, 'cap') > 0 ? n(v, 'cap') : 0);
    const gap = Math.max(0, r.gross - plan);
    return {
      label: 'Monthly benefit to buy on top of your plan', value: usd(gap), sub: `${usd(r.gross)} needed before tax, your plan gives ${usd(plan)}`,
      rows: [['Gap to fill, after tax', usd(r.target), r.target], ['Benefit needed before tax', usd(r.gross), r.gross], ['Group plan benefit', usd(plan), plan], ['Share of the benefit taxed', pct(r.share)]],
      note: 'An individual policy bought with your own money pays tax-free. Insurers decide how much coverage they will issue against your income.',
    };
  }),

  /** BLS: who offers what, by employer. */
  employer: (arg = {}) => spec([
    { kind: 'select', id: 'g', label: 'Your employer', def: 'Private industry', options: GROUPS.map((g) => ({ value: g.label, label: g.label })) },
    SAL(),
  ], arg, (v) => {
    const g = groupOf(s(v, 'g')), sal = n(v, 'sal');
    const stdW = Math.min(sal / 52 * (PRIVATE.std_median_pct ?? 60) / 100, PRIVATE.std_max_weekly_p50 ?? Infinity);
    const ltdM = Math.min(sal / 12 * (PRIVATE.ltd_median_pct ?? 60) / 100, PRIVATE.ltd_max_monthly_p50 ?? Infinity);
    const f = (x: number | null) => (x === null ? 'not published' : `${formatNumber(x, 0)}%`);
    const same = GROUPS.filter((x) => x.kind === g.kind);
    return {
      label: `Workers offered long-term disability: ${g.label.toLowerCase()}`, value: f(g.ltd), sub: `short-term disability ${f(g.std)} · long-term care ${f(g.ltc)}`,
      rows: [['All civilian workers, long-term disability', f(GROUPS[0].ltd)], ['Median private plan, a week (short term)', usd(stdW)], ['Median private plan, a month (long term)', usd(ltdM)]],
      table: { caption: 'Share of workers with access, March 2026 (Bureau of Labor Statistics)', headers: ['Group', 'Short-term', 'Long-term', 'Long-term care'], rows: same.map((x) => [x.label, f(x.std), f(x.ltd), f(x.ltc)]), align: ['l', 'r', 'r', 'r'] },
      note: 'Median private plan: 60% of pay up to the median maximum, for workers whose plan pays a fixed share. Access means the employer offers the plan, paid or not.',
    };
  }),

  /** Self-employed: an individual policy bought with after-tax money. */
  self: (arg = {}) => spec([
    MONEY('inc', 'Net profit from self-employment, a year', 80000), MONEY('ben', 'Monthly benefit on the quote', 4000), MONEY('prem', 'Monthly premium on the quote', 150), FS,
  ], arg, (v) => {
    const inc = n(v, 'inc'), ben = n(v, 'ben'), prem = n(v, 'prem'), st = fsOf(v);
    const eq = benefitNeeded({ need: ben, otherMonthly: 0, payer: 'employer', employeeShare: 0, st }).gross;
    const after = inc - taxAdded(inc, 0, st);
    return {
      label: 'Benefit as a share of your profit', value: inc > 0 ? pct(ben * 12 / inc) : '0%', sub: `${usd(ben)} a month, tax-free, against ${usd(after / 12)} a month of profit after income tax`,
      rows: [['Premium as a share of profit', inc > 0 ? pct(prem * 12 / inc, 1) : '0%'], ['Taxable benefit that would equal it', usd(eq)], ['Premiums over 10 years', usd(prem * 120)], ['Months of benefit that repay 10 years', ben > 0 ? formatNumber(Math.ceil(prem * 120 / ben), 0) : '0']],
      note: 'Profit after federal income tax with the standard deduction, no credit; self-employment tax and state tax are not subtracted. A benefit bought with your own money is tax-free (IRS Pub. 525).',
    };
  }),

  /** Long-term care premium deduction (2026 limits by age). */
  ltcded: (arg = {}) => spec([
    NUM('age', 'Your age at the end of 2026', 62, 'yr', 110), MONEY('prem', 'Long-term care premium paid in 2026', 3000), MONEY('inc', 'Adjusted gross income', 80000),
    { kind: 'select', id: 'path', label: 'How you would deduct it', def: 'itemize', options: [{ value: 'itemize', label: 'Itemized medical expenses' }, { value: 'self', label: 'Self-employed health insurance deduction' }, { value: 'hsa', label: 'Paid from an HSA' }] },
    MONEY('med', 'Other medical expenses this year', 0, undefined, true), MONEY('oth', 'Other itemized deductions (mortgage interest, taxes, gifts)', 0, undefined, true),
    MONEY('se', 'Net profit of the business', 80000, 'Self-employed deduction only', true), FS,
  ], arg, (v) => {
    const path = s(v, 'path') as 'itemize' | 'self' | 'hsa';
    const r = ltcDeduction({ age: n(v, 'age'), premium: n(v, 'prem'), income: n(v, 'inc'), otherMedical: n(v, 'med'), otherItemized: n(v, 'oth'), st: fsOf(v), path, seProfit: n(v, 'se') });
    return {
      label: 'Federal tax saved by the premium', value: usd(r.saved), sub: `${usd(r.eligible)} of the premium counts, limit ${usd(r.limit)} at age ${n(v, 'age')}`,
      rows: [
        ['2026 limit for your age', usd(r.limit)], ['Premium that counts', usd(r.eligible), r.eligible],
        ...(path === 'itemize' ? [['Medical expenses ignored (7.5% of income)', usd(r.floor)], ['Itemizing beats the standard deduction', r.itemizes ? 'yes' : 'no']] as Array<[string, string]> : []),
        ['Your marginal federal rate', pct(r.marginal)],
      ],
      table: { caption: 'Deductible long-term care premium by age, 2025 and 2026 (Rev. Proc. 2024-40 and 2025-32)', headers: ['Age at the end of the year', '2025', '2026'], align: ['l', 'r', 'r'],
        rows: [['40 or under', 40], ['41 to 50', 50], ['51 to 60', 60], ['61 to 70', 70], ['71 or over', 71]].map(([l, a]) => [String(l), usd(ltcLimit(Number(a), 2025)), usd(ltcLimit(Number(a)))]) },
      note: path === 'hsa' ? 'An HSA can pay a qualified long-term care premium up to the age limit tax-free; the saving shown is the tax on that money at your marginal rate.' : 'Only a qualified (tax-qualified) long-term care contract counts. Federal income tax only.',
    };
  }),

  /** Long-term care benefits: the per diem exclusion. */
  perdiem: (arg = {}) => spec([
    MONEY('day', 'Benefit paid per day, flat (per diem)', 500), NUM('days', 'Days paid in 2026', 365, 'days', 366),
    MONEY('cost', 'Care costs you paid for those days', 120000), MONEY('reimb', 'Part of those costs already reimbursed', 0, 'By Medicare or another policy', true),
  ], arg, (v) => {
    const r = perDiem({ daily: n(v, 'day'), days: n(v, 'days'), costs: n(v, 'cost'), reimbursed: n(v, 'reimb') });
    return {
      label: 'Taxable part of the benefits', value: usd(r.taxable), sub: `${usd(r.paid)} paid · ${usd(r.excludable)} excluded`,
      rows: [['Paid by the policy', usd(r.paid), r.paid], [`2026 limit: ${usd(LTC.perDiem2026)} a day`, usd(r.limitTotal), r.limitTotal], ['Excluded from income', usd(r.excludable), r.excludable], ['Reported as income', usd(r.taxable), r.taxable]],
      note: 'Form 8853 compares the benefits with the larger of the daily limit and the actual costs, minus reimbursements. A policy that reimburses actual costs is not taxed this way.',
    };
  }),

  /** Long-term care: what a premium buys, with or without inflation protection. */
  ltcpool: (arg = {}) => spec([
    NUM('age', 'Age when you buy', 55, 'yr', 85), NUM('claim', 'Age at a claim to test', 80, 'yr', 100), MONEY('day', 'Daily benefit on the quote', 200), NUM('yrs', 'Benefit period', 3, 'yr', 10),
    { kind: 'select', id: 'inf', label: 'Inflation protection', def: 'compound3', options: [{ value: 'none', label: 'None' }, { value: 'simple3', label: '3% simple' }, { value: 'compound3', label: '3% compound' }, { value: 'compound5', label: '5% compound' }] },
    MONEY('prem', 'Yearly premium on the quote', 3000, 'Enter your quote: the site publishes no rates'),
  ], arg, (v) => {
    const r = ltcPool({ age: n(v, 'age'), claimAge: n(v, 'claim'), daily: n(v, 'day'), years: n(v, 'yrs'), inflation: s(v, 'inf') as Inflation, premium: n(v, 'prem') });
    return {
      label: `Benefit pool at age ${n(v, 'claim')}`, value: usd(r.poolAtClaim), sub: `${usd(r.dailyAtClaim)} a day then, ${usd(r.poolNow)} today`,
      rows: [['Premiums paid until then', usd(r.premiums), r.premiums], ['Pool at the claim age', usd(r.poolAtClaim), r.poolAtClaim], ['Pool for each $1 of premium', formatMoney(r.ratio, 2)], ['Premium deductible in 2026, at most', usd(r.deductibleNow)]],
      note: 'Premiums assumed flat; insurers can raise them for a whole class of policies. Benefits above the per diem limit can be taxable if the policy pays a flat daily amount.',
    };
  }),

  /** Hybrid life and long-term care: the death benefit paid out as care. */
  hybrid: (arg = {}) => spec([
    MONEY('db', 'Death benefit of the policy', 200000), PCT('pm', 'Share of it paid each month for care', 4, 'From the contract'), NUM('mo', 'Months of care to test', 36, 'mo', 240),
    MONEY('care', 'Care costs, a month', 6000),
  ], arg, (v) => {
    const r = hybrid({ death: n(v, 'db'), pctMonth: n(v, 'pm') / 100, months: n(v, 'mo'), careCost: n(v, 'care') });
    return {
      label: 'Care benefit, a month', value: usd(r.monthly), sub: `the death benefit lasts ${mo(r.exhaust)} of care`,
      rows: [['Paid over the months tested', usd(r.paid), r.paid], ['Death benefit left for heirs', usd(r.left), r.left], ['Per diem limit, a month (2026)', usd(r.perDiemMonth)], ['Possibly taxable, a month', usd(r.taxableMonth)]],
      note: 'Contracts with an extension of benefits rider keep paying after the death benefit is used up; enter only what your contract states.',
    };
  }),

  /** AD&D: the schedule. */
  add: (arg = {}) => spec([
    MONEY('face', 'Principal sum (the AD&D amount)', 100000),
    { kind: 'select', id: 'loss', label: 'What the accident caused', def: 'one', options: [{ value: 'death', label: 'Death' }, { value: 'one', label: 'Loss of one hand, foot or eye' }, { value: 'two', label: 'Two or more of these losses' }, { value: 'onethendeath', label: 'One loss, then death from the same accident' }] },
  ], arg, (v) => {
    const face = n(v, 'face'), l = s(v, 'loss');
    const losses: AddLoss[] = l === 'onethendeath' ? ['one', 'death'] : [l as AddLoss];
    const pay = addPayout(face, losses);
    return {
      label: 'Payment under the FEGLI-style schedule', value: usd(pay), sub: `${face > 0 ? pct(pay / face) : '0%'} of the principal sum`,
      rows: [['Death', usd(face * 1)], ['One hand, foot or eye', usd(face * 0.5)], ['Two or more', usd(face * 1)], ['Most for one accident', usd(face)]],
      note: 'Schedule of the federal employees’ plan (OPM). Private policies print their own schedule, often with more lines; read yours. Death from illness pays nothing under AD&D.',
    };
  }),

  /** Accident or critical illness cash benefit against the health plan’s deductible and out-of-pocket maximum. */
  cash: (arg = {}) => spec([
    MONEY('pay', 'Cash the policy pays for the event', 5000, 'From the benefit schedule'), MONEY('prem', 'Yearly premium', 300),
    MONEY('ded', 'Deductible of your health plan', HSA.hdhpMinDeductible.self), MONEY('oop', 'Out-of-pocket maximum of your health plan', HSA.hdhpMaxOutOfPocket.self),
  ], arg, (v) => {
    const r = cashVsPlan({ payout: n(v, 'pay'), premium: n(v, 'prem'), deductible: n(v, 'ded'), oop: n(v, 'oop') });
    return {
      label: 'Share of your worst-case medical bill it covers', value: pct(r.oopShare), sub: `${usd(r.gapCovered)} of ${usd(n(v, 'oop'))} out of pocket`,
      rows: [['Share of the deductible', pct(r.deductibleShare)], ['Left for other bills', usd(r.leftOver)], ['Still yours after the payment', usd(r.unpaidAfter)], ['Years of premium the payment equals', formatNumber(r.yearsOfPremium, 1)]],
      note: `Defaults: the 2026 floor deductible (${usd(HSA.hdhpMinDeductible.self)}) and ceiling on out-of-pocket costs (${usd(HSA.hdhpMaxOutOfPocket.self)}) of an HSA plan, self-only. Enter your own plan’s figures.`,
    };
  }),

  /** Hospital indemnity: admission plus daily benefit. */
  hospital: (arg = {}) => spec([
    MONEY('adm', 'Benefit for an admission', 1000), MONEY('day', 'Benefit per day in hospital', 200), NUM('days', 'Days in hospital', 3, 'days', 365),
    MONEY('prem', 'Yearly premium', 240), MONEY('ded', 'Deductible of your health plan', HSA.hdhpMinDeductible.self, undefined, true), MONEY('oop', 'Out-of-pocket maximum of your health plan', HSA.hdhpMaxOutOfPocket.self, undefined, true),
  ], arg, (v) => {
    const total = n(v, 'adm') + n(v, 'day') * n(v, 'days');
    const r = cashVsPlan({ payout: total, premium: n(v, 'prem'), deductible: n(v, 'ded'), oop: n(v, 'oop') });
    return {
      label: 'Paid for the stay', value: usd(total), sub: `${pct(r.deductibleShare)} of the deductible · ${formatNumber(r.yearsOfPremium, 1)} years of premium`,
      rows: [['Admission benefit', usd(n(v, 'adm'))], ['Daily benefits', usd(n(v, 'day') * n(v, 'days'))], ['Deductible left to pay', usd(Math.max(0, n(v, 'ded') - total))], ['Out-of-pocket left at worst', usd(r.unpaidAfter)]],
      note: 'A fixed payment, whatever the bill. It is not health coverage and does not count toward the deductible.',
    };
  }),
};

export function getTool(kind: string, arg?: Arg): ToolSpec {
  const f = SPECS[kind];
  if (!f) throw new Error(`Unknown tool ${kind}`);
  return f(arg);
}
export const TOOL_KINDS = Object.keys(SPECS);
export const takeHomeYear = takeHome;
