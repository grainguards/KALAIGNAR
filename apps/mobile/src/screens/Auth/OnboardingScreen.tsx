import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet, Platform, ImageBackground } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';
import { Ionicons } from '@expo/vector-icons';

import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n/useTranslation';

export default function OnboardingScreen() {
  const navigation = useNavigation<any>();
  const setAuth = useAuthStore(state => state.setAuth);
  const { t } = useTranslation();

  const handleStart = () => {
    // 1-Click Demo Login
    setAuth('demo-token', { id: 'demo_user', name: 'Demo Artisan', phone: '9876543210' });
  };

  return (
    <View style={s.container}>
      <ImageBackground 
        source={{ uri: 'https://images.unsplash.com/photo-1605806616949-1e87b487cb2a?q=80&w=2000&auto=format&fit=crop' }} 
        style={StyleSheet.absoluteFill} 
        resizeMode="cover"
      >
        <LinearGradient 
          colors={['rgba(15, 13, 12, 0.4)', 'rgba(15, 13, 12, 0.95)']} 
          style={StyleSheet.absoluteFill} 
        />
        
        <View style={s.content}>
          <View style={s.logoRow}>
            <View style={s.logoCircle}>
              <Ionicons name="color-palette" size={24} color="white" />
            </View>
            <Text style={s.logoText}>Kala Setu</Text>
          </View>

          <View style={s.mainTextContainer}>
            <Text style={s.title}>{t('Elevating Indian Craftsmanship.')}</Text>
            <Text style={s.subtitle}>
              {t('Your intelligent business partner. Digitize your artisanal catalog, connect with global buyers, and scale your business with the power of AI.')}
            </Text>

            <TouchableOpacity 
              activeOpacity={0.8}
              onPress={handleStart} 
              style={s.btnWrapper}
            >
              <LinearGradient colors={['#C36F50', '#A35539']} style={s.continueBtn} start={{x: 0, y: 0}} end={{x: 1, y: 0}}>
                <Text style={s.continueBtnText}>{t('Enter Dashboard')}</Text>
                <Ionicons name="arrow-forward" size={20} color="white" style={{ marginLeft: 12 }} />
              </LinearGradient>
            </TouchableOpacity>
          </View>
        </View>
      </ImageBackground>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#0F0D0C' },
  content: { 
    flex: 1, 
    paddingHorizontal: Platform.OS === 'web' ? 80 : 32, 
    paddingTop: 60,
    paddingBottom: 80,
    justifyContent: 'space-between',
    maxWidth: 1400,
    alignSelf: 'center',
    width: '100%'
  },
  
  logoRow: { flexDirection: 'row', alignItems: 'center' },
  logoCircle: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#C36F50', justifyContent: 'center', alignItems: 'center', marginRight: 16, elevation: 8, shadowColor: '#C36F50', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8 },
  logoText: { fontSize: 24, fontWeight: '800', color: 'white', letterSpacing: -0.5 },

  mainTextContainer: { maxWidth: 800 },
  title: { fontSize: Platform.OS === 'web' ? 72 : 48, fontWeight: '900', color: 'white', letterSpacing: -2, lineHeight: Platform.OS === 'web' ? 80 : 56, marginBottom: 24 },
  subtitle: { fontSize: Platform.OS === 'web' ? 22 : 18, color: 'rgba(255,255,255,0.7)', lineHeight: 32, marginBottom: 48, maxWidth: 600 },

  featuresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 48 },
  featureChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'rgba(255,255,255,0.1)', paddingVertical: 12, paddingHorizontal: 20, borderRadius: 30, borderWidth: 1, borderColor: 'rgba(255,255,255,0.15)' },
  featureChipText: { color: 'white', fontSize: 16, fontWeight: '600', marginLeft: 10 },

  btnWrapper: { width: Platform.OS === 'web' ? 300 : '100%' },
  continueBtn: { flexDirection: 'row', width: '100%', paddingVertical: 20, borderRadius: 30, justifyContent: 'center', alignItems: 'center', elevation: 8, shadowColor: '#C36F50', shadowOffset: { width: 0, height: 6 }, shadowOpacity: 0.4, shadowRadius: 16 },
  continueBtnText: { color: 'white', fontSize: 18, fontWeight: 'bold', letterSpacing: 0.5 },
});
