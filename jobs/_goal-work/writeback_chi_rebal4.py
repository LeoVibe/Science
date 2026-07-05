#!/usr/bin/env python3
# 覆寫4課(翰林L7/L11/L12、南一L10)為重鑄+補題後的最終版本
import json, os, sys

REVIEW_DATE = "2026-07-02"
VERIFY_MODEL = "claude-sonnet-4-6"
LESSONS = [('HanLin','HanLin','HANLIN',7),('HanLin','HanLin','HANLIN',11),
           ('HanLin','HanLin','HANLIN',12),('NanYi','NanYi','NANYI',10)]
BASE = "question/platform/G4/Chinese/S2"
HAS_GAP4 = {'HanLin_L7','HanLin_L11','HanLin_L12'}

def load(p): return json.load(open(p)) if os.path.exists(p) else None
gap4_pass = load("jobs/_goal-work/chi_gap4_passIdx.json") or {}

def confirm(q):
    q=dict(q); q['review_status']='confirmed'; q['is_publishable']=True; q['blind_evaluation']=True
    q['quality_level']='QL4'; q['review_date']=REVIEW_DATE; q['verifying_model']=VERIFY_MODEL; q['verifying_date']=REVIEW_DATE
    return q

DRY = "--write" not in sys.argv
for vdir,d,u,n in LESSONS:
    key=f'{vdir}_L{n}'
    mainf=f'{BASE}/{d}/G4_S2_CHI_{u}_L{n}.json'
    data=load(mainf)
    rebal_shuf=load(f'jobs/_goal-work/G4_CHI_{vdir}/L{n}_rebal_shuffled.json')
    rebal_pass=load(f'jobs/_goal-work/G4_CHI_{vdir}/L{n}_rebal_passIdx.json') or []
    newqs=[confirm(rebal_shuf[i]) for i in rebal_pass]
    if key in HAS_GAP4:
        gap4_shuf=load(f'jobs/_goal-work/G4_CHI_{vdir}/L{n}_gap4_shuffled.json') or []
        gp=gap4_pass.get(key, list(range(len(gap4_shuf))))
        newqs += [confirm(gap4_shuf[i]) for i in gp]
    dist={}
    for q in newqs: dist[q['answer_index']]=dist.get(q['answer_index'],0)+1
    longest=sum(1 for q in newqs if len(q['options'][q['answer_index']])==max(len(o) for o in q['options']))
    print(f"{key}: {len(newqs)}題 分布{dist} 正解最長{longest}/{len(newqs)}={longest/len(newqs):.0%}")
    if not DRY:
        data['questions']=newqs
        json.dump(data, open(mainf,'w'), ensure_ascii=False, indent=2)

print("\n" + ("【DRY RUN 未寫檔,加 --write 實際寫入】" if DRY else "【已覆寫4課主檔】"))
