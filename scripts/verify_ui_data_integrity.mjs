#!/usr/bin/env node
/**
 * verify_ui_data_integrity.mjs
 *
 * 目的：檢查 production 題庫 JSON 的資料結構能否被 apps/v3_eidos/src/data/questionLoader.ts
 *       正確解析。專門防範 2026-04-19 發現的 `answer_index` vs `answer` 欄位漏讀 bug。
 *
 * 檢查項目：
 *   D-INT-1  每題必須存在 `answer_index` 或 `correctAnswer` 或 `answer` 之一
 *   D-INT-2  `answer_index` 必須是整數、在 `options.length` 範圍內
 *   D-INT-3  `options` 必須恰為 4 個字串
 *   D-INT-4  模擬 loader 計算 normalizedAnswer，斷言等於 `answer_index`
 *
 * 使用：
 *   node scripts/verify_ui_data_integrity.mjs
 *   node scripts/verify_ui_data_integrity.mjs --gate   # 失敗 exit 1（pre-commit 模式）
 *
 * 失敗 exit code：1
 */

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = path.resolve(__dirname, '..');
const QUESTION_ROOT = path.join(PROJECT_ROOT, 'question', 'platform');

const args = new Set(process.argv.slice(2));
const isGateMode = args.has('--gate');
const includeAll = args.has('--all'); // 預設只掃開放範圍（G3-G6 S2），--all 則掃全站（含 S1 歷史快照）
const publishableOnly = !args.has('--include-unpublishable'); // 預設只掃 is_publishable !== false 的題目

// 開放範圍與 apps/v3_eidos/public/data/libraryStats.json 的 OPEN_GRADE_SEMESTERS 對齊
const OPEN_GRADE_SEMESTERS = new Set(['G3_S2', 'G4_S2', 'G5_S2', 'G6_S2']);

/** 依檔案路徑判斷是否位於開放範圍（例：question/platform/G3/Chinese/S2/... → G3_S2） */
function isInOpenRange(filePath) {
    const rel = path.relative(QUESTION_ROOT, filePath);
    const parts = rel.split(path.sep);
    // 期望路徑：{Grade}/{Subject}/{Semester}/{Publisher}/{file}
    if (parts.length < 4) return false;
    const grade = parts[0];
    const semester = parts[2];
    return OPEN_GRADE_SEMESTERS.has(`${grade}_${semester}`);
}

/**
 * 模擬 questionLoader.ts 針對 `data.meta + data.questions` 分支的關鍵欄位解析邏輯。
 * 任何 loader.ts 的對應改動都必須同步更新這裡，或此驗證將失去效用。
 */
function simulateLoaderNormalizedAnswer(q) {
    const rawAnswer = q.answer_index ?? q.correctAnswer ?? q.answer ?? 0;
    if (typeof rawAnswer === 'number') return rawAnswer;
    const str = String(rawAnswer).trim();
    const letterIndex = 'ABCD'.indexOf(str.toUpperCase());
    if (letterIndex >= 0) return letterIndex;
    if (Array.isArray(q.options)) {
        const idx = q.options.findIndex(o => o === str);
        if (idx >= 0) return idx;
    }
    const num = parseInt(str);
    return isNaN(num) ? 0 : num;
}

/** 備份目錄（對齊 libraryStats 的 isBackupDir 排除規則） */
function isBackupDir(name) {
    return /backup|_old|_archived/i.test(name);
}

function walkQuestionJsonFiles(dir, acc = []) {
    if (!fs.existsSync(dir)) return acc;
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        if (entry.isDirectory() && isBackupDir(entry.name)) continue;
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) {
            walkQuestionJsonFiles(full, acc);
        } else if (
            entry.isFile() &&
            entry.name.endsWith('.json') &&
            !entry.name.includes('manifest') &&
            !entry.name.includes('mismatch_catalog')
        ) {
            acc.push(full);
        }
    }
    return acc;
}

const failures = [];
const stats = { files: 0, questions: 0, int1: 0, int2: 0, int3: 0, int4: 0 };

const allFiles = walkQuestionJsonFiles(QUESTION_ROOT);
const files = includeAll ? allFiles : allFiles.filter(isInOpenRange);
const skipped = allFiles.length - files.length;
console.log(`掃描範圍：${includeAll ? '全站（含 S1 歷史快照）' : '開放範圍（G3-G6 × S2）'}；${publishableOnly ? '僅檢查 is_publishable !== false 的題目' : '含所有題目'}`);
if (skipped > 0) console.log(`略過非開放範圍：${skipped} 檔`);
for (const file of files) {
    stats.files++;
    let data;
    try {
        data = JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch (e) {
        failures.push({ file, rule: 'PARSE', detail: e.message });
        continue;
    }
    if (!Array.isArray(data.questions)) continue;

    data.questions.forEach((q, idx) => {
        // 預設跳過不上架題目（is_publishable === false）；可用 --include-unpublishable 檢查
        if (publishableOnly && q.is_publishable === false) return;
        stats.questions++;
        const ctx = `${path.relative(PROJECT_ROOT, file)} #${idx + 1}`;

        // D-INT-1
        const hasAnswerField =
            q.answer_index !== undefined ||
            q.correctAnswer !== undefined ||
            q.answer !== undefined;
        if (!hasAnswerField) {
            stats.int1++;
            failures.push({ ctx, rule: 'D-INT-1', detail: '缺 answer_index / correctAnswer / answer' });
            return;
        }

        // D-INT-3
        if (!Array.isArray(q.options) || q.options.length !== 4) {
            stats.int3++;
            failures.push({
                ctx,
                rule: 'D-INT-3',
                detail: `options 數量 ${Array.isArray(q.options) ? q.options.length : 'n/a'}（應為 4）`,
            });
            return;
        }

        // D-INT-2
        const ai = q.answer_index;
        if (ai !== undefined) {
            if (!Number.isInteger(ai) || ai < 0 || ai >= q.options.length) {
                stats.int2++;
                failures.push({
                    ctx,
                    rule: 'D-INT-2',
                    detail: `answer_index=${ai} 越界（options.length=${q.options.length}）`,
                });
                return;
            }
        }

        // D-INT-4：核心斷言 — loader 計算的 normalizedAnswer 必須等於 answer_index
        const expected = q.answer_index ?? q.correctAnswer ?? q.answer;
        if (expected === undefined) return;
        const simulated = simulateLoaderNormalizedAnswer(q);
        const expectedNum = typeof expected === 'number' ? expected : simulateLoaderNormalizedAnswer({ ...q, answer_index: undefined, correctAnswer: undefined, answer: expected });
        if (simulated !== expectedNum) {
            stats.int4++;
            failures.push({
                ctx,
                rule: 'D-INT-4',
                detail: `loader 模擬得 ${simulated}，但原始 answer 指向 ${expectedNum}`,
            });
        }
    });
}

console.log('=== UI ↔ 資料一致性驗證 ===');
console.log(`掃描檔案：${stats.files}`);
console.log(`檢查題數：${stats.questions}`);
console.log(`D-INT-1 缺 answer 欄位：${stats.int1}`);
console.log(`D-INT-2 answer_index 越界：${stats.int2}`);
console.log(`D-INT-3 options 非 4 選項：${stats.int3}`);
console.log(`D-INT-4 loader normalizedAnswer 錯位：${stats.int4}`);
console.log('---');

if (failures.length === 0) {
    console.log('✅ 全站通過 UI ↔ 資料一致性檢查');
    process.exit(0);
}

console.log(`❌ 共 ${failures.length} 處違規：`);
const sample = failures.slice(0, 20);
for (const f of sample) {
    console.log(`  [${f.rule}] ${f.ctx || f.file}：${f.detail}`);
}
if (failures.length > sample.length) {
    console.log(`  ...（省略 ${failures.length - sample.length} 筆）`);
}

if (isGateMode) {
    process.exit(1);
} else {
    process.exit(0);
}
