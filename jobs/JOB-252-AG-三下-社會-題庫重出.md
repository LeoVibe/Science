*Created by Claude Code (claude-opus-4-8) at 2026-06-14*

`last_updated`: 2026-06-14
`updated_by`: Claude Code (claude-opus-4-8)

# JOB-252-AG-三下-社會-題庫重出

**`job_type`**：`question_prod`
**`executor`**：Codex CLI gpt-5.5（訂閱制）＋ Claude Code claude-opus-4-8（PM 驗收）
**`parent_jobs`**：JOB-251（社會 KL4 反推齊備）
**`model`**：Codex gpt-5.5 訂閱制 — ⚠️ **只用訂閱制額度，禁止任何 API key**

---

## 📌 任務背景

社會科 KL4 三版本齊備（翰林既有 + JOB-251 反推康軒/南一）後，比照自然重出社會題庫。

> ⚠️ **重要（advisor 指引）**：自然重出時直接覆蓋正式檔，導致已上架 QL4 變成未盲測不可上架 QL3，前台會下架。社會出題**輸出 staged `_new.json`，不覆蓋正式檔**，保住社會現有上架 QL4，待使用者盲測決策後再覆蓋 + 盲測 + 更版。

---

## 🎯 任務目標

翰林 6 + 康軒 6 + 南一 5 = 17 課各 50 題（共 850 題），達 QL3，輸出 staged。

---

## 🚧 任務邊界

**只做**：社會 17 課出題（staged `_new.json`）
**不做**：覆蓋正式檔、盲測、更版、修改 KL4

---

## 📖 執行步驟

1. 逐課 `codex exec`（訂閱制）讀對應 KL4 雙檔，原創 50 題 → `*_L{N}_new.json`（staged）
2. 每課 `evaluate_question_quality.js` CQI-P ≥ 5.5
3. PM 驗收：CQI-P、無 BIAS、重複、抄襲快篩
4. **保留 staged，不覆蓋正式檔**；待使用者盲測決策

---

## ✅ 啟動 Checklist

- [x] 社會 KL4 三版本齊備（JOB-251）
- [x] env 無 API key；codex 訂閱制
- [x] staged 輸出策略確認（不覆蓋正式檔）

## ✅ 驗收 Checklist

- [x] 17 課各 50 題（共 850 題，staged）── 實測
- [x] 各課 CQI-P ≥ 5.5（7.02-7.20）
- [x] 無 BIAS、無重複
- [x] staged 未覆蓋正式檔（社會現有 QL4 完好）

## ✅ 成果 Checklist

- [x] 17 課 staged `_new.json`
- [x] `jobs/JOB-252-Report.md`
- [x] 進度總表同步 + `/pj_sync`
- [x] `node scripts/job_manager.js close JOB-252`
- [x] Discord 結案回報

## 真實回報

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: Codex gpt-5.5 訂閱制 + claude-opus-4-8 | 執行者: AG
