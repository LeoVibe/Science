/**
 * repair_manifests.js
 * 
 * 掃描題庫目錄，根據其中的 JSON 檔案自動修復或生成 manifest.json。
 */

const fs = require('fs');
const path = require('path');

function repairManifest(dirPath) {
    if (!fs.existsSync(dirPath)) return;

    const manifestPath = path.join(dirPath, 'manifest.json');
    let manifest = {
        publisher: "",
        grade: "",
        semester: "",
        subject: "",
        items: []
    };

    if (fs.existsSync(manifestPath)) {
        try {
            manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
        } catch (e) {
            console.error(`Error parsing existing manifest at ${manifestPath}`);
        }
    }

    // 嘗試從路徑推斷中位元數據
    const parts = dirPath.split(path.sep);
    // 假設路徑格式為 .../G3/Chinese/S2/KangHsuan
    if (parts.length >= 4) {
        manifest.publisher = parts[parts.length - 1];
        manifest.semester = parts[parts.length - 2];
        manifest.subject = parts[parts.length - 3];
        manifest.grade = parts[parts.length - 4];
    }

    const files = fs.readdirSync(dirPath).filter(f => f.endsWith('.json') && f !== 'manifest.json');

    // 排序：L1, L2... L10, L11... U1, U2...
    files.sort((a, b) => {
        const getSortKey = (name) => {
            const match = name.match(/Chi_([LU])(\d+)/);
            if (!match) return [name, 0];
            return [match[1], parseInt(match[2])];
        };
        const [typeA, numA] = getSortKey(a);
        const [typeB, numB] = getSortKey(b);

        if (typeA !== typeB) return typeA === 'L' ? -1 : 1;
        return numA - numB;
    });

    const newItems = files.map(file => {
        const filePath = path.join(dirPath, file);
        const content = JSON.parse(fs.readFileSync(filePath, 'utf8'));
        const id = file.replace('Chi_', '').replace('.json', '');

        return {
            id: id,
            title: content.lesson_title || content.category || id,
            path: file
        };
    });

    manifest.items = newItems;

    fs.writeFileSync(manifestPath, JSON.stringify(manifest, null, 2));
    console.log(`✅ Repaired manifest at ${manifestPath} with ${newItems.length} items.`);
}

const targetDir = process.argv[2];
if (!targetDir) {
    console.error("Usage: node scripts/repair_manifests.js <directory_path>");
    process.exit(1);
}

repairManifest(path.resolve(targetDir));
