
import React, { useState } from 'react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Calendar } from 'lucide-react';
import { ExpenseChart } from '@/components/ExpenseChart';
import RevenueChart from '@/components/RevenueChart';
import ExpensesChart from '@/components/ExpensesChart';
import BalanceChart from '@/components/BalanceChart';

const Reports = () => {
  const { 
    getMonthlyIncome, 
    getMonthlyExpenses,
    getMonthlyBalance,
    getExpensesByCategory,
    getMonthlyData,
    getInvestmentsByType,
    loading 
  } = useFinancialData();

  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  const [year, month] = selectedMonth.split('-').map(Number);
  const monthlyIncome = getMonthlyIncome(month - 1, year);
  const monthlyExpenses = getMonthlyExpenses(month - 1, year);
  const monthlyBalance = getMonthlyBalance(month - 1, year);
  const expensesByCategory = getExpensesByCategory(month - 1, year);
  const monthlyData = getMonthlyData(12);
  const investmentsByType = getInvestmentsByType();

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  const backgroundSvg = `data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

  const months = [
    { value: '2024-01', label: 'Janeiro 2024' },
    { value: '2024-02', label: 'Fevereiro 2024' },
    { value: '2024-03', label: 'Março 2024' },
    { value: '2024-04', label: 'Abril 2024' },
    { value: '2024-05', label: 'Maio 2024' },
    { value: '2024-06', label: 'Junho 2024' },
    { value: '2024-07', label: 'Julho 2024' },
    { value: '2024-08', label: 'Agosto 2024' },
    { value: '2024-09', label: 'Setembro 2024' },
    { value: '2024-10', label: 'Outubro 2024' },
    { value: '2024-11', label: 'Novembro 2024' },
    { value: '2024-12', label: 'Dezembro 2024' },
    { value: '2025-01', label: 'Janeiro 2025' },
    { value: '2025-02', label: 'Fevereiro 2025' },
    { value: '2025-03', label: 'Março 2025' },
    { value: '2025-04', label: 'Abril 2025' },
    { value: '2025-05', label: 'Maio 2025' },
    { value: '2025-06', label: 'Junho 2025' },
    { value: '2025-07', label: 'Julho 2025' },
    { value: '2025-08', label: 'Agosto 2025' },
    { value: '2025-09', label: 'Setembro 2025' },
    { value: '2025-10', label: 'Outubro 2025' },
    { value: '2025-11', label: 'Novembro 2025' },
    { value: '2025-12', label: 'Dezembro 2025' },
  ];

  // Preparar dados para os gráficos
  const revenueData = monthlyData.map(item => ({
    month: item.month,
    revenue: item.income
  }));

  const expensesData = monthlyData.map(item => ({
    month: item.month,
    expenses: item.expenses
  }));

  const balanceData = monthlyData.map(item => ({
    month: item.month,
    balance: item.income - item.expenses,
    revenue: item.income,
    expenses: item.expenses
  }));

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("${backgroundSvg}")` }}></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <PieChart className="mr-3 h-8 w-8 text-green-400" />
              Relatórios Financeiros
            </h1>
            <p className="text-gray-400 mt-2">Análise detalhada das suas finanças</p>
          </div>

          <div className="flex items-center space-x-4">
            <Calendar className="h-5 w-5 text-gray-400" />
            <Select value={selectedMonth} onValueChange={setSelectedMonth}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {months.map((month) => (
                  <SelectItem key={month.value} value={month.value} className="text-white">
                    {month.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* KPIs for selected month */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Receitas do Mês</CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                R$ {monthlyIncome.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-400">
                {new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Despesas do Mês</CardTitle>
              <TrendingDown className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                R$ {monthlyExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-400">
                {new Date(year, month - 1).toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })}
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Saldo do Mês</CardTitle>
              <DollarSign className={`h-4 w-4 ${monthlyBalance >= 0 ? 'text-green-400' : 'text-red-400'}`} />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${monthlyBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                R$ {monthlyBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-400">
                Receitas - Despesas
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Charts Section - Primeira linha */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingUp className="mr-2 h-5 w-5 text-green-400" />
                Evolução de Receitas (12 meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <RevenueChart data={revenueData} />
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <TrendingDown className="mr-2 h-5 w-5 text-red-400" />
                Evolução de Despesas (12 meses)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ExpensesChart data={expensesData} />
            </CardContent>
          </Card>
        </div>

        {/* Charts Section - Segunda linha */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <DollarSign className="mr-2 h-5 w-5 text-blue-400" />
                Balanço Mensal (Receitas - Despesas)
              </CardTitle>
            </CardHeader>
            <CardContent>
              <BalanceChart data={balanceData} />
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader>
              <CardTitle className="text-white flex items-center">
                <PieChart className="mr-2 h-5 w-5 text-purple-400" />
                Despesas por Categoria
              </CardTitle>
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

export default Reports;
