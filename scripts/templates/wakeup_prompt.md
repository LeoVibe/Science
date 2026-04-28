# ScheduleWakeup Prompt 模板

> 範本來源：JOB-209（米蘭考古題下載）→ JOB-214 抽象化
> 套用步驟：拷貝下方 prompt → 改 5 個 placeholder → 用 ScheduleWakeup tool 排定

---

## 標準 60 分鐘 wakeup prompt

```
回報順序：
(1) 訊息開頭用粗體列出當下時間（**🕐 回報時間：YYYY-MM-DD (週X) HH:MM:SS**）；
(2) 跑 `python3 <DASHBOARD_SCRIPT>.py --since-minutes 60` 並把輸出回報；
(3) 算「實際完成量」：用 progress.json 真值與預期清單比對，輸出 完成數/總數/還差；
(4) 同步用 mcp__plugin_discord_discord__reply 送到 Discord 頻道 `eidos_派工與回報`（chat_id=`1487738477608177714`），格式參考前次回報；
(5) 確認 loop PID <PID> 是否還在跑：`ps -p <PID> > /dev/null && echo running || echo done`；
(6) `grep "<BATCH_KEYWORD>" <LOG_PATH>` 看跑了幾個 batch；
(7) `df -h .` 看磁碟剩餘，若剩 < 5 GB 警告用戶。
若 loop 結束就停止連續排程並等用戶下一步指示。
```

---

## 5 個 PLACEHOLDER 對照

拷貝 prompt 後改這 5 處：

| Placeholder | 含意 | JOB-209 範例 |
|:--|:--|:--|
| `<DASHBOARD_SCRIPT>` | 任務專屬 dashboard 腳本路徑 | `scripts/progress_dashboard.py` |
| `<PID>` | 啟動 loop 後記下的 process ID | `79282`（每次重啟會變）|
| `<BATCH_KEYWORD>` | log 內 batch 啟動關鍵字 | `Retry-Missing Batch #` |
| `<LOG_PATH>` | loop 輸出的 log 檔路徑 | `scripts/orchestrator-logs/JOB-209-retry-missing-8.log` |
| `eidos_派工與回報` 與 chat_id | 預設 Discord 頻道 | `1487738477608177714`（**全 Eidos 專案統一**，不需改）|

---

## Discord 訊息格式範本（每次回報用同一格式）

```
📊 **<TASK_NAME> 進度回報**
🕐 回報時間：**YYYY-MM-DD (週X) HH:MM:SS**

**整體**：done=N / partial=N / failed=N / pending=N
**完成度**：X/Y = **N.N%** (+ΔN.Npp / 60min)

**近 60 分鐘**：N records / N units / N/分

**各分組**：
```
G3 下學期  ████████  98%
G4 下學期  ████████  96%
... （依分組粒度）
```

**Loop**：PID NNN running, Batch #N 進行中, 0 timeout
**預估完成**：YYYY-MM-DD HH:MM (剩 ~Nh)
```

---

## 排定 wakeup 的時機

| 任務階段 | 建議間隔 |
|:--|:--|
| 主力批次階段（前 80%）| 60 min |
| 收尾階段（剩 < 10% pending）| 30-45 min |
| 關鍵節點（例：剛改腳本後）| 15-20 min（觀察是否回穩）|
| 預期幾分鐘後就結束 | 10 min（等自然停）|

不建議：
- < 10 min（無意義回報太密）
- > 90 min（中間出問題太晚發現）

---

## 結案後的 wakeup 處理

任務結束後**不要再排 wakeup**。檢查標準：
- pending 為 0
- 或剩餘全部標「需手動處理」（如 JOB-209 健體）
- 或連兩輪沒進展（loop wrapper 自動停）

此時：
1. 不再呼叫 ScheduleWakeup
2. 在訊息中明確說「loop 已結束，不再排程」
3. 列建議結案五步走給使用者
