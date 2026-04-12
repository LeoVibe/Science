`last_updated`: 2026-04-12  
`updated_by`: Cursor Agent（Claude 子系統）

# JOB-182-Report — G5S2 國語題庫 KL4 相關性驗證與修正

## 執行摘要

| 項目 | 狀態 |
|:---|:---|
| Phase 1 規則設計與腳本 | **完成**：`scripts/job182_prune_g5s2_chinese_by_kl4.js` |
| Phase 2 刪題（預期 631 題） | **邏輯已驗證**；見下方「檔案完整性事件」 |
| Phase 3 重盲測 | **部分完成**（僅約 20/36 檔寫入日誌）；`run_blind_eval.js` 已補原子寫入 |
| `validate_review_fields.js` | **0 errors**（全庫掃描時） |
| `/pj_sync` | **已更新** `docs/進度彙整_題庫研發與產出.md` 備註欄 |
| Discord 摘要 | **未執行**（本環境無 Webhook／使用者未提供） |

## 驗證規則（對齊派工單）

刪除條件為**任一成立**：

1. **盲測脫節訊號**：`blind_eval_mismatch.ai_reasoning` 含下列之一：`無效題目`、`無效命題`、`完全無關`、`並未出現在提供的`（對齊 JOB-178 大量「與課文無關」敘述之核心子集，約 589 題）。
2. **《》引用不在 KL4**：題幹／選項／說明中《…》子字串未出現於同課次兩份 KL4（單課研究＋考古題）合併正文，且與 KL4 檔名課名不符（約 42 題）。

保留題於 `--apply` 時會：**刪除 `blind_eval_mismatch`、將 `blind_evaluation` 設為 `false`**，並寫入 `meta.job182_prune_applied_at`，**避免重複執行刪題腳本時再次依舊盲測字串把題庫刪光**。

## 首次刪題統計（目標態，見 `.logs/JOB-182-prune-intended-summary.json`）

- 刪除前：1616 題；刪除後：**985** 題；刪除：**631** 題（≈600±，符合派工單預估）。
- 刪除原因：盲測訊號 589、`《》` 不在 KL4 語料 42。
- 版本別刪除量：翰林 240、康軒 202、南一 189。
- 逐檔明細：執行當下 stdout 已列印；刪題列索引於 `.logs/JOB-182-prune-detail.jsonl`。

## 重盲測（`Gemini-3.1-Flash-Lite`）

- 指令：`node scripts/run_blind_eval.js question/platform/G5/Chinese/S2 --force`
- 日誌：`.logs/JOB-182-blind-eval.log`
- 日誌末尾彙總（**僅涵蓋當次實際跑完之題數子集**）：`命中: 366 / 失敗: 261 (58.4%)`  
  因執行過程被中斷／競態，**未對全部 985 題完成一輪盲測**，此數字**不得**解讀為全庫 Match Rate。

## 檔案完整性事件（必讀）

後續檢查發現 `question/platform/G5/Chinese/S2` 內多檔 **`questions` 為空陣列或題數與預期不符**，與「僅刪 631 題」之目標態不一致。可能原因包含：

- 盲測程序被強制中斷時，舊版 `run_blind_eval.js` 以非原子方式覆寫整檔 JSON；
- 若在未清 mismatch 的情況下**重複執行**刪題腳本，理論上可能再次大量刪除（本次已於腳本內修補）。

**已採取之工程防護**：

1. `scripts/run_blind_eval.js`：改為 `writeJsonAtomic`（先寫暫存檔再 `rename`）。
2. `scripts/job182_prune_g5s2_chinese_by_kl4.js`：`--apply` 時清除保留題之 `blind_eval_mismatch` 並重設 `blind_evaluation`。

**目前空題檔（11）**（執行當下）：  
`HanLin/G5_S2_CHI_HANLIN_L12.json`、`KangHsuan` 之 L9/L10/L12、`NanYi` 之 L1/L5-L7/L10-L12。

### 建議復原步驟（PM／維運）

1. 自 **Time Machine／第二工作複本／Cursor Local History** 還原整個 `question/platform/G5/Chinese/S2/` 至執行 JOB-182 **之前**。
2. 拉取本分支之腳本與 `run_blind_eval` 修正後，**僅執行一次**：  
   `node scripts/job182_prune_g5s2_chinese_by_kl4.js --apply`
3. 以 **單一長時程工作階段** 跑完：  
   `node scripts/run_blind_eval.js question/platform/G5/Chinese/S2 --force 2>&1 | tee .logs/JOB-182-blind-eval-full.log`  
   直至日誌出現唯一一行 `盲審大調查結束`。

## Composer 2.0

本次未另開 Composer 2.0 邊界複核；刪題規則為可重現之決定性條件＋KL4 字串比對。若還原後需對「灰色地帶」逐題仲裁，建議另開派工單限定樣本數後再啟用。

## 使用模型（據實）

- 刪題規則：本對話之 Cursor 代理（無獨立 API Meta）。
- 盲測：日誌標示 `Gemini-3.1-Flash-Lite`（`verifying_model` 欄位與日誌一致）。

## 遺留問題

- 題庫檔需**備份還原**後才能宣告 JOB-182 產物面驗收完成。
- Discord 摘要未送出。
- 全庫 CQI-P 重算未執行（非本 JOB 必須，但還原後建議跑 `evaluate_question_quality.js` 對 G5/S2 國語路徑）。

## DoD／pj_sync

- [x] 已執行 `/pj_sync` 範圍內可完成項目：`docs/進度彙整_題庫研發與產出.md`、`docs/README_專案發展紀錄.md` 已更新；本 JOB 無 UI 變更，未改 `docs/網站功能規格書.md`。

---

＄作業匯總：Token數: 未提供 | 花費: 未提供 | 使用模型: 未提供（Cursor 對話環境無法讀取 billing Meta）| 執行者: Cursor
