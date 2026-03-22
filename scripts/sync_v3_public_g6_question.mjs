/**
 * 將 repo 根目錄 question/platform/G6 同步至 apps/v3_eidos/public/question/platform/G6，
 * 確保 Vite 建置與 Cloudflare Pages 部署含六年級靜態題庫（避免 manifest 404）。
 * 由 apps/v3_eidos 的 npm prebuild 呼叫。
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, '..');
const src = path.join(root, 'question', 'platform', 'G6');
const dest = path.join(root, 'apps', 'v3_eidos', 'public', 'question', 'platform', 'G6');

if (!fs.existsSync(src)) {
  console.warn('[sync_v3_public_g6_question] 略過：找不到', src);
  process.exit(0);
}
fs.mkdirSync(path.dirname(dest), { recursive: true });
fs.cpSync(src, dest, { recursive: true });
console.log('[sync_v3_public_g6_question] 已同步 G6 →', dest);
