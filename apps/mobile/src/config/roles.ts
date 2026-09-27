import React from 'react';
import { Ionicons } from '@expo/vector-icons';

import HomeScreen from '../screens/Home/HomeScreen';
import ProductsScreen from '../screens/Products/ProductsScreen';
import AddProductScreen from '../screens/Products/AddProductScreen';
import BuyersScreen from '../screens/Buyers/BuyersScreen';
import ProfileScreen from '../screens/Profile/ProfileScreen';

import BuyerHomeScreen from '../screens/Buyer/BuyerHomeScreen';
import OpportunitiesScreen from '../screens/Marketplace/OpportunitiesScreen';
import PostRequirementScreen from '../screens/Buyer/PostRequirementScreen';
import BuyerOrdersScreen from '../screens/Buyer/BuyerOrdersScreen';

import GovDashboardScreen from '../screens/Govt/GovDashboardScreen';
import ArtisansRegistryScreen from '../screens/Govt/ArtisansRegistryScreen';
import GovtBulkOrdersScreen from '../screens/Govt/GovtBulkOrdersScreen';

export type RoleDef = {
  id: string;
  label: string;
  accentColor: string;
  homeRoute: string;
  centerAction: { label: string; icon: any; route: string };
  tabs: Array<{ name: string; label: string; iconActive: any; iconInactive: any; component: React.FC<any> }>;
};

export const ROLE_CONFIG: Record<string, RoleDef> = {
  ARTISAN: {
    id: 'ARTISAN',
    label: 'Artisan',
    accentColor: '#394B72',
    homeRoute: 'Home',
    centerAction: { label: 'Add Product', icon: 'add', route: 'Add Product' },
    tabs: [
      { name: 'Home', label: 'Home', iconActive: 'home', iconInactive: 'home-outline', component: HomeScreen },
      { name: 'Products', label: 'Products', iconActive: 'grid', iconInactive: 'grid-outline', component: ProductsScreen },
      { name: 'Add Product', label: '', iconActive: 'add', iconInactive: 'add', component: AddProductScreen },
      { name: 'Buyers', label: 'Buyers', iconActive: 'people', iconInactive: 'people-outline', component: BuyersScreen },
      { name: 'Profile', label: 'Profile', iconActive: 'person', iconInactive: 'person-outline', component: ProfileScreen }
    ]
  },
  BUYER: {
    id: 'BUYER',
    label: 'Buyer',
    accentColor: '#0F766E', // Deep Teal
    homeRoute: 'BuyerHome',
    centerAction: { label: 'Post Req', icon: 'megaphone', route: 'Post Req' },
    tabs: [
      { name: 'BuyerHome', label: 'Home', iconActive: 'home', iconInactive: 'home-outline', component: BuyerHomeScreen },
      { name: 'Marketplace', label: 'Marketplace', iconActive: 'storefront', iconInactive: 'storefront-outline', component: OpportunitiesScreen },
      { name: 'Post Req', label: '', iconActive: 'add', iconInactive: 'add', component: PostRequirementScreen },
      { name: 'BuyerOrders', label: 'Orders', iconActive: 'receipt', iconInactive: 'receipt-outline', component: BuyerOrdersScreen },
      { name: 'Profile', label: 'Profile', iconActive: 'person', iconInactive: 'person-outline', component: ProfileScreen }
    ]
  },
  GOVT: {
    id: 'GOVT',
    label: 'Govt Official',
    accentColor: '#1E293B', // Slate / Navy
    homeRoute: 'GovDashboard',
    centerAction: { label: 'Report', icon: 'document-text', route: 'GenerateReportDummy' },
    tabs: [
      { name: 'GovDashboard', label: 'Dashboard', iconActive: 'bar-chart', iconInactive: 'bar-chart-outline', component: GovDashboardScreen },
      { name: 'Artisans', label: 'Artisans', iconActive: 'people', iconInactive: 'people-outline', component: ArtisansRegistryScreen },
      { name: 'GenerateReportDummy', label: '', iconActive: 'add', iconInactive: 'add', component: () => null }, // Handled via listener to open modal
      { name: 'GovtOrders', label: 'Bulk Orders', iconActive: 'cube', iconInactive: 'cube-outline', component: GovtBulkOrdersScreen },
      { name: 'Profile', label: 'Profile', iconActive: 'person', iconInactive: 'person-outline', component: ProfileScreen }
    ]
  }
};
