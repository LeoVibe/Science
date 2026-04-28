#!/bin/bash
# 連續跑 retry_missing_drives.py，直到沒有缺檔的 drive 為止
# 用法：bash scripts/continuous_retry_missing_loop.sh > scripts/orchestrator-logs/JOB-209-retry-missing.log 2>&1 &

set -uo pipefail
cd "$(dirname "$0")/.."

PROGRESS=knowledge/3_考古題/_manifest/download_progress.json
MANIFEST=knowledge/3_考古題/_manifest/pdf_manifest_G1_G6.json

count_missing() {
python3 << 'PY'
import json, pathlib, re
data = json.load(open('knowledge/3_考古題/_manifest/download_progress.json'))
manifest = json.load(open('knowledge/3_考古題/_manifest/pdf_manifest_G1_G6.json'))
rec_by_fid = {r['folder_id']: r for r in manifest['records']}
def extract_fid(url):
    m = re.search(r'folders/([A-Za-z0-9_-]+)', url or '')
    return m.group(1) if m else ''
miss = 0
for r in data:
    if r['status'] not in ('partial', 'failed'):
        continue
    if '需手動處理' in (r.get('error_note') or ''):
        continue
    fid = extract_fid(r.get('url',''))
    rec = rec_by_fid.get(fid)
    if not rec: continue
    expected = [p['path'] for p in rec['pdfs'] if p['path'].lower().endswith('.pdf')]
    if not expected: continue
    local = pathlib.Path(r['local_path'])
    actual = set()
    if local.exists():
        actual = {f.name for f in local.rglob('*.pdf')}
    hit = sum(1 for p in expected if p in actual)
    if hit < len(expected):
        miss += 1
print(miss)
PY
}

batch_n=0
prev_remaining=-1
while true; do
    remaining=$(count_missing 2>/dev/null || echo -1)
    if [ -z "$remaining" ] || ! [[ "$remaining" =~ ^-?[0-9]+$ ]]; then
        echo "[$(date '+%F %T')] ⚠️ count_missing 失敗（可能網路斷或 python error），等 60 秒後重試"
        sleep 60
        continue
    fi
    if [ "$remaining" -eq 0 ]; then
        echo "[$(date '+%F %T')] ✅ 缺檔 drive=0，retry-missing loop 結束"
        break
    fi
    if [ "$prev_remaining" -eq "$remaining" ] && [ "$batch_n" -gt 0 ]; then
        echo "[$(date '+%F %T')] ⚠️ 連續兩輪沒減少（$remaining），retry-missing loop 結束"
        break
    fi
    prev_remaining=$remaining
    batch_n=$((batch_n + 1))
    echo "[$(date '+%F %T')] === Retry-Missing Batch #$batch_n 啟動，剩 $remaining 缺檔 drive ==="
    python3 scripts/retry_missing_drives.py --batch 20
    echo "[$(date '+%F %T')] === Retry-Missing Batch #$batch_n 結束 ==="
    sleep 120
done
