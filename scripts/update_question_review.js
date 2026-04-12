#!/usr/bin/env node

/**
 * Update review status of a single question
 * Usage: node scripts/update_question_review.js --file <file_path> --index <index> --status <status> --notes <notes> --reviewer <reviewer>
 */

const fs = require('fs');
const path = require('path');

/**
 * Parse CLI arguments
 */
function parseArgs() {
  const args = process.argv.slice(2);
  const params = {
    file: '',
    index: 0,
    status: 'pending_review',
    notes: '',
    reviewer: ''
  };

  for (let i = 0; i < args.length; i += 2) {
    const key = args[i].replace(/^--/, '');
    const value = args[i + 1];
    if (key in params) {
      if (key === 'index') {
        params[key] = parseInt(value, 10);
      } else {
        params[key] = value;
      }
    }
  }

  return params;
}

/**
 * Main execution
 */
function main() {
  const params = parseArgs();

  if (!params.file) {
    console.error('Error: --file parameter is required');
    process.exit(1);
  }

  if (!fs.existsSync(params.file)) {
    console.error(`Error: File not found: ${params.file}`);
    process.exit(1);
  }

  try {
    const content = fs.readFileSync(params.file, 'utf-8');
    const data = JSON.parse(content);

    if (!data.questions || !Array.isArray(data.questions)) {
      console.error('Error: No questions array found in file');
      process.exit(1);
    }

    const question = data.questions[params.index];
    if (!question) {
      console.error(`Error: Question at index ${params.index} not found`);
      process.exit(1);
    }

    // Update review fields
    question.review_status = params.status;
    question.review_notes = params.notes;
    question.reviewer = params.reviewer;
    question.review_date = new Date().toISOString().split('T')[0];

    // Set is_publishable based on status
    if (params.status === 'confirmed') {
      question.is_publishable = true;
    } else if (params.status === 'pending_review') {
      question.is_publishable = false;
    } else if (params.status === 'needs_rework') {
      question.is_publishable = false;
    } else if (params.status === 'corrected') {
      question.is_publishable = false;
    }

    // Write back to file
    fs.writeFileSync(params.file, JSON.stringify(data, null, 2) + '\n', 'utf-8');

    console.log(JSON.stringify({
      success: true,
      message: `Question at index ${params.index} updated successfully`,
      question: {
        review_status: question.review_status,
        review_notes: question.review_notes,
        reviewer: question.reviewer,
        review_date: question.review_date,
        is_publishable: question.is_publishable
      }
    }, null, 2));

  } catch (error) {
    console.error(`Error: ${error.message}`);
    process.exit(1);
  }
}

main();
