/**
 * Phase 2 驗證腳本
 * 在 DevTools Console 中執行，自動批量驗證 correctEls 顯示
 * 2026-04-19 Antigravity (Claude Sonnet 4.6 Thinking)
 */

// 此腳本在 Review 頁面的 DevTools Console 中使用
// 使用方式：進入對應課次後，執行此腳本

function verifyReviewPage(lessonOrder, questionIndex) {
  // 找所有課次按鈕並點擊
  const lessonBtns = [...document.querySelectorAll('button')].filter(b => {
    const text = b.textContent.trim();
    return text.includes('第') && text.includes('課') && text.includes(String(lessonOrder));
  });
  
  if (lessonBtns.length === 0) {
    return { error: `找不到第${lessonOrder}課按鈕` };
  }
  
  lessonBtns[0].click();
  
  return new Promise(resolve => {
    setTimeout(() => {
      // 找所有題目區塊
      const questions = document.querySelectorAll('[data-question-index], .question-block, [class*="question"]');
      
      // 找帶有 bg-correct-light class 的元素
      const correctEls = [...document.querySelectorAll('.bg-correct-light')];
      
      if (correctEls.length === 0) {
        resolve({ error: '找不到 bg-correct-light 元素', questionIndex });
        return;
      }
      
      // 取得所有正解文字
      const allCorrect = correctEls.map(el => el.textContent.trim().replace(/^[A-D]\.\s*/, ''));
      
      resolve({
        lessonOrder,
        questionIndex,
        allCorrectTexts: allCorrect,
        count: correctEls.length
      });
    }, 1000);
  });
}
