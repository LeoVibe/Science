# JOB-253 Report：三下自然 三版本盲測與上版

> 註：原規劃康軒 pilot 先上，執行中使用者改為「三版本都盲測完一起上」，故本 JOB 涵蓋康軒+翰林+南一三版本。

`last_updated`: 2026-06-14
`updated_by`: Claude Code (claude-opus-4-8)

---

## 1. 任務摘要

| 欄位 | 內容 |
|:--|:--|
| JOB | JOB-253（job_type: question_verify）|
| 任務 | 康軒三下自然 200 題盲測 + 達標上正式機（pilot）|
| 盲測方式 | Claude subagent 雙盲（出題 Codex gpt-5.5／盲測 claude-opus-4-8，不同模型符合雙盲）|
| 金鑰 | 全程 Claude/Codex 訂閱制，未用任何 API key |
| 完成 | 2026-06-14 |

---

## 2. 盲測結果（三版本）

| 版本 | Match | Match Rate | Mismatch |
|:--|:--|:--|:--|
| 康軒 | 199/200 | 99.5% | L1-id32（題幹歧義）|
| 翰林 | 200/200 | 100% | — |
| 南一 | 200/200 | 100% | — |
| **總計** | **599/600** | **99.83%** | 1 |

**方法**：去除 answer_index/explanation/commonMisconception 生成盲測題本（真盲），每課派 1 個 Claude subagent 並行作答（共 12 課），比對原答案。雙盲：出題 Codex gpt-5.5／盲測 claude-opus-4-8。

**Mismatch 診斷（L1-id32）**：題幹「種小白菜…這可修正哪種想法？」語意歧義——字面問「要修正掉的錯誤想法」，盲測者選「必等結果」（被修正的錯誤觀念）語意更合理；原答案「葉菜可採」是修正後的正確觀念。判定為題幹表述不精確，依準則標 `review_status: pending` 待人工確認，**未自動改答案**。

---

## 3. 品質回寫

依盲測準則 §2.5：
- 全 200 題：`blind_evaluation=true`、`quality_level=QL4`、`verifying_model=claude-opus-4-8`、avgCqi 升至 9.20（P-E 盲測加分）
- Match 199 題：`is_publishable=true`、`review_status=confirmed`
- Mismatch 1 題：`is_publishable=false`、`review_status=pending`

**課級門檻**（每課 is_publishable ≥25 可上線）：L1=49、L2=50、L3=50、L4=50，**全課達標**。

---

## 4. 上正式機

- **手動只同步康軒自然** 5 檔（4 課 + manifest）到 `apps/v3_eidos/public/question/platform/G3/Science/S2/KangHsuan/`
- **未跑全量 sync 腳本**（`sync_v3_public_questions.mjs` 會同步全部 platform，殃及翰林/南一未盲測題導致下架）
- `git diff --cached` 驗證 blast radius：僅康軒 Science source + public，無其他版本/科目
- 部署：git push → Cloudflare/GitHub Pages 自動部署
- **Rollback**：`git revert <sha>` + push

### ⚠️ 正式站 mixed-state（誠實揭露）
- **康軒自然**：已上版 50 題/課 QL4（學生可見新題）
- **翰林/南一自然**：仍為舊版（待各自盲測後上版）
- **About 頁統計**（libraryStats）：刻意未重生（全量重生會誤顯翰林/南一為降級）；題目經 manifest+files 載入，統計滯後僅 cosmetic、不影響題目顯示

---

## 5. 異動清單

- `question/platform/G3/Science/S2/KangHsuan/G3_S2_SCI_KANGHSUAN_L{1-4}.json`（盲測欄位回寫 QL4）
- `..._manifest.json`（blind_tested=200、QL4、avg_cqi 9.20）
- `apps/v3_eidos/public/question/platform/G3/Science/S2/KangHsuan/`（5 檔，上正式機）
- `scripts/jobs/JOB-253/_blind/`（盲測題本 + subagent 答案）

---

## 6. 結案 Checklist

- [x] README_專案發展紀錄已觸發 /pj_sync（JOB-253 記錄新增）
- [x] /pj_sync 已執行

---

## 6b. 技術 debug：push 失敗根因（http.postBuffer）

三版本上版 push（積壓 147 commit / 46MB）連續兩次失敗（exit 1，表現像「網路慢」傳 17-22 分鐘不完）。

**根因（debug 確認）**：`http.postBuffer` 未設定 = 預設 1MB，遠小於 46MB pack，HTTP RPC 傳輸失敗。**非網路問題**。排除：最大物件 6.1MB（未超 GitHub 限制）、認證 osxkeychain 正常。

**修復**：`git config http.postBuffer 524288000`（500MB）+ lowSpeed 容忍 → `git push --progress -v` **30 秒成功**（0eb622f7..308142ab）。已記入 memory `git_push_postbuffer.md`。

---

## 7. 後續

- 康軒自然 pilot 驗證「Claude subagent 盲測 + 上版」流程可行（99.5% Match）
- 翰林/南一自然（各 200 題）、社會（850 題 staged）可比照盲測上版
- L1-id32 題幹歧義待人工修正後可補上架（目前 49/50 已上線）

---

## 8. 模型與成本

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: 出題 Codex gpt-5.5 + 盲測/驗收 claude-opus-4-8 | 執行者: AG + Claude Code
