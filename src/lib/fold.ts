/**
 * Folds the H2 sections of a page body after the first `open` ones (brief of 2026-11-09: shorter pages on a phone).
 * Each folded section becomes <details class="fold"><summary><h2>title</h2></summary>text</details>: the title stays a
 * real H2 and the text stays in the HTML served, so nothing is removed for search engines.
 */
export function foldSections(html: string, open: number): string {
  const chunks = html.split(/(?=<h2>)/);
  let seen = 0;
  return chunks.map((c) => {
    const m = /^<h2>([\s\S]*?)<\/h2>/.exec(c);
    if (!m) return c;
    seen += 1;
    if (seen <= open) return c;
    return `<details class="fold"><summary class="not-prose"><h2 class="fold-h">${m[1]}</h2></summary>${c.slice(m[0].length)}</details>`;
  }).join('');
}
