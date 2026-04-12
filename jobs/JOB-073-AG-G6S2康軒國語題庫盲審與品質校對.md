# JOB-073-AG-G6S2康軒國語題庫盲審與品質校對

**建立時間：** 2026-03-21 13:40  
**建立模型：** Antigravity-Agent  
**來源：** AG (AI 啟動)  
**優先級：** 高  
**狀態：** ✅ 已完成

---

## 一、任務背景與目的

為確保題庫品質，需依據最新的「盲審驗證與品質校對規範 (v2.0)」，針對小六下學期（G6 S2）國文康軒版全目錄的 9 份題庫檔案，進行完整盲測（Blind Evaluation）。

**核心目標：**
1. 模擬學生作答，於無答案狀態下推論結果。
2. 進行答案比對（Match / Mismatch）並產出「修正建議」。
3. 依據 CQI-v2 腳本重算所有題目的品質分數，並統一寫入 JSON 擴充欄位（`cqi_score`, `verification`, `authoring_model`, `verifying_model`）。

---

## 二、處理範圍

目標目錄：`question/platform/G6/Chinese/KangHsuan/`
包含檔案：
- QL1_過故人莊.json (需先修復格式)
- QL2_把愛傳下去.json (已完成)
- QL3_山村車輄寮.json
- QL4_迷途.json
- QL5_馬達加斯加，出發！.json
- L6_劍橋秋日漫步.json
- L8_雕刻一座小島.json
- QL10_追夢的翅膀.json
- QL11_祝賀你，孩子.json

---

## 三、預期結果清單 (Expected Outcomes Checklist)

- [x] QL1 檔案 JSON 格式格式修復完成
- [x] 所有檔案 (9 份) 盲測推理與驗證完成 (含 Match/Mismatch 判定)
- [x] 所有題目 JSON 欄位更新完畢 (`blind_evaluation_note`, `authoring_model`, `verifying_model`, `verification`, `cqi_score` 變量更新)
- [x] 執行 `evaluate_question_quality.js` 確認總目錄跑分正常
- [x] 產出「成果報告與修正建議內容」 Markdown 文件
