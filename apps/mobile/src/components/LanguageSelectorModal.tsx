import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation, SUPPORTED_LANGUAGES, LanguageOption } from '../i18n/useTranslation';
import { useTheme } from '../theme/useTheme';

interface LanguageSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function LanguageSelectorModal({ visible, onClose }: LanguageSelectorModalProps) {
  const { lang, changeLanguage, t } = useTranslation();
  const { colors, isDark } = useTheme();

  const handleSelect = async (code: string) => {
    await changeLanguage(code);
    onClose();
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <TouchableWithoutFeedback onPress={onClose}>
        <View style={[styles.overlay, { backgroundColor: colors.modalOverlay }]}>
          <TouchableWithoutFeedback>
            <View
              style={[
                styles.modalCard,
                {
                  backgroundColor: colors.surface,
                  borderColor: colors.border,
                },
              ]}
            >
              {/* Header */}
              <View style={[styles.header, { borderBottomColor: colors.border }]}>
                <View style={styles.headerLeft}>
                  <View style={[styles.iconWrap, { backgroundColor: colors.primaryLight }]}>
                    <Ionicons name="globe-outline" size={22} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.title, { color: colors.text }]}>
                      {t('common.language')}
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                      Available in 10 Indian Languages
                    </Text>
                  </View>
                </View>
                <TouchableOpacity
                  onPress={onClose}
                  hitSlop={{ top: 10, bottom: 10, left: 10, right: 10 }}
                  style={[styles.closeBtn, { backgroundColor: colors.cardSecondary }]}
                >
                  <Ionicons name="close" size={20} color={colors.textSecondary} />
                </TouchableOpacity>
              </View>

              {/* Language List */}
              <ScrollView style={styles.scrollList} contentContainerStyle={styles.listContent}>
                {SUPPORTED_LANGUAGES.map((item: LanguageOption) => {
                  const isSelected = lang === item.code;
                  return (
                    <TouchableOpacity
                      key={item.code}
                      style={[
                        styles.langItem,
                        {
                          backgroundColor: isSelected ? colors.primaryLight : colors.card,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => handleSelect(item.code)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.langItemLeft}>
                        {/* Native Script prominent */}
                        <Text
                          style={[
                            styles.nativeName,
                            {
                              color: isSelected ? colors.primary : colors.text,
                              fontWeight: isSelected ? '700' : '600',
                            },
                          ]}
                        >
                          {item.nativeName}
                        </Text>
                        <Text
                          style={[
                            styles.englishName,
                            {
                              color: isSelected ? colors.primary : colors.textSecondary,
                            },
                          ]}
                        >
                          {item.name !== item.nativeName ? `(${item.name})` : ''}
                        </Text>
                      </View>

                      {isSelected ? (
                        <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                          <Ionicons name="checkmark" size={16} color="#FFFFFF" />
                        </View>
                      ) : (
                        <View style={[styles.emptyCircle, { borderColor: colors.border }]} />
                      )}
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Footer Note */}
              <View style={[styles.footer, { borderTopColor: colors.borderLight }]}>
                <Ionicons name="shield-checkmark-outline" size={16} color={colors.primary} />
                <Text style={[styles.footerText, { color: colors.textMuted }]}>
                  {t('settings.account_sync') || 'Changes apply instantly and sync across your devices'}
                </Text>
              </View>
            </View>
          </TouchableWithoutFeedback>
        </View>
      </TouchableWithoutFeedback>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    maxWidth: 440,
    maxHeight: '85%',
    borderRadius: 20,
    borderWidth: 1,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.15,
    shadowRadius: 24,
    elevation: 8,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 18,
    borderBottomWidth: 1,
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  iconWrap: {
    width: 40,
    height: 40,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  title: {
    fontSize: 18,
    fontWeight: '700',
  },
  subtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  closeBtn: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: 'center',
    justifyContent: 'center',
  },
  scrollList: {
    maxHeight: 460,
  },
  listContent: {
    padding: 16,
    gap: 10,
  },
  langItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  langItemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
  },
  nativeName: {
    fontSize: 17,
  },
  englishName: {
    fontSize: 14,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
  },
  emptyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    flex: 1,
  },
});
