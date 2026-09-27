import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
  StyleSheet,
  KeyboardAvoidingView,
  Platform,
  Image,
  Modal,
  ActivityIndicator
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/useTranslation';
import { useTheme } from '../../theme/useTheme';
import { useAuthStore } from '../../store/authStore';
import * as ImagePicker from 'expo-image-picker';
import * as DocumentPicker from 'expo-document-picker';
import { ttsService } from '../../services/ttsService';
import {
  translateEnglishToLocal,
  normalizeArtisanVoiceNote,
  mapLanguageToSpeechLocale,
  NegotiationResponse
} from '../../services/voiceNegotiationService';
import { sttService } from '../../services/sttService';

export interface NegotiationDraftState {
  rawSpeech: string;
  englishDraft: string;
  localLanguageMeaning: string;
}

export default function MessagesScreen({ route, navigation }: any) {
  const { role } = useAuthStore();
  const { colors, isDark } = useTheme();
  const defaultContact = role === 'BUYER' ? 'Ramesh Kumawat' : 'Fabindia Corp';
  const {
    contactName = defaultContact,
    contactRole,
    avatarBg = '#EA580C',
    initialMessages,
    isOnline = true,
    verified = false
  } = route.params || {};

  const { t, currentLanguage, supportedLanguages } = useTranslation();
  const scrollViewRef = useRef<ScrollView>(null);
  
  const langList = supportedLanguages || SUPPORTED_LANGUAGES;
  const currentLangObj = langList.find(l => l.code === currentLanguage) || langList[0];

  const [inputText, setInputText] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [showAttachOptions, setShowAttachOptions] = useState(false);
  const [showProductModal, setShowProductModal] = useState(false);

  // Multilingual Voice-to-B2B Negotiation States
  const [voiceLanguage, setVoiceLanguage] = useState<string>(currentLanguage || 'ta');
  const [isVoiceListening, setIsVoiceListening] = useState(false);
  const [capturedSpeech, setCapturedSpeech] = useState('');
  const [isNormalizing, setIsNormalizing] = useState(false);
  const [negotiationDraft, setNegotiationDraft] = useState<NegotiationDraftState | null>(null);
  const [toastError, setToastError] = useState<string | null>(null);

  // Sync voiceLanguage when app language changes
  useEffect(() => {
    if (currentLanguage) {
      setVoiceLanguage(currentLanguage);
    }
  }, [currentLanguage]);

  const selectedVoiceLangObj = langList.find(l => l.code === voiceLanguage) || currentLangObj;


  // Incoming TTS Audio Read-Out States
  const [playingAudioMsgId, setPlayingAudioMsgId] = useState<string | null>(null);
  const [translatingAudioMsgId, setTranslatingAudioMsgId] = useState<string | null>(null);
  const [translatedCache, setTranslatedCache] = useState<Record<string, string>>({});

  // Clean up audio playback & STT on unmount
  useEffect(() => {
    return () => {
      ttsService.stop();
      sttService.stopListening();
    };
  }, []);

  // Initial messages based on who we are chatting with and our role
  const [messages, setMessages] = useState<any[]>(() => {
    if (initialMessages && Array.isArray(initialMessages) && initialMessages.length > 0) {
      return initialMessages;
    }
    return role === 'BUYER' ? [
      {
        id: '1',
        type: 'text',
        text: 'Hello Ramesh! We reviewed your latest catalog. We are looking to source 50 pieces of the blue Ikat silk saree.',
        sender: 'me',
        time: '10:00 AM'
      },
      {
        id: '2',
        type: 'text',
        text: 'Do you have enough raw materials to fulfill this within 3 weeks?',
        sender: 'me',
        time: '10:02 AM'
      },
      {
        id: '3',
        type: 'text',
        text: 'Yes sir! I have the materials ready and can start production immediately. It will be ready in 2 weeks.',
        sender: 'them',
        time: '10:15 AM'
      }
    ] : [
      {
        id: '1',
        type: 'text',
        text: contactName === 'Fabindia Corp' 
          ? 'Hello Ramesh! We reviewed your latest catalog. We are looking to source 50 pieces of the blue Ikat silk saree.'
          : 'Hi! I saw your recent upload. Can you customize the border color to red?',
        sender: 'them',
        time: '10:00 AM'
      },
      {
        id: '2',
        type: 'text',
        text: contactName === 'Fabindia Corp' 
          ? 'Do you have enough raw materials to fulfill this within 3 weeks?'
          : 'Let me know the price difference.',
        sender: 'them',
        time: '10:02 AM'
      }
    ];
  });

  const API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || '';

  // Buyer auto-reply simulation using active gemini-3.8-flash model
  const triggerAutoReply = async (triggerType: string, triggerContent: string = '', base64Data: string = '', fileUri: string = '') => {
    setIsTyping(true);
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    let replyText = "";
    let isSuccess = false;

    try {
      let prompt = `You are ${contactName}, a B2B buyer on an Indian artisan marketplace called Karigar AI. You are chatting with an artisan to source products. Keep your response short, natural, professional, and conversational (1-2 sentences max). Do not use asterisks or markdown.\n\nRecent chat history:\n`;
      
      const recentMessages = messages.slice(-4);
      recentMessages.forEach(m => {
         prompt += `${m.sender === 'me' ? 'Artisan' : contactName}: ${m.type === 'text' ? m.text : `[Sent a ${m.type}]`}\n`;
      });
      
      if (triggerType === 'image') {
        prompt += `\nArtisan just sent an image attached below. Please carefully analyze the contents, graphs, or items in the image and reply directly to what you see in it as ${contactName}:`;
      } else {
        prompt += `\nArtisan just sent: ${triggerType === 'text' ? triggerContent : `[${triggerType}] ${triggerContent}`}\nReply as ${contactName}:`;
      }

      let promptParts: any[] = [{ text: prompt }];
      let rawBase64 = base64Data;
      
      if (!rawBase64 && triggerType === 'image' && fileUri) {
        try {
          const res = await fetch(fileUri);
          const blob = await res.blob();
          rawBase64 = await new Promise((resolve) => {
            const reader = new FileReader();
            reader.onloadend = () => {
              const res = reader.result as string;
              resolve(res.includes(',') ? res.split(',')[1] : res);
            };
            reader.readAsDataURL(blob);
          });
        } catch (e) {
          console.warn('Could not extract base64 from image blob uri:', e);
        }
      }

      if (rawBase64 && triggerType === 'image') {
        promptParts.push({
          inline_data: {
            mime_type: 'image/jpeg',
            data: rawBase64
          }
        });
      }

      const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-3.8-flash:generateContent?key=${API_KEY}`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: promptParts }],
          generationConfig: { maxOutputTokens: 120, temperature: 0.7 }
        })
      });

      const data = await response.json();
      if (data?.candidates?.[0]?.content?.parts?.[0]?.text) {
        replyText = data.candidates[0].content.parts[0].text.trim();
        isSuccess = true;
      }
    } catch (err) {
      console.log('Gemini auto-reply API error, falling back to smart simulation:', err);
    }

    if (!isSuccess || !replyText) {
      if (triggerType === 'image') {
        replyText = "Thanks for sharing the product image! The weave and colors look vibrant. We'd love to place a sample order.";
      } else if (triggerType === 'document') {
        replyText = "Thank you for sharing the document/invoice. Our procurement team will review the terms and get back by tomorrow morning.";
      } else if (triggerType === 'catalog') {
        replyText = `We saw your catalog item "${triggerContent}". The pricing is quite competitive. Can you fulfill an order of 30 units?`;
      } else {
        replyText = "Understood! That timeline works well for us. We will prepare the formal purchase order.";
      }
    }

    const replyMsg = {
      id: (Date.now() + 1).toString(),
      type: 'text',
      text: replyText,
      sender: 'them',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, replyMsg]);
    setIsTyping(false);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
  };

  // 1. Incoming Audio Read-Out Handler (TTS in artisan's native language)
  const handlePlayIncomingAudio = async (msg: any) => {
    if (playingAudioMsgId === msg.id) {
      ttsService.stop();
      setPlayingAudioMsgId(null);
      return;
    }

    ttsService.stop();

    const targetLang = voiceLanguage || currentLanguage || 'ta';
    const targetLocale = mapLanguageToSpeechLocale(targetLang);
    const targetLangObj = langList.find(l => l.code === targetLang) || currentLangObj;
    const targetName = targetLangObj.name || 'Tamil';

    let speechText = translatedCache[`${targetLang}_${msg.text}`];

    if (!speechText) {
      setTranslatingAudioMsgId(msg.id);
      speechText = await translateEnglishToLocal(msg.text, targetLang, targetName);
      setTranslatedCache(prev => ({ ...prev, [`${targetLang}_${msg.text}`]: speechText }));
      setTranslatingAudioMsgId(null);
    }

    setPlayingAudioMsgId(msg.id);
    ttsService.speak(
      msg.id,
      speechText,
      targetLocale,
      () => setPlayingAudioMsgId(msg.id),
      () => setPlayingAudioMsgId(null),
      () => setPlayingAudioMsgId(null)
    );
  };

  // 2. Outgoing Smart Voice Reply Handler (STT with Natural Pauses + JSON Normalization)
  const handleToggleVoiceRecording = async () => {
    if (isVoiceListening) {
      sttService.finalizeSpeech();
      setIsVoiceListening(false);
      return;
    }

    // Stop any active TTS audio playback
    ttsService.stop();
    setPlayingAudioMsgId(null);

    setCapturedSpeech('');
    setToastError(null);

    const started = await sttService.startListening(voiceLanguage, {
      onStart: () => {
        setIsVoiceListening(true);
      },
      onResult: async (transcript: string, isFinal: boolean) => {
        setCapturedSpeech(transcript);

        if (isFinal && transcript.trim()) {
          setIsVoiceListening(false);
          setIsNormalizing(true);
          try {
            const result = await normalizeArtisanVoiceNote(
              transcript,
              voiceLanguage,
              selectedVoiceLangObj.name
            );
            setNegotiationDraft({
              rawSpeech: transcript,
              englishDraft: result.englishDraft,
              localLanguageMeaning: result.localLanguageMeaning
            });
          } catch (e) {
            console.warn('Voice normalization error:', e);
          } finally {
            setIsNormalizing(false);
          }
        }
      },
      onError: (errCode: string) => {
        setIsVoiceListening(false);
        setToastError(t(errCode) || errCode);
      },
      onEnd: () => {
        setIsVoiceListening(false);
      }
    });

    if (!started) {
      setToastError(t('errors.micPermission'));
    }
  };

  // Playback the local language meaning so the artisan hears what will be sent
  const handlePlayBackTranslationAudio = (text: string) => {
    if (playingAudioMsgId === 'draft_audio') {
      ttsService.stop();
      setPlayingAudioMsgId(null);
      return;
    }

    ttsService.stop();
    setPlayingAudioMsgId('draft_audio');

    const targetLocale = mapLanguageToSpeechLocale(voiceLanguage || currentLanguage || 'ta');
    ttsService.speak(
      'draft_audio',
      text,
      targetLocale,
      () => setPlayingAudioMsgId('draft_audio'),
      () => setPlayingAudioMsgId(null),
      () => setPlayingAudioMsgId(null)
    );
  };

  // Confirm sending the normalized English message to the buyer
  const handleConfirmSendNegotiation = () => {
    if (!negotiationDraft) return;

    ttsService.stop();
    setPlayingAudioMsgId(null);

    const finalEnglish = negotiationDraft.englishDraft;
    setNegotiationDraft(null);

    const newMessage = {
      id: Date.now().toString(),
      type: 'text',
      text: finalEnglish,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages(prev => [...prev, newMessage]);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    triggerAutoReply('text', finalEnglish);
  };

  // Standard text send
  const sendMessage = () => {
    if (!inputText.trim()) return;
    
    ttsService.stop();
    setPlayingAudioMsgId(null);

    const userText = inputText.trim();
    const newMessage = {
      id: Date.now().toString(),
      type: 'text',
      text: userText,
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputText('');
    
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    triggerAutoReply('text', userText);
  };

  // Attachments
  const handleAttach = async (type: string) => {
    setShowAttachOptions(false);
    const newMsg: any = {
      id: Date.now().toString(),
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    if (type === 'image') {
      try {
        const result = await ImagePicker.launchImageLibraryAsync({
          mediaTypes: ImagePicker.MediaTypeOptions.Images,
          allowsEditing: true,
          quality: 0.8,
          base64: true
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          newMsg.type = 'image';
          newMsg.url = asset.uri;
          setMessages(prev => [...prev, newMsg]);
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
          triggerAutoReply('image', '', asset.base64 || '', asset.uri);
        }
      } catch (err) {
        console.log('Image picker error:', err);
      }
    } else if (type === 'camera') {
      try {
        const result = await ImagePicker.launchCameraAsync({
          allowsEditing: true,
          quality: 0.8,
          base64: true
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const asset = result.assets[0];
          newMsg.type = 'image';
          newMsg.url = asset.uri;
          setMessages(prev => [...prev, newMsg]);
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
          triggerAutoReply('image', '', asset.base64 || '', asset.uri);
        }
      } catch (err) {
        console.log('Camera error:', err);
      }
    } else if (type === 'document') {
      try {
        const result = await DocumentPicker.getDocumentAsync({
          type: '*/*',
          copyToCacheDirectory: true
        });

        if (!result.canceled && result.assets && result.assets.length > 0) {
          const doc = result.assets[0];
          newMsg.type = 'document';
          newMsg.text = doc.name;
          newMsg.size = doc.size ? `${(doc.size / 1024).toFixed(1)} KB` : '1.2 MB';
          setMessages(prev => [...prev, newMsg]);
          setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
          triggerAutoReply('document', doc.name);
        }
      } catch (err) {
        console.log('Doc picker error:', err);
      }
    } else if (type === 'catalog') {
      setShowProductModal(true);
    }
  };

  const sendSelectedProduct = (product: { name: string; price: string; image: string }) => {
    setShowProductModal(false);
    const newMsg = {
      id: Date.now().toString(),
      type: 'catalog',
      sender: 'me',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      text: product.name,
      price: product.price,
      url: product.image
    };
    setMessages(prev => [...prev, newMsg]);
    setTimeout(() => scrollViewRef.current?.scrollToEnd({ animated: true }), 100);
    triggerAutoReply('catalog', product.name);
  };

  return (
    <KeyboardAvoidingView 
      style={[s.container, { backgroundColor: isDark ? colors.background : '#ECE5DD' }]} 
      behavior={Platform.OS === 'ios' ? 'padding' : undefined}
    >
      {/* Header */}
      <View style={[s.header, { backgroundColor: colors.surface, borderBottomColor: colors.border }]}>
        <TouchableOpacity style={s.backBtn} onPress={() => navigation.goBack()} accessibilityLabel="Go back">
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        
        <View style={s.headerProfile}>
          <View style={[s.avatar, { backgroundColor: avatarBg }]}>
            <Text style={s.avatarText}>{contactName.charAt(0)}</Text>
          </View>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <Text style={[s.headerName, { color: colors.text }]} numberOfLines={1}>{contactName}</Text>
              {verified && (
                <Ionicons name="checkmark-circle" size={15} color="#10B981" style={{ marginLeft: 4 }} />
              )}
            </View>
            <Text style={[s.headerStatus, { color: isOnline ? '#10B981' : colors.textSecondary }]}>
              {contactRole ? `${contactRole} • ` : ''}{isOnline ? t('messages.online') : ''}
            </Text>
          </View>
        </View>
        
        <TouchableOpacity style={s.actionBtn}>
          <Ionicons name="call-outline" size={20} color={colors.text} />
        </TouchableOpacity>
        <TouchableOpacity style={s.actionBtn}>
          <Ionicons name="ellipsis-vertical" size={20} color={colors.text} />
        </TouchableOpacity>
      </View>

      {/* Chat Area */}
      <ScrollView 
        ref={scrollViewRef}
        style={s.chatArea} 
        contentContainerStyle={s.chatContent}
        onContentSizeChange={() => scrollViewRef.current?.scrollToEnd({ animated: true })}
      >
        <View style={[s.dateDivider, { backgroundColor: isDark ? '#1E293B' : 'rgba(255, 255, 255, 0.85)' }]}>
          <Text style={[s.dateText, { color: colors.textSecondary }]}>{t('common.date')}</Text>
        </View>

        {messages.map((msg) => {
          const isMe = msg.sender === 'me';
          const isPlayingThis = playingAudioMsgId === msg.id;
          const isTranslatingThis = translatingAudioMsgId === msg.id;

          return (
            <View
              key={msg.id}
              style={[
                s.messageRowContainer,
                isMe ? s.myMessageRow : s.theirMessageRow
              ]}
            >
              <View
                style={[
                  s.messageBubble,
                  isMe
                    ? [s.myMessage, { backgroundColor: isDark ? '#056162' : '#DCF8C6' }]
                    : [s.theirMessage, { backgroundColor: colors.surface }]
                ]}
              >
                {msg.type === 'audio' ? (
                  <View style={s.audioMessage}>
                    <Ionicons name="play-circle" size={28} color={isMe ? (isDark ? '#53BDEB' : '#056162') : colors.primary} />
                    <View style={[s.audioWave, { backgroundColor: isMe ? (isDark ? 'rgba(255,255,255,0.4)' : 'rgba(0,0,0,0.15)') : 'rgba(0,0,0,0.1)' }]} />
                    <Text style={[s.messageText, { color: colors.text, marginLeft: 8 }]}>
                      {msg.text}
                    </Text>
                  </View>
                ) : msg.type === 'image' ? (
                  <View>
                    <Image source={{ uri: msg.url }} style={s.msgImage} />
                    <Text style={[s.timeText, { color: colors.textSecondary, marginTop: 8 }]}>{msg.time}</Text>
                  </View>
                ) : msg.type === 'document' ? (
                  <View style={s.docMessage}>
                    <Ionicons name="document-text" size={32} color={isMe ? (isDark ? '#53BDEB' : '#056162') : colors.primary} />
                    <View style={{ marginLeft: 12 }}>
                      <Text style={[s.messageText, { color: colors.text, fontWeight: 'bold' }]}>{msg.text}</Text>
                      <Text style={[s.messageText, { color: colors.textSecondary, fontSize: 12 }]}>{msg.size} • PDF</Text>
                    </View>
                  </View>
                ) : msg.type === 'catalog' ? (
                  <View style={s.catalogMsg}>
                    <Image source={{ uri: msg.url }} style={s.catalogMsgImg} />
                    <View style={{ flex: 1 }}>
                      <Text style={[s.messageText, { color: colors.text, fontWeight: 'bold' }]} numberOfLines={1}>{msg.text}</Text>
                      <Text style={[s.messageText, { color: colors.primary, fontWeight: '600' }]}>{msg.price}</Text>
                    </View>
                  </View>
                ) : (
                  <Text style={[s.messageText, { color: colors.text }]}>
                    {msg.text}
                  </Text>
                )}
                
                {msg.type !== 'image' && (
                  <Text style={[s.timeText, { color: colors.textSecondary }]}>
                    {msg.time}
                  </Text>
                )}
              </View>

              {/* Speaker Read-Out Button for Buyer's English Messages */}
              {!isMe && msg.type === 'text' && (
                <TouchableOpacity
                  style={[
                    s.speakerBtn,
                    {
                      backgroundColor: isPlayingThis
                        ? isDark ? '#064E3B' : '#ECFDF5'
                        : isDark ? '#1E293B' : '#FFFFFF',
                      borderColor: isPlayingThis ? '#10B981' : colors.border
                    }
                  ]}
                  onPress={() => handlePlayIncomingAudio(msg)}
                  disabled={isTranslatingThis}
                  accessibilityLabel={t('chat.readOutAudio')}
                  hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}
                >
                  {isTranslatingThis ? (
                    <ActivityIndicator size="small" color={colors.primary} />
                  ) : isPlayingThis ? (
                    <Ionicons name="stop-circle" size={20} color="#EF4444" />
                  ) : (
                    <Ionicons name="volume-high-outline" size={20} color={colors.primary} />
                  )}
                </TouchableOpacity>
              )}
            </View>
          );
        })}

        {isTyping && (
          <View style={[s.messageBubble, s.theirMessage, { backgroundColor: colors.surface, paddingVertical: 14, paddingHorizontal: 16, width: 70 }]}>
            <View style={s.typingDots}>
              <View style={[s.dot, { backgroundColor: colors.textSecondary }]} />
              <View style={[s.dot, { backgroundColor: colors.textSecondary, opacity: 0.6 }]} />
              <View style={[s.dot, { backgroundColor: colors.textSecondary, opacity: 0.3 }]} />
            </View>
          </View>
        )}
      </ScrollView>

      {/* Catalog Selection Modal */}
      <Modal visible={showProductModal} transparent={true} animationType="slide">
        <View style={s.modalOverlay}>
          <View style={[s.modalContent, { backgroundColor: colors.surface }]}>
            <Text style={[s.modalTitle, { color: colors.text }]}>{t('messages.selectProductShare')}</Text>
            
            <TouchableOpacity style={[s.productOption, { borderBottomColor: colors.border }]} onPress={() => sendSelectedProduct({name: 'Handwoven Kanchipuram Silk', price: '₹8,500', image: 'https://picsum.photos/seed/karigar17/400/400'})}>
              <Image source={{uri: 'https://picsum.photos/seed/karigar18/400/400'}} style={s.productOptionImg} />
              <View>
                <Text style={[s.productOptionName, { color: colors.text }]}>Handwoven Kanchipuram Silk</Text>
                <Text style={s.productOptionPrice}>₹8,500</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[s.productOption, { borderBottomColor: colors.border }]} onPress={() => sendSelectedProduct({name: 'Blue Ikat Silk Saree', price: '₹4,500', image: 'https://picsum.photos/seed/karigar19/400/400'})}>
              <Image source={{uri: 'https://picsum.photos/seed/karigar20/400/400'}} style={s.productOptionImg} />
              <View>
                <Text style={[s.productOptionName, { color: colors.text }]}>Blue Ikat Silk Saree</Text>
                <Text style={s.productOptionPrice}>₹4,500</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[s.productOption, { borderBottomColor: colors.border }]} onPress={() => sendSelectedProduct({name: 'Terracotta Water Vessel', price: '₹750', image: 'https://picsum.photos/seed/karigar21/400/400'})}>
              <Image source={{uri: 'https://picsum.photos/seed/karigar22/400/400'}} style={s.productOptionImg} />
              <View>
                <Text style={[s.productOptionName, { color: colors.text }]}>Terracotta Water Vessel</Text>
                <Text style={s.productOptionPrice}>₹750</Text>
              </View>
            </TouchableOpacity>

            <TouchableOpacity style={[s.productOption, { borderBottomColor: colors.border }]} onPress={() => sendSelectedProduct({name: 'Cotton Embroidered Kurti', price: '₹2,200', image: 'https://picsum.photos/seed/karigar23/400/400'})}>
              <Image source={{uri: 'https://picsum.photos/seed/karigar24/400/400'}} style={s.productOptionImg} />
              <View>
                <Text style={[s.productOptionName, { color: colors.text }]}>Cotton Embroidered Kurti</Text>
                <Text style={s.productOptionPrice}>₹2,200</Text>
              </View>
            </TouchableOpacity>
            
            <TouchableOpacity style={s.closeModalBtn} onPress={() => setShowProductModal(false)}>
              <Text style={[s.closeModalText, { color: colors.primary }]}>{t('common.cancel')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>

      {/* Floating Error Toast */}
      {toastError && (
        <View style={s.toastBanner}>
          <Ionicons name="alert-circle" size={18} color="white" />
          <Text style={s.toastText}>{toastError}</Text>
          <TouchableOpacity onPress={() => setToastError(null)} style={{ marginLeft: 8 }}>
            <Ionicons name="close" size={16} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Outgoing Voice Listening State Banner */}
      {isVoiceListening && (
        <View style={[s.listeningBanner, { backgroundColor: colors.surface, borderColor: '#EA580C' }]}>
          <View style={s.listeningPulseIcon}>
            <Ionicons name="mic" size={24} color="#EA580C" />
          </View>
          <View style={{ flex: 1, marginHorizontal: 12 }}>
            <Text style={[s.listeningTitle, { color: '#EA580C' }]}>{t('chat.listening')}</Text>
            <Text style={[s.listeningSubtitle, { color: colors.textSecondary }]}>
              {currentLangObj.name} ({mapLanguageToSpeechLocale(currentLanguage)})
            </Text>
            {capturedSpeech ? (
              <Text style={[s.capturedText, { color: colors.text }]} numberOfLines={2}>
                "{capturedSpeech}"
              </Text>
            ) : (
              <Text style={[s.capturedText, { color: colors.textMuted }]}>
                {t('chat.holdToTalk')}...
              </Text>
            )}
          </View>
          <TouchableOpacity
            style={s.stopListeningBtn}
            onPress={() => sttService.finalizeSpeech()}
            accessibilityLabel={t('chat.stopListening')}
          >
            <Ionicons name="checkmark" size={20} color="white" />
          </TouchableOpacity>
        </View>
      )}

      {/* Normalizing AI Status Indicator */}
      {isNormalizing && (
        <View style={[s.normalizingBanner, { backgroundColor: colors.surface, borderColor: colors.primary }]}>
          <ActivityIndicator size="small" color={colors.primary} />
          <Text style={[s.normalizingText, { color: colors.text }]}>
            {t('chat.translating')}
          </Text>
        </View>
      )}

      {/* Review & Send UI Card (AI Negotiation Draft) */}
      {negotiationDraft && (
        <View style={[s.reviewCard, { backgroundColor: colors.surface, borderColor: colors.border }]}>
          {/* Card Header */}
          <View style={s.reviewCardHeader}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
              <Ionicons name="sparkles" size={18} color="#EA580C" />
              <Text style={[s.reviewCardTitle, { color: colors.text }]}>
                {t('chat.aiNegotiationPreview')}
              </Text>
            </View>
            <TouchableOpacity onPress={() => setNegotiationDraft(null)} hitSlop={{ top: 8, bottom: 8, left: 8, right: 8 }}>
              <Ionicons name="close" size={20} color={colors.textSecondary} />
            </TouchableOpacity>
          </View>

          {/* Section 1: Finalized English message to be sent to buyer */}
          <View style={[s.englishPreviewBox, { backgroundColor: isDark ? '#0F172A' : '#F8FAFC', borderColor: colors.border }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={[s.reviewSectionLabel, { color: colors.textSecondary }]}>
                {t('chat.buyerWillReceive')}
              </Text>
              <View style={s.englishBadge}>
                <Text style={s.englishBadgeText}>ENGLISH</Text>
              </View>
            </View>
            <Text style={[s.formalEnglishText, { color: colors.text }]}>
              {negotiationDraft.englishDraft}
            </Text>
          </View>

          {/* Section 2: Local language meaning (Strictly Regional Translation, NO English) */}
          <View style={[s.backTransBox, { backgroundColor: isDark ? '#064E3B' : '#ECFDF5', borderColor: isDark ? '#059669' : '#A7F3D0' }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6 }}>
              <Text style={[s.reviewSectionLabel, { color: isDark ? '#34D399' : '#065F46' }]}>
                {t('chat.meaningInLocal')}
              </Text>
              <TouchableOpacity 
                onPress={() => handlePlayBackTranslationAudio(negotiationDraft.localLanguageMeaning)}
                style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}
                hitSlop={{ top: 6, bottom: 6, left: 6, right: 6 }}
              >
                <Ionicons 
                  name={playingAudioMsgId === 'draft_audio' ? "stop-circle" : "volume-high"} 
                  size={16} 
                  color={isDark ? '#34D399' : '#059669'} 
                />
                <Text style={{ fontSize: 11, fontWeight: '700', color: isDark ? '#34D399' : '#059669' }}>
                  {playingAudioMsgId === 'draft_audio' ? t('chat.playingAudio') : t('chat.readOutAudio')}
                </Text>
              </TouchableOpacity>
            </View>
            <Text style={[s.backTransText, { color: isDark ? '#E2E8F0' : '#064E3B' }]}>
              {negotiationDraft.localLanguageMeaning}
            </Text>
          </View>

          {/* Review Action Buttons */}
          <View style={s.reviewActionsRow}>
            <TouchableOpacity
              style={[s.reviewCancelBtn, { borderColor: colors.border }]}
              onPress={() => setNegotiationDraft(null)}
            >
              <Ionicons name="close-circle-outline" size={16} color={colors.textSecondary} style={{ marginRight: 4 }} />
              <Text style={[s.reviewCancelBtnText, { color: colors.textSecondary }]}>{t('chat.cancel')}</Text>
            </TouchableOpacity>

            <TouchableOpacity
              style={[s.reviewSendBtn, { backgroundColor: colors.primary }]}
              onPress={handleConfirmSendNegotiation}
            >
              <Ionicons name="send" size={16} color="white" style={{ marginRight: 6 }} />
              <Text style={s.reviewSendBtnText}>{t('chat.confirmSend')}</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Input Area */}
      <View style={[s.inputAreaWrapper, { backgroundColor: colors.surface, borderTopColor: colors.border, borderTopWidth: 1 }]}>
        {/* Language Selection Pills (Craft Story & Tradition parity) */}
        <View style={{ paddingHorizontal: 16, paddingTop: 8, paddingBottom: 6 }}>
          <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Ionicons name="mic-outline" size={13} color={colors.primary} />
              <Text style={{ fontSize: 11, fontWeight: '700', color: colors.textSecondary }}>
                {t('studio.speech_lang') || 'Spoken Language'}: <Text style={{ color: colors.primary }}>{selectedVoiceLangObj.nativeName} ({selectedVoiceLangObj.name})</Text>
              </Text>
            </View>
            <Text style={{ fontSize: 10, color: colors.primary, fontWeight: '700' }}>
              10 Indian Languages
            </Text>
          </View>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 6, paddingVertical: 2 }}>
            {langList.map((l) => {
              const isSelected = voiceLanguage === l.code || voiceLanguage === l.name;
              return (
                <TouchableOpacity
                  key={l.code}
                  style={[
                    { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 14, borderWidth: 1, borderColor: colors.border, backgroundColor: isDark ? '#1E293B' : '#F1F5F9' },
                    isSelected && { backgroundColor: isDark ? '#431407' : '#FFEDD5', borderColor: colors.primary },
                  ]}
                  onPress={() => {
                    setVoiceLanguage(l.code);
                    if (isVoiceListening) {
                      sttService.finalizeSpeech();
                      setIsVoiceListening(false);
                    }
                  }}
                >
                  <Text style={[{ fontSize: 11, fontWeight: '500', color: colors.textSecondary }, isSelected && { color: colors.primary, fontWeight: '700' }]}>
                    {l.nativeName} {l.name !== l.nativeName ? `(${l.name})` : ''}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </ScrollView>
        </View>

        {/* Live Listening Banner */}
        {isVoiceListening && (
          <View style={{ marginHorizontal: 16, marginBottom: 8, padding: 10, borderRadius: 10, backgroundColor: isDark ? '#2D2013' : '#FEF3C7', borderWidth: 1, borderColor: isDark ? '#78350F' : '#FDE68A' }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', marginBottom: 4 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
                <View style={{ width: 8, height: 8, borderRadius: 4, backgroundColor: '#DC2626' }} />
                <Text style={{ fontSize: 12, fontWeight: '700', color: isDark ? '#FDE68A' : '#92400E' }}>
                  {t('chat.listening')} ({selectedVoiceLangObj.nativeName})
                </Text>
              </View>
              <Text style={{ fontSize: 11, color: isDark ? '#FDE68A' : '#92400E' }}>
                Tap Red Mic to finish
              </Text>
            </View>
            <Text style={{ fontSize: 13, color: isDark ? '#FDE68A' : '#78350F', fontStyle: capturedSpeech ? 'normal' : 'italic' }}>
              {capturedSpeech ? `"${capturedSpeech}"` : 'Speak now in your language...'}
            </Text>
          </View>
        )}

        {showAttachOptions && (
          <View style={[s.attachMenu, { backgroundColor: colors.surface, borderColor: colors.border, borderWidth: 1 }]}>
            <TouchableOpacity style={s.attachMenuItem} onPress={() => handleAttach('camera')}>
              <Ionicons name="camera" size={20} color="#EA580C" />
              <Text style={[s.attachMenuText, { color: colors.text }]}>{t('messages.takePhoto')}</Text>
            </TouchableOpacity>
            <View style={[s.menuDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={s.attachMenuItem} onPress={() => handleAttach('image')}>
              <Ionicons name="image" size={20} color="#3B82F6" />
              <Text style={[s.attachMenuText, { color: colors.text }]}>{t('messages.chooseGallery')}</Text>
            </TouchableOpacity>
            <View style={[s.menuDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={s.attachMenuItem} onPress={() => handleAttach('catalog')}>
              <Ionicons name="pricetag" size={20} color="#10B981" />
              <Text style={[s.attachMenuText, { color: colors.text }]}>{t('messages.shareCatalog')}</Text>
            </TouchableOpacity>
            <View style={[s.menuDivider, { backgroundColor: colors.border }]} />
            <TouchableOpacity style={s.attachMenuItem} onPress={() => handleAttach('document')}>
              <Ionicons name="document-text" size={20} color="#8B5CF6" />
              <Text style={[s.attachMenuText, { color: colors.text }]}>{t('messages.sendDocument')}</Text>
            </TouchableOpacity>
          </View>
        )}

        <View style={s.inputArea}>
          {/* Attach Button */}
          <TouchableOpacity
            style={[s.attachBtn, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}
            onPress={() => setShowAttachOptions(!showAttachOptions)}
          >
            <Ionicons name={showAttachOptions ? "close" : "add"} size={24} color={colors.textSecondary} />
          </TouchableOpacity>
          
          {/* Text Input */}
          <TextInput
            style={[
              s.input,
              { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', color: colors.text },
              isVoiceListening && s.inputListening
            ]}
            placeholder={
              isVoiceListening ? t('chat.listening') : t('messages.typeMessage')
            }
            placeholderTextColor={isVoiceListening ? colors.primary : colors.textMuted}
            value={inputText}
            onChangeText={setInputText}
            multiline
            editable={!isVoiceListening && !isNormalizing}
          />
          
          {/* Send text button */}
          {inputText.trim().length > 0 && (
            <TouchableOpacity 
              style={[
                s.sendBtn,
                { backgroundColor: colors.primary }
              ]} 
              onPress={sendMessage}
            >
              <Ionicons name="send" size={18} color="white" />
            </TouchableOpacity>
          )}

          {/* Prominent Smart Voice Reply Button (STT in artisan's native language) */}
          <TouchableOpacity 
            style={[
              s.voiceReplyBtn,
              { backgroundColor: isVoiceListening ? '#EF4444' : colors.primary },
              isNormalizing && { opacity: 0.6 }
            ]} 
            onPress={handleToggleVoiceRecording}
            disabled={isNormalizing}
            accessibilityLabel={t('chat.holdToTalk')}
            activeOpacity={0.8}
          >
            <Ionicons
              name={isVoiceListening ? "stop" : "mic"}
              size={22}
              color="white"
            />
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const s = StyleSheet.create({
  container: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingTop: Platform.OS === 'web' ? 20 : 50,
    paddingBottom: 16,
    paddingHorizontal: 16,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 4,
    zIndex: 10,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  backBtn: { padding: 8, marginRight: 6 },
  headerProfile: { flex: 1, flexDirection: 'row', alignItems: 'center' },
  avatar: { width: 42, height: 42, borderRadius: 21, justifyContent: 'center', alignItems: 'center', marginRight: 12 },
  avatarText: { color: 'white', fontSize: 18, fontWeight: 'bold' },
  headerName: { fontSize: 16, fontWeight: 'bold' },
  headerStatus: { fontSize: 12, fontWeight: '500', marginTop: 2 },
  actionBtn: { padding: 8, marginLeft: 6 },

  chatArea: { flex: 1, paddingHorizontal: 16 },
  chatContent: { paddingVertical: 20, paddingBottom: 40, maxWidth: 900, alignSelf: 'center', width: '100%' },
  
  dateDivider: { alignSelf: 'center', paddingHorizontal: 14, paddingVertical: 6, borderRadius: 16, marginBottom: 24, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.05, shadowRadius: 2, elevation: 1 },
  dateText: { fontSize: 12, fontWeight: '600' },

  messageRowContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    marginBottom: 12
  },
  myMessageRow: {
    justifyContent: 'flex-end'
  },
  theirMessageRow: {
    justifyContent: 'flex-start'
  },

  messageBubble: { maxWidth: '75%', padding: 12, borderRadius: 14, shadowColor: '#000', shadowOffset: { width: 0, height: 1 }, shadowOpacity: 0.08, shadowRadius: 2, elevation: 1 },
  myMessage: { borderBottomRightRadius: 2 },
  theirMessage: { borderBottomLeftRadius: 2 },
  
  messageText: { fontSize: 15, lineHeight: 22 },
  timeText: { fontSize: 10, marginTop: 4, alignSelf: 'flex-end' },

  speakerBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    borderWidth: 1,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 8,
    marginBottom: 2,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.08,
    shadowRadius: 2
  },

  inputAreaWrapper: { },
  inputArea: { flexDirection: 'row', alignItems: 'flex-end', backgroundColor: 'transparent', paddingHorizontal: 16, paddingVertical: 12, maxWidth: 900, alignSelf: 'center', width: '100%' },
  attachBtn: { padding: 12, borderRadius: 24, marginRight: 8 },
  input: { flex: 1, borderRadius: 24, paddingHorizontal: 20, paddingTop: 12, paddingBottom: 12, fontSize: 15, maxHeight: 120, minHeight: 46 },
  inputListening: { borderWidth: 1, borderColor: '#EA580C' },
  sendBtn: { padding: 12, borderRadius: 24, marginLeft: 8, justifyContent: 'center', alignItems: 'center', width: 46, height: 46 },
  voiceReplyBtn: {
    borderRadius: 24,
    marginLeft: 8,
    justifyContent: 'center',
    alignItems: 'center',
    width: 48,
    height: 48,
    elevation: 3,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4
  },
  
  typingDots: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', width: 30, height: 10 },
  dot: { width: 6, height: 6, borderRadius: 3 },

  audioMessage: { flexDirection: 'row', alignItems: 'center' },
  audioWave: { width: 100, height: 4, borderRadius: 2, marginLeft: 8 },

  msgImage: { width: 220, height: 220, borderRadius: 8, resizeMode: 'cover', marginTop: 4 },
  docMessage: { flexDirection: 'row', alignItems: 'center', padding: 12, borderRadius: 8, marginTop: 4 },
  catalogMsg: { flexDirection: 'row', alignItems: 'center', padding: 8, borderRadius: 8, width: 240, marginTop: 4 },
  catalogMsgImg: { width: 44, height: 44, borderRadius: 6, marginRight: 12 },
  
  attachMenu: { position: 'absolute', bottom: 70, left: 16, borderRadius: 12, padding: 8, elevation: 10, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.15, shadowRadius: 12, zIndex: 100, minWidth: 200 },
  attachMenuItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, paddingHorizontal: 12 },
  attachMenuText: { fontSize: 14, fontWeight: '600', marginLeft: 12 },
  menuDivider: { height: 1, marginHorizontal: 8 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { padding: 24, borderRadius: 16, width: '100%', maxWidth: 400, elevation: 5 },
  modalTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 16 },
  productOption: { flexDirection: 'row', alignItems: 'center', paddingVertical: 12, borderBottomWidth: 1 },
  productOptionImg: { width: 50, height: 50, borderRadius: 8, marginRight: 12 },
  productOptionName: { fontSize: 16, fontWeight: '600' },
  productOptionPrice: { fontSize: 14, color: '#10B981', marginTop: 4, fontWeight: '700' },
  closeModalBtn: { marginTop: 24, alignSelf: 'flex-end' },
  closeModalText: { fontWeight: 'bold', fontSize: 16 },

  // Voice Normalization Review Card
  reviewCard: {
    maxWidth: 900,
    alignSelf: 'center',
    width: '92%',
    marginVertical: 10,
    borderRadius: 16,
    padding: 16,
    borderWidth: 1.5,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 8
  },
  reviewCardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 12
  },
  reviewCardTitle: {
    fontSize: 15,
    fontWeight: '800'
  },
  englishPreviewBox: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 10
  },
  reviewSectionLabel: {
    fontSize: 12,
    fontWeight: '700',
    textTransform: 'uppercase',
    letterSpacing: 0.5
  },
  englishBadge: {
    backgroundColor: '#3B82F6',
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 4
  },
  englishBadgeText: {
    color: 'white',
    fontSize: 9,
    fontWeight: 'bold'
  },
  formalEnglishText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '500',
    marginTop: 2
  },
  backTransBox: {
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    marginBottom: 14
  },
  backTransText: {
    fontSize: 14,
    lineHeight: 20,
    fontWeight: '600'
  },
  reviewActionsRow: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    gap: 10
  },
  reviewCancelBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 10,
    borderWidth: 1
  },
  reviewCancelBtnText: {
    fontSize: 13,
    fontWeight: '600'
  },
  reviewSendBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2
  },
  reviewSendBtnText: {
    color: 'white',
    fontSize: 13,
    fontWeight: 'bold'
  },

  // Listening Banner
  listeningBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    maxWidth: 900,
    alignSelf: 'center',
    width: '92%',
    padding: 12,
    borderRadius: 14,
    borderWidth: 1.5,
    marginVertical: 6,
    elevation: 3
  },
  listeningPulseIcon: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: '#FFEDD5',
    alignItems: 'center',
    justifyContent: 'center'
  },
  listeningTitle: {
    fontSize: 14,
    fontWeight: 'bold'
  },
  listeningSubtitle: {
    fontSize: 11,
    marginTop: 1
  },
  capturedText: {
    fontSize: 13,
    fontWeight: '600',
    marginTop: 3
  },
  stopListeningBtn: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: '#10B981',
    alignItems: 'center',
    justifyContent: 'center'
  },

  // Normalizing Banner
  normalizingBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 10,
    maxWidth: 900,
    alignSelf: 'center',
    width: '92%',
    padding: 12,
    borderRadius: 12,
    borderWidth: 1,
    marginVertical: 6
  },
  normalizingText: {
    fontSize: 13,
    fontWeight: '600'
  },

  // Toast Banner
  toastBanner: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#EF4444',
    paddingHorizontal: 16,
    paddingVertical: 10,
    borderRadius: 10,
    marginHorizontal: 16,
    marginBottom: 6
  },
  toastText: {
    color: 'white',
    fontSize: 13,
    fontWeight: '600',
    flex: 1,
    marginLeft: 8
  }
});
