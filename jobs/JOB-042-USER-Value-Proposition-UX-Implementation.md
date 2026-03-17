*Created by AG at 2026-02-28 12:25*

# JOB-042-USER-Value-Proposition-UX-Implementation

## 📌 任務背景
我們已經在 `JOB-040` 中完成了「Eidos 教育設計價值說明書」的精美文案。為了讓這份文案在最自然的時機點觸及使用者（尤其是家長），我們需要將其落實於前端 UI/UX 中。此任務旨在實作三種微型導覽機制（Onboarding Modal、側邊抽屜、解析 Tooltip），透過恰到好處的提示，建立品牌信任感。

> **🔍 跨派工單不重疊與邏輯檢驗分析 (與待執行任務比對)**
> 1. **與 JOB-038 (內容探討專區) 的區隔**：
>    - **JOB-038** 旨在建立一個「長篇深度文章與家長互動留言」的獨立頁面（Macro 巨觀視角）。
>    - **本任務 (JOB-042)** 旨在測驗流程中提供「即時、微型的碎片段科普彈窗」（Micro 微觀視角）。
>    - **邏輯互補**：完全不矛盾。甚至可以在本單的 Onboarding Modal 最後，加上按鈕「👉 了解更多我們的腦科學研究 (引導至 JOB-038 的頁面)」。
> 2. **與 JOB-036 (測驗 UI 體驗優化) 的區隔**：
>    - **JOB-036** 聚焦於按鈕字體放大與題數連動，修改的是 DOM 的核心佈局。
>    - **本任務 (JOB-042)** 增加的是覆蓋式彈窗 (Modal) 與懸浮工具提示 (Tooltip)，在 DOM 結構上是獨立的 Layer，不會與 JOB-036 的排版產生衝突。建議兩者可獨立開發。

## 📖 任務詳情
1. **實作初次登入的「導覽劇場」(Onboarding Modal)**：
   - 於 `Index.tsx` 或 `MainMenu.tsx` 建立一個卡片式彈窗。
   - 讀取 LocalStorage 檢查 `hasSeenValueOnboarding`，若無則彈出，看完後標記為 `true`。
   - 內容填入「皮亞傑的具體運算期」與「大腦友善設計」的科普卡片。
2. **實作「專家悄悄話」(Expert's Insight Drawer)**：
   - 於題庫選擇清單旁新增一個 💡 按鈕，點擊後滑出側邊欄，展示認知配比 (4-4-2) 的意義。
3. **實作解析頁面的「設計意圖」提示 (Intention Tooltip)**：
   - 在答題解析組件中，於 `explanation` 旁新增一個 Hover 氣泡，提示家長這題的誘答設計巧思。

## 📜 關鍵參考檔案
| 檔案路徑 | 用途說明 |
| --- | --- |
| `jobs/JOB-038-USER-Content-Deep-Dive-and-Parent-Interaction.md` | 用於未來路由互相導流的參考 |
| `apps/v3_eidos/src/components/MainMenu.tsx` | Onboarding Modal 的潛在掛載點 |
| `apps/v3_eidos/src/components/ReviewList.tsx` | 解析 Tooltip 的掛載點 |

## 🧬 推薦指令/提示詞
> **開發端 (Cursor) 執行指引：**
> 請參照本派工單與 `docs/網站功能規格書.md` 實作三個新元件 (`OnboardingModal`, `InsightDrawer`, `IntentionTooltip`)。Modal 必須實作 LocalStorage 的阻斷邏輯，避免重複跳出擾民。

## ✅ 驗證基準 (DoD)
> ⚠️ **規劃要求**：本區塊必須在開發前與需求方 (User) 確認。需具體列出：
- [ ] 首次登入測試：清理 LocalStorage 後重整首頁，必須且只會彈出一次 Onboarding Modal。
- [ ] RWD 測試： Drawer 與 Modal 在手機版螢幕下不可崩版，必需有明顯的關閉 (X) 按鈕。
- [ ] 產出完工報告 `JOB-042-Report.md` (報告檔名仍只需保留編號)
