"""Phase 1a: L2 codes_candidate -> primary/secondary_codes + unit_theme.

不啟動 Codex；直接基於 L2 規則填欄位：
- primary_code = 第一個 code
- secondary_codes = 其餘 codes（上限 3）
- unit_theme = 比對 KL3 §二四下自然主題（題幹/關鍵詞匹配）
- N1_pending = high confidence 且有 code
- N2_or_N3_pending = 非 high confidence 且有 code
- N5 = 無 code
"""
import json
import os
from collections import Counter
from datetime import datetime

BASE = "knowledge/3_考古題/3_L2_結構化抽取/四下"
SUBJECT = "自然"
PUBLISHERS = ["翰林", "康軒", "南一"]
OUT_DIR = os.path.join(BASE, "alignment_science", "_partial")

# 四下自然 KL3 §二「課程內容與發展矩陣」核心單元主題。
UNIT_THEMES = {
    "昆蟲家族 (生物與特徵)": [
        "昆蟲",
        "蟲",
        "幼蟲",
        "成蟲",
        "蛹",
        "卵",
        "變態",
        "完全變態",
        "不完全變態",
        "頭胸腹",
        "觸角",
        "六隻腳",
        "蜘蛛",
        "孑孓",
        "水蠆",
        "蜻蜓",
        "蝴蝶",
        "蠶",
        "蝗蟲",
    ],
    "水的奇妙現象 (毛細與連通管)": [
        "毛細",
        "連通管",
        "虹吸",
        "茶壺",
        "水位",
        "液面",
        "等高",
        "自動澆水",
        "澆水器",
        "盆栽",
        "棉線",
        "吸水",
        "U形管",
        "水管",
    ],
    "時間的測量 (單擺實驗)": [
        "時間",
        "測量時間",
        "單擺",
        "擺錘",
        "擺長",
        "擺動",
        "週期",
        "鐘擺",
        "時鐘",
        "自製時鐘",
        "快慢",
        "秒",
    ],
    "能源與電路": [
        "能源",
        "電路",
        "電池",
        "燈泡",
        "小燈泡",
        "導線",
        "短路",
        "開路",
        "迴路",
        "正極",
        "負極",
        "串聯",
        "並聯",
        "手電筒",
        "警報器",
        "發電",
    ],
}


def infer_unit_theme(question):
    """根據題幹、選項、topic_keywords 匹配 KL3 §二單元主題。"""
    parts = [question.get("stem") or ""]
    options = question.get("options")
    if isinstance(options, dict):
        parts.extend(str(v) for v in options.values())
    elif isinstance(options, list):
        parts.extend(str(v) for v in options)
    parts.extend(question.get("topic_keywords") or [])
    text = " ".join(parts)

    scores = {
        theme: sum(1 for keyword in keywords if keyword in text)
        for theme, keywords in UNIT_THEMES.items()
    }
    best_theme, best_score = max(scores.items(), key=lambda item: item[1])
    return best_theme if best_score > 0 else None


def build_link(exam_id, question):
    cc = question.get("codes_candidate") or []
    primary_code = cc[0].get("code") if cc else None
    secondary_codes = [c.get("code") for c in cc[1:4] if c.get("code")]
    unit_theme = infer_unit_theme(question)

    if not cc:
        match_rule = "N5"
        confidence = "none"
        topic_keywords = question.get("topic_keywords") or []
        general_type = topic_keywords[0] if topic_keywords else "unlinked"
    elif cc[0].get("confidence") == "high":
        match_rule = "N1_pending"
        confidence = "high"
        general_type = None
    else:
        match_rule = "N2_or_N3_pending"
        confidence = cc[0].get("confidence", "medium")
        general_type = None

    return {
        "exam_id": exam_id,
        "question_id": question["question_id"],
        "version_match": "current",
        "primary_code": primary_code,
        "secondary_codes": secondary_codes,
        "unit_theme": unit_theme,
        "kl4_link": None,
        "kl4_supported": False,
        "misconception_match": [],
        "match_rule": match_rule,
        "confidence": confidence,
        "source_l2": f"{primary_code} ({cc[0].get('confidence', '?')})" if cc else None,
        "source_codex": None,
        "general_type": general_type,
        "verify_status": "pending",
        "verify_note": None,
    }


def iter_exam_files():
    for publisher in PUBLISHERS:
        directory = os.path.join(BASE, f"四下_{SUBJECT}_{publisher}")
        if not os.path.exists(directory):
            continue
        for filename in sorted(os.listdir(directory)):
            if filename.endswith(".json") and not filename.startswith("_"):
                yield publisher, os.path.join(directory, filename), filename[:-5]


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    total_partials = 0
    status = Counter()

    for publisher, input_path, exam_id in iter_exam_files():
        try:
            with open(input_path, encoding="utf-8") as f:
                data = json.load(f)
            links = [build_link(exam_id, q) for q in data.get("questions", [])]
            status.update(link["match_rule"] for link in links)

            out = {
                "_meta": {
                    "schema_version": "2.0",
                    "partial_for": exam_id,
                    "publisher": publisher,
                    "subject": SUBJECT,
                    "semester": "四下",
                    "processed_at": datetime.now().isoformat(),
                    "extractor": "Phase 1a Python (JOB-246)",
                    "total_questions": len(links),
                },
                "l2_to_kl_links": links,
            }
            out_path = os.path.join(OUT_DIR, f"alignment_partial_{exam_id}.json")
            with open(out_path, "w", encoding="utf-8") as f:
                json.dump(out, f, ensure_ascii=False, indent=2)

            total_partials += 1
            print(f"  ✓ {exam_id}: {len(links)} 題")
        except Exception as exc:
            print(f"  ✗ {os.path.basename(input_path)}: {exc}")

    print()
    print("[Task 3 完成]")
    print("- 腳本：scripts/jobs/JOB-246/A1a_phase1a_l2_align.py")
    print(f"- partial 數：{total_partials}")
    print(
        "- 預判分布："
        f"N1_pending={status['N1_pending']}, "
        f"N2_or_N3_pending={status['N2_or_N3_pending']}, "
        f"N5={status['N5']}"
    )


if __name__ == "__main__":
    main()
