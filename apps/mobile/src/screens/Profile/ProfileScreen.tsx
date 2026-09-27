import React, { useEffect, useState } from 'react';
import { View, Text, TextInput, TouchableOpacity, ScrollView, StyleSheet, Platform, ToastAndroid } from 'react-native';
import { useAuthStore, UserRole } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { ROLE_CONFIG } from '../../config/roles';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/useTranslation';
import { useTheme, ThemeMode } from '../../theme/useTheme';
import LanguageSelectorModal from '../../components/LanguageSelectorModal';
import ThemeSelectorModal from '../../components/ThemeSelectorModal';

import { useIsFocused } from '@react-navigation/native';

export default function ProfileScreen() {
  const isFocused = useIsFocused();

  const { user, logout, role, setRole, profileData, updateProfileData } = useAuthStore();
  const navigation = useNavigation<any>();
  const { t, lang } = useTranslation();
  const { colors, isDark, themeMode, setThemeMode } = useTheme();

  const [profile, setProfile] = useState<any>(profileData);
  const [loading, setLoading] = useState(false);
  const [saved, setSaved] = useState(false);
  const [showLangModal, setShowLangModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const config = ROLE_CONFIG[role] || ROLE_CONFIG.ARTISAN;
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];

  useEffect(() => {
    setProfile(profileData);
  }, [profileData, role]);

  const handleRoleSwitch = (newRole: UserRole) => {
    if (newRole === role) return;
    setRole(newRole);
    if (Platform.OS === 'android') {
      ToastAndroid.show(`Switched to ${ROLE_CONFIG[newRole].label} view`, ToastAndroid.SHORT);
    }
  };

  const handleSave = async () => {
    setLoading(true);
    setSaved(false);
    setTimeout(() => {
      updateProfileData(profile);
      setSaved(true);
      setLoading(false);
      setTimeout(() => setSaved(false), 3000);
    }, 500);
  };

  const renderContextButton = () => {
    if (role === 'ARTISAN') {
      return (
        <TouchableOpacity style={s.trustBtn} onPress={() => navigation.navigate('TrustScore')}>
          <Ionicons name="shield-checkmark" size={18} color="white" />
          <Text style={{color: 'white', fontWeight: 'bold', marginLeft: 8}}>{t('View My Trust Score') || 'View My Trust Score'}</Text>
        </TouchableOpacity>
      );
    }
    if (role === 'BUYER') {
      return (
        <TouchableOpacity style={[s.trustBtn, {backgroundColor: '#0F766E'}]} onPress={() => navigation.navigate('BuyerHome')}>
          <Ionicons name="people" size={18} color="white" />
          <Text style={{color: 'white', fontWeight: 'bold', marginLeft: 8}}>{t('View Verified Artisans') || 'View Verified Artisans'}</Text>
        </TouchableOpacity>
      );
    }
    if (role === 'GOVT') {
      return (
        <TouchableOpacity style={[s.trustBtn, {backgroundColor: '#1E293B'}]} onPress={() => navigation.navigate('GovDashboard')}>
          <Ionicons name="bar-chart" size={18} color="white" />
          <Text style={{color: 'white', fontWeight: 'bold', marginLeft: 8}}>{t('View Impact Dashboard') || 'View Impact Dashboard'}</Text>
        </TouchableOpacity>
      );
    }
  };

  if (!isFocused) return null;

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      {/* Role Pill Header */}
      <View style={{ backgroundColor: config.accentColor, paddingTop: Platform.OS === 'ios' ? 50 : 20, paddingBottom: 16, paddingHorizontal: 20, flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' }}>
        <Text style={{ color: 'white', fontSize: 20, fontWeight: 'bold', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' }}>
          {t('nav.profile')}
        </Text>
        <View style={{ backgroundColor: 'rgba(255,255,255,0.2)', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 }}>
          <Text style={{ color: 'white', fontSize: 12, fontWeight: 'bold' }}>{t(config.label)}</Text>
        </View>
      </View>

      <ScrollView contentContainerStyle={s.contentContainer}>
        {/* LANGUAGE & REGION CARD */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.cardHeader}>
            <View style={[s.cardIconCircle, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="globe-outline" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.cardTitle, { color: colors.text }]}>{t('common.language')}</Text>
              <Text style={[s.cardSubtitle, { color: colors.textSecondary }]}>
                {t('settings.accessibleLanguages')}
              </Text>
            </View>
          </View>

          <TouchableOpacity
            style={[s.selectorBtn, { backgroundColor: colors.cardSecondary, borderColor: colors.border }]}
            onPress={() => setShowLangModal(true)}
            activeOpacity={0.7}
          >
            <View style={s.selectorBtnLeft}>
              <Text style={[s.nativeLangText, { color: colors.primary }]}>{currentLangObj.nativeName}</Text>
              <Text style={[s.englishLangText, { color: colors.textSecondary }]}>
                {currentLangObj.name !== currentLangObj.nativeName ? `(${currentLangObj.name})` : ''}
              </Text>
            </View>
            <View style={s.selectorBtnRight}>
              <Text style={[s.changeText, { color: colors.primary }]}>{t('voice.changeLanguage')}</Text>
              <Ionicons name="chevron-forward" size={18} color={colors.primary} />
            </View>
          </TouchableOpacity>
        </View>

        {/* APPEARANCE & THEME CARD */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={s.cardHeader}>
            <View style={[s.cardIconCircle, { backgroundColor: colors.primaryLight }]}>
              <Ionicons name="color-palette-outline" size={20} color={colors.primary} />
            </View>
            <View style={{ flex: 1 }}>
              <Text style={[s.cardTitle, { color: colors.text }]}>{t('theme.appearance')}</Text>
              <Text style={[s.cardSubtitle, { color: colors.textSecondary }]}>
                {t('theme.theme')}
              </Text>
            </View>
          </View>

          {/* 3 Mode Segmented Switcher */}
          <View style={s.themeRow}>
            {(['light', 'dark', 'system'] as ThemeMode[]).map((mode) => {
              const isSelected = themeMode === mode;
              const iconName = mode === 'light' ? 'sunny' : mode === 'dark' ? 'moon' : 'phone-portrait-outline';
              const label = mode === 'light' ? t('theme.light') : mode === 'dark' ? t('theme.dark') : t('theme.system');

              return (
                <TouchableOpacity
                  key={mode}
                  style={[
                    s.themeBtn,
                    {
                      backgroundColor: isSelected ? colors.primaryLight : colors.cardSecondary,
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  onPress={() => setThemeMode(mode)}
                  activeOpacity={0.7}
                >
                  <Ionicons name={iconName as any} size={18} color={isSelected ? colors.primary : colors.textSecondary} />
                  <Text style={[s.themeBtnText, { color: isSelected ? colors.primary : colors.text, fontWeight: isSelected ? '700' : '500' }]}>
                    {label}
                  </Text>
                </TouchableOpacity>
              );
            })}
          </View>

          {/* Photo Protection Badge */}
          <View style={[s.photoBadge, { backgroundColor: colors.cardSecondary }]}>
            <Ionicons name="shield-checkmark" size={15} color={colors.success} />
            <Text style={[s.photoBadgeText, { color: colors.textSecondary }]}>
              {t('theme.photoProtected')}
            </Text>
          </View>
        </View>

        {/* HACKATHON ROLE SWITCHER */}
        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 8}}>
            <Ionicons name="swap-horizontal" size={20} color={colors.text} style={{marginRight: 8}} />
            <Text style={[s.cardTitle, { color: colors.text }]}>{t('roles.selectRole')}</Text>
          </View>
          <Text style={[s.roleDesc, { color: colors.textSecondary }]}>
            {t('roles.switchRole')}
          </Text>
          <View style={s.roleRow}>
            <TouchableOpacity style={[s.roleBtn, { backgroundColor: colors.cardSecondary }, role === 'ARTISAN' && {backgroundColor: ROLE_CONFIG.ARTISAN.accentColor}]} onPress={() => handleRoleSwitch('ARTISAN')}>
              <Text style={[s.roleText, { color: colors.textSecondary }, role === 'ARTISAN' && s.roleTextActive]}>{t('roles.artisan')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.roleBtn, { backgroundColor: colors.cardSecondary }, role === 'BUYER' && {backgroundColor: ROLE_CONFIG.BUYER.accentColor}]} onPress={() => handleRoleSwitch('BUYER')}>
              <Text style={[s.roleText, { color: colors.textSecondary }, role === 'BUYER' && s.roleTextActive]}>{t('roles.buyer')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.roleBtn, { backgroundColor: colors.cardSecondary }, role === 'GOVT' && {backgroundColor: ROLE_CONFIG.GOVT.accentColor}]} onPress={() => handleRoleSwitch('GOVT')}>
              <Text style={[s.roleText, { color: colors.textSecondary }, role === 'GOVT' && s.roleTextActive]}>{t('roles.govt')}</Text>
            </TouchableOpacity>
          </View>
          {renderContextButton()}
        </View>

        {saved && (
          <View style={s.successBanner}>
            <Ionicons name="checkmark-circle" size={18} color="#15803D" />
            <Text style={s.successText}>{t('common.success')}</Text>
          </View>
        )}

        <View style={[s.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <Text style={[s.formTitle, { color: colors.text }]}>{t('profile.personalDetails')}</Text>
          <Text style={[s.label, { color: colors.textSecondary }]}>{t('auth.name')}</Text>
          <TextInput
            style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
            value={profile.name}
            onChangeText={t => setProfile({...profile, name: t})}
            placeholder={t('auth.namePlaceholder')}
            placeholderTextColor={colors.textMuted}
          />

          {role === 'ARTISAN' && (
            <>
              <Text style={[s.label, { color: colors.textSecondary }]}>{t('auth.businessName')}</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                value={profile.businessName}
                onChangeText={t => setProfile({...profile, businessName: t})}
                placeholder="e.g. Kanchi Weavers"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={[s.label, { color: colors.textSecondary }]}>{t('auth.craftCategory')}</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                value={profile.craftCategory}
                onChangeText={t => setProfile({...profile, craftCategory: t})}
                placeholder="e.g. Pottery, Silk"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={[s.label, { color: colors.textSecondary }]}>{t('auth.location')}</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                value={profile.location}
                onChangeText={t => setProfile({...profile, location: t})}
                placeholder="e.g. Rajasthan"
                placeholderTextColor={colors.textMuted}
              />
            </>
          )}

          {role === 'BUYER' && (
            <>
              <Text style={[s.label, { color: colors.textSecondary }]}>{t('profile.orgName')}</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                value={profile.businessName}
                onChangeText={t => setProfile({...profile, businessName: t})}
                placeholder="e.g. Global Sourcing Inc."
                placeholderTextColor={colors.textMuted}
              />
              <Text style={[s.label, { color: colors.textSecondary }]}>{t('profile.buyerType')}</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                value={profile.craftCategory}
                onChangeText={t => setProfile({...profile, craftCategory: t})}
                placeholder="e.g. Retailer, Corporate"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={[s.label, { color: colors.textSecondary }]}>{t('profile.headquarters')}</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                value={profile.location}
                onChangeText={t => setProfile({...profile, location: t})}
                placeholder="e.g. New York, USA"
                placeholderTextColor={colors.textMuted}
              />
            </>
          )}

          {role === 'GOVT' && (
            <>
              <Text style={[s.label, { color: colors.textSecondary }]}>{t('profile.department')}</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                value={profile.businessName}
                onChangeText={t => setProfile({...profile, businessName: t})}
                placeholder="e.g. Ministry of Textiles"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={[s.label, { color: colors.textSecondary }]}>{t('profile.designation')}</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                value={profile.craftCategory}
                onChangeText={t => setProfile({...profile, craftCategory: t})}
                placeholder="e.g. Joint Secretary"
                placeholderTextColor={colors.textMuted}
              />
              <Text style={[s.label, { color: colors.textSecondary }]}>{t('profile.jurisdiction')}</Text>
              <TextInput
                style={[s.input, { backgroundColor: colors.inputBg, borderColor: colors.border, color: colors.text }]}
                value={profile.location}
                onChangeText={t => setProfile({...profile, location: t})}
                placeholder="e.g. National"
                placeholderTextColor={colors.textMuted}
              />
            </>
          )}

          <TouchableOpacity style={[s.saveBtn, {backgroundColor: config.accentColor}]} onPress={handleSave} disabled={loading}>
            <Text style={s.saveBtnText}>{loading ? t('common.loading') : t('common.save')}</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={[s.logoutBtn, { borderColor: colors.danger, backgroundColor: isDark ? '#2D1515' : '#FEF2F2' }]} onPress={logout}>
          <Text style={[s.logoutText, { color: colors.danger }]}>{t('common.logout')}</Text>
        </TouchableOpacity>
      </ScrollView>

      {/* Language Modal */}
      <LanguageSelectorModal visible={showLangModal} onClose={() => setShowLangModal(false)} />

      {/* Theme Modal */}
      <ThemeSelectorModal visible={showThemeModal} onClose={() => setShowThemeModal(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  contentContainer: { padding: 20, alignSelf: 'center', width: '100%', maxWidth: 600, paddingBottom: 100 },
  card: { padding: 20, borderRadius: 16, marginBottom: 20, shadowColor: '#000', shadowOffset: {width: 0, height: 3}, shadowOpacity: 0.05, shadowRadius: 8, elevation: 3, borderWidth: 1 },
  cardHeader: { flexDirection: 'row', alignItems: 'center', gap: 12, marginBottom: 16 },
  cardIconCircle: { width: 38, height: 38, borderRadius: 12, alignItems: 'center', justifyContent: 'center' },
  cardTitle: { fontSize: 17, fontWeight: 'bold' },
  cardSubtitle: { fontSize: 12, marginTop: 2 },
  selectorBtn: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingHorizontal: 16, paddingVertical: 14, borderRadius: 12, borderWidth: 1 },
  selectorBtnLeft: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  nativeLangText: { fontSize: 17, fontWeight: '700' },
  englishLangText: { fontSize: 14 },
  selectorBtnRight: { flexDirection: 'row', alignItems: 'center', gap: 4 },
  changeText: { fontSize: 14, fontWeight: '600' },
  themeRow: { flexDirection: 'row', gap: 8, marginBottom: 12 },
  themeBtn: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', gap: 6, paddingVertical: 12, borderRadius: 12, borderWidth: 1.5 },
  themeBtnText: { fontSize: 13 },
  photoBadge: { flexDirection: 'row', alignItems: 'center', gap: 8, paddingHorizontal: 12, paddingVertical: 8, borderRadius: 10 },
  photoBadgeText: { fontSize: 11, flex: 1, lineHeight: 15 },
  roleDesc: { fontSize: 14, marginBottom: 16, lineHeight: 20 },
  roleRow: { flexDirection: 'row', gap: 8, flexWrap: 'wrap', marginBottom: 16 },
  roleBtn: { flex: 1, minWidth: 90, paddingVertical: 12, borderRadius: 12, alignItems: 'center' },
  roleText: { fontWeight: '600', fontSize: 13 },
  roleTextActive: { color: 'white', fontWeight: 'bold' },
  trustBtn: { flexDirection: 'row', backgroundColor: '#10B981', paddingVertical: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  successBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#DCFCE7', padding: 14, borderRadius: 12, marginBottom: 20 },
  successText: { color: '#15803D', fontWeight: '600', marginLeft: 8 },
  formTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 18 },
  label: { fontSize: 13, fontWeight: 'bold', marginBottom: 8, letterSpacing: 0.5 },
  input: { borderWidth: 1, borderRadius: 12, padding: 14, fontSize: 15, marginBottom: 18 },
  saveBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', marginTop: 8 },
  saveBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  logoutBtn: { paddingVertical: 16, borderRadius: 12, alignItems: 'center', borderWidth: 1 },
  logoutText: { fontSize: 16, fontWeight: 'bold' }
});
