#!/usr/bin/env node

/**
 * Query questions by filters
 * Used by admin dashboard to search and filter questions for review
 */

const fs = require('fs');
const path = require('path');

const QUESTION_DIR = path.join(__dirname, '../question/platform');

/**
 * Parse CLI arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const filters = {
    grade: 'all',
    subject: 'all',
    semester: 'all',
    publisher: 'all',
    reviewStatus: 'all',
    isPublishable: 'all',
    searchTerm: '',
    limit: 100,
    offset: 0
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    if (key in filters) {
      filters[key] = value;
    }
  }

  return filters;
}

/**
 * Extract metadata from file path
 */
function parseFilePath(filePath) {
  const parts = filePath.split(path.sep);
  const platformIdx = parts.indexOf('platform');
  return {
    grade: parts[platformIdx + 1],
    subject: parts[platformIdx + 2],
    semester: parts[platformIdx + 3],
    publisher: parts[platformIdx + 4],
    filename: parts[parts.length - 1]
  };
}

/**
 * Check if question matches filters
 */
function matchesFilter(question, filters, fileMeta) {
  if (filters.grade !== 'all' && fileMeta.grade !== filters.grade) return false;
  if (filters.subject !== 'all' && fileMeta.subject !== filters.subject) return false;
  if (filters.semester !== 'all' && fileMeta.semester !== filters.semester) return false;
  if (filters.publisher !== 'all' && fileMeta.publisher !== filters.publisher) return false;
  if (filters.reviewStatus !== 'all' && question.review_status !== filters.reviewStatus) return false;
  if (filters.isPublishable !== 'all') {
    const isPub = filters.isPublishable === 'true';
    if (question.is_publishable !== isPub) return false;
  }
  if (filters.searchTerm && !question.question.includes(filters.searchTerm)) return false;
  return true;
}

/**
 * Process a single JSON file
 */
function processFile(filePath, filters, results) {
  try {
    const content = fs.readFileSync(filePath, 'utf-8');
    const data = JSON.parse(content);

    if (!data.questions || !Array.isArray(data.questions)) {
      return;
    }

    const fileMeta = parseFilePath(filePath);

    data.questions.forEach((question, idx) => {
      if (matchesFilter(question, filters, fileMeta)) {
        results.push({
          id: `${fileMeta.filename}#${idx}`,
          file: filePath,
          index: idx,
          ...fileMeta,
          question: question.question.substring(0, 100),
          answer_index: question.answer_index,
          is_publishable: question.is_publishable,
          review_status: question.review_status,
          review_notes: question.review_notes || '',
          cqi_score: question.cqi_score,
          blind_evaluation: question.blind_evaluation || false
        });
      }
    });
  } catch (error) {
    console.error(`Error processing ${filePath}: ${error.message}`);
  }
}

/**
 * Recursively find and process all JSON files
 */
function walkDirectory(dir, filters, results) {
  const files = fs.readdirSync(dir);

  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      walkDirectory(filePath, filters, results);
    } else if (file.endsWith('.json') && !file.endsWith('manifest.json')) {
      processFile(filePath, filters, results);
    }
  });
}

/**
 * Main execution
 */
function main() {
  const filters = parseArgs();

  if (!fs.existsSync(QUESTION_DIR)) {
    console.error(`Error: Question directory not found: ${QUESTION_DIR}`);
    process.exit(1);
  }

  const results = [];
  walkDirectory(QUESTION_DIR, filters, results);

  // Apply pagination
  const total = results.length;
  const offset = parseInt(filters.offset, 10) || 0;
  const limit = parseInt(filters.limit, 10) || 100;
  const paged = results.slice(offset, offset + limit);

  // Output JSON
  console.log(JSON.stringify({
    total,
    count: paged.length,
    offset,
    limit,
    results: paged
  }, null, 2));
}

main();
