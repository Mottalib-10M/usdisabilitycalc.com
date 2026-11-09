/**
 * Renders one declarative calculator (src/lib/tool-specs.ts): fields on the left, the result card on the
 * right (data-resultat), folded advanced options, a share link written only after a user action.
 * First render = build defaults; a shared link is read after mount (RECETTE §17.5).
 * Naive testers, 2026-11-08 (trame): until the reader changes a field (or opens a shared link) the result
 * carries "Example, not your result yet"; the fold's title shows the current value of each folded field;
 * the result table becomes cards under 768 px (`empile`, `data-label`, lib/tableaux.ts).
 */
import { useEffect, useMemo, useState } from 'react';
import NumberField from '../ui/NumberField';
import SelectField from '../ui/SelectField';
import { Choice, ResultCard, Rows, ShareRow } from './parts';
import { readParams, updateURL } from '../../lib/url-state';
import { getTool } from '../../lib/tool-specs';
import type { Input, V } from '../../lib/tool-types';
import MentionExemple from './MentionExemple';
import { attributsTableau, etiquettes } from '../../lib/tableaux';
import { formatNumber } from '../../lib/format';

/** A field's value as the reader reads it: option label, $1,200, 4%, or the number and its unit. */
export function valeurAffichee(i: Input, v: V): string {
  const x = v[i.id];
  if (i.kind === 'choice' || i.kind === 'select') return ((i.kind === 'select' && i.dyn ? i.dyn(v) : i.options).find((o) => o.value === String(x))?.label) ?? String(x);
  const n = Number(x), t = formatNumber(n, Number.isInteger(n) ? 0 : (i.decimals ?? 0));
  return i.unit === '$' ? `$${t}` : i.unit === '%' ? `${t}%` : `${t}${i.unit ? `\u00a0${i.unit}` : ''}`;
}

/** Title line of the folded fields (naive testers 2026-11-09, second pass: "Now: Split plan only: the part of the premium
 *  you pay after tax 30% · Tax filing status Single" ran labels and values together). Each field by its short name. */
export function resumeChamps(adv: Input[], v: V): string {
  return `Already filled in: ${adv.map((i) => `${i.short ?? i.label} ${valeurAffichee(i, v)}`).join(' · ')}`;
}

interface Props { kind: string; arg?: string; methodHref?: string; idPrefix?: string }

export default function SpecTool({ kind, arg, methodHref, idPrefix = 't' }: Props) {
  const spec = useMemo(() => getTool(kind, arg ? JSON.parse(arg) : undefined), [kind, arg]);
  const defaults = useMemo(() => Object.fromEntries(spec.inputs.map((i) => [i.id, i.def])) as V, [spec]);
  const [v, setV] = useState<V>(defaults);
  // Fields the reader changed; a shared link counts as the reader's own figures.
  const [touched, setTouched] = useState<Record<string, boolean>>({});
  useEffect(() => {
    const u = readParams(window.location.search);
    if (![...u.keys()].length) return;
    setTouched({ lien: true });
    const next: V = { ...defaults };
    for (const i of spec.inputs) {
      const x = u.get(i.id);
      if (x === null) continue;
      if (i.kind === 'choice' || i.kind === 'select') { if (i.options.some((o) => o.value === x)) next[i.id] = x; }
      else { const f = parseFloat(x); if (!isNaN(f)) next[i.id] = Math.min(f, i.max ?? Infinity); }
    }
    setV(fit(next));
  }, []);
  useEffect(() => updateURL(v as Record<string, string | number>), [v]);
  const out = useMemo(() => spec.run(v), [v, spec]);
  /** A select whose options depend on another field (states priced for the chosen trade) falls back to its first option. */
  const fit = (o: V): V => {
    const next = { ...o };
    for (const i of spec.inputs) if (i.kind === 'select' && i.dyn) { const opts = i.dyn(next); if (!opts.some((x) => x.value === String(next[i.id]))) next[i.id] = opts[0]?.value ?? ''; }
    return next;
  };
  const set = (id: string) => (x: number | string) => { setV((o) => fit({ ...o, [id]: x })); setTouched((o) => (o[id] ? o : { ...o, [id]: true })); };
  const field = (i: Input) => {
    const id = `${idPrefix}-${i.id}`;
    const cls = i.wide ? 'sm:col-span-2' : '';
    if (i.kind === 'choice') return <div key={i.id} className={`grid grid-rows-subgrid row-span-3 ${cls}`}><Choice id={id} label={i.label} value={String(v[i.id])} options={i.options} onChange={set(i.id)} /></div>;
    if (i.kind === 'select') return <SelectField key={i.id} id={id} label={i.label} value={String(v[i.id])} onChange={set(i.id)} options={i.dyn ? i.dyn(v) : i.options} help={i.help} className={cls} />;
    return <NumberField key={i.id} id={id} label={i.label} value={Number(v[i.id])} onChange={set(i.id)} unit={i.unit} max={i.max} decimals={i.decimals} help={i.help} className={cls} />;
  };
  const main = spec.inputs.filter((i) => !i.adv), adv = spec.inputs.filter((i) => i.adv);
  return (
    <div className="rounded-xl border border-navy-200 bg-white p-4 sm:p-5">
      <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(0,22rem)]">
        <form className="grid content-start grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2" onSubmit={(e) => e.preventDefault()}>
          {main.map(field)}
          {adv.length > 0 && (
            <details className="sm:col-span-2 rounded-lg border border-navy-200 px-3 py-2">
              <summary className="cursor-pointer text-sm font-medium text-navy-700">More details (optional)
                <span data-actuellement className="mt-0.5 block text-xs font-normal text-navy-600">{resumeChamps(adv, v)}</span></summary>
              <div className="mt-3 grid grid-cols-1 gap-x-4 gap-y-3 sm:grid-cols-2">{adv.map(field)}</div>
            </details>
          )}
        </form>
        <ResultCard label={out.label} value={out.value} sub={out.sub} mention={<MentionExemple lang="en" touched={touched} texte={out.example} />}>
          <Rows rows={out.rows} />
          {out.note && <p className="mt-2 text-xs text-navy-600">{out.note}</p>}
          <ShareRow methodHref={methodHref} />
        </ResultCard>
      </div>
      {out.table && (
        <div className="mt-4 overflow-x-auto">
          <table className={`w-full text-sm ${attributsTableau('auto', out.table.headers.length).classe}`}>
            {out.table.caption && <caption className="mb-2 text-left text-sm text-navy-700">{out.table.caption}</caption>}
            <thead><tr>{out.table.headers.map((h, i) => <th key={h} scope="col" className={`border-b border-navy-200 px-2 py-1.5 font-semibold text-navy-900 ${out.table!.align?.[i] === 'r' ? 'text-right' : 'text-left'}`}>{h}</th>)}</tr></thead>
            <tbody>{out.table.rows.map((r, k) => { const lab = etiquettes(out.table!.headers, r.length); return <tr key={k}>{r.map((c, i) => <td key={i} data-label={lab[i]} className={`tabular-nums border-b border-navy-100 px-2 py-1.5 text-navy-800 ${out.table!.align?.[i] === 'r' ? 'text-right' : 'text-left'}`}>{c}</td>)}</tr>; })}</tbody>
          </table>
        </div>
      )}
    </div>
  );
}
