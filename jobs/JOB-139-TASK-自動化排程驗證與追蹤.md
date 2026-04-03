`last_updated`: 2026-04-03 16:35
`updated_by`: Claude Code (claude-haiku-4-5)
`status`: 暫停中

# JOB-139-TASK-自動化排程驗證與追蹤

## 派工背景

`orchestrator.js` 已於 2026-04-03 15:05 透過 macOS crontab 排程啟動。
本派工單供 Claude Code **在新 session 中讀取**，了解背景並執行驗收。

---

## 排程設定記錄

| 項目 | 內容 |
|---|---|
| 觸發方式 | macOS crontab（系統層，不依賴 Claude Code session） |
| 排程時間 | 2026-04-03 15:05 台灣時間 |
| 執行指令 | `node scripts/orchestrator.js` |
| 工作目錄 | `/Users/s389080/Documents/doc/work/0_AI_Project/eidosProject` |
| Log 輸出 | `scripts/orchestrator-logs/run.log` |
| State 檔 | `scripts/orchestrator-logs/state.json` |
| 最終報告 | `jobs/JOB-138-REPORT-總結.md`（orchestrator 完成後自動產出） |

---

## 任務範圍

| 項目 | 內容 |
|---|---|
| 主計畫 | `jobs/JOB-138-PLAN-G3G4-S2-自動化盲測補題計畫.md` |
| 總任務數 | 213 個（G3+G4 S2 全科課次，manifest 雜項已過濾） |
| 預估耗時 | 12–36 小時（依任務類型，每任務 30–90 分鐘） |
| 執行工具 | `claude --print`（每任務獨立 session） |

---

## Claude Code 驗收步驟

**當你（Claude Code）在新 session 被呼叫驗收時，依序執行：**

### Step 1：確認 orchestrator 狀態

```bash
# 確認 crontab 是否已自動清除（15:05 後應已觸發）
crontab -l

# 確認 orchestrator 是否還在執行中
ps aux | grep orchestrator

# 查看最新 log
tail -50 scripts/orchestrator-logs/run.log
```

### Step 2：讀取 state.json

```
scripts/orchestrator-logs/state.json
```

確認欄位：
- `lastUpdated`：最後更新時間
- 各任務 `status`：done / failed / needs_rework / in_progress
- 已完成數量 vs 總數

### Step 3：讀取 PLAN 進度摘要

```
jobs/JOB-138-PLAN-G3G4-S2-自動化盲測補題計畫.md
```

確認「進度摘要」區塊是否有更新（orchestrator 每完成 10 個任務更新一次）。

### Step 4：若已完成，讀取總結報告

```
jobs/JOB-138-REPORT-總結.md
```

確認：
- 各科達標率
- failed 清單與原因
- needs_rework 清單

### Step 5：驗收判斷

| 條件 | 結論 |
|---|---|
| 報告存在 + done ≥ 180 | 正常完成，可關閉 JOB-139 |
| orchestrator 仍在執行 | 尚未結束，回報進度，繼續等待 |
| run.log 有 Error / 停在某任務 | 記錄問題，回報使用者 |
| state.json 不存在 | orchestrator 未啟動，確認 crontab 是否觸發 |

---

## 常見問題排查

### crontab 沒有觸發？

```bash
# 確認 cron 服務是否啟用（macOS）
sudo launchctl list | grep cron

# 查看系統 cron log
grep CRON /var/log/system.log | tail -20
```

### orchestrator 中途停了？

```bash
# 從上次中斷點繼續（orchestrator 支援 --from 旗標）
node scripts/orchestrator.js --from T045
```

---

## 結案條件

- [ ] 所有任務已處理（done + skip + needs_rework + failed = 213）
- [ ] `JOB-138-REPORT-總結.md` 已產出
- [ ] 失敗任務已記錄並回報使用者
- [ ] crontab 條目已清除（`crontab -e` 移除那行）

---

## 暫停記錄

**暫停時間**：2026-04-03 16:35
**暫停者**：Claude Code
**暫停原因**：使用者要求
**已執行動作**：
- [x] 移除 crontab 條目（orchestrator 排程已停止）
- [x] JOB-139 狀態更新為「暫停中」

**恢復步驟**：
待使用者進一步指示
