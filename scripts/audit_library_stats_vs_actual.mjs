#!/usr/bin/env node
/**
 * 快照 vs 實算對帳（上版前測試 SOP L1，JOB-258）
 * 解決問題 2/5：libraryStats.json 快照可能過時或算錯，無第二來源覆核。
 * 直接掃 question/platform 全組合實算 questions / publishedQuestions，
 * 與 apps/v3_eidos/src/data/libraryStats.json 的 publisherStats 逐格對帳。
 * 不一致 → exit 1。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.join(__dirname, '..');
const base = path.join(root, 'question', 'platform');
const stats = JSON.parse(fs.readFileSync(path.join(root, 'apps/v3_eidos/src/data/libraryStats.json'), 'utf8'));
const ps = stats.publisherStats || {};

const subjDir = { Chinese: '國語', Science: '自然', SocialStudies: '社會', Math: '數學', English: '英語' };
const pubDir = { HanLin: '翰林', KangHsuan: '康軒', NanYi: '南一' };

let totalMismatch = 0, shelfMismatch = 0, checked = 0;
for (const g of ['G3', 'G4', 'G5', 'G6'])
  for (const sem of ['S1', 'S2'])
    for (const sd of Object.keys(subjDir))
      for (const pd of Object.keys(pubDir)) {
        const dir = path.join(base, g, sd, sem, pd);
        if (!fs.existsSync(dir)) continue;
        const files = fs.readdirSync(dir).filter(f => /_L\d+\.json$/.test(f));
        if (!files.length) continue;
        let tot = 0, pub = 0;
        for (const f of files) {
          try {
            const d = JSON.parse(fs.readFileSync(path.join(dir, f), 'utf8'));
            for (const q of (d.questions || [])) { tot++; if (q.is_publishable === true) pub++; }
          } catch { /* skip */ }
        }
        const key = `${g}_${sem}_${subjDir[sd]}_${pubDir[pd]}`;
        const row = ps[key];
        checked++;
        if (!row) { console.log(`❌ 快照缺列 ${key}（實算 ${tot}題 / ${pub}上架）`); totalMismatch++; continue; }
        // 快照欄位語意：bankQuestions=題庫總數、publishedQuestions=上架數
        // 總數過時 = 真問題（題庫增減未重生成）；上架數差異 = 包級達標全算 vs 逐題 is_publishable 定義分歧（待裁定）
        if (row.bankQuestions !== tot) {
          console.log(`❌ 總數過時 ${key}: 快照 ${row.bankQuestions} vs 實算 ${tot}`);
          totalMismatch++;
        } else if (row.publishedQuestions !== pub) {
          console.log(`⚠️  上架數定義差異 ${key}: 快照顯示 ${row.publishedQuestions} vs 嚴格 is_publishable ${pub}`);
          shelfMismatch++;
        }
      }
console.log(`\n對帳 ${checked} 組合：總數過時 ${totalMismatch}、上架數定義差異 ${shelfMismatch}`);
if (totalMismatch) console.log('👉 總數過時（題庫增減未同步）：請跑 node scripts/generate_library_stats.js 重生成');
if (shelfMismatch) console.log('⚠️  上架數差異源於「包級達標全算 vs 逐題 is_publishable」定義分歧，待 PM 裁定（不擋 gate）');
if (!totalMismatch && !shelfMismatch) console.log('✅ 快照與實算完全一致');
process.exit(totalMismatch ? 1 : 0);
