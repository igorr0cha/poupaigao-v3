
import React, { useState } from 'react';
import { useSimplifiedFinancialData } from '@/hooks/useSimplifiedFinancialData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, PiggyBank, TrendingUp, Settings, Wallet } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';

interface SimplifiedQuickActionsProps {
  onTransactionAdded?: () => void;
}

const SimplifiedQuickActions = ({ onTransactionAdded }: SimplifiedQuickActionsProps) => {
  const { 
    addMoneyToGoal, 
    adjustAccountBalance,
    goals, 
    accountBalance
  } = useSimplifiedFinancialData();

  const navigate = useNavigate();

  const [goalData, setGoalData] = useState({
    goalId: '',
    amount: ''
  });

  const [balanceData, setBalanceData] = useState({
    newBalance: accountBalance.toString()
  });

  const [isGoalDialogOpen, setIsGoalDialogOpen] = useState(false);
  const [isBalanceDialogOpen, setIsBalanceDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleAddMoneyToGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await addMoneyToGoal(goalData.goalId, parseFloat(goalData.amount));

      if (error) throw error;

      toast({
        title: "Dinheiro reservado!",
        description: "Valor adicionado à meta com sucesso.",
      });

      setGoalData({ goalId: '', amount: '' });
      setIsGoalDialogOpen(false);
      
      if (onTransactionAdded) {
        onTransactionAdded();
      }
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

  const handleAdjustBalance = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await adjustAccountBalance(parseFloat(balanceData.newBalance));

      if (error) throw error;

      toast({
        title: "Saldo ajustado!",
        description: "Valor em conta atualizado com sucesso.",
      });

      setIsBalanceDialogOpen(false);
      
      if (onTransactionAdded) {
        onTransactionAdded();
      }
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

  return (
    <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Settings className="mr-2 h-5 w-5 text-green-400" />
          Ações Rápidas
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-4">
          {/* Nova Transação */}
          <Button 
            onClick={() => navigate('/transactions')}
            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white w-full"
          >
            <Plus className="mr-2 h-4 w-4" />
            Nova Transação
          </Button>

          {/* Adicionar Investimentos */}
          <Button 
            onClick={() => navigate('/investments')}
            className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white w-full"
          >
            <TrendingUp className="mr-2 h-4 w-4" />
            Adicionar Investimentos
          </Button>

          {/* Reservar Dinheiro */}
          <Dialog open={isGoalDialogOpen} onOpenChange={setIsGoalDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white w-full">
                <PiggyBank className="mr-2 h-4 w-4" />
                Reservar Dinheiro
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-green-800/30">
              <DialogHeader>
                <DialogTitle className="text-white">Reservar Dinheiro</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAddMoneyToGoal} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="goal" className="text-gray-300">Meta</Label>
                  <Select
                    value={goalData.goalId}
                    onValueChange={(value) => setGoalData({...goalData, goalId: value})}
                    required
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue placeholder="Selecione uma meta" />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      {goals.map((goal) => (
                        <SelectItem key={goal.id} value={goal.id} className="text-white">
                          {goal.name}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="goal_amount" className="text-gray-300">Valor</Label>
                  <Input
                    id="goal_amount"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={goalData.amount}
                    onChange={(e) => setGoalData({...goalData, amount: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700"
                >
                  {saving ? 'Salvando...' : 'Reservar Dinheiro'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>

          {/* Ajustar Valor em Conta */}
          <Dialog open={isBalanceDialogOpen} onOpenChange={setIsBalanceDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700 text-white w-full">
                <Wallet className="mr-2 h-4 w-4" />
                Ajustar Valor em Conta
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-green-800/30">
              <DialogHeader>
                <DialogTitle className="text-white">Ajustar Valor em Conta</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleAdjustBalance} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="balance" className="text-gray-300">Novo Valor</Label>
                  <Input
                    id="balance"
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={balanceData.newBalance}
                    onChange={(e) => setBalanceData({...balanceData, newBalance: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>

                <div className="text-sm text-gray-400 bg-gray-800/50 p-3 rounded-lg">
                  <p>Valor atual em conta: R$ {accountBalance.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}</p>
                  <p className="mt-1">Este ajuste refletirá em todo o sistema.</p>
                </div>

                <Button
                  type="submit"
                  disabled={saving}
                  className="w-full bg-gradient-to-r from-yellow-500 to-yellow-600 hover:from-yellow-600 hover:to-yellow-700"
                >
                  {saving ? 'Salvando...' : 'Ajustar Valor'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </CardContent>
    </Card>
  );
};

export default SimplifiedQuickActions;
