const fs = require('fs');
const path = require('path');

const dir = 'question/platform/G6/Chinese/KangHsuan/';
const files = fs.readdirSync(dir).filter(f => f.endsWith('.json') && f !== 'manifest.json' && f !== 'L2_把愛傳下去.json');

let blindTests = [];

files.forEach(file => {
    try {
        const content = fs.readFileSync(path.join(dir, file), 'utf8');
        const json = JSON.parse(content);
        if (json.questions) {
            json.questions.forEach((q, i) => {
                blindTests.push({
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

fs.writeFileSync('.logs/blind_tests.json', JSON.stringify(blindTests, null, 2));
console.log(`Extracted ${blindTests.length} questions for blind evaluation.`);
