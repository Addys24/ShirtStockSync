import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { AuthProvider } from "@/hooks/use-auth";
import NotFound from "@/pages/not-found";
import AuthPage from "@/pages/auth-page";
import AdminDashboard from "@/pages/admin/dashboard";
import ShopkeeperDashboard from "@/pages/shopkeeper/dashboard";
import { Sidebar } from "@/components/layout/sidebar";
import { ProtectedRoute } from "./lib/protected-route";
import { useAuth } from "@/hooks/use-auth";

function DashboardWrapper() {
  const { user } = useAuth();
  return user?.role === "admin" ? <AdminDashboard /> : <ShopkeeperDashboard />;
}

function Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen">
      <Sidebar className="w-64" />
      <main className="flex-1 bg-background">{children}</main>
    </div>
  );
}

function Router() {
  return (
    <Switch>
      <Route path="/auth" component={AuthPage} />
      <ProtectedRoute
        path="/"
        component={() => (
          <Layout>
            <DashboardWrapper />
          </Layout>
        )}
      />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <Router />
        <Toaster />
      </AuthProvider>
    </QueryClientProvider>
  );
}

export default App;
