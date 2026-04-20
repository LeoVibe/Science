---
name: Manifest title 多源衝突清單
description: JOB-205 補登階段偵測到的 title 衝突（素材庫 vs 現有值）
type: audit
---

`last_updated`: 2026-04-20 11:47:43
`來源 JOB`: JOB-205 補登階段

# Manifest title 多源衝突清單

共 **19** 筆衝突，由 `scripts/job205_sync_title_from_materials.mjs` 偵測。

| Manifest | Lesson | 現有值（來源）| 素材庫值 | 處置 | 備註 |
|:--|:--:|:--|:--|:--|:--|
| question/platform/G6/Math/S2/KangHsuan/G6_S2_MATH_KANGHSUAN_manifest.json | L2 | "速率的應用" | "速率" | keep_current | — |
| question/platform/G6/Math/S2/KangHsuan/G6_S2_MATH_KANGHSUAN_manifest.json | L3 | "柱體體積與表面積" | "形體關係、體積與表面積" | keep_current | — |
| question/platform/G6/Math/S2/HanLin/G6_S2_MATH_HANLIN_manifest.json | L2 | "圓面積與扇形面積" | "速率" | keep_current | — |
| question/platform/G6/Math/S2/HanLin/G6_S2_MATH_HANLIN_manifest.json | L3 | "速率" | "基準量與比較量" | keep_current | — |
| question/platform/G6/Math/S2/HanLin/G6_S2_MATH_HANLIN_manifest.json | L3 | "速率" | "基準量與比較量" | keep_current | — |
| question/platform/G6/Math/S2/NanYi/G6_S2_MATH_NANYI_manifest.json | L2 | "柱體的體積和表面積" | "柱體的體積" | keep_current | — |
| question/platform/G6/Math/S2/NanYi/G6_S2_MATH_NANYI_manifest.json | L3 | "怎樣解題" | "基準量和比較量" | keep_current | — |
| question/platform/G5/Math/S2/KangHsuan/G5_S2_MATH_KANGHSUAN_manifest.json | L5 | "整數小數除以整數" | "數的十進位" | keep_current | G5 Math 回溯：當前為 KL4 檔名版 |
| question/platform/G5/Math/S2/KangHsuan/G5_S2_MATH_KANGHSUAN_manifest.json | L6 | "扇形" | "數、小數除以整數" | keep_current | G5 Math 回溯：當前為 KL4 檔名版 |
| question/platform/G5/Math/S2/KangHsuan/G5_S2_MATH_KANGHSUAN_manifest.json | L9 | "時間的乘除" | "容積與重量" | keep_current | G5 Math 回溯：當前為 KL4 檔名版 |
| question/platform/G5/Math/S2/KangHsuan/G5_S2_MATH_KANGHSUAN_manifest.json | L10 | "生活中的大單位" | "數量關係" | keep_current | G5 Math 回溯：當前為 KL4 檔名版 |
| question/platform/G5/Math/S2/HanLin/G5_S2_MATH_HANLIN_manifest.json | L2 | "分數的乘法" | "分數的計算" | keep_current | G5 Math 回溯：當前為 KL4 檔名版 |
| question/platform/G5/Math/S2/HanLin/G5_S2_MATH_HANLIN_manifest.json | L3 | "長方體與正方體的體積" | "長/正方體體積" | keep_current | G5 Math 回溯：當前為 KL4 檔名版 |
| question/platform/G5/Math/S2/HanLin/G5_S2_MATH_HANLIN_manifest.json | L4 | "小數的乘法" | "小數 (加減乘除概念)" | keep_current | G5 Math 回溯：當前為 KL4 檔名版 |
| question/platform/G5/Math/S2/HanLin/G5_S2_MATH_HANLIN_manifest.json | L5 | "整數小數除以整數" | "多邊形與扇形" | keep_current | G5 Math 回溯：當前為 KL4 檔名版 |
| question/platform/G5/Math/S2/NanYi/G5_S2_MATH_NANYI_manifest.json | L4 | "長方體和正方體" | "體積" | keep_current | G5 Math 回溯：當前為 KL4 檔名版 |
| question/platform/G5/Math/S2/NanYi/G5_S2_MATH_NANYI_manifest.json | L5 | "整數小數除以整數" | "數、小數除以整數" | keep_current | G5 Math 回溯：當前為 KL4 檔名版 |
| question/platform/G5/Math/S2/NanYi/G5_S2_MATH_NANYI_manifest.json | L7 | "柱體錐體和球體" | "柱/錐/球體" | keep_current | G5 Math 回溯：當前為 KL4 檔名版 |
| question/platform/G5/Math/S2/NanYi/G5_S2_MATH_NANYI_manifest.json | L10 | "長條圖和折線圖" | "折線圖" | keep_current | G5 Math 回溯：當前為 KL4 檔名版 |

## 處置策略說明

- `keep_current`：當前 manifest 值來自 KL4 檔名或其他可信源，保留不動；素材庫待人工核對。
- 若需改動：請人工裁決後手動更新 manifest + 素材庫，並從本清單移除對應列。
