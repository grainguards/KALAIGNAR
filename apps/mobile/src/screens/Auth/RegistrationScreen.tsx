import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ScrollView,
  Modal,
  FlatList,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import axios from 'axios';
import * as Speech from 'expo-speech';
import { Audio } from 'expo-av';
import * as FileSystem from 'expo-file-system';
import { API_URL } from '../../services/api';
import { sttService } from '../../services/sttService';
import { useTranslation } from '../../i18n/useTranslation';
import { useTheme } from '../../theme/useTheme';
import { useAuthStore } from '../../store/authStore';

type Role = 'artisan' | 'buyer' | 'official';

const CRAFT_CATEGORIES = [
  'Weaving', 'Pottery', 'Woodwork', 'Metal Craft', 'Stone Carving', 'Leather Craft', 'Jewelry'
];

const INDIAN_STATES = [
  'Andhra Pradesh', 'Arunachal Pradesh', 'Assam', 'Bihar', 'Chhattisgarh',
  'Goa', 'Gujarat', 'Haryana', 'Himachal Pradesh', 'Jharkhand', 'Karnataka',
  'Kerala', 'Madhya Pradesh', 'Maharashtra', 'Manipur', 'Meghalaya', 'Mizoram',
  'Nagaland', 'Odisha', 'Punjab', 'Rajasthan', 'Sikkim', 'Tamil Nadu',
  'Telangana', 'Tripura', 'Uttar Pradesh', 'Uttarakhand', 'West Bengal'
];

export default function RegistrationScreen() {
  const navigation = useNavigation<any>();
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { setAuth, setRole: setGlobalRole } = useAuthStore();

  // Form State
  const [role, setRole] = useState<Role>('artisan');
  const [fullName, setFullName] = useState('');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  
  // Artisan specific
  const [aadhaar, setAadhaar] = useState('');
  const [craftCategory, setCraftCategory] = useState('');
  const [city, setCity] = useState('');
  const [stateName, setStateName] = useState('');

  // Buyer specific
  const [companyName, setCompanyName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [gstin, setGstin] = useState('');

  // Govt specific
  const [govEmail, setGovEmail] = useState('');
  const [department, setDepartment] = useState('');
  const [officerId, setOfficerId] = useState('');

  // Mode Toggle
  const [isLoginMode, setIsLoginMode] = useState(false);

  // UI State
  const [showPassword, setShowPassword] = useState(false);
  const [showStateModal, setShowStateModal] = useState(false);
  const [showCraftModal, setShowCraftModal] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!isLoginMode) {
      if (role === 'artisan') {
        if (!fullName) newErrors.fullName = t('auth.requiredField');
        if (!city) newErrors.city = t('auth.requiredField');
        if (!stateName) newErrors.stateName = t('auth.requiredField');
        if (!craftCategory) newErrors.craftCategory = t('auth.requiredField');
        
        const aadhaarRegex = /^[0-9]{12}$/;
        if (!aadhaarRegex.test(aadhaar.replace(/-/g, ''))) {
          newErrors.aadhaar = t('auth.invalidAadhaar');
        }
      }

      if (role === 'buyer') {
        if (!companyName) newErrors.companyName = t('auth.requiredField');
        if (!contactName) newErrors.contactName = t('auth.requiredField');
        if (!email) newErrors.email = t('auth.requiredField');
        else if (!/\S+@\S+\.\S+/.test(email)) newErrors.email = t('auth.invalidEmail');
        if (!gstin) newErrors.gstin = t('auth.requiredField');
      }

      if (role === 'official') {
        if (!fullName) newErrors.fullName = t('auth.requiredField');
        if (!department) newErrors.department = t('auth.requiredField');
        if (!officerId) newErrors.officerId = t('auth.requiredField');
        
        if (!govEmail) newErrors.govEmail = t('auth.requiredField');
        else if (!govEmail.endsWith('.gov.in') && !govEmail.endsWith('.nic.in')) {
          newErrors.govEmail = t('auth.invalidGovEmail');
        }
      }

      if (password !== confirmPassword) {
        newErrors.confirmPassword = t('auth.passwordMismatch');
      }
    }

    if (!password) newErrors.password = t('auth.requiredField');
    
    // Phone Validation (digits only, exactly 10)
    const phoneRegex = /^[0-9]{10}$/;
    if (!phoneRegex.test(phone) && role !== 'official') {
      newErrors.phone = t('auth.invalidPhone');
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
  const [isVoiceListening, setIsVoiceListening] = useState(false);

    const [recording, setRecording] = useState<Audio.Recording | null>(null);

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
          const response = await axios.post(`${API_URL}/ai/intent`, {
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
  };

  const handleRegister = () => {
    if (validateForm()) {
      let payload: any = { role, phone, password };
      
      if (!isLoginMode) {
        if (role === 'artisan') {
          payload = { ...payload, fullName, aadhaar: aadhaar.replace(/-/g, ''), craftCategory, city, state: stateName };
        } else if (role === 'buyer') {
          payload = { ...payload, companyName, contactName, email, gstin };
        } else if (role === 'official') {
          payload = { ...payload, fullName, govEmail, department, officerId };
          delete payload.phone; // Govt officials might log in with email
        }
        console.log('Register Payload:', payload);
      } else {
        console.log('Login Payload:', payload);
      }
      
      // Mock login
      const globalRoleMap: any = { artisan: 'ARTISAN', buyer: 'BUYER', official: 'GOVT' };
      setGlobalRole(globalRoleMap[role] || 'ARTISAN');
      setAuth('mock-jwt-token', { name: fullName || companyName || 'Demo User', phone });
    }
  };

  const handleGuestLogin = () => {
    const globalRoleMap: any = { artisan: 'ARTISAN', buyer: 'BUYER', official: 'GOVT' };
    setGlobalRole(globalRoleMap[role] || 'ARTISAN');
    setAuth('guest-jwt-token', { name: 'Guest User', phone: '9876543210' });
  };

  const renderRoleTab = (roleType: Role, labelKey: string) => {
    const isSelected = role === roleType;
    return (
      <TouchableOpacity
        style={[
          styles.roleTab,
          {
            backgroundColor: isSelected ? colors.primary : colors.card,
            borderColor: isSelected ? colors.primary : colors.border,
          },
        ]}
        onPress={() => {
          setRole(roleType);
          setErrors({});
        }}
        activeOpacity={0.8}
        accessibilityRole="tab"
        accessibilityState={{ selected: isSelected }}
      >
        <Text
          style={[
            styles.roleTabText,
            { color: isSelected ? '#FFFFFF' : colors.textSecondary },
          ]}
        >
          {t(labelKey)}
        </Text>
      </TouchableOpacity>
    );
  };

  const renderInput = (
    label: string,
    value: string,
    onChangeText: (text: string) => void,
    errorKey: string,
    options: any = {}
  ) => (
    <View style={styles.inputContainer}>
      <Text style={[styles.inputLabel, { color: colors.text }]}>{t(label)}</Text>
      <View
        style={[
          styles.inputWrapper,
          {
            backgroundColor: colors.inputBg,
            borderColor: errors[errorKey] ? '#EF4444' : colors.border,
          },
        ]}
      >
        <TextInput
          style={[styles.textInput, { color: colors.text }]}
          value={value}
          onChangeText={(text) => {
            onChangeText(text);
            if (errors[errorKey]) {
              setErrors({ ...errors, [errorKey]: '' });
            }
          }}
          placeholderTextColor={colors.textMuted}
          {...options}
        />
        {options.secureTextEntry !== undefined && (
          <TouchableOpacity
            style={styles.eyeIcon}
            onPress={() => setShowPassword(!showPassword)}
          >
            <Ionicons
              name={showPassword ? 'eye-off' : 'eye'}
              size={22}
              color={colors.textSecondary}
            />
          </TouchableOpacity>
        )}
      </View>
      {errors[errorKey] ? (
        <Text style={styles.errorText}>{errors[errorKey]}</Text>
      ) : null}
    </View>
  );

  return (
    <KeyboardAvoidingView
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      style={[styles.container, { backgroundColor: colors.background }]}
    >
      <ScrollView
        showsVerticalScrollIndicator={false}
        contentContainerStyle={styles.scrollContent}
      >
        <View style={[styles.card, { backgroundColor: colors.surface }]}>
          <View style={styles.header}>
            <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 12 }}>
              <Ionicons name="color-palette" size={32} color={colors.primary} />
              <Text style={{ fontSize: 24, fontWeight: 'bold', marginLeft: 8, color: colors.text }}>
                Kalaignar
              </Text>
            </View>
            <Text style={[styles.title, { color: colors.primary }]}>
              {isLoginMode ? t('auth.loginTitle') : t('auth.createAccount')}
            </Text>
            <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
              {isLoginMode ? t('auth.loginToContinue') : t('auth.registrationSubtitle')}
            </Text>
          </View>

          {/* Role Selector */}
          <View style={styles.roleContainer}>
            {renderRoleTab('artisan', 'auth.roleArtisan')}
            {renderRoleTab('buyer', 'auth.roleBuyer')}
            {renderRoleTab('official', 'auth.roleGovOfficial')}
          </View>

          {/* Form Fields: ARTISAN */}
          {!isLoginMode && role === 'artisan' && (
            <>
              {renderInput('auth.fullName', fullName, setFullName, 'fullName')}
              {renderInput('auth.phone', phone, setPhone, 'phone', { keyboardType: 'phone-pad', maxLength: 10 })}
              {renderInput('auth.aadhaarNumber', aadhaar, setAadhaar, 'aadhaar', { keyboardType: 'number-pad', maxLength: 12, placeholder: t('auth.aadhaarPlaceholder') })}
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('auth.craftCategory')}</Text>
                <TouchableOpacity
                  style={[styles.inputWrapper, styles.pickerBtn, { backgroundColor: colors.inputBg, borderColor: errors.craftCategory ? '#EF4444' : colors.border }]}
                  onPress={() => setShowCraftModal(true)}
                >
                  <Text style={{ color: craftCategory ? colors.text : colors.textMuted, fontSize: 16 }}>
                    {craftCategory || t('auth.selectCraft')}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {errors.craftCategory ? <Text style={styles.errorText}>{errors.craftCategory}</Text> : null}
              </View>
              
              {renderInput('auth.city', city, setCity, 'city')}
              
              <View style={styles.inputContainer}>
                <Text style={[styles.inputLabel, { color: colors.text }]}>{t('auth.state')}</Text>
                <TouchableOpacity
                  style={[styles.inputWrapper, styles.pickerBtn, { backgroundColor: colors.inputBg, borderColor: errors.stateName ? '#EF4444' : colors.border }]}
                  onPress={() => setShowStateModal(true)}
                >
                  <Text style={{ color: stateName ? colors.text : colors.textMuted, fontSize: 16 }}>
                    {stateName || t('auth.selectState')}
                  </Text>
                  <Ionicons name="chevron-down" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
                {errors.stateName ? <Text style={styles.errorText}>{errors.stateName}</Text> : null}
              </View>
            </>
          )}

          {/* Form Fields: BUYER */}
          {!isLoginMode && role === 'buyer' && (
            <>
              {renderInput('auth.companyName', companyName, setCompanyName, 'companyName')}
              {renderInput('auth.contactName', contactName, setContactName, 'contactName')}
              {renderInput('auth.email', email, setEmail, 'email', { keyboardType: 'email-address', autoCapitalize: 'none' })}
              {renderInput('auth.phone', phone, setPhone, 'phone', { keyboardType: 'phone-pad', maxLength: 10 })}
              {renderInput('auth.gstin', gstin, setGstin, 'gstin', { autoCapitalize: 'characters', maxLength: 15 })}
            </>
          )}

          {/* Form Fields: GOVT OFFICIAL */}
          {!isLoginMode && role === 'official' && (
            <>
              {renderInput('auth.fullName', fullName, setFullName, 'fullName')}
              {renderInput('auth.govEmail', govEmail, setGovEmail, 'govEmail', { keyboardType: 'email-address', autoCapitalize: 'none', placeholder: 'name@gov.in' })}
              {renderInput('auth.department', department, setDepartment, 'department')}
              {renderInput('auth.officerId', officerId, setOfficerId, 'officerId')}
            </>
          )}

          {/* Login Fields */}
          {isLoginMode && role !== 'official' && renderInput('auth.phone', phone, setPhone, 'phone', { keyboardType: 'phone-pad', maxLength: 10, placeholder: t('auth.phonePlaceholder') })}
          {isLoginMode && role === 'official' && renderInput('auth.govEmail', govEmail, setGovEmail, 'govEmail', { keyboardType: 'email-address', autoCapitalize: 'none', placeholder: 'name@gov.in' })}

          {/* Shared Password Fields */}
          {renderInput('auth.password', password, setPassword, 'password', { secureTextEntry: !showPassword })}
          {!isLoginMode && renderInput('auth.confirmPassword', confirmPassword, setConfirmPassword, 'confirmPassword', { secureTextEntry: !showPassword })}

          <TouchableOpacity
            style={[styles.registerBtn, { backgroundColor: colors.primary }]}
            onPress={handleRegister}
            activeOpacity={0.8}
          >
            <Text style={styles.registerBtnText}>
              {isLoginMode ? t('auth.login') : t('auth.register')}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={[styles.registerBtn, { backgroundColor: 'transparent', borderWidth: 2, borderColor: colors.primary, marginTop: 12 }]}
            onPress={handleGuestLogin}
            activeOpacity={0.8}
          >
            <Text style={[styles.registerBtnText, { color: colors.primary }]}>
              {t('auth.guest')} (Demo)
            </Text>
          </TouchableOpacity>

          <TouchableOpacity 
            style={{ marginTop: 24, alignItems: 'center', padding: 10 }}
            onPress={() => {
              setIsLoginMode(!isLoginMode);
              setErrors({});
            }}
          >
            <Text style={{ color: colors.primary, fontSize: 16, fontWeight: '600' }}>
              {isLoginMode ? t('auth.dontHaveAccount') : t('auth.alreadyHaveAccount')}
            </Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      {/* Craft Category Modal */}
      <Modal visible={showCraftModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('auth.selectCraft')}</Text>
              <TouchableOpacity onPress={() => setShowCraftModal(false)}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{t('auth.close')}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={CRAFT_CATEGORIES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.stateItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setCraftCategory(item);
                    setErrors({ ...errors, craftCategory: '' });
                    setShowCraftModal(false);
                  }}
                >
                  <Text style={{ color: colors.text, fontSize: 16 }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      {/* State Picker Modal */}
      <Modal visible={showStateModal} animationType="slide" transparent={true}>
        <View style={styles.modalOverlay}>
          <View style={[styles.modalContent, { backgroundColor: colors.card }]}>
            <View style={[styles.modalHeader, { borderBottomColor: colors.border }]}>
              <Text style={[styles.modalTitle, { color: colors.text }]}>{t('auth.selectState')}</Text>
              <TouchableOpacity onPress={() => setShowStateModal(false)}>
                <Text style={{ color: colors.primary, fontWeight: 'bold' }}>{t('auth.close')}</Text>
              </TouchableOpacity>
            </View>
            <FlatList
              data={INDIAN_STATES}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity
                  style={[styles.stateItem, { borderBottomColor: colors.border }]}
                  onPress={() => {
                    setStateName(item);
                    setErrors({ ...errors, stateName: '' });
                    setShowStateModal(false);
                  }}
                >
                  <Text style={{ color: colors.text, fontSize: 16 }}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
          {!isLoginMode && role === 'artisan' && (
        <TouchableOpacity
          style={{ position: 'absolute', bottom: 30, right: 30, width: 60, height: 60, borderRadius: 30, backgroundColor: isVoiceListening ? '#EF4444' : colors.primary, alignItems: 'center', justifyContent: 'center', elevation: 8 }}
          onPress={handleVoiceAutofill}
        >
          <Ionicons name={isVoiceListening ? "stop" : "mic"} size={28} color="#FFF" />
        </TouchableOpacity>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  scrollContent: { padding: 24, paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingBottom: 60, alignItems: 'center', justifyContent: 'center', minHeight: '100%' },
  card: { width: '100%', maxWidth: 500, borderRadius: 24, padding: 32, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12, elevation: 4 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', marginBottom: 8 },
  subtitle: { fontSize: 15, lineHeight: 22 },
  roleContainer: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 20, gap: 8 },
  roleTab: { flex: 1, paddingVertical: 10, borderWidth: 1, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  roleTabText: { fontWeight: '600', fontSize: 13, textAlign: 'center' },
  inputContainer: { marginBottom: 16 },
  inputLabel: { fontSize: 14, marginBottom: 6, fontWeight: '600' },
  inputWrapper: { flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderRadius: 12, overflow: 'hidden' },
  textInput: { flex: 1, paddingHorizontal: 16, paddingVertical: 12, fontSize: 15 },
  pickerBtn: { paddingHorizontal: 16, paddingVertical: 12, justifyContent: 'space-between' },
  eyeIcon: { paddingHorizontal: 16, justifyContent: 'center' },
  errorText: { color: '#EF4444', fontSize: 12, marginTop: 4, fontWeight: '500' },
  registerBtn: { borderRadius: 12, paddingVertical: 14, alignItems: 'center', marginTop: 8 },
  registerBtnText: { color: '#FFFFFF', fontSize: 16, fontWeight: 'bold' },
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end' },
  modalContent: { height: '60%', borderTopLeftRadius: 24, borderTopRightRadius: 24, paddingBottom: 24 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', padding: 20, borderBottomWidth: 1 },
  modalTitle: { fontSize: 18, fontWeight: 'bold' },
  stateItem: { paddingVertical: 16, paddingHorizontal: 20, borderBottomWidth: 1 },
});






