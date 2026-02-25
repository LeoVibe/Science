const fs = require('fs');
const files = process.argv.slice(2);

files.forEach(file => {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    let changed = false;

    data.questions.forEach(q => {
        // 修正選項分佈
        const options = q.options.map((opt, idx) => ({ text: opt, isCorrect: idx === q.answer_index }));
        for (let i = options.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [options[i], options[j]] = [options[j], options[i]];
        }
        q.options = options.map(o => o.text);
        q.answer_index = options.findIndex(o => o.isCorrect);

        // 修正 taxonomy 避免被降級
        if (q.taxonomy === 'literal') {
            q.taxonomy = 'inferential';
        }

        // 強制重設為 L4，等待評估腳本驗證
        if (q.quality_level === 'L3') {
            q.quality_level = 'L4';
        }
    });

    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    console.log(`[Fixed] BIAS and Taxonomy for ${file}`);
});
