#!/usr/bin/env node
/**
 * job205_sync_title_from_kl4.mjs
 *
 * 從 knowledge/1_課綱研究/{科目}/{學期}/ 下的 KL4 檔名解析真實課名，
 * 同步到 question/platform/ 對應 manifest.items[].title 與 lesson JSON 的 meta.title。
 *
 * 使用：
 *   node scripts/job205_sync_title_from_kl4.mjs --dry-run                # 預覽
 *   node scripts/job205_sync_title_from_kl4.mjs                          # 實際寫入
 *   node scripts/job205_sync_title_from_kl4.mjs --target "G5 MATH S2"   # 只處理特定組合
 *
 * 設計：只處理 KL4 完整覆蓋 + 當前 manifest 為 LN 佔位符的組合。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const KL4_DIR = path.join(ROOT, 'knowledge', '1_課綱研究');
const PLATFORM_DIR = path.join(ROOT, 'question', 'platform');

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const targetArg = process.argv.find(a => a.startsWith('--target='))?.split('=')[1];

const SEM_ZH_TO_EN = { '三上': 'G3S1', '三下': 'G3S2', '四上': 'G4S1', '四下': 'G4S2', '五上': 'G5S1', '五下': 'G5S2', '六上': 'G6S1', '六下': 'G6S2' };
const PUB_ZH_TO_DIR = { '康軒': 'KangHsuan', '南一': 'NanYi', '翰林': 'HanLin' };
const PUB_ZH_TO_CODE = { '康軒': 'KANGHSUAN', '南一': 'NANYI', '翰林': 'HANLIN' };
const SUBJ_ZH_TO_EN = { '國語': 'Chinese', '數學': 'Math', '英語': 'English', '自然': 'Science', '社會': 'SocialStudies', '生活': 'Life' };
const SUBJ_ZH_TO_CODE = { '國語': 'CHI', '數學': 'MATH', '英語': 'ENG', '自然': 'SCI', '社會': 'SOC', '生活': 'LIFE' };

/** 掃 KL4 → {subject_code: {gs: {publisher_code: {lesson_num: title}}}} */
function buildKL4Index() {
    const index = {};
    if (!fs.existsSync(KL4_DIR)) return index;
    const kl4Pattern = /^KL4_(.+?)_(.+?)_L(\d+)_(.+?)_單課研究紀錄\.md$/;
    function walk(dir) {
        for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
            const full = path.join(dir, entry.name);
            if (entry.isDirectory()) { walk(full); continue; }
            const m = kl4Pattern.exec(entry.name);
            if (!m) continue;
            const [, semZh, pubZh, num, title] = m;
            // 科目從路徑第一層得知
            const rel = path.relative(KL4_DIR, dir);
            const subjZh = rel.split(path.sep)[0];
            const subjCode = SUBJ_ZH_TO_CODE[subjZh];
            const gs = SEM_ZH_TO_EN[semZh];
            const pubCode = PUB_ZH_TO_CODE[pubZh];
            if (!subjCode || !gs || !pubCode) continue;
            index[subjCode] ??= {};
            index[subjCode][gs] ??= {};
            index[subjCode][gs][pubCode] ??= {};
            index[subjCode][gs][pubCode][parseInt(num, 10)] = title;
        }
    }
    walk(KL4_DIR);
    return index;
}

const kl4Index = buildKL4Index();

/** 找所有 manifest 並檢查是否可從 KL4 補齊 */
const tasks = [];
function walkManifests(dir) {
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
        const full = path.join(dir, entry.name);
        if (entry.isDirectory()) { walkManifests(full); continue; }
        if (!entry.name.endsWith('manifest.json')) continue;
        const data = JSON.parse(fs.readFileSync(full, 'utf8'));
        if (!Array.isArray(data.items) || data.items.length === 0) continue;
        const gs = `${data.grade}${data.semester}`;
        const key = `${data.grade} ${data.subject} ${data.semester}`;
        if (targetArg && targetArg !== key) continue;
        const lessonMap = kl4Index[data.subject]?.[gs]?.[data.publisher];
        if (!lessonMap) continue;
        // 檢查多少 item 是 placeholder + KL4 有對應
        const patches = [];
        for (const [i, it] of data.items.entries()) {
            if (!/^L\d+$/.test(it.title || '')) continue; // 只補佔位符
            const num = parseInt((it.id || '').replace(/^L/i, ''), 10);
            const realTitle = lessonMap[num];
            if (!realTitle) continue;
            patches.push({ index: i, id: it.id, old: it.title, new: realTitle, lessonFile: it.file });
        }
        if (patches.length > 0) {
            tasks.push({ manifestPath: full, data, patches, combo: key });
        }
    }
}
walkManifests(PLATFORM_DIR);

console.log(`=== JOB-205 Phase 3a/3b: KL4 → question/platform 同步 ===`);
console.log(`模式: ${dryRun ? '🔍 DRY-RUN (不寫入)' : '💾 WRITE'}`);
console.log(`找到 ${tasks.length} 個 manifest 可從 KL4 補 title\n`);

let totalPatches = 0;
let lessonFilesUpdated = 0;
for (const t of tasks) {
    console.log(`[${t.combo}] ${path.relative(ROOT, t.manifestPath)}`);
    for (const p of t.patches) {
        console.log(`  L${p.id.replace(/^L/i, '')}: "${p.old}" → "${p.new}"`);
    }
    totalPatches += t.patches.length;

    if (dryRun) continue;

    // 1) 更新 manifest.items[].title
    const mData = t.data;
    for (const p of t.patches) {
        mData.items[p.index].title = p.new;
        // theme 若為空也填（KL4 檔名沒有 theme，保持原樣，不瞎編）
    }
    fs.writeFileSync(t.manifestPath, JSON.stringify(mData, null, 2) + '\n', 'utf8');

    // 2) 更新對應 lesson JSON 的 meta.title
    const dir = path.dirname(t.manifestPath);
    for (const p of t.patches) {
        const lessonPath = path.join(dir, p.lessonFile);
        if (!fs.existsSync(lessonPath)) continue;
        const lData = JSON.parse(fs.readFileSync(lessonPath, 'utf8'));
        lData.meta ??= {};
        if (!lData.meta.title || /^L\d+$/.test(lData.meta.title)) {
            lData.meta.title = p.new;
            fs.writeFileSync(lessonPath, JSON.stringify(lData, null, 2) + '\n', 'utf8');
            lessonFilesUpdated++;
        }
    }
}

console.log(`\n=== 結果 ===`);
console.log(`處理 manifest: ${tasks.length}`);
console.log(`修補 title 數: ${totalPatches}`);
if (!dryRun) console.log(`同步 lesson JSON: ${lessonFilesUpdated}`);
console.log(dryRun ? '\n（dry-run 結束，未寫入。移除 --dry-run 執行實際寫入）' : '\n✅ 寫入完成');
