*Created by Antigravity at 2026-03-23 12:35*

# JOB-100-AG-G6S2-六下社自題數與品質精修

## 📌 任務背景
解決六下社會與自然科在《進度彙整》中題數過低（僅顯示 30 題）與社會科上架數為 0（BIAS 鎖死）的問題。

## 📖 任務詳情
1. **補全自然科清單**：將 3 大出版社（康、翰、南）之六下自然科 `manifest.json` 補齊至 U3。
2. **修復社會科品質**：
   - 使用 `fix_bias_v3.py` 修復六下社會科選項長度偏差。
   - 執行 QQL4 等級精修管線，提升社會科成熟度。
3. **數據對齊**：重新產生 `libraryStats.json` 並確認數值回升。

## 📜 關鍵參考檔案
| 檔案路徑 | 用途說明 |
| --- | --- |
| [generate_library_stats.js](file:///Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/scripts/generate_library_stats.js) | 題數與品質統計引擎 |
| [G6_S2_自然_發展綱要.md](file:///Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/knowledge/課綱研究/自然/G6_S2_自然_發展綱要.md) | 自然科研發支持 |

## ✅ 驗證基準 (DoD)
- [ ] 六下自然科每版本顯示上架題數回補至 **80~90** 題。
- [ ] 六下社會科品質標籤脫離 QQL1 (BIAS)，回升至 **QQL4**。
- [ ] 已更新 `docs/進度彙整_全站研發與題庫產出.md` 並呈報使用者。
