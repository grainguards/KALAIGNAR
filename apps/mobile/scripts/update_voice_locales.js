const fs = require('fs');
const path = require('path');

const localesDir = path.join(__dirname, '../src/locales');

const chatLocales = {
  en: {
    chat: {
      holdToTalk: "Hold to speak",
      listening: "Listening...",
      translating: "Translating to professional English...",
      confirmSend: "Confirm Send",
      cancel: "Cancel",
      playingAudio: "Playing audio...",
      readOutAudio: "Listen in your language",
      aiNegotiationPreview: "AI Negotiation Draft",
      buyerWillReceive: "Buyer will receive (in English):",
      meaningInLocal: "Meaning in your language:",
      tapToSpeak: "Tap to speak",
      stopListening: "Stop listening",
      originalSpeech: "Your speech:",
      aiWillSend: "AI will send:",
      translatingAudio: "Translating..."
    },
    errors: {
      micPermission: "Microphone access is required.",
      speechRecognitionFailed: "Could not understand audio. Please try again."
    }
  },
  ta: {
    chat: {
      holdToTalk: "பேச அழுத்திப் பிடிக்கவும்",
      listening: "கேட்கிறது...",
      translating: "வணிக ஆங்கிலத்திற்கு மொழிபெயர்க்கிறது...",
      confirmSend: "அனுப்புவதை உறுதிசெய்",
      cancel: "ரத்துசெய்",
      playingAudio: "ஆடியோ ஒலிக்கிறது...",
      readOutAudio: "உங்கள் மொழியில் கேட்கவும்",
      aiNegotiationPreview: "AI வணிக பேச்சுவார்த்தை வரைவு",
      buyerWillReceive: "வாங்குபவர் பெறுவது (ஆங்கிலத்தில்):",
      meaningInLocal: "உங்கள் மொழியில் இதன் பொருள்:",
      tapToSpeak: "பேச தட்டவும்",
      stopListening: "கேட்பதை நிறுத்து",
      originalSpeech: "நீங்கள் பேசியது:",
      aiWillSend: "AI அனுப்பும் செய்தி:",
      translatingAudio: "மொழிபெயர்க்கிறது..."
    },
    errors: {
      micPermission: "மைக்ரோஃபோன் அனுமதி தேவை.",
      speechRecognitionFailed: "ஆடியோவை புரிந்துகொள்ள முடியவில்லை. மீண்டும் முயற்சிக்கவும்."
    }
  },
  hi: {
    chat: {
      holdToTalk: "बोलने के लिए दबाए रखें",
      listening: "सुन रहा है...",
      translating: "व्यावसायिक अंग्रेजी में अनुवाद हो रहा है...",
      confirmSend: "भेजना सुनिश्चित करें",
      cancel: "रद्द करें",
      playingAudio: "ऑडियो बज रहा है...",
      readOutAudio: "अपनी भाषा में सुनें",
      aiNegotiationPreview: "एआई बातचीत मसौदा",
      buyerWillReceive: "खरीदार को मिलेगा (अंग्रेजी में):",
      meaningInLocal: "आपकी भाषा में इसका अर्थ:",
      tapToSpeak: "बोलने के लिए टैप करें",
      stopListening: "सुनना बंद करें",
      originalSpeech: "आपकी आवाज:",
      aiWillSend: "एआई भेजेगा:",
      translatingAudio: "अनुवाद हो रहा है..."
    },
    errors: {
      micPermission: "माइक्रोफ़ोन एक्सेस आवश्यक है।",
      speechRecognitionFailed: "आवाज़ समझ नहीं आई। कृपया पुनः प्रयास करें।"
    }
  },
  bn: {
    chat: {
      holdToTalk: "কথা বলতে চেপে ধরে রাখুন",
      listening: "শুনছি...",
      translating: "পেশাদার ইংরেজিতে অনুবাদ করা হচ্ছে...",
      confirmSend: "পাঠানো নিশ্চিত করুন",
      cancel: "বাতিল",
      playingAudio: "অডিও চলছে...",
      readOutAudio: "আপনার ভাষায় শুনুন",
      aiNegotiationPreview: "এআই আলোচনা খসড়া",
      buyerWillReceive: "ক্রেতা পাবেন (ইংরেজিতে):",
      meaningInLocal: "আপনার ভাষায় এর অর্থ:",
      tapToSpeak: "কথা বলতে ট্যাপ করুন",
      stopListening: "শোনা বন্ধ করুন",
      originalSpeech: "আপনার কথা:",
      aiWillSend: "এআই পাঠাবে:",
      translatingAudio: "অনুবাদ হচ্ছে..."
    },
    errors: {
      micPermission: "মাইক্রোফোনের অনুমতি প্রয়োজন।",
      speechRecognitionFailed: "অডিও বুঝতে পারছি না। আবার চেষ্টা করুন।"
    }
  },
  te: {
    chat: {
      holdToTalk: "మాట్లాడటానికి నొక్కి పట్టుకోండి",
      listening: "వింటోంది...",
      translating: "వ్యాపార ఆంగ్లంలోకి అనువదిస్తోంది...",
      confirmSend: "పంపడాన్ని నిర్ధారించండి",
      cancel: "రద్దు చేయి",
      playingAudio: "ఆడియో ప్లే అవుతోంది...",
      readOutAudio: "మీ భాషలో వినండి",
      aiNegotiationPreview: "AI బేరసారాల డ్రాఫ్ట్",
      buyerWillReceive: "కొనుగోలుదారు అందుకుంటారు (ఇంగ్లీషులో):",
      meaningInLocal: "మీ భాషలో దీని అర్థం:",
      tapToSpeak: "మాట్లాడటానికి నొక్కండి",
      stopListening: "వినడం ఆపివేయి",
      originalSpeech: "మీరు మాట్లాడినది:",
      aiWillSend: "AI పంపేది:",
      translatingAudio: "అనువదిస్తోంది..."
    },
    errors: {
      micPermission: "మైక్రోఫోన్ అనుమతి అవసరం.",
      speechRecognitionFailed: "ఆడియో అర్థం కాలేదు. దయచేసి మళ్లీ ప్రయత్నించండి."
    }
  },
  mr: {
    chat: {
      holdToTalk: "बोलण्यासाठी दाबून ठेवा",
      listening: "ऐकत आहे...",
      translating: "व्यावसायिक इंग्रजीत भाषांतर करत आहे...",
      confirmSend: "पाठवण्याची पुष्टी करा",
      cancel: "रद्द करा",
      playingAudio: "ऑडिओ वाजत आहे...",
      readOutAudio: "तुमच्या भाषेत ऐका",
      aiNegotiationPreview: "एआय वाटाघाटी मसुदा",
      buyerWillReceive: "खरेदीदारास मिळेल (इंग्रजीत):",
      meaningInLocal: "तुमच्या भाषेत याचा अर्थ:",
      tapToSpeak: "बोलण्यासाठी टॅप करा",
      stopListening: "ऐकणे थांबवा",
      originalSpeech: "तुमचे बोलणे:",
      aiWillSend: "एआय पाठवेल:",
      translatingAudio: "भाषांतर होत आहे..."
    },
    errors: {
      micPermission: "मायक्रोफोन प्रवेश आवश्यक आहे.",
      speechRecognitionFailed: "आवाज समजला नाही. कृपया पुन्हा प्रयत्न करा."
    }
  },
  gu: {
    chat: {
      holdToTalk: "બોલવા માટે દબાવી રાખો",
      listening: "સાંભળી રહ્યું છે...",
      translating: "વ્યવસાયિક અંગ્રેજીમાં અનુવાદ થઈ રહ્યું છે...",
      confirmSend: "મોકલવાની પુષ્ટિ કરો",
      cancel: "રદ કરો",
      playingAudio: "ઓડિયો વાગી રહ્યો છે...",
      readOutAudio: "તમારી ભાષામાં સાંભળો",
      aiNegotiationPreview: "AI વાટાઘાટ ડ્રાફ્ટ",
      buyerWillReceive: "ખરીદનારને મળશે (અંગ્રેજીમાં):",
      meaningInLocal: "તમારી ભાષામાં આનો અર્થ:",
      tapToSpeak: "બોલવા માટે ટેપ કરો",
      stopListening: "સાંભળવાનું બંધ કરો",
      originalSpeech: "તમારું ભાષણ:",
      aiWillSend: "AI મોકલશે:",
      translatingAudio: "અનુવાદ થઈ રહ્યો છે..."
    },
    errors: {
      micPermission: "માઇક્રોફોનની મંજૂરી જરૂરી છે.",
      speechRecognitionFailed: "ઑડિઓ સમજાયો નથી. કૃપા કરીને ફરી પ્રયાસ કરો."
    }
  },
  kn: {
    chat: {
      holdToTalk: "ಮಾತನಾಡಲು ಒತ್ತಿ ಹಿಡಿಯಿರಿ",
      listening: "ಕೇಳಿಸಿಕೊಳ್ಳುತ್ತಿದೆ...",
      translating: "ವ್ಯವಹಾರಿಕ ಇಂಗ್ಲಿಷ್‌ಗೆ ಅನುವಾದಿಸಲಾಗುತ್ತಿದೆ...",
      confirmSend: "ಕಳುಹಿಸುವುದನ್ನು ದೃಢೀಕರಿಸಿ",
      cancel: "ರದ್ದುಮಾಡಿ",
      playingAudio: "ಆಡಿಯೋ ಪ್ಲೇ ಆಗುತ್ತಿದೆ...",
      readOutAudio: "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಕೇಳಿ",
      aiNegotiationPreview: "AI ಮಾತುಕತೆಯ ಕರಡು",
      buyerWillReceive: "ಖರೀದಿದಾರರು ಸ್ವೀಕರಿಸುವುದು (ಇಂಗ್ಲಿಷ್‌ನಲ್ಲಿ):",
      meaningInLocal: "ನಿಮ್ಮ ಭಾಷೆಯಲ್ಲಿ ಇದರ ಅರ್ಥ:",
      tapToSpeak: "ಮಾತನಾಡಲು ಟ್ಯಾಪ್ ಮಾಡಿ",
      stopListening: "ಕೇಳಿಸುವುದನ್ನು ನಿಲ್ಲಿಸಿ",
      originalSpeech: "ನಿಮ್ಮ ಮಾತು:",
      aiWillSend: "AI ಕಳುಹಿಸುವುದು:",
      translatingAudio: "ಅನುವಾದಿಸಲಾಗುತ್ತಿದೆ..."
    },
    errors: {
      micPermission: "ಮೈಕ್ರೊಫೋನ್ ಅನುಮತಿ ಅಗತ್ಯವಿದೆ.",
      speechRecognitionFailed: "ಆಡಿಯೋ ಅರ್ಥವಾಗಲಿಲ್ಲ. ದಯವಿಟ್ಟು ಮತ್ತೆ ಪ್ರಯತ್ನಿಸಿ."
    }
  },
  ml: {
    chat: {
      holdToTalk: "സംസാരിക്കാൻ അമർത്തിപ്പിടിക്കുക",
      listening: "കേൾക്കുന്നു...",
      translating: "ബിസിനസ്സ് ഇംഗ്ലീഷിലേക്ക് വിവർത്തനം ചെയ്യുന്നു...",
      confirmSend: "അയക്കുന്നത് സ്ഥിരീകരിക്കുക",
      cancel: "റദ്ദാക്കുക",
      playingAudio: "ഓഡിയോ പ്ലേ ചെയ്യുന്നു...",
      readOutAudio: "നിങ്ങളുടെ ഭാഷയിൽ കേൾക്കുക",
      aiNegotiationPreview: "AI ചർച്ചാ ഡ്രാഫ്റ്റ്",
      buyerWillReceive: "വാങ്ങുന്നയാൾക്ക് ലഭിക്കുന്നത് (ഇംഗ്ലീഷിൽ):" ,
      meaningInLocal: "നിങ്ങളുടെ ഭാഷയിൽ ഇതിന്റെ അർത്ഥം:",
      tapToSpeak: "സംസാരിക്കാൻ ടാപ്പ് ചെയ്യുക",
      stopListening: "കേൾക്കുന്നത് നിർത്തുക",
      originalSpeech: "നിങ്ങളുടെ സംസാരം:",
      aiWillSend: "AI അയയ്ക്കും:",
      translatingAudio: "വിവർത്തനം ചെയ്യുന്നു..."
    },
    errors: {
      micPermission: "മൈക്രോഫോൺ അനുമതി ആവശ്യമാണ്.",
      speechRecognitionFailed: "ഓഡിയോ മനസ്സിലായില്ല. ദയവായി വീണ്ടും ശ്രമിക്കുക."
    }
  },
  pa: {
    chat: {
      holdToTalk: "ਬੋਲਣ ਲਈ ਦਬਾ ਕੇ ਰੱਖੋ",
      listening: "ਸੁਣ ਰਿਹਾ ਹੈ...",
      translating: "ਕਾਰੋਬਾਰੀ ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ ਅਨੁਵਾਦ ਕੀਤਾ ਜਾ ਰਿਹਾ ਹੈ...",
      confirmSend: "ਭੇਜਣ ਦੀ ਪੁਸ਼ਟੀ ਕਰੋ",
      cancel: "ਰੱਦ ਕਰੋ",
      playingAudio: "ਆਡੀਓ ਚੱਲ ਰਿਹਾ ਹੈ...",
      readOutAudio: "ਆਪਣੀ ਭਾਸ਼ਾ ਵਿੱਚ ਸੁਣੋ",
      aiNegotiationPreview: "AI ਗੱਲਬਾਤ ਦਾ ਡਰਾਫਟ",
      buyerWillReceive: "ਖਰੀਦਦਾਰ ਨੂੰ ਮਿਲੇਗਾ (ਅੰਗਰੇਜ਼ੀ ਵਿੱਚ):",
      meaningInLocal: "ਤੁਹਾਡੀ ਭਾਸ਼ਾ ਵਿੱਚ ਇਸਦਾ ਅਰਥ:",
      tapToSpeak: "ਬੋਲਣ ਲਈ ਟੈਪ ਕਰੋ",
      stopListening: "ਸੁਣਨਾ ਬੰਦ ਕਰੋ",
      originalSpeech: "ਤੁਹਾਡੀ ਗੱਲਬਾਤ:",
      aiWillSend: "AI ਭੇਜੇਗਾ:",
      translatingAudio: "ਅਨੁਵਾਦ ਹੋ ਰਿਹਾ ਹੈ..."
    },
    errors: {
      micPermission: "ਮਾਈਕ੍ਰੋਫੋਨ ਦੀ ਇਜਾਜ਼ਤ ਲੋੜੀਂਦੀ ਹੈ।",
      speechRecognitionFailed: "ਆਡੀਓ ਸਮਝ ਨਹੀਂ ਆਇਆ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।"
    }
  }
};

Object.keys(chatLocales).forEach(lang => {
  const filePath = path.join(localesDir, `${lang}.json`);
  const data = JSON.parse(fs.readFileSync(filePath, 'utf-8'));
  data.chat = {
    ...(data.chat || {}),
    ...chatLocales[lang].chat
  };
  data.errors = {
    ...(data.errors || {}),
    ...chatLocales[lang].errors
  };
  fs.writeFileSync(filePath, JSON.stringify(data, null, 2) + '\n', 'utf-8');
  console.log(`Updated ${lang}.json with chat & error voice negotiation keys.`);
});
