# JOB-277 誘答選項重鑄指令（單課執行者用）

`來源規範`: question/README_出題與品管準則.md §BIAS、question/README_驗證與盲測準則.md §4.6、jobs/JOB-272-Report.md 技術筆記

## 你的任務
你分到一個題庫 JSON 檔與對應的 targets 清單。targets 中每一題目前「正解＝嚴格唯一最長選項」（BIAS 題）。你要重鑄這些題目的**誘答（錯誤）選項**，讓正解不再是唯一最長，該課 BIAS 比例降至 **≤20%**。

## 鐵律（JOB-272 已驗證方法）
1. **不改 `answer_index`**、不改正解選項的語意。若正解明顯過長，可對正解做「同義精簡」（意思完全不變，僅刪冗詞）。
2. **不改題幹（question）、scenario、explanation、其他任何欄位**。只動 `options` 陣列中的文字。
3. 誘答加長方式：把過短的錯誤選項擴寫成更完整的敘述（加入看似合理的細節或理由），使 4 個選項字數相近。
4. 擴寫後的誘答**必須仍是明確錯誤的答案**：不得變成可爭辯的正確答案、不得與正解語意重疊、不得自相矛盾到一眼可排除。誘答品質要能誘出真實迷思。
5. 長度以「字元數 len()」計。重鑄後逐題檢查：正解字數不得嚴格大於其餘 3 個選項（並列可接受）。

## 課程脈絡參考（需要時再讀）
- 國語：`knowledge/1_課綱研究/國語/四下/{翰林|南一}/` 下對應課次的單課研究紀錄／課文檔
- 自然：`knowledge/1_課綱研究/自然/G4_S2_自然_原始研究素材庫.md`、檔案內 meta.title 與各題 explanation

## 執行步驟
1. 讀 targets 清單（含 index、原 options、answer_index、explanation）。
2. 逐題設計新的 options（通常只需加長 2~3 個誘答；非 target 題不動）。
3. 用 python 對來源檔做手術式修改：只替換 target 題的 `options`，以 `json.dump(d, f, ensure_ascii=False, indent=2)` 寫回（檔案本來就是 2 空格縮排）。
4. 自我驗證（python，唯讀）並斷言：
   - 題數不變；全部題目的 `answer_index` 與重鑄前完全相同；非 target 題的 options 完全未動；target 題的正解選項語意未變（若精簡需記錄）。
   - 重算全課 BIAS（正解嚴格唯一最長比例）≤20%。
5. 產出重鑄紀錄 `jobs/_goal-work/JOB277/recast/<檔名>.recast.json`：
   `[{"index":N, "old_options":[...], "new_options":[...], "correct_simplified":true/false}]`
6. **禁止**呼叫 `evaluate_question_quality.js` 或 `generate_library_stats.js`（有全站寫回副作用）。BIAS 用純 python 計算。

## 回傳格式（最終訊息，純 JSON）
{"file":"<路徑>","before_bias_pct":N,"after_bias_pct":N,"recast_count":N,"correct_simplified_count":N,"all_assertions_passed":true}
