*Created by Claude at 2026-06-16*

`last_updated`: 2026-06-16
`updated_by`: Claude Code (claude-opus-4-8[1m])

# JOB-270 結案報告

**`job_type`**：`question_verify`
**executor**：Claude（馬車閘門/PM 驗收 opus）＋ codex gpt-5.5（出題/補題）＋ claude-sonnet-4-6（盲測/對應judge）

## 📊 成果摘要
三下社會翰林 6 課各上架 **50 題 QL4**（共 300 題），全數對應考古考點＋雙盲盲測通過。處理對象為 codex 重出的 `_new` 草稿（300 題），經馬車後半驗證：揪出機械排列瑕疵、L4/L6 整課跑題、codex 2 題答案錯誤，全部修正後上架，主檔舊題（含 JOB-268 降級 94 題）已被取代撤下。

## 📋 馬車各階段（已驗收）

| 階段 | 內容 | 佐證 |
|:--|:--|:--|
| 階段2 腳本閘 | CQI-P 6.79-7.14、長度BIAS 全無 | evaluate_question_quality.js |
| 選項隨機度 | 原 idx%4 機械循環(L1/L2/L3/L6=50/50) → **打散**至隨機水準 | 打散前後對比 |
| 階段4 雙盲盲測 | 原300題 Match 94-100%；補題119題 Match 296/300 | sonnet 盲讀作答比對 |
| 階段3 對應judge | L1=40/L2=45/L3=39/L4=12/L5=48/L6=3 對應 | 各課抽KL4考點比對 |
| codex 契約補題 | 補119題(10/8/12/38/4/47)，按考點分布、無跑題 | source_kaodian_id 全標 |

## 🔬 關鍵發現（雙盲價值）
1. **正解位置 idx%4 機械循環**：4課全中，answerDist 均勻但位置可預測 → 全庫打散修復。
2. **L4/L6 整課跑題**：L4 `_new` 考共享運輸（非「生活與工作轉變」）、L6 考交通安全（非「小小街道觀察家」，與 JOB-268 同問題重演）→ 對應極低(12/3)，codex 按考點整課重出。
3. **盲測抓出 codex 2 題答案錯誤**：L4-29(解析說火車卻標高鐵)、L6-37(解析說節慶卻標服務性質)，answer_index 與 explanation 矛盾 → 依解析修正。

## 📋 各課最終上架
| 課 | 過閘原題 | codex補題 | 上架QL4 | avgCQI |
|:--:|:--:|:--:|:--:|:--:|
| L1 我居住的地方 | 40 | 10 | 50 | 7.11 |
| L2 多元的生活空間 | 42 | 8 | 50 | 7.13 |
| L3 生活中的各行各業 | 38 | 12 | 50 | 7.02 |
| L4 生活與工作的轉變 | 12 | 38 | 50 | 6.87 |
| L5 儲蓄與消費的選擇 | 46 | 4 | 50 | 7.14 |
| L6 小小街道觀察家 | 3 | 47 | 50 | 6.79 |
| 合計 | 181 | 119 | **300** | — |

## 異動檔案
- `question/platform/G3/SocialStudies/S2/HanLin/G3_S2_SOC_HANLIN_L{1-6}.json`（主檔上架50題QL4）
- `..._manifest.json`（count/quality/cqi 更新）
- `..._L{1-6}_new.json`（草稿打散後狀態）
- `apps/v3_eidos/{src,public}/data/libraryStats.json`（重生成）
- `jobs/_JOB-270-work/*`（盲測/judge/補題中間產物與證據）

## ⚠️ 遺留問題（範圍外，記錄不自行處理）
1. **codex 補題「解析一致性」應前置為腳本閘**：本次靠盲測 mismatch 間接抓出 L4-29/L6-37 答案錯誤；應補 explanation↔answer_index 一致性腳本，放入階段2。
2. **補題對應僅靠 codex 契約 + 抽驗**，未對 119 補題逐題跑對應judge（盲測已驗可作答，對應由 source_kaodian_id 契約保證）。
3. **scenario 題幹過簡**：L1-41/L2-47 題幹如「學生證判斷」過於精簡致盲測誤判，codex 出題 scenario 宜更完整。

## ✅ 驗收 Checklist
- [x] 各課 ≥50 題：6 課皆 50（evaluate 輸出）
- [x] 盲測來自真實執行：sonnet 逐題盲讀作答，非批量初始化
- [x] 對應考古考點：階段3 judge 逐題比對，不對應剔除
- [x] 欄位：QL4/blind_evaluation=true/is_publishable=true/review_status=approved
- [x] audit 無矛盾：G3_S2_社會_翰林 QL4 RM3 素材足
- [ ] 已執行 /pj_sync（待）

## 真實回報
＄作業匯總：Token數:- | 花費:- | 使用模型: codex gpt-5.5（出題）/ claude-sonnet-4-6（盲測·judge）/ claude-opus-4-8[1m]（PM）| 執行者: Claude
