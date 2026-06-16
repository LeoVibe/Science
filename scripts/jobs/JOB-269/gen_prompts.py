#!/usr/bin/env python3
"""JOB-269 — 生成 8 課翰林國語補題 prompt (Codex 訂閱制)"""
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
PROMPT_DIR = os.path.join(ROOT, "scripts/jobs/JOB-269/_prompts")
os.makedirs(PROMPT_DIR, exist_ok=True)

COURSES = [
    ("L1",  "拔不起來的筆"),
    ("L2",  "還差一點"),
    ("L3",  "用膝蓋跳舞的女孩"),
    ("L4",  "靜靜的淡水河"),
    ("L6",  "月世界之旅"),
    ("L7",  "做泡菜"),
    ("L9",  "就愛倆倆在一起"),
    ("L12", "掉進一個兔子洞"),
]

TEMPLATE = """\
你是國小三年級國語科命題專家。請為「翰林版 三年級下學期 國語 {L}《{課名}》」**原創 35 道**四選一單選題。

## 步驟一：先讀完以下素材再出題
1. knowledge/1_課綱研究/國語/三下/翰林/KL4_三下_翰林_{L}_{課名}_單課研究紀錄.md ← 課文要義與守衛知識點
2. knowledge/1_課綱研究/國語/三下/翰林/KL4_三下_翰林_{L}_{課名}_考古題與討論.md ← 考古題型與迷思矩陣

## 步驟二：依 CQI-P 規格命題（逐題遵守）
- 題幹 ≥30 字，含生活情境（用【情境標籤】或引號自然拉長），降低工作記憶負荷
- 四個選項長度相近：正解與其他選項字數差 ≤1；嚴禁用空白湊長度
- 認知層次配比約 4(literal):4(inferential):2(applied)；taxonomy 填 literal / inferential / applied
- 每題必含 explanation(>10字)、commonMisconception(該題針對的迷思)、scenario(情境短標題)
- 35 題涵蓋本課課文主要知識點，分布均勻、不重複同一考點角度
- 🔒 題目內容必須對應《{課名}》課文，不得引用其他課的故事/人物/情境

## 鐵律
考古題僅為**參考座標，嚴禁抄寫**題幹/選項/誘答結構。每題須能在「刪掉考古題原檔後依然站得住腳」。

## 步驟三：輸出
把 35 題寫成 JSON 檔到：question/platform/G3/Chinese/S2/HanLin/G3_S2_CHI_HANLIN_{L}_new.json
嚴格符合此結構（頂層 meta/publisher/questions，每題 18 欄位）：
{{
  "meta": {{"grade": "G3", "semester": "S2", "subject": "CHI", "publisher": "HANLIN", "lesson": "{L}", "order": 1, "title": "{課名}", "theme": ""}},
  "publisher": "HanLin",
  "questions": [
    {{
      "question": "（題幹，≥30字，含生活情境）",
      "commonMisconception": "（這題針對的常見迷思）",
      "scenario": "（情境短標題）",
      "quality_level": "QL3",
      "cqi_score": 7,
      "explanation": "（>10字，說明為何選此答案）",
      "answer_index": 3,
      "options": ["選項A","選項B","選項C","正解選項"],
      "taxonomy": "inferential",
      "blind_evaluation": false,
      "authoring_model": "gpt-4o",
      "verifying_model": null,
      "verifying_date": null,
      "is_publishable": false,
      "review_status": "pending",
      "review_notes": "",
      "reviewer": null,
      "review_date": null
    }}
  ]
}}

固定值：quality_level="QL3"、blind_evaluation=false、is_publishable=false、review_status="pending"、review_notes=""、reviewer=null、authoring_model="gpt-4o"、verifying_model=null、verifying_date=null、review_date=null。answer_index 是正解在 options 的 0-based 索引（正解位置請分散）。

完成後只需確認檔案已寫出，不要輸出題目全文到對話。
"""

for L, name in COURSES:
    content = TEMPLATE.format(L=L, 課名=name)
    path = os.path.join(PROMPT_DIR, f"HANLIN_{L}.txt")
    with open(path, "w", encoding="utf-8") as f:
        f.write(content)
    print(f"[OK] {path}")

print(f"\n生成完畢：{len(COURSES)} 課 prompt 已存入 {PROMPT_DIR}")
