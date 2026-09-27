import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, StyleSheet, Platform, Linking, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const SCHEMES = [
  {
    id: '1',
    name: 'PM Vishwakarma Yojana',
    category: 'Artisans & Craftsmen',
    eligibility: 'Traditional artisans over 18 years old.',
    benefits: 'Collateral-free credit up to ₹3 lakh, ₹15,000 tool kit incentive, ₹500/day training stipend.',
    officialLink: 'https://pmvishwakarma.gov.in/',
    tags: ['Credit', 'Tools', 'Training']
  },
  {
    id: '2',
    name: 'Udyam / MSME Registration',
    category: 'MSME',
    eligibility: 'Any micro, small, or medium enterprise.',
    benefits: 'Priority sector lending, subsidy on patent registration, electricity bill concession.',
    officialLink: 'https://udyamregistration.gov.in/',
    tags: ['Registration', 'Subsidies']
  },
  {
    id: '3',
    name: 'PMMY (Mudra Yojana)',
    category: 'Loans',
    eligibility: 'Non-corporate small business owners.',
    benefits: 'Loans up to ₹10 lakh for income-generating activities without collateral.',
    officialLink: 'https://www.mudra.org.in/',
    tags: ['Loans', 'Micro-Finance']
  },
  {
    id: '4',
    name: 'National Handloom Development Programme',
    category: 'Handloom',
    eligibility: 'Handloom weavers, SHGs, and cooperatives.',
    benefits: 'Subsidized yarn, upgraded looms, marketing assistance, and life insurance coverage.',
    officialLink: 'http://handlooms.nic.in/',
    tags: ['Handloom', 'Raw Materials', 'Insurance']
  },
  {
    id: '5',
    name: 'Stand-Up India',
    category: 'Women Entrepreneurs',
    eligibility: 'SC/ST and/or women entrepreneurs above 18 years.',
    benefits: 'Bank loans between ₹10 lakh and ₹1 crore for setting up a greenfield enterprise.',
    officialLink: 'https://www.standupmitra.in/',
    tags: ['Loans', 'Women']
  },
  {
    id: '6',
    name: 'Artisan NGO Support & Insurance Claims',
    category: 'Insurance & NGOs',
    eligibility: 'Registered marginalized artisans and Self Help Groups (SHGs).',
    benefits: 'Life & health insurance claims up to ₹5 lakh, micro-loans, and raw material procurement support via partnering NGOs.',
    officialLink: 'https://www.india.gov.in/',
    tags: ['Insurance', 'NGO', 'Self Help']
  },
  {
    id: '7',
    name: 'SFURTI Scheme',
    category: 'Infrastructure',
    eligibility: 'Traditional artisans, NGOs, and cooperatives organizing into clusters.',
    benefits: 'Up to ₹5 crore funding for establishing common facility centers (CFCs) and marketing hubs.',
    officialLink: 'https://sfurti.msme.gov.in/',
    tags: ['Clusters', 'Funding', 'Infrastructure']
  },
  {
    id: '8',
    name: 'CGTMSE Credit Guarantee',
    category: 'Credit Security',
    eligibility: 'New and existing Micro and Small Enterprises.',
    benefits: 'Credit guarantee coverage up to 85% for collateral-free loans up to ₹5 crore.',
    officialLink: 'https://www.cgtmse.in/',
    tags: ['Guarantee', 'Collateral-Free', 'MSME']
  },
  {
    id: '9',
    name: 'Ambedkar Hastshilp Vikas Yojana',
    category: 'Handicrafts',
    eligibility: 'Handicraft artisan clusters and self-help groups.',
    benefits: 'Design and technology upgradation, marketing support, and cluster development funding.',
    officialLink: 'http://handicrafts.nic.in/',
    tags: ['Handicrafts', 'Design', 'Marketing']
  },
  {
    id: '10',
    name: 'KVIC PMEGP',
    category: 'Rural Enterprise',
    eligibility: 'Individuals above 18 years, VIII pass for projects above ₹10 Lakhs.',
    benefits: 'Subsidies up to 35% on projects costing up to ₹50 lakh in the manufacturing sector.',
    officialLink: 'https://www.kviconline.gov.in/pmegpeportal/pmegphome/index.jsp',
    tags: ['Subsidy', 'Rural', 'Manufacturing']
  }
];

export default function GovSchemesScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [matching, setMatching] = useState(false);
  const [filteredSchemes, setFilteredSchemes] = useState(SCHEMES);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const [audioError, setAudioError] = useState<string | null>(null);
  
  const handleAIMatch = () => {
    setMatching(true);
    setTimeout(() => {
      setFilteredSchemes([SCHEMES[0], SCHEMES[2], SCHEMES[1], SCHEMES[6]]);
      setMatching(false);
    }, 1500);
  };

  const playTTS = async (id: string, title: string, benefits: string) => {
    if (playingId === id) {
      // If already playing this one, we would stop it. But for simplicity, let's just let it play or use standard stop.
      if (Platform.OS === 'web' && window.speechSynthesis) {
         window.speechSynthesis.cancel();
      }
      setPlayingId(null);
      return;
    }

    setPlayingId(id);
    setAudioError(null);
    const textToRead = `${title}. Benefits include: ${benefits}`;

    try {
      // 1. Try ElevenLabs API
      const response = await fetch('https://api.elevenlabs.io/v1/text-to-speech/21m00Tcm4TlvDq8ikWAM', {
        method: 'POST',
        headers: {
          'xi-api-key': 'sk_c35a77cb4a16e6fd9202dabff100938ec67921a5670bf247',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          text: textToRead,
          model_id: "eleven_monolingual_v1",
          voice_settings: { stability: 0.5, similarity_boost: 0.5 }
        })
      });

      if (response.ok) {
        const audioBlob = await response.blob();
        if (Platform.OS === 'web') {
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          audio.onended = () => setPlayingId(null);
          audio.play();
          return;
        }
      } else {
        const errData = await response.json();
        console.warn("ElevenLabs error, falling back to native:", errData);
        // Fallback to Native Speech
        fallbackTTS(textToRead, id);
      }
    } catch (err) {
      console.warn("Audio error, falling back to native:", err);
      fallbackTTS(textToRead, id);
    }
  };

  const fallbackTTS = (text: string, id: string) => {
    if (Platform.OS === 'web' && window.speechSynthesis) {
      const utterance = new SpeechSynthesisUtterance(text);
      // Optional: Try to set an Indian English voice if available
      const voices = window.speechSynthesis.getVoices();
      const inVoice = voices.find(v => v.lang.includes('IN'));
      if (inVoice) utterance.voice = inVoice;
      
      utterance.onend = () => setPlayingId(null);
      utterance.onerror = () => setPlayingId(null);
      
      window.speechSynthesis.speak(utterance);
    } else {
      setAudioError("Audio not supported");
      setPlayingId(null);
    }
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#2A2624" />
        </TouchableOpacity>
        <Text style={s.title}>{t('Government Benefits')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <Text style={s.subtitle}>{t('Discover subsidies, loans, and support schemes for your business.')}</Text>
        
        {/* AI Match Button */}
        <TouchableOpacity style={s.aiBtnContainer} onPress={handleAIMatch} disabled={matching}>
          <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={s.aiBtn} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
            {matching ? (
              <ActivityIndicator color="white" />
            ) : (
              <>
                <Ionicons name="sparkles" size={20} color="white" style={{ marginRight: 8 }} />
                <Text style={s.aiBtnText}>{t('Find Schemes For Me')}</Text>
              </>
            )}
          </LinearGradient>
          <Text style={s.aiBtnHint}>{t('AI will match schemes based on your profile.')}</Text>
        </TouchableOpacity>

        <Text style={s.sectionTitle}>{t('Available Schemes')}</Text>
        
        {/* Scheme Grid */}
        <View style={s.gridContainer}>
          {filteredSchemes.map((scheme) => (
            <View key={scheme.id} style={s.schemeCard}>
              <View style={s.cardHeader}>
                <Text style={s.schemeCategory}>{t(scheme.category)}</Text>
                <View style={s.verifyBadge}>
                  <Ionicons name="shield-checkmark" size={12} color="#15803D" />
                  <Text style={s.verifyText}>{t('Verified')}</Text>
                </View>
              </View>
              
              <Text style={s.schemeName} numberOfLines={2}>{t(scheme.name)}</Text>
              
              <View style={s.tagRow}>
                {scheme.tags.map((tag, i) => (
                  <View key={i} style={s.tag}>
                    <Text style={s.tagText}>{t(tag)}</Text>
                  </View>
                ))}
              </View>
              
              <View style={s.detailsBox}>
                <Text style={s.detailLabel}>{t('Eligibility:')}</Text>
                <Text style={s.detailText}>{t(scheme.eligibility)}</Text>
                
                <Text style={[s.detailLabel, { marginTop: 12 }]}>{t('Benefits:')}</Text>
                <Text style={s.detailText}>{t(scheme.benefits)}</Text>
              </View>
              
              <View style={{ flexDirection: 'row', gap: 12, marginTop: 4 }}>
                <TouchableOpacity 
                  style={[s.applyBtn, { flex: 1, marginTop: 0 }]} 
                  onPress={() => {
                    if (Platform.OS === 'web') {
                      window.open(scheme.officialLink, '_blank');
                    } else {
                      Linking.openURL(scheme.officialLink).catch(() => {
                        alert(t('Cannot open the link at this time.'));
                      });
                    }
                  }}
                >
                  <Text style={s.applyBtnText}>{t('Apply Now')}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={s.readAloudBtn} 
                  onPress={() => playTTS(scheme.id, scheme.name, scheme.benefits)}
                >
                  {playingId === scheme.id ? (
                    <Ionicons name="stop-circle" size={20} color="white" />
                  ) : (
                    <Ionicons name="volume-medium" size={20} color="white" />
                  )}
                  <Text style={s.readAloudBtnText}>
                    {playingId === scheme.id ? t('Stop') : t('Read Aloud')}
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2A2624' },
  
  scrollContent: { padding: 20, paddingBottom: 100, alignSelf: 'center', width: '100%', maxWidth: 1200 },
  subtitle: { fontSize: 15, color: '#6B6562', marginBottom: 24, lineHeight: 22, maxWidth: 800, alignSelf: 'center', textAlign: 'center' },
  
  aiBtnContainer: { marginBottom: 32, alignSelf: 'center', width: 'auto' },
  aiBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 14, paddingHorizontal: 32, borderRadius: 16, elevation: 6, shadowColor: '#8B5CF6', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  aiBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold', letterSpacing: 0.5 },
  aiBtnHint: { textAlign: 'center', color: '#A09C9A', fontSize: 12, marginTop: 8 },
  
  sectionTitle: { fontSize: 18, fontWeight: '700', color: '#2A2624', marginBottom: 16 },
  
  gridContainer: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, justifyContent: 'flex-start' },
  
  schemeCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, width: Platform.OS === 'web' ? '48%' : '100%', flexGrow: 1, maxWidth: Platform.OS === 'web' ? 550 : '100%', borderWidth: 1, borderColor: '#F0F0F0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  schemeCategory: { fontSize: 13, fontWeight: '600', color: '#C36F50', backgroundColor: '#FDF2EE', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 12, overflow: 'hidden' },
  verifyBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#ECFDF5', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 12 },
  verifyText: { color: '#15803D', fontSize: 11, fontWeight: '600', marginLeft: 4 },
  
  schemeName: { fontSize: 20, fontWeight: 'bold', color: '#2A2624', marginBottom: 12, minHeight: 24 },
  
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8, marginBottom: 16 },
  tag: { backgroundColor: '#F5F5F5', paddingHorizontal: 10, paddingVertical: 6, borderRadius: 8 },
  tagText: { color: '#6B6562', fontSize: 12, fontWeight: '500' },
  
  detailsBox: { backgroundColor: '#FDFBF7', padding: 16, borderRadius: 12, marginBottom: 16, borderWidth: 1, borderColor: '#F5F5F5', flex: 1 },
  detailLabel: { fontSize: 13, fontWeight: '700', color: '#2A2624', marginBottom: 4 },
  detailText: { fontSize: 14, color: '#4B4542', lineHeight: 20 },
  
  applyBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, borderWidth: 1, borderColor: '#C36F50' },
  applyBtnText: { color: '#C36F50', fontSize: 15, fontWeight: '600' },
  
  readAloudBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, paddingHorizontal: 16, borderRadius: 12, backgroundColor: '#8B5CF6' },
  readAloudBtnText: { color: 'white', fontSize: 15, fontWeight: '600', marginLeft: 6 }
});
