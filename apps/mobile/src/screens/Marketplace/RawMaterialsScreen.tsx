import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Platform, Modal, ActivityIndicator, TextInput, Dimensions } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import { useNavigation } from '@react-navigation/native';

const MATERIALS = [
  {
    id: '1', 
    name: 'Raw Cotton Yarn (40s)', 
    category: 'Textiles',
    image: 'https://picsum.photos/seed/karigar13/400/400',
    lowestPrice: 250, 
    unit: 'kg',
    suppliers: [
      { id: 's1', name: 'TexMill Direct', location: 'Coimbatore', price: 250, rating: 4.8 },
      { id: 's2', name: 'Gujarat Yarn Co.', location: 'Surat', price: 265, rating: 4.2 },
      { id: 's3', name: 'Madurai Threads', location: 'Madurai', price: 280, rating: 4.5 }
    ]
  },
  {
    id: '2', 
    name: 'Mulberry Silk Thread', 
    category: 'Textiles',
    image: 'https://picsum.photos/seed/karigar14/400/400',
    lowestPrice: 3200, 
    unit: 'kg',
    suppliers: [
      { id: 's4', name: 'Kanchipuram Silks Hub', location: 'Kanchipuram', price: 3200, rating: 4.9 },
      { id: 's5', name: 'Mysore Silk Traders', location: 'Mysore', price: 3350, rating: 4.6 }
    ]
  },
  {
    id: '3', 
    name: 'Terracotta Craft Clay', 
    category: 'Pottery',
    image: 'https://picsum.photos/seed/karigar15/400/400',
    lowestPrice: 45, 
    unit: 'kg',
    suppliers: [
      { id: 's6', name: 'Clay & Co', location: 'Pune', price: 45, rating: 4.3 },
      { id: 's7', name: 'Dharavi Potters Supply', location: 'Mumbai', price: 50, rating: 4.7 }
    ]
  },
  {
    id: '4', 
    name: 'Premium Teak Wood Blocks', 
    category: 'Woodwork',
    image: 'https://picsum.photos/seed/karigar16/400/400',
    lowestPrice: 1200,
    unit: 'cft',
    suppliers: [
      { id: 's8', name: 'Kerala Timbers', location: 'Kochi', price: 1200, rating: 4.6 },
      { id: 's9', name: 'Central Wood Depot', location: 'Nagpur', price: 1350, rating: 4.4 }
    ]
  }
];

export default function RawMaterialsScreen({ navigation }: any) {
  const { t } = useTranslation();
  const [viewMode, setViewMode] = useState<'list' | 'map'>('list');
  const [expandedId, setExpandedId] = useState<string | null>(null);
  const [processingPayment, setProcessingPayment] = useState(false);
  const [orderModal, setOrderModal] = useState<any>(null);
  const [orderQty, setOrderQty] = useState<string>('10');
  const [orderSuccess, setOrderSuccess] = useState(false);

  const IFrame = Platform.OS === 'web' ? (props: any) => React.createElement('iframe', props) : null;

  React.useEffect(() => {
    if (Platform.OS === 'web') {
      const handleMessage = (event: any) => {
        if (event.data && event.data.type === 'SOURCE_MATERIAL') {
          setOrderModal(event.data);
          setOrderQty('10');
          setOrderSuccess(false);
        }
      };
      window.addEventListener('message', handleMessage);
      return () => window.removeEventListener('message', handleMessage);
    }
  }, []);

  const mapboxHtml = `<!DOCTYPE html>
    <html>
    <head>
    <meta charset="utf-8">
    <title>Craft Map</title>
    <meta name="viewport" content="initial-scale=1,maximum-scale=1,user-scalable=no">
    <link href="https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.css" rel="stylesheet">
    <script src="https://api.mapbox.com/mapbox-gl-js/v3.2.0/mapbox-gl.js"></script>
    <style>
      body { margin: 0; padding: 0; font-family: sans-serif; }
      #map { position: absolute; top: 0; bottom: 0; width: 100%; border-radius: 16px;}
      .mapboxgl-popup { max-width: 250px; }
      .mapboxgl-popup-content { padding: 12px; border-radius: 12px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); }
      .marker-title { font-weight: bold; color: #2A2624; margin-bottom: 4px; font-size: 14px; }
      .marker-loc { color: #6B6562; font-size: 12px; }
      .marker-btn { background: #C36F50; color: white; padding: 4px 8px; border-radius: 4px; border: none; font-size: 11px; margin-top: 8px; cursor: pointer; width: 100%; font-weight: bold; }
    </style>
    </head>
    <body>
    <div id="map"></div>
    <script>
      mapboxgl.accessToken = 'pk.YOUR_MAPBOX_TOKEN_HERE';
      const map = new mapboxgl.Map({
          container: 'map',
          style: 'mapbox://styles/mapbox/outdoors-v12',
          center: [78.9629, 20.5937],
          zoom: 4.5
      });
      map.addControl(new mapboxgl.NavigationControl(), 'bottom-right');

      const suppliers = [
        { lng: 76.9558, lat: 11.0168, name: "TexMill Direct", type: "Raw Cotton Yarn", loc: "Coimbatore, TN", price: "₹250/kg" },
        { lng: 72.8311, lat: 21.1702, name: "Gujarat Yarn Co.", type: "Raw Cotton Yarn", loc: "Surat, GJ", price: "₹265/kg" },
        { lng: 78.1198, lat: 9.9252, name: "Madurai Threads", type: "Raw Cotton Yarn", loc: "Madurai, TN", price: "₹280/kg" },
        { lng: 79.7036, lat: 12.8342, name: "Kanchipuram Silks", type: "Mulberry Silk", loc: "Kanchipuram, TN", price: "₹3200/kg" },
        { lng: 76.6394, lat: 12.2958, name: "Mysore Silk Traders", type: "Mulberry Silk", loc: "Mysore, KA", price: "₹3350/kg" },
        { lng: 73.8567, lat: 18.5204, name: "Clay & Co", type: "Terracotta Clay", loc: "Pune, MH", price: "₹45/kg" },
        { lng: 72.8562, lat: 19.0380, name: "Dharavi Potters", type: "Terracotta Clay", loc: "Mumbai, MH", price: "₹50/kg" },
        { lng: 76.2711, lat: 9.9312, name: "Kerala Timbers", type: "Teak Wood", loc: "Kochi, KL", price: "₹1200/cft" },
        { lng: 79.0882, lat: 21.1458, name: "Central Wood Depot", type: "Teak Wood", loc: "Nagpur, MH", price: "₹1350/cft" }
      ];

      suppliers.forEach(sup => {
          let color = '#C36F50'; 
          if(sup.type.includes('Silk')) color = '#8B5CF6'; 
          if(sup.type.includes('Wood')) color = '#92400E'; 
          if(sup.type.includes('Cotton')) color = '#3B82F6'; 

          const html = \`<div class="marker-title">\${sup.name}</div>
                        <div class="marker-loc">📍 \${sup.loc}</div>
                        <div class="marker-loc">🏷️ \${sup.type} • \${sup.price}</div>
                        <button class="marker-btn" onclick="window.parent.postMessage({ type: 'SOURCE_MATERIAL', supplierName: '\${sup.name}', materialName: '\${sup.type}', supplierPrice: '\${sup.price}', location: '\${sup.loc}' }, '*')">Source Material</button>\`;

          new mapboxgl.Marker({ color: color })
              .setLngLat([sup.lng, sup.lat])
              .setPopup(new mapboxgl.Popup({ offset: 25 }).setHTML(html))
              .addTo(map);
      });
    </script>
    </body>
    </html>`;

  return (
    <View style={s.container}>
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#2A2624" />
        </TouchableOpacity>
        <Text style={s.title}>{t('Raw Materials')}</Text>
        <View style={{ width: 40 }} />
      </View>

      <View style={s.tabContainer}>
        <TouchableOpacity style={[s.tab, viewMode === 'list' && s.activeTab]} onPress={() => setViewMode('list')}>
          <Ionicons name="list" size={18} color={viewMode === 'list' ? '#C36F50' : '#A09C9A'} style={{marginRight: 6}} />
          <Text style={[s.tabText, viewMode === 'list' && s.activeTabText]}>{t('Supplier List')}</Text>
        </TouchableOpacity>
        <TouchableOpacity style={[s.tab, viewMode === 'map' && s.activeTab]} onPress={() => setViewMode('map')}>
          <Ionicons name="map" size={18} color={viewMode === 'map' ? '#C36F50' : '#A09C9A'} style={{marginRight: 6}} />
          <Text style={[s.tabText, viewMode === 'map' && s.activeTabText]}>{t('Craft Map')}</Text>
        </TouchableOpacity>
      </View>

      {viewMode === 'map' ? (
        <View style={s.mapContainer}>
          {Platform.OS === 'web' && IFrame ? (
            <IFrame srcDoc={mapboxHtml} style={{width: '100%', height: '100%', border: 'none', borderRadius: 16}} />
          ) : (
            <Text>Mapbox requires native modules on mobile</Text>
          )}
        </View>
      ) : (
        <ScrollView style={{flex: 1, padding: 20}}>
          {MATERIALS.map(m => (
            <View key={m.id} style={s.matCard}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Image source={{uri: m.image}} style={s.matImg} />
                <View style={{flex: 1, paddingRight: 16}}>
                  <Text style={s.matName}>{m.name}</Text>
                  <Text style={s.matCat}>{m.category}</Text>
                  <Text style={s.matPrice}>Starts from ₹{m.lowestPrice}/{m.unit}</Text>
                </View>
                <TouchableOpacity onPress={() => setExpandedId(expandedId === m.id ? null : m.id)} style={s.expandBtn}>
                  <Ionicons name={expandedId === m.id ? "chevron-up" : "chevron-down"} size={20} color="#2A2624" />
                </TouchableOpacity>
              </View>

              {expandedId === m.id && (
                <View style={s.suppliersList}>
                  {m.suppliers.map(sup => (
                    <View key={sup.id} style={s.supplierRow}>
                      <View style={{flex: 1}}>
                        <Text style={s.supName}>{sup.name}</Text>
                        <View style={{flexDirection: 'row', alignItems: 'center', marginTop: 4}}>
                          <Ionicons name="location" size={12} color="#6B6562" />
                          <Text style={s.supLoc}>{sup.location}</Text>
                          <Ionicons name="star" size={12} color="#F59E0B" style={{marginLeft: 12}} />
                          <Text style={s.supRating}>{sup.rating}</Text>
                        </View>
                      </View>
                      <View style={{alignItems: 'flex-end'}}>
                        <Text style={s.supPrice}>₹{sup.price}/{m.unit}</Text>
                        <TouchableOpacity 
                          style={s.buyBtn} 
                          onPress={() => {
                            setOrderModal({
                              supplierName: sup.name,
                              location: sup.location,
                              materialName: m.name,
                              supplierPrice: `₹${sup.price}/${m.unit}`
                            });
                            setOrderQty('10');
                            setOrderSuccess(false);
                          }}
                        >
                          <Text style={s.buyBtnText}>{t('materials.contactSupplier')}</Text>
                        </TouchableOpacity>
                      </View>
                    </View>
                  ))}
                </View>
              )}
            </View>
          ))}
          <View style={{height: 100}} />
        </ScrollView>
      )}

      {/* Modern Order Modal */}
      <Modal visible={!!orderModal} transparent={true} animationType="fade">
        <View style={s.modalOverlay}>
          <View style={s.modalCard}>
            <TouchableOpacity style={s.closeBtn} onPress={() => setOrderModal(null)}>
              <Ionicons name="close" size={24} color="#6B6562" />
            </TouchableOpacity>

            {!orderSuccess ? (
              <>
                <Text style={s.modalTitle}>{t('materials.title')}</Text>
                
                <View style={s.supplierCard}>
                  <Text style={s.supplierName}>{orderModal?.supplierName}</Text>
                  <Text style={s.supplierLoc}><Ionicons name="location" size={14} /> {orderModal?.location}</Text>
                  <View style={s.materialRow}>
                    <Text style={s.materialType}>{orderModal?.materialName}</Text>
                    <Text style={s.materialPrice}>{orderModal?.supplierPrice}</Text>
                  </View>
                </View>

                <Text style={s.inputLabel}>{t('catalog.quantity')}</Text>
                <View style={s.qtyInputRow}>
                  <TextInput 
                    style={s.qtyInput} 
                    keyboardType="numeric" 
                    value={orderQty}
                    onChangeText={setOrderQty}
                  />
                  <Text style={s.qtyUnit}>{(orderModal?.supplierPrice || '').includes("cft") ? "cft" : "kg"}</Text>
                </View>
                
                <View style={s.summaryRow}>
                  <Text style={s.summaryLabel}>{t('orders.totalAmount')}</Text>
                  <Text style={s.summaryTotal}>₹{((parseInt(orderQty) || 0) * parseInt((orderModal?.supplierPrice || "0").replace(/[^0-9]/g, ""))).toLocaleString()}</Text>
                </View>

                <TouchableOpacity style={s.confirmOrderBtn} onPress={() => {
                  setProcessingPayment(true);
                  setTimeout(() => {
                    setProcessingPayment(false);
                    setOrderSuccess(true);
                  }, 1500);
                }}>
                  {processingPayment ? <ActivityIndicator color="white" /> : <Text style={s.confirmOrderBtnText}>{t('marketplace.buyNow')}</Text>}
                </TouchableOpacity>
              </>
            ) : (
              <View style={s.successView}>
                <View style={s.successCircle}>
                  <Ionicons name="checkmark" size={32} color="white" />
                </View>
                <Text style={s.successTitle}>{t('marketplace.orderPlaced')}</Text>
                <Text style={s.successDesc}>Your sourcing request has been sent to {orderModal?.supplierName}. They will confirm within 24 hours.</Text>
                <TouchableOpacity style={s.confirmOrderBtn} onPress={() => setOrderModal(null)}>
                  <Text style={s.confirmOrderBtnText}>{t('common.done')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2A2624' },
  tabContainer: { flexDirection: 'row', padding: 20, paddingBottom: 10, gap: 12 },
  tab: { flex: 1, flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 12, borderRadius: 12, backgroundColor: 'white', borderWidth: 1, borderColor: '#E3E7EB' },
  activeTab: { backgroundColor: '#FDF2EE', borderColor: '#C36F50' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#6B6562' },
  activeTabText: { color: '#C36F50', fontWeight: 'bold' },
  mapContainer: { flex: 1, padding: 20, paddingTop: 10 },
  matCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8, elevation: 2 },
  matImg: { width: 60, height: 60, borderRadius: 12, marginRight: 16 },
  matName: { fontSize: 16, fontWeight: 'bold', color: '#2A2624', marginBottom: 4 },
  matCat: { fontSize: 13, color: '#6B6562', marginBottom: 8 },
  matPrice: { fontSize: 14, fontWeight: 'bold', color: '#C36F50' },
  expandBtn: { width: 36, height: 36, borderRadius: 18, backgroundColor: '#F9FAFB', justifyContent: 'center', alignItems: 'center' },
  suppliersList: { marginTop: 16, paddingTop: 16, borderTopWidth: 1, borderTopColor: '#F0F0F0' },
  supplierRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', paddingVertical: 12 },
  supName: { fontSize: 15, fontWeight: '600', color: '#2A2624' },
  supLoc: { fontSize: 12, color: '#6B6562', marginLeft: 4 },
  supRating: { fontSize: 12, color: '#6B6562', marginLeft: 4 },
  supPrice: { fontSize: 14, fontWeight: 'bold', color: '#15803D', marginBottom: 8 },
  buyBtn: { backgroundColor: '#C36F50', paddingVertical: 6, paddingHorizontal: 16, borderRadius: 6 },
  buyBtnText: { color: 'white', fontSize: 12, fontWeight: 'bold' },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalCard: { backgroundColor: 'white', borderRadius: 24, padding: 24, width: '100%', maxWidth: 400, elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: 10 }, shadowOpacity: 0.1, shadowRadius: 20, position: 'relative' },
  closeBtn: { position: 'absolute', top: 16, right: 16, zIndex: 10, padding: 8 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', color: '#2A2624', marginBottom: 20 },
  supplierCard: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#E3E7EB', marginBottom: 24 },
  supplierName: { fontSize: 16, fontWeight: 'bold', color: '#2A2624', marginBottom: 4 },
  supplierLoc: { fontSize: 13, color: '#6B6562', marginBottom: 12 },
  materialRow: { flexDirection: 'row', justifyContent: 'space-between', paddingTop: 12, borderTopWidth: 1, borderTopColor: '#E3E7EB' },
  materialType: { fontSize: 14, color: '#3D3832', fontWeight: '600' },
  materialPrice: { fontSize: 14, color: '#C36F50', fontWeight: 'bold' },
  inputLabel: { fontSize: 14, color: '#3D3832', fontWeight: '600', marginBottom: 8 },
  qtyInputRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 24 },
  qtyInput: { flex: 1, backgroundColor: '#F9FAFB', borderWidth: 1, borderColor: '#E3E7EB', padding: 12, borderRadius: 8, fontSize: 18, marginRight: 12, textAlign: 'center' },
  qtyUnit: { fontSize: 18, color: '#2A2624', fontWeight: '500', width: 40 },
  summaryRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, backgroundColor: '#FEF2F2', padding: 16, borderRadius: 12 },
  summaryLabel: { fontSize: 14, color: '#D97757', fontWeight: 'bold' },
  summaryTotal: { fontSize: 20, color: '#92400E', fontWeight: 'bold' },
  confirmOrderBtn: { backgroundColor: '#C36F50', padding: 16, borderRadius: 8, alignItems: 'center', width: '100%' },
  confirmOrderBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  successView: { alignItems: 'center', padding: 20 },
  successTitle: { fontSize: 24, fontWeight: 'bold', color: '#15803D', marginTop: 16, marginBottom: 8 },
  successDesc: { textAlign: 'center', color: '#6B6562', lineHeight: 20, marginBottom: 32 },
  successCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#10B981', justifyContent: 'center', alignItems: 'center', marginBottom: 8 }
});
