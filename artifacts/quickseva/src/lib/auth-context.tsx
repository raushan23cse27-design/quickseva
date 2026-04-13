import { createContext, useContext, useState, useEffect, ReactNode } from "react";
import { api, session, User, Provider } from "./api";

interface AuthContextType {
  user: User | null;
  provider: Provider | null;
  login: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  loginProvider: (email: string, password: string) => Promise<{ success: boolean; error?: string }>;
  logout: () => void;
  isAdmin: boolean;
  isProvider: boolean;
  isUser: boolean;
  refreshProvider: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [provider, setProvider] = useState<Provider | null>(null);

  useEffect(() => {
    const savedUser = session.getUser();
    const savedProvider = session.getProvider();
    if (savedUser) setUser(savedUser);
    if (savedProvider) setProvider(savedProvider);
  }, []);

  const login = async (email: string, password: string) => {
    try {
      const result = await api.loginUser(email, password);
      if (result.success && result.user) {
        setUser(result.user);
        session.setUser(result.user);
      }
      return { success: result.success };
    } catch (e: any) {
      return { success: false, error: e.message || "Login failed" };
    }
  };

  const loginProvider = async (email: string, password: string) => {
    try {
      const result = await api.loginProvider(email, password);
      if (result.success && result.provider) {
        setProvider(result.provider);
        session.setProvider(result.provider);
      }
      return { success: result.success };
    } catch (e: any) {
      return { success: false, error: e.message || "Login failed" };
    }
  };

  const logout = () => {
    setUser(null);
    setProvider(null);
    session.setUser(null);
    session.setProvider(null);
  };

  const refreshProvider = async () => {
    if (provider) {
      try {
        const fresh = await api.getProvider(provider.id);
        setProvider(fresh);
        session.setProvider(fresh);
      } catch {}
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
