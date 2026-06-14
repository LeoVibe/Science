*Created by USER at 2026-06-14 14:00*

`last_updated`: 2026-06-14 14:20
`updated_by`: Claude Code (claude-opus-4-8[1m])

# JOB-260-DEV-準則對齊三軸定義-docs-ops

**`job_type`**：`docs_ops`

## 📌 任務背景
品質/上架/成熟度過去有 8 套交織指標，造成「QL3 不能上架」「統計灌水」「RM=QL」矛盾。經 brainstorming 收斂為三軸獨立定義（spec：`docs/superpowers/specs/2026-06-14-品質與上架層次定義-design.md`）。本單依計劃 `docs/superpowers/plans/2026-06-14-準則對齊三軸定義.md` 逐檔對齊準則。

## 🎯 任務目標
把三軸定義落到 7 份準則文件；對外 QL1–QL5 文字一律不動。

## 🚧 任務邊界
- 只改準則措辭與上架定義；**不動 QL1-5 對外文字、不改題庫資料、不改程式**。
- 程式落實（QL3 回寫 is_publishable 標 BETA）另開單。

## ✅ 驗收 Checklist
- [x] 驗證盲測準則 §4.6 上架兩級 + §2.5 補 QL3 上架/特殊下架 + is_publishable 獨立
- [x] 研究總綱 RM 補「素材潛力≠最終品質、兩條獨立軸」
- [x] 出題準則 CQI 定位（內部流程分數）
- [x] README §四流水線改兩級（§五 QL1-5 不動）
- [x] CLAUDE.md §四補上架以 is_publishable 為準
- [x] 網站規格 §2.2.1 對齊兩級
- [x] 產品介紹 第四層補上架白話（QL 表不動）
- [x] grep 全命中；對外 QL1-5 定義表零改動

## ✅ 成果 Checklist
- [x] 7 份準則文件對齊（見 Report 異動清單）
- [x] JOB-260 Report
- [ ] pj_sync（結案前）

## 真實回報
＄作業匯總：Token數:- | 花費: - | 使用模型: claude-opus-4-8[1m] | 執行者: Claude
