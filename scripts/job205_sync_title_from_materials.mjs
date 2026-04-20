#!/usr/bin/env node
/**
 * job205_sync_title_from_materials.mjs
 *
 * 從 knowledge/課綱研究/ 下的「原始研究素材庫」與「發展綱要」parse 出三版逐課 title，
 * 同步到 question/platform/.../manifest.items[].title 與對應 lesson.json:meta.title。
 *
 * 支援 5 種 pattern（詳見 docs/superpowers/specs/2026-04-20-placeholder-title-sync-design.md §素材庫 5 種 Pattern）：
 *   A 三 H3 各自表（G3 數/自/社）
 *   B 三版合併表（G4/G5 數）
 *   C 三 H3 各自表但用 L\d+（G6 數）
 *   D 三版合併矩陣，cell 內 **N. 單元名**<br/>（G6 自/社）
 *   E Unit 1-N 條列（英語，本 JOB 不用）
 *
 * 使用：
 *   node scripts/job205_sync_title_from_materials.mjs --dry-run         # 預覽全部
 *   node scripts/job205_sync_title_from_materials.mjs                   # 實寫
 *   node scripts/job205_sync_title_from_materials.mjs --audit-g5-math   # 回溯驗證 G5 Math 現值
 *
 * 不處理英語（使用者 2026-04-20 明示）。
 */
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ROOT = path.resolve(__dirname, '..');
const KL4_ROOT = path.join(ROOT, 'knowledge', '課綱研究');
const PLATFORM = path.join(ROOT, 'question', 'platform');

const args = new Set(process.argv.slice(2));
const dryRun = args.has('--dry-run');
const auditG5 = args.has('--audit-g5-math');

const PUB_ZH_TO_CODE = { 康軒: 'KANGHSUAN', 翰林: 'HANLIN', 南一: 'NANYI' };
const PUB_CODE_TO_DIR = { KANGHSUAN: 'KangHsuan', HANLIN: 'HanLin', NANYI: 'NanYi' };
const SUBJ_META = {
    數學: { code: 'MATH', dir: 'Math' },
    自然: { code: 'SCI', dir: 'Science' },
    社會: { code: 'SOC', dir: 'SocialStudies' },
};

// === Parser ===

function tryPatternAC(content) {
    const sections = {};
    for (const [zh, code] of Object.entries(PUB_ZH_TO_CODE)) {
        const re = new RegExp(`### [^\\n]*${zh}[^\\n]*\\n([\\s\\S]*?)(?=\\n### |\\n## |$)`);
        const m = content.match(re);
        if (!m) return null;
        const sec = m[1];
        const items = [...sec.matchAll(/^\|\s*(?:U|L)(\d+)\s*\|\s*([^|]+?)\s*\|/gm)];
        if (items.length === 0) return null;
        sections[code] = Object.fromEntries(
            items.map(x => [parseInt(x[1], 10), x[2].trim()])
        );
    }
    return sections;
}

function tryPatternB(content) {
    const lines = content.split('\n');
    const sections = { KANGHSUAN: {}, HANLIN: {}, NANYI: {} };
    let parsedAny = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        // 表頭含三版（允許 leading 欄位 e.g. 「| 單元 | 康軒版 | 翰林版 | 南一版 |」）
        if (
            line.startsWith('|') && /康軒/.test(line) && /翰林/.test(line) && /南一/.test(line)
        ) {
            for (let j = i + 2; j < lines.length; j++) {
                const m = lines[j].match(
                    /^\|\s*(?:U|L)(\d+)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|\s*([^|]+?)\s*\|/
                );
                if (!m) break;
                const num = parseInt(m[1], 10);
                sections.KANGHSUAN[num] = m[2].trim();
                sections.HANLIN[num] = m[3].trim();
                sections.NANYI[num] = m[4].trim();
                parsedAny = true;
            }
            if (parsedAny) break;
        }
    }
    return parsedAny ? sections : null;
}

function tryPatternD(content) {
    const lines = content.split('\n');
    const sections = { KANGHSUAN: {}, HANLIN: {}, NANYI: {} };
    let parsedAny = false;
    for (let i = 0; i < lines.length; i++) {
        const line = lines[i];
        if (
            line.startsWith('|') &&
            /核心(?:單元|主題)/.test(line) &&
            /康軒/.test(line) &&
            /翰林/.test(line) &&
            /南一/.test(line)
        ) {
            let lessonNum = 0;
            for (let j = i + 2; j < lines.length; j++) {
                const row = lines[j];
                if (!row.startsWith('|')) break;
                const cells = row.split('|').slice(1, -1).map(s => s.trim());
                if (cells.length < 4) continue;
                lessonNum++;
                const [, kCell, hCell, nCell] = cells;
                const pickFirstBold = cell => {
                    // 優先 `**1. 單元名**`，退而求其次 `**單元名**`
                    const m1 = cell.match(/\*\*\s*\d+\.\s*([^*<]+?)\s*\*\*/);
                    if (m1) return m1[1].trim();
                    const m2 = cell.match(/\*\*([^*<]+?)\*\*/);
                    return m2 ? m2[1].trim() : null;
                };
                const k = pickFirstBold(kCell);
                const h = pickFirstBold(hCell);
                const n = pickFirstBold(nCell);
                if (k) sections.KANGHSUAN[lessonNum] = k;
                if (h) sections.HANLIN[lessonNum] = h;
                if (n) sections.NANYI[lessonNum] = n;
                if (k || h || n) parsedAny = true;
            }
            if (parsedAny) break;
        }
    }
    return parsedAny ? sections : null;
}

function parseMaterials(filePath) {
    const content = fs.readFileSync(filePath, 'utf8');
    for (const [name, fn] of [['A/C', tryPatternAC], ['B', tryPatternB], ['D', tryPatternD]]) {
        const r = fn(content);
        if (r && Object.values(r).some(o => Object.keys(o).length > 0)) {
            return { pattern: name, sections: r };
        }
    }
    return { pattern: 'FAIL', sections: null };
}

// === Target list ===
// { grade, semester, subjZh } 需處理的組合
const TARGETS = [
    { grade: 'G3', sem: 'S2', subjZh: '數學' },
    { grade: 'G3', sem: 'S2', subjZh: '自然' },
    { grade: 'G3', sem: 'S2', subjZh: '社會' },
    { grade: 'G4', sem: 'S2', subjZh: '數學' },
    { grade: 'G6', sem: 'S2', subjZh: '數學' },
    { grade: 'G6', sem: 'S2', subjZh: '自然' },
    { grade: 'G6', sem: 'S2', subjZh: '社會' },
];

// === Main sync ===

const summary = { processed: 0, manifests: 0, patches: 0, lessonsUpdated: 0, conflicts: [] };

function syncOne({ grade, sem, subjZh }) {
    const subj = SUBJ_META[subjZh];
    const materialsPath = path.join(
        KL4_ROOT,
        subjZh,
        `${grade}_${sem}_${subjZh}_原始研究素材庫.md`
    );
    if (!fs.existsSync(materialsPath)) {
        console.log(`\n[${grade} ${subjZh} ${sem}] ⚠️ 素材庫不存在：${path.relative(ROOT, materialsPath)}`);
        return;
    }
    const { pattern, sections } = parseMaterials(materialsPath);
    if (!sections) {
        console.log(`\n[${grade} ${subjZh} ${sem}] ❌ parser 失敗於 ${path.relative(ROOT, materialsPath)}`);
        return;
    }
    console.log(`\n[${grade} ${subjZh} ${sem}] Pattern ${pattern} ✓`);
    for (const [pubCode, lessonMap] of Object.entries(sections)) {
        const pubDir = PUB_CODE_TO_DIR[pubCode];
        const manifestPath = path.join(
            PLATFORM,
            grade,
            subj.dir,
            sem,
            pubDir,
            `${grade}_${sem}_${subj.code}_${pubCode}_manifest.json`
        );
        if (!fs.existsSync(manifestPath)) {
            console.log(`  ⚠️ ${pubCode}: manifest 不存在`);
            continue;
        }
        const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        const patches = [];
        const conflicts = [];
        for (const [i, it] of (data.items || []).entries()) {
            const num = parseInt((it.id || '').replace(/^L/i, ''), 10);
            if (!num) continue;
            // 跳過 macOS/複製副本（檔名含 " 2.json"）避免處理髒資料
            if ((it.file || '').includes(' 2.json')) {
                console.log(`    🗑️  跳過副本：${it.id} file="${it.file}"`);
                continue;
            }
            const newTitle = lessonMap[num];
            if (!newTitle) continue; // 素材庫沒有該課 → 跳過
            const current = it.title;
            if (/^L\d+$/.test(current)) {
                // placeholder → 可補
                patches.push({ index: i, id: it.id, old: current, new: newTitle, lessonFile: it.file });
            } else if (current !== newTitle) {
                // 現值非 placeholder 但與素材庫不同 → 衝突
                conflicts.push({
                    manifest: path.relative(ROOT, manifestPath),
                    lesson: it.id,
                    current,
                    fromMaterials: newTitle,
                    policy: 'keep_current',
                });
            }
        }
        summary.manifests++;
        summary.patches += patches.length;
        summary.conflicts.push(...conflicts);

        if (patches.length === 0 && conflicts.length === 0) {
            console.log(`  ${pubCode}: 無可補（可能已全補）`);
            continue;
        }
        console.log(`  ${pubCode} → ${patches.length} 補 / ${conflicts.length} 衝突`);
        for (const p of patches) {
            console.log(`    ${p.id}: "${p.old}" → "${p.new}"`);
        }
        for (const c of conflicts) {
            console.log(`    ⚠️ CONFLICT ${c.lesson}: current="${c.current}" vs materials="${c.fromMaterials}"`);
        }

        if (dryRun) continue;

        // 寫入
        for (const p of patches) {
            data.items[p.index].title = p.new;
            // 同步 lesson.json meta.title
            const lessonPath = path.join(path.dirname(manifestPath), p.lessonFile);
            if (fs.existsSync(lessonPath)) {
                const ld = JSON.parse(fs.readFileSync(lessonPath, 'utf8'));
                ld.meta ??= {};
                if (!ld.meta.title || /^L\d+$/.test(ld.meta.title)) {
                    ld.meta.title = p.new;
                    fs.writeFileSync(lessonPath, JSON.stringify(ld, null, 2) + '\n', 'utf8');
                    summary.lessonsUpdated++;
                }
            }
        }
        fs.writeFileSync(manifestPath, JSON.stringify(data, null, 2) + '\n', 'utf8');
    }
    summary.processed++;
}

// === Audit: G5 Math 回溯 ===

function auditG5Math() {
    console.log('\n=== G5 Math 回溯驗證（KL4 vs 素材庫）===');
    const materialsPath = path.join(KL4_ROOT, '數學', 'G5_S2_數學_原始研究素材庫.md');
    const { sections } = parseMaterials(materialsPath);
    if (!sections) {
        console.log('  無法 parse G5 Math 素材庫');
        return;
    }
    for (const [pubCode, lessonMap] of Object.entries(sections)) {
        const pubDir = PUB_CODE_TO_DIR[pubCode];
        const manifestPath = path.join(
            PLATFORM, 'G5', 'Math', 'S2', pubDir, `G5_S2_MATH_${pubCode}_manifest.json`
        );
        if (!fs.existsSync(manifestPath)) continue;
        const data = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        for (const it of data.items || []) {
            const num = parseInt((it.id || '').replace(/^L/i, ''), 10);
            const matTitle = lessonMap[num];
            if (!matTitle) continue;
            if (it.title !== matTitle) {
                summary.conflicts.push({
                    manifest: path.relative(ROOT, manifestPath),
                    lesson: it.id,
                    current: it.title,
                    fromMaterials: matTitle,
                    policy: 'keep_current',
                    note: 'G5 Math 回溯：當前為 KL4 檔名版',
                });
                console.log(`  ⚠️ ${pubCode}/${it.id}: KL4="${it.title}" ≠ 素材庫="${matTitle}"`);
            }
        }
    }
}

// === 衝突清單寫入 ===

function emitConflictReport() {
    if (summary.conflicts.length === 0) return;
    const reportPath = path.join(ROOT, 'docs/question-audit/title-conflicts.md');
    const now = new Date().toISOString().slice(0, 19).replace('T', ' ');
    const lines = [
        '---',
        'name: Manifest title 多源衝突清單',
        'description: JOB-205 補登階段偵測到的 title 衝突（素材庫 vs 現有值）',
        'type: audit',
        '---',
        '',
        `\`last_updated\`: ${now}`,
        `\`來源 JOB\`: JOB-205 補登階段`,
        '',
        '# Manifest title 多源衝突清單',
        '',
        `共 **${summary.conflicts.length}** 筆衝突，由 \`scripts/job205_sync_title_from_materials.mjs\` 偵測。`,
        '',
        '| Manifest | Lesson | 現有值（來源）| 素材庫值 | 處置 | 備註 |',
        '|:--|:--:|:--|:--|:--|:--|',
    ];
    for (const c of summary.conflicts) {
        lines.push(
            `| ${c.manifest} | ${c.lesson} | "${c.current}" | "${c.fromMaterials}" | ${c.policy} | ${c.note || '—'} |`
        );
    }
    lines.push('');
    lines.push('## 處置策略說明');
    lines.push('');
    lines.push('- `keep_current`：當前 manifest 值來自 KL4 檔名或其他可信源，保留不動；素材庫待人工核對。');
    lines.push('- 若需改動：請人工裁決後手動更新 manifest + 素材庫，並從本清單移除對應列。');
    fs.writeFileSync(reportPath, lines.join('\n') + '\n', 'utf8');
    console.log(`\n📋 衝突清單寫入：${path.relative(ROOT, reportPath)}`);
}

// === Run ===

console.log('=== JOB-205 補登：從素材庫 parse title 同步到 manifest ===');
console.log(`模式：${dryRun ? '🔍 DRY-RUN' : '💾 WRITE'}`);

for (const t of TARGETS) syncOne(t);

if (auditG5) auditG5Math();

console.log('\n=== 結果 ===');
console.log(`處理組合：${summary.processed} / ${TARGETS.length}`);
console.log(`涉及 manifest：${summary.manifests}`);
console.log(`補 title：${summary.patches}`);
if (!dryRun) console.log(`同步 lesson JSON：${summary.lessonsUpdated}`);
console.log(`衝突數：${summary.conflicts.length}`);

if (!dryRun && summary.conflicts.length > 0) emitConflictReport();
if (dryRun && summary.conflicts.length > 0) {
    console.log('\n⚠️ dry-run 偵測到衝突，以下僅預覽（實寫時會 emit 到 docs/question-audit/title-conflicts.md）：');
    for (const c of summary.conflicts.slice(0, 10)) {
        console.log(`  ${c.manifest} / ${c.lesson}: "${c.current}" ≠ "${c.fromMaterials}"`);
    }
    if (summary.conflicts.length > 10) console.log(`  ...共 ${summary.conflicts.length} 筆`);
}
