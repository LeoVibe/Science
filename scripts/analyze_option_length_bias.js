const fs = require('fs');
const path = require('path');

function scanDirectory(dir) {
    let results = [];
    if (!fs.existsSync(dir)) return results;

    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);

        if (stat.isDirectory()) {
            results = results.concat(scanDirectory(fullPath));
        } else if (file.endsWith('.json') && !file.includes('manifest') && !file.includes('libraryStats')) {
            results.push(fullPath);
        }
    }
    return results;
}

function analyzeOptions(filePath) {
    try {
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        let questions = content.questions || (Array.isArray(content) ? content : (content.question ? [content] : []));

        if (questions.length === 0) return null;

        let totalValidQuestions = 0;
        let longestIsAnswerCount = 0;

        questions.forEach(q => {
            if (!q.options || q.options.length < 2) return;

            let ansIndex = q.answer_index;
            if (ansIndex === undefined && q.answer !== undefined) {
                // 有些舊格式或特例可能是 answer: 0
                ansIndex = q.answer;
            }

            if (ansIndex === undefined || ansIndex < 0 || ansIndex >= q.options.length) return;

            const lengths = q.options.map(opt => String(opt).length);
            const maxLength = Math.max(...lengths);

            // 檢查是不是唯一最長，或者是並列最長之一
            // 若正確答案的長度等於最大長度，而且不是所有選項都一樣長
            const isAllSameLength = lengths.every(l => l === lengths[0]);

            if (!isAllSameLength && lengths[ansIndex] === maxLength) {
                longestIsAnswerCount++;
            }
            totalValidQuestions++;
        });

        return {
            total: totalValidQuestions,
            longestIsAnswer: longestIsAnswerCount
        };
    } catch (e) {
        return null;
    }
}

function runAnalysis() {
    const targetDir = path.join(__process.cwd(), 'question/platform');
    const jsonFiles = scanDirectory(targetDir);

    // 只分析國語 (Chinese)
    const chineseFiles = jsonFiles.filter(f => f.includes('/Chinese/'));

    let totalQuestions = 0;
    let totalLongestIsAnswer = 0;

    console.log(`掃描到 ${chineseFiles.length} 份國語題庫檔案...`);

    chineseFiles.forEach(file => {
        const result = analyzeOptions(file);
        if (result) {
            totalQuestions += result.total;
            totalLongestIsAnswer += result.longestIsAnswer;
        }
    });

    console.log(`\n=== 📊 國語題庫選項長度偏差分析 ===`);
    console.log(`總題數: ${totalQuestions}`);
    console.log(`正確答案即為最長選項之題數: ${totalLongestIsAnswer}`);

    if (totalQuestions > 0) {
        const ratio = (totalLongestIsAnswer / totalQuestions) * 100;
        console.log(`偏差比例: ${ratio.toFixed(2)}%`);

        // 理想狀態下（長度與答案無關），最長選項大概有 25% 的機率是正確答案。
        // 如果遠高於 25% (例如 >40%)，代表學生可以靠盲猜長選項拿分。
        if (ratio > 40) {
            console.log(`\n⚠️ 警告: 有極高的比例證實「最長的最可能是答案」，這將大幅降低測驗信效度！`);
        } else {
            console.log(`\n✅ 正常: 選項長度分佈與答案之間無明顯關聯性。`);
        }
    }
}

// 相容不同執行目錄
global.__process = process;
runAnalysis();
