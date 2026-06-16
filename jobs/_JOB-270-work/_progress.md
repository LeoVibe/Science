# JOB-270 進度總表（2026-06-16）

## 馬車後半實測結果（300題 _new 草稿）
| 課 | 盲測Match | 對應考點 | 過全閘 | codex需補 | 備註 |
|:--:|:--:|:--:|:--:|:--:|:--|
| L1 | 50/50 100% | 40 | 40 | 10 | 正常 |
| L2 | 47/50 94% | 45 | 42 | 8 | 正常 |
| L3 | 49/50 98% | 39 | 38 | 12 | 正常 |
| L4 | 49/50 98% | 12 | 12 | 38 | ⚠️整課跑題→共享運輸系統，非「生活與工作轉變」 |
| L5 | 48/50 96% | 48 | 46 | 4 | 正常 |
| L6 | 49/50 98% | 3 | 3 | 47 | ⚠️整課跑題→交通安全，非「小小街道觀察家」(JOB-268同問題重演) |
| 合計 | 高 | 181 | 181 | **約119** | |

## 已完成
- 全6課 _new 正解位置 idx%4 機械循環 → 已打散修復
- 全6課 雙盲盲測（sonnet vs 出題gpt-5.5）：Match 94-100%，題目可作答自洽
- 全6課 對應考點 judge（各自抽KL4考點清單，存於 L{N}_judge_result.json）

## 執行進度（2026-06-16 續）
- ✅ **L1 codex 補題 pilot 成功**：補10題，考點分布 K01×2/K02×2/K03×2/K04×2/K05×1/K06×1，平均覆蓋全考點、無跑題、欄位完整、誘答合理。契約式出題有效。
- 🔄 **L2-L6 codex 補題背景串行中**（bnk2xu12j）：L2+8/L3+12/L4+38/L5+4/L6+47，產出至 L{N}_codex_supplement.json。
- 決策：使用者選「全補齊再一起上」（6課≥50一起上架）。

## codex 補題完成後的接續步驟（待續）
1. 合併各課 supplement 到 _new（去掉原不對應題、併入補題）
2. 補題也要過馬車：打散 → 盲測(sonnet) → 對應judge → 確認對應+Match
3. 各課集滿 ≥50 過閘題 → 升 QL4、is_publishable=true
4. 主檔（L1-L6.json）以過閘題替換；原主檔舊題（含JOB-268降級94題）is_publishable=false 撤下
5. 重生成 libraryStats（src+public）+ manifest + audit_rm_vs_ql.mjs 全庫稽核
6. push 部署 + JOB-270 Report + /pj_sync + Discord 結案回報

## 模型分工
- 出題/補題：codex (gpt-5.5)
- 盲測：claude-sonnet-4-6（雙盲，≠出題模型；不用 gemini）
- 對應judge：claude sonnet

## 各課考點清單來源
jobs/_JOB-270-work/L{N}_judge_result.json 的 kaodian 欄位（L1 見 L1_kaodian.json）
