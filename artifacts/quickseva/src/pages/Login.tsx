import { useState } from "react";
import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { api } from "@/lib/api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertCircle, Zap, KeyRound, Mail, RefreshCw, CheckCircle2 } from "lucide-react";

type LoginTab = "user" | "provider" | "otp";

export default function Login() {
  const [tab, setTab] = useState<LoginTab>("user");

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const [otpEmail, setOtpEmail] = useState("");
  const [otpSent, setOtpSent] = useState(false);
  const [otpValue, setOtpValue] = useState("");
  const [otpDisplay, setOtpDisplay] = useState("");

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login, loginProvider, loginDirect } = useAuth();
  const [, navigate] = useLocation();

  const handlePasswordLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const result = tab === "user"
      ? await login(email, password)
      : await loginProvider(email, password);
    setLoading(false);
    if (result.success) {
      if (tab === "user" && email === "admin@quickseva.com") navigate("/admin");
      else navigate(tab === "user" ? "/dashboard" : "/provider-dashboard");
    } else {
      setError(result.error || "Login failed");
    }
  };

  const handleRequestOtp = async () => {
    if (!otpEmail.trim()) { setError("Email likhein"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await api.requestOtp(otpEmail.trim());
      setOtpDisplay(res.otp);
      setOtpSent(true);
    } catch (e: any) {
      setError(e.message || "OTP generate nahi hua");
    } finally {
      setLoading(false);
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!otpValue.trim()) { setError("OTP enter karein"); return; }
    setError("");
    setLoading(true);
    try {
      const res = await api.verifyOtp(otpEmail.trim(), otpValue.trim());
      loginDirect(res.user);
      navigate("/dashboard");
    } catch (e: any) {
      setError(e.message || "Invalid OTP");
    } finally {
      setLoading(false);
    }
  };

  const tabBtn = (t: LoginTab, label: string) => (
    <button
      onClick={() => { setTab(t); setError(""); }}
      className={`flex-1 py-2 rounded-md text-sm font-medium transition-all ${tab === t ? "bg-white shadow text-blue-600" : "text-gray-500 hover:text-gray-700"}`}
    >
      {label}
    </button>
  );

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
              {tabBtn("user", "User")}
              {tabBtn("provider", "Provider")}
              {tabBtn("otp", "OTP Login")}
            </div>
          </CardHeader>

          <CardContent>
            {(tab === "user" || tab === "provider") && (
              <form onSubmit={handlePasswordLogin} className="space-y-4">
                <div className="space-y-1.5">
                  <Label>Email</Label>
                  <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
                </div>
                <div className="space-y-1.5">
                  <Label>Password</Label>
                  <Input type="password" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} required />
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
            )}

            {tab === "otp" && (
              <div className="space-y-4">
                <div className="bg-blue-50 border border-blue-100 rounded-lg p-3 text-sm text-blue-800 flex items-start gap-2">
                  <KeyRound className="w-4 h-4 mt-0.5 flex-shrink-0" />
                  <span>Password yaad nahi? Registered email se OTP se login karein.</span>
                </div>

                {!otpSent ? (
                  <div className="space-y-3">
                    <div className="space-y-1.5">
                      <Label>Registered Email</Label>
                      <div className="flex gap-2">
                        <Input
                          type="email"
                          placeholder="you@example.com"
                          value={otpEmail}
                          onChange={e => setOtpEmail(e.target.value)}
                          onKeyDown={e => e.key === "Enter" && handleRequestOtp()}
                        />
                        <Button onClick={handleRequestOtp} disabled={loading} className="bg-blue-600 hover:bg-blue-700 text-white px-4 whitespace-nowrap">
                          {loading ? <RefreshCw className="w-4 h-4 animate-spin" /> : "Get OTP"}
                        </Button>
                      </div>
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </div>
                    )}
                  </div>
                ) : (
                  <form onSubmit={handleVerifyOtp} className="space-y-4">
                    <div className="bg-green-50 border border-green-200 rounded-xl p-4 text-center">
                      <CheckCircle2 className="w-8 h-8 text-green-500 mx-auto mb-2" />
                      <p className="text-sm text-green-800 font-medium mb-1">OTP Generated!</p>
                      <p className="text-xs text-green-700 mb-3">Email service configured nahi hai — yeh OTP use karein:</p>
                      <div className="bg-white border-2 border-green-300 rounded-lg py-3 px-4 inline-block">
                        <span className="text-3xl font-mono font-bold tracking-widest text-gray-900">{otpDisplay}</span>
                      </div>
                      <p className="text-xs text-gray-500 mt-2">5 minutes mein expire hoga</p>
                    </div>

                    <div className="space-y-1.5">
                      <Label>Enter OTP</Label>
                      <Input
                        placeholder="6-digit OTP"
                        value={otpValue}
                        onChange={e => setOtpValue(e.target.value.replace(/\D/g, "").slice(0, 6))}
                        maxLength={6}
                        className="font-mono text-center text-xl tracking-widest h-12"
                        autoFocus
                      />
                    </div>

                    {error && (
                      <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {error}
                      </div>
                    )}

                    <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11" disabled={loading}>
                      {loading ? "Verifying..." : "Verify & Login"}
                    </Button>
                    <button
                      type="button"
                      onClick={() => { setOtpSent(false); setOtpValue(""); setOtpDisplay(""); setError(""); }}
                      className="w-full text-sm text-gray-500 hover:text-gray-700"
                    >
                      Different email try karein
                    </button>
                  </form>
                )}
              </div>
            )}

            <div className="mt-5 text-center text-sm text-gray-500">
              {tab === "user" && (
                <>Don't have an account?{" "}
                  <button onClick={() => navigate("/signup")} className="text-blue-600 font-medium hover:underline">Sign up</button>
                </>
              )}
              {tab === "provider" && (
                <>Not a provider?{" "}
                  <button onClick={() => navigate("/provider-signup")} className="text-blue-600 font-medium hover:underline">Register your shop</button>
                </>
              )}
              {tab === "otp" && (
                <>New user?{" "}
                  <button onClick={() => navigate("/signup")} className="text-blue-600 font-medium hover:underline">Sign up here</button>
                </>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
