export const SERVICE_CATEGORIES: Record<string, string[]> = {
  "Electrical": ["Fan repair", "Switch repair", "Wiring"],
  "AC & Cooling": ["AC repair", "AC installation", "Cooler repair", "Fridge repair"],
  "Plumbing": ["Pipe leakage", "Tap repair", "Bathroom fitting"],
  "Appliance Repair": ["TV repair", "Washing machine repair"],
  "Home Services": ["Cleaning", "Painting", "Pest control"],
};

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "user" | "provider" | "admin";
  referralCode: string;
  referredBy?: string | null;
  referralCount: number;
  referralEarnings: number;
}

export interface Provider {
  id: string;
  ownerName: string;
  shopName: string;
  email: string;
  phone: string;
  category: string;
  subCategory: string;
  address: string;
  pinCode: string;
  latitude?: number | null;
  longitude?: number | null;
  openingTime: string;
  closingTime: string;
  status: "Pending" | "Approved" | "Rejected";
  rating: number;
  ratingCount: number;
  earnings: number;
  jobsDone: number;
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
  userLatitude?: number | null;
  userLongitude?: number | null;
  problemDescription: string;
  preferredTime: string;
  status: "Request Sent" | "Accepted" | "On the Way" | "Work in Progress" | "Completed" | "Rejected";
  rating?: number | null;
  amount?: number | null;
  completionOtp?: string | null;
  providerLatitude?: number | null;
  providerLongitude?: number | null;
  locationUpdatedAt?: string | null;
  createdAt: string;
  updatedAt: string;
}

async function req<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, {
    headers: { "Content-Type": "application/json" },
    ...options,
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.error || "Request failed");
  return data as T;
}

export const api = {
  registerUser: (data: { name: string; email: string; password: string; phone: string; referralCode?: string }) =>
    req<{ success: boolean; user: User }>("/api/auth/register", { method: "POST", body: JSON.stringify(data) }),

  loginUser: (email: string, password: string) =>
    req<{ success: boolean; user: User }>("/api/auth/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  registerProvider: (data: Record<string, unknown>) =>
    req<{ success: boolean; provider: Provider }>("/api/auth/provider/register", { method: "POST", body: JSON.stringify(data) }),

  loginProvider: (email: string, password: string) =>
    req<{ success: boolean; provider: Provider }>("/api/auth/provider/login", { method: "POST", body: JSON.stringify({ email, password }) }),

  getProviders: (pinCode?: string, category?: string) => {
    const params = new URLSearchParams();
    if (pinCode) params.set("pinCode", pinCode);
    if (category) params.set("category", category);
    return req<Provider[]>(`/api/providers?${params}`);
  },

  getProvider: (id: string) => req<Provider>(`/api/providers/${id}`),

  createBooking: (data: Partial<Booking>) =>
    req<{ success: boolean; booking: Booking }>("/api/bookings", { method: "POST", body: JSON.stringify(data) }),

  getUserBookings: (userId: string) => req<Booking[]>(`/api/bookings/user/${userId}`),

  getProviderBookings: (providerId: string) => req<Booking[]>(`/api/bookings/provider/${providerId}`),

  updateBookingStatus: (bookingId: string, status: Booking["status"], opts?: { amount?: number; otp?: string }) =>
    req<{ success: boolean }>(`/api/bookings/${bookingId}/status`, { method: "PATCH", body: JSON.stringify({ status, ...opts }) }),

  updateBookingLocation: (bookingId: string, latitude: number, longitude: number) =>
    req<{ success: boolean }>(`/api/bookings/${bookingId}/location`, { method: "PATCH", body: JSON.stringify({ latitude, longitude }) }),

  rateBooking: (bookingId: string, rating: number) =>
    req<{ success: boolean }>(`/api/bookings/${bookingId}/rate`, { method: "PATCH", body: JSON.stringify({ rating }) }),

  adminGetProviders: () => req<Provider[]>("/api/admin/providers"),
  adminGetUsers: () => req<User[]>("/api/admin/users"),
  adminGetBookings: () => req<Booking[]>("/api/admin/bookings"),
  adminApproveProvider: (id: string) => req<{ success: boolean }>(`/api/admin/providers/${id}/approve`, { method: "PATCH" }),
  adminRejectProvider: (id: string) => req<{ success: boolean }>(`/api/admin/providers/${id}/reject`, { method: "PATCH" }),
};

const SESSION_USER = "qs_session_user";
const SESSION_PROVIDER = "qs_session_provider";

export const session = {
  getUser: (): User | null => {
    try { return JSON.parse(localStorage.getItem(SESSION_USER) || "null"); } catch { return null; }
  },
  setUser: (u: User | null) => {
    if (u) localStorage.setItem(SESSION_USER, JSON.stringify(u));
    else localStorage.removeItem(SESSION_USER);
  },
  getProvider: (): Provider | null => {
    try { return JSON.parse(localStorage.getItem(SESSION_PROVIDER) || "null"); } catch { return null; }
  },
  setProvider: (p: Provider | null) => {
    if (p) localStorage.setItem(SESSION_PROVIDER, JSON.stringify(p));
    else localStorage.removeItem(SESSION_PROVIDER);
  },
};

export function isProviderOpen(provider: Provider): boolean {
  const now = new Date();
  const [openH, openM] = provider.openingTime.split(":").map(Number);
  const [closeH, closeM] = provider.closingTime.split(":").map(Number);
  const cur = now.getHours() * 60 + now.getMinutes();
  return cur >= openH * 60 + openM && cur < closeH * 60 + closeM;
}

export function formatTime(time: string): string {
  const [h, m] = time.split(":").map(Number);
  const period = h >= 12 ? "PM" : "AM";
  const displayH = h > 12 ? h - 12 : h === 0 ? 12 : h;
  return `${displayH}:${m.toString().padStart(2, "0")} ${period}`;
}

export function getCurrentLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) return reject(new Error("Geolocation not supported"));
    navigator.geolocation.getCurrentPosition(
      pos => resolve({ latitude: pos.coords.latitude, longitude: pos.coords.longitude }),
      err => reject(err),
      { enableHighAccuracy: true, timeout: 10000 }
    );
  });
}
