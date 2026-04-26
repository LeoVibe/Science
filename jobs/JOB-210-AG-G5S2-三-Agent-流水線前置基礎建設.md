*Created by AG at 2026-04-27*

`last_updated`: 2026-04-27
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-210-AG-建置-G5S2-三-Agent-流水線前置基礎建設

**`job_type`**：`docs_ops`

**`agent_role`**：PM (Claude Code)

**`spec_versions`**：
- 通用作業準則 last_updated: 2026-04-19
- 派工準則 last_updated: 2026-04-19
- 出題準則（CQI-P）last_updated: 2026-04-19
- 驗證準則（CQI-V）v4.3
- 研究架構總綱 v4.3
- karpathy-guidelines（複製自 githubFav/andrej-karpathy-skills，2026-04-26 取得）
- autoresearch program.md（概念引用，2026-04-26 取得）

**`spec_doc`**：`docs/superpowers/specs/2026-04-26-G5S2-tri-agent-cursor-pipeline-design.md`

**`plan_doc`**：`docs/superpowers/plans/2026-04-26-G5S2-stage0-bootstrap.md`

## 📌 任務背景

G5S2 三 Agent 流水線（Research / Production / Verification）的階段 0 前置工作。本 JOB 透過六項基礎檔案 + 三份 SKILL.md 升級，把 Karpathy 編程紀律（IDE 護欄）與 autoresearch 自主迴圈（量化軌跡）注入 Eidos 派工系統，使後續階段 1-4 派工有完整工具鏈與規範注入點。

過去 100 個 JOB 暴露多種失敗模式（API 限流、假初始化、路徑漂移、銜接含糊）；spec v1.0.0 已決議以三層整合（Eidos 規範 × Karpathy 護欄 × autoresearch 迴圈）解決。本 JOB 為該設計的可執行起點。

## 🎯 任務目標

完成下列 11 項變更後，使後續階段 1-4 派工能夠：
1. 啟動 Cursor session 即自動套用 Karpathy 四原則
2. 三 Agent 各自有「自主迴圈條款」可依循
3. 每課推進結果寫入 `g5s2_results.tsv`，PM 透過監控腳本即時看戰報
4. Verification Agent 有 `check_dual_blind_consistency.js` 完成 L2 雙盲分流

## 🚧 任務邊界

本次任務只做：
- 新增 6 項基礎檔案：`.cursor/rules/karpathy-guidelines.mdc`、`jobs/g5s2_results.tsv`、`scripts/g5s2_tsv_monitor.sh`、`scripts/check_dual_blind_consistency.js`、`tests/check_dual_blind_consistency.test.js`、`tests/fixtures/dual_blind_sample.json`
- 升級 3 份 SKILL.md（每份加 ≤ 8 行新段）：`_agent/skills/ei_research/SKILL.md`、`_agent/skills/ei_qst/SKILL.md`、`_agent/skills/ei_verify/SKILL.md`
- 產出 Report 並結案

本次任務不做（遇到以下情況請停止並回報）：
- 開階段 1-4 任何 JOB（屬後續 plan 範圍）
- 修改題庫 JSON（不動 `question/platform/`）
- 修改其他規範文件（`docs/README_*` 等不在本 JOB 範圍）
- SKILL.md 升級超出 8 行（違反 §1.1 薄觸發器原則）

## 📖 執行步驟

依 plan 文件 Task 2-12 執行：

1. Task 2：新增 `.cursor/rules/karpathy-guidelines.mdc`
2. Task 3：新增 `jobs/g5s2_results.tsv`（header only）
3. Task 4：新增 `scripts/g5s2_tsv_monitor.sh`
4. Task 5-7：TDD 新增 `check_dual_blind_consistency.js`（fixture → 紅燈測試 → 綠燈實作）
5. Task 8：升級 `_agent/skills/ei_research/SKILL.md`
6. Task 9：升級 `_agent/skills/ei_qst/SKILL.md`
7. Task 10：升級 `_agent/skills/ei_verify/SKILL.md`
8. Task 11：Smoke test 全綠驗收
9. Task 12：產出 Report

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `docs/README_通用作業準則.md` | 三段式 Checklist、§1.1 薄觸發器原則 |
| `docs/README_任務派工準則.md` | docs_ops `job_type` 邊界、結案流程 |
| `docs/superpowers/specs/2026-04-26-G5S2-tri-agent-cursor-pipeline-design.md` | 三層整合設計（v1.0.0） |
| `docs/superpowers/plans/2026-04-26-G5S2-stage0-bootstrap.md` | 14 個 task 細粒度執行步驟 |
| `githubFav/andrej-karpathy-skills/.cursor/rules/karpathy-guidelines.mdc` | mdc 來源檔（外部 repo） |
| `githubFav/autoresearch/program.md` | 自主迴圈設計概念來源 |

## ✅ 啟動 Checklist (Pre-Flight)

> 每一項打勾前必須確實完成，不得預先全部打勾。

- [ ] 已讀取：`docs/README_通用作業準則.md`、`docs/README_任務派工準則.md`
- [ ] 已讀取：spec v1.0.0 第六章
- [ ] 已讀取：plan 文件 Task 1-13
- [ ] 確認 `_agent/skills/` 三份 SKILL.md 為薄觸發器格式（≤ 20 行）
- [ ] **已確認執行模型**：claude-opus-4-7（Claude Code 直接執行，本 JOB 不呼叫外部 LLM）
- [ ] **已確認使用金鑰**：不適用（無 API 呼叫）
- [ ] **已確認操作頻次**：不適用（無 API 呼叫）
- [ ] 目標品質：N/A（本 JOB 為基礎建設，不涉及題目）
- [ ] 已閱讀「任務邊界」並確認本次範圍

## ✅ 驗收 Checklist (Acceptance)

> 本 JOB 為 `docs_ops` 基礎建設，**不適用** CQI-P / Match Rate / CQI 三項標準題庫驗收門檻；改採以下 8 項 DoD：

- [ ] `.cursor/rules/karpathy-guidelines.mdc` 存在且 `alwaysApply: true`（佐證：head -5 輸出）
- [ ] `jobs/g5s2_results.tsv` 存在且只有 header 行（佐證：cat -A 輸出顯示 12 欄 tab 分隔）
- [ ] `scripts/g5s2_tsv_monitor.sh` 可執行（chmod +x）且空 tsv 場景輸出正確（佐證：bash 執行輸出）
- [ ] `scripts/check_dual_blind_consistency.js` 通過 `tests/check_dual_blind_consistency.test.js` 全部測試（佐證：✅ All dual-blind consistency tests passed.）
- [ ] 三份 SKILL.md 各加入「自主迴圈條款」段，行數增加 ≤ 8 行（佐證：git diff --numstat 輸出）
- [ ] 所有變更已 commit，commit message 符合 Eidos 規範（佐證：git log --oneline 列表）
- [ ] `jobs/JOB-210-Report.md` 已產出（佐證：ls 確認）
- [ ] `node scripts/job_manager.js close JOB-210` 執行成功（佐證：腳本輸出）

## ✅ 成果 Checklist (Deliverables)

> 每一項需在 Report 中有對應的實際內容。不得用「已完成」「如上」「見程式碼」等抽象詞代替。

- [ ] 成果表格填寫完畢（11 項變更檔表 + 對應 commit hash）
- [ ] 進度總表已同步（`docs/進度彙整_題庫研發與產出.md`，由 `/pj_sync` 處理）
- [ ] 已執行 `/pj_sync`
- [ ] 產出 `jobs/JOB-210-Report.md`，異動清單已列出所有實際修改的檔案路徑
- [ ] Discord 結案摘要已送出（user-discord-relay 或可貼上摘要）

## 🚫 退件條件

- 任一 SKILL.md 升級超過 8 行 → 退件重做（違反 §1.1 薄觸發器原則）
- 雙盲腳本測試未通過 → 退件直到通過
- pre-commit hook 黃金測資失敗 → 修復後重 commit

## 真實回報本次對話的模型與花費

＄作業匯總：Token數: - | 花費: $- | 使用模型: claude-opus-4-7 | 執行者: Claude

（本 JOB 為基礎建設，無外部 API 呼叫；Token 統計由 Claude Code 環境提供，§5.1 情境 B 大型多任務 JOB 規則於 G5S2 流水線整體完成時統一回填。）

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| Task 1（建單） | - | - | - | Claude Code 環境限制（§5.3） |
| Task 2-7（六項檔案） | - | - | - | 同上 |
| Task 8-10（三 SKILL） | - | - | - | 同上 |
| Task 11-14（驗收 + 結案） | - | - | - | 同上 |
| **總計** | — | — | **-** | — |
