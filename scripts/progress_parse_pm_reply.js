// scripts/progress_parse_pm_reply.js
// 解析 PM 對 Discord DM 的回覆 → 決定 Agent 後續動作
// spec: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md (§6.3)
'use strict';

const fs = require('fs');

const KEYWORD_MAP = {
    '1': 'accept', 'accept': 'accept',
    '2': 'retry',  'retry':  'retry',
    '3': 'skip',   'skip':   'skip',
    '4': 'pause',  'pause':  'pause',
    '5': 'abort',  'abort':  'abort',
    '6': 'custom', 'custom': 'custom',
};

function readPendingPmUnits(tsvPath) {
    if (!fs.existsSync(tsvPath)) return [];
    const lines = fs.readFileSync(tsvPath, 'utf8').trim().split('\n');
    if (lines.length < 2) return [];
    const seenLatest = new Map(); // unit_id → latest status
    for (let i = 1; i < lines.length; i++) {
        const cols = lines[i].split('\t');
        if (cols.length < 11) continue;
        const unit = cols[0];
        const status = cols[10].replace(/^\s+|\s+$/g, '');
        seenLatest.set(unit, status);
    }
    const result = [];
    for (const [unit, status] of seenLatest) {
        if (status === 'pending_pm') result.push(unit);
    }
    return result;
}

function parsePmReply({ messages, tsvPath, jobId }) {
    const pendingUnits = readPendingPmUnits(tsvPath);

    if (pendingUnits.length === 0) {
        return { action: 'wait', reason: 'no pending_pm units' };
    }

    // 過濾 bot 訊息、取最新非 bot 訊息（messages 預期由舊到新排序）
    const userMsgs = messages.filter(m => !(m.author && m.author.bot));
    if (userMsgs.length === 0) {
        return { action: 'wait', reason: 'no user message' };
    }
    const latest = userMsgs[userMsgs.length - 1];
    const firstLine = (latest.content || '').split('\n')[0].trim();
    // 切 token：空白 + 全形頓號/全形逗號/半形逗號（避開句號/減號以保 "1." "JOB-211"）
    const tokens = firstLine.split(/[\s、,，]+/).filter(Boolean);

    // 找 keyword（任意位置）；先剝前後標點（PM 在手機上常打 "1." "#1" "1)" "1、"）
    const stripPunct = s => s.replace(/^[#.)(、。，,]+|[.)、。，,]+$/g, '');
    let keyword = null;
    let keywordIdx = -1;
    for (let i = 0; i < tokens.length; i++) {
        const t = stripPunct(tokens[i].toLowerCase());
        if (KEYWORD_MAP[t]) {
            keyword = KEYWORD_MAP[t];
            keywordIdx = i;
            break;
        }
    }

    if (!keyword) {
        return { action: 'wait', reason: 'no keyword found' };
    }

    // 找 unit_id：直接比對進度檔的 pending 清單（避開 regex 對 publisher 命名的耦合）
    const unitFromMsg = tokens.find(t => pendingUnits.includes(t)) || null;

    let unit_id;
    if (pendingUnits.length === 1) {
        unit_id = pendingUnits[0];
    } else {
        if (!unitFromMsg) {
            return { action: 'wait', reason: 'multi-pending: unit_id required (candidates: ' + pendingUnits.join(',') + ')' };
        }
        unit_id = unitFromMsg;
    }

    // 註記：第一行除 keyword + unit_id + JOB-id 外的 token + 第二行起
    const annotationTokens = tokens.filter((t, i) => {
        if (i === keywordIdx) return false;
        if (t === unitFromMsg) return false;
        if (jobId && stripPunct(t.toUpperCase()) === jobId.toUpperCase()) return false;
        return true;
    });
    const restLines = (latest.content || '').split('\n').slice(1).join('\n').trim();
    const annotation = [annotationTokens.join(' ').trim(), restLines].filter(Boolean).join('\n').trim();

    return {
        action: keyword,
        unit_id,
        msg_id: latest.id,
        annotation,
    };
}

module.exports = { parsePmReply };

// CLI: node progress_parse_pm_reply.js --tsv <path> --job <id> --msgs-json <path>
if (require.main === module) {
    const args = process.argv.slice(2);
    let tsvPath, jobId, msgsJsonPath;
    for (let i = 0; i < args.length; i++) {
        if (args[i] === '--tsv') tsvPath = args[i+1];
        if (args[i] === '--job') jobId = args[i+1];
        if (args[i] === '--msgs-json') msgsJsonPath = args[i+1];
    }
    if (!tsvPath || !jobId || !msgsJsonPath) {
        console.error('Usage: --tsv <path> --job <id> --msgs-json <path>');
        process.exit(1);
    }
    const messages = JSON.parse(fs.readFileSync(msgsJsonPath, 'utf8'));
    const result = parsePmReply({ messages, tsvPath, jobId });
    console.log(JSON.stringify(result));
}
