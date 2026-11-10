import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

// The example case of the whole site (K.EX): the calculator above starts from the same figures.
const NEED = 4000, SAL = K.EX.sal, SPOUSE = 800;
const plan = Math.min(SAL / 12 * 0.6, K.PRIV.ltd_max_monthly_p50!);
const taxed = K.need({ need: NEED, otherMonthly: 0, payer: 'employer', employeeShare: 0, st: 'single' });
const free = K.need({ need: NEED, otherMonthly: 0, payer: 'own', employeeShare: 0, st: 'single' });
const spouse = K.need({ need: NEED, otherMonthly: 1500, payer: 'own', employeeShare: 0, st: 'single' });
const th = K.th(SAL);
const groupNet = K.ltd({ salary: SAL, pct: 0.6, cap: K.PRIV.ltd_max_monthly_p50!, ssdi: 0, otherOffsets: 0, minBenefit: 0, payer: 'employer', employeeShare: 0, st: 'single', otherIncome: 0, elimDays: K.EX.elimDays }).inHand;
const missing = Math.max(0, NEED - groupNet), missingSpouse = Math.max(0, NEED - SPOUSE - groupNet);

export default definePage({
  id: 'how-much-disability-insurance-do-i-need', group: 'disability', order: 110, slug: 'how-much-disability-insurance-do-i-need',
  nav: 'How much coverage you need', card: 'From the monthly budget you must keep to the benefit to buy, after tax and after what your group plan already pays.',
  title: 'Disability Insurance Needs 2026: Benefit to Keep Your Budget',
  description: 'Disability insurance needs in 2026: the monthly benefit that keeps your budget after federal tax, what your group plan already pays, and the gap left to cover.',
  h1: 'How much disability insurance do you need?',
  intro: 'Enter the money you need each month after tax, your salary and who pays for your disability insurance plan at work. The calculator takes off what that plan leaves after tax and shows the extra monthly benefit you need: a benefit paid to you, not a price.',
  resume: `The disability insurance you need is the monthly money you would need after tax, minus what keeps coming in, minus what your plan at work leaves after tax. Start from spending, not salary: housing, loans, insurance, food and transport. Someone who earns ${K.usd(SAL)} takes home about ${K.usd(th.net / 12)} a month today. Say that person needs ${K.usd(NEED)} a month. An employer-paid plan at 60% of pay leaves about ${K.usd(groupNet)} a month after federal income tax for a single filer in 2026. So ${K.usd(missing)} a month is still missing. A policy bought with after-tax money pays tax-free, so ${K.usd(missing)} is the benefit to ask for. With ${K.usd(SPOUSE)} a month of a spouse's pay still coming in, the gap falls to ${K.usd(missingSpouse)}. Without any plan at work, the whole ${K.usd(NEED)} is missing. Insurers then decide how much coverage they will sell you against your earnings, counting what you already have.`,
  faqs: [
    { q: 'How much of my income should disability insurance replace?', a: `Enough to cover the spending that continues if you stop working, not a fixed share of salary. Plans at work usually pay 60% of base pay before tax, which can leave much less in hand once the monthly maximum and tax apply. At ${K.usd(SAL)}, an employer-paid plan leaves about ${K.usd(groupNet)} a month after federal tax, against ${K.usd(th.net / 12)} of take-home pay today.` },
    { q: 'Should I count my spouse’s income when sizing disability coverage?', a: `Yes, if it would continue and you would rely on it. Every dollar that keeps coming in lowers the benefit you need to buy. Without a plan at work, ${K.usd(1500)} of a spouse's monthly pay takes the benefit needed from ${K.usd(free.gross)} to ${K.usd(spouse.gross)} a month. Leave it out if you want the policy to protect the household if both incomes stop.` },
    { q: 'Can I buy as much individual disability coverage as I want?', a: 'No. Insurers sell coverage only up to a limit set against your earned income, and they count the coverage you already have at work, so that a claim does not pay more than working. The limit is the insurer’s own rule, not a law. The calculator shows the gap; a quote shows how much of it an insurer will cover.' },
  ],
  body: (h) => `
<h2>Start from spending</h2>
<p>The number that matters is the money you would need each month if you could not work. Count housing, utilities, insurance, loan payments, food, transport and child care. Add the savings you want to keep up, such as for retirement.</p>
<p>Some costs fall during a disability, commuting for example. Some rise, such as health costs or help at home. Write the figure you would really need, after tax, in the first box. Not sure? Use your take-home pay today: it errs on the safe side.</p>
<p>Then subtract what would keep coming in: a spouse's pay, rent from a property, a pension already paid. What is left is the money a disability benefit has to give you, after tax. Leave out money that would stop with your job, such as a bonus, and money you cannot count on, such as help from family. If you are unsure whether an income would continue, leave it out too: the gap shown then errs on the safe side.</p>
${h.mini('need', { t: 'No plan at work: the policy your budget needs', p: ['need', 'oth'], d: { pct: 0 } })}
<h2>Take off what your plan at work leaves</h2>
<p>If your employer offers long-term disability, the calculator works out what the plan leaves you after tax. It takes the plan's share of your salary, up to its maximum, then takes off federal income tax when the benefit is taxed.</p>
<p>Whether it is taxed depends on who paid the premium. A plan your employer pays, or one paid from your pay before tax, is taxed like wages. A plan you pay after tax is not. Not sure? Keep “Not sure”: it counts the tax, so the gap shown errs on the safe side.</p>
<p>The plan figures filled in are the most common private plan in the March 2026 survey of the Bureau of Labor Statistics (BLS, the federal statistics office): ${K.pct(K.PRIV.ltd_median_pct! / 100)} of pay, up to ${K.usd(K.PRIV.ltd_max_monthly_p50!)} a month. Enter your plan's figures under “More details” if you have them. Set the share of pay to 0 if you have no plan at work. Not sure whether you have one? Your benefits page or the human resources office can tell you; until then, try both and see how much the answer moves.</p>
<h2>From your disability insurance needs to a policy</h2>
<p>A policy you buy with your own after-tax money pays its benefit tax-free. So the amount still missing after tax is the benefit to ask the insurer for. A taxed benefit would need to be larger: for ${K.usd(NEED)} with no plan at work, ${K.usd(taxed.gross)} a month instead of ${K.usd(free.gross)}.</p>
<p>Do not count on Social Security disability to fill the gap. It pays only under a strict definition, after months of waiting, and a plan at work subtracts it anyway. If you already get a check, enter it as other money that keeps coming.</p>
<p>A plan at work usually ends when you leave the job, so the gap may grow if you change employers. Once you know the benefit to add, choose the other terms: the ${h.a('elimination-period', 'waiting period')}, which your savings must cover, and the ${h.a('own-occupation-disability-insurance', 'definition of disability')}. The ${h.a('disability-insurance-cost', 'cost page')} then measures the premium on each quote.</p>
`,
  tool: 'need',
  related: ['disability-insurance-cost', 'long-term-disability-insurance', 'disability-insurance-self-employed', 'elimination-period'],
  sources: ['irs_p525', 'irs_rp_2025_32', 'bls_ebs_2026'],
});
