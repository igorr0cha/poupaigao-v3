
import React, { useState } from 'react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Checkbox } from '@/components/ui/checkbox';
import { Plus, Edit, Trash2, Receipt, TrendingUp, TrendingDown, Calendar } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Transactions = () => {
  const { 
    transactions, 
    categories, 
    addTransaction, 
    markTransactionAsPaid, 
    loading 
  } = useFinancialData();

  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [newTransaction, setNewTransaction] = useState({
    type: 'expense' as 'income' | 'expense',
    amount: '',
    description: '',
    category_id: '',
    date: new Date().toISOString().split('T')[0],
    is_recurring: false,
    recurring_day: '',
    due_date: '',
    competence_month: new Date().getMonth() + 1,
    competence_year: new Date().getFullYear()
  });

  const handleAddTransaction = async () => {
    if (!newTransaction.amount || !newTransaction.description) {
      toast({
        title: "Erro",
        description: "Por favor, preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setSaving(true);
    try {
      const transactionData = {
        type: newTransaction.type,
        amount: parseFloat(newTransaction.amount),
        description: newTransaction.description,
        date: newTransaction.date,
        category_id: newTransaction.category_id || undefined,
        is_recurring: newTransaction.is_recurring,
        recurring_day: newTransaction.is_recurring ? parseInt(newTransaction.recurring_day) : undefined,
        due_date: newTransaction.due_date || undefined,
        competence_month: newTransaction.competence_month,
        competence_year: newTransaction.competence_year,
        is_paid: true // Por padrão, transações são marcadas como pagas
      };

      const { error } = await addTransaction(transactionData);

      if (error) throw error;

      toast({
        title: "Transação adicionada!",
        description: `${newTransaction.type === 'income' ? 'Receita' : 'Despesa'} registrada com sucesso.`,
      });

      setNewTransaction({
        type: 'expense',
        amount: '',
        description: '',
        category_id: '',
        date: new Date().toISOString().split('T')[0],
        is_recurring: false,
        recurring_day: '',
        due_date: '',
        competence_month: new Date().getMonth() + 1,
        competence_year: new Date().getFullYear()
      });
      setIsDialogOpen(false);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao adicionar transação.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleMarkAsPaid = async (transactionId: string) => {
    try {
      const { error } = await markTransactionAsPaid(transactionId);
      
      if (error) throw error;

      toast({
        title: "Transação atualizada!",
        description: "Transação marcada como paga.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar transação.",
        variant: "destructive",
      });
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
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Receipt className="mr-3 h-8 w-8 text-green-400" />
              Transações
            </h1>
            <p className="text-gray-400 mt-2">Gerencie suas receitas e despesas</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Transação
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700 max-w-2xl">
              <DialogHeader>
                <DialogTitle className="text-white">Nova Transação</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="type" className="text-gray-300">Tipo</Label>
                    <Select value={newTransaction.type} onValueChange={(value: 'income' | 'expense') => setNewTransaction({...newTransaction, type: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        <SelectItem value="income" className="text-white">Receita</SelectItem>
                        <SelectItem value="expense" className="text-white">Despesa</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="amount" className="text-gray-300">Valor</Label>
                    <Input
                      id="amount"
                      type="number"
                      step="0.01"
                      value={newTransaction.amount}
                      onChange={(e) => setNewTransaction({...newTransaction, amount: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white"
                      placeholder="0.00"
                    />
                  </div>
                </div>

                <div>
                  <Label htmlFor="description" className="text-gray-300">Descrição</Label>
                  <Input
                    id="description"
                    value={newTransaction.description}
                    onChange={(e) => setNewTransaction({...newTransaction, description: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Descrição da transação"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="category" className="text-gray-300">Categoria</Label>
                    <Select value={newTransaction.category_id} onValueChange={(value) => setNewTransaction({...newTransaction, category_id: value})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {categories.map((category) => (
                          <SelectItem key={category.id} value={category.id} className="text-white">
                            {category.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="date" className="text-gray-300">Data</Label>
                    <Input
                      id="date"
                      type="date"
                      value={newTransaction.date}
                      onChange={(e) => setNewTransaction({...newTransaction, date: e.target.value})}
                      className="bg-gray-800 border-gray-700 text-white"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="competence-month" className="text-gray-300">Mês de Competência</Label>
                    <Select value={newTransaction.competence_month.toString()} onValueChange={(value) => setNewTransaction({...newTransaction, competence_month: parseInt(value)})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {[1,2,3,4,5,6,7,8,9,10,11,12].map((month) => (
                          <SelectItem key={month} value={month.toString()} className="text-white">
                            {new Date(2024, month - 1).toLocaleDateString('pt-BR', { month: 'long' })}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="competence-year" className="text-gray-300">Ano de Competência</Label>
                    <Select value={newTransaction.competence_year.toString()} onValueChange={(value) => setNewTransaction({...newTransaction, competence_year: parseInt(value)})}>
                      <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-gray-800 border-gray-700">
                        {[2024, 2025, 2026].map((year) => (
                          <SelectItem key={year} value={year.toString()} className="text-white">
                            {year}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                {newTransaction.type === 'expense' && (
                  <>
                    <div>
                      <Label htmlFor="due-date" className="text-gray-300">Data de Vencimento (opcional)</Label>
                      <Input
                        id="due-date"
                        type="date"
                        value={newTransaction.due_date}
                        onChange={(e) => setNewTransaction({...newTransaction, due_date: e.target.value})}
                        className="bg-gray-800 border-gray-700 text-white"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex items-center space-x-3 p-4 bg-green-800/20 border border-green-600/30 rounded-lg">
                        <Checkbox
                          id="is-recurring"
                          checked={newTransaction.is_recurring}
                          onCheckedChange={(checked) => setNewTransaction({...newTransaction, is_recurring: !!checked})}
                          className="border-green-400 data-[state=checked]:bg-green-600 data-[state=checked]:border-green-600"
                        />
                        <div>
                          <Label htmlFor="is-recurring" className="text-green-300 font-medium text-base">
                            Despesa Recorrente
                          </Label>
                          <p className="text-sm text-green-200/70">
                            Esta despesa se repete mensalmente
                          </p>
                        </div>
                      </div>

                      {newTransaction.is_recurring && (
                        <div>
                          <Label htmlFor="recurring-day" className="text-gray-300">Dia do Vencimento</Label>
                          <Input
                            id="recurring-day"
                            type="number"
                            min="1"
                            max="31"
                            value={newTransaction.recurring_day}
                            onChange={(e) => setNewTransaction({...newTransaction, recurring_day: e.target.value})}
                            className="bg-gray-800 border-gray-700 text-white"
                            placeholder="Dia do mês (1-31)"
                          />
                        </div>
                      )}
                    </div>
                  </>
                )}

                <Button 
                  onClick={handleAddTransaction}
                  disabled={saving}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {saving ? 'Salvando...' : 'Adicionar Transação'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Lista de Transações */}
        <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
          <CardHeader>
            <CardTitle className="text-white">Transações Recentes</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {transactions.length > 0 ? (
                transactions.slice(0, 20).map((transaction) => {
                  const category = categories.find(c => c.id === transaction.category_id);
                  return (
                    <div key={transaction.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex items-center space-x-4">
                        <div className={`p-3 rounded-full ${transaction.type === 'income' ? 'bg-green-500/20' : 'bg-red-500/20'}`}>
                          {transaction.type === 'income' ? (
                            <TrendingUp className="h-5 w-5 text-green-400" />
                          ) : (
                            <TrendingDown className="h-5 w-5 text-red-400" />
                          )}
                        </div>
                        <div>
                          <h4 className="text-white font-medium">{transaction.description}</h4>
                          <p className="text-sm text-gray-400">
                            {category?.name || 'Sem categoria'} • {new Date(transaction.date).toLocaleDateString('pt-BR')}
                            {transaction.is_recurring && (
                              <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                Recorrente
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                      
                      <div className="flex items-center space-x-4">
                        <div className="text-right">
                          <p className={`text-lg font-bold ${transaction.type === 'income' ? 'text-green-400' : 'text-red-400'}`}>
                            {transaction.type === 'income' ? '+' : '-'}R$ {Number(transaction.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-sm text-gray-400">
                            {transaction.is_paid ? 'Confirmado' : 'Pendente'}
                          </p>
                        </div>
                        
                        {!transaction.is_paid && (
                          <Button
                            size="sm"
                            onClick={() => handleMarkAsPaid(transaction.id)}
                            className="bg-green-600 hover:bg-green-700"
                          >
                            Marcar como Pago
                          </Button>
                        )}
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma transação encontrada.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default Transactions;
