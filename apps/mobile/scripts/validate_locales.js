const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');
const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf-8'));

const languages = [
  { code: 'en', name: 'English' },
  { code: 'ta', name: 'Tamil' },
  { code: 'hi', name: 'Hindi' },
  { code: 'bn', name: 'Bengali' },
  { code: 'te', name: 'Telugu' },
  { code: 'mr', name: 'Marathi' },
  { code: 'gu', name: 'Gujarati' },
  { code: 'kn', name: 'Kannada' },
  { code: 'ml', name: 'Malayalam' },
  { code: 'pa', name: 'Punjabi' }
];

function getAllKeys(obj, prefix = '') {
  let keys = [];
  for (const k in obj) {
    const fullKey = prefix ? `${prefix}.${k}` : k;
    if (typeof obj[k] === 'object' && obj[k] !== null && !Array.isArray(obj[k])) {
      keys = keys.concat(getAllKeys(obj[k], fullKey));
    } else {
      keys.push(fullKey);
    }
  }
  return keys;
}

const enKeys = getAllKeys(en);
console.log('='.repeat(60));
console.log(`MASTER LOCALIZATION AUDIT: ${enKeys.length} keys in English`);
console.log('='.repeat(60));

let totalErrors = 0;

languages.forEach(lang => {
  const filePath = path.join(localesDir, `${lang.code}.json`);
  if (!fs.existsSync(filePath)) {
    console.error(`❌ [${lang.name}]: Missing file ${lang.code}.json`);
    totalErrors++;
    return;
  }
  const content = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const langKeys = new Set(getAllKeys(content));

  const missing = [];
  enKeys.forEach(k => {
    if (!langKeys.has(k)) {
      missing.push(k);
    }
  });

  if (missing.length === 0) {
    console.log(`✅ [${lang.name.padEnd(10)}] (${lang.code}): ${langKeys.size} / ${enKeys.length} keys (100% Complete)`);
  } else {
    console.error(`❌ [${lang.name}] (${lang.code}): Missing ${missing.length} keys:`);
    missing.slice(0, 5).forEach(m => console.error(`   - Missing key: ${m}`));
    totalErrors += missing.length;
  }
});

console.log('='.repeat(60));
if (totalErrors === 0) {
  console.log('🎉 ALL 10 INDIAN LANGUAGES HAVE 100% COMPLETE PARITY WITH ZERO MISSING KEYS!');
  process.exit(0);
} else {
  console.error(`💥 Localization validation failed with ${totalErrors} missing keys.`);
  process.exit(1);
}
