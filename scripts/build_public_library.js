#!/usr/bin/env node

/**
 * JOB-152 Phase 3: Build Public Library with Review Filtering
 *
 * Logic:
 * - Only export questions where is_publishable === true
 * - Generate publication statistics report
 */

const fs = require('fs');
const path = require('path');

const QUESTION_DIR = path.join(__dirname, '../question/platform');
const OUTPUT_DIR = path.join(__dirname, '../artifacts/public_library');

// Ensure output directory exists
if (!fs.existsSync(OUTPUT_DIR)) {
  fs.mkdirSync(OUTPUT_DIR, { recursive: true });
}

let stats = {
  courseStats: {},  // {courseId: {original: N, published: N, pending: N}}
  gradeStats: {},   // {grade: {original: N, published: N, pending: N}}
  subjectStats: {}, // {subject: {original: N, published: N, pending: N}}
  publisherStats: {}, // {publisher: {original: N, published: N, pending: N}}
  totalOriginal: 0,
  totalPublished: 0,
  totalPending: 0,
  courses: []
};

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
 * Generate course ID from metadata
 */
function generateCourseId(meta) {
  return `${meta.grade}_${meta.semester}_${meta.subject}_${meta.publisher}`;
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

    const meta = parseFilePath(filePath);
    const courseId = generateCourseId(meta);

    // Filter questions: only publishable ones
    const publishedQuestions = data.questions.filter(q => q.is_publishable === true);
    const pendingCount = data.questions.length - publishedQuestions.length;

    // Initialize stats if needed
    if (!stats.courseStats[courseId]) {
      stats.courseStats[courseId] = {
        original: data.questions.length,
        published: 0,
        pending: 0,
        meta: meta
      };
    }

    // Update course stats
    stats.courseStats[courseId].published += publishedQuestions.length;
    stats.courseStats[courseId].pending += pendingCount;

    // Update grade stats
    if (!stats.gradeStats[meta.grade]) {
      stats.gradeStats[meta.grade] = { original: 0, published: 0, pending: 0 };
    }
    stats.gradeStats[meta.grade].original += data.questions.length;
    stats.gradeStats[meta.grade].published += publishedQuestions.length;
    stats.gradeStats[meta.grade].pending += pendingCount;

    // Update subject stats
    if (!stats.subjectStats[meta.subject]) {
      stats.subjectStats[meta.subject] = { original: 0, published: 0, pending: 0 };
    }
    stats.subjectStats[meta.subject].original += data.questions.length;
    stats.subjectStats[meta.subject].published += publishedQuestions.length;
    stats.subjectStats[meta.subject].pending += pendingCount;

    // Update publisher stats
    if (!stats.publisherStats[meta.publisher]) {
      stats.publisherStats[meta.publisher] = { original: 0, published: 0, pending: 0 };
    }
    stats.publisherStats[meta.publisher].original += data.questions.length;
    stats.publisherStats[meta.publisher].published += publishedQuestions.length;
    stats.publisherStats[meta.publisher].pending += pendingCount;

    // Update totals
    stats.totalOriginal += data.questions.length;
    stats.totalPublished += publishedQuestions.length;
    stats.totalPending += pendingCount;

    // Return published data for export
    if (publishedQuestions.length > 0) {
      return {
        meta: data.meta,
        questions: publishedQuestions
      };
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
function walkDirectory(dir, parentMeta = null) {
  const files = fs.readdirSync(dir);
  let hasJsonFiles = false;
  let subDirs = [];

  files.forEach(file => {
    if (file === '.DS_Store') return;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat.isDirectory()) {
      subDirs.push(filePath);
    } else if (file.endsWith('.json') && !file.endsWith('manifest.json')) {
      hasJsonFiles = true;
    }
  });

  // If this is a leaf directory with JSON files, process them
  if (hasJsonFiles && subDirs.length === 0) {
    files.forEach(file => {
      if (file.endsWith('.json') && !file.endsWith('manifest.json')) {
        const filePath = path.join(dir, file);
        const published = processFile(filePath);

        if (published) {
          // Save published data
          const meta = parseFilePath(filePath);
          const filename = `${meta.grade}_${meta.semester}_${meta.subject.substring(0, 3).toUpperCase()}_${meta.publisher}_published_${path.basename(filePath)}`;
          const outputPath = path.join(OUTPUT_DIR, filename);
          fs.writeFileSync(outputPath, JSON.stringify(published, null, 2) + '\n', 'utf-8');
          console.log(`✓ Published: ${filename} (${published.questions.length} questions)`);
        }
      }
    });
  } else {
    // Recurse into subdirectories
    subDirs.forEach(subDir => {
      walkDirectory(subDir);
    });
  }
}

/**
 * Generate publication report
 */
function generateReport() {
  const timestamp = new Date().toISOString().split('T')[0];

  let report = `# JOB-152 發佈統計報告\n\n`;
  report += `**報告生成日期：** ${timestamp}\n`;
  report += `**統計期間：** Phase 3 發佈篩選\n\n`;

  report += `## 整體統計\n\n`;
  report += `| 指標 | 數量 |\n`;
  report += `|:--|:--|\n`;
  report += `| 原始題目總數 | ${stats.totalOriginal} |\n`;
  report += `| 已發佈題目數 | ${stats.totalPublished} |\n`;
  report += `| 待審核題目數 | ${stats.totalPending} |\n`;
  report += `| 發佈率 | ${((stats.totalPublished / stats.totalOriginal) * 100).toFixed(1)}% |\n`;
  report += `\n`;

  // Grade statistics
  report += `## 按年級發佈統計\n\n`;
  report += `| 年級 | 原始題數 | 已發佈 | 待審核 | 發佈率 |\n`;
  report += `|:--|:--|:--|:--|:--|\n`;
  Object.keys(stats.gradeStats)
    .sort()
    .forEach(grade => {
      const g = stats.gradeStats[grade];
      const rate = ((g.published / g.original) * 100).toFixed(1);
      report += `| ${grade} | ${g.original} | ${g.published} | ${g.pending} | ${rate}% |\n`;
    });
  report += `\n`;

  // Subject statistics
  report += `## 按科目發佈統計\n\n`;
  report += `| 科目 | 原始題數 | 已發佈 | 待審核 | 發佈率 |\n`;
  report += `|:--|:--|:--|:--|:--|\n`;
  Object.keys(stats.subjectStats)
    .sort()
    .forEach(subject => {
      const s = stats.subjectStats[subject];
      const rate = ((s.published / s.original) * 100).toFixed(1);
      report += `| ${subject} | ${s.original} | ${s.published} | ${s.pending} | ${rate}% |\n`;
    });
  report += `\n`;

  // Publisher statistics
  report += `## 按版本發佈統計\n\n`;
  report += `| 版本 | 原始題數 | 已發佈 | 待審核 | 發佈率 |\n`;
  report += `|:--|:--|:--|:--|:--|\n`;
  Object.keys(stats.publisherStats)
    .sort()
    .forEach(publisher => {
      const p = stats.publisherStats[publisher];
      const rate = ((p.published / p.original) * 100).toFixed(1);
      report += `| ${publisher} | ${p.original} | ${p.published} | ${p.pending} | ${rate}% |\n`;
    });
  report += `\n`;

  // Top pending courses
  report += `## 待審核課檔優先度（Top 20）\n\n`;
  report += `| 課檔 | 待審核數 | 原始數 | 發佈率 | 優先度 |\n`;
  report += `|:--|:--|:--|:--|:--|\n`;

  const pendingCourses = Object.entries(stats.courseStats)
    .filter(([_, c]) => c.pending > 0)
    .sort(([_, a], [__, b]) => b.pending - a.pending)
    .slice(0, 20);

  pendingCourses.forEach(([courseId, courseData]) => {
    const publishRate = ((courseData.published / courseData.original) * 100).toFixed(1);
    const priority = courseData.pending > 100 ? '🔴 P1' : courseData.pending > 50 ? '🟠 P2' : '🟡 P3';
    report += `| ${courseId} | ${courseData.pending} | ${courseData.original} | ${publishRate}% | ${priority} |\n`;
  });
  report += `\n`;

  // Save report
  const reportPath = path.join(__dirname, '../jobs/JOB-152-Publication-Report.md');
  fs.writeFileSync(reportPath, report, 'utf-8');
  console.log(`\n✓ Report generated: ${reportPath}`);
}

/**
 * Main execution
 */
function main() {
  console.log('🔄 Building public library with review filtering...\n');

  if (!fs.existsSync(QUESTION_DIR)) {
    console.error(`Error: Question directory not found: ${QUESTION_DIR}`);
    process.exit(1);
  }

  walkDirectory(QUESTION_DIR);

  console.log('\n' + '='.repeat(70));
  console.log('📊 Publication Summary');
  console.log('='.repeat(70));
  console.log(`📝 Total questions (original):  ${stats.totalOriginal}`);
  console.log(`✅ Published (is_publishable=true): ${stats.totalPublished}`);
  console.log(`⏳ Pending review (is_publishable=false): ${stats.totalPending}`);
  console.log(`📈 Publication rate:            ${((stats.totalPublished / stats.totalOriginal) * 100).toFixed(1)}%`);
  console.log('='.repeat(70) + '\n');

  // Generate detailed report
  generateReport();

  console.log('✅ Public library build complete!');
}

main();
