import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, TouchableOpacity, RefreshControl, Image, StyleSheet, Dimensions, Platform, ScrollView, Modal, Alert } from 'react-native';
import axios from 'axios';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { API_URL } from '../../services/api';
import { useTranslation } from '../../i18n/useTranslation';
import { useCatalogStore } from '../../store/catalogStore';
import { useTheme } from '../../theme/useTheme';

import { useIsFocused } from '@react-navigation/native';

export default function ProductsScreen({ navigation }: any) {
  const isFocused = useIsFocused();
  const { isDark } = useTheme();
  const { t } = useTranslation();
  const { user, profileData } = useAuthStore();
  const { products, removeProduct } = useCatalogStore();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selectedProduct, setSelectedProduct] = useState<any>(null);
  const [showPassport, setShowPassport] = useState(false);
  const windowWidth = Dimensions.get("window").width;

  const handleDelete = (id: string) => {
    removeProduct(id);
    setSelectedProduct(null);
  };

  const renderItem = ({ item }: { item: any }) => {
    // Debugging line for the hackathon
    console.log("Rendering product:", item.name, "Image URI start:", item.imageUri?.substring(0, 50));

    return (
    <TouchableOpacity style={s.productCard} onPress={() => setSelectedProduct(item)}>
      <View style={{ width: '100%', height: 200, backgroundColor: '#FDF2EE', position: 'relative' }}>
        <Image 
           source={{ uri: item.imageUri || item.imageUrl || (item.images?.[0]?.url) || 'https://picsum.photos/seed/karigar23/400/400' }} 
           style={{ width: '100%', height: 200 }} 
           resizeMode="cover"
           onError={(e) => console.log('Image failed to load for', item.name, e.nativeEvent)}
        />
        <View style={[s.statusBadge, item.status === 'PUBLISHED' ? s.published : s.draft]}>
          <Text style={item.status === 'PUBLISHED' ? s.publishedText : s.draftText}>{t(item.status || 'DRAFT')}</Text>
        </View>
      </View>
      <View style={s.productInfo}>
        <View style={{ marginBottom: 8, minHeight: 45 }}>
          <Text style={s.productName} numberOfLines={2}>{item.name || t('Untitled Product')}</Text>
          <Text style={s.productPrice}>₹{item.price ? item.price.toLocaleString() : '-'}</Text>
        </View>
        <View style={s.productMetaRow}>
          <Ionicons name="folder-outline" size={12} color="#888" />
          <Text style={s.productMetaText} numberOfLines={1}>{t(item.category || 'Uncategorized')}</Text>
          <Text style={[s.productMetaText, { marginLeft: 'auto' }]}>{t('Stock:')} {item.stock || 0}</Text>
        </View>

        <View style={s.cardActions}>
          <TouchableOpacity style={s.actionBtn} onPress={(e) => { 
              e.stopPropagation(); 
              if (Platform.OS === 'web') { window.alert('Link copied to clipboard!'); } 
              else { Alert.alert('Share', 'Link copied to clipboard!'); }
          }}>
            <Ionicons name="share-social-outline" size={18} color="#6B6562" />
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={(e) => { 
              e.stopPropagation(); 
              navigation.navigate('Add Product', { product: item });
          }}>
            <Ionicons name="create-outline" size={18} color="#6B6562" />
          </TouchableOpacity>
          <TouchableOpacity style={s.actionBtn} onPress={(e) => { 
              e.stopPropagation(); 
              handleDelete(item.id); 
          }}>
            <Ionicons name="trash-outline" size={18} color="#DC2626" />
          </TouchableOpacity>
        </View>
      </View>
    </TouchableOpacity>
    );
  };

  if (!isFocused) return null;

  return (
    <View style={[s.container, { backgroundColor: isDark ? '#0B0F19' : '#FAF8F1' }]}>
      <View style={s.header}>
        <View style={{flexDirection: 'row', alignItems: 'center'}}>
          <TouchableOpacity onPress={() => navigation.navigate('Home')} style={s.backBtn}>
            <Ionicons name="arrow-back" size={28} color="#2A2624" />
          </TouchableOpacity>
          <Text style={s.title}>{t('nav.myCatalog')}</Text>
        </View>
        <View style={{ flexDirection: 'row', gap: 8 }}>
          <TouchableOpacity style={[s.addBtn, { backgroundColor: '#F59E0B', paddingHorizontal: 10 }]} onPress={() => navigation.navigate('AuthenticityTag')}>
            <Ionicons name="qr-code" size={20} color="white" />
          </TouchableOpacity>
          <TouchableOpacity style={s.addBtn} onPress={() => navigation.navigate('Add Product')}>
            <Ionicons name="add" size={20} color="white" />
            <Text style={s.addBtnText}>{t('nav.addProduct')}</Text>
          </TouchableOpacity>
        </View>
      </View>

      {error ? (
        <View style={s.errorContainer}>
          <Ionicons name="alert-circle" size={32} color="#EF4444" />
          <Text style={s.errorText}>{t(error)}</Text>
        </View>
      ) : products.length === 0 ? (
        <View style={s.emptyState}>
          <View style={s.emptyIconContainer}>
            <Ionicons name="cube-outline" size={48} color="#394B72" />
          </View>
          <Text style={s.emptyTitle}>{t('empty.noCatalog')}</Text>
          <Text style={s.emptySubtitle}>{t('empty.startAddingFirst')}</Text>
          <TouchableOpacity style={s.emptyAddBtn} onPress={() => navigation.navigate('Add Product')}>
            <Text style={s.emptyAddBtnText}>{t('nav.addProduct')}</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={{ paddingBottom: 100, alignSelf: 'center', width: '100%', maxWidth: 1200 }}
        >
          <View style={s.gridContainer}>
            {products.map((item) => <React.Fragment key={item.id}>{renderItem({ item })}</React.Fragment>)}
          </View>
        </ScrollView>
      )}

      {/* Product Detail Modal */}
      <Modal visible={!!selectedProduct} transparent={false} animationType="slide">
        <View style={{ flex: 1, backgroundColor: "#FAF8F5" }}>
          
          {/* Top Navbar */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", padding: 16, paddingHorizontal: 24, backgroundColor: "white", borderBottomWidth: 1, borderBottomColor: "#E5E7EB" }}>
            <View style={{flexDirection: "row", alignItems: "center"}}>
              <Text style={{ fontSize: 16, fontWeight: "800", color: "#4B5563" }}>KALA SETU <Text style={{fontWeight: "400", color: "#9CA3AF"}}>| AI-Powered Digital Platform for Indian Artisans</Text></Text>
            </View>
            {Platform.OS === "web" && windowWidth > 768 && (
              <View style={{ flexDirection: "row", gap: 32, alignItems: "center" }}>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#1F2937" }}>Marketplace</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#1F2937" }}>How it Works</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#1F2937" }}>For Artisans</Text>
                <Text style={{ fontSize: 13, fontWeight: "700", color: "#1F2937" }}>For Buyers</Text>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#E5E7EB", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20}}>
                  <Ionicons name="globe-outline" size={16} />
                  <Text style={{ fontSize: 13, fontWeight: "600" }}>English (EN)</Text>
                </View>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 8, borderWidth: 1, borderColor: "#E5E7EB", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20}}>
                  <Ionicons name="person-outline" size={16} />
                  <Text style={{ fontSize: 13, fontWeight: "600" }}>My Account</Text>
                </View>
              </View>
            )}
          </View>

          {selectedProduct && (
            <ScrollView contentContainerStyle={{ padding: Platform.OS === "web" && windowWidth > 768 ? 40 : 20, paddingBottom: 60, alignSelf: "center", width: "100%", maxWidth: 1200 }}>
              
              <TouchableOpacity onPress={() => setSelectedProduct(null)} style={{ flexDirection: "row", alignItems: "center", marginBottom: 32 }}>
                <Ionicons name="arrow-back" size={16} color="#4B5563" />
                <Text style={{ marginLeft: 8, fontSize: 13, fontWeight: "700", letterSpacing: 1, color: "#4B5563" }}>{t('common.back')}</Text>
              </TouchableOpacity>

              <View style={{ flexDirection: Platform.OS === "web" && windowWidth > 768 ? "row" : "column", gap: 48 }}>
                
                {/* Left Col - Image */}
                <View style={{ flex: 1, position: "relative", minHeight: 400 }}>
                  <Image 
                    source={{ uri: selectedProduct.imageUri || selectedProduct.imageUrl || (selectedProduct.images?.[0]?.url) || "https://picsum.photos/seed/karigar24/800/800" }} 
                    style={{ width: "100%", height: "100%", aspectRatio: Platform.OS === "web" && windowWidth > 768 ? 4/3 : 1, borderRadius: 24, backgroundColor: "#111827" }} 
                    resizeMode="cover"
                  />
                  {/* Floating Tags */}
                  <View style={{ position: "absolute", top: 24, left: 24, gap: 12 }}>
                    <View style={{ backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: "flex-start" }}>
                      <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 1, color: "#1F2937" }}>{(selectedProduct.category || "CRAFT").toUpperCase()}</Text>
                    </View>
                    <View style={{ backgroundColor: "#FDE68A", paddingHorizontal: 16, paddingVertical: 8, borderRadius: 20, alignSelf: "flex-start" }}>
                      <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 1, color: "#92400E" }}>{t('profile.verifiedBadge')}</Text>
                    </View>
                  </View>
                </View>

                {/* Right Col - Details */}
                <View style={{ flex: 1 }}>
                  <Text style={{ fontSize: Platform.OS === "web" && windowWidth > 768 ? 56 : 36, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", fontWeight: "bold", color: "#111827", marginBottom: 16 }}>{selectedProduct.name}</Text>
                  <Text style={{ fontSize: 15, color: "#4B5563", marginBottom: 32 }}>{t('marketplace.artisanStory')}: <Text style={{fontWeight: "700", color: "#92400E"}}>{profileData?.name || user?.name || "Artisan"}</Text></Text>
                  
                  {/* Metrics Row */}
                  <View style={{ flexDirection: "row", gap: 16, marginBottom: 40 }}>
                    <View style={{ flex: 1, backgroundColor: "white", padding: 24, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
                      <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 1, color: "#6B7280", marginBottom: 12 }}>{t('catalog.price')}</Text>
                      <Text style={{ fontSize: 32, fontWeight: "800", color: "#1F2937" }}>₹{selectedProduct.price ? selectedProduct.price.toLocaleString() : "1,900"}</Text>
                    </View>
                    <View style={{ flex: 1, backgroundColor: "white", padding: 24, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", shadowColor: "#000", shadowOpacity: 0.05, shadowRadius: 10, elevation: 2 }}>
                      <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 1, color: "#6B7280", marginBottom: 8 }}>{t('catalog.quantity')}</Text>
                      <Text style={{ fontSize: 16, fontWeight: "800", color: "#1F2937" }}>{selectedProduct.monthlyCapacity || 45} {t('marketplace.units')}</Text>
                      <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 1, color: "#6B7280", marginTop: 16, marginBottom: 8 }}>{t('marketplace.delivery')}</Text>
                      <Text style={{ fontSize: 14, fontWeight: "800", color: "#1F2937" }}>3-5 {t('common.date')}</Text>
                    </View>
                  </View>

                  <Text style={{ fontSize: 13, fontWeight: "800", letterSpacing: 1, color: "#4B5563", marginBottom: 16 }}>{t('catalog.detailedDescription')}</Text>
                  <Text style={{ fontSize: 16, lineHeight: 28, color: "#374151", marginBottom: 40 }}>{selectedProduct.description || selectedProduct.descriptionEn || t('catalog.storyPlaceholder')}</Text>

                  {/* Materials & Tags */}
                  <Text style={{ fontSize: 13, fontWeight: "800", letterSpacing: 1, color: "#4B5563", marginBottom: 16 }}>{t('pricing.material')}</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 32 }}>
                    {(selectedProduct?.materials || (selectedProduct?.material ? (typeof selectedProduct.material === "string" ? selectedProduct.material.split(/[\/,]/).map((s:string) => s.trim()) : selectedProduct.material) : [t('catalog.material')])).map((m: string, i: number) => (
                      <View key={i} style={{ backgroundColor: "#F9FAFB", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: "#E5E7EB" }}><Text style={{fontSize: 14, fontWeight: "700", color: "#1F2937"}}>{m}</Text></View>
                    ))}
                  </View>

                  <Text style={{ fontSize: 13, fontWeight: "800", letterSpacing: 1, color: "#4B5563", marginBottom: 16 }}>{t('catalog.tags')}</Text>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, marginBottom: 40 }}>
                    {(selectedProduct.searchTags || selectedProduct.tags || ["#HeritageCraft", "#ArtisanDirect", "#Handmade"]).map((tVal: string, i: number) => (
                      <View key={i} style={{ backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 24, borderWidth: 1, borderColor: "#E5E7EB" }}><Text style={{fontSize: 14, fontWeight: "700", color: "#1F2937"}}>{tVal}</Text></View>
                    ))}
                  </View>

                  {/* Dimensions */}
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 24, marginBottom: 48 }}>
                    <Text style={{ fontSize: 13, fontWeight: "800", letterSpacing: 1, color: "#4B5563" }}>{t('catalog.size')}</Text>
                    <View style={{ backgroundColor: "white", paddingHorizontal: 20, paddingVertical: 12, borderRadius: 16, borderWidth: 1, borderColor: "#E5E7EB", flexDirection: "row", alignItems: "center" }}>
                      <Ionicons name="cube-outline" size={18} color="#92400E" style={{marginRight: 12}} />
                      <Text style={{ fontSize: 16, fontWeight: "800", color: "#1F2937" }}>{selectedProduct.length || 10} x {selectedProduct.breadth || 15} x {selectedProduct.height || 16} {selectedProduct.unit || "cm"}</Text>
                    </View>
                  </View>

                  {/* CTA Buttons */}
                  <TouchableOpacity style={{ backgroundColor: "#111827", padding: 18, borderRadius: 16, alignItems: "center", marginBottom: 16, flexDirection: "row", justifyContent: "center" }} onPress={() => Alert.alert(t('marketplace.contactArtisan'), t('messages.typeMessage'))}>
                    <Ionicons name="chatbubble-outline" size={22} color="white" style={{marginRight: 12}} />
                    <Text style={{ color: "white", fontSize: 18, fontWeight: "800" }}>{t('marketplace.contactArtisan')}</Text>
                  </TouchableOpacity>

                  <TouchableOpacity style={{ backgroundColor: "#FEF3C7", padding: 18, borderRadius: 16, alignItems: "center", marginBottom: 16, flexDirection: "row", justifyContent: "center", borderWidth: 1, borderColor: "#FDE68A" }} onPress={() => setShowPassport(true)}>
                    <Ionicons name="finger-print" size={22} color="#92400E" style={{marginRight: 12}} />
                    <Text style={{ color: "#92400E", fontSize: 18, fontWeight: "800" }}>{t('profile.certificates')}</Text>
                  </TouchableOpacity>
                  
                  <Text style={{ textAlign: "center", fontSize: 14, color: "#4B5563", fontWeight: "600" }}>Zero commission. Direct trade for a fairer artisan economy.</Text>

                </View>
              </View>
            </ScrollView>
          )}
        </View>
      </Modal>
    
      {/* Digital Craft Passport Modal */}
      <Modal visible={showPassport} transparent={true} animationType="fade">
        <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.6)", justifyContent: "center", alignItems: "center", padding: Platform.OS === "web" ? 40 : 20 }}>
          <View style={{ width: "100%", maxWidth: 1000, backgroundColor: "white", borderRadius: 24, overflow: "hidden", maxHeight: "100%", flexShrink: 1 }}>
            
            {/* Header (Dark) */}
            <View style={{ backgroundColor: "#1C1815", padding: Platform.OS === "web" ? 40 : 24, flexDirection: Platform.OS === "web" && windowWidth > 768 ? "row" : "column", justifyContent: "space-between", alignItems: Platform.OS === "web" && windowWidth > 768 ? "center" : "flex-start" }}>
              <TouchableOpacity onPress={() => setShowPassport(false)} style={{ position: "absolute", top: 20, right: 20, zIndex: 10 }}>
                <Ionicons name="close" size={28} color="#9CA3AF" />
              </TouchableOpacity>
              
              <View style={{ flex: 1, paddingRight: Platform.OS === "web" ? 40 : 0 }}>
                <View style={{ flexDirection: "row", alignItems: "center", borderWidth: 1, borderColor: "#92400E", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, alignSelf: "flex-start", marginBottom: 24 }}>
                  <Ionicons name="finger-print" size={14} color="#FDE68A" style={{marginRight: 6}} />
                  <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 1, color: "#FDE68A" }}>AUTHENTICITY VERIFIED</Text>
                </View>
                <Text style={{ fontSize: Platform.OS === "web" && windowWidth > 768 ? 48 : 36, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", fontWeight: "bold", color: "white", marginBottom: 16 }}>Digital Craft Passport</Text>
                <Text style={{ fontSize: 16, color: "#D1D5DB", lineHeight: 26, maxWidth: 600 }}>This document certifies the origin, materials, and master artisan behind this genuine handmade artifact.</Text>
              </View>
              
              <View style={{ alignItems: "center", marginTop: Platform.OS === "web" && windowWidth > 768 ? 0 : 32 }}>
                <View style={{ backgroundColor: "white", padding: 12, borderRadius: 16, marginBottom: 12 }}>
                  <Image source={{uri: "https://api.qrserver.com/v1/create-qr-code/?size=150x150&data=kalasetu-verify-" + (selectedProduct?.id || "demo")}} style={{width: 120, height: 120}} />
                </View>
                <Text style={{ fontSize: 11, fontWeight: "800", letterSpacing: 1, color: "#9CA3AF" }}>SCAN TO VERIFY</Text>
              </View>
            </View>

            {/* Body */}
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ padding: Platform.OS === "web" ? 40 : 24 }}>
              <View style={{ flexDirection: Platform.OS === "web" && windowWidth > 768 ? "row" : "column", gap: 48 }}>
                
                {/* Image */}
                <View style={{ flex: Platform.OS === "web" && windowWidth > 768 ? 0.35 : 1 }}>
                  <Image 
                    source={{ uri: selectedProduct?.imageUri || selectedProduct?.imageUrl || selectedProduct?.images?.[0]?.url || "https://picsum.photos/seed/karigar24/800/800" }} 
                    style={{ width: "100%", aspectRatio: 0.6, borderRadius: 16, backgroundColor: "#111827" }} 
                    resizeMode="cover"
                  />
                </View>

                {/* Details */}
                <View style={{ flex: Platform.OS === "web" && windowWidth > 768 ? 0.65 : 1 }}>
                  <Text style={{ fontSize: Platform.OS === "web" && windowWidth > 768 ? 42 : 32, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", fontWeight: "bold", color: "#111827", marginBottom: 12 }}>{selectedProduct?.name}</Text>
                  <Text style={{ fontSize: 14, fontWeight: "800", color: "#92400E", letterSpacing: 1, marginBottom: 32 }}>{(selectedProduct?.category || "METAL CRAFT").toUpperCase()} <Text style={{color: "#9CA3AF"}}>? Listed {new Date().toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric" })}</Text></Text>
                  
                  <Text style={{ fontSize: 16, lineHeight: 28, color: "#374151", marginBottom: 32 }}>{selectedProduct?.description || selectedProduct?.descriptionEn || "Immerse your living space in warm ethnic charm with this exquisite handcrafted piece, created using ancient techniques passed down through generations. Rooted in tribal heritage, each piece is individually crafted by skilled artisans, making it a truly unique masterpiece of ancient Indian metalwork. Ideal as a decorative tabletop lamp, tea-light holder, or spiritual centerpiece, this durable piece seamlessly bridges rusticity with contemporary luxury. Illuminate your sanctuary while supporting authentic indigenous artisan communities."}</Text>
                  
                  <View style={{ backgroundColor: "#FAF8F5", padding: 24, borderRadius: 16, marginBottom: 40 }}>
                    <View style={{flexDirection: "row", alignItems: "center", marginBottom: 12}}>
                      <Ionicons name="time-outline" size={18} color="#92400E" style={{marginRight: 8}} />
                      <Text style={{ fontSize: 13, fontWeight: "800", letterSpacing: 1, color: "#1F2937" }}>THE HERITAGE STORY</Text>
                    </View>
                    <Text style={{ fontSize: 16, fontStyle: "italic", color: "#4B5563", lineHeight: 26 }}>"No artisan story provided; entry compiled based on visual recognition of traditional Bastar Dhokra lost-wax casting metal craft."</Text>
                  </View>

                  <View style={{ height: 1, backgroundColor: "#E5E7EB", marginBottom: 40 }} />

                  <View style={{ flexDirection: Platform.OS === "web" && windowWidth > 768 ? "row" : "column", gap: 48 }}>
                    {/* Maker Provenance */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 24, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", fontWeight: "bold", color: "#111827", marginBottom: 24 }}>Maker Provenance</Text>
                      
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 32 }}>
                        <Image source={{uri: "https://i.pravatar.cc/150?u=daksh"}} style={{width: 64, height: 64, borderRadius: 32, marginRight: 16}} />
                        <View>
                          <Text style={{ fontSize: 20, fontWeight: "bold", color: "#111827", marginBottom: 4 }}>{profileData?.name || user?.name || "Daksh Sharma"}</Text>
                          <Text style={{ fontSize: 15, color: "#4B5563" }}>18 Years of Mastery</Text>
                        </View>
                      </View>

                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                        <Ionicons name="location-outline" size={20} color="#92400E" style={{marginRight: 12}} />
                        <Text style={{ fontSize: 16, color: "#4B5563" }}>Origin: <Text style={{fontWeight: "700", color: "#111827"}}>Jaipur, Rajasthan</Text></Text>
                      </View>
                      <View style={{ flexDirection: "row", alignItems: "center" }}>
                        <Ionicons name="git-merge-outline" size={20} color="#92400E" style={{marginRight: 12}} />
                        <Text style={{ fontSize: 16, color: "#4B5563" }}>Lineage: <Text style={{fontWeight: "700", color: "#111827"}}>{selectedProduct?.category || "Metal Craft"}</Text></Text>
                      </View>
                    </View>

                    {/* Material & Creation */}
                    <View style={{ flex: 1 }}>
                      <Text style={{ fontSize: 24, fontFamily: Platform.OS === "ios" ? "Georgia" : "serif", fontWeight: "bold", color: "#111827", marginBottom: 24 }}>Material & Creation</Text>
                      
                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 16 }}>
                        <Ionicons name="leaf-outline" size={18} color="#4B5563" style={{marginRight: 8}} />
                        <Text style={{ fontSize: 13, fontWeight: "800", letterSpacing: 1, color: "#4B5563" }}>MATERIALS USED</Text>
                      </View>
                      <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 8, marginBottom: 24 }}>
                        {(selectedProduct?.materials || (selectedProduct?.material ? (typeof selectedProduct.material === "string" ? selectedProduct.material.split(/[\/,]/).map((s:string) => s.trim()) : selectedProduct.material) : ["Primary Material", "Natural Elements"])).map((m: string, i: number) => (
                          <View key={i} style={{ backgroundColor: "#F3F4F6", paddingHorizontal: 14, paddingVertical: 8, borderRadius: 20 }}><Text style={{fontSize: 14, fontWeight: "600", color: "#1F2937"}}>{m}</Text></View>
                        ))}
                      </View>

                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                        <Ionicons name="time-outline" size={18} color="#4B5563" style={{marginRight: 8}} />
                        <Text style={{ fontSize: 13, fontWeight: "800", letterSpacing: 1, color: "#4B5563" }}>CREATION TIME</Text>
                      </View>
                      <Text style={{ fontSize: 16, color: "#111827", marginBottom: 24 }}>Approximately <Text style={{fontWeight: "bold", color: "#92400E"}}>7 days</Text> per batch</Text>

                      <View style={{ flexDirection: "row", alignItems: "center", marginBottom: 12 }}>
                        <Ionicons name="cube-outline" size={18} color="#4B5563" style={{marginRight: 8}} />
                        <Text style={{ fontSize: 13, fontWeight: "800", letterSpacing: 1, color: "#4B5563" }}>DIMENSIONS</Text>
                      </View>
                      <View style={{ backgroundColor: "white", paddingHorizontal: 16, paddingVertical: 10, borderRadius: 12, borderWidth: 1, borderColor: "#E5E7EB", alignSelf: "flex-start" }}>
                        <Text style={{ fontSize: 15, fontWeight: "800", color: "#1F2937" }}>{selectedProduct?.length || 10} x {selectedProduct?.breadth || 15} x {selectedProduct?.height || 16} {selectedProduct?.unit || "inch"}</Text>
                      </View>

                    </View>
                  </View>
                </View>
              </View>
            </ScrollView>
            
            {/* Footer */}
            <View style={{ backgroundColor: "#FAF8F5", padding: 20, alignItems: "center", borderTopWidth: 1, borderTopColor: "#E5E7EB" }}>
              <Text style={{ fontSize: 12, fontWeight: "800", letterSpacing: 1, color: "#6B7280" }}>POWERED BY KALA SETU • PRESERVING INDIAN CRAFT HERITAGE</Text>
            </View>

          </View>
        </View>
      </Modal>

</View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, paddingHorizontal: 16, paddingTop: Platform.OS === 'web' ? 32 : 60 },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, alignSelf: 'center', width: '100%', maxWidth: 1200 },
  backBtn: { marginRight: 16, padding: 4 },
  title: { fontSize: 32, fontWeight: '800', color: '#2A2624', letterSpacing: -0.5 },
  addBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#394B72', paddingHorizontal: 16, paddingVertical: 10, borderRadius: 20 },
  addBtnText: { color: 'white', fontWeight: 'bold', marginLeft: 4 },
  errorContainer: { backgroundColor: '#FEE2E2', padding: 16, borderRadius: 12, flexDirection: 'row', alignItems: 'center', marginVertical: 20 },
  emptyIconContainer: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FFFBEB', justifyContent: 'center', alignItems: 'center', marginBottom: 20 },
  
  errorBox: { backgroundColor: '#FEE2E2', padding: 12, borderRadius: 12, marginBottom: 16, alignSelf: 'center', width: '100%', maxWidth: 1200 },
  errorText: { color: '#991B1B', fontSize: 14, fontWeight: '500' },
  
  gridContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 16,
    justifyContent: 'flex-start',
  },
  
  productCard: { 
    width: Platform.OS === 'web' ? 240 : '47%', 
    flexGrow: 1,
    maxWidth: Platform.OS === 'web' ? 280 : '50%',
    backgroundColor: 'white', 
    borderRadius: 16, 
    marginBottom: 8, 
    overflow: 'hidden', 
    elevation: 3, 
    shadowColor: '#000', 
    shadowOffset: { width: 0, height: 2 }, 
    shadowOpacity: 0.06, 
    shadowRadius: 8,
    borderWidth: 1,
    borderColor: 'rgba(0,0,0,0.02)'
  },
  imageContainer: { width: '100%', aspectRatio: 1, backgroundColor: '#FDF2EE', position: 'relative' },
  productImage: { width: '100%', height: '100%', resizeMode: 'cover' },
  productImagePlaceholder: { width: '100%', height: '100%', justifyContent: 'center', alignItems: 'center' },
  
  statusBadge: { position: 'absolute', top: 10, left: 10, paddingHorizontal: 8, paddingVertical: 4, borderRadius: 8 },
  published: { backgroundColor: 'rgba(21, 128, 61, 0.9)' },
  draft: { backgroundColor: 'rgba(234, 179, 8, 0.9)' },
  publishedText: { color: 'white', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  draftText: { color: 'white', fontSize: 10, fontWeight: 'bold', letterSpacing: 0.5 },
  
  productInfo: { padding: 12 },
  productName: { fontSize: 14, fontWeight: '700', color: '#2A2624', marginBottom: 4, lineHeight: 18, height: 36 },
  productPrice: { fontSize: 16, fontWeight: '800', color: '#394B72', marginBottom: 6 },
  
  productMetaRow: { flexDirection: 'row', alignItems: 'center' },
  productMetaText: { fontSize: 11, color: '#888', marginLeft: 4, fontWeight: '500' },
  cardActions: { flexDirection: 'row', justifyContent: 'space-around', alignItems: 'center', marginTop: 16, paddingTop: 12, borderTopWidth: 1, borderTopColor: '#F1F5F9' },
  actionBtn: { padding: 4, paddingHorizontal: 12 },
  
  emptyState: { flex: 1, alignItems: 'center', justifyContent: 'center', paddingBottom: 50 },
  emptyIconCircle: { width: 100, height: 100, borderRadius: 50, backgroundColor: '#FDF2EE', justifyContent: 'center', alignItems: 'center', marginBottom: 24 },
  emptyTitle: { fontSize: 24, fontWeight: 'bold', color: '#2A2624', marginBottom: 12 },
  emptySubtitle: { fontSize: 15, color: '#6B6562', textAlign: 'center', paddingHorizontal: 20, marginBottom: 32, lineHeight: 22 },
  emptyAddBtn: { backgroundColor: '#394B72', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 30, elevation: 4, shadowColor: '#394B72', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.3, shadowRadius: 8 },
  emptyAddBtnText: { color: 'white', fontWeight: 'bold', fontSize: 16 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'flex-end', alignItems: 'center' },
  modalCard: { backgroundColor: 'white', borderTopLeftRadius: 32, borderTopRightRadius: 32, padding: 24, width: '100%', maxWidth: 600, maxHeight: '90%', elevation: 10, shadowColor: '#000', shadowOffset: { width: 0, height: -5 }, shadowOpacity: 0.1, shadowRadius: 20 },
  closeModalBtn: { alignSelf: 'flex-end', padding: 8, backgroundColor: '#F5F5F5', borderRadius: 20, marginBottom: 16 },
  modalImage: { width: '100%', height: 300, borderRadius: 20, backgroundColor: '#F3F4F6', marginBottom: 20, resizeMode: 'cover' },
  modalHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 16 },
  modalStock: { fontSize: 15, fontWeight: 'bold', color: '#6B6562' },
  modalTitle: { fontSize: 24, fontWeight: '900', color: '#2A2624', marginBottom: 8 },
  modalPrice: { fontSize: 22, fontWeight: '800', color: '#394B72', marginBottom: 20 },
  modalMetaBox: { flexDirection: 'row', gap: 16, backgroundColor: '#FDFBF7', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0', marginBottom: 24 },
  modalMetaItem: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  modalMetaText: { fontSize: 14, fontWeight: '600', color: '#4B4542' },
  modalDescTitle: { fontSize: 16, fontWeight: 'bold', color: '#2A2624', marginBottom: 8 },
  modalDesc: { fontSize: 15, color: '#6B6562', lineHeight: 24, marginBottom: 32 },
  editBtn: { flexDirection: 'row', backgroundColor: '#394B72', paddingVertical: 16, borderRadius: 16, justifyContent: 'center', alignItems: 'center', elevation: 4 },
  editBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold', marginLeft: 8 }
});
