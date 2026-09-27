const fs = require('fs');
const file = 'C:/Users/indir/Downloads/Kalaignar/KalaSetu-App/apps/mobile/src/screens/Auth/RegistrationScreen.tsx';
let content = fs.readFileSync(file, 'utf8');

if (!content.includes("import { Audio } from 'expo-av';")) {
  content = content.replace("import * as Speech from 'expo-speech';", "import * as Speech from 'expo-speech';\nimport { Audio } from 'expo-av';\nimport * as FileSystem from 'expo-file-system';");
}

const replacement = `  const [recording, setRecording] = useState<Audio.Recording | null>(null);

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(console.error);
      }
    };
  }, [recording]);

  const handleVoiceAutofill = async () => {
    if (isVoiceListening) {
      setIsVoiceListening(false);
      if (!recording) return;
      try {
        await recording.stopAndUnloadAsync();
        const uri = recording.getURI();
        setRecording(null);
        if (uri) {
          const audioBase64 = await FileSystem.readAsStringAsync(uri, {
            encoding: FileSystem.EncodingType.Base64,
          });
          const response = await axios.post(\`\${API_URL}/ai/intent\`, {
            audioBase64,
            language: lang
          });
          const data = response.data;
          if (data.intent === 'AUTOFILL') {
            if (data.autofill_data.fullName) setFullName(data.autofill_data.fullName);
            if (data.autofill_data.city) setCity(data.autofill_data.city);
            if (data.autofill_data.companyName) setCompanyName(data.autofill_data.companyName);
            if (data.autofill_data.craftCategory) setCraftCategory(data.autofill_data.craftCategory);
            Speech.speak(data.voice_reply || "I have entered your details.", { language: lang });
          }
        }
      } catch (err) {
        console.error('Voice Autofill Error:', err);
      }
      return;
    }

    try {
      setIsVoiceListening(true);
      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({ allowsRecordingIOS: true, playsInSilentModeIOS: true });
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
    } catch (e) {
      setIsVoiceListening(false);
      console.error(e);
    }
  };`;

content = content.replace(/const handleVoiceAutofill = async \([\s\S]*?\}\s*catch \(e\) \{\s*setIsVoiceListening\(false\);\s*console\.error\(e\);\s*\}\s*\};/, replacement.trim());
// Or if it was the regex matched earlier... wait I'll just replace based on the existing function.
content = content.replace(/const handleVoiceAutofill = async \([\s\S]*?\}\s*catch \(e\) \{\s*setIsVoiceListening\(false\);\s*\}\s*\};/, replacement.trim());

fs.writeFileSync(file, content);
