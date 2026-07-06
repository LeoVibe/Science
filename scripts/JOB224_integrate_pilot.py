#!/usr/bin/env python3
"""JOB-224 雙來源 MD 全量整合工具。

目前預設 pilot:
- semester/subdir: 三下
- combo: 三下_社會_南一
- output root: knowledge/3_考古題/2_MD淬鍊文字_整合版_Codex

目標：
1. 讀取 Claude / Codex 兩套 MD 與 Claude 額外的長檔名 raw md
2. 以「單一場考試一份 final md」整合輸出
3. 同步產出 `_pre_integration_pairing.json`、`_index.json`、
   `_integration_manifest.json`、`_integration_report.md`
4. 可批次掃描整個 `2_MD淬鍊文字_Claude` / `2_MD淬鍊文字_Codex`
   並輸出到 `2_MD淬鍊文字_整合版_Codex`

設計原則：
- 動態擇優：不是整份選 Claude 或 Codex，而是分開判斷「試卷」與「答案」
- 去重最佳化：若來源檔其實是「題目 + 答案」混合，會盡量拆出答案段
- 寧缺勿濫：答案來源若只有題目、沒有解答鍵，就標記 missing_answer
"""

from __future__ import annotations

import argparse
import difflib
import hashlib
import json
import re
import shutil
from collections import Counter, defaultdict
from dataclasses import dataclass
from datetime import datetime, timezone
from pathlib import Path
from typing import Any, Dict, Iterable, List, Optional, Tuple

import yaml

ROOT = Path(__file__).resolve().parent.parent
CLAUDE_ROOT = ROOT / "knowledge/3_考古題/2_MD淬鍊文字_Claude"
CODEX_ROOT = ROOT / "knowledge/3_考古題/2_MD淬鍊文字_Codex"

PLACEHOLDER_MARKERS = [
    "[EMPTY_EXTRACT]",
    "[EXTRACT_ERROR]",
    "[truncated]",
    "[TRUNCATED]",
    "...(以下省略)",
]

REQUIRED_SECTIONS = [
    "## 整合摘要",
    "## 最佳化正文",
    "## 來源追溯",
    "## 跨來源取捨",
    "## 整合判斷",
]

SECTION_PATTERN = re.compile(
    r"^##\s*(答案原文|試卷原文)（(.+?)）\n(?P<meta>(?:>.*\n)*)\n?```(?:[a-zA-Z0-9_-]+)?\n(?P<code>.*?)\n```",
    re.MULTILINE | re.DOTALL,
)

ANSWER_MARKER_PATTERN = re.compile(r"(?m)^\s*(?:\d+\s*[.、)]\s*)?答案[:：].+$")
SHORT_KEY_LINE_PATTERN = re.compile(
    r"^\s*(?:\d+\s*[.、)]\s*)?[①②③④⑤⑥⑦⑧⑨⑩○╳ㄅㄆㄇㄈA-Da-d][^A-Za-z\n]{0,40}$"
)


@dataclass(frozen=True)
class IntegrationContext:
    sub: str
    combo: str
    output_root_name: str

    @property
    def claude_dir(self) -> Path:
        return CLAUDE_ROOT / self.sub / self.combo

    @property
    def codex_dir(self) -> Path:
        return CODEX_ROOT / self.sub / self.combo

    @property
    def final_dir(self) -> Path:
        return ROOT / "knowledge/3_考古題" / self.output_root_name / self.sub / self.combo

    @property
    def semester(self) -> str:
        return self.combo.split("_", 1)[0]

    @property
    def subject(self) -> str:
        parts = self.combo.split("_")
        return parts[1] if len(parts) >= 2 else ""


def utc_now_iso() -> str:
    return datetime.now(timezone.utc).replace(microsecond=0).isoformat().replace("+00:00", "Z")


def load_json(path: Path) -> dict:
    with path.open(encoding="utf-8") as fh:
        return json.load(fh)


def save_json(path: Path, payload: Any) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(payload, ensure_ascii=False, indent=2), encoding="utf-8")


def list_combo_contexts(output_root_name: str) -> List[IntegrationContext]:
    contexts: List[IntegrationContext] = []
    seen: set[Tuple[str, str]] = set()
    for source_root in (CLAUDE_ROOT, CODEX_ROOT):
        if not source_root.exists():
            continue
        for sub_dir in sorted(path for path in source_root.iterdir() if path.is_dir()):
            for combo_dir in sorted(path for path in sub_dir.iterdir() if path.is_dir()):
                key = (sub_dir.name, combo_dir.name)
                if key in seen:
                    continue
                seen.add(key)
                contexts.append(
                    IntegrationContext(
                        sub=sub_dir.name,
                        combo=combo_dir.name,
                        output_root_name=output_root_name,
                    )
                )
    return sorted(contexts, key=lambda ctx: (ctx.sub, ctx.combo))


def parse_frontmatter(md_path: Path) -> Tuple[Optional[dict], str, str]:
    try:
        text = md_path.read_text(encoding="utf-8")
    except FileNotFoundError:
        return None, "", ""
    match = re.match(r"^---\n(.*?)\n---\n?(.*)$", text, re.DOTALL)
    if not match:
        return None, text, text
    try:
        frontmatter = yaml.safe_load(match.group(1))
    except Exception:
        frontmatter = None
    return frontmatter, match.group(2), text


def non_ws_chars(text: str) -> int:
    cleaned = text
    for marker in PLACEHOLDER_MARKERS:
        cleaned = cleaned.replace(marker, "")
    return sum(1 for char in cleaned if not char.isspace())


def infer_kind(filename: str) -> str:
    if "答案" in filename:
        return "答案"
    if "試卷" in filename:
        return "試卷"
    return "未知"


def file_ext(filename: str) -> str:
    return Path(filename).suffix.lower()


def clean_text(text: str) -> str:
    cleaned = text.replace("\r\n", "\n").replace("\r", "\n")
    cleaned = cleaned.replace("\\_", "_")
    cleaned = re.sub(r"\*\*(.*?)\*\*", r"\1", cleaned)
    cleaned = re.sub(r"!\[[^\]]*\]\(data:image[^)]+\)", "", cleaned)
    cleaned = re.sub(r"(?m)^\s*\d+\s*$", "", cleaned)
    cleaned = re.sub(r"[ \t]+\n", "\n", cleaned)
    cleaned = re.sub(r"\n{3,}", "\n\n", cleaned)
    return cleaned.strip()


def data_image_markers(text: str) -> int:
    return len(re.findall(r"!\[[^\]]*\]\(data:image", text))


def normalize_for_similarity(text: str) -> str:
    text = clean_text(text)
    text = re.sub(r"\s+", "", text)
    return text[:4000]


def similarity_ratio(a: str, b: str) -> float:
    if not a or not b:
        return 0.0
    return difflib.SequenceMatcher(None, normalize_for_similarity(a), normalize_for_similarity(b)).ratio()


def suspicious_merge_penalty(text: str) -> int:
    penalties = 0
    penalties += 45 * len(re.findall(r"共\s*\d+\s*分\s*\(\s*\)\d+", text))
    penalties += 30 * len(re.findall(r"[。；：]\s+\(\s*\)\d+", text))
    penalties += 20 * len(re.findall(r"資訊。\s*①", text))
    penalties += 8 * sum(1 for line in text.splitlines() if len(line) > 120)
    return penalties


def parse_meta_block(meta_block: str) -> Dict[str, Any]:
    method_match = re.search(r"抽取方法：`([^`]+)`", meta_block)
    chars_match = re.search(r"非空白字數：`(\d+)`", meta_block)
    flags_match = re.search(r"品質旗標：`([^`]+)`", meta_block)
    flags = []
    if flags_match:
        flags = [flag.strip() for flag in flags_match.group(1).split(",") if flag.strip()]
    return {
        "method": method_match.group(1) if method_match else None,
        "chars_hint": int(chars_match.group(1)) if chars_match else None,
        "quality_flags": flags,
    }


def parse_section_chunks(md_path: Path, agent: str, origin: str) -> List[dict]:
    frontmatter, body, _ = parse_frontmatter(md_path)
    if not body:
        return []
    chunks: List[dict] = []
    for match in SECTION_PATTERN.finditer(body):
        raw_kind = match.group(1)
        filename = match.group(2)
        code = match.group("code")
        meta = parse_meta_block(match.group("meta") or "")
        cleaned = clean_text(code)
        chunks.append(
            {
                "declared_kind": "答案" if raw_kind == "答案原文" else "試卷",
                "filename": filename,
                "agent": agent,
                "origin": origin,
                "path": str(md_path.relative_to(ROOT)),
                "text": cleaned,
                "chars": non_ws_chars(cleaned),
                "data_image_markers": data_image_markers(code),
                "method_hint": meta["method"],
                "meta_quality_flags": meta["quality_flags"],
                "frontmatter": frontmatter or {},
            }
        )
    return chunks


def parse_aux_doc(path: Path, source_filename: str) -> dict:
    text = clean_text(path.read_text(encoding="utf-8"))
    return {
        "declared_kind": infer_kind(source_filename),
        "filename": source_filename,
        "agent": "Claude",
        "origin": "claude_aux_md",
        "path": str(path.relative_to(ROOT)),
        "text": text,
        "chars": non_ws_chars(text),
        "data_image_markers": data_image_markers(text),
        "method_hint": None,
        "meta_quality_flags": [],
        "frontmatter": {},
    }


def split_combined_text(text: str) -> Tuple[str, str]:
    cleaned = clean_text(text)
    if not cleaned:
        return "", ""

    marker = ANSWER_MARKER_PATTERN.search(cleaned)
    if marker:
        before = cleaned[: marker.start()].strip()
        after = cleaned[marker.start() :].strip()
        if non_ws_chars(before) >= 120 and non_ws_chars(after) >= 20:
            return before, after
        return "", after

    lines = [line.rstrip() for line in cleaned.splitlines()]
    tail_lines = [line.strip() for line in lines if line.strip()][-40:]
    short_key_lines = [line for line in tail_lines if len(line) <= 45 and SHORT_KEY_LINE_PATTERN.search(line)]
    if len(short_key_lines) >= 4:
        first_key = short_key_lines[0]
        idx = cleaned.rfind(first_key)
        if idx > 80:
            before = cleaned[:idx].strip()
            after = "\n".join(short_key_lines).strip()
            if non_ws_chars(after) >= 20:
                return before, after
        return "", "\n".join(short_key_lines).strip()

    return cleaned, ""


def chunk_signature(chunk: dict, derived_kind: str, text: str) -> str:
    key = f"{chunk['agent']}|{chunk['filename']}|{derived_kind}|{normalize_for_similarity(text)[:600]}"
    return hashlib.sha1(key.encode("utf-8")).hexdigest()


def source_catalog_from_pair(pair: dict) -> List[dict]:
    grouped: Dict[Tuple[str, str], dict] = {}
    for src in pair.get("sources_ground_truth", []):
        sha = src.get("sha256") or ""
        kind = src.get("kind") or infer_kind(src["filename"])
        key = (sha, kind)
        entry = grouped.get(key)
        if not entry:
            entry = {
                "filename": src["filename"],
                "sha256": sha,
                "kind": kind,
                "method": src.get("method"),
                "source_relpath": src.get("source_relpath"),
                "non_ws_chars": src.get("non_ws_chars"),
                "quality_flags": list(src.get("quality_flags", [])),
                "aliases": [],
            }
            grouped[key] = entry
            continue
        entry["aliases"].append(src["filename"])
        if not entry.get("method") and src.get("method"):
            entry["method"] = src["method"]
        if not entry.get("source_relpath") and src.get("source_relpath"):
            entry["source_relpath"] = src["source_relpath"]
        if entry.get("non_ws_chars") in (None, 0) and src.get("non_ws_chars"):
            entry["non_ws_chars"] = src["non_ws_chars"]
        for flag in src.get("quality_flags", []):
            if flag not in entry["quality_flags"]:
                entry["quality_flags"].append(flag)
    catalog = sorted(grouped.values(), key=lambda item: (item["kind"], item["filename"]))
    for entry in catalog:
        aliases = sorted(set(alias for alias in entry["aliases"] if alias != entry["filename"]))
        entry["aliases"] = aliases
    return catalog


def build_pairing(ctx: IntegrationContext) -> dict:
    claude_index = load_json(ctx.claude_dir / "_index.json")
    codex_index = load_json(ctx.codex_dir / "_index.json")
    claude_doc_index = load_json(ctx.claude_dir / "_doc_index.json") if (ctx.claude_dir / "_doc_index.json").exists() else {"files": []}

    claude_files = {file["filename"]: file for file in claude_index.get("files", [])}
    codex_files = {file["filename"]: file for file in codex_index.get("files", [])}

    aux_doc_map: Dict[str, List[dict]] = defaultdict(list)
    for doc in claude_doc_index.get("files", []):
        aux_doc_map[doc["file"]].append(doc)

    all_filenames = sorted(set(claude_files) | set(codex_files))
    pairs: List[dict] = []

    for filename in all_filenames:
        claude_entry = claude_files.get(filename)
        codex_entry = codex_files.get(filename)
        meta_source = claude_entry or codex_entry or {}

        claude_md_path = ctx.claude_dir / filename if claude_entry else None
        codex_md_path = ctx.codex_dir / filename if codex_entry else None

        claude_chars = 0
        if claude_md_path and claude_md_path.exists():
            _, body, _ = parse_frontmatter(claude_md_path)
            claude_chars = non_ws_chars(body)

        codex_chars = codex_entry.get("total_non_ws_chars", 0) if codex_entry else 0
        codex_flags = codex_entry.get("quality_flags", []) if codex_entry else []

        if claude_entry and codex_entry:
            codex_full = codex_chars > 0 and not any(
                flag in codex_flags for flag in ("extract_error", "paper_empty", "answer_empty", "empty_extract")
            )
            codex_partial = codex_chars > 0 and not codex_full
            if claude_chars > 200 and codex_full:
                status = "both_have_content"
            elif claude_chars > 200 and codex_partial:
                status = "claude_has_codex_partial"
            elif claude_chars > 200 and codex_chars == 0:
                status = "claude_only_has_content"
            elif claude_chars <= 200 and codex_chars > 0:
                status = "codex_only_has_content"
            else:
                status = "both_empty"
        elif claude_entry:
            status = "claude_only_exists"
        else:
            status = "codex_only_exists"

        sources_ground_truth: List[dict] = []
        source_names: set[str] = set()
        if claude_entry:
            for source in claude_entry.get("pdf_files", []) or []:
                source_names.add(source["filename"])
                sources_ground_truth.append(
                    {
                        "filename": source["filename"],
                        "sha256": source["sha256"],
                        "kind": infer_kind(source["filename"]),
                        "trace_from": "claude_index.pdf_files",
                    }
                )
        if codex_entry:
            for source in codex_entry.get("source_files", []) or []:
                source_names.add(source["filename"])
                sources_ground_truth.append(
                    {
                        "filename": source["filename"],
                        "sha256": source["sha256"],
                        "kind": source.get("kind") or infer_kind(source["filename"]),
                        "method": source.get("method"),
                        "source_relpath": source.get("source_relpath"),
                        "non_ws_chars": source.get("non_ws_chars"),
                        "quality_flags": source.get("quality_flags", []),
                        "trace_from": "codex_index.source_files",
                    }
                )

        aux_docs = []
        for source_name in sorted(source_names):
            for doc in aux_doc_map.get(source_name, []):
                aux_docs.append(
                    {
                        "source_file": doc["file"],
                        "out_md": doc["out_md"],
                        "engine": doc.get("engine"),
                        "char_count": doc.get("char_count"),
                    }
                )

        pairs.append(
            {
                "filename": filename,
                "publisher": meta_source.get("publisher"),
                "academic_year": meta_source.get("year"),
                "source_school": meta_source.get("school"),
                "exam_type": meta_source.get("exam_type"),
                "integration_status": status,
                "claude": {
                    "exists": claude_entry is not None,
                    "md_path": str(claude_md_path.relative_to(ROOT)) if claude_md_path else None,
                    "body_non_ws_chars": claude_chars,
                    "topic_hits": claude_entry.get("topic_hits") if claude_entry else None,
                    "pdf_files": claude_entry.get("pdf_files") if claude_entry else None,
                },
                "codex": {
                    "exists": codex_entry is not None,
                    "md_path": str(codex_md_path.relative_to(ROOT)) if codex_md_path else None,
                    "total_non_ws_chars": codex_chars,
                    "quality_flags": codex_flags,
                    "source_files": codex_entry.get("source_files") if codex_entry else None,
                },
                "sources_ground_truth": sources_ground_truth,
                "claude_aux_docs": aux_docs,
            }
        )

    return {
        "combo": ctx.combo,
        "sub": ctx.sub,
        "output_root_name": ctx.output_root_name,
        "created_at": utc_now_iso(),
        "claude_md_count": len(claude_files),
        "codex_md_count": len(codex_files),
        "pair_count": len(pairs),
        "status_distribution": dict(Counter(pair["integration_status"] for pair in pairs)),
        "pairs": pairs,
    }


def gather_chunks(ctx: IntegrationContext, pair: dict) -> List[dict]:
    chunks: List[dict] = []
    seen_signatures: set[str] = set()

    if pair["claude"]["exists"]:
        path = ROOT / pair["claude"]["md_path"]
        chunks.extend(parse_section_chunks(path, agent="Claude", origin="claude_indexed_md"))
    if pair["codex"]["exists"]:
        path = ROOT / pair["codex"]["md_path"]
        chunks.extend(parse_section_chunks(path, agent="Codex", origin="codex_indexed_md"))

    for aux in pair.get("claude_aux_docs", []):
        aux_path = ROOT / aux["out_md"]
        if aux_path.exists():
            chunks.append(parse_aux_doc(aux_path, aux["source_file"]))

    deduped: List[dict] = []
    for chunk in chunks:
        signature = chunk_signature(chunk, chunk["declared_kind"], chunk["text"])
        if signature in seen_signatures:
            continue
        seen_signatures.add(signature)
        question_text, answer_text = split_combined_text(chunk["text"])
        chunk["question_text"] = question_text
        chunk["answer_text"] = answer_text
        deduped.append(chunk)
    return deduped


def build_paper_candidates(chunks: Iterable[dict]) -> List[dict]:
    candidates: List[dict] = []
    seen: set[str] = set()
    for chunk in chunks:
        question_text = chunk.get("question_text") or chunk.get("text") or ""
        if non_ws_chars(question_text) < 80:
            continue
        candidate = dict(chunk)
        candidate["candidate_text"] = question_text
        candidate["candidate_chars"] = non_ws_chars(question_text)
        signature = chunk_signature(candidate, "paper", question_text)
        if signature in seen:
            continue
        seen.add(signature)
        candidates.append(candidate)
    return candidates


def score_paper_candidate(candidate: dict) -> int:
    ext = file_ext(candidate["filename"])
    score = candidate["candidate_chars"]
    score -= suspicious_merge_penalty(candidate["candidate_text"])
    score -= candidate.get("data_image_markers", 0) * 120
    if candidate["agent"] == "Claude":
        score += 120
    if candidate["agent"] == "Codex" and ext in (".doc", ".docx"):
        score += 240
    elif candidate["agent"] == "Codex" and ext == ".pdf":
        score -= 80
    if candidate["origin"] == "claude_aux_md":
        score -= 40
    if candidate["declared_kind"] == "答案":
        score -= 25
    return score


def choose_paper_candidate(candidates: List[dict]) -> Optional[dict]:
    if not candidates:
        return None
    ranked = sorted(candidates, key=score_paper_candidate, reverse=True)
    chosen = dict(ranked[0])
    chosen["score"] = score_paper_candidate(chosen)
    return chosen


def classify_answer_candidate(text: str, paper_text: str) -> dict:
    cleaned = clean_text(text)
    chars = non_ws_chars(cleaned)
    if chars == 0:
        return {"status": "empty", "text": "", "chars": 0, "similarity_to_paper": 0.0}

    marker = ANSWER_MARKER_PATTERN.search(cleaned)
    if marker:
        extracted = cleaned[marker.start() :].strip()
        return {
            "status": "answer_key",
            "text": extracted,
            "chars": non_ws_chars(extracted),
            "similarity_to_paper": similarity_ratio(cleaned, paper_text),
        }

    lines = [line.strip() for line in cleaned.splitlines() if line.strip()]
    short_key_lines = [line for line in lines if len(line) <= 45 and SHORT_KEY_LINE_PATTERN.search(line)]
    similarity = similarity_ratio(cleaned, paper_text)
    if similarity >= 0.72:
        return {
            "status": "question_only",
            "text": "",
            "chars": 0,
            "similarity_to_paper": similarity,
        }
    if len(short_key_lines) >= 4:
        extracted = "\n".join(short_key_lines).strip()
        return {
            "status": "answer_key",
            "text": extracted,
            "chars": non_ws_chars(extracted),
            "similarity_to_paper": similarity,
        }
    return {
        "status": "ambiguous",
        "text": "",
        "chars": 0,
        "similarity_to_paper": similarity,
    }


def build_answer_candidates(chunks: Iterable[dict], paper_text: str) -> List[dict]:
    candidates: List[dict] = []
    seen: set[str] = set()
    for chunk in chunks:
        if chunk.get("answer_text"):
            extracted = clean_text(chunk["answer_text"])
            if non_ws_chars(extracted) >= 20:
                candidate = dict(chunk)
                candidate["candidate_text"] = extracted
                candidate["candidate_chars"] = non_ws_chars(extracted)
                candidate["answer_analysis"] = {
                    "status": "answer_key",
                    "text": extracted,
                    "chars": candidate["candidate_chars"],
                    "similarity_to_paper": similarity_ratio(extracted, paper_text),
                }
                signature = chunk_signature(candidate, "answer", extracted)
                if signature not in seen:
                    seen.add(signature)
                    candidates.append(candidate)
                continue

        if chunk["declared_kind"] != "答案":
            continue
        analysis = classify_answer_candidate(chunk["text"], paper_text)
        if analysis["status"] != "answer_key":
            candidate = dict(chunk)
            candidate["candidate_text"] = ""
            candidate["candidate_chars"] = 0
            candidate["answer_analysis"] = analysis
            candidates.append(candidate)
            continue
        candidate = dict(chunk)
        candidate["candidate_text"] = analysis["text"]
        candidate["candidate_chars"] = analysis["chars"]
        candidate["answer_analysis"] = analysis
        signature = chunk_signature(candidate, "answer", analysis["text"])
        if signature not in seen:
            seen.add(signature)
            candidates.append(candidate)
    return candidates


def score_answer_candidate(candidate: dict) -> int:
    ext = file_ext(candidate["filename"])
    score = candidate["candidate_chars"]
    if candidate["agent"] == "Codex" and ext in (".doc", ".docx"):
        score += 180
    elif candidate["agent"] == "Claude":
        score += 90
    if candidate["origin"] == "claude_aux_md":
        score -= 25
    if candidate.get("data_image_markers"):
        score -= 80
    return score


def choose_answer_candidate(candidates: List[dict]) -> Tuple[Optional[dict], List[str]]:
    signals: List[str] = []
    viable = [candidate for candidate in candidates if candidate.get("answer_analysis", {}).get("status") == "answer_key"]
    if viable:
        ranked = sorted(viable, key=score_answer_candidate, reverse=True)
        chosen = dict(ranked[0])
        chosen["score"] = score_answer_candidate(chosen)
        return chosen, signals

    if any(candidate.get("answer_analysis", {}).get("status") == "question_only" for candidate in candidates):
        signals.append("answer_source_question_only")
    elif any(candidate.get("answer_analysis", {}).get("status") == "ambiguous" for candidate in candidates):
        signals.append("answer_source_ambiguous")
    else:
        signals.append("missing_answer")
    return None, signals


def explain_paper_choice(chosen: Optional[dict], all_candidates: List[dict], pair: dict) -> str:
    if not chosen:
        return "兩邊都沒有可用試卷文字。"
    ext = file_ext(chosen["filename"])
    if len([candidate for candidate in all_candidates if candidate["candidate_chars"] > 0]) == 1:
        return "只有單一來源有可用試卷文字，因此直接採用。"
    if chosen["agent"] == "Codex" and ext in (".doc", ".docx"):
        return "來源為 Word，Codex 的 `markitdown` 結構較乾淨，因此採用。"
    if chosen["agent"] == "Claude" and ext == ".pdf":
        return "來源為 PDF，Claude 版的換行與題目切分較完整，因此採用。"
    if chosen["declared_kind"] == "答案":
        return "正式試卷段缺失，以答案檔內仍可讀的題目段落回填。"
    if "extract_error" in (pair["codex"].get("quality_flags") or []):
        return "Codex 抽取失敗，因此改採 Claude。"
    return "綜合可讀性、來源格式與缺失狀態後，採用此版本。"


def explain_answer_choice(chosen: Optional[dict], signals: List[str]) -> str:
    if chosen:
        if chosen.get("answer_text"):
            return "來源檔同時含題目與解答，本次只保留可辨識的答案段。"
        return "答案檔可辨識出解答鍵，因此採用。"
    if "answer_source_question_only" in signals:
        return "答案來源檔與試卷高度重疊，但未見明確解答鍵，因此標記為 source_without_key。"
    if "answer_source_ambiguous" in signals:
        return "答案來源有內容，但無法穩定辨識解答鍵，暫不硬塞進 final md。"
    return "現有答案來源為空白或抽取失敗，無法產出可用答案。"


def render_source_trace_table(source_catalog: List[dict]) -> str:
    lines = [
        "| 類型 | 主檔名 | sha256 | 方法 | 別名 | 備註 |",
        "|:--|:--|:--|:--|:--|:--|",
    ]
    for source in source_catalog:
        aliases = "<br>".join(f"`{alias}`" for alias in source.get("aliases", [])) or "-"
        notes = ", ".join(source.get("quality_flags", [])) or "-"
        method = source.get("method") or "unknown"
        lines.append(
            f"| {source['kind']} | `{source['filename']}` | `{source['sha256'][:12]}...` | `{method}` | {aliases} | {notes} |"
        )
    return "\n".join(lines)


def render_cross_source_notes(
    paper_choice: Optional[dict],
    answer_choice: Optional[dict],
    answer_signals: List[str],
    aux_docs: List[dict],
) -> str:
    lines = []
    if paper_choice:
        lines.append(
            f"- 試卷採用 `{paper_choice['agent']}`｜`{paper_choice['filename']}`｜{paper_choice['candidate_chars']} 字。"
        )
    else:
        lines.append("- 試卷：無可用來源。")
    if answer_choice:
        lines.append(
            f"- 答案採用 `{answer_choice['agent']}`｜`{answer_choice['filename']}`｜{answer_choice['candidate_chars']} 字。"
        )
    else:
        lines.append(f"- 答案：未納入正文；原因旗標 `{', '.join(answer_signals)}`。")
    if aux_docs:
        lines.append(f"- Claude 額外長檔名 raw md 參考 `{len(aux_docs)}` 份，已納入比對與去重判斷。")
    else:
        lines.append("- 本題組沒有額外的 Claude 長檔名 raw md。")
    return "\n".join(lines)


def build_quality_flags(pair: dict, paper_choice: Optional[dict], answer_choice: Optional[dict], answer_signals: List[str]) -> List[str]:
    flags: List[str] = []
    for flag in pair["codex"].get("quality_flags") or []:
        if flag == "duplicate_source_merged":
            continue
        prefixed = f"codex_{flag}"
        if prefixed not in flags:
            flags.append(prefixed)
    if not paper_choice:
        flags.append("missing_paper")
    if answer_choice is None:
        for signal in answer_signals:
            if signal not in flags:
                flags.append(signal)
    if paper_choice and paper_choice.get("data_image_markers"):
        flags.append("paper_data_image_removed")
    if answer_choice and answer_choice.get("data_image_markers"):
        flags.append("answer_data_image_removed")
    return flags


def derive_primary_agent(paper_choice: Optional[dict], answer_choice: Optional[dict]) -> str:
    agents = {candidate["agent"] for candidate in (paper_choice, answer_choice) if candidate}
    if not agents:
        return "None"
    if len(agents) == 1:
        return next(iter(agents))
    return "Hybrid"


def render_final_md(ctx: IntegrationContext, pair: dict, decision: dict) -> str:
    source_catalog = decision["source_catalog"]
    frontmatter = {
        "publisher": pair["publisher"],
        "academic_year": str(pair["academic_year"]),
        "source_school": pair["source_school"],
        "exam_type": pair["exam_type"],
        "semester": ctx.semester,
        "subject": ctx.subject,
        "combo": ctx.combo,
        "integration_status": pair["integration_status"],
        "primary_agent": decision["primary_agent"],
        "paper_source_agent": decision["paper_source_agent"],
        "paper_source_file": decision["paper_source_file"],
        "paper_chars": decision["paper_chars"],
        "answer_status": decision["answer_status"],
        "answer_source_agent": decision["answer_source_agent"],
        "answer_source_file": decision["answer_source_file"],
        "answer_chars": decision["answer_chars"],
        "available_agents": [agent for agent in ["Claude", "Codex"] if pair[agent.lower()]["exists"]],
        "quality_flags": decision["quality_flags"],
        "integrated_date": datetime.now().date().isoformat(),
        "integrated_by": "Codex via scripts/JOB224_integrate_pilot.py",
        "source_files": source_catalog,
    }
    if pair.get("claude_aux_docs"):
        frontmatter["claude_aux_docs"] = pair["claude_aux_docs"]

    yaml_text = yaml.safe_dump(frontmatter, allow_unicode=True, sort_keys=False)
    title = f"# {ctx.semester} {ctx.subject} {pair['publisher']}｜{pair['source_school']} {pair['academic_year']} 學年度 {pair['exam_type']}"
    summary_table = "\n".join(
        [
            "| 項目 | 內容 |",
            "|:--|:--|",
            f"| 整合狀態 | `{pair['integration_status']}` |",
            f"| 主來源 | `{decision['primary_agent']}` |",
            f"| 試卷採用 | `{decision['paper_source_agent']}` / `{decision['paper_source_file']}` / {decision['paper_chars']} 字 |",
            f"| 答案狀態 | `{decision['answer_status']}` |",
            f"| 答案採用 | `{decision['answer_source_agent'] or '-'}` / `{decision['answer_source_file'] or '-'}` / {decision['answer_chars']} 字 |",
            f"| 品質旗標 | {', '.join(decision['quality_flags']) if decision['quality_flags'] else '-'} |",
        ]
    )

    paper_block = "無可用試卷文字。"
    if decision["paper_text"]:
        paper_block = (
            f"> 來源：`{decision['paper_source_agent']}`｜`{decision['paper_source_file']}`\n"
            f"> 理由：{decision['paper_reason']}\n\n"
            f"```text\n{decision['paper_text']}\n```"
        )

    if decision["answer_text"]:
        answer_block = (
            f"> 來源：`{decision['answer_source_agent']}`｜`{decision['answer_source_file']}`\n"
            f"> 理由：{decision['answer_reason']}\n\n"
            f"```text\n{decision['answer_text']}\n```"
        )
    else:
        answer_block = f"> `{decision['answer_status']}`：{decision['answer_reason']}"

    sections = [
        "---",
        yaml_text.rstrip(),
        "---",
        "",
        title,
        "",
        "## 整合摘要",
        "",
        summary_table,
        "",
        "## 最佳化正文",
        "",
        "### 試卷",
        "",
        paper_block,
        "",
        "### 答案",
        "",
        answer_block,
        "",
        "## 來源追溯",
        "",
        render_source_trace_table(source_catalog),
        "",
        "## 跨來源取捨",
        "",
        render_cross_source_notes(
            decision["paper_choice"],
            decision["answer_choice"],
            decision["answer_signals"],
            pair.get("claude_aux_docs", []),
        ),
        "",
        "## 整合判斷",
        "",
        f"- 後續 agent 可直接使用 `### 試卷` 段落；`answer_status={decision['answer_status']}` 為答案可用性判斷基準。",
        f"- 試卷判斷：{decision['paper_reason']}",
        f"- 答案判斷：{decision['answer_reason']}",
    ]
    return "\n".join(sections).rstrip() + "\n"


def integrate_pair(ctx: IntegrationContext, pair: dict) -> dict:
    source_catalog = source_catalog_from_pair(pair)
    chunks = gather_chunks(ctx, pair)

    paper_candidates = build_paper_candidates(chunks)
    paper_choice = choose_paper_candidate(paper_candidates)
    paper_text = paper_choice["candidate_text"] if paper_choice else ""

    answer_candidates = build_answer_candidates(chunks, paper_text)
    answer_choice, answer_signals = choose_answer_candidate(answer_candidates)
    answer_text = answer_choice["candidate_text"] if answer_choice else ""

    answer_status = "available" if answer_choice else "missing_answer"
    if not answer_choice and "answer_source_question_only" in answer_signals:
        answer_status = "source_without_key"
    elif not answer_choice and "answer_source_ambiguous" in answer_signals:
        answer_status = "ambiguous_answer_source"

    primary_agent = derive_primary_agent(paper_choice, answer_choice)
    paper_reason = explain_paper_choice(paper_choice, paper_candidates, pair)
    answer_reason = explain_answer_choice(answer_choice, answer_signals)
    quality_flags = build_quality_flags(pair, paper_choice, answer_choice, answer_signals)

    decision = {
        "filename": pair["filename"],
        "source_catalog": source_catalog,
        "paper_choice": paper_choice,
        "paper_text": paper_text,
        "paper_chars": non_ws_chars(paper_text),
        "paper_source_agent": paper_choice["agent"] if paper_choice else None,
        "paper_source_file": paper_choice["filename"] if paper_choice else None,
        "paper_reason": paper_reason,
        "answer_choice": answer_choice,
        "answer_text": answer_text,
        "answer_chars": non_ws_chars(answer_text),
        "answer_source_agent": answer_choice["agent"] if answer_choice else None,
        "answer_source_file": answer_choice["filename"] if answer_choice else None,
        "answer_status": answer_status,
        "answer_reason": answer_reason,
        "answer_signals": answer_signals,
        "primary_agent": primary_agent,
        "quality_flags": quality_flags,
    }
    return decision


def build_index_entry(pair: dict, decision: dict) -> dict:
    return {
        "filename": pair["filename"],
        "publisher": pair["publisher"],
        "year": str(pair["academic_year"]),
        "school": pair["source_school"],
        "exam_type": pair["exam_type"],
        "integration_status": pair["integration_status"],
        "primary_agent": decision["primary_agent"],
        "paper_source_agent": decision["paper_source_agent"],
        "paper_source_file": decision["paper_source_file"],
        "paper_chars": decision["paper_chars"],
        "answer_status": decision["answer_status"],
        "answer_source_agent": decision["answer_source_agent"],
        "answer_source_file": decision["answer_source_file"],
        "answer_chars": decision["answer_chars"],
        "quality_flags": decision["quality_flags"],
        "total_non_ws_chars": decision["paper_chars"] + decision["answer_chars"],
        "source_files": decision["source_catalog"],
        "claude_aux_docs": pair.get("claude_aux_docs", []),
        "paper_reason": decision["paper_reason"],
        "answer_reason": decision["answer_reason"],
    }


def stage_b_integrate(ctx: IntegrationContext, pairing: dict) -> dict:
    ctx.final_dir.mkdir(parents=True, exist_ok=True)
    index_entries: List[dict] = []
    paper_source_counts: Counter[str] = Counter()
    answer_status_counts: Counter[str] = Counter()

    for pair in pairing["pairs"]:
        decision = integrate_pair(ctx, pair)
        final_md = render_final_md(ctx, pair, decision)
        (ctx.final_dir / pair["filename"]).write_text(final_md, encoding="utf-8")

        index_entry = build_index_entry(pair, decision)
        index_entries.append(index_entry)
        paper_source_counts[decision["paper_source_agent"] or "None"] += 1
        answer_status_counts[decision["answer_status"]] += 1

    index_payload = {
        "path": str(ctx.final_dir.relative_to(ROOT)),
        "last_updated": utc_now_iso(),
        "integration_source": {
            "claude_dir": str(ctx.claude_dir.relative_to(ROOT)),
            "codex_dir": str(ctx.codex_dir.relative_to(ROOT)),
            "strategy": "section-wise best-of integration with answer-key extraction and source trace consolidation",
        },
        "total_md": len(index_entries),
        "paper_source_counts": dict(paper_source_counts),
        "answer_status_counts": dict(answer_status_counts),
        "files": index_entries,
    }
    save_json(ctx.final_dir / "_index.json", index_payload)
    return index_payload


def stage_d_verify(ctx: IntegrationContext, pairing: dict, index_payload: dict) -> dict:
    results = []
    final_files = sorted(path.name for path in ctx.final_dir.glob("*.md"))
    expected_files = sorted(pair["filename"] for pair in pairing["pairs"])
    expected_without_meta = [name for name in expected_files if not name.startswith("_")]

    for pair in pairing["pairs"]:
        filename = pair["filename"]
        path = ctx.final_dir / filename
        record = {
            "filename": filename,
            "checks": {},
        }
        if not path.exists():
            record["checks"]["exists"] = False
            results.append(record)
            continue
        record["checks"]["exists"] = True

        frontmatter, body, text = parse_frontmatter(path)
        record["checks"]["yaml_valid"] = frontmatter is not None
        record["checks"]["sections_complete"] = all(section in body for section in REQUIRED_SECTIONS)
        record["checks"]["no_placeholders_in_body"] = not any(marker in body for marker in PLACEHOLDER_MARKERS)
        record["checks"]["no_data_image"] = "data:image" not in text

        source_catalog = source_catalog_from_pair(pair)
        expected_shas = sorted(source["sha256"] for source in source_catalog if source.get("sha256"))
        actual_shas = []
        if frontmatter and isinstance(frontmatter.get("source_files"), list):
            actual_shas = sorted(source.get("sha256") for source in frontmatter["source_files"] if isinstance(source, dict))
        record["checks"]["sha256_matches"] = actual_shas == expected_shas

        results.append(record)

    summary = {
        "total_expected_md": len(expected_without_meta),
        "actual_md": len([name for name in final_files if not name.startswith("_")]),
        "expected_files_match": sorted(name for name in final_files if not name.startswith("_")) == expected_without_meta,
        "paper_source_counts": index_payload.get("paper_source_counts", {}),
        "answer_status_counts": index_payload.get("answer_status_counts", {}),
        "check_pass_counts": {
            key: sum(1 for result in results if result["checks"].get(key))
            for key in ["exists", "yaml_valid", "sections_complete", "no_placeholders_in_body", "no_data_image", "sha256_matches"]
        },
        "failures": [
            {
                "filename": result["filename"],
                "failed_checks": [name for name, ok in result["checks"].items() if not ok],
            }
            for result in results
            if not all(result["checks"].values())
        ],
    }
    manifest = {
        "generated_at": utc_now_iso(),
        "combo": ctx.combo,
        "output_dir": str(ctx.final_dir.relative_to(ROOT)),
        "summary": summary,
        "details": results,
    }
    save_json(ctx.final_dir / "_integration_manifest.json", manifest)
    return manifest


def build_report(ctx: IntegrationContext, pairing: dict, index_payload: dict, manifest: dict) -> str:
    status_distribution = pairing["status_distribution"]
    paper_counts = index_payload.get("paper_source_counts", {})
    answer_counts = index_payload.get("answer_status_counts", {})
    missing_answer_files = [
        entry["filename"]
        for entry in index_payload["files"]
        if entry["answer_status"] != "available"
    ]
    aux_total = sum(len(pair.get("claude_aux_docs", [])) for pair in pairing["pairs"])

    lines = [
        f"# 整合測試報告：{ctx.combo}",
        "",
        "## 1. 範圍",
        "",
        f"- 測試時間：`{datetime.now().date().isoformat()}`",
        f"- 來源目錄：`{ctx.claude_dir.relative_to(ROOT)}`、`{ctx.codex_dir.relative_to(ROOT)}`",
        f"- 輸出目錄：`{ctx.final_dir.relative_to(ROOT)}`",
        f"- 題組數：Claude `{pairing['claude_md_count']}` / Codex `{pairing['codex_md_count']}` / Final `{index_payload['total_md']}`",
        "",
        "## 2. 整合流程",
        "",
        "1. 先用 `_index.json` 建立一場考試一份 logical exam group 的配對清單。",
        "2. 同步掃描 Claude 額外長檔名 raw md，將其回掛到對應題組。",
        "3. 逐段拆出候選的 `試卷` / `答案` 文字，不是整份 md 直接二選一。",
        "4. 若來源檔同時含題目與解答，會先拆出 `題目段` 與 `解答段`，避免 final md 重複。",
        "5. 若答案來源只有題目、沒有解答鍵，則標記 `missing_answer` 或 `source_without_key`，不硬塞假答案。",
        "6. 最後產出統一格式 final md，並補 `_index.json`、`_integration_manifest.json`、本報告。",
        "",
        "## 3. 配對分布",
        "",
        "| integration_status | 題組數 |",
        "|:--|--:|",
    ]
    for status, count in sorted(status_distribution.items()):
        lines.append(f"| `{status}` | {count} |")

    lines.extend(
        [
            "",
            "## 4. 正文採用結果",
            "",
            "| 項目 | 分布 |",
            "|:--|:--|",
            f"| 試卷來源 | {', '.join(f'`{key}`={value}' for key, value in sorted(paper_counts.items()))} |",
            f"| 答案狀態 | {', '.join(f'`{key}`={value}' for key, value in sorted(answer_counts.items()))} |",
            f"| Claude 額外長檔名 raw md | `{aux_total}` 份已納入參考 |",
            "",
            "## 5. 高風險觀察",
            "",
            "- 社會科 PDF 類試卷，Claude 版通常比 Codex pdfplumber 版更適合直接閱讀，因此這次 paper 多數偏向採 Claude。",
            "- Word / Docx 類來源若能被 Codex `markitdown` 正常抽到，通常會保有較穩定的段落結構。",
            "- 部分 `答案` 檔名其實只有題目，沒有真正的解答鍵；這次已用 `source_without_key` 明確標示。",
            "",
            "## 6. 待補項目",
            "",
        ]
    )

    if missing_answer_files:
        for filename in missing_answer_files:
            lines.append(f"- `{filename}`：答案仍缺失或答案來源無法穩定辨識。")
    else:
        lines.append("- 本次 pilot 無缺答案題組。")

    lines.extend(
        [
            "",
            "## 7. 驗收摘要",
            "",
            f"- final md 數量是否對齊：`{manifest['summary']['expected_files_match']}`",
            f"- YAML 合法通過數：`{manifest['summary']['check_pass_counts']['yaml_valid']}/{manifest['summary']['total_expected_md']}`",
            f"- 必要章節通過數：`{manifest['summary']['check_pass_counts']['sections_complete']}/{manifest['summary']['total_expected_md']}`",
            f"- 無 placeholder 通過數：`{manifest['summary']['check_pass_counts']['no_placeholders_in_body']}/{manifest['summary']['total_expected_md']}`",
            f"- sha256 對齊通過數：`{manifest['summary']['check_pass_counts']['sha256_matches']}/{manifest['summary']['total_expected_md']}`",
        ]
    )

    if manifest["summary"]["failures"]:
        lines.append("")
        lines.append("### 驗收失敗清單")
        lines.append("")
        for failure in manifest["summary"]["failures"]:
            lines.append(f"- `{failure['filename']}`：{', '.join(failure['failed_checks'])}")

    return "\n".join(lines).rstrip() + "\n"


def stage_all(ctx: IntegrationContext) -> None:
    pairing = build_pairing(ctx)
    save_json(ctx.final_dir / "_pre_integration_pairing.json", pairing)
    index_payload = stage_b_integrate(ctx, pairing)
    manifest = stage_d_verify(ctx, pairing, index_payload)
    report = build_report(ctx, pairing, index_payload, manifest)
    (ctx.final_dir / "_integration_report.md").write_text(report, encoding="utf-8")


def clear_output_dir(output_root_name: str) -> Path:
    target = ROOT / "knowledge/3_考古題" / output_root_name
    if target.exists():
        shutil.rmtree(target)
    target.mkdir(parents=True, exist_ok=True)
    return target


def build_root_summary(output_root_name: str, combo_results: List[dict]) -> dict:
    total_md = sum(item["index"]["total_md"] for item in combo_results)
    paper_source_counts: Counter[str] = Counter()
    answer_status_counts: Counter[str] = Counter()
    integration_status_counts: Counter[str] = Counter()
    combo_summaries: List[dict] = []

    for item in combo_results:
        ctx: IntegrationContext = item["ctx"]
        pairing = item["pairing"]
        index_payload = item["index"]
        manifest = item["manifest"]
        paper_source_counts.update(index_payload.get("paper_source_counts", {}))
        answer_status_counts.update(index_payload.get("answer_status_counts", {}))
        integration_status_counts.update(pairing.get("status_distribution", {}))
        combo_summaries.append(
            {
                "sub": ctx.sub,
                "combo": ctx.combo,
                "path": str(ctx.final_dir.relative_to(ROOT)),
                "total_md": index_payload["total_md"],
                "pair_count": pairing["pair_count"],
                "status_distribution": pairing["status_distribution"],
                "paper_source_counts": index_payload.get("paper_source_counts", {}),
                "answer_status_counts": index_payload.get("answer_status_counts", {}),
                "verification_failures": len(manifest["summary"].get("failures", [])),
            }
        )

    return {
        "generated_at": utc_now_iso(),
        "output_root": output_root_name,
        "combo_count": len(combo_results),
        "total_md": total_md,
        "paper_source_counts": dict(paper_source_counts),
        "answer_status_counts": dict(answer_status_counts),
        "integration_status_counts": dict(integration_status_counts),
        "combos": combo_summaries,
    }


def build_root_report(summary: dict) -> str:
    lines = [
        f"# 全量整合總報告：{summary['output_root']}",
        "",
        "## 1. 總覽",
        "",
        f"- combo 數量：`{summary['combo_count']}`",
        f"- final md 總數：`{summary['total_md']}`",
        f"- 試卷來源分布：{', '.join(f'`{key}`={value}' for key, value in sorted(summary['paper_source_counts'].items()))}",
        f"- 答案狀態分布：{', '.join(f'`{key}`={value}' for key, value in sorted(summary['answer_status_counts'].items()))}",
        "",
        "## 2. integration_status 總分布",
        "",
        "| status | 題組數 |",
        "|:--|--:|",
    ]
    for status, count in sorted(summary["integration_status_counts"].items()):
        lines.append(f"| `{status}` | {count} |")

    lines.extend(
        [
            "",
            "## 3. combo 摘要",
            "",
            "| combo | final md | 狀態分布 | 驗證失敗 |",
            "|:--|--:|:--|--:|",
        ]
    )
    for combo in summary["combos"]:
        status_text = ", ".join(f"{key}={value}" for key, value in sorted(combo["status_distribution"].items()))
        lines.append(
            f"| `{combo['combo']}` | {combo['total_md']} | {status_text} | {combo['verification_failures']} |"
        )
    return "\n".join(lines).rstrip() + "\n"


def stage_all_combos(output_root_name: str) -> dict:
    output_root = clear_output_dir(output_root_name)
    combo_results: List[dict] = []

    for ctx in list_combo_contexts(output_root_name):
        if not (ctx.claude_dir / "_index.json").exists() and not (ctx.codex_dir / "_index.json").exists():
            continue
        stage_all(ctx)
        combo_results.append(
            {
                "ctx": ctx,
                "pairing": load_json(ctx.final_dir / "_pre_integration_pairing.json"),
                "index": load_json(ctx.final_dir / "_index.json"),
                "manifest": load_json(ctx.final_dir / "_integration_manifest.json"),
            }
        )

    summary = build_root_summary(output_root_name, combo_results)
    save_json(output_root / "_integration_dashboard.json", summary)
    (output_root / "_integration_dashboard.md").write_text(build_root_report(summary), encoding="utf-8")
    return summary


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("--stage", choices=["a", "b", "d", "all", "all-combos"], default="all")
    parser.add_argument("--sub", default="三下")
    parser.add_argument("--combo", default="三下_社會_南一")
    parser.add_argument("--output-root-name", default="2_MD淬鍊文字_整合版_Codex")
    args = parser.parse_args()

    ctx = IntegrationContext(sub=args.sub, combo=args.combo, output_root_name=args.output_root_name)
    ctx.final_dir.mkdir(parents=True, exist_ok=True)

    if args.stage == "a":
        pairing = build_pairing(ctx)
        save_json(ctx.final_dir / "_pre_integration_pairing.json", pairing)
        print(f"✅ pairing written: {ctx.final_dir / '_pre_integration_pairing.json'}")
        print(json.dumps(pairing["status_distribution"], ensure_ascii=False, indent=2))
        return

    if args.stage == "b":
        pairing = load_json(ctx.final_dir / "_pre_integration_pairing.json")
        index_payload = stage_b_integrate(ctx, pairing)
        save_json(ctx.final_dir / "_index.json", index_payload)
        print(f"✅ index written: {ctx.final_dir / '_index.json'}")
        return

    if args.stage == "d":
        pairing = load_json(ctx.final_dir / "_pre_integration_pairing.json")
        index_payload = load_json(ctx.final_dir / "_index.json")
        manifest = stage_d_verify(ctx, pairing, index_payload)
        report = build_report(ctx, pairing, index_payload, manifest)
        (ctx.final_dir / "_integration_report.md").write_text(report, encoding="utf-8")
        print(f"✅ manifest written: {ctx.final_dir / '_integration_manifest.json'}")
        return

    if args.stage == "all-combos":
        summary = stage_all_combos(args.output_root_name)
        output_root = ROOT / "knowledge/3_考古題" / args.output_root_name
        print(f"✅ all combos done: {output_root}")
        print(f"   combos: {summary['combo_count']}")
        print(f"   total_md: {summary['total_md']}")
        return

    stage_all(ctx)
    print(f"✅ done: {ctx.final_dir}")


if __name__ == "__main__":
    main()
