*Created by Antigravity at 2026-03-23 08:15*

# JOB-098-AG-全站品質審計與管線對齊

## 📌 任務背景
解決使用者反映之「G3/G4 標籤低落」與「G6 自然科品質異常」問題。查明主因為研究文件關鍵字脫鉤（天花板鎖死）與選項長度偏差（BIAS）。

## 📖 任務詳情
1. **診斷與正規化**：查明 G4/G6 研究文件命名歧異，統一全站出版社標籤（NanI / HanLin / KangHsuan）。
2. **腳本修補**：修正 `evaluate_question_quality.js` 對單題 JSON 格式的 Meta 擷取 Bug。
3. **天花板解鎖**：補全各學科發展綱要中的 QL4 必備關鍵字（實證驗證區、QL4 轉化策略）。
4. **自動修復 (V3)**：對全站觸發 BIAS 的單元執行長度補補修復。

## 📜 關鍵參考檔案
| 檔案路徑 | 用途說明 |
| --- | --- |
| [evaluate_question_quality.js](file:///Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/scripts/evaluate_question_quality.js) | 品質評核核心邏輯 |
| [進度彙整_全站研發與題庫產出.md](file:///Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/docs/進度彙整_全站研發與題庫產出.md) | 全站品質進度對照大表 |

## ✅ 驗證基準 (DoD)
- [x] G6 自然科 S2 全單元達標 QL4
- [x] G3/G4 跨學科研究天花板解鎖（顯示 QL2~QL4）
- [x] 全站出版社命名統一為英文標籤
- [x] 已更新 `docs/進度彙整_全站研發與題庫產出.md`（待確認後更新）
- [x] 產出完工報告 `JOB-098-Report.md`
