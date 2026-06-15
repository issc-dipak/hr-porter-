import { create } from 'zustand';

interface ToastInfo {
  message: string;
  type: 'success' | 'error' | 'info' | 'warning';
}

interface UIState {
  sidebarOpen: boolean;
  isMobile: boolean;
  currentPage: string;
  showToast: ToastInfo | string | null;
  setSidebarOpen: (open: boolean) => void;
  toggleSidebar: () => void;
  setIsMobile: (isMobile: boolean) => void;
  setCurrentPage: (page: string) => void;
  triggerToast: (message: string, type?: 'success' | 'error' | 'info' | 'warning') => void;
  clearToast: () => void;
}

export const useUIStore = create<UIState>((set) => ({
  sidebarOpen: true,
  isMobile: false,
  currentPage: 'dashboard',
  showToast: null,
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
  setIsMobile: (mobile) => set({ isMobile: mobile }),
  setCurrentPage: (page) => set({ currentPage: page }),
  triggerToast: (message, type = 'info') => {
    set({ showToast: { message, type } });
    setTimeout(() => {
      set({ showToast: null });
    }, 4000);
  },
  clearToast: () => set({ showToast: null }),
}));
