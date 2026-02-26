import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PLATFORM_DIR = path.join(__dirname, 'question', 'platform');

const grade = '3';
const subject = 'SocialStudies';
const semester = '2';
const publisher = 'KangHsuan';
const publisherCode = 'kang_hsuan'; // PUBLISHER_META_MAP['康軒']

const basePath = path.join(PLATFORM_DIR, `G${grade}`, subject, `S${semester}`, publisher);
console.log('Testing basePath:', basePath);

const manifestPath = path.join(basePath, 'manifest.json');
const manifestStr = fs.readFileSync(manifestPath, 'utf8');
const manifest = JSON.parse(manifestStr);

console.log('Manifest parsed. Units/items length:', manifest.items?.length || manifest.units?.length);

const items = manifest.items || manifest.units;
let totalQs = 0;

items.forEach((item, idx) => {
    const file = item.file || item.path;
    const content = JSON.parse(fs.readFileSync(path.join(basePath, file), 'utf8'));
    
    // Simulate loader logic
    const m = content.meta;
    let questions = [];
    if (m && Array.isArray(content.questions)) {
       console.log(`File ${file} meta publisher:`, m.publisher);
       if (m.publisher && m.publisher !== publisherCode && m.publisher !== '康軒' && m.publisher !== publisher) { // Add publisher (KangHsuan) to the check
           console.log(`--> Mismatch! Expected '${publisherCode}', '康軒', or '${publisher}', got '${m.publisher}'`);
           return;
       }
       questions = content.questions;
    }
    console.log(`File ${file} loaded ${questions.length} questions`);
    totalQs += questions.length;
});

console.log('Total questions simulated load:', totalQs);
