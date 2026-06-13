*Created by Claude Code (claude-opus-4-8) at 2026-06-12*

`last_updated`: 2026-06-12
`updated_by`: Claude Code (claude-opus-4-8)

# JOB-249-AG-三下-自然-翰林題庫重出

**`job_type`**：`question_prod`
**`executor`**：Codex CLI gpt-5.5（訂閱制，出題）＋ Claude Code claude-opus-4-8（PM 驗收）
**`parent_jobs`**：JOB-247（L3 對齊）、JOB-248（康軒 pilot 驗證流程）
**`model`**：Codex gpt-5.5 訂閱制 — ⚠️ **只用訂閱制額度，禁止使用任何 API key**

---

## 📌 任務背景

承接 JOB-248 康軒 pilot（流程已驗證），同法重出翰林三下自然題庫。
**翰林特殊處理**：現有題庫 L3=動物、L4=天氣，與課綱順序（L3=天氣、L4=動物）顛倒。
依使用者裁定**重排成課綱順序**——L3 改出天氣題、L4 改出動物題，對齊 KL4 檔名與課綱。

---

## 🎯 任務目標

翰林 4 課各重出 50 題（共 200 題），達 QL3。

| 課（重排後）| 課名 | 對應 KL4 | 變動 |
|:--|:--|:--|:--|
| L1 | 蔬菜園地 | 植物種植與生長 | 不變 |
| L2 | 水和冰 | 水與物質變化 | 不變 |
| L3 | 觀測天氣 | 天氣觀測與解析 | **原 L3 動物 → 改天氣** |
| L4 | 動物的身體 | 動物的構造與適應 | **原 L4 天氣 → 改動物** |

---

## 🚧 任務邊界

**只做**：翰林 4 課重出（各 50 題，含 L3/L4 重排）
**不做**：南一（JOB-250）、盲測升 QL4、修改 KL3/KL4 素材、網站更版

---

## 📖 執行步驟

1. **逐課出題**：`codex exec`（訂閱制）讀 KL4 雙檔 + 迷思清單，原創 50 題寫入 `*_L{N}_new.json`
2. **自檢**：`evaluate_question_quality.js`，CQI-P ≥ 5.5；retry ≤ 3
3. **PM 驗收**：CQI-P 數字、`validate_review_fields.js` 0 errors、重複檢查、領域守則（天氣測量/動物生活環境）、無 BIAS
4. **重排覆蓋**：L3 寫天氣題、L4 寫動物題；更新 manifest title（L3=觀測天氣、L4=動物的身體）

---

## ✅ 啟動 Checklist (Pre-Flight)

- [x] 翰林 KL4 雙檔齊備（4 課 × 2 檔）
- [x] 確認重排對應：L3→天氣、L4→動物（KL4 檔名一致）
- [x] env 無 API key；codex exec 訂閱制
- [x] 使用者許可（全自主持續執行）

## ✅ 驗收 Checklist (Acceptance)

- [x] 4 課各 50 題（共 200 題）── dispatch.log
- [x] 各課 CQI-P ≥ 5.5 ── avgCqi 7.08-7.20
- [x] `validate_review_fields.js` → 0 errors（翰林自然 4 檔）
- [x] L3 內容為天氣、L4 內容為動物（重排正確）── 抽樣確認
- [x] manifest title 重排（L3=觀測天氣、L4=動物的身體）
- [x] 無 BIAS、同課無重複 ── biasWarning=null、重複 0
- [x] 達 QL3

## ✅ 成果 Checklist (Deliverables)

- [x] 翰林 4 課題庫 JSON 重出 + manifest 更新
- [x] `jobs/JOB-249-Report.md`
- [x] 進度總表同步
- [x] 已執行 `/pj_sync`
- [x] `node scripts/job_manager.js close JOB-249`
- [x] Discord 結案回報

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: Codex gpt-5.5 訂閱制 + claude-opus-4-8 | 執行者: AG
