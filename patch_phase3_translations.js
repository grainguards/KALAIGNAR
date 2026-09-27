const fs = require('fs');
const file = 'apps/mobile/src/i18n/useTranslation.ts';
let code = fs.readFileSync(file, 'utf8');

const newTranslations = {
  hi: {
    'Growth Studio': 'ग्रोथ स्टूडियो',
    'Brand Studio': 'ब्रांड स्टूडियो',
    'Social Media': 'सोशल मीडिया',
    'AI will generate a professional brand identity for your business.': 'AI आपके व्यवसाय के लिए एक पेशेवर ब्रांड पहचान उत्पन्न करेगा।',
    'Business Name': 'व्यापार का नाम',
    'e.g. Madurai Weavers': 'उदा. मदुरै बुनकर',
    'Craft Category': 'शिल्प श्रेणी',
    'e.g. Handloom Silk': 'उदा. हथकरघा रेशम',
    'Generate Brand Assets': 'ब्रांड एसेट्स जेनरेट करें',
    'Your Brand Concept': 'आपका ब्रांड कॉन्सेप्ट',
    'Brand Colors': 'ब्रांड रंग',
    'Recommended Typography': 'अनुशंसित टाइपोग्राफी',
    'Let AI write viral captions and find the best hashtags for your products.': 'AI को आपके उत्पादों के लिए वायरल कैप्शन और बेहतरीन हैशटैग खोजने दें।',
    'What are you selling?': 'आप क्या बेच रहे हैं?',
    'e.g. A handmade wooden elephant toy painted with natural colors...': 'उदा. प्राकृतिक रंगों से रंगा हुआ हस्तनिर्मित लकड़ी का हाथी का खिलौना...',
    'Generate Viral Post': 'वायरल पोस्ट जेनरेट करें',
    'Ready to Post': 'पोस्ट करने के लिए तैयार',
    'Caption': 'कैप्शन',
    'Hashtags': 'हैशटैग',
    'Suggested Price Range': 'सुझाई गई कीमत सीमा',
    'Business Growth': 'व्यापार विकास',
    'Brand Studio & Social': 'ब्रांड स्टूडियो और सोशल',
    'Generate logos and viral social media posts instantly with AI.': 'AI के साथ तुरंत लोगो और वायरल सोशल मीडिया पोस्ट जनरेट करें।',
    'Crafting Heritage, Inspiring the World.': 'विरासत को गढ़ना, दुनिया को प्रेरित करना।'
  },
  ta: {
    'Growth Studio': 'வளர்ச்சி ஸ்டுடியோ',
    'Brand Studio': 'பிராண்ட் ஸ்டுடியோ',
    'Social Media': 'சமூக ஊடகம்',
    'AI will generate a professional brand identity for your business.': 'AI உங்கள் வணிகத்திற்கான தொழில்முறை பிராண்ட் அடையாளத்தை உருவாக்கும்.',
    'Business Name': 'வணிகப் பெயர்',
    'e.g. Madurai Weavers': 'உ.ம். மதுரை நெசவாளர்கள்',
    'Craft Category': 'கைவினை வகை',
    'e.g. Handloom Silk': 'உ.ம். கைத்தறி பட்டு',
    'Generate Brand Assets': 'பிராண்ட் சொத்துக்களை உருவாக்கு',
    'Your Brand Concept': 'உங்கள் பிராண்ட் கருத்து',
    'Brand Colors': 'பிராண்ட் நிறங்கள்',
    'Recommended Typography': 'பரிந்துரைக்கப்படும் அச்சுக்கலை',
    'Let AI write viral captions and find the best hashtags for your products.': 'AI வைரலான தலைப்புகளை எழுதட்டும் மற்றும் உங்கள் தயாரிப்புகளுக்கு சிறந்த ஹேஷ்டேக்குகளைக் கண்டறியட்டும்.',
    'What are you selling?': 'நீங்கள் என்ன விற்கிறீர்கள்?',
    'e.g. A handmade wooden elephant toy painted with natural colors...': 'உ.ம். இயற்கை வண்ணங்களால் வர்ணம் பூசப்பட்ட மரத்தாலான யானை பொம்மை...',
    'Generate Viral Post': 'வைரல் பதிவை உருவாக்கு',
    'Ready to Post': 'பதிவிட தயார்',
    'Caption': 'தலைப்பு',
    'Hashtags': 'ஹேஷ்டேக்குகள்',
    'Suggested Price Range': 'பரிந்துரைக்கப்பட்ட விலை வரம்பு',
    'Business Growth': 'வணிக வளர்ச்சி',
    'Brand Studio & Social': 'பிராண்ட் ஸ்டுடியோ & சோஷியல்',
    'Generate logos and viral social media posts instantly with AI.': 'AI மூலம் லோகோக்கள் மற்றும் வைரலான சமூக ஊடக இடுகைகளை உடனடியாக உருவாக்கவும்.',
    'Crafting Heritage, Inspiring the World.': 'பாரம்பரியத்தை உருவாக்குதல், உலகை ஊக்குவித்தல்.'
  },
  te: {
    'Growth Studio': 'గ్రోత్ స్టూడియో',
    'Brand Studio': 'బ్రాండ్ స్టూడియో',
    'Social Media': 'సోషల్ మీడియా',
    'AI will generate a professional brand identity for your business.': 'AI మీ వ్యాపారం కోసం ప్రొఫెషనల్ బ్రాండ్ గుర్తింపును సృష్టిస్తుంది.',
    'Business Name': 'వ్యాపారం పేరు',
    'e.g. Madurai Weavers': 'ఉదా. మదురై వీవర్స్',
    'Craft Category': 'క్రాఫ్ట్ వర్గం',
    'e.g. Handloom Silk': 'ఉదా. చేనేత పట్టు',
    'Generate Brand Assets': 'బ్రాండ్ ఆస్తులను సృష్టించండి',
    'Your Brand Concept': 'మీ బ్రాండ్ కాన్సెప్ట్',
    'Brand Colors': 'బ్రాండ్ రంగులు',
    'Recommended Typography': 'సిఫార్సు చేయబడిన టైపోగ్రఫీ',
    'Let AI write viral captions and find the best hashtags for your products.': 'మీ ఉత్పత్తుల కోసం వైరల్ శీర్షికలను వ్రాయడానికి మరియు ఉత్తమ హ్యాష్‌ట్యాగ్‌లను కనుగొనడానికి AIని అనుమతించండి.',
    'What are you selling?': 'మీరు ఏమి విక్రయిస్తున్నారు?',
    'e.g. A handmade wooden elephant toy painted with natural colors...': 'ఉదా. సహజ రంగులతో చిత్రించిన చేతితో తయారు చేసిన చెక్క ఏనుగు బొమ్మ...',
    'Generate Viral Post': 'వైరల్ పోస్ట్‌ను సృష్టించండి',
    'Ready to Post': 'పోస్ట్ చేయడానికి సిద్ధంగా ఉంది',
    'Caption': 'శీర్షిక',
    'Hashtags': 'హ్యాష్‌ట్యాగ్‌లు',
    'Suggested Price Range': 'సూచించబడిన ధర పరిధి',
    'Business Growth': 'వ్యాపార వృద్ధి',
    'Brand Studio & Social': 'బ్రాండ్ స్టూడియో & సోషల్',
    'Generate logos and viral social media posts instantly with AI.': 'AIతో లోగోలు మరియు వైరల్ సోషల్ మీడియా పోస్ట్‌లను తక్షణమే సృష్టించండి.',
    'Crafting Heritage, Inspiring the World.': 'వారసత్వాన్ని రూపొందించడం, ప్రపంచాన్ని ప్రేరేపించడం.'
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
console.log("Phase 3 Translations successfully updated.");
