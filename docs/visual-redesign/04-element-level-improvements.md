---
name: 逐元素清晰化改進清單
description: JOB-203 Phase 0 產物 D — 不動既有結構，針對每個 UI 元素列出最小改動提案
type: docs_ops
---

`last_updated`: 2026-04-20 16:30
`updated_by`: Claude Code (claude-opus-4-7)

# 04 — 逐元素清晰化改進清單（Element-Level Improvements）

## 文件定位

**本檔不改色系、不改結構、不重構 token**。僅針對現行 4 個代表頁面的每個 UI 元素，列出「讓畫面更清晰」的**最小改動**建議，每項獨立可做。

靈感來源：使用者認可的 `test/design_preview_claymorphism.html` 中的具體表現手法（螢光筆高亮、選項 badge 方形化、H2 左豎色條、stats 大數字等），**不含**整體色系替換、字型整組更換、Dark Mode 重配。

**使用方式**：
1. 逐頁檢視「元素表」
2. 每個元素下方有 1-2 個建議，勾選想做的
3. 回覆「我要 M2.4-a、Q3.6-a、R4.1-a」等編號
4. PM 依勾選開 JOB-204

---

## 一、MainMenu（主選單）— 分課與跨課選擇

### M1.1｜標題列：[三下][康軒版] + 🎯 國語複習 + 💡

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| [三下] pill | `text-[11px]` | a. 提升到 `text-xs`（12px），閱讀距離更舒適 |
| 💡 按鈕 | `w-8 h-8`（32×32） | a. 提升到 `w-10 h-10`（40×40），符合手機觸控最小建議 |

**工期**：各 5 分鐘 | **影響**：MainMenu.tsx 3 行

---

### M1.2｜分課複習區標題「📚 分課複習」

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| H2 視覺層級 | 純文字置中、無裝飾 | a. 套用 `stripe-left` utility，加 4px 豎色條（現有 utility）<br>b. 下方加淺色副標「全 8 課・平均每課 18 題」（動態） |

**工期**：a 15 分 / b 30 分 | **範例**：

```html
<!-- a 方案：左豎色條 -->
<h2 class="stripe-left pl-3 text-base sm:text-lg font-extrabold">📚 分課複習</h2>
```

---

### M1.3｜題數膠囊切換器（🎯 10 題 / ⭐ 20 題 / 🏆 全部做）

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| emoji 一致性 | 🎯⭐🏆 三種風格 | a. 統一「🎯 10 題 / 🎯 20 題 / 📚 全部做」（同系 emoji）<br>b. 去除 emoji，用純數字「10 題 / 20 題 / 全部」讓選擇感更純粹 |
| active 狀態對比 | 科目漸層底 + 白字 | c. 加入 `ring-2 ring-primary/20` 讓 active 更跳出 |

**工期**：各 10 分 | **影響**：MainMenu.tsx `options` 陣列

---

### M1.4｜分課卡（彩虹色條 + 第 N 課 + 題數 pill）

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| 左彩條寬度 | `w-1.5`（6px） | a. 加粗到 `w-2`（8px），色條更搶眼、視覺分組更明確 |
| 「第 N 課」字 | `text-muted-foreground font-semibold` | b. 加上 `num` class 讓數字穩定 tabular（如果使用 Baloo 2）—— **僅此元素可選用**，不強制字型升級 |
| 題數 pill | `text-[10px] px-1.5 py-0.5` | c. 放大至 `text-xs px-2 py-1`（12px），題數一眼可見 |
| hover 回饋 | `hover:shadow-md hover:-translate-y-0.5` | d. 加 `hover:scale-[1.02]` 讓「浮起」更明顯 |

**工期**：各 5-10 分 | **影響**：MainMenu.tsx 分課卡 block

---

### M1.5｜跨課測驗標題 + 課程範圍按鈕

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| 標題置中 + 按鈕絕對右對齊 | absolute 定位堆疊 | a. 改 `flex justify-between`，結構更單純，對行動版更穩 |

**工期**：15 分 | **影響**：MainMenu.tsx 跨課 section 佈局

---

### M1.6｜基本挑戰 vs 進階挑戰按鈕

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| 基本挑戰邊框透明度 | `subject-${theme} / 0.4` | a. 提升到 `/ 0.6`，邊框更明顯 |
| 進階挑戰題數 pill | `bg-white/20 px-2 py-0.5 rounded-full` | b. 加 `font-extrabold` + 稍大 padding，強化「25 題」數字 |
| 兩按鈕層級差異 | 僅靠底色差 | c. 進階挑戰加 `ring-2 ring-primary/10`，層級更清楚 |

**工期**：各 5-10 分 | **影響**：MainMenu.tsx 挑戰按鈕 block

---

## 二、QuizView（答題）— 填寫頁面

### Q2.1｜Top bar：← 返回 + 挑戰類型

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| 返回按鈕 | 純文字「← 返回」 | a. 改為 `rounded-full bg-muted px-3 py-1.5` pill，點擊區明確<br>b. 替換為 `<ChevronLeft />` 圖示 + 透明按鈕 |
| 挑戰類型標籤 | `text-sm text-muted-foreground` | c. 加 badge 樣式 `bg-secondary px-2 py-0.5 rounded-full` 讓「基本挑戰」更明確 |

**工期**：各 10 分

---

### Q2.2｜進度條 + 進度文字

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| 進度條底色對比 | `bg-muted`（淺色） | a. 改 `bg-muted/70` 深一點，或加 `border border-border/50` |
| 進度條高度 | `h-3`（12px） | b. 加粗到 `h-4`（16px），更容易看到填滿程度 |
| 「✓ 0 ✗ 0」文字 | 純 emoji + 數字 | c. 改「答對 0｜答錯 0」文字，避免 emoji 不一致 |

**工期**：各 5 分

---

### Q2.3｜題目卡 meta 列（課文 pill + 📌 情境 + 選擇題 badge）

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| 三項同一列 | flex-wrap | a. 保持課文 pill + 選擇題 badge 同行，**情境文字獨立下一行**，不與 pill 擠<br>b. 加分隔點「•」在三項之間 |

**工期**：各 5 分

---

### Q2.4｜題目文字

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| 題目字級 | `text-lg font-medium leading-relaxed` | a. 改 `text-lg font-semibold leading-loose`，行距放寬讀長題更舒服 |
| 關鍵字高亮 | 無 | b. 新增 `<mark class="highlight">...</mark>` utility，對關鍵詞加黃色螢光筆底（來自 claymorphism.html 的`linear-gradient(180deg, transparent 62%, #FEF3C7 62%)`） |

**工期**：a 5 分 / b 20 分（需 utility + 題庫加 `<mark>` 標記機制）

---

### Q2.5｜選項卡 + A/B/C/D badge

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| A/B/C/D badge | 純文字 `font-bold text-muted-foreground` | a. **方形 badge 小版**：`w-7 h-7 rounded-lg bg-muted text-primary font-bold grid place-items-center`（28×28，不像上次 40×40 那麼誇張）<br>b. 純文字但加圓圈底 `rounded-full bg-muted w-6 h-6` |
| 選項 padding | `px-4 py-3` | c. 放寬到 `px-5 py-4`，觸控 / 閱讀都更舒服 |
| 選項文字 | 繼承 body | d. 加 `text-[15px]` 稍大一點 |
| 正解/錯選對比 | `bg-correct-light border-2 border-correct` | e. 加 `✓` / `✕` 圖示於右側（24px），不只靠顏色（色盲友善）|

**工期**：a/b 10 分 / c/d 5 分 / e 15 分

**e 方案示意**：

```tsx
{confirmed && i === current.answerIndex && (
  <span className="ml-auto text-correct text-xl font-black">✓</span>
)}
{confirmed && i === selectedOption && i !== current.answerIndex && (
  <span className="ml-auto text-wrong text-xl font-black">✕</span>
)}
```

---

### Q2.6｜解析區（正解/錯選淺底 + 迷思診斷卡）

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| 正解/錯選標題 | `font-bold` 純文字前綴「✅ 答對了！」| a. 加左側 `border-l-4 border-correct`（如 claymorphism.html 的 note 區塊），強化「這是回饋區」視覺 |
| 迷思診斷卡 | `bg-amber-100 border-amber-300` 硬編碼黃 | b. 改用 token：`bg-accent/10 border-accent/30`，Dark Mode 才能一致 |
| 迷思診斷標題 | `text-xs font-medium` | c. 改 `text-sm font-bold` 讓「💡 迷思診斷」更像小標題 |

**工期**：各 5-10 分

---

### Q2.7｜確認答案 / 下一題按鈕

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| 按鈕高度 | `py-3` ≈ 48px | a. 現已符合觸控建議（44+），不需改 |
| disabled 狀態 | `bg-muted text-muted-foreground` | b. 加 `opacity-60` 讓「不能點」更明顯 |
| 快捷鍵提示 | `text-xs font-normal opacity-90 hidden sm:inline` | c. 提到桌面版小字到 `opacity-70` 更不搶戲 |

**工期**：各 3 分

---

## 三、ResultView（結果）— 說明頁面

### R3.1｜分數大數字

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| 字級 | `text-6xl font-black subject-text-${theme}` | a. 加 `drop-shadow-sm` 輕微立體感<br>b. 數字下方加「正確率 X%」環形 SVG 視覺化（從 LearningReportView 挪過來）|

**工期**：a 3 分 / b 30 分（需引入 SVG）

---

### R3.2｜正確率 pill + 鼓勵語

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| pill 位置 | `inline-block` 分數正下方 | a. 加 `mt-3` 與分數拉開一點距離 |
| 鼓勵語字級 | `text-lg font-medium` | b. 改 `text-xl font-bold`，讓情緒反饋更飽滿 |

**工期**：各 3 分

---

### R3.3｜總體統計格（總答題 + 總正確率）

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| 兩個方格 | `bg-muted rounded-xl p-2` | a. 加 `border border-border/50`，視覺分組更清晰<br>b. 數字字級從 `text-lg` 升 `text-2xl`，加 `font-black`<br>c. 加 icon（📊 / 🎯）讓格子更活潑 |

**工期**：a 3 分 / b 3 分 / c 10 分

---

### R3.4｜累積錯題本列表（長列表）

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| 顯示策略 | `slice(0, 5)` 預設只顯示 5 筆 | a. 加「展開全部 N 題」按鈕（目前超過 5 筆直接截斷）|
| 每題卡片 padding | `p-3` | b. 放寬到 `p-4`，長題讀起來不壓迫 |
| 「✓ 正確答案」 | `ml-auto text-green-600` 硬編碼色 | c. 改 `text-correct`（token） |

**工期**：a 20 分 / b/c 3 分

---

### R3.5｜最近練習清單

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| 每筆顯示 | 類型 + 正確率 | a. 加日期「04/18」讓時間感明確<br>b. 加題數「9/10」讓結果更立體 |
| 分隔 | `border-b` 細線 | c. 加 `py-2.5`（目前 `py-1`）呼吸感更好 |

**工期**：各 5 分

---

## 四、LearningReportView（學習報告）— 說明/統計頁面

### L4.1｜Header 返回 + 標題 + 副標

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| 返回「←」 | 純文字 | a. 同 Q2.1，改 pill 或圖示按鈕 |
| 副標 | `text-xs text-muted-foreground truncate` | b. 加粗到 `text-sm font-medium`，避免太弱 |

**工期**：各 5 分

---

### L4.2｜出版社切換按鈕

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| active 狀態 | `style={{ background: 'hsl(200 40% 62%)' }}` 動態 style | a. 改用 CSS 變數 `bg-[hsl(var(--publisher-kanghsuan))]`（雛形已支援）|
| 非 active | `bg-secondary text-secondary-foreground` | b. 加 `border border-border/50` 讓邊界更明確 |

**工期**：各 10 分

---

### L4.3｜Tabs（統計 / 錯題）+ 錯題徽章

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| 錯題徽章 | `w-5 h-5 text-[10px]` 小紅圓 | a. 放大到 `w-6 h-6 text-xs`，辨識度更高 |
| active tab | `bg-card shadow-sm` | b. 加 `font-black`，與 inactive 字重拉開 |

**工期**：各 3 分

---

### L4.4｜SummaryCard（練習次數 / 總答題 / 平均正確率）

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| icon 尺寸 | `text-lg`（18px） | a. 放大到 `text-3xl`（30px），icon 更搶眼 |
| 數字 | `text-xl font-black` | b. 升到 `text-2xl`（24px） |
| label | `text-[10px] text-muted-foreground` | c. 升到 `text-xs`（12px） |

**工期**：各 3 分

---

### L4.5｜環形進度圖

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| SVG 尺寸 | `w-20 h-20`（80×80） | a. 放大到 `w-24 h-24`（96×96） |
| 中央百分比 | `text-lg`（18px） | b. 升到 `text-2xl`（24px） |
| stroke 粗細 | `strokeWidth="3"` | c. 保持不變（細圈反而精緻）|

**工期**：a/b 各 3 分

---

### L4.6｜各課正確率長條圖

| 項目 | 現狀 | 可能的清晰化 |
|:--|:--|:--|
| 長條高度 | `h-2`（8px） | a. 加粗到 `h-2.5`（10px）或 `h-3`（12px） |
| 標籤對齊 | `flex justify-between text-xs` | b. 加 `num` class 給百分比，tabular-nums 對齊 |
| 分組分隔 | 無 | c. 加 `space-y-3`（目前 `space-y-2.5`）每條呼吸感更好 |

**工期**：各 3 分

---

## 五、全站通用 utilities 新增提案

**這些是少量新 utility class，一次做完所有頁面都能用**：

| # | utility | 用途 | 工期 |
|:--:|:--|:--|:--:|
| U1 | `.highlight-yellow` | 題目關鍵字螢光筆底 `linear-gradient(180deg, transparent 62%, #FEF3C7 62%)` | 10 分 |
| U2 | `.num` | Baloo 2 tabular-nums（**僅用在數字**，不影響整體字型）| 20 分 |
| U3 | `.min-h-11` `.min-w-11` | 觸控目標 ≥ 44px 統一 | 5 分 |

**注意**：U2 引入 Baloo 2 只做**數字輔助**，body 仍用 Nunito（與主專案一致）。

---

## 六、建議組合

### 🟢 最小有感（< 2 小時）

**Q2.5-a + Q2.5-e + Q2.6-b + M1.4-c + L4.4-a/b**

- 選項方形 badge 小版（28×28）
- 選項正解/錯選加 ✓/✕ 圖示（色盲友善）
- 迷思診斷卡改 token 底色（Dark Mode 友善）
- 分課卡題數 pill 放大
- SummaryCard icon / 數字放大

### 🟡 標準組合（半日）

以上 + M1.1 觸控升級 + Q2.2 進度條加粗 + R3.3 stats 格加 border/icon + L4.6 長條加粗

### 🔵 完整盤點（1 日）

以上 + M1.2 H2 左豎色條 + Q2.4-b 螢光筆 utility + R3.1-b 環形進度引入 Result 頁 + 全站觸控升級

---

## 七、使用者勾選區

在下方勾要做的元素編號（可複選，或直接選「建議組合」）：

```
我要做：
[  ] 🟢 最小有感組合
[  ] 🟡 標準組合
[  ] 🔵 完整盤點

或自選：
[  ] M1.1-a / M1.1-b / ...
[  ] M1.2-a / M1.2-b
[  ] M1.3-a / M1.3-b / M1.3-c
[  ] M1.4-a / M1.4-b / M1.4-c / M1.4-d
[  ] M1.5-a
[  ] M1.6-a / M1.6-b / M1.6-c
[  ] Q2.1-a / Q2.1-b / Q2.1-c
[  ] Q2.2-a / Q2.2-b / Q2.2-c
[  ] Q2.3-a / Q2.3-b
[  ] Q2.4-a / Q2.4-b
[  ] Q2.5-a / Q2.5-b / Q2.5-c / Q2.5-d / Q2.5-e
[  ] Q2.6-a / Q2.6-b / Q2.6-c
[  ] Q2.7-b / Q2.7-c
[  ] R3.1-a / R3.1-b
[  ] R3.2-a / R3.2-b
[  ] R3.3-a / R3.3-b / R3.3-c
[  ] R3.4-a / R3.4-b / R3.4-c
[  ] R3.5-a / R3.5-b / R3.5-c
[  ] L4.1-a / L4.1-b
[  ] L4.2-a / L4.2-b
[  ] L4.3-a / L4.3-b
[  ] L4.4-a / L4.4-b / L4.4-c
[  ] L4.5-a / L4.5-b
[  ] L4.6-a / L4.6-b / L4.6-c
[  ] U1 螢光筆 utility
[  ] U2 數字 Baloo 2 utility
[  ] U3 觸控 min-h-11 utility
```

勾完回覆，PM 會：
1. 把勾選項做到雛形中（在現行 1:1 快照上疊加，不動結構）
2. 您看完雛形後再決定哪些真的做到主專案
3. 開 JOB-204 執行主專案改動

---

## 八、變更紀錄

| 日期 | 變更 |
|:--|:--|
| 2026-04-20 16:30 | 建立（第三輪後使用者要求「不動結構、逐元素調整」） |
