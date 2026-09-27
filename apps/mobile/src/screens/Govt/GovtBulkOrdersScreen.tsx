import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform } from 'react-native';
import { useTranslation } from '../../i18n/useTranslation';

export default function GovtBulkOrdersScreen() {
  const { t } = useTranslation();
  const B_ORDERS = [
    { id: 'GOV-2026-A', title: 'Republic Day Parade Decor', dept: 'Ministry of Culture', value: '₹14,50,000', status: 'IN_PROGRESS' },
    { id: 'GOV-2026-B', title: 'International Summit Gifts', dept: 'Ministry of External Affairs', value: '₹32,00,000', status: 'SOURCING' },
    { id: 'GOV-2026-C', title: 'State Guest House Furnishings', dept: 'Tourism Board', value: '₹8,40,000', status: 'COMPLETED' },
  ];

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>{t('nav.bulkOrders')}</Text>
          <Text style={s.subtitle}>{t('Overview of all state and central government craft procurements.')}</Text>
        </View>

        {B_ORDERS.map(order => (
          <View key={order.id} style={s.card}>
            <View style={s.cardHeader}>
              <Text style={s.orderId}>{order.id}</Text>
              <View style={[s.badge, order.status === 'COMPLETED' ? s.badgeSuccess : s.badgeWarning]}>
                <Text style={[ order.status === 'COMPLETED' ? s.badgeTextSuccess : s.badgeTextWarning]}>{t(order.status)}</Text>
              </View>
            </View>
            <Text style={s.orderTitle}>{t(order.title)}</Text>
            <Text style={s.orderDept}>{t(order.dept)}</Text>
            
            <View style={s.cardFooter}>
              <Text style={s.label}>{t('Total Contract Value')}</Text>
              <Text style={s.value}>{order.value}</Text>
            </View>
          </View>
        ))}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F1F5F9' },
  scrollContent: { padding: Platform.OS === 'web' ? 40 : 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, alignSelf: 'center', width: '100%', maxWidth: 800, paddingBottom: 100 },
  header: { marginBottom: 32 },
  title: { fontSize: 28, fontWeight: 'bold', color: '#0F172A', marginBottom: 8 },
  subtitle: { fontSize: 15, color: '#475569' },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 24, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.05, shadowOffset: {width:0, height:4}, elevation: 2, borderWidth: 1, borderColor: '#E2E8F0' },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 12 },
  orderId: { fontSize: 14, fontWeight: 'bold', color: '#64748B' },
  badge: { paddingHorizontal: 12, paddingVertical: 4, borderRadius: 100 },
  badgeSuccess: { backgroundColor: '#DCFCE7' },
  badgeTextSuccess: { color: '#15803D', fontSize: 12, fontWeight: 'bold' },
  badgeWarning: { backgroundColor: '#FEF9C3' },
  badgeTextWarning: { color: '#A16207', fontSize: 12, fontWeight: 'bold' },
  orderTitle: { fontSize: 20, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  orderDept: { fontSize: 15, color: '#475569', marginBottom: 20 },
  cardFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  label: { fontSize: 14, color: '#64748B' },
  value: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' }
});
