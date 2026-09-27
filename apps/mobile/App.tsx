import { NavigationContainer, DefaultTheme } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { StatusBar } from 'expo-status-bar';
// import './global.css';

// We will create these screens soon
import OnboardingScreen from './src/screens/Auth/OnboardingScreen';
import LoginScreen from './src/screens/Auth/LoginScreen';
import OTPScreen from './src/screens/Auth/OTPScreen';
import RegistrationScreen from './src/screens/Auth/RegistrationScreen';
import MainTabs from './src/navigation/MainTabs';
import AssistantScreen from './src/screens/Home/AssistantScreen';
import GovSchemesScreen from './src/screens/Government/GovSchemesScreen';
import RawMaterialsScreen from './src/screens/Marketplace/RawMaterialsScreen';
import OpportunitiesScreen from './src/screens/Marketplace/OpportunitiesScreen';
import AddProductScreen from './src/screens/Products/AddProductScreen';
import BrandStudioScreen from './src/screens/Growth/BrandStudioScreen';
import CommunityScreen from './src/screens/Community/CommunityScreen';
import ChatListScreen from './src/screens/Messages/ChatListScreen';
import MessagesScreen from './src/screens/Messages/MessagesScreen';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { useAuthStore } from './src/store/authStore';
import VoiceAssistant from './src/components/VoiceAssistant';

const Stack = createNativeStackNavigator();

import { View, Platform, StyleSheet } from 'react-native';

import { TouchableOpacity, Text } from 'react-native';
import { useNavigation } from '@react-navigation/native';

import { useTranslation } from './src/i18n/useTranslation';

const RolePillOverlay = () => {
  const { role } = useAuthStore();
  const { t } = useTranslation();
  const nav = useNavigation<any>();
  const roleKeys: any = { ARTISAN: "roles.artisan", BUYER: "roles.buyer", GOVT: "roles.govt" };
  const colors: any = { ARTISAN: "#394B72", BUYER: "#0F766E", GOVT: "#1E293B" };
  return (
    <TouchableOpacity onPress={() => nav.navigate("MainTabs", { screen: "Profile" })} style={{position: "absolute", top: Platform.OS === "ios" ? 60 : 40, right: 20, backgroundColor: colors[role] || "#000", paddingHorizontal: 12, paddingVertical: 6, borderRadius: 20, zIndex: 9999, elevation: 9999, shadowColor: "#000", shadowOffset: {width: 0, height: 2}, shadowOpacity: 0.1}}>
      <Text style={{color: "white", fontSize: 12, fontWeight: "bold"}}>{t(roleKeys[role] || "roles.selectRole")}</Text>
    </TouchableOpacity>
  );
};

import { useTheme } from './src/theme/useTheme';
import AnimatedGlobalBackground from './src/components/AnimatedGlobalBackground';

export default function App() {
  const { token } = useAuthStore();
  const { colors, isDark } = useTheme();

  return (
    <SafeAreaProvider style={{ flex: 1, backgroundColor: colors.background }}>
      <AnimatedGlobalBackground />
      <NavigationContainer theme={{
        ...DefaultTheme,
        dark: isDark,
        colors: {
          ...DefaultTheme.colors,
          primary: colors.primary,
          background: 'transparent',
          card: 'transparent',
          text: colors.text,
          border: colors.border,
          notification: colors.primary
        },
      }}>
        <Stack.Navigator screenOptions={{ headerShown: false, contentStyle: { backgroundColor: 'transparent' } }}>
          {!token ? (
            <>
              <Stack.Screen name="Registration" component={RegistrationScreen} />
              <Stack.Screen name="Onboarding" component={OnboardingScreen} />
              <Stack.Screen name="Login" component={LoginScreen} />
              <Stack.Screen name="OTP" component={OTPScreen} />
            </>
          ) : (
            <>
              <Stack.Screen name="MainTabs" component={MainTabs} />
              <Stack.Screen name="Assistant" component={AssistantScreen} />
              <Stack.Screen name="GovSchemes" component={GovSchemesScreen} />
              <Stack.Screen name="RawMaterials" component={RawMaterialsScreen} />
              <Stack.Screen name="Opportunities" component={OpportunitiesScreen} />
              <Stack.Screen name="Add Product" component={AddProductScreen} />
              <Stack.Screen name="BrandStudio" component={BrandStudioScreen} />
              <Stack.Screen name="Community" component={CommunityScreen} />
              <Stack.Screen name="Messages" component={ChatListScreen} />
              <Stack.Screen name="ChatList" component={ChatListScreen} />
              <Stack.Screen name="ChatDetail" component={MessagesScreen} />
              <Stack.Screen name="AuthenticityTag" component={require('./src/screens/Products/AuthenticityTagScreen').default} />
              <Stack.Screen name="OrderDetail" component={require('./src/screens/Orders/OrderDetailScreen').default} />
              <Stack.Screen name="TrustScore" component={require('./src/screens/Profile/TrustScoreScreen').default} />
              <Stack.Screen name="VideoMaker" component={require('./src/screens/Marketing/VideoMakerScreen').default} />
              <Stack.Screen name="BulkAllocation" component={require('./src/screens/Orders/BulkAllocationScreen').default} />
            </>
          )}
        </Stack.Navigator>
        {token && <RolePillOverlay />}
        {token && <VoiceAssistant />}
      </NavigationContainer>
      
      <StatusBar style={isDark ? "light" : "dark"} />
    </SafeAreaProvider>
  );
}
