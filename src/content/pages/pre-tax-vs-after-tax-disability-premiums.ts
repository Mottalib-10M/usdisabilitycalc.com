import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

// Same figures as the calculator above (K.EX for the salary and the 90-day wait).
const SAL = K.EX.sal, PREM = 300, BEN = 3000, W = K.EX_WAIT;
const a = K.premiumChoice({ salary: SAL, premium: PREM, benefit: BEN, months: 12, st: 'single', waitMonths: W });
const longer = K.premiumChoice({ salary: SAL, premium: PREM, benefit: BEN, months: 60, st: 'single', waitMonths: W });
const hi = K.premiumChoice({ salary: 220000, premium: 900, benefit: 10000, months: 12, st: 'single', waitMonths: W });
const yearsWorked = 30;

export default definePage({
  id: 'pre-tax-vs-after-tax-disability-premiums', group: 'disability', order: 104, slug: 'pre-tax-vs-after-tax-disability-premiums',
  nav: 'Pre-tax or after-tax premiums', card: 'The open enrollment choice: what a pre-tax premium saves each year against the tax it adds to a claim.',
  title: 'Pre-Tax Disability Premiums 2026: Savings Against Claim Tax',
  description: 'Pre-tax or after-tax disability premiums in 2026: the yearly tax a pre-tax deduction saves against the tax it adds to a claim. Compare both for your pay.',
  h1: 'Pre-tax or after-tax disability premiums: which election pays',
  intro: 'Enter your salary, the yearly disability premium on your enrollment page and the monthly benefit it buys. The calculator sets the tax pre-tax premiums save each year against the tax a claim would cost.',
  resume: `Paying a disability premium by pre-tax payroll deduction saves income tax and payroll tax on the premium every year, and makes every dollar of a future benefit taxable. Paying it after tax costs a little more each year and makes the benefit tax-free (IRS rules). The saving is a percentage of the premium; the tax is a percentage of the benefit. A single filer earning ${K.usd(SAL)} who pays ${K.usd(PREM)} a year saves about ${K.usd(a.extraYearly)} a year by paying pre-tax, at a ${K.pct(a.marginal)} marginal rate plus payroll tax. A one-year claim of ${K.usd(BEN)} a month would then cost about ${K.usd(a.taxOnClaim)} in federal income and payroll tax, the savings of ${K.dec(a.yearsCovered, 0)} years. A five-year claim would cost ${K.usd(longer.taxOnClaim)}. The pre-tax option wins only if you never claim, and disability is precisely the risk the policy is bought for.`,
  faqs: [
    { q: 'Should I pay my disability premium pre-tax or after-tax?', a: `It depends on how likely and how long a claim would be, but the numbers lean one way. At ${K.usd(SAL)} and a ${K.usd(PREM)} premium, pre-tax saves about ${K.usd(a.extraYearly)} a year; one year of claim at ${K.usd(BEN)} a month would cost about ${K.usd(a.taxOnClaim)} in tax. Over a ${yearsWorked}-year career, the total saving is ${K.usd(a.extraYearly * yearsWorked)}, less than one year of claim tax.` },
    { q: 'Can I switch my disability premium from pre-tax to after-tax?', a: 'Usually only at open enrollment or after a qualifying life event, because cafeteria plan elections are fixed for the plan year. Some employers offer no choice and deduct the premium one way only; others offer a gross-up, adding the premium to taxable wages. Switching after a disability has started does not make that claim tax-free: the tax follows how the premium was paid before.' },
    { q: 'What is an imputed income disability plan?', a: 'An arrangement where the employer pays the premium but reports it as taxable wages on your W-2. You pay income and payroll tax on the premium each year, and in exchange the benefit is treated as bought with your money and is not taxable. It gives the same result as paying the premium after tax yourself, at the cost of a small yearly tax.' },
  ],
  body: (h) => `
<h2>What each election does</h2>
<p>A pre-tax deduction takes the premium out of your pay before federal income tax and, under a cafeteria plan, before Social Security and Medicare. Your taxable wages fall by the premium, and the tax on them falls by the premium times your marginal rate plus ${K.pct(K.FED.socialSecurityRate + K.FED.medicareRate, 2)} of payroll tax below the wage base. In exchange, the IRS (the federal tax agency) considers that the employer paid the premium: ${h.src('irs_p525', 'the IRS guide')} says that when the premium of a plan under a cafeteria plan was not included in your income, you are not considered to have paid it and the benefits are income. ${h.src('irs_p15a', 'the IRS guide')} adds that such pre-tax contributions are employer contributions, so the benefit is also sick pay subject to payroll tax in its first months.</p>
<p>An after-tax deduction leaves your taxable wages unchanged. The premium costs you its full amount, and the benefit is not income. Nothing else differs: same insurer, same formula, same maximum.</p>
<h2>The arithmetic of the choice</h2>
<p>The calculator above computes both sides. The yearly saving is the premium times your marginal federal rate for 2026 (${h.src('irs_rp_2025_32', 'the IRS limits for the year')}) plus payroll tax. The cost of a claim is the federal income tax on the benefits received, assumed to be your only income that year, plus Social Security and Medicare on the checks paid within six months of your last month of work, the first ${K.num(K.FED.sickPayFicaMonths - W)} after a ${K.EX.elimDays}-day wait. Dividing one by the other gives the number of years of saving that one claim of the length you enter would erase.</p>
<p>The result is rarely close. In the example of the summary, the ratio is ${K.dec(a.yearsCovered, 0)} years for a one-year claim. The reason is structural: the premium for group disability coverage is a small fraction of the benefit it buys, so a tax rate on the premium can never match a similar tax rate on the benefit unless the probability of a claim is very small. The calculator assumes no other income in the claim year; a claim that starts late in the year, on top of most of a year of wages, is taxed at a higher rate and makes the pre-tax option worse.</p>
${h.mini('premium', { t: 'The same choice against a five-year claim', p: ['prem', 'mo'], d: { mo: 60 } })}
<h2>When pre-tax disability premiums can still make sense</h2>
<p>Short-term disability with a low benefit and a short duration is the closest case: a claim lasts weeks, not years, and the tax on it is small. Someone who already holds an individual tax-free policy covering most of the risk may also accept a taxable group benefit on top. In both cases, enter the benefit and the length of claim you think plausible, and read the ratio.</p>
<p><strong>Imputed income and gross-up.</strong> Some employers pay the premium and add it to your taxable wages, a practice known as imputed income. Others give a choice at enrollment. Either way the effect is the same as paying after tax: you are taxed on a small premium every year, and the benefit, if it comes, is tax-free. For a plan whose cost is shared, the benefit is taxable in the employer's share of the premium over the three previous policy years; the ${h.a('is-disability-insurance-taxable', 'tax calculator')} applies that share.</p>
<p><strong>Where to find the election.</strong> The benefits enrollment portal shows the premium per pay period and, when there is a choice, how the premium is taxed. The pay slip confirms it: a disability line listed with the pre-tax deductions means a taxable benefit. The summary plan description of the ${h.a('long-term-disability-insurance', 'long-term')} or ${h.a('short-term-disability-insurance', 'short-term')} plan gives the benefit to enter.</p>
`,
  tool: 'premium',
  related: ['is-disability-insurance-taxable', 'long-term-disability-insurance', 'disability-insurance-cost', 'short-term-disability-insurance'],
  sources: ['irs_p525', 'irs_p15a', 'irs_rp_2025_32', 'irs_p15'],
});
