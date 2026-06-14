*Created by Claude at 2026-06-14 13:30*

`last_updated`: 2026-06-14 13:30
`updated_by`: Claude Code (claude-opus-4-8[1m])

# JOB-258 結案報告

**`job_type`**：`engineering`
**`executor`**：Claude

## 📊 成果摘要
建立常駐五層「上版前測試清單」SOP，並修復長期假綠燈的題庫載入測試（6 假失敗 → 28/28 全綠，新增回饋 id 守門測試）。新建兩支對帳腳本固化「統計過時」與「隱形課」偵測。用 SOP 把最近一個月 18 張 JOB 逐張補驗證、60 個題庫組合程式面抽檢。過程揭露 5 個需後續處理的缺口（含 1 個需 PM 裁定的規格矛盾）。本計劃只驗證、不修缺陷（缺陷另開單）。

## 📂 異動清單
| 檔案 | 類型 | 說明 |
|:--|:--|:--|
| `docs/上版前測試清單.md` | 新增 | 五層 SOP（取代舊 ei_release 6 條） |
| `apps/v3_eidos/src/data/questionLoader.test.ts` | 修改 | mock 補 is_publishable；新增 id 守門測試；6 假失敗→9 全綠 |
| `scripts/audit_library_stats_vs_actual.mjs` | 新增 | 快照 vs 實算對帳（分總數過時/上架定義差異） |
| `scripts/audit_hidden_lessons.mjs` | 新增 | 隱形課偵測（盲測≥25 但上架 0） |
| `docs/superpowers/specs/2026-06-14-上版前測試計劃-design.md` | 新增 | 設計文件 |
| `docs/superpowers/plans/2026-06-14-上版前測試計劃.md` | 新增 | 實作計劃 |

## ✅ 五層 SOP 執行結果
| 層 | 結果 |
|:--|:--|
| L0 提交閘門 | ✅ pre-commit 全通過 |
| L1 資料完整性 | ✅ D-INT-1~4=0；總數過時 0；⚠️上架定義差異多筆；❌隱形課 1 |
| L2 建置 | ✅ tsc 0、vitest 28/28、build exit 0 |
| L3 前端 UI 黑箱 | ◐ JOB-256 期間已實測：選課/答題/回饋200/BETA/數英擋/about；未逐項重跑統計頁/結算頁 |
| L4 線上 smoke | ✅ JOB-256 已驗：正式站回饋 200、選單三科、about 06/14 |

## 📋 18 張 JOB 逐張驗證（彙整）
**研究類 12 張（235~247）**：全結案、考古題編碼合法率 100%。缺口：JOB-236 有 11 份 extract_failed 未處理；JOB-237 國數英 55 份 L2 未補抽；JOB-243/245 spec v1.1→v1.2 待升級；JOB-246/247 少量 needs_human_review 與低覆蓋 codes 待 L4 補強。
**題庫上線類 5 張**：248 康軒自然已由 253 升 QL4 上線 ✅；253 三下自然康軒上線、翰林南一已隨後上線 ✅；254/255 隱形課已修 ✅；**257 未結案（交接中）**。
**前端類 1 張（256）**：已完成並線上驗證 ✅。

## ⚠️ 缺口清單（依嚴重度，皆建議另開單，本計劃不修）

| # | 嚴重 | 缺口 | 建議 |
|:--|:--|:--|:--|
| 1 | 🔴 需裁定 | **上架數定義矛盾**：about 顯示採「包級達標全算」、loader 採「逐題 is_publishable」。最嚴重 G5 社會翰林顯示 165 題、實際可載入 **0** 題；G5 國語翰林顯示 426、實載 184 | PM 裁定上架定義；統一 generate_library_stats 與 loader，再修 about 數字 |
| 2 | 🔴 未結案 | **JOB-257**：三下社會 300 題 `_new.json` 未覆蓋正式檔、五下社會 450 題待 sync、manifest count 未更新 | 接手完成「覆蓋+sync+部署」 |
| 3 | 🟡 隱形課 | **G5 國語翰林 L8**：盲測通過 45 題卻 is_publishable=0（同 JOB-254 類型） | 重盲測確認後回寫上架 |
| 4 | 🟡 資料 | **S1 題庫 answer_index = null**（缺正解），且不在 verify_ui_data_integrity 範圍、publisherStats 無 S1（前端載入行為不明） | 確認 S1 前端是否開放；若開放需補正解或封閉 |
| 5 | 🟡 研究斷點 | JOB-236 11 份 extract_failed、JOB-237 國數英 55 份 L2 未補抽、spec v1.1→v1.2 | 視出題排程另開研究單 |

## 🔄 同步確認
- [x] 已執行 /pj_sync 全域知識沉澱（2026-06-14）
- [x] `docs/README_專案發展紀錄.md` 已新增 JOB-258
- [x] `docs/上版前測試清單.md` 為新增常駐 SOP

## ⚠️ 遺留問題
見上「缺口清單」5 項。其中 #1（上架定義）需 PM 裁定方向，#2（JOB-257）為最緊急的未上架題庫交接。

## 🔧 技術筆記
- 假綠燈根因：loader 後加 `is_publishable === true` 過濾，但測試 mock 未同步補欄位 → 全被濾掉回 0。修法是 mock 對齊 production。
- 對帳腳本揭露的「上架定義矛盾」源於 `generate_library_stats.js:197`（品質非 QL1 即把總數當上架數），與 loader 逐題過濾哲學不同。
- 60 組合快掃「越界 1013」多為 S1 `answer_index: null`，非 S2 問題（S2 經 verify_ui_data_integrity D-INT 全 0）。

## 🔍 驗收確認
| 欄位 | 內容 |
|:--|:--|
| 驗收者 | （待 user 填寫） |
| 驗收結果 | 待驗收 |

## 真實回報
＄作業匯總：Token數:- | 花費: - | 使用模型: claude-opus-4-8[1m] | 執行者: Claude
