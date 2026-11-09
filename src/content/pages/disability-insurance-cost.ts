import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

// Same figures as the calculator above (K.EX for the salary).
const PREM = 120, BEN = 4000, SAL = K.EX.sal, YRS = 25;
const paid = PREM * 12 * YRS;
const months = Math.ceil(paid / BEN);
const per100 = PREM / BEN * 100;
const shareSal = PREM * 12 / SAL;
const grp = K.premiumChoice({ salary: SAL, premium: 300, benefit: 4000, months: 1, st: 'single' });

export default definePage({
  id: 'disability-insurance-cost', group: 'disability', order: 105, slug: 'disability-insurance-cost',
  nav: 'Disability insurance cost', card: 'What a quoted premium really costs: share of income, price per $100 of benefit, and months of claim that pay it back.',
  title: 'Disability Insurance Cost 2026: Measure the Premium You Pay',
  description: 'Disability insurance cost in 2026: turn the premium on your quote into a share of income, a price per $100 of monthly benefit and months of claim to break even.',
  h1: 'Disability insurance cost: what your premium buys',
  intro: 'Enter the monthly premium and benefit on your quote, your salary and the years you expect to pay. The calculator measures the premium three ways, so two quotes can be compared on the same basis.',
  resume: `How much disability insurance costs depends on the insurer, your age, occupation, health history, the benefit, the elimination period and the riders, and no public source publishes premium rates that a site may reproduce. Ranges found online come without a source or a date. This page does something else: it takes the premium on your own quote and measures it. A policy at ${K.usd(PREM)} a month for a ${K.usd(BEN)} monthly benefit costs ${K.pct(shareSal, 1)} of an ${K.usd(SAL)} salary and ${K.cents(Math.round(per100 * 100) / 100)} per $100 of monthly benefit. Paid for ${K.num(YRS)} years, the premiums add up to ${K.usd(paid)}, which a claim returns in ${K.num(months)} months of benefits. An individual policy bought with after-tax money pays tax-free (IRS Publication 525), so its benefit compares with take-home pay, not gross pay. Group coverage at work is usually cheaper per dollar of benefit but capped and taxable when the employer pays.`,
  faqs: [
    { q: 'How much does disability insurance cost per month?', a: 'The premium is set by the insurer from your age, occupation class, health, the benefit amount, the elimination period, the benefit period and riders such as a cost-of-living adjustment. This site publishes no rates because no official source does. Enter the premium of each quote in the calculator: the price per $100 of monthly benefit lets you compare quotes for different amounts on one scale.' },
    { q: 'How do I compare two disability insurance quotes?', a: `Put both on the same scale: premium per $100 of monthly benefit, and the same elimination period, benefit period and definition of disability. A quote at ${K.usd(PREM)} for ${K.usd(BEN)} costs ${K.cents(Math.round(per100 * 100) / 100)} per $100. A cheaper quote with a 180-day wait or a benefit ending after five years buys less, and a noncancelable contract keeps its premium fixed where a renewable one can rise.` },
    { q: 'Is it worth paying for disability insurance?', a: `That depends on what else would pay your bills. The break-even figure helps: ${K.num(YRS)} years of a ${K.usd(PREM)} premium equal ${K.num(months)} months of a ${K.usd(BEN)} benefit. A long claim pays the premiums back many times; no claim pays nothing. Savings, a spouse's income and group coverage at work all reduce the benefit you need to buy.` },
    { q: 'Why does group disability coverage cost less than an individual policy?', a: `A group plan prices the risk of a whole workforce, usually with no individual health questions, and pays a capped and often taxable benefit. The yearly premium you see for group coverage, when you pay it at all, is small: on a ${K.usd(300)} premium, a pre-tax deduction saves a single filer at ${K.usd(SAL)} about ${K.usd(grp.extraYearly)} a year. Group coverage usually ends when you leave the job.` },
  ],
  body: (h) => `
<h2>Why this page shows no price list</h2>
<p>Search results for the cost of disability insurance offer ranges of premiums, often as a percentage of income, with no source, no date and no statement of the benefit, waiting period or contract they price. They are produced by sellers who want a quote request. Insurers file their rates with state regulators, but no federal source publishes them in a form a site may reproduce, and the Bureau of Labor Statistics survey covers whether employers offer plans and what they pay, not what individual policies cost (${h.src('bls_ebs_2026', 'BLS, March 2026')}). Rather than repeat unsourced numbers, the calculator asks for the figure that matters: the premium on your quote.</p>
<h2>Three ways to measure a premium</h2>
<p>The share of income tells you what the policy takes from your budget. A premium of ${K.usd(PREM)} a month is ${K.usd(PREM * 12)} a year, ${K.pct(shareSal, 1)} of ${K.usd(SAL)}. The price per $100 of monthly benefit makes quotes for different amounts comparable: ${K.cents(Math.round(per100 * 100) / 100)} in the example. The months of claim to break even translate the total of premiums over the years you expect to pay into months of benefit: ${K.num(months)} months for ${K.num(YRS)} years of premiums. A policy whose benefit runs to age 65 can pay that back many times over in a long claim, which is the event it is bought for.</p>
<p>None of these numbers says whether a policy is a good deal for you; they say what you are paying for. Combine them with the ${h.a('how-much-disability-insurance-do-i-need', 'needs calculator')}, which tells you how large a benefit to buy, and the ${h.a('own-occupation-disability-insurance', 'own-occupation calculator')}, which measures what the definition of disability is worth.</p>
${h.mini('cost', { t: `A second quote to compare: ${K.usd(90)} a month for ${K.usd(3000)} of benefit`, p: ['prem', 'ben'], d: { prem: 90, ben: 3000 } })}
<h2>What moves the premium</h2>
<p>Insurers price a disability policy from a handful of factors, each visible on the quote or the application: age at purchase, occupation class (desk work costs less than manual work), the monthly benefit, the elimination period, the benefit period, the definition of disability, and riders such as a future increase option, a residual benefit for partial work or a cost-of-living adjustment once on claim. A longer elimination period lowers the premium because the first months are yours to carry; the ${h.a('elimination-period', 'elimination period calculator')} shows what that costs in savings. Contract type matters too: a noncancelable policy fixes the premium and terms until the age stated; a renewable one must be renewed but its rates can rise for a whole class of policyholders.</p>
<h2>Tax changes the comparison</h2>
<p>A benefit from an individual policy you pay with after-tax money is not income under ${h.src('irs_p525', 'Publication 525')}, so ${K.usd(BEN)} a month replaces ${K.usd(BEN)} of take-home pay. A group benefit paid for by the employer is taxable, so a larger gross figure is needed for the same money in hand. When you compare a quote with your group plan, compare net with net; the ${h.a('is-disability-insurance-taxable', 'tax calculator')} gives the net group figure. If you choose to pay a premium through pre-tax payroll deduction, the calculator shows the yearly tax saved and the ${h.a('pre-tax-vs-after-tax-disability-premiums', 'election page')} what it costs on a claim.</p>
<h2>Group plan or individual policy</h2>
<p>Group coverage is offered to ${K.bp(K.G('Private industry').ltd)} of private workers for long-term disability and is usually paid by the employer. Its limits are the monthly maximum, the definition of earnings and the end of coverage when you change jobs. An individual policy follows you, can cover bonus and commission if underwritten on them, and can add an own-occupation definition. Many people hold both: the group plan as a base, an individual policy to fill the gap above its maximum.</p>
`,
  tool: 'cost',
  related: ['how-much-disability-insurance-do-i-need', 'own-occupation-disability-insurance', 'disability-insurance-self-employed', 'elimination-period'],
  sources: ['irs_p525', 'bls_ebs_2026', 'irs_rp_2025_32'],
});
