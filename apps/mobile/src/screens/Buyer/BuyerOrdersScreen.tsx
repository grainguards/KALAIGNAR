import React from 'react';
import { View, Text, StyleSheet, ScrollView, Platform, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';

export default function BuyerOrdersScreen({ navigation }: any) {
  const { t } = useTranslation();

  const ORDERS = [
    { id: 'ORD-2901', status: 'IN_PRODUCTION', artisan: 'Ramesh Kumawat', item: 'Terracotta Planters', qty: 200, date: '14 Nov 2026' },
    { id: 'ORD-2855', status: 'SHIPPED', artisan: 'Sujata Weavers', item: 'Ikat Silk Sarees', qty: 50, date: '02 Nov 2026' },
    { id: 'ORD-2710', status: 'DELIVERED', artisan: 'Abdul Khatri', item: 'Ajrakh Block Print Fabric', qty: 1000, date: '15 Oct 2026' },
  ];

  const getStatusColor = (status: string) => {
    switch(status) {
      case 'IN_PRODUCTION': return { bg: '#FEF9C3', text: '#A16207' };
      case 'SHIPPED': return { bg: '#DBEAFE', text: '#1D4ED8' };
      case 'DELIVERED': return { bg: '#DCFCE7', text: '#15803D' };
      default: return { bg: '#F1F5F9', text: '#475569' };
    }
  };

  return (
    <View style={s.container}>
      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={{marginRight: 12}}><Ionicons name="arrow-back" size={24} color="#0F172A" /></TouchableOpacity>
          <Text style={s.title}>{t('orders.ordersTitle')}</Text>
        </View>

        {ORDERS.map(order => {
          const colors = getStatusColor(order.status);
          return (
            <View key={order.id} style={s.orderCard}>
              <View style={s.orderHeader}>
                <Text style={s.orderId}>{order.id}</Text>
                <View style={[s.badge, { backgroundColor: colors.bg }]}>
                  <Text style={[s.badgeText, { color: colors.text }]}>{t(order.status.replace('_', ' '))}</Text>
                </View>
              </View>
              <View style={s.orderBody}>
                <Text style={s.artisanName}>{order.artisan}</Text>
                <Text style={s.itemDesc}>{order.qty}x {order.item}</Text>
              </View>
              <View style={s.orderFooter}>
                <Text style={s.date}>{t('orders.orderDate')}: {order.date}</Text>
                <TouchableOpacity><Text style={s.actionText}>{t('orders.trackOrder')}</Text></TouchableOpacity>
              </View>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#F8FAFC' },
  scrollContent: { padding: Platform.OS === 'web' ? 40 : 20, paddingTop: Platform.OS === 'ios' ? 60 : 40, alignSelf: 'center', width: '100%', maxWidth: 800, paddingBottom: 100 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 32 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#0F172A' },
  orderCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, shadowColor: '#000', shadowOpacity: 0.03, shadowOffset: { width: 0, height: 2 }, elevation: 2 },
  orderHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  orderId: { fontSize: 14, fontWeight: 'bold', color: '#64748B' },
  badge: { paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 },
  badgeText: { fontSize: 11, fontWeight: 'bold' },
  orderBody: { marginBottom: 16 },
  artisanName: { fontSize: 18, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  itemDesc: { fontSize: 15, color: '#475569' },
  orderFooter: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  date: { fontSize: 13, color: '#94A3B8' },
  actionText: { fontSize: 14, fontWeight: 'bold', color: '#0F766E' }
});
