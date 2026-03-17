*Created by AG at 2026-02-27 15:32*
*Last Updated at 2026-02-27 15:32 (Initial Creation)*

# JOB-035-USER-G3-English-Expansion 三年級英語題庫「研究-回饋」擴充

## 任務背景
配合三年級英語科「研究-回饋」循環，目前三下英語（康軒、翰林、南一）的進度需進行資料對接與擴充。此任務承接之前研究成果，旨在將實證反饋轉化為正式題庫。

## 任務詳情
1. **研究資料對接**：
   - 讀取 `jobs/G3_S2_English_Research_Report.md` 中的研究成果與錯誤回饋。
2. **題庫生成與優化**：
   - 補充單字拼寫、口語對話與基本語法題目。
   - **題數要求**：每單元至少 15-20 題。
3. **Manifest 同步**：
   - 確保 `question/platform/G3/English/S2/` 下各版本的 `manifest.json` 與實體檔案一致。

## 關鍵參考檔案
| 檔案 | 說明 |
| --- | --- |
| `jobs/G3_S2_English_Research_Report.md` | 英語科發展清單與研究報告 |
| `apps/v3_eidos/src/data/config.ts` | 英語目錄映射定義 |
| `question/platform/G3/English/` | 英語題庫實體目錄 |

## 驗證基準 (DoD)
- [ ] 完成三家出版社（南一、康軒、翰林）三下英語的 `manifest.json` 校對。
- [ ] 課程載入測試通過（前端無 404）。
- [ ] 更新 `docs/prj_status.md` 為已完工。
