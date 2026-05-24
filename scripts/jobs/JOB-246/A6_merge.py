"""Phase 3 merge：partial → alignment_raw.json"""
import json
import glob
import os
from datetime import datetime

PARTIAL_DIR = 'knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/_partial'
OUT_PATH = 'knowledge/3_考古題/3_L2_結構化抽取/四下/alignment_science/alignment_raw.json'


def main():
    all_links = []
    exam_ids = set()
    publishers = {}
    for fp in sorted(glob.glob(f'{PARTIAL_DIR}/*.json')):
        d = json.load(open(fp, encoding='utf-8'))
        exam_id = d['_meta']['partial_for']
        exam_ids.add(exam_id)
        publishers[exam_id] = d['_meta'].get('publisher', '?')
        all_links.extend(d['l2_to_kl_links'])

    out = {
        '_meta': {
            'schema_version': '2.0',
            'subject': '自然',
            'semester': '四下',
            'exam_count': len(exam_ids),
            'question_count': len(all_links),
            'merged_at': datetime.now().isoformat(),
            'job': 'JOB-246',
            'publisher_dist': {pub: list(publishers.values()).count(pub) for pub in set(publishers.values())},
        },
        'l2_to_kl_links': all_links,
    }
    json.dump(out, open(OUT_PATH, 'w', encoding='utf-8'), ensure_ascii=False, indent=2)
    print(f'✓ {OUT_PATH}')
    print(f'  exams: {len(exam_ids)}')
    print(f'  questions: {len(all_links)}')


if __name__ == '__main__':
    main()
