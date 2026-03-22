# JOB-086：AI 專家說 — 依年級／學期／科目之 R2／R3／R1 指引

*Created by Cursor at 2026-02-27*

## 背景

使用者反映「AI 專家說」未依年級、學科（與學期）提供差異化指引語；且應與 R2（分科總綱）、R3（年級／學期研究）對齊，以建立信任與深度說明。

## 實作摘要

- `getSubjectPrincipleContent(grade, semester, subject)`：注入 **R2／R3／R1** 三層 `researchLayers`；R3 支援精選鍵值（如 `6_2_國語`）與科目預設模板。
- 三年級國語：標題與第三段敘事依 **上／下學期** 切換。
- 移除全體年級共用之「三年級 4-4-2」單一配比卡，改為 **R1 依低／中／高年段** 說明。
- `InsightDrawer`：分區顯示「研究架構導讀」與「引導式說明」，樣式使用語意色（card／primary／muted）。

## DoD

- [x] 切換年級／學期／科目時，R3 標題與內文跟隨變化。
- [x] `npm run build` 通過。

## 變更檔案

| 檔案 | 說明 |
|------|------|
| `apps/v3_eidos/src/data/subjectPrincipleContent.ts` | R2/R3/R1、學期參數、G3 國語分學期 |
| `apps/v3_eidos/src/components/InsightDrawer.tsx` | 版面與研究層區塊 |
| `apps/v3_eidos/src/components/MainMenu.tsx` | 傳入 `semester` |
