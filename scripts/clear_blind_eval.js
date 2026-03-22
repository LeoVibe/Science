const fs = require('fs');
const path = require('path');

function clearDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        if (fs.statSync(fullPath).isDirectory()) {
            clearDir(fullPath);
        } else if (file.endsWith('.json')) {
            try {
                const data = JSON.parse(fs.readFileSync(fullPath, 'utf8'));
                let modified = false;
                if (data.questions) {
                    data.questions.forEach(q => {
                        if (q.blind_evaluation !== undefined) {
                            delete q.blind_evaluation;
                            delete q.authoring_model;
                            delete q.verifying_model;
                            delete q.verifying_date;
                            delete q.cqi_score;
                            delete q.blind_eval_mismatch;
                            modified = true;
                        }
                    });
                }
                if (modified) {
                    fs.writeFileSync(fullPath, JSON.stringify(data, null, 2));
                    console.log(`[重設] ${file} 已清除盲測標記`);
                }
            } catch (e) {
                console.error(`Error processing ${fullPath}`, e);
            }
        }
    }
}

console.log('🧹 開始抹除 G3S2 國語盲測標記...');
clearDir(path.resolve(__dirname, '../question/platform/G3/Chinese/S2/KangHsuan'));
clearDir(path.resolve(__dirname, '../question/platform/G3/Chinese/S2/NanYi'));
clearDir(path.resolve(__dirname, '../question/platform/G3/Chinese/S2/HanLin'));
console.log('✅ 所有標記清除完畢！已準備好迎接 3.1 閃電戰。');
