const fs = require('fs');
const path = require('path');

const JOBS_DIR = path.join(__dirname, '../jobs');

/** 派工單：JOB- 開頭、非 Report、非模板 */
function isDispatchFile(name) {
    if (name.startsWith('_')) return false;
    if (!/^JOB-.+\.md$/i.test(name)) return false;
    if (/report/i.test(name)) return false;
    return true;
}

/** Report：檔名含 JOB-數字 且檔名含 Report */
function isReportFile(name) {
    if (name.startsWith('_')) return false;
    return /^JOB-\d{3,}.+\.md$/i.test(name) && /report/i.test(name);
}

/** Report 檔名 → 派工單前綴（例：JOB-017A-Report.md → JOB-017A） */
function reportStemFromFilename(name) {
    const m = name.match(/^(JOB-.+?)-Report.*\.md$/i);
    return m ? m[1] : null;
}

function verifyJobs() {
    console.log('=========================================');
    console.log('🔍 Eidos 任務稽核 (Job Verification)');
    console.log('=========================================\n');

    const jobsFiles = fs.readdirSync(JOBS_DIR);
    const dispatchFiles = jobsFiles.filter(isDispatchFile);
    const reportFiles = jobsFiles.filter(isReportFile);

    let errorCount = 0;

    for (const rf of reportFiles) {
        const stem = reportStemFromFilename(rf);
        if (!stem) continue;
        // 合併結案報告（多編號或 Integrated）不強制對應單一派工檔名
        if (/integrated/i.test(rf) || /^JOB-\d{3,}-\d{3,}/i.test(stem)) {
            console.warn(`⚠️ 略過合併／多編 Report 之派工對照：${rf}`);
            continue;
        }
        const hasDispatch = dispatchFiles.some((df) => df.startsWith(`${stem}-`));
        if (!hasDispatch) {
            console.error(`❌ [Report 無對應派工] ${rf}（預期存在 ${stem}-*.md 派工單）`);
            errorCount++;
        }
    }

    console.log(`派工單檔案：${dispatchFiles.length} 個；Report 檔案：${reportFiles.length} 個。`);
    if (errorCount > 0) {
        console.error(`\n⚠️ 發現 ${errorCount} 項問題。`);
        process.exit(1);
    }
    console.log('\n✅ 未發現 Report 與派工單明顯脫鉤。');
}

verifyJobs();
