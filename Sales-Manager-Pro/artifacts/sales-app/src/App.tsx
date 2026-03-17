import { Switch, Route, Router as WouterRouter, useLocation } from "wouter";
import { QueryClientProvider } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import { useEffect } from "react";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { queryClient } from "@/lib/queryClient";
import { AuthProvider, useAuth } from "@/hooks/use-auth";
import { AppLayout } from "@/components/layout/app-layout";
import { ThemeProvider } from "@/components/theme-provider";

import NotFound from "@/pages/not-found";
import Login from "@/pages/login";
import Dashboard from "@/pages/dashboard";
import POS from "@/pages/pos";
import Products from "@/pages/products";
import Customers from "@/pages/customers";
import Orders from "@/pages/orders";
import Inventory from "@/pages/inventory";
import Reports from "@/pages/reports";
import Expenses from "@/pages/expenses";
import Settings from "@/pages/settings";

function ProtectedRoute({ component: Component, adminOnly = false }: { component: any, adminOnly?: boolean }) {
  const { user, isLoading, isAdmin } = useAuth();
  const [location, setLocation] = useLocation();

  useEffect(() => {
    if (!isLoading && !user) {
      setLocation("/login");
    }
    if (!isLoading && user && adminOnly && !isAdmin) {
      setLocation("/");
    }
  }, [isLoading, user, adminOnly, isAdmin, setLocation]);

  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background text-primary">
        <Loader2 className="w-10 h-10 animate-spin" />
      </div>
    );
  }

  if (!user) return null;
  if (adminOnly && !isAdmin) return null;

  return <Component />;
}

function Router() {
  return (
    <Switch>
      <Route path="/login" component={Login} />

      <Route path="/pos">
        <AppLayout><ProtectedRoute component={POS} /></AppLayout>
      </Route>
      <Route path="/inventory">
        <AppLayout><ProtectedRoute component={Inventory} /></AppLayout>
      </Route>
      <Route path="/customers">
        <AppLayout><ProtectedRoute component={Customers} /></AppLayout>
      </Route>
      <Route path="/orders">
        <AppLayout><ProtectedRoute component={Orders} /></AppLayout>
      </Route>
      
      {/* Admin Only Routes */}
      <Route path="/products">
        <AppLayout><ProtectedRoute component={Products} adminOnly /></AppLayout>
      </Route>
      <Route path="/reports">
        <AppLayout><ProtectedRoute component={Reports} adminOnly /></AppLayout>
      </Route>
      <Route path="/expenses">
        <AppLayout><ProtectedRoute component={Expenses} adminOnly /></AppLayout>
      </Route>
      <Route path="/settings">
        <AppLayout><ProtectedRoute component={Settings} adminOnly /></AppLayout>
      </Route>

      <Route path="/">
        <AppLayout><ProtectedRoute component={Dashboard} /></AppLayout>
      </Route>
      
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <WouterRouter base={import.meta.env.BASE_URL.replace(/\/$/, "")}>
          <AuthProvider>
            <ThemeProvider>
              <Router />
            </ThemeProvider>
          </AuthProvider>
        </WouterRouter>
        <Toaster />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
