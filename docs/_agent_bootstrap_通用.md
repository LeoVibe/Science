# Agent Bootstrap — 通用作業準則精華

`source`: docs/README_通用作業準則.md
`purpose`: SessionStart Hook 自動注入，Agent 無需主動 Read
`last_updated`: 2026-04-11
`updated_by`: Claude Code (claude-opus-4-6)

---

## 角色分工

| 角色 | 擔當者 | 職責 | 禁止 |
|:--|:--|:--|:--|
| PM / 總架構師 | Claude Code | 規劃、派工、驗收；**透過 `cursor agent CLI` 委派 Cursor 執行** | 禁止直接執行出題/盲測/腳本跑批 |
| 執行工程師 | Cursor / Gemini | 讀派工單、按 DoD 執行、撰寫 Report | 禁止自行開派工單或修改規範 |
| QA / 稽核 | Codex / Antigravity | 跨檔一致性檢查、驗證數據 | — |
| 使用者 | 人類 | 最終決策、核准、驗收 | — |

## 多 Agent 派工機制（摘要，詳見派工準則 §5.0）

Claude Code **主動呼叫** Cursor CLI，而非「告知使用者去開 Cursor」：

```bash
# 單一 JOB（最常用）
cursor agent --print --yolo --workspace . \
  "請讀取並執行派工單：jobs/JOB-XXX-*.md" \
  > scripts/orchestrator-logs/JOB-XXX-cursor-output.log 2>&1 &

# 批量任務（跨多科目/年級）
node scripts/orchestrator.js --dry-run   # 先預覽
node scripts/orchestrator.js             # 正式執行
```

**何時用哪種**：單一 JOB → 直接呼叫；跨科目/年級批量 → orchestrator.js。  
**Log 位置**：`scripts/orchestrator-logs/JOB-XXX-cursor-output.log`  
**監控**：`tail -f scripts/orchestrator-logs/JOB-XXX-cursor-output.log`

## 任務三段式 Checklist（缺一不可）

所有 JOB 必須同時包含：
1. **啟動 Checklist**：必讀文件、前置素材、品質等級
2. **驗收 Checklist**：CQI-P ≥ 5.5、CQI-V Match Rate ≥ 85%、最終 CQI ≥ 6.5、欄位驗證
3. **成果 Checklist**：Report 產出、進度表同步、`/pj_sync`、Discord 摘要

每項打勾須附佐證數值，禁止預先全部打勾。

## 任務邊界四守則

1. **只做派工單內的事**：範圍外問題記入「遺留問題」，不自行處理
2. **禁止自行修改規範文件**：除非派工單明確指定 `job_type: docs_ops`
3. **遇到範圍外問題，回報不處理**：寫進 Report 遺留問題欄
4. **無法完成就停止並說明**：禁止假裝完成或模糊帶過

## 模型與成本鐵律

- **免費 Key 優先**：預設 Google AI Studio 免費額度，付費需使用者核准
- **禁止自行選模型**：執行前必須詢問使用者並取得核准
- **據實回報**：Token/花費從真實 Meta 讀取，無法取得填 `-`，禁止推估
- **禁止建議模型**：不得私自建議「某模型適合某情境」

## 花費回報格式

```
＄作業匯總：Token數:{真實數字} | 花費: ${台幣} | 使用模型: {真實模型代碼} | 執行者: {AG|Cursor|Claude}
```

無法取得填 `-`，禁止推估或捏造。

## 許可機制

無使用者明確許可（LGTM / 允准 / 開始執行），禁止進入執行階段。

## 文件版本追溯

所有 MD/JSON 檔案標註：
```
`last_updated`: YYYY-MM-DD HH:mm
`updated_by`: {Agent名} ({模型名})
```

## 文件設計原則（精華，詳見正文第九章 §10.1-10.7）

- **單一職責**：一份文件只管一主題，開頭 `文件定位` 宣告邊界
- **唯一真相**：每個知識點只在一處維護正文，其他地方放指標連結
- **三層架構**：索引（≤150 字/行）→ 摘要（≤30 行）→ 正文（按需讀取）
- **靜態/動態分離**：不變的規則寫準則，會變的狀態寫派工單/Report
- **What/Why/How 分離**：規範講 What+Why，SOP 講 How，Report 講 Done
- **為 Agent 而寫**：可程式化條件句，附 Why 和 fallback
- **存活性優先**：表格和一行式規則比散文更能撐過 context 壓縮

## 本摘要未涵蓋（需查閱正文）

- Git 協作規範（唯一真相目錄、禁止事項）→ 正文第二章
- UI 文案變更守則（禁止自動修改、強制對照表）→ 正文第五章
- 執行時間回報格式 → 正文 §5.3
- 技能檔 vs 知識檔分工 → 正文 §1.1
- 文件設計原則完整版 → 正文第九章（§10.1-10.7）
