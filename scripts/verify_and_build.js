const fs = require('fs');
const path = require('path');
const { evaluateFile } = require('./evaluate_question_quality');

const baseDir = path.join(process.cwd(), 'question', 'platform');
const publicDir = path.join(process.cwd(), 'apps', 'v3_eidos', 'public', 'data');
if (!fs.existsSync(publicDir)) {
    fs.mkdirSync(publicDir, { recursive: true });
}

function verifyAndBuild() {
    let globalStats = {
        totalFiles: 0,
        totalQuestions: 0,
        totalBlindTested: 0,
        qualityDist: { QL5: 0, QL4: 0, QL3: 0, QL2: 0, QL1: 0, BROKEN: 0 },
        publishers: {}
    };

    let errors = [];
    let warnings = [];

    function traverse(currentPath) {
        if (!fs.existsSync(currentPath)) return;
        
        const items = fs.readdirSync(currentPath);
        let hasJson = false;
        let subDirs = [];
        
        for (const item of items) {
            if (item === '.DS_Store') continue;
            const fullPath = path.join(currentPath, item);
            if (fs.statSync(fullPath).isDirectory()) {
                subDirs.push(fullPath);
            } else if (item.endsWith('.json')) {
                hasJson = true;
            }
        }
        
        if (hasJson && subDirs.length === 0) {
            processLeafDir(currentPath, items.filter(i => i.endsWith('.json') && i !== '.DS_Store'));
        } else {
            for (const d of subDirs) {
                traverse(d);
            }
        }
    }

    function processLeafDir(dirPath, files) {
        // Find existing manifest
        const oldManifests = files.filter(f => f.includes('manifest'));
        const qFiles = files.filter(f => !f.includes('manifest') && !f.includes('libraryStats'));
        
        // Remove old manifests
        oldManifests.forEach(f => {
            fs.unlinkSync(path.join(dirPath, f));
            // console.log(`🗑️ Removed old index: ${f}`);
        });
        
        if (qFiles.length === 0) return;

        // Path should be like: platform/G6/Chinese/S2/HanLin
        const parts = dirPath.split(path.sep);
        const pub = parts[parts.length - 1];
        const sem = parts[parts.length - 2];
        const subjOrig = parts[parts.length - 3];
        const grade = parts[parts.length - 4];
        
        if (!/^G[1-6]$/.test(grade)) return;
        
        const subMap = { 'Chinese':'CHI', 'Math':'MATH', 'Science':'SCI', 'SocialStudies':'SOC', 'English':'ENG', 'Nature':'SCI' };
        let subj = subMap[subjOrig] || subjOrig.toUpperCase();
        
        const pubMap = { 'HanLin': 'HANLIN', 'KangHsuan': 'KANGHSUAN', 'NanYi': 'NANYI', 'NanI': 'NANYI' };
        let pubUpper = pubMap[pub] || pub.toUpperCase();

        let dirItems = [];
        let moduleBlindTested = 0;
        let moduleCount = 0;
        
        for (const file of qFiles) {
            const filePath = path.join(dirPath, file);
            let evalResult = evaluateFile(filePath);
            
            if (evalResult.quality === 'BROKEN') {
                errors.push(`[Broken JSON] ${file}: ${evalResult.error}`);
                globalStats.qualityDist.BROKEN++;
                continue;
            }
            
            // Check meta requirements
            let meta = evalResult.meta || {};
            if (!meta.title || !meta.theme) {
                warnings.push(`[Missing Meta] ${file} lacks 'title' or 'theme'`);
            }

            // Check blind_evaluation status
            let fileData = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            let qs = fileData.questions || [];
            let fileBlindTested = 0;
            qs.forEach(q => {
                if (q.blind_evaluation === true) fileBlindTested++;
            });

            // Update stats
            globalStats.totalFiles++;
            globalStats.totalQuestions += evalResult.count;
            globalStats.totalBlindTested += fileBlindTested;
            
            let qlKey = evalResult.quality;
            if (qlKey && qlKey.includes('BIAS')) qlKey = 'QL1'; // group bias to QL1
            globalStats.qualityDist[qlKey] = (globalStats.qualityDist[qlKey] || 0) + 1;
            
            moduleBlindTested += fileBlindTested;
            moduleCount += evalResult.count;

            dirItems.push({
                id: meta.lesson || file.replace('.json', ''),
                title: meta.title || meta.lesson || file,
                theme: meta.theme || '',
                file: file,
                count: evalResult.count,
                blind_tested: fileBlindTested,
                avg_cqi: parseFloat(evalResult.avgCqi),
                quality: evalResult.quality
            });
        }
        
        // Build new absolute manifest
        dirItems.sort((a,b) => {
           let nA = parseInt((a.id||'').replace(/\D/g,'')) || 999;
           let nB = parseInt((b.id||'').replace(/\D/g,'')) || 999;
           return nA - nB;
        });

        const manifestName = `${grade}_${sem}_${subj}_${pubUpper}_manifest.json`;
        const manifestData = {
            id: `${grade}_${sem}_${subj}_${pubUpper}`,
            publisher: pubUpper,
            grade: grade,
            semester: sem,
            subject: subj,
            items: dirItems,
            moduleMetaData: {
                total_questions: moduleCount,
                blind_tested: moduleBlindTested,
                last_updated: new Date().toISOString()
            }
        };

        fs.writeFileSync(path.join(dirPath, manifestName), JSON.stringify(manifestData, null, 2), 'utf8');
        
        // Count publishers
        if (!globalStats.publishers[pubUpper]) {
            globalStats.publishers[pubUpper] = { total: 0, blind_tested: 0 };
        }
        globalStats.publishers[pubUpper].total += moduleCount;
        globalStats.publishers[pubUpper].blind_tested += moduleBlindTested;
    }

    console.log("🚀 開始全域掃描，清理舊式 manifest 並建置新版...");
    traverse(baseDir);

    globalStats.last_updated = new Date().toISOString();
    
    // Save to public root
    fs.writeFileSync(path.join(publicDir, 'libraryStats.json'), JSON.stringify(globalStats, null, 2), 'utf8');
    
    console.log(`\n============== [全站品質報告 (CQI & QL)] ==============`);
    console.log(`✅ 總解析檔數：${globalStats.totalFiles} 份`);
    console.log(`✅ 全站總題數：${globalStats.totalQuestions} 題`);
    console.log(`🎯 盲測覆蓋數：${globalStats.totalBlindTested} 題 (覆蓋率: ${((globalStats.totalBlindTested/globalStats.totalQuestions)*100).toFixed(1)}%)`);
    console.log(`📊 品質分佈：`);
    console.log(`   - QL5: ${globalStats.qualityDist.QL5}`);
    console.log(`   - QL4: ${globalStats.qualityDist.QL4}`);
    console.log(`   - QL3: ${globalStats.qualityDist.QL3}`);
    console.log(`   - QL2: ${globalStats.qualityDist.QL2}`);
    console.log(`   - QL1: ${globalStats.qualityDist.QL1}`);
    
    if (errors.length > 0) {
        console.error(`\n❌ [致命錯誤] 發現 ${errors.length} 個破損的檔案，請立即修復：`);
        errors.slice(0, 10).forEach(e => console.error(e));
        process.exit(1);
    }
    
    if (warnings.length > 0) {
        console.warn(`\n⚠️ [品質警告] 發現 ${warnings.length} 筆缺少 meta 的檔案：`);
        warnings.slice(0, 5).forEach(e => console.warn(e));
        if(warnings.length > 5) console.warn(`   ...以及其他 ${warnings.length - 5} 筆。`);
    } else {
        console.log(`\n🎉 [閘門檢查通過] 全站已達成完美的 100% Meta 覆蓋率！`);
    }
}

if (require.main === module) {
    verifyAndBuild();
}

module.exports = { verifyAndBuild };
