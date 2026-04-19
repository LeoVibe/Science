/**
 * JOB-192：依 jobs/JOB-192-explanations.json 寫入 explanation（僅更新清單內題目）
 */
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const root = path.resolve(__dirname, "..");
const mapPath = path.join(root, "jobs", "JOB-192-explanations.json");

const rows = JSON.parse(fs.readFileSync(mapPath, "utf8"));
const byFile = new Map();
for (const { file, q, explanation } of rows) {
  if (!byFile.has(file)) byFile.set(file, []);
  byFile.get(file).push({ q, explanation });
}

for (const [rel, items] of byFile) {
  const abs = path.join(root, rel);
  const j = JSON.parse(fs.readFileSync(abs, "utf8"));
  for (const { q, explanation } of items) {
    const idx = q - 1;
    if (!j.questions[idx]) throw new Error(`Missing question q=${q} in ${rel}`);
    j.questions[idx].explanation = explanation;
  }
  fs.writeFileSync(abs, JSON.stringify(j, null, 2) + "\n", "utf8");
}
console.log("Updated", byFile.size, "files,", rows.length, "questions.");
