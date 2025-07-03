
import React, { useState } from 'react';
import { useSimplifiedFinancialData } from '@/hooks/useSimplifiedFinancialData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Edit, Trash2, TrendingUp, Calendar, DollarSign } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

const Revenues = () => {
  const { transactions, loading, updateTransaction, deleteTransaction } = useSimplifiedFinancialData();
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [saving, setSaving] = useState(false);
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  const [year, month] = selectedMonth.split('-').map(Number);
  
  const monthlyRevenues = transactions.filter(t => {
    return t.type === 'income' && 
           t.competence_month === month && 
           t.competence_year === year;
  });

  const totalRevenues = monthlyRevenues.reduce((sum, t) => sum + Number(t.amount), 0);
  const paidRevenues = monthlyRevenues.filter(t => t.is_paid).reduce((sum, t) => sum + Number(t.amount), 0);
  const unpaidRevenues = monthlyRevenues.filter(t => !t.is_paid).reduce((sum, t) => sum + Number(t.amount), 0);

  const handleEditTransaction = async () => {
    if (!editingTransaction) return;
    
    setSaving(true);
    try {
      const { error } = await updateTransaction(editingTransaction.id, {
        description: editingTransaction.description,
        amount: parseFloat(editingTransaction.amount),
        is_paid: editingTransaction.is_paid
      });

      if (error) throw error;

      toast({
        title: "Receita atualizada!",
        description: "Receita editada com sucesso.",
      });

      setEditingTransaction(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao editar receita.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteTransaction = async (transactionId: string) => {
    setSaving(true);
    try {
      const { error } = await deleteTransaction(transactionId);

      if (error) throw error;

      toast({
        title: "Receita excluída!",
        description: "Receita removida com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir receita.",
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

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("${backgroundSvg}")` }}></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <TrendingUp className="mr-3 h-8 w-8 text-green-400" />
              Gestão de Receitas
            </h1>
            <p className="text-gray-400 mt-2">Gerencie suas receitas mensais</p>
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

        {/* Resumo das Receitas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total de Receitas</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                R$ {totalRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-400">
                {monthlyRevenues.length} receita(s) no mês
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Receitas Recebidas</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                R$ {paidRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-400">
                {monthlyRevenues.filter(t => t.is_paid).length} recebida(s)
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">A Receber</CardTitle>
              <Calendar className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                R$ {unpaidRevenues.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-400">
                {monthlyRevenues.filter(t => !t.is_paid).length} pendente(s)
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Receitas */}
        <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
          <CardHeader>
            <CardTitle className="text-white">Receitas do Mês</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyRevenues.length > 0 ? (
                monthlyRevenues.map((revenue) => (
                  <div key={revenue.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                    <div className="flex-1">
                      <div className="flex items-center space-x-3">
                        <div className="w-3 h-3 rounded-full bg-green-400"></div>
                        <div>
                          <h4 className="text-white font-medium">{revenue.description}</h4>
                          <p className="text-sm text-gray-400">
                            {new Date(revenue.date).toLocaleDateString('pt-BR')}
                            {revenue.is_recurring && (
                              <span className="ml-2 text-xs bg-blue-500/20 text-blue-300 px-2 py-1 rounded">
                                Recorrente
                              </span>
                            )}
                          </p>
                        </div>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <p className="text-lg font-bold text-green-400">
                          R$ {Number(revenue.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-sm text-gray-400">
                          {revenue.is_paid ? 'Recebido' : 'Pendente'}
                        </p>
                      </div>
                      
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => setEditingTransaction({
                            ...revenue,
                            amount: revenue.amount.toString()
                          })}
                          className="text-gray-400 hover:text-white"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteTransaction(revenue.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma receita encontrada para este mês.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialog para editar receita */}
        {editingTransaction && (
          <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Editar Receita</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-description" className="text-gray-300">Descrição</Label>
                  <Input
                    id="edit-description"
                    value={editingTransaction.description}
                    onChange={(e) => setEditingTransaction({...editingTransaction, description: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-amount" className="text-gray-300">Valor</Label>
                  <Input
                    id="edit-amount"
                    type="number"
                    step="0.01"
                    value={editingTransaction.amount}
                    onChange={(e) => setEditingTransaction({...editingTransaction, amount: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <Button 
                  onClick={handleEditTransaction}
                  disabled={saving}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Revenues;
