import React from 'react';
import {
  Modal,
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TouchableWithoutFeedback,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../i18n/useTranslation';
import { useTheme, ThemeMode } from '../theme/useTheme';

interface ThemeSelectorModalProps {
  visible: boolean;
  onClose: () => void;
}

export default function ThemeSelectorModal({ visible, onClose }: ThemeSelectorModalProps) {
  const { t } = useTranslation();
  const { themeMode, setThemeMode, colors, isDark } = useTheme();

  const options: { mode: ThemeMode; labelKey: string; defaultLabel: string; icon: any; desc: string }[] = [
    {
      mode: 'light',
      labelKey: 'theme.light',
      defaultLabel: 'Light',
      icon: 'sunny',
      desc: 'Crisp, high-contrast light display',
    },
    {
      mode: 'dark',
      labelKey: 'theme.dark',
      defaultLabel: 'Dark',
      icon: 'moon',
      desc: 'Easy on the eyes in low light',
    },
    {
      mode: 'system',
      labelKey: 'theme.systemDefault',
      defaultLabel: 'System Default',
      icon: 'phone-portrait-outline',
      desc: 'Match your device settings automatically',
    },
  ];

  const handleSelect = async (mode: ThemeMode) => {
    await setThemeMode(mode);
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
                    <Ionicons name="color-palette-outline" size={22} color={colors.primary} />
                  </View>
                  <View>
                    <Text style={[styles.title, { color: colors.text }]}>
                      {t('theme.appearance')}
                    </Text>
                    <Text style={[styles.subtitle, { color: colors.textSecondary }]}>
                      {t('theme.appearanceDesc')}
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

              {/* Theme Options */}
              <View style={styles.optionsWrap}>
                {options.map((opt) => {
                  const isSelected = themeMode === opt.mode;
                  return (
                    <TouchableOpacity
                      key={opt.mode}
                      style={[
                        styles.optionItem,
                        {
                          backgroundColor: isSelected ? colors.primaryLight : colors.card,
                          borderColor: isSelected ? colors.primary : colors.border,
                        },
                      ]}
                      onPress={() => handleSelect(opt.mode)}
                      activeOpacity={0.7}
                    >
                      <View style={styles.optionLeft}>
                        <View
                          style={[
                            styles.optIconCircle,
                            {
                              backgroundColor: isSelected ? colors.primary : colors.cardSecondary,
                            },
                          ]}
                        >
                          <Ionicons
                            name={opt.icon}
                            size={18}
                            color={isSelected ? '#FFFFFF' : colors.textSecondary}
                          />
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[
                              styles.optionLabel,
                              {
                                color: isSelected ? colors.primary : colors.text,
                                fontWeight: isSelected ? '700' : '600',
                              },
                            ]}
                          >
                            {t(opt.labelKey) || opt.defaultLabel}
                          </Text>
                          <Text style={[styles.optionDesc, { color: colors.textSecondary }]}>
                            {opt.desc}
                          </Text>
                        </View>
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
              </View>

              {/* Product Photograph Protection Notice */}
              <View style={[styles.footer, { borderTopColor: colors.borderLight }]}>
                <Ionicons name="shield-checkmark" size={16} color={colors.success} />
                <Text style={[styles.footerText, { color: colors.textMuted }]}>
                  Product photos & studio canvas stay true-to-life and will never be dimmed or tinted.
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
  optionsWrap: {
    padding: 16,
    gap: 12,
  },
  optionItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderRadius: 14,
    borderWidth: 1.5,
  },
  optionLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
    flex: 1,
  },
  optIconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    alignItems: 'center',
    justifyContent: 'center',
  },
  optionLabel: {
    fontSize: 16,
  },
  optionDesc: {
    fontSize: 12,
    marginTop: 2,
  },
  checkCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginLeft: 10,
  },
  emptyCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    borderWidth: 1.5,
    marginLeft: 10,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    paddingHorizontal: 20,
    paddingVertical: 14,
    borderTopWidth: 1,
  },
  footerText: {
    fontSize: 12,
    flex: 1,
    lineHeight: 16,
  },
});
