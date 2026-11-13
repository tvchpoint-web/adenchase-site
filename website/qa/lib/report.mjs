import { writeFileSync } from "node:fs";

const esc = (s) => String(s ?? "").replace(/[&<>"]/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;" })[c]);
const LABEL = { pass: "Pass", warn: "Warn", fail: "Fail" };

/** Writes a self-contained HTML report for reviewing the run: results, screenshots, frames, scores. */
export function writeReport(out, s) {
  const sections = s.sections
    .map((sec) => {
      const items = sec.results
        .map((r) => `<li class="${r.status}"><span class="tag">${LABEL[r.status]}</span><div><b>${esc(r.title)}</b>${r.detail ? `<pre>${esc(r.detail)}</pre>` : ""}</div></li>`)
        .join("");
      const shots = sec.shots?.length
        ? `<h3>Screenshots (full page)</h3><div class="grid">${sec.shots.map((x) => `<a href="${x.file}" target="_blank"><img loading="lazy" src="${x.file}" alt=""><span>${esc(x.route)} · ${x.viewport}</span></a>`).join("")}</div>`
        : "";
      const frames = sec.frames?.length
        ? `<h3>Motion frames</h3><div class="grid frames">${sec.frames.map((x) => `<a href="${x.file}" target="_blank"><img loading="lazy" src="${x.file}" alt=""><span>${esc(x.label)} · ${x.viewport}</span></a>`).join("")}</div>`
        : "";
      const rows = sec.rows?.length
        ? `<h3>Lighthouse (lab)</h3><div class="tbl"><table><tr><th>Route</th><th>Form factor</th><th>Perf</th><th>A11y</th><th>Best pr.</th><th>SEO</th><th>LCP</th><th>CLS</th><th>TBT</th><th>Report</th></tr>${sec.rows
            .map((r) => `<tr><td>${esc(r.route)}</td><td>${r.formFactor}</td>${["performance", "accessibility", "best-practices", "seo"].map((k) => `<td>${r.scores[k] == null ? "–" : Math.round(r.scores[k] * 100)}</td>`).join("")}<td>${Math.round(r.lcp)} ms</td><td>${r.cls?.toFixed(3)}</td><td>${Math.round(r.tbt)} ms</td><td><a href="${r.file}" target="_blank">open</a></td></tr>`)
            .join("")}</table></div>`
        : "";
      return `<section><h2>${esc(sec.name)} <small>${sec.seconds ?? "–"} s</small></h2><ul>${items}</ul>${rows}${shots}${frames}</section>`;
    })
    .join("");

  writeFileSync(
    `${out}/index.html`,
    `<!doctype html><html lang="en"><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>ADEN-CHASE QA report</title>
<style>
:root{--navy:#00103d;--sapphire:#0042ac;--ocean:#00d3fb;--jade:#83fd80;--ink:#eaf0ff;--mist:#a9b6d6;--line:#1d3270;--red:#ff8f96;--amber:#ffcf73}
*{box-sizing:border-box}body{margin:0;background:var(--navy);color:var(--ink);font:14px/1.55 system-ui,-apple-system,"Segoe UI",sans-serif;padding:32px max(16px,4vw) 80px}
h1{margin:0;font-size:28px;letter-spacing:-.01em}h2{font-size:20px;margin:40px 0 12px}h2 small{color:var(--mist);font-weight:400;font-size:13px}h3{font-size:14px;color:var(--mist);text-transform:uppercase;letter-spacing:.1em;margin:24px 0 10px}
.meta{color:var(--mist)}.verdict{display:inline-block;margin-top:14px;padding:6px 12px;border-radius:6px;font-weight:700}.verdict.ok{background:rgba(131,253,128,.15);color:var(--jade)}.verdict.bad{background:rgba(255,143,150,.15);color:var(--red)}
ul{list-style:none;margin:0;padding:0;display:grid;gap:6px}li{display:grid;grid-template-columns:52px 1fr;gap:10px;padding:8px 12px;border:1px solid var(--line);border-radius:6px;background:rgba(255,255,255,.02)}
.tag{font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:.08em}li.pass .tag{color:var(--jade)}li.warn .tag{color:var(--amber)}li.fail .tag{color:var(--red)}li.fail{border-color:rgba(255,143,150,.5)}
pre{white-space:pre-wrap;word-break:break-word;margin:6px 0 0;color:var(--mist);font:12px/1.5 ui-monospace,Menlo,monospace}
.grid{display:grid;grid-template-columns:repeat(auto-fill,minmax(180px,1fr));gap:12px}.grid.frames{grid-template-columns:repeat(auto-fill,minmax(260px,1fr))}
.grid a{display:grid;gap:6px;color:var(--mist);text-decoration:none;font-size:12px}.grid img{width:100%;height:220px;object-fit:cover;object-position:top;border:1px solid var(--line);border-radius:6px;background:#000}.frames img{height:auto;aspect-ratio:16/10}
.tbl{overflow-x:auto}table{border-collapse:collapse;width:100%;min-width:720px}td,th{padding:6px 10px;border-bottom:1px solid var(--line);text-align:left}th{color:var(--mist);font-weight:600}a{color:var(--ocean)}
</style>
<h1>ADEN-CHASE QA report</h1>
<p class="meta">${esc(s.base)} · ${esc(s.date)} · ${s.seconds} s</p>
<span class="verdict ${s.fail ? "bad" : "ok"}">${s.fail ? "FAIL" : "PASS"} — ${s.pass} pass · ${s.warn} warn · ${s.fail} fail</span>
${sections}
</html>`,
  );
}
