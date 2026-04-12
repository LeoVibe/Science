`last_updated`: 2026-04-03 22:00
`updated_by`: Claude Code (claude-haiku-4-5)
`status`: 診斷完成，需要重新規劃

# JOB-139-TASK-自動化排程驗證與追蹤

## 問題診斷

**當前執行狀況：**
- ✅ Orchestrator 進程正常運行
- ✅ Crontab 已正確觸發 (21:26)
- ❌ **所有任務失敗：Report 檔案全未產出**

**根本原因：**
設計缺陷。原始流程假設：
```
orchestrator → claude --print → Report 檔案產出
```

但實際上 `claude --print` 只會打印到 stdout，不會生成文件。

---

## 原始設計的誤解

| 項目 | 原始假設 | 實際情況 |
|---|---|---|
| **Report 生成者** | `claude --print` | ❌ 不會生成文件 |
| **預期流程** | 直接調用 claude CLI | ❌ 不支持文件輸出 |
| **正確流程應該是** | - | ✅ Cursor CLI / Gemini CLI 執行任務 |

---

## 應正確的架構

根據你的概念：
> "Claude Code 當作總指揮來呼叫 Cursor 或 Gemini 的 CLI"

**正確流程應為：**

```
Claude Code（總指揮）
    ↓
  調用 Cursor CLI --print (執行 T001 任務)
    ↓
  Cursor 執行任務，生成 Report 到 jobs/JOB-140-REPORT.md
    ↓
  Orchestrator 檢查 Report 存在性和內容
    ↓
  更新 state.json，標記 done/failed/needs_rework
    ↓
  回報進度給 Claude Code
```

---

## JOB-139 的正確用途

JOB-139 不應該是「驗證 cron 的自動排程」，而應該是：

### **驗收項目**

- [ ] **流程設計確認**
  - 是否應該由 Cursor CLI / Gemini CLI 來執行任務？
  - Report 應由誰生成？路徑是否正確？

- [ ] **執行方式確認**
  - orchestrator.js 應該改為調用 `cursor --print` 還是 `gemini --print`？
  - 還是改為 Claude Code 直接調用 CLI？

- [ ] **Report 格式確認**
  - Report 應包含的內容（Match Rate、CQI-V、是否達標等）
  - 放置路徑確認

---

## 建議方案

### **方案 A：改進 Orchestrator（推薦）**

修改 orchestrator.js，使其調用 Cursor CLI 而不是 claude CLI：

```javascript
// 改為
const spawnResult = spawnSync(
  'cursor',
  ['--print', prompt],
  { cwd: ROOT, timeout: TASK_TIMEOUT_MS }
);
```

**優點：**
- Cursor 會真正執行任務並生成 Report
- 流程清晰，Report 確實存在

**缺點：**
- 需要 Cursor CLI 已安裝
- 需要 Cursor 認證

---

### **方案 B：改為 Claude Code 直接派工（當前推薦）**

不依賴 Cron，改為：
```
Claude Code → 讀取 state.json → 提取待執行任務 → 調用 Cursor CLI → 更新狀態
```

**優點：**
- Claude Code 可以動態控制流程
- 更好的錯誤處理和進度回報
- 符合「Claude Code 當作總指揮」的概念

**缺點：**
- Session 需要持續運行
- 或需要 Loop 機制定期檢查

---

## 下一步行動

請決定：

1. **是否要修改 orchestrator.js 調用 Cursor 而非 claude？**
2. **還是要改為 Claude Code 直接派工的模式？**
3. **需要我重新規劃 orchestrator.js 的實現方式嗎？**

---

## 暫停記錄

**暫停時間**：2026-04-03 22:00
**暫停原因**：流程設計需要使用者確認
**已執行動作**：
- [x] Orchestrator 已停止
- [x] 定時任務已取消
- [x] 問題診斷完成
- [x] 建議方案提出

**恢復步驟**：
待使用者確認後續方案
