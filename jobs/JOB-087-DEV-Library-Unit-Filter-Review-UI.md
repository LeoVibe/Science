# JOB-087：分科題庫—排除「單元」列並優化課次列表

*Created by Cursor at 2026-02-27*

## 背景

分科題庫以 manifest 課名為標籤時，誤出現「第一單元～第四單元」等非單篇課文列；且標籤雲無順序、無課次感。

## 實作

- `utils/lessonCategories.ts`：`isCurriculumUnitLabel`（`^第…單元`）、`filterAndOrderLessonCategories`（依 `lessonOrder` 排序）。
- `questionLoader`：載入後排除單元類別題目；`getAllCategories` 使用過濾＋排序；`manifestOnly` 與 `categoryCounts` 同步排除單元列。
- `ReviewView`：改為直向捲動列表，左側序號＋「第 N 課」＋課名。

## DoD

- [x] 分科題庫不再出現「第○單元：…」選項。
- [x] 課次有順序與第幾課提示。
- [x] build / 相關測試通過。
