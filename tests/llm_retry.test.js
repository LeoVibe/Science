const { withLlmRetries, isNetworkError } = require('../scripts/lib/llm_retry.js');

let pass = 0, fail = 0;
function test(name, fn) {
    return Promise.resolve().then(fn).then(
        () => { console.log('✅ ' + name); pass++; },
        e => { console.log('❌ ' + name + ': ' + (e.stack || e.message)); fail++; }
    );
}

function makeContext() {
    const stdout = [];
    const sleeps = [];
    return {
        opts: {
            sleepFn: ms => { sleeps.push(ms); return Promise.resolve(); },
            exitFn: s => { stdout.push(s); },
            waitBaseMs: 1000,
        },
        stdout,
        sleeps,
    };
}

(async () => {
    await test('success 直接回傳 value', async () => {
        const ctx = makeContext();
        const result = await withLlmRetries(async () => ({ kind: 'success', value: ['a', 'b'] }), ctx.opts);
        if (JSON.stringify(result) !== '["a","b"]') throw new Error('expected value');
        if (ctx.sleeps.length !== 0) throw new Error('should not sleep');
    });

    await test('fn 直接回非 result（無 kind）也視為 success 直接回傳', async () => {
        const ctx = makeContext();
        const result = await withLlmRetries(async () => 'plain-string', ctx.opts);
        if (result !== 'plain-string') throw new Error('expected plain-string');
    });

    await test('5xx 一次後成功 → 重試一次後回 value', async () => {
        const ctx = makeContext();
        let n = 0;
        const result = await withLlmRetries(async ({ retry5xx }) => {
            n++;
            if (retry5xx === 0) return { kind: '5xx', status: 503 };
            return { kind: 'success', value: ['ok'] };
        }, ctx.opts);
        if (JSON.stringify(result) !== '["ok"]') throw new Error('expected ok');
        if (n !== 2) throw new Error('expected 2 calls, got ' + n);
        if (ctx.sleeps.length !== 1) throw new Error('expected 1 sleep');
        if (ctx.sleeps[0] !== 1000) throw new Error('expected first sleep 1000ms');
    });

    await test('5xx 退避序列 1s/3s/9s，超過 max 印 EXIT_5XX', async () => {
        const ctx = makeContext();
        const opts = { ...ctx.opts, max5xx: 3, fallback: [] };
        const result = await withLlmRetries(async () => ({ kind: '5xx', status: 503 }), opts);
        if (JSON.stringify(result) !== '[]') throw new Error('expected []');
        if (ctx.sleeps.length !== 3) throw new Error('expected 3 sleeps, got ' + ctx.sleeps.length);
        if (ctx.sleeps[0] !== 1000 || ctx.sleeps[1] !== 3000 || ctx.sleeps[2] !== 9000) {
            throw new Error('退避序列錯: ' + JSON.stringify(ctx.sleeps));
        }
        if (!ctx.stdout.includes('EXIT_5XX\n')) throw new Error('expected EXIT_5XX in stdout');
    });

    await test('network error 一次後成功 → 重試後回 value', async () => {
        const ctx = makeContext();
        let n = 0;
        const result = await withLlmRetries(async () => {
            n++;
            if (n === 1) {
                const err = new Error('connect ECONNREFUSED 127.0.0.1:443');
                err.code = 'ECONNREFUSED';
                throw err;
            }
            return { kind: 'success', value: ['recovered'] };
        }, ctx.opts);
        if (JSON.stringify(result) !== '["recovered"]') throw new Error('expected recovered');
        if (ctx.sleeps.length !== 1) throw new Error('expected 1 sleep');
    });

    await test('network error err.cause.code 也認', async () => {
        const ctx = makeContext();
        let n = 0;
        const result = await withLlmRetries(async () => {
            n++;
            if (n === 1) {
                const err = new Error('fetch failed');
                err.cause = { code: 'ENOTFOUND' };
                throw err;
            }
            return { kind: 'success', value: ['ok'] };
        }, ctx.opts);
        if (JSON.stringify(result) !== '["ok"]') throw new Error('expected ok');
    });

    await test('network error 超過 max → EXIT_NETWORK', async () => {
        const ctx = makeContext();
        const result = await withLlmRetries(async () => {
            const err = new Error('connect ETIMEDOUT');
            err.code = 'ETIMEDOUT';
            throw err;
        }, { ...ctx.opts, maxNet: 3, fallback: 'NET_FAIL' });
        if (result !== 'NET_FAIL') throw new Error('expected fallback NET_FAIL');
        if (ctx.sleeps.length !== 3) throw new Error('expected 3 sleeps');
        if (!ctx.stdout.includes('EXIT_NETWORK\n')) throw new Error('expected EXIT_NETWORK in stdout');
    });

    await test('非 network error 直接 re-throw', async () => {
        const ctx = makeContext();
        let caught = null;
        try {
            await withLlmRetries(async () => {
                throw new Error('JSON parse failed');
            }, ctx.opts);
        } catch (e) {
            caught = e;
        }
        if (!caught) throw new Error('expected throw');
        if (!caught.message.includes('JSON parse failed')) throw new Error('wrong error: ' + caught.message);
        if (ctx.sleeps.length !== 0) throw new Error('should not sleep on non-network err');
    });

    await test('混合 5xx + network → 各自獨立計數', async () => {
        const ctx = makeContext();
        let calls = 0;
        const result = await withLlmRetries(async () => {
            calls++;
            if (calls === 1) return { kind: '5xx', status: 502 };  // 5xx#1
            if (calls === 2) {
                const err = new Error('ECONNREFUSED'); err.code = 'ECONNREFUSED';
                throw err;  // net#1
            }
            if (calls === 3) return { kind: '5xx', status: 503 };  // 5xx#2
            return { kind: 'success', value: ['final'] };
        }, ctx.opts);
        if (JSON.stringify(result) !== '["final"]') throw new Error('expected final');
        if (calls !== 4) throw new Error('expected 4 calls');
        // 退避序列：5xx#1=1s、net#1=1s、5xx#2=3s（5xx 計數累加）
        if (ctx.sleeps.length !== 3) throw new Error('expected 3 sleeps, got ' + ctx.sleeps.length);
    });

    await test('isNetworkError: 純 message 含 code 也認', () => {
        const err = new Error('socket hang up - ECONNRESET');
        if (!isNetworkError(err)) throw new Error('should detect ECONNRESET in message');
    });

    await test('isNetworkError: undefined / null 不 crash', () => {
        if (isNetworkError(null) !== false) throw new Error('null should be false');
        if (isNetworkError(undefined) !== false) throw new Error('undefined should be false');
    });

    console.log(`\n${pass}/${pass + fail} tests passed.`);
    process.exit(fail > 0 ? 1 : 0);
})();
