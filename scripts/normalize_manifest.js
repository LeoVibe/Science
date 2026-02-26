const fs = require('fs');
const path = require('path');

function processManifest(filePath) {
    try {
        const contentStr = fs.readFileSync(filePath, 'utf8');
        const data = JSON.parse(contentStr);

        let modified = false;

        // 正規化陣列名稱: 將 units 或 files 統一為 items
        if (!data.items) {
            if (data.units && Array.isArray(data.units)) {
                data.items = data.units;
                delete data.units;
                modified = true;
            } else if (data.files && Array.isArray(data.files)) {
                // 有些舊版可能只是一個純字串陣列
                if (typeof data.files[0] === 'string') {
                    data.items = data.files.map((f, i) => ({
                        id: `U${i + 1}`,
                        title: `單元 ${i + 1}`,
                        file: f
                    }));
                } else {
                    data.items = data.files;
                }
                delete data.files;
                modified = true;
            }
        }

        // 正規化內部欄位名稱: 將 name, path 統一為 title, file
        if (data.items && Array.isArray(data.items)) {
            data.items.forEach(item => {
                if (item.name !== undefined) {
                    item.title = item.name;
                    delete item.name;
                    modified = true;
                }
                if (item.path !== undefined) {
                    item.file = item.path;
                    delete item.path;
                    modified = true;
                }
            });
        }

        if (modified) {
            fs.writeFileSync(filePath, JSON.stringify(data, null, 2), 'utf8');
            console.log(`✅ Normalized: ${filePath}`);
        }

    } catch (err) {
        console.error(`❌ Error processManifest ${filePath}:`, err.message);
    }
}

function scanDir(dir) {
    if (!fs.existsSync(dir)) return;
    const files = fs.readdirSync(dir);
    for (const file of files) {
        const fullPath = path.join(dir, file);
        const stat = fs.statSync(fullPath);
        if (stat.isDirectory()) {
            scanDir(fullPath);
        } else if (file === 'manifest.json') {
            processManifest(fullPath);
        }
    }
}

const targetDirs = process.argv.slice(2);
if (targetDirs.length === 0) {
    console.log("未指定路徑，將預設掃描整個 question/platform ...");
    scanDir(path.join(__dirname, '..', 'question', 'platform'));
} else {
    targetDirs.forEach(dir => {
        const absDir = path.resolve(dir);
        if (fs.existsSync(absDir)) {
            console.log(`Scanning: ${absDir}`);
            scanDir(absDir);
        } else {
            console.log(`Not found: ${absDir}`);
        }
    });
}

console.log('Manifest Normalization complete.');
