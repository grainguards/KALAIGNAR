import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Image, Platform } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { useTranslation } from '../../i18n/useTranslation';

export default function BuyerHomeScreen({ navigation }: any) {
  const { user } = useAuthStore();
  const { t } = useTranslation();

  const CATEGORIES = [
    { id: '1', name: t('materials.textiles') || 'Textiles', icon: 'shirt-outline', count: 124 },
    { id: '2', name: t('materials.pottery') || 'Pottery', icon: 'water-outline', count: 86 },
    { id: '3', name: t('materials.woodwork') || 'Woodwork', icon: 'leaf-outline', count: 52 },
    { id: '4', name: t('materials.jewelry') || 'Jewelry', icon: 'sparkles-outline', count: 110 }
  ];

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <View>
            <Text style={s.greeting}>{t('dashboard.welcome')},</Text>
            <Text style={s.userName}>{user?.name || t('roles.buyer')}</Text>
          </View>
          <View style={s.avatar}><Ionicons name="person" size={24} color="white" /></View>
        </View>

        <View style={s.searchBar}>
          <Ionicons name="search" size={20} color="#64748B" />
          <Text style={s.searchText}>{t('marketplace.searchPlaceholder')}</Text>
        </View>

        <View style={s.statsRow}>
          <View style={s.statCard}>
            <Text style={s.statValue}>12</Text>
            <Text style={s.statLabel}>{t('Active Quotes')}</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>3</Text>
            <Text style={s.statLabel}>{t('orders.activeOrders')}</Text>
          </View>
          <View style={s.statCard}>
            <Text style={s.statValue}>45</Text>
            <Text style={s.statLabel}>{t('Saved Artisans')}</Text>
          </View>
        </View>

        <Text style={s.sectionTitle}>{t('Sourcing Categories')}</Text>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.categoriesRow}>
          {CATEGORIES.map(c => (
            <TouchableOpacity key={c.id} style={s.categoryCard}>
              <View style={s.categoryIcon}><Ionicons name={c.icon as any} size={24} color="#0F766E" /></View>
              <Text style={s.categoryName}>{c.name}</Text>
              <Text style={s.categoryCount}>{c.count} {t('Verified')}</Text>
            </TouchableOpacity>
          ))}
        </ScrollView>

        <Text style={[s.sectionTitle, { marginTop: 24 }]}>{t('Recent Bulk Sourcing')}</Text>
        <TouchableOpacity style={s.sourcingCard} onPress={() => navigation.navigate('Marketplace')}>
          <View style={s.sourcingHeader}>
            <Text style={s.sourcingTitle}>{t('Corporate Gifting - Silk Scarves')}</Text>
            <View style={s.badge}><Text style={s.badgeText}>6 {t('Bids Received')}</Text></View>
          </View>
          <Text style={s.sourcingDesc}>{t('Looking for 500 handwoven silk scarves for a corporate event in December.')}</Text>
          <View style={s.sourcingFooter}>
            <Text style={s.sourcingBudget}>{t('opportunities.budget')}: ₹2,50,000</Text>
            <Text style={s.sourcingAction}>{t('opportunities.reviewAndBid')} <Ionicons name="arrow-forward" size={14} /></Text>
          </View>
        </TouchableOpacity>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: Platform.OS === 'web' ? 40 : 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, alignSelf: 'center', width: '100%', maxWidth: 1000, paddingBottom: 100 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  greeting: { fontSize: 16, color: '#64748B' },
  userName: { fontSize: 24, fontWeight: 'bold', color: '#0F172A', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  avatar: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#0F766E', justifyContent: 'center', alignItems: 'center' },
  searchBar: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 24, shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  searchText: { color: '#94A3B8', fontSize: 16, marginLeft: 12 },
  statsRow: { flexDirection: 'row', gap: 12, marginBottom: 32 },
  statCard: { flex: 1, backgroundColor: '#0F766E', padding: 16, borderRadius: 16, alignItems: 'center' },
  statValue: { fontSize: 24, fontWeight: 'bold', color: 'white', marginBottom: 4 },
  statLabel: { fontSize: 12, color: '#CCFBF1', textAlign: 'center' },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 16 },
  categoriesRow: { gap: 12, paddingBottom: 8 },
  categoryCard: { backgroundColor: 'white', padding: 16, borderRadius: 16, width: 120, alignItems: 'center', shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  categoryIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#F0FDFA', justifyContent: 'center', alignItems: 'center', marginBottom: 12 },
  categoryName: { fontSize: 14, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  categoryCount: { fontSize: 12, color: '#64748B' },
  sourcingCard: { backgroundColor: 'white', padding: 20, borderRadius: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  sourcingHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  sourcingTitle: { fontSize: 16, fontWeight: 'bold', color: '#0F172A' },
  badge: { backgroundColor: '#FEF3C7', paddingHorizontal: 8, paddingVertical: 4, borderRadius: 100 },
  badgeText: { fontSize: 11, fontWeight: 'bold', color: '#92400E' },
  sourcingDesc: { fontSize: 14, color: '#64748B', lineHeight: 22, marginBottom: 16 },
  sourcingFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  sourcingBudget: { fontSize: 14, fontWeight: 'bold', color: '#0F766E' },
  sourcingAction: { fontSize: 14, fontWeight: 'bold', color: '#0F766E' },
});
