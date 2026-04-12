#!/usr/bin/env node
/**
 * JOB-178：G5S2 國語三版本盲測後處理
 * 1) 清除幽靈 mismatch（ai_selected 已等於題庫正解）
 * 2) 依 README 驗證準則 §2.5：Match + cqi_score ≥ 6.5 → is_publishable；其餘 false
 * 3) Match 且可上版者：review_status → confirmed（若原為 pending_review）
 *
 * 前置：已跑完 run_blind_eval.js --force，並建議先跑 evaluate_question_quality.js 以更新 cqi_score。
 *
 * 執行：node scripts/j178_g5s2_chinese_apply.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BASE = path.join(ROOT, "question/platform/G5/Chinese/S2");
const today = new Date().toISOString().slice(0, 10);
const REVIEWER = "JOB-178";

function walkJsonFiles(dir, out) {
  if (!fs.existsSync(dir)) return;
  for (const name of fs.readdirSync(dir)) {
    const fp = path.join(dir, name);
    const st = fs.statSync(fp);
    if (st.isDirectory()) walkJsonFiles(fp, out);
    else if (name.endsWith(".json") && !name.includes("manifest")) out.push(fp);
  }
}

function actualAnswer(q) {
  return q.answer_index !== undefined ? q.answer_index : q.answer;
}

function clearGhostMismatch(q) {
  const m = q.blind_eval_mismatch;
  if (!m) return false;
  const ai = m.ai_selected;
  const correct = actualAnswer(q);
  if (ai !== undefined && correct !== undefined && Number(ai) === Number(correct)) {
    delete q.blind_eval_mismatch;
    return true;
  }
  return false;
}

function applyPublishable(q) {
  if (q.blind_eval_mismatch && Number(q.blind_eval_mismatch.ai_selected) === -1) {
    q.is_publishable = false;
    return;
  }
  const ans = actualAnswer(q);
  const badAns =
    ans === null ||
    ans === undefined ||
    Number(ans) < 0 ||
    !Array.isArray(q.options) ||
    q.options.length === 0;
  if (badAns) {
    q.is_publishable = false;
    return;
  }
  if (!q.blind_evaluation) {
    q.is_publishable = false;
    return;
  }
  if (q.blind_eval_mismatch) {
    const rs = q.review_status;
    if (rs === "confirmed" || rs === "corrected") {
      q.is_publishable = true;
    } else {
      q.is_publishable = false;
    }
    return;
  }
  const cqi = Number(q.cqi_score);
  if (cqi >= 6.5) {
    q.is_publishable = true;
    if (q.review_status === "pending_review") {
      q.review_status = "confirmed";
      q.reviewer = REVIEWER;
      q.review_date = today;
      const note = "G5S2 國語盲測 Match 且 CQI≥6.5；JOB-178 自動結案。";
      q.review_notes = [q.review_notes || "", note].filter(Boolean).join(" ").trim();
    }
  } else {
    q.is_publishable = false;
  }
}

function main() {
  const files = [];
  walkJsonFiles(BASE, files);
  let ghosts = 0;
  for (const fp of files) {
    const j = JSON.parse(fs.readFileSync(fp, "utf8"));
    const qs = j.questions || [];
    let touched = false;
    for (const q of qs) {
      if (clearGhostMismatch(q)) {
        ghosts++;
        touched = true;
      }
    }
    for (const q of qs) {
      applyPublishable(q);
      touched = true;
    }
    if (touched) fs.writeFileSync(fp, JSON.stringify(j, null, 2), "utf8");
  }
  console.log(`JOB-178 apply: ${files.length} 檔，清除幽靈 mismatch ${ghosts} 筆。`);
}

main();
