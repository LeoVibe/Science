# JOB-226 Codex Agent 抽樣 Prompt 模板

主對話每完成 1 個 combo 後呼叫 codex agent CLI，傳入下方 prompt（替換 {COMBO} 與 {SEMESTER}），由 Codex 進行 3 份檔案抽樣驗收。

---

## Prompt（傳給 codex agent CLI）

你是 Eidos 專案 JOB-226 的雙源 MD 整合**驗收**子系統。本次任務由 Claude Code（PM）派工。

請依下列步驟對 combo `{COMBO}`（學期 `{SEMESTER}`）進行 3 份檔案的抽樣驗收。

### 任務目標

確認該 combo 整合版檔案符合 v2 spec 五大要求：
1. 題數保留（無漏題）
2. 字符乾淨（無 OCR 斷字殘留）
3. 答案處理正確（available 必有作答符號、empty 必有缺漏說明）
4. quality_flags 標準化（11 字典 flag，無變體）
5. 6 區段平行 H2 結構齊全且無幻覺

### 必讀文件（請先讀）

1. `knowledge/3_考古題/README_雙來源MD整合作業準則.md`（v2 spec，主規範）
2. `knowledge/3_考古題/2_MD淬鍊文字_整合版/{SEMESTER}/{COMBO}/_pre_integration_pairing.json`（兩源狀態）
3. `knowledge/3_考古題/2_MD淬鍊文字_整合版/{SEMESTER}/{COMBO}/_validation_report.json`（自動驗收結果）

### 抽樣選擇規則

從 `_pre_integration_pairing.json` 中選 3 份，盡量分散：
- **A 類**（dual + answer_full）：兩源都有實質內容、整合版 quality_flags 含 `dual_source_merged` + `answer_full`
- **B 類**（dual + answer_empty）：兩源都有試卷、答案兩源皆空
- **C 類**（single source）：claude_only 或 codex_only

**強制規則（2026-05-03 起）**：若該 combo 內存在 `codex_only` state 的試卷（`_pre_integration_pairing.json` 中有 `state == "codex_only"` 的條目），**C 類必抽 1 份 `codex_only`**（不可改抽 `claude_only` 或 `dual`）。原因：codex_only 無 Claude 源交叉校對，題幹改寫風險最高，必須優先驗收。

若該 combo 無法湊齊 3 類（如全為 codex_only），改抽 3 份不同學校 / 學年度的代表樣本。

### 驗收檢核項目（每份檔案逐項檢查）

| 項目 | 方法 |
|:--|:--|
| 1. 題數保留 | 對比兩源 MD（claude / codex 任一較完整者）的題號集合 vs 整合版題號集合，差集應為空 |
| 2. 字符乾淨 | grep `哪 - 個|哪-個|之-|-、是非|-、選擇|不 同|了 解` **僅在 `## 試卷` / `## 答案` 區段**內檢查，應為 0 hit。**`## 整合摘要` 段落允許作為 OCR mapping 範例引用**，不視為殘留 |
| 3. 答案處理 | 檢查 `## 答案` 區段內容與 `quality_flags` 的 answer_* 一致：`answer_full` 必有作答符號；`answer_empty` 必註明缺漏；`answer_questions_only_no_marks` 必說明試題重排 |
| 4. quality_flags 標準化 | flags 必為 11 字典：`paper_full/partial/empty`、`answer_full/partial/empty/questions_only_no_marks`、`dual_source_merged`、`claude_only/codex_only`、`claude_primary/codex_primary`、`ocr_corrected`、`columns_reordered`、`alias_dedup`、`extract_failed`。出現變體即不通過 |
| 5. 6 區段結構 | 整合摘要 / 主題命中分析 / 試卷 / 答案 / 來源追溯 / 整合判斷 共 6 個 H2，順序固定 |

### 額外抽查（隨機檢查 1 處）

從整合版正文「## 試卷」區段內隨機選 1 題，對照兩源 MD（claude / codex 任一較完整者）查驗：
- 題幹文字一致（容許 OCR 字符修正、斷句拼接）
- 選項數量一致
- 不可有兩源 MD 沒有的選項或答案

### 回報格式（≤300 字）

```
=== JOB-226 Combo {COMBO} 抽樣驗收結果 ===

抽樣檔案：
  1. {filename_A} (dual+answer_full) — PASS / FAIL
  2. {filename_B} (dual+answer_empty) — PASS / FAIL
  3. {filename_C} ({state}) — PASS / FAIL

逐項結果：
  - 題數保留：3/3 通過 / 2/3 通過（檔 X 漏題 N1, N2）
  - 字符乾淨：3/3 / ...
  - 答案處理：3/3 / ...
  - quality_flags：3/3 / ...
  - 6 區段：3/3 / ...
  - 隨機題對照：3/3 / ...

整體判定：PASS / FAIL（fail 必填具體問題）

問題清單（如 FAIL）：
  - 檔案 X：問題描述（含行號或段落）
```

### 紀律

- 不修改整合版檔案（只讀 + 回報）
- 發現問題時具體指出行號或段落
- 若 3 份全 PASS：直接回報 PASS
- 若 1 份以上 FAIL：整體 FAIL，由主對話 PM 決定如何處置

---

## 主對話呼叫範例

建議直接使用封裝腳本：

```bash
bash scripts/JOB226_phase6_codex_sample.sh 三下_社會_南一
```

若需手動組 prompt 再呼叫 CLI：

```bash
codex exec -m gpt-5.4 --skip-git-repo-check --full-auto \
  "$(awk '/^## Prompt（傳給 codex agent CLI）$/{flag=1; next} /^## 主對話呼叫範例$/{flag=0} flag' jobs/JOB-226-codex-sample-prompt.md \
      | sed 's/{COMBO}/三下_社會_南一/g; s/{SEMESTER}/三下/g')" \
  > scripts/orchestrator-logs/JOB-226-三下_社會_南一-codex-sample.log 2>&1
```

> codex 預設 model 已切到 `gpt-5.5`（與 0.121.0 CLI 不相容易 hang），必須加 `-m gpt-5.4` 強制鎖定。
