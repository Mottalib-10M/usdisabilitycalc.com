import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const P = K.PRIV;
// The example case of the whole site (K.EX): the calculator above and the home page start from the same figures.
const SAL = K.EX.sal;
const base = { salary: SAL, pct: P.std_median_pct! / 100, capWeekly: P.std_max_weekly_p50!, weeks: K.EX.stdWeeks, waitDays: K.EX.stdWait, payer: 'employer' as const, employeeShare: 0, st: 'single' as const };
const emp = K.std(base), aft = K.std({ ...base, payer: 'aftertax' });
const lowCap = K.std({ ...base, salary: 90000, capWeekly: P.std_max_weekly_p25! });
const civ = K.G('All civilian workers');

export default definePage({
  id: 'short-term-disability-insurance', group: 'disability', order: 101, slug: 'short-term-disability-insurance',
  nav: 'Short-term disability pay', card: 'A week of short-term disability before and after tax, with the weekly maximum and the waiting period of your plan.',
  title: 'Short-Term Disability Pay 2026: Weekly Benefit After Tax',
  description: 'Short-term disability pay in 2026: weekly benefit from your plan formula and cap, the unpaid waiting days, federal tax and payroll tax by who pays the premium.',
  h1: 'Short-term disability: what a week of benefit pays',
  intro: 'Enter your salary and say who pays for your short-term disability insurance (the premium). No plan summary? The most common plan is already filled in. The weekly check after tax appears at once.',
  resume: `Short-term disability replaces part of your weekly pay for a limited time, usually after a few unpaid days. The median private plan pays ${K.pct(P.std_median_pct! / 100)} of weekly earnings, up to ${K.usd(P.std_max_weekly_p50!)} a week. That is the March 2026 survey of the Bureau of Labor Statistics (BLS, the federal statistics office). At ${K.usd(SAL)} a year, the plan pays ${K.usd(emp.weekly)} a week before tax. Most employers pay the premium: ${K.bp(P.std_employee_pays_none)} of covered private workers pay nothing. The benefit is then taxed like sick pay, with income tax and payroll tax. About ${K.usd(emp.netWeekly)} a week remains for a single filer. That is ${K.pct(emp.netWeekly / emp.takeHomeWeekly)} of the ${K.usd(emp.takeHomeWeekly)} you take home a week today. If you pay the premium with after-tax money, the benefit is tax-free and all ${K.usd(aft.netWeekly)} stays. Only ${K.bp(civ.std)} of civilian workers are offered a plan at work.`,
  faqs: [
    { q: 'How much does short-term disability pay a week?', a: `The share of weekly pay written in your plan, up to its weekly maximum. Half of private plans pay ${K.pct(P.std_median_pct! / 100)} or less, and the median maximum is ${K.usd(P.std_max_weekly_p50!)} a week. At ${K.usd(SAL)} a year, 60% is ${K.usd(emp.weekly)} a week before tax. A plan with a lower maximum pays a high earner much less than 60%.` },
    { q: 'Is short-term disability taxed like a paycheck?', a: 'When your employer pays the premium, mostly yes: it is treated as sick pay, with federal income tax and, for the first six months after you stop working, Social Security and Medicare payroll tax. When you pay the premium after tax, the benefit is not income. A premium taken from your pay before tax counts as paid by the employer, so the benefit is taxed.' },
    { q: 'Are the first days of a short-term disability absence paid?', a: 'Usually not by the plan. Most plans start paying after a waiting period of a few days, and some skip it for an accident or a hospital stay. Sick days or paid time off can cover the gap if your employer allows it. The calculator shows the pay you lose during those unpaid days.' },
  ],
  body: (h) => `
<h2>The formula in your plan summary</h2>
<p>A short-term disability plan pays a share of your weekly pay, often 50%, 60% or 66.67%. A weekly maximum limits it. The plan summary also gives the unpaid days before the first check and the number of weeks it can pay.</p>
<p>The figures already filled in are the medians of private plans in March 2026, from the Bureau of Labor Statistics (BLS, the federal statistics office). So without your summary you still get a realistic figure; with it, you get the exact one. Most plans count base pay only, without overtime, bonus or commission. Not sure of your salary? Use the yearly pay before tax shown on your last W-2 (the wage statement your employer sends each January), or your weekly pay times 52.</p>
<p>The weekly maximum is the line to look for first. One private plan in 4 stops at ${K.usd(P.std_max_weekly_p25!)} a week or less. At ${K.usd(90000)} a year, such a plan pays ${K.usd(lowCap.weekly)} a week before tax. After tax, ${K.usd(lowCap.netWeekly)} a week is left: ${K.pct(lowCap.netWeekly / lowCap.takeHomeWeekly)} of the ${K.usd(lowCap.takeHomeWeekly)} that earner takes home a week. Try it below.</p>
${h.mini('std', { t: `A higher salary and a lower cap: ${K.usd(90000)} and ${K.usd(P.std_max_weekly_p25!)} a week`, p: ['sal', 'cap'], d: { sal: 90000, cap: P.std_max_weekly_p25! } })}
<h2>Tax: the premium payer decides</h2>
<p>The IRS (the federal tax agency) looks at who paid for the coverage. If your employer paid the premium, the benefit is income. If you paid it with money already taxed, it is not.</p>
<p>A premium taken from your pay before tax, through the benefits plan at work (a cafeteria plan), counts as paid by the employer. So the benefit is taxed, even though the money came out of your paycheck. When the cost is shared, only the employer's part of the benefit is taxed.</p>
<p>A plan your employer funds is taxed like sick pay. Income tax comes off, and so does payroll tax (Social Security and Medicare). On a ${K.num(K.EX.stdWeeks)}-week absence at ${K.usd(SAL)}, income tax takes ${K.usd(emp.fed)} in all. Payroll tax takes ${K.usd(emp.fica)}. The check is taxed more than a long-term check would be, because it adds to the pay you already earned that year. The ${h.a('is-disability-insurance-taxable', 'tax calculator')} handles longer claims.</p>
<h2>What to check before you count on short-term disability pay</h2>
<p>Read four lines of your plan summary: the share of pay, the weekly maximum, the unpaid days and the number of weeks. Then look at your pay stub. A disability line marked pre-tax means the benefit will be taxed when you claim.</p>
<p>Check your state too. A few states, such as New York and New Jersey, run their own disability programs, paid for by a payroll deduction. There, the state benefit may pay first, and your check can differ from this estimate. Your state labor department says whether yours does. State programs are not computed here.</p>
<p>Last, plan the hand-over. Short-term disability is meant to carry you until a long-term plan starts, often after 90 days. If the two do not line up, the ${h.a('elimination-period', 'waiting period calculator')} measures the gap your savings would fill. Once the long-term plan pays, the ${h.a('long-term-disability-insurance', 'long-term disability calculator')} takes over. No long-term plan at work? Then the short-term check is all you get, and the weeks after it are unpaid: your savings, a spouse's pay or an individual policy have to fill them.</p>
`,
  tool: 'std',
  related: ['long-term-disability-insurance', 'is-disability-insurance-taxable', 'elimination-period', 'disability-insurance-by-employer'],
  sources: ['bls_ebs_2026', 'irs_p525', 'irs_p15a', 'irs_p15', 'irs_rp_2025_32'],
});
