# JOB-001: Cloudflare 儲存功能開發 (Profiles & Settings) [VERIFIED ✅]

## 📌 任務目標
實現使用者個人資料 (Profiles) 與網站參數 (Site Settings) 的持久化儲存，利用 Cloudflare D1 (資料庫) 與 KV (快取) 體系。

## 📖 實作規格
### 1. 個人參數 (User Profiles / Personal Settings)
* **就學資訊**：
  * `base_year`: 基準年份（例如：2026 年時為三年級，系統需能自動推算當前年級）。
  * `publisher_preferences`: 各學科對應的出版社選擇（JSON 格式，例如：`{ "math": "HanLin", "science": "KangHsuan" }`）。
* **操作偏好 (UX Settings)**：
  * `quiz_next_delay`: 答對後自動跳下一題的停留毫秒數（預設 1000ms）。
  * `shortcut_enabled`: 是否開啟 A-D 快捷鍵答題（Boolean）。
  * `theme`: 深色/淺色模式偏好。

### 2. 網站參數 (Global Site Settings)
* **系統狀態**：
  * `maintenance_mode`: 維護模式開關。
  * `announcement`: 全域首頁公告字串。
  * `api_version`: 當前引用題庫的版本號或分流標籤。
* **技術選型**：Cloudflare KV (用於頻繁讀取的全域配置) 與 D1 (用於個人結構化數據)。

## 💬 指令範本 (請直接複製貼上給 Cursor)
> 「我正在開發 Eidos Project (Monorepo | Cloudflare 生態系)，目前需要你協助實作用戶個人資料與網站參數的儲存功能。
> 
> 請依據 `jobs/JOB-001-Cloudflare-Storage.md` 的規格進行開發：
> 1. **資料庫設定**：在 `wrangler.toml` 綁定 D1 Database。
> 2. **建立 Schema**：撰寫遷移檔案，包含 `profiles` (儲存就學年份、各科出版社偏好) 與作業偏好設定。
> 3. **API 開發**：在 Worker/API 層實作 CRUD 介面。
> 4. **網站參數**：使用 Cloudflare KV 儲存維護模式、全域公告等參數。
> 5. **UX 參數**：需能儲存 `quiz_next_delay` (答題停留毫秒) 與快捷鍵開關。
> 
> 完成後請更新該 JOB 文件中的『實作結果』區，並在 `COLLABORATION.md` 的最後留下技術摘要。」

## 📈 實作結果 (由 Cursor 填寫)
* [x] **D1 資料庫綁定完成** — 於 `workers/api/wrangler.toml` 綁定 `DB` (eidos-db)，部署前需執行 `wrangler d1 create eidos-db` 取得 `database_id` 並寫回 toml。
* [x] **Schema 遷移文件已建立** — `workers/api/migrations/0000_initial_profiles_and_ux.sql`：單表 `profiles`，含 `user_id`, `base_year`, `publisher_preferences` (JSON 字串), `quiz_next_delay`, `shortcut_enabled`, `theme`, `created_at`, `updated_at`。
* [x] **Profile API 完成** — `GET/PUT/PATCH /api/profiles/:userId`，支援就學資訊與 UX 參數 (quiz_next_delay、shortcut_enabled、theme) 之 CRUD。
* [x] **KV 設定完成** — 綁定 `SITE_SETTINGS`，`GET/PUT /api/settings` 及 `GET /api/settings/:key`，鍵：`maintenance_mode`, `announcement`, `api_version`。

**備註**：前端 (v3_eidos) 目前仍使用 localStorage 個人設定；接上此 API 時可改為以 `userId`（匿名裝置 ID 或登入 ID）呼叫 Profile API，並可讀取 `/api/settings` 顯示維護模式／公告。  
**Antigravity 驗收意見**：後端 D1/KV 實作完整，符合生產級規格。前端 QuizView 快捷鍵有時序瑕疵已由 Antigravity 進行邏輯 Hotfix，詳見 JOB-001a。

---
*Created by Antigravity at 2026-02-23 09:15*  
*Last Updated at 2026-02-23 11:45 (Antigravity 驗收通過)*
