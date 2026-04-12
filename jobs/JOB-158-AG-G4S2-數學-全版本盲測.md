*Created by Claude Code (claude-sonnet-4-6) at 2026-04-05*

`last_updated`: 2026-04-05
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-158-AG-G4S2-數學-全版本盲測

**`job_type`**: `question_verify`
**預計 API 消耗**：~120 RPD（898 題 × Gemini Flash Lite）

> 本 Job 為原 JOB-153（G4S2數學盲測）的正式延續版本。
> 原 JOB-153 於 2026-04-05 被另一對話覆寫為國語任務，詳見 JOB-158-Report.md。

> 執行架構：Claude Code 派工 → Cursor 執行腳本 + 寫 Report → Claude Code 審視 Mismatch 並修正 → 結案

---

## 📌 任務背景

G4 S2 數學三版本（翰林／康軒／南一）共 898 題，題數充足（各版本 ~300 題），尚未執行任何盲測。
本 Job 目標：執行全版本盲測，使所有題目取得 `blind_evaluation=true`，並標記 `is_publishable=true`。

---

## 🎯 任務目標

- 三版本各目錄 Match Rate ≥ 85%
- Mismatch 清單完整記錄，供 Claude Code 逐題審視
- 盲測通過後 `blind_evaluation` / `is_publishable` 欄位自動更新

---

## 📖 執行目錄

| 目錄 | 題數 | 課次 |
|:--|:--|:--|
| `question/platform/G4/Math/S2/HanLin` | 300 題 | 10 課（L1~L10） |
| `question/platform/G4/Math/S2/KangHsuan` | 300 題 | 10 課（L1~L10） |
| `question/platform/G4/Math/S2/NanYi` | 298 題 | 10 課（L1~L10） |

---

## 📖 執行步驟

1. 讀取 `question/README_驗證與盲測準則.md`（確認 Match Rate 標準與 §2.5 超門檻規則）
2. 依序對每個目錄執行盲測：

```bash
node scripts/run_blind_eval.js question/platform/G4/Math/S2/HanLin --force
node scripts/run_blind_eval.js question/platform/G4/Math/S2/KangHsuan --force
node scripts/run_blind_eval.js question/platform/G4/Math/S2/NanYi --force
```

3. 彙整各目錄結果表格（每課 Match Rate + Mismatch 題號清單）
4. 產出 `jobs/JOB-158-Report.md`

---

## 🚧 Cursor 任務邊界

**只做：**
- 執行三個 `run_blind_eval.js` 指令
- 記錄每課 Match／總題數／Match Rate
- 列出 Mismatch 清單（題號、AI 答、正確答、題幹摘要）
- 產出 Report

**不做：**
- 修改任何題目 JSON（Mismatch 由 Claude Code 負責）
- 修改規範文件
- 執行補題

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取 `question/README_驗證與盲測準則.md`
- [x] **執行模型**：composer-2-fast
- [x] **金鑰**：Yotta（確認 RPD 剩餘 ≥ 120）
- [ ] 已確認三個目錄路徑存在

## ✅ 成果 Checklist (Deliverables)

- [ ] 產出 `jobs/JOB-158-Report.md`（Cursor 撰寫，非 Claude Code 代寫）
- [ ] Report 含各版本各課 Match Rate 表
- [ ] Report 含完整 Mismatch 清單（題號、AI選、正解、題幹摘要）
- [ ] Report 標明 §2.5 超門檻課檔（Mismatch > 2）清單

---

## Claude Code 後續責任

Cursor 完成後，Claude Code 執行：
1. 審視所有 Mismatch 題目（分析根因：答案標記錯？選項設計問題？題目語意模糊？）
2. 直接修正 JSON（僅修正有誤的 `answer_index` 或 `explanation`）
3. 對修正檔案重跑 CQI-P 確認（`node scripts/evaluate_question_quality.js`）
4. 結案

---

＄作業匯總：Token數:{真實數字} | 花費:${換算台幣} | 使用模型:{真實模型} | 執行者:Cursor
