#!/usr/bin/env node
/**
 * 清除選項洩答標註字串（JOB-261，出題產生器 artifact 修復）
 * 移除附在選項末尾的出題內部標註（會洩漏答案提示給學生）。
 * 預設 dry-run；加 --apply 實際寫回。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = path.join(__dirname, '..', 'question', 'platform');
const APPLY = process.argv.includes('--apply');

// 已知洩答標註句式（精確，避免誤刪正常內容）
const PATS = [
  /，?這也是作者想強調的重點之一。?/g,
  /（易誤選）/g,
  /（與課文重點不符）/g,
  /，?[^，。「」]{0,14}與課文細節或作者用意並不一致。?/g,
  /，?與課文重點不符。?/g,
];

function clean(o) {
  const orig = String(o);
  let s = orig;
  for (const re of PATS) s = s.replace(re, '');
  if (s === orig) return orig; // 無洩答標註 → 原樣返回（不動正常選項的句號）
  return s.replace(/[，、。\s]+$/, '').trim();
}

let files = 0, qs = 0, opts = 0, emptied = 0;
const samples = [];
function walk(d) {
  for (const e of fs.readdirSync(d, { withFileTypes: true })) {
    const p = path.join(d, e.name);
    if (e.isDirectory()) { walk(p); continue; }
    if (!/_L\d+\.json$/.test(e.name)) continue;
    let j; try { j = JSON.parse(fs.readFileSync(p, 'utf8')); } catch { continue; }
    let changed = false;
    for (const q of j.questions || []) {
      if (!Array.isArray(q.options)) continue;
      let qhit = false;
      q.options = q.options.map(o => {
        const c = clean(o);
        if (c !== String(o)) {
          opts++; qhit = true;
          if (c.length === 0) emptied++;
          if (samples.length < 8) samples.push([String(o), c]);
          return c;
        }
        return o;
      });
      if (qhit) { qs++; changed = true; }
    }
    if (changed) { files++; if (APPLY) fs.writeFileSync(p, JSON.stringify(j, null, 2) + '\n'); }
  }
}
walk(base);
console.log((APPLY ? '✅ 已清除' : '[dry-run] 將清除'), `檔案 ${files} / 題 ${qs} / 選項 ${opts}`);
if (emptied) console.log(`⚠️  清除後變空字串的選項: ${emptied}（需檢查！）`);
console.log('樣本(前→後):');
samples.forEach(([a, b]) => console.log(`  - ${JSON.stringify(a)}\n  + ${JSON.stringify(b)}`));
process.exit(0);
