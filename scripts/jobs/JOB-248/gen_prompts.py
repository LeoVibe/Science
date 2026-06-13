"""JOB-248 康軒三下自然出題 — 生成 4 課 codex prompt。
每課 prompt 指示 codex 讀 KL4 素材+迷思，原創 50 題寫入 _new.json。
"""
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
KL4DIR = 'knowledge/1_課綱研究/自然/三下/康軒'
MISC = 'knowledge/3_考古題/3_L2_結構化抽取/三下/alignment_science/misconception_diagnosis.md'
QDIR = 'question/platform/G3/Science/S2/KangHsuan'
PROMPT_DIR = os.path.join(ROOT, 'scripts/jobs/JOB-248/_prompts')
os.makedirs(PROMPT_DIR, exist_ok=True)

LESSONS = [
    ('L1', 1, '田園樂', '植物種植與生長'),
    ('L2', 2, '溫度變化對物質的影響', '水與物質變化'),
    ('L3', 3, '我是動物解說員', '動物的構造與適應'),
    ('L4', 4, '天氣變變變', '天氣觀測與解析'),
]

SCHEMA_EXAMPLE = '''{
  "meta": {"grade": "G3", "semester": "S2", "subject": "SCI", "publisher": "KANGHSUAN", "lesson": "%(L)s", "order": %(order)d, "title": "%(name)s", "theme": ""},
  "publisher": "KangHsuan",
  "questions": [
    {
      "question": "（題幹，≥30字，含生活情境）",
      "commonMisconception": "（這題針對的常見迷思）",
      "scenario": "（情境短標題）",
      "quality_level": "QL3",
      "cqi_score": 7,
      "explanation": "（>10字，說明為何選此答案）",
      "answer_index": 3,
      "options": ["選項A", "選項B", "選項C", "正解選項"],
      "taxonomy": "inferential",
      "blind_evaluation": false,
      "authoring_model": "gpt-5-codex(訂閱制)",
      "verifying_model": null,
      "verifying_date": null,
      "is_publishable": false,
      "review_status": "pending",
      "review_notes": "",
      "reviewer": null,
      "review_date": null
    }
  ]
}'''

TEMPLATE = '''你是國小三年級自然科命題專家。請為「康軒版 三年級下學期 自然 {L}《{name}》（主題：{theme}）」**原創 50 道**四選一單選題。

## 步驟一：先讀完以下素材再出題
1. {kl4dir}/KL4_三下_康軒_{L}_{theme}_單課研究紀錄.md ← 知識點地圖與守衛點（命題骨架）
2. {kl4dir}/KL4_三下_康軒_{L}_{theme}_考古題與討論.md ← 考古題分析
3. {misc} ← 迷思診斷報告，挑出與本課（{theme}）相關、康軒欄有命中的迷思

## 步驟二：依 CQI-P 規格命題（逐題遵守）
- 題幹 ≥30 字，含生活情境（用【情境標籤】或對話引號自然拉長），降低學生工作記憶負荷
- 四個選項長度相近：正解與其他選項字數差 ≤1；嚴禁把最長選項當正解、嚴禁用空白湊長度
- 認知層次中年級配比約 4(記憶):4(理解):2(應用)；taxonomy 對應填 literal / inferential / applied
- 每題必含 explanation(>10字)、commonMisconception(該題針對的迷思)、scenario(情境短標題)
- 50 題須涵蓋本課 KL4 主要知識點與高頻迷思，分布均勻、不重複同一考點角度

## 鐵律
考古題僅為**參考座標，嚴禁抄寫**題幹/選項/誘答結構（換字重排若邏輯未變仍算抄襲）。每題須能在「刪掉考古題原檔後依然站得住腳」。
動物題的 scenario 必須點出該動物的生活環境；水/物質題必須有明確的溫度條件提示。

## 步驟三：輸出
把 50 題寫成 JSON 檔到：{out}
嚴格符合此結構（頂層 meta/publisher/questions，每題 18 欄位，固定值如範例）：
{schema}

固定值：quality_level="QL3"、blind_evaluation=false、is_publishable=false、review_status="pending"、review_notes=""、reviewer=null、authoring_model="gpt-5-codex(訂閱制)"、verifying_model=null、verifying_date=null、review_date=null。answer_index 是正解在 options 的 0-based 索引（請把正解放在不同位置、勿固定）。

完成後只需確認檔案已寫出，不要輸出題目全文到對話。
'''

for L, order, name, theme in LESSONS:
    out = f'{QDIR}/G3_S2_SCI_KANGHSUAN_{L}_new.json'
    schema = SCHEMA_EXAMPLE % {'L': L, 'order': order, 'name': name}
    prompt = TEMPLATE.format(L=L, name=name, theme=theme, kl4dir=KL4DIR, misc=MISC, out=out, schema=schema)
    with open(os.path.join(PROMPT_DIR, f'{L}.txt'), 'w', encoding='utf-8') as f:
        f.write(prompt)
    print(f'✓ {L}.txt ({len(prompt)} chars)')

print(f'prompts written to {PROMPT_DIR}')
