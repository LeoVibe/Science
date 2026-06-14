*Created by Claude Code (claude-opus-4-8) at 2026-06-14*

`last_updated`: 2026-06-14
`updated_by`: Claude Code (claude-opus-4-8)

# JOB-254-AG-三下-國語-隱形課修復與上版

**`job_type`**：`question_verify`
**`executor`**：Claude subagent 盲測 + claude-opus-4-8 驗收/上版
**`model`**：盲測 claude-opus-4-8 — ⚠️ 訂閱制，未用任何 API key

---

## 📌 任務背景

使用者回報三下國語「行人的守護者」在正式站消失。查證為 3 課因舊盲測誤標 pending_review、is_publishable=0 而前台隱形。

## 🎯 目標

重新盲測確認答案 → 回寫 is_publishable → 上版，讓 3 課恢復顯示。

## 🚧 邊界

只做：三下國語翰林 L8、康軒 L4/L6 修復上版。不做：其他科/年級（另行健檢）、修改答案（Mismatch 走 pending）。

## ✅ 驗收 Checklist

- [x] 3 課重新盲測（L8 30/30、L4 29/30、L6 29/29）
- [x] 回寫 is_publishable（L8=30、L4=29、L6=29）+ validate 0 error
- [x] source+public 同步 + push 上版（d1964c79）
- [x] L4-id26 Mismatch 走 pending 未自動改答案

## ✅ 成果 Checklist

- [x] 3 課恢復上架
- [x] `jobs/JOB-254-Report.md`
- [x] `/pj_sync`
- [x] `node scripts/job_manager.js close JOB-254`
- [x] Discord 結案回報

## 真實回報

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: claude-opus-4-8 | 執行者: AG
