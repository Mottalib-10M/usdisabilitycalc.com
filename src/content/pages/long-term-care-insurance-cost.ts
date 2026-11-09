import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const x = { age: 55, claimAge: 80, daily: 200, years: 3, premium: 3000 };
const none = K.pool({ ...x, inflation: 'none' }), s3 = K.pool({ ...x, inflation: 'simple3' }), c3 = K.pool({ ...x, inflation: 'compound3' }), c5 = K.pool({ ...x, inflation: 'compound5' });
const late = K.pool({ ...x, age: 65, inflation: 'compound3' });
const rows: Array<[string, typeof none]> = [['None', none], ['3% simple', s3], ['3% compound', c3], ['5% compound', c5]];

export default definePage({
  id: 'long-term-care-insurance-cost', group: 'care', order: 203, slug: 'long-term-care-insurance-cost',
  nav: 'Long-term care insurance cost', card: 'What the premium on your quote buys: the benefit pool at the age of a claim, with or without inflation protection, against the premiums paid.',
  title: 'Long-Term Care Insurance Cost 2026: What a Premium Buys',
  description: 'Long-term care insurance cost in 2026: the benefit pool your quoted premium buys at the age of a claim, with inflation protection, against the premiums paid.',
  h1: 'Long-term care insurance cost: what your premium buys',
  intro: 'Enter your age, the daily benefit and benefit period on your long-term care insurance quote, the inflation option and the yearly premium. The pool of benefits available at the age you test appears at once.',
  resume: `A long-term care policy sells a pool of money: a daily or monthly benefit times a benefit period, sometimes growing each year with an inflation option. Premiums depend on the insurer, age, health, the benefit, the period, the waiting period and the inflation option, and no public source publishes them, so this page takes the premium on your quote and measures what it buys. Bought at ${x.age} with a ${K.usd(x.daily)} daily benefit for ${x.years} years, the pool is ${K.usd(none.poolNow)} today. At age ${x.claimAge}, after ${none.yearsPaying} years of premiums, it is still ${K.usd(none.poolAtClaim)} without inflation protection, ${K.usd(s3.poolAtClaim)} with 3% simple growth, ${K.usd(c3.poolAtClaim)} with 3% compound and ${K.usd(c5.poolAtClaim)} with 5% compound. A ${K.usd(x.premium)} yearly premium adds up to ${K.usd(c3.premiums)} by then. Part of each premium can count as a medical expense within the 2026 IRS age limits, up to ${K.usd(c3.deductibleNow)} at ${x.age}.`,
  faqs: [
    { q: 'How much does long-term care insurance cost a year?', a: 'It depends on age at purchase, health, the daily or monthly benefit, the benefit period, the elimination period and the inflation option, and it varies by insurer. No official source publishes rates that this site may reproduce. Enter the premium of each quote in the calculator to see what it buys at the age of a claim and how much you will have paid by then.' },
    { q: 'Is inflation protection worth it on long-term care insurance?', a: `It decides what the benefit is worth when you claim, often decades later. A ${K.usd(x.daily)} daily benefit bought at ${x.age} is still ${K.usd(x.daily)} at ${x.claimAge} without it, ${K.usd(c3.dailyAtClaim)} with 3% compound growth and ${K.usd(c5.dailyAtClaim)} with 5% compound. Compare those figures with care costs you expect, and the premium difference on your quote.` },
    { q: 'Can long-term care insurance premiums go up after I buy?', a: 'Yes, for most policies. A long-term care contract must be renewable, but insurers can raise premiums for a whole class of policyholders with the approval of state regulators, and many have. Some contracts offer paid-up options or a lower benefit instead of the increase. Ask for the rate history of the policy form before you buy.' },
    { q: 'Does buying long-term care insurance later cost more?', a: `The yearly premium is usually higher at an older age, but there are fewer years to pay. Bought at 65 instead of 55, the same quote pays premiums for ${late.yearsPaying} years instead of ${c3.yearsPaying} until 80, and the pool with 3% compound growth is ${K.usd(late.poolAtClaim)} instead of ${K.usd(c3.poolAtClaim)}, because it has grown for fewer years. Health can also prevent buying later.` },
  ],
  body: (h) => `
<h2>What a long-term care insurance quote describes</h2>
<p>A long-term care quote names a benefit and a price. The benefit is a daily or monthly maximum and a benefit period, often two to five years, sometimes expressed directly as a pool of money; an elimination period, counted in days of care before benefits begin; and an inflation option. Multiply the daily benefit by 365 and by the years of the benefit period, and you get the pool the policy can pay at today's values. The calculator then moves that pool forward to the age you test with the inflation option you choose.</p>
${h.table(['Inflation option', `Daily benefit at ${x.claimAge}`, `Pool at ${x.claimAge}`], rows.map(([l, r]) => [l, K.usd(r.dailyAtClaim), K.usd(r.poolAtClaim)]), `A ${K.usd(x.daily)} daily benefit for ${x.years} years, bought at ${x.age}.`, ['l', 'r', 'r'])}
<h2>Premiums against the pool</h2>
<p>The second figure the calculator shows is the total of premiums paid until the age you test, assuming the premium stays flat, which is the best case. The ratio of the pool to those premiums says how many dollars of potential benefit each dollar of premium buys, if a claim happens at that age. It is not a return: many policyholders never claim, some claim for a few months, and a few use the whole pool. What it gives is a common scale for two quotes with different benefits or inflation options.</p>
${h.mini('ltcpool', { t: 'Your quote at the age of a claim', p: ['day', 'prem'], d: { day: x.daily, prem: x.premium } })}
<h2>Why no price list</h2>
<p>Search results for long-term care insurance cost are led by insurers, associations and agents, and the figures they show come from their own surveys or price samples, for one profile at one moment. Premiums are filed with state insurance departments by policy form, and they change. This site publishes no rate that it could not read at an official source; the calculator works from your quote instead, which is the figure that matters for you.</p>
<h2>Choosing the other terms</h2>
<p>The benefit period and the elimination period trade premium against risk the same way as in disability insurance. A longer benefit period raises the pool and the premium; a longer elimination period, counted in days of paid care before benefits begin, lowers the premium and leaves the first months to your savings. Some policies count home care days differently from facility days. Shared-care options let a couple draw on each other's pool. Test each version of the quote in the calculator with its own premium.</p>
<h2>Premium increases</h2>
<p>A qualified long-term care contract must be one the insurer keeps renewing (${h.src('irs_p525', 'IRS Publication 525')}), but renewal does not freeze the price. Insurers can raise premiums for all holders of a policy form, subject to state approval, and many older policies have seen large increases. When an increase comes, contracts usually offer choices: pay it, lower the daily benefit, shorten the benefit period or drop inflation protection. Enter a higher premium in the calculator to see how an increase changes the ratio.</p>
<h2>Tax on both sides</h2>
<p>Within the age limit of the year, ${K.usd(K.ltcLimit(x.age))} at ${x.age} in 2026 under ${h.src('irs_rp_2025_32', 'Revenue Procedure 2025-32')}, the premium can count as a medical expense, be deducted by the self-employed or be paid from a health savings account; the ${h.a('long-term-care-insurance-tax-deduction', 'deduction calculator')} shows what that saves. A per diem policy whose daily benefit grows above the per diem limit, ${K.usd(K.LTC.perDiem2026)} a day in 2026, can produce taxable benefits when care costs are lower; the ${h.a('long-term-care-insurance-benefits-taxable', 'benefits tax page')} explains when. A ${h.a('hybrid-long-term-care-insurance', 'hybrid life policy')} is the main alternative for buyers who want a death benefit if care is never needed.</p>
`,
  tool: 'ltcpool',
  related: ['long-term-care-insurance-tax-deduction', 'hybrid-long-term-care-insurance', 'long-term-care-insurance-benefits-taxable', 'disability-insurance-cost'],
  sources: ['irs_rp_2025_32', 'irs_p525', 'irs_p502'],
});
