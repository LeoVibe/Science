# Project Eidos 狀態快照

> **最後更新**：2026-02-26 18:45  
> **目的**：AI 交接與狀態快速同步。新對話請優先讀取此檔。  
> **原則**：此檔只放「進行中 / 待處理」的任務。已完成的歷程請查閱 `docs/task_history.md`。

## 🔵 進行中任務 (Active Tasks)
| 派工單 | 簡述 | 狀態 |
| `JOB-AG-001` | 五下國語高品質題庫擴充 | 🔵 執行中 |
| `JOB-017A` | UAT 深度診斷 (Gemini 3.1 Pro) | � 待驗收 |
| `JOB-017B` | UAT 深度診斷 (Opus 4.6) | 🟢 待驗收 |
| `JOB-017C` | UAT 深度診斷 (Sonnet 4.6) | 🔵 待執行 |
| `JOB-017D` | UAT 深度診斷 (GPT-OSS) | 🔵 執行中 (2026-02-26) - AG |
| `JOB-017E` | UAT 深度診斷 (Cursor) | 🔵 待執行 |

## ⚠️ 待處理事項 (Technical Debt/Bugs)
- [ ] 三年級下學期英文（康軒/翰林/南一）的 JSON Manifest 需完成前端對接測試。
- [ ] 驗證 `.logs/` 目錄機制是否影響 Cloudflare Pages 建置腳本。
- [ ] 確認 v3 核心邏輯索引的完整性與防呆覆蓋率。

## ⏭️ 後續步驟 (Next Steps)
- 持續推進 G3 各科（數學、國語）的課綱研究與 L4 高品質題庫擴充。
- 規劃 `JOB-004`（學習數據持久化 API）與 `JOB-008`（使用者行為軌跡日誌）的啟動時程。

## 🧠 關鍵上下文 (Context Anchor)
- **路徑規範**：前端開發以 `apps/v3_eidos/` 為基準；題庫 JSON 位於 `question/platform/`。
- **協作邊界**：遵循 `README_專案總覽與架構總綱.md` 四大領地分區，嚴禁跨界寫入。
- **品質指標**：QG (L1-L5 等級閘門) + CQI (10分制加權評分)，詳見 `knowledge/README_出題設計準則.md`。
- **派工機制**：任務細節一律建立於 `jobs/JOB-XXX-*.md`，格式詳見 `jobs/README_任務看板與派工.md`。
