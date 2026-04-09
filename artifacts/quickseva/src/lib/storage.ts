export interface User {
  id: string;
  name: string;
  email: string;
  password: string;
  phone: string;
  role: "user" | "provider" | "admin";
  createdAt: string;
}

export interface Provider {
  id: string;
  userId: string;
  ownerName: string;
  shopName: string;
  phone: string;
  email: string;
  password: string;
  category: string;
  subCategory: string;
  address: string;
  pinCode: string;
  openingTime: string;
  closingTime: string;
  status: "Pending" | "Approved" | "Rejected";
  rating: number;
  ratingCount: number;
  earnings: number;
  jobsDone: number;
  createdAt: string;
}

export interface Booking {
  id: string;
  userId: string;
  userName: string;
  userPhone: string;
  providerId: string;
  providerName: string;
  shopName: string;
  category: string;
  address: string;
  problemDescription: string;
  preferredTime: string;
  status: "Request Sent" | "Accepted" | "On the Way" | "Work in Progress" | "Completed" | "Rejected";
  rating?: number;
  amount?: number;
  createdAt: string;
  updatedAt: string;
}

export const SERVICE_CATEGORIES: Record<string, string[]> = {
  "Electrical": ["Fan repair", "Switch repair", "Wiring"],
  "AC & Cooling": ["AC repair", "AC installation", "Cooler repair", "Fridge repair"],
  "Plumbing": ["Pipe leakage", "Tap repair", "Bathroom fitting"],
  "Appliance Repair": ["TV repair", "Washing machine repair"],
  "Home Services": ["Cleaning", "Painting", "Pest control"],
};

const STORAGE_KEYS = {
  USERS: "qs_users",
  PROVIDERS: "qs_providers",
  BOOKINGS: "qs_bookings",
  CURRENT_USER: "qs_current_user",
  CURRENT_PROVIDER: "qs_current_provider",
};

function getItem<T>(key: string): T[] {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

function setItem<T>(key: string, value: T[]): void {
  localStorage.setItem(key, JSON.stringify(value));
}

function getId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}

export const storage = {
  getUsers: (): User[] => getItem<User>(STORAGE_KEYS.USERS),
  setUsers: (users: User[]) => setItem(STORAGE_KEYS.USERS, users),

  getProviders: (): Provider[] => getItem<Provider>(STORAGE_KEYS.PROVIDERS),
  setProviders: (providers: Provider[]) => setItem(STORAGE_KEYS.PROVIDERS, providers),

  getBookings: (): Booking[] => getItem<Booking>(STORAGE_KEYS.BOOKINGS),
  setBookings: (bookings: Booking[]) => setItem(STORAGE_KEYS.BOOKINGS, bookings),

  getCurrentUser: (): User | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_USER);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  setCurrentUser: (user: User | null) => {
    if (user) localStorage.setItem(STORAGE_KEYS.CURRENT_USER, JSON.stringify(user));
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_USER);
  },

  getCurrentProvider: (): Provider | null => {
    try {
      const raw = localStorage.getItem(STORAGE_KEYS.CURRENT_PROVIDER);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  },
  setCurrentProvider: (provider: Provider | null) => {
    if (provider) localStorage.setItem(STORAGE_KEYS.CURRENT_PROVIDER, JSON.stringify(provider));
    else localStorage.removeItem(STORAGE_KEYS.CURRENT_PROVIDER);
  },

  registerUser: (data: Omit<User, "id" | "createdAt" | "role">): { success: boolean; error?: string; user?: User } => {
    const users = getItem<User>(STORAGE_KEYS.USERS);
    if (users.find(u => u.email === data.email)) {
      return { success: false, error: "Email already registered" };
    }
    const user: User = { ...data, id: getId(), role: "user", createdAt: new Date().toISOString() };
    setItem(STORAGE_KEYS.USERS, [...users, user]);
    return { success: true, user };
  },

  loginUser: (email: string, password: string): { success: boolean; error?: string; user?: User } => {
    if (email === "admin@quickseva.com" && password === "admin123") {
      const adminUser: User = { id: "admin", name: "Admin", email, password, phone: "", role: "admin", createdAt: "" };
      return { success: true, user: adminUser };
    }
    const users = getItem<User>(STORAGE_KEYS.USERS);
    const user = users.find(u => u.email === email && u.password === password);
    if (!user) return { success: false, error: "Invalid email or password" };
    return { success: true, user };
  },

  registerProvider: (data: Omit<Provider, "id" | "userId" | "status" | "rating" | "ratingCount" | "earnings" | "jobsDone" | "createdAt">): { success: boolean; error?: string; provider?: Provider } => {
    const providers = getItem<Provider>(STORAGE_KEYS.PROVIDERS);
    if (providers.find(p => p.email === data.email)) {
      return { success: false, error: "Email already registered" };
    }
    const provider: Provider = {
      ...data,
      id: getId(),
      userId: getId(),
      status: "Pending",
      rating: 0,
      ratingCount: 0,
      earnings: 0,
      jobsDone: 0,
      createdAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.PROVIDERS, [...providers, provider]);
    return { success: true, provider };
  },

  loginProvider: (email: string, password: string): { success: boolean; error?: string; provider?: Provider } => {
    const providers = getItem<Provider>(STORAGE_KEYS.PROVIDERS);
    const provider = providers.find(p => p.email === email && p.password === password);
    if (!provider) return { success: false, error: "Invalid email or password" };
    return { success: true, provider };
  },

  createBooking: (data: Omit<Booking, "id" | "status" | "createdAt" | "updatedAt">): Booking => {
    const bookings = getItem<Booking>(STORAGE_KEYS.BOOKINGS);
    const booking: Booking = {
      ...data,
      id: getId(),
      status: "Request Sent",
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setItem(STORAGE_KEYS.BOOKINGS, [...bookings, booking]);
    return booking;
  },

  updateBookingStatus: (bookingId: string, status: Booking["status"], amount?: number) => {
    const bookings = getItem<Booking>(STORAGE_KEYS.BOOKINGS);
    const updated = bookings.map(b => {
      if (b.id !== bookingId) return b;
      const updatedBooking = { ...b, status, updatedAt: new Date().toISOString() };
      if (amount !== undefined) updatedBooking.amount = amount;
      return updatedBooking;
    });
    setItem(STORAGE_KEYS.BOOKINGS, updated);

    if (status === "Completed") {
      const booking = bookings.find(b => b.id === bookingId);
      if (booking) {
        const providers = getItem<Provider>(STORAGE_KEYS.PROVIDERS);
        const updatedProviders = providers.map(p => {
          if (p.id !== booking.providerId) return p;
          return { ...p, jobsDone: p.jobsDone + 1, earnings: p.earnings + (amount || 500) };
        });
        setItem(STORAGE_KEYS.PROVIDERS, updatedProviders);
      }
    }
  },

  rateBooking: (bookingId: string, rating: number) => {
    const bookings = getItem<Booking>(STORAGE_KEYS.BOOKINGS);
    const booking = bookings.find(b => b.id === bookingId);
    if (!booking) return;

    const updated = bookings.map(b => b.id === bookingId ? { ...b, rating, updatedAt: new Date().toISOString() } : b);
    setItem(STORAGE_KEYS.BOOKINGS, updated);

    const providers = getItem<Provider>(STORAGE_KEYS.PROVIDERS);
    const updatedProviders = providers.map(p => {
      if (p.id !== booking.providerId) return p;
      const newCount = p.ratingCount + 1;
      const newRating = ((p.rating * p.ratingCount) + rating) / newCount;
      return { ...p, rating: Math.round(newRating * 10) / 10, ratingCount: newCount };
    });
    setItem(STORAGE_KEYS.PROVIDERS, updatedProviders);
  },

  approveProvider: (providerId: string) => {
    const providers = getItem<Provider>(STORAGE_KEYS.PROVIDERS);
    setItem(STORAGE_KEYS.PROVIDERS, providers.map(p => p.id === providerId ? { ...p, status: "Approved" } : p));
  },

  rejectProvider: (providerId: string) => {
    const providers = getItem<Provider>(STORAGE_KEYS.PROVIDERS);
    setItem(STORAGE_KEYS.PROVIDERS, providers.map(p => p.id === providerId ? { ...p, status: "Rejected" } : p));
  },

};

export function isProviderOpen(provider: Provider): boolean {
  const now = new Date();
  const [openH, openM] = provider.openingTime.split(":").map(Number);
  const [closeH, closeM] = provider.closingTime.split(":").map(Number);
  const currentMinutes = now.getHours() * 60 + now.getMinutes();
  const openMinutes = openH * 60 + openM;
  const closeMinutes = closeH * 60 + closeM;
  return currentMinutes >= openMinutes && currentMinutes < closeMinutes;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

export function generateId(): string {
  return Math.random().toString(36).slice(2) + Date.now().toString(36);
}
