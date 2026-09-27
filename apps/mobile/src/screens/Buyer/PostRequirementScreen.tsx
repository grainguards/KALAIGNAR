import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, TextInput, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrderStore } from '../../store/orderStore';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n/useTranslation';

export default function BuyerPostScreen({ navigation }: any) {
  const { role } = useAuthStore();
  const { postRequirement } = useOrderStore();
  const { t } = useTranslation();
  
  const [productType, setProductType] = useState('');
  const [quantity, setQuantity] = useState('');
  const [budget, setBudget] = useState('');
  const [isRecording, setIsRecording] = useState(false);

  const startVoiceInput = (field: 'productType' | 'quantity' | 'budget') => {
    if (Platform.OS === 'web') {
      const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
      if (SpeechRecognition) {
        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        setIsRecording(true);
        recognition.onresult = (event: any) => {
          const transcript = event.results[0][0].transcript;
          if (field === 'productType') setProductType(transcript);
          if (field === 'quantity') setQuantity(transcript.replace(/\D/g, ''));
          if (field === 'budget') setBudget(transcript.replace(/\D/g, ''));
          setIsRecording(false);
        };
        recognition.onerror = () => setIsRecording(false);
        recognition.onend = () => setIsRecording(false);
        recognition.start();
      } else {
        alert("Voice input not supported in this browser.");
      }
    }
  };

  const handlePost = () => {
    if (!productType || !quantity || !budget) return alert(t('validation.allFieldsRequired'));
    postRequirement({
      productType,
      totalQuantity: parseInt(quantity, 10),
      budgetPerUnit: parseInt(budget, 10),
      deadline: new Date(Date.now() + 30 * 86400000), // 30 days from now
    });
    alert('Requirement Posted & Matched with Artisans!');
    navigation.navigate('Marketplace');
  };

  if (role !== 'BUYER' && role !== 'GOVT') {
    return (
      <View style={s.container}>
        <Text style={s.title}>{t('Buyer Access Only')}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.title}>{t('Post a Bulk Requirement')}</Text>
      <Text style={s.subtitle}>{t("We'll automatically match and group artisans to fulfill your order capacity.")}</Text>

      <View style={s.form}>
        <View style={s.inputGroup}>
          <Text style={s.label}>{t('catalog.craftType')}</Text>
          <View style={s.inputRow}>
            <TextInput style={s.input} value={productType} onChangeText={setProductType} placeholder="e.g. Terracotta Pots" />
            <TouchableOpacity onPress={() => startVoiceInput('productType')} style={s.micBtn}>
              <Ionicons name="mic" size={24} color={isRecording ? 'red' : 'gray'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.inputGroup}>
          <Text style={s.label}>{t('catalog.quantity')}</Text>
          <View style={s.inputRow}>
            <TextInput style={s.input} value={quantity} onChangeText={setQuantity} placeholder="e.g. 1000" keyboardType="numeric" />
            <TouchableOpacity onPress={() => startVoiceInput('quantity')} style={s.micBtn}>
              <Ionicons name="mic" size={24} color={isRecording ? 'red' : 'gray'} />
            </TouchableOpacity>
          </View>
        </View>

        <View style={s.inputGroup}>
          <Text style={s.label}>{t('pricing.suggestedPrice')} (₹)</Text>
          <View style={s.inputRow}>
            <TextInput style={s.input} value={budget} onChangeText={setBudget} placeholder="e.g. 50" keyboardType="numeric" />
            <TouchableOpacity onPress={() => startVoiceInput('budget')} style={s.micBtn}>
              <Ionicons name="mic" size={24} color={isRecording ? 'red' : 'gray'} />
            </TouchableOpacity>
          </View>
        </View>

        <TouchableOpacity style={s.submitBtn} onPress={handlePost}>
          <Text style={s.submitBtnText}>{t('Match & Post Requirement')}</Text>
          <Ionicons name="checkmark-circle" size={20} color="white" style={{ marginLeft: 8 }} />
        </TouchableOpacity>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { padding: 32, backgroundColor: '#FDFBF7', flexGrow: 1, alignItems: 'center' },
  title: { fontSize: 28, fontWeight: 'bold', color: '#2A2624', marginBottom: 8 },
  subtitle: { fontSize: 16, color: '#6B6562', textAlign: 'center', marginBottom: 32, maxWidth: 600 },
  form: { width: '100%', maxWidth: 500 },
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: 'bold', color: '#444', marginBottom: 8 },
  inputRow: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#ddd', borderRadius: 12, paddingHorizontal: 16 },
  input: { flex: 1, height: 50, fontSize: 16 },
  micBtn: { padding: 10 },
  submitBtn: { backgroundColor: '#16A34A', padding: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginTop: 12 },
  submitBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 }
});
