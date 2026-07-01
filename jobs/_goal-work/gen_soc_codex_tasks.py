#!/usr/bin/env python3
# 生成四下社會缺額課的codex補題派工檔(task.md + template.json)
import json

les = {l["key"]: l for l in json.load(open("jobs/_goal-work/soc_lessons.json"))}
# 缺額: key -> 補題數
NEED = {
    "G4_SOC_HanLin_L2": 2, "G4_SOC_HanLin_L4": 1,
    "G4_SOC_KangHsuan_L2": 1, "G4_SOC_KangHsuan_L3": 1, "G4_SOC_KangHsuan_L6": 1,
    "G4_SOC_NanYi_L2": 1, "G4_SOC_NanYi_L6": 2,
}

for key, n_need in NEED.items():
    L = les[key]
    d, n, title = L["dir"], L["n"], L["title"]
    # 取一題過閘題當格式範本
    sh = json.load(open(f"jobs/_goal-work/{d}/L{n}_shuffled.json"))
    passed = json.load(open(f"jobs/_goal-work/{d}/L{n}_passIdx.json"))
    sample = sh[passed[0]]
    tmpl = {k: sample.get(k) for k in ["taxonomy", "scenario", "question", "options",
            "answer_index", "explanation", "commonMisconception"]}
    json.dump([tmpl], open(f"jobs/_goal-work/{d}/L{n}_sup_template.json", "w"),
              ensure_ascii=False, indent=2)
    # 已過閘題的考點摘要(question前40字)供避重
    covered = [sh[i].get("question", "")[:36] for i in passed[:30]]
    task = f"""# codex補題：四下社會 {title.replace('（','(').replace('）',')')} 補 {n_need} 題

你是國小四年級社會科出題老師。為康軒/翰林/南一版本「{title}」這一課補 {n_need} 道單選題，扣緊本課課程內容。

## 必讀素材
1. 單課研究紀錄(核心概念/課綱碼/考點地圖)：`{L['rec']}`
2. 考古題與討論(真實段考參考)：`{L['kao']}`
3. 格式範本：`jobs/_goal-work/{d}/L{n}_sup_template.json`

## 規則
1. 每題鎖定單課研究紀錄列出的核心概念/課綱元素,題目須明確扣本課範疇(非他課、非超綱)。
2. 嚴禁照抄考古題題幹/選項/誘答結構(即便換字重排,核心邏輯未變仍算抄襲)。
3. 須為完整問句,禁止「題幹即答案」(題幹文字與正解選項雷同的格式崩壞)。
4. 欄位照範本：taxonomy/scenario/question/options(4個)/answer_index(0-3)/explanation(與正解一致)/commonMisconception。
5. 四年級難度、誘答合理且唯一正解、正解位置打散、禁洩答。
6. 固定欄位：quality_level:"QL3", review_status:"pending", is_publishable:false, blind_evaluation:false, authoring_model:"gpt-5.5"。
7. 避免與既有過閘題重複(已涵蓋題幹開頭參考)：{covered}

## 輸出
純JSON陣列(無markdown圍欄)寫入 `jobs/_goal-work/{d}/L{n}_supplement.json`,共 {n_need} 題。
"""
    open(f"jobs/_goal-work/{d}/L{n}_sup_task.md", "w").write(task)
    print(f"{key}: 補{n_need}題 task+template 已生成")

print("DONE")
