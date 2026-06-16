*Created by Claude Code (claude-sonnet-4-6) at 2026-06-16*

`last_updated`: 2026-06-16
`updated_by`: Claude Code (claude-sonnet-4-6)

# JOB-269-AG-三下國語翰林L1-L2-L3-L4-L6-L7-L9-L12文本錯位補題

**`job_type`**: `question_prod`  
**`executor`**: AG（Codex 訂閱制出題 → Claude subagent 九步校正）

---

## 📌 任務背景

JOB-266 九步校正揭露：三下國語翰林 12 課中有 8 課存在系統性文本錯位（出題時對錯課文），
共 178/350 題標記 is_publishable=false（含 L2 全課 30/30 錯位）。
文本錯位題無法靠校正修復，唯有重出。

| 課 | 課名 | 錯位描述 | 現 is_publishable |
|:--|:--|:--|:--:|
| L1 | 拔不起來的筆 | 題目指向彩色筆故事而非王羲之書法 | 5 |
| L2 | 還差一點 | 全課對應探險者之眼/《既然》 | 0 |
| L3 | 用膝蓋跳舞的女孩 | 題目指向盆栽養分/廚巾 | 11 |
| L4 | 靜靜的淡水河 | 題目指向《下面有什麼？》 | 2 |
| L6 | 月世界之旅 | 題目指向《蟬》 | 6 |
| L7 | 做泡菜 | 題目指向《鴨子下蛋》 | 19 |
| L9 | 就愛倆倆在一起 | 題目指向鹿港主題 | 8 |
| L12 | 掉進一個兔子洞 | 題目指向噴水池/許願/老婆婆 | 11 |

---

## 🎯 任務目標

重出 8 課乾淨題庫，使每課達到 ≥30 題 is_publishable=true。

---

## 🚧 任務邊界

本次任務只做：
- Phase 1：Codex 訂閱制出題（每課 35 題 → `_new.json`）
- Phase 2：Claude subagent 九步校正（8 課）
- Phase 3：驗收通過（approved ≥ 30）後覆蓋正式 JSON

本次任務不做：
- 修改 L5/L8/L10/L11（已通過九步校正，已達標）
- 修改任何規範文件
- 盲測驗收（另開 `question_verify` JOB）

---

## 📖 執行步驟

### Phase 1：Codex 出題（串行）

```bash
cd /path/to/eidosProject
bash scripts/jobs/JOB-269/dispatch_phase1.sh 2>&1 | tee scripts/jobs/JOB-269/_logs/full.log
```

- 每課 prompt 在 `scripts/jobs/JOB-269/_prompts/HANLIN_{L}.txt`
- 輸出：`question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_{L}_new.json`（35 題）
- 限額偵測：遇 `reached your usage limit` → exit 2，停止
- Log：`scripts/jobs/JOB-269/_logs/phase1_{L}.log`

### Phase 2：Claude subagent 九步校正（8 課）

Phase 1 全課生成後，對每課 `_new.json` 執行九步校正（參考 `docs/盲測校正九步流程.md`）。

PM 動作：
1. 確認各 `_new.json` 存在且題數 ≥ 30
2. 對 8 課並行 dispatch 九步校正 subagent（每課一個 agent）
3. 各 subagent 回報：approved 數 / BIAS 比例 / pending_reason 摘要

### Phase 3：驗收與覆蓋

```bash
python3 scripts/jobs/JOB-269/merge.py
```

- 門檻：approved ≥ 30 且 BIAS ≤ 40% 才覆蓋正式檔
- 不達標的課次記入遺留問題，建議重跑 Phase 1

---

## 📜 關鍵參考檔案

| 檔案路徑 | 用途 |
|:--|:--|
| `question/README_出題與品管準則.md` | CQI-P 規格、JSON 格式 |
| `knowledge/1_課綱研究/國語/三下/翰林/` | 8 課 KL4 素材（單課研究紀錄 + 考古題與討論） |
| `docs/盲測校正九步流程.md` | 九步校正流程與 subagent prompt 模板 |
| `docs/superpowers/specs/2026-06-16-三下國語翰林補題-design.md` | 本 JOB 設計文件 |
| `scripts/jobs/JOB-269/dispatch_phase1.sh` | Phase 1 Codex 串行 dispatch |
| `scripts/jobs/JOB-269/merge.py` | Phase 3 覆蓋腳本 |

---

## ✅ 啟動 Checklist (Pre-Flight)

- [x] 已讀取 `question/README_出題與品管準則.md`
- [x] 8 課 KL4 素材確認存在：`knowledge/1_課綱研究/國語/三下/翰林/KL4_三下_翰林_L{1,2,3,4,6,7,9,12}_*`
- [x] **已確認執行模型**：Phase 1 = Codex gpt-4o（訂閱制）；Phase 2 = Claude Sonnet 4.6
- [x] **已確認訂閱制**：`unset ANTHROPIC_API_KEY GEMINI_API_KEY` 已寫入 dispatch_phase1.sh
- [x] **已確認 QPM**：Codex 訂閱制，無 QPM 限制（有限額偵測機制）
- [x] 目標題數確認：8 課 × 35 題 = 280 題（buffer，最終取 approved ≥ 30 覆蓋）
- [x] Prompt 生成完畢：8 課 txt 已存入 `scripts/jobs/JOB-269/_prompts/`

---

## ✅ 驗收 Checklist (Acceptance)

- [ ] 8 課各有 ≥30 is_publishable=true — 實際值：{填入各課 approved 數}
- [ ] 無文本錯位（九步步驟3 課文引用通過）— 佐證：subagent 回報
- [ ] BIAS ≤ 40% per 課 — 實際值：{填入各課 BIAS}
- [ ] 全部 review_status=approved — 腳本統計確認
- [ ] 正式 JSON 已覆蓋（merge.py 輸出 OK）
- [ ] `answer_index` 與 `explanation` 描述一致

---

## ✅ 成果 Checklist (Deliverables)

- [ ] 成果表格填寫完畢（課名 / 模型 / approved 數 / BIAS）
- [ ] 進度總表 `docs/進度彙整_題庫研發與產出.md` 已更新
- [ ] 已執行 `/pj_sync`
- [ ] 產出 `jobs/JOB-269-Report.md`，異動清單含所有修改 JSON 路徑
- [ ] Discord 結案回報（`#eidos_派工與回報`）

---

## 📊 成果預期

| 課 | 課名 | 目前 is_publishable | 補題後目標 | 實際達成 |
|:--|:--|:--:|:--:|:--:|
| L1 | 拔不起來的筆 | 5 | ≥30 | — |
| L2 | 還差一點 | 0 | ≥30 | — |
| L3 | 用膝蓋跳舞的女孩 | 11 | ≥30 | — |
| L4 | 靜靜的淡水河 | 2 | ≥30 | — |
| L6 | 月世界之旅 | 6 | ≥30 | — |
| L7 | 做泡菜 | 19 | ≥30 | — |
| L9 | 就愛倆倆在一起 | 8 | ≥30 | — |
| L12 | 掉進一個兔子洞 | 11 | ≥30 | — |

---

## ⏱️ 執行時間回報

| 子任務 / 階段 | 開始時間 | 結束時間 | 耗時（分鐘） | 備註 |
|:--|:--|:--|:--|:--|
| Phase 1 Codex 出題 | HH:mm | HH:mm | - | 8 課串行 |
| Phase 2 九步校正 | HH:mm | HH:mm | - | 8 課並行 |
| Phase 3 覆蓋 + 驗收 | HH:mm | HH:mm | - | merge.py |
| **總計** | — | — | **-** | — |

---

## 真實回報本次對話的模型與花費

＄作業匯總：Token數:- | 花費: 訂閱制無單次計費 | 使用模型: Codex gpt-4o 訂閱制 + claude-sonnet-4-6 | 執行者: AG
