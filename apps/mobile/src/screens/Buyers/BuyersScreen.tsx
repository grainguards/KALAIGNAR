import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Platform, Modal, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';

const BUYERS = [
  { id: '1', name: 'FabIndia Authentic', type: 'Enterprise Retailer', location: 'New Delhi, India', interests: 'Handloom Cotton, Pottery', minQty: '50 units', image: 'https://picsum.photos/seed/karigar1/400/400', verified: true },
  { id: '2', name: 'Global Crafts Exporters', type: 'Wholesale Exporter', location: 'Mumbai, India', interests: 'Woodcraft, Traditional Jewelry', minQty: '100 units', image: 'https://picsum.photos/seed/karigar2/400/400', verified: true },
  { id: '3', name: 'Okhai Boutiques', type: 'Boutique Chain', location: 'Ahmedabad, India', interests: 'Embroidery, Applique Work', minQty: '25 units', image: 'https://picsum.photos/seed/karigar3/400/400', verified: true },
  { id: '4', name: 'Taj Hotels Procurement', type: 'Hotel Chain', location: 'Multiple Cities', interests: 'Handicrafts, Pottery, Paintings', minQty: '200 units', image: 'https://picsum.photos/seed/karigar4/400/400', verified: true },
  { id: '5', name: 'Central Cottage Emporium', type: 'Government Store', location: 'New Delhi, India', interests: 'All Traditional Handicrafts', minQty: '30 units', image: 'https://picsum.photos/seed/karigar5/400/400', verified: true },
  { id: '6', name: 'Jaypore Curations', type: 'Online Marketplace', location: 'Bengaluru, India', interests: 'Handwoven Silk, Jewelry', minQty: '10 units', image: 'https://picsum.photos/seed/karigar6/400/400', verified: true },
  { id: '7', name: 'IKEA Sourcing (India)', type: 'Global Retailer', location: 'Bengaluru, India', interests: 'Bamboo, Terracotta, Textiles', minQty: '500 units', image: 'https://picsum.photos/seed/karigar7/400/400', verified: true },
  { id: '8', name: 'Suta Bombay', type: 'Fashion Label', location: 'Mumbai, India', interests: 'Cotton Sarees, Weaves', minQty: '50 units', image: 'https://picsum.photos/seed/karigar8/400/400', verified: true },
  { id: '9', name: 'Good Earth', type: 'Luxury Retail', location: 'New Delhi, India', interests: 'Ceramics, Home Decor', minQty: '40 units', image: 'https://picsum.photos/seed/karigar9/400/400', verified: true },
  { id: '10', name: 'Tjori Handicrafts', type: 'Boutique Retailer', location: 'Pune, India', interests: 'Brassware, Wooden Artifacts', minQty: '15 units', image: 'https://picsum.photos/seed/karigar10/400/400', verified: true },
];

import { useIsFocused } from '@react-navigation/native';

export default function BuyersScreen() {
  const isFocused = useIsFocused();
  const { t } = useTranslation();
  
  const [selectedBuyer, setSelectedBuyer] = useState<string | null>(null);
  const [isSharing, setIsSharing] = useState(false);
  const [shareSuccess, setShareSuccess] = useState(false);

  const handleContact = (buyerName: string) => {
    setSelectedBuyer(buyerName);
    setShareSuccess(false);
  };

  const confirmShare = () => {
    setIsSharing(true);
    // Simulate network request
    setTimeout(() => {
      setIsSharing(false);
      setShareSuccess(true);
      setTimeout(() => {
        setSelectedBuyer(null);
        setShareSuccess(false);
      }, 2000);
    }, 1200);
  };

  if (!isFocused) return null;

  return (
    <View style={{ flex: 1, backgroundColor: '#FDFBF7' }}>
      <ScrollView style={s.container} contentContainerStyle={{ alignSelf: 'center', width: '100%', maxWidth: 1200, paddingBottom: 100, flexDirection: 'row', flexWrap: 'wrap', gap: 16 }} showsVerticalScrollIndicator={false}>
        <View style={s.header}>
          <Text style={s.title}>{t('Buyer Market')}</Text>
          <Text style={s.subtitle}>{t('Connect with verified global businesses looking to source directly from artisans.')}</Text>
        </View>

        {BUYERS.map((item) => (
          <View key={item.id} style={s.card}>
            <View style={s.cardHeader}>
              <Image source={{ uri: item.image }} style={s.buyerImage} />
              <View style={s.headerText}>
                <View style={s.nameRow}>
                  <Text style={s.name}>{item.name}</Text>
                  {item.verified && <Ionicons name="checkmark-circle" size={16} color="#10B981" style={{ marginLeft: 4 }} />}
                </View>
                <Text style={s.meta}>{t(item.type)} • {t(item.location)}</Text>
              </View>
            </View>
            
            <View style={s.cardBody}>
              <View style={s.tagRow}>
                <Ionicons name="color-palette" size={14} color="#C36F50" />
                <Text style={s.interests}>{t('Buying:')} <Text style={{ color: '#2A2624', fontWeight: '500' }}>{t(item.interests)}</Text></Text>
              </View>
              <View style={s.tagRow}>
                <Ionicons name="cube" size={14} color="#6B6562" />
                <Text style={s.minQty}>{t('Min. Order:')} <Text style={{ color: '#2A2624', fontWeight: '500' }}>{item.minQty}</Text></Text>
              </View>
            </View>

            <TouchableOpacity style={s.contactBtn} onPress={() => handleContact(item.name)} accessibilityRole="button">
              <Ionicons name="paper-plane" size={16} color="white" />
              <Text style={s.contactText}>{t('Share Catalog')}</Text>
            </TouchableOpacity>
          </View>
        ))}
      </ScrollView>

      {/* Professional Custom Modal */}
      <Modal visible={!!selectedBuyer} transparent animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            {shareSuccess ? (
              <View style={s.modalSuccess}>
                <View style={s.successCircle}>
                  <Ionicons name="checkmark" size={32} color="white" />
                </View>
                <Text style={s.modalTitle}>{t('Catalog Shared!')}</Text>
                <Text style={s.modalSubtitle}>
                  {t('Your catalog was sent successfully to')} {selectedBuyer}. {t('They will contact you soon.')}
                </Text>
              </View>
            ) : (
              <View style={s.modalContent}>
                <View style={s.modalIconWrap}>
                  <Ionicons name="share-social" size={28} color="#C36F50" />
                </View>
                <Text style={s.modalTitle}>{t('Share Catalog')}</Text>
                <Text style={s.modalSubtitle}>
                  {t('Do you want to securely send your full product catalog and contact details to')} <Text style={{fontWeight: 'bold', color: '#2A2624'}}>{selectedBuyer}</Text>?
                </Text>
                
                <View style={s.modalActions}>
                  <TouchableOpacity 
                    style={s.modalCancelBtn} 
                    onPress={() => setSelectedBuyer(null)}
                    disabled={isSharing}
                  >
                    <Text style={s.modalCancelText}>{t('Cancel')}</Text>
                  </TouchableOpacity>
                  
                  <TouchableOpacity 
                    style={s.modalShareBtn} 
                    onPress={confirmShare}
                    disabled={isSharing}
                  >
                    {isSharing ? (
                      <ActivityIndicator color="white" size="small" />
                    ) : (
                      <>
                        <Ionicons name="paper-plane" size={16} color="white" />
                        <Text style={s.modalShareText}>{t('Send Catalog')}</Text>
                      </>
                    )}
                  </TouchableOpacity>
                </View>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16 },
  header: { width: '100%', marginTop: Platform.OS === 'ios' ? 60 : 40, marginBottom: 24, paddingHorizontal: 4 },
  title: { fontSize: 32, fontWeight: '900', color: '#2A2624', letterSpacing: -1, marginBottom: 4 },
  subtitle: { fontSize: 15, color: '#6B6562', lineHeight: 22, maxWidth: '90%' },
  card: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, width: Platform.OS === 'web' ? '48%' : '100%', minWidth: 300, flexGrow: 1, elevation: 3, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, borderWidth: 1, borderColor: '#F5F5F5' },
  cardHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  buyerImage: { width: 56, height: 56, borderRadius: 12, backgroundColor: '#F3F4F6' },
  headerText: { marginLeft: 16, flex: 1 },
  nameRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 2 },
  name: { fontSize: 17, fontWeight: 'bold', color: '#2A2624' },
  meta: { fontSize: 13, color: '#6B6562' },
  cardBody: { backgroundColor: '#FDFBF7', borderRadius: 12, padding: 12, marginBottom: 16, borderWidth: 1, borderColor: '#F5F5F5' },
  tagRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 8 },
  interests: { fontSize: 13, color: '#6B6562', marginLeft: 8, flex: 1 },
  minQty: { fontSize: 13, color: '#6B6562', marginLeft: 8 },
  contactBtn: { flexDirection: 'row', backgroundColor: '#2A2624', paddingVertical: 14, borderRadius: 12, justifyContent: 'center', alignItems: 'center' },
  contactText: { color: 'white', fontSize: 15, fontWeight: 'bold', marginLeft: 8 },

  /* Modal Styles */
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: 'white', borderRadius: 20, width: '100%', maxWidth: 400, padding: 24, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 12 },
  modalContent: { alignItems: 'center' },
  modalSuccess: { alignItems: 'center', paddingVertical: 20 },
  successCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalIconWrap: { width: 56, height: 56, borderRadius: 28, backgroundColor: '#FDF2EE', justifyContent: 'center', alignItems: 'center', marginBottom: 16 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2A2624', marginBottom: 8, textAlign: 'center' },
  modalSubtitle: { fontSize: 15, color: '#6B6562', textAlign: 'center', lineHeight: 22, marginBottom: 24 },
  modalActions: { flexDirection: 'row', width: '100%', gap: 12 },
  modalCancelBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  modalCancelText: { color: '#6B6562', fontSize: 15, fontWeight: 'bold' },
  modalShareBtn: { flex: 1, paddingVertical: 14, borderRadius: 12, backgroundColor: '#C36F50', flexDirection: 'row', justifyContent: 'center', alignItems: 'center', gap: 8 },
  modalShareText: { color: 'white', fontSize: 15, fontWeight: 'bold' }
});
