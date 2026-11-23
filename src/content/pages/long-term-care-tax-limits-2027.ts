import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

/* 2027 figures: Rev. Proc. 2026-35 (brackets, standard deduction, long-term care limits, per diem), Rev. Proc. 2026-24 (HSA),
   SSA Federal Register notice of October 26, 2026 (wage base, COLA, SGA). All read in params-2026.json. */
const L = K.ltcLimit;
const F27 = K.P.federal2027, H27 = K.P.hsa2027, LTC = K.LTC;
const ages: Array<[string, number]> = [['40 or under', 40], ['41 to 50', 50], ['51 to 60', 60], ['61 to 70', 70], ['71 or over', 71]];
const self26 = K.ltcDed({ age: 64, premium: 5200, income: 90000, otherMedical: 0, otherItemized: 0, st: 'single', path: 'self', seProfit: 90000 });
const self27 = K.ltcDed({ age: 64, premium: 5200, income: 90000, otherMedical: 0, otherItemized: 0, st: 'single', path: 'self', seProfit: 90000, year: 2027 });
const pd26 = K.perDiem({ daily: 500, days: 365, costs: 100000, reimbursed: 0 });
const pd27 = K.perDiem({ daily: 500, days: 365, costs: 100000, reimbursed: 0, year: 2027 });
const disab = 3000 * 12;
const tax26 = K.taxOn(disab, 'single'), tax27 = K.taxOn(disab, 'single', 2027);

export default definePage({
  id: 'long-term-care-tax-limits-2027', group: 'care', order: 205, slug: 'long-term-care-tax-limits-2027',
  nav: '2027 tax limits', card: 'The IRS limits for 2027: deductible long-term care premiums by age, the per diem limit, HSA caps and the brackets that tax a disability check.',
  title: 'Long-Term Care Premium Deduction 2027: IRS Limits by Age',
  description: `Long-term care premium deduction 2027: IRS limits from ${K.usd(L(40, 2027))} to ${K.usd(L(71, 2027))} by age, a ${K.usd(LTC.perDiem2027)} daily per diem, HSA caps and the 2027 brackets for disability pay.`,
  h1: 'Long-term care and disability tax limits for 2027',
  intro: 'The calculator is set to 2027: enter your age at the end of 2027, the long-term care premium you expect to pay and your income to see the part that counts and the federal tax it saves.',
  resume: `The IRS published the 2027 figures in Revenue Procedure 2026-35. A qualified long-term care premium counts as a medical expense in 2027 up to ${K.usd(L(40, 2027))} at age 40 or under, ${K.usd(L(50, 2027))} from 41 to 50, ${K.usd(L(60, 2027))} from 51 to 60, ${K.usd(L(70, 2027))} from 61 to 70 and ${K.usd(L(71, 2027))} above 70, against ${K.usd(L(50))}, ${K.usd(L(60))}, ${K.usd(L(70))} and ${K.usd(L(71))} in the four upper bands for 2026; the youngest band stays at ${K.usd(L(40))}. Flat daily benefits from a qualified policy are tax-free up to ${K.usd(LTC.perDiem2027)} a day, up from ${K.usd(LTC.perDiem2026)}. The standard deduction rises to ${K.usd(F27.standardDeduction.single)} for a single filer, which matters for anyone hoping to itemize a premium, and to ${K.usd(F27.standardDeduction.mfj)} for a married couple filing jointly. A health savings account takes ${K.usd(H27.contribution.self)} for self-only coverage and ${K.usd(H27.contribution.family)} for a family (Revenue Procedure 2026-24). Social Security raises its wage base to ${K.usd(F27.socialSecurityWageBase)}, which sets the payroll tax on sick pay from an employer plan.`,
  faqs: [
    { q: 'How much of a long-term care premium can I deduct in 2027?', a: `Up to the 2027 IRS limit for your age at the end of the year: ${ages.map(([l, a]) => `${K.usd(L(a, 2027))} at ${l}`).join(', ')}. The limit applies to each insured person. Within it, the premium is a medical expense: it helps an itemizer only above 7.5% of income, and a self-employed person deducts it directly.` },
    { q: 'What is the long-term care per diem limit for 2027?', a: `${K.usd(LTC.perDiem2027)} a day, set by Revenue Procedure 2026-35 for calendar year 2027, up from ${K.usd(LTC.perDiem2026)} in 2026. A flat daily benefit is tax-free up to the larger of that limit times the days and your actual care costs, minus other reimbursements. A policy that only reimburses bills is not limited this way.` },
    { q: 'Does the 2027 standard deduction change the tax on a disability check?', a: `Yes, a little. A taxable long-term disability benefit of ${K.usd(3000)} a month for a single person with no other income owes ${K.usd(tax26)} of federal income tax under the 2026 rules and ${K.usd(tax27)} under the 2027 brackets and the ${K.usd(F27.standardDeduction.single)} standard deduction. A benefit bought with after-tax premiums stays tax-free in both years.` },
    { q: 'Has the 2027 Social Security disability COLA been set?', a: 'Yes. The Social Security Administration announced a 3.6% cost-of-living increase for benefits payable from January 2027, in its Federal Register notice of October 26, 2026. A long-term disability plan with a frozen offset keeps subtracting the first award, so the raise reaches you in full; a plan without that clause may reduce its check by the raise.' },
  ],
  body: (h) => `
<h2>Long-term care premium limits for 2025, 2026 and 2027</h2>
<p>The IRS indexes the age-based limits under section 213(d)(10) every year. The 2027 column comes from section 3.29 of ${h.src('irs_rp_2026_35', 'the IRS limits for 2027')}; the earlier ones from the procedures for 2026 and 2025. Age is the age reached on December 31.</p>
${h.table(['Age at the end of the year', '2025', '2026', '2027'], ages.map(([l, a]) => [l, K.usd(L(a, 2025)), K.usd(L(a)), K.usd(L(a, 2027))]), 'Most of a qualified long-term care premium that counts as a medical expense, per person.', ['l', 'r', 'r', 'r'])}
<p>The largest rise is at the top: a policyholder over 70 can count ${K.usd(L(71, 2027) - L(71))} more in 2027 than in 2026. For a self-employed 64-year-old with ${K.usd(90000)} of profit and a ${K.usd(5200)} premium, the deductible part goes from ${K.usd(self26.eligible)} to ${K.usd(self27.eligible)} and the federal tax saved from ${K.usd(self26.saved)} to ${K.usd(self27.saved)}, because the 2027 brackets also move.</p>
<h2>The other 2027 figures behind disability and care taxes</h2>
${h.table(['Figure', '2026', '2027'], [
  ['Per diem limit, flat daily benefits', K.usd(LTC.perDiem2026), K.usd(LTC.perDiem2027)],
  ['Standard deduction, single', K.usd(K.FED.standardDeduction.single), K.usd(F27.standardDeduction.single)],
  ['Standard deduction, married filing jointly', K.usd(K.FED.standardDeduction.mfj), K.usd(F27.standardDeduction.mfj)],
  ['Standard deduction, head of household', K.usd(K.FED.standardDeduction.hoh), K.usd(F27.standardDeduction.hoh)],
  ['HSA contribution, self-only', K.usd(K.HSA.contribution.self), K.usd(H27.contribution.self)],
  ['HSA contribution, family', K.usd(K.HSA.contribution.family), K.usd(H27.contribution.family)],
  ['Social Security wage base', K.usd(K.FED.socialSecurityWageBase), K.usd(F27.socialSecurityWageBase)],
], 'Federal figures for 2026 and 2027 (IRS and Social Security Administration).', ['l', 'r', 'r'])}
<p>The per diem limit decides how much of a flat daily benefit escapes tax. A policy paying ${K.usd(500)} a day all year, against ${K.usd(100000)} of care costs, leaves ${K.usd(pd26.taxable)} taxable in 2026 and ${K.usd(pd27.taxable)} in 2027 (${h.src('irs_rp_2026_35', 'section 3.67 of the 2027 procedure')}). The ${h.a('long-term-care-insurance-benefits-taxable', 'per diem page')} explains Form 8853.</p>
${h.mini('perdiem', { t: 'Your daily benefit with the 2027 limit', p: ['day', 'cost'], d: { yr: '2027', day: 500, cost: 100000 } })}
<h2>2027 brackets and a taxable disability check</h2>
<p>A long-term disability benefit paid by an employer plan, or bought with pre-tax premiums, is taxed like wages. The 2027 brackets of ${h.src('irs_rp_2026_35', 'the 2027 procedure')} start at 10% up to ${K.usd(F27.brackets.single[0][0] as number)} of taxable income for a single filer and 12% up to ${K.usd(F27.brackets.single[1][0] as number)}. With a ${K.usd(3000)} monthly benefit and no other income, the federal tax falls from ${K.usd(tax26)} to ${K.usd(tax27)} for the year. Sick pay from an employer plan also carries Social Security and Medicare tax for the first six months after the last month worked; earnings above the ${K.usd(F27.socialSecurityWageBase)} wage base of 2027 (${h.src('ssa_fr_2027', 'the Social Security notice for 2027')}) pay no Social Security tax. The ${h.a('is-disability-insurance-taxable', 'disability tax page')} covers who pays and when.</p>
<p>The same notice sets the substantial gainful activity amount at $1,770 a month in 2027 for non-blind people and $2,950 for blind people, and the trial work month at $1,270. These thresholds decide whether work done while on Social Security disability counts as substantial. The ${h.a('ltd-social-security-offset', 'offset page')} shows how an award and its 3.6% raise in January 2027 change the plan check.</p>
<h2>Health savings accounts in 2027</h2>
<p>A health savings account can pay qualified long-term care premiums up to the age limit as a medical expense. For 2027, ${h.src('irs_rp_2026_24', 'Revenue Procedure 2026-24')} lets a person with self-only high deductible coverage contribute ${K.usd(H27.contribution.self)} and a family ${K.usd(H27.contribution.family)}; the plan must have a deductible of at least ${K.usd(H27.hdhpMinDeductible.self)} or ${K.usd(H27.hdhpMinDeductible.family)} and an out-of-pocket maximum no higher than ${K.usd(H27.hdhpMaxOutOfPocket.self)} or ${K.usd(H27.hdhpMaxOutOfPocket.family)}. At 60, the ${K.usd(L(60, 2027))} limit fits well inside a self-only contribution, so someone still covered by such a plan could route the whole eligible premium through the account. Once enrolled in Medicare, no new contributions are allowed, but the balance can still pay the premium.</p>
<p>What is not yet known for 2027: state disability programs set their own wage bases and maximum weekly benefits, and some publish them only in December. This page covers federal figures only; for a state benefit, check the 2027 figures on the website of the state program that pays it.</p>`,
  tool: 'ltcded', toolArg: { yr: '2027' },
  related: ['long-term-care-insurance-tax-deduction', 'long-term-care-insurance-benefits-taxable', 'is-disability-insurance-taxable', 'ltd-social-security-offset'],
  sources: ['irs_rp_2026_35', 'irs_rp_2026_24', 'ssa_fr_2027', 'irs_rp_2025_32', 'irs_p502', 'irs_f8853'],
});
