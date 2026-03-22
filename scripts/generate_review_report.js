const fs = require('fs');
const path = require('path');

// === 掃描 ❌ 待複查題目並產出 Markdown 報告 ===
const targetDirs = process.argv.slice(2);
if (targetDirs.length === 0) {
    console.error('用法: node scripts/generate_review_report.js <目錄1> [目錄2] ...');
    process.exit(1);
}

const report = [];
let totalMismatch = 0, totalPending = 0, totalDistractorSuccess = 0, totalQuestionIssue = 0;
const pendingItems = [], classifiedItems = [];

for (const targetPath of targetDirs) {
    const stat = fs.statSync(targetPath);
    const filePaths = [];
    if (stat.isDirectory()) {
        fs.readdirSync(targetPath).filter(f => f.endsWith('.json') && !f.includes('manifest'))
            .forEach(f => filePaths.push(path.join(targetPath, f)));
    } else if (targetPath.endsWith('.json')) {
        filePaths.push(targetPath);
    }

    for (const filePath of filePaths) {
        const json = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        if (!json.questions) continue;

        json.questions.forEach((q, i) => {
            if (!q.blind_eval_mismatch) return;
            totalMismatch++;
            const m = q.blind_eval_mismatch;
            const item = {
                file: path.basename(filePath),
                index: i + 1,
                question: q.question,
                options: q.options,
                correct: m.correct_answer,
                ai_selected: m.ai_selected,
                reasoning: m.ai_reasoning || '（未提供）',
                status: m.review_status || 'pending',
                cqi: q.cqi_score || '-',
                taxonomy: q.taxonomy || '-'
            };
            if (m.review_status === 'pending') { totalPending++; pendingItems.push(item); }
            else {
                classifiedItems.push(item);
                if (m.review_status === 'distractor_success') totalDistractorSuccess++;
                if (m.review_status === 'question_issue') totalQuestionIssue++;
            }
        });
    }
}

const total = pendingItems.length + classifiedItems.length;
const allQuestions = []; // 計算 Match Rate
for (const targetPath of targetDirs) {
    const stat = fs.statSync(targetPath);
    const fps = stat.isDirectory()
        ? fs.readdirSync(targetPath).filter(f => f.endsWith('.json') && !f.includes('manifest')).map(f => path.join(targetPath, f))
        : [targetPath];
    fps.forEach(fp => {
        const j = JSON.parse(fs.readFileSync(fp, 'utf8'));
        if (j.questions) allQuestions.push(...j.questions.filter(q => q.blind_evaluation));
    });
}
const totalEvaluated = allQuestions.length;
const matchCount = allQuestions.filter(q => !q.blind_eval_mismatch).length;
const matchRate = totalEvaluated > 0 ? ((matchCount / totalEvaluated) * 100).toFixed(1) : 0;

// 判斷觸發等級
let riskLevel = '', remediation = '';
if (matchRate >= 70) { riskLevel = '🟢 品質達標'; remediation = '可直接進入 7-D 結算。`question_issue` 類選擇性重寫即可。'; }
else if (matchRate >= 50) { riskLevel = '🟡 中度問題'; remediation = '優先對所有 `question_issue` 類執行 `rewrite_distractors.js`。'; }
else { riskLevel = '🔴 嚴重問題'; remediation = '整批題目建議重新出題，個別修正效率過低。'; }

const now = new Date().toISOString().slice(0, 16).replace('T', ' ');

// 產出報告
let md = `# 盲測後差異化複查報告
> 產出時間：${now}
> 範圍：${targetDirs.join(', ')}

## 📊 整體統計

| 指標 | 數值 |
|:---|:---|
| 總已驗證題數 | ${totalEvaluated} 題 |
| ✅ Match 題數 | ${matchCount} 題 |
| ❌ Mismatch 題數 | ${totalMismatch} 題 |
| **Match Rate** | **${matchRate}%** |
| 風險等級 | ${riskLevel} |
| 待分類 (pending) | ${totalPending} 題 |
| 誘答成功 (distractor_success) | ${totalDistractorSuccess} 題 |
| 題目有問題 (question_issue) | ${totalQuestionIssue} 題 |

## 💡 修正建議
${remediation}

---

## ⏳ 待人工分類 (review_status: "pending")

> 請對以下每一題決定分類，並手動修改 JSON 中的 \`review_status\` 欄位。
> 判斷規則：
> - **AI 的推理「聽起來合理但是錯的」** → \`distractor_success\`（誘答成功，保留）
> - **AI 的選項「確實有道理」或題目有歧義** → \`question_issue\`（需修正）

`;

if (pendingItems.length === 0) {
    md += `_（無待分類題目）_\n`;
} else {
    pendingItems.forEach((item, n) => {
        md += `\n### ❌ #${n + 1}｜${item.file} 第 ${item.index} 題 (${item.taxonomy}, CQI: ${item.cqi})\n`;
        md += `**題幹：** ${item.question}\n\n`;
        item.options.forEach((opt, i) => {
            const mark = i === item.correct ? '✔ ' : (i === item.ai_selected ? '✗ ' : '　 ');
            md += `- ${mark}選項 ${i}：${opt}\n`;
        });
        md += `\n**標準答案：** 選項 ${item.correct}　　**AI 選了：** 選項 ${item.ai_selected}\n`;
        md += `**AI 推理：** ${item.reasoning}\n\n`;
        md += `**分類決策：** [ ] distractor_success　[ ] question_issue\n\n---\n`;
    });
}

md += `\n## ✅ 已分類題目 (${classifiedItems.length} 題)\n`;
if (classifiedItems.length === 0) {
    md += `_（尚無已分類題目）_\n`;
} else {
    classifiedItems.forEach(item => {
        const emoji = item.status === 'distractor_success' ? '🏆' : '🔧';
        md += `- ${emoji} \`${item.file}\` 第 ${item.index} 題 → \`${item.status}\`：${item.question.slice(0, 40)}...\n`;
    });
}

const reportPath = path.resolve('docs/reports', `盲測複查報告_${now.replace(/[: ]/g, '-')}.md`);
fs.mkdirSync(path.dirname(reportPath), { recursive: true });
fs.writeFileSync(reportPath, md);
console.log(`\n✅ 複查報告已產出：${reportPath}`);
console.log(`📊 Match Rate: ${matchRate}% | 風險等級: ${riskLevel}`);
console.log(`⏳ 待分類: ${totalPending} 題 | 需修正: ${totalQuestionIssue} 題`);
