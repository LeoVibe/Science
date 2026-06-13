# JOB-248 Report：三下自然 康軒題庫重出（pilot）

`last_updated`: 2026-06-12
`updated_by`: Claude Code (claude-opus-4-8)

---

## 1. 任務摘要

| 欄位 | 內容 |
|:--|:--|
| JOB | JOB-248 |
| 任務 | 康軒三下自然 4 課重出，依 JOB-247 KL4 淬煉素材，每課 50 題 |
| 執行者 | Codex CLI gpt-5.5（訂閱制，出題）＋ Claude Code claude-opus-4-8（PM 驗收） |
| 金鑰 | 訂閱制額度，**全程未使用任何 API key**（env 無 ANTHROPIC_API_KEY/GEMINI_API_KEY） |
| 啟動 | 2026-06-12 23:15 |
| 完成 | 2026-06-12 23:38（dispatch）+ 驗收覆蓋 |

---

## 2. 成果

### 出題（Codex serial dispatch）

| 課 | 課名 | 題數 | 耗時 |
|:--|:--|:--|:--|
| L1 | 田園樂（植物種植與生長） | 50 | 334s |
| L2 | 溫度變化對物質的影響（水與物質變化） | 50 | 318s |
| L3 | 我是動物解說員（動物的構造與適應） | 50 | 376s |
| L4 | 天氣變變變（天氣觀測與解析） | 50 | 360s |

共 200 題，0 失敗，無限額。

### CQI-P 品質驗收（`evaluate_question_quality.js`）

| 課 | quality | avgCqi | 認知配比(literal/inferential/applied) | BIAS |
|:--|:--|:--|:--|:--|
| L1 | QL3 | 7.20 | 20/20/10 | 無 |
| L2 | QL3 | 7.20 | 20/20/10 | 無 |
| L3 | QL3 | 7.20 | 20/20/10 | 無 |
| L4 | QL3 | 7.20 | 20/20/10 | 無 |

- 認知配比 4:4:2，符合中年級規格
- 答案分布均勻（各課四選項分布接近 12-13，無系統性偏置）
- `validate_review_fields.js`：康軒自然 4 檔 **0 errors/warnings**

### 品質實質檢查

- 題幹重複：4 課完全重複 0、前 15 字重複組 0
- 領域守則：L3 動物題 scenario 均含生活環境（溪流/魚缸/池塘）；L2 水/物質題含明確溫度條件（25°C、低於 0°C）
- 抄襲：考古題為參考座標，抽樣題目與考古題不同角度、原創設計

---

## 3. 異動清單

### 重出題庫（覆蓋，git 保留原版可回滾）
- `question/platform/G3/Science/S2/KangHsuan/G3_S2_SCI_KANGHSUAN_L1.json`（50 題）
- `..._L2.json`（50 題）
- `..._L3.json`（50 題）
- `..._L4.json`（50 題）
- `..._manifest.json`（count 50×4=200、blind_tested=0、quality QL3、avg_cqi 7.20）

### 新增腳本
- `scripts/jobs/JOB-248/gen_prompts.py`（出題 prompt 生成器）
- `scripts/jobs/JOB-248/dispatch.sh`（Codex serial dispatch）
- `scripts/jobs/JOB-248/_prompts/L{1-4}.txt`、`_logs/`

---

## 4. 品質狀態與後續

- 新題 `blind_evaluation=false`、`is_publishable=false`、`quality_level=QL3`、`review_status=pending`
- **重出題目尚未盲測**：原康軒題庫 L3/L4 為已盲測 QL4，重出後降回未盲測 QL3，blind_tested 由 30 歸 0。需另開 question_verify JOB 盲測升 QL4 後方可上架。
- authoring_model 修正：dispatch prompt 初填 "gpt-5-codex(訂閱制)"，已更正為真實代碼 **gpt-5.5**（codex config.toml + log 確認），200 題全數修正。

---

## 5. 遺留問題（範圍外，不處理）

1. **全站 validate_review_fields 261 errors**：來自其他既有檔案（如 G3 國語 NanYi L5/L6 等 `review_status=pending_review 但 is_publishable=true` 不一致），與本 JOB 無關，記錄待後續清理。
2. 康軒 pilot 驗證「依 JOB-247 素材重出」流程可行，接續 JOB-249 翰林、JOB-250 南一。

---

## 6. 驗收 Checklist 對照

- [x] 4 課各 50 題（共 200 題）── dispatch.log + JSON 實測
- [x] 各課 CQI-P ≥ 5.5 ── avgCqi 7.20（四課一致）
- [x] `validate_review_fields.js` → 0 errors（康軒自然 4 檔）
- [x] 各課命中 KL4 知識點與高頻迷思 ── 抽樣確認
- [x] 無 BIAS ── biasWarning=null（四課）
- [x] 同課題目無重複 ── 完全重複 0
- [x] 達 QL3 ── quality=QL3（盲測另開升 QL4）

---

## 7. 模型與成本

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: Codex gpt-5.5（訂閱制）+ claude-opus-4-8 | 執行者: AG + Claude Code
