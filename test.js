const fs = require('fs');
const path = require('path');

const projectRoot = "/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject";

function checkResearchSupport(meta) {
    const { grade, semester, subject } = meta;
    const subjectMap = { 'Math': '數學', 'Chi': '國語', 'Sci': '自然', 'Soc': '社會', 'Eng': '英語' };
    const subjectCN = subjectMap[subject] || subject;

    const gradeMap = { 'G3': '三年級', 'G4': '四年級', 'G5': '五年級', 'G6': '六年級' };
    const semesterMap = { 'S1': '上學期', 'S2': '下學期' };
    const gradeCN = gradeMap[grade] || grade;
    const semesterCN = semesterMap[semester] || semester;
    const outlineFileNameCN = `${gradeCN}${semesterCN}_${subjectCN}_發展綱要.md`;
    const outlineFileNameEN = `${grade}_${semester}_${subjectCN}發展綱要.md`;

    let outlinePath = path.join(projectRoot, 'knowledge/課綱研究', subjectCN, outlineFileNameCN);
    console.log("Checking path 1:", outlinePath);
    if (!fs.existsSync(outlinePath)) {
        outlinePath = path.join(projectRoot, 'knowledge/課綱研究', subjectCN, outlineFileNameEN);
        console.log("Checking path 2:", outlinePath);
    }

    if (!fs.existsSync(outlinePath)) {
        return { ceiling: 'L1', reason: `發展綱要不存在: ${outlineFileNameCN} 或 ${outlineFileNameEN}` };
    }

    const content = fs.readFileSync(outlinePath, 'utf8');
    const hasCurriculumMatrix = content.includes('Curriculum Matrix') || content.includes('課程內容與發展矩陣');
    console.log("hasCurriculumMatrix:", hasCurriculumMatrix);

    const hasVerificationZone = content.includes('實證驗證區') || content.includes('考古題對照驗證');
    console.log("hasVerificationZone:", hasVerificationZone);

    const hasL4Strategy = content.includes('L4 轉化策略') || content.includes('L2 → L4') || content.includes('迷思概念圖譜');
    console.log("hasL4Strategy:", hasL4Strategy);

    if (!hasCurriculumMatrix) return { ceiling: 'L1', reason: '缺少 Curriculum Matrix' };
    if (!hasVerificationZone) return { ceiling: 'L2', reason: '缺少實證驗證區' };
    if (!hasL4Strategy) return { ceiling: 'L3', reason: '缺少 L4 轉化策略' };

    return { ceiling: 'L4', reason: 'OK' };
}

console.log(checkResearchSupport({ grade: 'G3', semester: 'S2', subject: 'Math', publisher: 'KangHsuan', lesson_id: 'L3' }));
