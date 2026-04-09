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

  seedDemoData: () => {
    const providers = getItem<Provider>(STORAGE_KEYS.PROVIDERS);
    if (providers.length > 0) return;

    const demoProviders: Provider[] = [
      {
        id: "demo1", userId: "u1", ownerName: "Ramesh Kumar", shopName: "Kumar Electricals",
        phone: "9876543210", email: "ramesh@demo.com", password: "demo123",
        category: "Electrical", subCategory: "Fan repair",
        address: "12, MG Road, Bengaluru", pinCode: "560001",
        openingTime: "08:00", closingTime: "20:00",
        status: "Approved", rating: 4.5, ratingCount: 12, earnings: 15000, jobsDone: 30,
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo2", userId: "u2", ownerName: "Suresh Patel", shopName: "CoolAir Solutions",
        phone: "9876543211", email: "suresh@demo.com", password: "demo123",
        category: "AC & Cooling", subCategory: "AC repair",
        address: "45, Koramangala, Bengaluru", pinCode: "560034",
        openingTime: "09:00", closingTime: "18:00",
        status: "Approved", rating: 4.2, ratingCount: 8, earnings: 22000, jobsDone: 18,
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo3", userId: "u3", ownerName: "Vijay Singh", shopName: "Fix It Plumbing",
        phone: "9876543212", email: "vijay@demo.com", password: "demo123",
        category: "Plumbing", subCategory: "Pipe leakage",
        address: "78, JP Nagar, Bengaluru", pinCode: "560078",
        openingTime: "07:00", closingTime: "19:00",
        status: "Approved", rating: 4.7, ratingCount: 22, earnings: 18500, jobsDone: 45,
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo4", userId: "u4", ownerName: "Mohan Reddy", shopName: "Reddy Appliances",
        phone: "9876543213", email: "mohan@demo.com", password: "demo123",
        category: "Appliance Repair", subCategory: "TV repair",
        address: "23, Indiranagar, Bengaluru", pinCode: "560038",
        openingTime: "10:00", closingTime: "21:00",
        status: "Approved", rating: 3.9, ratingCount: 5, earnings: 9000, jobsDone: 12,
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo5", userId: "u5", ownerName: "Priya Sharma", shopName: "CleanHome Services",
        phone: "9876543214", email: "priya@demo.com", password: "demo123",
        category: "Home Services", subCategory: "Cleaning",
        address: "56, Whitefield, Bengaluru", pinCode: "560066",
        openingTime: "08:00", closingTime: "17:00",
        status: "Approved", rating: 4.8, ratingCount: 35, earnings: 28000, jobsDone: 70,
        createdAt: new Date().toISOString(),
      },
      {
        id: "demo6", userId: "u6", ownerName: "Anil Nair", shopName: "Nair Electricals",
        phone: "9876543215", email: "anil@demo.com", password: "demo123",
        category: "Electrical", subCategory: "Wiring",
        address: "34, HSR Layout, Bengaluru", pinCode: "560102",
        openingTime: "09:00", closingTime: "19:00",
        status: "Pending", rating: 0, ratingCount: 0, earnings: 0, jobsDone: 0,
        createdAt: new Date().toISOString(),
      },
    ];

    setItem(STORAGE_KEYS.PROVIDERS, demoProviders);
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
