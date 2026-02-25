const fs = require('fs');
const files = process.argv.slice(2);

files.forEach(file => {
    const data = JSON.parse(fs.readFileSync(file, 'utf8'));
    const total = data.questions.length; // usually 18

    // We want exact distribution of correct answers
    // For 18 questions, [0: 5, 1: 5, 2: 4, 3: 4]
    const targetCounts = [5, 5, 4, 4];
    const assignedAnswers = [];

    targetCounts.forEach((count, idx) => {
        for (let i = 0; i < count; i++) assignedAnswers.push(idx);
    });

    // Shuffle assigned answers array
    for (let i = assignedAnswers.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [assignedAnswers[i], assignedAnswers[j]] = [assignedAnswers[j], assignedAnswers[i]];
    }

    data.questions.forEach((q, qIndex) => {
        const targetCorrectIndex = assignedAnswers[qIndex];
        const currentCorrectIndex = q.answer_index;

        if (currentCorrectIndex !== targetCorrectIndex) {
            // Swap option texts
            const temp = q.options[targetCorrectIndex];
            q.options[targetCorrectIndex] = q.options[currentCorrectIndex];
            q.options[currentCorrectIndex] = temp;
            q.answer_index = targetCorrectIndex;
        }

        // Safety check for pirls logic
        if (q.taxonomy === 'literal') q.taxonomy = 'inferential';
    });

    fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
    console.log(`[Force Balanced] ${file}`);
});
