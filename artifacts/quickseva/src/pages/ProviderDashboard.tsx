import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { storage, Booking } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin, IndianRupee, Briefcase, TrendingUp, AlertTriangle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  "Request Sent": "bg-blue-100 text-blue-700",
  "Accepted": "bg-green-100 text-green-700",
  "On the Way": "bg-yellow-100 text-yellow-700",
  "Work in Progress": "bg-orange-100 text-orange-700",
  "Completed": "bg-gray-100 text-gray-600",
  "Rejected": "bg-red-100 text-red-700",
};

type BookingStatus = Booking["status"];

export default function ProviderDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [amount, setAmount] = useState<Record<string, string>>({});
  const { provider, isProvider, refreshProvider } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!isProvider) { navigate("/login"); return; }
    loadBookings();
  }, [isProvider]);

  const loadBookings = () => {
    if (!provider) return;
    const all = storage.getBookings().filter(b => b.providerId === provider.id);
    setBookings(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const updateStatus = (bookingId: string, status: BookingStatus) => {
    const earning = parseFloat(amount[bookingId] || "500");
    storage.updateBookingStatus(bookingId, status, status === "Completed" ? earning : undefined);
    refreshProvider();
    loadBookings();
  };

  const nextStatus: Record<string, BookingStatus> = {
    "Request Sent": "Accepted",
    "Accepted": "On the Way",
    "On the Way": "Work in Progress",
    "Work in Progress": "Completed",
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", hour: "2-digit", minute: "2-digit"
  });

  const freshProvider = provider ? (storage.getProviders().find(p => p.id === provider.id) || provider) : null;

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-2xl font-bold text-gray-900">Provider Dashboard</h1>
          <p className="text-gray-500 mt-1">{freshProvider?.shopName}</p>
          {freshProvider?.status === "Pending" && (
            <div className="mt-3 flex items-center gap-2 bg-yellow-50 border border-yellow-200 rounded-lg p-3 text-yellow-800 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Your account is pending admin approval. Bookings will appear once approved.
            </div>
          )}
          {freshProvider?.status === "Rejected" && (
            <div className="mt-3 flex items-center gap-2 bg-red-50 border border-red-200 rounded-lg p-3 text-red-800 text-sm">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              Your account has been rejected. Please contact support.
            </div>
          )}
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
          {[
            { label: "Total Jobs", value: freshProvider?.jobsDone || 0, icon: <Briefcase className="w-5 h-5" />, color: "text-blue-600" },
            { label: "Total Earnings", value: `₹${(freshProvider?.earnings || 0).toLocaleString("en-IN")}`, icon: <IndianRupee className="w-5 h-5" />, color: "text-green-600" },
            { label: "Rating", value: freshProvider?.rating ? `${freshProvider.rating}⭐` : "N/A", icon: <Star className="w-5 h-5" />, color: "text-yellow-600" },
            { label: "Active Jobs", value: bookings.filter(b => !["Completed", "Rejected"].includes(b.status)).length, icon: <TrendingUp className="w-5 h-5" />, color: "text-purple-600" },
          ].map(stat => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="pt-5 text-center">
                <div className={`${stat.color} flex justify-center mb-2`}>{stat.icon}</div>
                <div className="text-xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bookings */}
        <h2 className="text-lg font-semibold text-gray-900 mb-4">Incoming Requests ({bookings.length})</h2>

        {bookings.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Briefcase className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No bookings yet</p>
            <p className="text-sm mt-1">Customers will appear here once they book your service</p>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => {
              const next = nextStatus[booking.status];
              const isCompleted = booking.status === "Completed";
              const isRejected = booking.status === "Rejected";

              return (
                <Card key={booking.id} className="border-0 shadow-sm">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{booking.userName}</CardTitle>
                        <p className="text-sm text-gray-500">{booking.userPhone}</p>
                      </div>
                      <Badge className={STATUS_COLORS[booking.status] || ""}>
                        {booking.status}
                      </Badge>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex items-start gap-2 text-sm text-gray-600">
                      <MapPin className="w-4 h-4 flex-shrink-0 mt-0.5 text-gray-400" />
                      <span>{booking.address}</span>
                    </div>
                    <div className="text-sm text-gray-600">
                      <strong>Problem:</strong> {booking.problemDescription}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      Preferred: {new Date(booking.preferredTime).toLocaleString("en-IN")}
                    </div>
                    <div className="text-xs text-gray-400">
                      Booked: {formatDate(booking.createdAt)}
                    </div>

                    {booking.rating && (
                      <div className="flex items-center gap-1 text-sm text-yellow-600">
                        Customer rated: {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < (booking.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                        ))}
                      </div>
                    )}

                    {booking.amount && (
                      <div className="text-sm font-medium text-green-700">
                        Earned: ₹{booking.amount.toLocaleString("en-IN")}
                      </div>
                    )}

                    {!isCompleted && !isRejected && (
                      <div className="flex gap-2 pt-1 flex-wrap">
                        {booking.status === "Request Sent" && (
                          <Button
                            variant="outline"
                            size="sm"
                            className="text-red-600 border-red-200 hover:bg-red-50"
                            onClick={() => updateStatus(booking.id, "Rejected")}
                          >
                            Reject
                          </Button>
                        )}
                        {booking.status === "Work in Progress" && (
                          <div className="flex items-center gap-2">
                            <span className="text-sm text-gray-600">Amount (₹):</span>
                            <input
                              type="number"
                              value={amount[booking.id] || "500"}
                              onChange={e => setAmount(a => ({ ...a, [booking.id]: e.target.value }))}
                              className="w-24 h-8 px-2 text-sm border border-gray-200 rounded-md"
                              min="0"
                            />
                          </div>
                        )}
                        {next && (
                          <Button
                            size="sm"
                            className="bg-blue-600 hover:bg-blue-700 text-white"
                            onClick={() => updateStatus(booking.id, next)}
                          >
                            Mark as {next}
                          </Button>
                        )}
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
