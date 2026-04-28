#!/usr/bin/env python3
"""比較 pdfplumber vs docling 轉換成果
用法：python3 scripts/compare_engines.py
輸入：scripts/pdfplumber_snapshot.json（舊）+ 目前 2_MD淬鍊文字/（新 docling）
輸出：scripts/engine_comparison_report.md
"""
import json, re, sys
from pathlib import Path

BASE     = Path('knowledge/3_考古題/2_MD淬鍊文字')
SNAP     = Path('scripts/pdfplumber_snapshot.json')
OUT_MD   = Path('scripts/engine_comparison_report.md')

SCANNED_THRESHOLD = 100  # 小於此字數視為掃描件失敗


def read_md_metrics(md_file: Path) -> dict:
    text = md_file.read_text(encoding='utf-8')
    char_count = None
    for line in text.split('\n'):
        if line.startswith('char_count:'):
            try: char_count = int(line.split(':')[1].strip())
            except: pass
            break
    topic_hits = {}
    in_topic = False
    for line in text.split('\n'):
        if line.startswith('topic_hits:'):
            in_topic = True; continue
        if in_topic:
            m = re.match(r'^  (\S+): (\d+)', line)
            if m: topic_hits[m.group(1)] = int(m.group(2))
            else: in_topic = False
    has_doc_fail = '[DOC 萃取失敗' in text
    return {
        'char_count': char_count,
        'topic_hits': topic_hits,
        'topic_total': sum(topic_hits.values()),
        'has_doc_fail': has_doc_fail,
    }


def delta_label(old_cc, new_cc):
    if old_cc is None or new_cc is None:
        return '?'
    if old_cc < SCANNED_THRESHOLD and new_cc < SCANNED_THRESHOLD:
        return '掃描件（兩引擎均失敗）'
    if old_cc < SCANNED_THRESHOLD:
        return f'⬆️ 掃描件改善 →{new_cc}'
    if new_cc < SCANNED_THRESHOLD:
        return f'⬇️ 退步（docling 失敗）'
    diff = new_cc - old_cc
    pct = round(diff / old_cc * 100) if old_cc else 0
    if diff > 500:
        return f'⬆️ +{diff} ({pct:+}%)'
    elif diff < -500:
        return f'⬇️ {diff} ({pct:+}%)'
    else:
        return f'≈ {diff:+}'


def main():
    if not SNAP.exists():
        print(f'ERROR: 找不到快照 {SNAP}，請先執行主腳本一次（pdfplumber）', file=sys.stderr)
        sys.exit(1)

    old_snap = json.loads(SNAP.read_text(encoding='utf-8'))

    rows = []
    for md_file in sorted(BASE.rglob('*.md')):
        key = str(md_file.relative_to(BASE))
        old = old_snap.get(key, {})
        new = read_md_metrics(md_file)

        old_cc = old.get('char_count')
        new_cc = new['char_count']
        old_topics = old.get('topic_total', 0)
        new_topics = new['topic_total']

        rows.append({
            'key': key,
            'old_cc': old_cc,
            'new_cc': new_cc,
            'delta_label': delta_label(old_cc, new_cc),
            'old_topics': old_topics,
            'new_topics': new_topics,
            'topic_delta': new_topics - old_topics,
            'has_doc_fail': new['has_doc_fail'],
        })

    # ── 分類 ──
    improved     = [r for r in rows if r['new_cc'] and r['old_cc'] and
                    r['new_cc'] > r['old_cc'] + 500 and r['old_cc'] >= SCANNED_THRESHOLD]
    slightly_up  = [r for r in rows if r['new_cc'] and r['old_cc'] and
                    0 < r['new_cc'] - r['old_cc'] <= 500 and r['old_cc'] >= SCANNED_THRESHOLD]
    same         = [r for r in rows if r['new_cc'] and r['old_cc'] and
                    abs(r['new_cc'] - r['old_cc']) <= 0 and r['old_cc'] >= SCANNED_THRESHOLD]
    degraded     = [r for r in rows if r['new_cc'] and r['old_cc'] and
                    r['new_cc'] < r['old_cc'] - 500 and r['old_cc'] >= SCANNED_THRESHOLD]
    scanned      = [r for r in rows if r['old_cc'] and r['old_cc'] < SCANNED_THRESHOLD]

    # ── 輸出 Markdown ──
    lines = [
        '# PDF 引擎比較報告：pdfplumber vs docling',
        '',
        f'`生成時間`: {Path(__file__).stat().st_mtime}',
        '',
        '## 摘要',
        '',
        f'| 類別 | 數量 |',
        f'|:--|:--:|',
        f'| 大幅提升（docling +500字以上） | {len(improved)} |',
        f'| 小幅提升（docling +1~500字） | {len(slightly_up)} |',
        f'| 持平（差異 ≤0字） | {len(same)} |',
        f'| 退步（docling -500字以下） | {len(degraded)} |',
        f'| 掃描型 PDF（兩引擎均失敗） | {len(scanned)} |',
        f'| **合計** | **{len(rows)}** |',
        '',
    ]

    def table_rows(rlist, show_n=None):
        shown = rlist[:show_n] if show_n else rlist
        out = ['| MD 檔案 | pdfplumber字數 | docling字數 | 差異 | 主題命中(舊→新) |',
               '|:--|--:|--:|:--|:--|']
        for r in shown:
            old_t = f"{r['old_topics']}" if r['old_topics'] else '-'
            new_t = f"{r['new_topics']}" if r['new_topics'] else '-'
            out.append(f"| `{r['key']}` | {r['old_cc'] or '-'} | {r['new_cc'] or '-'} | {r['delta_label']} | {old_t}→{new_t} |")
        if show_n and len(rlist) > show_n:
            out.append(f'| _（還有 {len(rlist)-show_n} 筆）_ | | | | |')
        return out

    if improved:
        lines += ['## 大幅提升（docling +500字以上）', '']
        lines += table_rows(sorted(improved, key=lambda r: -(r['new_cc']-r['old_cc'])))
        lines.append('')

    if slightly_up:
        lines += ['## 小幅提升（docling +1~500字）', '']
        lines += table_rows(slightly_up, show_n=30)
        lines.append('')

    if same:
        lines += ['## 持平（差異 ≤0字）', '']
        lines += table_rows(same, show_n=20)
        lines.append('')

    if degraded:
        lines += ['## ⚠️ 退步（docling -500字以下）', '']
        lines += table_rows(sorted(degraded, key=lambda r: r['new_cc']-r['old_cc']))
        lines.append('')

    if scanned:
        lines += ['## 掃描型 PDF（需 OCR，兩引擎均無法讀取）', '']
        lines += table_rows(scanned)
        lines.append('')

    # ── 全量明細 ──
    lines += ['## 全量明細', '']
    lines += table_rows(sorted(rows, key=lambda r: r['key']))
    lines.append('')

    OUT_MD.write_text('\n'.join(lines), encoding='utf-8')
    print(f'✅ 報告寫入 {OUT_MD}')
    print(f'   大幅提升: {len(improved)} | 小幅提升: {len(slightly_up)} | 持平: {len(same)} | 退步: {len(degraded)} | 掃描失敗: {len(scanned)}')


if __name__ == '__main__':
    main()
