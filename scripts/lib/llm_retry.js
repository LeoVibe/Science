// scripts/lib/llm_retry.js
// LLM API 呼叫的 retry 共用 helper
// spec: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md (§7.1)
// 設計：5xx 與 network error 共用退避序列 1s/4s/9s（spec §7.1 對齊）；
//      失敗時 stdout 印 EXIT_5XX / EXIT_NETWORK 後 process.exit(2) 讓上游 Agent 識別。
//      lib 不負責政策（rotate key / per-call 或 per-process budget），由 caller 決定。
'use strict';

const NETWORK_CODES = [
    'ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT',
    'EAI_AGAIN', 'ENETUNREACH', 'ECONNRESET',
    'UND_ERR_SOCKET'
];

// 退避序列（spec §7.1）：第 0/1/2 次重試各等 1s/4s/9s；超過用最後一個值
const RETRY_BACKOFF_MS = [1000, 4000, 9000];
function backoffMs(retryCount) {
    if (retryCount < 0) return RETRY_BACKOFF_MS[0];
    return RETRY_BACKOFF_MS[Math.min(retryCount, RETRY_BACKOFF_MS.length - 1)];
}

function isNetworkError(err) {
    if (!err) return false;
    const code = err.cause && err.cause.code ? err.cause.code : err.code;
    if (NETWORK_CODES.includes(code)) return true;
    const msg = err.message || '';
    return NETWORK_CODES.some(c => msg.includes(c));
}

// 印 EXIT_marker 到 stdout 並 flush 後 process.exit(2)
// 確保下游 pipe 看到 marker（若為 pipe 模式 stdout 是 block-buffered）
async function exitWithMarker(marker, exitCode = 2) {
    return new Promise((resolve) => {
        process.stdout.write(marker + '\n', () => {
            // flush 完成後再退出
            process.exit(exitCode);
            resolve();
        });
    });
}

module.exports = { isNetworkError, NETWORK_CODES, RETRY_BACKOFF_MS, backoffMs, exitWithMarker };
