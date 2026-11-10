/**
 * The calculators of the site, rendered by components/calc/SpecTool.tsx (full tool) and MiniSim.tsx (mini-simulator).
 * Every amount comes from the engine (lib/engine/cover.ts) and its data files (IRS 2026 limits, BLS March 2026).
 * The reader enters only facts from a pay slip, a plan summary or a quote: no premium price is assumed anywhere.
 * `arg` overrides the default of any field by its id. This file ships to the browser.
 */
import type { ToolSpec, V, Input, ToolOut } from './tool-types';
import { formatMoney, formatPercent, formatNumber } from './format';
import {
  ltd, ltdTotal, std, takeHome, taxableShare, taxAdded, sickPayFica, ssTaxable, premiumChoice, bridge, ownOcc, offsetOverTime,
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

/**
 * ONE example case for the whole site (naive testers, 2026-11-09: the same case showed $556 on the home page and $558
 * on the short-term page). Every calculator and every page text starts from these figures, so a reader never sees two
 * amounts for one case: a $60,000 salary; a short-term absence of 13 weeks after 7 unpaid days, handed over to a
 * long-term plan with a 90-day elimination period. Payroll tax then falls on the first 3 long-term checks
 * (6 calendar months after the last month worked, minus the 3 months of waiting). tests/coherence.test.ts locks it.
 */
export const EX = { sal: 60000, stdWeeks: 13, stdWait: 7, elimDays: 90, age: 45, endAge: 65 } as const;
/** Months between the last day worked and the first long-term check. */
export const EX_WAIT_MONTHS = Math.ceil(EX.elimDays / 30.4375);

/* Fields shared by several calculators. */
const SAL = (def: number = EX.sal): Input => ({ id: 'sal', label: 'Yearly salary before tax', def, unit: '$', max: 5000000, help: 'Base pay the plan counts, usually without bonus' });
/** Visible on every calculator (brief of 2026-11-10, rule 5: an assumption that changes the result is never folded). */
const FS: Input = { kind: 'select', id: 'fs', label: 'Married or single (for tax)', short: 'for tax:', def: 'single', help: 'Not sure? Keep Single: it counts the most tax', options: [{ value: 'single', label: 'Single' }, { value: 'mfj', label: 'Married filing jointly' }, { value: 'hoh', label: 'Head of household' }] };
export const PAYERS: Array<{ value: Payer; label: string }> = [
  { value: 'employer', label: 'My employer pays it all' },
  { value: 'pretax', label: 'Taken from my pay before tax (pre-tax)' },
  { value: 'aftertax', label: 'Taken from my pay after tax' },
  { value: 'split', label: 'Shared: my employer and me (my part after tax)' },
  { value: 'own', label: 'I bought it myself (individual policy)' },
];
/** The payer of the example in plain words; "Not sure" says what it is counted as. */
const paidBy = (v: V) => (s(v, 'payer') === 'unsure' ? 'payer not known, counted as your employer' : PAID_BY[payerOf(v)]);
/** A row of the "by who pays" tables: the shared case says the split it assumes (testers 2026-11-09: "70% taxable"?). */
const payerRow = (p: Payer, share: number) => (p === 'split' ? `Shared: employer pays ${pct(1 - share)}, I pay ${pct(share)} after tax` : PAYERS.find((x) => x.value === p)!.label);
/** The example case in plain words, for the mention shown on an untouched result (brief of 2026-11-09, second pass). */
const PAID_BY: Record<Payer, string> = {
  employer: 'plan paid by your employer', pretax: 'premium taken from your pay before tax', aftertax: 'premium taken from your pay after tax',
  split: 'premium shared with your employer', own: 'a policy you bought yourself',
};
const PAYER_HELP = 'No disability line on your pay stub: your employer pays. A line marked pre-tax: the pre-tax option. Not sure? Keep “Not sure”';
/** The way out for a reader who does not know (brief of 2026-11-10, rule 5): counted as employer-paid, the case of most
 *  covered workers, which also shows the most tax. Never in the "by who pays" tables. */
const UNSURE = { value: 'unsure', label: 'Not sure (counted as employer-paid)' };
const PAYER = (def: Payer | 'unsure' = 'unsure', help = PAYER_HELP): Input => ({ kind: 'select', id: 'payer', label: 'Who pays for this insurance (the premium)', def, options: [UNSURE, ...PAYERS], help });
const SHARE: Input = { id: 'share', label: 'Shared cost only: the part you pay from your pay after tax', short: 'your part if shared', def: 30, unit: '%', max: 100, adv: true, help: 'Only if you picked “Shared” above' };
const PCT = (id: string, label: string, def: number, help?: string, adv = false): Input => ({ id, label, def, unit: '%', max: 100, help, adv });
const MONEY = (id: string, label: string, def: number, help?: string, adv = false, max = 10000000): Input => ({ id, label, def, unit: '$', max, help, adv });
const NUM = (id: string, label: string, def: number, unit: string, max: number, help?: string, adv = false): Input => ({ id, label, def, unit, max, help, adv });

/** Census divisions of the BLS survey, with their states (U.S. Census Bureau, census regions and divisions). */
const DIVISION_STATES: Record<string, string> = {
  'New England': 'CT, ME, MA, NH, RI, VT', 'Middle Atlantic': 'NJ, NY, PA', 'East North Central': 'IL, IN, MI, OH, WI',
  'West North Central': 'IA, KS, MN, MO, NE, ND, SD', 'South Atlantic': 'DE, DC, FL, GA, MD, NC, SC, VA, WV',
  'East South Central': 'AL, KY, MS, TN', 'West South Central': 'AR, LA, OK, TX', Mountain: 'AZ, CO, ID, MT, NV, NM, UT, WY', Pacific: 'AK, CA, HI, OR, WA',
};
export const groupLabel = (l: string) => (DIVISION_STATES[l] ? `${l} (${DIVISION_STATES[l]})` : l);
const fsOf = (v: V) => (s(v, 'fs') || 'single') as Status;
const payerOf = (v: V) => { const p = s(v, 'payer'); return (!p || p === 'unsure' ? 'employer' : p) as Payer; };
const shareOf = (v: V) => n(v, 'share') / 100;
/** Why the benefit is taxed or not, in the reader's own terms ("because your employer pays the premium"). */
const PAYS: Record<Payer, string> = {
  employer: 'your employer pays the premium', pretax: 'you pay the premium by pre-tax payroll deduction', aftertax: 'you pay the premium after tax',
  split: 'your employer pays part of the premium', own: 'you bought the policy with your own money',
};
const payerName = (p: Payer) => PAYS[p];
/** Why the benefit is taxed, said honestly when the reader picked “Not sure”. */
const taxLine = (share: number, v: V) => (s(v, 'payer') === 'unsure'
  ? `You kept “Not sure”, so the benefit is counted as paid by your employer, the most common case: ${taxWord(share)}.`
  : `The benefit is ${taxWord(share)} because ${payerName(payerOf(v))}.`);
/** What is left, from the rounded lines the reader sees, so that the subtraction on screen is exact. */
const keep = (x: number, ...cuts: number[]) => Math.round(x) - cuts.reduce((t, c) => t + Math.round(c), 0);
const fsWord = (v: V) => ({ single: 'single', mfj: 'married filing jointly', hoh: 'head of household' } as Record<string, string>)[s(v, 'fs') || 'single'];
const taxWord = (share: number) => (share === 0 ? 'tax-free' : share === 1 ? 'fully taxable' : `${pct(share)} taxable (the employer’s part)`);

/** Applies `arg` to the defaults of a list of fields. */
function spec(inputs: Input[], arg: Record<string, number | string>, run: (v: V) => ToolOut): ToolSpec {
  return {
    inputs: inputs.map((i) => (arg[i.id] === undefined ? i : { ...i, def: (i.kind === 'choice' || i.kind === 'select') ? String(arg[i.id]) : Number(arg[i.id]) } as Input)),
    run,
  };
}

const ltdIn = (v: V) => ({
  salary: n(v, 'sal'), pct: n(v, 'pct') / 100, cap: n(v, 'cap'), ssdi: n(v, 'ssdi'), otherOffsets: n(v, 'oth'), minBenefit: n(v, 'min'),
  payer: payerOf(v), employeeShare: shareOf(v), st: fsOf(v), otherIncome: n(v, 'inc'), elimDays: v.elim === undefined ? EX.elimDays : n(v, 'elim'),
});
/** Short-term plan of the example case (home page and short-term page share it). */
const stdIn = (v: V, pctKey: string, capKey: string) => ({
  salary: n(v, 'sal'), pct: n(v, pctKey) / 100, capWeekly: n(v, capKey), weeks: v.wk === undefined ? EX.stdWeeks : n(v, 'wk'),
  waitDays: v.wait === undefined ? EX.stdWait : n(v, 'wait'), payer: payerOf(v), employeeShare: shareOf(v), st: fsOf(v),
});
const PLAN_PCT_HELP = (def: number) => `From your plan summary. No summary? Keep ${def}%, the most common plan`;
const PLAN_CAP_HELP = (def: number) => `From your plan summary; 0 if none. No summary? Keep ${usd(def)}, the typical maximum`;
/** Row and line that say what payroll tax takes from the first long-term checks. */
const ficaRow = (r: ReturnType<typeof ltd>): ToolOut['rows'] => (r.ficaMonthly > 0 ? [[`Payroll tax (Social Security and Medicare), first ${r.ficaMonths} checks only`, `${usd(r.ficaMonthly)} a month`]] : []);
/** Why the first checks are smaller, said where the reader sees them (testers 2026-11-09: "$2,822 or $2,592?"). */
const firstChecks = (r: ReturnType<typeof ltd>) => (r.ficaMonthly > 0 ? ` The first ${r.ficaMonths} checks are ${usd(keep(r.inHand, r.ficaMonthly))}: payroll tax (Social Security and Medicare) is still taken out for 6 months after you stop work.` : '');

type Arg = Record<string, number | string>;
const SPECS: Record<string, (arg?: Arg) => ToolSpec> = {
  /** Home: one salary, who pays, and the checks in the order they come (brief of 2026-11-10, rule 1: each amount says
   *  its period; testers: "$556 a week" next to monthly amounts, "$2,822 or $2,592?"). */
  all: (arg = {}) => {
    const ltdPct = PRIVATE.ltd_median_pct ?? 60, ltdCap = PRIVATE.ltd_max_monthly_p50 ?? 10000;
    return spec([
      SAL(), PAYER(), FS,
      { ...PCT('pct', 'Long-term disability: share of pay', ltdPct, PLAN_PCT_HELP(ltdPct), true), short: 'plan pays' },
      { ...MONEY('cap', 'Long-term disability: monthly maximum', ltdCap, PLAN_CAP_HELP(ltdCap), true), short: 'up to' },
      { ...PCT('spct', 'Short-term disability: share of pay', PRIVATE.std_median_pct ?? 60, undefined, true), short: 'short-term share of pay' },
      { ...MONEY('scap', 'Short-term disability: weekly maximum', PRIVATE.std_max_weekly_p50 ?? 1000, undefined, true), short: 'short-term weekly maximum' },
      { ...MONEY('ssdi', 'Disability checks you expect from Social Security, a month (0 if none)', 0, 'Your Social Security statement shows it; plans subtract it', true), short: 'Social Security disability checks' },
      SHARE,
    ], arg, (v) => {
      const r = ltd(ltdIn(v));
      const sd = std(stdIn(v, 'spct', 'scap'));
      const first = keep(r.inHand, r.ficaMonthly);
      const m0 = EX_WAIT_MONTHS + 1, m1 = EX_WAIT_MONTHS + r.ficaMonths;
      // The checks in the order they come, each with its period (testers 2026-11-10).
      const rows: ToolOut['rows'] = [
        ['Take-home pay now', `${usd(r.takeHomeMonthly)} a month`, r.takeHomeMonthly],
        [`Months 1 to ${EX_WAIT_MONTHS}, after ${EX.stdWait} unpaid days: short-term plan if you have one, after tax`, `${usd(sd.netWeekly)} a week`],
        ...(r.ficaMonthly > 0 ? [[`Months ${m0} to ${m1}: long-term check, after income tax and payroll tax`, `${usd(first)} a month`] as [string, string]] : []),
        [`From month ${r.ficaMonthly > 0 ? m1 + 1 : m0}: long-term check, after income tax`, `${usd(r.inHand)} a month`, r.inHand],
        [`Long-term check before tax (${pct(n(v, 'pct') / 100)} of pay)`, `${usd(r.net)} a month`],
        ['Federal income tax on it', `${usd(r.fedMonthly)} a month`],
      ];
      const table = {
        caption: `The same plan, by who pays for it: long-term check in hand each month from month ${r.ficaMonthly > 0 ? m1 + 1 : m0}, after federal income tax`,
        headers: ['Premium paid by', 'Benefit is', 'In hand a month'],
        rows: PAYERS.map((p) => { const x = ltd({ ...ltdIn(v), payer: p.value }); return [payerRow(p.value, shareOf(v)), taxWord(x.share), usd(x.inHand)]; }),
        align: ['l', 'l', 'r'] as Array<'l' | 'r'>,
      };
      return {
        label: 'Long-term disability check in your pocket, a month', value: usd(r.inHand),
        sub: `${pct(r.replaced)} of the ${usd(r.takeHomeMonthly)} you take home a month today${r.capped ? ', held down by the monthly maximum' : ''}. Assumes federal tax only, ${fsWord(v)}, from month ${r.ficaMonthly > 0 ? m1 + 1 : m0} of your absence until the plan stops, often at 65.`,
        rows, table,
        note: `${taxLine(r.share, v)} The short-term check is taxed at a higher rate: it adds to the pay you already earned this year. State income tax is not included: in a state with an income tax, your check will be lower.`,
        example: `Example: a ${usd(n(v, 'sal'))} salary, ${fsWord(v)}, ${paidBy(v)}`,
      };
    });
  },

  /** Long-term disability, a month. */
  /** The age is a visible field (testers 2026-11-09: hidden at 45, the 61-year-old read $711,000 as hers). */
  ltd: (arg = {}) => ({ ...spec([
    NUM('age', 'Your age when the claim starts', EX.age, 'yr', 75, 'It sets how many checks you get before they stop'),
    NUM('end', 'Benefits stop at age', EX.endAge, 'yr', 80, 'Not sure? Keep 65, the most common end age'),
    SAL(), PAYER(), FS,
    PCT('pct', 'Share of pay the plan replaces', PRIVATE.ltd_median_pct ?? 60, PLAN_PCT_HELP(PRIVATE.ltd_median_pct ?? 60)),
    MONEY('cap', 'Monthly maximum benefit', PRIVATE.ltd_max_monthly_p50 ?? 10000, PLAN_CAP_HELP(PRIVATE.ltd_max_monthly_p50 ?? 10000)),
    { ...MONEY('ssdi', 'Disability checks from Social Security, a month', 0, 'The plan takes them off its check. None yet? Keep 0', true), short: 'Social Security disability checks' },
    { ...MONEY('oth', 'Other income the plan takes off, a month', 0, 'Workers’ compensation, state disability, pension', true), short: 'other income taken off' },
    { ...MONEY('min', 'Minimum monthly benefit in your plan', 0, 'The least the plan pays after taking other income off; 0 if none', true), short: 'plan minimum' },
    { ...NUM('elim', 'Waiting period before the plan pays (elimination period)', EX.elimDays, 'days', 730, 'From your plan summary', true), short: 'waiting period' },
    { ...MONEY('inc', 'Other taxable income of the household, a year', 0, 'A spouse’s pay, interest', true), short: 'other household income' },
    SHARE,
  ], arg, (v) => {
    const r = ltd(ltdIn(v));
    const elim = v.elim === undefined ? EX.elimDays : n(v, 'elim');
    const whole = ltdTotal(r.net, n(v, 'age'), n(v, 'end'), elim);
    const pocket = keep(r.inHand * whole.months, r.ficaMonthly * Math.min(r.ficaMonths, whole.months));
    const waitMo = Math.round(elim / 30.4375);
    const rows: ToolOut['rows'] = [
      [`Checks until age ${n(v, 'end')}, from age ${n(v, 'age')}${waitMo > 0 ? ` and ${mo(waitMo)}` : ''}`, `${formatNumber(whole.months, 0)} checks (${yr(whole.months / 12)})`],
      [`All those checks together, after federal tax`, usd(pocket)],
      ['Paid by the plan before tax', `${usd(r.net)} a month`],
      ['Federal income tax on it', `${usd(r.fedMonthly)} a month`],
      ...ficaRow(r),
      ...(r.offsets > 0 ? [['Social Security and other income taken off (the offset)', `${usd(r.offsets)} a month`] as [string, string]] : []),
      ['Take-home pay now', `${usd(r.takeHomeMonthly)} a month`],
    ];
    return {
      label: 'Long-term disability check in your pocket, a month', value: usd(r.inHand),
      sub: `${pct(r.replaced)} of the ${usd(r.takeHomeMonthly)} you take home a month today${r.floorApplied ? ' (plan minimum)' : ''}. Assumes federal tax only, ${fsWord(v)}, paid each month until age ${n(v, 'end')}.${firstChecks(r)}`,
      rows, example: `Example: age ${n(v, 'age')}, a ${usd(n(v, 'sal'))} salary, ${paidBy(v)}`,
      note: r.capped ? `The formula gives ${usd(r.formula)}, the maximum cuts it to ${usd(r.gross)}: that maximum sits ${capRank(n(v, 'cap'))} of private plans with a maximum (BLS, the federal statistics office, March 2026).` : `No cost-of-living raise. At ${n(v, 'end')} the checks stop: your own Social Security retirement benefit is what continues.`,
    };
  }), profiles: [
    { label: `I am ${EX.age}`, set: { age: EX.age } },
    { label: 'Close to retirement: I am 61', set: { age: 61 } },
  ] }),

  /** Whole long-term claim from the age it starts to the end age of the plan: the question of a reader close to
   *  retirement (naive testers 2026-11-09, the 61-year-old found nothing for her age). */
  claim: (arg = {}) => spec([
    NUM('age', 'Your age when the claim starts', EX.age, 'yr', 75), NUM('end', 'Benefits stop at age', EX.endAge, 'yr', 80, 'From the plan; often 65 or your Social Security full retirement age'),
    SAL(), PAYER(), PCT('pct', 'Share of pay the plan replaces', PRIVATE.ltd_median_pct ?? 60, PLAN_PCT_HELP(PRIVATE.ltd_median_pct ?? 60), true),
    MONEY('cap', 'Monthly maximum benefit', PRIVATE.ltd_max_monthly_p50 ?? 10000, PLAN_CAP_HELP(PRIVATE.ltd_max_monthly_p50 ?? 10000), true),
    { ...NUM('elim', 'Waiting period before the plan pays (elimination period)', EX.elimDays, 'days', 730, 'From your plan summary', true), short: 'waiting period' }, SHARE, FS,
  ], arg, (v) => {
    const r = ltd(ltdIn(v));
    const elim = v.elim === undefined ? EX.elimDays : n(v, 'elim');
    const w = ltdTotal(r.net, n(v, 'age'), n(v, 'end'), elim);
    // The headline is what reaches the reader's pocket (testers 2026-11-09: the site insists on after tax, the 61 case
    // showed the total before tax): income tax on every check, payroll tax on the first checks only.
    const pocket = keep(r.inHand * w.months, r.ficaMonthly * Math.min(r.ficaMonths, w.months));
    const waitMo = Math.round(elim / 30.4375);
    return {
      label: `In your pocket from age ${n(v, 'age')} to ${n(v, 'end')}, after federal tax`, value: usd(pocket), sub: `about ${usd(r.inHand)} a month after federal income tax · ${usd(w.total)} before tax`,
      rows: [
        ['Number of monthly checks', `${formatNumber(w.months, 0)}${waitMo > 0 ? `, from age ${n(v, 'age')} and ${mo(waitMo)}` : ''} to ${n(v, 'end')}`],
        ['All checks, before tax', usd(w.total), w.total],
        ['In hand, a month, after federal income tax', usd(r.inHand), r.inHand],
        ['Take-home pay now, a month', usd(r.takeHomeMonthly)],
      ],
      note: `No cost-of-living raise. The first check comes after the ${elim}-day wait. At ${n(v, 'end')} the checks stop: your own Social Security retirement benefit is what continues, so check your full retirement age on your Social Security statement.`,
      example: `Example: a claim that starts at ${n(v, 'age')}, a ${usd(n(v, 'sal'))} salary, ${paidBy(v)}`,
    };
  }),

  /** Short-term disability, a week and in total. */
  std: (arg = {}) => spec([
    SAL(), PAYER(), FS, PCT('pct', 'Share of pay the plan replaces', PRIVATE.std_median_pct ?? 60, PLAN_PCT_HELP(PRIVATE.std_median_pct ?? 60)),
    MONEY('cap', 'Weekly maximum benefit', PRIVATE.std_max_weekly_p50 ?? 1000, `From your plan summary; 0 if none. No summary? Keep ${usd(PRIVATE.std_max_weekly_p50 ?? 1000)}, the typical maximum`),
    NUM('wk', 'Weeks you expect to be off and paid', EX.stdWeeks, 'wk', 52, `Not sure? Keep ${EX.stdWeeks}: the time until a long-term plan takes over. Your plan may pay longer, often up to ${PRIVATE.std_weeks_p50 ?? 26} weeks`),
    { ...NUM('wait', 'Unpaid days before the plan pays', EX.stdWait, 'days', 180, 'The waiting period of your plan', true), short: 'unpaid days' }, SHARE,
  ], arg, (v) => {
    const r = std(stdIn(v, 'pct', 'cap'));
    return {
      label: 'Short-term disability check in your pocket, a week', value: usd(r.netWeekly), sub: `${r.takeHomeWeekly > 0 ? pct(r.netWeekly / r.takeHomeWeekly) : '0%'} of the ${usd(r.takeHomeWeekly)} you take home a week today. Assumes ${n(v, 'wk')} paid weeks after ${n(v, 'wait')} unpaid days, federal tax only, ${fsWord(v)}.`,
      example: `Example: a ${usd(n(v, 'sal'))} salary, ${n(v, 'wk')} paid weeks, ${paidBy(v)}`,
      rows: [
        [`Plan check before tax${r.capped ? ' (weekly maximum)' : ''}, a week`, usd(r.weekly)],
        [`All ${n(v, 'wk')} paid weeks, before tax`, usd(r.total), r.total],
        ['Federal income tax', usd(r.fed), r.fed],
        ['Payroll tax (Social Security and Medicare)', usd(r.fica), r.fica],
        [`All ${n(v, 'wk')} paid weeks, in hand`, usd(r.net), r.net],
        ['Take-home pay now, a week', usd(r.takeHomeWeekly)],
        ['Pay lost in the waiting period', usd(r.unpaidWait)],
      ],
      note: `${taxLine(r.share, v)} It is taxed more than a long-term check because it adds to the pay you already earned this year. State programs and state income tax are not included.`,
    };
  }),

  /** Tax on a disability benefit by premium payer: income tax and payroll tax on two separate lines, never added
   *  under the name "federal tax" (audit 2026-11-09). */
  tax: (arg = {}) => spec([
    MONEY('ben', 'Disability benefit, a month', 3000), NUM('mo', 'Monthly checks paid this year', 12, 'mo', 12), PAYER(),
    FS, MONEY('inc', 'Other taxable income this year', 0, 'Wages you earned this year before stopping, a spouse’s pay. Not sure? Keep 0'),
    NUM('wait', 'Months off work before the first check', EX_WAIT_MONTHS, 'mo', 12, 'A 90-day wait is 3. Not sure? Keep 3. Payroll tax only falls on checks paid in the first 6 months off'),
    { ...MONEY('ssdi', 'Disability checks from Social Security, a month', 0, undefined, true), short: 'Social Security disability checks' }, SHARE,
  ], arg, (v) => {
    const ben = n(v, 'ben'), m = n(v, 'mo'), p = payerOf(v), sh = taxableShare(p, shareOf(v)), st = fsOf(v), inc = n(v, 'inc');
    const year = ben * m, taxable = year * sh, ss = n(v, 'ssdi') * m;
    const ssT = ssTaxable(ss, inc + taxable, st);
    const fed = taxAdded(taxable + ssT, inc, st);
    const ficaM = Math.max(0, Math.min(m, 6 - n(v, 'wait')));
    const fica = sickPayFica(ben, sh, ficaM, p);
    return {
      // The rows show the subtraction itself (testers 2026-11-09: 12 × $2,822 did not give $33,171, "tax added to what?").
      label: `You keep over ${m === 1 ? 'one monthly check' : `${m} monthly checks`}, after tax`, value: usd(keep(year, fed, fica)), sub: `${m === 1 ? 'One check' : `${m} checks`} of ${usd(ben)}, after federal income tax and payroll tax. Assumes ${fsWord(v)}, federal tax only; the benefit is ${taxWord(sh)}.`,
      example: `Example: ${m} checks of ${usd(ben)}, no other income, ${paidBy(v)}`,
      rows: [
        [`Benefit received, ${m === 1 ? 'one check' : `${m} checks`}`, usd(year), year],
        ['Federal income tax on it', usd(fed), fed],
        [`Payroll tax (Social Security and Medicare), ${ficaM === 1 ? 'first check' : `first ${ficaM} checks`} only`, usd(fica), fica],
        ...(taxable > 0 && taxable < year ? [['Part counted as income', usd(taxable)] as [string, string]] : []),
        ...(ss > 0 ? [['Taxable part of Social Security', usd(ssT)] as [string, string]] : []),
      ],
      table: { caption: 'The same benefit under each way of paying for it, this year', headers: ['Premium paid by', 'Taxable', 'Income tax', 'Payroll tax', 'You keep'], align: ['l', 'r', 'r', 'r', 'r'],
        rows: PAYERS.map((x) => { const sh2 = taxableShare(x.value, shareOf(v)); const it = taxAdded(year * sh2 + ssTaxable(ss, inc + year * sh2, st), inc, st); const fc = sickPayFica(ben, sh2, ficaM, x.value); return [payerRow(x.value, shareOf(v)), usd(year * sh2), usd(it), usd(fc), usd(keep(year, it, fc))]; }) },
      note: `Payroll tax only falls on checks paid in the first 6 months after you stop work: here the first ${ficaM}. State income tax is not included.`,
    };
  }),

  /** Pre-tax or after-tax premium: the election. */
  premium: (arg = {}) => spec([
    SAL(), MONEY('prem', 'Your yearly premium for the coverage', 300, 'From your benefits enrollment page'),
    MONEY('ben', 'Monthly benefit it would pay', 3000, 'Plan formula and maximum'), NUM('mo', 'Length of a claim to test', 12, 'mo', 480), FS,
  ], arg, (v) => {
    const r = premiumChoice({ salary: n(v, 'sal'), premium: n(v, 'prem'), benefit: n(v, 'ben'), months: n(v, 'mo'), st: fsOf(v), waitMonths: EX_WAIT_MONTHS });
    const yrs = r.yearsCovered >= 10 ? Math.round(r.yearsCovered) : Math.round(r.yearsCovered * 10) / 10;
    // The two amounts first, the years only as their ratio (testers 2026-11-09: "48.0 years" of what?).
    return {
      label: `One ${n(v, 'mo')}-month claim costs as much tax as this many years of pre-tax savings`, value: yr(yrs),
      sub: `Paying pre-tax saves you ${usd(r.extraYearly)} a year. A ${n(v, 'mo')}-month claim then costs you ${usd(r.taxOnClaim)} in tax.`,
      example: `Example: a ${usd(n(v, 'sal'))} salary, a ${usd(n(v, 'prem'))} yearly premium, a ${usd(n(v, 'ben'))} monthly benefit`,
      rows: [
        ['Tax saved each year by paying pre-tax', usd(r.extraYearly)],
        ['Income tax on them, premium paid pre-tax', usd(r.incomeTaxOnClaim), r.incomeTaxOnClaim],
        ['Payroll tax (Social Security and Medicare) on the first checks', usd(r.ficaOnClaim), r.ficaOnClaim],
        [`Total tax on a ${n(v, 'mo')}-month claim, premium paid pre-tax`, usd(r.taxOnClaim), r.taxOnClaim],
        [`Benefits over a ${n(v, 'mo')}-month claim`, usd(r.claim), r.claim],
        ['Premium paid after tax, a year', usd(r.afterTaxCost)],
        ['Same premium paid pre-tax, real cost', usd(r.preTaxCost)],
        ['Your top federal tax rate', pct(r.marginal)],
      ],
      note: `After-tax premiums make the benefit tax-free (IRS, the federal tax agency). The claim is tested with no other income that year and a ${EX.elimDays}-day wait; with other income the tax is higher.`,
    };
  }),

  /** What a quoted premium costs against what it can pay. No price is assumed: the reader enters the quote. */
  cost: (arg = {}) => spec([
    MONEY('prem', 'Monthly premium on your quote', 120, 'An example, not a market rate: type the premium on your quote'), MONEY('ben', 'Monthly benefit it buys', 4000, 'From the same quote'), SAL(),
    NUM('yrs', 'Years you expect to pay it', 25, 'yr', 50, 'Until the policy ends, often at 65: bought at 40, that is 25 years'), PAYER('own', 'A quote you got yourself is an individual policy; pick a group line for a plan at work'), FS,
  ], arg, (v) => {
    const prem = n(v, 'prem'), ben = n(v, 'ben'), sal = n(v, 'sal'), yrs = n(v, 'yrs'), p = payerOf(v), st = fsOf(v);
    const paid = prem * 12 * yrs;
    const sh = taxableShare(p, shareOf(v));
    const netBen = ben - taxAdded(ben * 12 * sh, 0, st) / 12;
    const pre = p === 'pretax' ? prem * 12 * (marginalRate(sal, st) + FED.socialSecurityRate + FED.medicareRate) : 0;
    const back = netBen > 0 ? Math.ceil((paid - pre * yrs) / netBen) : 0;
    return {
      label: 'Months of benefits that pay back all the premiums', value: mo(back), sub: `A claim of ${mo(back)} returns all you paid: ${yr(yrs)} of premiums, ${usd(paid)}. Assumes the quote's price never rises.`,
      example: `Example quote, not a market rate: ${usd(prem)} a month for a ${usd(ben)} monthly benefit`,
      rows: [
        ['Premium as a share of salary', sal > 0 ? pct(prem * 12 / sal, 1) : '0%'],
        ['Premium for each $100 of monthly benefit', ben > 0 ? formatMoney(prem / ben * 100, 2) : '$0'],
        ['Benefit in hand, a month', usd(netBen)],
        ['Tax saved on the premium, a year', usd(pre)],
      ],
      note: `The site publishes no premium rates: ${usd(prem)} is an example to replace with your quote. Unless the policy is noncancelable (price locked), the insurer can raise the premium.`,
    };
  }),

  /** Elimination period: the gap before benefits start. */
  bridge: (arg = {}) => spec([
    MONEY('exp', 'Monthly spending you cannot cut', 4000), NUM('elim', 'Elimination period', 90, 'days', 730, 'From the policy or plan summary'),
    MONEY('sick', 'Sick pay or short-term disability, a month', 0, 'Paid during the waiting period'), MONEY('sav', 'Savings you can use', 10000),
  ], arg, (v) => {
    const r = bridge({ expenses: n(v, 'exp'), elimDays: n(v, 'elim'), sickPay: n(v, 'sick'), savings: n(v, 'sav') });
    return {
      label: 'Money missing before the first check', value: usd(r.shortfall), example: `Example: ${usd(n(v, 'exp'))} of spending a month, a ${n(v, 'elim')}-day wait, ${usd(n(v, 'sav'))} of savings`, sub: `${usd(r.gap)} to bridge over ${formatNumber(r.months, 1)} months`,
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
      label: 'Benefits that depend on the any-occupation test', value: usd(r.difference), example: `Example: a ${usd(n(v, 'ben'))} monthly benefit, a claim at ${n(v, 'age')}, ${n(v, 'own')} months under your own job`, sub: `${mo(r.atRisk)} of ${mo(r.allMonths)} if you could do some other job`,
      rows: [['Paid in full to the end age', usd(r.totalOwn), r.totalOwn], ['Paid if the any-occupation test stops it', usd(r.totalAny), r.totalAny], ['Months under your own job', mo(r.ownMonths)]],
      note: 'No cost-of-living raise. A true own-occupation contract keeps paying even if you work in another field; a modified one stops when you do.',
    };
  }),

  /** Social Security offset now and later. */
  offset: (arg = {}) => spec([
    MONEY('gross', 'Plan benefit before anything is taken off, a month', 5000), MONEY('ssdi', 'Your disability check from Social Security, a month', 2000),
    MONEY('fam', 'Family benefits paid on your record, a month', 0, 'Children, spouse'), MONEY('oth', 'Other offsets, a month', 0, 'Workers’ compensation, state disability', true),
    MONEY('min', 'Plan minimum benefit', 0, 'From your plan; 0 if none', true), PCT('cola', 'Yearly Social Security raise to assume', 2, 'An assumption, not a forecast', true),
    NUM('yrs', 'Years later', 10, 'yr', 40, undefined, true),
    { kind: 'choice', id: 'frz', label: 'The plan subtracts only your first award amount (frozen offset)', short: 'frozen offset', def: 'yes', options: [{ value: 'yes', label: 'Yes' }, { value: 'no', label: 'No' }], help: 'Read the offset clause of your plan', adv: true },
  ], arg, (v) => {
    const r = offsetOverTime({ gross: n(v, 'gross'), ssdi: n(v, 'ssdi'), family: n(v, 'fam'), other: n(v, 'oth'), minBenefit: n(v, 'min'), cola: n(v, 'cola') / 100, years: n(v, 'yrs'), frozen: s(v, 'frz') !== 'no' });
    return {
      label: 'Plan check once Social Security is subtracted, a month', value: usd(r.ltdNow), sub: `${usd(r.totalNow)} a month from the plan and Social Security together`,
      example: `Example: a ${usd(n(v, 'gross'))} plan benefit and a ${usd(n(v, 'ssdi'))} Social Security disability check`,
      rows: [['Subtracted by the plan (the offset)', usd(r.offset), r.offset], ['Plan check', usd(r.ltdNow), r.ltdNow], [`Your Social Security check in ${yr(n(v, 'yrs'))}, with ${pct(n(v, 'cola') / 100)} raises a year`, usd(r.ssdiLater)], [`Plan check in ${yr(n(v, 'yrs'))}, ${s(v, 'frz') !== 'no' ? 'if it keeps subtracting only the first award' : 'if it subtracts each raise too'}`, usd(r.ltdLater)], [`Both together in ${yr(n(v, 'yrs'))}`, usd(r.totalLater)]],
      note: 'An award that comes late is often paid as a lump sum for past months; the plan then asks back what it overpaid.',
    };
  }),

  /** Benefit needed to keep a monthly budget: the group plan after tax first, then what is still missing. A policy bought
   *  with your own money pays tax-free, so the missing amount after tax is the benefit to buy (naive testers 2026-11-09). */
  need: (arg = {}) => spec([
    MONEY('need', 'Money you need each month, after tax', 4000, 'Housing, loans, food, insurance, transport'), SAL(), PAYER(), MONEY('oth', 'Other money that keeps coming, a month', 0, 'A spouse’s pay, rent'),
    { ...PCT('pct', 'Your plan at work: share of pay', PRIVATE.ltd_median_pct ?? 60, '0 if you have no plan at work', true), short: 'plan share of pay' }, { ...MONEY('cap', 'Your plan at work: monthly maximum', PRIVATE.ltd_max_monthly_p50 ?? 10000, '0 if the plan has none', true), short: 'plan monthly maximum' }, SHARE, FS,
  ], arg, (v) => {
    const g = ltd({ ...ltdIn(v), ssdi: 0, otherOffsets: 0, minBenefit: 0, otherIncome: 0 });
    const group = n(v, 'pct') > 0 ? g.inHand : 0;
    const missing = Math.max(0, n(v, 'need') - n(v, 'oth') - group);
    return {
      label: 'Extra benefit to buy, a month (paid to you tax-free)', value: usd(missing),
      sub: `This is the benefit, not the price: ${usd(n(v, 'need'))} you need, minus ${usd(group)} from your plan at work after federal income tax`,
      example: n(v, 'pct') > 0 ? `Example: ${usd(n(v, 'need'))} needed a month, a ${usd(n(v, 'sal'))} salary, ${paidBy(v)}` : `Example: ${usd(n(v, 'need'))} needed a month, no plan at work`,
      rows: [['Money you need each month, after tax', usd(n(v, 'need')), n(v, 'need')], ['Other money that keeps coming', usd(n(v, 'oth')), n(v, 'oth')], ['Your plan at work, after federal income tax', usd(group), group], ['Still missing, after tax', usd(missing), missing]],
      note: 'A policy you buy with your own money pays tax-free, so the amount still missing is the benefit to ask for. Insurers cap how much they issue against your income.',
    };
  }),

  /** BLS: who offers what, by employer. */
  employer: (arg = {}) => spec([
    { kind: 'select', id: 'g', label: 'Your type of employer (industry, size or region)', def: 'Private industry', options: GROUPS.map((g) => ({ value: g.label, label: groupLabel(g.label) })), help: 'National survey figures for workers like you, not your own plan' },
    { ...SAL(), label: 'Your salary (only for what the median plan would pay you)' },
  ], arg, (v) => {
    const g = groupOf(s(v, 'g')), sal = n(v, 'sal');
    const stdW = Math.min(sal / 52 * (PRIVATE.std_median_pct ?? 60) / 100, PRIVATE.std_max_weekly_p50 ?? Infinity);
    const ltdM = Math.min(sal / 12 * (PRIVATE.ltd_median_pct ?? 60) / 100, PRIVATE.ltd_max_monthly_p50 ?? Infinity);
    const f = (x: number | null) => (x === null ? 'not published' : `${formatNumber(x, 0)}%`);
    const same = GROUPS.filter((x) => x.kind === g.kind);
    return {
      label: `Share of workers whose employer offers long-term disability: ${groupLabel(g.label)}`, value: f(g.ltd), sub: `Offered, paid or not, in March 2026. Short-term disability: ${f(g.std)} of the same workers.`,
      example: `National survey figure for ${g.label.toLowerCase()}, not your own plan`, exampleAide: 'pick another type of employer to compare',
      rows: [['All civilian workers, long-term disability', f(GROUPS[0].ltd)], ['Long-term care insurance offered', f(g.ltc)], ['Median private plan, before tax, a week (short term)', usd(stdW)], ['Median private plan, before tax, a month (long term)', usd(ltdM)]],
      table: { caption: 'Share of workers with access, March 2026 (Bureau of Labor Statistics)', headers: ['Group', 'Short-term', 'Long-term', 'Long-term care'], rows: same.map((x) => [groupLabel(x.label), f(x.std), f(x.ltd), f(x.ltc)]), align: ['l', 'r', 'r', 'r'] },
      note: 'Median private plan: 60% of pay, up to the usual monthly or weekly maximum.',
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
      label: 'Benefit as a share of your profit', value: inc > 0 ? pct(ben * 12 / inc) : '0%', example: `Example: ${usd(inc)} of profit, a ${usd(ben)} monthly benefit for ${usd(prem)} a month`, sub: `${usd(ben)} a month, tax-free, against ${usd(after / 12)} a month of profit after income tax`,
      rows: [['Premium as a share of profit', inc > 0 ? pct(prem * 12 / inc, 1) : '0%'], ['Taxable benefit that would equal it', usd(eq)], ['Premiums over 10 years', usd(prem * 120)], ['Months of benefit that repay 10 years', ben > 0 ? formatNumber(Math.ceil(prem * 120 / ben), 0) : '0']],
      note: 'Profit after federal income tax with the standard deduction, no credit; self-employment tax and state tax are not subtracted. A benefit bought with your own money is tax-free (IRS rules).',
    };
  }),

  /** Long-term care premium deduction (2026 limits by age). */
  ltcded: (arg = {}) => spec([
    NUM('age', 'Your age at the end of 2026', 62, 'yr', 110), MONEY('prem', 'Long-term care premium paid in 2026', 3000), MONEY('inc', 'Adjusted gross income', 80000),
    { kind: 'select', id: 'path', label: 'How you would deduct it', def: 'itemize', options: [{ value: 'itemize', label: 'Itemized medical expenses' }, { value: 'self', label: 'Self-employed health insurance deduction' }, { value: 'hsa', label: 'Paid from a health savings account (HSA)' }] },
    MONEY('med', 'Other medical expenses this year', 0, undefined, true), MONEY('oth', 'Other itemized deductions (mortgage interest, taxes, gifts)', 0, undefined, true),
    MONEY('se', 'Net profit of the business', 80000, 'Self-employed deduction only', true), FS,
  ], arg, (v) => {
    const path = s(v, 'path') as 'itemize' | 'self' | 'hsa';
    const r = ltcDeduction({ age: n(v, 'age'), premium: n(v, 'prem'), income: n(v, 'inc'), otherMedical: n(v, 'med'), otherItemized: n(v, 'oth'), st: fsOf(v), path, seProfit: n(v, 'se') });
    return {
      label: 'Federal tax saved by the premium', value: usd(r.saved), example: `Example: age ${n(v, 'age')}, a ${usd(n(v, 'prem'))} premium, ${usd(n(v, 'inc'))} of income`, sub: `${usd(r.eligible)} of the premium counts, limit ${usd(r.limit)} at age ${n(v, 'age')}`,
      rows: [
        ['2026 limit for your age', usd(r.limit)], ['Premium that counts', usd(r.eligible), r.eligible],
        ...(path === 'itemize' ? [[`Medical costs below 7.5% of your ${usd(n(v, 'inc'))} income, not deductible`, usd(r.floor)], ['Itemizing beats the standard deduction', r.itemizes ? 'yes' : 'no']] as Array<[string, string]> : []),
        ['Your top federal tax rate', pct(r.marginal)],
      ],
      table: { caption: 'Deductible long-term care premium by age, 2025 and 2026 (IRS limits)', headers: ['Age at the end of the year', '2025', '2026'], align: ['l', 'r', 'r'],
        rows: [['40 or under', 40], ['41 to 50', 50], ['51 to 60', 60], ['61 to 70', 70], ['71 or over', 71]].map(([l, a]) => [String(l), usd(ltcLimit(Number(a), 2025)), usd(ltcLimit(Number(a)))]) },
      note: path === 'hsa' ? 'A health savings account (HSA) can pay a qualified long-term care premium up to the age limit tax-free; the saving shown is the tax on that money at your marginal rate.' : 'Only a qualified (tax-qualified) long-term care contract counts. Federal income tax only.',
    };
  }),

  /** Long-term care benefits: the per diem exclusion. */
  perdiem: (arg = {}) => spec([
    MONEY('day', 'Benefit paid per day, flat (per diem)', 500), NUM('days', 'Days paid in 2026', 365, 'days', 366),
    MONEY('cost', 'Care costs you paid for those days', 120000), MONEY('reimb', 'Part of those costs already reimbursed', 0, 'By Medicare or another policy', true),
  ], arg, (v) => {
    const r = perDiem({ daily: n(v, 'day'), days: n(v, 'days'), costs: n(v, 'cost'), reimbursed: n(v, 'reimb') });
    return {
      label: 'Taxable part of the benefits', value: usd(r.taxable), example: `Example: ${usd(n(v, 'day'))} a day for ${n(v, 'days')} days, ${usd(n(v, 'cost'))} of care costs`, sub: `${usd(r.paid)} paid · ${usd(r.excludable)} excluded`,
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
      label: `Benefit pool at age ${n(v, 'claim')}`, value: usd(r.poolAtClaim), example: `Example: bought at ${n(v, 'age')}, ${usd(n(v, 'day'))} a day, a ${usd(n(v, 'prem'))} yearly premium`, sub: `${usd(r.dailyAtClaim)} a day then, ${usd(r.poolNow)} today`,
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
      label: 'Care benefit, a month', value: usd(r.monthly), example: `Example: a ${usd(n(v, 'db'))} death benefit, ${n(v, 'pm')}% paid a month`, sub: `the death benefit lasts ${mo(r.exhaust)} of care`,
      rows: [['Paid over the months tested', usd(r.paid), r.paid], ['Death benefit left for heirs', usd(r.left), r.left], ['Per diem limit, a month (2026)', usd(r.perDiemMonth)], ['Possibly taxable, a month', usd(r.taxableMonth)]],
      note: 'Contracts with an extension of benefits rider keep paying after the death benefit is used up; enter only what your contract states.',
    };
  }),

  /** AD&D: the schedule. */
  add: (arg = {}) => spec([
    MONEY('face', 'Principal sum (the amount the accidental death and dismemberment policy names)', 100000),
    { kind: 'select', id: 'loss', label: 'What the accident caused', def: 'one', options: [{ value: 'death', label: 'Death' }, { value: 'one', label: 'Loss of one hand, foot or eye' }, { value: 'two', label: 'Two or more of these losses' }, { value: 'onethendeath', label: 'One loss, then death from the same accident' }] },
  ], arg, (v) => {
    const face = n(v, 'face'), l = s(v, 'loss');
    const losses: AddLoss[] = l === 'onethendeath' ? ['one', 'death'] : [l as AddLoss];
    const pay = addPayout(face, losses);
    return {
      label: 'Payment under the federal employees’ schedule', value: usd(pay), example: `Example: a ${usd(face)} principal sum`, sub: `${face > 0 ? pct(pay / face) : '0%'} of the principal sum`,
      rows: [['Death', usd(face * 1)], ['One hand, foot or eye', usd(face * 0.5)], ['Two or more', usd(face * 1)], ['Most for one accident', usd(face)]],
      note: 'Schedule of the federal employees’ plan, run by the Office of Personnel Management. Private policies print their own schedule, often with more lines; read yours. Death from illness pays nothing under AD&D.',
    };
  }),

  /** Accident or critical illness cash benefit against the health plan’s deductible and out-of-pocket maximum. */
  cash: (arg = {}) => spec([
    MONEY('pay', 'Cash the policy pays for the event', 5000, 'From the benefit schedule'), MONEY('prem', 'Yearly premium', 300),
    MONEY('ded', 'Deductible of your health plan', HSA.hdhpMinDeductible.self), MONEY('oop', 'Out-of-pocket maximum of your health plan', HSA.hdhpMaxOutOfPocket.self),
  ], arg, (v) => {
    const r = cashVsPlan({ payout: n(v, 'pay'), premium: n(v, 'prem'), deductible: n(v, 'ded'), oop: n(v, 'oop') });
    return {
      label: 'Share of your worst-case medical bill it covers', value: pct(r.oopShare), example: `Example: a ${usd(n(v, 'pay'))} payment and a ${usd(n(v, 'prem'))} yearly premium`, sub: `${usd(r.gapCovered)} of ${usd(n(v, 'oop'))} out of pocket`,
      rows: [['Share of the deductible', pct(r.deductibleShare)], ['Left for other bills', usd(r.leftOver)], ['Still yours after the payment', usd(r.unpaidAfter)], ['Years of premium the payment equals', formatNumber(r.yearsOfPremium, 1)]],
      note: `Defaults: the 2026 floor deductible (${usd(HSA.hdhpMinDeductible.self)}) and ceiling on out-of-pocket costs (${usd(HSA.hdhpMaxOutOfPocket.self)}) of a health plan that allows a health savings account (HSA), self-only. Enter your own plan’s figures.`,
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
      label: 'Paid for the stay', value: usd(total), example: `Example: ${n(v, 'days')} days in hospital, ${usd(n(v, 'adm'))} for the admission and ${usd(n(v, 'day'))} a day`, sub: `${pct(r.deductibleShare)} of the deductible · ${formatNumber(r.yearsOfPremium, 1)} years of premium`,
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
