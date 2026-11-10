import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

// Same figures as the calculator above (K.EX for the salary).
const PREM = 120, BEN = 4000, SAL = K.EX.sal, YRS = 25;
const paid = PREM * 12 * YRS;
const months = Math.ceil(paid / BEN);
const per100 = PREM / BEN * 100;
const shareSal = PREM * 12 / SAL;

export default definePage({
  id: 'disability-insurance-cost', group: 'disability', order: 105, slug: 'disability-insurance-cost',
  nav: 'Disability insurance cost', card: 'What a quoted premium really costs: share of income, price per $100 of benefit, and months of claim that pay it back.',
  title: 'Disability Insurance Cost 2026: Measure the Premium You Pay',
  description: 'Disability insurance cost in 2026: turn the premium on your quote into a share of income, a price per $100 of monthly benefit and months of claim to break even.',
  h1: 'Disability insurance cost: what your premium buys',
  intro: 'Enter the monthly premium and benefit on your disability insurance quote, your salary and the years you expect to pay. The calculator measures the premium three ways, so two quotes can be compared on the same basis.',
  resume: `How much disability insurance costs depends on the insurer, your age, your job, your health, the benefit, the waiting period and the options added. No public source publishes premium rates that a site may reproduce, and ranges found online come without a source or a date. So this page does something else: it takes the premium on your own quote and measures it. Take a policy at ${K.usd(PREM)} a month for a ${K.usd(BEN)} monthly benefit. It costs ${K.pct(shareSal, 1)} of a ${K.usd(SAL)} salary. It also costs ${K.cents(Math.round(per100 * 100) / 100)} for each $100 of monthly benefit, the figure that lets you compare two quotes. Paid for ${K.num(YRS)} years, the premiums add up to ${K.usd(paid)}. A claim of ${K.num(months)} months gives all of it back. A policy bought with after-tax money pays tax-free, so compare its benefit with your take-home pay, not your pay before tax.`,
  faqs: [
    { q: 'How much does disability insurance cost per month?', a: 'The insurer sets the premium from your age, your type of job, your health, the benefit amount, the waiting period, how long it pays and options such as a yearly raise once on claim. This site publishes no rates because no official source does. Enter the premium of each quote in the calculator: the price for each $100 of monthly benefit puts quotes for different amounts on one scale.' },
    { q: 'How do I compare two disability insurance quotes?', a: `Put both on the same scale: premium for each $100 of monthly benefit, with the same waiting period, the same benefit period and the same definition of disability. A quote at ${K.usd(PREM)} for ${K.usd(BEN)} costs ${K.cents(Math.round(per100 * 100) / 100)} per $100. A cheaper quote with a 180-day wait, or a benefit that ends after five years, buys less.` },
    { q: 'Is it worth paying for disability insurance?', a: `That depends on what else would pay your bills. The break-even figure helps: ${K.num(YRS)} years of a ${K.usd(PREM)} premium equal ${K.num(months)} months of a ${K.usd(BEN)} benefit. A long claim pays the premiums back many times; no claim pays nothing back. Savings, a spouse's income and a plan at work all lower the benefit you need to buy.` },
  ],
  body: (h) => `
<h2>Why this page shows no price list</h2>
<p>Search results for the cost of disability insurance show ranges of premiums, often as a share of income. They give no source, no date, and no word on the benefit or the contract they price. Most come from sellers who want your contact details for a quote.</p>
<p>Insurers file their rates with each state, but no federal source publishes them in a form a site may copy. The survey of the Bureau of Labor Statistics (BLS, the federal statistics office) counts who is offered a plan at work, not what a policy costs. So the calculator asks for the figure that matters: the premium on your own quote. The ${K.usd(PREM)} filled in is only an example; type yours over it. No quote yet? The page still shows how the measure works, and you can come back with real figures. Nothing you type leaves your browser.</p>
<h2>Three ways to measure a premium</h2>
<p>The share of income tells you what the policy takes from your budget. In the example, ${K.usd(PREM)} a month is ${K.pct(shareSal, 1)} of a ${K.usd(SAL)} salary.</p>
<p>The price for each $100 of monthly benefit makes quotes for different amounts comparable. In the example, it is ${K.cents(Math.round(per100 * 100) / 100)}.</p>
<p>The months of claim that pay back the premiums turn years of payments into months of benefit. In the example, ${K.num(YRS)} years of premiums come back after ${K.num(months)} months of claim. A policy that pays to age 65 can return that many times over in a long claim, which is the event it is bought for.</p>
<p>None of these numbers says whether a policy is a good deal for you. They say what you pay for. The ${h.a('how-much-disability-insurance-do-i-need', 'needs calculator')} tells you how large a benefit to buy. Below, a second quote: cheaper each month, but more expensive for each $100 of benefit.</p>
${h.mini('cost', { t: `A second quote to compare: ${K.usd(90)} a month for ${K.usd(2500)} of benefit, cheaper but more expensive per $100`, p: ['prem', 'ben'], d: { prem: 90, ben: 2500 } })}
<h2>What moves the cost of disability insurance</h2>
<p>Insurers price a policy from a few factors you can see on the quote. Your age when you buy. Your type of job: desk work costs less than manual work. The monthly benefit. The waiting period before the first check: a longer wait lowers the premium, because the first months are yours to carry. And how long the checks can last.</p>
<p>The contract type matters too. A policy the insurer cannot cancel or reprice (noncancelable) keeps its premium fixed. A renewable one can see its price rise for a whole group of policyholders. Ask the insurer which kind your quote is before you compare prices: a low price that can rise later is not the same deal.</p>
<p>Tax changes the comparison with a plan at work. A policy you pay with after-tax money pays tax-free, so ${K.usd(BEN)} a month replaces ${K.usd(BEN)} of take-home pay. A plan your employer pays is taxed, so it needs a larger check for the same money in hand. Compare after tax with after tax: the ${h.a('is-disability-insurance-taxable', 'tax calculator')} gives the figure for your plan at work. Many people hold both: the plan at work as a base, and a policy of their own to fill the gap above its monthly maximum.</p>
`,
  tool: 'cost',
  related: ['how-much-disability-insurance-do-i-need', 'own-occupation-disability-insurance', 'disability-insurance-self-employed', 'elimination-period'],
  sources: ['irs_p525', 'bls_ebs_2026', 'irs_rp_2025_32'],
});
