import { create } from 'zustand';

interface UserProfile {
  id: string;
  name: string;
  email: string;
  phone: string;
  location: string;
  empId: string;
  joined: string;
  dept: string;
  role: string;
  profilePicture: string;
  emergencyContact: string;
  bankName: string;
  accountNumber: string;
  ifscCode: string;
  maxLeaves?: number;
  companyName?: string;
  companyCode?: string;
}

interface AuthState {
  token: string | null;
  isAuthenticated: boolean;
  userRole: string;
  profile: UserProfile;
  setToken: (token: string | null) => void;
  setIsAuthenticated: (auth: boolean) => void;
  setUserRole: (role: string) => void;
  setProfile: (profileUpdates: Partial<UserProfile> | ((prev: UserProfile) => Partial<UserProfile>)) => void;
  logout: () => void;
}

const initialProfile: UserProfile = {
  id: '',
  name: '',
  email: '',
  phone: '',
  location: '',
  empId: '',
  joined: '',
  dept: '',
  role: '',
  profilePicture: '',
  emergencyContact: '',
  bankName: '',
  accountNumber: '',
  ifscCode: '',
  maxLeaves: 24,
};

export const useAuthStore = create<AuthState>((set) => ({
  token: typeof window !== 'undefined' ? localStorage.getItem('hr_system_token') : null,
  isAuthenticated: typeof window !== 'undefined' ? localStorage.getItem('hr_system_auth') === 'true' : false,
  userRole: typeof window !== 'undefined' ? localStorage.getItem('hr_system_role') || 'HR' : 'HR',
  profile: initialProfile,
  
  setToken: (token) => {
    if (token) {
      localStorage.setItem('hr_system_token', token);
    } else {
      localStorage.removeItem('hr_system_token');
    }
    set({ token });
  },
  
  setIsAuthenticated: (auth) => {
    localStorage.setItem('hr_system_auth', String(auth));
    set({ isAuthenticated: auth });
  },
  
  setUserRole: (role) => {
    localStorage.setItem('hr_system_role', role);
    set({ userRole: role });
  },
  
  setProfile: (profileUpdates) => {
    set((state) => {
      const updates = typeof profileUpdates === 'function'
        ? profileUpdates(state.profile)
        : profileUpdates;
      return {
        profile: { ...state.profile, ...updates }
      };
    });
  },
  
  logout: () => {
    localStorage.removeItem('hr_system_token');
    localStorage.setItem('hr_system_auth', 'false');
    localStorage.removeItem('hr_system_role');
    localStorage.removeItem('hr_system_page');
    set({
      token: null,
      isAuthenticated: false,
      userRole: 'HR',
      profile: initialProfile,
    });
  },
}));
