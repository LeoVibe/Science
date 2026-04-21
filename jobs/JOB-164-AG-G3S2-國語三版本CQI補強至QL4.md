*Created by Claude Code (claude-sonnet-4-6) at 2026-04-08 15:45:00*

`last_updated`: 2026-04-08 15:45:00
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-164-AG-G3S2-國語三版本CQI補強至QL4

**`job_type`**: `question_prod`
**`executor`**: Cursor

---

## 📌 任務背景

G3S2 國語三版本（康軒 467 題、翰林 481 題、南一 395 題）目前 `cqi_score` 均為 3（QL3），尚未達到 QL4 上架門檻（CQI ≥ 6.5）。

另外，品質評估腳本 `scripts/evaluate_question_quality.js` 在執行國語題目時拋出 `gradeCN is not defined`（第 65 行），需先修復腳本，才能取得真實 CQI-P 分數。

**驗收者（PM）**：Claude Code。Cursor 完成後，由 Claude Code 讀取 Report 進行驗收。

---

## 🎯 任務目標

1. 修復 `evaluate_question_quality.js` 的國語評估 bug
2. 重新評估三版本各課真實 CQI-P 分數
3. 將 CQI-P < 5.5 的題目補強或重出，使各課 CQI-P 平均 ≥ 5.5
4. 補強完成後，各課具備進入盲測的資格

> ⚠️ **盲測不在本 JOB 範圍**，另立 `question_verify` JOB 執行。

---

## 🚧 任務邊界

**本次只做：**
- 修復 `evaluate_question_quality.js` 第 65 行 `gradeCN` 錯誤
- 執行評估腳本，取得三版本各課 CQI-P 真實分數
- 找出 CQI-P < 5.5 的課次與題目，進行補強或重出
- 補強後確認每課 CQI-P 平均 ≥ 5.5

**本次不做：**
- 盲測驗證（另開 `question_verify` JOB）
- 修改 KL3/KL4 研究文件（除非發現明確錯誤，須回報遺留問題）
- 修改任何規範文件
- 調整 `is_publishable` 欄位（此為盲測後才能決定的欄位）

---

## 📖 執行步驟

### Phase 1：修復評估腳本

1. 讀取 `scripts/evaluate_question_quality.js`，定位第 65 行 `gradeCN is not defined` 錯誤
2. 找出 `gradeCN` 應該從哪裡取得（查看同腳本中其他年級的處理方式）
3. 修復 bug，確認國語可正常評估（測試指令見下方）

### Phase 2：評估現況

```bash
# 執行評估（修復後）
node scripts/evaluate_question_quality.js question/platform/G3/Chinese/S2/KangHsuan
node scripts/evaluate_question_quality.js question/platform/G3/Chinese/S2/HanLin
node scripts/evaluate_question_quality.js question/platform/G3/Chinese/S2/NanYi
```

記錄各版本各課的 CQI-P 分數，整理出低分清單（CQI-P < 5.5）。

### Phase 3：補強低分題目

- 依 `knowledge/1_課綱研究/國語/G3_S2_國語_發展綱要.md` 與各課 KL4 素材補強
- 重點修改方向：
  - `scenario` 欄位空白或不具體 → 補充真實情境
  - `explanation` 過於簡短 → 說明完整推理步驟
  - `commonMisconception` 缺失 → 填入典型錯誤思考
  - 題目認知層次偏低（全為記憶題）→ 補充推論、應用型題目
- 補強後重跑評估腳本確認達標

### Phase 4：更新 manifest

- 各版本 `manifest.json` 更新（若題數有異動）

---

## 📖 執行前必讀

| 文件 | 用途 |
|:--|:--|
| `question/README_出題與品管準則.md` | 出題原則、JSON 格式規範、CQI-P 各項配分說明 |
| `question/README_驗證與盲測準則.md` | 上版門檻定義（v4.2，2026-04-08 更新） |
| `knowledge/1_課綱研究/國語/G3_S2_國語_發展綱要.md` | 三下國語課綱與命題規格 |
| `knowledge/1_課綱研究/國語/KL3_國語_研究進度_課文與索引.md` | 各課課文素材索引 |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取 `question/README_出題與品管準則.md`
- [ ] 已讀取 `question/README_驗證與盲測準則.md`（v4.2）
- [ ] `evaluate_question_quality.js` 第 65 行 bug 已定位
- [ ] **已確認執行模型（兩層）**：
  - Cursor 本身作業模型：`composer-2`（已核准）
  - 腳本內 API 出題模型：`gemini-3-flash-lite`（已核准，免費額度優先）
- [ ] **已確認使用金鑰**：[金鑰：___________]
- [ ] 三版本題庫路徑確認：
  - `question/platform/G3/Chinese/S2/KangHsuan/`（12 課，467 題）
  - `question/platform/G3/Chinese/S2/HanLin/`（12 課，481 題）
  - `question/platform/G3/Chinese/S2/NanYi/`（12 課，395 題）

---

## ✅ 驗收 Checklist (Acceptance)

> 每項需附佐證數值，Claude Code（PM）驗收時會核對。

- [ ] `evaluate_question_quality.js` 執行國語不再拋出錯誤 — 佐證：貼上執行結果截圖或輸出
- [ ] 康軒各課 CQI-P 平均 ≥ 5.5 — 實際值：{填入各課數值}
- [ ] 翰林各課 CQI-P 平均 ≥ 5.5 — 實際值：{填入各課數值}
- [ ] 南一各課 CQI-P 平均 ≥ 5.5 — 實際值：{填入各課數值}
- [ ] 每題含 `scenario`（非空）、`explanation`、`commonMisconception`
- [ ] `answer_index` 與 `explanation` 一致（無系統性錯誤）

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 產出 `jobs/JOB-164-Report.md`（依模板）
- [ ] Report 包含：修復前/後 CQI-P 對照表、各課補強摘要、異動檔案清單
- [ ] 異動清單列出所有修改的 JSON 完整路徑
- [ ] 執行 `node scripts/job_manager.js close JOB-164`
- [ ] 通知 Claude Code（PM）進行驗收

---

## 📊 預期成果表格（Report 中填入）

| 版本 | 課次 | 補強前 CQI-P | 補強後 CQI-P | 補強題數 |
|:--|:--|:--:|:--:|:--:|
| 康軒 | L1 | ___ | ___ | ___ |
| 康軒 | L2 | ___ | ___ | ___ |
| … | … | … | … | … |
| 翰林 | L1 | ___ | ___ | ___ |
| … | … | … | … | … |
| 南一 | L1 | ___ | ___ | ___ |
| … | … | … | … | … |

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| 腳本修復 | HH:mm | HH:mm | - | |
| 評估現況 | HH:mm | HH:mm | - | |
| 題目補強（康軒） | HH:mm | HH:mm | - | |
| 題目補強（翰林） | HH:mm | HH:mm | - | |
| 題目補強（南一） | HH:mm | HH:mm | - | |
| **總計** | — | — | **-** | — |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: {真實Meta中的模型代碼} | 執行者: Cursor
