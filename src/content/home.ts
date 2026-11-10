/** Text of the home page (the pillar). Every figure comes from the kit. */
import { KIT as K } from '../lib/kit';
import type { FAQ, Helpers } from '../lib/page-types';

// The example case of the whole site (K.EX): the calculator at the top of the page starts from the same figures.
const SAL = K.EX.sal;
const CAP = K.PRIV.ltd_max_monthly_p50!;
const PCT = K.PRIV.ltd_median_pct! / 100;
const base = { salary: SAL, pct: PCT, cap: CAP, ssdi: 0, otherOffsets: 0, minBenefit: 0, payer: 'employer' as const, employeeShare: 0, st: 'single' as const, otherIncome: 0, elimDays: K.EX.elimDays };
const emp = K.ltd(base), own = K.ltd({ ...base, payer: 'aftertax' });
const HIGH = 250000;
const hi = K.ltd({ ...base, salary: HIGH });
const sd = K.std({ salary: SAL, pct: K.PRIV.std_median_pct! / 100, capWeekly: K.PRIV.std_max_weekly_p50!, weeks: K.EX.stdWeeks, waitDays: K.EX.stdWait, payer: 'employer', employeeShare: 0, st: 'single' });
const pc = K.premiumChoice({ salary: SAL, premium: 300, benefit: emp.net, months: 12, st: 'single', waitMonths: K.EX_WAIT });
const civ = K.G('All civilian workers'), small = K.G('Fewer than 50 workers'), big = K.G('500 workers or more'), part = K.G('Part-time workers');

/** The value sentence (RECETTE §2.4), shown on the home page, the About page and the method page. */
export const VALUE = `Insurers quote a gross benefit and a premium, and stop there. What reaches your account depends on three things their quote leaves out: the monthly maximum written in the plan, the Social Security award the plan subtracts, and who paid the premium, which decides whether the IRS taxes every dollar of the benefit or none of it. This site computes all three from your own figures, with the 2026 federal tax rules and the plan provisions the Bureau of Labor Statistics measured in March 2026, and sells nothing.`;

export const HOME = {
  title: 'Disability Insurance After Tax 2026: Benefit Calculator',
  description: 'Disability insurance after tax in 2026: what a short-term or long-term benefit pays a month after the Social Security offset and federal tax, by premium payer.',
  h1: 'Disability insurance after tax: what the benefit really pays you',
  /** The answer in one sentence, one figure (testers 2026-11-10: five amounts in the first paragraph). */
  answer: `On a ${K.usd(SAL)} salary, a typical disability insurance plan at work leaves you about ${K.usd(emp.inHand)} a month after federal tax: ${K.pct(emp.replaced)} of what you take home today. Paid the insurance yourself with after-tax money? Then you keep it all.`,
  intro: 'Change the salary and say who pays for the insurance (the premium) to see yours. No plan papers? The most common plan is already filled in.',
  resume: `A worker earning ${K.usd(SAL)} a year with the most common long-term disability plan, which pays ${K.pct(PCT)} of salary, receives ${K.usd(emp.net)} a month before tax. That formula is the median of private plans in the March 2026 survey of the Bureau of Labor Statistics (BLS, the federal statistics office). Most employers pay the whole premium: ${K.bp(K.PRIV.ltd_employee_pays_none)} of covered private workers pay nothing. The benefit is then taxable income. A single filer keeps about ${K.usd(emp.inHand)} a month after federal income tax in 2026. That is ${K.pct(emp.replaced)} of the take-home pay it replaces. Paid with after-tax money, the same benefit is tax-free, and all ${K.usd(own.inHand)} stays. A Social Security disability check is subtracted from the plan check, so it changes how the money is split, not the total. Higher earners lose most to the monthly maximum: at ${K.usd(HIGH)}, the plan replaces only ${K.pct(hi.replaced)} of take-home pay. And only ${K.bp(civ.ltd)} of civilian workers are offered a long-term plan at work.`,
  faqs: [
    { q: 'Why does the calculator ask who pays the premium?', a: `Because federal tax on the benefit depends on it and nothing else. The IRS (the federal tax agency) taxes the benefit when your employer paid the premium, or when it was taken from your pay before tax. Benefits from premiums you paid with after-tax money are not taxed. On a ${K.usd(emp.net)} monthly benefit, that choice is worth about ${K.usd(emp.fedMonthly)} a month for a single filer earning ${K.usd(SAL)}.` } as FAQ,
    { q: 'Does this site sell disability or long-term care insurance?', a: 'No. US Disability Calc is an independent site: not an insurer or a broker, with no partner insurer, no quote form and no affiliate link. It asks for no name, phone number or e-mail address, and the calculator runs in your browser. Figures come from the IRS and the Bureau of Labor Statistics, listed under Sources on each page with the date they were read.' },
    { q: 'Does the estimate include state income tax?', a: 'No. The calculators apply federal income tax with the 2026 brackets and standard deduction, plus Social Security and Medicare payroll tax where they apply, and leave state tax out. In a state with an income tax, your check will be lower. State rules on disability benefits differ from one state to the next; your state revenue department publishes its own.' },
    { q: 'What does the monthly maximum of a disability plan change?', a: `It sets the highest check whatever your salary. In March 2026, half of private long-term plans with a maximum capped the benefit at ${K.usd(CAP)} a month or less. A 60% plan with that cap stops paying 60% of pay above a salary of ${K.usd(CAP / 0.6 * 12)} a year. At ${K.usd(HIGH)}, the same plan replaces only ${K.pct(hi.replaced)} of take-home pay after federal tax.` },
    { q: 'Where do the plan figures on this site come from?', a: `From the National Compensation Survey of the Bureau of Labor Statistics, the federal statistics office. Its reference month is March 2026, it was published on September 25, 2026, and this site read it on ${K.day(K.RETRIEVED)}. It gives the share of workers offered each plan, by industry, employer size, region and pay, plus the most common benefit formula and monthly maximum.` },
    { q: 'Are insurance premium prices shown anywhere on the site?', a: 'No. No public source publishes disability, long-term care or accident premiums that a site may copy, and invented price ranges are what search results already offer. Every cost calculator here asks for the premium on your own quote or enrollment page, then works out what it buys: the tax saved or owed, and the months of benefit that pay it back.' },
  ] as FAQ[],
  /** Right under the calculator: what to copy from the plan papers and the pay stub (naive testers 2026-11-09). */
  start: (h: Helpers) => `
<h2>What to copy from your plan papers</h2>
<p>No papers at hand? Keep the figures already filled in: they are the most common private plan, ${K.pct(PCT)} of pay up to ${K.usd(CAP)} a month. Change only your salary and who pays.</p>
<p>If you have the plan summary, look for four lines. The share of pay the plan replaces. The monthly maximum. The waiting period before the first check, often 90 days (the elimination period). And the list of other income the plan takes off its check, such as a Social Security disability check.</p>
<p>Then look at your pay stub. No disability line means your employer pays the premium, and the benefit will be taxed. A disability line among the pre-tax deductions means the same. A line taken after tax means the benefit will be tax-free. Many plans count base pay only, without bonus or commission, so a sales worker can get far less than ${K.pct(PCT)} of total pay. The ${h.a('method', 'method page')} lists every rule the calculators apply.</p>
`,
  /** Open sections, in the order a claim happens: short-term then long-term, then the tax. */
  guide: (h: Helpers) => `
<h2>Short-term and long-term disability work as a relay</h2>
<p>Short-term disability pays first, by the week, after a few unpaid days. The median plan pays ${K.pct(K.PRIV.std_median_pct! / 100)} of weekly pay, for up to ${K.num(K.PRIV.std_weeks_p50!)} weeks.</p>
<p>Long-term disability takes over by the month once its waiting period is over, often 90 days. It can then pay for years, until an age written in the plan, often 65.</p>
<p>In the example above, the short-term check lasts ${K.num(K.EX.stdWeeks)} weeks: about ${K.usd(sd.netWeekly)} a week after tax, against ${K.usd(sd.takeHomeWeekly)} of take-home pay. It is taxed more than the long-term check, because it adds to the pay you already earned that year. The ${h.a('short-term-disability-insurance', 'short-term disability calculator')} works it out for your plan.</p>
<p>If Social Security also pays you a disability check, the long-term plan subtracts it from its own check: that is called the offset. Your total stays about the same; it is only split between two payers. The ${h.a('ltd-social-security-offset', 'offset calculator')} shows how. Close to retirement? The ${h.a('long-term-disability-insurance', 'long-term disability calculator')} counts the checks left before age 65.</p>
<h2>Disability insurance after tax: who pays the premium decides</h2>
<p>The IRS taxes a disability benefit when your employer paid the premium. It also taxes it when the premium was taken from your pay before tax, through the benefits plan at work (a cafeteria plan): money that was never taxed counts as paid by the employer. A benefit bought with after-tax money is not income at all.</p>
<p>So two coworkers with the same plan and the same salary get the same check and keep different amounts. On the example plan, the gap is about ${K.usd(emp.fedMonthly)} a month. The table under the calculator shows each way of paying.</p>
<p>Choosing your benefits at work? Paying the premium before tax saves about ${K.usd(pc.extraYearly)} a year. But a one-year claim would then cost about ${K.usd(pc.taxOnClaim)} in tax. The ${h.a('pre-tax-vs-after-tax-disability-premiums', 'pre-tax or after-tax page')} compares both for your salary, and the ${h.a('is-disability-insurance-taxable', 'tax page')} handles a plan whose cost is shared.</p>
`,
  /** Folded sections (<details>, content kept in the HTML): titles shown, text one tap away. */
  folds: [
    { id: 'plan-data', title: 'Who is offered a plan at work, and how large it is', html: (h: Helpers) => `
<p>Most pages about disability insurance stop at the rule of thumb: a group plan replaces about 60% of pay. The survey of March 2026 adds the monthly maximum. Half of private plans with a maximum cap the benefit at ${K.usd(K.PRIV.ltd_max_monthly_p50!)} a month or less. One plan in 10 caps it at ${K.usd(K.PRIV.ltd_max_monthly_p10!)} or less. Above a salary of ${K.usd(K.PRIV.ltd_max_monthly_p10! * 12 / 0.6)}, such a plan stops replacing 60%.</p>
<p>Access to a plan also varies. Long-term disability reaches ${K.bp(big.ltd)} of workers in companies of 500 workers or more, but ${K.bp(small.ltd)} in companies of fewer than 50. Part-time workers have ${K.bp(part.ltd)}. The ${h.a('disability-insurance-by-employer', 'employer lookup')} gives each group the survey publishes.</p>
` },
    { id: 'cost', title: 'Buying your own policy: how much and at what price', html: (h: Helpers) => `
<p>This site publishes no premium prices: ranges found online come with no source and no date. Instead, the ${h.a('disability-insurance-cost', 'cost page')} takes the premium on your own quote and measures it, as a share of income and in months of claim that pay it back.</p>
<p>To know how much coverage to buy, the ${h.a('how-much-disability-insurance-do-i-need', 'needs calculator')} starts from the money you need each month and takes off what your plan at work leaves after tax. The ${h.a('own-occupation-disability-insurance', 'own-occupation page')} measures what the definition of disability is worth, and self-employed readers, who have no plan at work, have their own ${h.a('disability-insurance-self-employed', 'page')}.</p>
` },
  ],
  sources: ['irs_rp_2025_32', 'irs_p525', 'irs_p15a', 'irs_p915', 'irs_p502', 'irs_rp_2025_19', 'bls_ebs_2026', 'bls_ebs_data', 'opm_fegli'],
};
