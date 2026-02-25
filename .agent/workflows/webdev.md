---
description: 開發協作規範 — 確保 PM 與 AI 在派工、開發、回報流程高度同步，統一專案管理標準
---

# 🤝 開發協作與 PM 派工規範 (2026-02-24)

> **觸發時機**：每當開始新的功能開發任務、接收 PM 指令後、或準備提交開發成果時，必須參考此規範。

---

## 一、 接收派工 (Task Intake)

作為協作 Agent，在接收任務後必須先進行「任務對齊」：

1. **查閱任務單**：確認 `.agent/brain/` 下是否有對應的 `task.md`。若無，請 PM 提供或由 Agent 根據對話內容建立。
2. **分析影響範圍**：評估新功能是否涉及現有元件、資料結構（Schema）或設定檔（如 `APP_CONFIG`）。
3. **確認驗證基準**：明確知道任務完成的定義（DoD, Definition of Done）。例如：「後台能看到數據」、「前端元件不跑版」。

---

## 二、 派工單與 Cursor 協作流程 (Job Assignment)
**此為 PM (AG) 派工給開發者 (Cursor) 的標準程序**。若任務需要由 Cursor 執行，必須遵循以下指引：

1. **建立任務單**：在 `jobs/` 目錄下建立 `JOB-XXX-描述.md`（參閱 `jobs/README_任務看板與派工.md` 的命名與欄位規範）。
2. **撰寫指令範本**：AG 在對話中直接提供使用者以「**第一人稱**」撰寫的指令，指向派工單路徑即可（不需內嵌在派工單中）。
3. **完成回報嚴格規範**：
   - Cursor 完成開發後，**必須**將完工報告寫入 `jobs/JOB-XXX-Report.md`（與派工單同目錄）。
   - **絕對禁止**：在根目錄或 `codex/` 下產生 `task_assignment_YYYYMMDD.md` 等拋棄式回報文件。
   - Report 必備內容：開發成果摘要、變更檔案清單、單元測試紀錄、PM 驗收建議。

---

## 三、 開發規範 (Development Standards)

1. **脈絡優先**：在修改代碼前，優先使用 `grep_search` 或 `find_by_name` 確認現有實作邏輯，嚴禁重複發明輪子。
2. **遵守設計系統**：
   - 優先使用 `src/components/ui/` 的基礎元件。
   - 遵循 `index.css` 定義的色彩與 Typography。
   - 避免 inline styles，使用 Tailwind 或 CSS Modules（依專案慣例）。
3. **記錄決策**：若遇到架構上的重要選擇（如：新增一個 API Endpoint 而非修改舊的），請更新至 `implementation_plan.md`。

---

## 三、 回報流程 (Reporting & Handover)

完成開發後，嚴格執行以下同步動作，不可漏掉：

### 1. 更新任務狀態 (Tracker Sync)
- 勾選 `task.md` 中已完成的項目。
- 若有延宕或未解的問題，記錄在 `Blockers` 區塊。

### 2. 撰寫完工報告 (Walkthrough)
- 建立或更新 `jobs/JOB-XXX-Report.md`。
- 清楚列出：**新增了哪些檔案**、**修改了哪些核心邏輯**、**PM 如何測試驗證**。
- 完整規範請參閱 `jobs/README_任務看板與派工.md` 第三章。

### 3. 更新數據註冊表 (Registry Sync)
- 若涉及題庫、權限或全局參數，務必更新對應的 JSON 設定檔（如 `libraryStats.json` 或 `config.json`）。

---

## 五、 PM 合作原則 (Collaboration Principles)

- **前瞻性提問**：若發現 PM 的設計邏輯在邊界案例（Edge Cases）下可能出錯，應主動提出與 PM 討論。
- **不毀壞原則**：嚴禁在不確定的情況下刪除 PM 的舊代碼。如需重構，應先說明原因。
- **透明度**：每完成一個階段性的實作（Milestone），應主動通知 PM 進度，而非等到全部做完才回報。

---

## 六、 常用指令對應 (Slash Commands)

- **/task-plan**：根據對話自動生成或更新任務清單與實作計畫。
- **/done**：開始執行「回報流程」，產出完工報告並同步所有註冊表。
- **/qst_bank**：若任務涉及題庫，必須切換至此工作流執行格式檢查。
- **/webdev**：檢視本專案的管理與派工規範。

---
