import { Switch, Route, Router as WouterRouter } from "wouter";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AuthProvider } from "@/lib/auth-context";
import Navbar from "@/components/Navbar";
import Home from "@/pages/Home";
import Login from "@/pages/Login";
import Signup from "@/pages/Signup";
import ProviderSignup from "@/pages/ProviderSignup";
import BookService from "@/pages/BookService";
import UserDashboard from "@/pages/UserDashboard";
import ProviderDashboard from "@/pages/ProviderDashboard";
import AdminDashboard from "@/pages/AdminDashboard";
import NotFound from "@/pages/not-found";

const queryClient = new QueryClient();

function Router() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <Switch>
        <Route path="/" component={Home} />
        <Route path="/login" component={Login} />
        <Route path="/signup" component={Signup} />
        <Route path="/provider-signup" component={ProviderSignup} />
        <Route path="/book/:id" component={BookService} />
        <Route path="/dashboard" component={UserDashboard} />
        <Route path="/provider-dashboard" component={ProviderDashboard} />
        <Route path="/admin" component={AdminDashboard} />
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <AuthProvider>
          <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
            <Router />
          </WouterRouter>
        </AuthProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
