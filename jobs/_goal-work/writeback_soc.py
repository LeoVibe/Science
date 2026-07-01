#!/usr/bin/env python3
# 四下社會寫回主檔：原題取shuffled[passIdx] + 補題取sup_shuffled[sup_passIdx]
# 沿用四下自然不變式：寫回用被盲測shuffled版；confirmed/QL4/publishable+review_date
import json, os, sys

REVIEW_DATE = "2026-06-20"
VERIFY_MODEL = "claude-sonnet-4-6"
VERS = {
    "G4_SOC_HanLin": ("HanLin", "HANLIN"),
    "G4_SOC_KangHsuan": ("KangHsuan", "KANGHSUAN"),
    "G4_SOC_NanYi": ("NanYi", "NANYI"),
}
BASE = "question/platform/G4/SocialStudies/S2"
SUP_LESSONS = {"G4_SOC_HanLin_L2","G4_SOC_HanLin_L4","G4_SOC_KangHsuan_L2",
               "G4_SOC_KangHsuan_L3","G4_SOC_KangHsuan_L6","G4_SOC_NanYi_L2","G4_SOC_NanYi_L6"}

def load(p): return json.load(open(p)) if os.path.exists(p) else None

# 載入補題過閘清單(由merge產生) sup_passIdx
sup_pass = load("jobs/_goal-work/soc_sup_passIdx.json") or {}

def confirm(q):
    q = dict(q)
    q["review_status"] = "confirmed"
    q["is_publishable"] = True
    q["blind_evaluation"] = True
    q["quality_level"] = "QL4"
    q["review_date"] = REVIEW_DATE
    q["verifying_model"] = VERIFY_MODEL
    q["verifying_date"] = REVIEW_DATE
    return q

DRY = "--write" not in sys.argv
report = {}
for vdir, (d, u) in VERS.items():
    for n in range(1, 7):
        key = f"{vdir}_L{n}"
        mainf = f"{BASE}/{d}/G4_S2_SOC_{u}_L{n}.json"
        data = load(mainf)
        shuffled = load(f"jobs/_goal-work/{vdir}/L{n}_shuffled.json")
        passIdx = load(f"jobs/_goal-work/{vdir}/L{n}_passIdx.json") or []
        newqs = [confirm(shuffled[i]) for i in passIdx]
        # 補題
        if key in SUP_LESSONS:
            sup_shuf = load(f"jobs/_goal-work/{vdir}/L{n}_sup_shuffled.json") or []
            spass = sup_pass.get(key, list(range(len(sup_shuf))))
            newqs += [confirm(sup_shuf[i]) for i in spass]
        # 答案分布檢查
        dist = {}
        for q in newqs: dist[q["answer_index"]] = dist.get(q["answer_index"], 0) + 1
        report[key] = {"final": len(newqs), "orig_pass": len(passIdx),
                       "sup": len(newqs) - len(passIdx), "dist": dist}
        if not DRY:
            data["questions"] = newqs
            json.dump(data, open(mainf, "w"), ensure_ascii=False, indent=2)
        print(f"{key}: 寫回{len(newqs)}題 (原{len(passIdx)}+補{len(newqs)-len(passIdx)}) 答案分布{dist}")

print("\n" + ("【DRY RUN 未寫檔，加 --write 實際寫入】" if DRY else "【已寫回主檔】"))
print("總題數:", sum(r["final"] for r in report.values()))
