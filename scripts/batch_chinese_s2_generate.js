#!/usr/bin/env node
/**
 * 國語下學期（G3～G6 × 康軒／翰林／南一）批次呼叫 auto_generate_questions.js。
 *
 * 模式與單一目錄產題相同：同一支補題腳本、同一套 KL4 前置（課文全文錄製＋考古雙檔）、
 * 同一組 CLI 參數（模型／金鑰／QPM／batch／threshold／target／pattern）。
 *
 * 用法：
 *   node scripts/batch_chinese_s2_generate.js [批次選項] -- [傳給 auto_generate_questions 的參數…]
 *
 * 批次選項：
 *   --grades G3,G4,G5,G6 | all     預設 all（G3～G6）
 *   --publishers HanLin,KangHsuan,NanYi | all   預設 all（三社）
 *   --dry-run                      只列出將執行的指令，不呼叫 API
 *   --skip-verify                  跳過 verify_chinese_kl4_prereq（不建議）
 *   --prereq-only                  只跑前置檢查後結束
 *   --continue-on-error            某一目錄失敗仍繼續下一個（預設：遇錯即停止）
 *
 * 範例（與單包相同品質參數，請先依 README 取得負責人同意之模型代號）：
 *   node scripts/batch_chinese_s2_generate.js --grades G4 --publishers HanLin -- \\
 *     --key Yotta --model gemini-3.1-flash --qpm 10 --batch 10 --threshold 5.0 --target 30
 *
 * 關聯：JOB-124、verify_chinese_kl4_prereq.js、auto_generate_questions.js
 */
const fs = require('fs');
const path = require('path');
const { spawnSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..');
const PLATFORM = path.join(ROOT, 'question', 'platform');
const AUTO_SCRIPT = path.join(__dirname, 'auto_generate_questions.js');
const VERIFY_SCRIPT = path.join(__dirname, 'verify_chinese_kl4_prereq.js');

const ALL_GRADES = ['G3', 'G4', 'G5', 'G6'];
const ALL_PUBLISHERS = ['HanLin', 'KangHsuan', 'NanYi'];

function splitList(s) {
  return s.split(',').map((x) => x.trim()).filter(Boolean);
}

function parseBatchArgs(argv) {
  const dash = argv.indexOf('--');
  const batchPart = dash === -1 ? argv : argv.slice(0, dash);
  const childPart = dash === -1 ? [] : argv.slice(dash + 1);

  const opts = {
    grades: null,
    publishers: null,
    dryRun: false,
    skipVerify: false,
    prereqOnly: false,
    continueOnError: false,
  };

  for (let i = 0; i < batchPart.length; i++) {
    const a = batchPart[i];
    if (a === '--dry-run') opts.dryRun = true;
    else if (a === '--skip-verify') opts.skipVerify = true;
    else if (a === '--prereq-only') opts.prereqOnly = true;
    else if (a === '--continue-on-error') opts.continueOnError = true;
    else if (a === '--grades' && batchPart[i + 1]) {
      opts.grades = batchPart[++i];
    } else if (a === '--publishers' && batchPart[i + 1]) {
      opts.publishers = batchPart[++i];
    } else if (a.startsWith('-')) {
      console.error('未知批次參數:', a);
      process.exit(1);
    }
  }

  let grades;
  if (!opts.grades || opts.grades === 'all') grades = [...ALL_GRADES];
  else {
    grades = splitList(opts.grades).map((g) => g.toUpperCase());
    for (const g of grades) {
      if (!ALL_GRADES.includes(g)) {
        console.error('無效年級:', g, '允許:', ALL_GRADES.join(', '));
        process.exit(1);
      }
    }
  }

  let publishers;
  if (!opts.publishers || opts.publishers === 'all') publishers = [...ALL_PUBLISHERS];
  else {
    publishers = splitList(opts.publishers);
    for (const p of publishers) {
      if (!ALL_PUBLISHERS.includes(p)) {
        console.error('無效出版社目錄:', p, '允許:', ALL_PUBLISHERS.join(', '));
        process.exit(1);
      }
    }
  }

  return { opts, grades, publishers, childArgs: childPart };
}

function verifyArgForGrades(grades) {
  return grades.length === 1 ? grades[0] : 'all';
}

function collectTargets(grades, publishers) {
  const targets = [];
  for (const g of grades) {
    for (const p of publishers) {
      const dir = path.join(PLATFORM, g, 'Chinese', 'S2', p);
      if (!fs.existsSync(dir)) {
        console.warn('⚠️  略過（目錄不存在）:', path.relative(ROOT, dir));
        continue;
      }
      if (!fs.statSync(dir).isDirectory()) continue;
      targets.push({ grade: g, publisher: p, dir });
    }
  }
  return targets;
}

function main() {
  const raw = process.argv.slice(2);
  const { opts, grades, publishers, childArgs } = parseBatchArgs(raw);

  console.log('══════════════════════════════════════════════════════════');
  console.log('國語 S2 批次產題（G3～G6 × 三出版社）');
  console.log('年級:', grades.join(', '));
  console.log('出版社:', publishers.join(', '));
  console.log('dry-run:', opts.dryRun);
  console.log('傳入 auto_generate 的參數:', childArgs.length ? childArgs.join(' ') : '（無，使用該腳本預設）');
  console.log('══════════════════════════════════════════════════════════\n');

  if (!opts.skipVerify) {
    const vArg = verifyArgForGrades(grades);
    console.log(`🔍 執行前置檢查: node scripts/verify_chinese_kl4_prereq.js ${vArg}\n`);
    if (!opts.dryRun) {
      const r = spawnSync(process.execPath, [VERIFY_SCRIPT, vArg], {
        cwd: ROOT,
        stdio: 'inherit',
      });
      if (r.status !== 0) {
        console.error('\n❌ KL4 前置未全數通過。請補齊研究雙檔與課文全文錄製後再產題，或使用 --skip-verify（不建議）。');
        process.exit(r.status || 1);
      }
    }
  } else {
    console.warn('⚠️  已略過 verify（--skip-verify）。\n');
  }

  if (opts.prereqOnly) {
    console.log('✅ --prereq-only：僅檢查，結束。');
    process.exit(0);
  }

  const targets = collectTargets(grades, publishers);
  if (!targets.length) {
    console.error('❌ 沒有任何可處理的 question/platform/.../Chinese/S2 目錄。');
    process.exit(1);
  }

  console.log(`📂 將處理 ${targets.length} 個目錄：`);
  targets.forEach((t) => console.log('   -', path.relative(ROOT, t.dir)));
  console.log('');

  const failures = [];

  for (let i = 0; i < targets.length; i++) {
    const t = targets[i];
    const rel = path.relative(ROOT, t.dir);
    const args = [AUTO_SCRIPT, rel, ...childArgs];

    console.log(`\n────────── [${i + 1}/${targets.length}] ${t.grade} ${t.publisher} ──────────`);
    console.log('指令:', 'node', 'scripts/auto_generate_questions.js', rel, childArgs.join(' ').trim());

    if (opts.dryRun) continue;

    const r = spawnSync(process.execPath, args, {
      cwd: ROOT,
      stdio: 'inherit',
      env: process.env,
    });

    if (r.status !== 0) {
      failures.push({ rel, code: r.status });
      console.error(`❌ 失敗（exit ${r.status}）: ${rel}`);
      if (!opts.continueOnError) {
        process.exit(r.status || 1);
      }
    }
  }

  if (failures.length) {
    console.error('\n❌ 以下目錄執行失敗：');
    failures.forEach((f) => console.error('  -', f.rel, 'code', f.code));
    process.exit(1);
  }

  console.log('\n✅ 批次目錄全數跑完。建議接續：');
  console.log('   node scripts/evaluate_question_quality.js question/platform/G3/Chinese/S2');
  console.log('   （或改為對應年級／版本路徑）');
}

main();
