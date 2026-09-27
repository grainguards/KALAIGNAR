import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, TextInput, StyleSheet, Platform, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

export default function BrandStudioScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('BRAND'); // 'BRAND', 'SOCIAL', 'EXPANSION', 'STRATEGY'
  
  // Brand State
  const [bizName, setBizName] = useState('');
  const [category, setCategory] = useState('');
  const [isGeneratingBrand, setIsGeneratingBrand] = useState(false);
  const [brandAssets, setBrandAssets] = useState<any>(null);

  // Social State
  const [productDesc, setProductDesc] = useState('');
  const [isGeneratingSocial, setIsGeneratingSocial] = useState(false);
  const [socialPost, setSocialPost] = useState<any>(null);

  // Strategy State
  const [location, setLocation] = useState('');
  const [isGeneratingStrategy, setIsGeneratingStrategy] = useState(false);
  const [strategyResult, setStrategyResult] = useState<any>(null);

  const handleGenerateBrand = () => {
    if (!bizName) return;
    setIsGeneratingBrand(true);
    setTimeout(() => {
      setBrandAssets({
        tagline: 'Crafting Heritage, Inspiring the World.',
        colors: ['#8B5CF6', '#FDF2EE', '#2A2624'],
        fonts: 'Playfair Display (Headers), Inter (Body)',
        icon: 'color-palette'
      });
      setIsGeneratingBrand(false);
    }, 1500);
  };

  const handleGenerateSocial = () => {
    if (!productDesc) return;
    setIsGeneratingSocial(true);
    setTimeout(() => {
      setSocialPost({
        caption: `✨ Bring authentic Indian heritage into your home with our newly crafted ${productDesc}. Handmade with love and precision by traditional artisans. Support local craftsmanship! 🇮🇳❤️\n\nDM to order directly. Worldwide shipping available! 📦`,
        hashtags: '#HandmadeWithLove #IndianArtisans #VocalForLocal #HeritageCrafts #SmallBusinessIndia',
        suggestedPrice: '₹1,500 - ₹2,500'
      });
      setIsGeneratingSocial(false);
    }, 1500);
  };

  const handleGenerateStrategy = () => {
    if (!location) return;
    setIsGeneratingStrategy(true);
    setTimeout(() => {
      const loc = location.charAt(0).toUpperCase() + location.slice(1);
      setStrategyResult({
        locationInsight: {
          demographics: `Targeting upper-middle-class millennials, expats, and conscious consumers residing in or visiting ${loc}.`,
          hotspots: `Set up retail partnerships or weekend pop-ups near premium cultural hubs, artisan cafes, and high-footfall heritage exhibitions in ${loc}.`,
          pricing: `Premium pricing strategy (₹2,500 - ₹8,000 range) works best here for certified authentic, sustainable goods. Avoid competing on cheap prices.`,
          logistics: `Establish a micro-fulfillment godown on the outskirts of ${loc} for cheaper rent while maintaining 1-2 day local delivery times.`
        },
        consumerTrend: {
          aesthetic: `Minimalist, earthy tones (terracotta, sage green, raw wood) are currently dominating the local home-decor and fashion markets.`,
          values: `78% of buyers in this region prefer 100% plastic-free packaging and strongly prefer brands that showcase the "Artisan's Story".`,
          marketing: `Short-form video (Instagram Reels) showing the 'behind-the-scenes' crafting process currently yields a 4x higher conversion rate than standard photos.`
        },
        newBusinessIdea: {
          title: `B2B Heritage Corporate Gifting Packages`,
          concept: `Instead of fighting for individual sales, pivot to creating premium, customizable craft hampers for corporate gifting (Diwali, New Year, Employee Onboarding) targeting tech companies and corporate offices in ${loc}.`,
          steps: [
            `Curate 3 distinct premium sample boxes (Bronze, Silver, Gold tiers).`,
            `Build a digital wholesale catalog highlighting the 'social impact' of buying your crafts.`,
            `Use LinkedIn to pitch directly to HR Managers and PR agencies in ${loc}.`
          ],
          roi: `High volume (50-500 units per order) ensuring stable cash flow and massive brand visibility.`
        }
      });
      setIsGeneratingStrategy(false);
    }, 2000);
  };

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#2A2624" />
        </TouchableOpacity>
        <Text style={s.title}>{t('Business Growth Hub')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={s.tabContainer}>
        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 16 }}>
          {['BRAND', 'SOCIAL', 'EXPANSION', 'STRATEGY'].map((tab) => (
            <TouchableOpacity 
              key={tab}
              style={[s.tab, activeTab === tab && s.activeTab]} 
              onPress={() => setActiveTab(tab)}
            >
              <Text style={[s.tabText, activeTab === tab && s.activeTabText]}>
                {t(tab === 'EXPANSION' ? 'Setup & Expansion' : tab === 'STRATEGY' ? 'Market Strategy' : tab === 'BRAND' ? 'Brand Studio' : 'Social Media')}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        
        {activeTab === 'BRAND' && (
          <View style={s.section}>
            <Text style={s.subtitle}>{t('AI will generate a professional brand identity for your business.')}</Text>
            
            <View style={s.inputGroup}>
              <Text style={s.label}>{t('Business Name')}</Text>
              <TextInput style={s.input} placeholder={t("e.g. Madurai Weavers")} value={bizName} onChangeText={setBizName} />
            </View>
            
            <View style={s.inputGroup}>
              <Text style={s.label}>{t('Craft Category')}</Text>
              <TextInput style={s.input} placeholder={t("e.g. Handloom Silk")} value={category} onChangeText={setCategory} />
            </View>

            <TouchableOpacity style={s.generateBtn} onPress={handleGenerateBrand} disabled={isGeneratingBrand || !bizName}>
              <LinearGradient colors={['#8B5CF6', '#6D28D9']} style={s.btnGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
                {isGeneratingBrand ? <ActivityIndicator color="white" /> : (
                  <>
                    <Ionicons name="color-wand" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={s.btnText}>{t('Generate Brand Assets')}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

              {brandAssets && (
                <View style={s.resultCard}>
                  <Text style={s.resultTitle}>{t('Your Brand Concept')}</Text>
                  <View style={s.logoPreviewBox}>
                    <View style={[s.logoIconWrap, { backgroundColor: brandAssets.colors[0] }]}>
                      <Ionicons name={brandAssets.icon as any} size={40} color="white" />
                    </View>
                    <TextInput 
                      style={s.logoName} 
                      value={bizName}
                      onChangeText={setBizName}
                    />
                    <TextInput 
                      style={[s.taglineText, { minWidth: 250, padding: 0 }]} 
                      value={brandAssets.tagline}
                      onChangeText={(val) => setBrandAssets({...brandAssets, tagline: val})}
                      multiline
                    />
                  </View>
  
                  <Text style={s.detailLabel}>{t('Brand Colors')}</Text>
                  <View style={s.colorRow}>
                    {brandAssets.colors.map((c: string, i: number) => (
                      <View key={i} style={s.colorBoxWrap}>
                        <View style={[s.colorBox, { backgroundColor: c }]} />
                        <TextInput 
                          style={[s.colorCode, { padding: 0 }]} 
                          value={c}
                          onChangeText={(val) => {
                            const newColors = [...brandAssets.colors];
                            newColors[i] = val;
                            setBrandAssets({...brandAssets, colors: newColors});
                          }}
                        />
                      </View>
                    ))}
                  </View>
                  
                  <Text style={s.detailLabel}>{t('Typography')}</Text>
                  <TextInput 
                    style={[s.detailText, { padding: 0 }]} 
                    value={brandAssets.fonts}
                    onChangeText={(val) => setBrandAssets({...brandAssets, fonts: val})}
                  />
                  
                  <TouchableOpacity style={[s.generateBtn, { backgroundColor: '#C36F50', marginTop: 16 }]} onPress={() => alert('Brand Saved!')}>
                    <Text style={s.generateBtnText}>{t('common.save')}</Text>
                  </TouchableOpacity>
                </View>
              )}
          </View>
        )}

        {activeTab === 'SOCIAL' && (
          <View style={s.section}>
            <Text style={s.subtitle}>{t('Generate perfect Instagram/Facebook captions, hashtags, and pricing strategies.')}</Text>

            {/* Feature 3 Link */}
            <TouchableOpacity 
              style={[s.generateBtn, { backgroundColor: '#8B5CF6', marginBottom: 24 }]} 
              onPress={() => (navigation as any).navigate('VideoMaker')}
            >
              <LinearGradient colors={['#A78BFA', '#8B5CF6']} style={s.gradientBtn}>
                <Ionicons name="videocam" size={24} color="white" style={{ marginRight: 8 }} />
                <Text style={s.generateBtnText}>{t('brandStudio.createReel')}</Text>
              </LinearGradient>
            </TouchableOpacity>

            <View style={s.inputGroup}>
              <Text style={s.label}>{t('Describe your product (or select from catalog)')}</Text>
              <TextInput 
                style={[s.input, { height: 100 }]} 
                placeholder={t('e.g. A hand-painted blue pottery vase with floral designs...')}
                value={productDesc}
                onChangeText={setProductDesc}
                multiline
                textAlignVertical="top"
              />
            </View>

            <TouchableOpacity style={s.generateBtn} onPress={handleGenerateSocial} disabled={isGeneratingSocial || !productDesc}>
              <LinearGradient colors={['#EC4899', '#BE185D']} style={s.btnGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
                {isGeneratingSocial ? <ActivityIndicator color="white" /> : (
                  <>
                    <Ionicons name="logo-instagram" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={s.btnText}>{t('Write Viral Post')}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

              {socialPost && (
                <View style={s.resultCard}>
                  <Text style={s.resultTitle}>{t('Ready to Post')}</Text>
                  
                  <Text style={s.detailLabel}>{t('Caption')}</Text>
                  <View style={s.copyBox}>
                    <TextInput 
                      style={[s.captionText, { padding: 0 }]} 
                      value={socialPost.caption}
                      onChangeText={(val) => setSocialPost({...socialPost, caption: val})}
                      multiline
                    />
                  </View>
  
                  <Text style={s.detailLabel}>{t('Hashtags')}</Text>
                  <TextInput 
                    style={[s.hashtagText, { padding: 0 }]} 
                    value={socialPost.hashtags}
                    onChangeText={(val) => setSocialPost({...socialPost, hashtags: val})}
                    multiline
                  />
                  
                  <Text style={[s.detailLabel, { marginTop: 16 }]}>{t('Suggested Price Range')}</Text>
                  <TextInput 
                    style={[s.priceHint, { padding: 0 }]} 
                    value={socialPost.suggestedPrice}
                    onChangeText={(val) => setSocialPost({...socialPost, suggestedPrice: val})}
                  />

                  <TouchableOpacity style={[s.generateBtn, { backgroundColor: '#C36F50', marginTop: 16, paddingVertical: 16, alignItems: 'center' }]} onPress={() => alert('Post Saved to drafts!')}>
                    <Text style={s.generateBtnText}>{t('catalog.saveProduct')}</Text>
                  </TouchableOpacity>
                </View>
              )}
          </View>
        )}

        {activeTab === 'EXPANSION' && (
          <View style={s.section}>
            <Text style={s.subtitle}>{t('Actionable guides to establish your godown, agencies, and online presence.')}</Text>

            <View style={s.guideCard}>
              <View style={s.guideHeader}>
                <View style={[s.iconBg, { backgroundColor: '#DBEAFE' }]}>
                  <Ionicons name="globe" size={22} color="#2563EB" />
                </View>
                <Text style={s.guideTitle}>{t('Go Global: Social Media Setup')}</Text>
              </View>
              <Text style={s.guideText}>• <Text style={{fontWeight:'bold'}}>Instagram & FB:</Text> Switch to a "Professional Account" to access analytics and run ads. Link your catalog in the bio.</Text>
              <Text style={s.guideText}>• <Text style={{fontWeight:'bold'}}>Twitter (X):</Text> Engage with international B2B buyers and craft enthusiasts using trending hashtags.</Text>
              <Text style={s.guideText}>• <Text style={{fontWeight:'bold'}}>WhatsApp Business:</Text> Set up auto-replies and product catalogs for direct customer orders.</Text>
              <TouchableOpacity style={s.actionLink}><Text style={s.actionLinkText}>{t('Download Full PDF Guide')}</Text></TouchableOpacity>
            </View>

            <View style={s.guideCard}>
              <View style={s.guideHeader}>
                <View style={[s.iconBg, { backgroundColor: '#FEF3C7' }]}>
                  <Ionicons name="business" size={22} color="#D97706" />
                </View>
                <Text style={s.guideTitle}>{t('Godown & Agency Setup')}</Text>
              </View>
              <Text style={s.guideText}>{t('Scaling your production? Here is how to set up your Godown and Distribution Agencies:')}</Text>
              <View style={s.checklist}>
                <Text style={s.guideText}>✅ <Text style={{fontWeight:'500'}}>Space Sourcing:</Text> Rent spaces slightly outside city limits for cheaper warehousing, but near transport hubs.</Text>
                <Text style={s.guideText}>✅ <Text style={{fontWeight:'500'}}>Inventory Management:</Text> Use shelving categorized by SKU and adopt First-In-First-Out (FIFO).</Text>
                <Text style={s.guideText}>✅ <Text style={{fontWeight:'500'}}>Agencies:</Text> Partner with verified B2B distributors from the "Buyer Market" tab.</Text>
              </View>
            </View>
          </View>
        )}

        {activeTab === 'STRATEGY' && (
          <View style={s.section}>
            <Text style={s.subtitle}>{t('AI-driven location strategies and innovative business ideas based on current trends.')}</Text>

            <View style={s.inputGroup}>
              <Text style={s.label}>{t('Target City / Region')}</Text>
              <TextInput 
                style={s.input} 
                placeholder={t("e.g. Mumbai, New York, London")}
                value={location}
                onChangeText={setLocation}
              />
            </View>

            <TouchableOpacity style={s.generateBtn} onPress={handleGenerateStrategy} disabled={isGeneratingStrategy || !location}>
              <LinearGradient colors={['#10B981', '#059669']} style={s.btnGradient} start={{x: 0, y: 0}} end={{x: 1, y: 1}}>
                {isGeneratingStrategy ? <ActivityIndicator color="white" /> : (
                  <>
                    <Ionicons name="bar-chart" size={20} color="white" style={{ marginRight: 8 }} />
                    <Text style={s.btnText}>{t('Generate Detailed Market Strategy')}</Text>
                  </>
                )}
              </LinearGradient>
            </TouchableOpacity>

            {strategyResult && (
              <View style={s.resultCard}>
                <Text style={s.resultTitle}>{t('Comprehensive Strategy Report')}</Text>
                
                {/* Location Strategy */}
                <Text style={s.detailLabel}>{t('Location Based Strategy')}</Text>
                <View style={[s.copyBox, { marginBottom: 24 }]}>
                  <Text style={s.bulletText}>• <Text style={s.boldText}>{t('Demographics:')}</Text> {strategyResult.locationInsight.demographics}</Text>
                  <Text style={s.bulletText}>• <Text style={s.boldText}>{t('Retail Hotspots:')}</Text> {strategyResult.locationInsight.hotspots}</Text>
                  <Text style={s.bulletText}>• <Text style={s.boldText}>{t('Pricing Approach:')}</Text> {strategyResult.locationInsight.pricing}</Text>
                  <Text style={s.bulletText}>• <Text style={s.boldText}>{t('Logistics & Godown:')}</Text> {strategyResult.locationInsight.logistics}</Text>
                </View>

                {/* Consumer Trends */}
                <Text style={s.detailLabel}>{t('Consumer Interests & Trends')}</Text>
                <View style={[s.trendBox, { marginBottom: 24, flexDirection: 'column', gap: 12 }]}>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <Ionicons name="color-palette" size={18} color="#EF4444" style={{marginRight: 8, marginTop: 2}} />
                    <Text style={[s.detailText, {flex: 1, marginBottom: 0}]}><Text style={s.boldText}>{t('Aesthetics:')}</Text> {strategyResult.consumerTrend.aesthetic}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <Ionicons name="leaf" size={18} color="#10B981" style={{marginRight: 8, marginTop: 2}} />
                    <Text style={[s.detailText, {flex: 1, marginBottom: 0}]}><Text style={s.boldText}>{t('Values:')}</Text> {strategyResult.consumerTrend.values}</Text>
                  </View>
                  <View style={{ flexDirection: 'row', alignItems: 'flex-start' }}>
                    <Ionicons name="phone-portrait" size={18} color="#3B82F6" style={{marginRight: 8, marginTop: 2}} />
                    <Text style={[s.detailText, {flex: 1, marginBottom: 0}]}><Text style={s.boldText}>{t('Marketing:')}</Text> {strategyResult.consumerTrend.marketing}</Text>
                  </View>
                </View>

                {/* Business Idea */}
                <Text style={[s.detailLabel]}>{t('Innovative Expansion Idea')}</Text>
                <View style={[s.copyBox, {backgroundColor: '#ECFDF5', borderColor: '#A7F3D0'}]}>
                  <Text style={[s.guideTitle, { color: '#065F46', marginLeft: 0, marginBottom: 8 }]}>{strategyResult.newBusinessIdea.title}</Text>
                  <Text style={[s.captionText, {color: '#065F46', marginBottom: 12}]}>{strategyResult.newBusinessIdea.concept}</Text>
                  
                  <Text style={[s.boldText, { color: '#065F46', marginBottom: 4 }]}>{t('Execution Plan:')}</Text>
                  {strategyResult.newBusinessIdea.steps.map((step: string, index: number) => (
                    <Text key={index} style={[s.captionText, {color: '#065F46', marginLeft: 8}]}>{index + 1}. {step}</Text>
                  ))}
                  
                  <View style={{ flexDirection: 'row', alignItems: 'center', marginTop: 12, backgroundColor: '#D1FAE5', padding: 8, borderRadius: 8 }}>
                    <Ionicons name="cash" size={18} color="#059669" style={{marginRight: 6}} />
                    <Text style={[s.captionText, {color: '#059669', fontWeight: 'bold'}]}>{t('Projected ROI:')} {strategyResult.newBusinessIdea.roi}</Text>
                  </View>
                </View>
              </View>
            )}
          </View>
        )}

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7' },
  header: { flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between', paddingTop: Platform.OS === 'ios' ? 60 : 40, paddingHorizontal: 20, paddingBottom: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  backBtn: { width: 40, height: 40, borderRadius: 20, backgroundColor: '#F5F5F5', justifyContent: 'center', alignItems: 'center' },
  title: { fontSize: 20, fontWeight: 'bold', color: '#2A2624' },
  
  tabContainer: { backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F0F0F0', paddingHorizontal: 20 },
  tab: { paddingVertical: 16, paddingHorizontal: 4, borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#C36F50' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#A09C9A' },
  activeTabText: { color: '#C36F50' },
  
  scrollContent: { padding: 20, paddingBottom: 100, alignSelf: 'center', width: '100%', maxWidth: 800 },
  section: { flex: 1, paddingTop: 8 },
  subtitle: { fontSize: 15, color: '#6B6562', marginBottom: 24, lineHeight: 22 },
  
  inputGroup: { marginBottom: 20 },
  label: { fontSize: 14, fontWeight: '700', color: '#2A2624', marginBottom: 8 },
  input: { backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E7EB', borderRadius: 12, padding: 16, fontSize: 15, color: '#2A2624' },
  
  generateBtn: { marginBottom: 32, borderRadius: 16, overflow: 'hidden', elevation: 4, shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 8 },
  gradientBtn: { paddingVertical: 18, flexDirection: 'row', justifyContent: 'center', alignItems: 'center' },
  generateBtnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  btnGradient: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', paddingVertical: 16 },
  btnText: { color: 'white', fontSize: 16, fontWeight: 'bold' },
  
  resultCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, borderWidth: 1, borderColor: '#F0F0F0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  resultTitle: { fontSize: 18, fontWeight: '800', color: '#2A2624', marginBottom: 20, textAlign: 'center' },
  
  logoPreviewBox: { alignItems: 'center', backgroundColor: '#F9FAFB', padding: 24, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#F0F0F0' },
  logoIconWrap: { width: 80, height: 80, borderRadius: 24, justifyContent: 'center', alignItems: 'center', marginBottom: 16, elevation: 4 },
  logoName: { fontSize: 24, fontWeight: '900', color: '#2A2624', letterSpacing: -0.5, marginBottom: 8, textAlign: 'center' },
  taglineText: { fontSize: 14, fontStyle: 'italic', color: '#6B6562', textAlign: 'center' },
  
  detailLabel: { fontSize: 12, fontWeight: '700', color: '#8B5CF6', textTransform: 'uppercase', marginBottom: 8 },
  detailText: { fontSize: 15, color: '#4B4542', fontWeight: '500', marginBottom: 20, lineHeight: 22 },
  
  colorRow: { flexDirection: 'row', gap: 16, marginBottom: 24 },
  colorBoxWrap: { alignItems: 'center' },
  colorBox: { width: 48, height: 48, borderRadius: 24, marginBottom: 8, borderWidth: 1, borderColor: '#E5E7EB', elevation: 2 },
  colorCode: { fontSize: 11, color: '#6B6562', fontWeight: '500' },
  
  copyBox: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#F0F0F0', marginBottom: 20 },
  captionText: { fontSize: 15, color: '#2A2624', lineHeight: 22 },
  hashtagText: { fontSize: 14, color: '#3B82F6', fontWeight: '500', lineHeight: 20 },
  priceHint: { fontSize: 18, fontWeight: 'bold', color: '#10B981' },

  guideCard: { backgroundColor: 'white', borderRadius: 16, padding: 24, marginBottom: 16, borderWidth: 1, borderColor: '#F0F0F0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  guideHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 16 },
  iconBg: { width: 40, height: 40, borderRadius: 20, justifyContent: 'center', alignItems: 'center' },
  guideTitle: { fontSize: 17, fontWeight: 'bold', color: '#2A2624', marginLeft: 12 },
  guideText: { fontSize: 15, color: '#4B4542', lineHeight: 24, marginBottom: 12 },
  checklist: { marginTop: 8, paddingLeft: 8 },
  actionLink: { marginTop: 8, alignSelf: 'flex-start' },
  actionLinkText: { color: '#C36F50', fontSize: 14, fontWeight: '700', textDecorationLine: 'underline' },

  trendBox: { flexDirection: 'row', alignItems: 'flex-start', backgroundColor: '#FEF2F2', padding: 16, borderRadius: 12, borderWidth: 1, borderColor: '#FECACA' },
  
  bulletText: { fontSize: 15, color: '#4B4542', lineHeight: 24, marginBottom: 8 },
  boldText: { fontWeight: 'bold', color: '#2A2624' }
});
