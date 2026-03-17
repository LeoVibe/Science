const fs = require('fs');
const path = require('path');

const JOBS_DIR = path.join(__dirname, '../jobs');
const BOARD_FILE = path.join(JOBS_DIR, '任務看板與派工.md');
const TEMPLATE_FILE = path.join(JOBS_DIR, '_JOB-TEMPLATE.md');

function getNextJobNumber() {
    const files = fs.readdirSync(JOBS_DIR);
    let maxNum = 0;
    const jobRegex = /^JOB-AG-00.*\.md$|^JOB-(\d+)-.*\.md$/; // 處理 JOB-XXX- 格式
    
    for (const file of files) {
        const match = file.match(jobRegex);
        if (match && match[1]) {
            const num = parseInt(match[1], 10);
            if (num > maxNum) {
                maxNum = num;
            }
        }
    }
    return maxNum + 1;
}

function createJob(title, prefix = 'USER') {
    if (!title) {
        console.error("❌ 錯誤: 請提供任務標題。用法: node job_manager.js create \"任務標題\" [USER|AG|DEV]");
        process.exit(1);
    }
    
    // 限制 prefix
    const validPrefixes = ['USER', 'AG', 'DEV'];
    if (!validPrefixes.includes(prefix)) {
        console.error(`❌ 錯誤: 無效的創立者字首 '${prefix}'。允許值為: ${validPrefixes.join(', ')}`);
        process.exit(1);
    }

    const nextNum = getNextJobNumber();
    const formattedNum = String(nextNum).padStart(3, '0');
    // 把名稱轉為連字號格式，去除特殊字元
    const safeTitle = title.replace(/[^a-zA-Z0-9\u4e00-\u9fa5]+/g, '-').replace(/^-+|-+$/g, '');
    const jobId = `JOB-${formattedNum}`;
    const filename = `${jobId}-${prefix}-${safeTitle}.md`;
    const filepath = path.join(JOBS_DIR, filename);

    const now = new Date();
    // 台北時間處理格式化，或簡單取 ISO 前綴
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

    // 若有準備好的模板檔案就讀取模板
    if (fs.existsSync(TEMPLATE_FILE)) {
         let tpl = fs.readFileSync(TEMPLATE_FILE, 'utf8');
         tpl = tpl.replace('{JOB_NAME}', filename.replace('.md', ''));
         tpl = tpl.replace('{AUTHOR}', prefix);
         tpl = tpl.replace('{DATE}', timeString);
         tpl = tpl.replace(/{JOB_ID}/g, jobId);
         templateContent = tpl;
    }

    fs.writeFileSync(filepath, templateContent, 'utf8');
    console.log(`✅ 成功建立任務單: ${filename}`);

    // ----- 更新看板 -----
    if (fs.existsSync(BOARD_FILE)) {
        let boardContent = fs.readFileSync(BOARD_FILE, 'utf8');
        const newRow = `| \`${jobId}\` | [${title}](./${filename}) | 中 | 🔵 執行中 | ${dateString} |`;
        
        // 尋找「執行中與待處理任務 (Pending Jobs)」區段的表格末尾插入
        const pendingSectionRegex = /(### 執行中與待處理任務 *\(Pending Jobs\)[\s\S]*?\|:---\|:---\|:---\|:---\|:---\|\n)([\s\S]*?)(\n---|\n##|$)/;
        
        const match = boardContent.match(pendingSectionRegex);
        if (match) {
            const tableHeader = match[1];
            const tableRows = match[2];
            const endPart = match[3];
            
            // 將新任務加在表格最下面
            const updatedRows = (tableRows.trim() ? tableRows.trimEnd() + '\n' : '') + newRow + '\n';
            boardContent = boardContent.replace(pendingSectionRegex, tableHeader + updatedRows + endPart);
            
            fs.writeFileSync(BOARD_FILE, boardContent, 'utf8');
            console.log(`✅ 成功發布任務至看板: ${jobId}`);
        } else {
            console.warn(`⚠️ 警告: 找不到看板的 Pending Jobs 區段，無法自動寫入表格。請手動添加:\n${newRow}`);
        }
    } else {
        console.warn(`⚠️ 警告: 找不到看板檔案 ${BOARD_FILE}，無法更新列表。`);
    }
}

function closeJob(jobId) {
    if (!jobId || !jobId.match(/^JOB-\d{3,}/)) {
        console.error("❌ 錯誤: 請提供正確的任務編號 (例如: JOB-057)。");
        process.exit(1);
    }

    // 檢查 Report 是否存在
    const reportFilename = `${jobId}-Report.md`;
    const reportFilepath = path.join(JOBS_DIR, reportFilename);
    const legacyReportPath = path.join(JOBS_DIR, `${jobId}-USER-Report.md`); // 考慮一些舊命名習慣
    const integratedReportPattern = new RegExp(`${jobId}.*Report\\.md$`, 'i');

    const dirFiles = fs.readdirSync(JOBS_DIR);
    // 尋找符合條件的 Report 檔案全名
    const reportFullFilename = dirFiles.find(f => f === reportFilename || f.match(integratedReportPattern));

    if (!reportFullFilename) {
        console.error(`🚨 [物理阻擋] 拒絕結案：找不到完工報告 (要求檔名: ${reportFilename} 或包含字眼之聯合報告)`);
        console.error(`👉 請先撰寫完報告，並將其放入 jobs/ 目錄後，再次執行 close 指令。`);
        process.exit(1);
    }

    // [新增] Sync-Job Interlock 防呆聯動機制
    // 剖開 Report 檢查有沒有勾選 /dosync 沉澱知識
    const actualReportPath = path.join(JOBS_DIR, reportFullFilename);
    const reportContent = fs.readFileSync(actualReportPath, 'utf8');
    
    // 檢查是否有包含「[x] 已執行 /dosync」或「[x] ... /dosync」等打勾特徵
    const dosyncRegex = /\[[xX]\]\s*.*\/dosync/i;
    if (!dosyncRegex.test(reportContent)) {
        console.error(`🚨 [知識遺失阻擋 (Sync-Job Interlock)] 拒絕結案：您的報告內未確認執行 dosync`);
        console.error(`   👉 若您現在結案，您剛才修改的網站規格與解決的 Bugs 將永遠遺失在程式碼裡。`);
        console.error(`   👉 請先呼叫 '/dosync' 將全站規格與 task_history 同步沉澱。`);
        console.error(`   👉 完成後，請至 ${reportFullFilename} 的 DoD 區塊將 '[ ] 已執行 /dosync 全域知識沉澱' 打勾 [x]，再來執行結案。`);
        process.exit(1);
    }

    // 更新看板
    if (!fs.existsSync(BOARD_FILE)) {
        console.error(`❌ 錯誤: 找不到看板檔案 ${BOARD_FILE}。`);
        process.exit(1);
    }

    let boardContent = fs.readFileSync(BOARD_FILE, 'utf8');
    const now = new Date();
    const dateString = new Date(now.getTime() - (now.getTimezoneOffset() * 60000))
        .toISOString()
        .split('T')[0];

    // 尋找包含該 jobId 的行
    // 例如: | `JOB-057` | [測驗演算法](./JOB-057...) | 中 | 🔵 執行中 | 2026-03-08 |
    const rowRegex = new RegExp(`(\\|\\s*\`${jobId}\`\\s*\\|.*?\\|.*?\\|\\s*)(.*?)(\\s*\\|\\s*)(.*?)(\\s*\\|)`, "g");
    
    let updated = false;
    boardContent = boardContent.replace(rowRegex, (match, p1, p2, p3, p4, p5) => {
        updated = true;
        // 把 p2 (狀態) 換成 🟢 DONE，p4 (日期) 換成今天
        return `${p1}🟢 DONE${p3}${dateString}${p5}`;
    });

    if (updated) {
        fs.writeFileSync(BOARD_FILE, boardContent, 'utf8');
        console.log(`✅ [Job Manager] 任務 ${jobId} 已成功結案！`);
        console.log(`📝 已確認報告存在，並成功在看板上將狀態變更為 [🟢 DONE]，結算日期: ${dateString}。`);
    } else {
        console.warn(`⚠️ 警告: 報告檢查通過，但在看板中找不到 ${jobId} 這一行，無法自動更新狀態。它可能不在此看板追蹤，或格式不符。`);
    }
}

// 主程式入口
const args = process.argv.slice(2);
const command = args[0];

if (command === 'create') {
    const title = args[1];
    const prefix = args[2] || 'USER';
    createJob(title, prefix.toUpperCase());
} else if (command === 'close') {
    const jobId = args[1];
    closeJob(jobId);
} else {
    console.log(`
🛠️ Eidos 作業派發管理器 (Job Manager Safegaurd)

用法:
  1. 建立新任務單 (強制按序號發放，並寫入 Pending 區):
     node scripts/job_manager.js create "任務標題" [USER|AG|DEV]
     範例: node scripts/job_manager.js create "新增自然科測驗" USER

  2. 任務結案 (強制檢查 Report 存在，過關才將看板改 DONE):
     node scripts/job_manager.js close JOB-XXX
     範例: node scripts/job_manager.js close JOB-057

`);
}
