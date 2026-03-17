*Created by AG at 2026-02-23 21:05*  
*Last Updated at 2026-03-07 21:28 (AG 補齊派工單格式)*

# JOB-033-AG-G5S2-Chinese-Scaling

## 📌 任務背景
因應 `JOB-034` 針對三年級國語防呆策略（等長干擾項、防盲猜誘答設計）的成功，需要將此高品質出題策略與產題產線應用於五年級下學期國語科（G5S2 Chinese），擴充並墊高現有題庫的質量與數量。

## 📖 任務詳情
1. 針對 G5S2 (五下) 國語科 康軒、南一 版本，產出缺失的題目至每課次 30 題以上。（翰林版已滿 360 題滿編）。
2. **執行自動化指令**：執行 `node scripts/auto_generate_questions.js question/platform/G5/Chinese/S2`。
3. **品質評核**：執行 `node scripts/evaluate_question_quality.js question/platform/G5/Chinese/S2` 確保平均 CQI > 6.0 且達到 L3/L4。

## 📜 關鍵參考檔案
| 檔案路徑 | 用途說明 |
| --- | --- |
| `knowledge/課綱研究/國語/00_國語科共同發展總綱.md` | 大腦友善原則來源 |
| `../Global_API_Keys.txt` | 運作必要金鑰 |

## 🧬 推薦指令/提示詞
> **執行指引：**
> 請直接調用 Node.js 腳本。腳本已切好每批次 10 題以迴避 API 限制。
> `node scripts/auto_generate_questions.js question/platform/G5/Chinese/S2/`

## ✅ 驗證基準 (DoD)
- [ ] G5S2 國語科所有版本 課次題數均達到 30+ 題。
- [ ] 平均品質 CQI > 6.0，達到 L3 或 L4 級別。
- [ ] 更新 `libraryStats.json` 統計報表。
- [ ] 產出完工報告 `JOB-033-Report.md`。
