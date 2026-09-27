const fs = require('fs');
const file = 'apps/mobile/src/i18n/useTranslation.ts';
let code = fs.readFileSync(file, 'utf8');

const newTranslations = {
  hi: {
    'Network & Market': 'नेटवर्क और बाजार',
    'Community & Insights': 'समुदाय और अंतर्दृष्टि',
    'Connect with artisans and view local market trends.': 'कारीगरों से जुड़ें और स्थानीय बाजार के रुझान देखें।',
    'Market Intelligence': 'बाजार खुफिया',
    'Artisan Community': 'कारीगर समुदाय',
    'AI-driven insights for your local market.': 'आपके स्थानीय बाजार के लिए AI-संचालित अंतर्दृष्टि।',
    'Analyzing trends in:': 'रुझानों का विश्लेषण:',
    'Trending Products': 'ट्रेंडिंग उत्पाद',
    'Eco-friendly packaging and personalized handmade gifts are seeing a 40% increase in local search volume.': 'इको-फ्रेंडली पैकेजिंग और व्यक्तिगत हस्तनिर्मित उपहारों में स्थानीय खोज मात्रा में 40% की वृद्धि देखी जा रही है।',
    'Eco-Friendly': 'इको-फ्रेंडली',
    'Customized Gifts': 'कस्टमाइज्ड गिफ्ट्स',
    'Festival Decor': 'त्योहार की सजावट',
    'Target Customer Groups': 'लक्षित ग्राहक समूह',
    'Based on your craft category, these groups have the highest purchase intent right now:': 'आपकी शिल्प श्रेणी के आधार पर, इन समूहों का अभी सबसे अधिक खरीदारी का इरादा है:',
    'Local Tourist Boutiques': 'स्थानीय पर्यटक बुटीक',
    'Heritage Hotels': 'विरासत होटल',
    'Wedding Planners': 'वेडिंग प्लानर्स',
    'AI Strategy Recommendation': 'AI रणनीति की सिफारिश',
    'Consider partnering with nearby hotels in Madurai to showcase your textile products in their lobbies.': 'अपनी कपड़ा उत्पादों को उनकी लॉबी में प्रदर्शित करने के लिए मदुरै के पास के होटलों के साथ साझेदारी करने पर विचार करें।',
    'Connect, learn, and collaborate with thousands of artisans.': 'हजारों कारीगरों के साथ जुड़ें, सीखें और सहयोग करें।',
    'Ask a question or share an update...': 'कोई प्रश्न पूछें या कोई अपडेट साझा करें...',
    'Likes': 'पसंद',
    'Comments': 'टिप्पणियां',
    'Share': 'साझा करें',
    'Just finished a beautiful batch of 50 pure silk sarees for the upcoming festival season. Looking for B2B buyers in North India!': 'आने वाले त्योहारी सीजन के लिए 50 शुद्ध रेशम साड़ियों का एक सुंदर बैच अभी पूरा किया है। उत्तर भारत में B2B खरीदारों की तलाश है!',
    'Does anyone know a reliable supplier for premium teak wood near Mysore? The prices have gone up locally.': 'क्या कोई मैसूर के पास प्रीमियम सागौन की लकड़ी के लिए एक विश्वसनीय आपूर्तिकर्ता जानता है? स्थानीय स्तर पर कीमतें बढ़ गई हैं।',
    'I highly recommend applying for the PM Vishwakarma scheme! I just received my toolkit incentive and it was a very smooth process.': 'मैं पीएम विश्वकर्मा योजना के लिए आवेदन करने की अत्यधिक सलाह देता हूं! मुझे अभी अपना टूलकिट प्रोत्साहन मिला है और यह एक बहुत ही आसान प्रक्रिया थी।',
    'Kanchipuram, TN': 'कांचीपुरम, टीएन',
    'Mysore, KA': 'मैसूर, केए',
    'Pune, MH': 'पुणे, एमएच',
    '2 hours ago': '2 घंटे पहले',
    '5 hours ago': '5 घंटे पहले',
    '1 day ago': '1 दिन पहले'
  },
  ta: {
    'Network & Market': 'நெட்வொர்க் & சந்தை',
    'Community & Insights': 'சமூகமும் நுண்ணறிவுகளும்',
    'Connect with artisans and view local market trends.': 'கைவினைஞர்களுடன் இணைந்து உள்ளூர் சந்தை போக்குகளைக் காணவும்.',
    'Market Intelligence': 'சந்தை நுண்ணறிவு',
    'Artisan Community': 'கைவினைஞர் சமூகம்',
    'AI-driven insights for your local market.': 'உங்கள் உள்ளூர் சந்தைக்கான AI-உந்துதல் நுண்ணறிவுகள்.',
    'Analyzing trends in:': 'போக்குகள் பகுப்பாய்வு:',
    'Trending Products': 'பிரபலமான தயாரிப்புகள்',
    'Eco-friendly packaging and personalized handmade gifts are seeing a 40% increase in local search volume.': 'சூழல் நட்பு பேக்கேஜிங் மற்றும் தனிப்பயனாக்கப்பட்ட கையால் செய்யப்பட்ட பரிசுகள் உள்ளூர் தேடல் அளவுகளில் 40% அதிகரிப்பைக் காண்கின்றன.',
    'Eco-Friendly': 'சூழல் நட்பு',
    'Customized Gifts': 'தனிப்பயனாக்கப்பட்ட பரிசுகள்',
    'Festival Decor': 'பண்டிகை அலங்காரம்',
    'Target Customer Groups': 'இலக்கு வாடிக்கையாளர் குழுக்கள்',
    'Based on your craft category, these groups have the highest purchase intent right now:': 'உங்கள் கைவினை வகையின் அடிப்படையில், இந்த குழுக்கள் தற்போது அதிக கொள்முதல் நோக்கத்தைக் கொண்டுள்ளன:',
    'Local Tourist Boutiques': 'உள்ளூர் சுற்றுலா பூட்டிக்குகள்',
    'Heritage Hotels': 'பாரம்பரிய ஹோட்டல்கள்',
    'Wedding Planners': 'திருமண திட்டமிடுபவர்கள்',
    'AI Strategy Recommendation': 'AI உத்தி பரிந்துரை',
    'Consider partnering with nearby hotels in Madurai to showcase your textile products in their lobbies.': 'மதுரையில் உள்ள அருகிலுள்ள ஹோட்டல்களுடன் இணைந்து உங்கள் ஜவுளிப் பொருட்களை அவர்களின் லாபிகளில் காட்சிப்படுத்துவதைக் கவனியுங்கள்.',
    'Connect, learn, and collaborate with thousands of artisans.': 'ஆயிரக்கணக்கான கைவினைஞர்களுடன் இணையுங்கள், கற்றுக் கொள்ளுங்கள் மற்றும் ஒத்துழைக்கவும்.',
    'Ask a question or share an update...': 'ஒரு கேள்வியைக் கேளுங்கள் அல்லது புதுப்பிப்பைப் பகிரவும்...',
    'Likes': 'விருப்பங்கள்',
    'Comments': 'கருத்துகள்',
    'Share': 'பகிரவும்',
    'Just finished a beautiful batch of 50 pure silk sarees for the upcoming festival season. Looking for B2B buyers in North India!': 'வரவிருக்கும் பண்டிகை காலத்திற்காக 50 தூய பட்டு புடவைகளின் அழகான தொகுப்பை முடித்தேன். வட இந்தியாவில் B2B வாங்குபவர்களை தேடுகிறேன்!',
    'Does anyone know a reliable supplier for premium teak wood near Mysore? The prices have gone up locally.': 'மைசூர் அருகே பிரீமியம் தேக்கு மரத்திற்கு நம்பகமான சப்ளையர் யாராவது தெரியுமா? உள்ளூரில் விலை உயர்ந்துள்ளது.',
    'I highly recommend applying for the PM Vishwakarma scheme! I just received my toolkit incentive and it was a very smooth process.': 'பிரதமர் விஸ்வகர்மா திட்டத்திற்கு விண்ணப்பிக்க நான் மிகவும் பரிந்துரைக்கிறேன்! நான் எனது கருவித்தொகுப்பு ஊக்கத்தொகையைப் பெற்றேன், அது மிகவும் மென்மையான செயல்முறையாக இருந்தது.',
    'Kanchipuram, TN': 'காஞ்சிபுரம், TN',
    'Mysore, KA': 'மைசூர், KA',
    'Pune, MH': 'புனே, MH',
    '2 hours ago': '2 மணி நேரத்திற்கு முன்பு',
    '5 hours ago': '5 மணி நேரத்திற்கு முன்பு',
    '1 day ago': '1 நாள் முன்பு'
  },
  te: {
    'Network & Market': 'నెట్‌వర్క్ & మార్కెట్',
    'Community & Insights': 'కమ్యూనిటీ & అంతర్దృష్టులు',
    'Connect with artisans and view local market trends.': 'కళాకారులతో కనెక్ట్ అవ్వండి మరియు స్థానిక మార్కెట్ ట్రెండ్‌లను వీక్షించండి.',
    'Market Intelligence': 'మార్కెట్ ఇంటెలిజెన్స్',
    'Artisan Community': 'కళాకారుల సంఘం',
    'AI-driven insights for your local market.': 'మీ స్థానిక మార్కెట్ కోసం AI-ఆధారిత అంతర్దృష్టులు.',
    'Analyzing trends in:': 'ట్రెండ్‌ల విశ్లేషణ:',
    'Trending Products': 'ట్రెండింగ్ ఉత్పత్తులు',
    'Eco-friendly packaging and personalized handmade gifts are seeing a 40% increase in local search volume.': 'పర్యావరణ అనుకూల ప్యాకేజింగ్ మరియు వ్యక్తిగతీకరించిన చేతితో తయారు చేసిన బహుమతులు స్థానిక శోధన పరిమాణంలో 40% పెరుగుదలను చూస్తున్నాయి.',
    'Eco-Friendly': 'పర్యావరణ అనుకూలమైనది',
    'Customized Gifts': 'అనుకూలీకరించిన బహుమతులు',
    'Festival Decor': 'పండుగ అలంకరణ',
    'Target Customer Groups': 'లక్ష్య కస్టమర్ సమూహాలు',
    'Based on your craft category, these groups have the highest purchase intent right now:': 'మీ క్రాఫ్ట్ వర్గం ఆధారంగా, ఈ సమూహాలు ప్రస్తుతం అత్యధిక కొనుగోలు ఉద్దేశ్యాన్ని కలిగి ఉన్నాయి:',
    'Local Tourist Boutiques': 'స్థానిక పర్యాటక బోటిక్‌లు',
    'Heritage Hotels': 'హెరిటేజ్ హోటల్స్',
    'Wedding Planners': 'వెడ్డింగ్ ప్లానర్స్',
    'AI Strategy Recommendation': 'AI వ్యూహ సిఫార్సు',
    'Consider partnering with nearby hotels in Madurai to showcase your textile products in their lobbies.': 'మీ వస్త్ర ఉత్పత్తులను వారి లాబీలలో ప్రదర్శించడానికి మదురైలోని సమీప హోటళ్లతో భాగస్వామ్యం చేయడాన్ని పరిగణించండి.',
    'Connect, learn, and collaborate with thousands of artisans.': 'వేలాది మంది కళాకారులతో కనెక్ట్ అవ్వండి, నేర్చుకోండి మరియు సహకరించండి.',
    'Ask a question or share an update...': 'ఒక ప్రశ్న అడగండి లేదా నవీకరణను భాగస్వామ్యం చేయండి...',
    'Likes': 'ఇష్టాలు',
    'Comments': 'వ్యాఖ్యలు',
    'Share': 'షేర్ చేయండి',
    'Just finished a beautiful batch of 50 pure silk sarees for the upcoming festival season. Looking for B2B buyers in North India!': 'రాబోయే పండుగ సీజన్ కోసం 50 స్వచ్ఛమైన పట్టు చీరల అందమైన బ్యాచ్‌ని ఇప్పుడే పూర్తి చేసాను. ఉత్తర భారతదేశంలో B2B కొనుగోలుదారుల కోసం వెతుకుతున్నాను!',
    'Does anyone know a reliable supplier for premium teak wood near Mysore? The prices have gone up locally.': 'మైసూర్ సమీపంలో ప్రీమియం టేకు కలప కోసం నమ్మదగిన సరఫరాదారు ఎవరికైనా తెలుసా? స్థానికంగా ధరలు పెరిగాయి.',
    'I highly recommend applying for the PM Vishwakarma scheme! I just received my toolkit incentive and it was a very smooth process.': 'నేను PM విశ్వకర్మ పథకానికి దరఖాస్తు చేసుకోవాలని బాగా సిఫార్సు చేస్తున్నాను! నేను నా టూల్‌కిట్ ప్రోత్సాహకాన్ని ఇప్పుడే అందుకున్నాను మరియు ఇది చాలా సున్నితమైన ప్రక్రియ.',
    'Kanchipuram, TN': 'కంచి, TN',
    'Mysore, KA': 'మైసూర్, KA',
    'Pune, MH': 'పూణే, MH',
    '2 hours ago': '2 గంటల క్రితం',
    '5 hours ago': '5 గంటల క్రితం',
    '1 day ago': '1 రోజు క్రితం'
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
console.log("Phase 4 Translations successfully updated.");
