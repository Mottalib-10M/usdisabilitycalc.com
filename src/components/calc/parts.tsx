/** Shared pieces of the calculators: result card, breakdown rows, toggles, share link. */
import { useState, type ReactNode } from 'react';

/** `mention`: shown above the result, e.g. "Example, not your result yet" while no field is changed (MentionExemple). */
export function ResultCard({ label, value, sub, mention, children }: { label: string; value: string; sub?: ReactNode; mention?: ReactNode; children?: ReactNode }) {
  return (
    <div data-resultat aria-live="polite" className="rounded-lg border border-accent-200 bg-accent-50 p-4 sm:p-5">
      {mention}
      <p className="text-sm font-medium text-navy-700">{label}</p>
      <p className="tabular-nums mt-1 font-serif text-[2.4rem] font-bold leading-tight text-navy-900">{value}</p>
      {sub && <p className="mt-1 text-sm text-navy-700">{sub}</p>}
      {children}
    </div>
  );
}

export function Rows({ rows, total }: { rows: Array<[string, string, number?]>; total?: [string, string] }) {
  const max = Math.max(1, ...rows.map((r) => r[2] ?? 0));
  return (
    <table className="mt-3 w-full text-sm"><tbody className="divide-y divide-accent-100">
      {rows.map(([l, v, w]) => (
        <tr key={l}><td className="py-1.5 pr-3 text-navy-700">{l}{w !== undefined && w > 0 && <span aria-hidden="true" className="mt-1 block h-1 rounded bg-accent-500/70" style={{ width: `${Math.max(3, (w / max) * 100)}%` }} />}</td><td className="tabular-nums py-1.5 text-right align-top text-navy-900">{v}</td></tr>
      ))}
      {total && <tr><td className="pt-2 font-semibold text-navy-900">{total[0]}</td><td className="tabular-nums pt-2 text-right font-semibold text-navy-900">{total[1]}</td></tr>}
    </tbody></table>
  );
}

/** Two to four options filling the whole frame (RECETTE §10.3). */
export function Choice<T extends string>({ id, label, value, options, onChange }: { id: string; label: string; value: T; options: Array<{ value: T; label: string }>; onChange: (v: T) => void }) {
  return (
    <div className="grid grid-rows-subgrid row-span-3 content-start gap-y-0">
      <span id={`${id}-l`} className="mb-1 block text-sm font-medium text-navy-700">{label}</span>
      <div role="group" aria-labelledby={`${id}-l`} className="grid h-12 grid-flow-col auto-cols-fr overflow-hidden rounded-lg border border-navy-300">
        {options.map((o) => (
          <button key={o.value} type="button" aria-pressed={value === o.value} onClick={() => onChange(o.value)}
            className={`h-full px-2 text-sm font-medium ${value === o.value ? 'bg-accent-700 text-white' : 'bg-white text-navy-700 hover:bg-navy-50'}`}>{o.label}</button>
        ))}
      </div>
    </div>
  );
}

export function ShareRow({ methodHref, note }: { methodHref?: string; note?: string }) {
  const [copied, setCopied] = useState(false);
  const copy = () => { try { navigator.clipboard?.writeText(window.location.href); setCopied(true); setTimeout(() => setCopied(false), 1500); } catch { /* no clipboard */ } };
  return (
    <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-navy-600">
      <button type="button" onClick={copy} className="underline hover:text-navy-900">{copied ? 'Link copied' : 'Copy share link'}</button>
      <button type="button" onClick={() => window.print()} className="underline hover:text-navy-900">Print</button>
      {methodHref && <a href={methodHref} className="underline hover:text-navy-900">How this is computed</a>}
      {note && <span>{note}</span>}
    </div>
  );
}
