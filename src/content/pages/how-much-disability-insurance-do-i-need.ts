import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const NEED = 4500, SAL = 90000;
const plan = Math.min(SAL / 12 * 0.6, K.PRIV.ltd_max_monthly_p50!);
const taxed = K.need({ need: NEED, otherMonthly: 0, payer: 'employer', employeeShare: 0, st: 'single' });
const free = K.need({ need: NEED, otherMonthly: 0, payer: 'own', employeeShare: 0, st: 'single' });
const spouse = K.need({ need: NEED, otherMonthly: 1500, payer: 'own', employeeShare: 0, st: 'single' });
const th = K.th(SAL);
const groupNet = K.ltd({ salary: SAL, pct: 0.6, cap: K.PRIV.ltd_max_monthly_p50!, ssdi: 0, otherOffsets: 0, minBenefit: 0, payer: 'employer', employeeShare: 0, st: 'single', otherIncome: 0, elimDays: 90 }).inHand;

export default definePage({
  id: 'how-much-disability-insurance-do-i-need', group: 'disability', order: 110, slug: 'how-much-disability-insurance-do-i-need',
  nav: 'How much coverage you need', card: 'From the monthly budget you must keep to the benefit to buy, after tax and after what your group plan already pays.',
  title: 'Disability Insurance Needs 2026: Benefit to Keep Your Budget',
  description: 'Disability insurance needs in 2026: the monthly benefit that keeps your budget after federal tax, what your group plan already pays, and the gap left to cover.',
  h1: 'How much disability insurance do you need?',
  intro: 'Enter the money you need each month after tax, your salary and who pays your group plan. The calculator gives the benefit to buy on top of the plan you have.',
  resume: `The benefit to buy is the monthly money you need after tax, minus what would keep coming in, converted into a gross benefit by the tax rule of the policy. Start from spending, not salary: housing, debt payments, insurance, food and transport, plus savings you want to keep up. Someone who needs ${K.usd(NEED)} a month and earns ${K.usd(SAL)} takes home about ${K.usd(th.net / 12)} today. An employer-paid group plan at 60% would pay ${K.usd(plan)} gross, or about ${K.usd(groupNet)} after federal income tax for a single filer. To keep ${K.usd(NEED)} from a taxable benefit alone would take ${K.usd(taxed.gross)} a month; from a policy bought with after-tax money, which is tax-free under IRS Publication 525, exactly ${K.usd(free.gross)}. A spouse's ${K.usd(1500)} of monthly income brings the need to ${K.usd(spouse.gross)}. Insurers then decide how much coverage they will issue against your earnings, counting group coverage too.`,
  faqs: [
    { q: 'How much of my income should disability insurance replace?', a: `Enough to cover the spending that continues if you stop working, not a fixed share of salary. Group plans usually pay 60% of base pay before tax, which can leave far less in hand once the monthly maximum and tax apply. At ${K.usd(SAL)}, an employer-paid 60% plan leaves about ${K.usd(groupNet)} a month after federal tax, against ${K.usd(th.net / 12)} of take-home pay.` },
    { q: 'Should I count my spouse’s income when sizing disability coverage?', a: `Yes, if it would continue and you would rely on it. Every dollar that keeps coming in lowers the benefit you need to buy. In the example, ${K.usd(1500)} of a spouse's monthly income takes the tax-free benefit needed from ${K.usd(free.gross)} to ${K.usd(spouse.gross)}. Leave it out if you want the policy to protect the household against both incomes stopping.` },
    { q: 'Why does a tax-free benefit need to be smaller?', a: `Because none of it goes to the IRS. A benefit from a policy you paid for with after-tax money is not income, so ${K.usd(free.gross)} a month delivers ${K.usd(NEED)}. A benefit from an employer-paid or pre-tax plan is taxed like wages, so ${K.usd(taxed.gross)} is needed for the same money in hand, for a single filer with no other income in 2026.` },
    { q: 'Can I buy as much individual disability coverage as I want?', a: 'No. Insurers issue coverage up to a limit set against your earned income, and count the group and individual coverage you already have, so that a claim does not pay more than working. The limit is the insurer’s, written in its underwriting rules, not a legal figure. The calculator shows the gap; the quote shows what an insurer will issue for it.' },
  ],
  body: (h) => `
<h2>Start from spending</h2>
<p>The number that matters is the money you would need each month if you could not work: housing, utilities, insurance premiums, debt payments, food, transport, child care, and contributions you want to maintain, such as to retirement savings. Some costs fall during a disability, commuting and work clothes for example; some rise, such as health costs or help at home. Write the figure you would actually need, after tax, in the first field of the calculator. It is the target the rest of the arithmetic serves.</p>
<p>Then subtract what would keep coming in: a spouse's pay, rental income, a pension already in payment. The difference is the money a disability benefit has to provide, after tax.</p>
<h2>Turn the gap into a gross benefit</h2>
<p>A disability benefit is taxable or not depending on who paid for it (${h.src('irs_p525', 'IRS Publication 525')}). If the employer pays, or you pay by pre-tax deduction, the benefit is taxed with the 2026 brackets and standard deduction like wages (${h.src('irs_rp_2025_32', 'Revenue Procedure 2025-32')}), and the calculator grosses up the target by solving for the benefit that leaves the target after tax. If you pay after tax, including any individual policy you buy yourself, the benefit is the target. The difference for ${K.usd(NEED)} is ${K.usd(taxed.gross - free.gross)} a month.</p>
${h.mini('need', { t: 'The benefit your budget needs', p: ['need', 'payer'], d: { need: NEED } })}
<h2>Subtract the group plan</h2>
<p>If your employer offers long-term disability, the calculator subtracts what the plan pays: its percentage of your salary, limited by its maximum. Enter your plan's figures in the options; the defaults are the private industry medians of the Bureau of Labor Statistics for March 2026, ${K.pct(K.PRIV.ltd_median_pct! / 100)} and ${K.usd(K.PRIV.ltd_max_monthly_p50!)} (${h.src('bls_ebs_2026', 'BLS')}). Be careful to compare like with like. The calculator compares the gross plan benefit with the gross benefit needed under the tax rule you selected; if your group plan is taxable and the policy you would buy is not, run the calculator twice, once for each arrangement, or use the ${h.a('long-term-disability-insurance', 'long-term disability calculator')} for the net group figure.</p>
<p>Group coverage has another limit: it usually ends when you leave the job. If you expect to change employers or work for yourself, the gap may be larger than today's figure, and the ${h.a('disability-insurance-self-employed', 'self-employed page')} starts from zero group coverage.</p>
<h2>Social Security is not a plan</h2>
<p>Social Security disability pays only under a strict definition, after a waiting period and a decision that can take months, and a group plan subtracts it anyway. Counting on an award to fill the gap overstates what you would have, and this site does not estimate awards. If you already receive one, enter it as other income.</p>
<h2>From the gap to a policy</h2>
<p>Review the figure whenever your budget or your job changes: a new mortgage, a child, a raise above the group plan's maximum or a move to self-employment all change the gap. Once you know the monthly benefit to add, choose the other terms: the ${h.a('elimination-period', 'elimination period')}, which your savings must cover; the benefit period, to an age or for a number of years; the ${h.a('own-occupation-disability-insurance', 'definition of disability')}; and a cost-of-living rider for long claims. The ${h.a('disability-insurance-cost', 'cost page')} then measures the premium on each quote.</p>
`,
  tool: 'need',
  related: ['disability-insurance-cost', 'long-term-disability-insurance', 'disability-insurance-self-employed', 'elimination-period'],
  sources: ['irs_p525', 'irs_rp_2025_32', 'bls_ebs_2026'],
});
