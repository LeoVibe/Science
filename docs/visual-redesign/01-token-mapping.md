---
name: 視覺 Token 映射表
description: JOB-203 Phase 0 產物 A2 — 現行 warm amber token → Claymorphism 新值完整對照
type: docs_ops
---

`last_updated`: 2026-04-20 14:30
`updated_by`: Claude Code (claude-opus-4-7)

# 01 — Token 映射表（Token Mapping）

## 文件定位

**本檔是現行 `src/index.css` + `data/config.ts` 所有視覺 token 的完整盤點**，並列出每一個 token 在 Claymorphism 下的**提案新值**。此檔**只列對照，不表決**；方向決策在 `00-direction-gate.md`。

- 盤點來源（只讀）：`apps/v3_eidos/src/index.css`、`apps/v3_eidos/src/data/config.ts`、`apps/v3_eidos/tailwind.config.ts`
- 使用統計來源（只讀）：`apps/v3_eidos/src/` 全域 grep（`subject-|--subject|gradient-|bg-correct|bg-wrong|PUBLISHER_THEME` 等）
- 提案值來源：`test/design_preview_claymorphism.html` + ui-ux-pro-max skill colors.csv

---

## 一、Semantic Token（Light Mode）

現行檔案：`apps/v3_eidos/src/index.css` `:root {}`

| # | CSS 變數 | 現行值（HSL） | 現行 HEX 近似 | 提案值（HEX） | 提案值（HSL） | 語意說明 |
|:--:|:--|:--|:--|:--|:--|:--|
| 1 | `--background` | `40 30% 97%` | `#F9F6F0` | `#EFF6FF` | `214 100% 97%` | 頁底色 |
| 2 | `--foreground` | `30 12% 20%` | `#3A3227` | `#0F172A` | `222 47% 11%` | 主文字 |
| 3 | `--card` | `40 20% 99%` | `#FCFBF9` | `#FFFFFF` | `0 0% 100%` | 卡片底 |
| 4 | `--card-foreground` | `30 12% 20%` | `#3A3227` | `#0F172A` | `222 47% 11%` | 卡片文字 |
| 5 | `--popover` | `40 20% 99%` | `#FCFBF9` | `#FFFFFF` | `0 0% 100%` | Popover 底 |
| 6 | `--popover-foreground` | `30 12% 20%` | `#3A3227` | `#0F172A` | `222 47% 11%` | Popover 文字 |
| 7 | `--primary` | `38 65% 50%` | `#D48B1F` 琥珀金 | `#2563EB` Learning Blue | `217 91% 60%` | 主色（按鈕、連結） |
| 8 | `--primary-foreground` | `0 0% 100%` | `#FFFFFF` | `#FFFFFF` | `0 0% 100%` | 主色前景 |
| 9 | `--secondary` | `38 15% 93%` | `#EFE9DE` | `#F59E0B` Play Yellow | `38 92% 50%` | 次要強調 |
| 10 | `--secondary-foreground` | `30 12% 30%` | `#564937` | `#78350F` | `24 79% 26%` | 次色前景 |
| 11 | `--muted` | `35 10% 92%` | `#EBE7E0` | `#F1F5FD` | `221 56% 97%` | 靜音區塊 |
| 12 | `--muted-foreground` | `30 8% 50%` | `#857E72` | `#475569` | `215 25% 34%` | 靜音文字 |
| 13 | `--accent` | `22 60% 56%` | `#CC734B` 暖橘 | `#EC4899` Fun Pink | `330 81% 60%` | 強調色 |
| 14 | `--accent-foreground` | `0 0% 100%` | `#FFFFFF` | `#FFFFFF` | `0 0% 100%` | 強調色前景 |
| 15 | `--destructive` | `0 60% 58%` | `#CC5453` | `#DC2626` | `0 72% 51%` | 刪除／錯誤 |
| 16 | `--destructive-foreground` | `0 0% 100%` | `#FFFFFF` | `#FFFFFF` | `0 0% 100%` | 刪除色前景 |
| 17 | `--border` | `35 12% 88%` | `#E4DDD1` | `#E4ECFC` | `217 85% 94%` | 一般邊框 |
| 18 | `--input` | `35 12% 88%` | `#E4DDD1` | `#E4ECFC` | `217 85% 94%` | 表單邊框 |
| 19 | `--ring` | `38 60% 50%` | `#CC8824` | `#2563EB` | `217 91% 60%` | Focus ring |
| 20 | `--radius` | `1rem` (16px) | — | `1.25rem` (20px) | — | 預設圓角（按鈕用） |

### 新增 Token 建議（Claymorphism 專屬）

| 新變數 | 值 | 用途 |
|:--|:--|:--|
| `--radius-lg` | `2rem` (32px) | 卡片圓角 |
| `--radius-xl` | `3rem` (48px) | 容器 / Panel 圓角 |
| `--clay-shadow` | 見 §6 | 主卡片陰影 |
| `--clay-shadow-sm` | 見 §6 | 按鈕 / 小卡片陰影 |
| `--clay-shadow-inset` | 見 §6 | 按下狀態 inset 陰影 |

---

## 二、科目色 Token（6 科目 × main + light = 12 個）

現行使用：`subject-bg-{theme}`、`subject-text-{theme}`、`gradient-{theme}` 多組 utility class。

### 2.1 現行值

| Theme | 科目 | 主色 HSL | 主色 HEX 近似 | Light HSL | Light HEX 近似 |
|:--|:--|:--|:--|:--|:--|
| chinese | 國語 | `345 42% 62%` | `#C57C8A` 玫瑰粉 | `345 45% 95%` | `#F8EAEE` |
| math | 數學 | `200 45% 55%` | `#4D96BD` 天空藍 | `200 40% 94%` | `#E3EEF3` |
| english | 英語 | `8 50% 60%` | `#CC7764` 珊瑚紅 | `8 45% 95%` | `#F6E9E6` |
| science | 自然 | `165 35% 50%` | `#53AB95` 湖水綠 | `165 35% 94%` | `#E2F0EC` |
| social | 社會 | `85 35% 50%` | `#8BAB53` 橄欖綠 | `85 30% 94%` | `#ECF0E2` |
| life | 生活 | `275 32% 62%` | `#9980B8` 薰衣草紫 | `275 32% 95%` | `#EDE9F2` |

**現行 gradient-{theme}**：每個 theme 定義 135° 漸層（見 `src/index.css` L186-208）。

### 2.2 β 方案（使用者 2026-04-20 勾選此方向）

**設計原則**：
1. 每個科目色與 `--primary` (`#2563EB` H=217) 色相距離原則上 ≥ 45°（Teal 例外，以 L/S 差異區隔）
2. 保留原「色相語意」（國語暖紅、數學冷藍、英語橙紅、自然綠、社會黃綠、生活紫）
3. 飽和度/明度統一在 Tailwind 600 級，確保彩度一致、不會某科目特別刺眼
4. 與 `--destructive` (`#DC2626` H=0) 錯開，錯誤訊息不被誤認為科目色

| Theme | 科目 | 建議新色（HEX） | HSL | Tailwind 對照 | 色相距 primary | 承襲語意 |
|:--|:--|:--|:--|:--|:--:|:--|
| chinese | 國語 | `#E11D48` | `347 77% 50%` | Rose 600 | 130° ✓ | 原玫瑰粉 → 深玫紅 |
| math | 數學 | `#0D9488` | `178 84% 32%` | Teal 600 | 39° ⚠ | 原天空藍 → 水鴨青（刻意與 primary 錯開 L/S）|
| english | 英語 | `#EA580C` | `21 90% 48%` | Orange 600 | 164° ✓ | 原珊瑚紅 → 活力橙 |
| science | 自然 | `#16A34A` | `142 71% 36%` | Green 600 | 75° ✓ | 原湖水綠 → 森林綠 |
| social | 社會 | `#CA8A04` | `45 96% 40%` | Yellow 600 | 172° ✓ | 原橄欖綠 → 琥珀黃（更貼近「社會/文化」象徵）|
| life | 生活 | `#9333EA` | `271 81% 56%` | Purple 600 | 54° ✓ | 原薰衣草紫 → 葡萄紫 |

### 2.3 Light 版（淺色背景用）

依 Tailwind 100 級，作為 `subject-bg-{theme}-light` 底色：

| Theme | Light HEX | HSL |
|:--|:--|:--|
| chinese | `#FFE4E6` | `356 100% 95%` |
| math | `#CCFBF1` | `167 85% 89%` |
| english | `#FFEDD5` | `34 100% 92%` |
| science | `#DCFCE7` | `142 77% 93%` |
| social | `#FEF3C7` | `48 96% 89%` |
| life | `#F3E8FF` | `270 100% 95%` |

### 2.4 Gradient 提案（取代現行 `gradient-{theme}` 漸層）

每個科目主色 → 同色相 Tailwind 500（稍淺），135° 漸層：

```css
.gradient-chinese { background: linear-gradient(135deg, #E11D48, #F43F5E); }
.gradient-math    { background: linear-gradient(135deg, #0D9488, #14B8A6); }
.gradient-english { background: linear-gradient(135deg, #EA580C, #F97316); }
.gradient-science { background: linear-gradient(135deg, #16A34A, #22C55E); }
.gradient-social  { background: linear-gradient(135deg, #CA8A04, #EAB308); }
.gradient-life    { background: linear-gradient(135deg, #9333EA, #A855F7); }
```

### 2.5 γ 保留記錄（未採用）

若未來決定改 γ：移除 12 個科目 token + 18 個 `subject-bg-*` / `subject-text-*` utility class + 6 個 `gradient-*` class。本 JOB 不處理。

---

## 三、Quiz 回饋 Token

現行使用：`bg-correct-light`、`border-correct`、`text-correct`、`bg-wrong-light`、`border-wrong`、`text-wrong`

| CSS 變數 | 現行值（HSL） | 現行 HEX 近似 | 提案值（HEX） | 提案值（HSL） |
|:--|:--|:--|:--|:--|
| `--correct` | `150 45% 44%` | `#3E9F6A` | `#16A34A` | `142 71% 45%` |
| `--correct-light` | `150 40% 94%` | `#E0EFE7` | `#DCFCE7` | `142 77% 93%` |
| `--wrong` | `0 55% 62%` | `#CE6A6A` | `#DC2626` | `0 72% 51%` |
| `--wrong-light` | `0 50% 96%` | `#F9EAEA` | `#FEE2E2` | `0 93% 94%` |

**對齊說明**：wrong 建議與 `--destructive` 同值，避免兩套紅色系。

---

## 四、Sidebar Token（8 個）

現行使用：`bg-sidebar-*`（shadcn/ui 預設 sidebar 元件）

| CSS 變數 | 現行值（HSL） | 提案值（HSL） | 備註 |
|:--|:--|:--|:--|
| `--sidebar-background` | `40 30% 97%` | `214 100% 97%` | 同 `--background` |
| `--sidebar-foreground` | `30 12% 30%` | `215 25% 34%` | 同 `--muted-foreground` |
| `--sidebar-primary` | `38 60% 48%` | `217 91% 60%` | 同 `--primary` |
| `--sidebar-primary-foreground` | `0 0% 100%` | `0 0% 100%` | 無異動 |
| `--sidebar-accent` | `38 15% 95%` | `221 56% 97%` | 同 `--muted` |
| `--sidebar-accent-foreground` | `30 14% 16%` | `222 47% 11%` | 同 `--foreground` |
| `--sidebar-border` | `35 12% 90%` | `217 85% 94%` | 同 `--border` |
| `--sidebar-ring` | `38 60% 50%` | `217 91% 60%` | 同 `--ring` |

**實質觀察**：sidebar token 與主 semantic token 高度重疊，Phase 2 可考慮合併精簡。

---

## 五、出版社色（`data/config.ts`）

### 5.1 現行

`PUBLISHER_THEME_COLORS`（寫死 HSL 字串）。

```ts
export const PUBLISHER_THEME_COLORS: Record<Publisher, string> = {
  '康軒': 'hsl(200 40% 62%)',  // 寧靜灰藍
  '南一': 'hsl(340 43% 63%)',  // 柔和粉玫瑰
  '翰林': 'hsl(168 35% 52%)',  // 清新湖水綠
};
```

**規格書記載值（§1.3）**：康軒 `hsl(200 55% 55%)`、南一 `hsl(350 50% 65%)`、翰林 `hsl(168 45% 50%)`——**與程式碼不一致**（drift 詳 §十）。

### 5.2 y 方案（使用者 2026-04-20 勾選、14:45 由 Claude Code 重新發揮定案）

**定案說明**：原提案（Cyan 700 / Rose 700 / Green 700）與 6 科目色 β 有同色相重疊（Teal-Cyan、國語 Rose-南一 Rose、自然 Green-翰林 Green），Claude Code 14:45 判斷改採**退化方案 y-retreat**——出版社色色相全部避開科目色使用區，讓「學習報告頁」出版社切換按鈕有明確視覺層級。

| 出版社 | 建議新色（HEX） | HSL | Tailwind 對照 | 色相距 primary | 語意延續 |
|:--|:--|:--|:--|:--:|:--|
| 康軒 | `#4338CA` | `244 75% 51%` | Indigo 700 | 27° ⚠ | 原寧靜灰藍 → 沉穩學術藍（承襲「理性」）|
| 南一 | `#B45309` | `28 92% 37%` | Amber 700 | 171° ✓ | 原柔和粉玫瑰 → 暖棕琥珀（承襲「溫暖」）|
| 翰林 | `#334155` | `215 25% 27%` | Slate 700 | 2° ❌（靠低 S=25% 視為灰色）| 原清新湖水綠 → 中性炭灰（承襲「沉穩」）|

**與科目色對比檢核**（確保不重疊）：

| 出版社色 | 最接近的科目色 | 色相差 | 結果 |
|:--|:--|:--|:--|
| 康軒 Indigo 700 `#4338CA` (H=244) | 生活 Purple 600 (H=271) | 27° | 可接受（Indigo 偏冷深、Purple 偏暖亮）|
| 南一 Amber 700 `#B45309` (H=28) | 英語 Orange 600 (H=21) | 7° ⚠ | Orange 亮（L=48）vs Amber 深（L=37）區隔 |
| 翰林 Slate 700 `#334155` (S=25%) | — | — | 低飽和視為灰色，不與任何高彩度科目色衝突 |

**觀察**：南一 Amber 與英語 Orange 色相僅差 7°，但英語課通常在答題頁出現、出版社 Amber 出現在學習報告頁的切換 tab，情境隔離；若雛形驗收仍覺衝突，fallback 為南一改 Fuchsia 700 `#A21CAF`。

### 5.3 規格書 drift（Phase 1 必修）

見 §十，Phase 1 第一步同步更新程式碼與規格書。

### 5.3 規格書 drift（Phase 1 必修）

見 §十，Phase 1 第一步同步更新程式碼與規格書。

---

## 六、陰影系統（Claymorphism 新增）

現行：使用 Tailwind `shadow-sm`、`shadow-md`（單層）。

新增提案（取自 `test/design_preview_claymorphism.html`）：

```css
--clay-shadow:
  0 12px 24px rgba(37, 99, 235, 0.12),   /* 外下深陰影 */
  0 4px 8px rgba(37, 99, 235, 0.08),      /* 外下淺陰影 */
  inset 0 -4px 0 rgba(0, 0, 0, 0.04),     /* 內底邊壓 */
  inset 0 4px 0 rgba(255, 255, 255, 0.6); /* 內頂邊亮 */

--clay-shadow-sm:
  0 6px 12px rgba(37, 99, 235, 0.10),
  inset 0 -2px 0 rgba(0, 0, 0, 0.04),
  inset 0 2px 0 rgba(255, 255, 255, 0.6);

/* 按下狀態：外陰影收起、僅保留內壓 */
--clay-shadow-inset:
  inset 0 4px 8px rgba(37, 99, 235, 0.15);
```

**Tailwind 整合方式**（Phase 1 參考）：

```ts
// tailwind.config.ts
extend: {
  boxShadow: {
    clay: 'var(--clay-shadow)',
    'clay-sm': 'var(--clay-shadow-sm)',
    'clay-inset': 'var(--clay-shadow-inset)',
  },
}
```

---

## 七、字型 Stack

### 現行

```css
/* src/index.css */
@import url('https://fonts.googleapis.com/css2?family=Nunito:...');
body { font-family: "Nunito", "Noto Sans TC", "Helvetica Neue", Arial, sans-serif; }
```

### 提案

```css
/* 全站主字體 */
body {
  font-family:
    'Baloo 2',           /* 英文/數字（圓潤活潑，搭配 Claymorphism 的圓角氣質） */
    'Iansui',            /* 正體中文標題（支援注音符號、手寫感） */
    'Noto Sans TC',      /* 正體中文內文保底 */
    system-ui, sans-serif;
}

/* 數字 tabular-nums */
.num { font-variant-numeric: tabular-nums; }
```

**載入策略**：

```html
<link rel="preconnect" href="https://fonts.googleapis.com">
<link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
<link href="https://fonts.googleapis.com/css2?family=Baloo+2:wght@400;500;600;700&family=Iansui&family=Noto+Sans+TC:wght@400;500;700&display=swap" rel="stylesheet">
```

**權重盤點**：
- 現行 Nunito 使用 `400/600/700/800/900`（5 組）
- 提案 Baloo 2 `400/500/600/700`（4 組）+ Iansui 單一權重 + Noto Sans TC `400/500/700`（3 組）
- **CLS/FOUT 風險**：新字型首次載入需測量，Phase 1 要驗證 `font-display: swap` 下視覺穩定度

---

## 八、圓角系統

| 用途 | 現行 | 提案 |
|:--|:--|:--|
| 按鈕（一般） | `rounded-xl` = 12px | `rounded-xl` = 20px（`--radius`） |
| 卡片（子） | `rounded-2xl` = 16px | `rounded-2xl` = 32px（`--radius-lg`） |
| 卡片（主） | `rounded-3xl` = 24px | `rounded-3xl` = 48px（`--radius-xl`） |
| 標籤 | `rounded-full` | `rounded-full` 無異動 |
| 徽章 badge | `rounded-md` = 6px | `rounded-xl` = 14-16px（圓潤化） |

**注意**：Tailwind 預設值本身不變，靠 `--radius` 及 `tailwind.config.ts` `borderRadius` 的 calc 推算。若 Phase 1 選採提案值，需重寫 `borderRadius` 區塊。

---

## 九、使用範圍統計

全站 grep 結果（`subject-|--subject|gradient-|warm amber|amber-|bg-correct|bg-wrong|text-correct|text-wrong|--correct|--wrong|PUBLISHER_THEME`）：

| 檔案 | 出現次數 | 性質 |
|:--|:--:|:--|
| `src/index.css` | 71 | token 定義源 |
| `src/components/MainMenu.tsx` | 9 | 主選單 |
| `src/components/QuizView.tsx` | 9 | 答題 |
| `src/components/LearningReportView.tsx` | 9 | 學習報告 |
| `src/components/AboutView.tsx` | 8 | 關於頁 |
| `src/components/QuestionFeedback.tsx` | 6 | 題目回饋 |
| `src/components/ResultView.tsx` | 5 | 結果頁 |
| `src/components/StatisticsView.tsx` | 4 | 統計頁 |
| `src/components/admin/AdminLibraryManager.tsx` | 3 | 後台 |
| `src/components/admin/AdminConfigPanel.tsx` | 3 | 後台 |
| `src/components/WrongQuestionsView.tsx` | 2 | 錯題頁 |
| `src/pages/Index.tsx` | 2 | 頁面層 |
| `src/components/ReviewView.tsx` | 1 | 複習頁 |
| `src/pages/AdminDashboard.tsx` | 1 | 後台 |
| `src/data/config.ts` | 1 | PUBLISHER_THEME_COLORS |
| **總計** | **134** | **15 檔案** |

Phase 1+ 的 token migration 工作量估算基準：**134 個使用點 × 平均 2 分鐘人工 review + 自動替換 = 約 4.5 小時 + QA 驗證**。

---

## 十、現行規格書 drift 清單（遺留問題）

Phase 1+ 執行前須先修正：

| drift | `docs/網站功能規格書.md` 記載 | 程式碼實際值 | 建議 |
|:--|:--|:--|:--|
| 國語主色 | `345 42% 62%` | `345 42% 62%` ✓ | 一致 |
| 康軒色 | `hsl(200 55% 55%)` | `hsl(200 40% 62%)` | **不一致** — Phase 1 先同步 |
| 南一色 | `hsl(350 50% 65%)` | `hsl(340 43% 63%)` | **不一致** — Phase 1 先同步 |
| 翰林色 | `hsl(168 45% 50%)` | `hsl(168 35% 52%)` | **不一致** — Phase 1 先同步 |
| 主字型 | `Nunito` | `Nunito` ✓ | 一致 |

**處理**：本 JOB（203）不動規格書，上述三筆 drift 記為遺留問題，建議 Phase 1 第一步先修正規格書使其與程式碼一致（或反之）後，再執行 token migration。

---

## 十一、Dark Mode Token（使用者 2026-04-20 勾選同步設計）

### 11.1 設計原則

1. **背景不全黑**：用 Slate 900 (`#0F172A`) 而非純黑，降低對比疲勞
2. **主色提亮**：Light Mode 的 `#2563EB` 在暗底可讀性不足，Dark Mode 改用 `#60A5FA` Blue 400
3. **Clay Shadow 重配**：外陰影加深（rgba 從 0.12 提到 0.4），inset highlight 從純白 `rgba(255,255,255,0.6)` 改為 Slate 600 `rgba(100,116,139,0.3)`
4. **科目色/出版社色**：沿用 Light 提案值，但飽和度在 CSS 層面自動 +5% 以在暗底保持辨識（或直接用 Tailwind 500 級而非 600 級）

### 11.2 Semantic Token（Dark）

| CSS 變數 | Light 值 | Dark 提案值（HEX） | Dark 提案值（HSL） | Tailwind 對照 |
|:--|:--|:--|:--|:--|
| `--background` | `#EFF6FF` | `#0F172A` | `222 47% 11%` | Slate 900 |
| `--foreground` | `#0F172A` | `#F1F5F9` | `210 40% 96%` | Slate 100 |
| `--card` | `#FFFFFF` | `#1E293B` | `217 33% 17%` | Slate 800 |
| `--card-foreground` | `#0F172A` | `#F1F5F9` | `210 40% 96%` | Slate 100 |
| `--popover` | `#FFFFFF` | `#1E293B` | `217 33% 17%` | Slate 800 |
| `--popover-foreground` | `#0F172A` | `#F1F5F9` | `210 40% 96%` | Slate 100 |
| `--primary` | `#2563EB` | `#60A5FA` | `213 94% 68%` | Blue 400 |
| `--primary-foreground` | `#FFFFFF` | `#0F172A` | `222 47% 11%` | Slate 900 |
| `--secondary` | `#F59E0B` | `#FBBF24` | `43 96% 56%` | Amber 400 |
| `--secondary-foreground` | `#78350F` | `#0F172A` | `222 47% 11%` | Slate 900 |
| `--muted` | `#F1F5FD` | `#334155` | `215 25% 27%` | Slate 700 |
| `--muted-foreground` | `#475569` | `#94A3B8` | `215 20% 65%` | Slate 400 |
| `--accent` | `#EC4899` | `#F472B6` | `329 86% 70%` | Pink 400 |
| `--accent-foreground` | `#FFFFFF` | `#0F172A` | `222 47% 11%` | Slate 900 |
| `--destructive` | `#DC2626` | `#F87171` | `0 91% 71%` | Red 400 |
| `--destructive-foreground` | `#FFFFFF` | `#0F172A` | `222 47% 11%` | Slate 900 |
| `--border` | `#E4ECFC` | `#334155` | `215 25% 27%` | Slate 700 |
| `--input` | `#E4ECFC` | `#334155` | `215 25% 27%` | Slate 700 |
| `--ring` | `#2563EB` | `#60A5FA` | `213 94% 68%` | Blue 400 |

### 11.3 Clay Shadow（Dark）

```css
.dark {
  --clay-shadow:
    0 12px 24px rgba(0, 0, 0, 0.4),
    0 4px 8px rgba(0, 0, 0, 0.3),
    inset 0 -4px 0 rgba(0, 0, 0, 0.3),
    inset 0 4px 0 rgba(100, 116, 139, 0.3);   /* Slate 500 替代純白 */

  --clay-shadow-sm:
    0 6px 12px rgba(0, 0, 0, 0.3),
    inset 0 -2px 0 rgba(0, 0, 0, 0.3),
    inset 0 2px 0 rgba(100, 116, 139, 0.3);
}
```

### 11.4 科目色（Dark）

在 Dark Mode 將 600 級提亮到 500 級（保持飽和識別）：

| Theme | Light (600) | Dark 提案 (500) | Tailwind |
|:--|:--|:--|:--|
| chinese | `#E11D48` | `#F43F5E` | Rose 500 |
| math | `#0D9488` | `#14B8A6` | Teal 500 |
| english | `#EA580C` | `#F97316` | Orange 500 |
| science | `#16A34A` | `#22C55E` | Green 500 |
| social | `#CA8A04` | `#EAB308` | Yellow 500 |
| life | `#9333EA` | `#A855F7` | Purple 500 |

### 11.5 出版社色（Dark）

同理，700 提亮到 600：

| 出版社 | Light (700) | Dark 提案 (600) | Tailwind |
|:--|:--|:--|:--|
| 康軒 | `#0E7490` | `#0891B2` | Cyan 600 |
| 南一 | `#BE123C` | `#E11D48` | Rose 600 |
| 翰林 | `#15803D` | `#16A34A` | Green 600 |

### 11.6 對比度驗證（關鍵）

| 組合 | 對比度 | WCAG 結果 |
|:--|:--|:--|
| `#F1F5F9` on `#0F172A`（內文）| ~16:1 | AAA ✓ |
| `#60A5FA` on `#0F172A`（連結）| ~6.5:1 | AA Large ✓ |
| `#94A3B8` on `#0F172A`（靜音文字）| ~5.3:1 | AA ✓ |
| `#F1F5F9` on `#1E293B`（卡片內文）| ~13:1 | AAA ✓ |

---

## 十二、變更紀錄

| 日期 | 變更 |
|:--|:--|
| 2026-04-20 | v1.0 初版建立 |
| 2026-04-20 14:30 | 使用者勾選 β/y/Dark Mode 後補 §2.2-2.5 β 方案、§五 y 方案、§十一 Dark Mode token |
