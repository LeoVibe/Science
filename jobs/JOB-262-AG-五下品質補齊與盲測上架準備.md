*Created by Claude Code (claude-opus-4-8) at 2026-06-14*

`last_updated`: 2026-06-14
`updated_by`: Claude Code (claude-opus-4-8)

# JOB-262-AG-五下品質補齊與盲測上架準備

**`job_type`**：`mixed`（research 補題 + question_verify 盲測 + BIAS 平衡）
**`executor`**：接手 station（Claude 內容校正 + Codex 訂閱制）
**`model`**：盲測 claude-opus-4-8、出題/BIAS 平衡 Codex gpt-5.5（訂閱制，禁用 API key）

> 本派工單由前 session（三下四下稽核）交接。五下稽核已完成，三項待辦如下。**參考前 session 已驗證的流程**（JOB-256 subagent 盲測、JOB-258 Codex BIAS 平衡）。

---

## 五下稽核結果（2026-06-14，數據為實測）

| 科目 | 版本 | 課/題 | 可上架 | 盲測 | BIAS |
|:--|:--|:--|:--|:--|:--|
| 國語 | 翰林 | 12課/426 | 43% | 68% | L4/L6/L7 |
| 國語 | 康軒 | 12課/397 | 32% | 43% | L8 |
| 國語 | 南一 | 12課/332 | 20% | 33% | L2 |
| 自然 | 翰林 | 4課/**12** | 0% | 0% | — |
| 自然 | 康軒 | 5課/**23** | 0% | 0% | — |
| 自然 | 南一 | 4課/**10** | 0% | 0% | — |
| 社會 | 翰林 | 6課/165 | **0%** | **0%** | L2 |
| 社會 | 康軒 | 5課/225 | 98% | 100% | — |
| 社會 | 南一 | 5課/225 | 99% | 100% | — |

> 社會康軒/南一已由 JOB-256 盲測（交接於 JOB-257，source 已回寫待上架）。

---

## 任務 1：五下自然題庫殘缺（🔴 需先決策 — 補題重出）

### 問題
五下自然三版本**題數嚴重不足**（翰林 12、康軒 23、南一 10 題），正常應 120 題級。完全未盲測。**這不是盲測能解決——題庫本身殘缺。**

### 建議流程（同 JOB-252 三下社會重出）
1. 確認五下自然 KL4 素材（JOB-179，2026-04-12 完成，路徑 `knowledge/1_課綱研究/自然/五下/`）
2. Codex 依 KL4 重出各課（每課 30-50 題，選項對稱無 BIAS）
3. subagent 盲測 → 回寫 QL4
4. 交接上架

### ⚠️ 決策點
- 補題規模大（約 400+ 題），需使用者確認是否啟動
- 康軒 L11 有「廢棄殘留待清理」（見進度彙整五下自然備註）

---

## 任務 2：五下國語盲測 + BIAS 平衡

### 2a. 盲測未盲測課
- 翰林盲測率 68%、康軒 43%、南一 33% → 大量題未盲測卡 is_publishable=false
- **流程**（同 JOB-256）：每課生成去答案題本 → Claude subagent 盲判 → 比對 Match → Match 題回寫 `is_publishable=true`+`blind_evaluation=true`+QL4

### 2b. BIAS 平衡 5 課
- 翰林 L4/L6/L7、康軒 L8、南一 L2（evaluate 判 QL1 BIAS）
- **流程**（同 JOB-258）：Codex 平衡選項長度（嚴格不改 answer_index/question/語意，只調長度）→ 輸出 _new.json → 驗證 evaluate bias=None + 答案題幹未改

---

## 任務 3：五下社會翰林盲測 + BIAS 平衡

### 3a. 翰林 6 課盲測（165 題）
- 翰林五下社會**完全未盲測**（前 session JOB-256 因 manifest 異常跳過翰林，只做康軒/南一）
- 流程同任務 2a（subagent 盲測 165 題）
- 注意：翰林 manifest 曾有讀取異常，先確認 manifest 格式正常

### 3b. 翰林 L2 BIAS 平衡
- 流程同任務 2b（Codex 平衡選項）

---

## 共通執行守則

- **盲測**：Claude subagent（出題 vs 盲測不同 agent，符合雙盲準則）；去除 answer_index/explanation/commonMisconception 生成真盲題本
- **BIAS 平衡**：Codex `codex exec`（訂閱制，不指定 -m），嚴格不改答案/題幹/語意
- **驗證**：evaluate_question_quality.js（quality/cqi/bias）+ validate_review_fields.js（0 error）+ 答案題幹對比未改
- **上架以 is_publishable 為準**（CLAUDE.md §四更新）：QL3 可 BETA、QL4 正式
- **git 並發**：若仍有另一 station 操作，改 _new 暫存、精確 add、不 push，交接統一上架
- **push 注意**：http.postBuffer 已設 500MB（大 push 才順，見 memory git_push_postbuffer）

---

## ✅ 啟動 Checklist

- [ ] 讀 `question/README_驗證與盲測準則.md`（CQI-V、上架門檻 §4.6）
- [ ] 任務 1 補題：使用者確認啟動 + 五下自然 KL4 素材就緒
- [ ] 任務 2/3：盲測題本生成 + subagent 派工

## ✅ 成果 Checklist

- [ ] 五下自然補題重出 + 盲測（任務 1）
- [ ] 五下國語盲測 + 5 課 BIAS 平衡（任務 2）
- [ ] 五下社會翰林盲測 + L2 BIAS（任務 3）
- [ ] `jobs/JOB-262-Report.md`
- [ ] /pj_sync + close + Discord

## 真實回報

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: 待執行 station 填寫 | 執行者: AG
