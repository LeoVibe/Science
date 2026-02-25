import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const PLATFORM_DIR = path.resolve(__dirname, '../question/platform');

// 規格定義
const GRADES = ['g3', 'g4', 'g5', 'g6'];
const SUBJECTS = ['chi', 'sci', 'mat', 'soc', 'eng'];
const SEMESTERS = ['s1', 's2'];
const PUBLISHERS = ['nani', 'knsh', 'hanlin'];

async function scan() {
    console.log('🔍 開始全量平台題庫掃描 (Health Check)...');
    console.log('==========================================');

    let totalCombos = 0;
    let activeCombos = 0;
    let issues = [];

    for (const g of GRADES) {
        for (const sub of SUBJECTS) {
            for (const sem of SEMESTERS) {
                for (const pub of PUBLISHERS) {
                    totalCombos++;
                    const comboPath = path.join(PLATFORM_DIR, g, sub, sem, pub);

                    if (fs.existsSync(comboPath)) {
                        activeCombos++;
                        const manifestPath = path.join(comboPath, 'manifest.json');

                        if (!fs.existsSync(manifestPath)) {
                            issues.push(`⚠️ [${g}/${sub}/${sem}/${pub}] 缺少 manifest.json`);
                            continue;
                        }

                        // 驗證 JSON 格式
                        try {
                            const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf-8'));
                            const units = manifest.units || manifest.files || [];

                            if (units.length === 0) {
                                issues.push(`❓ [${g}/${sub}/${sem}/${pub}] Manifest 為空 (無單元)`);
                            } else {
                                // 檢查單元檔案是否存在
                                units.forEach(u => {
                                    const fileName = typeof u === 'string' ? u : u.file;
                                    const filePath = path.join(comboPath, fileName);
                                    if (!fs.existsSync(filePath)) {
                                        issues.push(`❌ [${g}/${sub}/${sem}/${pub}] 找不到單元檔案: ${fileName}`);
                                    } else {
                                        // 驗證題目格式 (抽樣第一個)
                                        try {
                                            const unitData = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
                                            if (!unitData.questions || !Array.isArray(unitData.questions)) {
                                                issues.push(`🚫 [${g}/${sub}/${sem}/${pub}] 檔案格式錯誤 (無 questions 陣列): ${fileName}`);
                                            }
                                        } catch (e) {
                                            issues.push(`🔥 [${g}/${sub}/${sem}/${pub}] JSON 解析失敗: ${fileName}`);
                                        }
                                    }
                                });
                            }
                        } catch (e) {
                            issues.push(`🔥 [${g}/${sub}/${sem}/${pub}] Manifest 解析失敗 (Invalid JSON)`);
                        }
                    }
                }
            }
        }
    }

    console.log(`📊 掃描報告：`);
    console.log(`- 總掃描組合數: ${totalCombos}`);
    console.log(`- 已啟用組合數: ${activeCombos}`);
    console.log(`- 發現問題件數: ${issues.length}`);
    console.log('\n--- 詳細問題清單 ---');
    if (issues.length === 0) {
        console.log('✨ 恭喜！目前平台資料格式完全正確。');
    } else {
        issues.forEach(issue => console.log(issue));
    }
    console.log('==========================================');
}

scan();
