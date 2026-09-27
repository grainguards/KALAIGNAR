const fs = require('fs');
const file = 'apps/mobile/src/i18n/useTranslation.ts';
let code = fs.readFileSync(file, 'utf8');

const newTranslations = {
  hi: {
    'Supply Chain': 'आपूर्ति श्रृंखला',
    'Buy Raw Materials': 'कच्चा माल खरीदें',
    'Compare wholesale prices for cotton, silk, clay, and wood.': 'कपास, रेशम, मिट्टी और लकड़ी के थोक मूल्यों की तुलना करें।',
    'Raw Materials': 'कच्चा माल',
    'Compare prices from verified suppliers and buy raw materials directly.': 'सत्यापित आपूर्तिकर्ताओं से कीमतों की तुलना करें और सीधे खरीदें।',
    'Textiles': 'कपड़ा',
    'Raw Cotton Yarn (40s)': 'कच्चा सूत (40s)',
    'Mulberry Silk Thread': 'शहतूत रेशम धागा',
    'Pottery': 'मिट्टी के बर्तन',
    'Terracotta Craft Clay': 'टेराकोटा शिल्प मिट्टी',
    'Woodwork': 'लकड़ी का काम',
    'Premium Teak Wood Blocks': 'प्रीमियम सागौन लकड़ी ब्लॉक',
    'Compare Suppliers': 'आपूर्तिकर्ताओं की तुलना करें',
    'Order': 'ऑर्डर करें',
    'Coimbatore': 'कोयंबटूर',
    'Surat': 'सूरत',
    'Madurai': 'मदुरै',
    'Kanchipuram': 'कांचीपुरम',
    'Mysore': 'मैसूर',
    'Pune': 'पुणे',
    'Mumbai': 'मुंबई',
    'Kochi': 'कोच्चि',
    'Nagpur': 'नागपुर'
  },
  ta: {
    'Supply Chain': 'விநியோக சங்கிலி',
    'Buy Raw Materials': 'மூலப்பொருட்களை வாங்குங்கள்',
    'Compare wholesale prices for cotton, silk, clay, and wood.': 'பருத்தி, பட்டு, களிமண் மற்றும் மரத்திற்கான மொத்த விலைகளை ஒப்பிடவும்.',
    'Raw Materials': 'மூலப்பொருட்கள்',
    'Compare prices from verified suppliers and buy raw materials directly.': 'சரிபார்க்கப்பட்ட சப்ளையர்களிடமிருந்து விலைகளை ஒப்பிட்டு நேரடியாக வாங்கவும்.',
    'Textiles': 'ஜவுளி',
    'Raw Cotton Yarn (40s)': 'மூல பருத்தி நூல் (40s)',
    'Mulberry Silk Thread': 'மல்பெரி பட்டு நூல்',
    'Pottery': 'மட்பாண்டங்கள்',
    'Terracotta Craft Clay': 'டெரகோட்டா களிமண்',
    'Woodwork': 'மரவேலை',
    'Premium Teak Wood Blocks': 'தேக்கு மரத் தொகுதிகள்',
    'Compare Suppliers': 'சப்ளையர்களை ஒப்பிடுக',
    'Order': 'ஆர்டர்',
    'Coimbatore': 'கோயம்புத்தூர்',
    'Surat': 'சூரத்',
    'Madurai': 'மதுரை',
    'Kanchipuram': 'காஞ்சிபுரம்',
    'Mysore': 'மைசூர்',
    'Pune': 'புனே',
    'Mumbai': 'மும்பை',
    'Kochi': 'கொச்சி',
    'Nagpur': 'நாக்பூர்'
  },
  te: {
    'Supply Chain': 'సరఫరా గొలుసు',
    'Buy Raw Materials': 'ముడి పదార్థాలను కొనండి',
    'Compare wholesale prices for cotton, silk, clay, and wood.': 'పత్తి, పట్టు, మట్టి మరియు కలప టోకు ధరలను సరిపోల్చండి.',
    'Raw Materials': 'ముడి పదార్థాలు',
    'Compare prices from verified suppliers and buy raw materials directly.': 'సరఫరాదారుల నుండి ధరలను సరిపోల్చండి మరియు నేరుగా కొనండి.',
    'Textiles': 'వస్త్రాలు',
    'Raw Cotton Yarn (40s)': 'ముడి పత్తి నూలు (40s)',
    'Mulberry Silk Thread': 'మల్బరీ పట్టు దారం',
    'Pottery': 'కుండలు',
    'Terracotta Craft Clay': 'టెర్రకోట మట్టి',
    'Woodwork': 'చెక్క పని',
    'Premium Teak Wood Blocks': 'ప్రీమియం టేకు కలప బ్లాక్స్',
    'Compare Suppliers': 'సరఫరాదారులను సరిపోల్చండి',
    'Order': 'ఆర్డర్ చేయండి',
    'Coimbatore': 'కోయంబత్తూరు',
    'Surat': 'సూరత్',
    'Madurai': 'మదురై',
    'Kanchipuram': 'కంచి',
    'Mysore': 'మైసూర్',
    'Pune': 'పూణే',
    'Mumbai': 'ముంబై',
    'Kochi': 'కొచ్చి',
    'Nagpur': 'నాగ్‌పూర్'
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
console.log("Phase 2 Translations successfully updated.");
