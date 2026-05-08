---
title: JOB-228 Phase 5 批量作業機制設計
date: 2026-05-09
status: draft
related_jobs:
  - JOB-228（主任務，三下社會考古題 L2 結構化抽取）
  - JOB-209（長時任務範本案例）
  - JOB-214（長時任務範本建立者）
related_docs:
  - docs/長時任務執行範本.md（五元件骨架）
  - jobs/JOB-228-RESUME-CHECKLIST.md（恢復步驟）
  - jobs/JOB-228-AG-G3S2-社會-考古題L2結構化抽取.md（schema 規格、強制規則）
  - ~/.claude/projects/-Users-s389080-Documents-doc-work-0-AI-Project-eidosProject/memory/feedback_codex_cli_model.md（codex 不指定 -m）
---

# JOB-228 Phase 5 批量作業機制設計

`last_updated`: 2026-05-09
`updated_by`: Claude Code (claude-opus-4-7[1m])

## 文件定位

本 spec 規劃 JOB-228 Phase 5（109 份三下社會考古題 codex 結構化抽取）的長時批次作業機制：作業、檢核、回報三件事。預期掛機 2-3 天連續運作，使用者偶爾回看 Discord。

不在範圍內：
- 109 份的 schema 規格與 prompt template（已固化於派工單與 `A2_pilot_prompt_template.md`）
- 35 條合法編碼清單（已產出於 `_meta/social_codes_legal_II.json`）
- Phase 1-4 既有產出（黃金 2 份 + Pilot 5 份）

## 上下文

JOB-228 Phase 4 完成 5 份 Pilot 試刀（皆 PASS），Phase 5 需序列跑 109 份。基於：

1. **單份成本驗證**：rank 1 已實測，**單份 ~10 分鐘**、71 題輸出、編碼合法 0/71、schema 與 Pilot 5 份一致 → codex 行為穩定
2. **時長估算**：109 × 10 min ≈ **18 小時連續跑**（不含中斷恢復、spot check pause）
3. **codex 環境**：本機 codex 已升級 0.121 → 0.129，預設 model 綁定 ChatGPT 訂閱（gpt-5.5），免費（訂閱內）
4. **使用者明確許可**：
   - 「全部給 codex 做」→ 109 份序列跑、彙整 MD 由 codex 草擬
   - 「能叫 codex 做的都叫 codex 做」→ Spot check、Phase B/C/D 腳本與 MD 都派 codex
   - Claude 負責「嚴格審查 review」+ Discord 推送 + git ops

## 一、執行者分工

| 工作 | 執行者 | 為什麼 |
|:--|:--|:--|
| 109 份結構化抽取 | **codex**（A2_full_dispatch.sh 序列跑） | 主任務 |
| 寫 dashboard.py | **codex**（一次性派工） | 寫腳本是 codex 強項 |
| 寫 continuous_full_loop.sh | **codex**（一次性派工） | 同上 |
| Spot check 每 5 份抽 1 | **codex 初判 → Claude meta-review** | codex 拉 schema 與編碼比對、Claude 接結果 → 省 Claude context |
| 每 60 min Dashboard 執行 + Discord 推送 | **Claude**（ScheduleWakeup） | Discord MCP tool 限定 Claude |
| 失控觸發 brainstorming/plan | **Claude** | PM 判斷工作 |
| Phase B 驗證腳本撰寫 + 執行 | **codex 寫 + bash 跑** | 純腳本工作 |
| Phase C/D 三版本彙整 MD | **codex 草擬 → Claude 驗收** | MD 量大 codex 拿手 |
| Phase E 結案 Report 草擬 | **codex 草擬 → Claude 驗收** | 同上 |
| commit + /pj_sync + 結案 Discord | **Claude** | git ops + Discord 限定 |

## 二、五元件具體實作

依 `docs/長時任務執行範本.md` 五元件骨架（① Progress State → ② Worker → ③ Dashboard → ④ Loop Wrapper → ⑤ Wakeup+Discord）：

### ① Progress State

**檔案**：`scripts/jobs/JOB-228/_full_progress.json`（已存在，dispatch.sh 已寫入機制）

**新增欄位**（每份完成寫入）：
```json
{
  "rank_N": {
    "exam_id": "...",
    "illegal_codes": "0/71",
    "log": "scripts/orchestrator-logs/JOB-228-full-rankN.log",
    "output": "knowledge/3_考古題/3_L2_結構化抽取/三下/三下_社會_<publisher>/<exam_id>.json",
    "finished_at": "ISO 時間",
    "validation_layer1": {
      "json_valid": true,
      "questions_count": 71,
      "summary_total_match": true,
      "confidence_legal": true,
      "reason_nonempty": true
    }
  }
}
```

### ② Worker（dispatch.sh）

**檔案**：`scripts/jobs/JOB-228/A2_full_dispatch.sh`（已存在）

**待補強**：
1. **Per-task hard timeout 25 分鐘**：macOS 無 GNU `timeout`，用 bash watchdog pattern（dispatch.sh 既有 `wait $CODEX_PID` 結構，只需加一個 watchdog process）：
   ```bash
   echo "$PROMPT" | codex exec --skip-git-repo-check --full-auto - > "$LOG_FILE" 2>&1 &
   CODEX_PID=$!
   ( sleep 1500; kill $CODEX_PID 2>/dev/null ) &
   WATCHDOG=$!
   wait $CODEX_PID
   EXIT_CODE=$?
   kill $WATCHDOG 2>/dev/null   # 正常結束則殺掉 watchdog
   ```
   超時 SIGTERM kill codex，標 failed/timeout
2. **Layer 1 驗證擴充**：除了現有編碼合法率，加 questions[] 計數、_summary 一致性、confidence 列舉、reason 非空白檢查
3. **codex CLI 不指定 -m**：已對齊 memory（line 86 已是預設 model）

### ③ Dashboard

**檔案**：`scripts/jobs/JOB-228/dashboard.py`（**新建，派 codex 寫**）

**輸入**：`_full_progress.json`、`_full_targets.json`、`scripts/orchestrator-logs/JOB-228-full-rank*.log`

**輸出**（六個必備元素，依範本 §三-③）：
1. 醒目時間戳（含日期、星期、HH:MM:SS）
2. 整體狀態計數：done/failed/pending（無 partial，因為單份是 atomic）
3. 完成度百分比（done/109）
4. **近 60 分鐘增量**：完成數、平均耗時、編碼合法率均值
5. 分組進度條：翰林（30）、康軒（57）、南一（22）
6. 預估剩餘 + 預估完成時間

**選用參數**：
```bash
python3 scripts/jobs/JOB-228/dashboard.py --since-minutes 60
python3 scripts/jobs/JOB-228/dashboard.py --json   # for wakeup pipeline
```

### ④ Loop Wrapper

**檔案**：`scripts/jobs/JOB-228/continuous_full_loop.sh`（**新建，派 codex 寫**）

**邏輯**：
1. `count_remaining()`：讀 `_full_progress.json` 算 109 - len(completed)
2. `WORKER_CMD="bash scripts/jobs/JOB-228/A2_full_dispatch.sh"`（不限 batch，dispatch.sh 內部已是序列）
3. `INTER_BATCH_SLEEP=30`（codex 訂閱無 rate-limit 但 codex CLI 內部冷卻保險）
4. **新增**：完成後（remaining=0）自動觸發 Phase B（呼叫 `B_validate_codes.py`）

**保護邏輯**（依範本 §三-④坑點）：
- `set -uo pipefail`
- `count_remaining` 失敗 fallback `echo -1` + 數字驗證
- 連兩輪沒減少自停（避免無窮迴圈）

### ⑤ Wakeup + Discord

**ScheduleWakeup 設定**：每 60 分鐘觸發，prompt 模板（5 個 placeholder 已填）：

```
回報順序：
(1) 訊息開頭用粗體列出當下時間（**🕐 回報時間：YYYY-MM-DD (週X) HH:MM:SS**）
(2) 跑 `python3 scripts/jobs/JOB-228/dashboard.py --since-minutes 60`
(3) 從 _full_progress.json 找最近完成的 1 份 → 派 codex 做 spot check（對照黃金樣本 + reason 樣本 + 編碼分布）
(4) 讀 codex spot check 結果 → meta-review（標 PASS/WARN/FAIL）
(5) 同步 Discord 到 `eidos_派工與回報` (chat_id=1487738477608177714)
(6) 確認 loop PID <PID> 是否還跑：ps -p <PID>
(7) grep "Rank " scripts/orchestrator-logs/JOB-228-full-loop.log 看 batch 進度
(8) df -h .（< 5 GB 警告）
(9) 若累積 3 份違規 → 觸發 /brainstorming 嘗試診斷
(10) 若 progress.completed.length === 109 → 停止 wakeup，進 Phase B 自動化路徑
```

**Discord 訊息格式**（依範本 §三-⑤）：
```
📊 **JOB-228 Phase 5 進度回報**
🕐 回報時間：**YYYY-MM-DD (週X) HH:MM:SS**

**整體**：done=N / failed=N / pending=N
**完成度**：N/109 = **N.N%** (+N.Npp / 60min)

**近 60 分鐘**：N 份 / 平均 N min/份 / 編碼合法率 N.N%

**各分組**：
翰林 ████░░░░  N/30
康軒 ░░░░░░░░  N/57
南一 ░░░░░░░░  N/22

**Loop**：PID xxx running, 已完成 N batch
**Spot check（rank N）**：PASS / WARN / FAIL（一句話結論）
**預估完成**：YYYY-MM-DD HH:MM (剩 ~Nh)
```

## 三、品質檢核機制（雙層）

### Layer 1：每份完成立即檢核（dispatch.sh 自動）

| 項目 | 檢查方式 | 失敗處置 |
|:--|:--|:--|
| 輸出檔存在 | `[ -f $OUTPUT_PATH ]` | 標 failed/output_not_found |
| JSON 格式合法 | `node -e "JSON.parse(...)"` | 標 failed/invalid_json |
| questions[] 非空 | `j.questions.length > 0` | 標 failed/empty_questions |
| _summary 一致性 | `_summary.total_questions === questions.length` | 標 warn/summary_mismatch |
| 編碼合法率 | 比對 35 條合法清單 | > 5% 標 manual_review_required |
| confidence 列舉 | 全部 ∈ {high, medium, low} | 任一違反標 warn/illegal_confidence |
| reason 非空 | 每個 codes_candidate.reason 有文字（≥ 5 字） | 任一違反標 warn/empty_reason |

### Layer 2：每 5 份 Claude Spot Check（codex 初判 + Claude meta-review）

**觸發時機**：每次 60 min wakeup（每小時 ~6 份完成 ≈ 1 次 spot check）

**派 codex 做的事**：
1. 找 `_full_progress.json.completed` 最後 1 份 rank 的 output JSON
2. 對照黃金樣本（依 publisher 選 A 或 B）的 schema 結構
3. 抽 5 條 reason 判斷空泛性（是否引用題幹、是否泛指）
4. 計算編碼分布（最高頻 1 碼是否吃 > 50%、認知層次是否健康）
5. 輸出結論到 `scripts/jobs/JOB-228/_spot_check.log`：PASS / WARN / FAIL + 一句話原因

**Claude meta-review**：
- codex 報 PASS → Claude 採信，Discord 寫「rank N spot check PASS」
- codex 報 WARN/FAIL → Claude **親自** dive 深查該份 JSON，決定是否觸發 brainstorming

### 警告觸發機制

依 RESUME-CHECKLIST §五．步驟 5 異常處理：
- 單份非法編碼 > 5% → 標 manual_review_required，loop 繼續
- 累積 3 份違規 → Discord 警告 + Claude 觸發 `/brainstorming` 嘗試診斷修正方向
- Loop **不暫停**（依使用者明示）

## 四、回報機制

### 4.1 Discord 頻道

| 用途 | 頻道 | chat_id |
|:--|:--|:--|
| 每 60 min 進度回報 | `eidos_派工與回報` | `1487738477608177714` |
| 失控警告（累積 3 違規） | `eidos_派工與回報` | `1487738477608177714` |
| 結案總結 | `eidos_派工與回報` | `1487738477608177714` |

不需要 DM（無「請求許可」場景，使用者已預先全權授權）。

### 4.2 ScheduleWakeup 排程

- 第一次：loop 啟動後 60 min
- 後續：每次 wakeup 結束時自呼叫下一次 ScheduleWakeup（除非 progress 已 109/109）
- 上限：72 小時（防呆，超過要使用者明確指示繼續）

## 五、全自動結案路徑（109 完成後）

不再排 wakeup，loop wrapper 連續呼叫：

| Phase | 動作 | 執行者 | 輸出 |
|:--|:--|:--|:--|
| **B** | 寫 `scripts/jobs/JOB-228/B_validate_codes.py` 並執行 | codex 寫 + bash 跑 | `_validation_report.json`（A 類非法編碼必踢、B 類錯階段必踢、C 類同碼重複去重） |
| **C** | 三版本 `_L2_summary.md`（翰林/康軒/南一） | codex 草擬 | 三份 MD 在 `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_社會_<publisher>/_L2_summary.md` |
| **D** | 全科目 `三下_社會_L2_整合.md` | codex 草擬 | `knowledge/3_考古題/3_L2_結構化抽取/三下/三下_社會_L2_整合.md` |
| **E** | 結案 Report | codex 草擬 | `jobs/JOB-228-Report.md`（依 `_JOB-REPORT-TEMPLATE.md`） |

**Claude 收尾**：
1. 驗收 Phase C/D/E 三份產出（草稿讀過）
2. `node scripts/job_manager.js close JOB-228`
3. `/pj_sync`
4. Discord 結案回報送 `1487738477608177714`
5. git commit（單一 commit，含全部 Phase 5 產出）

## 六、失敗模式處置

依長時任務範本 §四，加 JOB-228 特化項：

| 症狀 | 真因 | 處置 |
|:--|:--|:--|
| codex 卡 25 min+ 無回應 | codex 內部 retry 或 model 過載 | dispatch.sh perl-alarm hard timeout kill + 標 failed |
| 連兩輪 batch 無進展 | 環境問題（如 codex login 失效） | loop wrapper 自停 + Discord 緊急警告 |
| 電腦休眠醒來 | 物理事件 | 不處理（自動續），wakeup 偵測「N 小時無進度」時驗 PID |
| 磁碟 < 5GB | 累積 log + JSON 輸出 | dashboard 顯示警告 + Discord 提醒 |
| ChatGPT 訂閱 token 額度耗盡 | 連續呼叫超過 ChatGPT Plus 限額 | codex 連續失敗（exit ≠ 0） → loop 偵測連 5 次 → Discord 緊急警告 + 暫停 |
| codex 漂移（schema 結構偏離 Pilot） | 模型行為變化 | spot check 偵測到 → /brainstorming 診斷 prompt 是否要強化 |
| 同一份 rank 重跑後仍失敗 | 該份 MD 本身有問題（如圖像題、答案缺失） | 標 needs_manual_handling，loop 跳過，最後彙整時人工處理 |

## 七、啟動順序（具體 checklist）

| # | 動作 | 執行者 | 預估時間 |
|:--|:--|:--|:--|
| 1 | dispatch.sh 加 hard timeout 25 min（perl-alarm） | Claude | 5 min |
| 2 | 派 codex 寫 dashboard.py（依本 spec §二-③） | Claude 派 codex | 派 30s + codex 執行 ~3 min |
| 3 | 派 codex 寫 continuous_full_loop.sh（依本 spec §二-④） | Claude 派 codex | 派 30s + codex 執行 ~3 min |
| 4 | dashboard.py 試跑（rank 1 已完成、應顯示 1/109） | bash | 1 min |
| 5 | continuous_full_loop.sh 試跑 dry-run（驗 count_remaining 正確） | bash | 1 min |
| 6 | 啟動 loop（背景跑 nohup），記下 PID | bash | 1 min |
| 7 | 第一次手動 Discord 通知「Phase 5 啟動，預估 18 hr 完成」 | Claude | 1 min |
| 8 | 排第一次 ScheduleWakeup（60 min 後） | Claude | 30s |

## 八、結束條件

任一條件達成即視為 Phase 5 完成：

1. **正常結束**：`progress.completed.length === 109`，Phase B/C/D/E 全跑完，commit + Discord 結案回報送出
2. **緊急中止**：使用者透過 Discord 或 session 明示「停止」 → Claude 殺 loop PID + 寫部分結案 Report
3. **環境失效**：codex 連 5 次失敗（如訂閱額度耗盡）→ loop 自停 + Discord 緊急警告 + 等使用者指示

## 九、未涵蓋（後續處理）

- **Phase 5 跑完後其他學期/科目**：本 spec 限三下社會。四/五/六下其他科目的 L2 結構化抽取，沿用本機制但需另開 JOB
- **prompt template 重大修正**：若 spot check 累積警告觸發 brainstorming 後決定改 prompt，要記為新 spec（本 spec 假設 prompt 不變）
- **codex 訂閱配額管理**：本 spec 假設訂閱足夠跑完 109 份。實際耗 token 由每次 wakeup 觀察
