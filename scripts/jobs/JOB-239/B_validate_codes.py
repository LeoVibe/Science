#!/usr/bin/env python3
"""
JOB-239 Phase B：跨全量 121 份三下_國語 JSON 驗證編碼合法性、階段、重複。
讀目錄：_golden_samples/<本 JOB 黃金>.json (1) + 三下_國語_pilot/* (5) + 三下_國語_*出版社/* (~115)
寫報告：knowledge/3_考古題/3_L2_結構化抽取/_validation_report_chinese_g3.json
不修改原始 JSON。
"""

import json
import glob
import datetime
import sys
import os


EXPECTED_FILES = 114  # 1 黃金 + 5 Pilot + 108 全量
EXPECTED_LEGAL_CODES = 61  # chinese_codes_legal_II.json（30 performance + 31 content）
STAGE_MARK = "Ⅱ"
DETAIL_LIMIT = 30

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
DATA_ROOT = os.path.join(ROOT, "knowledge/3_考古題/3_L2_結構化抽取")
LEGAL_CODES_PATH = os.path.join(DATA_ROOT, "_meta/chinese_codes_legal_II.json")
REPORT_PATH = os.path.join(DATA_ROOT, "_validation_report_chinese_g3.json")

INPUT_GLOBS = [
    os.path.join(DATA_ROOT, "_golden_samples/三下_國語_*.json"),
    os.path.join(DATA_ROOT, "三下/三下_國語_pilot/*.json"),
    os.path.join(DATA_ROOT, "三下/三下_國語_翰林/*.json"),
    os.path.join(DATA_ROOT, "三下/三下_國語_康軒/*.json"),
    os.path.join(DATA_ROOT, "三下/三下_國語_南一/*.json"),
]


def load_json(path):
    with open(path, "r", encoding="utf-8") as f:
        return json.load(f)


def write_json(path, payload):
    parent = os.path.dirname(path)
    if parent:
        os.makedirs(parent, exist_ok=True)
    with open(path, "w", encoding="utf-8") as f:
        json.dump(payload, f, ensure_ascii=False, indent=2)
        f.write("\n")


def repo_rel(path):
    return os.path.relpath(path, ROOT)


def discover_input_files():
    files = []
    seen = set()
    for pattern in INPUT_GLOBS:
        for path in sorted(glob.glob(pattern)):
            abs_path = os.path.abspath(path)
            if abs_path not in seen:
                seen.add(abs_path)
                files.append(abs_path)
    return files


def load_legal_codes(path):
    payload = load_json(path)
    codes = set()
    for section in ("performance", "content"):
        rows = payload.get(section, [])
        if not isinstance(rows, list):
            sys.exit(f"Legal code section is not a list: {section}")
        for row in rows:
            if isinstance(row, dict) and isinstance(row.get("code"), str):
                codes.add(row["code"])
    if len(codes) != EXPECTED_LEGAL_CODES:
        sys.exit(f"Expected {EXPECTED_LEGAL_CODES} legal codes, got {len(codes)} from {repo_rel(path)}")
    return codes


def code_text(candidate):
    if not isinstance(candidate, dict):
        return ""
    code = candidate.get("code")
    return code if isinstance(code, str) else ""


def confidence_value(candidate):
    if not isinstance(candidate, dict):
        return None
    confidence = candidate.get("confidence")
    if isinstance(confidence, (int, float)):
        return float(confidence)
    if isinstance(confidence, str):
        order = {'high': 3, 'medium': 2, 'low': 1}
        if confidence in order:
            return order[confidence]
        try:
            return float(confidence)
        except ValueError:
            return None
    return None


def display_code(code):
    return code if code else "<missing>"


def question_label(question, index):
    if isinstance(question, dict) and question.get("question_id"):
        return str(question.get("question_id"))
    return f"question#{index + 1}"


def add_detail(details, overflow_count, message):
    if len(details) < DETAIL_LIMIT:
        details.append(message)
        return overflow_count
    return overflow_count + 1


def classify_action(total_codes, violations):
    if violations == 0:
        return "clean", 0.0
    if total_codes == 0:
        return "manual_review", 100.0

    rate = violations / total_codes * 100
    if rate < 5:
        return "auto_corrected", rate
    if rate < 20:
        return "flagged_for_rerun", rate
    return "manual_review", rate


def validate_question(question, question_index, legal_codes, counters, details, overflow_count):
    label = question_label(question, question_index)
    candidates = []
    if isinstance(question, dict):
        raw = question.get("codes_candidate", [])
        if isinstance(raw, list):
            candidates = raw
        else:
            overflow_count = add_detail(details, overflow_count,
                                        f"{label} codes_candidate is not a list; treated as empty")

    seen = {}
    for idx, candidate in enumerate(candidates):
        code = code_text(candidate)
        if code not in legal_codes:
            counters["A"] += 1
            overflow_count = add_detail(details, overflow_count,
                                        f"A illegal at {label} candidate#{idx + 1}: {display_code(code)}")
        if STAGE_MARK not in code:
            counters["B"] += 1
            overflow_count = add_detail(details, overflow_count,
                                        f"B wrong stage at {label} candidate#{idx + 1}: {display_code(code)}")

        confidence = confidence_value(candidate)
        if code in seen:
            seen[code]["count"] += 1
            seen[code]["duplicate_indexes"].append(idx + 1)
            best = seen[code]["best_confidence"]
            if confidence is not None and (best is None or confidence > best):
                seen[code]["best_confidence"] = confidence
                seen[code]["best_index"] = idx + 1
        else:
            seen[code] = {"count": 1, "best_confidence": confidence,
                          "best_index": idx + 1, "duplicate_indexes": []}

    for code, info in sorted(seen.items()):
        dup = info["count"] - 1
        if dup <= 0:
            continue
        counters["C"] += dup
        confidence = info["best_confidence"]
        confidence_text = "unknown" if confidence is None else f"{confidence:g}"
        overflow_count = add_detail(details, overflow_count,
                                    f"C duplicate at {label}: {display_code(code)} x{info['count']}; "
                                    f"keep candidate#{info['best_index']} confidence={confidence_text}")

    return len(candidates), overflow_count


def validate_file(path, legal_codes):
    payload = load_json(path)
    questions = payload.get("questions", []) if isinstance(payload, dict) else []
    details = []
    overflow_count = 0
    if not isinstance(questions, list):
        questions = []
        overflow_count = add_detail(details, overflow_count, "questions is not a list; treated as empty")

    counters = {"A": 0, "B": 0, "C": 0}
    total_codes = 0
    for i, q in enumerate(questions):
        n, overflow_count = validate_question(q, i, legal_codes, counters, details, overflow_count)
        total_codes += n

    violations = counters["A"] + counters["B"] + counters["C"]
    action, rate = classify_action(total_codes, violations)
    if overflow_count:
        details.append(f"... {overflow_count} more detail(s) omitted")

    return {
        "file": repo_rel(path),
        "questions_n": len(questions),
        "total_codes": total_codes,
        "violations": {"A": counters["A"], "B": counters["B"], "C": counters["C"]},
        "violation_rate_pct": round(rate, 2),
        "action": action,
        "details": details,
    }


def build_report(files, legal_codes):
    per_file = []
    total_q = 0
    total_codes = 0
    violations = {"A_illegal": 0, "B_wrong_stage": 0, "C_duplicate": 0}
    actions = {"auto_corrected": 0, "flagged_for_rerun": 0, "manual_review": 0, "clean": 0}

    for path in files:
        item = validate_file(path, legal_codes)
        per_file.append(item)
        total_q += item["questions_n"]
        total_codes += item["total_codes"]
        violations["A_illegal"] += item["violations"]["A"]
        violations["B_wrong_stage"] += item["violations"]["B"]
        violations["C_duplicate"] += item["violations"]["C"]
        actions[item["action"]] += 1

    return {
        "_meta": {
            "validated_at": datetime.datetime.now().astimezone().isoformat(timespec="seconds"),
            "total_files": len(files),
            "total_questions": total_q,
            "total_codes": total_codes,
            "subject": "國語",
            "expected_files": EXPECTED_FILES,
            "expected_legal_codes": EXPECTED_LEGAL_CODES,
        },
        "summary": {"violations": violations, "actions": actions},
        "per_file": per_file,
    }


def print_summary(report):
    v = report["summary"]["violations"]
    a = report["summary"]["actions"]
    print(f"total_files={report['_meta']['total_files']} "
          f"violations(A={v['A_illegal']}, B={v['B_wrong_stage']}, C={v['C_duplicate']}) "
          f"clean={a['clean']} corrected={a['auto_corrected']} "
          f"flagged={a['flagged_for_rerun']} manual={a['manual_review']}")


def main():
    files = discover_input_files()
    if len(files) != EXPECTED_FILES:
        print(f"WARN: Expected {EXPECTED_FILES} input files, got {len(files)}（部分可能尚未產出）", file=sys.stderr)

    legal = load_legal_codes(LEGAL_CODES_PATH)
    report = build_report(files, legal)
    write_json(REPORT_PATH, report)
    print_summary(report)
    print(f"報告寫入: {repo_rel(REPORT_PATH)}")


if __name__ == "__main__":
    main()
