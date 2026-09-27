const fs = require('fs');
const file = 'C:/Users/indir/Downloads/Kalaignar/KalaSetu-App/apps/mobile/src/components/VoiceAssistant.tsx';
let content = fs.readFileSync(file, 'utf8');

const replacement = \
  const handleVoicePress = async () => {
    if (isListening) {
      sttService.stopListening();
      setIsListening(false);
      return;
    }

    try {
      setIsListening(true);
      const success = await sttService.startListening(lang, {
        onStart: () => setIsListening(true),
        onResult: (text, isFinal) => {
          if (isFinal) {
            setIsListening(false);
            processTranscript(text);
          }
        },
        onError: (err) => {
          setIsListening(false);
          showToast(t(err) || 'Microphone error');
        },
        onEnd: () => setIsListening(false),
      });

      if (!success) {
        setIsListening(false);
      }
    } catch (e) {
      setIsListening(false);
      showToast(t('errors.micPermission'));
    }
  };

  const processTranscript = async (transcript: string) => {
    setIsProcessing(true);
    try {
      const contextData = {
        totalSales: '? 15,000',
        trendingProduct: 'Bamboo Baskets',
        ordersPending: 3
      };

      const response = await axios.post(\\\\/ai/intent\\\, {
        transcript,
        contextData,
        language: lang
      });

      const data = response.data;

      if (data.intent === 'UPDATE_INVENTORY') {
        console.log('Inventory Updated:', data.inventory_data);
        showToast(t('voice.inventoryUpdated'));
        speak(data.voice_reply);
      } else if (data.intent === 'DASHBOARD_SUMMARY') {
        console.log('Dashboard Data:', data.dashboard_reply);
        speak(data.dashboard_reply || data.voice_reply);
      } else if (data.intent === 'NAVIGATION') {
        console.log('Navigation Intent:', data.destination);
        speak(data.voice_reply || "Navigating...");
        // Actually navigate
        // navigation.navigate(data.destination);
      } else {
        speak(data.voice_reply || t('voice.unknownCommand'));
      }
    } catch (error) {
      console.error(error);
      showToast(t('errors.network'));
    } finally {
      setIsProcessing(false);
    }
  };\;

content = content.replace(/const handleVoicePress = async \(\) => \{[\s\S]*?\}\s*catch \(e\) \{[\s\S]*?showToast\(t\('errors\.micPermission'\)\);\s*\}\s*\};/, replacement.trim());
fs.writeFileSync(file, content);
