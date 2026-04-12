`last_updated`: 2026-03-29 15:35  
`updated_by`: Cursor Agent  

# JOB-124 Report

## 交付物

- `scripts/batch_chinese_s2_generate.js`：國語 S2（G3～G6 × HanLin／KangHsuan／NanYi）批次呼叫 `auto_generate_questions.js`；預設先跑 `verify_chinese_kl4_prereq.js`；`--` 後參數原樣轉發。
- `question/README_出題與品管準則.md`：手動工具表增列上列腳本與用法。

## 驗收對照 DoD

- 可列舉至多 12 目錄；`--dry-run` 不呼叫 API。
- 預設 verify 失敗則不產題；`--skip-verify` 可略過（不建議）。
- `--prereq-only` 僅檢查。
- 模型／金鑰由執行者於 `--` 後自行指定，符合 README 透明化原則。

## 建議執行範例（須先取得負責人同意之模型代號）

```bash
cd /Users/s389080/Documents/doc/work/0_AI_Project/eidosProject
node scripts/batch_chinese_s2_generate.js --prereq-only
node scripts/batch_chinese_s2_generate.js --dry-run --skip-verify -- --key Yotta --model gemini-3.1-flash
node scripts/batch_chinese_s2_generate.js -- --key Yotta --model gemini-3.1-flash --qpm 10 --batch 10 --threshold 5.0 --target 30
```

## 備註

全量產題前須 **KL4 雙檔＋課文全文錄製** 對齊各課 JSON；未通過 verify 時應先補研究稿再跑批次。
