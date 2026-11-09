import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const PD = K.LTC.perDiem2026;
const a = K.perDiem({ daily: 500, days: 365, costs: 120000, reimbursed: 0 });
const b = K.perDiem({ daily: 500, days: 365, costs: 200000, reimbursed: 0 });
const c = K.perDiem({ daily: 400, days: 200, costs: 50000, reimbursed: 0 });
const d = K.perDiem({ daily: 600, days: 365, costs: 150000, reimbursed: 20000 });

export default definePage({
  id: 'long-term-care-insurance-benefits-taxable', group: 'care', order: 202, slug: 'long-term-care-insurance-benefits-taxable',
  nav: 'Are long-term care benefits taxable?', card: 'Reimbursement benefits are tax-free; flat daily benefits are tax-free up to the 2026 per diem limit or actual costs. The rest is income.',
  title: `Long-Term Care Benefits Tax 2026: The ${K.usd(PD)} Per Diem Limit`,
  description: `Long-term care benefits tax in 2026: reimbursement benefits are tax-free, flat daily benefits up to ${K.usd(PD)} a day or actual costs. Find the taxable part.`,
  h1: 'Are long-term care insurance benefits taxable?',
  intro: 'Enter the daily benefit your policy pays, the days paid this year and the care costs you had. The taxable part of the benefits, if any, appears at once.',
  resume: `Benefits from a qualified long-term care insurance contract are generally not income: IRS Publication 525 treats these contracts as accident and health insurance. A policy that reimburses the care costs you incur is tax-free without a limit. A policy that pays a flat amount per day, a per diem or indemnity benefit, is tax-free up to the larger of ${K.usd(PD)} a day in 2026 (${K.usd(K.LTC.perDiem2025)} in 2025) and the actual cost of qualified care, minus reimbursements from other sources. Above that, the benefit is taxable income, figured on Form 8853. A policy paying ${K.usd(500)} a day all year to someone whose care cost ${K.usd(120000)} produces ${K.usd(a.taxable)} of taxable income, because the ${K.usd(a.limitTotal)} yearly limit is larger than the costs. With ${K.usd(200000)} of costs, nothing is taxable. The same limit covers accelerated death benefits paid on a per diem basis by a life policy for a chronically ill insured.`,
  faqs: [
    { q: 'Do I pay tax on long-term care insurance benefits?', a: `Usually not. Reimbursement benefits are tax-free, and flat daily benefits are tax-free up to the larger of the per diem limit, ${K.usd(PD)} a day in 2026, and your actual care costs, minus other reimbursements. Only the excess is income. A ${K.usd(400)} daily benefit paid for ${K.num(200)} days stays under the limit, so ${K.usd(c.taxable)} is taxable.` },
    { q: 'What is the per diem limit for long-term care benefits in 2026?', a: `${K.usd(PD)} a day, set by Revenue Procedure 2025-32 under section 7702B(d)(4) of the Internal Revenue Code. It was ${K.usd(K.LTC.perDiem2025)} in 2025. The limit applies to the total of per diem long-term care benefits and per diem accelerated death benefits for the same insured person over the period, not policy by policy.` },
    { q: 'Do I need to file Form 8853 for long-term care benefits?', a: 'Yes, if you received per diem or other periodic payments from a long-term care contract or accelerated death benefits from a life policy. The insurer reports them on Form 1099-LTC, and Form 8853 compares them with the limit to show the excludable and the taxable amounts. Reimbursement payments need no exclusion figure.' },
    { q: 'How do Medicare or other reimbursements change the taxable amount?', a: `They are subtracted from the excludable amount. With ${K.usd(600)} a day for a year, ${K.usd(150000)} of costs and ${K.usd(20000)} reimbursed by another source, the exclusion is ${K.usd(d.excludable)} and ${K.usd(d.taxable)} of the ${K.usd(d.paid)} paid is taxable. The calculator takes reimbursements in its options.` },
  ],
  body: (h) => `
<h2>Two kinds of benefit, two rules</h2>
<p>Long-term care policies pay in one of two ways. A reimbursement policy, sometimes called expense-incurred, pays the bills for qualified care up to a daily or monthly maximum, and the payment can never exceed what the care cost. A per diem or indemnity policy pays a set amount for each day you qualify, whatever you spend. ${h.src('irs_p525', 'IRS Publication 525')} treats qualified long-term care contracts as accident and health insurance, so amounts received from them are excludable as amounts received for personal injury or sickness. For reimbursement benefits, that settles it. For per diem benefits, the exclusion has a limit.</p>
<h2>The per diem limit</h2>
<p>The excludable amount for a period is the larger of two figures, minus any reimbursement received for the cost of qualified long-term care services during that period: the per diem limit times the number of days, ${K.usd(PD)} a day for 2026 under section 4.62 of ${h.src('irs_rp_2025_32', 'Revenue Procedure 2025-32')}, or the actual cost of those services. Benefits up to that amount are tax-free; the rest is income. The limit is set by ${h.src('usc_7702b', 'section 7702B(d)(4)')} and adjusted every year for inflation.</p>
<p>The calculator applies this to a year of benefits. A ${K.usd(500)} daily benefit paid for 365 days is ${K.usd(a.paid)}. If care cost ${K.usd(120000)}, the limit times the days, ${K.usd(a.limitTotal)}, is the larger figure, and ${K.usd(a.taxable)} is taxable. If care cost ${K.usd(200000)}, the costs are the larger figure and the whole benefit is excluded. A policy paying less than ${K.usd(PD)} a day can never produce taxable income for that insured.</p>
${h.mini('perdiem', { t: 'Taxable part of your daily benefits', p: ['day', 'cost'] })}
<h2>Form 1099-LTC and Form 8853</h2>
<p>The insurer reports the benefits paid during the year on Form 1099-LTC. The policyholder or the insured files ${h.src('irs_f8853', 'Form 8853')} with the return when per diem payments or accelerated death benefits were received, to figure the excludable part. Keep the invoices for care during the year: they are the actual costs that can raise the exclusion above the per diem limit.</p>
<h2>Who counts as chronically ill</h2>
<p>Benefits are paid for qualified long-term care services to a chronically ill individual, as Publication 525 and ${h.src('irs_p502', 'Publication 502')} define it: someone certified by a licensed health care practitioner within the previous 12 months as unable to perform at least two activities of daily living (eating, toileting, transferring, bathing, dressing and continence) without substantial assistance for at least 90 days, or as needing substantial supervision for protection. These are the contract's benefit triggers; the policy states how certification works.</p>
<h2>Hybrid and life policies</h2>
<p>A life insurance policy that pays part of its death benefit early because the insured is chronically ill is subject to the same per diem limit when it pays periodically, combined with any long-term care benefits for the same person. The ${h.a('hybrid-long-term-care-insurance', 'hybrid calculator')} shows the monthly benefit such a policy pays and the part that may exceed the limit. Premiums on the long-term care side have their own rules on the ${h.a('long-term-care-insurance-tax-deduction', 'deduction page')}.</p>
<h2>What makes a contract qualified</h2>
<p>Publication 525 lists the conditions: the contract covers only qualified long-term care services; the insurer must keep renewing it; it has no cash surrender value or other money that can be paid, assigned, pledged or borrowed; refunds and dividends, other than at death or full surrender, may only lower future premiums or raise future benefits; and, in most cases, it does not pay for services Medicare would pay for, unless Medicare is the secondary payer or the contract pays per diem benefits regardless of expenses. A policy outside these conditions falls outside the exclusion described here; your policy's declarations page or the insurer says which kind you hold.</p>
`,
  tool: 'perdiem',
  related: ['long-term-care-insurance-tax-deduction', 'hybrid-long-term-care-insurance', 'long-term-care-insurance-cost', 'is-disability-insurance-taxable'],
  sources: ['irs_p525', 'irs_rp_2025_32', 'irs_f8853', 'usc_7702b', 'irs_p502'],
});
