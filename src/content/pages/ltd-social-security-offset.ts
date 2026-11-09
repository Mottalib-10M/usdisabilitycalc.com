import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const G = 5000, SS = 2000, FAM = 1000;
const a = K.offset({ gross: G, ssdi: SS, family: 0, other: 0, minBenefit: 0, cola: 0.02, years: 10, frozen: true });
const f = K.offset({ gross: G, ssdi: SS, family: 0, other: 0, minBenefit: 0, cola: 0.02, years: 10, frozen: false });
const fam = K.offset({ gross: G, ssdi: SS, family: FAM, other: 0, minBenefit: 100, cola: 0, years: 0, frozen: true });
const back = 6 * SS;
const b = { salary: 100000, pct: 0.6, cap: G, ssdi: SS, otherOffsets: 0, minBenefit: 0, payer: 'employer' as const, employeeShare: 0, st: 'single' as const, otherIncome: 0, elimDays: 90 };
const t = K.ltd(b);

export default definePage({
  id: 'ltd-social-security-offset', group: 'disability', order: 108, slug: 'ltd-social-security-offset',
  nav: 'Social Security cut to the check', card: 'How a Social Security disability award reduces a long-term disability check, now and after cost-of-living raises.',
  title: 'LTD Social Security Offset 2026: Your Check After the Award',
  description: 'LTD Social Security offset in 2026: how an SSDI award and family benefits cut a long-term disability check, the plan minimum, and a frozen offset over time.',
  h1: 'The Social Security offset: why your long-term disability check shrinks',
  intro: 'Enter the plan benefit before offsets (the other income the plan takes off its check) and the Social Security award, with any family benefits. The calculator shows the plan check now and what both pay together later.',
  resume: `Group long-term disability plans list Social Security disability among the other income they subtract from their benefit. If the plan pays ${K.usd(G)} a month before offsets and Social Security awards ${K.usd(SS)}, the plan check falls to ${K.usd(a.ltdNow)} and the total stays at ${K.usd(a.totalNow)} before tax. Benefits paid to your children or spouse on your record are often subtracted too: with ${K.usd(FAM)} of family benefits, the plan pays ${K.usd(fam.ltdNow)}, or its minimum if the contract has one. The offset clause decides what happens next. When the offset is frozen at the first award, later cost-of-living raises stay with you: with a 2% raise each year, the total grows to ${K.usd(a.totalLater)} after ten years. When the plan subtracts each raise, the total stays at ${K.usd(f.totalLater)}. An award paid late comes with back pay for past months, and the plan recovers what it overpaid in the meantime. Both benefits have their own tax rules.`,
  faqs: [
    { q: 'Why does my long-term disability plan want me to apply for Social Security?', a: 'Because the plan subtracts Social Security disability from its benefit, so an award lowers what the insurer pays. Many contracts require you to apply, and to appeal a denial, as a condition of benefits, and some reduce your check by an estimated award if you do not. The insurer may offer help with the application for the same reason.' },
    { q: 'Do I have to repay my LTD insurer after a Social Security back payment?', a: `Usually yes, for the months the award covers while the plan paid in full. If the plan paid ${K.usd(G)} for six months and the award is ${K.usd(SS)} a month, the overpayment is ${K.usd(back)}. Contracts often ask for a signed reimbursement agreement at the start of the claim, and may reduce future checks until the amount is recovered.` },
    { q: 'What is a frozen Social Security offset?', a: `A clause that fixes the amount subtracted at the first award, so later cost-of-living increases raise your total income instead of cutting the plan check. With a ${K.usd(SS)} award and a 2% yearly raise assumed, the frozen version gives ${K.usd(a.totalLater)} a month after ten years, against ${K.usd(f.totalLater)} when every raise is subtracted.` },
    { q: 'Are LTD benefits and Social Security taxed the same way?', a: `No. The plan benefit is taxable or not depending on who paid the premium (IRS Publication 525). Social Security disability is partly taxable once your income passes a base amount (Publication 915). At ${K.usd(100000)} of salary, a ${K.usd(G)} capped benefit and a ${K.usd(SS)} award, an employer-paid plan leaves about ${K.usd(t.inHand)} a month from both after federal income tax.` },
  ],
  body: (h) => `
<h2>How the Social Security offset works</h2>
<p>A group long-term disability plan promises a share of your earnings, and counts what other programs pay toward that share. The clause, usually titled other income benefits or deductible sources of income, lists them: Social Security disability benefits paid to you, benefits paid to your dependents because of your disability, workers' compensation, state disability benefits, some pensions, and earnings if you work. The plan pays the difference between its gross benefit and their total, but not less than its minimum benefit, a fixed amount or a percentage stated in the contract.</p>
<p>Social Security itself is not reproduced here: whether you qualify and how much the award is are decisions of the Social Security Administration, and the amount you enter is the one on your award letter or statement. The calculator applies the plan side of the arithmetic.</p>
${h.mini('offset', { t: 'Your plan check after the award', p: ['gross', 'ssdi'] })}
<h2>Family benefits and the minimum</h2>
<p>When dependents receive benefits on your record, many plans subtract them too, which can bring the plan check down to its minimum. In the example of the summary, a ${K.usd(G)} gross benefit, a ${K.usd(SS)} award and ${K.usd(FAM)} of family benefits leave ${K.usd(fam.ltdNow)} from the plan with a ${K.usd(100)} minimum. Minimums are often small; their value is to keep the claim open, with its other benefits such as a return-to-work program or a survivor benefit. Enter the minimum from your summary in the calculator options.</p>
<h2>Frozen or indexed: the clause that matters over years</h2>
<p>Social Security benefits receive a cost-of-living adjustment most years. A plan with a frozen offset subtracts the amount of the first award forever, so each raise adds to your total income; a plan without that clause subtracts the new amount each year, so its check falls as Social Security rises and your total stays where it started. Over a claim of ten or twenty years the difference becomes large. The calculator uses a raise you choose; enter zero to see today's figures only. It is an assumption, not a forecast.</p>
<h2>Back pay and overpayment</h2>
<p>Social Security decisions take months, and awards are often paid back to the date benefits began. During that time the plan has usually paid its full benefit, or a benefit reduced by an estimate. When the back pay arrives, the plan claims the difference. With six months of a ${K.usd(SS)} award, that is ${K.usd(back)}. Insurers often ask claimants to sign a reimbursement agreement, and may recover the amount by holding future checks. Keep the back pay until the insurer has stated the overpayment in writing.</p>
<h2>Tax on both checks</h2>
<p>The plan check follows the premium rule of ${h.src('irs_p525', 'IRS Publication 525')}: taxable if the employer paid or the premium was deducted pre-tax. Social Security disability follows ${h.src('irs_p915', 'Publication 915')}: nothing is taxable while your other income plus half the benefits stays under ${K.usd(K.FED.socialSecurityBenefitBase.single)} for a single filer or ${K.usd(K.FED.socialSecurityBenefitBase.mfj)} for a married couple filing jointly, then up to 50% and finally up to 85% of the benefits. A back payment covering earlier years can be spread over those years with the lump-sum election described in the same publication. The ${h.a('is-disability-insurance-taxable', 'tax calculator')} accepts both incomes.</p>
`,
  tool: 'offset',
  related: ['long-term-disability-insurance', 'is-disability-insurance-taxable', 'own-occupation-disability-insurance', 'how-much-disability-insurance-do-i-need'],
  sources: ['irs_p525', 'irs_p915', 'irs_rp_2025_32'],
});
