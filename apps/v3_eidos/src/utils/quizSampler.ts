import { Question } from '@/data/config';
import { AnswerRecord } from './storage';

/**
 * 期末測驗最佳化抽樣演算法 (JOB-057)
 * 核心邏輯：分層比例抽樣 + 錯題加權 + 今日去重
 */
export function stratifiedSample(
    allQuestions: Question[],
    targetCategories: string[],
    totalCount: number,
    answerHistory: Record<string, AnswerRecord>,
    todayQuizzedIds: Set<string> = new Set()
): Question[] {
    // 1. 篩選出目標課次的題目
    const poolByCat: Record<string, Question[]> = {};
    targetCategories.forEach(cat => {
        poolByCat[cat] = allQuestions.filter(q => q.category === cat);
    });

    const availableTotal = Object.values(poolByCat).reduce((sum, list) => sum + list.length, 0);
    if (availableTotal === 0) return [];

    // 2. 計算各課配額 (Quota Allocation)
    const quotas: Record<string, number> = {};
    let allocatedTotal = 0;

    targetCategories.forEach(cat => {
        const catTotal = poolByCat[cat].length;
        if (catTotal === 0) {
            quotas[cat] = 0;
            return;
        }
        // 比例分配
        let q = Math.round(totalCount * (catTotal / availableTotal));
        // 保證每課至少 1 題 (除非該課沒題目)
        if (q === 0 && catTotal > 0) q = 1;
        quotas[cat] = q;
        allocatedTotal += q;
    });

    // 調整配額總和使其等於目標總數
    let diff = allocatedTotal - totalCount;
    const sortedCatsForAdj = [...targetCategories].sort((a, b) => poolByCat[b].length - poolByCat[a].length);

    while (diff !== 0) {
        for (const cat of sortedCatsForAdj) {
            if (diff > 0 && quotas[cat] > 1) {
                quotas[cat]--;
                diff--;
            } else if (diff < 0 && quotas[cat] < poolByCat[cat].length) {
                quotas[cat]++;
                diff++;
            }
            if (diff === 0) break;
        }
        // 防止死循環 (如果所有課都只有1題且需扣除，或所有課都滿了)
        if (allocatedTotal === availableTotal || allocatedTotal === targetCategories.length) break;
    }

    // 3. 各課內部選題 (加權排序)
    const finalSelection: Question[] = [];

    targetCategories.forEach(cat => {
        const quota = quotas[cat];
        if (quota <= 0) return;

        const list = poolByCat[cat];

        // 評分與去重邏輯
        const scoredList = list.map(q => {
            const hist = answerHistory[q.id];
            const isToday = todayQuizzedIds.has(q.id);

            // 權重計算 (越小越優先)
            // 1. 今日是否出過 (最不優先，加權量大於所有歷史錯誤)
            let score = isToday ? 1000 : 0;

            if (hist) {
                // 2. 歷史錯題優先
                if (hist.wrong > 0 && hist.correct === 0) {
                    score += 10; // 絕對弱點
                } else if (hist.wrong > 0) {
                    score += 50; // 曾經錯過
                } else {
                    score += 100; // 全對過
                }
                // 按錯誤次數微調，錯越多越前面
                score -= Math.min(hist.wrong, 5);
            } else {
                score += 30; // 從未做過 (優先於全對過的題目)
            }

            return { q, score };
        });

        // 排序並取前 N 題
        const selected = scoredList
            .sort((a, b) => a.score - b.score)
            .slice(0, quota)
            .map(item => item.q);

        finalSelection.push(...selected);
    });

    // 4. 最後整體洗牌一次，避免相同課次的題目連續出現
    return shuffle(finalSelection);
}

function shuffle<T>(array: T[]): T[] {
    const result = [...array];
    for (let i = result.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [result[i], result[j]] = [result[j], result[i]];
    }
    return result;
}
