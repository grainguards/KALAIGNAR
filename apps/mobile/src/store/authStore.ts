import { create } from 'zustand';

export type UserRole = 'ARTISAN' | 'BUYER' | 'GOVT';

interface ArtisanMetrics {
  salesVolume: number;
  consistencyScore: number;
  fulfilmentRate: number;
  creditScore: number;
}

interface AuthState {
  token: string | null;
  user: any | null;
  role: UserRole;
  metrics: ArtisanMetrics;
  profileData: any;
  setRole: (role: UserRole) => void;
  setAuth: (token: string, user: any) => void;
  updateMetrics: (newMetrics: Partial<ArtisanMetrics>) => void;
  updateProfileData: (data: any) => void;
  logout: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  role: 'ARTISAN', // Default to Artisan for the hackathon
  profileData: {
    name: 'Daksh Sharma',
    businessName: '',
    location: '',
    craftCategory: '',
    experienceYears: '',
    story: ''
  },
  metrics: {
    salesVolume: 24500, // INR
    consistencyScore: 85, // out of 100
    fulfilmentRate: 92, // percentage
    creditScore: 710, // Max 850
  },
  setRole: (role) => set({ role }),
  setAuth: (token, user) => set({ token, user }),
  updateProfileData: (data) => set((state) => ({ profileData: { ...state.profileData, ...data } })),
  updateMetrics: (newMetrics) => set((state) => {
    const updatedMetrics = { ...state.metrics, ...newMetrics };
    
    // Auto-recalculate credit score if sub-metrics change
    updatedMetrics.creditScore = Math.round(
      (updatedMetrics.salesVolume > 50000 ? 850 * 0.4 : (updatedMetrics.salesVolume / 50000) * 850 * 0.4) +
      (updatedMetrics.consistencyScore / 100) * 850 * 0.3 +
      (updatedMetrics.fulfilmentRate / 100) * 850 * 0.3
    );

    return { metrics: updatedMetrics };
  }),
  logout: () => set({ token: null, user: null, role: 'ARTISAN' }),
}));
