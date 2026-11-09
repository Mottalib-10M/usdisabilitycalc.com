/**
 * One page = ONE content file (CONTRIBUTING-PAGES.md): `src/content/pages/<id>.ts` (PageDef).
 * Routes, menus, footer, sitemap, schemas, llms.txt and internal links read these files alone.
 */
import type { Kit } from './kit';

export interface FAQ { q: string; a: string; /** Shown open: the answer a reader of that age or case comes for. */ open?: boolean }
export interface MiniOpts { /** title */ t?: string; /** ids of the fields shown */ p?: string[]; /** default values */ d?: Record<string, number | string>; /** link text */ c?: string }

export interface Helpers extends Kit {
  /** Internal link by page id ("long-term-disability-insurance", "method"). Unknown id = failed test. */
  a: (id: string, text: string) => string;
  /** Table; numbers are formatted, strings are inserted as HTML. */
  table: (headers: string[], rows: Array<Array<string | number>>, caption?: string, align?: Array<'l' | 'r'>) => string;
  /** Link to a source of params-2026.json (key), with optional text. */
  src: (key: string, text?: string) => string;
  /** Link to any official URL already read. */
  ext: (url: string, text: string) => string;
  /** Ruled note. */
  box: (title: string, html: string) => string;
  /** Inline mini-simulator built on a calculator of tool-specs.ts: `${h.mini('ltd', { t, p: ['sal'], d: { sal: 80000 } })}`. */
  mini: (kind: string, opts?: MiniOpts) => string;
}

/** disability: short and long-term disability income; care: long-term care insurance; accident: AD&D, accident, hospital and critical illness. */
export type Group = 'disability' | 'care' | 'accident';

export interface PageDef {
  id: string; group: Group; order: number;
  /** URL segment, lowercase and dashes, no year. */
  slug: string;
  nav: string; card: string;
  /** 50 to 60 characters, key term first, year included (RECETTE §11). */
  title: string;
  /** 150 to 160 characters, year included. */
  description: string;
  h1: string; intro: string;
  /** Link right under the intro to a case lower on the page (testers 2026-11-09: the 61 case came 7 screens down). */
  jump?: { href: string; label: string };
  /** ONE paragraph of 120 words or more: the direct answer with the figures (RECETTE §21). */
  resume: string;
  faqs: FAQ[];
  body: (h: Helpers) => string;
  /** Calculator at the top: a key of tool-specs.ts. */
  tool: string;
  /** Default values of that calculator for this page. */
  toolArg?: Record<string, number | string>;
  related: string[];
  /** Keys of params-2026.json > sources. */
  sources: string[];
}
export const definePage = (p: PageDef): PageDef => p;
