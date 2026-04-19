/**
 * clean_option_artifacts.js
 *
 * 全庫掃描並清除題庫選項中的 AI 出題評註殘留字串
 * 來源：JOB-189（JOB-188 §A 抽樣驗證發現）
 * 建立：2026-04-13
 * 執行者：Claude Code（使用者授權）
 *
 * 用法：
 *   node scripts/clean_option_artifacts.js --dry-run   # 只掃描，不修改
 *   node scripts/clean_option_artifacts.js             # 實際清除並儲存
 */

const fs = require('fs');
const path = require('path');

const isDryRun = process.argv.includes('--dry-run');
const BASE = path.join(process.cwd(), 'question', 'platform');

// ──────────────────────────────────────────────────────────────────
// 清除規則：套用順序重要（先套用廣的再套用窄的）
// 每條規則：{ pattern: RegExp, replace: string|function, desc: string }
// ──────────────────────────────────────────────────────────────────
const RULES = [
  // Type C：括號型重複評註 — 從第一個評註括號起截斷
  {
    pattern: /（呼應[^）]*）[\s\S]*/,
    replace: '',
    desc: '移除（呼應...）及後續評註'
  },
  {
    pattern: /（屬於課堂[^）]*）[\s\S]*/,
    replace: '',
    desc: '移除（屬於課堂常見討論角度）及後續'
  },
  {
    pattern: /（協助檢驗[^）]*）[\s\S]*/,
    replace: '',
    desc: '移除（協助檢驗概念理解）及後續'
  },
  {
    pattern: /（可對照課本[^）]*）[\s\S]*/,
    replace: '',
    desc: '移除（可對照課本生活案例）及後續'
  },

  // Type A：尾綴型評註 — 從逗號開始截斷到尾
  {
    pattern: /，這點在分析單元核心時非常關鍵[\s\S]*/,
    replace: '',
    desc: '移除「，這點在分析單元核心時非常關鍵」及後續'
  },
  {
    pattern: /，這點在實務上很重要。?[\s\S]*/,
    replace: '',
    desc: '移除「，這點在實務上很重要」及後續'
  },
  {
    pattern: /，呈現出課綱所要求之探索精神[\s\S]*/,
    replace: '',
    desc: '移除「，呈現出課綱所要求之探索精神」及後續'
  },
  {
    pattern: /，內容完整確診且具備情境深度[\s\S]*/,
    replace: '',
    desc: '移除「，內容完整確診且具備情境深度」及後續'
  },

  // Type B：嵌入型評註 — 移除中間的片段（支援前置標點為 。或，）
  {
    pattern: /[，。]並且需要經過深思熟慮的考量。?/,
    replace: '',
    desc: '移除嵌入「並且需要經過深思熟慮的考量」（支援。或，前置）'
  },

  // Type D：前綴垃圾 — 移除全部「如果我們仔細觀察的話會發現」前綴
  {
    pattern: /^如果我們仔細觀察的話會發現([A-D]\. )?/,
    replace: '',
    desc: '移除前綴垃圾文字「如果我們仔細觀察的話會發現」'
  },

  // 清理尾部空白
  {
    pattern: /\s+$/,
    replace: '',
    desc: '清理尾部空白'
  }
];

function cleanOption(text) {
  let result = text;
  for (const rule of RULES) {
    result = result.replace(rule.pattern, rule.replace);
  }
  return result;
}

function isQuestionFile(fname) {
  return fname.endsWith('.json') &&
    !fname.includes('manifest') &&
    !fname.includes('mismatch') &&
    !fname.includes('catalog') &&
    !fname.includes('backup') &&
    fname !== 'libraryStats.json';
}

// ──────────────────────────────────────────────────────────────────
// 掃描與清除
// ──────────────────────────────────────────────────────────────────
let totalFiles = 0;
let modifiedFiles = 0;
let modifiedQuestions = 0;
let modifiedOptions = 0;
const changeLog = [];

function processDir(dir) {
  if (!fs.existsSync(dir)) return;
  for (const f of fs.readdirSync(dir)) {
    const full = path.join(dir, f);
    const stat = fs.statSync(full);
    if (stat.isDirectory()) {
      processDir(full);
    } else if (isQuestionFile(f)) {
      processFile(full);
    }
  }
}

function processFile(filePath) {
  let content;
  try {
    content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  } catch (e) {
    console.error(`[SKIP] 解析失敗: ${filePath}: ${e.message}`);
    return;
  }

  const questions = content.questions || (Array.isArray(content) ? content : []);
  if (questions.length === 0) return;

  totalFiles++;
  let fileChanged = false;
  const fileRel = path.relative(process.cwd(), filePath);

  questions.forEach((q, qi) => {
    if (!Array.isArray(q.options)) return;
    let questionChanged = false;

    q.options = q.options.map((opt, oi) => {
      const original = String(opt);
      const cleaned = cleanOption(original);
      if (cleaned !== original) {
        modifiedOptions++;
        questionChanged = true;
        fileChanged = true;
        changeLog.push({
          file: fileRel,
          qi: qi + 1,
          oi,
          original: original.substring(0, 80),
          cleaned: cleaned.substring(0, 80)
        });
      }
      return cleaned;
    });

    if (questionChanged) modifiedQuestions++;
  });

  if (fileChanged) {
    modifiedFiles++;
    if (!isDryRun) {
      if (Array.isArray(content)) {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
      } else {
        fs.writeFileSync(filePath, JSON.stringify(content, null, 2), 'utf8');
      }
    }
  }
}

// ──────────────────────────────────────────────────────────────────
// 執行
// ──────────────────────────────────────────────────────────────────
console.log(isDryRun ? '=== DRY-RUN 模式（不修改檔案）===' : '=== 實際清除模式 ===');
console.log('掃描目錄：', BASE);
processDir(BASE);

console.log(`\n掃描結果：${totalFiles} 個題庫檔案`);
console.log(`需修改：${modifiedFiles} 個檔案 | ${modifiedQuestions} 個題目 | ${modifiedOptions} 個選項`);

if (changeLog.length > 0) {
  console.log('\n===== 修改清單（前 50 條）=====');
  changeLog.slice(0, 50).forEach((c, i) => {
    console.log(`\n[${i + 1}] ${c.file} Q${c.qi} opt[${c.oi}]`);
    console.log(`  原始: ${c.original}`);
    console.log(`  清除: ${c.cleaned}`);
  });
  if (changeLog.length > 50) {
    console.log(`\n...以及另外 ${changeLog.length - 50} 條修改（已省略）`);
  }
}

if (!isDryRun && modifiedFiles > 0) {
  console.log(`\n✅ 已儲存 ${modifiedFiles} 個檔案的修改`);
}

if (isDryRun) {
  console.log('\n⚠️  DRY-RUN：不實際修改。移除 --dry-run 參數再執行以實際清除。');
}
