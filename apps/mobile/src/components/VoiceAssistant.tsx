import React, { useState, useEffect, useRef } from 'react';
import { View, TouchableOpacity, StyleSheet, ToastAndroid, Platform, Text, ActivityIndicator, Animated, Easing } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import axios from 'axios';
import { useNavigation, NavigationProp } from '@react-navigation/native';
import { API_URL } from '../services/api';
import { useTranslation } from '../i18n/useTranslation';
import { useTheme } from '../theme/useTheme';

const ListeningAnimation = ({ color }: { color: string }) => {
  const anim1 = useRef(new Animated.Value(1)).current;
  const anim2 = useRef(new Animated.Value(1)).current;
  const anim3 = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const createAnim = (anim: Animated.Value, delay: number) => {
      Animated.loop(
        Animated.sequence([
          Animated.timing(anim, {
            toValue: 2.5,
            duration: 400,
            delay,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
          Animated.timing(anim, {
            toValue: 1,
            duration: 400,
            useNativeDriver: true,
            easing: Easing.inOut(Easing.ease),
          }),
        ])
      ).start();
    };

    createAnim(anim1, 0);
    createAnim(anim2, 200);
    createAnim(anim3, 400);
  }, []);

  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', height: 24, paddingHorizontal: 8 }}>
      <Animated.View style={{ width: 4, height: 8, backgroundColor: color, borderRadius: 2, marginHorizontal: 3, transform: [{ scaleY: anim1 }] }} />
      <Animated.View style={{ width: 4, height: 8, backgroundColor: color, borderRadius: 2, marginHorizontal: 3, transform: [{ scaleY: anim2 }] }} />
      <Animated.View style={{ width: 4, height: 8, backgroundColor: color, borderRadius: 2, marginHorizontal: 3, transform: [{ scaleY: anim3 }] }} />
    </View>
  );
};

export default function VoiceAssistant() {
  const [isListening, setIsListening] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [recording, setRecording] = useState<Audio.Recording | null>(null);
  
  // Widget state
  const [transcriptText, setTranscriptText] = useState('');
  const [aiResponse, setAiResponse] = useState('');
  
  const { t, lang } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation<NavigationProp<any>>();

  useEffect(() => {
    return () => {
      if (recording) {
        recording.stopAndUnloadAsync().catch(console.error);
      }
      if (Platform.OS === 'web' && (window as any).currentRecognition) {
        (window as any).currentRecognition.stop();
      }
    };
  }, [recording]);

  const handleVoicePress = async () => {
    if (isListening) {
      await stopRecording();
      return;
    }
    await startRecording();
  };

  const startRecording = async () => {
    try {
      setTranscriptText('');
      setAiResponse('');
      setIsListening(true);
      
      if (Platform.OS === 'web') {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
        if (SpeechRecognition) {
          const recognition = new SpeechRecognition();
          recognition.lang = lang === 'hi' ? 'hi-IN' : 'en-US';
          recognition.interimResults = true;
          recognition.maxAlternatives = 1;

          recognition.onresult = async (event: any) => {
            let finalTranscript = '';
            let interimTranscript = '';
            
            for (let i = event.resultIndex; i < event.results.length; ++i) {
              if (event.results[i].isFinal) {
                finalTranscript += event.results[i][0].transcript;
              } else {
                interimTranscript += event.results[i][0].transcript;
              }
            }
            
            setTranscriptText(finalTranscript || interimTranscript);
            
            if (finalTranscript) {
              setIsListening(false);
              setIsProcessing(true);
              await processAudio(undefined, finalTranscript);
              setIsProcessing(false);
            }
          };

          recognition.onerror = (event: any) => {
            console.warn('Speech recognition event:', event.error);
            setIsListening(false);
            if (event.error === 'no-speech') {
              setAiResponse('No speech detected. Tap the mic and speak!');
            } else if (event.error === 'not-allowed' || event.error === 'audio-capture') {
              setAiResponse('Microphone access blocked. Please allow mic permissions in your browser bar.');
            } else if (event.error === 'aborted') {
              // Ignore manual abort
            } else {
              setAiResponse('Speech recognition error. Please try again.');
            }
          };
          
          recognition.onend = () => {
            setIsListening(false);
          };

          (window as any).currentRecognition = recognition;
          recognition.start();
          return;
        } else {
          showToast('Speech Recognition not supported in this browser');
          setIsListening(false);
          return;
        }
      }

      await Audio.requestPermissionsAsync();
      await Audio.setAudioModeAsync({
        allowsRecordingIOS: true,
        playsInSilentModeIOS: true,
      });
      const { recording: newRecording } = await Audio.Recording.createAsync(
        Audio.RecordingOptionsPresets.HIGH_QUALITY
      );
      setRecording(newRecording);
    } catch (err) {
      console.error('Failed to start recording', err);
      setIsListening(false);
      showToast(t('errors.micPermission') || 'Microphone error');
    }
  };

  const stopRecording = async () => {
    setIsListening(false);
    
    if (Platform.OS === 'web') {
      if ((window as any).currentRecognition) {
        (window as any).currentRecognition.stop();
      }
      return;
    }

    if (!recording) return;

    try {
      setIsProcessing(true);
      await recording.stopAndUnloadAsync();
      const uri = recording.getURI();
      setRecording(null);

      if (uri) {
        const audioBase64 = await FileSystem.readAsStringAsync(uri, {
          encoding: FileSystem.EncodingType.Base64,
        });
        await processAudio(audioBase64);
      }
    } catch (err) {
      console.error('Failed to stop recording', err);
    } finally {
      setIsProcessing(false);
    }
  };

  const processAudio = async (audioBase64?: string, transcript?: string) => {
    try {
      const contextData = {
        totalSales: '₹ 15,000',
        trendingProduct: 'Bamboo Baskets',
        ordersPending: 3
      };

      const payload: any = {
        contextData,
        language: lang
      };
      
      if (audioBase64) payload.audioBase64 = audioBase64;
      if (transcript) payload.transcript = transcript;

      const response = await axios.post(`${API_URL}/ai/intent`, payload);
      const data = response.data;

      if (data.intent === 'UPDATE_INVENTORY') {
        const reply = data.voice_reply || 'Inventory Updated';
        setAiResponse(reply);
        speak(reply);
      } else if (data.intent === 'DASHBOARD_SUMMARY') {
        const reply = data.dashboard_reply || data.voice_reply || 'Here is your summary.';
        setAiResponse(reply);
        speak(reply);
      } else if (data.intent === 'NAVIGATION') {
        const reply = data.voice_reply || "Navigating...";
        setAiResponse(reply);
        speak(reply);
        if (data.destination) navigation.navigate(data.destination);
      } else {
        const reply = data.voice_reply || t('voice.unknownCommand') || 'Unknown Command';
        setAiResponse(reply);
        speak(reply);
      }
    } catch (error) {
      console.error(error);
      setAiResponse(t('errors.network') || 'Network Error. We fell back to local parsing but something went wrong.');
    }
  };

  const speak = (text: string) => {
    Speech.speak(text, { language: lang || 'en' });
  };

  const showToast = (message: string) => {
    if (Platform.OS === 'android') {
      ToastAndroid.show(message, ToastAndroid.SHORT);
    } else {
      console.log('Toast:', message);
    }
  };
  
  const showWidget = isListening || transcriptText || isProcessing || aiResponse;

  return (
    <View style={styles.container}>
      {showWidget && (
        <View style={[styles.widget, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.widgetHeader}>
            <Text style={[styles.widgetTitle, { color: colors.text }]}>Karigar Assistant</Text>
            <TouchableOpacity 
              style={styles.closeBtn} 
              onPress={() => {
                 setTranscriptText('');
                 setAiResponse('');
                 if (isListening) stopRecording();
              }}
            >
              <Ionicons name="close" size={24} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>
          
          <View style={styles.chatArea}>
            {transcriptText ? (
              <View style={styles.userBubble}>
                <Text style={styles.userText}>{transcriptText}</Text>
              </View>
            ) : (
              isListening && (
                <View style={{ flexDirection: 'row', alignItems: 'center', marginVertical: 12 }}>
                  <ListeningAnimation color={colors.primary} />
                  <Text style={[styles.listeningText, { color: colors.textSecondary, marginLeft: 8 }]}>Listening...</Text>
                </View>
              )
            )}
            
            {isProcessing && !aiResponse && (
              <View style={styles.aiBubble}>
                <ActivityIndicator size="small" color="#FFFFFF" style={{ marginRight: 8 }} />
                <Text style={styles.aiText}>Processing your request...</Text>
              </View>
            )}
            
            {aiResponse ? (
              <View style={styles.aiBubble}>
                <Text style={styles.aiText}>{aiResponse}</Text>
              </View>
            ) : null}
          </View>
        </View>
      )}

      <TouchableOpacity 
        style={[
          styles.fab, 
          { backgroundColor: isListening ? '#EF4444' : '#F97316' }
        ]} 
        onPress={handleVoicePress}
        disabled={isProcessing}
        accessibilityLabel={t('voice.micA11y') || 'Microphone'}
      >
        <Ionicons name={isListening ? "stop" : "mic"} size={30} color="#FFFFFF" />
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    bottom: Platform.OS === 'ios' ? 95 : 85,
    right: 24,
    zIndex: 9999,
    alignItems: 'flex-end',
  },
  widget: {
    width: 380,
    maxWidth: '90%',
    minHeight: 180,
    borderRadius: 24,
    borderWidth: 1,
    padding: 24,
    marginBottom: 16,
    elevation: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.2,
    shadowRadius: 16,
  },
  widgetHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  widgetTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  closeBtn: {
    padding: 4,
  },
  chatArea: {
    flexDirection: 'column',
  },
  userBubble: {
    alignSelf: 'flex-end',
    backgroundColor: '#F3F4F6',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomRightRadius: 4,
    marginBottom: 16,
    maxWidth: '85%',
  },
  userText: {
    color: '#1F2937',
    fontSize: 15,
  },
  aiBubble: {
    alignSelf: 'flex-start',
    backgroundColor: '#394B72',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderRadius: 16,
    borderBottomLeftRadius: 4,
    marginBottom: 12,
    maxWidth: '90%',
    flexDirection: 'row',
    alignItems: 'center',
  },
  aiText: {
    color: '#FFFFFF',
    fontSize: 15,
    lineHeight: 22,
  },
  listeningText: {
    fontSize: 15,
    fontStyle: 'italic',
  },
  fab: {
    width: 60,
    height: 60,
    borderRadius: 30,
    alignItems: 'center',
    justifyContent: 'center',
    elevation: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 10,
  }
});
