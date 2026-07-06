#!/usr/bin/env python3
"""JOB-216 進度儀表板 — 讀 _index.json 實況計算，不依賴網路。"""
import json, sys
from pathlib import Path
from datetime import datetime, timedelta

PROGRESS_JSON = Path('knowledge/3_考古題/_manifest/JOB216_progress.json')
WAVE_NAMES = {1: '數學+社會(v6)', 2: '國語(docling)', 3: '自然(v6+ocr)', 4: '英語(v6+ocr)'}
RATE_SEC = {1: 0.15, 2: 37.0, 3: 0.15, 4: 0.15}  # 秒/PDF（實測）

def load_progress():
    combos = json.loads(PROGRESS_JSON.read_text())
    base_md = Path('knowledge/3_考古題/2_MD淬鍊文字')
    for c in combos:
        md_dir = base_md / c['grade'] / c['combo']
        has_index = (md_dir / '_index.json').exists()
        c['status'] = 'done' if has_index else 'pending'
        c['md_count'] = len(list(md_dir.glob('*.md'))) if md_dir.exists() else 0
    return combos

def eta(combos):
    pending = [c for c in combos if c['status'] == 'pending']
    total_sec = 0
    # 依 wave 序列，每 wave 取最大並行
    for wave in [1, 2, 3, 4]:
        wave_pending = [c for c in pending if c['wave'] == wave]
        if not wave_pending:
            continue
        max_pdf = max(c['pdf_count'] for c in wave_pending)
        rate = RATE_SEC[wave]
        if wave == 2:
            # docling 3 個並行，每批取最慢那個
            batches = [wave_pending[i:i+3] for i in range(0, len(wave_pending), 3)]
            for batch in batches:
                total_sec += max(c['pdf_count'] for c in batch) * rate
        else:
            total_sec += max_pdf * rate
    return total_sec

combos = load_progress()
done = [c for c in combos if c['status'] == 'done']
pending = [c for c in combos if c['status'] == 'pending']
total_md = sum(c['md_count'] for c in combos)
now = datetime.now()
weekday = ['一','二','三','四','五','六','日'][now.weekday()]

eta_sec = eta(combos)
eta_time = now + timedelta(seconds=eta_sec)

print('╔══════════════════════════════════════════════════════╗')
print(f'║  📊 JOB-216 進度儀表板')
print(f'║  🕐 {now.strftime("%Y-%m-%d")} (週{weekday}) {now.strftime("%H:%M:%S")}')
print('╚══════════════════════════════════════════════════════╝')
print(f'  整體：done={len(done)}  pending={len(pending)}  total={len(combos)}')
print(f'  完成度：{len(done)}/{len(combos)} = {len(done)/len(combos)*100:.1f}%')
print(f'  累計 MD 產出：{total_md} 份')
print()

for wave in [1, 2, 3, 4]:
    wc = [c for c in combos if c['wave'] == wave]
    wd = [c for c in wc if c['status'] == 'done']
    bar = '█' * len(wd) + '░' * (len(wc) - len(wd))
    pct = len(wd) / len(wc) * 100 if wc else 0
    print(f'  W{wave} {WAVE_NAMES[wave]:14s} [{bar}] {len(wd)}/{len(wc)} ({pct:.0f}%)')
    for c in wc:
        sym = '✅' if c['status'] == 'done' else '⏳'
        print(f'       {sym} {c["combo"]:22s} {c["md_count"]:3d} MD')

print()
print(f'  預估剩餘：{eta_sec/60:.0f} 分鐘')
print(f'  預估完成：{eta_time.strftime("%Y-%m-%d %H:%M")}')
print('══════════════════════════════════════════════════════')
