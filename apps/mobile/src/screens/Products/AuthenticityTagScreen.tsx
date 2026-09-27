import React, { useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Share, Platform, Alert } from 'react-native';
import QRCode from 'react-native-qrcode-svg';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import { useTheme } from '../../theme/useTheme';
import { useAuthStore } from '../../store/authStore';
import * as FileSystem from 'expo-file-system';
import * as Sharing from 'expo-sharing';

interface AuthenticityTagScreenProps {
  productName: string;
  productId: string;
}

export default function AuthenticityTagScreen({ productName = "Handcrafted Clay Pot", productId = "KS-001" }: AuthenticityTagScreenProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();
  const { profileData } = useAuthStore();
  let qrRef = useRef<any>(null);

  // Construct the payload URL that consumers will scan
  const provenanceUrl = `https://kalasetu.in/verify?id=${productId}&artisan=${encodeURIComponent(profileData.name)}&village=${encodeURIComponent(profileData.location)}`;

  const handleDownloadQR = () => {
    if (qrRef.current) {
      qrRef.current.toDataURL(async (data: string) => {
        try {
          const path = FileSystem.cacheDirectory + `qr_${productId}.png`;
          await FileSystem.writeAsStringAsync(path, data, { encoding: FileSystem.EncodingType.Base64 });
          
          if (Platform.OS === 'web') {
            // Web download approach
            const link = document.createElement('a');
            link.href = `data:image/png;base64,${data}`;
            link.download = `kalasetu_qr_${productId}.png`;
            link.click();
            Alert.alert('Success', t('provenance.qrSaved'));
          } else {
            // Mobile share/save approach
            if (await Sharing.isAvailableAsync()) {
              await Sharing.shareAsync(path, { dialogTitle: 'Share Authenticity QR' });
            } else {
              Alert.alert('Error', 'Sharing not available on this device');
            }
          }
        } catch (err) {
          console.error("Error saving QR: ", err);
        }
      });
    }
  };

  return (
    <View style={[styles.container, { backgroundColor: colors.background }]}>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>{t('provenance.generateTag')}</Text>
        <Text style={[styles.subtitle, { color: colors.textSecondary }]}>{t('provenance.scanToVerify')}</Text>
      </View>

      <View style={[styles.card, { backgroundColor: colors.card, borderColor: colors.border }]}>
        <View style={styles.badges}>
          <View style={[styles.badge, { backgroundColor: '#10B98120' }]}>
            <Ionicons name="leaf" size={16} color="#10B981" />
            <Text style={[styles.badgeText, { color: '#10B981' }]}>{t('provenance.handloomMark')}</Text>
          </View>
          <View style={[styles.badge, { backgroundColor: '#F59E0B20' }]}>
            <Ionicons name="star" size={16} color="#F59E0B" />
            <Text style={[styles.badgeText, { color: '#F59E0B' }]}>{t('provenance.odop')}</Text>
          </View>
        </View>

        <View style={styles.qrContainer}>
          <QRCode
            value={provenanceUrl}
            size={200}
            color={colors.text}
            backgroundColor={colors.card}
            logo={{ uri: 'https://cdn-icons-png.flaticon.com/512/5968/5968269.png' }}
            logoSize={40}
            logoBackgroundColor='transparent'
            getRef={(c) => (qrRef.current = c)}
          />
        </View>

        <View style={styles.details}>
          <Text style={[styles.productName, { color: colors.text }]}>{productName}</Text>
          <Text style={[styles.artisanName, { color: colors.textSecondary }]}>
            {t('provenance.artisan').replace('{name}', profileData.name || 'Master Artisan')}
          </Text>
          <Text style={[styles.villageName, { color: colors.textSecondary }]}>
            {t('provenance.village').replace('{village}', profileData.location || 'Kanchipuram')}
          </Text>
        </View>
      </View>

      <TouchableOpacity 
        style={[styles.downloadBtn, { backgroundColor: colors.primary }]}
        onPress={handleDownloadQR}
      >
        <Ionicons name="download-outline" size={24} color="#FFF" />
        <Text style={styles.downloadBtnText}>{t('provenance.downloadQR')}</Text>
      </TouchableOpacity>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 24,
    alignItems: 'center',
  },
  header: {
    alignItems: 'center',
    marginBottom: 32,
    marginTop: 20,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    textAlign: 'center',
  },
  card: {
    width: '100%',
    padding: 24,
    borderRadius: 20,
    borderWidth: 1,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 12,
    elevation: 5,
  },
  badges: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 24,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 20,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontWeight: '600',
  },
  qrContainer: {
    padding: 16,
    backgroundColor: '#FFF',
    borderRadius: 16,
    marginBottom: 24,
  },
  details: {
    alignItems: 'center',
  },
  productName: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 8,
    textAlign: 'center',
  },
  artisanName: {
    fontSize: 16,
    marginBottom: 4,
  },
  villageName: {
    fontSize: 16,
  },
  downloadBtn: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 24,
    paddingVertical: 16,
    borderRadius: 14,
    marginTop: 32,
    gap: 8,
    width: '100%',
    justifyContent: 'center',
  },
  downloadBtnText: {
    color: '#FFF',
    fontSize: 18,
    fontWeight: 'bold',
  },
});
