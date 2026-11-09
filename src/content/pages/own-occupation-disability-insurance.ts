import { definePage } from '../../lib/page-types';
import { KIT as K } from '../../lib/kit';

const a = K.ownOcc({ benefit: 5000, age: 40, ownMonths: 24, endAge: 65 });
const b = K.ownOcc({ benefit: 5000, age: 55, ownMonths: 24, endAge: 65 });
const c = K.ownOcc({ benefit: 8000, age: 35, ownMonths: 60, endAge: 67 });

export default definePage({
  id: 'own-occupation-disability-insurance', group: 'disability', order: 106, slug: 'own-occupation-disability-insurance',
  nav: 'Own-occupation coverage', card: 'How much of a long claim depends on the definition of disability: own occupation, modified own occupation or any occupation.',
  title: 'Own-Occupation Disability Insurance 2026: What It Is Worth',
  description: 'Own-occupation disability insurance in 2026: how much of a long claim depends on the definition of disability once the own-occupation period ends, in dollars.',
  h1: 'Own-occupation disability insurance: the value of the definition',
  intro: 'Enter the monthly benefit, your age, the own-occupation period written in the contract and the age benefits end. The calculator shows how much of the claim depends on the any-occupation test.',
  resume: `The definition of disability decides whether a long-term policy keeps paying. Under an own-occupation definition, you are disabled if you cannot do the main duties of your own job, even if you could work in another one. Under an any-occupation definition, you are disabled only if you cannot do any job for which your education, training and experience fit you. Many group plans use own occupation for an initial period, often stated in months, then switch to any occupation. For a ${K.usd(5000)} monthly benefit from age 40 to 65 with a 24-month own-occupation period, ${K.usd(a.difference)} of the ${K.usd(a.totalOwn)} total, ${K.pct(a.difference / a.totalOwn)} of the claim, depends on the any-occupation test. At age 55 the share falls to ${K.pct(b.difference / b.totalOwn)}. Individual policies can extend own occupation to the end of the benefit period; a modified version pays only if you do not work elsewhere.`,
  faqs: [
    { q: 'What does own occupation mean in a disability policy?', a: 'That you are considered disabled when you cannot perform the material and substantial duties of your regular occupation, the one you held when the disability began. A true own-occupation contract pays even if you take another job. Read the definitions section of the policy: the words "your occupation", "any gainful occupation" and the time limits attached to them decide everything.' },
    { q: 'What changes when a plan switches to any occupation?', a: `The insurer reviews the claim against a wider test: whether you could do any job that fits your education, training and experience, often with an income threshold. If you could, benefits stop. With a ${K.usd(5000)} benefit from age 40, a 24-month own-occupation period leaves ${K.num(a.atRisk)} of ${K.num(a.allMonths)} months under that test.` },
    { q: 'What is modified own-occupation coverage?', a: 'A version that pays while you cannot do your own job and are not working in another occupation. If you choose to work elsewhere, benefits stop or become a partial benefit. It costs less than true own occupation and suits people who would not change careers anyway. Some contracts also limit own occupation to a set number of years.' },
    { q: 'Is own-occupation coverage worth more for younger workers?', a: `Yes, because more of the claim lies after the initial period. For a ${K.usd(8000)} benefit from age 35 to 67, even a 60-month own-occupation period leaves ${K.usd(c.difference)} of benefits under the any-occupation test, against ${K.usd(b.difference)} for a ${K.usd(5000)} benefit starting at 55 with 24 months.` },
  ],
  body: (h) => `
<h2>Three definitions, three claims</h2>
<p>Disability contracts describe the event they insure in a definitions section, and three families of wording cover most policies. Own occupation: you cannot perform the material and substantial duties of your regular occupation. Modified own occupation: the same, as long as you are not working in another occupation. Any occupation: you cannot perform the duties of any gainful occupation for which you are reasonably fitted by education, training or experience, sometimes with a threshold such as a share of your former earnings. A group long-term plan often combines two of them, own occupation for an initial period and any occupation after it; an individual policy can keep own occupation to the end.</p>
<p>The calculator does not price these definitions; it measures them. It counts the months from the start of the disability to the end of the benefit period, the months covered by the own-occupation period, and the benefits that fall after it. Those are the benefits a switch to any occupation could stop.</p>
${h.mini('ownocc', { t: 'Your claim under the any-occupation test', p: ['age', 'own'], d: { age: 35, own: 24 } })}
<h2>Reading the numbers</h2>
<p>For a ${K.usd(5000)} benefit starting at age 40 and ending at 65, the claim totals ${K.usd(a.totalOwn)} over ${K.num(a.allMonths)} months. A 24-month own-occupation period protects ${K.usd(a.totalAny)} of it; ${K.usd(a.difference)} depends on the second test. Starting at 55, the same contract leaves ${K.usd(b.difference)} at stake, because ten years of benefits remain instead of twenty-five. The younger the claimant and the longer the benefit period, the more the definition is worth, which is why people with specialized jobs and long careers ahead, surgeons, dentists or pilots for example, tend to look for own-occupation contracts.</p>
<p>The figure is a maximum, not a forecast. Many claimants who could not do their own job also cannot do another, and their benefits continue under any occupation. What the calculator shows is the amount that depends on a review you do not control.</p>
<h2>Where own occupation meets the rest of the contract</h2>
<p>A residual or partial disability benefit pays a share of the benefit when you work with reduced earnings, which matters under modified own occupation. A recovery benefit continues payments for a while after you return to work at lower pay. Offsets apply regardless of the definition: Social Security disability uses its own strict test, and an award reduces a group plan check (${h.a('ltd-social-security-offset', 'offset calculator')}). Tax does not change with the definition: it still depends on who paid the premium (${h.src('irs_p525', 'IRS Publication 525')}).</p>
<h2>Group plans and the initial period</h2>
<p>The Bureau of Labor Statistics measures how many workers have access to long-term disability, ${K.bp(K.G('All civilian workers').ltd)} of civilian workers in March 2026 (${h.src('bls_ebs_2026', 'BLS')}), but its published series do not report the length of own-occupation periods. Read it in your own summary plan description under the definition of disability. If it is short, the ${h.a('how-much-disability-insurance-do-i-need', 'needs calculator')} and the ${h.a('disability-insurance-cost', 'cost page')} help size and measure an individual policy to sit beside it.</p>
<h2>Questions to ask before you sign</h2>
<p>Does the policy define occupation by your specialty or by a broader category? Does own occupation last to the end of the benefit period or for a stated number of years? Does working in another field stop benefits, reduce them or leave them alone? Is the definition the same for partial disability? The answers are in the contract: ask for the specimen policy before you buy, not only the illustration.</p>
`,
  tool: 'ownocc',
  related: ['long-term-disability-insurance', 'disability-insurance-cost', 'how-much-disability-insurance-do-i-need', 'ltd-social-security-offset'],
  sources: ['irs_p525', 'bls_ebs_2026'],
});
