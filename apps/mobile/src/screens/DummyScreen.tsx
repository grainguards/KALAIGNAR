import React from 'react';
import { View, Text } from 'react-native';

export default function DummyScreen({ name }: { name: string }) {
  return (
    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', backgroundColor: '#FDFBF7' }}>
      <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#2A2624' }}>{name}</Text>
    </View>
  );
}
