import { defineConfig, loadEnv, type Plugin } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { componentTagger } from "lovable-tagger";

import fs from "fs";

// 讓 /history/ 路徑下的靜態子站不被 SPA fallback 攔截（支援 base 如 /Science/）
function historySubsitePlugin(basePath: string): Plugin {
  const base = basePath.endsWith("/") ? basePath : `${basePath}/`;
  return {
    name: "history-subsite",
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (!req.url) return next();
        const pathname = req.url.split("?")[0];
        const afterBase = base === "/" ? pathname : pathname.startsWith(base) ? pathname.slice(base.length) : "";
        const segment = afterBase.replace(/^\/+/, "");
        const isHistoryDir = segment && (segment.startsWith("history/") || segment === "history");
        if (isHistoryDir && !pathname.includes(".")) {
          const dirPath = pathname.replace(/\/$/, "") || pathname;
          req.url = `${dirPath}/index.html`;
        }
        next();
      });
    },
  };
}

// GitHub Pages 深連結：建置時複製 index.html 到 admin 路徑，避免直連 /Science/admin 回傳 404
function adminDeepLinkPlugin(): Plugin {
  return {
    name: "admin-deep-link",
    closeBundle() {
      const outDir = path.resolve(__dirname, "dist");
      const indexPath = path.join(outDir, "index.html");
      if (!fs.existsSync(indexPath)) return;
      const html = fs.readFileSync(indexPath, "utf8");
      const dirs = ["admin", "admin/login"];
      for (const d of dirs) {
        const dir = path.join(outDir, d);
        fs.mkdirSync(dir, { recursive: true });
        fs.writeFileSync(path.join(dir, "index.html"), html, "utf8");
      }
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
export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), "");
  const configuredBase = env.VITE_APP_BASE || "/";
  const normalizedBase = configuredBase.endsWith("/") ? configuredBase : `${configuredBase}/`;

  return {
    base: normalizedBase,
    server: {
      host: "::",
      port: 8080,
      hmr: {
        overlay: false,
      },
    },
    plugins: [
      historySubsitePlugin(normalizedBase),
      adminDeepLinkPlugin(),
      react(),
      mode === "development" && componentTagger(),
    ].filter(Boolean),
    resolve: {
      alias: {
        "@": path.resolve(__dirname, "./src"),
      },
    },
  };
});
