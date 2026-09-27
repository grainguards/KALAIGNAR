import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image, StyleSheet, Platform, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import { useNavigation } from '@react-navigation/native';
import { LinearGradient } from 'expo-linear-gradient';

const POSTS = [
  {
    id: '1',
    user: 'Lakshmi Weavers',
    location: 'Kanchipuram, TN',
    avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?q=80&w=100&auto=format&fit=crop',
    content: 'Just finished a beautiful batch of 50 pure silk sarees for the upcoming festival season. Looking for B2B buyers in North India!',
    likes: 24,
    comments: 5,
    time: '2 hours ago'
  },
  {
    id: '2',
    user: 'Raju Woodcrafts',
    location: 'Mysore, KA',
    avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=100&auto=format&fit=crop',
    content: 'Does anyone know a reliable supplier for premium teak wood near Mysore? The prices have gone up locally.',
    likes: 12,
    comments: 8,
    time: '5 hours ago'
  },
  {
    id: '3',
    user: 'Anita Clay Arts',
    location: 'Pune, MH',
    avatar: 'https://images.unsplash.com/photo-1531123897727-8f129e1bf98c?q=80&w=100&auto=format&fit=crop',
    content: 'I highly recommend applying for the PM Vishwakarma scheme! I just received my toolkit incentive and it was a very smooth process.',
    likes: 89,
    comments: 14,
    time: '1 day ago'
  }
];

export default function CommunityScreen() {
  const { t } = useTranslation();
  const navigation = useNavigation();
  const [activeTab, setActiveTab] = useState('MARKET'); // 'MARKET' or 'NETWORK'

  return (
    <View style={s.container}>
      {/* Header */}
      <View style={s.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={s.backBtn}>
          <Ionicons name="arrow-back" size={24} color="#2A2624" />
        </TouchableOpacity>
        <Text style={s.title}>{t('Network & Market')}</Text>
        <View style={{ width: 40 }} />
      </View>

      {/* Tabs */}
      <View style={s.tabContainer}>
        <TouchableOpacity 
          style={[s.tab, activeTab === 'MARKET' && s.activeTab]} 
          onPress={() => setActiveTab('MARKET')}
        >
          <Text style={[s.tabText, activeTab === 'MARKET' && s.activeTabText]}>{t('Market Intelligence')}</Text>
        </TouchableOpacity>
        <TouchableOpacity 
          style={[s.tab, activeTab === 'NETWORK' && s.activeTab]} 
          onPress={() => setActiveTab('NETWORK')}
        >
          <Text style={[s.tabText, activeTab === 'NETWORK' && s.activeTabText]}>{t('Artisan Community')}</Text>
        </TouchableOpacity>
      </View>

      <ScrollView contentContainerStyle={s.scrollContent} showsVerticalScrollIndicator={false}>
        
        {activeTab === 'MARKET' ? (
          <View style={s.section}>
            <Text style={s.subtitle}>{t('AI-driven insights for your local market.')}</Text>
            
            <View style={s.locationBanner}>
              <Ionicons name="location" size={20} color="#C36F50" />
              <Text style={s.locationText}>{t('Analyzing trends in:')} <Text style={{fontWeight: 'bold', color: '#2A2624'}}>Madurai, India</Text></Text>
            </View>

            <View style={s.insightCard}>
              <View style={s.insightHeader}>
                <Ionicons name="trending-up" size={24} color="#10B981" />
                <Text style={s.insightTitle}>{t('Trending Products')}</Text>
              </View>
              <Text style={s.insightDesc}>{t('Eco-friendly packaging and personalized handmade gifts are seeing a 40% increase in local search volume.')}</Text>
              <View style={s.tagRow}>
                <Text style={s.trendTag}>{t('Eco-Friendly')}</Text>
                <Text style={s.trendTag}>{t('Customized Gifts')}</Text>
                <Text style={s.trendTag}>{t('Festival Decor')}</Text>
              </View>
            </View>

            <View style={s.insightCard}>
              <View style={s.insightHeader}>
                <Ionicons name="people" size={24} color="#3B82F6" />
                <Text style={s.insightTitle}>{t('Target Customer Groups')}</Text>
              </View>
              <Text style={s.insightDesc}>{t('Based on your craft category, these groups have the highest purchase intent right now:')}</Text>
              <View style={s.listGroup}>
                <Text style={s.listItem}>• {t('Local Tourist Boutiques')}</Text>
                <Text style={s.listItem}>• {t('Heritage Hotels')}</Text>
                <Text style={s.listItem}>• {t('Wedding Planners')}</Text>
              </View>
            </View>

            <LinearGradient colors={['#FDF2EE', '#FFF1EB']} style={s.aiRecommendationCard}>
              <View style={s.aiIconWrapper}><Ionicons name="sparkles" size={20} color="#C36F50" /></View>
              <View style={{flex: 1}}>
                <Text style={s.aiRecTitle}>{t('AI Strategy Recommendation')}</Text>
                <Text style={s.aiRecText}>{t('Consider partnering with nearby hotels in Madurai to showcase your textile products in their lobbies.')}</Text>
              </View>
            </LinearGradient>

            <View style={[s.insightCard, { marginTop: 16 }]}>
              <View style={s.insightHeader}>
                <Ionicons name="business" size={24} color="#8B5CF6" />
                <Text style={s.insightTitle}>{t('Logistics & Godown Agencies')}</Text>
              </View>
              <Text style={s.insightDesc}>{t('For scaling up your wholesale production, consider these nearby affordable godown rentals and shipping agencies:')}</Text>
              <View style={s.listGroup}>
                <Text style={s.listItem}>• {t('Madurai Central Warehousing (₹15/sq.ft)')}</Text>
                <Text style={s.listItem}>• {t('TVS Supply Chain Solutions')}</Text>
                <Text style={s.listItem}>• {t('SafeExpress Artisan Subsidized Shipping')}</Text>
              </View>
            </View>
          </View>
        ) : (
          <View style={s.section}>
            <Text style={s.subtitle}>{t('Connect, learn, and collaborate with thousands of artisans.')}</Text>
            
            <View style={s.createPostBox}>
              <Image source={{ uri: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=100&auto=format&fit=crop' }} style={s.myAvatar} />
              <TextInput style={s.postInput} placeholder={t("Ask a question or share an update...")} />
              <TouchableOpacity style={s.postBtn}>
                <Ionicons name="send" size={16} color="white" />
              </TouchableOpacity>
            </View>

            {POSTS.map(post => (
              <View key={post.id} style={s.postCard}>
                <View style={s.postHeader}>
                  <Image source={{ uri: post.avatar }} style={s.postAvatar} />
                  <View style={s.postMeta}>
                    <Text style={s.postUser}>{post.user}</Text>
                    <Text style={s.postTime}>{t(post.location)} • {t(post.time)}</Text>
                  </View>
                  <Ionicons name="ellipsis-horizontal" size={20} color="#A09C9A" />
                </View>
                
                <Text style={s.postContent}>{t(post.content)}</Text>
                
                <View style={s.postActions}>
                  <TouchableOpacity style={s.actionBtn}>
                    <Ionicons name="heart-outline" size={20} color="#6B6562" />
                    <Text style={s.actionText}>{post.likes} {t('Likes')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.actionBtn}>
                    <Ionicons name="chatbubble-outline" size={20} color="#6B6562" />
                    <Text style={s.actionText}>{post.comments} {t('Comments')}</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={s.actionBtn}>
                    <Ionicons name="share-social-outline" size={20} color="#6B6562" />
                    <Text style={s.actionText}>{t('Share')}</Text>
                  </TouchableOpacity>
                </View>
              </View>
            ))}
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
  
  tabContainer: { flexDirection: 'row', paddingHorizontal: 20, paddingTop: 16, backgroundColor: 'white', borderBottomWidth: 1, borderBottomColor: '#F0F0F0' },
  tab: { flex: 1, paddingVertical: 12, alignItems: 'center', borderBottomWidth: 2, borderBottomColor: 'transparent' },
  activeTab: { borderBottomColor: '#C36F50' },
  tabText: { fontSize: 15, fontWeight: '600', color: '#A09C9A' },
  activeTabText: { color: '#C36F50' },
  
  scrollContent: { padding: 20, paddingBottom: 100, alignSelf: 'center', width: '100%', maxWidth: 800 },
  section: { flex: 1 },
  subtitle: { fontSize: 15, color: '#6B6562', marginBottom: 20, lineHeight: 22 },
  
  locationBanner: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#FFF5F0', padding: 12, borderRadius: 12, marginBottom: 24, borderWidth: 1, borderColor: '#FFE4D6' },
  locationText: { marginLeft: 8, fontSize: 14, color: '#C36F50' },
  
  insightCard: { backgroundColor: 'white', borderRadius: 16, padding: 20, marginBottom: 16, borderWidth: 1, borderColor: '#F0F0F0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05, shadowRadius: 8 },
  insightHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  insightTitle: { fontSize: 16, fontWeight: 'bold', color: '#2A2624', marginLeft: 8 },
  insightDesc: { fontSize: 14, color: '#4B4542', lineHeight: 22, marginBottom: 16 },
  
  tagRow: { flexDirection: 'row', flexWrap: 'wrap', gap: 8 },
  trendTag: { backgroundColor: '#ECFDF5', color: '#10B981', paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, fontSize: 12, fontWeight: '600', overflow: 'hidden' },
  
  listGroup: { backgroundColor: '#F9FAFB', padding: 16, borderRadius: 12 },
  listItem: { fontSize: 14, color: '#4B4542', fontWeight: '500', marginBottom: 8 },
  
  aiRecommendationCard: { flexDirection: 'row', padding: 16, borderRadius: 16, marginTop: 8 },
  aiIconWrapper: { width: 40, height: 40, borderRadius: 20, backgroundColor: 'white', justifyContent: 'center', alignItems: 'center', marginRight: 16 },
  aiRecTitle: { fontSize: 14, fontWeight: 'bold', color: '#92400E', marginBottom: 4 },
  aiRecText: { fontSize: 13, color: '#92400E', lineHeight: 20 },
  
  createPostBox: { flexDirection: 'row', alignItems: 'center', backgroundColor: 'white', padding: 16, borderRadius: 16, marginBottom: 24, borderWidth: 1, borderColor: '#F0F0F0', elevation: 2, shadowColor: '#000', shadowOffset: { width: 0, height: 2 }, shadowOpacity: 0.05 },
  myAvatar: { width: 40, height: 40, borderRadius: 20, marginRight: 12, backgroundColor: '#F3F4F6' },
  postInput: { flex: 1, fontSize: 15, color: '#2A2624' },
  postBtn: { backgroundColor: '#C36F50', width: 36, height: 36, borderRadius: 18, justifyContent: 'center', alignItems: 'center', marginLeft: 12 },
  
  postCard: { backgroundColor: 'white', borderRadius: 16, padding: 16, marginBottom: 16, borderWidth: 1, borderColor: '#F0F0F0' },
  postHeader: { flexDirection: 'row', alignItems: 'center', marginBottom: 12 },
  postAvatar: { width: 48, height: 48, borderRadius: 24, marginRight: 12, backgroundColor: '#F3F4F6' },
  postMeta: { flex: 1 },
  postUser: { fontSize: 15, fontWeight: 'bold', color: '#2A2624', marginBottom: 2 },
  postTime: { fontSize: 12, color: '#A09C9A' },
  postContent: { fontSize: 15, color: '#4B4542', lineHeight: 22, marginBottom: 16 },
  postActions: { flexDirection: 'row', justifyContent: 'space-between', borderTopWidth: 1, borderTopColor: '#F5F5F5', paddingTop: 16 },
  actionBtn: { flexDirection: 'row', alignItems: 'center' },
  actionText: { fontSize: 13, color: '#6B6562', marginLeft: 6, fontWeight: '500' }
});
