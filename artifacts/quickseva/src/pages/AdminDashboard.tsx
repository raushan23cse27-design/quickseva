import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { storage, Provider, Booking } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, MapPin, Clock, Users, CheckCircle, XCircle, Package, ShieldCheck } from "lucide-react";

export default function AdminDashboard() {
  const [providers, setProviders] = useState<Provider[]>([]);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [tab, setTab] = useState<"providers" | "bookings">("providers");
  const { isAdmin } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isAdmin) { navigate("/login"); return; }
    loadData();
  }, [isAdmin]);

  const loadData = () => {
    setProviders(storage.getProviders());
    setBookings(storage.getBookings());
  };

  const approve = (id: string) => { storage.approveProvider(id); loadData(); };
  const reject = (id: string) => { storage.rejectProvider(id); loadData(); };

  const pending = providers.filter(p => p.status === "Pending");
  const approved = providers.filter(p => p.status === "Approved");
  const rejected = providers.filter(p => p.status === "Rejected");

  const renderStars = (rating: number) => Array.from({ length: 5 }, (_, i) => (
    <Star key={i} className={`w-3.5 h-3.5 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
  ));

  const statusColor: Record<string, string> = {
    "Pending": "bg-yellow-100 text-yellow-700",
    "Approved": "bg-green-100 text-green-700",
    "Rejected": "bg-red-100 text-red-700",
  };

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-5xl mx-auto">
        <div className="mb-8 flex items-center gap-3">
          <ShieldCheck className="w-8 h-8 text-blue-600" />
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-500 mt-0.5">Manage providers and monitor platform</p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Providers", value: providers.length, icon: <Users className="w-5 h-5" />, color: "text-blue-600" },
            { label: "Approved", value: approved.length, icon: <CheckCircle className="w-5 h-5" />, color: "text-green-600" },
            { label: "Pending", value: pending.length, icon: <Clock className="w-5 h-5" />, color: "text-yellow-600" },
            { label: "Total Bookings", value: bookings.length, icon: <Package className="w-5 h-5" />, color: "text-purple-600" },
          ].map(stat => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="pt-5 text-center">
                <div className={`${stat.color} flex justify-center mb-2`}>{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 bg-gray-100 rounded-lg p-1 mb-6 w-fit">
          <button
            onClick={() => setTab("providers")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === "providers" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            Providers ({providers.length})
          </button>
          <button
            onClick={() => setTab("bookings")}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${tab === "bookings" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
          >
            Bookings ({bookings.length})
          </button>
        </div>

        {tab === "providers" && (
          <div className="space-y-6">
            {/* Pending */}
            {pending.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-yellow-700 mb-3 flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  Pending Approval ({pending.length})
                </h2>
                <div className="grid sm:grid-cols-2 gap-4">
                  {pending.map(provider => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      statusColor={statusColor}
                      renderStars={renderStars}
                      onApprove={() => approve(provider.id)}
                      onReject={() => reject(provider.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Approved */}
            {approved.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-green-700 mb-3 flex items-center gap-2">
                  <CheckCircle className="w-4 h-4" />
                  Approved Providers ({approved.length})
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {approved.map(provider => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      statusColor={statusColor}
                      renderStars={renderStars}
                    />
                  ))}
                </div>
              </div>
            )}

            {/* Rejected */}
            {rejected.length > 0 && (
              <div>
                <h2 className="text-base font-semibold text-red-700 mb-3 flex items-center gap-2">
                  <XCircle className="w-4 h-4" />
                  Rejected ({rejected.length})
                </h2>
                <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
                  {rejected.map(provider => (
                    <ProviderCard
                      key={provider.id}
                      provider={provider}
                      statusColor={statusColor}
                      renderStars={renderStars}
                      onApprove={() => approve(provider.id)}
                    />
                  ))}
                </div>
              </div>
            )}

            {providers.length === 0 && (
              <div className="text-center py-16 text-gray-500">
                <Users className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No providers registered yet</p>
              </div>
            )}
          </div>
        )}

        {tab === "bookings" && (
          <div className="space-y-3">
            {bookings.length === 0 ? (
              <div className="text-center py-16 text-gray-500">
                <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
                <p>No bookings yet</p>
              </div>
            ) : (
              bookings.map(b => (
                <Card key={b.id} className="border-0 shadow-sm">
                  <CardContent className="pt-4 pb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="font-medium text-gray-900">{b.userName} → {b.shopName}</p>
                        <p className="text-sm text-gray-500">{b.category} · {b.problemDescription.slice(0, 60)}...</p>
                        <p className="text-xs text-gray-400 mt-1">{new Date(b.createdAt).toLocaleString("en-IN")}</p>
                      </div>
                      <Badge className={
                        b.status === "Completed" ? "bg-gray-100 text-gray-600" :
                        b.status === "Rejected" ? "bg-red-100 text-red-700" :
                        b.status === "Accepted" ? "bg-green-100 text-green-700" :
                        "bg-blue-100 text-blue-700"
                      }>{b.status}</Badge>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
}

function ProviderCard({
  provider,
  statusColor,
  renderStars,
  onApprove,
  onReject,
}: {
  provider: Provider;
  statusColor: Record<string, string>;
  renderStars: (r: number) => JSX.Element[];
  onApprove?: () => void;
  onReject?: () => void;
}) {
  return (
    <Card className="border-0 shadow-sm">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="text-base">{provider.shopName}</CardTitle>
            <p className="text-sm text-gray-500">{provider.ownerName}</p>
          </div>
          <Badge className={statusColor[provider.status]}>{provider.status}</Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-2">
        <div className="text-xs text-gray-500 space-y-1">
          <div className="flex items-center gap-1.5">
            <MapPin className="w-3 h-3" />
            {provider.address} · PIN {provider.pinCode}
          </div>
          <div className="flex items-center gap-1.5">
            <Clock className="w-3 h-3" />
            {provider.openingTime} – {provider.closingTime}
          </div>
          <div>Category: <span className="font-medium">{provider.subCategory}</span></div>
          <div>Phone: {provider.phone}</div>
          <div>Email: {provider.email}</div>
          {provider.rating > 0 && (
            <div className="flex items-center gap-1">
              {renderStars(provider.rating)}
              <span>{provider.rating} ({provider.ratingCount} reviews)</span>
            </div>
          )}
          <div>Jobs Done: {provider.jobsDone} · Earnings: ₹{provider.earnings.toLocaleString("en-IN")}</div>
        </div>

        {(onApprove || onReject) && (
          <div className="flex gap-2 pt-2">
            {onApprove && (
              <Button size="sm" className="flex-1 bg-green-600 hover:bg-green-700 text-white gap-1" onClick={onApprove}>
                <CheckCircle className="w-3.5 h-3.5" />
                Approve
              </Button>
            )}
            {onReject && (
              <Button size="sm" variant="outline" className="flex-1 text-red-600 border-red-200 hover:bg-red-50 gap-1" onClick={onReject}>
                <XCircle className="w-3.5 h-3.5" />
                Reject
              </Button>
            )}
          </div>
        )}
      </CardContent>
    </Card>
  );
}
