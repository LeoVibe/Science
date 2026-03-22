const fs = require('fs');
const path = require('path');

// 讀取評核報告
const reportPath = path.join(process.cwd(), '.logs', 'evaluation_report.json');
if (!fs.existsSync(reportPath)) {
    console.error(`Error: Cannot find report file at ${reportPath}`);
    process.exit(1);
}
const report = JSON.parse(fs.readFileSync(reportPath, 'utf8'));
const details = report.details;

// 1. 更新 題庫統計表.md (範例：G3)
function updateSummaryDoc(grade) {
    const docPath = `question/platform/${grade}/題庫統計表.md`;
    if (!fs.existsSync(docPath)) return;

    let content = fs.readFileSync(docPath, 'utf8');
    const gradeDetails = details.filter(d => (d.meta.grade === grade || d.filePath.includes(`/${grade}/`)) && d.quality !== 'BROKEN');

    const totalQuestions = gradeDetails.reduce((sum, d) => sum + d.count, 0);
    const totalFiles = gradeDetails.length;

    // 更新標頭
    content = content.replace(/\*\*總題庫數量\*\*: \d+ 個 JSON 檔案/, `**總題庫數量**: ${totalFiles} 個 JSON 檔案`);
    content = content.replace(/\*\*最後更新\*\*: .*/, `**最後更新**: ${new Date().toLocaleString('zh-TW')} (自動評核更新)`);

    // 這裡可以加入更複雜的表格解析與替換邏輯，目前先做基礎更新
    fs.writeFileSync(docPath, content);
    console.log(`${docPath} updated.`);
}

['G3', 'G4', 'G5', 'G6'].forEach(updateSummaryDoc);
