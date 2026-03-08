import { create } from 'zustand';

interface AuthUser {
  id: string;
  email: string;
  nickname: string;
}

interface AuthState {
  user: AuthUser | null;
  token: string | null;
  isAuthenticated: boolean;
  setAuth: (user: AuthUser, token: string) => void;
  logout: () => void;
}

function loadToken(): string | null {
  try {
    return localStorage.getItem('chatops_token');
  } catch {
    return null;
  }
}

function loadUser(): AuthUser | null {
  try {
    const raw = localStorage.getItem('chatops_user');
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

const initialToken = loadToken();
const initialUser = loadUser();

export const useAuthStore = create<AuthState>((set) => ({
  user: initialUser,
  token: initialToken,
  isAuthenticated: !!initialToken && !!initialUser,
  setAuth: (user, token) => {
    localStorage.setItem('chatops_token', token);
    localStorage.setItem('chatops_user', JSON.stringify(user));
    set({ user, token, isAuthenticated: true });
  },
  logout: () => {
    const currentUser = useAuthStore.getState().user;
    localStorage.removeItem('chatops_token');
    localStorage.removeItem('chatops_user');
    if (currentUser) {
      try {
        localStorage.removeItem(`chatops_last_room:${currentUser.id}`);
      } catch {
        // ignore
      }
    }
    set({ user: null, token: null, isAuthenticated: false });
  },
}));
