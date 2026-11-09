/** Every page id the site is meant to have. Content tests accept links to these ids while pages are being
 *  written; the "all planned pages exist" test fails until each has its file. */
export const PLANNED_GUIDES = [
  'short-term-disability-insurance', 'long-term-disability-insurance', 'is-disability-insurance-taxable',
  'pre-tax-vs-after-tax-disability-premiums', 'disability-insurance-cost', 'own-occupation-disability-insurance',
  'elimination-period', 'ltd-social-security-offset', 'disability-insurance-by-employer', 'how-much-disability-insurance-do-i-need',
  'disability-insurance-self-employed',
  'long-term-care-insurance-tax-deduction', 'long-term-care-insurance-benefits-taxable', 'long-term-care-insurance-cost',
  'hybrid-long-term-care-insurance',
  'accidental-death-and-dismemberment-insurance', 'accident-insurance', 'hospital-indemnity-insurance', 'critical-illness-insurance',
];
export const PLANNED_IDS = new Set<string>(PLANNED_GUIDES);
