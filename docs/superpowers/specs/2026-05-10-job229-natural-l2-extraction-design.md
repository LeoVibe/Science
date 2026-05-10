---
title: JOB-229 三下自然 L2 結構化抽取設計（沿用 JOB-228 + 兩優化）
date: 2026-05-10
status: draft
related_jobs:
  - JOB-228（三下社會 L2 結構化抽取，本 JOB 沿用機制 + 優化）
  - JOB-226（雙源 MD 整合，自然科素材來源）
related_docs:
  - docs/superpowers/specs/2026-05-09-job228-phase5-batch-design.md（JOB-228 spec 為基底）
  - docs/長時任務執行範本.md（五元件骨架）
  - ~/.claude/projects/-Users-s389080-Documents-doc-work-0-AI-Project-eidosProject/memory/feedback_codex_cli_model.md（codex 不指定 -m）
---

# JOB-229 三下自然 L2 結構化抽取設計

`last_updated`: 2026-05-10
`updated_by`: Claude Code (claude-opus-4-7[1m])

## 文件定位

本 spec 規劃 JOB-229（三下自然考古題 L2 結構化抽取）的執行設計。**核心是沿用 JOB-228 機制 + 兩個優化點**：Phase 5 並行 3 條 codex（時間減半）、黃金樣本只做 1 份（省 Claude 親做時間）。

不在範圍內：
- 跨年級（四/五/六下）或跨科目（國語/數學/英語）的 L2 抽取（另開 JOB）
- 修改 JOB-228 既有產出（黃金樣本、Pilot、109 份）

## 上下文

JOB-228 完成後實測時間花費：
- Phase 5 codex 序列跑 109 份 = **14.7 hr**（占總 71%）
- Phase 0 準備（A0 編碼清單 + 黃金樣本 2 + Pilot 5）= ~5-7 hr
- Phase B-E 結案 = ~37 min
- 總計 **~20-22 hr**

兩個優化點來自實測數據：
1. 14.7 hr 的 Phase 5 是最大頭，**並行可大幅縮短**
2. 黃金樣本 2 份中第 2 份（codex_only 邊界）只有 corner case 的教學價值，**1 份 dual + paper_full + answer_full 已足夠**

並行 3 條已實證可行：本 session 跑了兩次測試
- **短任務**（say hi）3 條同時 40 sec 全 PASS、無 rate limit
- **長任務**（讀完整 MD + 寫摘要）3 條同時 72-138 sec 全 PASS、無 rate limit

## 一、跟 JOB-228 的差異

| 維度 | JOB-228 | JOB-229 |
|:--|:--|:--|
| Phase 5 派工 | 序列 1 條 | **並行 3 條** |
| 黃金樣本份數 | 2 份（dual + codex_only 邊界） | **1 份**（dual + paper_full + answer_full） |
| A0 編碼清單 | Claude 親做 | **派 codex 草擬 + Claude 驗收** |
| Pilot 份數 | 5 份 | 5 份（不變） |
| 抽取規模 | 109 份 | **123 份**（自然科素材：翰林 14 + 康軒 60 + 南一 49） |
| 預估總時間 | ~20-22 hr | **~9-11 hr**（減半） |
| 其他機制 | dispatch / dashboard / loop / spot check / Phase B-E | **完全沿用** |

## 二、並行 3 條的設計

### 2.1 靜態分配策略（不需 lock）

把 123 份 ranks 預先靜態分配給 3 條 worker，每條 41 份：

```
worker A: rank 1, 4, 7, 10, ..., 121 → 41 份
worker B: rank 2, 5, 8, 11, ..., 122 → 41 份
worker C: rank 3, 6, 9, 12, ..., 123 → 41 份
```

**為什麼靜態分配**：
- 不需要 lock 機制（檔案分配絕無衝突）
- 不需要中央協調 process
- 一條 worker 死掉不波及其他兩條

### 2.2 檔案分割

每條 worker 用獨立 progress 與 dispatch：

| 檔案 | worker A | worker B | worker C |
|:--|:--|:--|:--|
| Targets | `_full_targets_a.json`（41 份） | `_full_targets_b.json` | `_full_targets_c.json` |
| Progress | `_full_progress_a.json` | `_full_progress_b.json` | `_full_progress_c.json` |
| Dispatch 腳本 | `A2_full_dispatch_a.sh`（單一 worker dispatch） | `..._b.sh` | `..._c.sh` |
| Loop wrapper | `continuous_full_loop_a.sh` | `..._b.sh` | `..._c.sh` |
| Log | `JOB-229-full-rank{1,4,7,...}.log`（依 rank 命名） | `JOB-229-full-rank{2,5,8,...}.log` | `JOB-229-full-rank{3,6,9,...}.log` |

Output JSON 路徑共用（依 publisher 分目錄、檔名為 exam_id），但因為 ranks 互不重疊、絕不會寫同一份。

### 2.3 啟動方式

```bash
# 三個 nohup 同時啟動
nohup bash scripts/jobs/JOB-229/continuous_full_loop_a.sh > scripts/orchestrator-logs/JOB-229-loop-a.log 2>&1 &
LOOP_A=$!
nohup bash scripts/jobs/JOB-229/continuous_full_loop_b.sh > scripts/orchestrator-logs/JOB-229-loop-b.log 2>&1 &
LOOP_B=$!
nohup bash scripts/jobs/JOB-229/continuous_full_loop_c.sh > scripts/orchestrator-logs/JOB-229-loop-c.log 2>&1 &
LOOP_C=$!
echo "$LOOP_A $LOOP_B $LOOP_C" > /tmp/job229_loop_pids
```

### 2.4 Dashboard 整合

Claude wakeup 時 dashboard.py 改寫成：
- 讀 3 個 `_full_progress_X.json` 合併計算
- 顯示三 worker 各自進度（41/41 形式）+ 整體完成度（123/123）
- 偵測哪條 worker 慢／卡住

### 2.5 Spot check 邏輯

每次 wakeup 從**整體 completed pool**（合併三 worker）取最近完成 1 份做 spot check。不需要分 worker 抽。

## 三、Phase 0 準備（精簡版）

### 3.1 A0 自然科合法編碼清單（派 codex）

**輸出**：`knowledge/3_考古題/3_L2_結構化抽取/_meta/science_codes_legal_II.json`

**結構對齊** social 版：
```json
{
  "_meta": {"subject": "自然", "stage": "Ⅱ", "source": "108 課綱"},
  "performance": [{"code": "tr-Ⅱ-1", "label": "..."}, ...],
  "content": [{"code": "INa-Ⅱ-1", "label": "..."}, ...]
}
```

**派工方式**：codex exec 給它 108 課綱自然科第 Ⅱ 階段的官方文件路徑，要求抽出所有合法編碼。Claude 抽 5 條對課綱原文驗證。

### 3.2 A1 prompt template 自然科版

**檔案**：`scripts/jobs/JOB-229/A2_pilot_prompt_template_natural.md`

從 JOB-228 的 social template 改：
- 編碼清單路徑 → `science_codes_legal_II.json`
- 學習領域 → 自然
- 認知層次描述 → 自然科特色（探究/實作/分析比社會更重）
- spot check 標準 → ≥3 字題幹片段（依 JOB-228 遺留問題修正）

### 3.3 黃金樣本 1 份（Claude 親做）

**選擇策略**：派 codex 對候選 6-9 份做候選評估（3 條並行，~5 min），挑「結構完整 ≥ 9」+「題型多元 ≥ 7」+「dual_source + paper_full + answer_full」最高分那份。

**已測候選**（本 session 並行測試副產品）：
- 翰林_108_草港國小：抽取失敗 ❌（paper_empty）
- 康軒_108_伸東國小：Maybe（結構 8、題型 8）
- 南一_108_中正國小：Maybe（結構 9、題型 7）

需再評估 6 份候選後最終決定。

**輸出**：`knowledge/3_考古題/3_L2_結構化抽取/_golden_samples_natural/<chosen>.json`

### 3.4 Pilot 5 份

挑 5 份覆蓋三版本 + dual_source 為主：
- rank 1: 翰林 dual_source
- rank 2: 康軒 dual_source
- rank 3: 康軒 dual_source（不同學校）
- rank 4: 南一 dual_source
- rank 5: 任一邊界情境（answer_partial 等）

**派工**：codex（單條跑 5 份序列），Claude 驗收 5/5 PASS 才進 Phase 5。

## 四、Phase 5 全量 123 份（並行 3 條）

### 4.1 啟動前提

- A0 編碼清單已產出 + Claude 驗收 PASS
- A1 prompt template 自然科版已產出
- 黃金樣本 1 份已產出
- Pilot 5 份全 PASS
- `_full_targets_a/b/c.json` 已產出（rank 分配）
- `A2_full_dispatch_a/b/c.sh` + `continuous_full_loop_a/b/c.sh` 已產出（派 codex 寫）

### 4.2 跑批

3 條 nohup 同時啟動（見 §2.3）。

### 4.3 Wakeup 機制

沿用 JOB-228 的 /loop dynamic mode + ScheduleWakeup 60 min。每次 wakeup：
1. 跑 dashboard.py（合併三 worker progress）
2. 從整體 completed 取最近 1 份 spot check
3. Discord 推送（含三 worker 各自進度條）
4. 確認 3 個 PID 都活著、磁碟剩餘
5. 若累積 3 違規 → /brainstorming 診斷
6. 若 123/123 完成 → 進 Phase B

### 4.4 Worker 死亡處置

某條 worker died 時：
- Discord 緊急警告
- 該 worker 剩下的 ranks 標 `pending_redispatch`
- Claude 手動決定：重啟該 worker / 把 ranks 移給其他 worker / 等使用者裁決

## 五、Phase B/C/D/E 結案

完全沿用 JOB-228 流程：
- **Phase B**：派 codex 寫 `B_validate_codes.py`（讀全部 JSON 含 Pilot 5 + 黃金 1 = 129 份），輸出 `_validation_report.json`
- **Phase C**：派 codex 草擬三版本 `_L2_summary.md`（翰林 14 / 康軒 60 / 南一 49）
- **Phase D**：派 codex 草擬 `三下_自然_L2_整合.md`
- **Phase E**：派 codex 草擬 `_L2_quality_report.json` + `JOB-229-Report.md`，Claude 驗收 + close + /pj_sync + Discord + commit

## 六、預估時間

| 階段 | JOB-228 實測 | JOB-229 預估 |
|:--|:--:|:--:|
| Phase 0.1 A0 編碼清單（派 codex） | 2-3 hr（Claude 親做） | **30-60 min**（codex 草擬 + Claude 驗收） |
| Phase 0.2 黃金樣本（Claude 親做） | 4-6 hr（2 份） | **2-3 hr**（1 份） |
| Phase 0.3 Pilot 5 份 + 驗收 | 1 hr | 1 hr |
| Phase 5 全量 | 14.7 hr（109 份序列） | **~5-6 hr**（123 份 / 3 條並行） |
| Phase B-E 結案 | 0.6 hr | 0.6 hr |
| **總計** | **~20-22 hr** | **~9-11 hr** |

## 七、風險與防護

| 風險 | 機率 | 防護 |
|:--|:--|:--|
| 3 條同跑 ~5h 後撞 ChatGPT 訂閱 daily limit | 中 | wakeup 偵測連 5 失敗 → 自動切回 1 條（其他 2 條的 ranks 順延） |
| 1 份黃金樣本 schema 規範不夠 | 低 | 沿用 JOB-228 schema v1.0 + prompt template，已驗證；Pilot 5 PASS 才進全量 |
| 並行 worker 同時跑導致 macOS 資源緊張 | 低 | 每條 watchdog 25 min；3 條 codex 各自獨立 process |
| codex 偶發長推理（JOB-228 rank 54 = 56 min） | 中 | watchdog kill + 標 failed，跳下一份 |
| spot check 標準偏嚴造成假警報 | 中 | template 已調 ≥3 字（依 JOB-228 遺留問題） |
| 自然科 codex 抽取行為跟社會科不同 | 中 | Pilot 5 PASS 才進全量；若 Pilot 失敗則調 prompt template |

## 八、結束條件

任一條件達成即視為 JOB-229 完成：

1. **正常結束**：Phase 5 三 worker 合計 123/123 完成 + Phase B-E 全跑完 + 結案 commit
2. **品質失控**：累積 spot check 違規 ≥ 3 → /brainstorming 診斷後若無法修則停下等使用者
3. **環境失效**：3 條 worker 都連 5 次失敗（如訂閱 daily limit）→ 全停 + Discord 緊急警告

## 九、未涵蓋（後續處理）

- **三下其他科目**：國語/數學/英語的 L2 抽取（另開 JOB-23X）
- **四/五/六下科目**：完整 4 年級 × 5 科目矩陣（另開 JOB）
- **Spot check 標準微調回饋**：本 JOB 採 ≥3 字標準，跑完看是否仍有 false positive，若有則進一步調整
