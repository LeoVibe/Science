import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import Index from "./pages/Index";
import Maintenance from "./pages/Maintenance";
import NotFound from "./pages/NotFound";
import AdminLogin from "./pages/AdminLogin";
import AdminDashboard from "./pages/AdminDashboard";
import RequireAdminAuth from "./components/admin/RequireAdminAuth";
import ErrorBoundary from "./components/ErrorBoundary";

const queryClient = new QueryClient();

const MaintenanceGuard = ({ children }: { children: React.ReactNode }) => {
  const status = localStorage.getItem('SITE_STATUS');
  if (status === 'Maintenance') {
    return <Navigate to="/maintenance" replace />;
  }
  return <>{children}</>;
};

const App = () => (
  <QueryClientProvider client={queryClient}>
    <TooltipProvider>
      <Toaster />
      <Sonner />
      <ErrorBoundary>
        <BrowserRouter basename={import.meta.env.BASE_URL}>
          <Routes>
            <Route path="/admin/login" element={<AdminLogin />} />
            <Route path="/admin/:tab/*" element={<RequireAdminAuth><AdminDashboard /></RequireAdminAuth>} />
            <Route path="/admin/:tab" element={<RequireAdminAuth><AdminDashboard /></RequireAdminAuth>} />
            <Route path="/admin" element={<RequireAdminAuth><AdminDashboard /></RequireAdminAuth>} />
            <Route path="/maintenance" element={<Maintenance />} />

            <Route path="/:grade/:subject/:semester/:publisher/:view/:subTab" element={<MaintenanceGuard><Index /></MaintenanceGuard>} />
            <Route path="/:grade/:subject/:semester/:publisher/:view" element={<MaintenanceGuard><Index /></MaintenanceGuard>} />
            <Route path="/:grade/:subject/:semester/:publisher" element={<MaintenanceGuard><Index /></MaintenanceGuard>} />
            <Route path="/" element={<MaintenanceGuard><Index /></MaintenanceGuard>} />

            {/* ADD ALL CUSTOM ROUTES ABOVE THE CATCH-ALL "*" ROUTE */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </ErrorBoundary>
    </TooltipProvider>
  </QueryClientProvider>
);

export default App;
