import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const H = K.HSA;
const stay = (adm: number, day: number, days: number) => adm + day * days;
const s3 = stay(1000, 200, 3), s1 = stay(1000, 200, 1), s7 = stay(1000, 200, 7);
const c3 = K.cash({ payout: s3, premium: 240, deductible: H.hdhpMinDeductible.self, oop: H.hdhpMaxOutOfPocket.self });
const fam = K.cash({ payout: s3, premium: 240, deductible: H.hdhpMinDeductible.family, oop: H.hdhpMaxOutOfPocket.family });

export default definePage({
  id: 'hospital-indemnity-insurance', group: 'accident', order: 303, slug: 'hospital-indemnity-insurance',
  nav: 'Hospital cash (hospital indemnity) insurance', card: 'What a hospital indemnity policy pays for a stay, admission plus daily benefit, against your deductible and the premium.',
  title: 'Hospital Indemnity Insurance 2026: What a Stay Pays You',
  description: 'Hospital indemnity insurance in 2026: the admission and daily benefits a stay pays you in cash, measured against your plan deductible and the yearly premium.',
  h1: 'Hospital indemnity insurance: what a stay pays',
  intro: 'Enter the admission benefit and the daily benefit of your hospital indemnity policy, the days in hospital and the yearly premium. The cash paid for the stay and the share of your deductible it covers appear at once.',
  resume: `Hospital indemnity insurance pays a fixed amount when you are admitted to a hospital, often an admission benefit plus a daily benefit for each day of the stay, regardless of the bill or of what your health plan pays. With a ${K.usd(1000)} admission benefit and ${K.usd(200)} a day, a three-day stay pays ${K.usd(s3)}, a one-day stay ${K.usd(s1)} and a week ${K.usd(s7)}. Against the minimum deductible of a plan that qualifies for a health savings account in 2026, ${K.usd(H.hdhpMinDeductible.self)} for self-only coverage in 2026, the three-day payment covers ${K.pct(c3.deductibleShare)}; against the ${K.usd(H.hdhpMaxOutOfPocket.self)} ceiling on out-of-pocket costs, ${K.pct(c3.oopShare)}. At a ${K.usd(240)} yearly premium, it equals ${K.dec(c3.yearsOfPremium, 1)} years of premiums. Observation stays, outpatient procedures and emergency visits without admission are often outside the benefit or paid at a lower rate. Bought with after-tax money, the benefits are not taxable (IRS rules).`,
  faqs: [
    { q: 'How much does hospital indemnity insurance pay per day?', a: `The daily amount written in the policy, chosen when you enroll, usually alongside a one-time admission benefit and often with a limit on days per stay and per year. The calculator adds both: ${K.usd(1000)} for the admission and ${K.usd(200)} a day for three days give ${K.usd(s3)}. Some policies pay more for intensive care days or less for observation status.` },
    { q: 'Is a hospital observation stay covered by hospital indemnity insurance?', a: 'Often not as an admission. Hospitals can keep a patient under observation, billed as outpatient care, even overnight, and many indemnity policies pay their admission benefit only for an inpatient admission. Check the definition of hospital confinement in the policy and ask the hospital for your status during the stay.' },
    { q: 'Should I pair hospital indemnity insurance with a health savings account (HSA) plan?', a: `It is the most common pairing, since a high-deductible plan leaves the first bills to you. A ${K.usd(s3)} payment covers ${K.pct(c3.deductibleShare)} of the ${K.usd(H.hdhpMinDeductible.self)} minimum self-only deductible and ${K.pct(fam.deductibleShare)} of the ${K.usd(H.hdhpMinDeductible.family)} family minimum in 2026. Money put in the HSA instead is tax-free for medical costs and stays yours if you are never admitted.` },
  ],
  body: (h) => `
<h2>How a hospital indemnity benefit is built</h2>
<p>A hospital indemnity policy pays you a fixed sum when you are confined in a hospital as an inpatient. Most policies combine an admission benefit, paid once per stay, with a daily benefit for each day, up to a limit of days per stay or per year. Some add amounts for intensive care, for a newborn's stay or for outpatient surgery. The payment does not depend on the bill, and it is made to you, not to the hospital. Group versions are sold at work as voluntary benefits, paid by payroll deduction; individual versions are sold directly.</p>
<p>The calculator adds the admission benefit and the daily benefits for the days you enter, then compares the total with your health plan's deductible and out-of-pocket maximum, set by default to the 2026 minimum deductible and maximum out-of-pocket of plans that qualify for a health savings account (${h.src('irs_rp_2025_19', 'the IRS (the federal tax agency) limits for the year')}). Replace them with your own plan's figures.</p>
${h.mini('hospital', { t: 'Your stay, your payment', p: ['days', 'day'] })}
<h2>Short stays decide the value</h2>
<p>Because the admission benefit is paid once, short stays pay a large share of the total: ${K.usd(s1)} for one day, ${K.usd(s3)} for three, ${K.usd(s7)} for a week in the example. Many hospital stays are short, and some are not admissions at all. Observation status, used when a hospital keeps you to decide whether to admit you, is billed as outpatient care even when it lasts overnight, and an indemnity policy that pays only for inpatient confinement pays nothing for it. The definition of confinement is the most important line in the contract.</p>
<h2>Against your health plan</h2>
<p>The comparison with the health plan shows what the payment can do. A deductible of ${K.usd(H.hdhpMinDeductible.self)} is the least a self-only plan can ask and still qualify for a health savings account in 2026; many plans ask more. The out-of-pocket maximum caps your share of covered costs for the year, at ${K.usd(H.hdhpMaxOutOfPocket.self)} at most for self-only coverage in those plans. A stay that reaches the maximum costs you that amount, and the indemnity payment reduces the money you have to find. The ${h.a('accident-insurance', 'accident insurance')} and ${h.a('critical-illness-insurance', 'critical illness')} calculators use the same plan figures.</p>
<p><strong>Premium against payment.</strong> The years of premium figure divides the payment by the yearly premium: ${K.dec(c3.yearsOfPremium, 1)} years for a three-day stay at ${K.usd(240)} a year. The same money set aside in a health savings account, up to ${K.usd(H.contribution.self)} a year for self-only coverage in 2026, is deductible, grows tax-free and pays medical costs tax-free (${h.src('irs_p969', 'IRS rules')}), and it stays yours if you are never admitted. The policy pays more than the account would hold only if a stay comes early.</p>
<p><strong>Tax.</strong> Benefits from an accident or health policy whose premiums you paid are not income (${h.src('irs_p525', 'IRS rules')}). If the premium is paid by the employer or deducted pre-tax, fixed payments that are not reimbursements of medical expenses fall under the rule for employer-funded plans and can be taxable. Hospital indemnity does not count as health coverage for health savings account purposes, so it does not affect eligibility to contribute.</p>
`,
  tool: 'hospital',
  related: ['accident-insurance', 'critical-illness-insurance', 'accidental-death-and-dismemberment-insurance', 'short-term-disability-insurance'],
  sources: ['irs_rp_2025_19', 'irs_p525', 'irs_p969'],
});
