#!/usr/bin/env node
/**
 * JOB-169 Phase 3：G4S2 自然 Mismatch 審查套用（一次性腳本）
 * 執行：node scripts/j169_phase3_apply.js
 */
const fs = require("fs");
const path = require("path");

const ROOT = path.join(__dirname, "..");
const BASE = path.join(ROOT, "question/platform/G4/Science/S2");

const today = "2026-04-10";

function resolveMismatch(q, cls, topReview, note) {
  if (!q.blind_eval_mismatch) return;
  q.blind_eval_mismatch.mismatch_classification = cls;
  q.blind_eval_mismatch.review_status = topReview === "corrected" ? "corrected" : "confirmed";
  q.blind_eval_mismatch.reviewer = "JOB-169 Phase3";
  q.blind_eval_mismatch.review_date = today;
  if (note) q.blind_eval_mismatch.review_note = note;
  q.review_status = topReview;
  q.review_notes = [q.review_notes || "", note || ""].filter(Boolean).join(" ").trim();
  q.reviewer = "JOB-169";
  q.review_date = today;
}

/** @type {Record<string, Record<number, (q: any) => void>>} */
const patches = {
  "HanLin/G4_S2_SCI_HANLIN_L1.json": {
    7: (q) => {
      resolveMismatch(q, "TYPE_A", "confirmed", "磁鐵題：題庫答案(0)複合敘述正確，盲測選單一項屬幻覺。");
    },
    11: (q) => {
      resolveMismatch(q, "TYPE_A", "confirmed", "力的大小標示：課綱強調形變量測，答案(2)優於以上皆是。");
    },
  },
  "HanLin/G4_S2_SCI_HANLIN_L3.json": {
    11: (q) => {
      q.question =
        "請依四年級自然課所學仔細判斷：昆蟲的成蟲通常有幾對翅膀、幾對腳？";
      q.options = ["兩對翅膀、三對腳", "一對翅膀、四對腳", "沒有翅膀、六對腳", "三對翅膀、兩對腳"];
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "選項誤植為無關敘述，已改為翅腳組合選項並設答案0。");
    },
  },
  "HanLin/G4_S2_SCI_HANLIN_L4.json": {
    2: (q) => {
      q.question =
        "請依四年級自然課所學仔細判斷：將相同燈泡接在同一電路中，電池改為並聯後，燈泡亮度會如何？";
      q.options = ["與原本相同（不變）", "變得更亮", "變得更暗", "無法判斷"];
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "選項誤植，已改為並聯亮度敘述；答案維持不變。");
    },
  },
  "NanYi/G4_S2_SCI_NANYI_L1.json": {
    0: (q) => {
      q.answer_index = 3;
      q.blind_eval_mismatch.correct_answer = 3;
      resolveMismatch(q, "TYPE_B", "corrected", "補 answer_index=3（高度角與垂線刻度互餘）。");
    },
    1: (q) => {
      q.answer_index = 2;
      q.blind_eval_mismatch.correct_answer = 2;
      resolveMismatch(q, "TYPE_B", "corrected", "視運動與太陽東升西落一致。");
    },
    2: (q) => {
      q.answer_index = 3;
      q.blind_eval_mismatch.correct_answer = 3;
      resolveMismatch(q, "TYPE_B", "corrected", "北極星位置近乎固定。");
    },
    3: (q) => {
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "勺口天樞天璇連線延長找北極星（第一、二星）。");
    },
    4: (q) => {
      q.answer_index = 2;
      q.blind_eval_mismatch.correct_answer = 2;
      resolveMismatch(q, "TYPE_B", "corrected", "地球自轉使星座向西移動且仰角變化。");
    },
    5: (q) => {
      q.answer_index = 3;
      q.blind_eval_mismatch.correct_answer = 3;
      resolveMismatch(q, "TYPE_B", "corrected", "星座盤朝北時北方標示朝向地面（下方）對齊地平。");
    },
    6: (q) => {
      q.answer_index = 3;
      q.blind_eval_mismatch.correct_answer = 3;
      resolveMismatch(q, "TYPE_B", "corrected", "斗柄方位與季節＝地球公轉所致星空變化。");
    },
    7: (q) => {
      q.answer_index = 3;
      q.blind_eval_mismatch.correct_answer = 3;
      resolveMismatch(q, "TYPE_B", "corrected", "北極星高度角約等於觀測地緯度。");
    },
    8: (q) => {
      q.answer_index = 2;
      q.blind_eval_mismatch.correct_answer = 2;
      resolveMismatch(q, "TYPE_B", "corrected", "W 型星座為仙后座。");
    },
    9: (q) => {
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "低光害環境觀星。");
    },
    11: (q) => {
      q.question = "請評估下列說法是否合理：「用力拉彈簧，彈簧變長是力產生的形變效果。」";
      q.options = ["正確", "錯誤"];
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "原缺選項，改是非題。");
    },
    12: (q) => {
      q.question = "請依四年級自然課所學仔細判斷：測量物體重量時，下列哪一種工具最適合？";
      q.options = ["電子秤或磅秤", "溫度計", "量筒", "碼表"];
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "原填空無選項，改四選一。");
    },
    14: (q) => {
      q.question = "請評估下列說法是否合理：「夜晚看見的星星，也會像太陽一樣東升西落。」";
      q.options = ["正確", "錯誤"];
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "原缺選項，改是非題。");
    },
  },
  "NanYi/G4_S2_SCI_NANYI_L2.json": {
    5: (q) => {
      q.answer_index = 2;
      q.blind_eval_mismatch.correct_answer = 2;
      resolveMismatch(q, "TYPE_B", "corrected", "魚類以鰓交換氣體。");
    },
    7: (q) => {
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "優養化致缺氧。");
    },
    10: (q) => {
      q.question = q.question.replace("电池", "電池");
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "通路需接正負極；修正簡體字。");
    },
    11: (q) => {
      q.question = "請評估下列說法是否合理：「電池並聯時，雖然亮度不會增加，但可以讓燈泡持續發亮的時間變長。」";
      q.options = ["正確", "錯誤"];
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "改是非題。");
    },
    12: (q) => {
      q.question =
        "請依四年級自然課所學仔細判斷：能讓電流通過的物質稱為導體，不能讓電流通過的稱為什麼？";
      q.options = ["絕緣體", "導體", "半導體", "電解質"];
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "原填空無選項。");
    },
    13: (q) => {
      q.answer_index = 3;
      q.blind_eval_mismatch.correct_answer = 3;
      resolveMismatch(q, "TYPE_B", "corrected", "開關控制通路／斷路。");
    },
    14: (q) => {
      q.answer_index = 3;
      q.blind_eval_mismatch.correct_answer = 3;
      resolveMismatch(q, "TYPE_B", "corrected", "水濕導電易觸電。");
    },
    15: (q) => {
      q.answer_index = 3;
      q.blind_eval_mismatch.correct_answer = 3;
      resolveMismatch(q, "TYPE_B", "corrected", "虹吸需管內充滿水。");
    },
    16: (q) => {
      q.question = "請評估下列說法是否合理：「毛細現象讓衣服上的汗水能迅速擴散。」";
      q.options = ["正確", "錯誤"];
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "改是非題。");
    },
    17: (q) => {
      q.question = "請依四年級自然課所學仔細判斷：茶杯中的水靜止時，水面會呈現什麼狀態？";
      q.options = ["保持水平", "保持傾斜", "垂直上升", "呈現波浪狀"];
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "靜止液面水平。");
    },
    18: (q) => {
      q.answer_index = 2;
      q.blind_eval_mismatch.correct_answer = 2;
      resolveMismatch(q, "TYPE_B", "corrected", "連通管原理：飲水機水位計。");
    },
    19: (q) => {
      q.question = "請評估下列說法是否合理：「只有吸管能產生虹吸現象，粗水管不行。」";
      q.options = ["正確", "錯誤"];
      q.answer_index = 1;
      q.blind_eval_mismatch.correct_answer = 1;
      resolveMismatch(q, "TYPE_B", "corrected", "粗管亦可虹吸（需滿水密封）。");
    },
  },
  "NanYi/G4_S2_SCI_NANYI_L3.json": {
    0: (q) => {
      q.answer_index = 3;
      q.blind_eval_mismatch.correct_answer = 3;
      resolveMismatch(q, "TYPE_B", "corrected", "層理→沉積岩。");
    },
    1: (q) => {
      q.answer_index = 3;
      q.blind_eval_mismatch.correct_answer = 3;
      resolveMismatch(q, "TYPE_B", "corrected", "岩石由礦物組成。");
    },
    2: (q) => {
      q.answer_index = 3;
      q.blind_eval_mismatch.correct_answer = 3;
      resolveMismatch(q, "TYPE_B", "corrected", "花崗岩硬度高。");
    },
    3: (q) => {
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "土壤來自岩石風化。");
    },
    4: (q) => {
      q.answer_index = 3;
      q.blind_eval_mismatch.correct_answer = 3;
      resolveMismatch(q, "TYPE_B", "corrected", "上游坡度陡侵蝕強。");
    },
    5: (q) => {
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "下游堆積細砂淤泥。");
    },
    6: (q) => {
      q.answer_index = 3;
      q.blind_eval_mismatch.correct_answer = 3;
      resolveMismatch(q, "TYPE_B", "corrected", "彎道內側慢流堆積。");
    },
    7: (q) => {
      q.answer_index = 2;
      q.blind_eval_mismatch.correct_answer = 2;
      resolveMismatch(q, "TYPE_B", "corrected", "山坡濫墾易土石流。");
    },
    8: (q) => {
      q.answer_index = 1;
      q.blind_eval_mismatch.correct_answer = 1;
      resolveMismatch(q, "TYPE_B", "corrected", "土壤含岩屑、空氣、水、腐殖質。");
    },
    9: (q) => {
      q.answer_index = 2;
      q.blind_eval_mismatch.correct_answer = 2;
      resolveMismatch(q, "TYPE_B", "corrected", "礫石圓潤因搬運磨損。");
    },
    11: (q) => {
      q.question = "請評估下列說法是否合理：「毛毛蟲（幼蟲）與蝴蝶（成蟲）長得完全不一樣，這是變態發育。」";
      q.options = ["正確", "錯誤"];
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "改是非題。");
    },
    12: (q) => {
      q.question = "請依四年級自然課所學仔細判斷：昆蟲的成蟲通常有幾對翅膀、幾對腳？";
      q.options = ["兩對翅膀、三對腳", "一對翅膀、四對腳", "沒有翅膀、六對腳", "三對翅膀、兩對腳"];
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "原填空無選項。");
    },
    14: (q) => {
      q.question = "請評估下列說法是否合理：「蜘蛛有八隻腳，所以也屬於昆蟲類。」";
      q.options = ["正確", "錯誤"];
      q.answer_index = 1;
      q.blind_eval_mismatch.correct_answer = 1;
      resolveMismatch(q, "TYPE_B", "corrected", "蜘蛛非昆蟲；改是非題。");
    },
  },
  "NanYi/G4_S2_SCI_NANYI_L4.json": {
    0: (q) => {
      q.answer_index = 1;
      q.blind_eval_mismatch.correct_answer = 1;
      resolveMismatch(q, "TYPE_B", "corrected", "再生能源：太陽能。");
    },
    1: (q) => {
      q.question = "請評估下列說法是否合理：「多使用節能家電可以減少二氧化碳排放。」";
      q.options = ["正確", "錯誤"];
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "改是非題。");
    },
    2: (q) => {
      q.question =
        "請依四年級自然課所學仔細判斷：將相同燈泡接在同一電路中，電池改為並聯後，燈泡亮度會如何？";
      q.options = ["與原本相同（不變）", "變得更亮", "變得更暗", "無法判斷"];
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "並聯電壓不變亮度不變。");
    },
    3: (q) => {
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "廢電池回收。");
    },
    4: (q) => {
      q.question = "請評估下列說法是否合理：「地球資源是無限的，可以隨意揮霍。」";
      q.options = ["正確", "錯誤"];
      q.answer_index = 1;
      q.blind_eval_mismatch.correct_answer = 1;
      resolveMismatch(q, "TYPE_B", "corrected", "改是非題。");
    },
    5: (q) => {
      q.answer_index = 3;
      q.blind_eval_mismatch.correct_answer = 3;
      resolveMismatch(q, "TYPE_B", "corrected", "蒸氣機後火車。");
    },
    6: (q) => {
      q.answer_index = 2;
      q.blind_eval_mismatch.correct_answer = 2;
      resolveMismatch(q, "TYPE_B", "corrected", "汽機車與飛機多賴化石燃料。");
    },
    7: (q) => {
      q.answer_index = 0;
      q.blind_eval_mismatch.correct_answer = 0;
      resolveMismatch(q, "TYPE_B", "corrected", "再生能源定義。");
    },
    8: (q) => {
      q.answer_index = 2;
      q.blind_eval_mismatch.correct_answer = 2;
      resolveMismatch(q, "TYPE_B", "corrected", "室內燈光能量不足。");
    },
    9: (q) => {
      q.answer_index = 2;
      q.blind_eval_mismatch.correct_answer = 2;
      resolveMismatch(q, "TYPE_B", "corrected", "潤滑油減摩。");
    },
    10: (q) => {
      q.answer_index = 2;
      q.blind_eval_mismatch.correct_answer = 2;
      resolveMismatch(q, "TYPE_B", "corrected", "大眾運輸減碳。");
    },
    11: (q) => {
      q.answer_index = 1;
      q.blind_eval_mismatch.correct_answer = 1;
      resolveMismatch(q, "TYPE_B", "corrected", "流線型減空阻。");
    },
    12: (q) => {
      q.answer_index = 1;
      q.blind_eval_mismatch.correct_answer = 1;
      resolveMismatch(q, "TYPE_B", "corrected", "帆船用風能。");
    },
    13: (q) => {
      q.answer_index = 2;
      q.blind_eval_mismatch.correct_answer = 2;
      resolveMismatch(q, "TYPE_B", "corrected", "燃燒轉動能與熱與廢氣。");
    },
    14: (q) => {
      q.answer_index = 1;
      q.blind_eval_mismatch.correct_answer = 1;
      resolveMismatch(q, "TYPE_B", "corrected", "自駕電動化減事故與碳排。");
    },
  },
};

function applyPatches() {
  for (const [rel, idxMap] of Object.entries(patches)) {
    const fp = path.join(BASE, ...rel.split("/"));
    const j = JSON.parse(fs.readFileSync(fp, "utf8"));
    const qs = j.questions || [];
    for (const [si, fn] of Object.entries(idxMap)) {
      const i = Number(si);
      if (!qs[i] || !qs[i].blind_eval_mismatch) {
        console.error("Missing mismatch at", rel, i);
        process.exit(1);
      }
      fn(qs[i]);
    }
    fs.writeFileSync(fp, JSON.stringify(j, null, 2) + "\n", "utf8");
    console.log("patched", rel);
  }
}

function setPublishableAll() {
  for (const pub of ["KangHsuan", "HanLin", "NanYi"]) {
    const prefix =
      pub === "KangHsuan"
        ? "G4_S2_SCI_KANGHSUAN"
        : pub === "HanLin"
          ? "G4_S2_SCI_HANLIN"
          : "G4_S2_SCI_NANYI";
    for (let L = 1; L <= 4; L++) {
      const fp = path.join(BASE, pub, `${prefix}_L${L}.json`);
      const j = JSON.parse(fs.readFileSync(fp, "utf8"));
      for (const q of j.questions || []) {
        // 盲測 ai_selected=-1（無法作答）→ 嚴格不可上版
        if (q.blind_eval_mismatch && Number(q.blind_eval_mismatch.ai_selected) === -1) {
          q.is_publishable = false;
          continue;
        }
        const badAns =
          q.answer_index === null ||
          q.answer_index === undefined ||
          q.answer_index < 0 ||
          !Array.isArray(q.options) ||
          q.options.length === 0;
        // 使用者規則：answer_index 無效（含 -1）→ 不可上版
        if (badAns) {
          q.is_publishable = false;
          continue;
        }
        if (!q.blind_evaluation) {
          q.is_publishable = false;
          continue;
        }
        if (q.blind_eval_mismatch) {
          const rs = q.review_status;
          if (rs === "confirmed" || rs === "corrected") {
            q.is_publishable = true;
          } else {
            q.is_publishable = false;
          }
        } else {
          q.is_publishable = true;
          if (q.review_status === "pending_review") {
            q.review_status = "confirmed";
            q.reviewer = "JOB-169";
            q.review_date = today;
            q.review_notes =
              pub === "NanYi"
                ? "南一 G4S2 自然重產後盲測（--force）全 Match；JOB-169 結案。"
                : "JOB-169：盲測 Match，確認可上版";
          }
        }
      }
      fs.writeFileSync(fp, JSON.stringify(j, null, 2) + "\n", "utf8");
    }
  }
}

function fixOrphanAnswerIndex() {
  /** 盲測標記完成但漏標 answer_index（無 blind_eval_mismatch） */
  const orphans = [
    ["NanYi/G4_S2_SCI_NANYI_L2.json", [
      [0, 3],
      [1, 0],
      [2, 3],
      [3, 0],
      [4, 1],
      [6, 3],
      [8, 2],
      [9, 1],
    ]],
    ["NanYi/G4_S2_SCI_NANYI_L1.json", [[10, 1], [13, 2]]],
    ["NanYi/G4_S2_SCI_NANYI_L3.json", [[10, 1], [13, 1]]],
  ];
  for (const [rel, pairs] of orphans) {
    const fp = path.join(BASE, ...rel.split("/"));
    const j = JSON.parse(fs.readFileSync(fp, "utf8"));
    const qs = j.questions || [];
    for (const [idx, ans] of pairs) {
      const q = qs[idx];
      if (!q) continue;
      q.answer_index = ans;
      q.review_status = "corrected";
      q.review_notes = "JOB-169：補標準答案索引（盲測後漏標）";
      q.reviewer = "JOB-169";
      q.review_date = today;
    }
    fs.writeFileSync(fp, JSON.stringify(j, null, 2) + "\n", "utf8");
    console.log("orphan answers", rel);
  }
}

const skipPatch = process.env.J169_SKIP_PATCH === "1";
const skipOrphan = process.env.J169_SKIP_ORPHAN === "1";
if (!skipPatch) applyPatches();
if (!skipOrphan) fixOrphanAnswerIndex();
setPublishableAll();
console.log("JOB-169 phase3 apply done.");
