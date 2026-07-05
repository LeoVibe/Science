#!/usr/bin/env python3
# 四下國語15課寫回主檔:原題取shuffled[passIdx] + 補題取sup_shuffled[sup_passIdx]
import json, os, sys

REVIEW_DATE = "2026-07-02"
VERIFY_MODEL = "claude-sonnet-4-6"
LESSONS = [
    ('HanLin','HanLin','HANLIN',7),('HanLin','HanLin','HANLIN',8),('HanLin','HanLin','HANLIN',9),
    ('HanLin','HanLin','HANLIN',10),('HanLin','HanLin','HANLIN',11),('HanLin','HanLin','HANLIN',12),
    ('KangHsuan','KangHsuan','KANGHSUAN',7),('KangHsuan','KangHsuan','KANGHSUAN',8),
    ('KangHsuan','KangHsuan','KANGHSUAN',9),('KangHsuan','KangHsuan','KANGHSUAN',12),
    ('NanYi','NanYi','NANYI',7),('NanYi','NanYi','NANYI',8),('NanYi','NanYi','NANYI',10),
    ('NanYi','NanYi','NANYI',11),('NanYi','NanYi','NANYI',12),
]
BASE = "question/platform/G4/Chinese/S2"
SUP_LESSONS = {'HanLin_L8','HanLin_L9','HanLin_L10','HanLin_L11','KangHsuan_L8','KangHsuan_L12',
               'NanYi_L7','NanYi_L8','NanYi_L11'}

def load(p): return json.load(open(p)) if os.path.exists(p) else None
sup_pass = load("jobs/_goal-work/chi_sup_passIdx.json") or {}

def confirm(q):
    q=dict(q); q['review_status']='confirmed'; q['is_publishable']=True; q['blind_evaluation']=True
    q['quality_level']='QL4'; q['review_date']=REVIEW_DATE; q['verifying_model']=VERIFY_MODEL; q['verifying_date']=REVIEW_DATE
    return q

DRY = "--write" not in sys.argv
report={}
for vdir,d,u,n in LESSONS:
    key=f'{vdir}_L{n}'
    mainf=f'{BASE}/{d}/G4_S2_CHI_{u}_L{n}.json'
    data=load(mainf)
    shuffled=load(f'jobs/_goal-work/G4_CHI_{vdir}/L{n}_shuffled.json')
    passIdx=load(f'jobs/_goal-work/G4_CHI_{vdir}/L{n}_passIdx.json') or []
    newqs=[confirm(shuffled[i]) for i in passIdx]
    if key in SUP_LESSONS:
        sup_shuf=load(f'jobs/_goal-work/G4_CHI_{vdir}/L{n}_sup_shuffled.json') or []
        spass=sup_pass.get(key, list(range(len(sup_shuf))))
        newqs += [confirm(sup_shuf[i]) for i in spass]
    dist={}
    for q in newqs: dist[q['answer_index']]=dist.get(q['answer_index'],0)+1
    report[key]={'final':len(newqs),'orig_pass':len(passIdx),'sup':len(newqs)-len(passIdx),'dist':dist}
    if not DRY:
        data['questions']=newqs
        json.dump(data, open(mainf,'w'), ensure_ascii=False, indent=2)
    print(f"{key}: 寫回{len(newqs)}題(原{len(passIdx)}+補{len(newqs)-len(passIdx)}) 分布{dist}")

print("\n" + ("【DRY RUN 未寫檔,加 --write 實際寫入】" if DRY else "【已寫回主檔】"))
print("總題數:", sum(r['final'] for r in report.values()))
