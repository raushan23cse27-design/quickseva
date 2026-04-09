import React, { useState, useEffect } from "react";
import { useLocation } from "wouter";
import { storage, Provider, SERVICE_CATEGORIES, isProviderOpen } from "@/lib/storage";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { MapPin, Star, Clock, Zap, Wrench, Droplets, Tv, Home as HomeIcon, Wind, Search, Shield, ThumbsUp, Users } from "lucide-react";

const categoryIcons: Record<string, React.ReactElement> = {
  "Electrical": <Zap className="w-6 h-6" />,
  "AC & Cooling": <Wind className="w-6 h-6" />,
  "Plumbing": <Droplets className="w-6 h-6" />,
  "Appliance Repair": <Tv className="w-6 h-6" />,
  "Home Services": <HomeIcon className="w-6 h-6" />,
};

const categoryColors: Record<string, string> = {
  "Electrical": "bg-yellow-100 text-yellow-700 border-yellow-200",
  "AC & Cooling": "bg-blue-100 text-blue-700 border-blue-200",
  "Plumbing": "bg-cyan-100 text-cyan-700 border-cyan-200",
  "Appliance Repair": "bg-purple-100 text-purple-700 border-purple-200",
  "Home Services": "bg-green-100 text-green-700 border-green-200",
};

export default function Home() {
  const [pinCode, setPinCode] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("");
  const [providers, setProviders] = useState<Provider[]>([]);
  const [filtered, setFiltered] = useState<Provider[]>([]);
  const [searched, setSearched] = useState(false);
  const [, navigate] = useLocation();

  useEffect(() => {
    const all = storage.getProviders().filter(p => p.status === "Approved");
    setProviders(all);
  }, []);

  const handleSearch = () => {
    if (!pinCode.trim() && !selectedCategory) {
      setFiltered(providers);
    } else {
      let results = providers;
      if (pinCode.trim()) results = results.filter(p => p.pinCode === pinCode.trim());
      if (selectedCategory) results = results.filter(p => p.category === selectedCategory);
      setFiltered(results);
    }
    setSearched(true);
  };

  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, i) => (
      <Star key={i} className={`w-4 h-4 ${i < Math.floor(rating) ? "fill-yellow-400 text-yellow-400" : "text-gray-300"}`} />
    ));
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-indigo-50">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-r from-blue-600 via-blue-700 to-indigo-800 text-white py-20 px-4">
        <div className="absolute inset-0 opacity-10">
          <div className="absolute inset-0" style={{ backgroundImage: "radial-gradient(circle at 20% 50%, white 1px, transparent 1px), radial-gradient(circle at 80% 50%, white 1px, transparent 1px)", backgroundSize: "40px 40px" }} />
        </div>
        <div className="max-w-4xl mx-auto text-center relative z-10">
          <div className="inline-flex items-center gap-2 bg-white/20 rounded-full px-4 py-2 text-sm mb-6 backdrop-blur-sm">
            <Shield className="w-4 h-4" />
            <span>Trusted by 10,000+ users across India</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4 leading-tight">
            Find Trusted Local Services
            <span className="text-blue-200 block">Near You</span>
          </h1>
          <p className="text-blue-100 text-lg mb-8 max-w-xl mx-auto">
            Connect with verified local service providers. Book instantly, track in real-time.
          </p>

          {/* Search Bar */}
          <div className="bg-white rounded-2xl p-4 shadow-2xl max-w-2xl mx-auto">
            <div className="flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-blue-500" />
                <Input
                  placeholder="Enter PIN code (e.g. 560001)"
                  value={pinCode}
                  onChange={e => setPinCode(e.target.value)}
                  onKeyDown={e => e.key === "Enter" && handleSearch()}
                  className="pl-10 border-0 bg-gray-50 text-gray-900 h-12 text-base focus-visible:ring-1"
                  maxLength={6}
                />
              </div>
              <select
                value={selectedCategory}
                onChange={e => setSelectedCategory(e.target.value)}
                className="h-12 px-3 rounded-lg border border-gray-200 bg-gray-50 text-gray-700 text-sm focus:outline-none focus:ring-1 focus:ring-blue-500"
              >
                <option value="">All Categories</option>
                {Object.keys(SERVICE_CATEGORIES).map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
              <Button onClick={handleSearch} className="h-12 px-6 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-xl gap-2">
                <Search className="w-4 h-4" />
                Find Services
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="bg-white border-b border-gray-100 py-6">
        <div className="max-w-5xl mx-auto px-4 grid grid-cols-3 gap-6 text-center">
          {[
            { icon: <Users className="w-5 h-5" />, label: "Active Providers", value: "500+" },
            { icon: <ThumbsUp className="w-5 h-5" />, label: "Happy Customers", value: "10K+" },
            { icon: <Shield className="w-5 h-5" />, label: "Verified Services", value: "50+" },
          ].map(stat => (
            <div key={stat.label} className="flex flex-col items-center gap-1">
              <div className="text-blue-600">{stat.icon}</div>
              <div className="text-2xl font-bold text-gray-900">{stat.value}</div>
              <div className="text-sm text-gray-500">{stat.label}</div>
            </div>
          ))}
        </div>
      </section>

      {/* Service Categories */}
      <section className="py-12 px-4 max-w-5xl mx-auto">
        <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">Browse by Category</h2>
        <p className="text-gray-500 text-center mb-8">Find the right expert for your needs</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4">
          {Object.entries(SERVICE_CATEGORIES).map(([cat, services]) => (
            <button
              key={cat}
              onClick={() => { setSelectedCategory(cat); setFiltered(providers.filter(p => p.category === cat)); setSearched(true); }}
              className={`p-4 rounded-xl border-2 transition-all hover:shadow-md hover:-translate-y-1 cursor-pointer text-center ${categoryColors[cat]} ${selectedCategory === cat ? "ring-2 ring-blue-500 ring-offset-1" : ""}`}
            >
              <div className="flex justify-center mb-2">{categoryIcons[cat]}</div>
              <div className="font-semibold text-sm">{cat}</div>
              <div className="text-xs opacity-70 mt-1">{services.length} services</div>
            </button>
          ))}
        </div>
      </section>

      {/* Search Results */}
      {searched && (
        <section className="pb-16 px-4 max-w-5xl mx-auto">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-bold text-gray-900">
              {filtered.length > 0 ? `${filtered.length} Provider${filtered.length !== 1 ? "s" : ""} Found` : "No Providers Found"}
            </h2>
            {filtered.length > 0 && (
              <Button variant="outline" size="sm" onClick={() => { setFiltered([]); setSearched(false); setPinCode(""); setSelectedCategory(""); }}>
                Clear
              </Button>
            )}
          </div>

          {filtered.length === 0 ? (
            <div className="text-center py-16 text-gray-500">
              <MapPin className="w-12 h-12 mx-auto mb-3 text-gray-300" />
              <p className="text-lg font-medium">No providers found</p>
              <p className="text-sm mt-1">Try a different PIN code or category</p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {filtered.map(provider => {
                const open = isProviderOpen(provider);
                return (
                  <Card key={provider.id} className="hover:shadow-lg transition-all hover:-translate-y-1 border-gray-200">
                    <CardHeader className="pb-3">
                      <div className="flex items-start justify-between">
                        <div>
                          <CardTitle className="text-base">{provider.shopName}</CardTitle>
                          <p className="text-sm text-gray-500 mt-0.5">{provider.ownerName}</p>
                        </div>
                        <Badge className={open ? "bg-green-100 text-green-700 border-green-200" : "bg-red-100 text-red-700 border-red-200"}>
                          {open ? "OPEN" : "CLOSED"}
                        </Badge>
                      </div>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium border ${categoryColors[provider.category]}`}>
                        {categoryIcons[provider.category]}
                        {provider.subCategory}
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <MapPin className="w-3.5 h-3.5 flex-shrink-0 text-gray-400" />
                        <span className="truncate">{provider.address}</span>
                      </div>

                      <div className="flex items-center gap-1.5 text-sm text-gray-600">
                        <Clock className="w-3.5 h-3.5 text-gray-400" />
                        <span>{provider.openingTime} – {provider.closingTime}</span>
                      </div>

                      <div className="flex items-center gap-1">
                        {renderStars(provider.rating)}
                        <span className="text-sm text-gray-600 ml-1">
                          {provider.rating > 0 ? `${provider.rating} (${provider.ratingCount})` : "New"}
                        </span>
                      </div>

                      <Button
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white mt-2"
                        onClick={() => navigate(`/book/${provider.id}`)}
                      >
                        Book Service
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* How it Works */}
      {!searched && (
        <section className="bg-white py-14 px-4">
          <div className="max-w-4xl mx-auto">
            <h2 className="text-2xl font-bold text-gray-900 mb-2 text-center">How QuickSeva Works</h2>
            <p className="text-gray-500 text-center mb-10">Get your service done in 3 simple steps</p>
            <div className="grid md:grid-cols-3 gap-8">
              {[
                { step: "1", title: "Enter PIN Code", desc: "Search providers in your locality by entering your area PIN code", icon: <MapPin className="w-7 h-7" /> },
                { step: "2", title: "Book a Provider", desc: "Choose from verified providers, check their ratings and availability", icon: <Wrench className="w-7 h-7" /> },
                { step: "3", title: "Get it Done", desc: "Provider comes to your doorstep. Rate after completion!", icon: <ThumbsUp className="w-7 h-7" /> },
              ].map(item => (
                <div key={item.step} className="text-center">
                  <div className="w-16 h-16 bg-blue-100 rounded-2xl flex items-center justify-center mx-auto mb-4 text-blue-600">
                    {item.icon}
                  </div>
                  <div className="text-xs font-bold text-blue-500 mb-1">STEP {item.step}</div>
                  <h3 className="font-semibold text-gray-900 mb-2">{item.title}</h3>
                  <p className="text-sm text-gray-500">{item.desc}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      )}
    </div>
  );
}
