import React from 'react';
import { View, Text, StyleSheet, ScrollView } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n/useTranslation';

export default function GovDashboardScreen() {
  const { role } = useAuthStore();
  const { t } = useTranslation();

  if (role !== 'GOVT') {
    return (
      <View style={s.container}>
        <Text style={s.pageTitle}>{t('Access Denied')}</Text>
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={s.container}>
      <Text style={s.pageTitle}>{t('nav.officialDashboard')}</Text>
      <Text style={s.pageSub}>{t('Real-time monitoring of artisan empowerment and scheme adoption.')}</Text>

      <View style={s.statsRow}>
        <View style={s.statCard}>
          <Ionicons name="people" size={24} color="#C36F50" />
          <Text style={s.statValue}>1,240</Text>
          <Text style={s.statLabel}>{t('Artisans Onboarded')}</Text>
        </View>
        <View style={s.statCard}>
          <Ionicons name="wallet" size={24} color="#16A34A" />
          <Text style={s.statValue}>₹45.2L</Text>
          <Text style={s.statLabel}>{t('Revenue Facilitated')}</Text>
        </View>
        <View style={s.statCard}>
          <Ionicons name="briefcase" size={24} color="#2563EB" />
          <Text style={s.statValue}>89</Text>
          <Text style={s.statLabel}>{t('Bulk Tenders Fulfilled')}</Text>
        </View>
      </View>

      <View style={s.chartCard}>
        <Text style={s.chartTitle}>{t('Demographic Participation (Gender)')}</Text>
        {/* Mock CSS Bar Chart for Web compatibility without heavy dependencies */}
        <View style={s.barChart}>
          <View style={s.barRow}>
            <Text style={s.barLabel}>{t('Women')} (65%)</Text>
            <View style={s.barBg}>
              <View style={[s.barFill, { width: '65%', backgroundColor: '#EC4899' }]} />
            </View>
          </View>
          <View style={s.barRow}>
            <Text style={s.barLabel}>{t('Men')} (35%)</Text>
            <View style={s.barBg}>
              <View style={[s.barFill, { width: '35%', backgroundColor: '#3B82F6' }]} />
            </View>
          </View>
        </View>
      </View>

      <View style={s.chartCard}>
        <Text style={s.chartTitle}>{t('Marginalized Groups Inclusion')}</Text>
        <View style={s.barChart}>
          <View style={s.barRow}>
            <Text style={s.barLabel}>SC/ST (42%)</Text>
            <View style={s.barBg}>
              <View style={[s.barFill, { width: '42%', backgroundColor: '#F59E0B' }]} />
            </View>
          </View>
          <View style={s.barRow}>
            <Text style={s.barLabel}>OBC (38%)</Text>
            <View style={s.barBg}>
              <View style={[s.barFill, { width: '38%', backgroundColor: '#10B981' }]} />
            </View>
          </View>
          <View style={s.barRow}>
            <Text style={s.barLabel}>{t('General')} (20%)</Text>
            <View style={s.barBg}>
              <View style={[s.barFill, { width: '20%', backgroundColor: '#64748B' }]} />
            </View>
          </View>
        </View>
      </View>
      
      <View style={s.actionCard}>
        <Text style={s.chartTitle}>{t('Scheme Interventions')}</Text>
        <Text style={s.actionText}>{t('Based on current data, PM-Vikas adoption is lowest in the North-East zone. Consider localized push notifications.')}</Text>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FDFBF7', padding: 24, alignItems: 'center' },
  pageTitle: { fontSize: 28, fontWeight: 'bold', color: '#2A2624', marginBottom: 8, marginTop: 24, textAlign: 'center' },
  pageSub: { fontSize: 16, color: '#6B6562', textAlign: 'center', marginBottom: 32 },
  
  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, width: '100%', maxWidth: 800, marginBottom: 32 },
  statCard: { flex: 1, minWidth: 200, backgroundColor: 'white', padding: 24, borderRadius: 16, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1, shadowRadius: 8, alignItems: 'center' },
  statValue: { fontSize: 32, fontWeight: '900', color: '#0F172A', marginTop: 12, marginBottom: 4 },
  statLabel: { fontSize: 14, color: '#64748B', fontWeight: '500' },

  chartCard: { width: '100%', maxWidth: 800, backgroundColor: 'white', padding: 24, borderRadius: 16, elevation: 1, shadowColor: '#000', shadowOpacity: 0.05, marginBottom: 24 },
  chartTitle: { fontSize: 18, fontWeight: 'bold', color: '#334155', marginBottom: 20 },
  barChart: { width: '100%' },
  barRow: { marginBottom: 16 },
  barLabel: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  barBg: { width: '100%', height: 16, backgroundColor: '#F1F5F9', borderRadius: 8, overflow: 'hidden' },
  barFill: { height: '100%', borderRadius: 8 },

  actionCard: { width: '100%', maxWidth: 800, backgroundColor: '#EFF6FF', padding: 24, borderRadius: 16, borderWidth: 1, borderColor: '#BFDBFE', marginBottom: 40 },
  actionText: { color: '#1E3A8A', fontSize: 15, lineHeight: 22 }
});
