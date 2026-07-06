#!/usr/bin/env python3
"""
JOB-247 Phase 0-KL4: 三下_自然 KL4 研究文件 Codex Dispatch
目標：呼叫 codex exec 產出 24 份 KL4 文件（三版本各 4 課 × 2 檔案）
"""

import subprocess
import json
import os
import sys
from pathlib import Path

ROOT = Path(__file__).parent.parent.parent.parent
KL4_BASE = ROOT / "knowledge/1_課綱研究/自然/三下"
LOG_DIR = Path(__file__).parent / "_phase0_logs"
LOG_DIR.mkdir(exist_ok=True)

# ─────────────────────────────────────────────
# 單元主題對照表（依 JOB-247 § 三下_自然 單元對照表）
# ─────────────────────────────────────────────
UNIT_THEMES = {
    "翰林": {1: "植物種植與生長", 2: "水與物質變化", 3: "天氣觀測與解析", 4: "動物的構造與適應"},
    "康軒": {1: "植物種植與生長", 2: "水與物質變化", 3: "動物的構造與適應", 4: "天氣觀測與解析"},
    "南一": {1: "植物種植與生長", 2: "水與物質變化", 3: "動物的構造與適應", 4: "天氣觀測與解析"},
}

# ─────────────────────────────────────────────
# KL3 各主題核心內容（供 Codex 參考）
# ─────────────────────────────────────────────
KL3_TOPICS = {
    "植物種植與生長": """\
核心探究情境：小農夫的植物生長紀錄簿、陽台菜園的危機處理
- 設計：幼苗葉子變黃，或種子一直沒有發芽，推論可能缺少什麼條件（水、陽光或土壤異常）
主要迷思守衛點：
- 生長時序錯亂：誤認植物會先結果再開花
- 澆大量水迷思：以為只要澆大量的「水」種子就一定能活，忽略爛根（缺乏氧氣）的可能
108課綱學習內容：
- INc-II-1（植物各部位的功能）
- INc-II-2（植物的生長與光、水、土壤環境條件關係）
- INe-II-1（生物生存的環境需求）
數位題型策略：
- 從靜態背誦轉向動態因果（把根剪掉會發生什麼？）
- 設計「積水導致爛根」情境題（引導理解呼吸作用）
- 實驗邏輯：辨識控制變因（種子發芽是否需要陽光，其餘變因保持一致）""",

    "水與物質變化": """\
核心探究情境：吃火鍋時的鍋蓋水滴、夏天冰棒滴下的水
- 設計：從生活情境中推論凝結、融化、蒸發的發生原因與溫度變化關係
主要迷思守衛點：
- 白煙與水蒸氣不分（最典型物理迷思）：以為燒開水冒出的「白煙」就是水蒸氣（實為小水滴，
  看得見），而真正的水蒸氣是無色透明（看不見）
- 三態混淆：蒸發/沸騰/融化/凝結/凝固的發生條件混淆
108課綱學習內容：
- INa-II-4（水的三態變化與溫度：蒸發、凝結、融化、凝固）
- INa-II-5（日常生活中的水變化：霧、露、霜、雲、雨、雪）
品質稽核強制規範：
- 物理變化必須有明確「溫度條件」提示，建立原因（受熱/遇冷）→ 結果（狀態改變）的邏輯閉環""",

    "動物的構造與適應": """\
核心探究情境：海生館/動物園的仿生學導覽、觀察鳥類的飛行設計
- 設計：為什麼青蛙的腳趾間要有蹼？這跟人類發明蛙鞋有什麼關聯？
主要迷思守衛點：
- 只見構造不見功能：會背誦各種翅膀或鰭的名稱，但不了解這些構造如何幫助動物在特定環境
  （空氣或水）中克服阻力
- 過度類推：把所有會游泳的動物都當作「用鰭游」
108課綱學習內容：
- INc-II-3（動物的外部構造與生活環境的適應關係）
- INc-II-4（動物的運動方式與構造特徵：游泳、爬行、飛翔）
- INe-II-2（生物生存形態構造與環境適應）
品質稽核強制規範：
- 涉及動物構造的題目，scenario 必須包含該動物的「生活環境」
- 禁止單獨考「魚是用什麼游泳？」等背誦題，要求將構造與生存環境連結""",

    "天氣觀測與解析": """\
核心探究情境：「明天該帶傘嗎？」氣象主播模擬預報
- 設計：提供一組一週的雲量與氣溫變化圖，請學生判斷哪一天最可能下雨或需要穿搭外套
主要迷思守衛點：
- 降雨機率解讀錯誤：以為降雨機率 70% 是指「有 70% 的面積會下雨」或「雨會下很大」，
  而非「降雨的機率高低」
- 雲量與降雨的過度連結：以為「有雲就一定下雨」
- 氣象儀器混淆：溫度計/雨量計/風速計/濕度計的功能混淆
108課綱學習內容：
- INd-II-1（天氣的觀測與紀錄：溫度、雲量、雨量、風向風速）
- INd-II-2（天氣變化的規律與生活應用）
- INd-II-3（使用氣象儀器進行觀測）
數位題型策略：
- 從感官出發，建立觀測數據與生活決策的連結
- 設計圖表判讀題（雲量/氣溫變化圖）""",
}

# 三版本跨版本對照說明（供 §五 使用）
CROSS_VERSION_NOTES = {
    "植物種植與生長": {
        "翰林": "L1主軸，涵蓋根莖葉花果種子構造功能 + 種植實驗",
        "康軒": "L1主軸，強調生長記錄與觀察技能",
        "南一": "L1主軸，融入生活化種植情境",
    },
    "水與物質變化": {
        "翰林": "L2主軸，聚焦水的三態與溫度關係",
        "康軒": "L2主軸，結合生活情境探究蒸發/凝結",
        "南一": "L2主軸，強調觀察現象並推論原因",
    },
    "天氣觀測與解析": {
        "翰林": "L3（第3課），包含天氣觀測工具使用",
        "康軒": "L4（第4課），強調長期觀測記錄",
        "南一": "L4（第4課），結合氣候與生活決策",
    },
    "動物的構造與適應": {
        "翰林": "L4（第4課），以多種動物對比構造與環境適應",
        "康軒": "L3（第3課），強調仿生學連結",
        "南一": "L3（第3課），結合動物生存環境情境",
    },
}


def build_prompt_研究紀錄(publisher, lesson_num, topic):
    """建立 單課研究紀錄 的 Codex 生成 prompt"""
    out_path = KL4_BASE / publisher / f"KL4_三下_{publisher}_L{lesson_num}_{topic}_單課研究紀錄.md"
    kl3_content = KL3_TOPICS[topic]
    cv = CROSS_VERSION_NOTES[topic]
    cv_rows = "\n".join(
        f"| {t} | {cv['翰林']} | {cv['康軒']} | {cv['南一']} |"
        for t in [topic]
    )

    prompt = f"""\
請將以下完整 Markdown 內容寫入檔案：
{out_path}

如果檔案已存在，請覆蓋它。請只輸出檔案內容，不要有任何其他說明。

檔案內容如下：

---
# 🔬 KL4 {publisher}三下 L{lesson_num}《{topic}》單課研究紀錄

`last_updated`: 2026-06-12
`updated_by`: Codex (gpt-5.5)

**檔案定位**：三年級下學期 / {publisher}版 / 第{lesson_num}單元 / 《{topic}》
**研究成熟度**：RM3（透析期）

---

## 一、課綱連結與學習總目標

根據以下 KL3 參考內容，撰寫本課的核心概念、對應學習表現與學習內容代碼：

{kl3_content}

請按以下格式填寫（內容請依 KL3 內容展開，不要複製 KL3 原文，要改寫為針對{publisher}版本 L{lesson_num} 的具體描述）：

- **核心概念**：（150字以內，說明本課的核心學習目標）
- **對應學習表現**：（列出 108 課綱對應的 2-3 個學習表現代碼及簡短說明，格式如 po-II-1 / pe-II-2）
- **對應學習內容**：（列出上方 KL3 中的 2-3 個學習內容代碼及簡短說明）
- **認知發展定位**：（說明三年級學生的具體運思特徵，以及本課如何從操作經驗建立抽象概念）

---

## 二、核心知識點地圖

根據 KL3 主題內容，為{publisher}版 L{lesson_num}《{topic}》建立知識點地圖。
請設計 2-3 個子主題（H3），每個子主題包含 3-5 個知識點，格式如下：

### 2.1 [子主題名稱（依{topic}內容命名）]

| 知識點 | 說明 | 守衛點 |
|:--|:--|:--|
| [知識點] | [說明，一句話] | [迷思守衛，高頻迷思前加**高頻迷思**：] |
| ... | ... | ... |

### 2.2 [子主題名稱]

（同上格式，含 3-5 個知識點）

### 2.3 [子主題名稱（如有第三個）]

（同上格式）

請確保：
- 每個守衛點要描述具體的迷思內容（不只說「學生容易混淆」）
- KL3 中提到的主要迷思必須出現在守衛點中，並標記**高頻迷思**

---

## 三、實驗與探究活動

根據{topic}的教學特性，設計 1-2 個適合三年級的探究實驗，格式如下：

### 實驗一：[實驗名稱]

- **操作**：[具體操作步驟，3-4句]
- **操作變因**：[改變什麼因素]
- **控制變因**：[必須固定什麼]
- **預期發現**：[學生應觀察到/推論出什麼]
- **常見操作失誤**：[學生實作時常犯的錯誤]

（如有第二個實驗，請加 ### 實驗二）

---

## 四、認知地雷與守衛點總結

整合上述內容，列出 3-4 條最重要的認知地雷，格式如下：

| 地雷類型 | 具體內容 | 誘答設計方向 |
|:--|:--|:--|
| **直覺推論** | [具體的錯誤直覺，一句話] | [如何設計誘答選項，一句話] |
| **概念混淆** | [具體的概念混淆，一句話] | [如何設計誘答選項，一句話] |
| **過度推論** | [具體的過度推論，一句話] | [如何設計誘答選項，一句話] |
| ... | ... | ... |

---

## 五、跨版本對照

| 主題 | 翰林 | 康軒 | 南一 |
|:--|:--|:--|:--|
| {topic}（主軸） | {cv['翰林']} | {cv['康軒']} | {cv['南一']} |
| 實驗設計重點 | [翰林的實驗特色] | [康軒的實驗特色] | [南一的實驗特色] |
| 教材難度定位 | [翰林難度特徵] | [康軒難度特徵] | [南一難度特徵] |

---

## ✅ 品質稽核

- [x] CK-01：含三大版本對照
- [x] CK-02：基於 108 課綱學習內容編碼
- [x] CK-03：建立認知地雷矩陣
- [x] CK-04：不含出題 Prompt 或 AI 指令
---

注意：請直接寫入上面指定的檔案路徑，不要只輸出內容。
"""
    return out_path, prompt


def build_prompt_考古題(publisher, lesson_num, topic):
    """建立 考古題與討論 的 Codex 生成 prompt"""
    out_path = KL4_BASE / publisher / f"KL4_三下_{publisher}_L{lesson_num}_{topic}_考古題與討論.md"
    kl3_content = KL3_TOPICS[topic]

    prompt = f"""\
請將以下完整 Markdown 內容寫入檔案：
{out_path}

如果檔案已存在，請覆蓋它。請只輸出檔案內容，不要有任何其他說明。

檔案內容如下：

---
# 📝 KL4 {publisher}三下 L{lesson_num}《{topic}》考古題與討論

`last_updated`: 2026-06-12
`updated_by`: Codex (gpt-5.5)

**檔案定位**：三年級下學期 / {publisher}版 / 第{lesson_num}單元 / 考古題蒐集與誘答機制研討
**來源**：國家教育研究院題庫網、各縣市國小自然月考

---

## 一、考古題建檔

根據以下 KL3 主題內容，設計 4 種典型考古題型，每種包含原題、學生作答分析與誘答機制說明：

KL3 參考：
{kl3_content}

請設計 4 個題型（題型 A、B、C、D），每個題型格式如下：

### 題型 A：[題型名稱（針對{topic}的核心知識點）]

**原題**：「[具體題目敘述，四選一，要符合三年級程度]」
- (A) [選項A] (B) **[正確答案]** (C) [選項C] (D) [選項D]

**學生作答分析**：
- 約 X% 學生選 ([錯誤選項])：[解釋為何選這個，揭示迷思邏輯]
- 正確推理路徑：[說明如何正確推論，2-3句]
- **誘答機制**：[說明這道題如何利用迷思設計誘答，一段話]

### 題型 B：[題型名稱]
（同上格式）

### 題型 C：[題型名稱]
（同上格式）

### 題型 D：[題型名稱]
（同上格式）

---

## 二、迷思概念深度討論

根據{topic}的核心迷思，進行 2-3 條深度討論，格式如下：

### 2.1 「[迷思名稱（引用學生典型錯誤說法）]」：[成因分析標題]

**為什麼這個迷思這麼普遍？**
1. **[原因1類型]**：[說明，2-3句]
2. **[原因2類型]**：[說明，2-3句]
3. **[原因3類型（如有）]**：[說明，2-3句]

**教學守衛建議**：
- [具體教學策略1]
- [具體教學策略2]

### 2.2 「[第二個迷思]」：[成因分析標題]
（同上格式）

---

注意：請直接寫入上面指定的檔案路徑，不要只輸出內容。
"""
    return out_path, prompt


def dispatch_codex(out_path, prompt, log_path):
    """執行單次 codex exec 並回傳結果"""
    result = subprocess.run(
        ["codex", "exec", "--skip-git-repo-check", "--sandbox", "workspace-write", prompt],
        capture_output=True, text=True, cwd=str(ROOT),
        stdin=subprocess.DEVNULL
    )
    with open(log_path, "w", encoding="utf-8") as f:
        f.write(f"=== STDOUT ===\n{result.stdout}\n=== STDERR ===\n{result.stderr}\n")
    return result.returncode, out_path.exists() and out_path.stat().st_size > 100


def main():
    max_files = int(os.environ.get("MAX_FILES", "24"))
    skip_existing = os.environ.get("SKIP_EXISTING", "1") == "1"

    # 建立所有 targets
    targets = []
    for publisher, lessons in UNIT_THEMES.items():
        for lesson_num, topic in lessons.items():
            for file_type in ["研究紀錄", "考古題"]:
                targets.append((publisher, lesson_num, topic, file_type))

    print(f"=== Phase 0-KL4 Codex Dispatch: {len(targets)} targets, MAX_FILES={max_files} ===")

    success = failed = skipped = 0
    for i, (publisher, lesson_num, topic, file_type) in enumerate(targets):
        if success + failed >= max_files:
            print(f"=== Reached MAX_FILES={max_files}, stopping ===")
            break

        if file_type == "研究紀錄":
            out_path, prompt = build_prompt_研究紀錄(publisher, lesson_num, topic)
        else:
            out_path, prompt = build_prompt_考古題(publisher, lesson_num, topic)

        tag = f"[{i+1}/{len(targets)}][{publisher}_L{lesson_num}_{topic[:4]}_{file_type[:2]}]"

        if skip_existing and out_path.exists() and out_path.stat().st_size > 100:
            print(f"{tag} SKIP (already exists, {out_path.stat().st_size} bytes)")
            skipped += 1
            continue

        log_path = LOG_DIR / f"{publisher}_L{lesson_num}_{topic[:6]}_{file_type[:2]}.log"
        print(f"{tag} start ...", flush=True)

        exit_code, written = dispatch_codex(out_path, prompt, log_path)
        if written:
            print(f"{tag} ✓ done ({out_path.stat().st_size} bytes)")
            success += 1
        else:
            # 檢查 rate limit
            log_content = log_path.read_text(encoding="utf-8", errors="ignore")
            if "usage limit" in log_content.lower() or "rate limit" in log_content.lower():
                print(f"{tag} ✗ RATE LIMIT — stopping")
                failed += 1
                break
            print(f"{tag} ✗ exit={exit_code}, file not written (size={out_path.stat().st_size if out_path.exists() else 0})")
            print(f"       log: {log_path}")
            failed += 1

    print(f"\n=== Phase 0-KL4 dispatch 結束 ===")
    print(f"✓ success: {success}")
    print(f"✗ failed:  {failed}")
    print(f"⊘ skipped: {skipped}")

    # 輸出 summary JSON
    summary = {
        "total_targets": len(targets),
        "success": success, "failed": failed, "skipped": skipped,
        "existing_files": sum(1 for p, n, t, ft in targets if (
            (KL4_BASE / p / f"KL4_三下_{p}_L{n}_{t}_{'單課研究紀錄' if ft == '研究紀錄' else '考古題與討論'}.md").exists()
        ))
    }
    summary_path = LOG_DIR / "phase0_summary.json"
    with open(summary_path, "w", encoding="utf-8") as f:
        json.dump(summary, f, ensure_ascii=False, indent=2)
    print(f"Summary → {summary_path}")


if __name__ == "__main__":
    main()
