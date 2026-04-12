*Created by {AG|USER} at {YYYY-MM-DD HH:mm}*

`last_updated`: {YYYY-MM-DD HH:mm}
`updated_by`: {Agent名} ({模型名})

# JOB-XXX-{ORIGIN}-{科目}{年級版本}-課程研究

**`job_type`**: `research`  
**`executor`**: {AG|Cursor}

## 📌 任務背景
[為什麼需要建立這批研究素材：新學期 / 新科目首次開發 / 現有素材不足]

## 🎯 任務目標
完成 {科目} {年級下學期} {版本} 的 R3 原始素材庫 + R4 發展綱要，供後續出題使用。

## 🚧 任務邊界

本次任務只做：
- 建立 `knowledge/{grade}/{subject}/{publisher}/R3-素材.md`
- 萃取 `knowledge/{grade}/{subject}/{publisher}/R4-綱要.md`
- 通過 CK-01 ~ CK-06 自我稽核閘門

本次任務不做：
- 出題（另開 `question_prod` JOB）
- 修改現有題庫 JSON
- 修改任何規範文件

## 📖 執行步驟
1. 收集三大版本（康軒/翰林/南一）課程對照資料
2. 整理「常見迷思」與學術研究來源（引用 TASA 或相關研究）
3. 建立 R3 素材庫（含課程大綱、迷思對照、學習重點）
4. 萃取 R4 發展綱要（含 2-4-4 認知配比矩陣、AI Prompt 模板）
5. 執行 CK-01 ~ CK-06 自我稽核（見 `knowledge/README_研究架構總綱.md`）

## 📜 關鍵參考檔案
| 檔案路徑 | 用途 |
|:--|:--|
| `knowledge/README_研究架構總綱.md` | R3/R4 架構、KL 等級、CK 閘門定義 |
| `_agent/skills/ei_research/SKILL.md` | 研究 Skill 完整流程 |
| `_agent/skills/curri_research/SKILL.md` | 課綱研究 Skill |

## ✅ 啟動 Checklist (Pre-Flight)
- [ ] 已讀取 `knowledge/README_研究架構總綱.md`
- [ ] 目標版本課綱資料來源確認：{填入}
- [ ] KL3 前置條件確認（若需 KL4）

## ✅ 驗收 Checklist (Acceptance)
- [ ] R3 素材庫建立完成，含三大版本對照
- [ ] R4 發展綱要建立，含 2-4-4 配比矩陣
- [ ] CK-01 ~ CK-06 全數通過（見稽核閘門定義）
- [ ] 迷思研究有文獻來源標注（非 AI 自行推測）

## ✅ 成果 Checklist (Deliverables)
- [ ] `knowledge/{grade}/{subject}/{publisher}/R3-素材.md` 建立
- [ ] `knowledge/{grade}/{subject}/{publisher}/R4-綱要.md` 建立
- [ ] 已執行 `/pj_sync`
- [ ] 產出 JOB-XXX-Report.md

## ⏱️ 執行時間回報
| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| R3 素材收集 | HH:mm | HH:mm | - | |
| R4 綱要萃取 | HH:mm | HH:mm | - | |
| CK 稽核 | HH:mm | HH:mm | - | |
| **總計** | — | — | **-** | — |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: {真實Meta中的模型代碼} | 執行者: {AG|Cursor|Claude}
