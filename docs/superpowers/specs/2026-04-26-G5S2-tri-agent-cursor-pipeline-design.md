---
last_updated: 2026-04-26
updated_by: Claude Code (claude-opus-4-7)
version: 1.0.0
status: design (待 writing-plans 產出實作 plan)
job_type_target: docs_ops（前置）→ research → question_prod → question_verify
---

# G5S2 三 Agent Cursor 流水線設計（Tri-Agent Pipeline）

## 文件定位

本文件為 **設計規範（spec）**，描述如何用三個 Cursor agent（Research / Production / Verification）以階段並行模式，把 G5（五年級）下學期國語、自然、社會三科題庫從 KL4 復檢一路推進到 QL4 上架。

**本文件不是**：
- 派工單（JOB）— 待 writing-plans skill 產出實作 plan 後，依本 spec 開立 JOB-XXX 系列
- 規範文件 — 不取代 `docs/README_通用作業準則.md`、`docs/README_任務派工準則.md`、`question/README_*` 等正式規範
- 實作程式碼 — `_agent/skills/*` 升級與 `.cursor/rules/karpathy-guidelines.mdc` 新增屬於前置 `docs_ops` 任務範圍

**權威性**：本文件落地時若與 Eidos 規範衝突，**以規範為權威**，並修正本 spec。

---

## 第一章：背景與目標

### 1.1 觸發背景

- 使用者 Cursor 訂閱剩 3 天到期，usage 僅用 30%，希望以高密度任務消化餘額
- G5S2 三科進度不一：國語盲測過 QL3 待升 QL4；自然 KL4 完備但未出題；社會 KL4 完備、JOB-184 出題卡 API 限流
- 過去 100 個 JOB 暴露多種失敗模式（API 429、假初始化、路徑漂移、銜接含糊）
- 使用者要求「絕對嚴謹的盲測」與「完整且正確」的全 G5S2 流水線

### 1.2 任務範圍

| 維度 | 範圍 |
|:--|:--|
| 年級 | G5（五年級） |
| 學期 | S2（下學期） |
| 科目 | 國語（CHI）、自然（SCI）、社會（SOC） |
| 出版社 | 翰林（HanLin）、康軒（KangHsuan）、南一（NanYi） |
| 階段 | 研究補強 → 出題 → 雙盲驗證 → QL4 升級 |
| 量級（推估） | 三科 × 三版 × 平均 7 課 × 30 題 ≈ 1900 題；雙盲 LLM 呼叫 ≈ 5700 次 |

### 1.3 成功標準（Goal-Driven Execution）

| 階段 | 結束門檻 | 驗證方式 |
|:--|:--|:--|
| 階段 0 前置 | 6 項檔案到位、Cursor session 能讀取 Karpathy 護欄 | 使用者驗收 |
| 階段 1 研究 | 所有課 KL4 雙檔齊備（α 路徑）或標 β+ | `g5s2_results.tsv` research 列 status ∈ {keep, β+_keep} |
| 階段 2 出題 | 所有題庫 JSON CQI-P ≥ 5.5 | `evaluate_question_quality.js --gate` exit 0 |
| 階段 3 驗證 | 課級 `is_publishable: true` 題數 ≥ 25 / 課；雙盲 Match 一致率 ≥ 90% | `logs/blind_eval_*.json` VAT 雙日誌 + `check_dual_blind_consistency.js` 報告 |
| 階段 4 收尾 | `libraryStats.json` 顯示 G5S2 三科 QL3+ 或 QL4 | `generate_library_stats.js` 輸出 |

---

## 第二章：三 Agent 角色定位

### 2.1 角色卡

| 維度 | 🔬 Research Agent | 📝 Production Agent | 🛡️ Verification Agent |
|:--|:--|:--|:--|
| Eidos `job_type` | `research` | `question_prod` | `question_verify` |
| 觸發 SKILL | `_agent/skills/ei_research/SKILL.md` | `_agent/skills/ei_qst/SKILL.md` | `_agent/skills/ei_verify/SKILL.md` |
| 核心輸出 | KL4 雙檔（單課研究 + 考古題與討論） | 題庫 JSON（CQI-P ≥ 5.5） | 盲測後 JSON（CQI-V、`blind_evaluation: true`、`is_publishable`） |
| 讀寫範圍 | `knowledge/` 讀寫 | `knowledge/` 讀；`question/source/`、`question/platform/` 讀寫 | `question/platform/` 讀寫；`logs/` 寫 |
| 絕對禁止 | 出題、改題、盲測 | 改 KL4、改規範、跳過 CQI-P 閘門、寫 `blind_evaluation` | 改題（除 MTP TYPE-B 退件流程）、改 KL4、寫 `cqi_score` 之外的出題欄位 |
| 失敗回報窗口 | 考古題 < 10、來源 < 2、KL4 完全缺檔 | CQI-P < 5.5、Schema violation、API 連 5 次 429 | Match Rate < 85%、TYPE-B > 5%/課、雙盲不一致率 > 20% |
| 退件接收方 | PM（Claude Code） | PM | PM；TYPE-B 直接退回 Production |

### 2.2 銜接契約（Contract）

```
Research ──[KL4 雙檔 + RM2/3]──▶ Production ──[題庫 JSON + cqi_score]──▶ Verification
       │                              │                                     │
       └─[考古 < 10 → 標 β+ 降 QL3]    └─[CQI-P < 5.5 retry 3 / manual_review]
                                                                            │
                                                                            ├─[TYPE-A → keep]
                                                                            ├─[TYPE-B → 退 Production]
                                                                            └─[TYPE-C → manual_review]
```

**Why 這樣切**：取自 JOB-152→159 教訓——權限越界會出現「假完成」。Verification 沒有「改題」權限，TYPE-B 必須往回走流程，不能就地改答案。

---

## 第三章：執行模式 Z（階段並行）

### 3.1 為何選 Z 而非 X 或 Y

| 模式 | 描述 | 優點 | 缺點 | 適用 |
|:--|:--|:--|:--|:--|
| X 嚴格接力 | 一課三 agent 全跑完才換下一課 | 品質可控、blocker 早暴露 | 燒 quota 慢、阻塞嚴重 | 品質第一 |
| Y 分科並行 | 三 agent 各跑一科 | 燒 quota 最快、agent 滿載 | PM 督導壓力大、failure 牽連多科 | 時間最大化 |
| **Z 階段並行 ⭐** | 階段化推進，已過階段的課可並行進下一階段 | 尊重契約順序、又能並行燒 quota、退路短 | 早期某些 agent 閒置 | 嚴謹 + 燒滿 + 不限時 |

### 3.2 模式 Z 的核心規則

1. **同一課必依序**：Research → Production → Verification（不可跳）
2. **不同課可並行**：A 課在雙盲時，B 課可在出題、C 課可在研究
3. **前一階段未完不進下一**：若該課研究未通過閘門，禁止該課進入出題
4. **失敗時短退路**：Verification 失敗只退到 Production；Production 失敗只退到 Research

---

## 第四章：階段流（不限時、門檻驅動）

### 4.1 階段定義

```
┌──────────────────────────────────────────────────────────────┐
│ 階段 0：前置（docs_ops）                                     │
│ JOB 數：1                                                    │
│ 內容：升級三 SKILL + 新增 karpathy-guidelines.mdc           │
│       + 建立 g5s2_results.tsv + 建立監控腳本                │
│       + 新增 check_dual_blind_consistency.js                │
│ 結束門檻：使用者驗收六項檔案、Cursor session 能讀到護欄      │
└──────────────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────┐
│ 階段 1：研究補強（research）                                 │
│ JOB 數：每科每版本一單，共 9 單（3 科 × 3 版）              │
│        ※ 國語可能僅需 3 單（KL4 大致齊備，需先 ls 復檢）    │
│ Agent：Research Cursor session × 1（單一 agent 跑完一單再起）│
│ 結束門檻：g5s2_results.tsv research 列 status ∈ {keep, β+_keep} │
└──────────────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────┐
│ 階段 2：出題（question_prod） — 與階段 3 重疊並行            │
│ JOB 數：每科每版本每課一單                                  │
│        估計 60-65 個 JOB（依實際課數確認）                  │
│ Agent：Production Cursor session × 1（可平行多 session）    │
│ 推進規則：階段 1 對應課 keep → 該課可進階段 2               │
│ 結束門檻：所有題庫 JSON CQI-P ≥ 5.5（evaluate --gate 0 err）│
└──────────────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────┐
│ 階段 3：雙盲驗證（question_verify） — 與階段 2 重疊並行      │
│ JOB 數：每科每版本一單，共 9 單                              │
│ Agent：Verification Cursor session × 1                      │
│ 推進規則：階段 2 該課過 → 該課可進階段 3                    │
│ 結束門檻：is_publishable ≥ 25 / 課；雙盲 Match 一致率 ≥ 90% │
└──────────────────────────────────────────────────────────────┘
                          ▼
┌──────────────────────────────────────────────────────────────┐
│ 階段 4：收尾（docs_ops）                                     │
│ JOB 數：1                                                    │
│ 內容：generate_library_stats.js + /pj_sync + Discord 摘要   │
│ 結束門檻：libraryStats.json 顯示 G5S2 三科 QL3+ 或 QL4     │
└──────────────────────────────────────────────────────────────┘
```

### 4.2 各階段 JOB 數估算（標🟡 推估）

| 階段 | JOB 數 | 推估依據 | 不確定性 |
|:--|:--|:--|:--|
| 階段 0 | 1 | 一份綜合 docs_ops | 確定 |
| 階段 1 | 9 | 3 科 × 3 版 | 國語可能精簡至 3 |
| 階段 2 | 約 60-65 | 自然 12 課 + 社會 16 課 + 國語 36 課（推估） | 各版本實際課數需 ls |
| 階段 3 | 9 | 每科每版一單，含全課雙盲 | 確定 |
| 階段 4 | 1 | 收尾 | 確定 |
| **合計** | **約 80** | — | 階段 2 為主要變數 |

---

## 第五章：JOB 模板骨架（8 段標準）

每類 JOB 派工單統一以此 8 段骨架填寫：

```markdown
# JOB-XXX [角色標籤] [年級][學期]-[科目]-[版本] [課/階段範圍]
job_type: research | question_prod | question_verify | docs_ops
agent_role: Research | Production | Verification
spec_versions: 出題 v?.? / 盲測 v4.3 / 研究 v4.3   ← 規範版本鎖
executor: Cursor (model: 由派工單明定真實代碼)
tsv_stream: jobs/g5s2_results.tsv

## 1️⃣ 啟動 Checklist（Pre-Flight）
- [ ] 已讀對應規範（列實際路徑）
- [ ] 前置素材查核（依角色不同：Prod 確認 KL4 雙檔；Verify 確認 CQI-P ≥ 5.5）
- [ ] 目標 QL 等級（α 路徑 = QL4 / β+ 路徑 = QL3）
- [ ] 路徑三向確認（manifest / JSON / 派工單一致）
- [ ] 規範版本鎖確認（spec_versions 與引用一致）

## 2️⃣ 任務邊界（What / What-Not）
- 做：[具體一句話]
- 不做：[具體幾句話，含禁止越界事項]

## 3️⃣ Karpathy 四原則 Reminder（每 session 開頭必念）
1. Think Before Coding：列出本批假設，缺資料就停
2. Simplicity First：DoD 之外的功能一律不做
3. Surgical Changes：只動本 JOB 鎖定的科×版×課×階段
4. Goal-Driven：DoD = verifiable success criteria，loop 到全綠

## 4️⃣ 執行步驟（含 Cursor 指令模板）
- 第 N 步：具體腳本與參數（含 --qpm 2 --conservative 等限速旗標）

## 5️⃣ DoD / Acceptance Checklist（驗收）
- [ ] [可驗證條件 1，附佐證數值欄] → verify: [實際指令輸出]
- [ ] [可驗證條件 2] → verify: [實際指令輸出]

## 6️⃣ results.tsv 寫入規則
每課跑完即寫一行至 jobs/g5s2_results.tsv：
commit\tagent\tsubject\tpublisher\tlesson\tCQI-P\tCQI-V\tMatch%\tQL\tstatus\tdesc\tts

status ∈ {keep, β+_keep, discard, crash, retry, manual_review}

## 7️⃣ 退件條件 / Triage（失敗如何分流）
- [按 agent 不同列具體條件，見第八章]

## 8️⃣ 成果 Checklist（Deliverables）
- [ ] jobs/JOB-XXX-Report.md
- [ ] jobs/g5s2_results.tsv 寫入該批所有列
- [ ] /pj_sync
- [ ] Discord 結案摘要（含 status 統計）
```

### 5.1 三類 JOB 客製化欄位差異

| 段落 | Research JOB | Production JOB | Verification JOB |
|:--|:--|:--|:--|
| 目標 QL | RM 標記至 RM2/3 | CQI-P ≥ 5.5（≠ 上架閘門） | CQI ≥ 6.5 + Match ≥ 85%（QL4 上架） |
| 腳本 | 人工 + LLM 輔助寫 KL4 雙檔 | `auto_generate_questions.js --target 30 --threshold 5.5 --qpm 2 --conservative` | `run_blind_eval.js`（Gemini）+ 第二次（Claude）+ `check_dual_blind_consistency.js` |
| 驗收佐證 | 考古題 ≥ 10、來源 ≥ 2、雙檔頭尾 hash | `evaluate_question_quality.js --gate` 0 errors | `logs/blind_eval_*.json` VAT 雙日誌 + 雙盲 Match 一致率 |
| tsv 欄位 | CQI-P/V/Match 全填 `-`，desc 寫 RM 等級 | CQI-P 填值，CQI-V/Match 填 `-` | CQI-P 沿用，CQI-V/Match 補滿 |

---

## 第六章：Cursor 規則檔三層整合

### 6.1 三層架構

```
┌─────────────────────────────────────────────────────────────┐
│  Cursor Agent 啟動瞬間發生的事                               │
│                                                             │
│  Step 1: IDE 自動讀 .cursorrules + .cursor/rules/*.mdc      │
│          Layer 1：通用護欄（永遠生效，alwaysApply: true）    │
│            • workspace-directory.mdc（Eidos 既有）          │
│            • project-startup-and-job-discipline.mdc（既有） │
│            • root-task-files.mdc（既有）                    │
│            • karpathy-guidelines.mdc（★ 新加）              │
│                                                             │
│  Step 2: Claude Code 用 cursor agent CLI 注入 prompt        │
│          Layer 2：角色 program（按 JOB 載入）                │
│            • _agent/skills/ei_research/SKILL.md             │
│            • _agent/skills/ei_qst/SKILL.md                  │
│            • _agent/skills/ei_verify/SKILL.md               │
│            ★ 升級加入 autoresearch 自主迴圈邏輯              │
│                                                             │
│  Step 3: prompt 指向具體 JOB                                │
│          Layer 3：本次任務 DoD                               │
│            • jobs/JOB-XXX-*.md（含 spec_versions）           │
└─────────────────────────────────────────────────────────────┘
```

### 6.2 階段 0 docs_ops JOB 涉及的檔案清單

| # | 動作 | 檔案 | 內容來源 | Why |
|:-:|:-:|:--|:--|:--|
| 1 | 新增 | `.cursor/rules/karpathy-guidelines.mdc` | 直接複製自 `githubFav/andrej-karpathy-skills/.cursor/rules/karpathy-guidelines.mdc` + 開頭加註「同步自外部專案」 | 給每個 cursor session 注入四原則護欄；alwaysApply: true |
| 2 | 升級 | `_agent/skills/ei_research/SKILL.md` | 加入：autoresearch 自主迴圈段、g5s2_results.tsv 寫入規則、commit per lesson、超時 reset、KL4 補強 NEVER STOP 條款 | Research agent 的 program.md |
| 3 | 升級 | `_agent/skills/ei_qst/SKILL.md` | 加入：autoresearch 段、Karpathy Goal-Driven 條款、CQI-P 失敗 retry 上限 | Production agent 的 program.md |
| 4 | 升級 | `_agent/skills/ei_verify/SKILL.md` | 加入：autoresearch 段、雙盲必跑兩 model 規則、MTP 分流自動執行 | Verification agent 的 program.md |
| 5 | 新增 | `jobs/g5s2_results.tsv` | 空檔，header：`commit\tagent\tsubject\tpublisher\tlesson\tCQI-P\tCQI-V\tMatch%\tQL\tstatus\tdesc\tts` | autoresearch 風格量化軌跡 |
| 6 | 新增 | `scripts/g5s2_tsv_monitor.sh` | 監控腳本（見第九章） | PM 監控用 |
| 7 | 新增 | `scripts/check_dual_blind_consistency.js` | 雙盲一致性檢查腳本（兩次盲測 JSON 比對 + MTP 分流） | L2 雙盲必需 |

**注意**：
- 第 1 號是直接複製外部檔，不算修改規範
- 第 2-4 號 SKILL.md 升級**屬於 `job_type: docs_ops`**，需要與本前置 JOB 整批進行
- 第 7 號為新腳本，可包進前置 JOB
- 順序：先做 #1、#5、#6（小、安全）→ 再做 #7（中等）→ 最後做 #2-#4（規範升級，需使用者驗收）

### 6.3 與 Eidos 規範第 3.2 條的相容性

> Eidos 規範說「禁止修改規範文件，除非 `job_type: docs_ops`」。

**處理方式**：將「升級三 SKILL.md」拆成獨立的 `docs_ops` JOB，作為三 agent 派工的前置條件。
- 不違反 Eidos 第 3.2 條
- 升級規範與執行任務分離（Karpathy Surgical Changes 原則）
- 失敗時可 rollback 不污染題庫

---

## 第七章：Cursor 派工指令範本

### 7.1 Research Agent

```bash
cursor agent --print --yolo --workspace . \
  "[Research Agent] 你是本 JOB 的研究員。請依以下規範執行：

   📚 必讀（先讀完才動手）：
     1. knowledge/README_研究架構總綱.md（KL/RM/α-β+ 路徑）
     2. _agent/skills/ei_research/SKILL.md（你的 program）
     3. jobs/JOB-XXX-AG-G5S2-[科目]-[版本]-research.md（本次任務）

   🛡️ 護欄（IDE 自動套用，無需手動讀取）：
     • karpathy-guidelines.mdc 四原則
     • workspace-directory.mdc / project-startup-and-job-discipline.mdc

   🎯 成功標準（Goal-Driven）：
     • 該版本所有課的 KL4 雙檔（單課研究 + 考古題與討論）齊備
     • 每課考古題 ≥ 10、來源 ≥ 2（不足 → 標 β+ + 降 QL3）
     • 全 commit、全 tsv 寫入

   🔁 自主迴圈（autoresearch 風格 NEVER STOP）：
     for 每個未過閘的課:
       1. 補齊 KL4 雙檔
       2. git commit
       3. 寫一行至 jobs/g5s2_results.tsv:
          \$commit\\tresearch\\t\$subject\\t\$publisher\\t\$lesson\\t-\\t-\\t-\\tRM\$X\\t\$status\\t\$desc\\t\$ts
       4. status = keep | β+_keep | manual_review | crash
     直到範圍內全綠或進入 manual_review，再產出 jobs/JOB-XXX-Report.md

   ⛔ 退件條件：
     • KL4 完全缺檔 → 退件 PM
     • 考古題 < 10 + < 2 來源 → 標 β+，繼續推進
     • 連 3 課 crash → 停下來等 PM 裁定" \
  > scripts/orchestrator-logs/JOB-XXX-research.log 2>&1 &
```

### 7.2 Production Agent

```bash
cursor agent --print --yolo --workspace . \
  "[Production Agent] 你是本 JOB 的出題工程師。請依以下規範執行：

   📚 必讀：
     1. question/README_出題與品管準則.md
     2. _agent/skills/ei_qst/SKILL.md
     3. jobs/JOB-XXX-AG-G5S2-[科目]-[版本]-L[N]-prod.md

   🎯 成功標準：
     • 該課題庫 JSON 通過 evaluate_question_quality.js --gate（0 errors）
     • CQI-P ≥ 5.5（avg），quality_level ≥ QL2
     • 30 題到位（如已有舊題，補到 30 題、CQI 升至 5.5）

   ⚙️ 標準產題指令（API 限流預設值，避免 JOB-184 教訓）：
     node scripts/auto_generate_questions.js \\
       --grade G5 --semester S2 --subject [SCI|SOC|CHI] \\
       --publisher [HANLIN|KANGHSUAN|NANYI] --lesson L[N] \\
       --target 30 --threshold 5.5 \\
       --qpm 2 --conservative \\
       --key Yotta --model [由派工單明定真實代碼]

   🔁 自主迴圈：
     for 每課:
       1. 跑產題指令
       2. 跑 evaluate_question_quality.js --gate
       3. 若通過 → git commit、寫 tsv keep
       4. 若 CQI-P < 5.5 → retry ≤ 3 次（每次間隔 30s）
       5. 仍失敗 → 寫 tsv manual_review、跳下一課
       6. 若 429 → 自動加 --conservative 重跑、間隔 60s
     NEVER STOP 直到全綠或進入 manual_review

   ⛔ 退件條件：
     • Schema violation → 即停（不能寫壞 JSON）
     • KL4 雙檔缺 → 退件 Research Agent
     • API 連 5 次 429 → 寫 tsv crash、停下等 PM" \
  > scripts/orchestrator-logs/JOB-XXX-prod.log 2>&1 &
```

### 7.3 Verification Agent（L2 雙盲）

```bash
cursor agent --print --yolo --workspace . \
  "[Verification Agent] 你是本 JOB 的盲測員。請依以下規範執行：

   📚 必讀：
     1. question/README_驗證與盲測準則.md（雙盲、CQI-V、QL、MTP 分流）
     2. _agent/skills/ei_verify/SKILL.md
     3. jobs/JOB-XXX-AG-G5S2-[科目]-[版本]-verify.md

   🎯 成功標準（L2 雙盲）：
     • 每題經兩個獨立模型盲測：Gemini Flash + Claude Haiku
     • 兩模型都 Match 才視為通過（is_publishable: true）
     • 雙盲一致率 ≥ 90%
     • 課級 is_publishable: true 題數 ≥ 25
     • 最終 CQI ≥ 6.5（CQI-P + CQI-V）

   ⚙️ 雙盲指令（兩次跑 + 一致性檢查）：
     # 第 1 盲：Gemini
     node scripts/run_blind_eval.js [path] --model gemini-2.0-flash --suffix _g
     # 第 2 盲：Claude
     node scripts/run_blind_eval.js [path] --model claude-haiku-4-5 --suffix _c
     # 一致性檢查（合併兩次結果並 MTP 分流）
     node scripts/check_dual_blind_consistency.js [path]
       → 兩 Match → keep（is_publishable: true）
       → 一致 Mismatch → MTP 分流
       → 不一致（一 Match 一 Mismatch）→ 標 partial、進 manual_review

   🔁 自主迴圈：
     for 每課:
       1. 雙盲執行
       2. 一致性檢查 → 分流
       3. git commit
       4. 寫 tsv：CQI-V、Match%、QL、status
     NEVER STOP 直到全課過 ≥ 25 is_publishable 閘門

   ⛔ 退件條件：
     • CQI-P < 5.5（前置條件） → 退件 Production
     • TYPE-B（原題錯）> 5%/課 → 整課退回 Production
     • 雙盲不一致率 > 20% → 停下等 PM 裁定" \
  > scripts/orchestrator-logs/JOB-XXX-verify.log 2>&1 &
```

---

## 第八章：退件 / 失敗處置流程

```
              ┌────────────────────────┐
              │  JOB 啟動（任一 agent） │
              └──────────┬─────────────┘
                         ▼
        ┌────────────────┴───────────────┐
        ▼                                ▼
  [Research]                     [Production]
  考古題 ≥ 10?                   CQI-P ≥ 5.5?
  /來源 ≥ 2?
        │                                │
   ┌────┴────┐                      ┌───┴────┐
   ▼         ▼                      ▼        ▼
   ✅      ❌(< 10)                  ✅     ❌(< 5.5)
   │       │                         │      │
   │   標 β+                         │  retry ≤ 3
   │   降 QL 上限至 QL3               │      │
   │       │                         │  ┌──┴──┐
   │       │                         │  ▼    ▼
   │       └→ tsv: β+_keep            │  ✅   ❌
   │                                  │  │   manual_review
   └→ tsv: keep                       │  │
                                       │  │
              ╔═════════════════════════╪══╪══════╗
              ║   交棒：CQI-P 過閘的課可進雙盲     ║
              ╚═════════════════════════╪══╪══════╝
                                        ▼
                              [Verification 雙盲]
                              Gemini & Claude 都 Match?
                                        │
                            ┌───────────┼───────────┐
                            ▼           ▼           ▼
                          ✅雙Match  一致Mismatch  不一致
                            │           │           │
                            │      [MTP 分流]    標 partial
                            │       ├ TYPE-A     進 manual_review
                            │       │  → 自動 resolved → tsv keep
                            │       │
                            │       ├ TYPE-B
                            │       │  → 退回 Production → tsv discard
                            │       │
                            │       └ TYPE-C
                            │          → manual_review
                            │
                            ▼
                       課級閘門檢查
                    is_publishable ≥ 25?
                            │
                       ┌────┴────┐
                       ▼         ▼
                      ✅         ❌(< 25)
                       │          │
                  QL4 升級    補題（回 Production）
                       │
                       ▼
                  /pj_sync + Discord
```

### 8.1 退件條件矩陣（Triage Matrix）

| 階段 | 失敗訊號 | 自動處置 | 標記 | 後續流程 |
|:--|:--|:--|:--|:--|
| Research | 考古題 < 10 + 來源 < 2 | 標 β+，降 QL 上限至 QL3，繼續推進 | `β+_keep` | 進階段 2（β+ 路徑） |
| Research | KL4 完全缺檔 | 即停，退件 PM | `crash` | PM 裁定（補件 / 跳該課） |
| Research | 連 3 課 crash | 停下，等 PM 裁定 | — | PM 介入 |
| Production | CQI-P < 5.5 | retry ≤ 3 次，每次間隔 30s | `retry` → `manual_review` | 連 3 次失敗：人工裁定 |
| Production | API 429 | 自動加 `--conservative`，間隔 60s | — | 連 5 次：寫 tsv crash 停下 |
| Production | Schema violation | 即停 | `crash` | PM 介入（不能寫壞 JSON） |
| Production | KL4 雙檔缺 | 退件 Research | — | Research 補件後再進 |
| Verification | 單盲 Mismatch | MTP 分流（A/B/C） | `keep` / `discard` / `manual_review` | A 自動 / B 退 Production / C 等人工 |
| Verification | 雙盲不一致（一 Match 一 Mismatch） | 標 `partial`，進人工 | `manual_review` | PM 裁定 |
| Verification | 雙盲不一致率 > 20% | 停下，等 PM 裁定 | — | 題目可能有系統性問題 |
| Verification | TYPE-B > 5%/課 | 整課退回 Production | — | Production 重出該課 |

---

## 第九章：results.tsv Schema + 監控

### 9.1 Schema（11 欄 + 1 ts，共 12 欄）

```tsv
commit	agent	subject	publisher	lesson	CQI-P	CQI-V	Match%	QL	status	desc	ts
```

| 欄 | 範例 | 說明 |
|:--|:--|:--|
| commit | `abc1234` | git commit short hash（每課一個 commit） |
| agent | `research` / `prod` / `verify` | 對應 job_type（簡寫） |
| subject | `Chinese` / `Science` / `SocialStudies` | 與 question/platform/ 目錄一致 |
| publisher | `HanLin` / `KangHsuan` / `NanYi` | 與目錄一致 |
| lesson | `L1` / `L7` | 課號 |
| CQI-P | `6.2` 或 `-` | 出題分；research 階段填 `-` |
| CQI-V | `3.4` 或 `-` | 盲測分；prod 階段填 `-` |
| Match% | `97%` 或 `-` | 雙盲一致 Match 率 |
| QL | `RM3` / `QL2` / `QL3` / `QL4` | 該課當前等級 |
| status | `keep` / `β+_keep` / `discard` / `crash` / `manual_review` / `retry` / `partial` | autoresearch 風格 |
| desc | `α 12考古/2來源` | 一句話描述（避免 tab/逗號） |
| ts | `2026-04-26T10:30` | ISO 8601 短格式 |

### 9.2 範例片段

```tsv
commit	agent	subject	publisher	lesson	CQI-P	CQI-V	Match%	QL	status	desc	ts
abc1234	research	Science	HanLin	L1	-	-	-	RM3	keep	α 12考古/2來源	2026-04-26T10:30
def5678	research	Science	HanLin	L2	-	-	-	RM2	β+_keep	無課文 reverse-lookup 8考古	2026-04-26T10:55
ghi9012	prod	Science	HanLin	L1	6.2	-	-	-	keep	30題 / 0 BIAS	2026-04-26T11:45
jkl3456	prod	Science	HanLin	L2	4.8	-	-	-	manual_review	retry3 仍 < 5.5	2026-04-26T12:30
mno7890	verify	Science	HanLin	L1	6.2	3.4	97%	QL4	keep	雙盲一致 / 30 publishable	2026-04-26T14:00
pqr1357	verify	Science	HanLin	L3	6.5	2.1	78%	QL3	manual_review	TYPE-C 5/30 不一致	2026-04-26T15:15
```

### 9.3 監控腳本

```bash
#!/bin/bash
# scripts/g5s2_tsv_monitor.sh
TSV="jobs/g5s2_results.tsv"
echo "=== G5S2 三 Agent 進度 ($(date '+%H:%M')) ==="
echo
echo "📈 status 分布："
awk -F'\t' 'NR>1{print $10}' "$TSV" | sort | uniq -c | sort -rn
echo
echo "📊 各 agent 進度（status=keep）："
awk -F'\t' 'NR>1 && $10=="keep" {a[$2]++} END {for (k in a) print "  "k": "a[k]" 課過閘"}' "$TSV"
echo
echo "⚠️  manual_review 待裁定："
awk -F'\t' 'NR>1 && $10=="manual_review" {print "  "$2"/"$3"/"$4"/"$5": "$11}' "$TSV"
echo
echo "🔥 最新 5 筆："
tail -n 5 "$TSV" | column -t -s $'\t'
```

呼叫：`bash scripts/g5s2_tsv_monitor.sh`，或 `tail -f jobs/g5s2_results.tsv | column -t -s $'\t'`。

### 9.4 雙盲一致性檢查腳本（新增）

`scripts/check_dual_blind_consistency.js` 偽碼：

```javascript
// 輸入：題庫 JSON 路徑（已含兩次盲測欄位 _g 和 _c）
// 輸出：
//   - 該檔每題的雙盲狀態（keep / partial / mismatch_consistent / mismatch_inconsistent）
//   - 課級統計：雙盲一致率、Match Rate（兩個 model 各自）、TYPE-A/B/C 分布
//   - 建議 status（寫入 g5s2_results.tsv）

讀取題庫 JSON
for 每題:
   gemini_match = (題目原 answer_index === gemini_predicted)
   claude_match = (題目原 answer_index === claude_predicted)
   if gemini_match && claude_match → 標 keep
   else if !gemini_match && !claude_match:
       if 兩模型 reasoning 都認為「找不到正確選項」 → TYPE-A → keep
       else if 兩模型推得相同答案但 ≠ 原 answer_index → TYPE-B → discard（退 Production）
       else → TYPE-C → manual_review
   else: 一致性失敗（一 Match 一 Mismatch）→ partial → manual_review

統計與輸出 markdown report：
  - 課級雙盲一致率
  - 各 status 題數
  - 建議寫入 tsv 的 status
  - 若 TYPE-B > 5% 或 不一致率 > 20% → 警告
```

---

## 第十章：歷史失敗陷阱對照（避雷清單）

| 歷史 JOB | 失敗模式 | 本 spec 的避雷設計 |
|:--|:--|:--|
| JOB-184 | API 429 限流卡住 | 7.2 標準產題指令預設 `--qpm 2 --conservative`；連 5 次 429 自動 crash 停下 |
| JOB-152 → 159 | `blind_evaluation=true` 假初始化 | 7.3 雙盲必跑兩次 + 一致性檢查腳本，不接受空欄寫死 |
| JOB-184 / 207 | 路徑命名不一致（Social vs SocialStudies） | 5.1 啟動 Checklist「路徑三向確認（manifest / JSON / 派工單）」 |
| JOB-141 | 部分完成藏於 Report 結尾 | 6 段 results.tsv 寫入規則：每課即時寫，不等 Report |
| JOB-200 | 多 Agent 銜接失誤 | 2.2 銜接契約 + 8.1 退件矩陣明列各 agent 失敗回退路徑 |
| JOB-207 / 206 | 規範版本漂移 | 5 段 JOB 模板 `spec_versions` 鎖規範版本 |
| JOB-209 | 長期循環任務無進度跟蹤 | 9 段 g5s2_results.tsv 持續寫入；監控腳本即時看戰報 |

---

## 第十一章：嚴謹度等級與不確定性聲明

### 11.1 嚴謹度等級（使用者選定）

**L2 雙盲**：Gemini Flash + Claude Haiku 各跑一次，兩 model 都 Match 才視為通過。雙盲不一致進 manual_review。

未採 L3（人工抽查）/ L4（三盲）的原因：在不限時但有 Cursor quota 約束下，L2 已能達成「絕對嚴謹的盲測」訴求，且雙盲 Match 一致率 ≥ 90% 的門檻提供足夠的品質保險。若 L2 結果顯示一致率不足 90%，可在階段 4 收尾前升級至 L3。

### 11.2 不確定性聲明（標🟡）

| 項目 | 不確定性 | 處置 |
|:--|:--|:--|
| 國語康軒 / 南一各課 KL4 雙檔完整度 | 盤點僅看到部分，需階段 1 第一個 JOB 起跑前 ls 復檢 | 階段 0 結束後做完整 ls，更新 spec 或 JOB |
| 階段 2 JOB 數（60-65） | 依各版本實際課數而定，未實 grep 全部 manifest | writing-plans 階段做精確計算 |
| 雙盲不一致率實際分布 | 預期 < 20%，但需第一批 verify JOB 結果回報 | 第一批跑完評估，必要時調整門檻 |
| Cursor 三天內能否跑完約 5700 次 LLM 呼叫 | 取決於 Gemini 免費額度與 Claude Haiku 計費 | 進度監控腳本即時看，超出預期則暫緩低優先課 |
| `check_dual_blind_consistency.js` 實作複雜度 | 中等，預估 200-300 行 | 階段 0 docs_ops JOB 內處理 |

---

## 第十二章：後續實作步驟

本 spec 通過使用者複核後，下一步：

1. **執行 brainstorming skill 收尾**（self-review + 使用者複核）
2. **呼叫 writing-plans skill** 產出實作 plan：
   - plan 內容：階段 0 → 4 的具體 JOB 清單（含 `job_manager.js next` 真實流水號取得時機）
   - 每個 JOB 的草稿先呈現對話、得使用者確認、才開單
   - 不在 plan 階段直接動手建 JOB
3. **使用者批准 plan 後**，依序：
   - 階段 0：開立 docs_ops JOB-XXX，使用者驗收六項檔案
   - 階段 1-4：依 spec 與 plan 推進，PM 監控 g5s2_results.tsv

---

## 附錄 A：規範版本鎖（spec_versions 對照）

| 規範文件 | 本 spec 引用版本 | 來源最後更新 |
|:--|:--|:--|
| `docs/README_通用作業準則.md` | （以實檔 last_updated 為準） | 2026-04-19 |
| `docs/README_任務派工準則.md` | 同上 | 2026-04-19 |
| `question/README_出題與品管準則.md` | 同上 | 2026-04-19 |
| `question/README_驗證與盲測準則.md` | v4.3 | 2026-04-19 |
| `knowledge/README_研究架構總綱.md` | v4.3 | 2026-04-19 |
| `andrej-karpathy-skills/.cursor/rules/karpathy-guidelines.mdc` | （直接複製，無版號） | 2026-04-26 取得 |
| `autoresearch/program.md` | （概念引用，無版號） | 2026-04-26 取得 |

實作 plan 階段每個 JOB 派工單須再次填寫真實版本，與本附錄一致。

---

## 附錄 B：相關歷史 JOB 索引（G5 相關，最近 100 jobs 內）

| JOB | 任務 | 當前狀態 | 與本 spec 關係 |
|:--|:--|:--|:--|
| JOB-178 | G5S2 國語三版本盲測 | 成功（QL3） | 待升 QL4，可由本 spec 階段 3 接手 |
| JOB-179 | G5S2 自然 KL4 單課研究建置 | 成功（24 檔） | 階段 1 自然部分前置完成 |
| JOB-180 | G5S2 社會 KL4 單課研究建置 | 成功（32 檔） | 階段 1 社會部分前置完成 |
| JOB-182 | G5S2 國語題庫驗證與修正 | 成功盲測 | 待升 QL4 |
| JOB-183 | G5S2 國語 14 課出題補強 | 進行中 | 可整併入本 spec 階段 2 |
| JOB-184 | G5S2 社會三版本出題 | 部分完成（API 429 卡住） | 本 spec 階段 2 重新接手，預設 `--qpm 2 --conservative` 避免重蹈 |

---

## 附錄 C：本 spec 自身的版控與更新紀律

- **本 spec 修改**：屬 docs_ops 範疇，需走完整 JOB 流程
- **小幅修正**（typo、佐證連結補充）：可在實作 plan 期間直接 commit，但需在 commit message 註明「spec 修補：[何處]」
- **重大變更**（階段拆分、agent 邊界改動、嚴謹度升級）：需重新 brainstorming → 重寫 spec → 使用者再次複核
