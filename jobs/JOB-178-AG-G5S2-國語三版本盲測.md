*Created by Claude Code at 2026-04-12*

`last_updated`: 2026-04-12
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-178-AG-G5S2-國語三版本盲測

**`job_type`**: `question_verify`
**`executor`**: Cursor（`run_blind_eval.js` 呼叫 Gemini API）

---

## 📌 任務背景

G5S2 國語三版本題庫已完成出題（翰林 635 題 / 康軒 510 題 / 南一 471 題，L1-L12），KL4 單課研究（考古題雙檔）三版本 L1-L12 全齊。題目目前全為 `review_status: pending_review`、`is_publishable: false`，尚未進行任何盲測，本 JOB 執行首次全量盲測。

---

## 🎯 任務目標

對 G5S2 國語三版本執行 `run_blind_eval.js` 全量盲測，處理所有 Mismatch，設定 `is_publishable`，確認各課 publishable 題數 ≥ 25。

---

## 🚧 任務邊界

本次任務只做：
- `run_blind_eval.js` 三版本全量盲測（含 `--force` 強制重測）
- Mismatch triage（TYPE-A / TYPE-B / TYPE-C）
- `is_publishable` 設定
- `normalize_manifest`（三版本）
- `evaluate_question_quality.js` 確認各課題數分布

本次任務不做：
- 重新出題
- 補充考古題
- 修改 KL4 研究素材
- 修改任何規範文件

---

## 📖 執行步驟

1. 讀取 `question/README_驗證與盲測準則.md`（確認 §2.5 Mismatch 規則）
2. 逐版本執行盲測：
   ```bash
   node scripts/run_blind_eval.js Chinese G5 S2 HanLin --force
   node scripts/run_blind_eval.js Chinese G5 S2 KangHsuan --force
   node scripts/run_blind_eval.js Chinese G5 S2 NanYi --force
   ```
3. 整理 Match Rate 表，標記 < 85% 課次
4. 逐筆 Mismatch triage：
   - TYPE-A：AI 判錯，答案正確 → 保留、標記
   - TYPE-B：答案錯誤 → 修正 `answer_index`
   - TYPE-C：無法判定（如兩解題）→ `is_publishable=false` + 說明
5. 清除幽靈 mismatch（`ai_selected === correct_answer` 但有 mismatch 物件）
6. 設定 `is_publishable`
7. `normalize_manifest` 三版本
8. `evaluate_question_quality.js` 確認各課 ≥ 25 publishable
9. 撰寫 Report

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `question/README_驗證與盲測準則.md` | 盲測流程、§2.5 Mismatch 判斷規則 |
| `knowledge/課綱研究/國語/五下/翰林/` | 翰林 KL4 單課研究（L1-L12 雙檔） |
| `knowledge/課綱研究/國語/五下/康軒/` | 康軒 KL4 單課研究（L1-L12 雙檔） |
| `knowledge/課綱研究/國語/五下/南一/` | 南一 KL4 單課研究（L1-L12 雙檔） |
| `question/platform/G5/Chinese/S2/` | 目標題庫 JSON（三版本） |
| `_agent/API_RULES.md` | API 成本控制 |

---

## 📊 題庫現況

| 版本 | 課次 | 題數(total) | pub/blind 狀態 |
|:--|:--|:--|:--|
| 翰林 | L1-L12 | 635 | 全 pending_review，0 blind |
| 康軒 | L1-L12 | 510 | 全 pending_review，0 blind |
| 南一 | L1-L12 | 471 | 全 pending_review，0 blind |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取 `question/README_驗證與盲測準則.md`
- [ ] 已確認 Gemini 金鑰有效（`GEMINI_API_KEY` 或 `GOOGLE_API_KEY`）
- [ ] 已確認 QPM 限制：[QPM：___________]
- [ ] 已確認三版本 KL4 研究素材存在（`knowledge/課綱研究/國語/五下/`）
- [ ] 已執行 `evaluate_question_quality.js` 確認目前題數基線

## ✅ 驗收 Checklist (Acceptance)

- [ ] 翰林 Match Rate ≥ 85%（各課）— 實際值：___
- [ ] 康軒 Match Rate ≥ 85%（各課）— 實際值：___
- [ ] 南一 Match Rate ≥ 85%（各課）— 實際值：___
- [ ] 全部 Mismatch 完成 triage（TYPE-A/B/C 分類，無 pending）
- [ ] 幽靈 mismatch 清除
- [ ] 各課 publishable ≥ 25（達標；不足者已記錄原因）
- [ ] `validate_review_fields.js` → 0 errors

## ✅ 成果 Checklist (Deliverables)

- [ ] `normalize_manifest` 三版本完成
- [ ] `docs/進度彙整_題庫研發與產出.md` G5S2 國語欄位更新（publishable 數 + 盲測日期）
- [ ] 已執行 `/pj_sync`
- [ ] 產出 `jobs/JOB-178-Report.md`

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| 翰林盲測 | HH:mm | HH:mm | - | |
| 康軒盲測 | HH:mm | HH:mm | - | |
| 南一盲測 | HH:mm | HH:mm | - | |
| Mismatch triage | HH:mm | HH:mm | - | |
| is_publishable + manifest | HH:mm | HH:mm | - | |
| **總計** | — | — | **-** | — |

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: - | 使用模型: - | 執行者: Cursor
