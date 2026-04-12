*Created by AG at 2026-04-03 10:30*

`last_updated`: 2026-04-03 10:30
`updated_by`: Antigravity (Gemini-3-Flash)

# JOB-135-USER-南一三下國語題庫品質補完與QL4全線驗證

**`job_type`**: `mixed` (question_prod + question_verify)  
定義與邊界見 **`docs/README_任務派工準則.md`** 第二章。

## 📌 任務目的 (Objective)
本任務核心目標為完成「國小三年級下學期國語科（南一版）」題庫的全課建設。透過補齊缺漏課次並執行 100% 全量盲測，確保最後產出的題庫具備高品質 (CQI ≥ 6.5) 與穩定性，達到發布標準 (QL4)。

## 🎯 任務目標 (Deliverables)
1. **補題達標**：確保南一三下全課（L1-L12, RC1）每課均穩定具備 **30 題** 內容。
2. **QL4 驗證**：執行 100% 全線盲測（ei_verify），Match Rate 需 ≥ 85%。
3. **品質防線**：最終綜合計分 CQI 需達 **6.5**，並完成所有 Mismatch 題目的 MTP 分流裁定。

## 📖 執行手段與方法 (Methodology)
為確保高品質目標能在 Free Tier 環境下不中斷地達成，採取以下優化手段：
1. **環境重置**：需於台灣時間 15:00 (配額重置) 後發動，避免 RPD 封頂阻礙。
2. **混合模型配置**：
   - 補題 (Gen)：選用 3.1 Flash Lite (RPD: 500) 以維持高產能。
   - 驗證 (Verify)：選用 3 Flash Preview (RPD: 20) 進行高品質判定。
3. **限流策略**：固定 QPM=1.5，Batch=5，並開啟 `--conservative` 模式。
3. **題庫補完 (Generation)**：
   - 模型：`gemini-3.1-flash-lite`
   - 範圍：南一三下 L4~L9, RC1
   - 參數：`--conservative --qpm 1.5 --batch 5 --target 30`
4. **全線盲測 (Verification)**：
   - 模型：`gemini-3-flash` (若配額不足則暫以 Lite 代替，標註初步認證)
   - 腳本：`scripts/run_blind_eval.js`
5. **品質結案**：產出 VAT 稽核日誌，確認 CQI ≥ 6.5。

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| `docs/README_任務派工準則.md` | 派工生命週期、`job_type` |
| `docs/技術設定/API_監控分析報告.md` | 本次分析產出之 API 執行憲法 |
| `question/README_驗證與盲測準則.md` | 驗證原則與 MTP 協議 |

## ✅ 啟動 Checklist (Pre-Flight)
- [x] 已讀取：`question/README_驗證與盲測準則.md`, `docs/技術設定/API_監控分析報告.md`
- [x] 已確認前置素材 KL3/KL4 存在：南一三下全課 KL4 已完備
- [ ] **已確認執行模型**：[模型：補題用 3.1 Lite / 驗證用 3 Flash]
- [ ] **已確認使用金鑰**：[金鑰：eidosFree (Yotta)]
- [ ] **已確認操作頻次**：[QPM：1.5 QPM]
- [x] 目標品質：QL4

## ✅ 驗收 Checklist (Acceptance)
- [ ] 南一三下 L1~L12, RC1 每課題數均為 30
- [ ] CQI-P ≥ 5.5
- [ ] CQI-V Match Rate ≥ 85%
- [ ] 最終 CQI ≥ 6.5
- [ ] 完成 Mismatch Triage Protocol (MTP) 分流處理

## ✅ 成果 Checklist (Deliverables)
- [ ] 成果表格填寫完畢
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [ ] 已執行 `/pj_sync`
- [ ] 產出 JOB-135-Report.md

## 真實回報本次對話的模型與花費
＄作業匯總 ：Token數:27500 | 花費: $0.248 | 使用模型: Gemini-3-Flash | 執行者: AG