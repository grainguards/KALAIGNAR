import React, { useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, KeyboardAvoidingView, Platform, Alert } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { API_URL } from '../../services/api';
import { useTranslation } from '../../i18n/useTranslation';
import { useTheme } from '../../theme/useTheme';

export default function OTPScreen() {
  const route = useRoute<any>();
  const navigation = useNavigation<any>();
  const { phone } = route.params;
  const [otp, setOtp] = useState('');
  const [loading, setLoading] = useState(false);
  const setAuth = useAuthStore(state => state.setAuth);
  const { t } = useTranslation();
  const { colors } = useTheme();

  const handleVerifyOtp = async () => {
    if (otp.length < 4) return;
    setLoading(true);
    try {
      const res = await axios.post(`${API_URL}/auth/verify-otp`, { phone, otp });
      setAuth(res.data.token, res.data.user);
    } catch (error) {
      // Demo Fallback — works even without backend
      if (otp === '1234') {
        setAuth('mock_token_demo', { id: 'demo_user', phone, name: 'Daksh Sharma' });
      } else {
        Alert.alert(t('common.error'), 'Please enter the correct OTP. For demo, use 1234.');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingView behavior={Platform.OS === 'ios' ? 'padding' : 'height'} style={{ flex: 1, backgroundColor: colors.background, justifyContent: 'center', paddingHorizontal: 24 }}>
      <View style={{ marginBottom: 40 }}>
        <Text style={{ fontSize: 28, fontWeight: 'bold', color: colors.text, marginBottom: 8 }}>{t('auth.enterOtp')}</Text>
        <Text style={{ fontSize: 16, color: colors.textSecondary }}>{t('auth.otpSentTo')} {phone}</Text>
        <View style={{ backgroundColor: '#FEF3CD', padding: 10, borderRadius: 8, marginTop: 12 }}>
          <Text style={{ color: '#856404', fontWeight: '600' }}>Demo OTP: 1234</Text>
        </View>
      </View>

      <TextInput
        style={{ backgroundColor: colors.card, borderWidth: 1, borderColor: colors.border, borderRadius: 12, paddingHorizontal: 16, paddingVertical: 16, fontSize: 28, textAlign: 'center', letterSpacing: 12, marginBottom: 24, color: colors.text }}
        placeholder="----"
        placeholderTextColor={colors.textMuted}
        keyboardType="number-pad"
        value={otp}
        onChangeText={setOtp}
        maxLength={4}
      />

      <TouchableOpacity
        style={{ backgroundColor: otp.length === 4 ? colors.primary : colors.cardSecondary, borderRadius: 12, paddingVertical: 16, alignItems: 'center', marginBottom: 16 }}
        disabled={otp.length !== 4 || loading}
        onPress={handleVerifyOtp}
        accessibilityRole="button"
        accessibilityLabel="Verify OTP and Login"
      >
        <Text style={{ color: otp.length === 4 ? '#FFFFFF' : colors.textMuted, fontSize: 20, fontWeight: '600' }}>
          {loading ? t('common.loading') : t('auth.verifyOtp')}
        </Text>
      </TouchableOpacity>

      <TouchableOpacity style={{ alignItems: 'center', paddingVertical: 12 }} onPress={() => navigation.goBack()}>
        <Text style={{ color: colors.textSecondary, fontSize: 16 }}>{t('Change Phone Number')}</Text>
      </TouchableOpacity>
    </KeyboardAvoidingView>
  );
}
