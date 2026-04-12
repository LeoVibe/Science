# JOB-184-Report — G5S2 社會三版本出題（CQI-P）

`last_updated`: 2026-04-12  
`updated_by`: Cursor Agent（執行模型：與本對話相同之 Cursor 內建模型）

---

## 執行摘要

| 項目 | 狀態 |
|:--|:--|
| 派工單 | `jobs/JOB-184-AG-AG-G5S2-社會-三版本出題.md` |
| 目標 | 16 課 × 40–50 題，CQI-P ≥ 5.5，KL4 對齊 |
| **本輪完成度** | **部分完成**：產題管線與檔案結構已就緒；**大量 AI 產題因 Gemini API 429 未能於本環境跑完** |

---

## 已完成項目

1. **`scripts/auto_generate_questions.js`**
   - 新增 `KNOWLEDGE_SOCIAL_G5S2`（`knowledge/課綱研究/社會/五下`）。
   - `loadSocialKl4StudyText`：依 `meta.grade` 區分四下／五下，前綴 `KL4_五下_*`／`KL4_四下_*`；併入同課「考古題與討論」摘要（截斷上限，禁止抄題之提示仍於使用者提示維持）。
   - `isElementaryS2SocialStudiesMcq`：G4／G5 下學期社會皆走四選一清洗、`normalizeScienceGeneratedQuestion`、社會強制提示詞。
   - **G5 社會 S2**：`callLLM` system 改為高年級認知配比文字；使用者提示加註 G5 配題比例。
2. **題庫檔案與 manifest**
   - 新建：`HanLin` L5、L6；`KangHsuan` L5；`NanYi` L5（`questions: []` 占位）。
   - **刪除**誤植且與本派工 16 課不符之 `G5_S2_SOC_HANLIN_L7.json`（原「臺灣為什麼能走向民主社會？」等與翰林 G5 下六課表不一致）。
   - 更新三版本 manifest 課名、補列 L5/L6（翰林）；各課 `meta.title` 與派工單課名對齊。
3. **品管基線**
   - `node scripts/evaluate_question_quality.js question/platform/G5/SocialStudies/S2`：共 **13** 題（有題之 13 檔），**QL3** 12 題、其餘為空檔占位；有題者平均 CQI 約 **6.0–7.5**（滿足派工 CQI-P ≥ 5.5 之**現有**題組）。
   - `node scripts/generate_library_stats.js` 已執行。
4. **文件**
   - `docs/進度彙整_題庫研發與產出.md`：G5S2 社會列更新題數（康 4／翰 5／南 4）、備註 JOB-184 與後續待跑產題。

---

## 未完成／待續作（須本機或額度恢復後）

| 驗收項 | 說明 |
|:--|:--|
| 每課 40–50 題 | 目前多數課次仍僅 0–2 題；須跑批次 `auto_generate_questions.js` |
| 全課 CQI-P ≥ 5.5 | 新產題後須重跑 `evaluate_question_quality.js`，低分課次搭配 `auto_balance_json.js` 與刪除／重塑循環 |
| `validate_review_fields.js` → 0 errors | 建議於全量產題並寫入欄位後對 `question/platform/G5/SocialStudies/S2` 單獨抽檢或擴充腳本參數後全跑 |

### 建議續跑指令（節流、降 429）

於專案根目錄、ApiKeys.cfg 可用時：

```bash
node scripts/auto_generate_questions.js question/platform/G5/SocialStudies/S2 \
  --target 45 --conservative --key Yotta --model gemini-2.0-flash \
  --threshold 5.5 --batch 2 --qpm 2
```

完成後依序：

```bash
node scripts/evaluate_question_quality.js question/platform/G5/SocialStudies/S2
node scripts/auto_balance_json.js question/platform/G5/SocialStudies/S2/HanLin
# （康軒、南一各目錄同理）
node scripts/validate_review_fields.js
```

並手動更新三份 `G5_S2_SOC_*_manifest.json` 之 `count`／`avg_cqi`（或撰寫小腳本自評分結果回寫）。

---

## 異動清單（路徑）

- 修改：`scripts/auto_generate_questions.js`
- 新增：`question/platform/G5/SocialStudies/S2/HanLin/G5_S2_SOC_HANLIN_L5.json`、`…_L6.json`
- 新增：`…/KangHsuan/G5_S2_SOC_KANGHSUAN_L5.json`、`…/NanYi/G5_S2_SOC_NANYI_L5.json`
- 刪除：`question/platform/G5/SocialStudies/S2/HanLin/G5_S2_SOC_HANLIN_L7.json`
- 修改：上述目錄內多數既有 JSON 之 `meta.title`、三份 manifest、`docs/進度彙整_題庫研發與產出.md`

---

## 真實模型與花費

- **使用模型**：與 Cursor 對話相同之內建模型（報告撰寫）；產題腳本設定為 `gemini-2.0-flash` 時遭遇 **429**，未產出有效新題。
- **Token／台幣花費**：未提供（`-`）

---

## 遺留問題

1. 派工路徑寫 `question/platform/G5/Social/S2/`，全站實際為 **`SocialStudies`**；已依實際目錄執行。
2. Discord 結案摘要：本環境未送出；請 PM 依 `docs/README_任務派工準則.md` 手動補登。
