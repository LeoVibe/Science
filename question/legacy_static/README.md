# 歷史版（v1_science / v2_currisite）相容靜態題庫說明

**最後更新**：2026-03-23 14:45  
**更新者**：Cursor (JOB-097)

## 單一真相來源

- 題庫資料與 v3 相同，一律維護在倉庫根目錄 **`question/platform/`**（英文科目資料夾：`Chinese`、`Math`、`Science`、`SocialStudies`、`English`、`Life`；出版社：`KangHsuan`、`NanYi`、`HanLin`）。
- **不要**為歷史版另建獨立 schema 或平行根目錄題庫。

## v1_science（自然單科、編譯期打包）

- 載入器：`apps/v1_science/src/data/questionLoader.js` 使用  
  `import.meta.glob('/questions/platform/**/*.json')`。
- 專案內需存在符號連結 **`apps/v1_science/questions` → `../../question`**，使 `questions/platform/...` 對應到本倉庫的 `question/platform/...`。
- 變更題庫後請在 `apps/v1_science` 執行 `npm run build`，並將產出同步至 `apps/v3_eidos/public/history/v1_science/`（`index.html` 與 `assets/`）。

## v2_currisite（多科、執行期 fetch）

- 載入器：`apps/v2_currisite/src/data/index.js` 由 **UI 中文**（自然、康軒）對應到上述 **英文路徑** 再 fetch `manifest.json` 與各單元 JSON。
- `meta` 驗證相容：`G3`／`grade_3`、`S1`／`semester_1`、`Science`／`自然`、`KangHsuan`／`kang_hsuan` 等常見寫法均可通過。
- 線上歷史入口使用 `apps/v3_eidos/public/history/v2_currisite/question/platform/` 快照。變更根目錄題庫後請執行：

```bash
node scripts/create_v2_snapshot.js
```

然後在 `apps/v2_currisite` 執行 `npm run build`，並將 `dist/` 內容同步至 `apps/v3_eidos/public/history/v2_currisite/`。

## 驗證

```bash
node scripts/verify_legacy_question_bank.mjs
```

（規則需與 `apps/v2_currisite/src/data/index.js` 內 `metaMatchesUi` 保持同步。）

## 「撰寫」題庫

- 編輯 `question/platform/...` 下 JSON 與 `manifest.json`，格式見 `question/README_題庫格式規範.md`。
- 答題紀錄、統計仍存於瀏覽器 **LocalStorage**（v1：`answerHistory`；v2：`sci_v2_*` 等），與題庫 JSON 無寫回關係。
