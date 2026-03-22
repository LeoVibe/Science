const fs = require('fs');
const path = require('path');

function loadGeminiKey() {
  const cfgPath = fs.existsSync(path.resolve(__dirname, '../../ApiKeys.cfg'))
    ? path.resolve(__dirname, '../../ApiKeys.cfg')
    : path.resolve(__dirname, '../ApiKeys.cfg');
  const lines = fs.readFileSync(cfgPath, 'utf8').split('\n');
  let key = null;
  lines.forEach(line => {
    const t = line.trim();
    if (!t || t.startsWith('#')) return;
    const [k, ...v] = t.split('=');
    if (k.trim() === 'GEMINI_API_KEY') key = v.join('=').trim().replace(/^['"]|['"]$/g, '');
  });
  return key;
}

async function listModels() {
  const apiKey = loadGeminiKey();
  const res = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${apiKey}`);
  const data = await res.json();
  const names = data.models.map(m => m.name).filter(n => n.includes('flash') || n.includes('pro'));
  console.log('可用模型:', names);
}

listModels();
