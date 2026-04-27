// scripts/lib/llm_retry.js
// LLM API 呼叫的 retry 政策共用 helper
// spec: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md (§7.2)
// 設計：5xx 與 network error 走相同的指數退避（base 3 倍：1s/3s/9s）
//      上限到次數會 stdout 印 EXIT_5XX / EXIT_NETWORK 標準退出標記，回傳 fallback 值
'use strict';

const NETWORK_CODES = [
    'ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT',
    'EAI_AGAIN', 'ENETUNREACH', 'ECONNRESET',
    'UND_ERR_SOCKET'
];

function isNetworkError(err) {
    if (!err) return false;
    const code = err.cause && err.cause.code ? err.cause.code : err.code;
    if (NETWORK_CODES.includes(code)) return true;
    const msg = err.message || '';
    return NETWORK_CODES.some(c => msg.includes(c));
}

// 對單次 fetch+process 函式套上 5xx + network retry 政策。
// 由 caller 提供 fn — 它應該回傳 { kind: 'ok'|'5xx'|'success', status?, value? } 或 throw。
//   - kind=success → 成功，retry helper 直接回傳 fn 的 value
//   - kind=5xx → 觸發 5xx 退避重試
//   - throw → 若是 network error 就退避重試；否則 re-throw
//
// opts:
//   max5xx        5xx 最大重試次數 (default 3)
//   maxNet        network 最大重試次數 (default 3)
//   waitBaseMs    退避基底 (default 1000，每次 *3：1s/3s/9s)
//   labelPrefix   log 前綴 (default '[API]')
//   sleepFn       注入 sleep 函式（給測試用）
//   exitFn        注入 stdout exit code 寫入函式（給測試用，預設 process.stdout.write）
//   fallback      失敗 fallback 回傳值 (default [])
async function withLlmRetries(fn, opts = {}) {
    const max5xx = opts.max5xx ?? 3;
    const maxNet = opts.maxNet ?? 3;
    const waitBaseMs = opts.waitBaseMs ?? 1000;
    const label = opts.labelPrefix || '[API]';
    const sleep = opts.sleepFn || (ms => new Promise(r => setTimeout(r, ms)));
    const stdoutWrite = opts.exitFn || (s => process.stdout.write(s));
    const fallback = opts.fallback ?? [];

    let retry5xx = 0;
    let retryNet = 0;
    while (true) {
        try {
            const res = await fn({ retry5xx, retryNet });
            if (res && res.kind === '5xx') {
                if (retry5xx >= max5xx) {
                    console.error(`${label} 5xx 重試 ${max5xx} 次仍失敗（status=${res.status}）EXIT_5XX`);
                    stdoutWrite('EXIT_5XX\n');
                    return fallback;
                }
                const wait = Math.pow(3, retry5xx) * waitBaseMs;
                console.warn(`${label} 5xx (${res.status})，等 ${wait / 1000}s 後重試（第 ${retry5xx + 1}/${max5xx} 次）...`);
                await sleep(wait);
                retry5xx++;
                continue;
            }
            // success
            return res && res.value !== undefined ? res.value : res;
        } catch (err) {
            if (!isNetworkError(err)) throw err;
            const code = (err.cause && err.cause.code) || err.code || err.message;
            if (retryNet >= maxNet) {
                console.error(`${label} 網路錯誤重試 ${maxNet} 次仍失敗 (${code}) EXIT_NETWORK`);
                stdoutWrite('EXIT_NETWORK\n');
                return fallback;
            }
            const wait = Math.pow(3, retryNet) * waitBaseMs;
            console.warn(`${label} 網路錯誤 ${code}，等 ${wait / 1000}s 後重試（第 ${retryNet + 1}/${maxNet} 次）...`);
            await sleep(wait);
            retryNet++;
        }
    }
}

module.exports = { withLlmRetries, isNetworkError, NETWORK_CODES };
