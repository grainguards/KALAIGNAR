import React from 'react';
import { View, Image, StyleSheet, Dimensions } from 'react-native';
import { useTheme } from '../theme/useTheme';

const { width, height } = Dimensions.get('window');

export default function AnimatedGlobalBackground() {
  const { isDark } = useTheme();

  return (
    <View style={[StyleSheet.absoluteFill, { backgroundColor: isDark ? '#0B0F19' : '#FAF8F1', overflow: 'hidden', pointerEvents: 'none' }]}>
      <Image 
        source={isDark ? require('../../assets/images/bg_dark.jpg') : require('../../assets/images/bg_light.jpg')}
        style={{
          width: '100%',
          height: '100%',
          position: 'absolute'
        }}
        resizeMode="cover"
      />
    </View>
  );
}
