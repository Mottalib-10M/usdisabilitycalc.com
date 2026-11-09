/** Declarative calculators (src/lib/tool-specs.ts), rendered by components/calc/SpecTool.tsx. */
export type V = Record<string, number | string>;
export interface NumIn { kind?: 'num'; id: string; label: string; def: number; unit?: string; max?: number; decimals?: number; help?: string; adv?: boolean; wide?: boolean }
export interface ChoiceIn { kind: 'choice'; id: string; label: string; def: string; options: Array<{ value: string; label: string }>; help?: string; adv?: boolean; wide?: boolean }
export interface SelectIn { kind: 'select'; id: string; label: string; def: string; options: Array<{ value: string; label: string }>; /** Options that depend on the other fields (states priced for the chosen trade). */ dyn?: (v: V) => Array<{ value: string; label: string }>; help?: string; adv?: boolean; wide?: boolean }
export type Input = NumIn | ChoiceIn | SelectIn;
export interface ToolOut {
  label: string; value: string; sub?: string;
  rows: Array<[string, string, number?]>;
  table?: { caption?: string; headers: string[]; rows: string[][]; align?: Array<'l' | 'r'> };
  note?: string;
}
export interface ToolSpec { inputs: Input[]; run: (v: V) => ToolOut }
