# JOB-085 完工報告

## 成果

- 將 `question/platform/G6/Chinese/{KangHsuan,NanYi,HanLin}` 移至 `question/platform/G6/Chinese/S2/`。
- 更新腳本：`rewrite_distractors.js`、`apply_blind_results.js`、`extract_blind_test.js`、`apply_hl_nani_blind_results.js`、`extract_hl_nani_blind_test.js`（並修正 `NanI` → `NanYi`）。
- 執行 `node scripts/generate_library_stats.js`，`libraryStats.json` 已含 `G6_S2_國語` 與三出版社統計。

## 測試

- `npm run build`（`apps/v3_eidos`）通過。
- `vitest run src/data/questionLoader.test.ts` 通過。

## 備註

- 執行 `generate_library_stats.js` 時，`evaluate_question_quality` 可能對部分 JSON 做空白正規化並寫回，屬既有腳本行為。
