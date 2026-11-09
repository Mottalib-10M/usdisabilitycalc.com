/**
 * Content tests (CONTRIBUTING-PAGES.md): every page file. Run a few files:
 *   PAGE_FILES=texas-unemployment,ny-paid-family-leave npx vitest run tests/pages.test.ts
 * Writes .cache-raw/page-texts.json, read by `python3 scripts/sim-pages.py` (similarity, like check-unique).
 */
import { describe, expect, it } from 'vitest';
import { writeFileSync, mkdirSync } from 'node:fs';
import { PAGES } from '../src/lib/pages';
import { helpers, SOURCES } from '../src/lib/helpers';
import { ROUTES } from '../src/i18n/routes';
import { TOOL_KINDS } from '../src/lib/tool-specs';
import type { FAQ } from '../src/lib/page-types';
import { HOME } from '../src/content/home';
import { PLANNED_IDS } from '../src/lib/planned';

const BANNED = [/—/, /–/, /it'?s important to note/i, /dive into/i, /\bdelve/i, /whether you'?re/i, /navigate the/i, /\bMoreover\b/, /\bAdditionally\b/, /\bFurthermore\b/, /game.?changer/i, /\bunlock/i, /in today'?s world/i, /lawyer near/i, /call (us|now)/i, /get a (free )?quote/i, /\bguaranteed\b/i, /\bdiagnos/i, /\bsymptom/i, /\bcancer\b/i, /\bstroke\b/i, /heart attack/i, /\bdementia\b/i, /alzheimer/i, /\btreatment\b/i];
const words = (s: string) => s.replace(/<[^>]+>/g, ' ').split(/\s+/).filter(Boolean).length;
const text = (s: string) => s.replace(/<div class="not-prose my-6 overflow-x-auto">[\s\S]*?<\/table><\/div>/g, ' ').replace(/<!--mini:[^>]*-->/g, ' ').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim();
const only = (process.env.PAGE_FILES ?? '').split(',').map((x) => x.trim()).filter(Boolean);
const keep = (id: string) => !only.length || only.includes(id);

interface Item { id: string; title: string; description: string; intro: string; resume: string; body: string; faqs: FAQ[]; related: string[]; minBody: number; kind: string }
const items: Item[] = [
  ...PAGES.map((g) => ({ id: g.id, title: g.title, description: g.description, intro: g.intro, resume: g.resume, body: g.body(helpers()), faqs: g.faqs, related: g.related, minBody: 500, kind: 'guide' })),
];

const allQ = new Map<string, string[]>();
for (const it of [...items, { id: 'home', faqs: HOME.faqs } as Item]) for (const f of it.faqs) allQ.set(f.q.trim().toLowerCase(), [...(allQ.get(f.q.trim().toLowerCase()) ?? []), it.id]);
const titles = new Map<string, number>(), descs = new Map<string, number>();
for (const it of items) { titles.set(it.title, (titles.get(it.title) ?? 0) + 1); descs.set(it.description, (descs.get(it.description) ?? 0) + 1); }

describe('content files', () => {
  for (const x of items.filter((y) => keep(y.id))) {
    describe(x.id, () => {
      it('title 50-60, key term first, year, unique', () => {
        expect(x.title.length, x.title).toBeGreaterThanOrEqual(50);
        expect(x.title.length, x.title).toBeLessThanOrEqual(60);
        expect(x.title).toMatch(/2026/);
        expect(x.title).not.toMatch(/^(How|What|When|Why|Is|Are|Do|Does|Can|Calculator|Calculators|United States|US |USA|American)/);
        expect(titles.get(x.title)).toBe(1);
      });
      it('description 150-160, year, unique', () => {
        expect(x.description.length, x.description).toBeGreaterThanOrEqual(150);
        expect(x.description.length, x.description).toBeLessThanOrEqual(160);
        expect(x.description).toMatch(/2026/);
        expect(descs.get(x.description)).toBe(1);
      });
      it('resume: one paragraph of 120 words or more', () => {
        expect(words(x.resume), x.resume).toBeGreaterThanOrEqual(120);
        expect(x.resume).not.toMatch(/\n\s*\n/);
      });
      it(`body: at least ${x.minBody} words of prose, tables apart`, () => {
        expect(words(text(x.body))).toBeGreaterThanOrEqual(x.minBody);
      });
      it('no banned phrase or dash', () => {
        for (const re of BANNED) for (const part of [x.title, x.description, x.intro, x.resume, x.body, ...x.faqs.flatMap((f) => [f.q, f.a])]) expect(part, String(re)).not.toMatch(re);
      });
      it('FAQ: 3 to 8 questions, answers 40-90 words, unique across the site', () => {
        expect(x.faqs.length).toBeGreaterThanOrEqual(3);
        expect(x.faqs.length).toBeLessThanOrEqual(8);
        for (const f of x.faqs) {
          expect(words(f.a), f.q).toBeGreaterThanOrEqual(40);
          expect(words(f.a), f.q).toBeLessThanOrEqual(90);
          expect(allQ.get(f.q.trim().toLowerCase()), f.q).toHaveLength(1);
        }
      });
      it('related pages and minis exist', () => {
        for (const r of x.related) expect(ROUTES.some((x) => x.id === r) || PLANNED_IDS.has(r), r).toBe(true);
        for (const m of x.body.matchAll(/<!--mini:([A-Za-z0-9_]+)/g)) expect(TOOL_KINDS, m[1]).toContain(m[1]);
        expect(x.body.match(/<!--mini:/g)?.length ?? 0, 'at least one mini-simulator').toBeGreaterThanOrEqual(1);
        expect(x.body).not.toMatch(/undefined|NaN|\[object Object\]|null/);
        expect(x.resume + x.description + x.title + x.intro).not.toMatch(/undefined|NaN|null/);
      });
    });
  }
  it.skipIf(!!only.length)('every planned page has its file', () => { for (const id of PLANNED_IDS) expect(ROUTES.some((x) => x.id === id), id).toBe(true); });
  it('page sources exist', () => { for (const g of PAGES) for (const s of g.sources) expect(SOURCES[s], `${g.id}: ${s}`).toBeTruthy(); });
});

mkdirSync('.cache-raw', { recursive: true });
writeFileSync('.cache-raw/page-texts.json', JSON.stringify(Object.fromEntries(items.map((it) => [it.id, { kind: it.kind, text: [it.intro, it.resume, text(it.body), ...it.faqs.flatMap((f) => [f.q, f.a])].join(' ') }]))));
