import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const g = K.G;
const ind = K.GROUPS.filter((x) => x.kind === 'industry').sort((a, b) => (b.ltd ?? 0) - (a.ltd ?? 0));
const reg = K.GROUPS.filter((x) => x.kind === 'region');
const civ = g('All civilian workers'), priv = g('Private industry'), gov = g('State and local government');
const low = g('Lowest-paid quarter of private workers'), top = g('Highest-paid quarter of private workers');
const s = ['Fewer than 50 workers', '50 to 99 workers', '100 to 499 workers', '500 workers or more'].map(g);

export default definePage({
  id: 'disability-insurance-by-employer', group: 'disability', order: 109, slug: 'disability-insurance-by-employer',
  nav: 'Who gets a plan at work', card: 'Share of workers offered short-term, long-term disability and long-term care at work, by industry, size, region and pay (BLS 2026).',
  title: 'Disability Insurance by Employer 2026: Who Offers a Plan',
  description: 'Disability insurance by employer in 2026: share of workers offered short-term and long-term disability and long-term care, by industry, size, region and pay.',
  h1: 'Disability insurance at work: who is offered a plan',
  intro: 'Pick your type of employer, by industry, company size or region, and enter your salary. You see the share of workers like you whose employer offers disability insurance, from a national survey of March 2026, and what the most common plan would pay you.',
  resume: `Whether a job comes with disability insurance depends mostly on the employer's industry, size and pay level. The figures come from the National Compensation Survey of March 2026, run by the Bureau of Labor Statistics (BLS, the federal statistics office). It finds that ${K.bp(civ.ltd)} of civilian workers were offered long-term disability coverage at work. Short-term disability was offered to ${K.bp(civ.std)} of them. Long-term coverage reaches ${K.bp(ind[0].ltd)} of workers in ${ind[0].label.toLowerCase()}. It falls to ${K.bp(ind[ind.length - 1].ltd)} in ${ind[ind.length - 1].label.toLowerCase()}. It rises with company size: ${K.bp(s[0].ltd)} of workers at places with fewer than 50 workers, ${K.bp(s[3].ltd)} at 500 or more. It also rises with pay, from ${K.bp(low.ltd)} of the lowest-paid quarter of private workers to ${K.bp(top.ltd)} of the best-paid. Offered does not mean paid by the employer: some workers pay for the plan, and some turn it down.`,
  faqs: [
    { q: 'What percentage of employers offer long-term disability insurance?', a: `The survey counts workers rather than employers. In March 2026, ${K.bp(priv.ltd)} of private industry workers and ${K.bp(gov.ltd)} of state and local government workers were offered long-term disability coverage. The share is far higher in large companies, ${K.bp(s[3].ltd)} at 500 workers or more, than in small ones, ${K.bp(s[0].ltd)} below 50.` },
    { q: 'Does access to a plan mean my employer pays for it?', a: `No. Access means the plan is offered to you; the survey counts workers whether they join or not. Among covered private workers, the employer pays the whole premium for ${K.bp(K.PRIV.ltd_employee_pays_none)} in long-term plans and ${K.bp(K.PRIV.std_employee_pays_none)} in short-term plans. Your pay stub or benefits page shows whether you pay part of it.` },
    { q: 'Why is short-term disability so common in the Middle Atlantic region?', a: `Because New York and New Jersey require temporary disability coverage for most private employees. That raises access to ${K.bp(g('Middle Atlantic').std)} in the region in March 2026, against ${K.bp(priv.std)} for private industry nationwide. The state programs have their own rules and are not computed on this site.` },
  ],
  body: (h) => `
<h2>Where the figures come from</h2>
<p>The National Compensation Survey of the Bureau of Labor Statistics (BLS, the federal statistics office) visits employers across the private sector and state and local government. It records the benefits they offer. Its March 2026 edition was published on September 25, 2026.</p>
<p>This page reads three of its series: the share of workers offered short-term disability, long-term disability and long-term care insurance. It gives them for ${K.num(K.GROUPS.length)} groups of workers. Industries, sizes, regions and pay groups are private industry. Where the survey gives no figure, the page says so rather than guess one.</p>
<p>The figure is for workers like you, not for your own job. To know whether you have a plan, look at your benefits page or your pay stub. Already have one? The ${h.a('long-term-disability-insurance', 'long-term disability calculator')} shows what it pays you.</p>
<p>Under the share of workers, the calculator also shows what the most common private plan would pay on your salary. That plan pays ${K.pct(K.PRIV.ltd_median_pct! / 100)} of pay, up to ${K.usd(K.PRIV.ltd_max_monthly_p50!)} a month for long-term disability and ${K.usd(K.PRIV.std_max_weekly_p50!)} a week for short-term disability. These amounts are before tax. If your employer pays the premium, tax comes off: the ${h.a('is-disability-insurance-taxable', 'tax page')} shows how much.</p>
<p>Long-term care insurance is offered far less often. In March 2026, ${K.bp(civ.ltc)} of civilian workers had access to it at work: ${K.bp(priv.ltc)} in private industry and ${K.bp(gov.ltc)} in state and local government. It pays for help in old age, not for lost pay, and has its own pages on this site.</p>
<h2>Industry, size and pay</h2>
<p>Long-term disability coverage follows the kind of work and the pay that comes with it. It goes from ${K.bp(ind[0].ltd)} of workers in ${ind[0].label.toLowerCase()} down to ${K.bp(ind[ind.length - 1].ltd)} in ${ind[ind.length - 1].label.toLowerCase()}.</p>
${h.table(['Industry', 'Short-term', 'Long-term'], ind.map((x) => [x.label, K.bp(x.std), K.bp(x.ltd)]), 'Share of private industry workers whose employer offers each plan, March 2026. Bureau of Labor Statistics.', ['l', 'r', 'r'])}
<p>Company size matters next. Access goes from ${K.bp(s[0].ltd)} at places with fewer than 50 workers to ${K.bp(s[3].ltd)} at 500 or more. The best-paid quarter of private workers has access at ${K.bp(top.ltd)}, the lowest-paid quarter at ${K.bp(low.ltd)}. Part-time work cuts access the most, to ${K.bp(g('Part-time workers').ltd)}.</p>
<p>The people least likely to have a plan are also those with the least savings to carry a long absence. The ${h.a('how-much-disability-insurance-do-i-need', 'needs calculator')} shows what to buy if your employer offers nothing, and the ${h.a('disability-insurance-self-employed', 'self-employed page')} starts from zero coverage.</p>
${h.mini('employer', { t: 'Small employers (fewer than 50 workers): access, and what the median plan pays', p: ['g', 'sal'], d: { g: 'Fewer than 50 workers' } })}
<h2>Disability insurance by region</h2>
<p>The survey groups states into nine regions of the Census Bureau; the table lists the states of each. Differences in long-term coverage are small, from ${K.bp(Math.min(...reg.map((x) => x.ltd ?? 100)))} to ${K.bp(Math.max(...reg.map((x) => x.ltd ?? 0)))}.</p>
<p>Short-term disability is the exception, because some states require it. The Middle Atlantic region (New Jersey, New York and Pennsylvania) reaches ${K.bp(g('Middle Atlantic').std)}.</p>
<p>Read these shares with their limits in mind. The survey counts workers by the place they work for, not by their job within it. It reports plans offered, not plans joined. It leaves out federal employees, farms and households. And its estimates carry a margin of error, so small groups can move from one year to the next. A gap of a few points between two regions says little; a gap of thirty points between two industries says a lot.</p>
${h.table(['Region', 'Short-term', 'Long-term'], reg.map((x) => [K.gl(x.label), K.bp(x.std), K.bp(x.ltd)]), 'Share of private industry workers whose employer offers each plan, March 2026, by region.', ['l', 'r', 'r'])}
`,
  tool: 'employer',
  related: ['long-term-disability-insurance', 'short-term-disability-insurance', 'how-much-disability-insurance-do-i-need', 'disability-insurance-self-employed'],
  sources: ['bls_ebs_2026', 'bls_ebs_data', 'bls_api', 'census_divisions'],
});
