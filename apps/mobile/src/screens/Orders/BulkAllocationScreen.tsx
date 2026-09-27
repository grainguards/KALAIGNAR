import React from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useOrderStore } from '../../store/orderStore';
import { useTranslation } from '../../i18n/useTranslation';

export default function BulkAllocationScreen({ navigation }: any) {
  const { requirements, acceptAllocation, declineAllocation } = useOrderStore();
  const { t } = useTranslation();
  
  const pendingAllocations = requirements.flatMap(req => 
    req.allocations.filter(alloc => alloc.artisanId === 'me' && alloc.status === 'PENDING').map(alloc => ({ req, alloc }))
  );

  return (
    <ScrollView contentContainerStyle={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#2A2624" />
        </TouchableOpacity>
        <Text style={s.title}>{t('orders.splitOrder')}</Text>
      </View>

      <Text style={s.sub}>{t('orders.allocationNotice')}</Text>

      {pendingAllocations.length === 0 ? (
        <View style={s.emptyState}>
          <Ionicons name="checkmark-done-circle" size={48} color="#16A34A" />
          <Text style={s.emptyText}>{t('empty.noOrders')}</Text>
        </View>
      ) : (
        pendingAllocations.map(({ req, alloc }, index) => (
          <View key={index} style={s.card}>
            <View style={s.cardHeader}>
              <View>
                <Text style={s.reqType}>{req.productType}</Text>
                <Text style={s.reqDeadline}>{t('marketplace.delivery')}: {req.deadline.toLocaleDateString()}</Text>
              </View>
              <View style={s.badge}>
                <Text style={s.badgeText}>₹{req.budgetPerUnit}/{t('marketplace.unit')}</Text>
              </View>
            </View>
            
            <View style={s.cardBody}>
              <View style={s.infoCol}>
                <Text style={s.infoLabel}>{t('Total Required')}</Text>
                <Text style={s.infoValue}>{req.totalQuantity}</Text>
              </View>
              <View style={s.divider} />
              <View style={s.infoCol}>
                <Text style={s.infoLabel}>{t('Your Assigned Share')}</Text>
                <Text style={[s.infoValue, { color: '#0369A1' }]}>{alloc.quantity}</Text>
              </View>
              <View style={s.divider} />
              <View style={s.infoCol}>
                <Text style={s.infoLabel}>{t('Your Payout')}</Text>
                <Text style={[s.infoValue, { color: '#16A34A' }]}>₹{req.budgetPerUnit * alloc.quantity}</Text>
              </View>
            </View>
            
            <TouchableOpacity 
              style={{ backgroundColor: '#10B981', padding: 12, borderRadius: 12, alignItems: 'center', marginBottom: 20, flexDirection: 'row', justifyContent: 'center', gap: 8 }}
              onPress={() => navigation.navigate('OrderDetail')}
            >
              <Ionicons name="shield-checkmark" size={20} color="#FFF" />
              <Text style={{ color: '#FFF', fontWeight: 'bold', fontSize: 16 }}>View Smart Escrow</Text>
            </TouchableOpacity>

            <View style={s.actionRow}>
              <TouchableOpacity style={[s.btn, s.declineBtn]} onPress={() => declineAllocation(req.id, 'me')}>
                <Text style={s.declineText}>{t('orders.rejectAllocation')}</Text>
              </TouchableOpacity>
              <TouchableOpacity style={[s.btn, s.acceptBtn]} onPress={() => acceptAllocation(req.id, 'me')}>
                <Text style={s.acceptText}>{t('orders.acceptAllocation')}</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))
      )}
    </ScrollView>
  );
}

const s = StyleSheet.create({
  container: { flexGrow: 1, backgroundColor: '#FDFBF7', padding: 24 },
  header: { flexDirection: 'row', alignItems: 'center', marginBottom: 16, marginTop: 24 },
  backBtn: { padding: 8, marginRight: 8, backgroundColor: 'white', borderRadius: 20, elevation: 2 },
  title: { fontSize: 24, fontWeight: 'bold', color: '#2A2624' },
  sub: { fontSize: 15, color: '#6B6562', marginBottom: 24, lineHeight: 22 },

  emptyState: { alignItems: 'center', justifyContent: 'center', padding: 40, backgroundColor: 'white', borderRadius: 16 },
  emptyText: { fontSize: 18, fontWeight: 'bold', color: '#16A34A', marginTop: 12 },

  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 20, borderWidth: 1, borderColor: '#F0F0F0', elevation: 2 },
  cardHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 16 },
  reqType: { fontSize: 18, fontWeight: 'bold', color: '#2A2624' },
  reqDeadline: { fontSize: 14, color: '#DC2626', fontWeight: '500', marginTop: 4 },
  badge: { backgroundColor: '#FEF3C7', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 12 },
  badgeText: { color: '#D97706', fontWeight: 'bold' },

  cardBody: { flexDirection: 'row', backgroundColor: '#F8FAFC', borderRadius: 12, padding: 16, marginBottom: 20 },
  infoCol: { flex: 1, alignItems: 'center' },
  infoLabel: { fontSize: 12, color: '#64748B', fontWeight: '500', marginBottom: 4, textAlign: 'center' },
  infoValue: { fontSize: 20, fontWeight: '900', color: '#0F172A' },
  divider: { width: 1, backgroundColor: '#E2E8F0', marginHorizontal: 8 },

  actionRow: { flexDirection: 'row', gap: 12 },
  btn: { flex: 1, paddingVertical: 14, borderRadius: 12, alignItems: 'center' },
  declineBtn: { backgroundColor: 'white', borderWidth: 1, borderColor: '#CBD5E1' },
  declineText: { color: '#475569', fontWeight: 'bold' },
  acceptBtn: { backgroundColor: '#C36F50' },
  acceptText: { color: 'white', fontWeight: 'bold' }
});
