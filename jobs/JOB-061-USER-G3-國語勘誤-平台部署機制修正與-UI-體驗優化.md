*Created by AG at 2026-02-27 15:30*

# JOB-061: G3 國語勘誤、平台部署機制修正與 UI 體驗優化

## 任務背景與目標
本任務旨在解決 G3 國語康軒第五課內容量異常問題，修復因平台部署機制（Cloudflare Pages 與 GitHub 同步失效）導致的更新卡點，並根據使用者回饋進行 UI 答題流程優化。

## 📖 任務詳情
1. [具體步驟一]
2. [具體步驟二]

## 變更檔案紀錄
- `question/platform/G3/Chinese/S2/KangHsuan/Chi_QL5.json`
- `apps/v3_eidos/public/question/...` (實體化)
- `.github/workflows/deploy.yml`
- `apps/v3_eidos/src/components/ProfileSetup.tsx`
- `apps/v3_eidos/src/components/MainMenu.tsx`

## 📜 關鍵參考檔案
| 檔案路徑 | 用途說明 |
| --- | --- |
| [路徑1] | [說明1] |

## 🧬 推薦指令/提示詞

## ✅ 驗證基準 (DoD)
> ⚠️ **規劃要求**：本區塊必須在開發前與需求方 (User) 確認。需具體列出：
- [ ] [通過條件一：例如 UI 視覺是否崩版]
- [ ] [通過條件二：例如單元測試是否覆蓋異常路徑]
- [ ] 已執行 `/dosync` 全域知識沉澱
- [ ] 產出完工報告 `JOB-XXX-Report.md` (報告檔名仍只需保留編號)

