# JOB-228 重開機後恢復清單

`last_updated`: 2026-05-08
`updated_by`: Claude Code (claude-opus-4-7)
`status`: Phase 0-4 完成、Phase 5 待執行（109 份待跑）

---

## 給新 session 的開場白

> 你好新 session 的 Claude。JOB-228 做到一半，使用者選 B 路徑（修好 codex 環境，由 codex 跑剩下 109 份）。請依照本檔步驟接續，不要重做已完成的部分。

---

## 一、目前進度（已 commit，不要重做）

| Phase | Commit | 內容 |
|:--:|:--:|:--|
| 0 | `1853f5f` | iCloud 副本清理、116 基準對齊 |
| 1 | `747f57f` | 派工單修 4 條 H/M + 漏改 + 數字 |
| 2 | `b64b300` + `0f587fe` | 兩份黃金樣本（翰林文德 50 題 + 康軒新北安和 48 題） |
| 4-框架 | `7a8d37e` | Pilot 派工框架（targets / prompt / dispatch.sh） |
| 4-成果 | `0bed352` | 5 份 Pilot（Claude 親手做，全 PASS）|

**已產出 7 份結構化 JSON**：
- 黃金 2 份：`knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/`
- Pilot 5 份：`knowledge/3_考古題/3_L2_結構化抽取/_pilot/`

---

## 二、上次卡點（重要）

Codex CLI 0.121.0 + ChatGPT 帳號模式擋 `gpt-5-codex` / `gpt-5.5` / `gpt-5`：
```
ERROR: The 'gpt-5-codex' model is not supported when using Codex with a ChatGPT account.
ERROR: The 'gpt-5.5' model requires a newer version of Codex. Please upgrade to the latest app or CLI
```

使用者已選 B 路徑：升級 codex CLI 後重派。

---

## 三、恢復步驟（按順序執行）

### 步驟 1：使用者升級 codex CLI（人類動作）

請使用者在新 terminal 跑：
```bash
npm install -g @openai/codex@latest
codex --version    # 確認 > 0.121.0
codex login status # 確認還登著（ChatGPT 或 API key 都可）
```

**等使用者回報「升級完成」再進步驟 2**。

### 步驟 2：測試 model 可用性（Claude 動作）

依序測試以下 model，找出第一個能用的：

```bash
for m in gpt-5.5 gpt-5-codex gpt-5 gpt-4.1; do
  echo "=== $m ==="
  echo "say ok" | codex exec -m "$m" --skip-git-repo-check - 2>&1 | tail -5
done
```

把跑出 `Hi` 或 `OK` 的 model 記下來，假設叫 `<MODEL>`。如果全部失敗，回報使用者重新檢查 codex 環境。

### 步驟 3：修正 dispatch 腳本加回 model（Claude 動作）

編輯 `scripts/jobs/JOB-228/A2_pilot_dispatch.sh` 第 65 行附近：
```diff
-  echo "$PROMPT" | codex exec --skip-git-repo-check --full-auto - \
+  echo "$PROMPT" | codex exec -m <MODEL> --skip-git-repo-check --full-auto - \
```

並把這個 dispatch.sh 複製成 `scripts/jobs/JOB-228/A2_full_dispatch.sh`，把：
- `TARGETS_FILE="scripts/jobs/JOB-228/_pilot_targets.json"` → `_full_targets.json`
- `PROGRESS_FILE="scripts/jobs/JOB-228/_pilot_progress.json"` → `_full_progress.json`
- log 名稱：`pilot-rank` → `full-rank`

### 步驟 4：先用 1 份驗證 codex 能跑（Claude 動作）

```bash
bash scripts/jobs/JOB-228/A2_full_dispatch.sh --rank 1
```

跑完檢查 `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_社會_翰林/<rank1 exam_id>.json`：
- JSON 格式有效
- questions[] 數量與整合 MD 題目數一致
- 全部 codes_candidate 在 35 條合法清單內

**驗證 PASS 才進步驟 5**；FAIL 就回報使用者，討論是否回 C 路徑（Claude 親手做）。

### 步驟 5：分批派 codex 跑全量 109 份（Claude 動作）

按版本分 3 批，每批跑完抽 3 份做品質檢查：

```bash
# 第 1 批：翰林 30 份（rank 1-30）
for i in $(seq 1 30); do bash scripts/jobs/JOB-228/A2_full_dispatch.sh --rank $i; done

# 抽 3 份做 spot check（編碼合法率、reason 不空泛、schema 一致）

# 第 2 批：康軒 57 份（rank 31-87）
for i in $(seq 31 87); do bash scripts/jobs/JOB-228/A2_full_dispatch.sh --rank $i; done

# 抽 3 份做 spot check

# 第 3 批：南一 22 份（rank 88-109）
for i in $(seq 88 109); do bash scripts/jobs/JOB-228/A2_full_dispatch.sh --rank $i; done

# 抽 3 份做 spot check
```

**異常處理**：
- 任一份違規率 > 5% → 標 `manual_review_required`，先跳過繼續跑
- 同批 ≥ 3 份違規 → 暫停，回報使用者裁決

### 步驟 6：Phase B 全量驗證（Claude 動作）

寫 `scripts/jobs/JOB-228/B_validate_codes.py`，依派工單第 257-282 行規格：
- 讀全部 116 份 JSON（含 2 黃金 + 5 Pilot + 109 codex 跑出來的）
- 檢核：A 類非法編碼必踢、B 類錯階段必踢、C 類同碼重複去重保留 highest confidence
- 違規率 < 5% 自動修正、5-20% 標重跑、≥ 20% manual_review

輸出：`knowledge/3_考古題/3_L2_結構化抽取/_validation_report.json`

### 步驟 7：Phase C/D 彙整（Claude 動作）

依派工單第 286-316 行規格：
- 三版本 `_L2_summary.md`（翰林 / 康軒 / 南一）
- 全科目 `三下_社會_L2_整合.md`

### 步驟 8：Phase E 自查 + 結案（Claude 動作）

- `_L2_quality_report.json`
- `jobs/JOB-228-Report.md`（依 `_JOB-REPORT-TEMPLATE.md` 格式）
- `node scripts/job_manager.js close JOB-228`
- `/pj_sync`
- Discord 結案回報到 `1487738477608177714`

---

## 四、關鍵檔案位置（不要找錯）

| 用途 | 路徑 |
|:--|:--|
| 派工單（含 schema 規格、強制規則） | `jobs/JOB-228-AG-G3S2-社會-考古題L2結構化抽取.md` |
| 35 條合法編碼清單（編碼合法性的權威來源） | `knowledge/3_考古題/3_L2_結構化抽取/_meta/social_codes_legal_II.json` |
| Codex prompt 模板（含完整 schema + 強制規則） | `scripts/jobs/JOB-228/A2_pilot_prompt_template.md` |
| 5 份 Pilot 目標 | `scripts/jobs/JOB-228/_pilot_targets.json` |
| **109 份全量目標（本 session 新建）** | `scripts/jobs/JOB-228/_full_targets.json` |
| Dispatch 腳本範本 | `scripts/jobs/JOB-228/A2_pilot_dispatch.sh` |
| 黃金樣本 A（dual_source 範例） | `knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/翰林_108_文德國小_第二次段考.json` |
| 黃金樣本 B（codex_only 邊界範例） | `knowledge/3_考古題/3_L2_結構化抽取/_golden_samples/康軒_111_新北安和國小_期中考.json` |
| 5 份 Pilot 範例 | `knowledge/3_考古題/3_L2_結構化抽取/_pilot/*.json` |

---

## 五、絕對不要做的事

1. **不要重抽合法編碼清單**：A0 已產出 35 條，這是權威。原始 MD hint 中的 `Ae-Ⅱ-1` 是 OCR 錯位，不在合法清單（這是黃金樣本 OBS-8 的關鍵教訓）。

2. **不要修改派工單的 schema 規格**：使用者已 LGTM，schema v1.0 固化。

3. **不要重做已完成的 7 份**：黃金 + Pilot 都通過驗證，是 codex 對齊的基準。

4. **不要跳過 spot check**：每批 30/57/22 份跑完都要抽 3 份做 `/code-review:code-review`，避免最後才發現品質問題。

5. **不要靜默修改 commit 紀錄**：本 session 已寫入 5 個 commit（`1853f5f`、`747f57f`、`b64b300`、`0f587fe`、`7a8d37e`、`0bed352`），不要 reset。

---

## 六、若 codex 怎麼修都跑不通（最後保底）

回報使用者，提供 C 路徑：Claude 親手做剩下 109 份。

每份依 5 份 Pilot 的格式（schema v1.0、reason 引題幹、編碼必合法），預估每份耗 30-60 分鐘 token，109 份分多個 session 完成。
