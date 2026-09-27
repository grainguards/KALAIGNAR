import { Platform } from 'react-native';

// On Android emulator, 10.0.2.2 maps to host machine's localhost
// On web/iOS, use localhost directly
const getBaseUrl = () => {
  if (Platform.OS === 'android') {
    return 'http://10.0.2.2:4000/api';
  }
  return 'http://localhost:4000/api';
};

export const API_URL = getBaseUrl();
