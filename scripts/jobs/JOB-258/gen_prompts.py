"""JOB-258 四下社會4課BIAS平衡 prompt生成。"""
import os
ROOT=os.path.abspath(os.path.join(os.path.dirname(__file__),'..','..','..'))
PD=os.path.join(ROOT,'scripts/jobs/JOB-258/_prompts')
os.makedirs(PD,exist_ok=True)
TASKS=[('HanLin','HANLIN','L1'),('HanLin','HANLIN','L4'),('HanLin','HANLIN','L6'),('KangHsuan','KANGHSUAN','L5')]
TPL='''你是國小社會科題目品質校正專家。四下社會檔案 {src} 有「選項長度偏差(BIAS)」問題：每題正解選項總是明顯比誘答選項長，學生可用「選最長的就對」猜答，違反 CQI-P 選項對稱原則。

請讀取 {src}，在**嚴格遵守以下限制**下修正每一題的選項長度：
- 絕對不改 answer_index（正確答案位置不變）
- 絕對不改 question（題幹不變）
- 絕對不改每個選項的對錯語意（正解仍是正確答案、誘答仍是錯誤答案）
- 只調整 4 個選項的**文字長度**使其相近（彼此字數差 ≤2）：把過短的誘答選項補充具體、合理但仍錯誤的說明來加長；必要時精簡過長的正解。修正後每題的正解**不可再是最長選項**。
- 其他所有欄位(explanation/commonMisconception/scenario/quality_level/blind_evaluation/is_publishable/verifying_model/review_status等)完全保留不變。

把修正後的完整 JSON 寫到 {out}（與原檔同結構，含 meta/publisher/questions）。完成後確認已寫出，不要輸出題目全文。'''
for pe,code,L in TASKS:
    src=f'question/platform/G4/SocialStudies/S2/{pe}/G4_S2_SOC_{code}_{L}.json'
    out=f'question/platform/G4/SocialStudies/S2/{pe}/G4_S2_SOC_{code}_{L}_new.json'
    open(os.path.join(PD,f'{code}_{L}.txt'),'w',encoding='utf-8').write(TPL.format(src=src,out=out))
    print(f'✓ {code}_{L}.txt')
print('done')
