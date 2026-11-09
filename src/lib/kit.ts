/**
 * Writing kit (CONTRIBUTING-PAGES.md): every figure written in a page comes from here, never typed by hand.
 *   K.P, K.FED, K.LTC, K.HSA, K.ADD   params-2026.json (IRS 2026 and 2025 limits, OPM schedule, sources)
 *   K.PRIV, K.CIV, K.GOV              BLS plan provisions, March 2026 (median share of pay, maximum percentiles, weeks)
 *   K.G(label)                        BLS access rates of one group { std, ltd, ltc } (percent)
 *   K.ltd({...}), K.std({...})        engine results (lib/engine/cover.ts)
 *   K.taxAdded(extra, other, st)      federal tax added by a taxable amount
 *   K.th(salary, st)                  yearly take-home pay { gross, fed, fica, net }
 *   K.EX, K.EX_WAIT                   the one example case of the whole site (same defaults on every screen)
 *   K.gl(label)                       BLS group label, census divisions with their states
 *   formats                           K.usd(1234.5) "$1,235", K.cents(41.5) "$41.50", K.num, K.dec, K.pct(0.6) "60%", K.day("2026-09-25")
 */
import P from '../data/params-2026.json';
import B from '../data/bls-ncs-2026.json';
import { usd, pct, longDate, EX, EX_WAIT_MONTHS, groupLabel } from './tool-specs';
import { formatNumber, formatDecimal, formatMoney } from './format';
import * as E from './engine/cover';

export const KIT = {
  P, B, EX, EX_WAIT: EX_WAIT_MONTHS, gl: groupLabel, ltdTotal: E.ltdTotal, FED: E.FED, LTC: E.LTC, HSA: E.HSA, ADD: E.ADD, RETRIEVED: E.RETRIEVED,
  PRIV: E.PRIVATE, CIV: E.CIVILIAN, GOV: E.GOVERNMENT, GROUPS: E.GROUPS,
  G: (label: string) => { const g = E.GROUPS.find((x) => x.label === label); if (!g) throw new Error(`BLS group ${label}`); return g; },
  ltd: E.ltd, std: E.std, taxAdded: E.taxAdded, taxOn: E.taxOn, bracketTax: E.bracketTax, th: (s: number, st: E.Status = 'single') => E.takeHome(s, st),
  marginal: E.marginalRate, share: E.taxableShare, sickPayFica: E.sickPayFica, ssTaxable: E.ssTaxable, premiumChoice: E.premiumChoice,
  bridge: E.bridge, ownOcc: E.ownOcc, offset: E.offsetOverTime, need: E.benefitNeeded, ltcLimit: E.ltcLimit, ltcDed: E.ltcDeduction,
  perDiem: E.perDiem, pool: E.ltcPool, hybrid: E.hybrid, add: E.addPayout, cash: E.cashVsPlan, capRank: E.capRank,
  usd, pct: (x: number, d = 0) => pct(x, d), cents: (x: number) => formatMoney(x, Number.isInteger(x) ? 0 : 2),
  num: (x: number) => formatNumber(x, 0), dec: (x: number, d = 1) => formatDecimal(x, d), day: longDate,
  /** A BLS percent (42) written as "42%". */
  bp: (x: number | null) => (x === null ? 'not published' : `${formatNumber(x, 0)}%`),
};
export type Kit = typeof KIT;
