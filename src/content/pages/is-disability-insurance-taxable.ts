import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const BEN = 3000, YEAR = BEN * 12;
const fedEmp = K.taxAdded(YEAR, 0, 'single');
// Payroll tax on the checks paid within 6 months of the last month worked: after a 90-day wait, the first 3 (K.EX).
const ficaChecks = Math.max(0, K.FED.sickPayFicaMonths - K.EX_WAIT);
const ficaEmp = K.sickPayFica(BEN, 1, ficaChecks, 'employer');
const split = K.share('split', 0.3);
const fedSplit = K.taxAdded(YEAR * split, 0, 'single');
const mixed = K.taxAdded(YEAR, 30000, 'single');

export default definePage({
  id: 'is-disability-insurance-taxable', group: 'disability', order: 103, slug: 'is-disability-insurance-taxable',
  nav: 'Is disability insurance taxable?', card: 'Taxable or tax-free: the federal tax rule for employer-paid, pre-tax, after-tax and shared premiums, with the tax on your benefit.',
  title: 'Disability Benefits Tax 2026: Taxable or Tax-Free by Payer',
  description: 'Disability benefits tax in 2026: employer-paid and pre-tax premiums make the benefit taxable, after-tax premiums make it tax-free. See the tax on your check.',
  h1: 'Is disability insurance taxable? The tax depends on who paid the premium',
  intro: 'Enter the monthly disability benefit, the number of checks paid this year and who pays for the insurance (the premium). What you keep after tax appears at once, with the same benefit under each other way of paying.',
  resume: `Disability benefits are taxable income when your employer paid the premium. They are also taxable when you paid it through a deduction taken from your pay before tax: the IRS (the federal tax agency) treats that premium as paid by the employer. They are tax-free when you paid the premium with after-tax money, including an individual policy you bought yourself. When the cost is shared, only the part of the benefit that matches the employer's share is taxed. In the IRS example, an employer paying 70% of the cost makes ${K.usd(1400)} of each ${K.usd(2000)} check taxable. Benefits funded by the employer also carry payroll tax (Social Security and Medicare) for the first six months after you stop work. Take a ${K.usd(BEN)} monthly benefit paid all year by an employer plan. A single filer with no other income owes about ${K.usd(fedEmp)} of federal income tax on it in 2026. After a ${K.EX.elimDays}-day wait, its first ${K.num(ficaChecks)} checks also lose ${K.usd(ficaEmp)} in all to payroll tax.`,
  faqs: [
    { q: 'Do I pay tax on disability benefits if my employer paid the premium?', a: `Yes. Benefits from a plan your employer paid for are income, reported on your tax return. Tax is often not withheld unless you ask, so a balance can be due in April. On ${K.usd(YEAR)} of benefits in a year, a single filer with no other income owes about ${K.usd(fedEmp)} of federal income tax in 2026. With ${K.usd(30000)} of wages earlier in the year, the same benefits add about ${K.usd(mixed)}.` },
    { q: 'Is short-term disability through a cafeteria plan taxable?', a: 'Yes, in most cases. A cafeteria plan is the benefits plan at work that takes premiums from your pay before tax. The IRS says that when the premium was not included in your taxable pay, you are not considered to have paid it, so the benefits are income. If the premium was included in your taxable pay, the benefits are not taxed.' },
    { q: 'How is a disability benefit taxed when the employer and I share the cost?', a: `Only the employer's share is taxable. It is measured as the share of the policy's cost the employer paid over the three years before the year of the benefit. If you paid 30% with after-tax money, ${K.pct(split)} of each check is taxable. On ${K.usd(YEAR)} a year, that is about ${K.usd(fedSplit)} of federal income tax for a single filer with no other income.` },
  ],
  body: (h) => `
<h2>The disability benefit tax rule in one sentence</h2>
<p>A premium paid with money that was already taxed gives a tax-free benefit, and a premium that escaped tax gives a taxable one.</p>
<p>A premium escapes tax when your employer pays it, or when it is taken from your pay before tax. The rule comes from the federal tax code, and the IRS explains it in its guide to taxable income. It does not depend on the insurer, on the length of the claim or on whether the plan is short-term or long-term.</p>
<p>The table under the calculator applies the rule to the five ways of paying found in practice. An employer-paid plan. A plan paid from your pay before tax. A plan paid after tax. A plan whose cost is shared. And a policy you bought yourself. Enter your own benefit and income: the tax changes, but the order of the five lines does not. Not sure which line is yours? Look at your pay stub. No disability line means your employer pays. A disability line among the deductions taken before tax means the pre-tax line. A line taken after tax means the benefit is tax-free.</p>
<h2>Pre-tax deductions: the trap</h2>
<p>Many employees choose the pre-tax option at enrollment because it lowers the tax on every paycheck. They do not see that it moves the tax to the day they claim.</p>
<p>The IRS is explicit. A premium taken before tax through the benefits plan at work (a cafeteria plan) counts as paid by the employer, so the benefit is income. The saving on the premium is small: a share of a few hundred dollars a year. The tax on a claim is a share of thousands of dollars a month.</p>
<p>The calculator below sets one against the other. It shows the tax saved each year, the tax on a one-year claim, and how many years of savings that tax equals. The ${h.a('pre-tax-vs-after-tax-disability-premiums', 'election calculator')} tests other claim lengths.</p>
${h.mini('premium', { t: 'Pre-tax savings against the tax on one claim', p: ['sal', 'prem'] })}
<h2>Payroll tax, withholding and the rest of your return</h2>
<p>A taxable benefit from an employer plan is treated as sick pay. Payroll tax (Social Security at ${K.pct(K.FED.socialSecurityRate, 1)} and Medicare at ${K.pct(K.FED.medicareRate, 2)}) comes off it for the first ${K.num(K.FED.sickPayFicaMonths)} months after the last month you worked. After that, only income tax remains.</p>
<p>Income tax is often not withheld from a check paid by an insurer unless you ask for it on a form (Form W-4S). Without it, a long claim can leave a large balance due in April. Ask the insurer for withholding as soon as the claim starts.</p>
<p>The benefit is added to your other income for the year. A claim that starts in the autumn sits on top of most of a year's wages, so it is taxed at your usual rate. A claim that runs a full year with no wages is taxed from the bottom, after the standard deduction of ${K.usd(K.FED.standardDeduction.single)} for a single filer. A Social Security disability check has its own rule: part of it can become taxable. State tax is not computed here; most states start from federal income.</p>
`,
  tool: 'tax',
  related: ['pre-tax-vs-after-tax-disability-premiums', 'long-term-disability-insurance', 'short-term-disability-insurance', 'disability-insurance-self-employed'],
  sources: ['irs_p525', 'irs_p15a', 'usc_105', 'irs_p915', 'irs_p15', 'irs_rp_2025_32'],
});
