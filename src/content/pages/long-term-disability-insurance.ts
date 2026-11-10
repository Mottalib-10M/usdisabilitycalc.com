import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const P = K.PRIV;
// The example case of the whole site (K.EX): the calculator above starts from the same figures.
const SAL = K.EX.sal;
const b = { salary: SAL, pct: P.ltd_median_pct! / 100, cap: P.ltd_max_monthly_p50!, ssdi: 0, otherOffsets: 0, minBenefit: 0, payer: 'employer' as const, employeeShare: 0, st: 'single' as const, otherIncome: 0, elimDays: K.EX.elimDays };
const r = K.ltd(b), own = K.ltd({ ...b, payer: 'aftertax' });
const hi = K.ltd({ ...b, salary: 180000, cap: P.ltd_max_monthly_p25! });
const ss = K.ltd({ ...b, ssdi: 1800 });
const late = K.ltdTotal(r.net, 61, K.EX.endAge, K.EX.elimDays);
const civ = K.G('All civilian workers');

export default definePage({
  id: 'long-term-disability-insurance', group: 'disability', order: 102, slug: 'long-term-disability-insurance',
  nav: 'Long-term disability benefit', card: 'The monthly long-term disability check after the plan maximum, the Social Security offset and federal tax.',
  title: 'Long-Term Disability Benefit 2026: Monthly Check After Tax',
  description: 'Long-term disability benefit in 2026: monthly check from the plan formula and maximum, less the Social Security offset and federal tax, by who paid the premium.',
  h1: 'Long-term disability: your monthly check after Social Security and tax',
  intro: 'Enter your salary, your age and who pays for your long-term disability insurance (the premium). The most common plan is already filled in: change it only if you have your plan summary. Close to retirement? Tap “I am 61” above the fields.',
  resume: `A long-term disability plan pays a share of your monthly earnings, up to a monthly maximum. In March 2026, the median private plan paid ${K.pct(P.ltd_median_pct! / 100)} of earnings, according to the Bureau of Labor Statistics (BLS, the federal statistics office). Half of the plans with a maximum capped the benefit at ${K.usd(P.ltd_max_monthly_p50!)} a month or less. At ${K.usd(SAL)} a year, the formula gives ${K.usd(r.net)} a month before tax. When your employer pays the premium, the benefit is taxable. A single filer then keeps about ${K.usd(r.inHand)} a month after federal income tax in 2026. That is ${K.pct(r.replaced)} of take-home pay. Bought with after-tax money, the benefit is tax-free and all ${K.usd(own.inHand)} stays. The plan also subtracts a Social Security disability check from its own check. Benefits usually stop at an age written in the contract, often 65. And only ${K.bp(civ.ltd)} of civilian workers are offered a long-term plan at work.`,
  faqs: [
    { open: true, q: 'I am 61: how long would long-term disability pay me?', a: `Until the end age written in the contract, often 65 or your Social Security full retirement age. So a claim at 61 pays for a few years, not decades. On a ${K.usd(SAL)} salary, the plan pays ${K.usd(r.net)} a month before tax, about ${K.usd(r.inHand)} after federal tax. After a ${K.EX.elimDays}-day wait, that is ${K.num(late.months)} checks. When the plan stops, your own Social Security retirement benefit is what continues.` },
    { q: 'How long do long-term disability benefits last?', a: 'As long as you stay disabled under the contract, up to the end of the benefit period it states: a number of years, or an age such as 65 or the Social Security full retirement age. Many group plans also change the definition of disability after the first two years or so, from your own job to any job you could do. That can stop benefits earlier.' },
    { q: 'What happens to the check if my salary is above the cap?', a: `The formula is cut to the maximum. A ${K.usd(180000)} earner in a plan capped at ${K.usd(P.ltd_max_monthly_p25!)} gets ${K.usd(hi.gross)} a month instead of ${K.usd(hi.formula)}. After federal tax, if the employer pays, that leaves about ${K.usd(hi.inHand)}. That is only ${K.pct(hi.replaced)} of take-home pay. An individual policy bought on top can fill that gap.` },
  ],
  body: (h) => `
<h2>From the plan formula to your check</h2>
<p>The calculator follows the order your plan uses. First, your monthly pay times the plan percentage. Then the monthly maximum cuts it if needed. Then the plan takes off the other disability income it lists: that subtraction is called the offset.</p>
<p>The most common offset is a Social Security disability check. If Social Security pays you ${K.usd(1800)} a month, the plan pays only ${K.usd(ss.net)}. Your total stays about the same; it is just split between two payers. The ${h.a('ltd-social-security-offset', 'offset calculator')} follows that split over the years.</p>
<p>Last comes federal tax, which depends on who paid the premium. The figures already filled in are the most common private plan in the survey of the Bureau of Labor Statistics (BLS, the federal statistics office): ${K.pct(P.ltd_median_pct! / 100)} of pay, up to ${K.usd(P.ltd_max_monthly_p50!)} a month. Many plans count base pay only, without bonus or commission.</p>
<p>The maximum is the line to check first if you earn well. One private plan in 4 caps the benefit at ${K.usd(P.ltd_max_monthly_p25!)} a month or less. Try a higher salary below to see it bite.</p>
${h.mini('ltd', { t: `A higher salary and a lower maximum: ${K.usd(180000)} and ${K.usd(P.ltd_max_monthly_p25!)}`, p: ['sal', 'cap'], d: { sal: 180000, cap: P.ltd_max_monthly_p25! } })}
<h2>Tax on the long-term disability benefit</h2>
<p>The IRS (the federal tax agency) taxes the benefit when your employer paid the premium. It also taxes it when you paid the premium from your pay before tax. It does not tax it when you paid with after-tax money.</p>
<p>Most private employers pay the whole premium: ${K.bp(P.ltd_employee_pays_none)} of covered workers pay nothing. So most benefits are taxed. At ${K.usd(SAL)}, federal income tax takes about ${K.usd(r.fedMonthly)} a month.</p>
<p>Payroll tax (Social Security and Medicare) also comes off at first, but only for 6 months after your last month of work. After a ${K.EX.elimDays}-day wait, that means the first ${K.num(r.ficaMonths)} checks: about ${K.usd(r.ficaMonthly)} less on each. The calculator shows it under the result. Not sure who pays? Look at your pay stub: no disability line means your employer pays, and the benefit will be taxed. A line taken after tax means it will not. The ${h.a('pre-tax-vs-after-tax-disability-premiums', 'pre-tax or after-tax page')} tells you whether to switch at the next enrollment.</p>
<h2>Close to retirement: how many checks are left</h2>
<p>Long-term benefits stop at the end age written in the plan, often 65. So the age at which a claim starts matters as much as the monthly amount.</p>
<p>From age ${K.num(K.EX.age)}, a ${K.usd(r.net)} benefit runs for about 20 years. From age 61, it pays ${K.num(late.months)} checks, a little under four years. Tap “I am 61” above the fields to see what those checks leave you after tax. The calculator counts the ${K.EX.elimDays}-day wait before the first check. Your plan's end age is in its summary, under the benefit period. Not sure? Keep 65, the most common end age; if your plan runs to your full retirement age, a few more checks are added.</p>
<p>When the plan stops, your own Social Security retirement benefit is what continues: your Social Security statement gives its amount and your full retirement age. Some plans also stop earlier if, after the first years, you could do some other job; the ${h.a('own-occupation-disability-insurance', 'own-occupation calculator')} measures how much of the claim depends on that clause.</p>
`,
  tool: 'ltd',
  related: ['ltd-social-security-offset', 'is-disability-insurance-taxable', 'own-occupation-disability-insurance', 'how-much-disability-insurance-do-i-need'],
  sources: ['bls_ebs_2026', 'irs_p525', 'irs_p15a', 'irs_rp_2025_32', 'usc_105'],
});
