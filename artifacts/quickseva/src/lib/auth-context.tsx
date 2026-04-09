import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { storage, User, Provider } from "./storage";

interface AuthContextType {
  user: User | null;
  provider: Provider | null;
  login: (email: string, password: string) => { success: boolean; error?: string };
  loginProvider: (email: string, password: string) => { success: boolean; error?: string };
  logout: () => void;
  isAdmin: boolean;
  isProvider: boolean;
  isUser: boolean;
  refreshProvider: () => void;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);

  useEffect(() => {
    // One-time migration: clear legacy demo data if present
    const MIGRATION_KEY = "qs_v2_clean";
    if (!localStorage.getItem(MIGRATION_KEY)) {
      localStorage.removeItem("qs_providers");
      localStorage.removeItem("qs_users");
      localStorage.removeItem("qs_bookings");
      localStorage.removeItem("qs_current_user");
      localStorage.removeItem("qs_current_provider");
      localStorage.setItem(MIGRATION_KEY, "1");
    }

    const savedUser = storage.getCurrentUser();
    const savedProvider = storage.getCurrentProvider();
    if (savedUser) setUser(savedUser);
    if (savedProvider) {
      const providers = storage.getProviders();
      const fresh = providers.find(p => p.id === savedProvider.id);
      setProvider(fresh || savedProvider);
    }
  }, []);

  const login = (email: string, password: string) => {
    const result = storage.loginUser(email, password);
    if (result.success && result.user) {
      setUser(result.user);
      storage.setCurrentUser(result.user);
    }
    return { success: result.success, error: result.error };
  };

  const loginProvider = (email: string, password: string) => {
    const result = storage.loginProvider(email, password);
    if (result.success && result.provider) {
      setProvider(result.provider);
      storage.setCurrentProvider(result.provider);
    }
    return { success: result.success, error: result.error };
  };

  const logout = () => {
    setUser(null);
    setProvider(null);
    storage.setCurrentUser(null);
    storage.setCurrentProvider(null);
  };

  const refreshProvider = () => {
    if (provider) {
      const providers = storage.getProviders();
      const fresh = providers.find(p => p.id === provider.id);
      if (fresh) {
        setProvider(fresh);
        storage.setCurrentProvider(fresh);
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      user,
      provider,
      login,
      loginProvider,
      logout,
      isAdmin: user?.role === "admin",
      isProvider: !!provider,
      isUser: !!user && user.role !== "admin",
      refreshProvider,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error("useAuth must be used within AuthProvider");
  return ctx;
}
