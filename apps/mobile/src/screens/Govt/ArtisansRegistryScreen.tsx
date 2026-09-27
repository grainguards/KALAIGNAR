import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { MOCK_ARTISANS } from '../../data/mockData';
import { useTranslation } from '../../i18n/useTranslation';

export default function ArtisansRegistryScreen() {
  const ARTISANS = MOCK_ARTISANS;
  const { t } = useTranslation();

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>{t('nav.artisans')}</Text>
          <Text style={s.subtitle}>{t('Verified national database of registered artisans and MSMEs.')}</Text>
        </View>

        <View style={s.searchBar}>
          <Ionicons name="search" size={20} color="#64748B" />
          <TextInput placeholder={t('marketplace.searchPlaceholder')} style={s.searchInput} />
        </View>

        <View style={s.tableContainer}>
          <View style={s.tableHeader}>
            <Text style={[s.th, { flex: 2 }]}>{t('auth.name')}</Text>
            <Text style={[s.th, { flex: 1.5 }]}>{t('catalog.craftType')}</Text>
            <Text style={[s.th, { flex: 1 }]}>{t('auth.location')}</Text>
            <Text style={[s.th, { flex: 1, textAlign: 'center' }]}>{t('nav.trustScore')}</Text>
          </View>
          
          {ARTISANS.map((a, i) => (
            <View key={a.id} style={[s.tableRow, i % 2 === 0 ? s.rowEven : s.rowOdd]}>
              <View style={[s.td, { flex: 2, flexDirection: 'row', alignItems: 'center' }]}>
                <Text style={s.tdTextMain}>{a.name}</Text>
                {a.verified && <Ionicons name="checkmark-circle" size={14} color="#10B981" style={{marginLeft: 6}}/>}
              </View>
              <Text style={[s.td, { flex: 1.5 }]}>{a.craft}</Text>
              <Text style={[s.td, { flex: 1 }]}>{a.state}</Text>
              <View style={[s.td, { flex: 1, alignItems: 'center' }]}>
                <View style={[s.scoreBadge, { backgroundColor: a.score >= 700 ? '#DCFCE7' : '#FEF3C7' }]}>
                  <Text style={[s.scoreText, { color: a.score >= 700 ? '#15803D' : '#B45309' }]}>{a.score}</Text>
                </View>
              </View>
            </View>
          ))}
        </View>
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scrollContent: { padding: Platform.OS === 'web' ? 40 : 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, alignSelf: 'center', width: '100%', maxWidth: 1000, paddingBottom: 100 },
  header: { marginBottom: 24 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#475569' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', paddingHorizontal: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#E2E8F0' },
  searchInput: { flex: 1, paddingVertical: 12, paddingHorizontal: 12, fontSize: 15 },
  tableContainer: { backgroundColor: 'white', borderRadius: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#E2E8F0' },
  tableHeader: { flexDirection: 'row', backgroundColor: '#F8FAFC', padding: 16, borderBottomWidth: 1, borderBottomColor: '#E2E8F0' },
  th: { fontSize: 12, fontWeight: 'bold', color: '#64748B', letterSpacing: 1 },
  tableRow: { flexDirection: 'row', padding: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9', alignItems: 'center' },
  rowEven: { backgroundColor: 'white' },
  rowOdd: { backgroundColor: '#FAFAF9' },
  td: { justifyContent: 'center' },
  tdTextMain: { fontSize: 15, fontWeight: 'bold', color: '#0F172A' },
  scoreBadge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  scoreText: { fontSize: 13, fontWeight: 'bold' }
});
