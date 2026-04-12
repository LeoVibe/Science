# 🚀 API Free Tier 產能優化與排程手冊 (Rate Limit Mastery)

`last_updated`: 2026-04-03 10:45  
`updated_by`: Antigravity (Gemini-3-Flash)  
`status`: 專案核心規範 (Project Core Strategy)

## 一、 核心限制原理 (Google AI Studio Free Tier)

在 Eidos 專案中，我們依賴 Free API 進行大量運算。為了不觸發 429/503 錯誤，必須理解以下兩個維度：

### 1. RPM/TPM (Rolling Window)
*   **每分鐘請求數 (RPM)**：通常為 15 次（Lite 模型）。
*   **特性**：滾動式計算，秒級恢復。
*   **應對**：透過 `qpm` 參數控制（建議設定為 1.5 ~ 2.0）。

### 2. RPD (Requests Per Day - 24h Quota)
*   **每日總數 (RPD)**：
    *   **Gemini 3 Flash (Preview)**: **20 次** (極低，僅供驗證)。
    *   **Gemini 3.1 Flash Lite**: **500 次** (較高，建議產題)。
*   **重置時間**：美國太平洋時間 (PT) 午夜 00:00。
*   **換算台灣時間 (台北, UTC+8)**：
    *   **15:00 (日光節約時間 - 3月至11月)**
    *   **16:00 (標準時間 - 11月至3月)**

---

## 二、 最佳實作模式 (Best Practice)

### 1. 模型混合策略 (Model Triage)
不要拿「精銳部隊」去挖戰壕：
*   **大規模補題/產題 (Batch Generation)**：預設使用 `gemini-3.1-flash-lite`。
*   **核心品質驗證 (Blind Verify)**：保留專案核心 `gemini-3-flash (Preview)` 配額。
*   **理由**：500 次的日配額可支撐 15-20 課的產出，而 20 次的日配額連一課盲測都跑不完。

### 2. 黃金排程表 (The Ideal Schedule)

| 階段 | 台灣時間 (TW) | 動作建議 |
|:---:|:---:|:---|
| **冷卻/關機** | 09:00 - 15:00 | 避開 API 配額枯竭期，進行程式碼重構或文檔作業。 |
| **重啟/爆發** | 15:30 - 18:00 | **配額重置黃金期**。啟動大規模 `question_prod` 任務。 |
| **深夜/驗證** | 22:00 - 02:00 | 執行最後的 `question_verify` (盲測)，這時伺服器負載較低。 |

---

## 三、 派工指令參數範例 (Safe Command Templates)

### 1. 安全補題 (Generation)
```bash
# 限制 1.5 QPM, 批次 5 題, 使用 Lite 模型
node scripts/batch_chinese_s2_generate.js --grades G3 --publishers NanYi -- --model gemini-3.1-flash-lite --conservative --qpm 1.5 --batch 5 --target 30
```

### 2. 安全盲測 (Verification)
```bash
# 盲測同樣建議加入延遲，手動指定 batch_size 避免 429
node scripts/run_blind_eval.js question/platform/G3/Chinese/S2/NanYi --model=gemini-3.1-flash-lite
```

---

## 四、 故障排除 (Troubleshooting)

*   **遇到 429/503**：
    *   不要嘗試密集重試。
    *   **立即停止 300 秒**。
    *   若連續 3 次失敗且為 RPD 報錯，則任務強制關機，等待台灣時間 **15:00** 重置。

---
> [!IMPORTANT]
> 專案成員啟動任何大規模產題與驗證 JOB-XXX 前，**必須**先查閱本手冊並在派工單中確認模型與 QPM 設定。
