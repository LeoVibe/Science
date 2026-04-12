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
