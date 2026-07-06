"""JOB-246 Phase 1b — Claude CLI 全量仲裁 dispatch

使用 claude -p --output-format json 呼叫，取得 token 數與 cost。
每 5 份（非 skip）暫停，顯示每份摘要與累計 token，等使用者確認後繼續。

執行：
    python3.11 scripts/jobs/JOB-246/A6c_claude_dispatch.py [--workers N] [--max N] [--dry-run]

建議 workers=2（避免 claude CLI session 衝突）。
"""

import json
import os
import re
import sys
import time
import argparse
import threading
import subprocess
import glob
from collections import Counter
from concurrent.futures import ThreadPoolExecutor, as_completed

ROOT = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../.."))
os.chdir(ROOT)

PARTIAL_DIR = "knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial"
KL3_PATH = "knowledge/1_課綱研究/自然/KL3_四下_自然_研究總綱.md"
KL4_BASE = "knowledge/1_課綱研究/自然/四下"
LOG_DIR = "scripts/jobs/JOB-246/_phase1_logs"
MODEL = "claude-haiku-4-5-20251001"
BATCH_SIZE = 20    # 每批最多 20 題
REPORT_EVERY = 5   # pause and summarize after every N non-skip files

os.makedirs(LOG_DIR, exist_ok=True)

# Thread-safe counters
_lock = threading.Lock()
_total_input = 0
_total_output = 0
_total_cost = 0.0
_processed = 0   # non-skip files


def record_usage(inp: int, out: int, cost: float):
    global _total_input, _total_output, _total_cost
    with _lock:
        _total_input += inp
        _total_output += out
        _total_cost += cost


def load_kl4_context(publisher: str) -> str:
    kl4_dir = os.path.join(KL4_BASE, publisher)
    texts = []
    for fn in sorted(os.listdir(kl4_dir)):
        if "單課研究紀錄" in fn:
            text = open(os.path.join(kl4_dir, fn), encoding="utf-8").read()
            texts.append(f"### {fn}\n\n{text}")
    return "\n\n---\n\n".join(texts)


def extract_pending_questions(partial_data: dict, l2_path: str) -> dict:
    """回傳 {question_id: {stem, options, primary_code, match_rule, ...}}"""
    pending_ids = {
        link["question_id"]
        for link in partial_data.get("l2_to_kl_links", [])
        if link.get("match_rule", "").endswith("_pending")
    }
    if not pending_ids:
        return {}

    l2 = json.load(open(l2_path, encoding="utf-8"))
    q_by_id = {q["question_id"]: q for q in l2.get("questions", [])}

    result = {}
    for link in partial_data.get("l2_to_kl_links", []):
        qid = link["question_id"]
        if qid not in pending_ids:
            continue
        q = q_by_id.get(qid, {})
        opts = q.get("options") or []
        if isinstance(opts, list):
            opts_str = " ".join(f"({chr(65+i)}){o}" for i, o in enumerate(opts[:4]))
        elif isinstance(opts, dict):
            opts_str = " ".join(f"({k}){v}" for k, v in opts.items())
        else:
            opts_str = ""
        result[qid] = {
            "stem": (q.get("stem") or "")[:200],   # truncate very long stems
            "opts": opts_str[:300],
            "primary_code": link.get("primary_code") or "",
            "secondary_codes": link.get("secondary_codes") or [],
            "unit_theme": link.get("unit_theme") or "",
            "match_rule": link["match_rule"],
            "source_l2": link.get("source_l2") or "",
        }
    return result


def build_prompt(kl3: str, kl4_text: str, pending_qs: dict,
                 publisher: str, exam_id: str) -> str:
    lines = []
    for qid, q in pending_qs.items():
        line = (
            f"[{qid}] rule={q['match_rule']} code={q['primary_code']} "
            f"theme={q['unit_theme']}\n  題: {q['stem']}"
        )
        if q["opts"]:
            line += f"\n  選: {q['opts']}"
        lines.append(line)
    questions_block = "\n\n".join(lines)

    return f"""# 四下自然 L3 對齊仲裁（{publisher}，{exam_id}）

## 動詞類前綴群組
- INa-/INb-/INc-/INd-/INe-/INf-/INg-: 學習內容（知識）
- po-: 觀察與提問  pa-: 分析推論  ai-/an-: 態度與興趣  tr-/tm-/tc-/ti-: 探究技能

兩源 codes 必須「同前綴群組 + 同主題前 6 字」才為 N2；否則 needs_human_review 或 N3。

## KL3 總綱
{kl3}

## KL4 單課研究紀錄（{publisher}）
{kl4_text}

---

## 待仲裁題目（{len(pending_qs)} 題）

{questions_block}

---

## 任務

**N1_pending**：確認 primary_code 合理 → match_rule=N1, confidence=high；若不合理 → 改 primary_code + N2 + source_codex

**N2_or_N3_pending**：重判最合適 code，比對 L2 code：
- 同 code → N1, high
- 同前綴+主題 → N2, medium，source_codex=codex 判定 code
- 不同主題/前綴 → needs_human_review, none
- 單源 → N3, medium，source_codex=codex code

**所有題**：kl4_supported=true/false，若 true 補 kl4_link，補 misconception_match

## 輸出（只輸出 JSON，不要說明文字）

```json
{{
  "Q1.1": {{
    "match_rule": "N1",
    "confidence": "high",
    "source_codex": null,
    "primary_code": "INb-Ⅱ-3",
    "kl4_supported": false,
    "kl4_link": null,
    "misconception_match": []
  }}
}}
```

kl4_link 格式：{{"lesson":"L1","knowledge_point":"完全變態四階段","kecode":"0240401"}}
每題必填 7 個欄位，不可遺漏。"""


def _extract_question_entries(text: str) -> dict:
    """從可能不完整的 text 中，以括弧深度追蹤抓出所有完整的 "Qx.y": {...} 條目。
    被 MAX_OUTPUT_TOKENS 截斷的不完整條目會被跳過。"""
    result = {}
    for m in re.finditer(r'"(Q\d+(?:\.\d+)+)"\s*:', text):
        qid = m.group(1)
        obj_start = text.find('{', m.end())
        if obj_start == -1:
            continue
        depth = 0
        obj_end = -1
        for i in range(obj_start, len(text)):
            if text[i] == '{':
                depth += 1
            elif text[i] == '}':
                depth -= 1
                if depth == 0:
                    obj_end = i + 1
                    break
        if obj_end == -1:
            continue  # 未閉合，跳過
        try:
            result[qid] = json.loads(text[obj_start:obj_end])
        except json.JSONDecodeError:
            continue
    return result


def call_claude(prompt: str) -> tuple[str, int, int, float]:
    """呼叫 claude CLI，回傳 (response_text, input_tokens, output_tokens, cost_usd)"""
    env = os.environ.copy()
    env['CLAUDE_CODE_MAX_OUTPUT_TOKENS'] = '3000'

    result = subprocess.run(
        [
            'claude', '-p',
            '--output-format', 'stream-json',
            '--model', MODEL,
            '--allowedTools', '',               # 停用所有工具含 MCP（含 sequential-thinking）
            '--no-session-persistence',
            '--append-system-prompt',
            'MANDATORY OUTPUT RULE: Output ONLY a valid JSON object. '
            'Zero preamble. Zero postamble. Zero reasoning. Zero notes. '
            'Only the JSON. Any text outside the JSON object makes the output invalid.',
        ],
        input=prompt,
        capture_output=True,
        text=True,
        encoding='utf-8',
        timeout=90,          # haiku 42s/批 實測，90s 給 2x 緩衝
        cwd='/tmp',
        env=env,
    )
    raw = result.stdout

    # Parse stream-json: 聚合所有 assistant event 的 text block
    # result.result 只有最後一個 text block（模型因 MAX_OUTPUT_TOKENS 會分成多個 block）
    # 用 _extract_question_entries 逐 block 抓完整條目，後 block 的同 key 覆蓋前 block
    inp = out = 0
    cost = 0.0
    all_questions: dict = {}

    for line in raw.splitlines():
        line = line.strip()
        if not line:
            continue
        try:
            evt = json.loads(line)
        except json.JSONDecodeError:
            continue

        evt_type = evt.get("type")
        if evt_type == "assistant":
            for block in evt.get("message", {}).get("content", []):
                if block.get("type") == "text":
                    text_content = block.get("text", "")
                    # 去掉 ```json / ``` 標記
                    text_content = re.sub(r'^```json?\s*', '', text_content.strip())
                    text_content = re.sub(r'\s*```\s*$', '', text_content)
                    entries = _extract_question_entries(text_content)
                    all_questions.update(entries)
        elif evt_type == "result":
            usage = evt.get("usage", {})
            inp = usage.get("input_tokens", 0) + usage.get("cache_read_input_tokens", 0)
            out = usage.get("output_tokens", 0)
            cost = evt.get("total_cost_usd", 0.0)

    if not all_questions and result.returncode != 0:
        raise RuntimeError(f"claude CLI exit {result.returncode}: {result.stderr[:200]}")

    response_text = json.dumps(all_questions, ensure_ascii=False)
    return response_text, inp, out, cost


def parse_response(text: str) -> dict:
    # 正確抓取 ```json ... ``` 整塊（避免 \{.*?\} 被巢狀括號截斷）
    m = re.search(r"```json\s*([\s\S]*?)\s*```", text)
    if m:
        return json.loads(m.group(1))
    # fallback: JSONDecoder.raw_decode 找第一個合法 JSON object
    decoder = json.JSONDecoder()
    for i, ch in enumerate(text):
        if ch == '{':
            try:
                obj, _ = decoder.raw_decode(text, i)
                if isinstance(obj, dict):
                    return obj
            except json.JSONDecodeError:
                continue
    raise ValueError(f"找不到 JSON，回應前 200 字: {text[:200]}")


def apply_updates(partial_data: dict, updates: dict) -> tuple[int, Counter, int, int]:
    by_rule: Counter = Counter()
    kl4_count = 0
    for link in partial_data.get("l2_to_kl_links", []):
        qid = link["question_id"]
        if qid not in updates:
            continue
        u = updates[qid]
        new_rule = u.get("match_rule", link.get("match_rule", ""))
        if new_rule in ("N1", "N2", "N3", "N5", "needs_human_review"):
            link["match_rule"] = new_rule
            link["confidence"] = u.get("confidence", link.get("confidence"))
            link["source_codex"] = u.get("source_codex")
            if u.get("primary_code"):
                link["primary_code"] = u["primary_code"]
            link["kl4_supported"] = bool(u.get("kl4_supported", False))
            if link["kl4_supported"]:
                kl4_count += 1
            link["kl4_link"] = u.get("kl4_link")
            link["misconception_match"] = u.get("misconception_match") or []
            link["verify_status"] = "pending"
            link["verify_note"] = "Claude Task 6 仲裁完成"
            by_rule[new_rule] += 1

    remaining = sum(
        1 for l in partial_data.get("l2_to_kl_links", [])
        if l.get("match_rule", "").endswith("_pending")
    )
    return sum(by_rule.values()), by_rule, remaining, kl4_count


def process_one(target: dict, kl3: str, kl4_cache: dict,
                dry_run: bool = False) -> dict:
    exam_id = target["exam_id"]
    publisher = target["publisher"]
    l2_path = target["l2_path"]
    partial_path = os.path.join(PARTIAL_DIR, f"alignment_partial_{exam_id}.json")

    if not os.path.exists(partial_path):
        return {"exam_id": exam_id, "status": "skip_no_partial"}
    if not os.path.exists(l2_path):
        return {"exam_id": exam_id, "status": "skip_no_l2"}

    partial_data = json.load(open(partial_path, encoding="utf-8"))
    rules = Counter(l.get("match_rule", "") for l in partial_data.get("l2_to_kl_links", []))
    if rules["N1_pending"] + rules["N2_or_N3_pending"] == 0:
        return {"exam_id": exam_id, "status": "skip_already_done"}

    if publisher not in kl4_cache:
        kl4_cache[publisher] = load_kl4_context(publisher)
    kl4_text = kl4_cache[publisher]

    pending_qs = extract_pending_questions(partial_data, l2_path)
    if not pending_qs:
        return {"exam_id": exam_id, "status": "skip_no_questions"}

    if dry_run:
        return {
            "exam_id": exam_id, "status": "dry_run",
            "pending": len(pending_qs), "publisher": publisher,
        }

    qids = list(pending_qs.keys())
    batches = [qids[i:i+BATCH_SIZE] for i in range(0, len(qids), BATCH_SIZE)]

    all_updates = {}
    total_inp = total_out = 0
    total_cost = 0.0

    for batch_idx, batch_qids in enumerate(batches, 1):
        batch_qs = {qid: pending_qs[qid] for qid in batch_qids}
        prompt = build_prompt(kl3, kl4_text, batch_qs, publisher, exam_id)

        for attempt in range(3):
            try:
                text, inp, out, cost = call_claude(prompt)
                total_inp += inp
                total_out += out
                total_cost += cost
                updates = parse_response(text)
                all_updates.update(updates)
                break
            except (json.JSONDecodeError, ValueError) as e:
                if attempt == 2:
                    return {
                        "exam_id": exam_id, "status": "error",
                        "error": f"parse failed batch {batch_idx}: {e}",
                        "input_tokens": total_inp, "output_tokens": total_out,
                        "cost_usd": total_cost,
                    }
                time.sleep(10)
            except Exception as e:
                if attempt == 2:
                    return {
                        "exam_id": exam_id, "status": "error", "error": str(e),
                        "input_tokens": total_inp, "output_tokens": total_out,
                        "cost_usd": total_cost,
                    }
                time.sleep(15)

    updated, by_rule, remaining, kl4_count = apply_updates(partial_data, all_updates)
    with open(partial_path, "w", encoding="utf-8") as f:
        json.dump(partial_data, f, ensure_ascii=False, indent=2)

    record_usage(total_inp, total_out, total_cost)
    return {
        "exam_id": exam_id,
        "status": "done" if remaining == 0 else "partial",
        "updated": updated,
        "by_rule": dict(by_rule),
        "remaining_pending": remaining,
        "kl4_supported_count": kl4_count,
        "input_tokens": total_inp,
        "output_tokens": total_out,
        "cost_usd": total_cost,
    }


def print_batch_summary(batch_res: list, total_processed: int):
    """每 REPORT_EVERY 份後印出摘要表，顯示每份結果與累計 token。"""
    W = 74
    print(f"\n{'═'*W}")
    print(f"[批次結果 — 累計已處理 {total_processed} 份非 skip]")
    print(f"{'─'*W}")
    hdr = f"{'試卷ID':<36} {'狀態':<8} {'N1':>3} {'N2':>3} {'N3':>3} {'N5':>3} {'HR':>3} {'KL4':>3} {'cost':>7}"
    print(hdr)
    print(f"{'─'*W}")
    for r in batch_res:
        eid = r["exam_id"]
        if len(eid) > 34:
            eid = "…" + eid[-33:]
        status = r["status"]
        by_rule = r.get("by_rule", {})
        n1 = by_rule.get("N1", 0)
        n2 = by_rule.get("N2", 0)
        n3 = by_rule.get("N3", 0)
        n5 = by_rule.get("N5", 0)
        hr = by_rule.get("needs_human_review", 0)
        kl4 = r.get("kl4_supported_count", "-")
        cost = r.get("cost_usd", 0.0)
        print(f"{eid:<36} {status:<8} {n1:>3} {n2:>3} {n3:>3} {n5:>3} {hr:>3} {str(kl4):>3} {cost:>7.3f}")
    print(f"{'─'*W}")

    batch_inp = sum(r.get("input_tokens", 0) for r in batch_res)
    batch_out = sum(r.get("output_tokens", 0) for r in batch_res)
    batch_cost = sum(r.get("cost_usd", 0.0) for r in batch_res)
    print(f"[本批]  input: {batch_inp:>7,}  output: {batch_out:>5,}  cost: ${batch_cost:.4f}")
    with _lock:
        ci, co, cc = _total_input, _total_output, _total_cost
    print(f"[累計]  input: {ci:>7,}  output: {co:>5,}  cost: ${cc:.4f}")
    print(f"{'═'*W}\n")


def load_targets() -> list:
    publishers = ["A_翰林", "B_康軒", "C_南一"]
    queues = {}
    for p in publishers:
        path = f"scripts/jobs/JOB-246/_full_targets_{p}.json"
        queues[p] = json.load(open(path, encoding="utf-8")) if os.path.exists(path) else []

    merged = []
    max_len = max((len(q) for q in queues.values()), default=0)
    for i in range(max_len):
        for p in publishers:
            if i < len(queues[p]):
                merged.append(queues[p][i])

    def is_pending(t):
        pp = os.path.join(PARTIAL_DIR, f"alignment_partial_{t['exam_id']}.json")
        if not os.path.exists(pp):
            return False
        d = json.load(open(pp, encoding="utf-8"))
        rules = Counter(l.get("match_rule", "") for l in d.get("l2_to_kl_links", []))
        return rules["N1_pending"] + rules["N2_or_N3_pending"] > 0

    return [t for t in merged if is_pending(t)]


def main():
    parser = argparse.ArgumentParser()
    parser.add_argument("--workers", type=int, default=2, help="並行 worker 數")
    parser.add_argument("--max", type=int, default=0, help="最多處理幾份（0=全部）")
    parser.add_argument("--dry-run", action="store_true", help="只列出目標，不實際呼叫")
    args = parser.parse_args()

    targets = load_targets()
    if args.max:
        targets = targets[:args.max]
    total = len(targets)

    print(f"=== Claude dispatch start: {total} 份待處理, workers={args.workers}, model={MODEL} ===")
    if args.dry_run:
        print("(dry-run mode, 不實際呼叫)")

    kl3 = open(KL3_PATH, encoding="utf-8").read()
    kl4_cache = {}

    results = []
    processed = 0  # non-skip count
    aborted = False

    timing_path = os.path.join(LOG_DIR, "phase1b_claude_timing.csv")
    with open(timing_path, "a", encoding="utf-8") as tf:
        tf.write("exam_id,elapsed_s,status,input_tok,output_tok,cost_usd\n")

        # 分批處理：每 REPORT_EVERY 份非 skip 後暫停讓使用者確認
        batch_start = 0
        grand_idx = 0

        while batch_start < len(targets) and not aborted:
            batch = targets[batch_start:batch_start + REPORT_EVERY]
            batch_start += REPORT_EVERY
            batch_file_results = []  # 本批非 skip 結果（用於摘要表）

            with ThreadPoolExecutor(max_workers=args.workers) as pool:
                future_map = {
                    pool.submit(process_one, t, kl3, kl4_cache, args.dry_run): (t, time.time())
                    for t in batch
                }

                for future in as_completed(future_map):
                    grand_idx += 1
                    t, t0 = future_map[future]
                    try:
                        r = future.result()
                    except Exception as e:
                        r = {"exam_id": t["exam_id"], "status": "exception", "error": str(e),
                             "input_tokens": 0, "output_tokens": 0, "cost_usd": 0.0}

                    elapsed = max(1, int(time.time() - t0))
                    status = r["status"]
                    inp = r.get("input_tokens", 0)
                    out = r.get("output_tokens", 0)
                    cost = r.get("cost_usd", 0.0)

                    results.append(r)
                    tf.write(f"{r['exam_id']},{elapsed},{status},{inp},{out},{cost:.4f}\n")
                    tf.flush()

                    prefix = f"[{grand_idx}/{total}][{r['exam_id']}]"
                    if status == "done":
                        print(f"{prefix} ✓ updated={r.get('updated')} by_rule={r.get('by_rule')} "
                              f"tok={inp}+{out} ${cost:.3f}")
                    elif status == "partial":
                        print(f"{prefix} ⚠ partial remaining={r.get('remaining_pending')} "
                              f"tok={inp}+{out} ${cost:.3f}")
                    elif status == "dry_run":
                        print(f"{prefix} DRY pending={r.get('pending')} pub={r.get('publisher')}")
                    elif status.startswith("skip"):
                        print(f"{prefix} ⊘ {status}")
                    else:
                        print(f"{prefix} ✗ {status}: {r.get('error','')}")

                    # 收集非 skip 進本批摘要
                    if not status.startswith("skip") and status != "dry_run":
                        processed += 1
                        batch_file_results.append(r)

            # 本批結束：印摘要表
            if batch_file_results and not args.dry_run:
                print_batch_summary(batch_file_results, processed)

                # 若還有剩餘，等使用者按 Enter 繼續
                if batch_start < len(targets):
                    remaining_count = len(targets) - batch_start
                    import sys
                    if not sys.stdin.isatty():
                        print(f"還剩 {remaining_count} 份，非互動模式自動繼續...")
                    else:
                        try:
                            resp = input(
                                f"還剩 {remaining_count} 份。繼續？[Enter 繼續 / q 停止]: "
                            ).strip().lower()
                            if resp == "q":
                                print("使用者中止，已停止。")
                                aborted = True
                        except (EOFError, KeyboardInterrupt):
                            print("\n收到中斷信號，已停止。")
                            aborted = True

    done = sum(1 for r in results if r["status"] == "done")
    partial = sum(1 for r in results if r["status"] == "partial")
    skipped = sum(1 for r in results if r["status"].startswith("skip"))
    failed = sum(1 for r in results
                 if r["status"] not in ("done", "partial", "dry_run")
                 and not r["status"].startswith("skip"))

    print(f"\n{'='*60}")
    print(f"=== Claude dispatch 結束 ===")
    print(f"✓ done:    {done}")
    print(f"⚠ partial: {partial}")
    print(f"✗ failed:  {failed}")
    print(f"⊘ skipped: {skipped}")
    if not args.dry_run:
        print(f"\n[最終 Token 用量]")
        print(f"  input:  {_total_input:,} tokens")
        print(f"  output: {_total_output:,} tokens")
        print(f"  費用:   ${_total_cost:.3f} USD")
    print(f"{'='*60}")


if __name__ == "__main__":
    main()
