import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const H = K.HSA;
const LUMP = 10000, PREM = 360;
const a = K.cash({ payout: LUMP, premium: PREM, deductible: H.hdhpMinDeductible.self, oop: H.hdhpMaxOutOfPocket.self });
const f = K.cash({ payout: LUMP, premium: PREM, deductible: H.hdhpMinDeductible.family, oop: H.hdhpMaxOutOfPocket.family });
const sal = 60000;
const weeks = LUMP / (K.th(sal).net / 52);

export default definePage({
  id: 'critical-illness-insurance', group: 'accident', order: 304, slug: 'critical-illness-insurance',
  nav: 'Critical illness insurance', card: 'What a critical illness lump sum covers: your plan’s out-of-pocket maximum, weeks of take-home pay, and years of premium.',
  title: 'Critical Illness Insurance 2026: What the Lump Sum Covers',
  description: 'Critical illness insurance in 2026: what a lump sum covers of your out-of-pocket maximum and of lost pay, the years of premium it equals, and how it is taxed.',
  h1: 'Critical illness insurance: what the lump sum covers',
  intro: 'Enter the lump sum on your critical illness policy, its yearly premium, and your health plan’s deductible and out-of-pocket maximum. The share of your worst medical year the payment covers appears at once.',
  resume: `Critical illness insurance pays a lump sum when a condition named in the policy is confirmed under the policy's terms. The list of covered conditions, the definitions each must meet and the share of the sum paid for each are contract terms, and they differ from one policy to the next; this page does not describe the conditions themselves. The value of the payment is measured in money. A ${K.usd(LUMP)} lump sum is more than the ${K.usd(H.hdhpMaxOutOfPocket.self)} most that a self-only plan qualifying for a health savings account can leave out of pocket in 2026, and covers ${K.pct(f.oopShare)} of the ${K.usd(H.hdhpMaxOutOfPocket.family)} family ceiling. It equals about ${K.dec(weeks, 0)} weeks of take-home pay at a ${K.usd(sal)} salary, and ${K.dec(a.yearsOfPremium, 0)} years of a ${K.usd(PREM)} yearly premium. Bought with after-tax money, it is not taxable income (IRS rules). It does not replace income during a long absence; disability insurance does.`,
  faqs: [
    { q: 'How does critical illness insurance pay out?', a: 'In a lump sum, once the policy’s definition for a covered condition is met, usually after a waiting period from the start of coverage and sometimes after a survival period. Some policies pay part of the sum for less severe forms and the rest later, and some pay again for a second condition. The money is paid to you and can be spent on anything.' },
    { q: 'How much critical illness coverage do I need?', a: `Start from your health plan's out-of-pocket maximum and the income you could lose. With the 2026 ceiling of ${K.usd(H.hdhpMaxOutOfPocket.self)} for a self-only health savings account (HSA) plan and about ${K.usd(K.th(sal).net / 52)} of weekly take-home pay at ${K.usd(sal)}, ${K.usd(LUMP)} covers the plan maximum and some ${K.dec(weeks - H.hdhpMaxOutOfPocket.self / (K.th(sal).net / 52), 0)} weeks of pay on top.` },
    { q: 'Is a critical illness payout taxable?', a: 'Not if you paid the premiums with after-tax money: the IRS excludes benefits from an accident or health policy you paid for. If your employer paid the premium, or you paid it through a pre-tax deduction, a lump sum that does not reimburse medical expenses can be taxable income. Check how the premium is deducted on your pay slip before you count on the whole sum.' },
  ],
  body: (h) => `
<h2>A lump sum on a list</h2>
<p>Critical illness insurance, sometimes called specified disease coverage, pays a fixed sum when one of the conditions in its list is confirmed according to the policy's own definitions. The list, the definitions and the amounts are the whole contract: two policies with the same name can cover different conditions, pay different shares for each, and exclude those that began before coverage. This site does not describe the conditions; it measures the payment against the costs and the income it is meant to support. Read the definitions page of the policy for what triggers it.</p>
<p>The calculator compares the lump sum with your health plan's deductible and out-of-pocket maximum, set by default to the 2026 limits for plans that qualify for a health savings account, ${K.usd(H.hdhpMinDeductible.self)} and ${K.usd(H.hdhpMaxOutOfPocket.self)} for self-only coverage (${h.src('irs_rp_2025_19', 'the IRS (the federal tax agency) limits for the year')}), and with the premium.</p>
${h.mini('cash', { t: 'Your lump sum against your plan', p: ['pay', 'prem'], d: { pay: LUMP, prem: PREM } })}
<h2>What the payment can do</h2>
<p>A serious condition costs in two ways: the medical bills your plan leaves to you, capped by the out-of-pocket maximum, and the income lost while you cannot work. A ${K.usd(LUMP)} payment covers the self-only maximum of ${K.usd(H.hdhpMaxOutOfPocket.self)} with ${K.usd(a.leftOver)} to spare, and ${K.pct(f.oopShare)} of the family maximum of ${K.usd(H.hdhpMaxOutOfPocket.family)}. What is left can replace pay: at ${K.usd(sal)}, take-home pay is about ${K.usd(K.th(sal).net / 52)} a week after federal tax and payroll tax, so the whole sum equals about ${K.dec(weeks, 0)} weeks. Beyond that, income during a long absence depends on ${h.a('short-term-disability-insurance', 'short-term')} and ${h.a('long-term-disability-insurance', 'long-term disability')} coverage, which pay monthly for as long as the contract allows.</p>
<h2>Critical illness insurance: premium against payment</h2>
<p>At ${K.usd(PREM)} a year, the sum equals ${K.dec(a.yearsOfPremium, 0)} years of premiums. Critical illness premiums usually rise with age at purchase and can depend on tobacco use; group versions sold at work are often voluntary and paid by the employee. As with ${h.a('accident-insurance', 'accident')} and ${h.a('hospital-indemnity-insurance', 'hospital indemnity')} coverage, the alternative is money set aside: a health savings account takes up to ${K.usd(H.contribution.self)} a year for self-only coverage in 2026, deductible and tax-free for medical costs (${h.src('irs_p969', 'IRS rules')}), but it builds slowly, while the policy pays the full sum from the first covered event after its waiting period.</p>
<p><strong>Tax on the lump sum.</strong> ${h.src('irs_p525', 'IRS rules')} excludes benefits received under an accident or health policy whose premiums you paid, or whose premiums your employer paid but included in your income. A lump sum from a policy paid with after-tax payroll deductions or bought directly is therefore not income. Paid by the employer, or with pre-tax deductions, the payment falls under the rule for employer-funded plans: amounts that do not reimburse medical care can be taxable. Since the difference can be a fifth or more of the sum, check the deduction label on your pay slip at enrollment.</p>
<p><strong>Questions to ask about a critical illness policy.</strong> Which conditions are covered, and with what definitions? Is there a waiting period from the start of coverage, and a survival period after the event? What share is paid for each condition, and can the policy pay more than once? Does coverage end or shrink at a certain age? Is the premium fixed or can it rise? The answers are in the certificate or the policy, not in the brochure.</p>
`,
  tool: 'cash', toolArg: { pay: LUMP, prem: PREM },
  related: ['accident-insurance', 'hospital-indemnity-insurance', 'long-term-disability-insurance', 'how-much-disability-insurance-do-i-need'],
  sources: ['irs_rp_2025_19', 'irs_p525', 'irs_p969'],
});
