*Created by AG at 2026-04-27 14:53*

`last_updated`: 2026-04-27 14:55
`updated_by`: Claude Code (claude-opus-4-7)

# JOB-211 — 斷點恢復子系統試行

`job_type`: docs_ops（含 engineering 子段）
`spec_doc`: docs/superpowers/specs/2026-04-27-progress-resume-system-design.md
`plan_doc`: docs/superpowers/plans/2026-04-27-progress-resume-system.md
`parent_jobs`: JOB-210
`執行者`: AG（Cursor agent）+ PM（Claude Code, 驗收）

## 📌 任務背景

JOB-210 試跑時發現缺乏「網路中斷／Job 中斷後的重啟與延續」機制。本 JOB 把該議題抽出，建立 Eidos 派工系統的通用斷點恢復子系統並試行驗證，可行後補進 JOB-210 結案紀錄與長期通用機制。

完整設計與實作見：
- spec：`docs/superpowers/specs/2026-04-27-progress-resume-system-design.md`
- plan：`docs/superpowers/plans/2026-04-27-progress-resume-system.md`
- 工程實作 13 個 task 已全綠（progress_common / append / sync / next / dm_prepare / parse_pm_reply / dm_finalize / monitor / pre-commit hook / llm_retry lib / 兩支底層腳本 retry）

## 🎯 任務目標

驗證「斷點恢復子系統」的 5 條跑通路徑（spec §8.2），確認可行後補進 JOB-210 結案紀錄並推廣為長期通用機制。

## 🚧 任務邊界

本次任務只做：
- 試行 5 條跑通路徑（spec §8.2 列出的 happy path / 中斷重啟 / DM 互動 / timeout / 底層 retry）
- 試行範圍只跑 Sci_HanLin_L1 一單（spec §8.5）
- 任一路徑 fail → 暫停、PM 介入決定改 spec／改實作／退設計

本次任務不做（遇到以下情況請停止並回報）：
- 修改子系統腳本邏輯（除非試行發現 bug，由 PM 裁定）
- 擴大試行到階段 1 剩 8 單（成功後另開 JOB）
- 修改 spec 結構（補強可，重設計需另議）

## 進度子系統設定

<!-- progress-config-start -->
schema: question_pipeline_v1
pm_response_timeout: 30
grade: G3
semester: S1
platform_dir: question/platform/G3/Science/S1/HanLin
range:
  - subject: Science
    publisher: HanLin
    lessons: L1..L1
<!-- progress-config-end -->

## 進度摘要（自動同步，勿手動編輯）

<!-- progress-summary-start -->
- 範圍總計：1 個單位
- 已 done：0（0.0%）
- pending_pm：0
- failed：0　paused：0　paused_offline：0
- manual_review：0
- partial：0　aborted：0　retry：0
- 最近 5 筆：
- 最後更新：2026-04-27T06:57 (sync from JOB-211-progress.tsv)
<!-- progress-summary-end -->

## PM 對話紀錄（progress_dm.sh 自動寫入）

<!-- progress-dm-log-start -->
（待 progress_dm 寫入）
<!-- progress-dm-log-end -->

## 📖 執行步驟

1. **路徑 1 happy path**：執行 `progress_next.sh JOB-211` → 跑 auto_generate + run_blind_eval → progress_append done → progress_sync → 派工單摘要正確顯示 1/1 done
2. **路徑 2 中斷重啟**：在 auto_generate 跑到一半 `kill -9` → 開新 Agent 執行 progress_next，應從未做的下一個 unit 接續、不重做 done
3. **路徑 3 DM 互動**：人為製造卡點（CQI-V Match Rate 強制 < 85%）→ progress_dm_prepare 寫 pending_pm + 送 DM → PM 在 Discord DM `1487650833775722497` 回 `1` → progress_parse_pm_reply 解析 → progress_dm_finalize accept → status 轉 done
4. **路徑 4 timeout 退出**：派工單 progress-config 改 `pm_response_timeout: 5`（5 分），不回應 → 5 分後 Agent 自主退出、status 保 pending_pm（不誤升 done）
5. **路徑 5 底層 retry**：人為短暫關 Wi-Fi 5 秒 → callLLM 觸發 ECONNREFUSED → llm_retry lib 退避 1s/4s/9s → Wi-Fi 復原 → 成功

每條路徑跑完寫一段佐證（命令輸出、進度檔片段、派工單摘要片段）到 Report。

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `docs/superpowers/specs/2026-04-27-progress-resume-system-design.md` | 子系統設計（§8.2 為 5 條跑通路徑） |
| `docs/superpowers/plans/2026-04-27-progress-resume-system.md` | 13 task 實作 plan |
| `scripts/progress_*.sh` | 子系統核心腳本 |
| `scripts/lib/progress_common.sh` `scripts/lib/progress_precommit.sh` `scripts/lib/llm_retry.js` | 共用 lib |
| `tests/progress_*.test.{sh,js}` `tests/llm_retry.test.js` | 單元測試（共 90+ case，全綠）|
| `CLAUDE.md` §3.5 §3.6 | Discord 互動、規劃／設計階段互動原則 |

## ✅ 啟動 Checklist (Pre-Flight)

> 每一項打勾前必須確實完成，不得預先全部打勾。

- [x] 已讀取：spec + plan + CLAUDE.md §3.5 §3.6
- [x] 已確認進度子系統腳本與測試全綠（13 task 工程實作驗證通過）
- [x] 已確認 pre-commit hook 第 4 節點啟用（commit 301e05b 實況驗證 sync 觸發）
- [x] **已確認執行模型**：[模型：gemini-3.1-flash]（使用者於 2026-04-27 14:58 對話授權）
- [x] **已確認使用金鑰**：[金鑰：Yotta]（使用者於 2026-04-27 14:58 對話授權）
- [x] **已確認操作頻次**：[QPM：1（--conservative 模式，避免免費額度限流）]
- [x] 已閱讀「任務邊界」並確認本次範圍

### 本次起跑 5 條路徑分工（PM 與使用者於 2026-04-27 14:58 對話確認）
- 路徑 1（happy path）：Cursor 全自動跑出題 + 盲測，PM 監控 log
- 路徑 2（中斷重啟）：本次起跑階段先不做，待路徑 1 通過後另行安排
- 路徑 3（DM 互動）：Cursor 觸發卡點 → PM 送 DM 至使用者 → **使用者親自於 Discord 回 1**
- 路徑 4（timeout 退出）：本次起跑階段先不做，待路徑 1 通過後另行安排
- 路徑 5（底層 retry）：**使用者啟動約 5 分鐘後關 Wi-Fi 5 秒並通知 PM**；Cursor 應觸發 ECONNREFUSED 退避重試

## ✅ 驗收 Checklist (Acceptance) — 5 條跑通路徑

> 每條路徑需附佐證（命令輸出、進度檔片段、派工單摘要片段）。

- [ ] **路徑 1 happy path**：Sci_HanLin_L1 出題 done、進度檔/派工單同步（佐證：________）
- [ ] **路徑 2 中斷重啟**：kill -9 後新 Agent 接續、不重做 done unit（佐證：________）
- [ ] **路徑 3 DM 互動**：人為卡點 → DM 送達 → PM 回 1 → done（佐證：DM msg_id _____ + 進度檔 row）
- [ ] **路徑 4 timeout 退出**：pm_response_timeout=5 不回應 → 5 分超時 → status 保 pending_pm（佐證：________）
- [ ] **路徑 5 底層 retry**：關 Wi-Fi 5 秒 → Agent 退避 retry → 成功（佐證：log 顯示退避 1s/4s/9s 訊息）

## ✅ 成果 Checklist (Deliverables)

> 每一項需在 Report 中有對應實際內容。

- [ ] `jobs/JOB-211-Report.md` 完成（5 條路徑各一段佐證 + 異動清單）
- [ ] spec 補強（如有發現）→ 直接修改 spec 並 commit；commit 訊息註明「JOB-211 試行發現」
- [ ] JOB-210 Report 末加索引行「後續補強：JOB-211（斷點恢復子系統）」
- [ ] 已執行 `/pj_sync`
- [ ] Discord 結案回報送 `#eidos_派工與回報`（chat_id `1487738477608177714`，CLAUDE.md §3.5）

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: {真實Meta中的模型代碼} | 執行者: AG+PM
（試行 JOB，每條路徑單獨記）

## 邊界與遺留

- 本 JOB 範圍只跑 Sci_HanLin_L1 一單（spec §8.5）
- 階段 1 剩 8 單試行成功後另開 JOB
- 試行任一路徑 fail → 暫停、PM 介入決定是否改 spec／改實作／退設計
