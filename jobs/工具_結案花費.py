#!/usr/bin/env python3
"""結案花費統計(通用版):依 JOB 起訖時間,掃本專案全部 session 逐字稿(.jsonl)加總 token 與訊息數。
供回報單「花費紀錄」填寫;耗時=牆鐘時間(含閒置),token=區間內近似值(同時段多單並行會混計,誠實標註)。

專案槽自動偵測:由本檔所在 jobs/ 的上層(專案根)路徑推導 ~/.claude/projects/<slug>;
slug 有「/→-」與「非英數全→-」兩種歷史變體,兩者存在就都掃(聯集)。

用法:
  python3 jobs/工具_結案花費.py --start "2026-07-18 00:00" --end "2026-07-18 12:30"
  python3 jobs/工具_結案花費.py --job JOB-012        # 自動讀派工單 created_at;結束=REPORT completed_at(無則現在)
"""
import json, glob, os, re, sys, argparse, datetime

JOBS_DIR = os.path.dirname(os.path.abspath(__file__))
ROOT = os.path.dirname(JOBS_DIR)  # 專案根
_c1 = ROOT.replace(os.sep, "-")
_c2 = re.sub(r"[^A-Za-z0-9]", "-", ROOT)
PROJ_DIRS = [d for d in {os.path.expanduser(f"~/.claude/projects/{s}") for s in (_c1, _c2)} if os.path.isdir(d)]
TZ = datetime.timezone(datetime.timedelta(hours=8))  # 台灣 UTC+8


def parse_local(s):
    for fmt in ("%Y-%m-%d %H:%M:%S", "%Y-%m-%d %H:%M", "%Y-%m-%d"):
        try:
            return datetime.datetime.strptime(s.strip(), fmt).replace(tzinfo=TZ)
        except ValueError:
            continue
    raise SystemExit(f"時間格式看不懂:{s}(用 YYYY-MM-DD HH:MM)")


def ts_of_job(jobid):
    start = end = None
    for p in glob.glob(os.path.join(JOBS_DIR, f"{jobid}-TASK*.md")) + glob.glob(os.path.join(JOBS_DIR, f"{jobid}-*.md")):
        m = re.search(r'`created_at`:\s*([0-9-]+\s+[0-9:]+)', open(p, encoding="utf-8").read())
        if m:
            start = parse_local(m.group(1))
            break
    for p in glob.glob(os.path.join(JOBS_DIR, f"{jobid}-REPORT*.md")) + glob.glob(os.path.join(JOBS_DIR, f"{jobid}-Report*.md")):
        m = re.search(r'`completed_at`:\s*([0-9-]+\s+[0-9:]+)', open(p, encoding="utf-8").read())
        if m:
            end = parse_local(m.group(1))
            break
    if not start:
        raise SystemExit(f"找不到 {jobid} 派工單的 created_at(格式需 `created_at`: YYYY-MM-DD HH:mm)")
    return start, (end or datetime.datetime.now(TZ))


def main():
    ap = argparse.ArgumentParser()
    ap.add_argument("--start")
    ap.add_argument("--end")
    ap.add_argument("--job")
    a = ap.parse_args()
    if a.job:
        t0, t1 = ts_of_job(a.job.upper())
    elif a.start:
        t0 = parse_local(a.start)
        t1 = parse_local(a.end) if a.end else datetime.datetime.now(TZ)
    else:
        ap.print_help(); sys.exit(1)

    if not PROJ_DIRS:
        raise SystemExit(f"找不到本專案的 session 槽(~/.claude/projects/ 下無 {os.path.basename(ROOT)} 對應目錄)")

    models, nmsg = {}, 0
    for pd in PROJ_DIRS:
        for p in glob.glob(os.path.join(pd, "*.jsonl")):
            try:
                fh = open(p, encoding="utf-8")
            except OSError:
                continue
            for line in fh:
                if '"usage"' not in line:
                    continue
                try:
                    o = json.loads(line)
                except json.JSONDecodeError:
                    continue
                if o.get("type") != "assistant":
                    continue
                ts = o.get("timestamp")
                u = (o.get("message") or {}).get("usage")
                if not ts or not u:
                    continue
                try:
                    t = datetime.datetime.fromisoformat(ts.replace("Z", "+00:00")).astimezone(TZ)
                except ValueError:
                    continue
                if not (t0 <= t <= t1):
                    continue
                nmsg += 1
                mdl = (o.get("message") or {}).get("model", "?")
                d = models.setdefault(mdl, {"in": 0, "out": 0, "cache_r": 0, "cache_w": 0})
                d["in"] += u.get("input_tokens", 0)
                d["out"] += u.get("output_tokens", 0)
                d["cache_r"] += u.get("cache_read_input_tokens", 0)
                d["cache_w"] += u.get("cache_creation_input_tokens", 0)

    dur = t1 - t0
    hh, rem = divmod(int(dur.total_seconds()), 3600)
    mm = rem // 60
    print(f"專案槽:{', '.join(os.path.basename(d) for d in PROJ_DIRS)}")
    print(f"區間:{t0:%Y-%m-%d %H:%M} → {t1:%Y-%m-%d %H:%M}(台灣時間)")
    print(f"耗時:{hh} 小時 {mm} 分(牆鐘時間,含閒置)")
    print(f"訊息數:{nmsg} 則 assistant 回應")
    if not models:
        print("⚠ 區間內無任何用量紀錄(確認時間範圍/時區)")
        return
    tot_in = tot_out = 0
    for mdl, d in sorted(models.items()):
        tot_in += d["in"] + d["cache_w"]; tot_out += d["out"]
        print(f"  {mdl}: input {d['in']:,} + cache寫 {d['cache_w']:,} + cache讀 {d['cache_r']:,} → output {d['out']:,}")
    print(f"合計(近似):input+cache寫 {tot_in:,} / output {tot_out:,}")
    print("註:同時段若有他單並行,數字會混計——回報單請標「近似」。")


if __name__ == "__main__":
    main()
