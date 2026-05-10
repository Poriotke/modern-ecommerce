import { create } from 'zustand';
import { Product } from '@/types';

interface UIStore {
  // Quick View Modal
  quickViewProduct: Product | null;
  isQuickViewOpen: boolean;
  openQuickView: (product: Product) => void;
  closeQuickView: () => void;

  // Mobile Menu
  isMobileMenuOpen: boolean;
  toggleMobileMenu: () => void;
  closeMobileMenu: () => void;

  // Loading states
  isCheckoutLoading: boolean;
  setCheckoutLoading: (loading: boolean) => void;
}

export const useUIStore = create<UIStore>((set) => ({
  quickViewProduct: null,
  isQuickViewOpen: false,
  openQuickView: (product) => set({ quickViewProduct: product, isQuickViewOpen: true }),
  closeQuickView: () => set({ quickViewProduct: null, isQuickViewOpen: false }),

  isMobileMenuOpen: false,
  toggleMobileMenu: () => set((state) => ({ isMobileMenuOpen: !state.isMobileMenuOpen })),
  closeMobileMenu: () => set({ isMobileMenuOpen: false }),

  isCheckoutLoading: false,
  setCheckoutLoading: (loading) => set({ isCheckoutLoading: loading }),
}));
