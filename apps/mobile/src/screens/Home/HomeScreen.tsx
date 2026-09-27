import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, Image, Modal, TextInput, Linking, ActivityIndicator } from 'react-native';
import { useAuthStore } from '../../store/authStore';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/useTranslation';
import { useTheme } from '../../theme/useTheme';
import LanguageSelectorModal from '../../components/LanguageSelectorModal';
import ThemeSelectorModal from '../../components/ThemeSelectorModal';
import { useOrderStore } from '../../store/orderStore';
import VoiceReader from '../../components/VoiceReader';

import { useIsFocused } from '@react-navigation/native';
import VoiceAssistant from '../../components/VoiceAssistant';

export default function HomeScreen({ navigation }: any) {
  const isFocused = useIsFocused();

  const { user, role } = useAuthStore();
  const { t, lang } = useTranslation();
  const { colors, isDark, setThemeMode } = useTheme();
  const [showLangModal, setShowLangModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);
  const currentLangObj = SUPPORTED_LANGUAGES.find(l => l.code === lang) || SUPPORTED_LANGUAGES[0];
  const getTrendingAttributes = useOrderStore(state => state.getTrendingAttributes);
  const requirements = useOrderStore(state => state.requirements);
  
  const trendingAttributes = getTrendingAttributes();
  const topTrend = trendingAttributes.length > 0 ? trendingAttributes[0] : null;

  const pendingAllocations = requirements.flatMap(req => 
    req.allocations.filter(alloc => alloc.artisanId === 'me' && alloc.status === 'PENDING').map(alloc => ({ req, alloc }))
  );

  const windowWidth = Dimensions.get('window').width;
  const isDesktop = Platform.OS === 'web' && windowWidth > 768;

  const [editingProduct, setEditingProduct] = useState<any>(null);
  const [news, setNews] = useState<any[]>([]);
  const [loadingNews, setLoadingNews] = useState(true);

  useEffect(() => {
    fetch('https://newsapi.org/v2/everything?q="handicraft" OR "handloom" OR "MSME"&language=en&sortBy=publishedAt&apiKey=f217f8c7114847e991c6735ac95b2a6c')
      .then(res => res.json())
      .then(data => {
        if (data.articles) {
          // Filter out removed articles
          const validArticles = data.articles.filter((a: any) => a.title !== '[Removed]');
          setNews(validArticles.slice(0, 6));
        }
      })
      .catch(err => console.log('NewsAPI error:', err))
      .finally(() => setLoadingNews(false));
  }, []);

  const navItems = [
    { name: t('nav.dashboard'), route: 'Home' },
    { name: t('nav.products'), route: 'Products' },
    { name: t('nav.opportunities'), route: 'Opportunities' },
    { name: t('nav.messages'), route: 'Messages' },
    { name: t('nav.craftMap'), route: 'RawMaterials' }
  ];

  if (!isFocused) return null;

  return (
    <View style={[s.pageContainer, { backgroundColor: 'transparent' }]}>
      {isDesktop && (
        <View style={[s.navbar, { backgroundColor: 'transparent', borderBottomWidth: 0, elevation: 0, shadowOpacity: 0 }]}>
          <Text style={[s.logoText, { color: colors.primary }]}>Kalaignar</Text>
          <View style={s.navLinks}>
            {navItems.map(item => (
              <TouchableOpacity key={item.route} onPress={() => {
                if (item.route === 'Home' || item.route === 'Products') {
                  navigation.navigate('MainTabs', { screen: item.route });
                } else {
                  navigation.navigate(item.route);
                }
              }}>
                <Text style={[s.navLink, { color: colors.textSecondary }, item.route === 'Home' && s.activeNavLink]}>{item.name}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={s.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Header Row */}
        <View style={[s.headerArea, !isDesktop && s.headerAreaMobile]}>
          <View style={{ flex: 1 }}>
            <Text style={[s.pageTitle, { color: colors.text }]}>{t('nav.dashboard')}</Text>
            <Text style={[s.pageSubtitle, { color: colors.textSecondary }]}>
              {t('dashboard.welcome')}, {user?.name || t('roles.artisan')}! {t('dashboard.overview')}
            </Text>
          </View>

          {/* Quick Header Controls: Language Selector Pill + Theme Switcher */}
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10, marginTop: !isDesktop ? 12 : 0 }}>
            <TouchableOpacity
              style={{
                flexDirection: 'row',
                alignItems: 'center',
                gap: 6,
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
                paddingHorizontal: 12,
                paddingVertical: 7,
                borderRadius: 20,
              }}
              onPress={() => setShowLangModal(true)}
            >
              <Ionicons name="globe-outline" size={16} color={colors.primary} />
              <Text style={{ fontSize: 13, fontWeight: '700', color: colors.text }}>
                {currentLangObj.nativeName}
              </Text>
              <Ionicons name="chevron-down" size={13} color={colors.textSecondary} />
            </TouchableOpacity>

            <TouchableOpacity
              style={{
                width: 36,
                height: 36,
                borderRadius: 18,
                backgroundColor: colors.card,
                borderColor: colors.border,
                borderWidth: 1,
                alignItems: 'center',
                justifyContent: 'center',
              }}
              onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
            >
              <Ionicons name={isDark ? 'sunny' : 'moon'} size={18} color={isDark ? '#F59E0B' : colors.textSecondary} />
            </TouchableOpacity>

            {isDesktop && (
              <View style={{ flexDirection: 'row', gap: 12 }}>
                <TouchableOpacity 
                  style={[s.newProductBtn, { backgroundColor: '#10B981' }]} 
                  onPress={() => navigation.navigate('OrderDetail')}
                >
                  <Ionicons name="shield-checkmark" size={20} color="white" />
                  <Text style={s.newProductBtnText}>Test Escrow</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.newProductBtn} onPress={() => navigation.navigate('Add Product')}>
                  <Ionicons name="add" size={20} color="white" />
                  <Text style={s.newProductBtnText}>{t('nav.addProduct')}</Text>
                </TouchableOpacity>
              </View>
            )}
          </View>
        </View>

        {/* Feature 2 & 5: Bulk Allocation Notification */}
        {pendingAllocations.length > 0 && (
          <TouchableOpacity style={s.allocBanner} onPress={() => navigation.navigate('BulkAllocation')}>
            <View style={{flexDirection: 'row', alignItems: 'center', flex: 1}}>
              <View style={s.allocIcon}>
                <Ionicons name="cube" size={24} color="#0369A1" />
              </View>
              <View style={{marginLeft: 16}}>
                <Text style={s.allocTitle}>{t('dashboard.newBulkOrder')}</Text>
                <Text style={s.allocSub}>
                  {t('dashboard.bulkAllocAllocated', {
                    quantity: pendingAllocations[0].alloc.quantity,
                    productType: pendingAllocations[0].req.productType
                  })}
                </Text>
              </View>
            </View>
            <Ionicons name="chevron-forward" size={24} color="#0369A1" />
          </TouchableOpacity>
        )}

        {/* Stats Row */}
        {role === 'ARTISAN' && (
          <View style={s.statsRow}>
            <TouchableOpacity style={[s.statCard, { backgroundColor: '#F0F9FF' }, !isDesktop && s.statCardMobile]} onPress={() => navigation.navigate('BrandStudio')}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={s.statTitle}>{t('dashboard.totalViews')}</Text>
                <Ionicons name="eye-outline" size={20} color="#0284C7" />
              </View>
              <Text style={s.statValue}>1,248</Text>
              <Text style={[s.statTrend, { color: '#0369A1' }]}> {t('dashboard.thisWeek')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.statCard, { backgroundColor: '#FDF4FF' }, !isDesktop && s.statCardMobile]} onPress={() => navigation.navigate('Products')}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={s.statTitle}>{t('dashboard.activeListings')}</Text>
                <Ionicons name="layers-outline" size={20} color="#C026D3" />
              </View>
              <Text style={s.statValue}>14</Text>
              <Text style={[s.statTrend, { color: '#A21CAF' }]}>2 {t('dashboard.pendingReview')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.statCard, { backgroundColor: '#ECFDF5' }, !isDesktop && s.statCardMobile]} onPress={() => navigation.navigate('Messages')}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={s.statTitle}>{t('dashboard.inquiries')}</Text>
                <Ionicons name="chatbubbles-outline" size={20} color="#059669" />
              </View>
              <Text style={s.statValue}>8</Text>
              <Text style={[s.statTrend, { color: '#047857' }]}> 3 {t('dashboard.newToday')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.statCard, { backgroundColor: '#FFFBEB' }, !isDesktop && s.statCardMobile]} onPress={() => navigation.navigate('TrustScore')}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={s.statTitle}>{t('dashboard.rating')}</Text>
                <Ionicons name="star-outline" size={20} color="#D97706" />
              </View>
              <Text style={s.statValue}>4.8</Text>
              <Text style={[s.statTrend, { color: '#B45309' }]}>{t('dashboard.topSeller')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {role === 'BUYER' && (
          <View style={s.statsRow}>
            <TouchableOpacity style={[s.statCard, { backgroundColor: '#F0F9FF' }, !isDesktop && s.statCardMobile]}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={s.statTitle}>{t('dashboard.activeRfps')}</Text>
                <Ionicons name="document-text-outline" size={20} color="#0284C7" />
              </View>
              <Text style={s.statValue}>3</Text>
              <Text style={[s.statTrend, { color: '#0369A1' }]}>{t('dashboard.fulfilling')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.statCard, { backgroundColor: '#FDF4FF' }, !isDesktop && s.statCardMobile]}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={s.statTitle}>{t('dashboard.sourcedItems')}</Text>
                <Ionicons name="cube-outline" size={20} color="#C026D3" />
              </View>
              <Text style={s.statValue}>1,200</Text>
              <Text style={[s.statTrend, { color: '#A21CAF' }]}>{t('dashboard.thisQuarter')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.statCard, { backgroundColor: '#ECFDF5' }, !isDesktop && s.statCardMobile]}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={s.statTitle}>{t('dashboard.artisans')}</Text>
                <Ionicons name="people-outline" size={20} color="#059669" />
              </View>
              <Text style={s.statValue}>42</Text>
              <Text style={[s.statTrend, { color: '#047857' }]}>{t('dashboard.connected')}</Text>
            </TouchableOpacity>
            <TouchableOpacity style={[s.statCard, { backgroundColor: '#FFFBEB' }, !isDesktop && s.statCardMobile]}>
              <View style={{flexDirection: 'row', justifyContent: 'space-between'}}>
                <Text style={s.statTitle}>{t('dashboard.impactScore')}</Text>
                <Ionicons name="leaf-outline" size={20} color="#D97706" />
              </View>
              <Text style={s.statValue}>98</Text>
              <Text style={[s.statTrend, { color: '#B45309' }]}>{t('dashboard.esgCompliant')}</Text>
            </TouchableOpacity>
          </View>
        )}

        {/* Feature 1: Predictive Demand Engine */}
        {role === 'ARTISAN' && topTrend && (
          <View style={s.demandCard}>
            <View style={s.demandHeader}>
              <View style={s.demandTitleRow}>
                <Ionicons name="analytics" size={24} color="#394B72" />
                <Text style={s.demandTitle}>{t('dashboard.predictiveDemand')}</Text>
              </View>
              <VoiceReader text={`Based on recent sales, ${topTrend.attribute} is trending with a ${topTrend.score.toFixed(0)} percent increase. Consider making more items with this ${topTrend.type}.`} size={20} />
            </View>
            <View style={s.demandBody}>
              <View style={s.trendCircle}>
                <Ionicons name="flame" size={32} color="#D49A32" />
              </View>
              <View style={{ flex: 1, marginLeft: 16 }}>
                <Text style={s.demandItem}>"{t('dashboard.makeThisNext')}"</Text>
                <Text style={s.demandAttribute}>{topTrend.attribute}</Text>
                <Text style={s.demandSub}>
                  <Ionicons name="arrow-up" size={14} color="#16A34A" /> 
                  <Text style={{ color: '#16A34A', fontWeight: 'bold' }}> {topTrend.score.toFixed(0)}% </Text>
                  {t('dashboard.trailingIncrease')}
                </Text>
              </View>
              <TouchableOpacity style={s.demandBtn} onPress={() => navigation.navigate('Add Product')}>
                <Text style={s.demandBtnText}>{t('dashboard.startMaking')}</Text>
                <Ionicons name="arrow-forward" size={16} color="white" style={{ marginLeft: 4 }} />
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Live Market Trends Feed */}
        <View style={s.newsSection}>
          <View style={{flexDirection: 'row', alignItems: 'center', marginBottom: 12}}>
            <Ionicons name="trending-up" size={20} color="#15803D" style={{marginRight: 8}} />
            <Text style={s.boxTitle}>{t('dashboard.liveMarketTrends')}</Text>
            <View style={s.liveBadge}><Text style={s.liveBadgeText}>{t('dashboard.live')}</Text></View>
          </View>
          
          {loadingNews ? (
            <View style={s.newsLoading}><ActivityIndicator color="#394B72" /><Text style={s.newsLoadingText}>{t('dashboard.fetchingNews')}</Text></View>
          ) : (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.newsScroll}>
              {news.map((item, index) => (
                <TouchableOpacity 
                  key={index} 
                  style={s.newsCard} 
                  onPress={() => {
                    if (Platform.OS === 'web') window.open(item.url, '_blank');
                    else Linking.openURL(item.url);
                  }}
                >
                  {item.urlToImage && <Image source={{uri: item.urlToImage}} style={s.newsImg} />}
                  <View style={s.newsContent}>
                    <Text style={s.newsSource}>{item.source?.name}</Text>
                    <Text style={s.newsHeadline} numberOfLines={2}>{item.title}</Text>
                  </View>
                </TouchableOpacity>
              ))}
            </ScrollView>

          )}
        </View>

        {/* Bottom Columns */}
        <View style={[s.columnsRow, !isDesktop && s.columnsRowMobile]}>
          
          {/* Left Column - Catalog */}
          {role === 'ARTISAN' && (
          <View style={s.columnBox}>
            <View style={s.boxHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="cube-outline" size={18} color="#1E293B" style={{marginRight: 8}} />
                <Text style={s.boxTitle}>{t('dashboard.yourCatalog')}</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Products')}>
                <Text style={s.boxLink}>{t('common.viewAll')}</Text>
              </TouchableOpacity>
            </View>
            
            <View style={s.catalogItem}>
              <Image source={{uri: 'https://picsum.photos/seed/karigar11/400/400'}} style={s.catalogImg} />
              <View style={s.catalogInfo}>
                <Text style={s.catalogName}>Handwoven Ikat Silk Saree</Text>
                <Text style={s.catalogMeta}>₹4,500</Text>
              </View>
              <TouchableOpacity onPress={() => setEditingProduct({ name: 'Handwoven Ikat Silk Saree', price: '4500' })}>
                <Text style={s.editLink}>{t('common.edit')}</Text>
              </TouchableOpacity>
            </View>

            <View style={s.catalogItem}>
              <Image source={{uri: 'https://picsum.photos/seed/karigar12/400/400'}} style={s.catalogImg} />
              <View style={s.catalogInfo}>
                <Text style={s.catalogName}>Cotton Embroidered Kurti</Text>
                <Text style={s.catalogMeta}>₹2,200</Text>
              </View>
              <TouchableOpacity onPress={() => setEditingProduct({ name: 'Cotton Embroidered Kurti', price: '2200' })}>
                <Text style={s.editLink}>{t('common.edit')}</Text>
              </TouchableOpacity>
            </View>
          </View>

          )}
          {/* Right Column - Messages */}
          <View style={s.columnBox}>
            <View style={s.boxHeader}>
              <View style={{flexDirection: 'row', alignItems: 'center'}}>
                <Ionicons name="chatbubble-outline" size={18} color="#1E293B" style={{marginRight: 8}} />
                <Text style={s.boxTitle}>{t('nav.messages')}</Text>
              </View>
              <TouchableOpacity onPress={() => navigation.navigate('Messages')}>
                <Text style={s.boxLink}>{t('common.viewAll')}</Text>
              </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={s.messageItem}
              onPress={() => navigation.navigate('ChatDetail', {
                contactName: 'Fabindia Corp',
                contactRole: t('messages.buyers'),
                avatarBg: '#394B72',
                verified: true,
                isOnline: true
              })}
            >
              <View style={s.msgHeaderRow}>
                <Text style={s.msgSender}>Fabindia Corp</Text>
                <Text style={s.msgTime}>2h</Text>
              </View>
              <Text style={s.msgPreview}>We are looking to source 50 pieces of the blue Ikat...</Text>
            </TouchableOpacity>

            <TouchableOpacity 
              style={s.messageItem}
              onPress={() => navigation.navigate('ChatDetail', {
                contactName: 'Okhai Global Boutique',
                contactRole: t('messages.buyers'),
                avatarBg: '#0F766E',
                verified: true,
                isOnline: true
              })}
            >
              <View style={s.msgHeaderRow}>
                <Text style={s.msgSender}>Okhai Global Boutique</Text>
                <Text style={s.msgTime}>1d</Text>
              </View>
              <Text style={s.msgPreview}>Can you provide samples of the Madhubani tussar scarves by Friday?</Text>
            </TouchableOpacity>
          </View>

        </View>

        {/* Edit Product Modal */}
        <Modal visible={!!editingProduct} transparent={true} animationType="fade">
          <View style={s.modalOverlay}>
            <View style={s.modalContent}>
              <Text style={s.modalTitle}>{t('catalog.editProduct')}</Text>
              
              <Text style={s.inputLabel}>{t('catalog.productName')}</Text>
              <TextInput 
                style={s.inputField}
                value={editingProduct?.name}
                onChangeText={(text) => setEditingProduct({...editingProduct, name: text})}
              />

              <Text style={s.inputLabel}>{t('catalog.price')}</Text>
              <TextInput 
                style={s.inputField}
                value={editingProduct?.price}
                keyboardType="numeric"
                onChangeText={(text) => setEditingProduct({...editingProduct, price: text})}
              />

              <View style={s.modalActions}>
                <TouchableOpacity style={s.cancelBtn} onPress={() => setEditingProduct(null)}>
                  <Text style={s.cancelBtnText}>{t('common.cancel')}</Text>
                </TouchableOpacity>
                <TouchableOpacity style={s.saveBtn} onPress={() => setEditingProduct(null)}>
                  <Text style={s.saveBtnText}>{t('common.save')}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </Modal>

      </ScrollView>


      {/* Language Selector Modal */}
      <LanguageSelectorModal visible={showLangModal} onClose={() => setShowLangModal(false)} />

      {/* Theme Selector Modal */}
      <ThemeSelectorModal visible={showThemeModal} onClose={() => setShowThemeModal(false)} />
    </View>
  );
}

const s = StyleSheet.create({
  pageContainer: { flex: 1, backgroundColor: '#FDFBF7' },
  
  navbar: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', backgroundColor: '#FFFFFF', paddingHorizontal: 32, paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F0F0F0', elevation: 2, shadowColor: '#000', shadowOffset: {width:0, height: 2}, shadowOpacity: 0.05, shadowRadius: 8, zIndex: 10 },
  logoText: { fontSize: 24, fontWeight: '900', color: '#394B72', letterSpacing: 1 },
  navLinks: { flexDirection: 'row', alignItems: 'center', gap: 32 },
  navLink: { fontSize: 15, fontWeight: '600', color: '#6B6562' },
  activeNavLink: { color: '#2A2624', fontWeight: '800' },

  contentContainer: { padding: Platform.OS === 'web' ? 40 : 20, alignSelf: 'center', width: '100%', maxWidth: 1200, paddingBottom: 100 },
  headerArea: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-end', marginBottom: 32 },
  headerAreaMobile: { flexDirection: 'column', alignItems: 'flex-start', gap: 16 },
  pageTitle: { fontSize: 32, fontWeight: 'bold', color: '#2A2624', marginBottom: 6 },
  pageSubtitle: { fontSize: 16, color: '#6B6562' },
  newProductBtn: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#394B72', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, elevation: 2, shadowColor: '#394B72', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8 },
  newProductBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15, marginLeft: 8 },

  allocBanner: { backgroundColor: '#E0F2FE', borderWidth: 1, borderColor: '#BAE6FD', borderRadius: 16, padding: 16, marginBottom: 24, flexDirection: 'row', alignItems: 'center' },
  allocIcon: { width: 48, height: 48, borderRadius: 24, backgroundColor: '#BAE6FD', justifyContent: 'center', alignItems: 'center' },
  allocTitle: { fontSize: 16, fontWeight: 'bold', color: '#0369A1', marginBottom: 2 },
  allocSub: { fontSize: 14, color: '#0284C7' },

  statsRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 16, marginBottom: 32 },
  statCard: { flex: 1, minWidth: 200, padding: 24, borderRadius: 16, elevation: 0, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 4, borderWidth: 1, borderColor: 'rgba(0,0,0,0.02)' },
  statCardMobile: { minWidth: '45%' },
  statTitle: { fontSize: 14, color: '#6B6562', fontWeight: '600', marginBottom: 12 },
  statValue: { fontSize: 32, fontWeight: '800', color: '#2A2624' },
  statTrend: { fontSize: 13, fontWeight: '600', marginTop: 4 },

  demandCard: { backgroundColor: '#FFF7ED', borderWidth: 1, borderColor: '#FED7AA', borderRadius: 16, padding: 24, marginBottom: 32, elevation: 1 },
  demandHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 },
  demandTitleRow: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  demandTitle: { fontSize: 20, fontWeight: 'bold', color: '#394B72' },
  demandBody: { flexDirection: 'row', alignItems: 'center' },
  trendCircle: { width: 64, height: 64, borderRadius: 32, backgroundColor: '#F0EEE6', justifyContent: 'center', alignItems: 'center' },
  demandItem: { fontSize: 14, color: '#394B72', fontWeight: '600', textTransform: 'uppercase', letterSpacing: 1 },
  demandAttribute: { fontSize: 28, fontWeight: '900', color: '#2A2624', marginVertical: 4 },
  demandSub: { fontSize: 14, color: '#6B6562', flexDirection: 'row', alignItems: 'center' },
  demandBtn: { backgroundColor: '#394B72', paddingHorizontal: 20, paddingVertical: 12, borderRadius: 12, flexDirection: 'row', alignItems: 'center', shadowColor: '#394B72', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.3, shadowRadius: 8 },
  demandBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 },

  newsSection: { marginBottom: 24, width: '100%' },
  liveBadge: { backgroundColor: '#FEE2E2', paddingHorizontal: 6, paddingVertical: 2, borderRadius: 4, marginLeft: 8 },
  liveBadgeText: { color: '#D49A32', fontSize: 10, fontWeight: 'bold' },
  newsScroll: { paddingBottom: 8 },
  newsCard: { width: 280, backgroundColor: 'white', borderRadius: 12, marginRight: 16, overflow: 'hidden', borderWidth: 1, borderColor: '#F0F0F0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 4 },
  newsImg: { width: '100%', height: 120, backgroundColor: '#f0f0f0' },
  newsContent: { padding: 12 },
  newsSource: { fontSize: 11, color: '#394B72', fontWeight: 'bold', textTransform: 'uppercase', marginBottom: 4 },
  newsHeadline: { fontSize: 14, fontWeight: '700', color: '#2A2624', lineHeight: 20 },
  newsLoading: { height: 100, justifyContent: 'center', alignItems: 'center', flexDirection: 'row' },
  newsLoadingText: { marginLeft: 8, color: '#6B6562' },

  columnsRow: { flexDirection: 'row', gap: 24 },
  columnsRowMobile: { flexDirection: 'column' },
  columnBox: { flex: 1, backgroundColor: 'white', borderRadius: 12, borderWidth: 1, borderColor: '#F1F5F9', padding: 24, elevation: 2, shadowColor: '#000', shadowOffset: {width: 0, height: 1}, shadowOpacity: 0.05, shadowRadius: 4 },
  
  boxHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20, paddingBottom: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  boxTitle: { fontSize: 18, fontWeight: 'bold', color: '#0F172A' },
  boxLink: { fontSize: 14, fontWeight: '600', color: '#394B72' },

  catalogItem: { flexDirection: 'row', alignItems: 'center', paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  catalogImg: { width: 50, height: 50, borderRadius: 8, backgroundColor: '#E2E8F0' },
  catalogInfo: { flex: 1, marginLeft: 16 },
  catalogName: { fontSize: 15, fontWeight: 'bold', color: '#0F172A', marginBottom: 4 },
  catalogMeta: { fontSize: 13, color: '#64748B' },
  editLink: { fontSize: 14, color: '#94A3B8' },

  messageItem: { paddingVertical: 16, borderBottomWidth: 1, borderBottomColor: '#F1F5F9' },
  msgHeaderRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 6 },
  msgSender: { fontSize: 14, fontWeight: 'bold', color: '#cbd5e1' },
  msgTime: { fontSize: 12, color: '#94A3B8' },
  msgPreview: { fontSize: 14, color: '#64748B', lineHeight: 20 },

  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.5)', justifyContent: 'center', alignItems: 'center', padding: 16 },
  modalContent: { backgroundColor: 'white', padding: 24, borderRadius: 16, width: '100%', maxWidth: 400, elevation: 5 },
  modalTitle: { fontSize: 20, fontWeight: 'bold', marginBottom: 20, color: '#0F172A' },
  inputLabel: { fontSize: 14, fontWeight: '600', color: '#475569', marginBottom: 8 },
  inputField: { borderWidth: 1, borderColor: '#CBD5E1', borderRadius: 8, paddingHorizontal: 12, paddingVertical: 10, fontSize: 15, marginBottom: 16, color: '#0F172A' },
  modalActions: { flexDirection: 'row', justifyContent: 'flex-end', gap: 12, marginTop: 16 },
  cancelBtn: { paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  cancelBtnText: { color: '#64748B', fontWeight: 'bold', fontSize: 15 },
  saveBtn: { backgroundColor: '#394B72', paddingVertical: 10, paddingHorizontal: 16, borderRadius: 8 },
  saveBtnText: { color: 'white', fontWeight: 'bold', fontSize: 15 }
});






