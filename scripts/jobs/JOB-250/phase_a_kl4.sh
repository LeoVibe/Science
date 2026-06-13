#!/bin/bash
# JOB-250 Phase A：反推南一「廚房中的科學/溶解」課 KL4（Codex 訂閱制）
set -u
ROOT="$(cd "$(dirname "$0")/../../.." && pwd)"
cd "$ROOT"
unset ANTHROPIC_API_KEY
unset GEMINI_API_KEY
LOG_DIR="scripts/jobs/JOB-250/_logs"
mkdir -p "$LOG_DIR"

PROMPT='你是國小自然課綱研究專家。南一三下自然有一課《廚房中的科學》（主題：溶解，屬物質變化單元），但目前缺 KL4 單課研究文件。請用「考古題反推」方法，產出這一課的 KL4 研究雙檔。

## 請先讀取分析以下素材
1. 南一溶解相關考古題：knowledge/3_考古題/2_MD淬鍊文字_整合版/三下/三下_自然_南一/ 目錄下各「第二次段考」「第二次評量」試卷（含溶解、調味品、食鹽/糖溶於水、紫高麗菜汁檢測、溶解後質量等題型）
2. 現有題庫主題參考：question/platform/G3/Science/S2/NanYi/G3_S2_SCI_NANYI_L4.json（《廚房中的科學》溶解題）
3. 迷思素材：knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/misconception_diagnosis.md（取「融化/溶解混用」等南一條目）
4. 格式範本（務必照此結構與深度）：knowledge/1_課綱研究/自然/三下/南一/KL4_三下_南一_L2_水與物質變化_單課研究紀錄.md

## 產出兩個檔案
### 檔1：knowledge/1_課綱研究/自然/三下/南一/KL4_三下_南一_廚房中的科學_單課研究紀錄.md
必含：
- §一 課綱連結與學習總目標（對應 INb/INc 學習內容 codes、學習表現）
- §二 核心知識點地圖（含守衛點表格）：溶解的概念、溶解 vs 融化的區辨、溶解與溫度的關係、攪拌/顆粒大小對溶解速率的影響、溶解後質量守恆、溶解的可逆性（蒸發回收）
- §三 實驗與探究活動（廚房物質溶解實驗、控制變因）
- §四 迷思分析（融化與溶解混用、溶解=物質消失、溶解後變輕等高頻迷思 + 守衛點）

### 檔2：knowledge/1_課綱研究/自然/三下/南一/KL4_三下_南一_廚房中的科學_考古題與討論.md
必含：考古題題型分析、命題重點、誘答設計建議、迷思矩陣

兩檔開頭標 `last_updated`: 2026-06-13 / `updated_by`: Codex gpt-5.5 / 研究成熟度 RM3。
完成後確認兩檔已寫出，不需輸出全文到對話。'

echo "=== JOB-250 Phase A 溶解KL4反推 start $(date '+%H:%M:%S') ==="
T0=$(date +%s)
codex exec --skip-git-repo-check --sandbox workspace-write "$PROMPT" < /dev/null > "$LOG_DIR/phase_a.log" 2>&1
EXIT=$?
T1=$(date +%s)
echo "=== Phase A done exit=$EXIT 耗時=$((T1-T0))s $(date '+%H:%M:%S') ==="
ls -la knowledge/1_課綱研究/自然/三下/南一/KL4_三下_南一_廚房中的科學_*.md 2>/dev/null || echo "⚠️ 溶解KL4未產出"
grep -qiE "usage limit|rate limit|quota" "$LOG_DIR/phase_a.log" && echo "⚠️ 限額"
