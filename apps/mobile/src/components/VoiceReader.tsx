import React from 'react';
import { TouchableOpacity, Platform, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../i18n/useTranslation';

export default function VoiceReader({ text, size = 24, color = '#394B72', style }: { text: string; size?: number; color?: string; style?: any }) {
  const { lang } = useTranslation();

  const speak = () => {
    if (Platform.OS === 'web') {
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.lang = lang === 'hi' ? 'hi-IN' : 'en-IN';
      utterance.rate = 0.9;
      window.speechSynthesis.cancel();
      window.speechSynthesis.speak(utterance);
    } else {
      // In a real app, use expo-speech here
      console.log('Speak on mobile:', text);
    }
  };

  return (
    <TouchableOpacity onPress={speak} style={[styles.btn, style]} accessibilityRole="button" accessibilityLabel="Read aloud">
      <Ionicons name="volume-medium" size={size} color={color} />
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  btn: {
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(195, 111, 80, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  }
});
