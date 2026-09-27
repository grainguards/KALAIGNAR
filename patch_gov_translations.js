const fs = require('fs');
const file = 'apps/mobile/src/i18n/useTranslation.ts';
let code = fs.readFileSync(file, 'utf8');

const newTranslations = {
  hi: {
    'Gov Schemes': 'सरकारी योजनाएं',
    'Government Benefits': 'सरकारी लाभ',
    'Discover subsidies, loans, and support schemes for your business.': 'अपने व्यवसाय के लिए सब्सिडी, ऋण और समर्थन योजनाएं खोजें।',
    'Find Schemes For Me': 'मेरे लिए योजनाएं खोजें',
    'AI will match schemes based on your profile.': 'AI आपकी प्रोफ़ाइल के आधार पर योजनाओं का मिलान करेगा।',
    'Available Schemes': 'उपलब्ध योजनाएं',
    'Verified': 'सत्यापित',
    'Eligibility:': 'पात्रता:',
    'Benefits:': 'लाभ:',
    'Apply Now': 'अभी आवेदन करें',
    'Cannot open the link at this time.': 'इस समय लिंक नहीं खोला जा सकता।'
  },
  ta: {
    'Gov Schemes': 'அரசு திட்டங்கள்',
    'Government Benefits': 'அரசு நன்மைகள்',
    'Discover subsidies, loans, and support schemes for your business.': 'உங்கள் வணிகத்திற்கான மானியங்கள், கடன்கள் மற்றும் ஆதரவு திட்டங்களைக் கண்டறியவும்.',
    'Find Schemes For Me': 'எனக்கான திட்டங்களைக் கண்டறி',
    'AI will match schemes based on your profile.': 'AI உங்கள் சுயவிவரத்தின் அடிப்படையில் திட்டங்களை பொருத்தும்.',
    'Available Schemes': 'கிடைக்கும் திட்டங்கள்',
    'Verified': 'சரிபார்க்கப்பட்டது',
    'Eligibility:': 'தகுதி:',
    'Benefits:': 'நன்மைகள்:',
    'Apply Now': 'இப்போது விண்ணப்பிக்கவும்',
    'Cannot open the link at this time.': 'தற்போது இணைப்பை திறக்க முடியாது.'
  },
  te: {
    'Gov Schemes': 'ప్రభుత్వ పథకాలు',
    'Government Benefits': 'ప్రభుత్వ ప్రయోజనాలు',
    'Discover subsidies, loans, and support schemes for your business.': 'మీ వ్యాపారం కోసం సబ్సిడీలు, రుణాలు మరియు మద్దతు పథకాలను కనుగొనండి.',
    'Find Schemes For Me': 'నా కోసం పథకాలను కనుగొనండి',
    'AI will match schemes based on your profile.': 'AI మీ ప్రొఫైల్ ఆధారంగా పథకాలను సరిపోలుస్తుంది.',
    'Available Schemes': 'అందుబాటులో ఉన్న పథకాలు',
    'Verified': 'ధృవీకరించబడింది',
    'Eligibility:': 'అర్హత:',
    'Benefits:': 'ప్రయోజనాలు:',
    'Apply Now': 'ఇప్పుడే దరఖాస్తు చేసుకోండి',
    'Cannot open the link at this time.': 'ప్రస్తుతం లింక్‌ను తెరవలేము.'
  }
};

let outputCode = code;
for (const [lang, translations] of Object.entries(newTranslations)) {
  for (const [key, val] of Object.entries(translations)) {
    const safeKey = key.replace(/'/g, "\\'");
    const safeVal = val.replace(/'/g, "\\'");
    const langRegex = new RegExp(`(${lang}: \\{[\\s\\S]*?)(\\n  \\},|\\n  \\}\\n\\};)`, 'g');
    outputCode = outputCode.replace(langRegex, `$1,\n    '${safeKey}': '${safeVal}'$2`);
  }
}

fs.writeFileSync(file, outputCode);
console.log("Translations successfully updated.");
