# JOB-105 結案報告：KL3 清理、Pixnet 連結正規化、G3 S2 國語丙類刪題、翰林 L8 重寫、題庫硬湊句移除

`last_updated`: 2026-03-28 22:20  
`updated_by`: Cursor Agent  

## 1. `KL3_國語_研究進度_課文與索引.md`

- 已刪除所有僅屬部落格導流的行：**「看完文章後點點這裡做個測驗吧」**（含尾端帶題數者）。
- **Pixnet 來源**：將 `<.../blog/post/{id}-{slug}>` 正規化為 `<.../blog/post/{id}>`（slug 如「閱讀測驗--課碼課名」僅為部落格標題，非網址必要段）。
- **驗證**：以 `curl -I` 抽樣 `https://acerksy.pixnet.net/blog/post/{id}`，回傳 301/308 等重新導向，可正常解析。
- 檔首已加 HTML 註解註記本次維護。

## 2. G3 S2 國語 · 丙類（`blind_eval_mismatch`）

- 已自 **HanLin / KangHsuan / NanYi** 各課 JSON **刪除**所有仍帶 `blind_eval_mismatch` 的題列（與 JOB-103 丙類清單對齊之處置）。
- 刪題後已重跑 `evaluate_question_quality.js` 之 `evaluateFile`，並重算三社 **`G3_S2_CHI_*_manifest.json`** 的各課 `count` 與 `moduleMetaData.total_questions`。

## 3. 翰林三下 L8《行人的守護者》

- 原檔誤套《笨鵝阿茂》全文題組；已依 `KL4_三下_翰林_L8_行人的守護者_單課研究紀錄.md` **整檔重寫 30 題**（小綠人、紅燈對話、不疾不緩／快步走、晴雨守護等）。

## 4. 題庫硬湊句（全 `question/platform` 內標準題庫 JSON）

- 已移除選項／題幹等欄位中的 **「這也是作者想強調的重點之一。」**（及同類變體）。
- 另已批次移除 **「這點在實務上很重要。」** 類硬湊尾句（與前者同質）。
- `mismatch_catalog.json` 內殘留之「作者想強調」字串已一併清掉。

## 5. 工具腳本

- `scripts/fix_kl3_and_g3s2_questions.mjs`：可重複執行（KL3 已淨化者第二次幾乎為 no-op）；略過 `mismatch_report` 等非題庫 JSON。
