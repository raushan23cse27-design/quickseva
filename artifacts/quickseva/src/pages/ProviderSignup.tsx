import { useState } from "react";
import { useLocation } from "wouter";
import { storage, SERVICE_CATEGORIES } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Zap } from "lucide-react";

export default function ProviderSignup() {
  const [form, setForm] = useState({
    ownerName: "", shopName: "", phone: "", email: "", password: "", confirm: "",
    category: "", subCategory: "", address: "", pinCode: "", openingTime: "09:00", closingTime: "18:00",
  });
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const [, navigate] = useLocation();

  const set = (field: string) => (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) =>
    setForm(f => ({ ...f, [field]: e.target.value }));

  const subCategories = form.category ? SERVICE_CATEGORIES[form.category] : [];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.password !== form.confirm) { setError("Passwords do not match"); return; }
    if (!form.category || !form.subCategory) { setError("Please select a category and service"); return; }
    if (!/^\d{6}$/.test(form.pinCode)) { setError("PIN code must be 6 digits"); return; }

    const result = storage.registerProvider({
      ownerName: form.ownerName, shopName: form.shopName, phone: form.phone,
      email: form.email, password: form.password, category: form.category,
      subCategory: form.subCategory, address: form.address, pinCode: form.pinCode,
      openingTime: form.openingTime, closingTime: form.closingTime,
    });

    if (!result.success) { setError(result.error || "Registration failed"); return; }
    setSuccess(true);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Registration Successful!</h2>
          <p className="text-gray-500 mt-2 mb-6">Your application is under review. You'll be approved by our admin team shortly.</p>
          <div className="bg-blue-50 rounded-xl p-4 text-left text-sm text-blue-800 mb-6">
            <strong>What happens next?</strong>
            <ul className="mt-2 space-y-1 list-disc list-inside">
              <li>Admin reviews your application</li>
              <li>You get approved/rejected</li>
              <li>Login to view your dashboard</li>
            </ul>
          </div>
          <Button onClick={() => navigate("/login")} className="bg-blue-600 hover:bg-blue-700 text-white">
            Go to Login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 py-12 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold text-blue-600 mb-2">
            <Zap className="w-7 h-7" />
            QuickSeva
          </div>
          <p className="text-gray-500">Register your business</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold text-center">Provider Registration</h2>
            <p className="text-sm text-gray-500 text-center">Fill in your business details below</p>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Owner Name *</Label>
                  <Input placeholder="Ramesh Kumar" value={form.ownerName} onChange={set("ownerName")} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Shop Name *</Label>
                  <Input placeholder="Kumar Electricals" value={form.shopName} onChange={set("shopName")} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Phone *</Label>
                  <Input placeholder="9876543210" value={form.phone} onChange={set("phone")} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Email *</Label>
                  <Input type="email" placeholder="you@example.com" value={form.email} onChange={set("email")} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Category *</Label>
                  <select
                    value={form.category}
                    onChange={e => setForm(f => ({ ...f, category: e.target.value, subCategory: "" }))}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                  >
                    <option value="">Select category</option>
                    {Object.keys(SERVICE_CATEGORIES).map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
                <div className="space-y-1.5">
                  <Label>Service *</Label>
                  <select
                    value={form.subCategory}
                    onChange={set("subCategory")}
                    className="w-full h-10 px-3 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring"
                    required
                    disabled={!form.category}
                  >
                    <option value="">Select service</option>
                    {subCategories.map(s => (
                      <option key={s} value={s}>{s}</option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="space-y-1.5">
                <Label>Full Address *</Label>
                <textarea
                  placeholder="12, MG Road, Bengaluru"
                  value={form.address}
                  onChange={set("address")}
                  required
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-1.5">
                  <Label>PIN Code *</Label>
                  <Input placeholder="560001" value={form.pinCode} onChange={set("pinCode")} maxLength={6} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Opening Time *</Label>
                  <Input type="time" value={form.openingTime} onChange={set("openingTime")} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Closing Time *</Label>
                  <Input type="time" value={form.closingTime} onChange={set("closingTime")} required />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <Label>Password *</Label>
                  <Input type="password" placeholder="Min 6 characters" value={form.password} onChange={set("password")} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Confirm Password *</Label>
                  <Input type="password" placeholder="Repeat password" value={form.confirm} onChange={set("confirm")} required />
                </div>
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11">
                Submit Registration
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-500">
              Already registered?{" "}
              <button onClick={() => navigate("/login")} className="text-blue-600 font-medium hover:underline">Login here</button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
