*Created by AG at 2026-03-22*

# JOB-079-AG-G3S2-全版本國語-v5深層盲測大一統

## 📌 任務背景
由於先前 JOB-076 與 JOB-077 橫跨了盲測引擎的黑暗過渡期（從無課綱的單題盲選，一路進化到發生 30 題截斷災難），最終於 JOB-078 白皮書確立了最終解答：**次世代模型 `Gemini 3.1 Flash Lite` 搭配 30-in-1 的光速陣列**。
為了讓系統中的 G3S2 國語題庫達到真正的全網高標一致性，老闆指示將先前半殘或舊引擎的結果全部捨棄。本派工將直接發動清除令，再以終極引擎一波流完成這三大版圖（康軒、翰林、南一）的深層盲測。

## ⚙️ 系統結構與驗證流程 (v5.0 旗艦引擎)
1. **標籤歸零**：調用 `scripts/clear_blind_eval.js` 將三個目錄的 `blind_evaluation` 徹底抹除。
2. **R4 智庫注入**：讀取這三大版圖共用的 8.5 萬字典藏《發展綱要》(R4)，由 LLM 精煉出 600 字課堂地雷大綱。
3. **閃電戰 (30-in-1)**：調用 `scripts/run_blind_eval.js` 搭載 `gemini-3.1-flash-lite-preview` 與 60 秒防禦性超時重連，進行 30 題極限大批發。
4. **追蹤寫回**：自動寫回 `authoring_model`, `verifying_model`, `cqi_score` 等關鍵指標。

## 📖 任務詳情
*   **目標範圍**：`KangHsuan`, `NanYi`, `HanLin` G3S2 國語目錄下全數檔案。
*   **金鑰策略**：以 `Yotta` `[tier1]` 為主戰力發動。

## 📜 關鍵參考檔案
| 檔案路徑 | 用途說明 |
| --- | --- |
| `scripts/clear_blind_eval.js` | 舊標籤橡皮擦程式 |
| `scripts/run_blind_eval.js` | 核心引擎 (v5.0 旗艦版) |

## ✅ 驗證基準 (DoD Checklist)
- [x] 執行 `clear_blind_eval.js` 成功將三大站點的盲審標記清零。
- [x] 順利發動 `run_blind_eval.js` 對三大站點執行 100% 盲測回寫。
- [x] 中途若遇伺服器斷線，能成功被 60 秒超時防護捕獲並重試。
- [x] 確認檔案標明 `"verifying_model": "Gemini-3.1-Flash-Lite"`。
- [x] 已執行 `/dosync` 文件庫全域同步。
