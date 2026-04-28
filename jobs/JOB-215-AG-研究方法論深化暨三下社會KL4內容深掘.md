*Created by Claude Code (claude-opus-4-7) at 2026-04-29*

`last_updated`: 2026-04-29
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-215-AG-研究方法論深化暨三下社會KL4內容深掘

**`job_type`**：`mixed`（`docs_ops` Phase 1+3 + `research` Phase 2）
**`executor`**：Claude Code (claude-sonnet-4-6) PM 親跑（**使用者授權例外** — 研究方法論深化，2026-04-28/29 對話授權；預算無上限）
**`parent_jobs`**：JOB-212（接續其檔名規範收斂後的內容深掘工作）

---

## 📌 任務背景

JOB-212 已完成研究方法論的「**檔名/結構規範**」收斂（v4.4 加 4 條：KL3 必含課名 / KL3 命名 / KL4 雙檔 / 素材庫禁止），並建立三下社會翰林 KL4 12 檔的「**空殼結構**」（每檔 815/624 字元，標 RM0）。

但仍有缺口：

1. 規範缺「**內容層**」章節：研究流程程序與原則、歷史卡點與防範、量化 DoD（KL2/3/4 字數/條目下限）、執行者分工規範
2. 翰林 KL4 12 檔是**空殼**，內容未深掘到 RM3 標準（對照 JOB-170 四下翰林 KL4 深 6 倍）
3. 三下社會康軒 KL4 全空（6 課 12 檔）、南一只 L5（補 5 課 10 檔）
4. 三下社會 KL2「社會科共同發展總綱」未納入新量化 DoD
5. 105 份考古題 markdown（南一 24 / 翰林 30 / 康軒 51）未按課次分類灌進 KL4

---

## 🎯 任務目標

完成後達到以下可驗證狀態：

1. `README_研究架構總綱.md` 加 4 個內容層章節（流程／卡點／量化 DoD／執行者分工）
2. 拆派工模板：`_JOB-TEMPLATE-research-KL3.md` + `_JOB-TEMPLATE-research-KL4.md`，舊 `_JOB-TEMPLATE-research.md` 改 `.deprecated.md`
3. 三下社會 KL2「社會科共同發展總綱」補強符合新 DoD
4. 三下社會 17 課 × 2 檔 = **34 個 KL4 雙檔**內容深掘到 RM3 標準（每檔達新量化 DoD）
5. 105 份考古題 markdown 依課次分類灌進 KL4「考古題與討論」段落
6. 比較分析報告（vs JOB-212 規範層 / vs 四下翰林深度標竿 / vs 既有題庫）

---

## 🚧 任務邊界

**只做**：

- Phase 1：規範深化（4 章節新增 + 派工模板拆兩檔）
- Phase 2：三下社會 demo（KL2 補強 + 三版本 17 課 KL4 深掘 + 考古題分類）
- Phase 3：比較分析

**不做**：

- 不出題、不盲測（既有題庫保留）
- 不升級五下／四下／六下等其他學期 KL2/3/4
- 不改 CLAUDE.md（除非規範本身要更新）
- 不整合 chandra 工具（總綱僅指向，不寫 SOP）
- 不處理三下 G3S1（上學期）
- 不重做 JOB-212 已完成的檔名收斂工作

---

## 📖 執行步驟

### Phase 1：規範深化（docs_ops，session 1，估 2-3 天）

1. 讀齊既有方法論文件
   - `knowledge/README_研究架構總綱.md`（v4.4，JOB-212 後）
   - `jobs/_JOB-TEMPLATE-research.md`（舊版）
   - `knowledge/3_考古題/README.md`
   - JOB-170 / JOB-181 / JOB-184 既有 KL4 實例
2. 設計 4 個新章節結構與量化指標
3. 改寫 `README_研究架構總綱.md` 加章節：
   a. **研究流程程序與原則**（不寫指令層細節，只寫做什麼／為什麼／誰做）
   b. **歷史卡點與防範**（≥5 個從 JOB Reports 整理的歷史卡點）
   c. **量化 DoD**（KL2/KL3/KL4 各層字數下限、條目數下限、來源數下限）
   d. **執行者分工規範**（哪些必須 Opus、哪些可派 Cursor、哪些可手動）
4. 拆派工模板兩檔：
   - `jobs/_JOB-TEMPLATE-research-KL3.md`（含跨版本矩陣 DoD、學術文獻 ≥3、迷思矩陣）
   - `jobs/_JOB-TEMPLATE-research-KL4.md`（含雙檔結構、α/β+ 路徑、考古題量化、誘答字數下限）
5. 舊模板改名 `_JOB-TEMPLATE-research.deprecated.md` + 加 deprecation notice
6. Phase 1 commit + 給使用者 review

### Phase 2：三下社會 KL4 內容深掘（research，session 2-N，估 5-10 天）

1. **考古題分類**：105 份 markdown 按課次（L1-L6）分類
   - 三下_社會_南一 24 份 → 5 課（南一是 5 課）
   - 三下_社會_翰林 30 份 → 6 課
   - 三下_社會_康軒 51 份 → 6 課
2. **KL2 補強**：`KL2_社會科共同發展總綱.md` 加新章節（依新量化 DoD，不重寫）
3. **三下社會 KL4 深掘**：17 課 × 2 檔 = 34 個 KL4 雙檔填內容到 RM3 標準
   - 翰林 6 課 12 檔（既有空殼填內容）
   - 康軒 6 課 12 檔（建結構 + 填內容）
   - 南一 5 課 10 檔（L5 升級 + L1-4 從零）
4. CK-01~06 自我稽核閘門全綠
5. Phase 2 commit + 給使用者 review

### Phase 3：比較分析 + 結案（docs_ops，session N+1，估 1-2 天）

1. 比較分析報告（`jobs/JOB-215-比較分析報告.md`）：
   a. 新規範 vs JOB-212 後規範（規範層 vs 內容層）
   b. 三下社會新 KL4 vs 四下翰林 KL4 深度標竿（字數／結構對照）
   c. 三下社會新 KL3+KL4 vs 既有題庫（題庫缺口、迷思未對應分析）
2. 後續 JOB backlog（升級五下、出題對比等）
3. `jobs/JOB-215-Report.md`
4. `node scripts/job_manager.js close JOB-215`
5. `/pj_sync`
6. Discord 結案回報送 chat_id `1487738477608177714`

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `knowledge/README_研究架構總綱.md` | 研究方法論本體（JOB-212 已加結構規範，本次加內容規範） |
| `jobs/_JOB-TEMPLATE-research.md` | 舊模板（要拆 + deprecate） |
| `knowledge/3_考古題/README.md` | 考古題規範與索引 |
| `knowledge/3_考古題/2_MD淬鍊文字/三下/三下_社會_*/` | 三下社會 105 份考古題 markdown |
| `knowledge/1_課綱研究/社會/三下/翰林/` | 既有翰林 KL4 12 檔空殼（升級情境） |
| `knowledge/1_課綱研究/社會/三下/南一/` | 既有南一 KL4 1 檔（L5） |
| `knowledge/1_課綱研究/社會/KL3_三下_社會_研究總綱.md` | JOB-212 已建（含三版本課名清單） |
| `knowledge/1_課綱研究/社會/KL2_社會科共同發展總綱.md` | KL2 通則（補新章節） |
| `knowledge/1_課綱研究/社會/四下/翰林/KL4_四下_翰林_L1_*` | 深度標竿（JOB-170 產出） |
| `jobs/JOB-170-AG-G4S2-社會KL4單課研究建置.md` | 既有 KL4 派工實例 |
| `jobs/JOB-212-USER-規範治理-*.md` | 前置任務（檔名規範收斂） |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀「關鍵參考檔案」全部
- [ ] 已確認執行者：Claude Code (claude-opus-4-7) PM 親跑（2026-04-28 對話授權）
- [ ] 已確認預算：無上限（2026-04-28 對話授權）
- [ ] 已確認範圍：三下社會 17 課（不含五下、不含其他學期、不含出題盲測）
- [ ] 已確認三 phase 分 session：Phase 1 / Phase 2 / Phase 3 獨立 session

---

## ✅ 驗收 Checklist (Acceptance)

> 本 JOB 為 docs_ops + research，無 CQI 指標。改以結構完整性 + 字數深度驗收。

### Phase 1（規範深化）

- [ ] `README_研究架構總綱.md` 新增「研究流程程序與原則」章節（附行號佐證）
- [ ] `README_研究架構總綱.md` 新增「歷史卡點與防範」章節，列 ≥5 個歷史卡點（附行號佐證）
- [ ] `README_研究架構總綱.md` 新增「量化 DoD」章節，明確 KL2/KL3/KL4 字數下限與條目數下限（附行號佐證）
- [ ] `README_研究架構總綱.md` 新增「執行者分工規範」章節（附行號佐證）
- [ ] `_JOB-TEMPLATE-research-KL3.md` 含跨版本矩陣 DoD、學術文獻 ≥3、迷思矩陣
- [ ] `_JOB-TEMPLATE-research-KL4.md` 含雙檔結構、α/β+ 路徑、考古題量化、誘答字數下限
- [ ] `_JOB-TEMPLATE-research.deprecated.md` 改名 + deprecation notice

### Phase 2（三下社會 KL4 內容深掘）

- [ ] 105 份考古題 markdown 已按課次分類（每份 markdown 標 lesson）
- [ ] `KL2_社會科共同發展總綱.md` 已加新章節符合 Phase 1 量化 DoD
- [ ] 三下社會翰林 6 課 12 檔填內容（每檔字數達 Phase 1 量化 DoD）
- [ ] 三下社會康軒 6 課 12 檔建結構 + 填內容（每檔達 DoD）
- [ ] 三下社會南一 5 課 10 檔（L5 升級 + L1-4 從零，每檔達 DoD）
- [ ] CK-01~06 自我稽核閘門全綠

### Phase 3（比較分析）

- [ ] 比較分析報告完成（含 vs JOB-212 / vs 四下翰林標竿 / vs 既有題庫）
- [ ] 後續 JOB backlog 完成
- [ ] JOB-215-Report.md 完成

---

## ✅ 成果 Checklist (Deliverables)

- [ ] `knowledge/README_研究架構總綱.md`（改寫，4 章節新增）
- [ ] `jobs/_JOB-TEMPLATE-research-KL3.md`（新）
- [ ] `jobs/_JOB-TEMPLATE-research-KL4.md`（新）
- [ ] `jobs/_JOB-TEMPLATE-research.deprecated.md`（改名）
- [ ] `knowledge/1_課綱研究/社會/KL2_社會科共同發展總綱.md`（補強）
- [ ] 三下社會考古題 markdown 105 份按課次分類完成
- [ ] `knowledge/1_課綱研究/社會/三下/翰林/KL4_*` 12 檔填內容
- [ ] `knowledge/1_課綱研究/社會/三下/康軒/KL4_*` 12 檔（新）
- [ ] `knowledge/1_課綱研究/社會/三下/南一/KL4_*` 10 檔（5 補新 + L5 升級）
- [ ] `jobs/JOB-215-比較分析報告.md`
- [ ] `jobs/JOB-215-Report.md`
- [ ] `node scripts/job_manager.js close JOB-215`
- [ ] `/pj_sync`
- [ ] Discord 結案回報送 chat_id `1487738477608177714`

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token 數: -- | 花費: --（無上限授權） | 使用模型: Claude Code (claude-sonnet-4-6) | 執行者: PM 親跑

每 phase commit 時記實際 token／花費（如可取得 meta）。

---

## 邊界與遺留

- 不升級五下／四下／六下等其他學期 KL2/3/4（後續 JOB）
- 不出題、不盲測（既有三下社會題庫品質如有問題列入 Phase 3 比較分析）
- 不改 CLAUDE.md（除非規範本身要更新）
- chandra 工具不做整合，僅在總綱指向（後續若需要再開 JOB）
- 三下社會 G3S1（上學期）的研究本次不處理
- 三下社會考古題 markdown 105 份是否充分對應 17 課（可能某些課對應不到 ≥10 題）— Phase 2 開始時評估，若有缺口列邊界遺留
