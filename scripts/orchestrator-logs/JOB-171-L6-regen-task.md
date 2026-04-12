# JOB-171 L6 重產任務說明

`created`: 2026-04-11
`executor`: Cursor（Claude Code 派工）

## 任務目標

南一 G4S2 社會 L6《想像家鄉的樣子》題庫全部重產，達到 is_publishable ≥ 25

## 問題背景

原有 30 題中：
- 12 題 blind_eval_mismatch（answer_index 指向錯誤選項，如「砍除老樹改設光雕」）
- 11 題 is_publishable=false（其中 phase3 未再跑 + CQI 不足）
- 7 題 is_publishable=true

根本原因：題目產出時 answer_index 就已錯誤（非 auto_balance 問題）

## 執行步驟（依序執行，勿跳步）

### Step 1: 重產 L6（清空全部題目後生成 30 題新題）

```bash
node scripts/auto_generate_questions.js question/platform/G4/SocialStudies/S2/NanYi --pattern "L6" --threshold 10 --conservative --model gemini-3.1-flash-lite --qpm 1.5
```

- `--threshold 10` 會將所有現有題目（CQI < 10 = 全部）清除
- `--pattern "L6"` 只處理 G4_S2_SOC_NANYI_L6.json
- KL4 研究素材：`knowledge/課綱研究/社會/四下/南一/KL4_四下_南一_L6_想像家鄉的樣子_單課研究紀錄.md`
- 使用免費 key（ApiKeys.cfg 中 GEMINI_API_KEY_YOTTA_EIDOS_FREE 或 MIAW_EIDOS_FREE）

### Step 2: 評估品質（確認 CQI-P 分布）

```bash
node scripts/evaluate_question_quality.js question/platform/G4/SocialStudies/S2/NanYi/G4_S2_SOC_NANYI_L6.json
```

確認目標：avgCqi ≥ 5.5，各題 cqi_score 已寫入 JSON

### Step 3: 打散選項（避免 BIAS）

```bash
node scripts/auto_balance_json.js question/platform/G4/SocialStudies/S2/NanYi/G4_S2_SOC_NANYI_L6.json
```

### Step 4: 重跑盲測

```bash
node scripts/run_blind_eval.js question/platform/G4/SocialStudies/S2/NanYi/G4_S2_SOC_NANYI_L6.json --force
```

- `--force` 確保全部重新評估（不跳過已有 blind_evaluation=true 的題目）

### Step 5: 更新 is_publishable

```bash
node scripts/job171_phase3_g4s2_social_publish.js
```

## 驗收標準

- [ ] L6 is_publishable ≥ 25 題
- [ ] avgCqi ≥ 5.5
- [ ] 無 TYPE-B mismatch（answer_index 指向明顯錯誤選項）
- [ ] 確認 answer_index 對應選項為正確答案（人工抽查 5 題）

## 完成後回報

將以下結果貼回對話：
1. Step 1 完成時間與題數
2. Step 4 盲測結果（Match / Mismatch 數）
3. Step 5 is_publishable 最終數值

若盲測 Match Rate < 70%（< 21 Match），停止並回報原因，等待 PM 裁定。
