# JOB-252 Report：三下社會題庫重出（staged，待盲測決策）

`last_updated`: 2026-06-14
`updated_by`: Claude Code (claude-opus-4-8)

---

## 1. 任務摘要

| 欄位 | 內容 |
|:--|:--|
| JOB | JOB-252（job_type: question_prod）|
| 任務 | 社會科三下翰林6+康軒6+南一5=17課各50題重出 |
| 執行者 | Codex CLI gpt-5.5（訂閱制）＋ Claude Code（驗收）|
| 金鑰 | 訂閱制，全程未用任何 API key |
| 完成 | 2026-06-14 |

---

## 2. 成果：17 課 850 題（staged）

全 17 課各 50 題，共 **850 題**，全部 QL3、無 BIAS、零重複、authoring_model=gpt-5.5。

| 版本 | 課數 | avgCqi 範圍 |
|:--|:--|:--|
| 翰林 L1-L6 | 6 | 7.17-7.20 |
| 康軒 L1-L6 | 6 | 7.02-7.20 |
| 南一 L1-L5 | 5 | 7.14-7.20 |

題目連結在地生活情境（戶口名簿/門牌/消費/家鄉地名故事等），符合社會科守則。

---

## 3. ⚠️ staged 策略（未覆蓋正式檔）

依 advisor 指引：自然重出時直接覆蓋正式檔，導致已上架 QL4 變未盲測不可上架 QL3。社會出題**全部輸出 staged `_new.json`，未覆蓋正式檔**：
- 社會現有上架 QL4 題庫完好（前台正常顯示）
- 850 題 staged 待使用者盲測決策後，再覆蓋正式檔 + 盲測升 QL4 + 更版上架

本 JOB **未動任何正式題庫檔、未動 manifest**。

---

## 4. 技術事件：3 課 timeout 補跑

- HANLIN_L5、KANGHSUAN_L4、NANYI_L4 首次出題時 codex 網路重連（Reconnecting）卡住，被 timeout 900s 攔截（exit 124）
- 序列補跑（不並行）全部成功，各 50 題
- timeout 機制有效防止無限 hang

---

## 5. 異動清單

- `question/platform/G3/SocialStudies/S2/{HanLin,KangHsuan,NanYi}/G3_S2_SOC_*_L*_new.json`（17 檔 staged，**非正式檔**）
- `scripts/jobs/JOB-252/`（gen_prompts.py、dispatch.sh、_prompts/、_logs/）
- **未異動**：任何正式題庫 JSON、manifest

---

## 6. 結案 Checklist

- [x] README_專案發展紀錄已觸發 /pj_sync（JOB-252 記錄新增）
- [x] /pj_sync 已執行

---

## 7. 驗收 Checklist 對照

- [x] 17 課各 50 題（共 850 題，staged）── 實測
- [x] 各課 CQI-P ≥ 5.5（7.02-7.20）── 實測
- [x] 無 BIAS、無重複 ── biasWarning=null、重複 0
- [x] staged 未覆蓋正式檔 ── 社會現有 QL4 完好

---

## 8. 後續（待使用者決策）

850 題 staged，需使用者決策後續：盲測模型 → 盲測升 QL4 → 覆蓋正式檔 → 更版上架。同自然 600 題的盲測 gap。

---

## 9. 模型與成本

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: Codex gpt-5.5（訂閱制）+ claude-opus-4-8 | 執行者: AG + Claude Code
