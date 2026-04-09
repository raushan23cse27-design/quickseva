import { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { storage, Booking } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Star, Clock, MapPin, Package, CheckCircle } from "lucide-react";

const STATUS_COLORS: Record<string, string> = {
  "Request Sent": "bg-blue-100 text-blue-700",
  "Accepted": "bg-green-100 text-green-700",
  "On the Way": "bg-yellow-100 text-yellow-700",
  "Work in Progress": "bg-orange-100 text-orange-700",
  "Completed": "bg-gray-100 text-gray-700",
  "Rejected": "bg-red-100 text-red-700",
};

const STATUS_STEPS = ["Request Sent", "Accepted", "On the Way", "Work in Progress", "Completed"];

export default function UserDashboard() {
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [ratingBookingId, setRatingBookingId] = useState<string | null>(null);
  const [hoverRating, setHoverRating] = useState(0);
  const { user, isAdmin } = useAuth();
  const [, navigate] = useLocation();

  useEffect(() => {
    if (!user) { navigate("/login"); return; }
    if (isAdmin) { navigate("/admin"); return; }
    loadBookings();
  }, [user]);

  const loadBookings = () => {
    if (!user) return;
    const all = storage.getBookings().filter(b => b.userId === user.id);
    setBookings(all.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()));
  };

  const handleRate = (bookingId: string, rating: number) => {
    storage.rateBooking(bookingId, rating);
    setRatingBookingId(null);
    loadBookings();
  };

  const formatDate = (iso: string) => new Date(iso).toLocaleDateString("en-IN", {
    day: "numeric", month: "short", year: "numeric", hour: "2-digit", minute: "2-digit"
  });

  return (
    <div className="min-h-screen bg-gray-50 py-10 px-4">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">My Bookings</h1>
            <p className="text-gray-500 mt-1">Track all your service requests</p>
          </div>
          <Button onClick={() => navigate("/")} className="bg-blue-600 hover:bg-blue-700 text-white">
            Book New Service
          </Button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: "Total Bookings", value: bookings.length, icon: <Package className="w-5 h-5" /> },
            { label: "Completed", value: bookings.filter(b => b.status === "Completed").length, icon: <CheckCircle className="w-5 h-5" /> },
            { label: "Active", value: bookings.filter(b => !["Completed", "Rejected"].includes(b.status)).length, icon: <Clock className="w-5 h-5" /> },
          ].map(stat => (
            <Card key={stat.label} className="border-0 shadow-sm">
              <CardContent className="pt-5 text-center">
                <div className="text-blue-600 flex justify-center mb-2">{stat.icon}</div>
                <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
                <div className="text-xs text-gray-500 mt-1">{stat.label}</div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Bookings */}
        {bookings.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Package className="w-12 h-12 mx-auto mb-3 text-gray-300" />
            <p className="text-lg font-medium">No bookings yet</p>
            <p className="text-sm mt-1">Book a service to get started</p>
            <Button onClick={() => navigate("/")} className="mt-4 bg-blue-600 hover:bg-blue-700 text-white">
              Find Services
            </Button>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map(booking => {
              const stepIndex = STATUS_STEPS.indexOf(booking.status);
              const progress = booking.status === "Rejected" ? -1 : stepIndex;
              const canRate = booking.status === "Completed" && !booking.rating;

              return (
                <Card key={booking.id} className="border-0 shadow-sm overflow-hidden">
                  <CardHeader className="pb-3 bg-white">
                    <div className="flex items-start justify-between">
                      <div>
                        <CardTitle className="text-base">{booking.shopName}</CardTitle>
                        <p className="text-sm text-gray-500 mt-0.5">{booking.category}</p>
                      </div>
                      <Badge className={STATUS_COLORS[booking.status] || "bg-gray-100 text-gray-700"}>
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
                      <strong>Issue:</strong> {booking.problemDescription}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-gray-500">
                      <Clock className="w-3.5 h-3.5" />
                      Booked on {formatDate(booking.createdAt)}
                    </div>

                    {/* Progress bar */}
                    {booking.status !== "Rejected" && (
                      <div className="pt-2">
                        <div className="flex justify-between mb-2">
                          {STATUS_STEPS.map((step, i) => (
                            <div key={step} className="flex flex-col items-center" style={{ width: `${100 / STATUS_STEPS.length}%` }}>
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center text-xs font-bold transition-colors ${i <= progress ? "bg-blue-600 text-white" : "bg-gray-200 text-gray-400"}`}>
                                {i < progress ? "✓" : i + 1}
                              </div>
                              <span className="text-xs text-gray-400 text-center mt-1 leading-tight hidden sm:block">{step}</span>
                            </div>
                          ))}
                        </div>
                        <div className="h-1.5 bg-gray-100 rounded-full">
                          <div
                            className="h-full bg-blue-600 rounded-full transition-all"
                            style={{ width: `${progress >= 0 ? (progress / (STATUS_STEPS.length - 1)) * 100 : 0}%` }}
                          />
                        </div>
                      </div>
                    )}

                    {/* Rating */}
                    {canRate && (
                      <div className="pt-2">
                        {ratingBookingId === booking.id ? (
                          <div className="bg-yellow-50 rounded-lg p-3">
                            <p className="text-sm font-medium text-gray-700 mb-2">Rate your experience:</p>
                            <div className="flex gap-1 mb-3">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`w-8 h-8 cursor-pointer transition-colors ${star <= hoverRating ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`}
                                  onMouseEnter={() => setHoverRating(star)}
                                  onMouseLeave={() => setHoverRating(0)}
                                  onClick={() => handleRate(booking.id, star)}
                                />
                              ))}
                            </div>
                            <button onClick={() => setRatingBookingId(null)} className="text-sm text-gray-500 hover:text-gray-700">Cancel</button>
                          </div>
                        ) : (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => setRatingBookingId(booking.id)}
                            className="gap-2 border-yellow-300 text-yellow-700 hover:bg-yellow-50"
                          >
                            <Star className="w-4 h-4" />
                            Rate Service
                          </Button>
                        )}
                      </div>
                    )}

                    {booking.rating && (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <span>Your rating:</span>
                        {Array.from({ length: 5 }, (_, i) => (
                          <Star key={i} className={`w-4 h-4 ${i < (booking.rating || 0) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
                        ))}
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
