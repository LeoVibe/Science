#!/usr/bin/env node
/**
 * 批次：KL3 課文垃圾行刪除、Pixnet 連結正規化、G3 S2 國語刪丙類題、翰林 L8 重寫、選項硬湊句移除。
 * last_updated: 2026-03-28 21:30
 * updated_by: Cursor Agent
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { createRequire } from 'module';

const require = createRequire(import.meta.url);
const { evaluateFile } = require('./evaluate_question_quality.js');

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const KL3 = path.join(
  repoRoot,
  'knowledge/1_課綱研究/國語/KL3_國語_研究進度_課文與索引.md'
);

const G3S2_CHI = path.join(repoRoot, 'question/platform/G3/Chinese/S2');

/** 題庫選項／題幹硬湊句（使用者指定移除） */
const FILLER =
  /，這也是作者想強調的重點之一。?|這也是作者想強調的重點之一。?|，這點在實務上很重要。?|這點在實務上很重要。?/g;

function stripFillerText(s) {
  if (typeof s !== 'string') return s;
  let t = s.replace(FILLER, '');
  t = t.replace(/。{2,}/g, '。');
  t = t.replace(/，。/g, '。');
  t = t.replace(/。\s*。/g, '。');
  t = t.replace(/，\s*，/g, '，');
  return t.trim();
}

function cleanQuestionObject(q) {
  for (const k of [
    'question',
    'scenario',
    'explanation',
    'commonMisconception',
  ]) {
    if (q[k]) q[k] = stripFillerText(q[k]);
  }
  if (Array.isArray(q.options)) {
    q.options = q.options.map((o) => stripFillerText(o));
  }
  return q;
}

/** KL3：刪「看完文章後點點這裡做個測驗吧」行；Pixnet 網址截斷為 post/{id} */
function fixKl3() {
  let s = fs.readFileSync(KL3, 'utf8');
  const before = s.length;
  s = s.replace(/^\s*看完文章後點點這裡做個測驗吧[^\n]*\n/gm, '');
  // 角括號內 Pixnet：post/數字-後綴 → post/數字
  s = s.replace(
    /<(https?:\/\/acerksy\.pixnet\.net\/blog\/post\/)(\d+)(-[^>]+)>/gi,
    '<$1$2>'
  );
  // 裸 URL（**URL**: 或行內）
  s = s.replace(
    /(https?:\/\/acerksy\.pixnet\.net\/blog\/post\/)(\d+)(-[^\s\)\]>"']+)/gi,
    '$1$2'
  );
  fs.writeFileSync(KL3, s, 'utf8');
  console.log(
    'KL3: removed 測驗垃圾行 + normalized pixnet URLs; bytes',
    before,
    '→',
    s.length
  );
}

function walkJsonFiles(dir, out = []) {
  for (const name of fs.readdirSync(dir)) {
    const p = path.join(dir, name);
    const st = fs.statSync(p);
    if (st.isDirectory()) walkJsonFiles(p, out);
    else if (
      name.endsWith('.json') &&
      !name.includes('manifest') &&
      !name.includes('mismatch') &&
      !name.includes('libraryStats')
    )
      out.push(p);
  }
  return out;
}

function removeBlindMismatchQuestions(filePath) {
  const j = JSON.parse(fs.readFileSync(filePath, 'utf8'));
  const qs = j.questions || [];
  const kept = qs.filter((q) => !q.blind_eval_mismatch);
  const removed = qs.length - kept.length;
  if (removed === 0) return { removed: 0, path: filePath };
  j.questions = kept.map((q) => {
    const c = { ...q };
    delete c.blind_eval_mismatch;
    return c;
  });
  fs.writeFileSync(filePath, JSON.stringify(j, null, 2) + '\n', 'utf8');
  return { removed, path: filePath, newLen: kept.length };
}

function stripFillerAllUnderQuestionPlatform() {
  const root = path.join(repoRoot, 'question/platform');
  const files = walkJsonFiles(root);
  let n = 0;
  for (const fp of files) {
    const raw = fs.readFileSync(fp, 'utf8').trim();
    if (!raw) continue;
    let j;
    try {
      j = JSON.parse(raw);
    } catch {
      console.warn('stripFiller skip invalid JSON:', fp);
      continue;
    }
    const qs = j.questions;
    if (!Array.isArray(qs)) continue;
    const next = qs.map((q) => cleanQuestionObject({ ...q }));
    const changed = JSON.stringify(qs) !== JSON.stringify(next);
    if (changed) {
      j.questions = next;
      fs.writeFileSync(fp, JSON.stringify(j, null, 2) + '\n', 'utf8');
      n++;
    }
  }
  console.log('Filler strip: updated JSON files:', n);
}

function buildHanLinL8Questions() {
  const qs = [];
  function Q(o) {
    qs.push({
      question: o.q,
      commonMisconception: o.mis,
      scenario: o.sc,
      quality_level: 'QL3',
      cqi_score: o.cqi ?? 4,
      explanation: o.exp,
      answer_index: 0,
      options: o.opts,
      taxonomy: o.tax,
      blind_evaluation: false,
      authoring_model: 'Cursor-Agent-2026-03-28',
    });
  }

  Q({
    tax: 'literal',
    sc: '【課文作者】',
    q: '《行人的守護者》這篇課文的作者是誰？',
    opts: ['林茵', '林海音', '李潼', '張文亮'],
    a: 0,
    exp: '課文標示作者為林茵。',
    mis: '誤把敘述者「小綠人」當成作者名。',
  });
  Q({
    tax: 'literal',
    sc: '【敘述觀點】',
    q: '課文用誰的口吻來說話？',
    opts: [
      '小綠人（行人號誌）',
      '紅綠燈箱裡的維修技師',
      '路邊的行道樹',
      '開車的駕駛人',
    ],
    a: 0,
    exp: '開頭即以「我是行人的好朋友」自述，敘述者是擬人化的小綠人。',
    mis: '誤以為是旁觀的路人第三人稱。',
  });
  Q({
    tax: 'literal',
    sc: '【第一段】',
    q: '課文裡，大家為什麼叫敘述者「小綠人」？',
    opts: [
      '因為身體會發出閃亮的綠色光芒，引導行人穿越馬路',
      '因為他穿綠色雨衣上學',
      '因為他喜歡喝綠茶',
      '因為他住在綠色的房子',
    ],
    a: 0,
    exp: '文中寫身體發出閃亮綠光，引導行人走行人穿越道。',
    mis: '字面聯想「綠」而忽略號誌功能。',
  });
  Q({
    tax: 'literal',
    sc: '【路口情境】',
    q: '小男孩說「小紅人立正站好」時，代表行人應該怎麼做？',
    opts: ['不能過馬路，要等待', '可以快點衝過去', '可以闖紅燈', '只要沒車就可以過'],
    a: 0,
    exp: '對話點出紅燈時不能過，需等待小綠人。',
    mis: '誤以為「立正」只是好玩動作。',
  });
  Q({
    tax: 'literal',
    sc: '【對話理解】',
    q: '小女孩說小綠人是「給行人看的綠燈」，這句話主要在說明什麼？',
    opts: [
      '號誌是提醒行人可以依指示安全通行',
      '只有開車的人才需要看燈',
      '綠燈是裝飾用的燈光秀',
      '行人不需要理會號誌',
    ],
    a: 0,
    exp: '將號誌與行人路權連結，強調依燈號行動。',
    mis: '混淆行人號誌與車道號誌。',
  });
  Q({
    tax: 'literal',
    sc: '【第三段】',
    q: '輪到小綠人上場時，他一開始如何引導行人？',
    opts: [
      '邁出不疾不緩的步伐，抬頭挺胸引導往前走',
      '站在原地完全不動',
      '要大家閉眼睛跑步',
      '要大家倒退走',
    ],
    a: 0,
    exp: '課文寫「不疾不緩的步伐」「抬頭挺胸」引導前進。',
    mis: '與後段「快步走」時序顛倒。',
  });
  Q({
    tax: 'literal',
    sc: '【第三段】',
    q: '倒數快結束時，小綠人的動作有什麼改變？',
    opts: [
      '開始快步走，提醒行人加快腳步',
      '變成小紅人',
      '關燈休息',
      '離開馬路口回家',
    ],
    a: 0,
    exp: '文中寫倒數快結束時開始快步走，行人也跟著加快。',
    mis: '忽略倒數與節奏變化的關係。',
  });
  Q({
    tax: 'inferential',
    sc: '【因果推論】',
    q: '為什麼倒數快結束時，小綠人要改為快步走？',
    opts: [
      '提醒行人時間不多，要加快完成穿越以策安全',
      '因為他比賽要贏',
      '因為他累了想早點下班',
      '因為紅燈壞掉了',
    ],
    a: 0,
    exp: '與「安全穿越」連結：時間將屆需加快腳步。',
    mis: '無因果，僅當成誇張動作。',
  });
  Q({
    tax: 'literal',
    sc: '【詞語】',
    q: '「不疾不緩」在課文脈絡中最接近下列何者？',
    opts: ['速度從容、不過快也不過慢', '非常急躁', '完全靜止不動', '隨便亂走'],
    a: 0,
    exp: '「疾」快、「緩」慢；不疾不緩即從容有度。',
    mis: '望文生義成「生病」相關。',
  });
  Q({
    tax: 'literal',
    sc: '【末段】',
    q: '課文最後一段，小綠人如何形容自己的工作態度？',
    opts: [
      '不管白天或夜晚、晴天或雨天，總是認真守護行人',
      '只有晴天上班，雨天放假',
      '只在早上工作一小時',
      '遇到雨天就離開崗位',
    ],
    a: 0,
    exp: '末段以「不管…不管…總是…」強調堅守崗位。',
    mis: '忽略條件排比句的語意。',
  });
  Q({
    tax: 'applied',
    sc: '【生活安全】',
    q: '依課文觀念，過馬路時最安全的做法是什麼？',
    opts: [
      '看行人號誌，依小綠人與倒數指示通行',
      '只要車少就可以闖紅燈',
      '低頭玩手機過馬路',
      '跟著別人跑就好，不用看燈',
    ],
    a: 0,
    exp: '課文主軸為依號誌與倒數安全通行。',
    mis: '用僥倖心態取代規則。',
  });
  Q({
    tax: 'inferential',
    sc: '【擬人手法】',
    q: '課文把小綠人寫成會「抬頭挺胸」「邁出步伐」，主要效果為何？',
    opts: [
      '讓號誌動作具體可感，幫助理解通行節奏',
      '證明號誌是真人假扮',
      '說明號誌會跳舞娛樂路人',
      '表示號誌有感情會生氣',
    ],
    a: 0,
    exp: '擬人化使抽象規則變成可見的引導動作。',
    mis: '把修辭當成寫實陳述。',
  });
  Q({
    tax: 'literal',
    sc: '【細節】',
    q: '課文裡，小綠人站在什麼位置服務行人？',
    opts: ['馬路口，協助走行人穿越道', '學校教室', '超級市場收銀台', '公車車廂內'],
    a: 0,
    exp: '首段寫天天站在馬路口，引導穿越道。',
    mis: '地點遷移到室內場景。',
  });
  Q({
    tax: 'critical',
    sc: '【寫作策略】',
    q: '全文用第一人稱介紹交通號誌，這樣寫最主要的優點是什麼？',
    opts: [
      '讓讀者像聽小綠人自我介紹，更容易記住規則',
      '讓文章變成恐怖故事',
      '讓讀者不需要學任何交通知識',
      '讓文章只能給老師閱讀',
    ],
    a: 0,
    exp: '第一人稱拉近距離，利於兒童理解號誌角色。',
    mis: '誤判為純娛樂而無教育目的。',
  });
  Q({
    tax: 'inferential',
    sc: '【詞彙】',
    q: '「穿越道」在課文中指的是什麼？',
    opts: [
      '行人依法可通行過馬路的斑馬線區域',
      '火車鐵軌',
      '地下停車場入口',
      '公園裡的步道',
    ],
    a: 0,
    exp: '與「引導人們走過行人穿越道」一句呼應。',
    mis: '與其他「道路」詞彙混淆。',
  });
  Q({
    tax: 'literal',
    sc: '【聽覺與觀察】',
    q: '第三段開頭，小綠人在休息時先注意到什麼？',
    opts: [
      '兩個小朋友的交談聲（關於紅燈與小綠人）',
      '救護車警笛',
      '下大雨的聲音',
      '商店拍賣廣播',
    ],
    a: 0,
    exp: '第二段寫聽到兩個小朋友交談聲，談紅燈與小綠人。',
    mis: '誤記成別的聲音來源。',
  });
  Q({
    tax: 'inferential',
    sc: '【比較紅綠】',
    q: '綜合小男孩與小女孩的對話，下列敘述何者正確？',
    opts: [
      '小紅人亮時不能過，要等小綠人出現',
      '小紅人亮時可以搶快通過',
      '小綠人與小紅人沒有差別',
      '只有汽車要看燈，行人不用',
    ],
    a: 0,
    exp: '對話清楚區分禁止通行與可通行時機。',
    mis: '角色對調或規則記反。',
  });
  Q({
    tax: 'applied',
    sc: '【角色扮演】',
    q: '你要向一年級學弟說明「為什麼要看小綠人」，哪一句最符合課文？',
    opts: [
      '小綠人亮時，表示行人可以依指示安全過馬路',
      '小綠人亮時要閉眼快跑',
      '小綠人只是廣告看板',
      '小綠人會決定誰考試一百分',
    ],
    a: 0,
    exp: '連結課文「引導」「守護」與號誌意義。',
    mis: '玩笑話當正規說明。',
  });
  Q({
    tax: 'literal',
    sc: '【情感語氣】',
    q: '大家都安全穿越後，小綠人心裡想什麼？（依課文用詞）',
    opts: ['真想歡呼', '覺得很無聊', '想要辭職', '覺得行人都很煩'],
    a: 0,
    exp: '課文寫「我真想歡歡呼」（教材原文如此，語氣為欣喜）。',
    mis: '忽略文末情緒是正向的。',
  });
  Q({
    tax: 'contextual',
    sc: '【公共設施】',
    q: '從課文來看，「行人的守護者」指的是誰？',
    opts: [
      '盡責引導與守護行人安全的小綠人號誌',
      '馬路旁的便利商店店員',
      '導護媽媽的自稱',
      '斑馬線上的油漆工人',
    ],
    a: 0,
    exp: '標題與內容都指向擬人化的小綠人號誌角色。',
    mis: '把「守護者」套到其他職業。',
  });
  Q({
    tax: 'inferential',
    sc: '【結構】',
    q: '課文從「自我介紹」到「路口對話」再到「上場引導」，屬於哪一種安排？',
    opts: [
      '由靜態說明到情境對話，再到動態過馬路過程',
      '先寫結局再寫開頭',
      '只寫對話沒有順序',
      '隨機拼湊多篇文章',
    ],
    a: 0,
    exp: '層次為身分→觀察對話→實際引導，條理清楚。',
    mis: '無法辨識敘事順序。',
  });
  Q({
    tax: 'literal',
    sc: '【字詞】',
    q: '「引導」一詞在課文中與下列何者意思最接近？',
    opts: ['帶領、指示方向使人依序行動', '強迫推擠', '獨自離開', '大聲責罵'],
    a: 0,
    exp: '小綠人引導行人穿越道，具帶領意味。',
    mis: '誤解成負面強迫。',
  });
  Q({
    tax: 'inferential',
    sc: '【倒數計時】',
    q: '課文提到「配合倒數計時」，最可能代表什麼交通設計？',
    opts: [
      '綠燈剩餘秒數提醒行人加快或停下',
      '考試交卷倒數',
      '電玩遊戲計分',
      '電視節目廣告時間',
    ],
    a: 0,
    exp: '與路口行人號誌倒數連結，促進安全判斷。',
    mis: '脫離交通情境聯想。',
  });
  Q({
    tax: 'literal',
    sc: '【第二段】',
    q: '小綠人說他喜歡欣賞什麼？',
    opts: ['路口的風光', '海底世界', '星空照片', '博物館骨董'],
    a: 0,
    exp: '第二段寫「喜歡欣賞路口的風光」。',
    mis: '記憶錯置到其他景觀。',
  });
  Q({
    tax: 'applied',
    sc: '【雨天情境】',
    q: '課文說雨天仍守護行人，這告訴我們什麼？',
    opts: [
      '交通安全不分天氣，仍須依號誌行動',
      '雨天可以不看號誌',
      '雨天禁止所有人過馬路',
      '雨天號誌會自動失效',
    ],
    a: 0,
    exp: '呼應「不管晴天或雨天…守護」。',
    mis: '以天氣為藉口違規。',
  });
  Q({
    tax: 'inferential',
    sc: '【修辭】',
    q: '「立正站好」用來形容小紅人，主要是要強調什麼？',
    opts: [
      '停止前進、禁止通行的狀態',
      '小紅人在做體操比賽',
      '小紅人準備跑步',
      '小紅人在跳舞',
    ],
    a: 0,
    exp: '擬人化描寫靜止禁止的號誌狀態。',
    mis: '字面當成體育活動。',
  });
  Q({
    tax: 'literal',
    sc: '【統整】',
    q: '下列哪一個選項最能代表課文主旨？',
    opts: [
      '行人號誌守護安全，我們要遵守號誌與倒數',
      '笨鵝的故事告訴我們不要慢吞吞',
      '如何製作紅綠燈',
      '鄉下比城市安全所以不用看燈',
    ],
    a: 0,
    exp: '全文圍繞小綠人引導與守護行人安全。',
    mis: '誤選與課文無關的文本（如笨鵝）。',
  });
  Q({
    tax: 'inferential',
    sc: '【態度】',
    q: '從「認真的守護著行人」一句，可以推論小綠人對工作的態度是？',
    opts: ['負責盡職', '敷衍了事', '隨興亂來', '只想偷懶'],
    a: 0,
    exp: '「認真」「守護」指向負責態度。',
    mis: '把擬人角色當成會偷懶的人。',
  });
  Q({
    tax: 'literal',
    sc: '【細節】',
    q: '課文中，行人過馬路時跟著誰的節奏加快腳步？',
    opts: ['小綠人', '小狗', '風向', '路燈顏色隨機變化'],
    a: 0,
    exp: '寫「他們也跟著加快腳步」，前句主語為小綠人快步走。',
    mis: '主詞對象搞錯。',
  });
  Q({
    tax: 'contextual',
    sc: '【跨領域】',
    q: '若把課文介紹給外國遊客，下列哪一句最能保留課文重點？',
    opts: [
      '臺灣路口的行人號誌會用動態小綠人提醒通行與剩餘時間',
      '臺灣沒有行人號誌',
      '行人號誌只有小孩要看',
      '過馬路完全靠運氣',
    ],
    a: 0,
    exp: '綜合動態引導、倒數與安全意涵。',
    mis: '傳遞錯誤或過度簡化的資訊。',
  });

  if (qs.length !== 30) throw new Error('L8 count ' + qs.length);

  // 輪替正解位置 0..3
  qs.forEach((q, i) => {
    const target = i % 4;
    const opts = [...q.options];
    const correct = opts[0];
    const wrong = opts.slice(1);
    const newOpts = [null, null, null, null];
    newOpts[target] = correct;
    let w = 0;
    for (let s = 0; s < 4; s++) {
      if (s !== target) newOpts[s] = wrong[w++];
    }
    q.options = newOpts;
    q.answer_index = target;
  });

  return qs;
}

function writeHanLinL8() {
  const fp = path.join(
    G3S2_CHI,
    'HanLin/G3_S2_CHI_HANLIN_L8.json'
  );
  const questions = buildHanLinL8Questions();
  const root = {
    meta: {
      grade: 'G3',
      semester: 'S2',
      subject: 'CHI',
      publisher: 'HANLIN',
      lesson: 'L8',
      order: 8,
      title: '行人的守護者',
      theme: '交通號誌擬人：小綠人引導行人穿越道、倒數與安全意識（對齊 KL4 課文）。',
    },
    questions,
    publisher: 'HanLin',
  };
  fs.writeFileSync(fp, JSON.stringify(root, null, 2) + '\n', 'utf8');
  console.log('Wrote HanLin L8, questions:', questions.length);
}

function updateG3S2Manifests() {
  const publishers = ['HanLin', 'KangHsuan', 'NanYi'];
  for (const pub of publishers) {
    const manPath = path.join(G3S2_CHI, pub, `G3_S2_CHI_${pub.toUpperCase()}_manifest.json`);
    if (!fs.existsSync(manPath)) continue;
    const m = JSON.parse(fs.readFileSync(manPath, 'utf8'));
    let total = 0;
    for (const item of m.items || []) {
      const jf = path.join(G3S2_CHI, pub, item.file);
      if (fs.existsSync(jf)) {
        const j = JSON.parse(fs.readFileSync(jf, 'utf8'));
        const c = (j.questions || []).length;
        item.count = c;
        total += c;
      }
    }
    m.moduleMetaData = m.moduleMetaData || {};
    m.moduleMetaData.total_questions = total;
    m.moduleMetaData.last_updated = new Date().toISOString();
    fs.writeFileSync(manPath, JSON.stringify(m, null, 2) + '\n', 'utf8');
    console.log('Manifest', pub, 'total_questions', total);
  }
}

function main() {
  fixKl3();
  stripFillerAllUnderQuestionPlatform();

  const removedLog = [];
  for (const pub of ['HanLin', 'KangHsuan', 'NanYi']) {
    const dir = path.join(G3S2_CHI, pub);
    for (const f of fs.readdirSync(dir)) {
      if (!f.endsWith('.json') || f.includes('manifest')) continue;
      const r = removeBlindMismatchQuestions(path.join(dir, f));
      if (r.removed) removedLog.push(r);
    }
  }
  console.log(
    'Removed blind_eval_mismatch questions:',
    removedLog.map((x) => `${path.basename(x.path)}: -${x.removed}`).join(', ')
  );

  writeHanLinL8();

  const toEval = walkJsonFiles(G3S2_CHI);
  for (const fp of toEval) {
    try {
      evaluateFile(fp);
    } catch (e) {
      console.warn('evaluateFile skip', fp, e.message);
    }
  }
  updateG3S2Manifests();
  console.log('Done.');
}

main();
