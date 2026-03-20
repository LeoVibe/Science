/**
 * 生成 UUID (v4) 的公用工具
 * 優先使用瀏覽器原生的 crypto.randomUUID()
 * 若環境不支援（如非 HTTPS 或舊版瀏覽器），則提供 Math.random() 回退機制
 */
export function generateUUID(): string {
  // 檢查是否處於瀏覽器環境且支援 crypto.randomUUID
  if (
    typeof window !== 'undefined' &&
    window.crypto &&
    typeof window.crypto.randomUUID === 'function'
  ) {
    return window.crypto.randomUUID();
  }

  // Fallback 實作：符合 UUID v4 規範的隨機字串
  // 格式: xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
    const r = (Math.random() * 16) | 0;
    const v = c === 'x' ? r : (r & 0x3) | 0x8;
    return v.toString(16);
  });
}
