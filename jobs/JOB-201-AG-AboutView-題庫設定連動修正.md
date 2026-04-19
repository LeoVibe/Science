*Created by AG at 2026-04-19 18:30*

`last_updated`: 2026-04-19 19:10
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-201-AG-修正-AboutView-題庫設定連動

**`job_type`**：`engineering`
**`executor`**：Claude Code（使用者授權例外——使用者請求即時修復，免派 Cursor）

## 📌 任務背景

admin 後台 `/admin/library/manage` 可設定各年級、學期、科目、出版社的開放狀態，但前台「題庫總覽」(AboutView library tab) 完全不受此設定影響，所有科目一律顯示。

根本原因：
1. `AboutView.tsx` 有自己獨立的 `useState<LibraryConfig>` 只從 `localStorage` 讀取，且 `AboutViewProps` 沒有 `libraryConfig` prop。
2. `Index.tsx` 已正確呼叫 `fetchSiteSettings()` 取得 `library_config`（公開 API），但渲染 `<AboutView>` 時沒有傳入該 prop——`libraryConfig` 被丟棄。
3. 過濾邏輯只攔截 `enabled === false` 的科目，不攔截 subjects dict 中完全未出現的科目（`undefined`），造成 admin 未明確設定的科目也顯示。

## 🎯 任務目標

- `AboutView` 的題庫總覽，與 admin 後台設定完全連動
- G5 S2 只顯示國語（admin 設定）✅
- G4 S2 只顯示國語＋數學（admin 設定）✅
- 本機瀏覽器驗證通過

## 🚧 任務邊界

本次任務只做：
- 修正 `AboutView.tsx` props 介面，接收 `libraryConfig` 並移除 localStorage 自讀邏輯
- 修正 `Index.tsx` 傳入 `libraryConfig` prop
- 修正 `AboutView.tsx` subjects 過濾條件（allowlist 邏輯）

本次任務不做：
- 修改 admin UI 本身
- 修改 `libraryAvailability.ts`（nav 反灰邏輯）
- 修改後端 Worker

## 📖 執行步驟（已完成）

1. 讀取 `AdminLibraryManager.tsx`、`AboutView.tsx`、`api.ts`、Worker `index.ts` 確認資料流
2. 確認 `/api/settings`（公開 API）已回傳 `library_config`，`Index.tsx` 已正確取得
3. 修改 `AboutView.tsx`：新增 `libraryConfig` prop、移除 `useEffect` localStorage 讀取、移除多餘 `useEffect` import
4. 修改 `Index.tsx`：`<AboutView>` 加入 `libraryConfig={libraryConfig}`
5. 修改 `AboutView.tsx` 過濾邏輯：`subjects dict 有設定時` 改為 allowlist（只顯示 `enabled === true` 的科目）
6. `npx tsc --noEmit` 零錯誤
7. 本機瀏覽器驗證（連線生產 Worker API）

## 📜 關鍵修改檔案

| 檔案路徑 | 修改內容 |
|:--|:--|
| `apps/v3_eidos/src/components/AboutView.tsx` | 新增 `libraryConfig` prop、移除 localStorage useEffect、修正 subjects 過濾邏輯 |
| `apps/v3_eidos/src/pages/Index.tsx` | `<AboutView>` 加入 `libraryConfig={libraryConfig}` |

## ✅ 啟動 Checklist (Pre-Flight)

- [x] 已讀取 `apps/v3_eidos/src/components/AboutView.tsx`
- [x] 已讀取 `apps/v3_eidos/src/pages/Index.tsx`
- [x] 已讀取 `apps/v3_eidos/src/data/api.ts`
- [x] 已讀取 `scripts/workers/api/src/index.ts`
- [x] 已確認執行模型：claude-sonnet-4-6（Claude Code）
- [x] 已閱讀「任務邊界」並確認本次範圍

## ✅ 驗收 Checklist (Acceptance)

- [x] TypeScript 編譯：`npx tsc --noEmit` → 0 errors
- [x] 本機瀏覽器 G5 S2 題庫總覽：僅顯示「國語」（admin 設定：國語 enabled, 其餘 disabled）
- [x] 本機瀏覽器 G4 S2 題庫總覽：僅顯示「國語」＋「數學」（英語/自然/社會 隱藏）
- [x] API 網路請求確認：`https://eidos-api.eidosedu.workers.dev/api/settings` → 200 OK
- [x] `libraryConfig` 由 `Index.tsx` 取自 API，透過 prop 傳入 `AboutView`（無獨立 localStorage 讀取）

## ✅ 成果 Checklist (Deliverables)

- [x] 異動檔案清單：
  - `apps/v3_eidos/src/components/AboutView.tsx`（prop 介面、移除 useEffect、修正過濾邏輯）
  - `apps/v3_eidos/src/pages/Index.tsx`（傳入 libraryConfig prop）
- [ ] 已執行 `/pj_sync`（待結案後執行）
- [ ] 已部署至正式機（待使用者確認後執行）

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Claude Code
