
import React from 'react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { TrendingUp, TrendingDown, DollarSign, PiggyBank } from 'lucide-react';
import { FinancialChart } from '@/components/FinancialChart';
import { ExpenseChart } from '@/components/ExpenseChart';
import UpcomingBillsAdvanced from '@/components/UpcomingBillsAdvanced';
import QuickActionsAdvanced from '@/components/QuickActionsAdvanced';
import { AnimatedCounter } from '@/components/AnimatedCounter';

const Index = () => {
  const { user } = useAuth();
  const { 
    getTotalInvestments,
    getTotalGoals,
    getNetWorth,
    getMonthlyIncome, 
    getMonthlyExpenses,
    getMonthlyBalance,
    getUnpaidExpenses,
    getProjectedBalance,
    getExpensesByCategory,
    getMonthlyData,
    loading 
  } = useFinancialData();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  const totalInvestments = getTotalInvestments();
  const totalGoals = getTotalGoals();
  const netWorth = getNetWorth();
  const monthlyIncome = getMonthlyIncome();
  const monthlyExpenses = getMonthlyExpenses();
  const monthlyBalance = getMonthlyBalance();
  const unpaidExpenses = getUnpaidExpenses();
  const projectedBalance = getProjectedBalance();
  const expensesByCategory = getExpensesByCategory();
  const monthlyData = getMonthlyData();

  const getUserDisplayName = () => {
    if (!user) return 'Usuário';
    
    const displayName = user.user_metadata?.display_name || user.user_metadata?.full_name;
    if (displayName) return displayName.split(' ')[0];
    
    if (user.email) {
      return user.email.split('@')[0];
    }
    
    return 'Usuário';
  };

  const backgroundSvg = `data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("${backgroundSvg}")` }}></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-white mb-2">
            Olá, {getUserDisplayName()}! 👋
          </h1>
          <p className="text-gray-400">Acompanhe suas finanças em tempo real</p>
        </div>

        {/* KPIs */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30 hover:bg-black/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Receitas</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                R$ <AnimatedCounter value={monthlyIncome} />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Este mês
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30 hover:bg-black/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Despesas</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                R$ <AnimatedCounter value={monthlyExpenses} />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Este mês
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30 hover:bg-black/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Saldo</CardTitle>
              <DollarSign className={`h-4 w-4 ${monthlyBalance >= 0 ? 'text-green-400' : 'text-red-400'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${monthlyBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                R$ <AnimatedCounter value={monthlyBalance} />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Este mês
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30 hover:bg-black/50 transition-all duration-300">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Patrimônio</CardTitle>
              <PiggyBank className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                R$ <AnimatedCounter value={netWorth} />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Total
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Seção de ações e informações */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <UpcomingBillsAdvanced />
          <QuickActionsAdvanced />
        </div>

        {/* Charts Section */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader>
              <CardTitle className="text-white">Evolução Financeira</CardTitle>
            </CardHeader>
            <CardContent>
              <FinancialChart income={monthlyIncome} expenses={monthlyExpenses} />
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader>
              <CardTitle className="text-white">Despesas por Categoria</CardTitle>
            </CardHeader>
            <CardContent>
              <ExpenseChart data={expensesByCategory} />
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
};

export default Index;
