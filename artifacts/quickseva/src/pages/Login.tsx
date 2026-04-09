import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { AlertCircle, Zap } from "lucide-react";

export default function Login() {
  const [tab, setTab] = useState<"user" | "provider">("user");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login, loginProvider } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    setTimeout(() => {
      const result = tab === "user" ? login(email, password) : loginProvider(email, password);
      setLoading(false);
      if (result.success) {
        navigate(tab === "user" ? "/dashboard" : "/provider-dashboard");
      } else {
        setError(result.error || "Login failed");
      }
    }, 400);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold text-blue-600 mb-2">
            <Zap className="w-7 h-7" />
            QuickSeva
          </div>
          <p className="text-gray-500">Sign in to your account</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-4">
            <div className="flex rounded-lg bg-gray-100 p-1 gap-1">
              <button
                onClick={() => setTab("user")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === "user" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                User Login
              </button>
              <button
                onClick={() => setTab("provider")}
                className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === "provider" ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
              >
                Provider Login
              </button>
            </div>
          </CardHeader>

          <CardContent>
            {tab === "user" && (
              <p className="text-xs text-blue-600 bg-blue-50 rounded-lg p-2 mb-4 text-center">
                Admin: admin@quickseva.com / admin123
              </p>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input
                  type="email"
                  placeholder="you@example.com"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  required
                />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11" disabled={loading}>
                {loading ? "Signing in..." : "Sign In"}
              </Button>
            </form>

            <div className="mt-4 text-center text-sm text-gray-500">
              {tab === "user" ? (
                <>Don't have an account?{" "}
                  <button onClick={() => navigate("/signup")} className="text-blue-600 font-medium hover:underline">Sign up</button>
                </>
              ) : (
                <>Not a provider?{" "}
                  <button onClick={() => navigate("/provider-signup")} className="text-blue-600 font-medium hover:underline">Register your shop</button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
