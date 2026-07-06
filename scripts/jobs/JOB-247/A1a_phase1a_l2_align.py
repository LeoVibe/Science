"""Phase 1a: 三下自然 L2 codes_candidate -> primary/secondary_codes + unit_theme.

不啟動 Codex；直接基於 L2 規則填欄位：
- primary_code = 第一個 code
- secondary_codes = 其餘 codes（上限 3）
- unit_theme = 比對 KL3 §二三下自然主題（題幹/關鍵詞匹配）
- N1_pending = high confidence 且有 code
- N2_or_N3_pending = 非 high confidence 且有 code
- N5 = 無 code
"""
import json
import os
from collections import Counter
from datetime import datetime

BASE = "knowledge/3_考古題/3_L2_結構化抽取/三下"
SUBJECT = "自然"
PUBLISHERS = ["翰林", "康軒", "南一"]
OUT_DIR = os.path.join(BASE, "alignment_science", "_partial")

# 三下自然 KL3 §二四大核心單元主題
UNIT_THEMES = {
    "植物種植與生長": [
        "植物",
        "種植",
        "種子",
        "發芽",
        "幼苗",
        "根",
        "莖",
        "葉",
        "花",
        "果實",
        "生長",
        "澆水",
        "土壤",
        "陽光",
        "光合作用",
        "爛根",
        "肥料",
        "播種",
        "萌芽",
        "光照",
        "植栽",
        "葉片",
        "葉色",
        "葉脈",
        "葉序",
        "互生",
        "對生",
        "輪生",
        "水分",
        "養分",
    ],
    "水與物質變化": [
        "水",
        "蒸發",
        "凝結",
        "融化",
        "沸騰",
        "冰",
        "水蒸氣",
        "白煙",
        "三態",
        "液態",
        "固態",
        "氣態",
        "加熱",
        "冷卻",
        "溫度",
        "沸點",
        "熔點",
        "溶解",
        "鹽水",
        "糖水",
        "結晶",
        "水滴",
        "水氣",
        "飽和",
        "蒸餾",
        "過濾",
        "物質變化",
        "物理變化",
        "化學變化",
        "混合",
        "分離",
    ],
    "動物的構造與適應": [
        "動物",
        "構造",
        "適應",
        "翅膀",
        "鰭",
        "蹼",
        "腳爪",
        "爪子",
        "喙",
        "牙齒",
        "皮膚",
        "羽毛",
        "毛髮",
        "鱗片",
        "甲殼",
        "骨骼",
        "魚",
        "鳥",
        "青蛙",
        "蜥蜴",
        "哺乳",
        "爬行",
        "兩棲",
        "水中",
        "陸地",
        "空中",
        "飛行",
        "游泳",
        "奔跑",
        "保護色",
        "偽裝",
        "捕食",
        "天敵",
        "防禦",
        "刺蝟",
        "烏龜",
        "蹄",
        "蜘蛛",
        "仿生",
        "蛙鞋",
    ],
    "天氣觀測與解析": [
        "天氣",
        "氣溫",
        "溫度計",
        "雲量",
        "降雨",
        "降雨機率",
        "雨量",
        "雨量計",
        "風向",
        "風速",
        "風力",
        "氣象",
        "預報",
        "晴天",
        "陰天",
        "下雨",
        "颱風",
        "季節",
        "春天",
        "夏天",
        "折線圖",
        "氣溫折線",
        "平均氣溫",
        "百葉箱",
        "觀測",
        "記錄",
        "蒲福",
        "東北風",
        "南風",
        "北風",
        "西風",
        "機率",
        "帶傘",
        "衣物",
        "主播",
        "播報",
        "高溫",
        "低溫",
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
        directory = os.path.join(BASE, f"三下_{SUBJECT}_{publisher}")
        if not os.path.exists(directory):
            continue
        for filename in sorted(os.listdir(directory)):
            if filename.endswith(".json") and not filename.startswith("_"):
                yield publisher, os.path.join(directory, filename), filename[:-5]


def main():
    os.makedirs(OUT_DIR, exist_ok=True)
    total_partials = 0
    status = Counter()
    theme_dist = Counter()

    for publisher, input_path, exam_id in iter_exam_files():
        try:
            with open(input_path, encoding="utf-8") as f:
                data = json.load(f)
            links = [build_link(exam_id, q) for q in data.get("questions", [])]
            status.update(link["match_rule"] for link in links)
            theme_dist.update(link["unit_theme"] for link in links if link["unit_theme"])

            out = {
                "_meta": {
                    "schema_version": "2.0",
                    "partial_for": exam_id,
                    "publisher": publisher,
                    "subject": SUBJECT,
                    "semester": "三下",
                    "processed_at": datetime.now().isoformat(),
                    "extractor": "Phase 1a Python (JOB-247)",
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
    print("[Phase 1a 完成]")
    print("- 腳本：scripts/jobs/JOB-247/A1a_phase1a_l2_align.py")
    print(f"- partial 數：{total_partials}")
    print(
        "- 預判分布："
        f"N1_pending={status['N1_pending']}, "
        f"N2_or_N3_pending={status['N2_or_N3_pending']}, "
        f"N5={status['N5']}"
    )
    print()
    print("- unit_theme 分布（top）：")
    for theme, count in theme_dist.most_common():
        print(f"    {theme}: {count}")


if __name__ == "__main__":
    main()
