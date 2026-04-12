/**
 * 移除 auto_balance_json.js 注入之 fillerPrefixes / fillerSuffixes（JOB-171 後續清理）。
 * 執行：node scripts/job171_strip_autobalance_fillers.js <目錄>
 */
const fs = require('fs');
const path = require('path');

const PREFIXES = [
    '根據文章內容描述，這代表',
    '從科學或自然的角度來看，',
    '作者之所以這樣寫，是因為',
    '在故事的情境中，我們會發現',
    '這句話的主要用意是為了說明',
    '如果我們仔細觀察的話會發現',
    '這其實是一種非常特別的現象，',
    '一般人可能會誤以為這是因為',
];

const SUFFIXES = [
    '，讓人覺得非常有意思。',
    '，不過這並不是文中的重點。',
    '，但在這裡可能並不適用。',
    '，這是一種常見的自然現象。',
    '，但其實這只是作者的想像。',
    '，這是一個非常有趣的觀點。',
    '，值得我們繼續去深入探討。',
    '，不過課文中並沒有提到這個。',
    '，這也是作者想強調的重點之一。',
    '，並且需要經過深思熟慮的考量。',
];

function stripFillersOnce(s) {
    let t = String(s);
    for (const p of PREFIXES) {
        if (t.startsWith(p)) t = t.slice(p.length);
    }
    for (const suf of SUFFIXES) {
        if (t.endsWith(suf)) t = t.slice(0, -suf.length);
    }
    return t.replace(/　+$/u, '');
}

function cleanOption(s) {
    let t = stripFillersOnce(s);
    let prev;
    do {
        prev = t;
        t = stripFillersOnce(t);
    } while (t !== prev);
    return t;
}

function walkJson(dir, acc = []) {
    for (const e of fs.readdirSync(dir, { withFileTypes: true })) {
        const p = path.join(dir, e.name);
        if (e.isDirectory()) walkJson(p, acc);
        else if (e.name.endsWith('.json') && !e.name.includes('manifest')) acc.push(p);
    }
    return acc;
}

function processFile(fp) {
    const data = JSON.parse(fs.readFileSync(fp, 'utf8'));
    if (!Array.isArray(data.questions)) return false;
    let mod = false;
    for (const q of data.questions) {
        if (!q.options || !Array.isArray(q.options)) continue;
        const next = q.options.map((o) => cleanOption(o));
        if (next.some((o, i) => o !== q.options[i])) {
            q.options = next;
            mod = true;
        }
    }
    if (mod) fs.writeFileSync(fp, JSON.stringify(data, null, 2), 'utf8');
    return mod;
}

const root = path.resolve(process.argv[2] || 'question/platform/G4/SocialStudies/S2');
for (const fp of walkJson(root)) {
    if (/G4_S2_SOC_/.test(path.basename(fp)) && processFile(fp)) {
        console.log('Stripped:', path.relative(process.cwd(), fp));
    }
}
