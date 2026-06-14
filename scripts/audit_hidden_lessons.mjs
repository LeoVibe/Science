#!/usr/bin/env node
/**
 * 隱形課對帳（上版前測試 SOP L1，JOB-258）
 * 解決問題 4：盲測通過、品質良好的課，因 is_publishable 誤標關閉而前台隱形（JOB-254/255）。
 * 偵測邏輯：某課盲測通過題數 ≥ 25（達課級上架門檻）但 is_publishable=true 題數 = 0
 *           → 高度疑似「盲測過卻沒上架」的隱形課，列出供人工確認。
 * 有嫌疑 → exit 1。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const base = path.join(__dirname, '..', 'question', 'platform');
const subjDir = { Chinese: '國語', Science: '自然', SocialStudies: '社會' };
const pubDir = { HanLin: '翰林', KangHsuan: '康軒', NanYi: '南一' };

let suspect = 0, scanned = 0;
for (const g of ['G3', 'G4', 'G5', 'G6'])
  for (const sem of ['S1', 'S2'])
    for (const sd of Object.keys(subjDir))
      for (const pd of Object.keys(pubDir)) {
        const dir = path.join(base, g, sd, sem, pd);
        if (!fs.existsSync(dir)) continue;
        for (const f of fs.readdirSync(dir).filter(x => /_L\d+\.json$/.test(x))) {
          let d;
          try { d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8')); } catch { continue; }
          const qs = d.questions || [];
          scanned++;
          const blind = qs.filter(q => q.blind_evaluation === true).length;
          const pub = qs.filter(q => q.is_publishable === true).length;
          if (blind >= 25 && pub === 0) {
            console.log(`❌ 隱形課嫌疑 ${g}/${sem}/${subjDir[sd]}/${pubDir[pd]}/${f}：盲測通過 ${blind} 題但上架 0`);
            suspect++;
          }
        }
      }
console.log(`\n掃描 ${scanned} 課，隱形課嫌疑 ${suspect}`);
console.log(suspect ? '👉 請人工確認是否 is_publishable 誤標，重盲測後回寫上架' : '✅ 無隱形課嫌疑');
process.exit(suspect ? 1 : 0);
