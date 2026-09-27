import React, { useEffect, useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { Ionicons } from '@expo/vector-icons';
import { View, Platform, Dimensions, TouchableOpacity, Text, Modal, ActivityIndicator } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useAuthStore } from '../store/authStore';
import { ROLE_CONFIG } from '../config/roles';
import { useTranslation } from '../i18n/useTranslation';
import { useTheme } from '../theme/useTheme';

const Tab = createBottomTabNavigator();

const ReportModal = ({ visible, onClose }: { visible: boolean, onClose: () => void }) => {
  const { t } = useTranslation();
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (visible) {
      setLoading(false);
      setDone(false);
    }
  }, [visible]);

  const handleGenerate = () => {
    setLoading(true);
    setTimeout(() => {
      setLoading(false);
      setDone(true);
      setTimeout(() => {
        onClose();
      }, 2000);
    }, 1500);
  };

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={{ flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 }}>
        <View style={{ backgroundColor: 'white', padding: 32, borderRadius: 24, width: '100%', maxWidth: 400, alignItems: 'center' }}>
          {done ? (
            <>
              <Ionicons name="checkmark-circle" size={64} color="#10B981" />
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginTop: 16 }}>{t('modals.reportGenerated')}</Text>
              <Text style={{ fontSize: 14, color: '#64748B', marginTop: 8, textAlign: 'center' }}>{t('modals.reportDesc')}</Text>
            </>
          ) : (
            <>
              <Ionicons name="document-text" size={48} color="#1E293B" />
              <Text style={{ fontSize: 20, fontWeight: 'bold', color: '#1E293B', marginTop: 16, marginBottom: 8 }}>{t('modals.generateReport')}</Text>
              <Text style={{ fontSize: 14, color: '#64748B', textAlign: 'center', marginBottom: 24 }}>{t('modals.generateReportDesc')}</Text>
              <View style={{ flexDirection: 'row', gap: 12, width: '100%' }}>
                <TouchableOpacity onPress={onClose} style={{ flex: 1, paddingVertical: 14, backgroundColor: '#F1F5F9', borderRadius: 12, alignItems: 'center' }}>
                  <Text style={{ color: '#475569', fontWeight: 'bold' }}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity onPress={handleGenerate} style={{ flex: 1, paddingVertical: 14, backgroundColor: '#1E293B', borderRadius: 12, alignItems: 'center' }}>
                  {loading ? <ActivityIndicator color="white" /> : <Text style={{ color: 'white', fontWeight: 'bold' }}>{t('common.export')}</Text>}
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      </View>
    </Modal>
  );
};

export default function MainTabs() {
  const { role } = useAuthStore();
  const { t } = useTranslation();
  const { colors, isDark } = useTheme();
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.ARTISAN;
  const [reportModal, setReportModal] = useState(false);

  return (
    <>
      <Tab.Navigator
        key={`${role}_${isDark}`}
        sceneContainerStyle={{ backgroundColor: 'transparent' }}
        initialRouteName={config.homeRoute}
        screenOptions={({ route, navigation }) => ({
          headerShown: false,
          unmountOnBlur: true,
          tabBarIcon: ({ focused, color }) => {
            const tabDef = config.tabs.find(t => t.name === route.name);
            if (!tabDef) return null;

            const isCenterAction = tabDef.name === config.centerAction.route;

            if (isCenterAction) {
              return (
                <View style={{
                  width: 56, height: 56, borderRadius: 28, backgroundColor: config.accentColor,
                  justifyContent: 'center', alignItems: 'center',
                  marginBottom: Platform.OS === 'ios' ? 20 : 30,
                  shadowColor: config.accentColor, shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.4, shadowRadius: 8, elevation: 6
                }}>
                  <Ionicons name={config.centerAction.icon} size={32} color="white" />
                </View>
              );
            }

            return <Ionicons name={focused ? tabDef.iconActive : tabDef.iconInactive} size={24} color={color} />;
          },
          tabBarActiveTintColor: config.accentColor,
          tabBarInactiveTintColor: colors.textMuted,
          tabBarStyle: {
            display: 'flex',
            backgroundColor: colors.surface,
            borderTopWidth: 1,
            borderTopColor: colors.border,
            elevation: 10,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.05,
            shadowRadius: 10,
            height: Platform.OS === 'ios' ? 85 : 70,
            paddingBottom: Platform.OS === 'ios' ? 24 : 12,
            paddingTop: 12,
          },
          tabBarLabelStyle: {
            fontSize: 11,
            fontWeight: '500',
            marginTop: 4
          }
        })}
      >
        {config.tabs.map((tab) => (
          <Tab.Screen 
            key={tab.name} 
            name={tab.name} 
            component={tab.component} 
            options={{ tabBarLabel: tab.label ? (t(tab.label) || tab.label) : '' }}
            listeners={({ navigation }) => ({
              tabPress: (e) => {
                if (tab.name === 'GenerateReportDummy') {
                  e.preventDefault();
                  setReportModal(true);
                }
              },
            })}
          />
        ))}
      </Tab.Navigator>
      <ReportModal visible={reportModal} onClose={() => setReportModal(false)} />
    </>
  );
}
