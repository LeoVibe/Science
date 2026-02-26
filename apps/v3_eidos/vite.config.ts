import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { componentTagger } from "lovable-tagger";

import fs from "fs";

// 讓 /history/ 路徑下的靜態子站不被 SPA fallback 攔截
function historySubsitePlugin(): Plugin {
  return {
    name: "history-subsite",
    // 回傳一個函式，它會在 Vite 內部的 middleware（包括 SPA fallback）之前執行
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url && req.url.startsWith("/history/") && !req.url.includes(".")) {
          // 如果請求的是目錄，自動加上 index.html
          const basePath = req.url.split('?')[0].replace(/\/$/, "");
          req.url = `${basePath}/index.html`;
        }
        next();
      });
    },
  };
}

// 提供本地開發用的題庫草稿狀態切換 API
function localCurationPlugin(): Plugin {
  return {
    name: "local-curation-api",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url === "/api/local/curation/toggle" && req.method === "PATCH") {
          let body = "";
          req.on("data", chunk => { body += chunk; });
          req.on("end", () => {
            try {
              const { filePath, questionId, isActive } = JSON.parse(body);
              // filePath 會是 /question/platform/...
              const absolutePath = path.join(__dirname, '../../', filePath.replace(/^\//, ''));
              if (fs.existsSync(absolutePath)) {
                const data = JSON.parse(fs.readFileSync(absolutePath, 'utf8'));
                let modified = false;
                if (Array.isArray(data.questions)) {
                  for (let q of data.questions) {
                    if (q.id === questionId) {
                      q.is_active = isActive;
                      modified = true;
                      break;
                    }
                  }
                } else if (data.question && data.id === questionId) {
                  data.is_active = isActive;
                  modified = true;
                }

                if (modified) {
                  fs.writeFileSync(absolutePath, JSON.stringify(data, null, 2), 'utf8');
                  res.setHeader("Content-Type", "application/json");
                  res.end(JSON.stringify({ ok: true }));
                  return;
                }
              }
              res.statusCode = 404;
              res.end(JSON.stringify({ error: "Question or file not found" }));
            } catch (err) {
              res.statusCode = 500;
              res.end(JSON.stringify({ error: String(err) }));
            }
          });
          return;
        }
        next();
      });
    }
  };
}

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  base: "/Science/",
  server: {
    host: "::",
    port: 8080,
    hmr: {
      overlay: false,
    },
  },
  plugins: [
    historySubsitePlugin(),
    react(),
    mode === "development" && componentTagger(),
  ].filter(Boolean),
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
}));
