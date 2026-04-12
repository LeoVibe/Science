/**
 * JOB-169 Phase 1：將 scripts/job169/*.json 中的新題 append 至對應題庫檔。
 * 用法：node scripts/job169_phase1_apply.js
 */
'use strict';

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const BANK_DIR = path.join(__dirname, 'job169');

const FILES = [
  'kang_append.json',
  'han_append.json',
  'nan_append.json'
];

function main() {
  for (const fname of FILES) {
    const fp = path.join(BANK_DIR, fname);
    if (!fs.existsSync(fp)) {
      console.error('缺少題庫檔:', fp);
      process.exit(1);
    }
    const payload = JSON.parse(fs.readFileSync(fp, 'utf8'));
    for (const [relPath, questions] of Object.entries(payload)) {
      if (!Array.isArray(questions)) continue;
      const target = path.join(ROOT, relPath);
      if (!fs.existsSync(target)) {
        console.error('目標不存在:', target);
        process.exit(1);
      }
      const bank = JSON.parse(fs.readFileSync(target, 'utf8'));
      if (!Array.isArray(bank.questions)) {
        console.error('無 questions 陣列:', relPath);
        process.exit(1);
      }
      bank.questions.push(...questions);
      fs.writeFileSync(target, JSON.stringify(bank, null, 2), 'utf8');
      console.log('OK', relPath, '+', questions.length, '→', bank.questions.length);
    }
  }
}

main();
