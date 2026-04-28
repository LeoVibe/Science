*Created by Claude Code (PM) at 2026-04-22 — 追溯補建（原任務執行於 2026-04-03）*

`last_updated`: 2026-04-22
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-134-AG：翰林三下國語 L5/L8 盲測補做

**`job_type`**: `question_verify`
**`executor`**: Gemini-2.5-Pro（AG）

## 📌 任務背景

G3 S2 翰林版國語 L5（茶香鹿谷）與 L8（行人的守護者）先前缺漏盲測，需補做以完成全課次驗證。

## 🎯 任務目標

對 G3 S2 翰林版國語 L5、L8 執行盲測，Match Rate ≥ 85% 後更新 JSON `blind_evaluation: true`。

## 🚧 任務邊界

本次任務只做：
- 執行 `run_blind_eval.js` 對 L5、L8 盲測
- Mismatch 分析與判斷（依 §2.5 規則）
- 更新對應 JSON 欄位

本次任務不做：
- 重新出題
- 修改 R3/R4 素材
- 修改規範文件

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `question/README_驗證與盲測準則.md` | 盲測流程、Mismatch 判斷規則 |
| `question/platform/G3/Chinese/S2/HanLin/` | 目標 JSON 檔案 |

## ✅ 驗收標準

- L5 Match Rate ≥ 85%
- L8 Match Rate ≥ 85%
- 兩課 `blind_evaluation: true` 已寫入 JSON

---

> **追溯說明**：本派工單依 JOB-134-Report（2026-04-03）補建，工作已完成（L5=100%、L8=96.7%）。
