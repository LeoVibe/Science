/**
 * 派工配號與結案防呆。
 * 單號正則、分類與「下一號」多重驗證之權威說明：docs/README_任務派工準則.md 第三章 §3.4
 */
const fs = require('fs');
const path = require('path');

const JOBS_DIR = path.join(__dirname, '../jobs');
const BOARD_FILE = path.join(JOBS_DIR, '任務看板與派工.md');
const TEMPLATE_FILE = path.join(JOBS_DIR, '_JOB-TEMPLATE.md');

/** job_type → 對應模板檔名（未命中時 fallback 至通用模板） */
const JOB_TYPE_TEMPLATES = {
    question_prod:   '_JOB-TEMPLATE-question_prod.md',
    question_verify: '_JOB-TEMPLATE-question_verify.md',
    research:        '_JOB-TEMPLATE-research.md',
};

// ---------------------------------------------------------------------------
// 單號與檔名：正則（與準則 §2.4 同步，變更時請雙向更新）
// ---------------------------------------------------------------------------

/** 合規正式派工單（腳本 create 產物）：JOB-NNN-(USER|AG|DEV)-標題.md */
const RE_STRICT_DISPATCH = /^JOB-(\d{3})-(USER|AG|DEV)-.+\.md$/;

/** 計畫檔（佔用流水號，與正式派工分類）：JOB-NNN-PLAN-… .md */
const RE_PLAN = /^JOB-(\d{3})-PLAN-.+\.md$/;

/** 結案報告：JOB-NNN-Report… .md 或 JOB-NNN-…-Report… .md（相容舊長檔名） */
function isReportFilename(name) {
    return /^JOB-(\d{3})-Report.*\.md$/i.test(name) || /^JOB-(\d{3})-.+-Report.*\.md$/i.test(name);
}

/** 舊版特殊：JOB-AG-00… */
const RE_LEGACY_AG00 = /^JOB-AG-00.*\.md$/;

/**
 * 自檔名擷取「流水號」：JOB-{數字}- 之首段十進位數字（與歷史 getNextJobNumber 相容）
 */
const RE_ANY_SERIAL = /^JOB-(\d+)-/;

function listJobMarkdownFiles() {
    return fs.readdirSync(JOBS_DIR).filter((f) => f.endsWith('.md') && !f.startsWith('_'));
}

/**
 * 所有已被占用的流水號（聯集）：任一符合 RE_ANY_SERIAL 之 jobs/*.md（不含 _ 開頭模板）
 */
function collectOccupiedSerials(files) {
    const nums = new Set();
    for (const f of files) {
        if (RE_LEGACY_AG00.test(f)) continue;
        const m = f.match(RE_ANY_SERIAL);
        if (m) nums.add(parseInt(m[1], 10));
    }
    return nums;
}

function maxSerialOrZero(occupied) {
    if (!occupied.size) return 0;
    return Math.max(...occupied);
}

/**
 * 將檔案分類並擷取單號，供稽核列印與衝突偵測
 */
function analyzeSerials(files) {
    const strict = [];
    const plan = [];
    const report = [];
    const legacyDispatch = [];

    for (const f of files) {
        if (RE_LEGACY_AG00.test(f)) continue;

        let m = f.match(RE_STRICT_DISPATCH);
        if (m) {
            strict.push({ file: f, n: parseInt(m[1], 10), prefix: m[2] });
            continue;
        }
        m = f.match(RE_PLAN);
        if (m) {
            plan.push({ file: f, n: parseInt(m[1], 10) });
            continue;
        }
        if (isReportFilename(f)) {
            const sm = f.match(/^JOB-(\d{3})/);
            if (sm) report.push({ file: f, n: parseInt(sm[1], 10) });
            continue;
        }
        m = f.match(RE_ANY_SERIAL);
        if (m) {
            legacyDispatch.push({ file: f, n: parseInt(m[1], 10) });
        }
    }

    return { strict, plan, report, legacyDispatch };
}

/** 同一單號下是否有多份「合規正式派工」（不應發生） */
function findDuplicateStrictDispatches(strictRows) {
    const byN = new Map();
    for (const row of strictRows) {
        if (!byN.has(row.n)) byN.set(row.n, []);
        byN.get(row.n).push(row.file);
    }
    return [...byN.entries()].filter(([, arr]) => arr.length > 1);
}

/**
 * 計算下一張派工單建議編號：max(已占用聯集) + 1
 */
function computeNextSerial(files) {
    const occupied = collectOccupiedSerials(files);
    return maxSerialOrZero(occupied) + 1;
}

/**
 * 列印稽核並回傳 { next, maxUsed, dupStrict, hasDupStrict }
 * @param {{ exitOnDupStrict?: boolean }} opts
 */
function runSerialAudit(opts = {}) {
    const { exitOnDupStrict = false } = opts;
    const files = listJobMarkdownFiles();
    const analysis = analyzeSerials(files);
    const dupStrict = findDuplicateStrictDispatches(analysis.strict);
    const occupied = collectOccupiedSerials(files);
    const maxUsed = maxSerialOrZero(occupied);
    const next = computeNextSerial(files);

    console.log('=== JOB 流水號稽核（多重條件） ===\n');

    console.log('【條件 A】合規正式派工（正則：/^JOB-(\\\\d{3})-(USER|AG|DEV)-.+\\\\.md$/）');
    const strictNums = [...new Set(analysis.strict.map((x) => x.n))].sort((a, b) => a - b);
    console.log(`    檔案數：${analysis.strict.length}；涵蓋單號：${strictNums.join(', ') || '（無）'}\n`);

    console.log('【條件 B】計畫檔 PLAN（正則：/^JOB-(\\\\d{3})-PLAN-.+\\\\.md$/）');
    const planNums = [...new Set(analysis.plan.map((x) => x.n))].sort((a, b) => a - b);
    console.log(`    檔案數：${analysis.plan.length}；涵蓋單號：${planNums.join(', ') || '（無）'}\n`);

    console.log('【條件 C】結案 Report（JOB-NNN-Report… 或 JOB-NNN-…-Report…）');
    const reportNums = [...new Set(analysis.report.map((x) => x.n))].sort((a, b) => a - b);
    console.log(`    檔案數：${analysis.report.length}；涵蓋單號：${reportNums.join(', ') || '（無）'}\n`);

    console.log('【條件 D】待收斂舊式檔名（已帶 JOB-NNN- 但非 USER/AG/DEV/PLAN 且非 Report）');
    console.log(`    檔案數：${analysis.legacyDispatch.length}（**新開立禁止**再用此型態；漸進改為條件 A）\n`);

    console.log('【條件 E】已占用單號聯集（正則：/^JOB-(\\\\d+)-/ 首段數字，不含 JOB-AG-00…）');
    console.log(`    目前最大已用單號：${maxUsed || '（無）'}`);
    const formatted = String(next).padStart(3, '0');
    console.log(`    建議下一張派工單號：JOB-${formatted}\n`);

    if (dupStrict.length > 0) {
        console.error('❌【驗證失敗】同一單號存在多份「合規正式派工」：');
        dupStrict.forEach(([n, arr]) => {
            console.error(`   JOB-${String(n).padStart(3, '0')}: ${arr.join(' | ')}`);
        });
        if (exitOnDupStrict) {
            process.exit(1);
        }
    } else {
        console.log('✅【驗證】合規正式派工單號無重複。');
    }

    const crossCheck = next === maxUsed + 1 || (maxUsed === 0 && next === 1);
    if (!crossCheck) {
        console.error('❌【驗算異常】next !== maxUsed+1，請檢查腳本邏輯。');
        if (exitOnDupStrict) process.exit(1);
    } else {
        console.log('✅【驗算】next = max(占用聯集) + 1。');
    }

    return { next, maxUsed, dupStrict, hasDupStrict: dupStrict.length > 0, analysis };
}

function getNextJobNumber() {
    const files = listJobMarkdownFiles();
    return computeNextSerial(files);
}

function createJob(title, prefix = 'USER', jobType = '') {
    if (!title) {
        console.error("❌ 錯誤: 請提供任務標題。用法: node job_manager.js create \"任務標題\" [USER|AG|DEV]");
        process.exit(1);
    }

    const validPrefixes = ['USER', 'AG', 'DEV'];
    if (!validPrefixes.includes(prefix)) {
        console.error(`❌ 錯誤: 無效的創立者字首 '${prefix}'。允許值為: ${validPrefixes.join(', ')}`);
        process.exit(1);
    }

    console.log('\n── create 前強制稽核 ──\n');
    const audit = runSerialAudit({ exitOnDupStrict: true });
    const nextNum = audit.next;

    const formattedNum = String(nextNum).padStart(3, '0');
    const safeTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
    const jobId = `JOB-${formattedNum}`;
    const filename = `${jobId}-${prefix}-${safeTitle}.md`;
    const filepath = path.join(JOBS_DIR, filename);

    if (!RE_STRICT_DISPATCH.test(filename)) {
        console.error('❌【內部錯誤】產出檔名未通過合規正式派工正則，已中止。');
        process.exit(1);
    }

    const now = new Date();
    const dateString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
        .toISOString()
        .split('T')[0];
    const timeString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
        .toISOString()
        .replace('T', ' ')
        .substring(0, 16);

    let templateContent = `*Created by ${prefix} at ${timeString}*

# ${filename.replace('.md', '')}

## 📌 任務背景
<!-- 為什麼要做、解決什麼問題 -->

## 📖 任務詳情
<!-- 具體步驟、影響檔案路徑 -->

## 🗂️ 關鍵參考
<!-- 開發前必須閱讀的檔案清單 -->

## ✅ 驗收標準 (DoD)
- [ ] 任務程式碼實作完成
- [ ] 通過對應品質與單元測試
- [ ] 產出完工報告 \`${jobId}-Report.md\`
`;

    // job_type 對應模板：優先使用分類模板，未命中則 fallback 至通用模板
    const typedTemplateName = JOB_TYPE_TEMPLATES[jobType] || null;
    const typedTemplatePath = typedTemplateName ? path.join(JOBS_DIR, typedTemplateName) : null;
    const chosenTemplatePath =
        (typedTemplatePath && fs.existsSync(typedTemplatePath)) ? typedTemplatePath :
        fs.existsSync(TEMPLATE_FILE) ? TEMPLATE_FILE : null;

    if (chosenTemplatePath) {
        let tpl = fs.readFileSync(chosenTemplatePath, 'utf8');
        tpl = tpl.replace('{JOB_NAME}', filename.replace('.md', ''));
        tpl = tpl.replace('{AUTHOR}', prefix);
        tpl = tpl.replace('{DATE}', timeString);
        tpl = tpl.replace(/{JOB_ID}/g, jobId);
        templateContent = tpl;
        const usedTemplate = path.basename(chosenTemplatePath);
        console.log(`📋 使用模板：${usedTemplate}${jobType ? ` (job_type=${jobType})` : ' (通用)'}`);
    }

    fs.writeFileSync(filepath, templateContent, 'utf8');
    console.log(`\n✅ 成功建立任務單: ${filename}（已通過合規檔名正則）`);

    if (fs.existsSync(BOARD_FILE)) {
        let boardContent = fs.readFileSync(BOARD_FILE, 'utf8');
        const newRow = `| \`${jobId}\` | [${title}](./${filename}) | 中 | 🔵 執行中 | ${dateString} |`;

        const pendingSectionRegex = /(### 執行中與待處理任務 *\(Pending Jobs\)[\s\S]*?\|:---\|:---\|:---\|:---\|:---\|\n)([\s\S]*?)(\n---|\n##|$)/;

        const match = boardContent.match(pendingSectionRegex);
        if (match) {
            const tableHeader = match[1];
            const tableRows = match[2];
            const endPart = match[3];

            const updatedRows = (tableRows.trim() ? tableRows.trimEnd() + '\n' : '') + newRow + '\n';
            boardContent = boardContent.replace(pendingSectionRegex, tableHeader + updatedRows + endPart);

            fs.writeFileSync(BOARD_FILE, boardContent, 'utf8');
            console.log(`✅ 成功發布任務至看板: ${jobId}`);
        } else {
            console.warn(`⚠️ 警告: 找不到看板的 Pending Jobs 區段，無法自動寫入表格。請手動添加:\n${newRow}`);
        }
    } else {
        console.log(`   未偵測 ${BOARD_FILE}，已略過看板更新（看板已廢止，進度以派工單與 Report 為準）。`);
    }
}

function closeJob(jobId) {
    if (!jobId || !jobId.match(/^JOB-\d{3,}/)) {
        console.error("❌ 錯誤: 請提供正確的任務編號 (例如: JOB-057)。");
        process.exit(1);
    }

    const reportFilename = `${jobId}-Report.md`;
    const integratedReportPattern = new RegExp(`${jobId}.*Report\\.md$`, 'i');

    const dirFiles = fs.readdirSync(JOBS_DIR);
    const reportFullFilename = dirFiles.find((f) => f === reportFilename || f.match(integratedReportPattern));

    if (!reportFullFilename) {
        console.error(`🚨 [物理阻擋] 拒絕結案：找不到完工報告 (要求檔名: ${reportFilename} 或包含字眼之聯合報告)`);
        console.error(`👉 請先撰寫完報告，並將其放入 jobs/ 目錄後，再次執行 close 指令。`);
        process.exit(1);
    }

    const actualReportPath = path.join(JOBS_DIR, reportFullFilename);
    const reportContent = fs.readFileSync(actualReportPath, 'utf8');

    const dosyncRegex = /\[[xX]\]\s*.*\/(pj_sync|dosync)/i;
    if (!dosyncRegex.test(reportContent)) {
        console.error(`🚨 [知識遺失阻擋 (Sync-Job Interlock)] 拒絕結案：您的報告內未確認執行 pj_sync`);
        console.error(`   👉 若您現在結案，您剛才修改的網站規格與解決的 Bugs 將永遠遺失在程式碼裡。`);
        console.error(`   👉 請先呼叫 '/pj_sync' 將全站規格與 task_history 同步沉澱。`);
        console.error(`   👉 完成後，請至 ${reportFullFilename} 的 DoD 區塊將 '[ ] 已執行 /pj_sync 全域知識沉澱' 打勾 [x]，再來執行結案。`);
        process.exit(1);
    }

    if (!fs.existsSync(BOARD_FILE)) {
        console.log(`✅ [Job Manager] ${jobId} 結案條件已滿足（Report + /pj_sync 勾選）。`);
        console.log(`   未偵測 ${BOARD_FILE}，已略過看板更新（進度以派工單與 Report 為準，見 docs/README_任務派工準則.md）。`);
        return;
    }

    let boardContent = fs.readFileSync(BOARD_FILE, 'utf8');
    const now = new Date();
    const dateString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
        .toISOString()
        .split('T')[0];

    const rowRegex = new RegExp(`(\\|\\s*\`${jobId}\`\\s*\\|.*?\\|.*?\\|\\s*)(.*?)(\\s*\\|\\s*)(.*?)(\\s*\\|)`, "g");

    let updated = false;
    boardContent = boardContent.replace(rowRegex, (match, p1, p2, p3, p4, p5) => {
        updated = true;
        return `${p1}🟢 DONE${p3}${dateString}${p5}`;
    });

    if (updated) {
        fs.writeFileSync(BOARD_FILE, boardContent, 'utf8');
        console.log(`✅ [Job Manager] 任務 ${jobId} 已成功結案！`);
        console.log(`📝 已於看板將狀態更新為 [🟢 DONE]，結算日期: ${dateString}。`);
    } else {
        console.warn(`⚠️ 警告: 報告檢查通過，但看板中找不到 ${jobId} 列，未變更看板。`);
    }
}

const args = process.argv.slice(2);
const command = args[0];

if (command === 'next' || command === 'audit') {
    runSerialAudit({ exitOnDupStrict: true });
} else if (command === 'create') {
    const title = args[1];
    const prefix = args[2] || 'USER';
    const jobType = args[3] || '';
    createJob(title, prefix.toUpperCase(), jobType);
} else if (command === 'close') {
    const jobId = args[1];
    closeJob(jobId);
} else {
    console.log(`
🛠️ Eidos 作業派發管理器 (Job Manager)

用法:
  0. 稽核流水號與下一號建議（開單前務必執行）:
     node scripts/job_manager.js next

  1. 建立新任務單（通過合規檔名正則；create 前強制跑稽核）:
     node scripts/job_manager.js create "任務標題" [USER|AG|DEV] [job_type]
     job_type 可選值：question_prod / question_verify / research（未指定則用通用模板）

  2. 任務結案（檢查 Report + /pj_sync 勾選；若有舊看板檔則同步 DONE）:
     node scripts/job_manager.js close JOB-XXX

`);
}
