#!/usr/bin/env python3
"""
JOB-228 Phase B: validate extracted Social Studies codes across all JSON files.

This script reads the 116 target extraction JSON files plus the legal stage-II
code list, then writes a validation report. It does not modify source JSON files.
"""

import json
import glob
import datetime
import sys
import os


EXPECTED_FILES = 116
EXPECTED_LEGAL_CODES = 35
STAGE_MARK = "\u2161"
DETAIL_LIMIT = 30

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
DATA_ROOT = os.path.join(ROOT, "knowledge/3_考古題/3_L2_結構化抽取")
LEGAL_CODES_PATH = os.path.join(DATA_ROOT, "_meta/social_codes_legal_II.json")
REPORT_PATH = os.path.join(DATA_ROOT, "_validation_report.json")

INPUT_GLOBS = [
    os.path.join(DATA_ROOT, "_golden_samples/*.json"),
    os.path.join(DATA_ROOT, "_pilot/*.json"),
    os.path.join(DATA_ROOT, "三下/三下_社會_翰林/*.json"),
    os.path.join(DATA_ROOT, "三下/三下_社會_康軒/*.json"),
    os.path.join(DATA_ROOT, "三下/三下_社會_南一/*.json"),
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
            sys.exit("Legal code section is not a list: %s" % section)
        for row in rows:
            if isinstance(row, dict) and isinstance(row.get("code"), str):
                codes.add(row["code"])
    if len(codes) != EXPECTED_LEGAL_CODES:
        sys.exit(
            "Expected %d legal codes, got %d from %s"
            % (EXPECTED_LEGAL_CODES, len(codes), repo_rel(path))
        )
    return codes


def code_text(candidate):
    if not isinstance(candidate, dict):
        return ""
    code = candidate.get("code")
    if isinstance(code, str):
        return code
    return ""


def confidence_value(candidate):
    if not isinstance(candidate, dict):
        return None
    confidence = candidate.get("confidence")
    if isinstance(confidence, (int, float)):
        return float(confidence)
    if isinstance(confidence, str):
        try:
            return float(confidence)
        except ValueError:
            return None
    return None


def display_code(code):
    if code:
        return code
    return "<missing>"


def question_label(question, index):
    if isinstance(question, dict) and question.get("question_id"):
        return str(question.get("question_id"))
    return "question#%d" % (index + 1)


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
        raw_candidates = question.get("codes_candidate", [])
        if isinstance(raw_candidates, list):
            candidates = raw_candidates
        else:
            overflow_count = add_detail(
                details,
                overflow_count,
                "%s codes_candidate is not a list; treated as empty" % label,
            )

    seen = {}
    for idx, candidate in enumerate(candidates):
        code = code_text(candidate)
        if code not in legal_codes:
            counters["A"] += 1
            overflow_count = add_detail(
                details,
                overflow_count,
                "A illegal at %s candidate#%d: %s" % (label, idx + 1, display_code(code)),
            )
        if STAGE_MARK not in code:
            counters["B"] += 1
            overflow_count = add_detail(
                details,
                overflow_count,
                "B wrong stage at %s candidate#%d: %s" % (label, idx + 1, display_code(code)),
            )

        confidence = confidence_value(candidate)
        if code in seen:
            seen[code]["count"] += 1
            seen[code]["duplicate_indexes"].append(idx + 1)
            best_confidence = seen[code]["best_confidence"]
            if confidence is not None and (best_confidence is None or confidence > best_confidence):
                seen[code]["best_confidence"] = confidence
                seen[code]["best_index"] = idx + 1
        else:
            seen[code] = {
                "count": 1,
                "best_confidence": confidence,
                "best_index": idx + 1,
                "duplicate_indexes": [],
            }

    for code, info in sorted(seen.items()):
        duplicate_count = info["count"] - 1
        if duplicate_count <= 0:
            continue
        counters["C"] += duplicate_count
        confidence = info["best_confidence"]
        confidence_text = "unknown" if confidence is None else ("%g" % confidence)
        overflow_count = add_detail(
            details,
            overflow_count,
            "C duplicate at %s: %s x%d; keep candidate#%d confidence=%s"
            % (label, display_code(code), info["count"], info["best_index"], confidence_text),
        )

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
    for question_index, question in enumerate(questions):
        count, overflow_count = validate_question(
            question,
            question_index,
            legal_codes,
            counters,
            details,
            overflow_count,
        )
        total_codes += count

    violations = counters["A"] + counters["B"] + counters["C"]
    action, rate = classify_action(total_codes, violations)
    if overflow_count:
        details.append("... %d more detail(s) omitted" % overflow_count)

    return {
        "file": repo_rel(path),
        "questions_n": len(questions),
        "total_codes": total_codes,
        "violations": {
            "A": counters["A"],
            "B": counters["B"],
            "C": counters["C"],
        },
        "violation_rate_pct": round(rate, 2),
        "action": action,
        "details": details,
    }


def build_report(files, legal_codes):
    per_file = []
    total_questions = 0
    total_codes = 0
    violation_totals = {"A_illegal": 0, "B_wrong_stage": 0, "C_duplicate": 0}
    actions = {"auto_corrected": 0, "flagged_for_rerun": 0, "manual_review": 0, "clean": 0}

    for path in files:
        item = validate_file(path, legal_codes)
        per_file.append(item)
        total_questions += item["questions_n"]
        total_codes += item["total_codes"]
        violation_totals["A_illegal"] += item["violations"]["A"]
        violation_totals["B_wrong_stage"] += item["violations"]["B"]
        violation_totals["C_duplicate"] += item["violations"]["C"]
        actions[item["action"]] += 1

    return {
        "_meta": {
            "validated_at": datetime.datetime.now().astimezone().isoformat(timespec="seconds"),
            "total_files": len(files),
            "total_questions": total_questions,
            "total_codes": total_codes,
        },
        "summary": {
            "violations": violation_totals,
            "actions": actions,
        },
        "per_file": per_file,
    }


def print_summary(report):
    violations = report["summary"]["violations"]
    actions = report["summary"]["actions"]
    print(
        "total_files=%d violations(A=%d, B=%d, C=%d) clean=%d corrected=%d flagged=%d manual=%d"
        % (
            report["_meta"]["total_files"],
            violations["A_illegal"],
            violations["B_wrong_stage"],
            violations["C_duplicate"],
            actions["clean"],
            actions["auto_corrected"],
            actions["flagged_for_rerun"],
            actions["manual_review"],
        )
    )


def main():
    files = discover_input_files()
    if len(files) != EXPECTED_FILES:
        sys.exit("Expected %d input files, got %d" % (EXPECTED_FILES, len(files)))

    legal_codes = load_legal_codes(LEGAL_CODES_PATH)
    report = build_report(files, legal_codes)
    write_json(REPORT_PATH, report)
    print_summary(report)


if __name__ == "__main__":
    main()
