import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route } from "react-router-dom";
import { AuthProvider } from "@/contexts/AuthContext";
import ProtectedRoute from "@/components/ProtectedRoute";
import AppSidebar from "@/components/AppSidebar";
import Index from "./pages/Index";
import SimplifiedIndex from "./pages/SimplifiedIndex";
import Transactions from "./pages/Transactions";
import SimplifiedTransactions from "./pages/SimplifiedTransactions";
import Investments from "./pages/Investments";
import Goals from "./pages/Goals";
import EditableGoals from "./pages/EditableGoals";
import Reports from "./pages/Reports";
import MonthlyHistory from "./pages/MonthlyHistory";
import Revenues from "./pages/Revenues";
import Expenses from "./pages/Expenses";
import Profile from "./pages/Profile";
import Auth from "./pages/Auth";
import NotFound from "./pages/NotFound";

const queryClient = new QueryClient();

const App = () => (
  <QueryClientProvider client={queryClient}>
    <AuthProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            <Route path="/auth" element={<Auth />} />
            <Route path="/*" element={
              <ProtectedRoute>
                <div className="flex min-h-screen w-full bg-gradient-to-br from-slate-950 via-green-950 to-slate-900">
                  <AppSidebar />
                  <main className="flex-1 transition-all duration-500 ease-in-out">
                    <Routes>
                      <Route path="/" element={<SimplifiedIndex />} />
                      <Route path="/full" element={<Index />} />
                      <Route path="/transactions" element={<SimplifiedTransactions />} />
                      <Route path="/transactions-full" element={<Transactions />} />
                      <Route path="/investments" element={<Investments />} />
                      <Route path="/goals" element={<Goals />} />
                      <Route path="/goals-editable" element={<EditableGoals />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/monthly-history" element={<MonthlyHistory />} />
                      <Route path="/revenues" element={<Revenues />} />
                      <Route path="/expenses" element={<Expenses />} />
                      <Route path="/profile" element={<Profile />} />
                      <Route path="*" element={<NotFound />} />
                    </Routes>
                  </main>
                </div>
              </ProtectedRoute>
            } />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </AuthProvider>
  </QueryClientProvider>
);

export default App;