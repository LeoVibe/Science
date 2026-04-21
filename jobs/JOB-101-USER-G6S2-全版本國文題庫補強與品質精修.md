*Created by AG at 2026-03-23 22:05*

# JOB-101-USER-G6S2-全版本國文題庫補強與品質精修

## 📌 任務背景
使用者反映小六下國文題數過少（各出版社僅約 50 題），且希望針對翰林版進行深度補強（每課至少 25 題）。
本任務目標為整合三大出版社（翰林、康軒、南一）的補強計畫，納入 KQL3/KQQL4 研究素材，並使用 Free Key 進行保守產製。

## 📖 任務詳情
1. **研究素材載入**：強制讀取 `G6_S2_國語_原始研究素材庫.md` 與 `六年級下學期_國語_發展綱要.md`。
2. **保守補題策略**：
   - 每次產出僅限 **單一課次**。
   - 每次請求不超過 **10 題**。
   - 嚴格監控 1500 RPD 額度，若接近上限即刻停止並回報。
3. **出題原則執行**：
   - 國語科題幹 > 50 字。
   - 正確答案長度隨機化（非固定最長）。
   - 具備 `scenario` 與 `commonMisconception`。
4. **品質驗證進程**：
   - 每課產出後執行 `evaluate_question_quality.js`。
   - 每課進行 AI 專家級盲審 `run_blind_eval.js`。

## 📜 關鍵參考檔案
| 檔案路徑 | 用途說明 |
| --- | --- |
| [G6_S2_國語_原始研究素材庫.md](file:///Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/knowledge/1_課綱研究/國語/G6_S2_國語_原始研究素材庫.md) | R3 原始素材與大意 |
| [六年級下學期_國語_發展綱要.md](file:///Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/knowledge/1_課綱研究/國語/六年級下學期_國語_發展綱要.md) | R4 命題矩陣與高階考點 |
| [出題設計準則.md](file:///Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/question/README_出題與品管準則.md) | CQI 分數與 QG (QQL1-QQL5) 定義 |
| [API_RULES.md](file:///Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/_agent/API_RULES.md) | 金鑰額度與自動化調速規範 |

## ✅ 驗證基準 (DoD)
- [ ] 三大出版社各課題數達標（翰林每課 25 題，康軒/南一維持或視情況補足）。
- [ ] 所有新產出檔案 CQI 均分 ≥ 6.5，且無 QL1-BIAS 警告。
- [ ] 盲審 Match Rate ≥ 80%。
- [x] 已更新 `docs/進度彙整_全站研發與題庫產出.md` 中的題數與 KQL3/KQQL4 連結。
- [x] 執行 `/pj_sync` 並記錄 API 消耗與 RPD 剩餘量。
- [x] 產出完工報告 `JOB-101-Report.md`。

---
> ✅ **[結案狀態] 2026-03-24：**
> 本單已被後續更完整的 **JOB-102 系列（全學年國語跨版產出計畫）**與 **JOB-111（雙模型對照研究）** 所整併取代。所有產出工作與品質精修均移交新派工單執行，本單正式結案歸檔。

