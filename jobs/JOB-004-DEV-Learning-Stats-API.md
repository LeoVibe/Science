# JOB-004-DEV-DEV-Learning-Stats-API UUID
    *   `user_id`: TEXT (Index)
    *   `question_id`: TEXT
    *   `is_correct`: INTEGER (0/1)
    *   `subject`: TEXT
    *   `timestamp`: DATETIME

### 2. API 開發 (Worker)
*   `POST /api/records`：接收前端上傳的答題紀錄（支援單筆或陣列）。
*   `GET /api/stats/:userId`：回傳該用戶的各科正確率、總答題數統計。

### 3. 前端銜接 (storage.ts)
*   修改 `saveAnswerRecord`：在寫入 localStorage 的同時，非同步呼叫 API 上傳數據。
*   實作「斷網緩存」：若 API 失敗，標記該紀錄為 `synced: false`，待下次啟動時重試。

## 🧬 推薦指令/提示詞 (請直接複製貼上給 Cursor)
> 「我們現在要進一步實作學習數據的持久化。
> 
> 請依據 `jobs/JOB-004-Learning-Stats-API.md`：
> 1. 在 `workers/api` 新增 D1 Migration，建立 `quiz_records` 資料表。
> 2. 實作上傳紀錄的 POST API 與 取得統計數據的 GET API。
> 3. 前端 `storage.ts` 需在儲存答案時同步觸發 API 上傳，並實作簡單的『離線緩存』機制。
> 
> 完成後請更新日誌並提供 API 測試範例。」

---
*Created by Antigravity at 2026-02-23 19:55*
