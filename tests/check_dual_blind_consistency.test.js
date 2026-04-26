// tests/check_dual_blind_consistency.test.js
// 測試 scripts/check_dual_blind_consistency.js 對 5 種雙盲情境的分流結果。

const assert = require('assert');
const { analyzeDualBlind } = require('../scripts/check_dual_blind_consistency.js');
const sample = require('./fixtures/dual_blind_sample.json');

const result = analyzeDualBlind(sample);

// 1. 每題分類
const byId = Object.fromEntries(result.questions.map(q => [q.id, q]));

assert.strictEqual(byId.q1_dual_match.status, 'keep', 'q1 雙盲都 Match 應為 keep');
assert.strictEqual(byId.q1_dual_match.mtp_type, null);

assert.strictEqual(byId.q2_type_a_no_option_found.status, 'keep', 'TYPE-A 自動 resolved 應為 keep');
assert.strictEqual(byId.q2_type_a_no_option_found.mtp_type, 'A');

assert.strictEqual(byId.q3_type_b_original_wrong.status, 'discard', 'TYPE-B 退回 Production 應為 discard');
assert.strictEqual(byId.q3_type_b_original_wrong.mtp_type, 'B');

assert.strictEqual(byId.q4_type_c_disagree.status, 'manual_review', 'TYPE-C 兩模型不同推論應 manual_review');
assert.strictEqual(byId.q4_type_c_disagree.mtp_type, 'C');

assert.strictEqual(byId.q5_partial_one_match.status, 'manual_review', '一致性失敗（partial）應 manual_review');
assert.strictEqual(byId.q5_partial_one_match.mtp_type, null);
assert.strictEqual(byId.q5_partial_one_match.partial, true);

// 2. 課級統計
assert.strictEqual(result.summary.total, 5);
assert.strictEqual(result.summary.keep, 2);            // q1, q2
assert.strictEqual(result.summary.discard, 1);          // q3
assert.strictEqual(result.summary.manual_review, 2);    // q4, q5
assert.strictEqual(result.summary.partial, 1);          // q5
assert.strictEqual(result.summary.type_b_count, 1);     // q3
assert.strictEqual(result.summary.type_b_ratio, 0.2);   // 1/5
assert.strictEqual(result.summary.inconsistency_ratio, 0.2); // q5 / 5

// 3. 警告觸發
assert.strictEqual(result.summary.warnings.includes('TYPE-B > 5%'), true,
  'type_b_ratio = 20% 應觸發警告');
assert.strictEqual(result.summary.warnings.includes('inconsistency > 20%'), false,
  'inconsistency = 20% 不應觸發（門檻 > 20%）');

// 4. 建議寫入 tsv 的 status
assert.strictEqual(result.summary.suggested_tsv_status, 'manual_review',
  '有 TYPE-B 警告時建議課級 status = manual_review');

console.log('✅ All dual-blind consistency tests passed.');
