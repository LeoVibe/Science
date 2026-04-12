#!/usr/bin/env node

/**
 * JOB-152 Verification Script
 * Verify all deliverables are complete and correct
 */

const fs = require('fs');
const path = require('path');

const projectRoot = path.join(__dirname, '..');

let results = {
  phase1: { passed: 0, total: 3 },
  phase2: { passed: 0, total: 3 },
  phase3: { passed: 0, total: 3 },
  overall: { passed: 0, total: 9 }
};

function checkFile(filePath, description) {
  const fullPath = path.join(projectRoot, filePath);
  const exists = fs.existsSync(fullPath);
  console.log(`  ${exists ? '✓' : '✗'} ${description} (${filePath})`);
  return exists;
}

function checkDirectory(dirPath, description) {
  const fullPath = path.join(projectRoot, dirPath);
  const exists = fs.existsSync(fullPath);
  const itemCount = exists ? fs.readdirSync(fullPath).length : 0;
  console.log(`  ${exists ? '✓' : '✗'} ${description} (${dirPath}) - ${itemCount} items`);
  return exists;
}

function verifyJSON(filePath, expectedKeys) {
  try {
    const fullPath = path.join(projectRoot, filePath);
    const content = fs.readFileSync(fullPath, 'utf-8');
    const data = JSON.parse(content);

    // Check sample questions have required fields
    if (data.questions && Array.isArray(data.questions)) {
      const allHaveFields = data.questions.every(q =>
        expectedKeys.every(key => key in q)
      );
      return allHaveFields;
    }
    return false;
  } catch (error) {
    return false;
  }
}

console.log('\n' + '='.repeat(70));
console.log('JOB-152 Verification Report');
console.log('='.repeat(70) + '\n');

// Phase 1 Verification
console.log('📋 Phase 1: Data Structure Update');
console.log('─'.repeat(70));

if (checkFile('scripts/initialize_review_fields.js', 'Initialize script')) {
  results.phase1.passed++;
}
results.phase1.total;

if (checkFile('scripts/validate_review_fields.js', 'Validate script')) {
  results.phase1.passed++;
}

// Check a sample question has review fields
const sampleQuestionPath = 'question/platform/G3/Chinese/S1/HanLin/G3_S1_CHI_HANLIN_L1.json';
const reviewFields = ['is_publishable', 'review_status', 'review_notes', 'reviewer', 'review_date'];
if (checkFile(sampleQuestionPath, `Sample question with review fields`)) {
  const hasReviewFields = verifyJSON(sampleQuestionPath, reviewFields);
  if (hasReviewFields) {
    console.log(`    ✓ Review fields verified in sample questions`);
    results.phase1.passed++;
  } else {
    console.log(`    ✗ Review fields missing or invalid in sample questions`);
  }
} else {
  console.log(`    ✗ Sample question file not found`);
}

console.log(`\nPhase 1 Result: ${results.phase1.passed}/${results.phase1.total} checks passed\n`);

// Phase 2 Verification
console.log('📋 Phase 2: Admin Dashboard Development');
console.log('─'.repeat(70));

if (checkFile('apps/v3_eidos/src/components/admin/AdminReviewDashboard.tsx', 'Review Dashboard component')) {
  results.phase2.passed++;
}

if (checkFile('apps/v3_eidos/src/components/admin/AdminQuestionReview.tsx', 'Question Review component')) {
  results.phase2.passed++;
}

if (checkFile('apps/v3_eidos/src/App.tsx', 'App.tsx with review routes')) {
  // Check if AdminQuestionReview is imported
  try {
    const content = fs.readFileSync(path.join(projectRoot, 'apps/v3_eidos/src/App.tsx'), 'utf-8');
    if (content.includes('AdminQuestionReview') && content.includes('/admin/review/question')) {
      console.log(`    ✓ Review routes configured`);
      results.phase2.passed++;
    } else {
      console.log(`    ✗ Review routes not found in App.tsx`);
    }
  } catch (error) {
    console.log(`    ✗ Error checking App.tsx: ${error.message}`);
  }
}

console.log(`\nPhase 2 Result: ${results.phase2.passed}/${results.phase2.total} checks passed\n`);

// Phase 3 Verification
console.log('📋 Phase 3: Publication Filtering');
console.log('─'.repeat(70));

if (checkFile('scripts/build_public_library.js', 'Publication build script')) {
  results.phase3.passed++;
}

if (checkFile('jobs/JOB-152-Publication-Report.md', 'Publication statistics report')) {
  // Verify report contains expected statistics
  try {
    const content = fs.readFileSync(path.join(projectRoot, 'jobs/JOB-152-Publication-Report.md'), 'utf-8');
    if (content.includes('原始題目總數') && content.includes('已發佈題目數')) {
      console.log(`    ✓ Report contains publication statistics`);
      results.phase3.passed++;
    } else {
      console.log(`    ✗ Report format invalid`);
    }
  } catch (error) {
    console.log(`    ✗ Error reading report: ${error.message}`);
  }
}

if (checkDirectory('artifacts/public_library', 'Published library directory')) {
  results.phase3.passed++;
}

console.log(`\nPhase 3 Result: ${results.phase3.passed}/${results.phase3.total} checks passed\n`);

// Overall Summary
results.overall.passed = results.phase1.passed + results.phase2.passed + results.phase3.passed;

console.log('='.repeat(70));
console.log('📊 Overall Summary');
console.log('='.repeat(70));
console.log(`Phase 1 (Data Structure):    ${results.phase1.passed}/${results.phase1.total} ✓`);
console.log(`Phase 2 (Admin Dashboard):   ${results.phase2.passed}/${results.phase2.total} ✓`);
console.log(`Phase 3 (Publication):       ${results.phase3.passed}/${results.phase3.total} ✓`);
console.log(`─`.repeat(40));
console.log(`Total:                       ${results.overall.passed}/${results.overall.total} checks passed`);

if (results.overall.passed === results.overall.total) {
  console.log('\n✅ JOB-152 Verification PASSED - All deliverables complete!\n');
  process.exit(0);
} else {
  console.log(`\n⚠️  JOB-152 Verification INCOMPLETE - ${results.overall.total - results.overall.passed} issues found\n`);
  process.exit(1);
}
