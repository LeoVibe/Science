const { isNetworkError, backoffMs, RETRY_BACKOFF_MS, NETWORK_CODES } = require('../scripts/lib/llm_retry.js');
const { spawnSync } = require('child_process');
const path = require('path');

let pass = 0, fail = 0;
function test(name, fn) {
    try { fn(); console.log('✅ ' + name); pass++; }
    catch (e) { console.log('❌ ' + name + ': ' + (e.stack || e.message)); fail++; }
}

test('isNetworkError: err.code 直接命中', () => {
    const err = new Error('connect refused');
    err.code = 'ECONNREFUSED';
    if (!isNetworkError(err)) throw new Error('should detect ECONNREFUSED');
});

test('isNetworkError: err.cause.code（Node 18+ undici fetch 結構）', () => {
    const err = new Error('fetch failed');
    err.cause = { code: 'ENOTFOUND' };
    if (!isNetworkError(err)) throw new Error('should detect via cause.code');
});

test('isNetworkError: 純 message 含 code 也算', () => {
    const err = new Error('socket hang up - ECONNRESET reset by peer');
    if (!isNetworkError(err)) throw new Error('should detect ECONNRESET in message');
});

test('isNetworkError: 非 network error 回 false', () => {
    const err = new Error('JSON parse error');
    if (isNetworkError(err)) throw new Error('should not match parse error');
});

test('isNetworkError: undefined / null 安全', () => {
    if (isNetworkError(null) !== false) throw new Error('null should be false');
    if (isNetworkError(undefined) !== false) throw new Error('undefined should be false');
});

test('isNetworkError: ETIMEDOUT 命中', () => {
    const err = new Error('timeout'); err.code = 'ETIMEDOUT';
    if (!isNetworkError(err)) throw new Error('should detect ETIMEDOUT');
});

test('isNetworkError: UND_ERR_SOCKET（undici fetch socket 錯）命中', () => {
    const err = new Error('socket error'); err.code = 'UND_ERR_SOCKET';
    if (!isNetworkError(err)) throw new Error('should detect UND_ERR_SOCKET');
});

test('backoffMs: 序列對齊 spec §7.1（1s/4s/9s）', () => {
    if (backoffMs(0) !== 1000) throw new Error('retry 0 should be 1000');
    if (backoffMs(1) !== 4000) throw new Error('retry 1 should be 4000');
    if (backoffMs(2) !== 9000) throw new Error('retry 2 should be 9000');
});

test('backoffMs: 超過 max retry 用最後一個值（不再增長）', () => {
    if (backoffMs(3) !== 9000) throw new Error('retry 3 should clamp to 9000');
    if (backoffMs(99) !== 9000) throw new Error('retry 99 should clamp to 9000');
});

test('backoffMs: 負數防呆', () => {
    if (backoffMs(-1) !== 1000) throw new Error('negative should fallback to first');
});

test('NETWORK_CODES 包含主要錯誤碼', () => {
    const must = ['ECONNREFUSED', 'ENOTFOUND', 'ETIMEDOUT', 'ECONNRESET'];
    for (const c of must) {
        if (!NETWORK_CODES.includes(c)) throw new Error('NETWORK_CODES missing ' + c);
    }
});

test('RETRY_BACKOFF_MS: 對齊 spec', () => {
    if (JSON.stringify(RETRY_BACKOFF_MS) !== '[1000,4000,9000]') {
        throw new Error('RETRY_BACKOFF_MS should be [1000,4000,9000], got ' + JSON.stringify(RETRY_BACKOFF_MS));
    }
});

test('exitWithMarker: stdout 印 marker 後 exit(2) — 透過 spawn 子行程驗證', () => {
    // 子行程 stdout 是 pipe（block-buffered），驗 marker 仍能被 flush 出來
    const libPath = path.resolve(__dirname, '../scripts/lib/llm_retry.js');
    const code = `const { exitWithMarker } = require(${JSON.stringify(libPath)}); exitWithMarker('TEST_MARKER');`;
    const result = spawnSync('node', ['-e', code], { encoding: 'utf8' });
    if (result.status !== 2) throw new Error('expected exit 2, got ' + result.status);
    if (!result.stdout.includes('TEST_MARKER\n')) throw new Error('expected TEST_MARKER in stdout, got: ' + JSON.stringify(result.stdout));
});

test('exitWithMarker: 自訂 exit code', () => {
    const libPath = path.resolve(__dirname, '../scripts/lib/llm_retry.js');
    const code = `const { exitWithMarker } = require(${JSON.stringify(libPath)}); exitWithMarker('CUSTOM', 5);`;
    const result = spawnSync('node', ['-e', code], { encoding: 'utf8' });
    if (result.status !== 5) throw new Error('expected exit 5, got ' + result.status);
    if (!result.stdout.includes('CUSTOM\n')) throw new Error('expected CUSTOM in stdout');
});

console.log(`\n${pass}/${pass + fail} tests passed.`);
process.exit(fail > 0 ? 1 : 0);
