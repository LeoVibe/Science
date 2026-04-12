#!/usr/bin/env node

/**
 * JOB-152 Phase 1 Step 1.2: Initialize Review Fields
 *
 * Logic:
 * - For each question, add review-related fields if not present
 * - If blind_evaluation == true, set is_publishable = true (已通過盲測)
 * - Otherwise, set is_publishable = false (待審核)
 * - Initialize review_status, review_notes, reviewer, review_date
 */

const fs = require('fs');
const path = require('path');

const QUESTION_DIR = path.join(__dirname, '../question/platform');

let stats = {
  totalQuestions: 0,
  publishable: 0,        // 已通過盲測，標記為 true
  pendingReview: 0,      // 未通過或無盲測記錄，標記為 false
  filesProcessed: 0,
  filesSkipped: 0
};

/**
 * Add review fields to a question object
 */
function initializeReviewFields(question) {
  // 如果已存在審核欄位，跳過
  if (question.hasOwnProperty('is_publishable')) {
    return false; // 已初始化，不需要更新
  }

  // 邏輯：已通過盲測的題目可以發佈
  const isBlindEvaluated = question.blind_evaluation === true;

  question.is_publishable = isBlindEvaluated;
  question.review_status = isBlindEvaluated ? 'confirmed' : 'pending_review';
  question.review_notes = '';
  question.reviewer = null;
  question.review_date = isBlindEvaluated ? new Date().toISOString().split('T')[0] : null;

  return true; // 已初始化
}

/**
 * Process a single JSON file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    if (!data.questions || !Array.isArray(data.questions)) {
      return null;
    }

    let modified = false;
    data.questions.forEach(question => {
      if (initializeReviewFields(question)) {
        modified = true;
      }

      // 統計
      stats.totalQuestions++;
      if (question.is_publishable) {
        stats.publishable++;
      } else {
        stats.pendingReview++;
      }
    });

    if (modified) {
      fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
      return data.questions.length;
    }

    return null;
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
    return null;
  }
}

/**
 * Recursively find and process all JSON files
 */
function walkDirectory(dir) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDirectory(filePath);
    } else if (file.endsWith('.json') && !file.endsWith('manifest.json')) {
      const count = processFile(filePath);
      if (count !== null) {
        stats.filesProcessed++;
        console.log(`✓ ${filePath} (${count} questions)`);
      } else {
        stats.filesSkipped++;
      }
    }
  });
}

/**
 * Main execution
 */
function main() {
  console.log('🔄 Initializing review fields in all question JSON files...\n');

  if (!fs.existsSync(QUESTION_DIR)) {
    console.error(`❌ Question directory not found: ${QUESTION_DIR}`);
    process.exit(1);
  }

  walkDirectory(QUESTION_DIR);

  console.log('\n' + '='.repeat(60));
  console.log('📊 Initialization Summary');
  console.log('='.repeat(60));
  console.log(`✅ Files processed:       ${stats.filesProcessed}`);
  console.log(`⏭️  Files skipped:         ${stats.filesSkipped}`);
  console.log(`📝 Total questions:       ${stats.totalQuestions}`);
  console.log(`✓  Publishable (已通過盲測): ${stats.publishable}`);
  console.log(`⏳ Pending review (待審核):  ${stats.pendingReview}`);
  console.log('='.repeat(60) + '\n');

  console.log('✅ Review fields initialization complete!');
}

main();
