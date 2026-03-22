# JOB-097 完工報告：v1 / v2 相容靜態題庫（路徑與 meta 對齊）

**最後更新**：2026-03-23 15:05  
**執行者**：Cursor

## 摘要

- 修正 `apps/v1_science/questions` 符號連結（`../../question`），使 `import.meta.glob('/questions/platform/**/*.json')` 於建置時可打包 `question/platform` 內容。
- 更新 `apps/v2_currisite/src/data/index.js`：fetch 路徑改為與 v3 相同的英文目錄（`Science`、`KangHsuan` 等）；`meta` 驗證改為 `metaMatchesUi`，相容 `G3`/`Science`/`KangHsuan` 等現行平台檔寫法。
- 新增 `question/legacy_static/README.md` 維運說明與 `scripts/verify_legacy_question_bank.mjs` 離線驗證。
- 已執行 `node scripts/create_v2_snapshot.js`、重建 v1 / v2，並將 `dist` 同步至 `apps/v3_eidos/public/history/v1_science`、`v2_currisite`。

## 變更檔案

| 路徑 | 說明 |
|------|------|
| `apps/v1_science/questions` | 符號連結（移除錯誤的 `questions 2`） |
| `apps/v2_currisite/src/data/config.js` | `SUBJECT_PLATFORM_FOLDER`、`PUBLISHER_PLATFORM_FOLDER` |
| `apps/v2_currisite/src/data/index.js` | 路徑組裝與 `metaMatchesUi` |
| `question/legacy_static/README.md` | 歷史版題庫維運與同步流程 |
| `scripts/verify_legacy_question_bank.mjs` | 離線驗證腳本 |
| `apps/v3_eidos/public/history/v1_science/*` | v1 建置產出 |
| `apps/v3_eidos/public/history/v2_currisite/*` | v2 bundle + `create_v2_snapshot` 題庫快照 |

## 驗證紀錄

- `node scripts/verify_legacy_question_bank.mjs`：通過（G3 自然／康軒／`Sci1_認識植物.json`）。
- `npm run build`（`apps/v1_science`）：通過；主 bundle 約 3.5MB（含題庫 JSON）。
- `npm run build`（`apps/v2_currisite`）：通過。

## 讀取與「撰寫」

- **讀取**：v1 編譯期打包；v2 執行期 fetch `history/v2_currisite/question/platform/...`（與 `./question/platform` 相對路徑一致）。
- **撰寫**：題庫內容僅於倉庫內編輯 `question/platform` 後再跑快照與建置；答題紀錄仍寫入瀏覽器 LocalStorage（非寫回 JSON）。

## 回滾

- 還原 `apps/v2_currisite/src/data/index.js`、`config.js` 與 v1 符號連結；自 git 取回 `public/history/*` 舊資產。
