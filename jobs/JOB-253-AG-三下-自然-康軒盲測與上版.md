*Created by Claude Code (claude-opus-4-8) at 2026-06-14*

`last_updated`: 2026-06-14
`updated_by`: Claude Code (claude-opus-4-8)

# JOB-253-AG-三下-自然-康軒盲測與上版

**`job_type`**：`question_verify`
**`executor`**：Claude subagent 盲測 + Claude Code claude-opus-4-8（PM 驗收/上版）
**`parent_jobs`**：JOB-248（康軒自然重出）
**`model`**：盲測 claude-opus-4-8（雙盲：出題 Codex gpt-5.5）— ⚠️ 訂閱制，未用任何 API key

---

## 📌 任務背景

JOB-248 重出康軒自然 200 題（QL3 未盲測）。使用者指示：康軒先盲測，測試沒問題就上正式機。

---

## 🎯 任務目標

康軒自然 200 題盲測 → 達標升 QL4 → 上正式機。

---

## 🚧 任務邊界

**只做**：康軒自然盲測 + 上版
**不做**：翰林/南一/社會盲測（後續比照）、修改答案（Mismatch 走 pending）、全量 sync（避免殃及未盲測版本）

---

## 📖 執行步驟

1. 生成盲測題本（去答案）→ Claude subagent 並行盲判 4 課
2. 比對 Match Rate，依準則 §2.5 回寫 is_publishable/blind_evaluation/QL4
3. 課級門檻檢查（≥25）
4. 手動同步康軒至 public + commit + push 部署

---

## ✅ 驗收 Checklist

- [x] 200 題盲測（雙盲 Claude subagent）── Match 199/200（99.5%）
- [x] 各課 is_publishable ≥25 ── 49/50/50/50 全達標
- [x] 升 QL4（blind_evaluation=true，avgCqi 9.20）
- [x] Mismatch 走 pending 未自動改答案 ── L1-id32 題幹歧義
- [x] 上版 blast radius 僅康軒（git diff 驗證）

## ✅ 成果 Checklist

- [x] 康軒自然 QL4 + 上正式機（public 同步）
- [x] `jobs/JOB-253-Report.md`
- [x] 進度總表同步 + `/pj_sync`
- [x] `node scripts/job_manager.js close JOB-253`
- [x] Discord 結案回報

## 真實回報

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: 出題 Codex gpt-5.5 + 盲測/驗收 claude-opus-4-8 | 執行者: AG
