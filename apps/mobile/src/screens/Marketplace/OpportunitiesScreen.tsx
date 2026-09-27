import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, ScrollView, TouchableOpacity, Dimensions, Platform, Modal, TextInput, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useAuthStore } from '../../store/authStore';
import { ROLE_CONFIG } from '../../config/roles';
import { useTranslation } from '../../i18n/useTranslation';
import { useTheme } from '../../theme/useTheme';

export default function OpportunitiesScreen({ navigation }: any) {
  const windowWidth = Dimensions.get('window').width;
  const isDesktop = Platform.OS === 'web' && windowWidth > 768;

  const { t } = useTranslation();
  const { colors, isDark } = useTheme();

  const [selectedOpp, setSelectedOpp] = useState<any>(null);
  const [bidAmount, setBidAmount] = useState('');
  const [bidDays, setBidDays] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submittedBids, setSubmittedBids] = useState<{[key: string]: boolean}>({});

  const { role } = useAuthStore();
  const config = ROLE_CONFIG[role] || ROLE_CONFIG.ARTISAN;
  const navItems = config.tabs.filter((t: any) => t.label !== '').map((t: any) => ({ name: t.label, route: t.name }));

  const mockOpportunities = [
    {
      id: 'opp_1',
      match: "31% MATCH",
      category: "POTTERY & CERAMICS",
      deadline: "BY 2026-10-15",
      title: "Need a pottery and ceramics plate in bulk",
      desc: "Seeking 200 units of authentic handmade terracotta or ceramic table planters with traditional Indian motifs for our annual festive corporate gift hampers. Eco-friendly packaging required.",
      features: ["Cross-Disciplinary Craft", "Premium Masterpiece Tier", "Limited Workshop Scale"],
      volume: "200 units",
      budget: "₹60,000"
    },
    {
      id: 'opp_2',
      match: "84% MATCH",
      category: "TEXTILES & WEAVING",
      deadline: "BY 2026-11-01",
      title: "Custom Silk Sarees for Boutique Chain",
      desc: "Looking for 50 pieces of authentic handwoven Ikat or Kanchipuram silk sarees in assorted colors. Must include GI certification tags for retail authentication.",
      features: ["GI Certified", "Retail Ready"],
      volume: "50 units",
      budget: "₹1,25,000"
    },
    {
      id: 'opp_3',
      match: "92% MATCH",
      category: "WOOD & BAMBOO",
      deadline: "BY 2026-10-25",
      title: "Bamboo Lamp Shades for Luxury Resort",
      desc: "Procurement of 120 woven bamboo pendant light shades for a new eco-resort property. Needs to be treated for durability and moisture resistance.",
      features: ["Eco-Friendly", "Large Scale", "Commercial Use"],
      volume: "120 units",
      budget: "₹1,80,000"
    },
    {
      id: 'opp_4',
      match: "65% MATCH",
      category: "METAL CRAFTS",
      deadline: "BY 2026-12-10",
      title: "Corporate Awards in Dhokra Art",
      desc: "Need 35 custom trophies crafted using traditional Dhokra (lost wax) casting. Each trophy should represent growth and include a small wooden base for engraving.",
      features: ["Custom Design", "Corporate Gifting", "Heritage Craft"],
      volume: "35 units",
      budget: "₹45,000"
    },
    {
      id: 'opp_5',
      match: "45% MATCH",
      category: "LEATHER & PAINTING",
      deadline: "BY 2026-11-20",
      title: "Hand-painted Vegan Leather Journals",
      desc: "Sourcing 500 notebooks featuring Madhubani or Warli painting styles on the cover. Pages must be handmade paper. High priority for sustainable materials.",
      features: ["Vegan Materials", "Bulk Order", "Export Quality"],
      volume: "500 units",
      budget: "₹2,50,000"
    },
    {
      id: 'opp_6',
      match: "78% MATCH",
      category: "JEWELRY",
      deadline: "BY 2026-10-30",
      title: "Oxidized Silver Ethnic Chokers",
      desc: "Seeking 100 sets of oxidized silver choker necklaces with matching earrings. Must be lightweight and suitable for daily wear. Tarnish-resistant coating preferred.",
      features: ["Trending Design", "Lightweight", "B2B Retail"],
      volume: "100 units",
      budget: "₹85,000"
    },
    {
      id: 'opp_7',
      match: "88% MATCH",
      category: "TEXTILES & WEAVING",
      deadline: "BY 2026-12-05",
      title: "Block-Printed Organic Cotton Totes",
      desc: "Required 1000 tote bags made from unbleached organic cotton with traditional Ajrakh or Kalamkari block prints for an international conference.",
      features: ["Organic Cotton", "High Volume", "Conference Swag"],
      volume: "1000 units",
      budget: "₹3,00,000"
    }
  ];

  const handleOpenBid = (opp: any) => {
    setSelectedOpp(opp);
    setBidAmount('');
    setBidDays('');
  };

  const handlePlaceBid = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setSubmittedBids(prev => ({ ...prev, [selectedOpp.id]: true }));
      setSelectedOpp(null);
    }, 1500);
  };

  // Bid Wars Logic
  const getNumericBudget = (budgetStr: string) => parseInt(budgetStr.replace(/[^0-9]/g, '')) || 0;
  
  const renderBidWarContent = () => {
    if (!selectedOpp) return null;
    
    const maxBudget = getNumericBudget(selectedOpp.budget);
    const competitor1 = Math.floor(maxBudget * 0.95);
    const competitor2 = Math.floor(maxBudget * 0.91);
    
    const userBidNum = parseInt(bidAmount) || 0;
    const isLowest = userBidNum > 0 && userBidNum < competitor2;
    const isTooHigh = userBidNum > maxBudget;
    
    return (
      <View style={s.modalContent}>
        <View style={s.modalHeader}>
          <Text style={s.modalTitle}>{t('opportunities.liveBidWar')}</Text>
          <TouchableOpacity onPress={() => setSelectedOpp(null)}>
            <Ionicons name="close" size={24} color="#6B6562" />
          </TouchableOpacity>
        </View>

        <View style={s.oppSummary}>
          <Text style={s.oppSummaryTitle}>{selectedOpp.title}</Text>
          <View style={s.oppSummaryRow}>
            <Text style={s.oppSummaryLabel}>{t('opportunities.buyerBudget')}</Text>
            <Text style={s.oppSummaryValue}>{selectedOpp.budget}</Text>
          </View>
        </View>

        <Text style={s.sectionHeader}>{t('opportunities.currentActiveBids')}</Text>
        <View style={s.competitorBids}>
          <View style={s.competitorRow}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="person-circle" size={20} color="#6B6562" style={{marginRight: 6}} />
              <Text style={s.competitorName}>{t('opportunities.artisanFromGujarat')}</Text>
            </View>
            <Text style={s.competitorPrice}>₹{competitor1.toLocaleString()}</Text>
          </View>
          <View style={s.competitorRow}>
            <View style={{flexDirection: 'row', alignItems: 'center'}}>
              <Ionicons name="person-circle" size={20} color="#C36F50" style={{marginRight: 6}} />
              <Text style={s.competitorName}>{t('opportunities.studioInRajasthan')}</Text>
            </View>
            <Text style={[s.competitorPrice, {color: '#C36F50', fontWeight: 'bold'}]}>₹{competitor2.toLocaleString()}</Text>
          </View>
        </View>

        <View style={s.bidInputSection}>
          <Text style={s.inputLabel}>{t('opportunities.yourBidAmount')}</Text>
          <TextInput 
            style={[s.inputField, isLowest ? s.inputSuccess : (isTooHigh ? s.inputError : null)]}
            placeholder={`${t('opportunities.beat')} ${competitor2.toLocaleString()}`}
            keyboardType="numeric"
            value={bidAmount}
            onChangeText={setBidAmount}
          />
          {userBidNum > 0 && (
            <View style={[s.statusPill, isLowest ? s.statusPillSuccess : (isTooHigh ? s.statusPillError : s.statusPillWarning)]}>
              <Ionicons 
                name={isLowest ? "trophy" : (isTooHigh ? "alert-circle" : "warning")} 
                size={16} 
                color={isLowest ? "#15803D" : (isTooHigh ? "#B91C1C" : "#B45309")} 
              />
              <Text style={[s.statusText, isLowest ? s.statusTextSuccess : (isTooHigh ? s.statusTextError : s.statusTextWarning)]}>
                {isLowest 
                  ? t('opportunities.winningBid') 
                  : (isTooHigh 
                    ? t('opportunities.bidExceeds') 
                    : t('opportunities.beingOutbid'))}
              </Text>
            </View>
          )}

          <Text style={[s.inputLabel, {marginTop: 16}]}>{t('opportunities.estimatedDeliveryDays')}</Text>
          <TextInput 
            style={s.inputField}
            placeholder="e.g., 14"
            keyboardType="numeric"
            value={bidDays}
            onChangeText={setBidDays}
          />
        </View>

        <TouchableOpacity 
          style={[s.submitBidBtn, (!bidAmount || !bidDays) && s.submitBidBtnDisabled]} 
          onPress={handlePlaceBid}
          disabled={!bidAmount || !bidDays || isSubmitting}
        >
          {isSubmitting ? <ActivityIndicator color="white" /> : <Text style={s.submitBidBtnText}>{t('opportunities.placeBidNow')}</Text>}
        </TouchableOpacity>
      </View>
    );
  };

  return (
    <View style={s.container}>
      {isDesktop && (
        <View style={s.sidebar}>
          <Text style={s.sidebarLogo}>Kala Setu</Text>
          <View style={s.navLinks}>
            {navItems.map(item => (
              <TouchableOpacity key={item.name} onPress={() => navigation.navigate(item.route)}>
                <Text style={[s.navLink, (item.route === 'Marketplace' || item.route === 'Opportunities') && s.activeNavLink]}>{t(item.name)}</Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      )}

      <ScrollView contentContainerStyle={s.contentContainer} showsVerticalScrollIndicator={false}>
        {/* Header */}
        <View style={s.headerArea}>
          <View style={s.headerTitleRow}>
            <TouchableOpacity onPress={() => navigation.goBack()} style={{ marginRight: 16, padding: 4 }}>
              <Ionicons name="arrow-back" size={28} color="#1E1B18" />
            </TouchableOpacity>
            <Ionicons name="layers" size={28} color="#1E1B18" style={{marginRight: 12}} />
            <Text style={s.pageTitle}>{t('opportunities.title')}</Text>
          </View>
          
          <View style={s.headerSubtitleRow}>
            <Text style={s.pageSubtitle}>{t('opportunities.subtitle')}</Text>
            <TouchableOpacity style={s.viewAllBtn}>
              <Text style={s.viewAllText}>{t('opportunities.viewAll')} <Ionicons name="arrow-forward" size={14} /></Text>
            </TouchableOpacity>
          </View>
        </View>

        {mockOpportunities.map((opp) => {
          const isSubmitted = submittedBids[opp.id];
          return (
            <View key={opp.id} style={s.opportunityCard}>
              <View style={s.cardTopRow}>
                <View style={s.tagsRow}>
                  <View style={s.matchBadge}><Text style={s.matchBadgeText}>{opp.match}</Text></View>
                  <Text style={s.categoryText}>{opp.category}</Text>
                </View>
                <View style={s.deadlineBadge}>
                  <Ionicons name="time-outline" size={14} color="#605952" style={{marginRight: 4}} />
                  <Text style={s.deadlineText}>{opp.deadline}</Text>
                </View>
              </View>

              <Text style={s.cardTitle}>{opp.title}</Text>
              
              <Text style={s.cardDesc}>{opp.desc}</Text>

              <View style={s.featuresRow}>
                {opp.features.map((f, i) => (
                  <View key={i} style={s.featureChip}>
                    <Ionicons name="checkmark-circle-outline" size={14} color="#332F2A" style={{marginRight: 6}} />
                    <Text style={s.featureChipText}>{f}</Text>
                  </View>
                ))}
              </View>

              <View style={s.cardBottomDivider} />

              <View style={s.cardBottomRow}>
                <View style={s.metricsArea}>
                  <View style={s.metricBox}>
                    <Text style={s.metricLabel}>{t('opportunities.volume')}</Text>
                    <Text style={s.metricValue}>{opp.volume}</Text>
                  </View>
                  <View style={s.verticalDivider} />
                  <View style={s.metricBox}>
                    <Text style={s.metricLabel}>{t('opportunities.budget')}</Text>
                    <Text style={s.metricValuePrice}>{opp.budget}</Text>
                  </View>
                </View>

                {isSubmitted ? (
                  <View style={s.submittedBtn}>
                    <Ionicons name="checkmark-circle" size={16} color="#15803D" style={{marginRight: 6}} />
                    <Text style={s.submittedBtnText}>{t('opportunities.bidSubmitted')}</Text>
                  </View>
                ) : (
                  <TouchableOpacity style={s.bidBtn} onPress={() => handleOpenBid(opp)}>
                    <Text style={s.bidBtnText}>{t('opportunities.reviewAndBid')} <Ionicons name="arrow-forward" size={16} color="white" /></Text>
                  </TouchableOpacity>
                )}
              </View>
            </View>
          );
        })}

      </ScrollView>

      {/* Modern Live Bid War Modal */}
      <Modal visible={!!selectedOpp} transparent={true} animationType="slide">
        <View style={s.modalOverlay}>
          {renderBidWarContent()}
        </View>
      </Modal>
    </View>
  );
}

const s = StyleSheet.create({
  container: { flex: 1, backgroundColor: '#FDFBF7', flexDirection: 'row' },
  sidebar: { width: 260, backgroundColor: 'white', padding: 24, borderRightWidth: 1, borderRightColor: '#F0EBE1', display: 'flex' },
  sidebarLogo: { fontSize: 28, fontWeight: '900', color: '#1E1B18', marginBottom: 48, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  navLinks: { gap: 20 },
  navLink: { fontSize: 16, fontWeight: '600', color: '#605952' },
  activeNavLink: { color: '#C36F50', fontWeight: 'bold' },
  contentContainer: { padding: Platform.OS === 'web' ? 40 : 20, alignSelf: 'center', width: '100%', maxWidth: 1000, paddingBottom: 100 },
  
  headerArea: { marginBottom: 32 },
  headerTitleRow: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  pageTitle: { fontSize: 32, fontWeight: '700', color: '#1E1B18', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  headerSubtitleRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 16 },
  pageSubtitle: { fontSize: 16, color: '#605952', maxWidth: 600, lineHeight: 24 },
  viewAllBtn: { flexDirection: 'row', alignItems: 'center' },
  viewAllText: { fontSize: 14, fontWeight: 'bold', color: '#C36F50', letterSpacing: 1 },

  opportunityCard: { backgroundColor: 'white', borderRadius: 24, padding: 32, marginBottom: 24, borderWidth: 1, borderColor: '#F0EBE1', shadowColor: '#000', shadowOffset: {width: 0, height: 4}, shadowOpacity: 0.03, shadowRadius: 12, elevation: 2 },
  cardTopRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24, flexWrap: 'wrap', gap: 12 },
  tagsRow: { flexDirection: 'row', alignItems: 'center', flexWrap: 'wrap', gap: 12 },
  matchBadge: { backgroundColor: '#F3F4F6', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  matchBadgeText: { fontSize: 12, fontWeight: '800', color: '#374151', letterSpacing: 1 },
  categoryText: { fontSize: 13, fontWeight: '700', color: '#605952', letterSpacing: 1 },
  deadlineBadge: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FDF2EE', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 100 },
  deadlineText: { fontSize: 12, fontWeight: '800', color: '#C36F50', letterSpacing: 1 },

  cardTitle: { fontSize: 26, fontWeight: 'bold', color: '#1E1B18', marginBottom: 16, fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  cardDesc: { fontSize: 16, color: '#4B4642', lineHeight: 24, marginBottom: 24 },
  
  featuresRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 12, marginBottom: 32 },
  featureChip: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', borderWidth: 1, borderColor: '#E5E0D8', paddingHorizontal: 16, paddingVertical: 8, borderRadius: 100 },
  featureChipText: { fontSize: 13, fontWeight: '600', color: '#332F2A' },

  cardBottomDivider: { height: 1, backgroundColor: '#F0EBE1', marginBottom: 24 },
  cardBottomRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 },
  metricsArea: { flexDirection: 'row', alignItems: 'center' },
  metricBox: { marginRight: 24 },
  metricLabel: { fontSize: 11, fontWeight: '800', color: '#8C857E', letterSpacing: 1, marginBottom: 4 },
  metricValue: { fontSize: 18, fontWeight: 'bold', color: '#1E1B18' },
  metricValuePrice: { fontSize: 18, fontWeight: 'bold', color: '#92400E' },
  verticalDivider: { width: 1, height: 30, backgroundColor: '#E5E0D8', marginRight: 24 },
  
  bidBtn: { backgroundColor: '#000000', paddingHorizontal: 32, paddingVertical: 16, borderRadius: 100, flexDirection: 'row', alignItems: 'center' },
  bidBtnText: { color: 'white', fontSize: 14, fontWeight: 'bold', letterSpacing: 1, marginRight: 8 },

  submittedBtn: { backgroundColor: '#DCFCE7', paddingHorizontal: 24, paddingVertical: 16, borderRadius: 100, flexDirection: 'row', alignItems: 'center', borderWidth: 1, borderColor: '#BBF7D0' },
  submittedBtnText: { color: '#15803D', fontSize: 14, fontWeight: 'bold', letterSpacing: 1 },

  // Modal Styles
  modalOverlay: { flex: 1, backgroundColor: 'rgba(0,0,0,0.6)', justifyContent: 'center', alignItems: 'center', padding: 20 },
  modalContent: { backgroundColor: 'white', padding: 32, borderRadius: 24, width: '100%', maxWidth: 500, shadowColor: '#000', shadowOpacity: 0.2, shadowOffset: {width:0, height:10}, shadowRadius: 20, elevation: 10 },
  modalHeader: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 },
  modalTitle: { fontSize: 24, fontWeight: 'bold', color: '#1E1B18', fontFamily: Platform.OS === 'ios' ? 'Georgia' : 'serif' },
  
  oppSummary: { backgroundColor: '#FDFBF7', padding: 16, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#F0EBE1' },
  oppSummaryTitle: { fontSize: 16, fontWeight: 'bold', color: '#1E1B18', marginBottom: 8 },
  oppSummaryRow: { flexDirection: 'row', justifyContent: 'space-between' },
  oppSummaryLabel: { fontSize: 14, color: '#6B6562' },
  oppSummaryValue: { fontSize: 14, fontWeight: 'bold', color: '#C36F50' },

  sectionHeader: { fontSize: 14, fontWeight: 'bold', color: '#8C857E', letterSpacing: 1, marginBottom: 12, textTransform: 'uppercase' },
  competitorBids: { backgroundColor: '#F9FAFB', borderRadius: 12, padding: 16, marginBottom: 24, gap: 12, borderWidth: 1, borderColor: '#F3F4F6' },
  competitorRow: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  competitorName: { fontSize: 14, color: '#4B5563', fontWeight: '500' },
  competitorPrice: { fontSize: 14, fontWeight: '600', color: '#374151' },

  bidInputSection: { marginBottom: 32 },
  inputLabel: { fontSize: 14, fontWeight: 'bold', color: '#374151', marginBottom: 8 },
  inputField: { borderWidth: 1, borderColor: '#D1D5DB', borderRadius: 12, padding: 16, fontSize: 18, backgroundColor: '#F9FAFB', color: '#1E1B18' },
  inputSuccess: { borderColor: '#22C55E', backgroundColor: '#F0FDF4' },
  inputError: { borderColor: '#EF4444', backgroundColor: '#FEF2F2' },
  
  statusPill: { flexDirection: 'row', alignItems: 'center', marginTop: 12, padding: 12, borderRadius: 8, gap: 8 },
  statusPillSuccess: { backgroundColor: '#DCFCE7' },
  statusPillWarning: { backgroundColor: '#FEF3C7' },
  statusPillError: { backgroundColor: '#FEE2E2' },
  statusText: { fontSize: 14, fontWeight: '600' },
  statusTextSuccess: { color: '#15803D' },
  statusTextWarning: { color: '#B45309' },
  statusTextError: { color: '#B91C1C' },

  submitBidBtn: { backgroundColor: '#C36F50', paddingVertical: 18, borderRadius: 100, alignItems: 'center', elevation: 2 },
  submitBidBtnDisabled: { backgroundColor: '#E5E7EB', elevation: 0 },
  submitBidBtnText: { color: 'white', fontSize: 15, fontWeight: 'bold', letterSpacing: 1 }
});
