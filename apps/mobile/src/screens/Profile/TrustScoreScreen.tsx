import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n/useTranslation';

export default function TrustScoreScreen({ navigation }: any) {
  const { metrics } = useAuthStore();
  const { t } = useTranslation();
  const maxScore = 850;
  const fillPercentage = (metrics.creditScore / maxScore) * 100;

  return (
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#2A2624" />
        </TouchableOpacity>
        <Text style={s.title}>{t('nav.trustScore')}</Text>
      </View>

      <View style={s.scoreCard}>
        <Text style={s.scoreTitle}>{t('Current Trust Score')}</Text>
        <Text style={s.scoreValue}>{metrics.creditScore} <Text style={{fontSize: 20, color: '#94A3B8'}}>/ 850</Text></Text>
        <View style={s.barBg}>
          <View style={[s.barFill, { width: `${fillPercentage}%`, backgroundColor: metrics.creditScore > 700 ? '#10B981' : '#F59E0B' }]} />
        </View>
        <Text style={s.scoreDesc}>
          {metrics.creditScore > 700 ? t('Excellent! You qualify for microfinance loans.') : t('Good. Keep fulfilling orders on time to increase your score.')}
        </Text>
      </View>

      <Text style={s.sectionTitle}>{t('Score Breakdown')}</Text>
      
      <View style={s.metricCard}>
        <View style={s.metricHeader}>
          <Ionicons name="cash" size={24} color="#10B981" />
          <Text style={s.metricTitle}>{t('Sales Volume (40%)')}</Text>
        </View>
        <Text style={s.metricValue}>₹{metrics.salesVolume.toLocaleString('en-IN')}</Text>
        <Text style={s.metricSub}>{t('Consistent sales prove market demand for your crafts.')}</Text>
      </View>

      <View style={s.metricCard}>
        <View style={s.metricHeader}>
          <Ionicons name="time" size={24} color="#3B82F6" />
          <Text style={s.metricTitle}>{t('Consistency Score (30%)')}</Text>
        </View>
        <Text style={s.metricValue}>{metrics.consistencyScore}/100</Text>
        <Text style={s.metricSub}>{t('Measures regular activity and steady product uploads.')}</Text>
      </View>

      <View style={s.metricCard}>
        <View style={s.metricHeader}>
          <Ionicons name="cube" size={24} color="#8B5CF6" />
          <Text style={s.metricTitle}>{t('Fulfilment Rate (30%)')}</Text>
        </View>
        <Text style={s.metricValue}>{metrics.fulfilmentRate}%</Text>
        <Text style={s.metricSub}>{t('Percentage of orders delivered on or before the deadline.')}</Text>
      </View>

      <TouchableOpacity style={s.exportBtn} onPress={() => alert('PDF Generated and ready to share with Bank Partners!')}>
        <Ionicons name="share-outline" size={20} color="white" />
        <Text style={s.exportText}>{t('Share Score with Bank')}</Text>
      </TouchableOpacity>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FDFBF7', padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 24, marginTop: 24 },
  backBtn: { padding: 8, marginRight: 8, backgroundColor: 'white', borderRadius: 20, elevation: 2 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2A2624' },
  
  scoreCard: { backgroundColor: 'white', padding: 24, borderRadius: 20, alignItems: 'center', marginBottom: 32, elevation: 4, shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.1, shadowRadius: 12 },
  scoreTitle: { fontSize: 16, color: '#64748B', fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: 1, marginBottom: 8 },
  scoreValue: { fontSize: 64, fontWeight: '900', color: '#0F172A', marginBottom: 16 },
  barBg: { width: '100%', height: 12, backgroundColor: '#E2E8F0', borderRadius: 6, overflow: 'hidden', marginBottom: 16 },
  barFill: { height: '100%', borderRadius: 6 },
  scoreDesc: { textAlign: 'center', color: '#475569', fontSize: 15, paddingHorizontal: 16 },

  sectionTitle: { fontSize: 20, fontWeight: 'bold', color: '#2A2624', marginBottom: 16 },
  metricCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F1F5F9' },
  metricHeader: { flexDirection: 'row', alignItems: 'center', gap: 8, marginBottom: 12 },
  metricTitle: { fontSize: 16, fontWeight: 'bold', color: '#334155' },
  metricValue: { fontSize: 24, fontWeight: '800', color: '#0F172A', marginBottom: 4 },
  metricSub: { fontSize: 13, color: '#64748B' },

  exportBtn: { backgroundColor: '#C36F50', paddingVertical: 16, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8, marginTop: 16, marginBottom: 40 },
  exportText: { color: 'white', fontSize: 16, fontWeight: 'bold' }
});
