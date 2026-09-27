import React, { useState, useMemo } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
  StyleSheet,
  Platform,
  Dimensions
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useNavigation } from '@react-navigation/native';
import { useTranslation, SUPPORTED_LANGUAGES } from '../../i18n/useTranslation';
import { useTheme } from '../../theme/useTheme';
import { useAuthStore } from '../../store/authStore';
import LanguageSelectorModal from '../../components/LanguageSelectorModal';
import ThemeSelectorModal from '../../components/ThemeSelectorModal';

export interface ChatConversation {
  id: string;
  name: string;
  category: 'buyer' | 'supplier' | 'cluster';
  categoryLabelKey: string;
  verified: boolean;
  avatarColor: string;
  lastMessage: string;
  time: string;
  timestamp: number;
  unreadCount: number;
  isOnline: boolean;
  initialMessages: Array<{
    id: string;
    type: 'text' | 'image' | 'audio' | 'catalog' | 'document';
    text: string;
    sender: 'me' | 'them';
    time: string;
    price?: string;
    url?: string;
    size?: string;
  }>;
}

export default function ChatListScreen() {
  const navigation = useNavigation<any>();
  const { t, currentLanguage, supportedLanguages } = useTranslation();
  const { colors, isDark, setThemeMode } = useTheme();
  const { role } = useAuthStore();

  const [searchQuery, setSearchQuery] = useState('');
  const [activeFilter, setActiveFilter] = useState<'all' | 'buyers' | 'suppliers' | 'unread'>('all');
  const [showLangModal, setShowLangModal] = useState(false);
  const [showThemeModal, setShowThemeModal] = useState(false);

  const langList = supportedLanguages || SUPPORTED_LANGUAGES;
  const currentLangObj = langList.find(l => l.code === currentLanguage) || langList[0];

  // Rich mock conversations across diverse Indian artisan and B2B buyer stakeholders
  const conversations: ChatConversation[] = useMemo(() => [
    {
      id: 'fabindia',
      name: 'Fabindia Corp',
      category: 'buyer',
      categoryLabelKey: 'messages.buyers',
      verified: true,
      avatarColor: '#C36F50',
      lastMessage: 'We are looking to source 50 pieces of the blue Ikat silk saree.',
      time: '10:30 AM',
      timestamp: Date.now() - 1000 * 60 * 30, // 30 mins ago
      unreadCount: 2,
      isOnline: true,
      initialMessages: [
        {
          id: '1',
          type: 'text',
          text: 'Hello Ramesh! We reviewed your latest catalog. We are looking to source 50 pieces of the blue Ikat silk saree.',
          sender: 'them',
          time: '10:00 AM'
        },
        {
          id: '2',
          type: 'text',
          text: 'Do you have enough raw materials to fulfill this within 3 weeks?',
          sender: 'them',
          time: '10:02 AM'
        }
      ]
    },
    {
      id: 'okhai',
      name: 'Okhai Global Boutique',
      category: 'buyer',
      categoryLabelKey: 'messages.buyers',
      verified: true,
      avatarColor: '#0F766E',
      lastMessage: 'Can you provide samples of the Madhubani tussar scarves by Friday?',
      time: 'Yesterday',
      timestamp: Date.now() - 1000 * 60 * 60 * 26,
      unreadCount: 1,
      isOnline: true,
      initialMessages: [
        {
          id: '1',
          type: 'text',
          text: 'Namaste! We loved your Madhubani hand-painted shawls.',
          sender: 'them',
          time: 'Yesterday, 3:15 PM'
        },
        {
          id: '2',
          type: 'text',
          text: 'Can you provide samples of the Madhubani tussar scarves by Friday?',
          sender: 'them',
          time: 'Yesterday, 3:20 PM'
        }
      ]
    },
    {
      id: 'texmill',
      name: 'TexMill Organic Yarns',
      category: 'supplier',
      categoryLabelKey: 'messages.suppliers',
      verified: true,
      avatarColor: '#2563EB',
      lastMessage: 'Natural Indigo dye lot #42 is dispatched. Tracking ID shared.',
      time: 'Yesterday',
      timestamp: Date.now() - 1000 * 60 * 60 * 30,
      unreadCount: 0,
      isOnline: false,
      initialMessages: [
        {
          id: '1',
          type: 'text',
          text: 'Order confirmed for 10kg pure plant-based Indigo extract.',
          sender: 'them',
          time: 'Yesterday, 11:00 AM'
        },
        {
          id: '2',
          type: 'text',
          text: 'Natural Indigo dye lot #42 is dispatched. Tracking ID shared.',
          sender: 'them',
          time: 'Yesterday, 11:45 AM'
        }
      ]
    },
    {
      id: 'taj_procurement',
      name: 'Taj Hotels Heritage Procurement',
      category: 'buyer',
      categoryLabelKey: 'messages.buyers',
      verified: true,
      avatarColor: '#D97706',
      lastMessage: 'The 120 terracotta garden lanterns arrived in flawless condition!',
      time: '23 Sep',
      timestamp: Date.now() - 1000 * 60 * 60 * 72,
      unreadCount: 0,
      isOnline: true,
      initialMessages: [
        {
          id: '1',
          type: 'text',
          text: 'Good afternoon. Shipment inspection completed at Taj Palace Udaipur.',
          sender: 'them',
          time: '23 Sep, 2:10 PM'
        },
        {
          id: '2',
          type: 'text',
          text: 'The 120 terracotta garden lanterns arrived in flawless condition!',
          sender: 'them',
          time: '23 Sep, 2:15 PM'
        }
      ]
    },
    {
      id: 'priya_interior',
      name: 'Priya Sharma (Interior Studio)',
      category: 'buyer',
      categoryLabelKey: 'messages.buyers',
      verified: true,
      avatarColor: '#8B5CF6',
      lastMessage: 'Could you customize the border color to ruby red for the hotel suites?',
      time: '21 Sep',
      timestamp: Date.now() - 1000 * 60 * 60 * 120,
      unreadCount: 0,
      isOnline: false,
      initialMessages: [
        {
          id: '1',
          type: 'text',
          text: 'Hi! I saw your recent upload. Can you customize the border color?',
          sender: 'them',
          time: '21 Sep, 10:00 AM'
        },
        {
          id: '2',
          type: 'text',
          text: 'Could you customize the border color to ruby red for the hotel suites?',
          sender: 'them',
          time: '21 Sep, 10:05 AM'
        }
      ]
    },
    {
      id: 'cottage_emporium',
      name: 'Central Cottage Industries Emporium',
      category: 'buyer',
      categoryLabelKey: 'messages.buyers',
      verified: true,
      avatarColor: '#059669',
      lastMessage: 'New procurement tender uploaded for handcrafted brass Dhokra figurines.',
      time: '19 Sep',
      timestamp: Date.now() - 1000 * 60 * 60 * 168,
      unreadCount: 0,
      isOnline: false,
      initialMessages: [
        {
          id: '1',
          type: 'text',
          text: 'Greetings from the Central Cottage Industries Board.',
          sender: 'them',
          time: '19 Sep, 9:30 AM'
        },
        {
          id: '2',
          type: 'text',
          text: 'New procurement tender uploaded for handcrafted brass Dhokra figurines.',
          sender: 'them',
          time: '19 Sep, 9:35 AM'
        }
      ]
    },
    {
      id: 'ramesh_weaver',
      name: 'Ramesh Kumawat (Master Weaver)',
      category: 'supplier',
      categoryLabelKey: 'messages.suppliers',
      verified: true,
      avatarColor: '#EA580C',
      lastMessage: 'Fresh pure mulberry silk warp beams ready for shipment.',
      time: '18 Sep',
      timestamp: Date.now() - 1000 * 60 * 60 * 192,
      unreadCount: 0,
      isOnline: false,
      initialMessages: [
        {
          id: '1',
          type: 'text',
          text: 'Pranam brother, here is the update on the loom warping.',
          sender: 'them',
          time: '18 Sep, 4:00 PM'
        },
        {
          id: '2',
          type: 'text',
          text: 'Fresh pure mulberry silk warp beams ready for shipment.',
          sender: 'them',
          time: '18 Sep, 4:05 PM'
        }
      ]
    }
  ], []);

  // Filter & Search Logic
  const filteredConversations = useMemo(() => {
    return conversations.filter(chat => {
      // Tab filter
      if (activeFilter === 'buyers' && chat.category !== 'buyer') return false;
      if (activeFilter === 'suppliers' && chat.category !== 'supplier') return false;
      if (activeFilter === 'unread' && chat.unreadCount === 0) return false;

      // Query filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase();
        const matchesName = chat.name.toLowerCase().includes(q);
        const matchesMsg = chat.lastMessage.toLowerCase().includes(q);
        return matchesName || matchesMsg;
      }

      return true;
    });
  }, [conversations, activeFilter, searchQuery]);

  // Counts for tabs
  const totalUnread = useMemo(() => {
    return conversations.reduce((acc, c) => acc + (c.unreadCount > 0 ? 1 : 0), 0);
  }, [conversations]);

  const buyersCount = useMemo(() => {
    return conversations.filter(c => c.category === 'buyer').length;
  }, [conversations]);

  const suppliersCount = useMemo(() => {
    return conversations.filter(c => c.category === 'supplier').length;
  }, [conversations]);

  const openChat = (chat: ChatConversation) => {
    navigation.navigate('ChatDetail', {
      contactId: chat.id,
      contactName: chat.name,
      contactRole: t(chat.categoryLabelKey),
      avatarBg: chat.avatarColor,
      initialMessages: chat.initialMessages,
      isOnline: chat.isOnline,
      verified: chat.verified
    });
  };

  const renderChatItem = ({ item }: { item: ChatConversation }) => {
    const isUnread = item.unreadCount > 0;

    return (
      <TouchableOpacity
        style={[
          styles.chatRow,
          { backgroundColor: colors.surface, borderBottomColor: colors.border },
          isUnread && { backgroundColor: isDark ? '#1E293B' : '#FFFBF7' }
        ]}
        activeOpacity={0.7}
        onPress={() => openChat(item)}
      >
        {/* Avatar with Online Badge */}
        <View style={styles.avatarContainer}>
          <View style={[styles.avatar, { backgroundColor: item.avatarColor }]}>
            <Text style={styles.avatarInitial}>{item.name.charAt(0)}</Text>
          </View>
          {item.isOnline && (
            <View
              style={[
                styles.onlineBadge,
                { borderColor: colors.surface }
              ]}
            />
          )}
        </View>

        {/* Center Content: Sender & Last Message */}
        <View style={styles.chatInfo}>
          <View style={styles.chatTopRow}>
            <View style={styles.nameRow}>
              <Text
                style={[
                  styles.senderName,
                  { color: colors.text },
                  isUnread && styles.unreadName
                ]}
                numberOfLines={1}
              >
                {item.name}
              </Text>
              {item.verified && (
                <Ionicons
                  name="checkmark-circle"
                  size={15}
                  color="#10B981"
                  style={styles.verifiedIcon}
                />
              )}
            </View>
            <Text
              style={[
                styles.timeText,
                { color: isUnread ? colors.primary : colors.textMuted },
                isUnread && styles.unreadTimeText
              ]}
            >
              {item.time === 'Yesterday' ? t('messages.yesterday') : item.time}
            </Text>
          </View>

          <View style={styles.chatBottomRow}>
            <Text
              style={[
                styles.messagePreview,
                { color: isUnread ? colors.text : colors.textSecondary },
                isUnread && styles.unreadMessagePreview
              ]}
              numberOfLines={1}
            >
              {item.lastMessage}
            </Text>

            {isUnread && (
              <View style={[styles.unreadBadge, { backgroundColor: colors.primary }]}>
                <Text style={styles.unreadBadgeText}>{item.unreadCount}</Text>
              </View>
            )}
          </View>

          {/* Stakeholder Tag */}
          <View style={styles.tagRow}>
            <View
              style={[
                styles.categoryTag,
                {
                  backgroundColor:
                    item.category === 'buyer'
                      ? isDark ? '#064E3B' : '#ECFDF5'
                      : isDark ? '#1E3A8A' : '#EFF6FF',
                  borderColor:
                    item.category === 'buyer'
                      ? isDark ? '#059669' : '#A7F3D0'
                      : isDark ? '#3B82F6' : '#BFDBFE'
                }
              ]}
            >
              <Text
                style={[
                  styles.categoryTagText,
                  {
                    color:
                      item.category === 'buyer'
                        ? isDark ? '#34D399' : '#047857'
                        : isDark ? '#60A5FA' : '#1D4ED8'
                  }
                ]}
              >
                {item.category === 'buyer' ? t('messages.buyers') : t('messages.suppliers')}
              </Text>
            </View>
          </View>
        </View>
      </TouchableOpacity>
    );
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Header */}
      <View
        style={[
          styles.header,
          {
            backgroundColor: colors.surface,
            borderBottomColor: colors.border
          }
        ]}
      >
        <View style={styles.headerLeft}>
          <TouchableOpacity
            style={styles.backBtn}
            onPress={() => navigation.goBack()}
            accessibilityLabel="Go back"
          >
            <Ionicons name="arrow-back" size={24} color={colors.text} />
          </TouchableOpacity>
          <View>
            <Text style={[styles.headerTitle, { color: colors.text }]}>
              {t('messages.title')}
            </Text>
            <Text style={[styles.headerSubtitle, { color: colors.textSecondary }]}>
              {conversations.length} {t('messages.all').toLowerCase()}
            </Text>
          </View>
        </View>

        {/* Header Right Actions */}
        <View style={styles.headerActions}>
          {/* Language selector pill */}
          <TouchableOpacity
            style={[
              styles.headerPill,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
            onPress={() => setShowLangModal(true)}
          >
            <Ionicons name="globe-outline" size={15} color={colors.primary} />
            <Text style={[styles.headerPillText, { color: colors.text }]}>
              {currentLangObj.nativeName}
            </Text>
            <Ionicons name="chevron-down" size={12} color={colors.textSecondary} />
          </TouchableOpacity>

          {/* Theme switcher */}
          <TouchableOpacity
            style={[
              styles.iconBtn,
              { backgroundColor: colors.card, borderColor: colors.border }
            ]}
            onPress={() => setThemeMode(isDark ? 'light' : 'dark')}
          >
            <Ionicons
              name={isDark ? 'sunny' : 'moon'}
              size={18}
              color={isDark ? '#F59E0B' : colors.textSecondary}
            />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Bar */}
      <View style={[styles.searchSection, { backgroundColor: colors.surface }]}>
        <View
          style={[
            styles.searchBar,
            { backgroundColor: isDark ? '#1E293B' : '#F1F5F9', borderColor: colors.border }
          ]}
        >
          <Ionicons name="search" size={18} color={colors.textSecondary} style={{ marginRight: 8 }} />
          <TextInput
            style={[styles.searchInput, { color: colors.text }]}
            placeholder={t('messages.searchPlaceholder')}
            placeholderTextColor={colors.textMuted}
            value={searchQuery}
            onChangeText={setSearchQuery}
            clearButtonMode="while-editing"
          />
          {searchQuery.length > 0 && (
            <TouchableOpacity onPress={() => setSearchQuery('')}>
              <Ionicons name="close-circle" size={18} color={colors.textSecondary} />
            </TouchableOpacity>
          )}
        </View>
      </View>

      {/* Filter Tabs */}
      <View
        style={[
          styles.filtersContainer,
          { backgroundColor: colors.surface, borderBottomColor: colors.border }
        ]}
      >
        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === 'all' && [styles.filterTabActive, { backgroundColor: colors.primary }]
          ]}
          onPress={() => setActiveFilter('all')}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: activeFilter === 'all' ? 'white' : colors.textSecondary }
            ]}
          >
            {t('messages.all')}
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === 'buyers' && [styles.filterTabActive, { backgroundColor: colors.primary }]
          ]}
          onPress={() => setActiveFilter('buyers')}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: activeFilter === 'buyers' ? 'white' : colors.textSecondary }
            ]}
          >
            {t('messages.buyers')} ({buyersCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === 'suppliers' && [styles.filterTabActive, { backgroundColor: colors.primary }]
          ]}
          onPress={() => setActiveFilter('suppliers')}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: activeFilter === 'suppliers' ? 'white' : colors.textSecondary }
            ]}
          >
            {t('messages.suppliers')} ({suppliersCount})
          </Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[
            styles.filterTab,
            activeFilter === 'unread' && [styles.filterTabActive, { backgroundColor: colors.primary }]
          ]}
          onPress={() => setActiveFilter('unread')}
        >
          <Text
            style={[
              styles.filterTabText,
              { color: activeFilter === 'unread' ? 'white' : colors.textSecondary }
            ]}
          >
            {t('messages.unread')}
          </Text>
          {totalUnread > 0 && (
            <View
              style={[
                styles.tabCountBadge,
                { backgroundColor: activeFilter === 'unread' ? 'white' : colors.primary }
              ]}
            >
              <Text
                style={[
                  styles.tabCountBadgeText,
                  { color: activeFilter === 'unread' ? colors.primary : 'white' }
                ]}
              >
                {totalUnread}
              </Text>
            </View>
          )}
        </TouchableOpacity>
      </View>

      {/* Conversations List */}
      <FlatList
        data={filteredConversations}
        keyExtractor={item => item.id}
        renderItem={renderChatItem}
        style={{ flex: 1 }}
        contentContainerStyle={[
          styles.listContent,
          filteredConversations.length === 0 && styles.listEmptyContent
        ]}
        showsVerticalScrollIndicator={false}
        ListEmptyComponent={
          <View style={styles.emptyContainer}>
            <View style={[styles.emptyIconCircle, { backgroundColor: isDark ? '#1E293B' : '#F1F5F9' }]}>
              <Ionicons name="chatbubbles-outline" size={44} color={colors.textSecondary} />
            </View>
            <Text style={[styles.emptyTitle, { color: colors.text }]}>
              {searchQuery ? t('messages.noChatsFound') : t('messages.emptyState')}
            </Text>
            <Text style={[styles.emptySubtitle, { color: colors.textSecondary }]}>
              {t('empty.checkBackLater')}
            </Text>
          </View>
        }
      />

      {/* Floating New Chat Action Button */}
      <TouchableOpacity
        style={[styles.floatingActionBtn, { backgroundColor: colors.primary }]}
        activeOpacity={0.85}
        onPress={() => {
          // Open default top buyer or create new thread
          if (conversations.length > 0) {
            openChat(conversations[0]);
          }
        }}
        accessibilityLabel={t('messages.newChat')}
      >
        <Ionicons name="chatbubble-ellipses" size={24} color="white" />
      </TouchableOpacity>

      {/* Language Selector Modal */}
      <LanguageSelectorModal
        visible={showLangModal}
        onClose={() => setShowLangModal(false)}
      />

      {/* Theme Selector Modal */}
      <ThemeSelectorModal
        visible={showThemeModal}
        onClose={() => setShowThemeModal(false)}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingTop: Platform.OS === 'ios' ? 52 : 36,
    paddingBottom: 14,
    borderBottomWidth: 1
  },
  headerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12
  },
  backBtn: {
    padding: 6,
    borderRadius: 8
  },
  headerTitle: {
    fontSize: 20,
    fontWeight: '800',
    letterSpacing: -0.3
  },
  headerSubtitle: {
    fontSize: 12,
    marginTop: 2
  },
  headerActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8
  },
  headerPill: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 5,
    paddingHorizontal: 10,
    paddingVertical: 6,
    borderRadius: 18,
    borderWidth: 1
  },
  headerPillText: {
    fontSize: 12,
    fontWeight: '700'
  },
  iconBtn: {
    width: 34,
    height: 34,
    borderRadius: 17,
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1
  },
  searchSection: {
    paddingHorizontal: 16,
    paddingVertical: 10
  },
  searchBar: {
    flexDirection: 'row',
    alignItems: 'center',
    borderRadius: 12,
    borderWidth: 1,
    paddingHorizontal: 12,
    height: 42
  },
  searchInput: {
    flex: 1,
    fontSize: 14,
    paddingVertical: 0
  },
  filtersContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 16,
    paddingBottom: 12,
    gap: 8,
    borderBottomWidth: 1
  },
  filterTab: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    paddingHorizontal: 14,
    paddingVertical: 6,
    borderRadius: 20,
    backgroundColor: 'transparent'
  },
  filterTabActive: {
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2
  },
  filterTabText: {
    fontSize: 13,
    fontWeight: '600'
  },
  tabCountBadge: {
    paddingHorizontal: 6,
    paddingVertical: 2,
    borderRadius: 10,
    minWidth: 18,
    alignItems: 'center',
    justifyContent: 'center'
  },
  tabCountBadgeText: {
    fontSize: 10,
    fontWeight: 'bold'
  },
  listContent: {
    paddingBottom: 100
  },
  listEmptyContent: {
    flexGrow: 1,
    justifyContent: 'center'
  },
  chatRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingHorizontal: 16,
    paddingVertical: 14,
    borderBottomWidth: StyleSheet.hairlineWidth
  },
  avatarContainer: {
    position: 'relative',
    marginRight: 14
  },
  avatar: {
    width: 52,
    height: 52,
    borderRadius: 26,
    justifyContent: 'center',
    alignItems: 'center'
  },
  avatarInitial: {
    color: '#FFFFFF',
    fontSize: 20,
    fontWeight: 'bold'
  },
  onlineBadge: {
    position: 'absolute',
    bottom: 1,
    right: 1,
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: '#10B981',
    borderWidth: 2
  },
  chatInfo: {
    flex: 1
  },
  chatTopRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 4
  },
  nameRow: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
    marginRight: 8
  },
  senderName: {
    fontSize: 15,
    fontWeight: '600'
  },
  unreadName: {
    fontWeight: '800'
  },
  verifiedIcon: {
    marginLeft: 5
  },
  timeText: {
    fontSize: 12,
    fontWeight: '500'
  },
  unreadTimeText: {
    fontWeight: '700'
  },
  chatBottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6
  },
  messagePreview: {
    fontSize: 13,
    flex: 1,
    marginRight: 8,
    lineHeight: 18
  },
  unreadMessagePreview: {
    fontWeight: '600'
  },
  unreadBadge: {
    minWidth: 20,
    height: 20,
    borderRadius: 10,
    paddingHorizontal: 6,
    justifyContent: 'center',
    alignItems: 'center'
  },
  unreadBadgeText: {
    color: '#FFFFFF',
    fontSize: 11,
    fontWeight: 'bold'
  },
  tagRow: {
    flexDirection: 'row',
    alignItems: 'center'
  },
  categoryTag: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 6,
    borderWidth: 1
  },
  categoryTagText: {
    fontSize: 11,
    fontWeight: '600'
  },
  emptyContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    padding: 32,
    marginTop: 40
  },
  emptyIconCircle: {
    width: 80,
    height: 80,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 16
  },
  emptyTitle: {
    fontSize: 16,
    fontWeight: '700',
    marginBottom: 6,
    textAlign: 'center'
  },
  emptySubtitle: {
    fontSize: 13,
    textAlign: 'center'
  },
  floatingActionBtn: {
    position: 'absolute',
    bottom: 24,
    right: 20,
    width: 56,
    height: 56,
    borderRadius: 28,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 6,
    elevation: 6
  }
});
