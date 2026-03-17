/**
 * 移除選項內容中可能重複的編號前綴（如 "A. ", "1. ", "A " 等）。
 * 這是為了解決部分國語科題庫資料格式不一導致 UI 顯示重複 ABCD 的問題。
 */
export function stripOptionPrefix(optionText: string): string {
    if (!optionText) return '';
    // 匹配開頭的 A. B. C. D. 或 A: B: 等，以及 A [內容] 的情況
    // 支援全形與半形
    const prefixRegex = /^[A-D][.\s:：．、]+|^[1-4][.\s:：．、]+/i;
    return optionText.replace(prefixRegex, '').trim();
}
