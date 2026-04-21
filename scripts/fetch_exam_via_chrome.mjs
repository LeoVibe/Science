/**
 * 考古題 PDF 下載腳本 — 透過用戶已開啟的 Chrome 瀏覽器 session
 *
 * 原理：用戶的 Chrome 已通過 Cloudflare 驗證。本腳本：
 * 1. 連接到用戶已開啟的 Chrome（需先啟用 remote debugging）
 * 2. 在已通過驗證的 session 中用 fetch 下載 PDF
 * 3. 透過 Base64 傳回 Node.js 存檔
 *
 * 前置步驟（只需一次）：
 *   1. 關閉 Chrome
 *   2. 用以下指令啟動 Chrome（開啟 remote debugging port）：
 *      /Applications/Google\ Chrome.app/Contents/MacOS/Google\ Chrome --remote-debugging-port=9222
 *   3. 在 Chrome 中手動訪問 tcool.cc 一次（通過 Cloudflare）
 *   4. 執行本腳本
 *
 * 用法：
 *   node scripts/fetch_exam_via_chrome.mjs --grade 4 --subject 社會 --semester 2
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_DIR = path.resolve(__dirname, '../knowledge/3_考古題');
const TCOOL_URL = 'https://www.tcool.cc/';
const DELAY_BETWEEN_PDF = 20000;

const GRADE_SEMESTER_MAP = {
  '3/1': '三上', '3/2': '三下', '4/1': '四上', '4/2': '四下',
  '5/1': '五上', '5/2': '五下', '6/1': '六上', '6/2': '六下'
};
const SEMESTER_MAP = { '1': '上', '2': '下' };

const args = process.argv.slice(2);
const getArg = (flag) => {
  const i = args.indexOf(flag);
  return i >= 0 && args[i + 1] ? args[i + 1].split(',') : null;
};
const grades = getArg('--grade') || ['4'];
const subjects = getArg('--subject') || ['社會'];
const semesters = getArg('--semester') || ['2'];

console.log(`\n📚 考古題 PDF 下載（透過 Chrome session）`);
console.log(`   年級: ${grades.join(', ')}`);
console.log(`   科目: ${subjects.join(', ')}`);
console.log(`   學期: ${semesters.map(s => SEMESTER_MAP[s] + '學期').join(', ')}`);

(async () => {
  // 嘗試連接已開啟的 Chrome
  let browser;
  try {
    browser = await puppeteer.connect({ browserURL: 'http://127.0.0.1:9222' });
    console.log('✅ 已連接到 Chrome\n');
  } catch (e) {
    console.error(`\n❌ 無法連接到 Chrome remote debugging port 9222`);
    console.error(`\n請執行以下步驟：`);
    console.error(`  1. 完全關閉 Chrome`);
    console.error(`  2. 執行：/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --remote-debugging-port=9222`);
    console.error(`  3. 在開啟的 Chrome 中訪問 tcool.cc（通過 Cloudflare 驗證）`);
    console.error(`  4. 重新執行本腳本`);
    process.exit(1);
  }

  // 開新分頁
  const page = await browser.newPage();
  await page.goto(TCOOL_URL, { waitUntil: 'networkidle2', timeout: 30000 });

  let totalOk = 0, totalFail = 0;

  for (const grade of grades) {
    for (const subject of subjects) {
      for (const semester of semesters) {
        const semLabel = GRADE_SEMESTER_MAP[`${grade}/${semester}`];
        const groupLabel = `G${grade} ${subject} ${SEMESTER_MAP[semester]}學期`;
        console.log(`\n🔍 搜尋: ${groupLabel}`);

        // 搜尋取得 PDF 連結
        const exams = await page.evaluate(async (g, s, sem) => {
          const fd = new FormData();
          fd.append('grade', g); fd.append('subject', s);
          fd.append('semester', sem); fd.append('period', '');
          fd.append('publisher', ''); fd.append('city', '');
          fd.append('has_answer', ''); fd.append('p', '1');
          const r = await fetch('/', { method: 'POST', body: fd, credentials: 'include' });
          const html = await r.text();
          const d = new DOMParser().parseFromString(html, 'text/html');
          const qLinks = [...d.querySelectorAll('a[href*="/d/q/"]')];
          const aLinks = [...d.querySelectorAll('a[href*="/d/a/"]')];
          return qLinks.map((a, i) => {
            let p = a.parentElement, desc = '';
            for (let j = 0; j < 6; j++) {
              if (!p) break;
              if (p.textContent.includes('年級')) {
                desc = p.textContent.replace(/\s+/g, ' ').trim();
                break;
              }
              p = p.parentElement;
            }
            const pub = (desc.match(/(康軒|翰林|南一)/)||[])[1] || '未知';
            const per = (desc.match(/(期中|期末)\d?/)||[])[0] || '未知';
            const yr = (desc.match(/(\d+)(上|下)/)||[])[1] || '113';
            return { qUrl: a.href, aUrl: aLinks[i]?.href||'', publisher: pub, period: per, year: yr };
          });
        }, grade, subject, semester);

        console.log(`   找到 ${exams.length} 份`);
        const outDir = path.join(BASE_DIR, semLabel, subject);
        fs.mkdirSync(outDir, { recursive: true });

        for (let i = 0; i < exams.length; i++) {
          const ex = exams[i];
          const fn = `${semLabel}_${subject}_${ex.period}_${ex.publisher}_${ex.year}_${i + 1}`;
          console.log(`   ⬇️  [${i + 1}/${exams.length}] ${fn}`);

          try {
            // 用 page.evaluate + fetch 下載 PDF（在已認證的 session 中）
            const b64 = await page.evaluate(async (url) => {
              const r = await fetch(url, { credentials: 'include' });
              if (!r.ok) throw new Error('HTTP ' + r.status);
              const ct = r.headers.get('content-type') || '';
              if (!ct.includes('pdf')) throw new Error('Not PDF: ' + ct);
              const buf = await r.arrayBuffer();
              const bytes = new Uint8Array(buf);
              let binary = '';
              for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
              return btoa(binary);
            }, ex.qUrl);

            const buffer = Buffer.from(b64, 'base64');
            fs.writeFileSync(path.join(outDir, fn + '_題目.pdf'), buffer);
            console.log(`      ✅ ${(buffer.length / 1024).toFixed(0)} KB`);
            totalOk++;

            // 答案卷
            if (ex.aUrl) {
              try {
                const ab64 = await page.evaluate(async (url) => {
                  const r = await fetch(url, { credentials: 'include' });
                  if (!r.ok) return null;
                  const buf = await r.arrayBuffer();
                  const bytes = new Uint8Array(buf);
                  let binary = '';
                  for (let i = 0; i < bytes.length; i++) binary += String.fromCharCode(bytes[i]);
                  return btoa(binary);
                }, ex.aUrl);
                if (ab64) {
                  fs.writeFileSync(path.join(outDir, fn + '_答案.pdf'), Buffer.from(ab64, 'base64'));
                  console.log(`      ✅ 答案卷已存`);
                }
              } catch (e) { /* skip */ }
            }
          } catch (e) {
            console.log(`      ❌ ${e.message}`);
            totalFail++;
          }

          if (i < exams.length - 1) {
            process.stdout.write(`      ⏳ ${DELAY_BETWEEN_PDF / 1000}s...`);
            await new Promise(r => setTimeout(r, DELAY_BETWEEN_PDF));
            console.log(' ok');
          }
        }
      }
    }
  }

  await page.close();
  // 不關閉 browser（因為是連接的，不是啟動的）

  console.log(`\n${'='.repeat(40)}`);
  console.log(`📊 完成！成功 ${totalOk} / 失敗 ${totalFail}`);
  console.log(`   存放: ${BASE_DIR}/`);
})();
