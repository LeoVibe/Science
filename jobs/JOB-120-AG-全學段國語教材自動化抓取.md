*Created by AG at 2026-03-28 09:40*

`last_updated`: 2026-03-28 10:45
`updated_by`: Antigravity (Gemini-2.0-Flash)
`version`: 2.0 (全學段採集 + 深度清洗擴張版)

# JOB-120-AG-收藏-全學段國語教材-Grade3-6

## 📌 任務背景
為了建立高品質且 100% 符應課綱的題庫基礎，需要系統性地從 Acerksy 權威來源獲取 3-6 年級、三大出版社（康軒、翰林、南一）的國語科課文全文。傳統瀏覽器模擬速度較慢，現採用自研的高效率 `CURL` 方案進行批量抓取與整合。

## 🎯 任務目標
1. **全量採集 (Source: Acerksy)**：利用自研 `CURL` 引擎，從 Acerksy 部落格獲取國小 3-6 年級、三大出版商 (翰林/康軒/南一) 全學期國語課文。
2. **高效自動化 (Method: CURL + Regex)**：捨棄低效的瀏覽器模擬，改採伺服器端直接請求，將總工時從 16 小時壓縮至 10 分鐘。
3. **資料深度清洗**：移除 HTML 標籤、廣告、測驗與字義解析等非課文雜訊，產出純淨 Markdown 彙整檔。
4. **素材庫規格化**：建立 `KL3_國語科_課名_課文彙整.md` 作為全專案國語教材的單一事實來源 (Single Source of Truth)。

## 📖 A. 階段一：全量採集執行步驟 (已完成)
1. **[Script]**：擴展 POC 腳本為 `produce_chinese_curriculum_vault.py`。
2. **[Batch]**：循環遍歷 Grade 3-6 的所有國語學期播放清單 URL。
3. **[Collect]**：批量下載單課文章並進行初階正則清洗 (Regex Cleaning)。
4. **[Consolidate]**：整合至 `knowledge/1_課綱研究/國語/KL3_國語科_課名_課文彙整.md`。

## 📖 B. 階段二：深度清洗、比對與規格優化 (進行中)
1. **[Clean]**：執行 `clean_curriculum_vault.py`，徹底移除測驗連結、字義解析與廣告雜訊。
2. **[Verify]**：以各學期 `KL3_發展綱要` 為基準，與 `KL3_國語科_課名_課文彙整.md` 進行雙重校對。
3. **[Analysis]**：分析三下 (G3S2) 新舊內容，標註並剔除非真實課文段落。
4. **[Design]**：重新排版 `KL3_三上_國語_發展綱要.md` 等規格文件，視覺化呈現研發重點。

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| `knowledge/README_教材研究規範.md` | 研究標準 |
| `docs/進度彙整_題庫研發與產出.md` | 進度同步 |

## ✅ 啟動 Checklist (Pre-Flight)
- [x] 已讀取：`.agent/workflows/ei_research.md` (如有)
- [x] 已確認前置素材 KL3 索引存在
- [x] **已確認執行模型**：[模型：Gemini 2.0 Flash] 
- [x] **已確認使用金鑰**：[金鑰：Miaw]
- [x] **已確認操作頻次**：[QPM：10 QPM]
- [x] 目標品質：QL4

## ✅ 驗收 Checklist (Acceptance)
- [x] 成功率：課文連結提取率 100%
- [x] 數據量：涵蓋 3-6 年級所有必修課次 (約 300+ 篇)
- [x] 格式：純文字 Markdown，無 HTML 殘留
- [x] 結構：包含 [編號][課名][全文]

## ✅ 成果 Checklist (Deliverables)
- [x] 完整採集 24 個學期、482 篇課文素材。
- [x] 完成 `KL3_國語科_課名_課文彙整.md` 之深度清洗 (2.1 MB -> 1.1 MB)。
- [ ] 完成課名與發展綱要之一致性比對報告。
- [ ] 完成 `KL3_三上_國語_發展綱要.md` 之排版重塑。
- [ ] 執行 `/pj_sync`。
- [ ] 產出最終版 JOB-120-Report.md。

＄作業匯總 ：Token數: --- | 花費: --- | 使用模型: --- | 執行者: AG