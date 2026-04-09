import { useState } from "react";
import { useLocation } from "wouter";
import { storage } from "@/lib/storage";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { AlertCircle, CheckCircle2, Zap } from "lucide-react";

export default function Signup() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState(false);
  const { login } = useAuth();
  const [, navigate] = useLocation();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) { setError("Passwords do not match"); return; }
    if (password.length < 6) { setError("Password must be at least 6 characters"); return; }

    const result = storage.registerUser({ name, email, phone, password });
    if (!result.success) { setError(result.error || "Registration failed"); return; }

    login(email, password);
    setSuccess(true);
    setTimeout(() => navigate("/dashboard"), 1500);
  };

  if (success) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center">
        <div className="text-center">
          <CheckCircle2 className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-gray-900">Account Created!</h2>
          <p className="text-gray-500 mt-2">Redirecting to dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 text-2xl font-bold text-blue-600 mb-2">
            <Zap className="w-7 h-7" />
            QuickSeva
          </div>
          <p className="text-gray-500">Create your account</p>
        </div>

        <Card className="shadow-xl border-0">
          <CardHeader className="pb-2">
            <h2 className="text-lg font-semibold text-center">User Registration</h2>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label>Full Name</Label>
                <Input placeholder="Rahul Sharma" value={name} onChange={e => setName(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Email</Label>
                <Input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Phone Number</Label>
                <Input placeholder="9876543210" value={phone} onChange={e => setPhone(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Password</Label>
                <Input type="password" placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)} required />
              </div>
              <div className="space-y-1.5">
                <Label>Confirm Password</Label>
                <Input type="password" placeholder="Repeat password" value={confirm} onChange={e => setConfirm(e.target.value)} required />
              </div>

              {error && (
                <div className="flex items-center gap-2 text-red-600 text-sm bg-red-50 p-3 rounded-lg">
                  <AlertCircle className="w-4 h-4 flex-shrink-0" />
                  {error}
                </div>
              )}

              <Button type="submit" className="w-full bg-blue-600 hover:bg-blue-700 text-white h-11">
                Create Account
              </Button>
            </form>

            <p className="mt-4 text-center text-sm text-gray-500">
              Already have an account?{" "}
              <button onClick={() => navigate("/login")} className="text-blue-600 font-medium hover:underline">Sign in</button>
            </p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
