*Created by AG at 2026-02-27 14:26*
*Last Updated at 2026-02-27 14:26 (Initial Creation)*

# JOB-031: 題庫資料完整性同步與修復

## 任務背景
在上線 Cloudflare Pages (exam15.pages.dev) 後，發現大量題庫 JSON 檔案出現 404 錯誤，影響學生練習。經查為題庫目錄結構變更（中文轉英文）導致資料遷移不完整。

## 任務詳情
1. 審計全站 91 個題庫目錄的 `manifest.json` 與實際檔案。
2. 開發 `sync_library.js` 腳本，將舊有 `apps/v2_currisite` 中的資料同步至 `question/platform`。
3. 確保路徑映射正確：`國語` -> `Chinese`, `數學` -> `Math`, `英文/英語` -> `English` 等。

## 關鍵參考檔案
| 檔案 | 說明 |
| --- | --- |
| `question/platform/**/manifest.json` | 題庫索引真相來源 |
| `apps/v3_eidos/src/data/config.ts` | 目錄映射規範 |

## 驗證基準 (DoD)
- [x] 完成 58 個目錄的審計。
- [x] 成功同步 200 筆以上資料。
- [ ] 解決目前已知的 API 404 報錯。
- [ ] 產出完工報告。
