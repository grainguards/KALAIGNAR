import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../services/api';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/useTranslation';
import { useTheme } from '../../theme/useTheme';
import LanguageSelectorModal from '../../components/LanguageSelectorModal';

export default function LoginScreen() {
  const [phone, setPhone] = useState('');
  const [loading, setLoading] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const navigation = useNavigation<any>();

  const { t, lang } = useTranslation();
  const { colors, isDark, setThemeMode, themeMode } = useTheme();

  const currentLangObj = SUPPORTED_LANGUAGES.find((l) => l.code === lang) || SUPPORTED_LANGUAGES[0];

  const handleRequestOtp = async () => {
    if (phone.length < 10) return;
    setLoading(true);
    try {
      await axios.post(`${API_URL}/auth/request-otp`, { phone });
      navigation.navigate('OTP', { phone });
    } catch (error) {
      // Fallback for demo if backend is unavailable
      navigation.navigate('OTP', { phone });
    } finally {
      setLoading(false);
    }
  };

  const toggleTheme = () => {
    setThemeMode(isDark ? 'light' : 'dark');
  };

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      {/* Top Header with Language Selector & Theme Toggle */}
      <View style={styles.topBar}>
        <TouchableOpacity
          style={[styles.langBadge, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={() => setShowLangModal(true)}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Select Language"
        >
          <Ionicons name="globe-outline" size={17} color={colors.primary} />
          <Text style={[styles.langBadgeText, { color: colors.text }]}>
            {currentLangObj.nativeName}
          </Text>
          <Ionicons name="chevron-down" size={14} color={colors.textSecondary} />
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.themeBtn, { backgroundColor: colors.card, borderColor: colors.border }]}
          onPress={toggleTheme}
          activeOpacity={0.7}
          accessibilityRole="button"
          accessibilityLabel="Toggle Theme"
        >
          <Ionicons
            name={isDark ? 'sunny' : 'moon'}
            size={18}
            color={isDark ? '#F59E0B' : colors.textSecondary}
          />
        </TouchableOpacity>
      </View>

      <View style={[styles.contentCard, { backgroundColor: colors.surface, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 }]}>
        <View style={{ marginBottom: 36 }}>
          <Text style={[styles.logoText, { color: colors.primary }]}>
            {t('auth.welcomeBack')}
          </Text>
          <Text style={[styles.tagline, { color: colors.textSecondary }]}>
            {t('auth.loginSubtitle')}
          </Text>
        </View>

        <Text style={[styles.inputLabel, { color: colors.text }]}>
          {t('auth.phone')}
        </Text>
        <TextInput
          style={[
            styles.textInput,
            {
              backgroundColor: colors.inputBg,
              borderColor: colors.border,
              color: colors.text,
            },
          ]}
          placeholder={t('auth.phonePlaceholder')}
          placeholderTextColor={colors.textMuted}
          keyboardType="phone-pad"
          value={phone}
          onChangeText={setPhone}
          maxLength={10}
        />

        <TouchableOpacity
          style={[
            styles.continueBtn,
            { backgroundColor: phone.length >= 10 ? colors.primary : colors.cardSecondary },
          ]}
          disabled={phone.length < 10 || loading}
          onPress={handleRequestOtp}
          accessibilityRole="button"
          accessibilityLabel="Continue to OTP"
        >
          <Text
            style={[
              styles.continueBtnText,
              { color: phone.length >= 10 ? '#FFFFFF' : colors.textMuted },
            ]}
          >
            {loading ? t('common.loading') : t('auth.sendOtp')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.demoBtn, { borderColor: colors.primary }]}
          onPress={() => {
            setPhone('9876543210');
            setTimeout(() => {
              navigation.navigate('OTP', { phone: '9876543210' });
            }, 300);
          }}
          accessibilityRole="button"
          accessibilityLabel="Start Hackathon Judge Demo"
        >
          <Text style={[styles.demoBtnText, { color: colors.primary }]}>
            {t('auth.guest')} (Demo)
          </Text>
        </TouchableOpacity>
      </View>

      {/* Language Modal */}
      <LanguageSelectorModal visible={showLangModal} onClose={() => setShowLangModal(false)} />
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    paddingHorizontal: 24,
  },
  topBar: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 56 : 24,
    left: 24,
    right: 24,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    zIndex: 10,
  },
  langBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  langBadgeText: {
    fontSize: 14,
    fontWeight: '600',
  },
  themeBtn: {
    width: 38,
    height: 38,
    borderRadius: 19,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  contentCard: {
    maxWidth: 420,
    width: '100%',
    alignSelf: 'center',
    padding: 32,
    borderRadius: 24,
  },
  logoText: {
    fontSize: 36,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  tagline: {
    fontSize: 16,
    lineHeight: 22,
  },
  inputLabel: {
    fontSize: 15,
    marginBottom: 8,
    fontWeight: '600',
  },
  textInput: {
    borderWidth: 1,
    borderRadius: 14,
    paddingHorizontal: 16,
    paddingVertical: 14,
    fontSize: 18,
    marginBottom: 20,
  },
  continueBtn: {
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 14,
  },
  continueBtnText: {
    fontSize: 18,
    fontWeight: '600',
  },
  demoBtn: {
    borderWidth: 2,
    borderRadius: 14,
    paddingVertical: 16,
    alignItems: 'center',
  },
  demoBtnText: {
    fontSize: 18,
    fontWeight: 'bold',
  },
});
