import { useLocation } from "wouter";
import { useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Zap, LogOut, User, LayoutDashboard, ShieldCheck } from "lucide-react";

export default function Navbar() {
  const { user, provider, logout, isAdmin, isProvider, isUser } = useAuth();
  const [location, navigate] = useLocation();

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  const navLink = (href: string, label: string) => (
    <button
      onClick={() => navigate(href)}
      className={`text-sm font-medium transition-colors hover:text-blue-600 ${location === href ? "text-blue-600" : "text-gray-600"}`}
    >
      {label}
    </button>
  );

  return (
    <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
        {/* Logo */}
        <button
          onClick={() => navigate("/")}
          className="flex items-center gap-2 font-bold text-xl text-blue-600 hover:text-blue-700 transition-colors"
        >
          <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
            <Zap className="w-5 h-5 text-white" />
          </div>
          QuickSeva
        </button>

        {/* Nav Links */}
        <div className="hidden sm:flex items-center gap-6">
          {navLink("/", "Home")}
          {!isProvider && navLink("/", "Services")}
        </div>

        {/* Auth Actions */}
        <div className="flex items-center gap-3">
          {!user && !provider ? (
            <>
              <Button variant="ghost" size="sm" onClick={() => navigate("/login")} className="text-gray-600">
                Login
              </Button>
              <Button size="sm" onClick={() => navigate("/signup")} className="bg-blue-600 hover:bg-blue-700 text-white">
                Sign Up
              </Button>
            </>
          ) : (
            <>
              {isAdmin && (
                <Button variant="ghost" size="sm" onClick={() => navigate("/admin")} className="gap-1.5 text-gray-700">
                  <ShieldCheck className="w-4 h-4" />
                  <span className="hidden sm:inline">Admin</span>
                </Button>
              )}
              {isUser && !isAdmin && (
                <Button variant="ghost" size="sm" onClick={() => navigate("/dashboard")} className="gap-1.5 text-gray-700">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              )}
              {isProvider && (
                <Button variant="ghost" size="sm" onClick={() => navigate("/provider-dashboard")} className="gap-1.5 text-gray-700">
                  <LayoutDashboard className="w-4 h-4" />
                  <span className="hidden sm:inline">Dashboard</span>
                </Button>
              )}
              <div className="flex items-center gap-2 text-sm text-gray-600">
                <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                  <User className="w-4 h-4 text-blue-600" />
                </div>
                <span className="hidden sm:inline font-medium">
                  {isAdmin ? "Admin" : isProvider ? provider?.ownerName : user?.name}
                </span>
              </div>
              <Button variant="ghost" size="sm" onClick={handleLogout} className="gap-1.5 text-gray-500 hover:text-red-600">
                <LogOut className="w-4 h-4" />
              </Button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
}
