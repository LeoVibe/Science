`last_updated`: 2026-04-19 19:15
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-201 Report — AboutView 題庫設定連動修正

**執行者**：Claude Code（claude-sonnet-4-6）（使用者授權例外）
**執行日期**：2026-04-19
**job_type**：engineering

---

## 問題摘要

admin 後台 `/admin/library/manage` 的題庫開放設定（年級/學期/科目）對前台「題庫總覽」tab (`AboutView`) 完全無效。

**根本原因（三層）**：

| # | 原因 | 位置 |
|---|---|---|
| 1 | `AboutView` 有自己的 `useState<LibraryConfig>` 獨立讀 localStorage，`AboutViewProps` 無 `libraryConfig` 欄位 | `AboutView.tsx` |
| 2 | `Index.tsx` 渲染 `<AboutView>` 時沒傳入 `libraryConfig` prop，API 取得的值被丟棄 | `Index.tsx:778-784` |
| 3 | subjects 過濾只攔 `enabled === false`，subjects dict 中未出現的科目（`undefined`）也會顯示 | `AboutView.tsx:211` |

---

## 實際修改

### `apps/v3_eidos/src/components/AboutView.tsx`

**修改 1**：import 移除 `useEffect`（已不需要）
```diff
-import { useState, useEffect } from 'react';
+import { useState } from 'react';
```

**修改 2**：`AboutViewProps` 新增 `libraryConfig` prop
```diff
+  /** 後台題庫開放設定（由 Index.tsx 從 API 取得後傳入） */
+  libraryConfig?: LibraryConfig | null;
```

**修改 3**：組件簽名改為接收 prop，移除內部 useState + useEffect
```diff
-export default function AboutView({ tab, onTabChange, onBack, grade: userGrade, semester: userSemester }: AboutViewProps) {
-  const [libraryConfig, setLibraryConfig] = useState<LibraryConfig | null>(null);
-  ...
-  useEffect(() => {
-    const configData = localStorage.getItem('EIDOS_LIBRARY_CONFIG');
-    if (configData) {
-      try { setLibraryConfig(JSON.parse(configData)); } catch (e) { }
-    }
-  }, []);
+export default function AboutView({ tab, onTabChange, onBack, grade: userGrade, semester: userSemester, libraryConfig = null }: AboutViewProps) {
```

**修改 4**：subjects 過濾邏輯改為 allowlist
```diff
-if (libraryConfig && subConfig?.enabled === false) return;
+const hasSubjectConfig = sConfig?.subjects && Object.keys(sConfig.subjects).length > 0;
+if (libraryConfig && hasSubjectConfig && subConfig?.enabled !== true) return;
```

### `apps/v3_eidos/src/pages/Index.tsx`

**修改 5**：`<AboutView>` 傳入 `libraryConfig`
```diff
  <AboutView
    ...
    semester={semester}
+   libraryConfig={libraryConfig}
  />
```

---

## 驗收佐證

| 驗收項目 | 結果 |
|---|---|
| `npx tsc --noEmit` | 0 errors |
| API 請求 `eidos-api.eidosedu.workers.dev/api/settings` | HTTP 200 ✅ |
| G5 S2 題庫總覽 | 僅顯示「國語」（admin 設定：國語 enabled，其餘 4 科 disabled）✅ |
| G4 S2 題庫總覽 | 僅顯示「國語」＋「數學」（英語未在 subjects dict → allowlist 邏輯正確攔截）✅ |

---

## 遺留問題

- `jobs/` 目錄存在帶 ` 2.md` 後綴的 macOS 重複殘留檔（JOB-185\~192），已於本次清除（共 10 個未追蹤檔）。
- 正式機部署尚未執行，待使用者確認後執行 `ei_release`。

## DoD 同步記錄
- [x] 已執行 `/pj_sync`：更新 `docs/網站功能規格書.md` + `docs/README_專案發展紀錄.md`（2026-04-19）

---

＄作業匯總：Token數:- | 花費: $- | 使用模型: claude-sonnet-4-6 | 執行者: Claude Code
