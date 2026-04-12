# JOB-067: G6_S2_自然_QL4_題庫全規模產出 (大規模擴產版)

*Created by AG at 2026-03-20 22:05*
*Optimized at 2026-03-20 22:45*

## 任務背景與目標
小六下自然科的 R3/R4 研究已達到 v2.0 深度實證等級。為建立具備「教育護城河」的數位題庫，本任務將利用 Agent 執行大規模產題。
**目標修正**：從原有的單元示範，提升為「每一課 (Unit/Lesson) 單一版本皆須產出 **30 題以上**」。

## 核心執行規範 (Mandatory)
> [!IMPORTANT]
> 執行本任務的 Agent **必須強制、深刻地參考** 以下兩份研究文件，嚴禁脫離文件進行「通用型」命題：
> 1. [G6_S2_自然_原始研究素材庫 (v2.0)](file:///Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/knowledge/課綱研究/自然/G6_S2_自然_原始研究素材庫.md)
> 2. [G6_S2_自然_發展綱要 (v2.0)](file:///Users/s389080/Documents/doc/work/0_AI_Project/eidosProject/knowledge/課綱研究/自然/G6_S2_自然_發展綱要.md)

---

## 任務詳情與流程 (Workflow)

### 階段一：環境與規範讀取
1. 讀取 `question/README_題庫格式規範.md` 與 `shared/forms/題庫數據理型.md`。
2. 呼叫 `/doqst` 技能，確保遵循最新格式與自動化 QA 流程。

### 階段二：全版本擴產計畫 (Scale-up)
為康軒、翰林、南一三大版本，分別產出以下學期內容（**每課目標 30+ 題**）：
- **單元 A：變動的大地**（地層、化石、地震避災、地貌變遷）
- **單元 B：電磁力探究**（電磁鐵、馬達應用、實驗變因精準控制）
- **單元 C：生物與永續**（食物網、能量與毒素流動、SDGs 思辨）

### 階段三：研究深度對齊 (Fidelity Check)
1. **迷思強灌溉**：每 10 題中必須有 ≥ 4 題是針對 v2.0 研究中列出的特定迷思（如：萬物平衡論、實驗變因貪婪症）。
2. **場景寫實化**：所有題幹強制以 `【在...情境下】` 開頭。
3. **高階認知 (QL4+)**：邏輯推論題與場景遷移題比例必須維持 40% 以上。

### 階段四：自動化檢驗與歸檔 (QA & Sync)
1. **平衡與防呆**：執行 `node scripts/auto_balance_json.js [路徑]`。
2. **品質評核**：執行 `node scripts/evaluate_question_quality.js [檔案]`。
   - **DoD 標準**：平均 CQI ≥ 8.0 且 QG 等級達 **QL4 (高品質)**。
3. **索引與統計**：
   - 更新該版本的 `manifest.json` 與 `docs/進度彙整_全站研發與題庫產出.md`。
   - 執行 `node scripts/sync_stats.js`。

---

## 驗證基準 (DoD)
- [ ] 題庫 JSON 存放於 `question/platform/G6/Science/S2/[Publisher]/Sci_UX.json`。
- [ ] **數量標準**：每個單元 JSON 包含題目量 ≥ 30 題。
- [ ] **品質標準**：平均 CQI ≥ 8.0。
- [ ] **研究標準**：`explanation` 欄位明確解釋了錯誤選項所對應的 R3 迷思點。

## 執行指令 (For Agent)
```bash
請詳細閱讀 `jobs/JOB-067-USER-G6-S2-自然-QL4-題庫全規模產出.md` 並執行。
這是一個高強度的產題任務，要求「深刻參考研究內容」且「每課 30 題」。
產出後務必自動跑腳本，未達 CQI 8.0 則必須重新翻修至通過。
```
