
import React, { useState } from 'react';
import { useSimplifiedFinancialData } from '@/hooks/useSimplifiedFinancialData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { TrendingUp, TrendingDown, DollarSign, PieChart, Calendar, BarChart3 } from 'lucide-react';
import { FinancialBarChart } from '@/components/FinancialBarChart';
import { ExpenseChart } from '@/components/ExpenseChart';
import RevenueChart from '@/components/RevenueChart';
import ExpensesChart from '@/components/ExpensesChart';
import AnimatedCounter from '@/components/AnimatedCounter';

const Reports = () => {
  const {
    getMonthlyIncome,
    getMonthlyExpenses,
    getMonthlyData,
    getExpensesByCategory,
    loading
  } = useSimplifiedFinancialData();

  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear().toString());
  const [selectedMonth, setSelectedMonth] = useState((new Date().getMonth() + 1).toString());

  const currentYear = new Date().getFullYear();
  const years = Array.from({ length: 5 }, (_, i) => currentYear - i);
  const months = [
    { value: '1', label: 'Janeiro' },
    { value: '2', label: 'Fevereiro' },
    { value: '3', label: 'Março' },
    { value: '4', label: 'Abril' },
    { value: '5', label: 'Maio' },
    { value: '6', label: 'Junho' },
    { value: '7', label: 'Julho' },
    { value: '8', label: 'Agosto' },
    { value: '9', label: 'Setembro' },
    { value: '10', label: 'Outubro' },
    { value: '11', label: 'Novembro' },
    { value: '12', label: 'Dezembro' }
  ];

  // Dados mensais
  const monthlyIncome = getMonthlyIncome(parseInt(selectedMonth) - 1, parseInt(selectedYear));
  const monthlyExpenses = getMonthlyExpenses(parseInt(selectedMonth) - 1, parseInt(selectedYear));
  const monthlyBalance = monthlyIncome - monthlyExpenses;
  const monthlyExpensesByCategory = getExpensesByCategory(parseInt(selectedMonth) - 1, parseInt(selectedYear));

  // Dados anuais
  const getAnnualData = () => {
    let annualIncome = 0;
    let annualExpenses = 0;
    const monthlyBreakdown = [];
    
    for (let month = 0; month < 12; month++) {
      const income = getMonthlyIncome(month, parseInt(selectedYear));
      const expenses = getMonthlyExpenses(month, parseInt(selectedYear));
      annualIncome += income;
      annualExpenses += expenses;
      
      monthlyBreakdown.push({
        month: months[month].label,
        income,
        expenses,
        balance: income - expenses
      });
    }
    
    return {
      annualIncome,
      annualExpenses,
      annualBalance: annualIncome - annualExpenses,
      monthlyBreakdown
    };
  };

  const annualData = getAnnualData();

  // Dados de receitas para o gráfico de linha
  const revenueData = annualData.monthlyBreakdown.map(item => ({
    month: item.month.substring(0, 3),
    revenue: item.income
  }));

  // Dados de despesas para o gráfico de barras
  const expensesData = annualData.monthlyBreakdown.map(item => ({
    month: item.month.substring(0, 3),
    expenses: item.expenses
  }));

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900 p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-white">Relatórios Financeiros</h1>
            <p className="text-gray-400 mt-2">Análise detalhada das suas finanças</p>
          </div>
          <div className="flex items-center space-x-4">
            <Select value={selectedYear} onValueChange={setSelectedYear}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {years.map(year => (
                  <SelectItem key={year} value={year.toString()} className="text-white">
                    {year}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Tabs for Monthly and Annual Reports */}
        <Tabs defaultValue="monthly" className="w-full">
          <TabsList className="grid w-full grid-cols-2 bg-gray-800/50 mb-8">
            <TabsTrigger value="monthly" className="text-gray-300 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <Calendar className="h-4 w-4 mr-2" />
              Relatório Mensal
            </TabsTrigger>
            <TabsTrigger value="annual" className="text-gray-300 data-[state=active]:bg-green-600 data-[state=active]:text-white">
              <BarChart3 className="h-4 w-4 mr-2" />
              Relatório Anual
            </TabsTrigger>
          </TabsList>

          {/* Monthly Report */}
          <TabsContent value="monthly" className="space-y-8">
            <div className="flex items-center space-x-4 mb-6">
              <Select value={selectedMonth} onValueChange={setSelectedMonth}>
                <SelectTrigger className="w-40 bg-gray-800 border-gray-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-gray-800 border-gray-700">
                  {months.map(month => (
                    <SelectItem key={month.value} value={month.value} className="text-white">
                      {month.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <span className="text-white">de {selectedYear}</span>
            </div>

            {/* Monthly KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Receitas do Mês</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    <AnimatedCounter value={monthlyIncome} prefix="R$ " />
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Despesas do Mês</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">
                    <AnimatedCounter value={monthlyExpenses} prefix="R$ " />
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Saldo do Mês</CardTitle>
                  <DollarSign className={`h-4 w-4 ${monthlyBalance >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${monthlyBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <AnimatedCounter value={monthlyBalance} prefix="R$ " />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
                <CardHeader>
                  <CardTitle className="text-white">Despesas por Categoria</CardTitle>
                </CardHeader>
                <CardContent>
                  <ExpenseChart data={monthlyExpensesByCategory} />
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
                <CardHeader>
                  <CardTitle className="text-white">Análise Mensal</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Taxa de Economia:</span>
                      <span className={`font-bold ${monthlyBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                        {monthlyIncome > 0 ? ((monthlyBalance / monthlyIncome) * 100).toFixed(1) : 0}%
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-gray-300">Maior Categoria de Gasto:</span>
                      <span className="text-white font-bold">
                        {monthlyExpensesByCategory.length > 0 
                          ? monthlyExpensesByCategory.reduce((max, cat) => 
                              cat.value > max.value ? cat : max
                            ).name
                          : 'N/A'
                        }
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          {/* Annual Report */}
          <TabsContent value="annual" className="space-y-8">
            {/* Annual KPIs */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Receitas do Ano</CardTitle>
                  <TrendingUp className="h-4 w-4 text-green-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-green-400">
                    <AnimatedCounter value={annualData.annualIncome} prefix="R$ " />
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Despesas do Ano</CardTitle>
                  <TrendingDown className="h-4 w-4 text-red-400" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-red-400">
                    <AnimatedCounter value={annualData.annualExpenses} prefix="R$ " />
                  </div>
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium text-gray-300">Saldo do Ano</CardTitle>
                  <DollarSign className={`h-4 w-4 ${annualData.annualBalance >= 0 ? 'text-green-400' : 'text-red-400'}`} />
                </CardHeader>
                <CardContent>
                  <div className={`text-2xl font-bold ${annualData.annualBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                    <AnimatedCounter value={annualData.annualBalance} prefix="R$ " />
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Annual Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
                <CardHeader>
                  <CardTitle className="text-white">Evolução das Receitas - {selectedYear}</CardTitle>
                </CardHeader>
                <CardContent>
                  <RevenueChart data={revenueData} />
                </CardContent>
              </Card>

              <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
                <CardHeader>
                  <CardTitle className="text-white">Evolução das Despesas - {selectedYear}</CardTitle>
                </CardHeader>
                <CardContent>
                  <ExpensesChart data={expensesData} />
                </CardContent>
              </Card>
            </div>

            {/* Annual Breakdown Table */}
            <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
              <CardHeader>
                <CardTitle className="text-white">Detalhamento Mensal - {selectedYear}</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm">
                    <thead>
                      <tr className="border-b border-gray-700">
                        <th className="text-left py-2 text-gray-300">Mês</th>
                        <th className="text-right py-2 text-gray-300">Receitas</th>
                        <th className="text-right py-2 text-gray-300">Despesas</th>
                        <th className="text-right py-2 text-gray-300">Saldo</th>
                      </tr>
                    </thead>
                    <tbody>
                      {annualData.monthlyBreakdown.map((item, index) => (
                        <tr key={index} className="border-b border-gray-800">
                          <td className="py-2 text-white">{item.month}</td>
                          <td className="py-2 text-right text-green-400">
                            R$ {item.income.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-2 text-right text-red-400">
                            R$ {item.expenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                          <td className={`py-2 text-right font-bold ${item.balance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                            R$ {item.balance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Reports;
