import React, { useState, useEffect } from 'react';
import { View, Text, TextInput, TouchableOpacity, Modal, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useTranslation } from '../../i18n/useTranslation';
import { useTheme } from '../../theme/useTheme';

interface ProfitShieldModalProps {
  visible: boolean;
  onClose: () => void;
  daysSpent: number;
  hoursPerDay: number;
  currentPrice: number;
  rawMaterialCost?: number;
  onAcceptFloorPrice: (floorPrice: number) => void;
  onKeepPrice: () => void;
}

const REGIONAL_MINIMUM_WAGE_PER_DAY = 500; // Mock: ₹500/day
const STANDARD_WORK_HOURS_PER_DAY = 8;

export const useProfitShield = () => {
  const [daysSpent, setDaysSpent] = useState<string>('');
  const [hoursPerDay, setHoursPerDay] = useState<string>('');
  const [showWarning, setShowWarning] = useState(false);
  const [floorPrice, setFloorPrice] = useState(0);

  const calculateFloorPrice = (days: number, hours: number, rawMaterials: number = 0) => {
    // Calculate total effective days based on standard 8-hour work day
    const effectiveDays = (days * hours) / STANDARD_WORK_HOURS_PER_DAY;
    const laborCost = effectiveDays * REGIONAL_MINIMUM_WAGE_PER_DAY;
    return Math.round(laborCost + rawMaterials);
  };

  const checkPrice = (sellingPrice: number, rawMaterials: number = 0) => {
    const d = parseFloat(daysSpent) || 0;
    const h = parseFloat(hoursPerDay) || 0;
    
    if (d > 0 && h > 0) {
      const calculatedFloor = calculateFloorPrice(d, h, rawMaterials);
      setFloorPrice(calculatedFloor);
      
      if (sellingPrice < calculatedFloor) {
        setShowWarning(true);
        return false; // Trigger warning
      }
    }
    return true; // Price is fair
  };

  return {
    daysSpent, setDaysSpent,
    hoursPerDay, setHoursPerDay,
    showWarning, setShowWarning,
    floorPrice, checkPrice
  };
};

export default function ProfitShieldModal({
  visible,
  onClose,
  daysSpent,
  hoursPerDay,
  currentPrice,
  onAcceptFloorPrice,
  onKeepPrice,
}: ProfitShieldModalProps) {
  const { t } = useTranslation();
  const { colors } = useTheme();

  const floorPrice = Math.round(((daysSpent * hoursPerDay) / STANDARD_WORK_HOURS_PER_DAY) * REGIONAL_MINIMUM_WAGE_PER_DAY);

  return (
    <Modal visible={visible} transparent animationType="fade">
      <View style={styles.overlay}>
        <View style={[styles.modalCard, { backgroundColor: colors.card }]}>
          <View style={styles.header}>
            <Ionicons name="warning" size={32} color="#F59E0B" />
            <Text style={[styles.title, { color: colors.text }]}>{t('pricing.profitShieldTitle')}</Text>
          </View>
          
          <Text style={[styles.message, { color: colors.textSecondary }]}>
            {t('pricing.profitShieldMessage')
              .replace('{days}', daysSpent.toString())
              .replace('{hours}', hoursPerDay.toString())
              .replace('{floorPrice}', floorPrice.toString())
            }
          </Text>

          <View style={styles.actions}>
            <TouchableOpacity 
              style={[styles.primaryBtn, { backgroundColor: colors.primary }]}
              onPress={() => {
                onAcceptFloorPrice(floorPrice);
                onClose();
              }}
            >
              <Text style={styles.primaryBtnText}>
                {t('pricing.acceptFloorPrice').replace('{floorPrice}', floorPrice.toString())}
              </Text>
            </TouchableOpacity>
            
            <TouchableOpacity 
              style={[styles.secondaryBtn, { borderColor: colors.border }]}
              onPress={() => {
                onKeepPrice();
                onClose();
              }}
            >
              <Text style={[styles.secondaryBtnText, { color: colors.textSecondary }]}>
                {t('pricing.ignoreWarning')}
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalCard: {
    width: '100%',
    borderRadius: 16,
    padding: 24,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
  },
  title: {
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 12,
  },
  message: {
    fontSize: 16,
    lineHeight: 24,
    marginBottom: 24,
  },
  actions: {
    gap: 12,
  },
  primaryBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
  },
  primaryBtnText: {
    color: '#FFF',
    fontSize: 16,
    fontWeight: 'bold',
  },
  secondaryBtn: {
    padding: 16,
    borderRadius: 12,
    alignItems: 'center',
    borderWidth: 1,
  },
  secondaryBtnText: {
    fontSize: 16,
    fontWeight: '600',
  },
});
