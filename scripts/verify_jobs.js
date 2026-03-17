const fs = require('fs');
const path = require('path');

const JOBS_DIR = path.join(__dirname, '../jobs');
const BOARD_FILE = path.join(JOBS_DIR, '任務看板與派工.md');

function verifyJobs() {
    console.log("=========================================");
    console.log("🔍 Eidos 任務巡房與糾察 (Job Verification)");
    console.log("=========================================\n");

    if (!fs.existsSync(BOARD_FILE)) {
        console.error(`❌ 錯誤: 找不到看板檔案 ${BOARD_FILE}`);
        process.exit(1);
    }

    const boardContent = fs.readFileSync(BOARD_FILE, 'utf8');
    const jobsFiles = fs.readdirSync(JOBS_DIR);
    
    // 解析看板內的表格
    const tableRowRegex = /\|\s*`(JOB-\d{3,}[^`]*)`\s*\|\s*\[([^\]]+)\]\(([^)]+)\)\s*\|\s*([^|]+)\|\s*([^|]+)\|\s*([^|]+)\|/g;
    let match;
    let errorCount = 0;
    let totalChecked = 0;

    while ((match = tableRowRegex.exec(boardContent)) !== null) {
        totalChecked++;
        const jobId = match[1];
        const jobTitle = match[2].trim();
        const jobLink = match[3].replace('./', '').trim(); // ex: JOB-057-USER-....md
        const status = match[5].trim(); // ex: 🔵 執行中, 🟢 DONE
        
        const isDone = status.includes('DONE');

        // 1. 檢查派工單本體是否存在
        if (!jobsFiles.includes(jobLink)) {
            console.error(`❌ [空殼任務] 發現看板有 ${jobId}，但實體檔案不存在: ${jobLink}`);
            errorCount++;
            continue; // 本體就不在了，不用繼續檢查報告
        }

        // 2. 如果狀態是 DONE，檢查是否有完工報告 (Report)
        if (isDone) {
            const basicReportName = `${jobId}-Report.md`;
            const hasReport = jobsFiles.some(f => f === basicReportName || new RegExp(`${jobId}.*Report\\.md$`, 'i').test(f));
            
            if (!hasReport) {
                console.error(`🚨 [逃漏稅任務] 發現 ${jobId} (${jobTitle}) 在看板聲稱 DONE，但找不到任何對應的 Report 完工報告！`);
                errorCount++;
            }
        }
    }

    console.log(`\n✅ 巡邏結束。共檢查了 ${totalChecked} 筆記錄。`);
    if (errorCount > 0) {
        console.error(`⚠️ 發現 ${errorCount} 個違規或遺漏的問題。請處理以確保專案進度真偽！`);
        process.exit(1);
    } else {
        console.log(`🎉 完美！沒有發現幽靈任務與空殼結案。`);
    }
}

verifyJobs();
