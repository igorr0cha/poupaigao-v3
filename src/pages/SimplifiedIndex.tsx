import React, { useEffect } from 'react';
import { useSimplifiedFinancialData } from '@/hooks/useSimplifiedFinancialData';
import { useRecurringTransactions } from '@/hooks/useRecurringTransactions';
import { useAutoRefresh } from '@/hooks/useAutoRefresh';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { DollarSign, TrendingUp, TrendingDown, PiggyBank, Target, Wallet, Calculator, Plus } from 'lucide-react';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { toast } from '@/hooks/use-toast';
import SimplifiedQuickActions from '@/components/SimplifiedQuickActions';
import SimplifiedUpcomingBills from '@/components/SimplifiedUpcomingBills';
import { GoalsOverview } from '@/components/GoalsOverview';
import { FinancialBarChart } from '@/components/FinancialBarChart';
import { ExpenseChart } from '@/components/ExpenseChart';
import AnimatedCounter from '@/components/AnimatedCounter';

import { format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

const SimplifiedIndex = () => {
  const { 
    getMonthlyIncome, 
    getMonthlyExpenses, 
    getUnpaidExpenses,
    getTotalInvestments,
    getTotalGoals,
    getAccountBalance,
    getCurrentBalance,
    getProjectedBalance,
    getNetWorth,
    getMonthlyData,
    getExpensesByCategory,
    goals,
    investmentTypes,
    addInvestment,
    loading,
    refetch
  } = useSimplifiedFinancialData();

  // Hook para transações recorrentes
  useRecurringTransactions();

  // Hook para atualização automática dos dados
  useAutoRefresh({ 
    onRefresh: refetch,
    interval: 60000 // Atualiza a cada 60 segundos
  });

  const currentMonthName = format(new Date(), 'MMMM yyyy', { locale: ptBR });

  const [investmentDialogOpen, setInvestmentDialogOpen] = React.useState(false);
  const [investmentData, setInvestmentData] = React.useState({
    asset_name: '',
    asset_type_id: '',
    quantity: '',
    average_price: ''
  });
  const [saving, setSaving] = React.useState(false);

  const currentIncome = getMonthlyIncome();
  const currentExpenses = getMonthlyExpenses();
  const netWorth = getNetWorth();
  const accountBalance = getAccountBalance();
  const currentBalance = getCurrentBalance();
  const unpaidExpenses = getUnpaidExpenses();
  const projectedBalance = getProjectedBalance();
  const monthlyData = getMonthlyData();
  const expensesByCategory = getExpensesByCategory();

  const handleUpdate = async () => {
    await refetch();
  };

  const handleAddInvestment = async () => {
    if (!investmentData.asset_name || !investmentData.asset_type_id || !investmentData.quantity || !investmentData.average_price) {
      toast({
        title: "Erro",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const { error } = await addInvestment({
        asset_name: investmentData.asset_name,
        asset_type_id: investmentData.asset_type_id,
        quantity: parseFloat(investmentData.quantity),
        average_price: parseFloat(investmentData.average_price)
      });

      if (error) throw error;

      toast({
        title: "Investimento adicionado!",
        description: "Seu investimento foi registrado com sucesso.",
      });

      setInvestmentData({
        asset_name: '',
        asset_type_id: '',
        quantity: '',
        average_price: ''
      });
      setInvestmentDialogOpen(false);
      await refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar investimento.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-green-400"></div>
      </div>
    );
  }

  const backgroundSvg = `data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.02"%3E%3Ccircle cx="30" cy="30" r="2"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E`;

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("${backgroundSvg}")` }}></div>
      
      <div className="relative z-10 space-y-8 p-8">
        {/* Primeira linha: Receitas, Despesas, Patrimônio líquido */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300 capitalize">
                Receitas de {currentMonthName}
                <span className="ml-2 px-2 py-1 text-xs bg-green-500/20 text-green-400 rounded-full">MENSAL</span>
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                <AnimatedCounter value={currentIncome} prefix="R$ " />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                O quanto foi recebido em {currentMonthName}
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300 capitalize">
                Despesas de {currentMonthName}
                <span className="ml-2 px-2 py-1 text-xs bg-red-500/20 text-red-400 rounded-full">MENSAL</span>
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                <AnimatedCounter value={currentExpenses} prefix="R$ " />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                O quanto foi gasto em {currentMonthName}
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Patrimônio Líquido
                <span className="ml-2 px-2 py-1 text-xs bg-purple-500/20 text-purple-400 rounded-full">TOTAL</span>
              </CardTitle>
              <PiggyBank className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                <AnimatedCounter value={netWorth} prefix="R$ " />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Investimentos + Metas + Valor em Conta
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Segunda linha: Valor em Conta, Saldo Atual, Despesas Pendentes, Saldo Projetado */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Valor em Conta
                <span className="ml-2 px-2 py-1 text-xs bg-blue-500/20 text-blue-400 rounded-full">ATUAL</span>
              </CardTitle>
              <Wallet className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                <AnimatedCounter value={accountBalance} prefix="R$ " />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Ajustado manualmente
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Saldo Atual
                <span className="ml-2 px-2 py-1 text-xs bg-cyan-500/20 text-cyan-400 rounded-full">MENSAL</span>
              </CardTitle>
              <Calculator className="h-4 w-4 text-cyan-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-cyan-400">
                <AnimatedCounter value={currentBalance} prefix="R$ " />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Valor em conta - Despesas pagas
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Despesas Pendentes
                <span className="ml-2 px-2 py-1 text-xs bg-orange-500/20 text-orange-400 rounded-full">MENSAL</span>
              </CardTitle>
              <TrendingDown className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                <AnimatedCounter value={unpaidExpenses} prefix="R$ " />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                A ser pagas
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30 shadow-2xl">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">
                Saldo Projetado
                <span className="ml-2 px-2 py-1 text-xs bg-yellow-500/20 text-yellow-400 rounded-full">MENSAL</span>
              </CardTitle>
              <Target className="h-4 w-4 text-yellow-400" />
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-bold ${projectedBalance >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                <AnimatedCounter value={projectedBalance} prefix="R$ " />
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Após pagamento das pendências
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <SimplifiedQuickActions onTransactionAdded={handleUpdate} />
              
              {/* Botão de Adicionar Investimento */}
              <Dialog open={investmentDialogOpen} onOpenChange={setInvestmentDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-gradient-to-r from-purple-500 to-violet-600 hover:from-purple-400 hover:to-violet-500 text-white shadow-lg">
                    <Plus className="h-4 w-4 mr-2" />
                    Investimento
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Adicionar Investimento</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="asset_name" className="text-gray-300">Nome do Ativo</Label>
                      <Input
                        id="asset_name"
                        value={investmentData.asset_name}
                        onChange={(e) => setInvestmentData({...investmentData, asset_name: e.target.value})}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Ex: PETR4, Bitcoin, etc."
                      />
                    </div>
                    <div>
                      <Label htmlFor="asset_type_id" className="text-gray-300">Tipo de Investimento</Label>
                      <Select value={investmentData.asset_type_id} onValueChange={(value) => setInvestmentData({...investmentData, asset_type_id: value})}>
                        <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                          <SelectValue placeholder="Selecione o tipo" />
                        </SelectTrigger>
                        <SelectContent className="bg-gray-800 border-gray-700">
                          {investmentTypes.map((type) => (
                            <SelectItem key={type.id} value={type.id} className="text-white">
                              {type.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div>
                      <Label htmlFor="quantity" className="text-gray-300">Quantidade</Label>
                      <Input
                        id="quantity"
                        type="number"
                        step="0.01"
                        value={investmentData.quantity}
                        onChange={(e) => setInvestmentData({...investmentData, quantity: e.target.value})}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <Label htmlFor="average_price" className="text-gray-300">Preço Médio</Label>
                      <Input
                        id="average_price"
                        type="number"
                        step="0.01"
                        value={investmentData.average_price}
                        onChange={(e) => setInvestmentData({...investmentData, average_price: e.target.value})}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="0.00"
                      />
                    </div>
                    <Button 
                      onClick={handleAddInvestment} 
                      disabled={saving}
                      className="w-full bg-purple-600 hover:bg-purple-700"
                    >
                      {saving ? 'Adicionando...' : 'Adicionar Investimento'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </div>
            
            <FinancialBarChart data={monthlyData} />
          </div>
          
          <div className="space-y-6">
            <SimplifiedUpcomingBills onUpdate={handleUpdate} />
            <GoalsOverview goals={goals} />
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          <ExpenseChart data={expensesByCategory} />
          <Tabs defaultValue="overview" className="backdrop-blur-sm bg-black/40 border-green-800/30 rounded-lg">
            <TabsList className="grid w-full grid-cols-2 bg-gray-800/50">
              <TabsTrigger value="overview" className="text-gray-300 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Visão Geral
              </TabsTrigger>
              <TabsTrigger value="analytics" className="text-gray-300 data-[state=active]:bg-green-600 data-[state=active]:text-white">
                Análises
              </TabsTrigger>
            </TabsList>
            <TabsContent value="overview" className="space-y-4 p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Resumo Mensal</h3>
                <div className="grid grid-cols-2 gap-4">
                  <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                    <p className="text-sm text-gray-400">Economia do Mês</p>
                    <p className={`text-xl font-bold ${(currentIncome - currentExpenses) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      R$ {(currentIncome - currentExpenses).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </p>
                  </div>
                  <div className="text-center p-4 bg-gray-800/30 rounded-lg">
                    <p className="text-sm text-gray-400">Taxa de Economia</p>
                    <p className={`text-xl font-bold ${(currentIncome - currentExpenses) >= 0 ? 'text-green-400' : 'text-red-400'}`}>
                      {currentIncome > 0 ? ((currentIncome - currentExpenses) / currentIncome * 100).toFixed(1) : 0}%
                    </p>
                  </div>
                </div>
              </div>
            </TabsContent>
            <TabsContent value="analytics" className="space-y-4 p-6">
              <div className="text-center">
                <h3 className="text-lg font-semibold text-white mb-2">Análises Avançadas</h3>
                <p className="text-gray-400 text-sm">Insights detalhados sobre suas finanças</p>
                <div className="mt-4 p-4 bg-gray-800/30 rounded-lg">
                  <p className="text-sm text-gray-400">Em desenvolvimento</p>
                  <p className="text-xs text-gray-500 mt-1">Funcionalidades avançadas em breve</p>
                </div>
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </div>
    </div>
  );
};

export default SimplifiedIndex;
