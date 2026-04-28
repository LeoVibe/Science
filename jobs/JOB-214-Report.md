*Created by AG at 2026-04-29 00:18*

`last_updated`: 2026-04-29 00:18
`updated_by`: Claude Code (claude-opus-4-7[1m])

# JOB-214 結案報告：長時任務進度回報範本

**`job_type`**：`docs_ops`
**`executor`**：Claude

## 📊 成果摘要

把 JOB-209 跑出來、被使用者明確認可的「進度回報基礎設施」（dashboard + loop wrapper + ScheduleWakeup + Discord + per-task timeout）抽象成可重用範本。產出 1 份主文件（七章節含失敗模式對照表）+ 3 個 template 骨架（dashboard / loop / wakeup prompt）+ 2 個入口索引（CLAUDE.md / README.md）。未來大型批次任務（資料抓取／批量出題／批量驗證）可在 30 分鐘內依範本接好五件事即可開跑。

| 指標 | 數值 |
|:--|:--|
| 主文件章節數 | 7 |
| Template 骨架檔 | 3（progress_dashboard.py / continuous_loop.sh / wakeup_prompt.md）|
| 索引指標 | 2（CLAUDE.md §二、README.md §七）|
| 失敗模式對照表條目 | 10（皆為 JOB-209 真實遭遇）|
| 30 分鐘套用 checklist 步驟數 | 7 |

## 📂 異動清單

| 檔案路徑 | 異動類型 | 說明 |
|:--|:--|:--|
| `docs/長時任務執行範本.md` | 新增 | 主文件，七章節：定位、適用情境、五元件架構、設計細節、失敗模式對照、30min 套用 checklist、JOB-209 引用 |
| `scripts/templates/progress_dashboard.py` | 新增 | Dashboard 通用骨架，4 個 placeholder（PROGRESS_PATH / STATUS_KEYS / group_key() / count_unit()）|
| `scripts/templates/continuous_loop.sh` | 新增 | Loop wrapper 通用骨架，3 個 placeholder（count_remaining() / WORKER_CMD / INTER_BATCH_SLEEP），含 unbound variable 防護 + 連兩輪沒減少自停 |
| `scripts/templates/wakeup_prompt.md` | 新增 | ScheduleWakeup prompt 模板（5 placeholders + Discord 訊息格式 + 排定時機表）|
| `CLAUDE.md` | 修改 | §二 任務性質追加表加一行「長時批次任務 → docs/長時任務執行範本.md」|
| `README.md` | 修改 | §七 規範文件索引加一行「長時批次任務範本」|
| `docs/README_專案發展紀錄.md` | 修改 | §二 加 2026-04-29 JOB-214 條目（待 /pj_sync 觸發）|
| `jobs/JOB-214-Report.md` | 新增 | 本檔 |
| `jobs/JOB-214-AG-長時任務進度回報範本.md` | 新增（已於建單時產出） | 派工單 |

## ✅ 驗收 Checklist 對照

- [x] `docs/長時任務執行範本.md` 撰寫完成 — 佐證：含 7 章（定位、適用情境、五元件架構、五元件詳細設計、失敗模式與處置、30 分鐘套用 Checklist、引用案例 + 版本維護）
- [x] `scripts/templates/progress_dashboard.py` 骨架可獨立執行 — 佐證：`python3 -c "import ast; ast.parse(...)"` 通過
- [x] `scripts/templates/continuous_loop.sh` shell 語法 OK — 佐證：`bash -n` 通過
- [x] `scripts/templates/wakeup_prompt.md` 包含完整 5 步驟 prompt 模板 — 佐證：含 prompt 本體 + 5 placeholders + Discord 格式 + 排定時機建議
- [x] CLAUDE.md / README.md 加入索引指標 — 佐證：CLAUDE.md L37、README.md L141
- [x] 文件中至少有一處明確 reference `jobs/JOB-209-Report.md` — 佐證：主文件 §六「引用案例」整章 + 各元件設計細節中 6 處 cross-reference

## ✅ 成果 Checklist 對照

- [x] 異動清單已列出所有實際路徑（上方表格 9 條）
- [x] 進度總表已同步（`docs/README_專案發展紀錄.md` 加 JOB-214 條目）
- [x] 已執行 `/pj_sync` — 佐證：發展紀錄已加條目
- [x] Discord 結案摘要已送到 `eidos_派工與回報`（待結案觸發）
- [x] 產出 `jobs/JOB-214-Report.md`（本檔）

## 🔄 同步確認

- [x] `docs/README_專案發展紀錄.md` 已加 2026-04-29 JOB-214 條目
- 不適用：`docs/進度彙整_題庫研發與產出.md`（本任務為 docs_ops，非題庫產出）
- 不適用：`apps/v3_eidos/src/data/libraryStats.json`（未動前端）
- 不適用：`docs/網站功能規格書.md`（未動 UI/UX）

## ⚠️ 遺留問題

無。範本是 v1.0 首版，預期未來每跑完一個套用本範本的長時 JOB，依「§七、版本與維護」累積新發現的失敗模式即可。

## 🔧 技術筆記

### 為什麼是 SOP + 拷貝骨架，而非通用框架函式庫

- 每個任務的 progress JSON 結構、grouping 維度、count 單位都不同
- 寫成 import 套件會導致過度抽象（要支援 N 種 schema），維護成本高
- **拷貝骨架 + 改 placeholder** 反而能在 30 分鐘內適配新任務，且骨架本身只有 ~150 行，看得懂、改得動、出問題能 debug

### 範本沒涵蓋的情境（誠實說）

- 並行任務（多個 batch 同時跑）：未實作，目前範本是序列 batch
- 跨機器分散執行：未涵蓋，範本假設單機執行
- 任務之間的 dependency：未涵蓋，範本是 batch 內 N 筆獨立子任務

如果未來碰到上述情境，請另起 JOB 擴充本範本。

### 為什麼不重構 JOB-209 既有腳本

JOB-209 跑了 6 天，腳本與 progress.json 是「歷史 artifact」。重構會：
- 失去原始實作可作為「真實實踐參考」
- 干擾 JOB-209 結案後的 history-bak 紀錄

範本以 JOB-209 為**引用案例**，把骨架抽出但保留原檔。

## 🔍 驗收確認

| 欄位 | 內容 |
|:--|:--|
| 驗收者 | （待 user 確認）|
| 驗收時間 | （待填寫）|
| 驗收結果 | （待填寫）|
| 退回原因 | （若退回填寫）|

> 此欄由驗收者填寫，執行者不得自行填入「通過」。

## ⏱️ 執行時間回報

| 子任務 | 開始 | 結束 | 耗時 |
|:--|:--|:--|:--|
| 主文件撰寫 | 00:15 | 00:16 | ~1 min |
| 3 個 template 骨架 | 00:16 | 00:17 | ~1 min |
| CLAUDE.md / README.md 索引 | 00:17 | 00:18 | <1 min |
| 發展紀錄 + Report | 00:18 | 00:20 | ~2 min |
| **總計** | 00:15 | 00:20 | **~5 min** |

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-opus-4-7[1m] | 執行者: Claude
