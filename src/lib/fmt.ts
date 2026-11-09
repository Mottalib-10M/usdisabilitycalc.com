/** Display formats (en-US): whole dollars on results, cents only for official amounts cited as published. */
import { formatMoney, formatNumber, formatPercent, displayDate } from './format';
/** $1,234 (no cents). */
export const usd = (x: number) => formatMoney(Math.round(x), 0);
/** $202.90: an official monthly amount, written as published. */
export const usd2 = (x: number) => formatMoney(x, Number.isInteger(x) ? 0 : 2);
/** Official amount with cents always shown when they exist ($202.90, $41.33, $1,736). */
export const cents = (x: number) => (Number.isInteger(x) ? formatMoney(x, 0) : formatMoney(x, 2));
export const num = (x: number, d = 0) => formatNumber(x, d);
export const pct = (x: number, d = 1) => formatPercent(x, d);
export const day = (iso: string) => displayDate(iso, 'en-US');
/** "$0" for a zero premium, "$12.40" otherwise (premiums are published to the cent). */
export const prem = (x: number | null | undefined) => (x === null || x === undefined ? 'n/a' : x === 0 ? '$0' : cents(Math.round(x * 100) / 100));
