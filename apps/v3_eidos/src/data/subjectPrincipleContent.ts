import type { Grade, Subject } from '@/data/config';

export interface SubjectPrincipleSection {
  title: string;
  body: string;
}

export interface SubjectPrincipleContent {
  title: string;
  sections: SubjectPrincipleSection[];
}

/**
 * 依年級與科目取得單科出題原則內容。
 * 注入感性且專業的教研文案 (JOB-046 Specs)。
 */
export function getSubjectPrincipleContent(grade: Grade, subject: Subject): SubjectPrincipleContent {
  // 通用的配比心法區塊
  const ratioSection: SubjectPrincipleSection = {
    title: '題組配比 - 4-4-2 最符合中年級的智力發育',
    body: '「最契合三年級心智成熟度的認知節奏」。為什麼我的題組總是 4-4-2？這是我為三年級轉銜量身訂做的設計：40% 是「當課核心」，穩住新鮮知識；40% 是「穩定基礎」，複習易錯盲點；而最後 20% 的「融會貫通」，則是將各課觀念「中和」應用。這不只是一組題目，而是讓孩子在大腦承受度內，將知識轉化為能力的教育投資。'
  };

  // 三年級國語 (AI 專家說精華版)
  if (grade === 3 && subject === '國語') {
    return {
      title: '三下國語：看見文字背後的畫面',
      sections: [
        {
          title: '不只是考事實，更考「為什麼」',
          body: '這個階段的孩子，我們不該只問「誰做了什麼」。我會試著問「他為什麼在這個時候這樣做？」，引導孩子從課文線索去猜測角色的心情，這就是提升閱讀素養的關鍵。'
        },
        {
          title: '感覺修辭的「視覺效果」',
          body: '別讓孩子死背「擬人法」或「譬喻法」。我設計的題目會問：「加上這個寫法後，你腦海中出現了什麼樣的畫面？」讓修辭變成活生生的感官體驗。'
        },
        {
          title: '跟大自然學解決的方法',
          body: '三下有很多「向自然學習」的內容（如魯班、皮爾森）。我會刻意連結「觀察→思考→發明」的邏輯鏈，讓孩子明白讀書是學習解決問題的科學態度。'
        },
        ratioSection
      ]
    };
  }

  // 三年級數學 (JOB-046 Case)
  if (grade === 3 && subject === '數學') {
    return {
      title: '三年級數學：讓數學成為解決問題的工具',
      sections: [
        {
          title: '🧮 算用合一原則',
          body: '看到數字就亂加減？那是因為孩子沒看懂問題。我們堅持「算用合一」。三年級的考題完全捨棄了單純的算式，取而代之的是【規劃校外教學】或【超市結帳】等真實場景。',
        },
        ratioSection
      ],
    };
  }

  // 三年級自然 (JOB-046 Case)
  if (grade === 3 && subject === '自然') {
    return {
      title: '三年級自然：點燃科學探究的火花',
      sections: [
        {
          title: '🌿 探究歷程導向',
          body: '科學不應該只是背誦實驗結果。我們的出題核心在於「探究歷程」。我們不直接問答案，而是還原【實驗室現場】，詢問孩子如何設計對照組、如何觀察細微變化。',
        },
        ratioSection
      ],
    };
  }

  // 三年級社會 (JOB-046 Case)
  if (grade === 3 && subject === '社會') {
    return {
      title: '三年級社會：建立對家鄉的愛與認同',
      sections: [
        {
          title: '🏘️ 歷史人物思維',
          body: '我們捨棄死背地名與年代。題目設計融入了【社區居民的身分認同】與【環境變遷的決策】，引導孩子站在歷史人物的角度思考「為什麼要這樣選擇？」。',
        },
        ratioSection
      ],
    };
  }

  // 三年級英語 (JOB-046 Case)
  if (grade === 3 && subject === '英語') {
    return {
      title: '三年級英語：打破沉默大腦的溝通訓練',
      sections: [
        {
          title: '🔤 溝通式教學法',
          body: '學英文，是為了在真實世界開口交朋友。針對三年級的英語斷層，我們導入了溝通式教學法。題目不再考瑣碎文法，而是將詞彙埋伏於長度適中、節奏明快的【生活對話】中。',
        },
        ratioSection
      ],
    };
  }

  // 其他年級/科目：預留結構
  return {
    title: `${grade}年級 ${subject} 出題原則`,
    sections: [
      {
        title: '大腦友善三原則',
        body: '本平台題目依認知負荷與情境設計，避免盲猜、強化推論。詳細內容請詳閱「出題原則」總覽。',
      },
      ratioSection
    ],
  };
}

/** 跨科目出題原則總綱 */
export const CROSS_SUBJECT_PRINCIPLE = {
  title: '核心命題心法：旨在協助孩子建立什麼樣的大腦？',
  principles: [
    {
      title: '原則一：有溫度的畫面感',
      body: '我不考冷冰冰的選擇題。藉由賦予每個題目情境，讓孩子在大腦裡快速建立場景，專注於推論，而不是在那裡跟死板的文字博鬥。',
    },
    {
      title: '原則二：看見錯誤背後的意義',
      body: '這裡的錯誤選項絕非亂數產生。每一個選項都是為了抓出「孩子最容易卡住的小缺口」。選錯了沒關係，那是我們發現孩子思考路徑最好的時刻。',
    },
  ],
} as const;
