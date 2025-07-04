
import React, { useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from '@/contexts/AuthContext';
import { Toaster } from '@/components/ui/toaster';
import ProtectedRoute from '@/components/ProtectedRoute';
import Auth from '@/pages/Auth';
import SimplifiedIndex from '@/pages/SimplifiedIndex';
import Revenues from '@/pages/Revenues';
import Expenses from '@/pages/Expenses';
import SimplifiedTransactions from '@/pages/SimplifiedTransactions';
import Investments from '@/pages/Investments';
import Goals from '@/pages/Goals';
import MonthlyHistory from '@/pages/MonthlyHistory';
import Reports from '@/pages/Reports';
import Profile from '@/pages/Profile';
import AppSidebar from '@/components/AppSidebar';
import { cn } from '@/lib/utils';
import { useAuth } from '@/contexts/AuthContext';
import { useIsMobile } from '@/hooks/use-mobile';

function AppContent() {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const { user } = useAuth();
  const isMobile = useIsMobile();

  const toggleSidebar = () => {
    setSidebarCollapsed(!sidebarCollapsed);
  };

  return (
    <Router>
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900">
        <Routes>
          <Route 
            path="/login" 
            element={user ? <Navigate to="/" replace /> : <Auth />} 
          />
          <Route 
            path="/auth" 
            element={user ? <Navigate to="/" replace /> : <Auth />} 
          />
          <Route path="/*" element={
            <ProtectedRoute>
              <div className="flex min-h-screen">
                <AppSidebar isCollapsed={sidebarCollapsed} onToggle={toggleSidebar} />
                <main className={cn(
                  "flex-1 transition-all duration-300 ease-in-out min-h-screen",
                  isMobile 
                    ? "ml-0 w-full" 
                    : sidebarCollapsed 
                      ? "ml-0 w-full" 
                      : "ml-80 w-[calc(100%-320px)]"
                )}>
                  <div className="w-full h-full p-4 sm:p-6 lg:p-8">
                    <Routes>
                      <Route path="/" element={<SimplifiedIndex />} />
                      <Route path="/revenues" element={<Revenues />} />
                      <Route path="/expenses" element={<Expenses />} />
                      <Route path="/transactions" element={<SimplifiedTransactions />} />
                      <Route path="/investments" element={<Investments />} />
                      <Route path="/goals" element={<Goals />} />
                      <Route path="/monthly-history" element={<MonthlyHistory />} />
                      <Route path="/reports" element={<Reports />} />
                      <Route path="/profile" element={<Profile />} />
                    </Routes>
                  </div>
                </main>
              </div>
            </ProtectedRoute>
          } />
        </Routes>
        <Toaster />
      </div>
    </Router>
  );
}

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
