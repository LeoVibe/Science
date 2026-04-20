#!/usr/bin/env node
/**
 * job205_patch_eng_g3s2.mjs
 *
 * 從 knowledge/課綱研究/英語/三下_英語_發展綱要.md §三.1 提取的 G3 S2 英語各版課名，
 * 套用到 question/platform/G3/English/S2/{publisher}/ manifest + lesson JSON。
 *
 * 使用：node scripts/job205_patch_eng_g3s2.mjs [--dry-run]
 *
 * 資料來源：三下_英語_發展綱要.md 實證驗證區
 * 注意：英語發展綱要只有 G3 S2 有明確 Unit 課名清單；G4/G5 待後續從其他來源補齊。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const dryRun = process.argv.includes('--dry-run');

// 取自 knowledge/課綱研究/英語/三下_英語_發展綱要.md §三.1 實證驗證區
const ENG_G3_S2_TITLES = {
    KangHsuan: { 1: 'Can you swim?', 2: 'What are these?', 3: "Where's the cat?", 4: 'I like apples.' },
    HanLin:    { 1: 'Can you jump?', 2: 'Where is my cap?', 3: 'Are you happy?', 4: 'What time is it?' },
    NanYi:     { 1: 'How old are you?', 2: 'Can you sing?', 3: 'Is he a doctor?', 4: 'What time is it?' },
};

let totalPatches = 0;
let lessonUpdated = 0;

for (const [pub, titles] of Object.entries(ENG_G3_S2_TITLES)) {
    const dir = path.join(ROOT, 'question', 'platform', 'G3', 'English', 'S2', pub);
    const manifestPath = path.join(dir, `G3_S2_ENG_${pub.toUpperCase()}_manifest.json`);
    if (!fs.existsSync(manifestPath)) {
        console.log(`⚠️  ${pub}: manifest 不存在，跳過`);
        continue;
    }
    const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
    console.log(`\n[G3 ENG S2 ${pub}] ${path.relative(ROOT, manifestPath)}`);
    for (const [i, it] of (data.items || []).entries()) {
        const num = parseInt((it.id || '').replace(/^L/i, ''), 10);
        const realTitle = titles[num];
        if (!realTitle) continue;
        if (/^L\d+$/.test(it.title)) {
            console.log(`  L${num}: "${it.title}" → "${realTitle}"`);
            if (!dryRun) {
                data.items[i].title = realTitle;
                totalPatches++;
                // 同步 lesson JSON meta.title
                const lessonPath = path.join(dir, it.file);
                if (fs.existsSync(lessonPath)) {
                    const ld = JSON.parse(fs.readFileSync(lessonPath, 'utf8'));
                    ld.meta ??= {};
                    if (!ld.meta.title || /^L\d+$/.test(ld.meta.title)) {
                        ld.meta.title = realTitle;
                        fs.writeFileSync(lessonPath, JSON.stringify(ld, null, 2) + '\n', 'utf8');
                        lessonUpdated++;
                    }
                }
            } else {
                totalPatches++;
            }
        }
    }
    if (!dryRun) fs.writeFileSync(manifestPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
}

console.log(`\n=== 結果 ===`);
console.log(`補 title 數: ${totalPatches}`);
if (!dryRun) console.log(`同步 lesson JSON: ${lessonUpdated}`);
console.log(dryRun ? '（dry-run，未寫入）' : '✅ 寫入完成');
