---
name: ei_verify
description: 題目驗證（CQI-V / 盲測）— 觸發器，正文在 question/README_驗證與盲測準則.md
---

# ei_verify

**觸發**：盲測驗證、QL 判定，或 `/ei_verify`。

## 唯一權威

`question/README_驗證與盲測準則.md` — 執行前必讀全文。

## 硬閘

- [ ] 待測題庫 CQI-P 平均 ≥ 5.5
- [ ] 驗證為 100% 全測（不得抽樣）
- [ ] API Key 已確認（免費 Key 優先）
- [ ] Mismatch 依 MTP 協議分類為 TYPE-A/B/C，附 VAT 稽核日誌路徑

## 自主迴圈條款（G5S2 流水線 L2 雙盲啟用）

- 雙盲：必跑 Gemini Flash 與 Claude Haiku 兩 model；用 `scripts/check_dual_blind_consistency.js` 合併分流
- 兩 Match → keep；TYPE-A 自動 resolved；TYPE-B → 退 Production；TYPE-C / partial → manual_review
- 每課完即 commit、寫 `jobs/g5s2_results.tsv`；TYPE-B > 5%/課 整課退回；雙盲不一致率 > 20% 停下等 PM
