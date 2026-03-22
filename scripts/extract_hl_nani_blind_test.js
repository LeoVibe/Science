const fs = require('fs');
const path = require('path');

const dirs = [
    'question/platform/G6/Chinese/S2/HanLin/',
    'question/platform/G6/Chinese/S2/NanYi/'
];

let blindTests = [];

dirs.forEach(dir => {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'manifest.json');
    files.forEach(file => {
        try {
            const content = fs.readFileSync(path.join(dir, file), 'utf8');
            const json = JSON.parse(content);
            if (json.questions) {
                json.questions.forEach((q, i) => {
                    blindTests.push({
                        dir: dir,
                        file: file,
                        qIndex: i,
                        question: q.question,
                        options: q.options
                    });
                });
            }
        } catch (e) {
            console.error(`Error reading ${file}:`, e.message);
        }
    });
});

fs.writeFileSync('.logs/hl_nani_blind_tests.json', JSON.stringify(blindTests, null, 2));
console.log(`Extracted ${blindTests.length} questions from HanLin and NanI.`);
