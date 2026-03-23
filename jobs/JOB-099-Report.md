# JOB-099 完工報告

**最後更新**：2026-03-23 08:40

## 實作摘要

- 新增 `libraryAvailability.ts`：`hasPublishedLibraryUnits` 讀取 `publisherStats`，列存在且 `units===0`（或無單元且題數為 0）則視為未上架。
- `Index.tsx`：`isLibraryEnabled` = 後台規則 ∧ 靜態 inventory；題庫改為一律完整載入以取得正確分課題數；不可用組合自動切科並 toast。
- `questionLoader.ts`：`categoryCounts` 在 manifest 無有效 `count` 時改由各課題目數加總。
- `libraryStats.json`：補 `G6_S2_英語` 與三社 `units:0`；`G6_S2_自然_NanI` 正名為 `G6_S2_自然_南一`。
- 目錄 `G6/Science/S2/NanI` → `NanYi`，並執行 `sync_v3_public_g6_question.mjs`。

## 驗證

- `npm run test`（`apps/v3_eidos`）通過。
