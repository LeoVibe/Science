/**
 * 考古題 PDF 批量下載腳本
 *
 * 用法：
 *   node scripts/fetch_exam_pdfs.mjs --grade 4 --subject 社會 --semester 2
 *   node scripts/fetch_exam_pdfs.mjs --grade 3,4,5,6 --subject 國語,數學,社會,自然 --semester 1,2
 *   node scripts/fetch_exam_pdfs.mjs --all   # 抓 G3-G6 全科目
 *
 * 輸出：knowledge/考古題原檔/{學期}/{科目}/{出版社 or 學校}/
 *
 * 依賴：puppeteer（npm install puppeteer）
 */

import puppeteer from 'puppeteer';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const BASE_DIR = path.resolve(__dirname, '../knowledge/考古題原檔');
const TCOOL_URL = 'https://www.tcool.cc/';
const DELAY_BETWEEN_PDF = 15000; // 15 秒間隔，避免被擋
const DELAY_BETWEEN_SEARCH = 3000;

const SEMESTER_MAP = { '1': '上', '2': '下' };
const GRADE_SEMESTER_MAP = {
  '3/1': '三上', '3/2': '三下', '4/1': '四上', '4/2': '四下',
  '5/1': '五上', '5/2': '五下', '6/1': '六上', '6/2': '六下'
};

// === 參數解析 ===
const args = process.argv.slice(2);
let grades, subjects, semesters;

if (args.includes('--all')) {
  grades = ['3', '4', '5', '6'];
  subjects = ['國語', '數學', '社會', '自然'];
  semesters = ['1', '2'];
} else {
  const getArg = (flag) => {
    const i = args.indexOf(flag);
    return i >= 0 && args[i + 1] ? args[i + 1].split(',') : null;
  };
  grades = getArg('--grade') || ['4'];
  subjects = getArg('--subject') || ['社會'];
  semesters = getArg('--semester') || ['2'];
}

const dryRun = args.includes('--dry-run');

console.log(`\n📚 考古題 PDF 批量下載`);
console.log(`   年級: ${grades.join(', ')}`);
console.log(`   科目: ${subjects.join(', ')}`);
console.log(`   學期: ${semesters.map(s => SEMESTER_MAP[s] + '學期').join(', ')}`);
console.log(`   間隔: ${DELAY_BETWEEN_PDF / 1000} 秒/份`);
if (dryRun) console.log(`   🔍 DRY RUN: 只列出 PDF 連結，不下載`);
console.log('');

// === 主程式 ===
(async () => {
  const browser = await puppeteer.launch({
    headless: false, // 必須用真實視窗，headless 會被 Cloudflare 擋
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-blink-features=AutomationControlled', // 隱藏自動化特徵
      '--window-size=1280,800'
    ]
  });

  const page = await browser.newPage();

  // 反偵測：移除 navigator.webdriver 標記
  await page.evaluateOnNewDocument(() => {
    Object.defineProperty(navigator, 'webdriver', { get: () => false });
    // 模擬正常 Chrome 的 plugins 和 languages
    Object.defineProperty(navigator, 'plugins', { get: () => [1, 2, 3, 4, 5] });
    Object.defineProperty(navigator, 'languages', { get: () => ['zh-TW', 'zh', 'en-US', 'en'] });
  });

  await page.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');
  await page.setViewport({ width: 1280, height: 800 });

  // 先訪問首頁建立 session（需通過 Cloudflare challenge）
  console.log('🌐 建立 session（等待 Cloudflare 驗證，可能需要 5-10 秒）...');
  await page.goto(TCOOL_URL, { waitUntil: 'networkidle2', timeout: 60000 });

  // 等待 Cloudflare challenge 完成
  try {
    await page.waitForSelector('form', { timeout: 30000 });
  } catch {
    console.log('   ⏳ 等待 Cloudflare 驗證...');
    await new Promise(r => setTimeout(r, 10000));
    await page.waitForSelector('form', { timeout: 30000 });
  }
  console.log('✅ Session 建立完成\n');

  // 設定下載路徑
  const client = await page.createCDPSession();
  await client.send('Page.setDownloadBehavior', {
    behavior: 'allow',
    downloadPath: BASE_DIR
  });

  let totalDownloaded = 0;
  let totalFailed = 0;
  const summary = [];

  for (const grade of grades) {
    for (const subject of subjects) {
      for (const semester of semesters) {
        const semLabel = GRADE_SEMESTER_MAP[`${grade}/${semester}`] || `G${grade}S${semester}`;
        const groupLabel = `G${grade} ${subject} ${SEMESTER_MAP[semester]}學期`;
        console.log(`\n🔍 搜尋: ${groupLabel}`);

        // POST 搜尋
        const searchResults = await page.evaluate(async (g, s, sem) => {
          const fd = new FormData();
          fd.append('grade', g); fd.append('subject', s);
          fd.append('semester', sem); fd.append('period', '');
          fd.append('publisher', ''); fd.append('city', '');
          fd.append('has_answer', ''); fd.append('p', '1');

          const r = await fetch('/', { method: 'POST', body: fd, credentials: 'include' });
          const html = await r.text();
          const d = new DOMParser().parseFromString(html, 'text/html');

          // 取得 PDF 題目卷連結 + 描述
          const pdfAnchors = [...d.querySelectorAll('a[href*="/d/q/"]')];
          const ansAnchors = [...d.querySelectorAll('a[href*="/d/a/"]')];

          return pdfAnchors.map((a, i) => {
            let parent = a.parentElement;
            let desc = '';
            for (let j = 0; j < 6; j++) {
              if (!parent) break;
              const t = parent.textContent;
              if (t.includes('年級')) {
                desc = t.replace(/\s+/g, ' ').trim();
                // 提取出版社
                const pubMatch = desc.match(/(康軒|翰林|南一)/);
                const periodMatch = desc.match(/(期中|期末)\d?/);
                const semMatch = desc.match(/(\d+)(上|下)/);
                return {
                  url: a.href,
                  ansUrl: ansAnchors[i]?.href || '',
                  publisher: pubMatch?.[1] || '未知',
                  period: periodMatch?.[0] || '未知',
                  schoolYear: semMatch?.[1] || '113'
                };
              }
              parent = parent.parentElement;
            }
            return { url: a.href, ansUrl: ansAnchors[i]?.href || '', publisher: '未知', period: '未知', schoolYear: '113' };
          });
        }, grade, subject, semester);

        console.log(`   找到 ${searchResults.length} 份 PDF`);

        if (searchResults.length === 0) continue;

        // 建立目錄
        const outDir = path.join(BASE_DIR, semLabel, subject);
        if (!dryRun) fs.mkdirSync(outDir, { recursive: true });

        for (let i = 0; i < searchResults.length; i++) {
          const exam = searchResults[i];
          const filename = `${semLabel}_${subject}_${exam.period}_${exam.publisher}_${exam.schoolYear}_${i + 1}`;
          const pdfPath = path.join(outDir, filename + '_題目.pdf');
          const ansPath = path.join(outDir, filename + '_答案.pdf');

          if (dryRun) {
            console.log(`   📄 [DRY] ${filename}: ${exam.url}`);
            summary.push({ group: groupLabel, filename, url: exam.url, publisher: exam.publisher });
            continue;
          }

          // 下載題目卷：用新分頁導航到 PDF URL
          try {
            console.log(`   ⬇️  [${i + 1}/${searchResults.length}] ${filename}...`);

            const dlPage = await browser.newPage();
            await dlPage.evaluateOnNewDocument(() => {
              Object.defineProperty(navigator, 'webdriver', { get: () => false });
            });
            await dlPage.setUserAgent('Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36');

            const response = await dlPage.goto(exam.url, { waitUntil: 'networkidle2', timeout: 30000 });

            if (response && response.ok()) {
              const buffer = await response.buffer();
              fs.writeFileSync(pdfPath, buffer);
              console.log(`      ✅ 題目卷: ${(buffer.length / 1024).toFixed(0)} KB`);
              totalDownloaded++;

              // 下載答案卷
              if (exam.ansUrl) {
                try {
                  const ansResponse = await dlPage.goto(exam.ansUrl, { waitUntil: 'networkidle2', timeout: 30000 });
                  if (ansResponse && ansResponse.ok()) {
                    const ansBuf = await ansResponse.buffer();
                    fs.writeFileSync(ansPath, ansBuf);
                    console.log(`      ✅ 答案卷: ${(ansBuf.length / 1024).toFixed(0)} KB`);
                  }
                } catch (e) {
                  console.log(`      ⚠️  答案卷失敗: ${e.message}`);
                }
              }

              summary.push({ group: groupLabel, filename, size: buffer.length, publisher: exam.publisher, status: 'ok' });
            } else {
              const status = response ? response.status() : 'no response';
              throw new Error('HTTP ' + status);
            }

            await dlPage.close();
          } catch (e) {
            console.log(`      ❌ 失敗: ${e.message}`);
            totalFailed++;
            summary.push({ group: groupLabel, filename, error: e.message, publisher: exam.publisher, status: 'fail' });
          }

          // 間隔等待
          if (i < searchResults.length - 1) {
            process.stdout.write(`      ⏳ 等待 ${DELAY_BETWEEN_PDF / 1000} 秒...`);
            await new Promise(r => setTimeout(r, DELAY_BETWEEN_PDF));
            process.stdout.write(' ok\n');
          }
        }

        // 搜尋間隔
        await new Promise(r => setTimeout(r, DELAY_BETWEEN_SEARCH));
      }
    }
  }

  await browser.close();

  // 寫入下載報告
  console.log('\n' + '='.repeat(50));
  console.log(`📊 下載完成！`);
  console.log(`   成功: ${totalDownloaded} 份`);
  console.log(`   失敗: ${totalFailed} 份`);
  console.log(`   存放: ${BASE_DIR}/`);

  // 存報告 JSON
  const reportPath = path.join(BASE_DIR, 'download_report.json');
  fs.writeFileSync(reportPath, JSON.stringify({
    date: new Date().toISOString(),
    grades, subjects, semesters,
    totalDownloaded, totalFailed,
    details: summary
  }, null, 2));
  console.log(`   報告: ${reportPath}`);
})().catch(e => {
  console.error('❌ 致命錯誤:', e.message);
  process.exit(1);
});
