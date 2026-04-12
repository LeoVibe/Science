const fs = require('fs');
const path = require('path');

// 簡易斷詞與關鍵字萃取 (去除停用詞)
function extractKeywords(text) {
    if (!text) return [];
    const stopWords = ['的', '了', '與', '和', '或', '是', '在', '為', '不', '這', '那', '有', '就', '也', '而', '及', '對', '於', '以', '等'];
    const chars = text.replace(/[^\u4e00-\u9fa5]/g, '').split('');
    const words = [];
    for(let i=0; i<chars.length-1; i++) {
        const bigram = chars[i] + chars[i+1];
        if (!stopWords.includes(chars[i]) && !stopWords.includes(chars[i+1])) {
            words.push(bigram);
        }
    }
    chars.forEach(c => {
        if (!stopWords.includes(c)) words.push(c);
    });
    return [...new Set(words)];
}

function scanFile(filePath) {
    const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
    if (!data.meta || !data.questions) return;
    
    const themeText = `${data.meta.title || ''} ${data.meta.theme || ''}`;
    const themeKeywords = extractKeywords(themeText);
    
    if (themeKeywords.length === 0) {
        console.log(`⚠️ ${filePath}: 無法萃取主題關鍵字`);
        return;
    }

    let pollutedCount = 0;
    
    data.questions.forEach((q, idx) => {
        const qText = `${q.scenario || ''} ${q.question || ''}`;
        
        if (qText.replace(/[^\u4e00-\u9fa5]/g, '').length < 10) {
            console.log(`[QSIG 警告] 檔案: ${path.basename(filePath)} 第 ${idx+1} 題題幹過短: ${q.question}`);
            q.qsig_violation = true;
        }

        let overlap = 0;
        themeKeywords.forEach(kw => {
            if (qText.includes(kw)) overlap++;
        });
        
        const overlapRatio = overlap / themeKeywords.length;
        
        if (overlapRatio < 0.1 && overlap === 0) {
            pollutedCount++;
            q.topic_mismatch = true;
        } else {
            q.topic_mismatch = false;
        }
    });

    if (pollutedCount > 0) {
        console.log(`🔴 [污染偵測] 檔案: ${path.basename(filePath)}`);
        console.log(`   - 主題: ${themeText}`);
        console.log(`   - 污染題數/總題數: ${pollutedCount} / ${data.questions.length} (${((pollutedCount/data.questions.length)*100).toFixed(1)}%)`);
        fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    } else {
        console.log(`✅ [未見污染] 檔案: ${path.basename(filePath)}`);
        // 還要寫回 qsig_violation 標記
        const hasQsig = data.questions.some(q => q.qsig_violation);
        if (hasQsig) fs.writeFileSync(filePath, JSON.stringify(data, null, 2));
    }
}

function scanDirectory(dir) {
    const files = fs.readdirSync(dir);
    files.forEach(file => {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            scanDirectory(fullPath);
        } else if (file.endsWith('.json')) {
            scanFile(fullPath);
        }
    });
}

const targetDir = process.argv[2];
if (!targetDir) {
    console.log("Usage: node scan_tcg_pollution.js <target_directory_or_file>");
    process.exit(1);
}

if (fs.statSync(targetDir).isDirectory()) {
    scanDirectory(targetDir);
} else {
    scanFile(targetDir);
}
