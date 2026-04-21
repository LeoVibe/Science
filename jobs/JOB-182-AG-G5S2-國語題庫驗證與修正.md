*Created by Claude Code at 2026-04-12*

`last_updated`: 2026-04-12
`updated_by`: Claude Code

# JOB-182-AG-G5S2-國語題庫驗證與修正

**`job_type`**: `question_verify` + `data_ops`
**`executor`**: Cursor（全權負責，包括選擇驗證模型）

---

## 📌 任務背景

JOB-178（G5S2 國語盲測）發現 **37.3% 題庫與課文脫節**（602/1616 題）。根據盲測日誌分析，問題根源不在品質（CQI 均 QL3+），而在於**題目內容與教科書課文不對應**。

本 JOB 委託 Cursor 對題庫進行驗證與修正，並決定是否啟用 Composer 2.0 進行精準判斷。

---

## 🎯 任務目標

1. 逐課驗證題庫內容與課文（KL4 研究檔 + 原始素材庫）的對應性
2. 刪除無相關性的題目（預估 600± 題）
3. 執行修正後題庫的重盲測（用現有模型，除非 Cursor 判定需用 Composer 2.0）
4. 產出驗證統計與修正報告

---

## 🚧 任務邊界

**本次任務只做**：
- 驗證題庫與 KL4 研究材料的相關性
- 刪除無相關性題目（標記 `marked_for_deletion: true` → 實際刪除）
- 重新執行盲測（驗證刪除後的效果）
- 若判定品質仍差，**Cursor 可自主決定**啟用 Composer 2.0 進行更精準驗證

**本次任務不做**：
- 修改題目內容或選項
- 修改 KL4 研究檔
- 修改任何規範文件

---

## 📖 驗證與執行步驟

### Phase 1: 相關性驗證（三版本 × 12 課 = 36 檔）

**對每個題檔 `question/platform/G5/Chinese/S2/[版本]/*.json`：**

1. 讀取對應課次的 KL4 研究檔案：
   - `knowledge/1_課綱研究/國語/五下/[版本]/KL4_五下_[版本]_L*_[課名]_單課研究紀錄.md`
   - `knowledge/1_課綱研究/國語/五下/[版本]/KL4_五下_[版本]_L*_[課名]_考古題與討論.md`

2. 驗證規則（任意滿足一項即保留）：
   - 題目內容與 KL4「課程名稱」或「R3 深度研發關鍵點」有明確對應
   - 題目內容在考古題檔中有相似知識點
   - 題目涉及課文主題（見 `KL4_五下_國語_原始研究素材庫.md` 之課程名稱與主題）

3. 若不滿足上述任何條件，標記：`marked_for_deletion: true`，附註理由
   - 參考盲測 `blind_eval_mismatch.ai_reasoning` 中的「脫節」標記

### Phase 2: 批量刪除

從所有 JSON 檔的 `questions` 陣列中移除 `marked_for_deletion: true` 的題目

### Phase 3: 重盲測（視情況）

- **若判定刪除後品質應可改善**：執行 `node scripts/run_blind_eval.js question/platform/G5/Chinese/S2 --force`
- **若判定需更精準驗證**：**Cursor 可自主切換至 Composer 2.0**（只有 Cursor 可用），重新驗證邊界案例

### Phase 4: 統計與報告

產出：
- 版本別刪除率（翰林 / 康軒 / 南一）
- 課次別刪除率（L1-L12）
- 刪除前後題數對比
- 重盲測結果（若執行）

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `knowledge/1_課綱研究/國語/五下/KL4_五下_國語_原始研究素材庫.md` | 課文名稱、主題、R3 考點 |
| `knowledge/1_課綱研究/國語/五下/[版本]/KL4_*.md` | 逐課單課研究（課程目標、迷思、考古題） |
| `question/platform/G5/Chinese/S2/[版本]/*.json` | 待驗證題庫檔 |
| `.logs/JOB-178-blind-eval.log` | 盲測失敗原因參考 |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取 `KL4_五下_國語_原始研究素材庫.md`
- [ ] 已理解三版本課文名稱與主題（見素材庫表格）
- [ ] 已確認盲測脫節標記邏輯（mismatch.ai_reasoning 含「脫節」「無關」「錯置」）
- [ ] 已確認 Composer 2.0 可用性（若決定使用）

## ✅ 驗收 Checklist (Acceptance)

- [ ] 36 檔全數驗證完成，刪除標記正確
- [ ] 刪除後題數符合預期（預估削減 600± 題）
- [ ] JSON 結構完整性驗證通過（`validate_review_fields.js` → 0 errors）
- [ ] 若執行重盲測：Match Rate、CQI-P 等統計已產出

## ✅ 成果 Checklist (Deliverables)

- [ ] 修正後 36 檔題庫已產出（實際刪除 `marked_for_deletion: true` 項目）
- [ ] `jobs/JOB-182-Report.md` 產出（版本別、課次別統計；使用模型說明）
- [ ] 若執行重盲測：盲測日誌存檔（`.logs/JOB-182-blind-eval.log`）
- [ ] `/pj_sync` 已執行
- [ ] Discord 摘要已發送

---

## ⏱️ 執行時間回報

| 階段 | 預估 | 實際 |
|:--|:--|:--|
| Phase 1 驗證 | 2-3h | — |
| Phase 2 刪除 | 0.5h | — |
| Phase 3 重盲測（若執行） | 1-2h | — |
| Phase 4 報表 | 0.5h | — |
| **總計** | **4-6h** | **—** |

---

## 真實回報

＄作業匯總：Token數: — | 花費: — | 使用模型: [Cursor 自主決定] | 執行者: Cursor
- [ ] 全版本 Match Rate ≥ 85% — 實際值：{填入各版本數值}
- [ ] CQI-P ≥ 5.5（受影響課次重新驗證）— 實際值：{填入}
- [ ] Mismatch 逐題分析完成，每筆附原因說明（AI 錯 / answer_index 錯）
- [ ] §2.5 超門檻課次已處理（封鎖 or 修正）

## ✅ 成果 Checklist (Deliverables)
- [ ] 盲測日誌 / 輸出已附於 Report
- [ ] 進度總表 `docs/進度彙整_題庫研發與產出.md` 已更新 Match Rate 欄
- [ ] 已執行 `/pj_sync`
- [ ] 產出 JOB-XXX-Report.md，Mismatch 逐題分析清單已列出

## ⏱️ 執行時間回報
| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| 盲測執行 | HH:mm | HH:mm | - | |
| Mismatch 分析 | HH:mm | HH:mm | - | |
| 修正 + CQI-P | HH:mm | HH:mm | - | |
| **總計** | — | — | **-** | — |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: {真實Meta中的模型代碼} | 執行者: {AG|Cursor|Claude}
