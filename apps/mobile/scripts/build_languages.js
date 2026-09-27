const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');
const en = JSON.parse(fs.readFileSync(path.join(localesDir, 'en.json'), 'utf-8'));

function validateAndSave(langCode, dict) {
  const result = {};
  let count = 0;
  for (const section in en) {
    if (!dict[section]) {
      throw new Error(`[${langCode}] Missing section "${section}"`);
    }
    result[section] = {};
    for (const key in en[section]) {
      if (dict[section][key] === undefined || dict[section][key] === null) {
        throw new Error(`[${langCode}] Missing key "${section}.${key}"`);
      }
      result[section][key] = dict[section][key];
      count++;
    }
  }
  const targetPath = path.join(localesDir, `${langCode}.json`);
  fs.writeFileSync(targetPath, JSON.stringify(result, null, 2), 'utf-8');
  console.log(`[${langCode}] Successfully generated ${count} keys to ${langCode}.json`);
}

// 1. Bengali
const bn = require('./data/bn_data');
validateAndSave('bn', bn);

// 2. Hindi
const hi = require('./data/hi_data');
validateAndSave('hi', hi);

// 3. Telugu
const te = require('./data/te_data');
validateAndSave('te', te);

// 4. Marathi
const mr = require('./data/mr_data');
validateAndSave('mr', mr);

// 5. Gujarati
const gu = require('./data/gu_data');
validateAndSave('gu', gu);

// 6. Kannada
const kn = require('./data/kn_data');
validateAndSave('kn', kn);

// 7. Malayalam
const ml = require('./data/ml_data');
validateAndSave('ml', ml);

// 8. Punjabi
const pa = require('./data/pa_data');
validateAndSave('pa', pa);

console.log('ALL LOCALES BUILT SUCCESSFULLY!');
