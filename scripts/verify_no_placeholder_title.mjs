#!/usr/bin/env node
/**
 * verify_no_placeholder_title.mjs
 *
 * 獨立稽核工具：列出所有 manifest items[].title 為 `L\d+` 佔位符的檔案。
 * JOB-205 新增；與 verify_ui_data_integrity.mjs 的 D-INT-5 規則互補（本工具可跨全站、含 S1）。
 *
 * 使用：
 *   node scripts/verify_no_placeholder_title.mjs            # 預設列開放範圍 G3-G6 × S2
 *   node scripts/verify_no_placeholder_title.mjs --all      # 掃全站（含 S1）
 *   node scripts/verify_no_placeholder_title.mjs --json     # 輸出 JSON（供腳本串接）
 *
 * 失敗 exit code：若有任何 placeholder title → 1；全通過 → 0
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const QUESTION_ROOT = path.join(PROJECT_ROOT, 'question', 'platform');

const args = new Set(process.argv.slice(2));
const includeAll = args.has('--all');
const asJson = args.has('--json');

const OPEN_GRADE_SEMESTERS = new Set(['G3_S2', 'G4_S2', 'G5_S2', 'G6_S2']);

function isBackupDir(name) {
    return /backup|_old|_archived/i.test(name);
}

function isInOpenRange(filePath) {
    const rel = path.relative(QUESTION_ROOT, filePath);
    const parts = rel.split(path.sep);
    if (parts.length < 4) return false;
    return OPEN_GRADE_SEMESTERS.has(`${parts[0]}_${parts[2]}`);
}

function walkManifests(dir, acc = []) {
    if (!fs.existsSync(dir)) return acc;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory() && isBackupDir(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) walkManifests(full, acc);
        else if (entry.isFile() && entry.name.endsWith('manifest.json')) acc.push(full);
    }
    return acc;
}

const allManifests = walkManifests(QUESTION_ROOT);
const manifests = includeAll ? allManifests : allManifests.filter(isInOpenRange);

const report = [];
for (const file of manifests) {
    let data;
    try { data = JSON.parse(fs.readFileSync(file, 'utf8')); } catch { continue; }
    if (!Array.isArray(data.items)) continue;

    const placeholders = data.items
        .map((it, i) => ({ i, id: it.id, title: it.title }))
        .filter(x => typeof x.title === 'string' && /^L\d+$/.test(x.title));

    if (placeholders.length > 0) {
        report.push({
            file: path.relative(PROJECT_ROOT, file),
            grade: data.grade,
            semester: data.semester,
            subject: data.subject,
            publisher: data.publisher,
            total_items: data.items.length,
            placeholder_count: placeholders.length,
            placeholders,
        });
    }
}

if (asJson) {
    console.log(JSON.stringify(report, null, 2));
} else {
    console.log(`=== Placeholder title 稽核 ===`);
    console.log(`掃描範圍：${includeAll ? '全站' : '開放範圍 G3-G6 × S2'}`);
    console.log(`掃描 manifest：${manifests.length}`);
    console.log(`有 placeholder 的 manifest：${report.length}`);
    console.log(`總 placeholder 課次：${report.reduce((s, r) => s + r.placeholder_count, 0)}`);
    console.log('---');
    if (report.length === 0) {
        console.log('✅ 所有 manifest items[].title 皆為真實課名，無 LN 佔位符');
        process.exit(0);
    }
    // 按科目分組彙總
    const bySubject = new Map();
    for (const r of report) {
        const key = `${r.grade} ${r.subject} ${r.semester}`;
        if (!bySubject.has(key)) bySubject.set(key, []);
        bySubject.get(key).push(r);
    }
    for (const [key, rs] of [...bySubject.entries()].sort()) {
        console.log(`\n[${key}]  ${rs.length} manifest`);
        for (const r of rs) {
            console.log(`  ${r.publisher}: ${r.placeholder_count}/${r.total_items} 課為佔位符`);
        }
    }
    console.log(`\n❌ 總計 ${report.length} manifest 需補 title（JOB-205）`);
}

process.exit(report.length > 0 ? 1 : 0);
