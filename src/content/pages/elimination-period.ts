import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const EXP = 4000;
const d90 = K.bridge({ expenses: EXP, elimDays: 90, sickPay: 0, savings: 8000 });
const d180 = K.bridge({ expenses: EXP, elimDays: 180, sickPay: 0, savings: 8000 });
const withStd = K.bridge({ expenses: EXP, elimDays: 90, sickPay: 3000, savings: 8000 });
const P = K.PRIV;
const stdW = 13;

export default definePage({
  id: 'elimination-period', group: 'disability', order: 107, slug: 'elimination-period',
  nav: 'Elimination period', card: 'The months before a disability policy pays: what they cost in spending, and how long your savings last.',
  title: 'Elimination Period 2026: The Months Before Disability Pay',
  description: 'Elimination period in 2026: what 90 or 180 days before benefits start cost in spending, with sick pay and savings counted, and when the first check lands.',
  h1: 'Elimination period: the months you carry yourself',
  intro: 'Enter the spending you cannot cut, the elimination period of your policy, any sick pay that covers it and the savings you could use. The calculator shows the money missing before the first check.',
  resume: `The elimination period is the stretch of disability, counted in days, before a policy starts to pay; it works like a deductible measured in time. Long-term disability plans often use 90 or 180 days, individual policies offer choices from 30 days to a year, and short-term plans a few days. A longer period lowers the premium and raises the amount you must carry yourself. With ${K.usd(EXP)} of monthly spending you cannot cut, a 90-day period represents ${K.usd(d90.need)}; a 180-day period ${K.usd(d180.need)}. Savings of ${K.usd(8000)} would leave ${K.usd(d90.shortfall)} missing in the first case and ${K.usd(d180.shortfall)} in the second. Short-term disability, sick days or paid time off can fill the gap: a short-term plan paying ${K.usd(3000)} a month brings the 90-day shortfall to ${K.usd(withStd.shortfall)}. A plan that pays monthly in arrears sends its first check about a month after the period ends.`,
  faqs: [
    { q: 'What is a 90-day elimination period?', a: 'Ninety days of disability that must pass before the policy pays. The days are usually counted from the date the disability began, and the policy states whether they must be consecutive or can add up over a set window when you return to work briefly. Benefits then accrue from day 91, and a monthly plan pays them at the end of each month.' },
    { q: 'Is a longer elimination period cheaper?', a: 'Yes, because the insurer pays less often and less in total, and the premium reflects it. Whether the saving is worth it depends on how long your savings and other income would last. The calculator shows that: with no sick pay, the months your savings cover against the months of the period you chose.' },
    { q: 'Do sick days count toward the elimination period?', a: 'They usually count as days of disability if you are unable to work, and they pay you during that time, but the contract can say how paid leave interacts with the period. Some group plans subtract salary continuation or sick pay paid after the period ends. Read the definition of elimination period and the list of other income in your plan.' },
    { q: 'How should short-term and long-term disability periods line up?', a: `Ideally the long-term elimination period ends when short-term benefits stop. A short-term plan paying ${K.num(stdW)} weeks matches a 90-day long-term wait; the median private short-term plan pays ${K.num(P.std_weeks_p50!)} weeks, which matches 180 days (BLS, March 2026). A mismatch leaves weeks with no income, or weeks paid twice that the plan may offset.` },
  ],
  body: (h) => `
<h2>A deductible counted in days</h2>
<p>Every disability policy defines a period of disability that must be completed before benefits begin. During it, the policy pays nothing; once it ends, benefits accrue for each day of continued disability. The choice of period is the main lever on the premium of an individual policy, and in a group plan it is set by the employer, often to match the end of the short-term plan. The calculator above treats it as what it is for your budget: a number of months of spending to cover from other sources.</p>
<p>The cost of the period is your spending times its length. Not your salary: your rent or mortgage, utilities, insurance, debt payments and food, the expenses that continue while you are not working. With ${K.usd(EXP)} a month, a 90-day period is about ${K.usd(d90.need)} and a 180-day period ${K.usd(d180.need)}. Subtract what continues to come in: short-term disability, sick pay, paid time off, a spouse's income. What remains has to come from savings.</p>
${h.mini('bridge', { t: 'How long your savings carry you', p: ['exp', 'sav'], d: { exp: EXP, sav: 8000 } })}
<h2>The first check comes later than the end of the period</h2>
<p>A long-term plan that pays monthly in arrears sends the first payment about a month after benefits begin to accrue. A 90-day period therefore means close to four months between the last paycheck and the first benefit check, and longer if the claim file is incomplete. Add that month in the calculator by entering a longer period if your plan works this way. The ${h.a('long-term-disability-insurance', 'long-term disability calculator')} gives the amount of that first check after offsets and tax.</p>
<h2>Short-term disability as the bridge</h2>
<p>Where an employer offers both plans, short-term disability normally covers the long-term elimination period. In March 2026 the median private short-term plan paid ${K.num(P.std_weeks_p50!)} weeks, with a tenth percentile of ${K.num(P.std_weeks_p10!)} weeks (${h.src('bls_ebs_2026', 'Bureau of Labor Statistics')}). A ${K.num(P.std_weeks_p10!)}-week plan followed by a 180-day long-term wait leaves about three months uncovered. Short-term benefits paid by an employer plan are taxable sick pay, with payroll tax (${h.src('irs_p15a', 'IRS Publication 15-A')}), so count them after tax; the ${h.a('short-term-disability-insurance', 'short-term calculator')} gives the net figure.</p>
<h2>Choosing a period for an individual policy</h2>
<p>Three questions settle it. How many months of essential spending do your liquid savings cover? Would a spouse's income or a group short-term plan carry part of it? How much lower is the premium for the longer period on your quote? If savings cover six months and the 180-day option lowers the premium noticeably, the longer period may be the better trade; if savings cover six weeks, a 90-day period still leaves a gap that the calculator shows. The ${h.a('disability-insurance-cost', 'cost page')} compares the premium of two quotes once you have them.</p>
<h2>Recurring disability and partial returns</h2>
<p>Contracts handle interrupted claims in their own words. A common clause lets days of disability separated by short returns to work add up toward the period within a stated window, and treats a relapse soon after benefits ended as the same claim, without a new wait. Read the terms "elimination period", "recurrent disability" and "accumulation" in your policy before you test a return to work.</p>
`,
  tool: 'bridge',
  related: ['short-term-disability-insurance', 'long-term-disability-insurance', 'disability-insurance-cost', 'how-much-disability-insurance-do-i-need'],
  sources: ['bls_ebs_2026', 'irs_p15a'],
});
