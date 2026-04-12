`last_updated`: 2026-03-29 21:20  
`updated_by`: Cursor Agent  

# JOB-125 Report

## 本次已完成

### 0. 依使用者指定之 eidosFree 金鑰與 Gemini 3 Flash 產題

- **`ApiKeys.cfg`**：以 `--key eidosFree` 對應註解列「Account: Yotta - eidosFree」區塊之下一組 `GEMINI_API_KEY`（腳本已改為行內子字串匹配，不必再寫死 `Account: eidosFree`）。
- **模型**：使用者所稱 **gemini 3 flash** 在 v1beta 實際 id 為 **`gemini-3-flash-preview`**；`gemini-3.1-flash` 會 404，已於 `auto_generate_questions.js` 加**別名**自動對應至 `gemini-3-flash-preview`。
- **頂層載入**：`GEMINI_API_KEY=""` 不再覆蓋先前非空金鑰。
- **驗證**：已用 eidosFree + `gemini-3.1-flash` 成功補齊 **G3 翰林 L1** 低於門檻題並寫回 JSON。
- **全量批次**：已於背景重新啟動  
  `node scripts/batch_chinese_s2_generate.js -- --key eidosFree --model gemini-3.1-flash --qpm 6 --batch 3 --threshold 5.0 --target 30`  
  日誌目錄：`.logs/chinese_s2_batch_YYYYMMDD_HHMM.log`（請以最新檔為準）。

### 1. 管線修復（阻擋級）

- **問題**：`scripts/auto_generate_questions.js` 之 `KNOWLEDGE_CHINESE_ROOT` 使用 `../../knowledge/課綱研究/國語`，在 repo 根為 `eidosProject` 時會解析成 **`0_AI_Project/knowledge/...`**（不存在），國語產題一律報「資料不齊備」。
- **修正**：改為 `path.resolve(__dirname, '../knowledge/課綱研究/國語')`。
- **驗證**：`node scripts/auto_generate_questions.js question/platform/G4/Chinese/S2/HanLin --pattern "HANLIN_L1\\.json" --key Yotta --model gemini-3.1-flash` 已出現 **`📖 [國語] 課文來源：KL4…`**；該檔因已滿 30 題而略過補題（預期行為）。

### 2. 派工單

- 已建立 **`jobs/JOB-125-PLAN-國語S2補題執行與管線修復.md`** 作為「新派工單」本體。

## 待執行（需本機 API 與負責人指定模型）

- **G4 S2 全量補題**（及 JOB-102 要求之南一重產／刪 BIAS）請在本機具 **`ApiKeys.cfg`／GEMINI** 時執行：
  ```bash
  node scripts/batch_chinese_s2_generate.js --grades G4 -- \\
    --key Yotta --model <負責人指定> --qpm 10 --batch 10 --threshold 5.0 --target 30
  ```
- 完成後跑 **`evaluate_question_quality.js`**，並回寫 **JOB-102** checklist。

## 備註

- `verify_chinese_kl4_prereq.js` 一向使用 `ROOT = path.resolve(__dirname, '..')`，故先前全綠與產題腳本失敗並存；修復後兩者對齊。

### 補記（06EA 付費金鑰／小三下翰林）

- `auto_generate_questions.js`：支援 `--key <尾碼>` 匹配 `ApiKeys.cfg` 內 `GEMINI_API_KEY` **字串結尾**（例：`06EA`）。
- 修正：刪除低分題後若剩餘題數 **≥ 目標 30**，改為 **截斷至 30 題並寫回**，避免 `neededCount` 為負導致略過。
- 已跑完 **`question/platform/G3/Chinese/S2/HanLin`** 全 12 檔，每檔 **30 題**；日誌：`.logs/g3_s2_hanlin_06ea_20260329_1306.log`。建議再跑 `evaluate_question_quality.js` 複驗 CQI-P。
