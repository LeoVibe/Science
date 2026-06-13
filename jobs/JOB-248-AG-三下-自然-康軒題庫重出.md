*Created by Claude Code (claude-opus-4-8) at 2026-06-12*

`last_updated`: 2026-06-12
`updated_by`: Claude Code (claude-opus-4-8)

# JOB-248-AG-三下-自然-康軒題庫重出

**`job_type`**：`question_prod`
**`executor`**：Codex CLI（訂閱制額度，出題＋自檢）＋ Claude Code claude-opus-4-8（PM 驗收）
**`parent_jobs`**：JOB-247（三下自然 KL4 研究 + L3 對齊）
**`model`**：Codex gpt-5.x 訂閱制 — ⚠️ **只用訂閱制額度，禁止使用任何 API key（含 ANTHROPIC_API_KEY / GEMINI_API_KEY）**

---

## 📌 任務背景

承接 JOB-247 三下自然 L3 對齊，依其淬煉素材（康軒 8 份 KL4、迷思診斷 437 條、教學示例）重出康軒題庫。
康軒「課號↔主題」三方一致（現有題庫內容＝manifest＝KL4 研究），素材最乾淨，作為 **pilot** 驗證「依 JOB-247 素材重出」的流程與品質。pilot 跑通後再接 JOB-249 翰林、JOB-250 南一。

> **三版本路線圖**：康軒（本 JOB，pilot）→ 翰林（JOB-249，重排 L3/L4 編號）→ 南一（JOB-250，需先補溶解 KL4 research + 113 結構課本確認）→ 三版本完成後正式網站更版 → 社會科同邏輯。

---

## 🎯 任務目標

依 CQI-P 規格，為康軒三下自然 4 課各重出 50 題（共 200 題），達 QL3（盲測升 QL4 另開）。

| 課 | 課名 | 對應 KL4 | 主要迷思素材 | 題數 |
|:--|:--|:--|:--|:--|
| L1 | 田園樂 | 植物種植與生長 | 生命週期時序錯亂(15)、水越多越健康 | 50 |
| L2 | 溫度變化對物質的影響 | 水與物質變化 | 白煙≠水蒸氣(17)、凝結來源誤解(9)、蒸發沸騰混淆 | 50 |
| L3 | 我是動物解說員 | 動物的構造與適應 | 只見構造不見功能、保護色混淆、魚鰭功能 | 50 |
| L4 | 天氣變變變 | 天氣觀測與解析 | 降雨機率誤解、溫度計讀數場景 | 50 |

---

## 🚧 任務邊界

**只做**：
- 康軒三下自然 4 課重出（各 50 題）

**不做**：
- 翰林、南一（另開 JOB-249/250）
- 盲測升 QL4（另開 question_verify JOB）
- 修改任何 KL3/KL4 研究素材
- 正式網站更版（三版本全完成後另行處理）

---

## 📖 執行步驟

### Phase 1：逐課出題（Codex 訂閱制驅動）
每課由 `codex exec --skip-git-repo-check --sandbox workspace-write`（不指定 `-m`，用訂閱制預設）讀取：
- KL4 單課研究紀錄（知識點地圖 + 守衛點）
- KL4 考古題與討論
- misconception_diagnosis.md 該課對應迷思
產出 50 題，符合現有 JSON schema（18 欄位），寫入暫存檔 `*_L{N}_new.json`。

**出題鐵律**：考古題為**參考座標、禁止抄寫**（題幹/選項/誘答結構皆不可照搬）；同課題目不重複、知識點與迷思分布均勻。

### Phase 2：自檢（CQI-P 閘）
每課跑 `node scripts/evaluate_question_quality.js`，CQI-P ≥ 5.5；不足 retry ≤ 3，仍失敗標 manual_review 並停下回報（A2，不餵壞配方進下一課）。

### Phase 3：PM 驗收（Claude）
- 查每課 CQI-P 數字
- `node scripts/validate_review_fields.js` → 0 errors
- 抽查迷思覆蓋、選項對稱（無 BIAS）
- 驗收通過才以暫存檔覆蓋正式題庫檔 + 更新 manifest

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `knowledge/1_課綱研究/自然/三下/康軒/KL4_三下_康軒_L{1-4}_*.md` | 8 份 KL4 雙檔 |
| `knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/misconception_diagnosis.md` | 437 條迷思（康軒欄）|
| `knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/kl4_teaching_examples.md` | 教學示例 |
| `question/README_出題與品管準則.md` | CQI-P 計分、JSON schema |
| `question/platform/G3/Science/S2/KangHsuan/` | 現有康軒題庫（重出目標，git 保留可回滾）|

---

## ✅ 啟動 Checklist (Pre-Flight)

- [x] 康軒 KL4 雙檔齊備（4 課 × 2 檔 = 8 份，考古題討論檔 82-89 行非空殼）
- [x] 迷思素材齊備（白煙17、時序錯亂15、凝結9 等）
- [x] env 無 ANTHROPIC_API_KEY；出題改用 codex exec（不用 API 腳本）
- [x] 執行模型：Codex 訂閱制（使用者指定）
- [x] 使用者許可啟動（「可以啟動了」）

## ✅ 驗收 Checklist (Acceptance)

- [x] 4 課各 50 題（共 200 題）── dispatch.log + JSON 實測
- [x] 各課 CQI-P ≥ 5.5 ── avgCqi 7.20（四課一致）
- [x] `validate_review_fields.js` → 0 errors（康軒自然 4 檔）
- [x] 各課命中對應 KL4 知識點與高頻迷思 ── 抽樣確認
- [x] 無 BIAS（最長選項=正解比例 ≤ 40%）── biasWarning=null
- [x] 同課題目無重複、知識點分布均勻 ── 完全重複 0
- [x] 達 QL3（blind_evaluation=false，盲測另開升 QL4）

## ✅ 成果 Checklist (Deliverables)

- [ ] 康軒 4 課題庫 JSON 重出 + manifest 更新
- [ ] `jobs/JOB-248-Report.md`
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`）
- [ ] 已執行 `/pj_sync`
- [ ] `node scripts/job_manager.js close JOB-248`
- [ ] Discord 結案回報

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: Codex gpt-5.x 訂閱制 + claude-opus-4-8 | 執行者: AG
