*Created by AG at 2026-02-28 21:55*
*Last Updated at 2026-02-28 21:55 (Initial Release)*

# JOB-047：出題原則極簡化 UI 優化 (Subtle Principle Entry)

## 任務背景
雖然 JOB-046 引入了教育價值的簡介區塊，但考慮到使用者在測驗主頁的「專注度」與「畫面清新度」，決定將碩大的灰色區塊移除，轉化為與課程資訊列併行的極簡按鈕入口。這能在不干擾操作的前提下，提供專業性的保證。

## 任務詳情
1. **移除 `MainMenu.tsx` 中的大型 `PrincipleIntro` 區塊**。
2. **位置重定向**：將「出題原則」入口移至「年級/科目/出版者」資訊列的**右側**。
3. **視覺語彙**：
   - 使用琥珀色調 (`amber-50` / `amber-600`) 以與主色調區隔。
   - 包含燈泡圖示 `💡` 與文字「出題原則」。
   - 高度與文字行高齊平，確保對齊美觀。
4. **互動邏輯**：維持點擊滑出 `SubjectPrincipleDrawer` 的行為。

## 關鍵參考檔案
| 檔案 | 職責 |
|------|------|
| `apps/v3_eidos/src/components/MainMenu.tsx` | 重構主選單 UI |
| `apps/v3_eidos/src/components/SubjectPrincipleDrawer.tsx` | 確認 Drawer 啟動邏輯 |

## 驗證基準 (DoD)
- [x] 主頁面無大型灰色簡介區塊。
- [x] 出題原則按鈕成功嵌入在副標題（年級資訊）右側。
- [x] 按鈕樣式符合極簡、輕量化規範（Amber 色系）。
- [x] 點擊後 Drawer 正常滑出。
- [x] 產出專屬完工報告。

## 完工連結
- [完工報告：JOB-047-Report.md](./JOB-047-Report.md)
