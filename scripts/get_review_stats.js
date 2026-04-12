#!/usr/bin/env node

/**
 * Get review statistics from question files
 * Used by admin dashboard to show overall review status
 */

const fs = require('fs');
const path = require('path');

const QUESTION_DIR = path.join(__dirname, '../question/platform');

let stats = {
  total: 0,
  publishable: 0,
  pendingReview: 0,
  corrected: 0,
  needsRework: 0,
  byGrade: {},
  bySubject: {},
  byPublisher: {},
  byStatus: {}
};

/**
 * Extract metadata from file path
 */
function parseFilePath(filePath) {
  // /path/to/G3/Chinese/S1/HanLin/G3_S1_CHI_HANLIN_L1.json
  const parts = filePath.split(path.sep);
  const grade = parts[parts.indexOf('platform') + 1];
  const subject = parts[parts.indexOf('platform') + 2];
  const semester = parts[parts.indexOf('platform') + 3];
  const publisher = parts[parts.indexOf('platform') + 4];

  return { grade, subject, semester, publisher };
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

    const meta = parseFilePath(filePath);

    data.questions.forEach(question => {
      const status = question.review_status || 'unknown';

      stats.total++;
      if (question.is_publishable) {
        stats.publishable++;
      } else {
        stats.pendingReview++;
      }

      // Count by status
      stats.byStatus[status] = (stats.byStatus[status] || 0) + 1;

      // Count by grade
      if (meta.grade) {
        if (!stats.byGrade[meta.grade]) {
          stats.byGrade[meta.grade] = { total: 0, publishable: 0, pending: 0 };
        }
        stats.byGrade[meta.grade].total++;
        if (question.is_publishable) {
          stats.byGrade[meta.grade].publishable++;
        } else {
          stats.byGrade[meta.grade].pending++;
        }
      }

      // Count by subject
      if (meta.subject) {
        if (!stats.bySubject[meta.subject]) {
          stats.bySubject[meta.subject] = { total: 0, publishable: 0, pending: 0 };
        }
        stats.bySubject[meta.subject].total++;
        if (question.is_publishable) {
          stats.bySubject[meta.subject].publishable++;
        } else {
          stats.bySubject[meta.subject].pending++;
        }
      }

      // Count by publisher
      if (meta.publisher) {
        if (!stats.byPublisher[meta.publisher]) {
          stats.byPublisher[meta.publisher] = { total: 0, publishable: 0, pending: 0 };
        }
        stats.byPublisher[meta.publisher].total++;
        if (question.is_publishable) {
          stats.byPublisher[meta.publisher].publishable++;
        } else {
          stats.byPublisher[meta.publisher].pending++;
        }
      }
    });
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
  if (!fs.existsSync(QUESTION_DIR)) {
    console.error(`Error: Question directory not found: ${QUESTION_DIR}`);
    process.exit(1);
  }

  walkDirectory(QUESTION_DIR);

  // Output JSON
  console.log(JSON.stringify(stats, null, 2));
}

main();
