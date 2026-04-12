*Created by Claude Code (claude-sonnet-4-6) at 2026-04-09 00:10:00*

`last_updated`: 2026-04-09 00:10:00
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-166-AG-修正盲測R4映射與南一重測

**`job_type`**: `mixed`（engineering + question_verify）
**`executor`**: Cursor
**`verifier`**: Claude Code（PM，Cursor 完成後通知驗收）

---

## 📌 任務背景

JOB-165 盲測發現南一 ai=-1 集中異常：

| 課次 | ai=-1 | 佔比 | 狀態 |
|:--|:--:|:--:|:--|
| L1（最美的模樣） | 10 | 33.3% | 🔴 嚴重 |
| L8（和魚一起游泳） | 3 | 12.0% | 🟠 中等 |
| L2（玩玩具） | 2 | 7.1% | 🟡 輕微 |
| L3（愛玉的變身術） | 2 | 6.7% | 🟡 輕微 |

**根因**：`run_blind_eval.js` 的 R4 映射（第 13 行）指向 `KL3_三下_國語_研究總綱.md`，該檔以翰林為主，不含南一各課課文內容。盲測 AI 缺乏南一課文脈絡，回報「題目設定與課文內容不符」→ `selected_answer: -1`。

但 KL4 單課研究檔已完整存在：
```
knowledge/課綱研究/國語/三下/南一/KL4_三下_南一_L1_最美的模樣_單課研究紀錄.md
knowledge/課綱研究/國語/三下/南一/KL4_三下_南一_L2_玩玩具_單課研究紀錄.md
...（每課皆有）
```

---

## 🎯 任務目標

1. 修正 `run_blind_eval.js` 的 R4 查找邏輯：優先使用 KL4 單課研究檔
2. 南一 L1/L2/L3/L8 四課重跑盲測（`--force`）
3. 確認 ai=-1 數量大幅降低（L1 目標 ≤ 3）

---

## 🚧 任務邊界

**只做：**
- 修正 `run_blind_eval.js` 的 R4 查找邏輯
- 南一四課重跑盲測 + Mismatch 審查
- 更新四課 `review_status`、`is_publishable`

**不做：**
- 其他版本（康軒/翰林）重跑
- 補題或重新出題
- 修改規範文件或 KL 素材
- 修改 CQI-P 分數

---

## 📖 執行步驟

### Phase 1：修正 R4 查找邏輯（engineering）

修改 `scripts/run_blind_eval.js`，在現有 `extractR4Context()` 呼叫前增加 KL4 單課研究檔查找：

**查找規則**：
1. 從題庫 JSON 路徑解析出版社名稱（KangHsuan→康軒、HanLin→翰林、NanYi→南一）
2. 從 JSON 的 `meta.title` 或檔名解析課次（L1, L2...）
3. 查找 `knowledge/課綱研究/國語/三下/{出版社}/KL4_三下_{出版社}_{課次}_{課名}_單課研究紀錄.md`
4. **找到** → 直接用 KL4 內容作為 R4 context（跳過 LLM 萃取，省 API 呼叫）
5. **找不到** → fallback 到現有 KL3 總綱 + LLM 萃取（不改動原有邏輯）

**注意**：
- 此改動必須向後相容，不影響已有的數學/社會/自然等科目的 R4 映射
- KL4 檔案若存在，直接讀取全文作為 context，不需 LLM 再萃取（KL4 已是單課精華）

### Phase 2：南一四課重跑盲測（question_verify）

```bash
node scripts/run_blind_eval.js \
  question/platform/G3/Chinese/S2/NanYi/G3_S2_CHI_NANYI_L1.json \
  question/platform/G3/Chinese/S2/NanYi/G3_S2_CHI_NANYI_L2.json \
  question/platform/G3/Chinese/S2/NanYi/G3_S2_CHI_NANYI_L3.json \
  question/platform/G3/Chinese/S2/NanYi/G3_S2_CHI_NANYI_L8.json \
  --force
```

### Phase 3：Mismatch 審查

依 JOB-165 同規則（TYPE-A/B/C），重跑後仍存在的 Mismatch 逐題審查。

### Phase 4：驗證

- 比對重跑前後 ai=-1 數量（須列表）
- 確認四課 `is_publishable: true` ≥ 25

---

## 📖 執行前必讀

| 文件 | 用途 |
|:--|:--|
| `question/README_驗證與盲測準則.md`（v4.2） | 盲測流程、Mismatch 分類 |
| `scripts/run_blind_eval.js` | 現有 R4 映射邏輯 |
| `jobs/JOB-165-Report.md` | JOB-165 結果與 ai=-1 分布 |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [ ] 已讀取 `question/README_驗證與盲測準則.md`（v4.2）
- [ ] 已讀取 `scripts/run_blind_eval.js`，定位 R4 映射邏輯
- [ ] 已確認 KL4 單課研究檔存在（`knowledge/課綱研究/國語/三下/南一/` 下 L1-L8）
- [ ] **Cursor 作業模型**：`composer-2`（已核准）
- [ ] **盲測 API 模型**：`gemini-3-flash-lite`（已核准）

---

## ✅ 驗收 Checklist (Acceptance)

> 每項須填入實際數值，Claude Code（PM）核對。

- [ ] R4 查找邏輯修正完成 — 佐證：貼出修改的關鍵程式碼段
- [ ] 向後相容驗證 — 佐證：其他科目 R4 映射不受影響（說明或測試）
- [ ] 重跑前後 ai=-1 對照：

| 課次 | 重跑前 ai=-1 | 重跑後 ai=-1 |
|:--|:--:|:--:|
| L1 | 10 | ___ |
| L2 | 2 | ___ |
| L3 | 2 | ___ |
| L8 | 3 | ___ |

- [ ] 四課 `is_publishable: true` ≥ 25 維持 — 佐證：各課 is_pub 題數
- [ ] TYPE-B 比例 ≤ 5%
- [ ] 新產生的 Mismatch 已分類（TYPE-A/B/C）

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 產出 `jobs/JOB-166-Report.md`（含前後對照表、程式異動清單）
- [ ] 執行 `/pj_sync`
- [ ] 執行 `node scripts/job_manager.js close JOB-166`
- [ ] 通知 Claude Code（PM）驗收

---

## ⏱️ 執行時間回報

| 子任務 | 開始 | 結束 | 耗時 | 備註 |
|:--|:--|:--|:--|:--|
| R4 邏輯修正 | HH:mm | HH:mm | - | |
| 南一四課重跑 | HH:mm | HH:mm | - | |
| Mismatch 審查 | HH:mm | HH:mm | - | |
| **總計** | — | — | **-** | — |

## 真實回報本次對話的模型與花費
＄作業匯總：Token數:{真實Meta中數字} | 花費: ${換算台幣} | 使用模型: composer-2 / gemini-3-flash-lite | 執行者: Cursor
