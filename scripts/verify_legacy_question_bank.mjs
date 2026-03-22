#!/usr/bin/env node
/**
 * 離線驗證：歷史版 v2 路徑層級 + meta 相容規則（與 apps/v2_currisite/src/data/index.js 之 metaMatchesUi 對齊）
 */
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '..');

const PUBLISHER_META_MAP = {
  康軒: 'kang_hsuan',
  南一: 'nan_yi',
  翰林: 'han_lin'
};

const PUBLISHER_PLATFORM_FOLDER = {
  康軒: 'KangHsuan',
  南一: 'NanYi',
  翰林: 'HanLin'
};

const SUBJECT_MAP = {
  國語: 'Chinese',
  數學: 'Math',
  自然: 'Science',
  社會: 'SocialStudies',
  英語: 'English',
  生活: 'Life'
};

function normalizePublisherToken(value) {
  return String(value ?? '').toLowerCase().replace(/_/g, '');
}

function metaMatchesUi(meta, grade, semester, uiSubject, uiPublisher) {
  if (!meta) return false;
  const gradeOk = meta.grade === `grade_${grade}` || meta.grade === `G${grade}`;
  const semesterOk = meta.semester === `semester_${semester}` || meta.semester === `S${semester}`;
  const subjectOk =
    meta.subject === uiSubject ||
    (SUBJECT_MAP[uiSubject] && meta.subject === SUBJECT_MAP[uiSubject]);
  const expectedMetaPub = PUBLISHER_META_MAP[uiPublisher];
  const folderPub = PUBLISHER_PLATFORM_FOLDER[uiPublisher];
  const pubOk =
    !!expectedMetaPub &&
    (meta.publisher === expectedMetaPub ||
      normalizePublisherToken(meta.publisher) === normalizePublisherToken(expectedMetaPub) ||
      (folderPub && meta.publisher === folderPub));
  return gradeOk && semesterOk && subjectOk && pubOk;
}

const SAMPLE = {
  relManifest: 'question/platform/G3/Science/S1/KangHsuan/manifest.json',
  grade: 3,
  semester: 1,
  uiSubject: '自然',
  uiPublisher: '康軒'
};

function main() {
  const manifestPath = path.join(repoRoot, SAMPLE.relManifest);
  if (!fs.existsSync(manifestPath)) {
    console.error('缺少檔案:', manifestPath);
    process.exit(1);
  }
  const manifest = JSON.parse(fs.readFileSync(manifestPath, 'utf8'));
  const items = manifest.items;
  if (!Array.isArray(items) || items.length === 0) {
    console.error('manifest.items 為空或不存在');
    process.exit(1);
  }
  const firstFile = items[0].file || items[0].path;
  if (!firstFile) {
    console.error('manifest 第一筆缺少 file');
    process.exit(1);
  }
  const unitPath = path.join(path.dirname(manifestPath), firstFile);
  if (!fs.existsSync(unitPath)) {
    console.error('單元檔不存在:', unitPath);
    process.exit(1);
  }
  const data = JSON.parse(fs.readFileSync(unitPath, 'utf8'));
  if (!data.meta || !Array.isArray(data.questions)) {
    console.error('單元檔缺少 meta 或 questions');
    process.exit(1);
  }
  if (!metaMatchesUi(data.meta, SAMPLE.grade, SAMPLE.semester, SAMPLE.uiSubject, SAMPLE.uiPublisher)) {
    console.error('metaMatchesUi 未通過', { meta: data.meta, SAMPLE });
    process.exit(1);
  }
  console.log('verify_legacy_question_bank: OK', {
    manifest: SAMPLE.relManifest,
    unit: path.relative(repoRoot, unitPath),
    questionCount: data.questions.length
  });
}

main();
