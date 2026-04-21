# Eidos UI 雛形（第三輪・現行網站 1:1 快照）

> JOB-203 視覺重構 Phase 0 — 2026-04-20 第三輪重寫
>
> **獨立 Vite 專案，與 `apps/v3_eidos/` 完全隔離，不從主專案 import 任何程式碼。**

## 定位

本雛形是**現行 Eidos 網站的視覺快照**，以 mock data + 獨立 Vite 專案重現現行 3~4 個最重要頁面的畫面。

**目的**：作為後續「想改哪裡」討論的 baseline。使用者在這個已熟悉的基礎上指出具體不滿意處，再逐項設計改進。

**本輪不引入任何新元素**：
- ❌ 不用 Clay Shadow（維持 `shadow-sm` / `shadow-md`）
- ❌ 不用 Iansui / Baloo 2 字型（維持 Nunito + Noto Sans TC）
- ❌ 不用方形 badge（選項用純文字 A/B/C/D）
- ❌ 不改圓角尺寸（`rounded-2xl`/`rounded-3xl` 原值）
- ❌ 不改對比度、不動 token 色值
- ❌ 不做 shake 動畫、震動、aria-live 新增
- ❌ 不重新設計科目色或出版社色

所有 `src/index.css` token 內容與 `apps/v3_eidos/src/index.css` 一致。

## 三輪演進

| 輪次 | 方向 | 結果 |
|:--|:--|:--|
| 第一輪 | 方向 A 完全替換（Learning Blue + Claymorphism + β 科目色 + y 出版社色）| 使用者退回：「太大」「看不出好處」|
| 第二輪 | 方向 D 保守漸進（warm amber 底 + A1-A3 + B4-B6 + C7-C9 改進疊加） | 使用者退回：「還是太大」|
| 第三輪（本版）| **1:1 現行快照**（零改動）| baseline — 後續從這裡討論 |

## 啟動方式

```bash
cd prototypes/ui-v2
npm install   # 已於 JOB-203 第一輪執行完畢
npm run dev   # 預設 port 5183
```

瀏覽器打開 <http://localhost:5183>。

## 頁面清單

| 路由 | 檔案 | 對應主專案元件 |
|:--|:--|:--|
| `/` | `src/pages/MainMenu.tsx` | `apps/v3_eidos/src/components/MainMenu.tsx` |
| `/quiz` | `src/pages/QuizView.tsx` | `QuizView.tsx` |
| `/result` | `src/pages/ResultView.tsx` | `ResultView.tsx` |
| `/report` | `src/pages/LearningReportView.tsx` | `LearningReportView.tsx` |

底部浮動 Nav 可切換四頁。右上可切 Light/Dark（Dark 為主專案既有暖棕色調）。

## 雛形演示控制器

MainMenu 頂部加了一列**演示切換器**，可切換 6 個科目（國語/數學/英語/自然/社會/生活）以確認各科色彩是否正確呈現——這部分在主專案中由 `AppHeader` 提供，此處為獨立雛形之權宜。

## 檔案對照表

```
prototypes/ui-v2/
├── index.html            ← 去除 Baloo 2 / Iansui 字型
├── src/
│   ├── index.css         ← 與主專案 src/index.css 一致
│   ├── main.tsx
│   ├── App.tsx
│   ├── components/
│   │   ├── ThemeSwitcher.tsx   ← 使用 shadow-sm（非 Clay）
│   │   └── Nav.tsx             ← 底部浮動 nav（雛形獨有）
│   ├── data/mock.ts
│   └── pages/
│       ├── MainMenu.tsx        ← 1:1 對照主專案
│       ├── QuizView.tsx        ← 1:1 對照主專案
│       ├── ResultView.tsx      ← 1:1 對照主專案
│       └── LearningReportView.tsx  ← 1:1 對照主專案
└── tailwind.config.ts    ← 與主專案 tailwind.config.ts 對齊
```

## 下一步（使用者驗收後）

1. 使用者在此 baseline 上指出「想改的具體痛點」（例：「分課卡的題數 badge 太小」「答錯時不夠明顯」「按鈕 hover 沒有回饋」等）
2. PM 把每個痛點列為獨立候選項
3. 使用者勾選要做的，PM 開 JOB-204 執行

---

`last_updated`: 2026-04-20 16:00
`updated_by`: Claude Code (claude-opus-4-7)
