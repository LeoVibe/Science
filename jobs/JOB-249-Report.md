# JOB-249 Report：三下自然 翰林題庫重出（含 L3/L4 重排）

`last_updated`: 2026-06-13
`updated_by`: Claude Code (claude-opus-4-8)

---

## 1. 任務摘要

| 欄位 | 內容 |
|:--|:--|
| JOB | JOB-249 |
| 任務 | 翰林三下自然 4 課重出（各 50 題），含 L3/L4 重排對齊課綱 |
| 執行者 | Codex CLI gpt-5.5（訂閱制）＋ Claude Code claude-opus-4-8（PM 驗收） |
| 金鑰 | 訂閱制，全程未用任何 API key |
| 完成 | 2026-06-13 00:14（dispatch）+ 驗收覆蓋 |

---

## 2. 成果

### 出題（Codex serial dispatch）

| 課（重排後）| 課名 | KL4 主題 | 題數 | 耗時 |
|:--|:--|:--|:--|:--|
| L1 | 蔬菜園地 | 植物種植與生長 | 50 | 389s |
| L2 | 水和冰 | 水與物質變化 | 50 | 479s |
| L3 | 觀測天氣 | 天氣觀測與解析 | 50 | 342s |
| L4 | 動物的身體 | 動物的構造與適應 | 50 | 356s |

共 200 題，0 失敗，無限額。

### L3/L4 重排（本 JOB 核心）

- 現有題庫 L3=動物、L4=天氣，與課綱順序（L3=天氣、L4=動物）顛倒
- 重排後：**L3 內容=天氣**（觀測員/氣溫/雨量計）、**L4 內容=動物**（麻雀/蝙蝠/金魚），對齊 KL4 檔名與課綱
- manifest title 同步重排：L3=觀測天氣、L4=動物的身體

### CQI-P 驗收

| 課 | quality | avgCqi | 認知配比 | BIAS |
|:--|:--|:--|:--|:--|
| L1 | QL3 | 7.08 | 20/20/10 | 無 |
| L2 | QL3 | 7.11 | 20/20/10 | 無 |
| L3 | QL3 | 7.20 | 20/20/10 | 無 |
| L4 | QL3 | 7.20 | 20/20/10 | 無 |

- 認知配比 4:4:2、答案分布均勻、零完全重複
- `validate_review_fields.js`：翰林自然 4 檔 0 errors
- 領域守則：L3 天氣題含測量場景、L4 動物題 scenario 含生活環境（公園/校園/水族箱）

---

## 3. 異動清單

- `question/platform/G3/Science/S2/HanLin/G3_S2_SCI_HANLIN_L{1-4}.json`（各 50 題，L3/L4 內容重排）
- `..._manifest.json`（title 重排 + count 50×4、blind_tested=0、QL3、avg_cqi）
- `scripts/jobs/JOB-249/gen_prompts.py`、`dispatch.sh`、`_prompts/`、`_logs/`

---

## 4. 品質狀態

- 新題 `blind_evaluation=false`、`is_publishable=false`、QL3、`review_status=pending`
- 重出題目尚未盲測，blind_tested 歸 0；需另開 question_verify 升 QL4 上架
- authoring_model：真實代碼 gpt-5.5（200 題）

---

## 5. 結案 Checklist

- [x] README_專案發展紀錄已觸發 /pj_sync（JOB-249 記錄新增）
- [x] /pj_sync 已執行

---

## 6. 驗收 Checklist 對照

- [x] 4 課各 50 題（共 200 題）── dispatch.log + JSON 實測
- [x] 各課 CQI-P ≥ 5.5 ── avgCqi 7.08-7.20
- [x] `validate_review_fields.js` → 0 errors（翰林自然 4 檔）
- [x] L3 內容為天氣、L4 內容為動物（重排正確）── 抽樣確認
- [x] manifest title 重排（L3=觀測天氣、L4=動物的身體）
- [x] 無 BIAS、同課無重複 ── biasWarning=null、完全重複 0
- [x] 達 QL3

---

## 7. 模型與成本

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: Codex gpt-5.5（訂閱制）+ claude-opus-4-8 | 執行者: AG + Claude Code
