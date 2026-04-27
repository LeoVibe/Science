const { parsePmReply } = require('../scripts/progress_parse_pm_reply.js');
const fs = require('fs');
const path = require('path');
const os = require('os');

function makeTsv(rows) {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), 'progress-test-'));
    const tsv = path.join(tmpDir, 'JOB-TEST-progress.tsv');
    const header = ['unit_id','commit','agent','subject','publisher','lesson','CQI-P','CQI-V','Match%','QL','status','desc','ts'].join('\t');
    fs.writeFileSync(tsv, header + '\n' + rows.map(r => r.join('\t')).join('\n') + '\n');
    return tsv;
}

let pass = 0, fail = 0;
function test(name, fn) {
    try { fn(); console.log('✅ ' + name); pass++; }
    catch (e) { console.log('❌ ' + name + ': ' + e.message); fail++; }
}

// Test 1
test('單一 pending_pm 回 1 → accept', () => {
    const tsv = makeTsv([
        ['Sci_HanLin_L1','abc','prod','Science','HanLin','L1','6.2','-','-','-','done','30題','2026-04-27T10:00'],
        ['Sci_HanLin_L3','def','verify','Science','HanLin','L3','6.0','3.0','78%','-','pending_pm','雙盲不一致 22%','2026-04-27T11:00'],
    ]);
    const msgs = [
        { id: '1', author: { bot: true }, content: '🚨 [JOB-211 卡點] Sci_HanLin_L3 ...' },
        { id: '2', author: { bot: false }, content: '1' }
    ];
    const result = parsePmReply({ messages: msgs, tsvPath: tsv, jobId: 'JOB-211' });
    if (result.action !== 'accept') throw new Error('expected accept got ' + result.action);
    if (result.unit_id !== 'Sci_HanLin_L3') throw new Error('unit_id wrong');
    if (result.msg_id !== '2') throw new Error('msg_id wrong');
});

test('1 QL3 即可 → accept + annotation', () => {
    const tsv = makeTsv([
        ['Sci_HanLin_L3','def','verify','Science','HanLin','L3','6.0','3.0','78%','-','pending_pm','雙盲不一致','2026-04-27T11:00'],
    ]);
    const msgs = [{ id: '2', author: { bot: false }, content: '1 QL3 即可' }];
    const result = parsePmReply({ messages: msgs, tsvPath: tsv, jobId: 'JOB-211' });
    if (result.action !== 'accept') throw new Error('expected accept');
    if (!result.annotation.includes('QL3')) throw new Error('annotation missing QL3: ' + result.annotation);
});

test('retry → retry action', () => {
    const tsv = makeTsv([
        ['Sci_HanLin_L3','def','verify','Science','HanLin','L3','6.0','3.0','78%','-','pending_pm','雙盲不一致','2026-04-27T11:00'],
    ]);
    const msgs = [{ id: '2', author: { bot: false }, content: 'retry' }];
    const result = parsePmReply({ messages: msgs, tsvPath: tsv, jobId: 'JOB-211' });
    if (result.action !== 'retry') throw new Error('expected retry');
});

test('好啦 → wait（沒 keyword）', () => {
    const tsv = makeTsv([
        ['Sci_HanLin_L3','def','verify','Science','HanLin','L3','6.0','3.0','78%','-','pending_pm','雙盲不一致','2026-04-27T11:00'],
    ]);
    const msgs = [{ id: '2', author: { bot: false }, content: '好啦' }];
    const result = parsePmReply({ messages: msgs, tsvPath: tsv, jobId: 'JOB-211' });
    if (result.action !== 'wait') throw new Error('expected wait got ' + result.action);
});

test('沒卡點 → wait', () => {
    const tsv = makeTsv([
        ['Sci_HanLin_L1','abc','prod','Science','HanLin','L1','6.2','-','-','-','done','30題','2026-04-27T10:00'],
    ]);
    const msgs = [{ id: '2', author: { bot: false }, content: '1' }];
    const result = parsePmReply({ messages: msgs, tsvPath: tsv, jobId: 'JOB-211' });
    if (result.action !== 'wait') throw new Error('expected wait');
});

test('多 pending + 沒 unit_id → wait', () => {
    const tsv = makeTsv([
        ['Sci_HanLin_L2','def','verify','Science','HanLin','L2','-','-','-','-','pending_pm','測試','2026-04-27T11:00'],
        ['Sci_HanLin_L3','ghi','verify','Science','HanLin','L3','-','-','-','-','pending_pm','測試','2026-04-27T11:00'],
    ]);
    const msgs = [{ id: '2', author: { bot: false }, content: '1' }];
    const result = parsePmReply({ messages: msgs, tsvPath: tsv, jobId: 'JOB-211' });
    if (result.action !== 'wait') throw new Error('expected wait');
    if (!result.reason || !result.reason.includes('unit_id')) throw new Error('expected reason about unit_id');
});

test('多 pending + 有 unit_id → 解析', () => {
    const tsv = makeTsv([
        ['Sci_HanLin_L2','def','verify','Science','HanLin','L2','-','-','-','-','pending_pm','測試','2026-04-27T11:00'],
        ['Sci_HanLin_L3','ghi','verify','Science','HanLin','L3','-','-','-','-','pending_pm','測試','2026-04-27T11:00'],
    ]);
    const msgs = [{ id: '2', author: { bot: false }, content: 'JOB-211 Sci_HanLin_L3 1' }];
    const result = parsePmReply({ messages: msgs, tsvPath: tsv, jobId: 'JOB-211' });
    if (result.action !== 'accept') throw new Error('expected accept');
    if (result.unit_id !== 'Sci_HanLin_L3') throw new Error('unit_id wrong');
});

test('只有 bot 訊息 → wait', () => {
    const tsv = makeTsv([
        ['Sci_HanLin_L3','def','verify','Science','HanLin','L3','-','-','-','-','pending_pm','測試','2026-04-27T11:00'],
    ]);
    const msgs = [{ id: '1', author: { bot: true }, content: '1' }];
    const result = parsePmReply({ messages: msgs, tsvPath: tsv, jobId: 'JOB-211' });
    if (result.action !== 'wait') throw new Error('expected wait');
});

test('PM 回 6 custom → custom action', () => {
    const tsv = makeTsv([
        ['Sci_HanLin_L3','def','verify','Science','HanLin','L3','-','-','-','-','pending_pm','測試','2026-04-27T11:00'],
    ]);
    const msgs = [{ id: '2', author: { bot: false }, content: '6 我有別的想法' }];
    const result = parsePmReply({ messages: msgs, tsvPath: tsv, jobId: 'JOB-211' });
    if (result.action !== 'custom') throw new Error('expected custom');
});

test('progress 同 unit 多筆，最新狀態為 done 不算 pending', () => {
    const tsv = makeTsv([
        ['Sci_HanLin_L3','def','verify','Science','HanLin','L3','-','-','-','-','pending_pm','卡點','2026-04-27T11:00'],
        ['Sci_HanLin_L3','xyz','pm','-','-','-','-','-','-','-','done','PM accept','2026-04-27T12:00'],
    ]);
    const msgs = [{ id: '2', author: { bot: false }, content: '1' }];
    const result = parsePmReply({ messages: msgs, tsvPath: tsv, jobId: 'JOB-211' });
    if (result.action !== 'wait') throw new Error('expected wait (該 unit 已 done) got ' + result.action);
});

console.log(`\n${pass}/${pass+fail} tests passed.`);
process.exit(fail > 0 ? 1 : 0);
