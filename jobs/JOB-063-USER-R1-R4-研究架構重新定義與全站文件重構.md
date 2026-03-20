# JOB-063：R1-R4 研究架構重新定義與全站文件重構

**派工來源**：USER
**優先級**：高
**建立時間**：2026-03-20 10:00
**完成時間**：2026-03-20 10:40
**狀態**：🟢 DONE

---

## 一、任務摘要
依據使用者對 R1-R4 研究深度層次的重新定義，全面重構專案內部研究文件、網站外部說明與 AI 專家說系統。

## 二、驗收標準 (Definition of Done)
- [x] R1-R4 新定義：R1=全國小總體/R2=分科總體/R3=分年級個別研究/R4=分學期細節材料
- [x] `README_課程研究方法與準則.md` 升級至 v7.0.0，Mermaid 圖重構
- [x] 全站「原始研究素材庫」R3 標記更新（grep 驗證 0 殘留）
- [x] `docs/進度彙整_課綱課程研究.md` 精修（出版社區隔/版本號/完成時間）
- [x] `AboutView.tsx` 四層說明重寫（第三層加強視覺強調）
- [x] `subjectPrincipleContent.ts` 為 G4-G6 共 15 組年級×科目新增 AI 專家說

## 三、交付成果
| 項目 | 對應檔案 |
|:---|:---|
| 內部架構定義 | `knowledge/README_課程研究方法與準則.md` v7.0.0 |
| 進度彙整表 | `docs/進度彙整_課綱課程研究.md` |
| 網站四層說明 | `apps/v3_eidos/src/components/AboutView.tsx` |
| AI 專家說文案 | `apps/v3_eidos/src/data/subjectPrincipleContent.ts` |
| 研究素材標記 | 8 個 `*_原始研究素材庫.md` 文件 |

---
*完工人: Antigravity*
