"""JOB-252 社會科三下出題 — 生成 17 課 codex prompt。
翰林6+康軒6+南一5 = 17課。輸出 staged _new.json（不覆蓋正式檔，待盲測決策）。
"""
import os

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..', '..'))
KL4BASE = 'knowledge/1_課綱研究/社會/三下'
MISC_NOTE = '考古題與討論檔內的迷思矩陣'
QBASE = 'question/platform/G3/SocialStudies/S2'
PROMPT_DIR = os.path.join(ROOT, 'scripts/jobs/JOB-252/_prompts')
os.makedirs(PROMPT_DIR, exist_ok=True)

# (pub_zh, pub_code, pub_full, L, order, name)
LESSONS = [
    ('翰林','HANLIN','HanLin','L1',1,'我居住的地方'),
    ('翰林','HANLIN','HanLin','L2',2,'多元的生活空間'),
    ('翰林','HANLIN','HanLin','L3',3,'生活中的各行各業'),
    ('翰林','HANLIN','HanLin','L4',4,'生活與工作的轉變'),
    ('翰林','HANLIN','HanLin','L5',5,'儲蓄與消費的選擇'),
    ('翰林','HANLIN','HanLin','L6',6,'小小街道觀察家'),
    ('康軒','KANGHSUAN','KangHsuan','L1',1,'我們居住的地方'),
    ('康軒','KANGHSUAN','KangHsuan','L2',2,'居住地方的風貌'),
    ('康軒','KANGHSUAN','KangHsuan','L3',3,'消費與生活'),
    ('康軒','KANGHSUAN','KangHsuan','L4',4,'消費與選擇'),
    ('康軒','KANGHSUAN','KangHsuan','L5',5,'家鄉的地名'),
    ('康軒','KANGHSUAN','KangHsuan','L6',6,'家鄉的故事'),
    ('南一','NANYI','NanYi','L1',1,'居住的地方'),
    ('南一','NANYI','NanYi','L2',2,'地方生活'),
    ('南一','NANYI','NanYi','L3',3,'生活理財'),
    ('南一','NANYI','NanYi','L4',4,'居住地方的地名與故事'),
    ('南一','NANYI','NanYi','L5',5,'打造幸福的家園'),
]

SCHEMA = '''{
  "meta": {"grade": "G3", "semester": "S2", "subject": "SOC", "publisher": "%(code)s", "lesson": "%(L)s", "order": %(order)d, "title": "%(name)s", "theme": ""},
  "publisher": "%(full)s",
  "questions": [
    {
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
      "authoring_model": "gpt-5.5",
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

TEMPLATE = '''你是國小三年級社會科命題專家。請為「{pub}版 三年級下學期 社會 {L}《{name}》」**原創 50 道**四選一單選題。

## 步驟一：先讀完以下素材再出題
1. {kl4base}/{pub}/KL4_三下_{pub}_{L}_{name}_單課研究紀錄.md ← 知識點地圖與守衛點（命題骨架）
2. {kl4base}/{pub}/KL4_三下_{pub}_{L}_{name}_考古題與討論.md ← 考古題分析與迷思矩陣

## 步驟二：依 CQI-P 規格命題（逐題遵守）
- 題幹 ≥30 字，含生活情境（用【情境標籤】或對話引號自然拉長），降低工作記憶負荷
- 四個選項長度相近：正解與其他選項字數差 ≤1；嚴禁把最長選項當正解、嚴禁用空白湊長度
- 認知層次中年級配比約 4(記憶):4(理解):2(應用)；taxonomy 對應填 literal / inferential / applied
- 每題必含 explanation(>10字)、commonMisconception(該題針對的迷思)、scenario(情境短標題)
- 50 題涵蓋本課 KL4 主要知識點與守衛點/迷思，分布均勻、不重複同一考點角度

## 鐵律
考古題僅為**參考座標，嚴禁抄寫**題幹/選項/誘答結構（換字重排若邏輯未變仍算抄襲）。每題須能在「刪掉考古題原檔後依然站得住腳」。
社會科題目須連結在地生活情境（家鄉/消費/地圖/各行各業等），避免空泛背誦；涉及地名/故事須符合該版本課文脈絡。

## 步驟三：輸出
把 50 題寫成 JSON 檔到：{out}
嚴格符合此結構（頂層 meta/publisher/questions，每題 18 欄位，固定值如範例）：
{schema}

固定值：quality_level="QL3"、blind_evaluation=false、is_publishable=false、review_status="pending"、review_notes=""、reviewer=null、authoring_model="gpt-5.5"、verifying_model=null、verifying_date=null、review_date=null。answer_index 是正解在 options 的 0-based 索引（正解位置請分散）。

完成後只需確認檔案已寫出，不要輸出題目全文到對話。'''

for pub, code, full, L, order, name in LESSONS:
    out = f'{QBASE}/{full}/G3_S2_SOC_{code}_{L}_new.json'
    schema = SCHEMA % {'code':code,'L':L,'order':order,'name':name,'full':full}
    prompt = TEMPLATE.format(pub=pub, L=L, name=name, kl4base=KL4BASE, out=out, schema=schema)
    with open(os.path.join(PROMPT_DIR, f'{code}_{L}.txt'),'w',encoding='utf-8') as f:
        f.write(prompt)
    print(f'✓ {code}_{L}.txt — {pub} {name}')

print(f'{len(LESSONS)} prompts → {PROMPT_DIR}')
