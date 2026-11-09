import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const g = K.G;
const ind = K.GROUPS.filter((x) => x.kind === 'industry').sort((a, b) => (b.ltd ?? 0) - (a.ltd ?? 0));
const reg = K.GROUPS.filter((x) => x.kind === 'region');
const civ = g('All civilian workers'), priv = g('Private industry'), gov = g('State and local government');
const uni = g('Union workers'), non = g('Nonunion workers');
const low = g('Lowest-paid quarter of private workers'), top = g('Highest-paid quarter of private workers');
const s = ['Fewer than 50 workers', '50 to 99 workers', '100 to 499 workers', '500 workers or more'].map(g);

export default definePage({
  id: 'disability-insurance-by-employer', group: 'disability', order: 109, slug: 'disability-insurance-by-employer',
  nav: 'Who gets a plan at work', card: 'Share of workers offered short-term, long-term disability and long-term care at work, by industry, size, region and pay (BLS 2026).',
  title: 'Disability Insurance by Employer 2026: Who Offers a Plan',
  description: 'Disability insurance by employer in 2026: share of workers offered short-term and long-term disability and long-term care, by industry, size, region and pay.',
  h1: 'Disability insurance at work: who is offered a plan',
  intro: 'Pick your type of employer, by industry, company size or region, and enter your salary. You see the share of workers like you offered each kind of disability insurance in March 2026, from a national survey, and what the median private plan would pay you.',
  resume: `Whether a job comes with disability insurance depends mostly on the employer's industry, size and pay level. In March 2026, ${K.bp(civ.std)} of civilian workers had access to short-term disability and ${K.bp(civ.ltd)} to long-term disability through work, according to the Bureau of Labor Statistics National Compensation Survey; ${K.bp(civ.ltc)} were offered long-term care insurance. Long-term coverage ranges from ${K.bp(ind[0].ltd)} in ${ind[0].label.toLowerCase()} to ${K.bp(ind[ind.length - 1].ltd)} in ${ind[ind.length - 1].label.toLowerCase()}. It rises with company size, from ${K.bp(s[0].ltd)} of workers at establishments with fewer than 50 workers to ${K.bp(s[3].ltd)} at 500 or more, and with pay, from ${K.bp(low.ltd)} of the lowest-paid quarter of private workers to ${K.bp(top.ltd)} of the highest-paid. State and local governments offer long-term disability to ${K.bp(gov.ltd)} of their workers but short-term disability to only ${K.bp(gov.std)}. Access means the plan is offered; some workers decline it or pay for it.`,
  faqs: [
    { q: 'What percentage of employers offer long-term disability insurance?', a: `The Bureau of Labor Statistics measures workers rather than employers. In March 2026, ${K.bp(priv.ltd)} of private industry workers and ${K.bp(gov.ltd)} of state and local government workers had access to long-term disability coverage. The share is far higher in large companies, ${K.bp(s[3].ltd)} at 500 workers or more, than in small ones, ${K.bp(s[0].ltd)} below 50.` },
    { q: 'Are union workers more likely to have disability coverage?', a: `Yes, especially for short-term disability: ${K.bp(uni.std)} of private union workers had access in March 2026, against ${K.bp(non.std)} of nonunion workers. For long-term disability the gap is smaller, ${K.bp(uni.ltd)} against ${K.bp(non.ltd)}. Collective agreements often provide weekly sickness and accident benefits, which the survey counts as short-term disability.` },
    { q: 'Does access to a plan mean my employer pays for it?', a: `No. Access means the plan is offered to you; the survey counts workers whether they enroll or not. Among covered private workers, the employer pays the whole premium for ${K.bp(K.PRIV.ltd_employee_pays_none)} in long-term plans and ${K.bp(K.PRIV.std_employee_pays_none)} in short-term plans. Your benefits portal shows whether you pay part of it and how.` },
    { q: 'Why is short-term disability so common in the Middle Atlantic region?', a: `Because New York and New Jersey require temporary disability coverage for most private employees, which raises access to ${K.bp(g('Middle Atlantic').std)} in the region in March 2026, against ${K.bp(priv.std)} for private industry nationwide. The state programs have their own rules and are not computed on this site.` },
  ],
  body: (h) => `
<h2>Where the figures come from</h2>
<p>The National Compensation Survey of the Bureau of Labor Statistics samples establishments across the private sector and state and local government and records the benefits they offer. Its March 2026 edition was published on September 25, 2026 (${h.src('bls_ebs_2026', 'Employee Benefits in the United States, March 2026')}). The series behind this page were read through the bureau's ${h.src('bls_api', 'public data interface')} on ${K.day(K.RETRIEVED)}: access to short-term disability, long-term disability and long-term care insurance for ${K.num(K.GROUPS.length)} groups of workers. Industries, sizes, regions, union status, hours and wage groups refer to private industry. Long-term care is published for fewer groups; where the bureau gives no figure, the table says so rather than estimate one.</p>
<h2>Industry: from information to restaurants</h2>
<p>Long-term disability coverage tracks the kind of work and the pay that comes with it. Information, banking and insurance lead; retail, construction, other services and food service trail: from ${K.bp(ind[0].ltd)} of workers in ${ind[0].label.toLowerCase()} down to ${K.bp(ind[ind.length - 1].ltd)} in ${ind[ind.length - 1].label.toLowerCase()}. The full ranking for private industry:</p>
${h.table(['Industry', 'Short-term', 'Long-term'], ind.map((x) => [x.label, K.bp(x.std), K.bp(x.ltd)]), 'Share of private industry workers with access, March 2026. Bureau of Labor Statistics.', ['l', 'r', 'r'])}
<h2>Size and pay</h2>
<p>After industry, company size and pay make the largest differences. Access to long-term disability goes from ${K.bp(s[0].ltd)} at establishments with fewer than 50 workers to ${K.bp(s[1].ltd)} at 50 to 99, ${K.bp(s[2].ltd)} at 100 to 499 and ${K.bp(s[3].ltd)} at 500 or more. Pay works the same way: the highest-paid quarter of private workers has access at ${K.bp(top.ltd)}, the lowest-paid quarter at ${K.bp(low.ltd)}. Part-time work cuts access the most, to ${K.bp(g('Part-time workers').ltd)} for long-term disability. The people least likely to have a group plan are also those with the least savings to bridge a long absence, which the ${h.a('elimination-period', 'elimination period calculator')} makes concrete.</p>
${h.mini('employer', { t: 'Small employers (fewer than 50 workers): access, and what the median plan pays', p: ['g', 'sal'], d: { g: 'Fewer than 50 workers' } })}
<h2>Region</h2>
<p>The survey groups states into the nine census divisions of the ${h.src('census_divisions', 'Census Bureau')}; the table lists the states of each. Regional differences in long-term coverage are modest, from ${K.bp(Math.min(...reg.map((x) => x.ltd ?? 100)))} to ${K.bp(Math.max(...reg.map((x) => x.ltd ?? 0)))}. Short-term disability is the exception, because of state mandates: the Middle Atlantic region reaches ${K.bp(g('Middle Atlantic').std)}.</p>
${h.table(['Region', 'Short-term', 'Long-term'], reg.map((x) => [K.gl(x.label), K.bp(x.std), K.bp(x.ltd)]), 'Share of private industry workers with access, March 2026, by census division.', ['l', 'r', 'r'])}
<h2>What the median employer disability plan pays</h2>
<p>Having a plan is half the answer; its formula is the other half. The calculator applies the median private plan of the same survey, ${K.pct(K.PRIV.ltd_median_pct! / 100)} of earnings with a median monthly maximum of ${K.usd(K.PRIV.ltd_max_monthly_p50!)} for long-term disability and ${K.usd(K.PRIV.std_max_weekly_p50!)} a week for short-term, to the salary you enter. Your own plan may differ: the ${h.a('long-term-disability-insurance', 'long-term')} and ${h.a('short-term-disability-insurance', 'short-term')} calculators take its exact figures, and the ${h.a('how-much-disability-insurance-do-i-need', 'needs calculator')} shows what to add if your employer offers nothing.</p>
<h2>Long-term care at work</h2>
<p>Employer long-term care insurance is rarer and published for fewer groups. In March 2026, ${K.bp(civ.ltc)} of civilian workers had access, ${K.bp(priv.ltc)} in private industry and ${K.bp(gov.ltc)} in state and local government; ${K.bp(s[3].ltc)} at establishments of 500 workers or more, ${K.bp(top.ltc)} among the best-paid quarter of private workers and ${K.bp(low.ltc)} among the lowest-paid. When you pay the premium yourself, it can count toward the medical expense deduction within the age limits of the year (${h.a('long-term-care-insurance-tax-deduction', 'deduction calculator')}).</p>
<h2>Limits of the survey</h2>
<p>The survey counts workers by the establishment they work for, not by occupation within it, and reports access, not enrollment. It covers the civilian economy except the federal government, farms and households. Its estimates carry sampling error that the bureau publishes separately; small groups move more from one year to the next.</p>
`,
  tool: 'employer',
  related: ['long-term-disability-insurance', 'short-term-disability-insurance', 'how-much-disability-insurance-do-i-need', 'disability-insurance-self-employed'],
  sources: ['bls_ebs_2026', 'bls_ebs_data', 'bls_api', 'census_divisions'],
});
