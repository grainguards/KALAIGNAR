import { create } from 'zustand';

export interface Order {
  id: string;
  itemName: string;
  category: string;
  color: string;
  pattern: string;
  region: string;
  price: number;
  quantity: number;
  orderDate: Date;
  status: 'PENDING' | 'FULFILLED' | 'CANCELLED';
}

export interface ArtisanProfile {
  id: string;
  name: string;
  capacity: number; // items per month
  qualityScore: number;
}

export interface BulkRequirement {
  id: string;
  productType: string;
  totalQuantity: number;
  deadline: Date;
  budgetPerUnit: number;
  status: 'OPEN' | 'ALLOCATED' | 'FULFILLED';
  allocations: { artisanId: string; quantity: number; status: 'PENDING' | 'ACCEPTED' | 'DECLINED' }[];
}

interface OrderState {
  orders: Order[];
  requirements: BulkRequirement[];
  artisans: ArtisanProfile[];
  
  // Feature 1: Predictive Demand Engine
  getTrendingAttributes: () => { attribute: string; score: number; type: 'color' | 'pattern' | 'category' }[];
  
  // Features 2 & 5: Bulk Allocation
  postRequirement: (req: Omit<BulkRequirement, 'id' | 'status' | 'allocations'>) => void;
  acceptAllocation: (reqId: string, artisanId: string) => void;
  declineAllocation: (reqId: string, artisanId: string) => void;
}

// Mock Data Seed
const MOCK_ORDERS: Order[] = Array.from({ length: 50 }).map((_, i) => {
  const isRecent = i < 20; // First 20 are "recent" (trailing window)
  return {
    id: `ord_${i}`,
    itemName: 'Handloom Item',
    category: i % 3 === 0 ? 'Pottery' : 'Textiles',
    color: isRecent ? 'Indigo Blue' : (i % 2 === 0 ? 'Terracotta' : 'Crimson Red'), // Indigo is trending recently!
    pattern: isRecent ? 'Ikat' : 'Floral',
    region: 'Gujarat',
    price: 1500 + Math.random() * 500,
    quantity: Math.floor(Math.random() * 5) + 1,
    orderDate: isRecent ? new Date(Date.now() - i * 86400000) : new Date(Date.now() - (i + 15) * 86400000),
    status: 'FULFILLED'
  };
});

const MOCK_ARTISANS: ArtisanProfile[] = [
  { id: 'me', name: 'You (Logged In)', capacity: 50, qualityScore: 4.8 },
  { id: 'a2', name: 'Ramesh K.', capacity: 100, qualityScore: 4.5 },
  { id: 'a3', name: 'Sita Devi', capacity: 200, qualityScore: 4.9 },
  { id: 'a4', name: 'Arjun P.', capacity: 75, qualityScore: 4.2 },
];

export const useOrderStore = create<OrderState>((set, get) => ({
  orders: MOCK_ORDERS,
  artisans: MOCK_ARTISANS,
  requirements: [],
  
  getTrendingAttributes: () => {
    const orders = get().orders;
    const now = Date.now();
    const twoWeeksAgo = now - 14 * 86400000;
    const fourWeeksAgo = now - 28 * 86400000;

    const recent = orders.filter(o => o.orderDate.getTime() > twoWeeksAgo);
    const older = orders.filter(o => o.orderDate.getTime() > fourWeeksAgo && o.orderDate.getTime() <= twoWeeksAgo);

    const counts = { recent: {} as Record<string, number>, older: {} as Record<string, number> };
    
    // Count colors
    recent.forEach(o => counts.recent[o.color] = (counts.recent[o.color] || 0) + o.quantity);
    older.forEach(o => counts.older[o.color] = (counts.older[o.color] || 0) + o.quantity);
    
    const trends = Object.keys(counts.recent).map(color => {
      const recentCount = counts.recent[color];
      const olderCount = counts.older[color] || 1; // avoid div by 0
      const score = ((recentCount - olderCount) / olderCount) * 100;
      return { attribute: color, score, type: 'color' as const };
    });

    return trends.sort((a, b) => b.score - a.score).slice(0, 3);
  },

  postRequirement: (reqData) => set((state) => {
    // Greedy Allocation Logic (Feature 2)
    let remainingQuantity = reqData.totalQuantity;
    const allocations: BulkRequirement['allocations'] = [];
    
    // Sort artisans by quality score
    const sortedArtisans = [...state.artisans].sort((a, b) => b.qualityScore - a.qualityScore);
    
    for (const artisan of sortedArtisans) {
      if (remainingQuantity <= 0) break;
      const take = Math.min(remainingQuantity, artisan.capacity);
      allocations.push({
        artisanId: artisan.id,
        quantity: take,
        status: 'PENDING'
      });
      remainingQuantity -= take;
    }

    const newReq: BulkRequirement = {
      ...reqData,
      id: Math.random().toString(36).substring(7),
      status: 'OPEN',
      allocations,
    };
    
    return { requirements: [newReq, ...state.requirements] };
  }),
  
  acceptAllocation: (reqId, artisanId) => set((state) => {
    const requirements = state.requirements.map(req => {
      if (req.id === reqId) {
        const allocations = req.allocations.map(alloc => 
          alloc.artisanId === artisanId ? { ...alloc, status: 'ACCEPTED' as const } : alloc
        );
        return { ...req, allocations };
      }
      return req;
    });
    return { requirements };
  }),
  
  declineAllocation: (reqId, artisanId) => set((state) => {
    const requirements = state.requirements.map(req => {
      if (req.id === reqId) {
        const allocations = req.allocations.map(alloc => 
          alloc.artisanId === artisanId ? { ...alloc, status: 'DECLINED' as const } : alloc
        );
        return { ...req, allocations };
      }
      return req;
    });
    return { requirements };
  })
}));
