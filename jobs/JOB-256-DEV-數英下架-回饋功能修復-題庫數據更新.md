*Created by USER at 2026-06-14 12:00*

`last_updated`: 2026-06-14 12:35
`updated_by`: Claude Code (claude-opus-4-8[1m])

# JOB-256-DEV-數英下架-回饋功能修復-題庫數據更新

**`job_type`**：`engineering`
定義與邊界見 **`docs/README_任務派工準則.md`** 第二章。

> 補件說明：本單為**事後補件**。任務於對話中由使用者直接指派並即時執行、驗證、上版完成，後依使用者要求補開派工單與 Report 留痕。

## 📌 任務背景
1. **回饋功能失效**：正式站（exam15.pages.dev）做題頁「問題回報」送出一律失敗（toast「回饋送出失敗」），學生無法回報題目問題。
2. **數學、英語品質未達標**：需先全面下架（選單 + 路由），避免學生練到未驗證題目。
3. **題庫總覽數據過時**：`libraryStats.json` 停在 2026/04/20，4/20 後三下自然重出上線、社會重出等內容未反映，G3 自然題數低估（顯示 120/150，實為 200）。
4. **品質未達 QL4 的題庫**（國自社中 QL3 以下）需在前台標示為測試中。

## 🎯 任務目標
- [A] 做題頁「問題回報」送出回 HTTP 200，學生可成功送出回饋。
- [B] 全站科目選單僅顯示「國語/自然/社會」；數學、英語選單入口移除，且 `/{g}/mat|eng/...` 深連結無法進入。
- [C] QL3 以下題庫（國自社）進入後顯示「BETA」標記。
- [D] `libraryStats.json` 重生成，前台題庫總覽數據與實際題庫一致（`lastUpdated` = 2026/06/14）。
- 以上改動 commit、push、部署至正式站並完成線上驗證。

## 🚧 任務邊界

本次任務只做：
- 前端 `apps/v3_eidos/src` 內 A/B/C 三項 UI/資料層改動
- 重生成 `libraryStats.json`（src + public 兩份）
- commit + push + 部署 + 線上驗證

本次任務不做（遇到以下情況請停止並回報）：
- 修改規範文件
- 變更題庫 JSON 題目內容（A 修法僅在 loader runtime 補題目識別碼，不改 JSON）
- 數英以外科目的下架、或 QL 判定邏輯的改動
- 後端 API 與資料庫變更（經查後端 `/api/feedback` 正常，根因在前端）

## 📖 執行步驟（實際）
1. **Debug A**：定位回饋失效根因 — `questionLoader.ts:230` 標準題庫分支以 `...q` spread，題庫 JSON 無 `id` 欄位 → `current.id` 為 `undefined` → 送出 body 缺 `questionId` → 後端回 400。
2. **修 A**：`questionLoader.ts` 該分支補 `id: q.id ?? \`${lesson}_q${i + 1}\`` fallback。
3. **修 B**：`config.ts` 新增 `DISABLED_SUBJECTS`／`isSubjectEnabled`，`getSubjectsByGrade` 改 filter；`Index.tsx` 三道防線（選單過濾、深連結 useLayoutEffect/useEffect 判定、未開放科目自動切換）擋數英。
4. **修 C**：`libraryAvailability.ts` 新增 `getLibraryQuality`／`isBetaLibrary`；`Index.tsx` 於 menu/quiz 對非 QL4 題庫顯示「BETA」標記。
5. **做 D**：`node scripts/generate_library_stats.js` 重生成。
6. **驗證**：tsc、verify_ui_data_integrity --gate、loader 測試 baseline 對照、本機（localhost:8080）+ 線上瀏覽器抽測。
7. **上版**：commit `3e9111ca` → push main → GitHub Actions（GitHub Pages + Cloudflare Pages exam15）→ 線上驗證。
8. 依使用者要求將 beta 文案精簡為「BETA」（後續 commit）。

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| `docs/技術設定/前端開發與AI實作守則.md` | 前端三層測試硬閘 |
| `apps/v3_eidos/src/data/questionLoader.ts` | A 修復點 |
| `apps/v3_eidos/src/data/config.ts` | B 停用科目單一真相 |
| `apps/v3_eidos/src/pages/Index.tsx` | B 路由攔截 + C beta 標記 |
| `apps/v3_eidos/src/utils/libraryAvailability.ts` | C QL 查詢 |
| `scripts/generate_library_stats.js` | D 數據重生成 |

## ✅ 啟動 Checklist (Pre-Flight)
- [x] 已讀取：`docs/技術設定/前端開發與AI實作守則.md`、`docs/README_通用作業準則.md`、`question/README_出題與品管準則.md`、`question/README_驗證與盲測準則.md`
- [x] **執行模型**：claude-opus-4-8[1m]（PM 親自實作，使用者直接指派授權）
- [x] 金鑰／QPM：不適用（純前端改動，無 API 批次呼叫）
- [x] 已閱讀「任務邊界」並確認本次範圍

## ✅ 驗收 Checklist (Acceptance)
> engineering 任務，以三層驗證 + 線上實測為準（非 CQI）。

- [x] **TypeScript 型別檢查通過**：`tsc --noEmit` exit 0
- [x] **資料完整性閘門通過**：`verify_ui_data_integrity.mjs --gate` → 6929 題、D-INT-1~4 皆 0、exit 0（21 處 D-INT-5 為既有 warning 不擋）
- [x] **loader 單元測試無回歸**：6 failed | 2 passed，git stash 對照確認 baseline 相同（本次改動零新增失敗）
- [x] **A 線上驗證**：exam15 做題頁送出回饋 → network 200（修復前 400）；body 含 `questionId:"L2_q34"`（修復前缺鍵）
- [x] **B 線上驗證**：選單僅國自社；`/g4/mat/s2/hlm` 直連被導回 `/g3/chi/s2/nani`
- [x] **C 驗證**：G5 國語（QL3）顯示 BETA 標記
- [x] **D 線上驗證**：about/library 顯示「最後更新 2026/06/14」、G3 自然 200/200/200 QL4

## ✅ 成果 Checklist (Deliverables)
- [x] 異動檔案清單（見下 Report）
- [x] 已部署正式站並完成線上驗證
- [ ] 進度總表 / `/pj_sync`（本單為前端工程，非題庫產出；如需同步進度彙整於結案時補）
- [x] 產出 JOB-256-Report.md

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:- | 花費: - | 使用模型: claude-opus-4-8[1m] | 執行者: Claude
（Token/花費無法從 Meta 精確取得，依規範填 `-`，不推估）
