import { create } from 'zustand';
import { persist, createJSONStorage } from 'zustand/middleware';
import AsyncStorage from '@react-native-async-storage/async-storage';

export interface Product {
  id: string;
  name: string;
  price: string;
  description: string;
  imageUri: string;
  createdAt: number;
  [key: string]: any;
}

interface CatalogState {
  products: Product[];
  addProduct: (product: Omit<Product, 'id' | 'createdAt'>) => void;
  removeProduct: (id: string) => void;
  updateProduct: (id: string, updatedData: Partial<Product>) => void;
}

export const useCatalogStore = create<CatalogState>()(
  persist(
    (set) => ({
      products: [],
      
      addProduct: (productData: any) => set((state) => {
        const newProduct = {
          ...productData,
          id: Math.random().toString(36).substring(2, 9),
          createdAt: Date.now(),
        };
        return { products: [newProduct, ...state.products] };
      }),
      
      removeProduct: (id) => set((state) => ({
        products: state.products.filter(p => p.id !== id)
      })),
      
      updateProduct: (id, updatedData) => set((state) => ({
        products: state.products.map(p => p.id === id ? { ...p, ...updatedData } : p)
      })),
    }),
    {
      name: 'karigar-catalog-storage',
      storage: createJSONStorage(() => AsyncStorage),
    }
  )
);
