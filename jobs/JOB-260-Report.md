*Created by Claude at 2026-06-14 14:20*

`last_updated`: 2026-06-14 14:20
`updated_by`: Claude Code (claude-opus-4-8[1m])

# JOB-260 結案報告

**`job_type`**：`docs_ops`
**`executor`**：Claude

## 📊 成果摘要
依三軸定義 spec，逐檔對齊 7 份準則文件：上架由「只 QL4」改為「QL4 正式／QL3 BETA」兩級、明訂 is_publishable 為獨立上架閘門（可單題下架）、釐清 RM 是素材潛力（≠最終品質）、CQI 定位為內部分數。對外 QL1–QL5 定義表零改動（grep diff 確認）。定義集中於驗證盲測準則 §4（唯一真相），其餘文件指過去看。

## 📂 異動清單
| 檔案 | 改了什麼 |
|:--|:--|
| `question/README_驗證與盲測準則.md` | §4.6 上架兩級制 + 統計禁灌水 + is_publishable 獨立閘門；§2.5 補「QL3 可 BETA 上架」「特殊問題單題下架」「未達 QL3 不上」 |
| `knowledge/README_研究架構總綱.md` | RM 表後補「素材潛力≠最終品質、RM 與 QL 兩條獨立軸」 |
| `question/README_出題與品管準則.md` | 第一章補 CQI 定位（內部流程分數、不對外、不定義 QL） |
| `README.md` | §四流水線「QL 上架」改兩級（§五 QL1-5 不動） |
| `CLAUDE.md` | §四補「上架以 is_publishable 為準，盲測過≠一定上架」 |
| `docs/網站功能規格書.md` | §2.2.1 補「QL4＝正式／QL3＝BETA／QL2 以下不上」 |
| `docs/README_產品介紹.md` | 第四層補上架白話（BETA 提供並標示）；QL 表不動 |

## ✅ Checklist 對照
- [x] 7 份全部對齊，grep 命中：驗證盲測 4、研究總綱 1、出題 1、README 1、CLAUDE 1、網站 1、產品 1
- [x] 對外 QL1-5 定義表零改動（git diff 僅命中 §四流水線描述行，非 §五定義表）
- [x] 唯一真相原則：定義集中 §4，其他指連結

## 🔄 同步確認
- [x] 已執行 /pj_sync 全域知識沉澱（2026-06-14）
- [x] `docs/README_專案發展紀錄.md` 已新增 JOB-260

## ⚠️ 遺留問題
1. **程式落實未做（另開單）**：「QL3 題回寫 is_publishable=true 標 BETA」讓 QL3 實際上線，需 question_verify/engineering JOB。目前準則已允許，但題庫資料尚未回寫，故 QL3 題實際仍未上架。
2. generate_library_stats 統計對齊已於 JOB-258 完成。

## 🔧 技術筆記
- 研究總綱原本就有「RM→QL 天花板關係」表述，方向正確，只需補強「潛力≠品質、兩條獨立軸」。
- 改準則最敏感是上架定義（§4.6），由單級改兩級，連動 §2.5 判定表（移除「未跑盲測一律 false」，改為「QL3 可 BETA 上」）。

## 🔍 驗收確認
| 欄位 | 內容 |
|:--|:--|
| 驗收者 | （待 user 填寫） |
| 驗收結果 | 待驗收 |

## 真實回報
＄作業匯總：Token數:- | 花費: - | 使用模型: claude-opus-4-8[1m] | 執行者: Claude
