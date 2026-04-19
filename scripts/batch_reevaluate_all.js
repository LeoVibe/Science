#!/usr/bin/env node
/**
 * batch_reevaluate_all.js
 *
 * 對 question/platform/ 下所有「已開放科目」且「非 backup 目錄」的題庫 JSON，
 * 執行 evaluate_question_quality.js 的 evaluateFile()，讓每題 quality_level
 * 欄位對齊 Canonical QL 定義（見 question/README_驗證與盲測準則.md §4）。
 *
 * 用法：
 *   node scripts/batch_reevaluate_all.js              # 全跑
 *   node scripts/batch_reevaluate_all.js --dry-run    # 只列檔案不執行
 */

const fs = require('fs');
const path = require('path');
const { evaluateFile } = require('./evaluate_question_quality.js');

const PLATFORM_DIR = path.join(__dirname, '..', 'question', 'platform');

const OPEN_GRADE_SEMESTERS = new Set(['G3_S2', 'G4_S2', 'G5_S2', 'G6_S2']);
const isBackupDir = (name) => /backup|_job\d+|_legacy/i.test(name);

const dryRun = process.argv.includes('--dry-run');

function walk(dir, files = []) {
    let entries;
    try { entries = fs.readdirSync(dir, { withFileTypes: true }); } catch { return files; }
    for (const e of entries) {
        if (e.name === '.DS_Store') continue;
        if (isBackupDir(e.name)) continue;
        const full = path.join(dir, e.name);
        if (e.isDirectory()) walk(full, files);
        else if (e.name.endsWith('.json') && !e.name.endsWith('manifest.json')) files.push(full);
    }
    return files;
}

function isOpenFile(filePath) {
    const rel = path.relative(PLATFORM_DIR, filePath);
    const match = rel.match(/^(G\d)[\/\\][^\/\\]+[\/\\](S\d)/);
    if (!match) return false;
    return OPEN_GRADE_SEMESTERS.has(`${match[1]}_${match[2]}`);
}

const all = walk(PLATFORM_DIR);
const targets = all.filter(isOpenFile);

console.log(`掃描完成：全部 ${all.length} 檔 / 已開放 ${targets.length} 檔 / 跳過 ${all.length - targets.length} 檔（未開放 + backup）`);
if (dryRun) {
    console.log('\n--dry-run：僅列出檔案，不執行評分');
    targets.slice(0, 20).forEach(f => console.log('  ' + path.relative(process.cwd(), f)));
    if (targets.length > 20) console.log(`  ...以及另 ${targets.length - 20} 檔`);
    process.exit(0);
}

const summary = { ok: 0, broken: 0, qlDist: { QL1: 0, 'QL1 (BIAS)': 0, QL2: 0, QL3: 0, QL4: 0, QL5: 0 } };
const qlChanges = [];

for (const file of targets) {
    try {
        const r = evaluateFile(file);
        if (r.quality === 'BROKEN') {
            summary.broken++;
            console.error(`  [BROKEN] ${path.relative(process.cwd(), file)}: ${r.error}`);
            continue;
        }
        summary.ok++;
        summary.qlDist[r.quality] = (summary.qlDist[r.quality] || 0) + 1;
        if (r.quality !== 'QL4' && r.kl4Status) {
            qlChanges.push({ file: path.relative(process.cwd(), file), q: r.quality, kl4: r.kl4Status, cqi: r.avgCqi, count: r.count });
        }
    } catch (e) {
        summary.broken++;
        console.error(`  [ERROR] ${path.relative(process.cwd(), file)}: ${e.message}`);
    }
}

console.log('\n=== 批次重評完成 ===');
console.log(`  成功: ${summary.ok} / 失敗: ${summary.broken}`);
console.log(`  檔級 QL 分布:`, summary.qlDist);

console.log('\n=== 非 QL4 檔案（前 30）===');
qlChanges.slice(0, 30).forEach(c => {
    const k = `課文:${c.kl4.hasResearch?'✓':'✗'} 考古:${c.kl4.hasExam?'✓':'✗'}`;
    console.log(`  ${c.q} | ${k} | CQI ${c.cqi} | ${c.count}題 | ${c.file}`);
});
if (qlChanges.length > 30) console.log(`  ...以及另 ${qlChanges.length - 30} 檔`);
