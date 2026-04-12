#!/usr/bin/env node

/**
 * JOB-152 Phase 1 Step 1.3: Validate Review Fields
 *
 * Checks:
 * 1. All questions have is_publishable field
 * 2. All questions have review_status field
 * 3. Logic consistency: publishable questions must have review_date
 * 4. Valid review_status values
 */

const fs = require('fs');
const path = require('path');

const QUESTION_DIR = path.join(__dirname, '../question/platform');

const VALID_REVIEW_STATUS = [
  'pending_review',
  'confirmed',
  'corrected',
  'needs_rework'
];

let stats = {
  totalQuestions: 0,
  filesProcessed: 0,
  errors: [],
  warnings: [],
  publishableCount: 0,
  pendingCount: 0
};

/**
 * Validate a single question
 */
function validateQuestion(question, filePath, questionIndex) {
  const errors = [];
  const warnings = [];

  // Check is_publishable field
  if (!question.hasOwnProperty('is_publishable')) {
    errors.push(`Missing is_publishable field`);
  }

  // Check review_status field
  if (!question.hasOwnProperty('review_status')) {
    errors.push(`Missing review_status field`);
  } else if (!VALID_REVIEW_STATUS.includes(question.review_status)) {
    errors.push(`Invalid review_status value: ${question.review_status}`);
  }

  // Check review_notes field
  if (!question.hasOwnProperty('review_notes')) {
    errors.push(`Missing review_notes field`);
  }

  // Check reviewer field
  if (!question.hasOwnProperty('reviewer')) {
    errors.push(`Missing reviewer field`);
  }

  // Check review_date field
  if (!question.hasOwnProperty('review_date')) {
    errors.push(`Missing review_date field`);
  }

  // Logic consistency: publishable questions should have review_date
  if (question.is_publishable === true && !question.review_date) {
    warnings.push(`Publishable question lacks review_date`);
  }

  // Logic consistency: pending_review should have is_publishable = false
  if (question.review_status === 'pending_review' && question.is_publishable !== false) {
    warnings.push(`Inconsistent: review_status=pending_review but is_publishable=${question.is_publishable}`);
  }

  return { errors, warnings };
}

/**
 * Process a single JSON file
 */
function processFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    if (!data.questions || !Array.isArray(data.questions)) {
      return;
    }

    data.questions.forEach((question, index) => {
      stats.totalQuestions++;
      const { errors, warnings } = validateQuestion(question, filePath, index);

      if (errors.length > 0) {
        stats.errors.push({
          file: filePath,
          questionIndex: index,
          errors
        });
      }

      if (warnings.length > 0) {
        stats.warnings.push({
          file: filePath,
          questionIndex: index,
          warnings
        });
      }

      if (question.is_publishable) {
        stats.publishableCount++;
      } else {
        stats.pendingCount++;
      }
    });

    stats.filesProcessed++;
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
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
      processFile(filePath);
    }
  });
}

/**
 * Main execution
 */
function main() {
  console.log('🔍 Validating review fields in all question JSON files...\n');

  if (!fs.existsSync(QUESTION_DIR)) {
    console.error(`❌ Question directory not found: ${QUESTION_DIR}`);
    process.exit(1);
  }

  walkDirectory(QUESTION_DIR);

  console.log('\n' + '='.repeat(70));
  console.log('📊 Validation Report');
  console.log('='.repeat(70));
  console.log(`✅ Files processed:           ${stats.filesProcessed}`);
  console.log(`📝 Total questions:           ${stats.totalQuestions}`);
  console.log(`✓  Publishable (is_publishable=true):  ${stats.publishableCount}`);
  console.log(`⏳ Pending review (is_publishable=false): ${stats.pendingCount}`);
  console.log(`❌ Errors found:              ${stats.errors.length}`);
  console.log(`⚠️  Warnings found:            ${stats.warnings.length}`);
  console.log('='.repeat(70));

  // Display errors
  if (stats.errors.length > 0) {
    console.log('\n❌ ERRORS:');
    stats.errors.slice(0, 10).forEach(({ file, questionIndex, errors }) => {
      console.log(`\n  File: ${file}`);
      console.log(`  Question: ${questionIndex}`);
      errors.forEach(err => {
        console.log(`    - ${err}`);
      });
    });
    if (stats.errors.length > 10) {
      console.log(`\n  ... and ${stats.errors.length - 10} more errors`);
    }
  }

  // Display warnings
  if (stats.warnings.length > 0) {
    console.log('\n⚠️  WARNINGS:');
    stats.warnings.slice(0, 10).forEach(({ file, questionIndex, warnings }) => {
      console.log(`\n  File: ${file}`);
      console.log(`  Question: ${questionIndex}`);
      warnings.forEach(warn => {
        console.log(`    - ${warn}`);
      });
    });
    if (stats.warnings.length > 10) {
      console.log(`\n  ... and ${stats.warnings.length - 10} more warnings`);
    }
  }

  console.log('\n' + '='.repeat(70));

  if (stats.errors.length === 0) {
    console.log('✅ All questions have valid review fields!\n');
    process.exit(0);
  } else {
    console.log(`❌ Validation failed: ${stats.errors.length} errors found\n`);
    process.exit(1);
  }
}

main();
