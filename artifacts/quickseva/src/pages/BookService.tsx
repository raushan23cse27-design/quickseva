import { useState, useEffect } from "react";
import { useLocation, useParams } from "wouter";
import { storage, Provider, isProviderOpen, formatTime } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Phone, CheckCircle2, AlertCircle, ArrowLeft } from "lucide-react";

export default function BookService() {
  const { id } = useParams<{ id: string }>();
  const [provider, setProvider] = useState<Provider | null>(null);
  const [address, setAddress] = useState("");
  const [problem, setProblem] = useState("");
  const [preferredTime, setPreferredTime] = useState("");
  const [userPhone, setUserPhone] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { user } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    const providers = storage.getProviders();
    const found = providers.find(p => p.id === id);
    setProvider(found || null);
    if (user) setUserPhone((user as any).phone || "");
  }, [id, user]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (!user) { navigate("/login"); return; }
    if (!provider) return;

    storage.createBooking({
      userId: user.id,
      userName: user.name,
      userPhone,
      providerId: provider.id,
      providerName: provider.ownerName,
      shopName: provider.shopName,
      category: provider.category,
      address,
      problemDescription: problem,
      preferredTime,
    });
    setSuccess(true);
    setTimeout(() => navigate("/dashboard"), 2000);
  };

  if (!provider) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500">Provider not found</p>
      </div>
    );
  }

  const open = isProviderOpen(provider);

  const renderStars = (rating: number) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
  ));

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Booking Sent!</h2>
          <p className="text-gray-500 mt-2">Your request has been sent to {provider.shopName}. Redirecting...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-2xl mx-auto">
        <button onClick={() => navigate(-1 as any)} className="flex items-center gap-2 text-gray-500 hover:text-gray-700 mb-6 text-sm">
          <ArrowLeft className="w-4 h-4" />
          Back to results
        </button>

        {/* Provider Info Card */}
        <Card className="mb-6 border-0 shadow-md">
          <CardContent className="pt-5">
            <div className="flex items-start justify-between">
              <div>
                <h2 className="text-xl font-bold text-gray-900">{provider.shopName}</h2>
                <p className="text-gray-500">{provider.ownerName}</p>
              </div>
              <Badge className={open ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                {open ? "OPEN" : "CLOSED"}
              </Badge>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-3 text-sm text-gray-600">
              <div className="flex items-center gap-2">
                <MapPin className="w-4 h-4 text-gray-400" />
                <span>{provider.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Phone className="w-4 h-4 text-gray-400" />
                <span>{provider.phone}</span>
              </div>
              <div className="flex items-center gap-2">
                <Clock className="w-4 h-4 text-gray-400" />
                <span>{formatTime(provider.openingTime)} – {formatTime(provider.closingTime)}</span>
              </div>
              <div className="flex items-center gap-1">
                {renderStars(provider.rating)}
                <span className="ml-1">{provider.rating > 0 ? `${provider.rating} (${provider.ratingCount})` : "New"}</span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Booking Form */}
        <Card className="border-0 shadow-md">
          <CardHeader>
            <CardTitle>Book This Service</CardTitle>
          </CardHeader>
          <CardContent>
            {!user && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4 text-sm text-yellow-800">
                Please <button onClick={() => navigate("/login")} className="font-semibold underline">login</button> to book a service.
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Your Phone Number *</Label>
                <Input
                  placeholder="9876543210"
                  value={userPhone}
                  onChange={e => setUserPhone(e.target.value)}
                  required
                />
              </div>

              <div className="space-y-1.5">
                <Label>Service Address *</Label>
                <textarea
                  placeholder="Full address where service is needed"
                  value={address}
                  onChange={e => setAddress(e.target.value)}
                  required
                  rows={2}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Problem Description *</Label>
                <textarea
                  placeholder="Describe the issue in detail..."
                  value={problem}
                  onChange={e => setProblem(e.target.value)}
                  required
                  rows={3}
                  className="w-full px-3 py-2 rounded-md border border-input bg-background text-sm focus:outline-none focus:ring-2 focus:ring-ring resize-none"
                />
              </div>

              <div className="space-y-1.5">
                <Label>Preferred Time *</Label>
                <Input
                  type="datetime-local"
                  value={preferredTime}
                  onChange={e => setPreferredTime(e.target.value)}
                  required
                  min={new Date().toISOString().slice(0, 16)}
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4" />
                  {error}
                </div>
              )}

              <Button
                type="submit"
                className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11"
                disabled={!user}
              >
                Send Booking Request
              </Button>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
