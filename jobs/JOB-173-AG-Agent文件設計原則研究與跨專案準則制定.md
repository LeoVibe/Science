*Created by AG at 2026-04-11 14:00*

`last_updated`: 2026-04-11 14:00
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-173-AG-Agent文件設計原則研究與跨專案準則制定

**`job_type`**：`mixed`（research + docs_ops）
**`executor`**：Claude Code（使用者授權例外）
**`status`**：✅ 完成（待 `/pj_sync`）

---

## 📌 任務背景

Eidos 專案在多 Agent 協作過程中，反覆遭遇以下問題：
1. **文件重複**：同一規則寫在多份文件中，修改一處忘了另一處（如考古題來源清單同時存在於研究架構總綱和蒐集規範）
2. **邊界模糊**：Agent 不知道某條規則該寫在哪份文件、讀者不知道去哪裡找
3. **Context 膨脹**：所有規則一次灌入，超過 Agent 有效處理範圍
4. **存活性差**：冗長散文在 context 壓縮後丟失關鍵細節

使用者提出需求：研究業界對 Agent 文件設計的最佳實踐，形成可操作的準則，並製作跨專案通用的參考文件。

### 研究動機

2026 年 3 月 Claude Code 原始碼意外公開後，大量技術分析文章揭示了 Anthropic 內部如何設計 prompt 分層架構。同時期 GitHub 發布 Spec Kit 開源工具，Andrew Ng 推出 Agentic AI 課程。這些資源首次系統性地回答了「如何指導 Agent 撰寫不同階段的文件」。

---

## 🎯 任務目標

| # | 目標 | 可驗證標準 |
|:--|:--|:--|
| G1 | 研究 ≥4 個權威來源的文件設計原則 | Report 列出每個來源的 URL、核心概念、可操作原則 |
| G2 | 將研究成果落地為 Eidos 準則 | `docs/README_通用作業準則.md` 新增第九章（§10.1-10.7） |
| G3 | 產出跨專案通用參考文件 | `0_AI_Project/` 下新增獨立研究報告，其他專案可直接引用 |
| G4 | 完整研究紀錄 | JOB-173-Report.md 含完整的來源、方法、分析、結論 |

---

## 🚧 任務邊界

**本次任務只做：**
- 研究外部文章與開源專案的文件設計方法論
- 綜合分析並提取可操作原則
- 寫入 Eidos 通用作業準則（第九章）
- 產出跨專案通用參考文件（放在 `0_AI_Project/`）
- 撰寫完整研究紀錄（Report）

**本次任務不做：**
- 不回頭重構現有所有文件（那是後續獨立任務）
- 不修改出題/盲測/研究架構等其他準則文件的結構
- 不新增工具或腳本

---

## 📖 執行步驟

### 階段一：來源蒐集與深度研讀（G1）

1. WebSearch 搜尋四個方向：
   - Claude Code prompts.ts 源碼分析（prompt 分層、static/dynamic boundary）
   - Hamel Husain / Applied LLMs（評估與 prompt 工程方法論）
   - Andrew Ng Agentic Design Patterns（Reflection / Planning / Multi-agent）
   - GitHub Spec Kit（Specify → Plan → Tasks → Implement）

2. WebFetch 深度閱讀已識別的高價值文章：
   - `sabrina.dev/p/claude-code-source-leak-analysis`
   - `dbreunig.com/2026/04/04/how-claude-code-builds-a-system-prompt.html`
   - `read.engineerscodex.com/p/diving-into-claude-codes-source-code`
   - `github.com/github/spec-kit/blob/main/spec-driven.md`

3. 針對每個來源記錄：URL / 核心概念 / 可操作原則 / 適用性分析

### 階段二：原則綜合與落地（G2）

4. 交叉比對四個來源，提取共通模式與互補概念
5. 設計七項原則（§10.1-10.7），每項含：規則 + 說明 + 違反徵兆
6. 寫入 `docs/README_通用作業準則.md` 第九章

### 階段三：跨專案通用文件（G3）

7. 將完整研究過程（來源分析 + 方法論 + 原則推導 + 落地建議）整理為獨立文件
8. 設計為 self-contained，不依賴 Eidos 專案內部結構
9. 存放於 `0_AI_Project/Agent文件設計原則_研究報告與發展準則.md`

### 階段四：結案（G4）

10. 撰寫 JOB-173-Report.md
11. 執行 `/pj_sync`

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `docs/README_通用作業準則.md` | 第九章寫入對象 |
| `CLAUDE.md` | 三層注入架構定義（L0/L1/L2） |

---

## 📦 產出清單

| # | 產出物 | 路徑 |
|:--|:--|:--|
| 1 | 通用作業準則 第九章 | `docs/README_通用作業準則.md`（§10.1-10.7） |
| 2 | 跨專案通用研究報告 | `0_AI_Project/Agent文件設計原則_研究報告與發展準則.md` |
| 3 | 結案報告 | `jobs/JOB-173-Report.md` |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [x] 已讀取：`docs/README_通用作業準則.md`（全文 223 行）
- [x] 已讀取：`CLAUDE.md`（L0/L1/L2 架構定義）
- [x] **已確認執行模型**：claude-sonnet-4-6（Claude Code）
- [x] **已確認使用金鑰**：Claude Code 內建（Anthropic）
- [x] **已確認操作頻次**：WebSearch / WebFetch 手動操作，無自動化批次
- [x] 已閱讀「任務邊界」並確認本次範圍

---

## ✅ 驗收 Checklist (Acceptance)

> 本任務為 research + docs_ops，CQI 系列指標不適用。

- [x] G1：4 個來源深度研讀，每個含 URL + 核心概念 + 可操作原則（見 Report §二）
- [x] G2：通用作業準則第九章已寫入（§10.1-10.7，7 項原則 + 表格 + 範例）
- [x] G3：跨專案通用文件已產出 → `0_AI_Project/Agent文件設計原則_研究報告與發展準則.md`（約 300 行）
- [x] G4：JOB-173-Report.md 已產出，含 4 來源分析 + 交叉比對表 + 異動清單

---

## ✅ 成果 Checklist (Deliverables)

- [x] 通用作業準則第九章已寫入（`docs/README_通用作業準則.md` line 224+）
- [x] 跨專案通用研究報告已產出（`0_AI_Project/Agent文件設計原則_研究報告與發展準則.md`）
- [x] JOB-173-Report.md 已產出
- [ ] 已執行 `/pj_sync`

---

## 真實回報本次對話的模型與花費
＄作業匯總：Token數: - | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Claude Code
