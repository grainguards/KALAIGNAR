import React, { useState } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, SafeAreaView, Modal } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import { useTheme } from '../../theme/useTheme';
import { useNavigation } from '@react-navigation/native';

export default function OrderDetailScreen() {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const navigation = useNavigation();

  // Mock Order Data
  const orderAmount = 50000; // Total 50,000 INR
  const advanceAmount = orderAmount * 0.3;
  const pendingAmount = orderAmount * 0.7;

  // Mock Escrow State Machine
  // States: 'SECURED' -> 'ADVANCE_RELEASED' -> 'SHIPPED' -> 'COMPLETED'
  const [escrowState, setEscrowState] = useState<'SECURED' | 'ADVANCE_RELEASED' | 'SHIPPED'>('ADVANCE_RELEASED');
  const [showPackingGuide, setShowPackingGuide] = useState(false);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backBtn}>
          <Ionicons name="arrow-back" size={24} color={colors.text} />
        </TouchableOpacity>
        <Text style={[styles.headerTitle, { color: colors.text }]}>Order #KS-8924</Text>
      </View>

      <ScrollView contentContainerStyle={styles.content}>
        
        {/* Smart Escrow Card */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
          <View style={styles.cardHeader}>
            <Ionicons name="shield-checkmark" size={24} color="#10B981" />
            <Text style={[styles.cardTitle, { color: colors.text }]}>{t('escrow.title')}</Text>
          </View>
          
          <Text style={[styles.explainerText, { color: colors.textSecondary }]}>
            {t('escrow.escrowExplainer')}
          </Text>

          {/* Financial Breakdown */}
          <View style={styles.financeBox}>
            <View style={styles.row}>
              <Text style={[styles.label, { color: colors.textSecondary }]}>{t('escrow.totalOrderValue')}</Text>
              <Text style={[styles.value, { color: colors.text }]}>₹{orderAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.divider} />
            <View style={styles.row}>
              <View style={styles.labelRow}>
                <Ionicons name="checkmark-circle" size={16} color="#10B981" />
                <Text style={[styles.label, { color: '#10B981', marginLeft: 4 }]}>{t('escrow.rawMaterialAdvance')}</Text>
              </View>
              <Text style={[styles.value, { color: '#10B981' }]}>₹{advanceAmount.toLocaleString()}</Text>
            </View>
            <View style={styles.row}>
              <View style={styles.labelRow}>
                <Ionicons name="lock-closed" size={16} color="#F59E0B" />
                <Text style={[styles.label, { color: '#F59E0B', marginLeft: 4 }]}>{t('escrow.lockedInEscrow')}</Text>
              </View>
              <Text style={[styles.value, { color: '#F59E0B' }]}>₹{pendingAmount.toLocaleString()}</Text>
            </View>
          </View>

          {/* State Machine Visualizer */}
          <View style={styles.timeline}>
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#10B981' }]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineText, { color: colors.text }]}>{t('escrow.statusSecured')}</Text>
                <Text style={styles.timelineSub}>{t('escrow.guaranteed')}</Text>
              </View>
            </View>
            <View style={[styles.timelineLine, { backgroundColor: '#10B981' }]} />
            
            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: '#10B981' }]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineText, { color: colors.text }]}>{t('escrow.statusAdvance')}</Text>
                <Text style={styles.timelineSub}>₹{advanceAmount.toLocaleString()} {t('escrow.walletTransfer')}</Text>
              </View>
            </View>
            <View style={[styles.timelineLine, { backgroundColor: escrowState === 'SHIPPED' ? '#10B981' : '#E5E7EB' }]} />

            <View style={styles.timelineItem}>
              <View style={[styles.timelineDot, { backgroundColor: escrowState === 'SHIPPED' ? '#10B981' : '#F59E0B' }]} />
              <View style={styles.timelineContent}>
                <Text style={[styles.timelineText, { color: colors.text }]}>{t('escrow.statusPending')}</Text>
                <Text style={styles.timelineSub}>₹{pendingAmount.toLocaleString()} {t('escrow.guaranteed')}</Text>
              </View>
            </View>
          </View>
        </View>

        {/* Logistics Section (Module 2) */}
        <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border, marginTop: 16 }]}>
           <Text style={[styles.cardTitle, { color: colors.text, marginBottom: 16 }]}>Logistics & Shipping</Text>
           
           {escrowState !== 'SHIPPED' ? (
             <>
               <TouchableOpacity 
                  style={[styles.primaryBtn, { backgroundColor: colors.primary, marginBottom: 12 }]}
                  onPress={() => setShowPackingGuide(true)}
                >
                  <Ionicons name="cube-outline" size={20} color="#FFF" />
                  <Text style={styles.primaryBtnText}>{t('logistics.viewPackingGuide')}</Text>
                </TouchableOpacity>

                <TouchableOpacity 
                  style={[styles.successBtn, { backgroundColor: '#10B981' }]}
                  onPress={() => setEscrowState('SHIPPED')}
                >
                  <Ionicons name="checkmark-done" size={20} color="#FFF" />
                  <Text style={styles.primaryBtnText}>{t('logistics.readyForPickup')}</Text>
                </TouchableOpacity>
             </>
           ) : (
             <View style={styles.shippingLabelBox}>
               <View style={styles.shippingHeader}>
                 <Ionicons name="barcode" size={48} color={colors.text} />
                 <View style={{ alignItems: 'flex-end' }}>
                   <Text style={{ fontWeight: 'bold', fontSize: 16, color: colors.text }}>INDIA POST</Text>
                   <Text style={{ color: colors.textSecondary }}>Standard Delivery</Text>
                 </View>
               </View>
               <View style={styles.divider} />
               <Text style={{ fontWeight: 'bold', marginBottom: 4, color: colors.text }}>{t('logistics.trackingId')} IN-9923847X</Text>
               <Text style={{ color: colors.textSecondary, marginBottom: 12 }}>{t('logistics.pickupScheduled')}: Tomorrow, 10:00 AM</Text>
               
               <View style={styles.addressBox}>
                 <Text style={{ fontWeight: 'bold', color: colors.text }}>To:</Text>
                 <Text style={{ color: colors.textSecondary }}>Fabindia Corp.</Text>
                 <Text style={{ color: colors.textSecondary }}>Warehouse 4, Okhla Phase 2</Text>
                 <Text style={{ color: colors.textSecondary }}>New Delhi - 110020</Text>
               </View>

               <TouchableOpacity style={[styles.primaryBtn, { backgroundColor: colors.text, marginTop: 16 }]}>
                 <Ionicons name="print-outline" size={20} color="#FFF" />
                 <Text style={styles.primaryBtnText}>{t('logistics.printLabel')}</Text>
               </TouchableOpacity>
             </View>
           )}
        </View>

      </ScrollView>

      {/* Packing Guide Modal */}
      <Modal visible={showPackingGuide} transparent animationType="slide">
        <View style={styles.modalOverlay}>
          <View style={[styles.packingModalCard, { backgroundColor: colors.card }]}>
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 }}>
              <Text style={[styles.headerTitle, { color: colors.text }]}>{t('logistics.packingGuideTitle')}</Text>
              <TouchableOpacity onPress={() => setShowPackingGuide(false)}>
                <Ionicons name="close" size={24} color={colors.textSecondary} />
              </TouchableOpacity>
            </View>

            <View style={styles.videoPlaceholder}>
              <Ionicons name="play-circle" size={64} color="#FFF" />
              <Text style={{ color: '#FFF', marginTop: 8, fontWeight: 'bold' }}>AR / Video Guide Placeholder</Text>
            </View>

            <View style={[styles.warningBox, { backgroundColor: '#FEF2F2', borderColor: '#F87171' }]}>
              <Ionicons name="warning" size={24} color="#EF4444" />
              <Text style={{ flex: 1, marginLeft: 8, color: '#991B1B', fontWeight: '500' }}>
                {t('logistics.fragileItemWarning')}
              </Text>
            </View>

            <View style={{ gap: 12 }}>
              <Text style={{ fontSize: 16, color: colors.text }}>{t('logistics.step1')}</Text>
              <Text style={{ fontSize: 16, color: colors.text }}>{t('logistics.step2')}</Text>
            </View>
          </View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 16,
    paddingTop: 16,
  },
  backBtn: {
    marginRight: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: 'bold',
  },
  content: {
    padding: 16,
  },
  card: {
    borderRadius: 16,
    padding: 20,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 8,
  },
  explainerText: {
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 20,
  },
  financeBox: {
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    borderWidth: 1,
    borderColor: '#F3F4F6',
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginVertical: 6,
  },
  labelRow: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  label: {
    fontSize: 15,
    fontWeight: '500',
  },
  value: {
    fontSize: 16,
    fontWeight: 'bold',
  },
  divider: {
    height: 1,
    backgroundColor: '#E5E7EB',
    marginVertical: 8,
  },
  timeline: {
    paddingLeft: 8,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    marginTop: 4,
    zIndex: 2,
  },
  timelineLine: {
    width: 2,
    height: 30,
    marginLeft: 5,
    marginTop: -8,
    marginBottom: -4,
    zIndex: 1,
  },
  timelineContent: {
    marginLeft: 16,
    paddingBottom: 16,
  },
  timelineText: {
    fontSize: 16,
    fontWeight: '600',
  },
  timelineSub: {
    fontSize: 13,
    color: '#6B7280',
    marginTop: 2,
  },
  primaryBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  successBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    borderRadius: 12,
    gap: 8,
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  shippingLabelBox: {
    padding: 16,
    backgroundColor: '#F9FAFB',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  shippingHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  addressBox: {
    backgroundColor: '#FFF',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#E5E7EB',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  packingModalCard: {
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    padding: 24,
    minHeight: 400,
  },
  videoPlaceholder: {
    height: 180,
    backgroundColor: '#374151',
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 20,
  },
  warningBox: {
    flexDirection: 'row',
    padding: 12,
    borderRadius: 8,
    borderWidth: 1,
    marginBottom: 20,
    alignItems: 'center',
  }
});
