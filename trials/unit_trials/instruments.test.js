import { validateAndTransform } from '../../shared/instruments/eidos-parser.js';

/**
 * 簡易測試框架
 */
const test = (name, fn) => {
    try {
        fn();
        console.log(`✅ [PASS] ${name}`);
    } catch (err) {
        console.error(`❌ [FAIL] ${name}`);
        console.error(`   -> ${err.message}`);
        process.exit(1);
    }
};

const assertThrows = (fn, messagePattern) => {
    try {
        fn();
        throw new Error('預期應拋出錯誤但卻成功了');
    } catch (err) {
        if (messagePattern && !err.message.includes(messagePattern)) {
            throw new Error(`錯誤訊息不符合。預期: ${messagePattern}, 得到: ${err.message}`);
        }
    }
};

console.log('🧪 開始執行 Eidos Parser 核心邏輯測試...\n');

test('應正確驗證合法的題庫資料', () => {
    const validData = {
        meta: {
            grade: 'grade_3',
            subject: '自然',
            semester: 'semester_1',
            publisher: 'kang_hsuan',
            lesson: 'Sci1',
            title: '測試單元'
        },
        questions: [
            { id: '1', type: 'multiple_choice', question: '測試題目', answer: 'A', options: ['A', 'B'] }
        ]
    };

    const result = validateAndTransform(validData);
    if (result.meta.grade !== 'grade_3') throw new Error('結果 Meta 資料不正確');
});

test('當缺少 meta 欄位時應拋出錯誤', () => {
    const invalidData = {
        meta: { grade: 'grade_3' },
        questions: []
    };

    assertThrows(() => validateAndTransform(invalidData), 'Meta 遺失必填欄位');
});

test('當選擇題答案不在選項內時應拋出錯誤', () => {
    const invalidData = {
        meta: {
            grade: 'grade_3', subject: '自然', semester: 'semester_1', publisher: 'a', lesson: 'b', title: 'c'
        },
        questions: [
            { id: '1', type: 'multiple_choice', question: 'Q', options: ['A', 'B'], answer: 'C' }
        ]
    };

    assertThrows(() => validateAndTransform(invalidData), '答案 "C" 不在選項清單中');
});

console.log('\n🎉 所有核心邏輯測試通過！');
