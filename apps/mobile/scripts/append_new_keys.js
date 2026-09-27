const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');

const additions = {
  en: {
    common: { today: "Today" },
    opportunities: {
      title: "Market Opportunity",
      subtitle: "Live corporate and retail procurement requirements intelligently matched to your craft.",
      viewAll: "VIEW ALL (7)",
      liveBidWar: "Live Bid War",
      buyerBudget: "Buyer Budget:",
      currentActiveBids: "Current Active Bids",
      artisanFromGujarat: "Artisan from Gujarat",
      studioInRajasthan: "Studio in Rajasthan (Lowest)",
      yourBidAmount: "Your Bid Amount (₹)",
      beat: "Beat ₹",
      winningBid: "You have the winning bid!",
      bidExceeds: "Bid exceeds buyer's budget!",
      beingOutbid: "You are being outbid!",
      estimatedDeliveryDays: "Estimated Delivery (Days)",
      placeBidNow: "PLACE BID NOW",
      bidSubmitted: "BID SUBMITTED",
      reviewAndBid: "REVIEW & BID",
      volume: "VOLUME",
      budget: "BUDGET"
    },
    settings: {
      accessibleLanguages: "Accessible in 10 Indian Languages"
    },
    roles: {
      switcherTitle: "Demo Role Switcher",
      switcherDesc: "Instantly toggle between app views for the hackathon presentation. Simulates logging in as different user types."
    },
    profile: {
      personalDetails: "Personal Details",
      orgName: "Organization Name",
      buyerType: "Buyer Type",
      headquarters: "Headquarters",
      department: "Department",
      designation: "Designation",
      jurisdiction: "Jurisdiction"
    },
    theme: {
      photoProtected: "Product craft photos & studio backdrops remain color-accurate and never dimmed.",
      appearance: "Appearance",
      theme: "Select theme mode",
      light: "Light",
      dark: "Dark",
      system: "System"
    },
    materials: {
      textiles: "Textiles & Handloom",
      pottery: "Pottery & Ceramics",
      woodwork: "Wood & Bamboo",
      jewelry: "Ethnic Jewelry"
    }
  },
  ta: {
    common: { today: "இன்று" },
    opportunities: {
      title: "சந்தை கொள்முதல் வாய்ப்புகள்",
      subtitle: "உங்கள் கைவினைப் பொருட்களுக்கு ஏற்ப பெருநிறுவனங்கள் மற்றும் சில்லறை கொள்முதல் கோரிக்கைகள்.",
      viewAll: "அனைத்தையும் காண்க (7)",
      liveBidWar: "நேரலை ஏலப் போட்டி",
      buyerBudget: "வாங்குபவர் வரவு செலவு:",
      currentActiveBids: "தற்போதைய செயலில் உள்ள ஏலங்கள்",
      artisanFromGujarat: "குஜராத் கைவினைஞர்",
      studioInRajasthan: "ராஜஸ்தான் ஸ்டுடியோ (குறைந்த விலை)",
      yourBidAmount: "உங்கள் ஏலத் தொகை (₹)",
      beat: "விட குறைவான ஏலம் ₹",
      winningBid: "நீங்கள் வெற்றி பெறும் ஏலத்தை வைத்துள்ளீர்கள்!",
      bidExceeds: "ஏலம் வாங்குபவரின் வரவு செலவை விட அதிகம்!",
      beingOutbid: "மற்றொருவர் உங்களை விட குறைந்த ஏலம் வைத்துள்ளார்!",
      estimatedDeliveryDays: "மதிப்பிடப்பட்ட டெலிவரி (நாட்கள்)",
      placeBidNow: "இப்போதே ஏலம் கோருங்கள்",
      bidSubmitted: "ஏலம் சமர்ப்பிக்கப்பட்டது",
      reviewAndBid: "மதிப்பாய்வு செய்து ஏலம் இடுங்கள்",
      volume: "அளவு",
      budget: "மதிப்பீடு"
    },
    settings: {
      accessibleLanguages: "10 இந்திய மொழிகளில் கிடைக்கிறது"
    },
    roles: {
      switcherTitle: "டெமோ பயனர் பங்கு மாற்றி",
      switcherDesc: "ஹேக்கத்தான் விளக்கக்காட்சிக்காக வெவ்வேறு பயனர் பாத்திரங்களுக்கு உடனடியாக மாறவும்."
    },
    profile: {
      personalDetails: "தனிப்பட்ட விவரங்கள்",
      orgName: "நிறுவனத்தின் பெயர்",
      buyerType: "வாங்குபவர் வகை",
      headquarters: "தலைமையகம்",
      department: "துறை",
      designation: "பதவி",
      jurisdiction: "அதிகார வரம்பு"
    },
    theme: {
      photoProtected: "கைவினைப் புகைப்படங்கள் மற்றும் ஸ்டுடியோ பின்னணிகள் எப்போதும் இயற்கை வண்ணத்தில் துல்லியமாக இருக்கும்.",
      appearance: "தோற்றம்",
      theme: "வண்ண தீம் தேர்ந்தெடுக்கவும்",
      light: "வெளிச்சம்",
      dark: "இருள்",
      system: "கணினி அமைப்பு"
    },
    materials: {
      textiles: "ஜவுளி மற்றும் கைத்தறி",
      pottery: "மண்பாண்டம் மற்றும் சுடுமண்",
      woodwork: "மரம் மற்றும் மூங்கில்",
      jewelry: "பாரம்பரிய நகைகள்"
    }
  },
  hi: {
    common: { today: "आज" },
    opportunities: {
      title: "बाजार खरीद अवसर",
      subtitle: "कॉर्पोरेट और खुदरा खरीद आवश्यकताएं जो आपके शिल्प से मेल खाती हैं।",
      viewAll: "सभी देखें (7)",
      liveBidWar: "लाइव बोली मुकाबला",
      buyerBudget: "खरीदार का बजट:",
      currentActiveBids: "वर्तमान सक्रिय बोलियां",
      artisanFromGujarat: "गुजरात के कारीगर",
      studioInRajasthan: "राजस्थान स्टूडियो (न्यूनतम)",
      yourBidAmount: "आपकी बोली राशि (₹)",
      beat: "कम बोली लगाएं ₹",
      winningBid: "आपकी बोली सबसे आगे है!",
      bidExceeds: "बोली खरीदार के बजट से अधिक है!",
      beingOutbid: "कोई आपसे कम बोली लगा रहा है!",
      estimatedDeliveryDays: "अनुमानित डिलीवरी (दिन)",
      placeBidNow: "अभी बोली लगाएं",
      bidSubmitted: "बोली जमा हो गई",
      reviewAndBid: "समीक्षा करें और बोली लगाएं",
      volume: "मात्रा",
      budget: "बजट"
    },
    settings: {
      accessibleLanguages: "10 प्रमुख भारतीय भाषाओं में उपलब्ध"
    },
    roles: {
      switcherTitle: "डेमो भूमिका परिवर्तक",
      switcherDesc: "प्रस्तुति के लिए विभिन्न उपयोगकर्ता प्रकारों के बीच तुरंत स्विच करें।"
    },
    profile: {
      personalDetails: "व्यक्तिगत विवरण",
      orgName: "संस्था का नाम",
      buyerType: "खरीदार का प्रकार",
      headquarters: "मुख्यालय",
      department: "विभाग",
      designation: "पद",
      jurisdiction: "कार्यक्षेत्र"
    },
    theme: {
      photoProtected: "शिल्प उत्पाद फ़ोटो और स्टूडियो बैकड्रॉप हमेशा रंग-सटीक और स्पष्ट रहते हैं।",
      appearance: "दिखावट व थीम",
      theme: "थीम मोड चुनें",
      light: "लाइट",
      dark: "डार्क",
      system: "सिस्टम"
    },
    materials: {
      textiles: "वस्त्र और हथकरघा",
      pottery: "मिट्टी के बर्तन और टेराकोटा",
      woodwork: "लकड़ी और बांस",
      jewelry: "पारंपरिक आभूषण"
    }
  },
  bn: {
    common: { today: "আজ" },
    opportunities: {
      title: "বাজার সংগ্রহের সুযোগ",
      subtitle: "কর্পোরেট এবং খুচরা সংগ্রহের প্রয়োজনীয়তা যা আপনার শিল্পের সাথে মানানসই।",
      viewAll: "সব দেখুন (7)",
      liveBidWar: "সরাসরি দর কষাকষি",
      buyerBudget: "ক্রেতার বাজেট:",
      currentActiveBids: "বর্তমান সক্রিয় দর",
      artisanFromGujarat: "গুজরাটের কারিগর",
      studioInRajasthan: "রাজস্থান স্টুডিও (সর্বনিম্ন)",
      yourBidAmount: "আপনার দরের পরিমাণ (₹)",
      beat: "কম দর দিন ₹",
      winningBid: "আপনার দর সবার এগিয়ে রয়েছে!",
      bidExceeds: "দর ক্রেতার বাজেটের চেয়ে বেশি!",
      beingOutbid: "অন্য কেউ আপনার চেয়ে কম দর দিয়েছে!",
      estimatedDeliveryDays: "আনুমানিক ডেলিভারি (দিন)",
      placeBidNow: "এখনই দর দিন",
      bidSubmitted: "দর জমা দেওয়া হয়েছে",
      reviewAndBid: "পর্যালোচনা করুন এবং দর দিন",
      volume: "পরিমাণ",
      budget: "বাজেট"
    },
    settings: {
      accessibleLanguages: "১০টি ভারতীয় ভাষায় উপলভ্য"
    },
    roles: {
      switcherTitle: "ডেমো ভূমিকা পরিবর্তন",
      switcherDesc: "বিভিন্ন ব্যবহারকারীর ভূমিকার মধ্যে তাৎক্ষণিকভাবে পরিবর্তন করুন।"
    },
    profile: {
      personalDetails: "ব্যক্তিগত বিবরণ",
      orgName: "সংস্থার নাম",
      buyerType: "ক্রেতার ধরন",
      headquarters: "সদর দপ্তর",
      department: "বিভাগ",
      designation: "পদবী",
      jurisdiction: "অধিক্ষেত্র"
    },
    theme: {
      photoProtected: "হস্তশিল্পের ছবি এবং স্টুডিও ব্যাকড্রপ সর্বদা সঠিক রঙের ও স্পষ্ট থাকবে।",
      appearance: "রূপ ও থিম",
      theme: "থিম মোড বেছে নিন",
      light: "লাইট",
      dark: "ডার্ক",
      system: "সিস্টেম"
    },
    materials: {
      textiles: "বস্ত্র ও তাঁত",
      pottery: "মৃৎশিল্প ও পোড়ামাটি",
      woodwork: "কাঠ ও বাঁশ শিল্প",
      jewelry: "ঐতিহ্যবাহী গহনা"
    }
  },
  te: {
    common: { today: "ఈరోజు" },
    opportunities: {
      title: "మార్కెట్ సేకరణ అవకాశాలు",
      subtitle: "మీ చేతివృత్తికి అనుగుణంగా కార్పొరేట్ మరియు రిటైల్ కొనుగోలు అవసరాలు.",
      viewAll: "అన్నీ చూడండి (7)",
      liveBidWar: "ప్రత్యక్ష వేలం పోటీ",
      buyerBudget: "కొనుగోలుదారు బడ్జెట్:",
      currentActiveBids: "ప్రస్తుత క్రియాశీల బిడ్లు",
      artisanFromGujarat: "గుజరాత్ కళాకారుడు",
      studioInRajasthan: "రాజస్థాన్ స్టూడియో (అత్యల్పం)",
      yourBidAmount: "మీ బిడ్ మొత్తం (₹)",
      beat: "తక్కువ బిడ్ చేయండి ₹",
      winningBid: "మీ బిడ్ గెలుపు దశలో ఉంది!",
      bidExceeds: "బిడ్ కొనుగోలుదారు బడ్జెట్ కంటే ఎక్కువ!",
      beingOutbid: "మరొకరు మీ కంటే తక్కువ బిడ్ వేశారు!",
      estimatedDeliveryDays: "అంచనా డెలివరీ (రోజులు)",
      placeBidNow: "ఇప్పుడే బిడ్ చేయండి",
      bidSubmitted: "బిడ్ సమర్పించబడింది",
      reviewAndBid: "సమీక్షించి బిడ్ చేయండి",
      volume: "పరిమాణం",
      budget: "బడ్జెట్"
    },
    settings: {
      accessibleLanguages: "10 భారతీయ భాషలలో అందుబాటులో ఉంది"
    },
    roles: {
      switcherTitle: "డెమో పాత్ర మార్పిడి",
      switcherDesc: "ప్రెజెంటేషన్ కోసం వివిధ వినియోగదారు పాత్రల మధ్య తక్షణమే మారండి."
    },
    profile: {
      personalDetails: "వ్యక్తిగత వివరాలు",
      orgName: "సంస్థ పేరు",
      buyerType: "కొనుగోలుదారు రకం",
      headquarters: "ప్రధాన కార్యాలయం",
      department: "విభాగం",
      designation: "హోదా",
      jurisdiction: "పరిధి"
    },
    theme: {
      photoProtected: "కళాకృతుల ఫోటోలు మరియు స్టూడియో బ్యాక్‌డ్రాప్‌లు రంగు మారకుండా సహజంగా ఉంటాయి.",
      appearance: "రూపురేఖలు & థీమ్",
      theme: "థీమ్ మోడ్‌ను ఎంచుకోండి",
      light: "లైట్",
      dark: "డార్క్",
      system: "సిస్టమ్"
    },
    materials: {
      textiles: "వస్త్రాలు మరియు చేనేత",
      pottery: "మట్టిపాత్రలు మరియు టెర్రకోట",
      woodwork: "చెక్క మరియు వెదురు",
      jewelry: "సాంప్రదాయ నగలు"
    }
  },
  mr: {
    common: { today: "आज" },
    opportunities: {
      title: "बाजारपेठ खरेदी संधी",
      subtitle: "कॉर्पोरेट आणि किरकोळ खरेदी आवश्यकता ज्या तुमच्या हस्तकलेशी जुळतात.",
      viewAll: "सर्व पहा (7)",
      liveBidWar: "थेट बोली स्पर्धा",
      buyerBudget: "खरेदीदाराचे बजेट:",
      currentActiveBids: "सध्याच्या सक्रिय बोली",
      artisanFromGujarat: "गुजरातचे कारागीर",
      studioInRajasthan: "राजस्थान स्टुडिओ (किमान)",
      yourBidAmount: "तुमची बोली रक्कम (₹)",
      beat: "कमी बोली लावा ₹",
      winningBid: "तुमची बोली आघाडीवर आहे!",
      bidExceeds: "बोली खरेदीदाराच्या बजेटपेक्षा जास्त आहे!",
      beingOutbid: "दुसऱ्या कोणीतरी तुमच्यापेक्षा कमी बोली लावली आहे!",
      estimatedDeliveryDays: "अंदाजे वितरण (दिवस)",
      placeBidNow: "आता बोली लावा",
      bidSubmitted: "बोली सबमिट झाली",
      reviewAndBid: "तपासा आणि बोली लावा",
      volume: "प्रमाण",
      budget: "बजेट"
    },
    settings: {
      accessibleLanguages: "१० प्रमुख भारतीय भाषांमध्ये उपलब्ध"
    },
    roles: {
      switcherTitle: "डेमो भूमिका स्विचर",
      switcherDesc: "सादरीकरणासाठी वेगवेगळ्या वापरकर्ता भूमिकांमध्ये त्वरित बदला."
    },
    profile: {
      personalDetails: "वैयक्तिक तपशील",
      orgName: "संस्थेचे नाव",
      buyerType: "खरेदीदार प्रकार",
      headquarters: "मुख्यालय",
      department: "विभाग",
      designation: "पदनाम",
      jurisdiction: "अधिकारक्षेत्र"
    },
    theme: {
      photoProtected: "शिल्पकला फोटो आणि स्टुडिओ पार्श्वभूमी नेहमी रंग-अचूक आणि स्पष्ट राहतील.",
      appearance: "स्वरूप आणि थीम",
      theme: "थीम मोड निवडा",
      light: "लाइट",
      dark: "डार्क",
      system: "सिस्टम"
    },
    materials: {
      textiles: "वस्त्र आणि हातमाग",
      pottery: "मातीची भांडी आणि टेराकोटा",
      woodwork: "लाकूड आणि बांबू",
      jewelry: "पारंपारिक दागिने"
    }
  },
  gu: {
    common: { today: "આજે" },
    opportunities: {
      title: "બજાર ખરીદી તકો",
      subtitle: "કોર્પોરેટ અને રિટેલ ખરીદી જરૂરિયાતો જે તમારી હસ્તકલા સાથે મેળ ખાય છે.",
      viewAll: "બધું જુઓ (7)",
      liveBidWar: "લાઈવ બોલી મુકાબલો",
      buyerBudget: "ખરીદદારનું બજેટ:",
      currentActiveBids: "હાલની સક્રિય બોલીઓ",
      artisanFromGujarat: "ગુજરાતના કારીગર",
      studioInRajasthan: "રાજસ્થાન સ્ટુડિયો (ન્યૂનતમ)",
      yourBidAmount: "તમારી બોલી રકમ (₹)",
      beat: "ઓછી બોલી લગાવો ₹",
      winningBid: "તમારી બોલી વિજેતા બની રહી છે!",
      bidExceeds: "બોલી ખરીદદારના બજેટ કરતાં વધી ગઈ છે!",
      beingOutbid: "કોઈએ તમારા કરતાં ઓછી બોલી લગાવી છે!",
      estimatedDeliveryDays: "અંદાજિત ડિલિવરી (દિવસો)",
      placeBidNow: "હમણાં બોલી લગાવો",
      bidSubmitted: "બોલી સબમિટ થઈ ગઈ",
      reviewAndBid: "સમીક્ષા કરો અને બોલી લગાવો",
      volume: "જથ્થો",
      budget: "બજેટ"
    },
    settings: {
      accessibleLanguages: "10 ભારતીય ભાષાઓમાં ઉપલબ્ધ"
    },
    roles: {
      switcherTitle: "ડેમો ભૂમિકા સ્વિચર",
      switcherDesc: "પ્રેઝન્ટેશન માટે વિવિધ વપરાશકર્તા ભૂમિકાઓ વચ્ચે તરત જ સ્વિચ કરો."
    },
    profile: {
      personalDetails: "વ્યક્તિગત વિગતો",
      orgName: "સંસ્થાનું નામ",
      buyerType: "ખરીદદાર પ્રકાર",
      headquarters: "મુખ્ય મથક",
      department: "વિભાગ",
      designation: "હોદ્દો",
      jurisdiction: "અધિકારક્ષેત્ર"
    },
    theme: {
      photoProtected: "કલાકૃતિના ફોટા અને સ્ટુડિયો બેકડ્રોપ હંમેશા કુદરતી રંગમાં સચોટ રહેશે.",
      appearance: "દેખાવ અને થીમ",
      theme: "થીમ મોડ પસંદ કરો",
      light: "લાઇટ",
      dark: "ડાર્ક",
      system: "સિસ્ટમ"
    },
    materials: {
      textiles: "કાપડ અને હાથશાળ",
      pottery: "માટીકામ અને ટેરાકોટા",
      woodwork: "લાકડું અને વાંસકામ",
      jewelry: "પરંપરાગત ઘરેણાં"
    }
  },
  kn: {
    common: { today: "ಇಂದು" },
    opportunities: {
      title: "ಮಾರುಕಟ್ಟೆ ಖರೀದಿ ಅವಕಾಶಗಳು",
      subtitle: "ನಿಮ್ಮ ಕರಕುಶಲತೆಗೆ ತಕ್ಕಂತೆ ಕಾರ್ಪೊರೇಟ್ ಮತ್ತು ಚಿಲ್ಲರೆ ಖರೀದಿ ಅವಶ್ಯಕತೆಗಳು.",
      viewAll: "ಎಲ್ಲವನ್ನೂ ವೀಕ್ಷಿಸಿ (7)",
      liveBidWar: "ಲೈವ್ ಬಿಡ್ ಸ್ಪರ್ಧೆ",
      buyerBudget: "ಖರೀದಿದಾರರ ಬಜೆಟ್:",
      currentActiveBids: "ಪ್ರಸ್ತುತ ಸಕ್ರಿಯ ಬಿಡ್‌ಗಳು",
      artisanFromGujarat: "ಗುಜರಾತ್ ಕುಶಲಕರ್ಮಿ",
      studioInRajasthan: "ರಾಜಸ್ಥಾನ ಸ್ಟುಡಿಯೋ (ಕನಿಷ್ಠ)",
      yourBidAmount: "ನಿಮ್ಮ ಬಿಡ್ ಮೊತ್ತ (₹)",
      beat: "ಕಡಿಮೆ ಬಿಡ್ ಮಾಡಿ ₹",
      winningBid: "ನಿಮ್ಮ ಬಿಡ್ ಗೆಲ್ಲುವ ಹಂತದಲ್ಲಿದೆ!",
      bidExceeds: "ಬಿಡ್ ಖರೀದಿದಾರರ ಬಜೆಟ್‌ಗಿಂತ ಹೆಚ್ಚಾಗಿದೆ!",
      beingOutbid: "ಬೇರೆಯವರು ನಿಮ್ಮಗಿಂತ ಕಡಿಮೆ ಬಿಡ್ ಮಾಡಿದ್ದಾರೆ!",
      estimatedDeliveryDays: "ಅಂದಾಜು ವಿತರಣೆ (ದಿನಗಳು)",
      placeBidNow: "ಈಗಲೇ ಬಿಡ್ ಮಾಡಿ",
      bidSubmitted: "ಬಿಡ್ ಸಲ್ಲಿಸಲಾಗಿದೆ",
      reviewAndBid: "ಪರಿಶೀಲಿಸಿ ಮತ್ತು ಬಿಡ್ ಮಾಡಿ",
      volume: "ಪ್ರಮಾಣ",
      budget: "ಬಜೆಟ್"
    },
    settings: {
      accessibleLanguages: "10 ಭಾರತೀಯ ಭಾಷೆಗಳಲ್ಲಿ ಲಭ್ಯವಿದೆ"
    },
    roles: {
      switcherTitle: "ಡೆಮೊ ಪಾತ್ರ ಬದಲಾವಣೆ",
      switcherDesc: "ಪ್ರಸ್ತುತಿಗಾಗಿ ವಿವಿಧ ಬಳಕೆದಾರರ ಪಾತ್ರಗಳ ನಡುವೆ ತಕ್ಷಣವೇ ಬದಲಾಯಿಸಿ."
    },
    profile: {
      personalDetails: "ವೈಯಕ್ತಿಕ ವಿವರಗಳು",
      orgName: "ಸಂಸ್ಥೆಯ ಹೆಸರು",
      buyerType: "ಖರೀದಿದಾರರ ಪ್ರಕಾರ",
      headquarters: "ಮುಖ್ಯ ಕಚೇರಿ",
      department: "ಇಲಾಖೆ",
      designation: "ಹುದ್ದೆ",
      jurisdiction: "ವ್ಯಾಪ್ತಿ"
    },
    theme: {
      photoProtected: "ಕುಶಲಕಲೆಯ ಫೋಟೋಗಳು ಮತ್ತು ಸ್ಟುಡಿಯೋ ಹಿನ್ನೆಲೆಗಳು ಬಣ್ಣ ಬದಲಾಗದೆ ನೈಸರ್ಗಿಕವಾಗಿರುತ್ತವೆ.",
      appearance: "ಗೋಚರತೆ ಮತ್ತು ಥೀಮ್",
      theme: "ಥೀಮ್ ಮೋಡ್ ಆಯ್ಕೆಮಾಡಿ",
      light: "ಲೈಟ್",
      dark: "ಡಾರ್ಕ್",
      system: "ಸಿಸ್ಟಮ್"
    },
    materials: {
      textiles: "ಜವಳಿ ಮತ್ತು ಕೈಮಗ್ಗ",
      pottery: "ಮಣ್ಣಿನ ಪಾತ್ರೆ ಮತ್ತು ಟೆರಾಕೋಟಾ",
      woodwork: "ಮರ ಮತ್ತು ಬಿದಿರು",
      jewelry: "ಸಾಂಪ್ರದಾಯಿಕ ಆಭರಣಗಳು"
    }
  },
  ml: {
    common: { today: "ഇന്ന്" },
    opportunities: {
      title: "വിപണി സംഭരണ അവസരങ്ങൾ",
      subtitle: "നിങ്ങളുടെ കരകൗശലത്തിന് അനുയോജ്യമായ കോർപ്പറേറ്റ്, റീട്ടെയിൽ സംഭരണ ആവശ്യകതകൾ.",
      viewAll: "എല്ലാം കാണുക (7)",
      liveBidWar: "തത്സമയ ലേല മത്സരം",
      buyerBudget: "വാങ്ങുന്നയാളുടെ ബജറ്റ്:",
      currentActiveBids: "നിലവിലെ സജീവ ബിഡുകൾ",
      artisanFromGujarat: "ഗുജറാത്ത് കരകൗശല വിദഗ്ദ്ധൻ",
      studioInRajasthan: "രാജസ്ഥാൻ സ്റ്റുഡിയോ (ഏറ്റവും കുറഞ്ഞത്)",
      yourBidAmount: "നിങ്ങളുടെ ബിഡ് തുക (₹)",
      beat: "കുറഞ്ഞ ബിഡ് നൽകുക ₹",
      winningBid: "നിങ്ങളുടെ ബിഡ് മുന്നിലാണ്!",
      bidExceeds: "ബിഡ് വാങ്ങുന്നയാളുടെ ബജറ്റിനേക്കാൾ കൂടുതലാണ്!",
      beingOutbid: "മറ്റാരോ നിങ്ങളേക്കാൾ കുറഞ്ഞ ബിഡ് നൽകിയിരിക്കുന്നു!",
      estimatedDeliveryDays: "പ്രതീക്ഷിക്കുന്ന ഡെലിവറി (ദിവസങ്ങൾ)",
      placeBidNow: "ഇപ്പോൾ ബിഡ് ചെയ്യുക",
      bidSubmitted: "ബിഡ് സമർപ്പിച്ചു",
      reviewAndBid: "പരിശോധിച്ച് ബിഡ് ചെയ്യുക",
      volume: "അളവ്",
      budget: "ബജറ്റ്"
    },
    settings: {
      accessibleLanguages: "10 ഇന്ത്യൻ ഭാഷകളിൽ ലഭ്യമാണ്"
    },
    roles: {
      switcherTitle: "ഡെമോ റോൾ സ്വിച്ചർ",
      switcherDesc: "വിവിധ ഉപയോക്തൃ റോളുകൾ തമ്മിൽ തൽക്ഷണം മാറുക."
    },
    profile: {
      personalDetails: "വ്യക്തിഗത വിവരങ്ങൾ",
      orgName: "സ്ഥാപനത്തിന്റെ പേര്",
      buyerType: "വാങ്ങുന്നയാളുടെ തരം",
      headquarters: "ആസ്ഥാനം",
      department: "വകുപ്പ്",
      designation: "തസ്തിക",
      jurisdiction: "അധികാരപരിധി"
    },
    theme: {
      photoProtected: "കരകൗശല ഫോട്ടോകളും സ്റ്റുഡിയോ പശ്ചാത്തലങ്ങളും സ്വാഭാവിക നിറത്തിൽ കൃത്യമായി തുടരും.",
      appearance: "രൂപവും തീമും",
      theme: "തീം മോഡ് തിരഞ്ഞെടുക്കുക",
      light: "ലൈറ്റ്",
      dark: "ഡാർക്ക്",
      system: "സിസ്റ്റം"
    },
    materials: {
      textiles: "ടെക്സ്റ്റൈൽസ് & കൈത്തറി",
      pottery: "മൺപാത്രങ്ങളും ടെറാക്കോട്ടയും" ,
      woodwork: "തടിയും മുളയും",
      jewelry: "പാരമ്പര്യ ആഭരണങ്ങൾ"
    }
  },
  pa: {
    common: { today: "ਅੱਜ" },
    opportunities: {
      title: "ਮਾਰਕੀਟ ਖਰੀਦ ਦੇ ਮੌਕੇ",
      subtitle: "ਕਾਰਪੋਰੇਟ ਅਤੇ ਰਿਟੇਲ ਖਰੀਦ ਜ਼ਰੂਰਤਾਂ ਜੋ ਤੁਹਾਡੇ ਸ਼ਿਲਪਕਾਰੀ ਨਾਲ ਮੇਲ ਖਾਂਦੀਆਂ ਹਨ।",
      viewAll: "ਸਾਰੇ ਦੇਖੋ (7)",
      liveBidWar: "ਲਾਈਵ ਬੋਲੀ ਮੁਕਾਬਲਾ",
      buyerBudget: "ਖਰੀਦਦਾਰ ਦਾ ਬਜਟ:",
      currentActiveBids: "ਮੌਜੂਦਾ ਸਰਗਰਮ ਬੋਲੀਆਂ",
      artisanFromGujarat: "ਗੁਜਰਾਤ ਦਾ ਕਾਰੀਗਰ",
      studioInRajasthan: "ਰਾਜਸਥਾਨ ਸਟੂਡੀਓ (ਸਭ ਤੋਂ ਘੱਟ)",
      yourBidAmount: "ਤੁਹਾਡੀ ਬੋਲੀ ਦੀ ਰਕਮ (₹)",
      beat: "ਘੱਟ ਬੋਲੀ ਲਗਾਓ ₹",
      winningBid: "ਤੁਹਾਡੀ ਬੋਲੀ ਸਭ ਤੋਂ ਅੱਗੇ ਹੈ!",
      bidExceeds: "ਬੋਲੀ ਖਰੀਦਦਾਰ ਦੇ ਬਜਟ ਤੋਂ ਵੱਧ ਹੈ!",
      beingOutbid: "ਕੋਈ ਤੁਹਾਡੇ ਤੋਂ ਘੱਟ ਬੋਲੀ ਲਗਾ ਰਿਹਾ ਹੈ!",
      estimatedDeliveryDays: "ਅਨੁਮਾਨਿਤ ਡਿਲੀਵਰੀ (ਦਿਨ)",
      placeBidNow: "ਹੁਣੇ ਬੋਲੀ ਲਗਾਓ",
      bidSubmitted: "ਬੋਲੀ ਜਮ੍ਹਾਂ ਹੋ ਗਈ",
      reviewAndBid: "ਸਮੀਖਿਆ ਕਰੋ ਅਤੇ ਬੋਲੀ ਲਗਾਓ",
      volume: "ਮਾਤਰਾ",
      budget: "ਬਜਟ"
    },
    settings: {
      accessibleLanguages: "10 ਪ੍ਰਮੁੱਖ ਭਾਰਤੀ ਭਾਸ਼ਾਵਾਂ ਵਿੱਚ ਉਪਲਬਧ"
    },
    roles: {
      switcherTitle: "ਡੈਮੋ ਭੂਮਿਕਾ ਸਵਿੱਚਰ",
      switcherDesc: "ਵੱਖ-ਵੱਖ ਉਪਭੋਗਤਾ ਭੂਮਿਕਾਵਾਂ ਵਿਚਕਾਰ ਤੁਰੰਤ ਸਵਿਚ ਕਰੋ।"
    },
    profile: {
      personalDetails: "ਨਿੱਜੀ ਵੇਰਵੇ",
      orgName: "ਸੰਸਥਾ ਦਾ ਨਾਮ",
      buyerType: "ਖਰੀਦਦਾਰ ਦੀ ਕਿਸਮ",
      headquarters: "ਮੁੱਖ ਦਫ਼ਤਰ",
      department: "ਵਿਭਾਗ",
      designation: "ਅਹੁਦਾ",
      jurisdiction: "ਅਧਿਕਾਰ ਖੇਤਰ"
    },
    theme: {
      photoProtected: "ਸ਼ਿਲਪਕਾਰੀ ਫੋਟੋਆਂ ਅਤੇ ਸਟੂਡੀਓ ਬੈਕਡ੍ਰੌਪ ਹਮੇਸ਼ਾ ਰੰਗ-ਸਟੀਕ ਅਤੇ ਸਪਸ਼ਟ ਰਹਿਣਗੇ।",
      appearance: "ਦਿੱਖ ਅਤੇ ਥੀਮ",
      theme: "ਥੀਮ ਮੋਡ ਚੁਣੋ",
      light: "ਲਾਈਟ",
      dark: "ਡਾਰਕ",
      system: "ਸਿਸਟਮ"
    },
    materials: {
      textiles: "ਕੱਪੜਾ ਅਤੇ ਖੱਡੀ",
      pottery: "ਮਿੱਟੀ ਦੇ ਭਾਂਡੇ ਅਤੇ ਟੈਰਾਕੋਟਾ",
      woodwork: "ਲੱਕੜ ਅਤੇ ਬਾਂਸ",
      jewelry: "ਰਵਾਇਤੀ ਗਹਿਣੇ"
    }
  }
};

function deepMerge(target, source) {
  for (const key of Object.keys(source)) {
    if (source[key] instanceof Object && !Array.isArray(source[key])) {
      if (!target[key]) Object.assign(target, { [key]: {} });
      deepMerge(target[key], source[key]);
    } else {
      Object.assign(target, { [key]: source[key] });
    }
  }
  return target;
}

const langCodes = ['en', 'ta', 'hi', 'bn', 'te', 'mr', 'gu', 'kn', 'ml', 'pa'];

langCodes.forEach(code => {
  const filePath = path.join(localesDir, `${code}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  const merged = deepMerge(data, additions[code]);
  fs.writeFileSync(filePath, JSON.stringify(merged, null, 2), 'utf-8');
  console.log(`Updated ${code}.json`);
});
