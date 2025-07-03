
import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, TrendingUp, CreditCard, DollarSign, Settings } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useSimplifiedFinancialData } from '@/hooks/useSimplifiedFinancialData';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/components/ui/use-toast';

const QuickActionsAdvanced = () => {
  const navigate = useNavigate();
  const { user } = useAuth();
  const { goals, investmentTypes, adjustAccountBalance, addMoneyToGoal, addInvestment, refetch } = useSimplifiedFinancialData();
  const [reserveDialogOpen, setReserveDialogOpen] = useState(false);
  const [balanceDialogOpen, setBalanceDialogOpen] = useState(false);
  const [investmentDialogOpen, setInvestmentDialogOpen] = useState(false);
  const [reserveData, setReserveData] = useState({
    goalId: '',
    amount: ''
  });
  const [balanceData, setBalanceData] = useState({
    newBalance: ''
  });
  const [investmentData, setInvestmentData] = useState({
    asset_name: '',
    asset_type_id: '',
    quantity: '',
    average_price: ''
  });
  const [saving, setSaving] = useState(false);

  const actions = [
    {
      title: 'Nova Transação',
      description: 'Registre receitas e despesas',
      icon: Plus,
      onClick: () => navigate('/transactions'),
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Receitas',
      description: 'Administre suas receitas',
      icon: CreditCard,
      onClick: () => navigate('/revenues'),
      color: 'from-purple-500 to-purple-600'
    }
  ];

  const handleReserveMoney = async () => {
    if (!user || !reserveData.goalId || !reserveData.amount) return;
    
    setSaving(true);
    try {
      const amount = parseFloat(reserveData.amount);
      
      const { error } = await addMoneyToGoal(reserveData.goalId, amount);

      if (error) throw error;

      toast({
        title: "Dinheiro reservado!",
        description: `R$ ${amount.toFixed(2)} adicionado à meta`,
      });

      setReserveData({ goalId: '', amount: '' });
      setReserveDialogOpen(false);
      await refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao reservar dinheiro.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleAdjustBalance = async () => {
    if (!user || !balanceData.newBalance) return;
    
    setSaving(true);
    try {
      const newBalance = parseFloat(balanceData.newBalance);
      
      const { error } = await adjustAccountBalance(newBalance);

      if (error) throw error;

      toast({
        title: "Saldo ajustado!",
        description: `Valor em conta ajustado para R$ ${newBalance.toFixed(2)}`,
      });

      setBalanceData({ newBalance: '' });
      setBalanceDialogOpen(false);
      await refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao ajustar saldo.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
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

  return (
    <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
      <CardHeader>
        <CardTitle className="text-white">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3 mb-4">
          {actions.map((action) => {
            const Icon = action.icon;
            return (
              <Button
                key={action.title}
                onClick={action.onClick}
                className={`h-auto p-4 flex flex-col items-center space-y-2 bg-gradient-to-r ${action.color} hover:opacity-90 transition-all duration-200 transform hover:scale-105`}
              >
                <Icon className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium text-sm">{action.title}</p>
                  <p className="text-xs opacity-90">{action.description}</p>
                </div>
              </Button>
            );
          })}

          {/* Investimentos */}
          <Dialog open={investmentDialogOpen} onOpenChange={setInvestmentDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-auto p-4 flex flex-col items-center space-y-2 bg-gradient-to-r from-blue-500 to-blue-600 hover:opacity-90 transition-all duration-200 transform hover:scale-105">
                <TrendingUp className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium text-sm">Investimentos</p>
                  <p className="text-xs opacity-90">Gerencie seu portfólio</p>
                </div>
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
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  {saving ? 'Adicionando...' : 'Adicionar Investimento'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>

          {/* Reservar Dinheiro */}
          <Dialog open={reserveDialogOpen} onOpenChange={setReserveDialogOpen}>
            <DialogTrigger asChild>
              <Button className="h-auto p-4 flex flex-col items-center space-y-2 bg-gradient-to-r from-teal-500 to-teal-600 hover:opacity-90 transition-all duration-200 transform hover:scale-105">
                <DollarSign className="h-6 w-6" />
                <div className="text-center">
                  <p className="font-medium text-sm">Reservar Dinheiro</p>
                  <p className="text-xs opacity-90">Para suas metas</p>
                </div>
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Reservar Dinheiro</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="goal" className="text-gray-300">Meta</Label>
                  <Select value={reserveData.goalId} onValueChange={(value) => setReserveData({...reserveData, goalId: value})}>
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Selecione a meta" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {goals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id} className="text-white">
                          {goal.name} - R$ {goal.current_amount.toFixed(2)} / R$ {goal.target_amount.toFixed(2)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div>
                  <Label htmlFor="amount" className="text-gray-300">Valor</Label>
                  <Input
                    id="amount"
                    type="number"
                    step="0.01"
                    value={reserveData.amount}
                    onChange={(e) => setReserveData({...reserveData, amount: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="0.00"
                  />
                </div>
                <Button 
                  onClick={handleReserveMoney} 
                  disabled={saving}
                  className="w-full bg-teal-600 hover:bg-teal-700"
                >
                  {saving ? 'Processando...' : 'Reservar Dinheiro'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Ajustar Valor em Conta */}
        <Dialog open={balanceDialogOpen} onOpenChange={setBalanceDialogOpen}>
          <DialogTrigger asChild>
            <Button className="w-full h-auto p-4 flex flex-col items-center space-y-2 bg-gradient-to-r from-indigo-500 to-indigo-600 hover:opacity-90 transition-all duration-200 transform hover:scale-105">
              <Settings className="h-6 w-6" />
              <div className="text-center">
                <p className="font-medium text-sm">Ajustar Valor em Conta</p>
                <p className="text-xs opacity-90">Valor manual</p>
              </div>
            </Button>
          </DialogTrigger>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Ajustar Valor em Conta</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <div>
                <Label htmlFor="new-balance" className="text-gray-300">Novo Valor</Label>
                <Input
                  id="new-balance"
                  type="number"
                  step="0.01"
                  value={balanceData.newBalance}
                  onChange={(e) => setBalanceData({...balanceData, newBalance: e.target.value})}
                  className="bg-gray-800 border-gray-700 text-white"
                  placeholder="0.00"
                />
              </div>
              <Button 
                onClick={handleAdjustBalance} 
                disabled={saving}
                className="w-full bg-indigo-600 hover:bg-indigo-700"
              >
                {saving ? 'Processando...' : 'Ajustar Valor'}
              </Button>
            </div>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
};

export default QuickActionsAdvanced;
