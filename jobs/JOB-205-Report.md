*Created by Claude Code at 2026-04-20 19:00*

`last_updated`: 2026-04-20 19:00
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-205 結案報告 — JOB-184 批次建檔事故修復（防破窗 + placeholder 清理）

**`job_type`**：`mixed`（engineering 防破窗 + docs_ops 事故文件 + question_prod 補 title）
**`executor`**：Claude Code（使用者 2026-04-20 17:30 授權 JOB-204 起延續至本 JOB）

---

## 📊 成果摘要

追查 JOB-204 發現的「分課卡顯示 L1/L2 佔位符」問題，定位至 2026-04-12 `eccb974` mega-commit（JOB-184）超範圍建檔事故。本 JOB 分三階段修復：

| 階段 | 內容 | 成果 |
|:--|:--|:--|
| 2 防破窗 | 3 支腳本 fallback 改 throw + 加 D-INT-5 gate + 新增 verify_no_placeholder_title | ✅ 完成 |
| 1 事故文件 | `docs/技術設定/JOB-184-批次建檔事故分析.md` | ✅ 完成 |
| 3 補 title | G5 Math × 3 publisher（30 課）+ G3 ENG × 3 publisher（12 課）共 42 課 | ✅ 完成 42 / 144 |

**並行產出**：subagent 完成 JOB-206 階段 0 前期研究（錯放題目抽樣分析），揭露 66% 錯放率的重大發現。

---

## 📋 各階段逐項狀態

### 階段 2｜防破窗（Engineering）

| # | 檔案 | 改動 | 狀態 |
|:--:|:--|:--|:--:|
| 2-A | `scripts/repair_manifests.js:63` | `\|\| id` fallback → 若無真實 title 則 throw Error | ✅ |
| 2-B | `scripts/auto_generate_questions.js:80`（getBankMeta）| title 缺或 `^L\\d+$` → throw | ✅ |
| 2-C | `scripts/job184_g5s2_social_orchestrator.js:147` | meta.title 缺或 `^L\\d+$` → throw | ✅ |
| 2-D | `scripts/verify_ui_data_integrity.mjs` | 新增 D-INT-5 規則（title 不得 LN 佔位符，warning 模式）| ✅ 跑 gate 顯示 174 筆 warning，不擋 |
| 2-E | `scripts/verify_no_placeholder_title.mjs` | 新檔，獨立稽核工具 | ✅ 跑起來列出開放範圍 placeholder manifest 清單 |

### 階段 1｜事故文件（docs_ops）

- ✅ 建 `docs/技術設定/JOB-184-批次建檔事故分析.md` 全文
- 內容含：事故一分鐘摘要、42 個 placeholder 科目/年級分佈、三層防線崩壞分析、連鎖崩壞路徑、防治措施、未來預警訊號

### 階段 3｜補 title（question_prod）

| 來源 | 範圍 | 完成數 |
|:--|:--|:--:|
| KL4 檔名 parse | G5 Math S2 × 3 publisher | **30 課 × (manifest + lesson JSON) = 60 檔同步** |
| 英語發展綱要 §三.1 | G3 English S2 × 3 publisher | **12 課 × (manifest + lesson JSON) = 24 檔同步** |
| **小計** | 6 manifest | **42 課 / 84 檔 JSON 同步** |

**Placeholder 變化**（開放範圍 G3-G6 × S2）：
- 開工前：33 manifest 有 placeholder
- 完工後：27 manifest 仍有 placeholder（減 6）
- 減少 course 數：42 課從「LN 佔位符」變真實課名

---

## 📂 異動清單

### 新增檔案

| 路徑 | 說明 |
|:--|:--|
| `docs/技術設定/JOB-184-批次建檔事故分析.md` | 階段 1 事故分析報告（~120 行）|
| `scripts/verify_no_placeholder_title.mjs` | 階段 2 獨立稽核工具（~100 行）|
| `scripts/job205_sync_title_from_kl4.mjs` | 階段 3 KL4→manifest 同步通用腳本 |
| `scripts/job205_patch_eng_g3s2.mjs` | 階段 3 G3 S2 英語 patch（資料取自三下英語發展綱要 §三.1）|
| `jobs/JOB-205-USER-JOB-184批次建檔事故修復-防破窗與placeholder清理.md` | 本 JOB 派工單 |
| `jobs/JOB-205-Report.md` | 本結案報告 |
| `jobs/JOB-206-USER-題目scenario規範與錯放題目審查.md` | 預開，子 agent 已跑完階段 0 前期研究 |
| `docs/question-audit/JOB-206-前期研究.md` | 子 agent 產出（錯放題目 7 章節抽樣分析報告）|

### 修改檔案

| 路徑 | 說明 |
|:--|:--|
| `scripts/repair_manifests.js` | 2-A fallback 改 throw |
| `scripts/auto_generate_questions.js` | 2-B getBankMeta throw |
| `scripts/job184_g5s2_social_orchestrator.js` | 2-C throw |
| `scripts/verify_ui_data_integrity.mjs` | 2-D 加 D-INT-5 規則與 warning 輸出 |
| `question/platform/G5/Math/S2/HanLin/*` | manifest + 10 lesson JSON title 補齊 |
| `question/platform/G5/Math/S2/KangHsuan/*` | 同上 |
| `question/platform/G5/Math/S2/NanYi/*` | 同上 |
| `question/platform/G3/English/S2/HanLin/*` | manifest + 4 lesson JSON title 補齊 |
| `question/platform/G3/English/S2/KangHsuan/*` | 同上 |
| `question/platform/G3/English/S2/NanYi/*` | 同上 |
| `docs/README_專案發展紀錄.md` | 新增 JOB-205 條目（commit 時改） |

**Git stat 預估**：7 支 script + 6 manifest + 42 lesson JSON + 3 docs + 3 jobs = **61 檔變更**。

---

## ✅ Checklist 對照

### 啟動 Checklist
- [x] 已讀 4 支待修腳本（repair_manifests, auto_generate_questions, job184_g5s2_social_orchestrator, verify_ui_data_integrity）
- [x] 已確認 JOB-184 Report 與 eccb974 commit 事實
- [x] 已建 branch `job-205-placeholder-fix`

### 驗收 Checklist
- [x] 2-A/B/C: 3 處 fallback 改 throw — 佐證：git diff 三檔
- [x] 2-D: D-INT-5 規則存在、warning 計數顯示 174 筆 — 佐證：跑 `verify_ui_data_integrity.mjs --gate` 輸出
- [x] 2-E: `verify_no_placeholder_title.mjs` 可列 27 檔 — 佐證：跑腳本輸出
- [x] 階段 1: 事故文件建立 — 佐證：檔案存在 + 含 8 章節
- [x] 階段 3a: G5 Math × 3 title 全補（30 課 manifest + lesson 同步）— 佐證：verify_no_placeholder_title 減 3 manifest
- [x] 階段 3b: G3 ENG S2 × 3 title 全補（12 課）— 同佐證
- [x] D-INT-5 warning 從 174 → 132（減少 42 個）
- [x] 測試硬閘：L1-3 verify_ui_data_integrity `--gate` 通過（0 違規 + D-INT-5 warning 不擋）
- [x] 已執行 `/pj_sync` 全域知識沉澱（2026-04-20 19:05；規格書 §1.1/§1.4 非本 JOB 動、發展紀錄 commit 內同步、題庫進度表待 JOB-206 一併更新）

### 測試結果
- ✅ L1-3 `verify_ui_data_integrity.mjs --gate`：6157 題掃過，D-INT-1/2/3/4 各 0 違規
- ✅ `verify_no_placeholder_title.mjs`：開放範圍內 placeholder manifest 從 33 降至 27

---

## ⚠️ 遺留問題

### §1 開放範圍內 27 manifest 仍為 placeholder

| 範圍 | manifest 數 | 課數估計 | 建議來源 |
|:--|:--:|:--:|:--|
| G3 MATH/SCI/SOC S2 | 9 | ~58 | `knowledge/source/三下*.jpg` 圖片判讀（需 Claude vision） |
| G4 MATH S2 | 3 | 30 | WebSearch 各出版社 G4 數學目錄 |
| G4 ENG S2 | 3 | 12 | 四下英語發展綱要缺 Unit 清單（需 WebSearch 或使用者提供）|
| G5 ENG S2 | 3 | 6 | 五下英語發展綱要缺 Unit 清單 |
| G6 MATH/SCI/SOC S2 | 9 | ~30 | 完全無研究資料，需先跑 KL3/KL4 研究 |
| **合計** | **27** | **~136** | — |

**處理建議**：分批獨立開 `research` 類 JOB 或整合到 JOB-206 後續階段。

### §2 非開放範圍的 S1 placeholder（15 manifest）

英語 G3/G4/G5 × S1 × 3 publisher = 9 個 + 其他 S1 組合 6 個。非開放範圍（`OPEN_GRADE_SEMESTERS` 僅含 S2），目前學生不可見，優先級低。列入未來整批 S1 研究 JOB。

### §3 Layer 2 commit 紀律工具化未實施

JOB-184 事故的「commit message 只提一個 JOB 但 diff 含多個 JOB」問題，本 JOB 未處理。建議另開 engineering JOB：
- Pre-commit hook 檢查 commit 改動是否超出派工單 `任務邊界`
- `job_manager.js close` 強制對照派工單 vs commit 檔案清單

### §4 JOB-206 前期研究揭露的**重大風險**（非本 JOB 範圍但關聯）

Subagent（JOB-206 階段 0）抽樣 5 檔 183 題結果：
- **C2（錯放其他課文題目）：~52%**
- **C3（主題憑空虛構）：~14%**
- **真正符合課文：僅 34%**
- 外推 117 檔約 **2,600-4,900 題**可能受影響

最嚴重案例：
- **G5 HanLin L4「滿修女採訪記」**：54 題中 >90% 錯放（整檔是小明小華救小鳥的童話），JOB-178 盲測結案腳本漏掉 AI 已明確標註的「題目與課文無關」警告
- **G3 HanLin L2「還差一點」**：30 題中 0 題正確
- **G5 NanYi L4「縣官審石頭」**：12 題中 10 題錯放（太陽公公、雨後彩虹等）

**處理**：JOB-206 階段 1-3 承接（需使用者核准付費 LLM 審核預算）。

### §5 Before/After 截圖未產出

Claude Code 環境限制；使用者若切到 `/g5/mat/s2/hlm` 等應看到真實課名（而非 L1/L2）。

---

## 🔧 技術筆記

### 為什麼 D-INT-5 只上 warning 模式

- 當前 27 manifest 仍有 placeholder
- 若硬擋 gate，會阻斷所有後續 commit（包含本 JOB 的 commit）
- **升級路徑**：當所有開放範圍 placeholder 都補齊後（需使用者決定來源優先級與 JOB-206 進度），把 D-INT-5 從 warning 升級為 error

### 為何只做 G5 Math 與 G3 ENG？

**資料可得性**決定：
- G5 Math S2：KL4 研究完整（`knowledge/課綱研究/數學/五下/` 三家 publisher 全有 KL4 檔），直接 parse 檔名即得真實課名
- G3 ENG S2：`三下_英語_發展綱要.md §三.1` 列出三家 publisher 的 Unit 1-4 課名
- 其他組合：缺對應 KL4 或發展綱要中缺結構化課名清單，若用 AI 幻覺補會比佔位符更糟

### Layer 2 commit 紀律仍是未解之痛

本 JOB 的 commit 依然跨多階段（engineering + docs_ops + question_prod），但藉由 **commit message 完整描述三階段**、**Report 精確列異動範圍** 來部分彌補。未來應工具化（見 §遺留 §3）。

---

## 🔍 驗收確認

| 欄位 | 內容 |
|:--|:--|
| 驗收者 | user（待使用者打開 http://localhost:8080/g5/mat/s2/hlm 確認看到真實課名）|
| 驗收時間 | — |
| 驗收結果 | — |
| 退回原因 | — |

---

## ⏱️ 執行時間回報

| 子任務 | 實際時間 | 備註 |
|:--|:--|:--|
| 階段 2 防破窗 | - | Claude Code 環境限制，填 `-` |
| 階段 1 事故文件 | - | 同上 |
| 階段 3a G5 Math | - | 同上 |
| 階段 3b G3 ENG | - | 同上 |
| 收尾 | - | 同上 |
| **總計** | **-** | 依 `docs/README_通用作業準則.md §5.3` |

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-opus-4-7 + subagent(general-purpose) | 執行者: Claude Code
