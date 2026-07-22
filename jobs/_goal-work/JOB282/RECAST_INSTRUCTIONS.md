# JOB-282 誘答選項重鑄指令（單課執行者用）

`來源規範`: question/README_出題與品管準則.md §BIAS、question/README_驗證與盲測準則.md §4.6、jobs/JOB-272-Report.md 與 jobs/JOB-277-Report.md 技術筆記

## 你的任務
你分到一個題庫 JSON 檔與對應的 targets 清單。targets 中每一題目前「正解＝嚴格唯一最長選項」（BIAS 題）。你要重鑄這些題目的**誘答（錯誤）選項**，讓正解不再是唯一最長，該課 BIAS 比例降至 **≤20%**。

## 鐵律
1. **不改 `answer_index`**、不改正解選項的語意。若正解明顯過長，可對正解做「同義精簡」（意思完全不變，僅刪冗詞）。
2. **不改題幹（question）、scenario、explanation、其他任何欄位**。只動 `options` 陣列中的文字。
3. 誘答加長方式：把過短的錯誤選項擴寫成更完整的敘述（加入看似合理的細節或理由），使 4 個選項字數相近。
4. 擴寫後的誘答**必須仍是明確錯誤的答案**：不得變成可爭辯的正確答案、不得與正解語意重疊、不得自相矛盾到一眼可排除。誘答品質要能誘出真實迷思。
5. 長度以「字元數 len()」計。重鑄後逐題檢查：正解字數不得嚴格大於其餘 3 個選項（並列可接受）。
6. **⚠️ 必須把修改寫入正式題庫檔案本身**（`question/platform/...` 路徑，即 targets 清單裡的 `source_file`），不是只寫進 recast 紀錄檔。若中途遇到工具權限限制無法直接寫入正式檔，**在最終回報中明確說明**（不要沉默改成只寫 recast 檔後謊報 all_assertions_passed:true）。

## 課程脈絡參考（需要時再讀）
國語 G5：`knowledge/1_課綱研究/國語/五下/{康軒|翰林}/` 下對應課次的單課研究紀錄／課文檔（若無此路徑，依 explanation 欄位內容判斷課文脈絡即可）。

## 執行步驟
1. 讀 targets 清單（含 index、原 options、answer_index、explanation）。
2. 逐題設計新的 options（通常只需加長 2~3 個誘答；非 target 題不動）。
3. 用 python 對**正式題庫檔案**（`source_file` 路徑）做手術式修改：只替換 target 題的 `options`，以 `json.dump(d, f, ensure_ascii=False, indent=2)` 寫回（檔案本來就是 2 空格縮排）。
4. 自我驗證（python，唯讀，直接讀你剛寫入的正式檔案，不是讀 recast 紀錄）並斷言：
   - 題數不變；全部題目的 `answer_index` 與重鑄前（可用 `git show HEAD:<路徑>` 取得原始版本比對）完全相同；非 target 題的 options 完全未動；target 題的正解選項語意未變（若精簡需記錄）。
   - 重算全課 BIAS（正解嚴格唯一最長比例）≤20%。
   - 用 `git diff --stat <路徑>` 確認正式檔案確實有異動。
5. 產出重鑄紀錄 `jobs/_goal-work/JOB282/recast/<檔名>.recast.json`：
   `[{"index":N, "old_options":[...], "new_options":[...], "correct_simplified":true/false}]`
6. **禁止**呼叫 `evaluate_question_quality.js` 或 `generate_library_stats.js`（有全站寫回副作用）。BIAS 用純 python 計算。

## 回傳格式（最終訊息，純 JSON）
{"file":"<正式題庫檔路徑>","before_bias_pct":N,"after_bias_pct":N,"recast_count":N,"correct_simplified_count":N,"all_assertions_passed":true,"git_diff_confirmed":true}
