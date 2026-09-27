import React, { useState, useRef, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, KeyboardAvoidingView, Platform, StyleSheet, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import { API_URL } from '../../services/api';
import { useTranslation } from '../../i18n/useTranslation';

export default function AssistantScreen({ navigation }: any) {
  const { t, lang } = useTranslation();
  const [messages, setMessages] = useState([
    { id: '1', text: 'Namaste! 🙏 I am Kala Saathi, your business assistant.\n\nI can help you with:\n• Product pricing\n• Photography tips\n• Writing descriptions\n• Finding buyers\n\nHow can I help you today?', sender: 'ai' }
  ]);
  const [input, setInput] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const scrollRef = useRef<ScrollView>(null);

  const sendMessage = async (textToUse?: string) => {
    const text = (textToUse || input).trim();
    if (!text || isLoading) return;

    const userMsg = { id: Date.now().toString(), text, sender: 'user' };
    const newMessages = [...messages, userMsg];
    setMessages(newMessages);
    setInput('');
    setIsLoading(true);

    setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);

    try {
      const response = await axios.post(`${API_URL}/ai/chat`, {
        messages: newMessages,
        language: lang
      });
      
      const aiReply = { id: (Date.now() + 1).toString(), text: response.data.reply, sender: 'ai' };
      setMessages(prev => [...prev, aiReply]);
    } catch (error) {
      setMessages(prev => [...prev, { id: Date.now().toString(), text: t('modals.errorOccurred'), sender: 'ai' }]);
    } finally {
      setIsLoading(false);
      setTimeout(() => scrollRef.current?.scrollToEnd({ animated: true }), 100);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={{ padding: 4 }} accessibilityRole="button" accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color="#2A2624" />
        </TouchableOpacity>
        <Ionicons name="sparkles" size={24} color="#C36F50" />
        <View style={{ flex: 1 }}>
          <Text style={s.headerTitle}>Kala Saathi</Text>
          <Text style={s.headerSub}>{t('dashboard.aiAssistant')}</Text>
        </View>
        <TouchableOpacity 
          style={{ backgroundColor: '#10B981', paddingHorizontal: 12, paddingVertical: 8, borderRadius: 8, flexDirection: 'row', alignItems: 'center' }} 
          onPress={() => navigation.navigate('OrderDetail' as any)}
        >
          <Ionicons name="shield-checkmark" size={16} color="white" />
          <Text style={{ color: 'white', fontWeight: 'bold', marginLeft: 6, fontSize: 14 }}>Escrow</Text>
        </TouchableOpacity>
      </View>

      {/* Messages */}
      <ScrollView ref={scrollRef} style={s.messages} contentContainerStyle={{ paddingBottom: 16 }} showsVerticalScrollIndicator={false}>
        {messages.map((m) => (
          <View key={m.id} style={[s.bubble, m.sender === 'user' ? s.userBubble : s.aiBubble]}>
            {m.sender === 'ai' && <Ionicons name="sparkles" size={14} color="#C36F50" style={{ marginBottom: 4 }} />}
            <Text style={[s.bubbleText, m.sender === 'user' ? s.userText : s.aiText]}>
              {m.text}
            </Text>
          </View>
        ))}
        {isLoading && (
          <View style={[s.bubble, s.aiBubble, { paddingVertical: 12, width: 60, alignItems: 'center' }]}>
            <ActivityIndicator size="small" color="#C36F50" />
          </View>
        )}
      </ScrollView>

      {/* Quick Replies */}
      <View style={{ maxHeight: 50, marginBottom: 8 }}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} style={s.quickRow} contentContainerStyle={{ gap: 8, paddingHorizontal: 16 }}>
          {[t('pricing.suggestedPrice'), t('capture.title'), t('marketplace.contactArtisan'), t('catalog.detailedDescription')].map((qr, i) => (
            <TouchableOpacity key={i} style={s.quickBtn} onPress={() => sendMessage(qr)} disabled={isLoading}>
              <Text style={s.quickText}>{qr}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      {/* Input */}
      <View style={s.inputRow}>
        <TextInput
          style={s.textInput}
          placeholder={t('messages.typeMessage')}
          value={input}
          onChangeText={setInput}
          onSubmitEditing={() => sendMessage()}
        />
        <TouchableOpacity style={s.sendBtn} onPress={() => sendMessage()} disabled={!input.trim() || isLoading}>
          <Ionicons name="arrow-up" size={20} color="white" />
        </TouchableOpacity>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  header: { flexDirection: 'row', alignItems: 'center', padding: 16, paddingTop: 48, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#eee', gap: 10 },
  headerTitle: { fontSize: 18, fontWeight: 'bold', color: '#2A2624' },
  headerSub: { fontSize: 12, color: '#6B6562' },
  messages: { flex: 1, paddingHorizontal: 16, paddingTop: 12 },
  bubble: { maxWidth: '82%', borderRadius: 16, padding: 14, marginBottom: 10 },
  userBubble: { backgroundColor: '#C36F50', alignSelf: 'flex-end', borderBottomRightRadius: 4 },
  aiBubble: { backgroundColor: 'white', alignSelf: 'flex-start', borderBottomLeftRadius: 4, borderWidth: 1, borderColor: '#f0f0f0' },
  bubbleText: { fontSize: 15, lineHeight: 22 },
  userText: { color: 'white' },
  aiText: { color: '#2A2624' },
  quickRow: { maxHeight: 50, borderTopWidth: 1, borderTopColor: '#eee', paddingVertical: 8 },
  quickBtn: { backgroundColor: '#FDF2EE', paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20, borderWidth: 1, borderColor: '#E0B7A3' },
  quickText: { color: '#C36F50', fontSize: 13, fontWeight: '500' },
  inputRow: { padding: 12, backgroundColor: 'white', borderTopWidth: 1, borderTopColor: '#eee', flexDirection: 'row', alignItems: 'center', gap: 8 },
  textInput: { flex: 1, backgroundColor: '#f5f5f5', borderRadius: 24, paddingHorizontal: 16, paddingVertical: 12, fontSize: 16, color: '#2A2624' },
  sendBtn: { backgroundColor: '#C36F50', width: 48, height: 48, borderRadius: 24, alignItems: 'center', justifyContent: 'center' },
});
