*Created by AG at 2026-02-28 12:20*

# JOB-041-USER-G3S2-All-Subjects-Scaling

## 📌 任務背景
鑑於國語科三下 (G3S2) 的 AI 自動化產題流水線與認知配比 (4-4-2) 實驗大獲成功，使用者希望將此「專家級出題模式」推廣至 G3S2 的所有科目（包含數學、社會、自然、英語等）。這是一次基礎學力題庫的全面升級。

## 📖 任務詳情
1. **科目範圍掃描**：涵蓋 `question/platform/G3/` 下除國語外的所有學科：
   - 數學 (Math)
   - 社會 (Social)
   - 自然 (Science)
   - 英語 (English)
2. **認知層次配比轉化**：
   - 社會/自然：參照國語的 4-4-2 動態配比，強調「情境模擬」與「合理迷思」。
   - 數學：強調「解題邏輯鏈」與「估算應用」，移除純計算題，改為「大腦友善場景題」。
3. **執行自動化指令**：分科目執行 `auto_generate_questions.js`。
4. **品質評核**：執行 `evaluate_question_quality.js` 確保全科目平均 CQI > 6.0。

## 📜 關鍵參考檔案
| 檔案路徑 | 用途說明 |
| --- | --- |
| `knowledge/課綱研究/國語/00_國語科共同發展總綱.md` | 跨科通用之大腦友善原則來源 |
| `../Global_API_Keys.txt` | 運作必要金鑰 |

## 🧬 推薦指令/提示詞
> **開發端 (Cursor) 執行指引：**
> 請直接調用 Node.js 腳本。腳本內部已整合 `00_國語科共同發展總綱.md` 的核心原素作為給 Gemini 模型的 `systemInstruction`，因此不需要手動把總綱餵給 AI，腳本會自動處理解析與配比。
>
> 只需要執行：`node scripts/auto_generate_questions.js question/platform/G3/[科目]/S2/`

## ✅ 驗證基準 (DoD)
- [ ] G3S2 所有科目課次題數均達到 30+ 題。
- [ ] 移除所有 JSON 中的舊版「廢話冗餘後綴」。
- [ ] 全科目平均品質 CQI > 6.0。
- [ ] 更新 `libraryStats.json` 統計報表。
- [ ] 產出完工報告 `JOB-041-Report.md`。
