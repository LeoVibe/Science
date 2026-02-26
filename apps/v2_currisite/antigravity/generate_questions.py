import random
import json
import os

# Configuration
OUTPUT_DIR = "/Users/s389080/Documents/文件 - NM389080/miaw/antigravity/questions/G6/Chinese"
PUBLISHERS = {
    "knsh": "康軒",
    "nani": "南一",
    "hlm": "翰林"
}

# Shared question pool components for Grade 6
IDIOMS = [
    ("未雨綢繆", "事前做好準備", "天氣變化無常", "形容雨下得很大", "兩人感情很好", "比喻在天還沒下雨前，就先修補好門窗。引申為事前做好準備工作。"),
    ("杯弓蛇影", "疑神疑鬼，自己嚇自己", "真心換絕情", "喝酒誤事", "箭術高超", "比喻因無中生有的疑慮而自相驚擾。"),
    ("囫圇吞棗", "學習不求甚解", "吃棗子不吐核", "做事很乾脆", "胃口很好", "比喻理解事物籠統含糊，不求深究。"),
    ("掩耳盜鈴", "自欺欺人", "聽力不好", "偷東西很安靜", "形容鈴聲很小", "比喻自欺欺人。"),
    ("指鹿為馬", "刻意顛倒是非", "動物學知識不足", "形容馬長得像鹿", "視力模糊", "比喻公然顛倒黑白是非。"),
    ("按圖索驥", "做事拘泥成法，不知變通", "做事很有計畫", "尋找失物的方法", "形容地圖很精確", "比喻按照線索尋找，也比喻做事拘泥成法。"),
    ("刻舟求劍", "拘泥固執，不知變通", "劍術高超", "船行速度很快", "尋找失物的方法", "比喻拘泥固執，不知變通。"),
    ("畫蛇添足", "多此一舉", "畫畫技巧高超", "蛇長出了腳", "做事追求完美", "比喻多此一舉，反而壞事。"),
    ("井底之蛙", "見識淺薄", "青蛙住在井底", "環境保護", "追求自由", "比喻見識淺薄的人。"),
    ("守株待兔", "妄想不勞而獲", "等待兔子撞樹", "農夫很懶惰", "保護野生動物", "比喻妄想不勞而獲，或死守狹隘經驗。"),
    ("狐假虎威", "依靠別人的勢力欺壓人", "狐狸和老虎是朋友", "老虎很威風", "狐狸很聰明", "比喻依靠別人的勢力欺壓人。"),
    ("揠苗助長", "未循序漸進，反而壞事", "幫助秧苗長大", "農夫很勤勞", "施肥技術好", "比喻為求速成而未循序漸進，結果不但無益，反而有害。"),
    ("鄭人買履", "墨守成規，不信實際", "買鞋子忘記帶錢", "鄭國人很有錢", "鞋子很漂亮", "比喻墨守成規，不信實際。"),
    ("濫竽充數", "無真才實學混在行家中", "樂器演奏很好聽", "人數很多", "大家一起合作", "比喻無真才實學的人混在行家中充數。"),
    ("自相矛盾", "言語或行為前後牴觸", "矛和盾都很堅固", "商人很會推銷", "比武大賽", "比喻言語或行為前後牴觸。"),
    ("亡羊補牢", "犯錯後及時補救", "羊跑丟了", "修補羊圈", "牧羊很辛苦", "比喻犯錯後及時更正，尚能補救。"),
    ("班門弄斧", "在行家面前賣弄本領", "木匠手藝好", "斧頭很鋒利", "魯班是神匠", "比喻在行家面前賣弄本領，不自量力。"),
    ("東施效顰", "盲目模仿，效果更糟", "東施很漂亮", "西施生病了", "學習化妝", "比喻盲目模仿，效果更糟。"),
    ("臥薪嘗膽", "刻苦自勵，發憤圖強", "睡在柴薪上", "膽很苦", "喜歡吃苦", "比喻刻苦自勵，發憤圖強。"),
    ("破釜沉舟", "做事果決，義無反顧", "把船打破", "把鍋子打破", "乘船過河", "比喻做事果決，義無反顧。"),
]

PHONETICS = [
    ("中", "ㄓㄨㄥˋ", "百發百中", "中間", "人中", "中庸之道", "「中」讀第一聲時通常指方位或過程；讀第四聲時表「符合」或「射到目標」。"),
    ("強", "ㄑㄧㄤˇ", "強人所難", "強壯", "倔強", "富強", "在此處指「勉強」，故讀作三聲。"),
    ("一", "ㄧˊ", "一定", "一模一樣", "一心一意", "一干二淨", "「一」在去聲（四聲）字前變調為二聲。"),
    ("塑", "ㄙㄨˋ", "塑膠", "雕塑", "塑像", "可塑性", "讀作 ㄙㄨˋ。"),
    ("偌", "ㄖㄨㄛˋ", "偌大", "偌小", "偌多", "偌少", "讀作 ㄖㄨㄛˋ。"),
    ("蛤", "ㄍㄜˊ", "蛤蜊", "蛤蟆", "蛤蠣", "文蛤", "教育部標準讀音為「ㄍㄜˊ」。"),
    ("角", "ㄐㄩㄝˊ", "主角", "角落", "號角", "直角", "「角」在指角色、競逐時讀 ㄐㄩㄝˊ。"),
    ("落", "ㄌㄠˋ", "落枕", "落下", "降落", "落葉", "落枕讀作 ㄌㄠˋ ㄓㄣˇ。"),
    ("載", "ㄗㄞˋ", "載歌載舞", "記載", "千載難逢", "連載", "讀作 ㄗㄞˋ。意思是「且、又」。"),
    ("否", "ㄆㄧˇ", "否極泰來", "是否", "否認", "否定", "「否」極泰來讀作 ㄆㄧˇ，指壞運氣。"),
    ("創", "ㄔㄨㄤ", "創傷", "創意", "創造", "開創", "受傷、傷口讀一聲 ㄔㄨㄤ。"),
    ("滑", "ㄍㄨˇ", "滑稽", "光滑", "滑動", "滑雪", "滑稽古音及標準讀音應為 ㄍㄨˇ ㄐㄧ。"),
    ("哄", "ㄏㄨㄥˋ", "一哄而散", "哄堂大笑", "哄騙", "哄小孩", "讀四聲 ㄏㄨㄥˋ，指吵鬧喧嘩。"),
    ("強", "ㄐㄧㄤˋ", "倔強", "強壯", "強迫", "強大", "倔強讀作 ㄐㄧㄤˋ。"),
    ("嚇", "ㄏㄜˋ", "恐嚇", "驚嚇", "嚇一跳", "嚇唬", "恐嚇讀作 ㄏㄜˋ。"),
]

LITERATURE = [
    ("李白", "詩仙", "詩聖", "詩佛", "詩鬼", "李白被稱為詩仙。"),
    ("杜甫", "詩聖", "詩仙", "詩佛", "詩鬼", "杜甫被稱為詩聖。"),
    ("王維", "詩佛", "詩仙", "詩聖", "詩鬼", "王維被稱為詩佛。"),
    ("李賀", "詩鬼", "詩仙", "詩聖", "詩佛", "李賀被稱為詩鬼。"),
    ("蘇軾", "東坡居士", "青蓮居士", "六一居士", "香山居士", "蘇軾號東坡居士。"),
    ("陶淵明", "五柳先生", "靖節先生", "醉翁", "太白", "陶淵明自號五柳先生。"),
    ("歐陽修", "醉翁", "六一居士", "東坡", "山谷", "歐陽修自號醉翁，晚號六一居士。"),
    ("白居易", "香山居士", "青蓮居士", "易安居士", "六一居士", "白居易晚年退居香山，號香山居士。"),
    ("李清照", "易安居士", "青蓮居士", "香山居士", "六一居士", "李清照號易安居士。"),
    ("屈原", "離騷", "詩經", "論語", "史記", "屈原的代表作是《離騷》。"),
    ("司馬通", "史記", "漢書", "後漢書", "三國志", "司馬遷著有《史記》。"),
    ("班固", "漢書", "史記", "後漢書", "三國志", "班固著有《漢書》。"),
    ("孔子", "至聖先師", "亞聖", "兵聖", "書聖", "孔子被尊為至聖先師。"),
    ("孟子", "亞聖", "至聖", "兵聖", "書聖", "孟子被尊為亞聖。"),
    ("書法", "王羲之", "顏真卿", "柳公權", "歐陽詢", "王羲之被尊為書聖。"),
]

RHETORIC = [
    ("明喻", "像", "是", "變成", "仿佛", "明喻通常使用「像」、「如」、「似」等喻詞。"),
    ("隱喻", "是", "像", "仿佛", "好比", "隱喻（暗喻）通常使用「是」、「為」等喻詞。"),
    ("擬人", "把物當人寫", "把人當物寫", "把物當物寫", "把人當人寫", "擬人是賦予事物人的動作、情感或語言。"),
    ("誇飾", "言過其實", "實事求是", "輕描淡寫", "含蓄委婉", "誇飾是故意言過其實，以達到強調的效果。"),
    ("排比", "結構相似", "字數相等", "平仄相反", "意思相反", "排比是接連使用三個以上結構相似、語氣一致的句子。"),
    ("對偶", "字數相等，結構相同", "字數不等", "意思相同", "語氣相同", "對偶要求字數相等，結構相同或相似，平仄相對。"),
    ("倒反", "言不由衷", "真心誠意", "直話直說", "拐彎抹角", "倒反是言辭表面的意思和實際意思相反。"),
    ("設問", "自問自答", "只問不答", "不問自答", "問而不答", "設問是為了引起注意，先提出問題，再自己回答。"),
    ("反問", "明知故問", "不知而問", "小聲詢問", "大聲質問", "反問（激問）是無疑而問，答案就在問題中。"),
    ("頂真", "首尾相接", "頭尾呼應", "前後矛盾", "段落分明", "頂真是以前一句的結尾作為後一句的開頭。"),
]

PUNCTUATION = [
    ("句號", "。", "，", "、", "；", "用於句子的結尾。"),
    ("逗號", "，", "。", "、", "；", "用於句中的停頓。"),
    ("頓號", "、", "，", "。", "；", "用於並列詞語之間的停頓。"),
    ("分號", "；", "，", "。", "、", "用於分句之間的停頓。"),
    ("冒號", "：", "；", "，", "。", "用於總結上文或提示下文。"),
    ("引號", "「」", "『』", "()", "[]", "用於引用別人的話或特別強調的詞語。"),
    ("夾注號", "()", "[]", "「」", "『』", "用於補充說明或注釋。"),
    ("問號", "？", "！", "。", "，", "用於疑問句的結尾。"),
    ("驚嘆號", "！", "？", "。", "，", "用於感嘆句或命令句的結尾。"),
    ("破折號", "——", "……", "—", "-", "用於語意轉變、聲音延續或補充說明。"),
    ("刪節號", "……", "——", "。。。", "---", "用於省略原文、語氣未完或聲音斷續。"),
    ("書名號", "﹏﹏", "____", "……", "——", "用於標示書名、篇名、歌曲名等。"),
]

NOUNS = ["天空", "大地", "海洋", "森林", "高山", "河流", "太陽", "月亮", "星星", "雲朵"]
VERBS = ["奔跑", "飛翔", "跳躍", "遊泳", "攀爬", "行走", "思考", "觀察", "聆聽", "說話"]
ADJECTIVES = ["美麗", "壯觀", "遼闊", "茂密", "險峻", "湍急", "溫暖", "明亮", "閃爍", "潔白"]

def generate_questions(publisher_code, publisher_name):
    questions = []
    
    # 1. Idioms (20 questions)
    shuffled_idioms = random.sample(IDIOMS, len(IDIOMS))
    for i, (idiom, meaning, w1, w2, w3, explanation) in enumerate(shuffled_idioms):
        options = [meaning, w1, w2, w3]
        random.shuffle(options)
        correct_idx = options.index(meaning)
        questions.append({
            "id": len(questions) + 1,
            "category": "成語運用",
            "question": f"「{idiom}」的意思是什麼？",
            "options": options,
            "correctAnswer": correct_idx,
            "explanation": explanation,
            "funFact": f"這是{publisher_name}版六年級常見的成語喔！"
        })

    # 2. Phonetics (15 questions)
    shuffled_phonetics = random.sample(PHONETICS, len(PHONETICS))
    for i, (char, sound, correct_word, w1, w2, w3, explanation) in enumerate(shuffled_phonetics):
        options = [correct_word, w1, w2, w3]
        random.shuffle(options)
        correct_idx = options.index(correct_word)
        questions.append({
            "id": len(questions) + 1,
            "category": "字音字形",
            "question": f"下列哪一個詞語的「{char}」字讀音為「{sound}」？",
            "options": options,
            "correctAnswer": correct_idx,
            "explanation": explanation
        })

    # 3. Literature (15 questions)
    shuffled_lit = random.sample(LITERATURE, len(LITERATURE))
    for i, (subject, answer, w1, w2, w3, explanation) in enumerate(shuffled_lit):
        options = [answer, w1, w2, w3]
        random.shuffle(options)
        correct_idx = options.index(answer)
        questions.append({
            "id": len(questions) + 1,
            "category": "國學常識",
            "question": f"關於{subject}，下列敘述何者正確？" if "被稱為" not in explanation else f"{subject}被後世尊稱為？",
            "options": options,
            "correctAnswer": correct_idx,
            "explanation": explanation
        })

    # 4. Rhetoric (10 questions)
    shuffled_rhetoric = random.sample(RHETORIC, len(RHETORIC))
    for i, (rhetoric, key, w1, w2, w3, explanation) in enumerate(shuffled_rhetoric):
        options = [key, w1, w2, w3]
        random.shuffle(options)
        correct_idx = options.index(key)
        questions.append({
            "id": len(questions) + 1,
            "category": "修辭",
            "question": f"關於「{rhetoric}」修辭，下列特徵何者正確？",
            "options": options,
            "correctAnswer": correct_idx,
            "explanation": explanation
        })

    # 5. Punctuation (12 questions)
    shuffled_punc = random.sample(PUNCTUATION, len(PUNCTUATION))
    for i, (name, symbol, w1, w2, w3, explanation) in enumerate(shuffled_punc):
        options = [symbol, w1, w2, w3]
        random.shuffle(options)
        correct_idx = options.index(symbol)
        questions.append({
            "id": len(questions) + 1,
            "category": "標點符號",
            "question": f"「{name}」的標點符號是？",
            "options": options,
            "correctAnswer": correct_idx,
            "explanation": explanation
        })
        
    # 6. Reading Comprehension / Logic (Fill to 100)
    # Generate some templated reading/logic questions to reach 100
    current_count = len(questions)
    needed = 100 - current_count
    
    for i in range(needed):
        noun = random.choice(NOUNS)
        adj = random.choice(ADJECTIVES)
        verb = random.choice(VERBS)
        
        q_type = random.choice(["詞性判斷", "造句分析", "修辭辨析"])
        
        if q_type == "詞性判斷":
            question_text = f"在句子「{adj}的{noun}正在{verb}」中，「{verb}」的詞性是什麼？"
            opts = ["動詞", "形容詞", "名詞", "副詞"]
            ans_idx = 0
            exp = f"「{verb}」表示動作，所以是動詞。"
            cat = "語法"
        elif q_type == "造句分析":
            question_text = f"下列哪個句子使用了「{adj}」這個形容詞？"
            correct = f"我看見了{adj}的{noun}。"
            opts = [correct, f"他正在{verb}。", f"這是{noun}。", f"他跑得很快。"]
            random.shuffle(opts)
            ans_idx = opts.index(correct)
            exp = f"只有選項中出現了「{adj}」來形容名詞。"
            cat = "閱讀理解"
        else: # 修辭辨析
            question_text = f"「{noun}像{adj}的寶石一樣。」這句話使用了哪種修辭？"
            opts = ["譬喻", "擬人", "排比", "誇飾"]
            ans_idx = 0
            exp = "使用了「像...一樣」的比喻詞，屬於譬喻（明喻）。"
            cat = "修辭"
            
        questions.append({
            "id": len(questions) + 1,
            "category": cat,
            "question": question_text,
            "options": opts,
            "correctAnswer": ans_idx,
            "explanation": exp,
            "funFact": f"多練習造句可以增進寫作能力喔！"
        })

    return questions

def write_js_file(publisher_code, questions):
    filename = f"s1_{publisher_code}.js"
    filepath = os.path.join(OUTPUT_DIR, filename)
    
    js_content = f"""// {PUBLISHERS[publisher_code]}版 六年級上學期 國語題庫
// 自動生成於 Antigravity

export const questions = {json.dumps(questions, ensure_ascii=False, indent=2)}
"""
    
    with open(filepath, 'w', encoding='utf-8') as f:
        f.write(js_content)
    print(f"Generated {filepath} with {len(questions)} questions.")

def main():
    if not os.path.exists(OUTPUT_DIR):
        os.makedirs(OUTPUT_DIR)
        
    for code, name in PUBLISHERS.items():
        print(f"Generating questions for {name}...")
        qs = generate_questions(code, name)
        write_js_file(code, qs)

if __name__ == "__main__":
    main()
