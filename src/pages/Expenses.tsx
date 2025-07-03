
import React, { useState } from 'react';
import { useSimplifiedFinancialData } from '@/hooks/useSimplifiedFinancialData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Plus, Edit, Trash2, Receipt, Calendar, DollarSign } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Expenses = () => {
  const { user } = useAuth();
  const { categories, transactions, loading, refetch, updateTransaction, deleteTransaction } = useSimplifiedFinancialData();
  const [newCategory, setNewCategory] = useState({ name: '', color: '#6B7280' });
  const [editingCategory, setEditingCategory] = useState<any>(null);
  const [editingTransaction, setEditingTransaction] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [viewMode, setViewMode] = useState<'monthly' | 'yearly'>('monthly');
  const [selectedPeriod, setSelectedPeriod] = useState<string>(() => {
    if (viewMode === 'yearly') {
      return new Date().getFullYear().toString();
    }
    const now = new Date();
    return `${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`;
  });

  const getFilteredExpenses = () => {
    if (viewMode === 'yearly') {
      const year = parseInt(selectedPeriod);
      return transactions.filter(t => {
        return t.type === 'expense' && t.competence_year === year;
      });
    } else {
      const [year, month] = selectedPeriod.split('-').map(Number);
      return transactions.filter(t => {
        return t.type === 'expense' && 
               t.competence_month === month && 
               t.competence_year === year;
      });
    }
  };

  const monthlyExpenses = getFilteredExpenses();
  const totalExpenses = monthlyExpenses.reduce((sum, t) => sum + Number(t.amount), 0);
  const paidExpenses = monthlyExpenses.filter(t => t.is_paid).reduce((sum, t) => sum + Number(t.amount), 0);
  const unpaidExpenses = monthlyExpenses.filter(t => !t.is_paid).reduce((sum, t) => sum + Number(t.amount), 0);

  const handleAddCategory = async () => {
    if (!user || !newCategory.name.trim()) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('expense_categories')
        .insert({
          name: newCategory.name,
          color: newCategory.color,
          user_id: user.id,
          is_user_created: true
        });

      if (error) throw error;

      toast({
        title: "Categoria criada!",
        description: "Nova categoria de despesa adicionada com sucesso.",
      });

      setNewCategory({ name: '', color: '#6B7280' });
      setIsDialogOpen(false);
      await refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar categoria.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditCategory = async () => {
    if (!editingCategory || !editingCategory.name.trim()) return;
    
    setSaving(true);
    try {
      const { error } = await supabase
        .from('expense_categories')
        .update({
          name: editingCategory.name,
          color: editingCategory.color
        })
        .eq('id', editingCategory.id);

      if (error) throw error;

      toast({
        title: "Categoria atualizada!",
        description: "Categoria editada com sucesso.",
      });

      setEditingCategory(null);
      await refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao editar categoria.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteCategory = async (categoryId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('expense_categories')
        .delete()
        .eq('id', categoryId);

      if (error) throw error;

      toast({
        title: "Categoria excluída!",
        description: "Categoria removida com sucesso.",
      });

      await refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir categoria.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditTransaction = async () => {
    if (!editingTransaction) return;
    
    setSaving(true);
    try {
      const { error } = await updateTransaction(editingTransaction.id, {
        description: editingTransaction.description,
        amount: parseFloat(editingTransaction.amount),
        category_id: editingTransaction.category_id,
        is_paid: editingTransaction.is_paid
      });

      if (error) throw error;

      toast({
        title: "Despesa atualizada!",
        description: "Despesa editada com sucesso.",
      });

      setEditingTransaction(null);
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao editar despesa.",
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
        title: "Despesa excluída!",
        description: "Despesa removida com sucesso.",
      });
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir despesa.",
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

  const generatePeriodOptions = () => {
    if (viewMode === 'yearly') {
      const years = [];
      const currentYear = new Date().getFullYear();
      for (let year = currentYear; year >= currentYear - 5; year--) {
        years.push({ value: year.toString(), label: year.toString() });
      }
      return years;
    } else {
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
      return months;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-green-950 to-slate-900">
      <div className="absolute inset-0 opacity-20" style={{ backgroundImage: `url("${backgroundSvg}")` }}></div>
      
      <div className="relative z-10 container mx-auto px-4 py-8">
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-white flex items-center">
              <Receipt className="mr-3 h-8 w-8 text-green-400" />
              Gestão de Despesas
            </h1>
            <p className="text-gray-400 mt-2">Gerencie suas categorias e despesas</p>
          </div>

          <div className="flex items-center space-x-4">
            <Select value={viewMode} onValueChange={(value: 'monthly' | 'yearly') => {
              setViewMode(value);
              if (value === 'yearly') {
                setSelectedPeriod(new Date().getFullYear().toString());
              } else {
                const now = new Date();
                setSelectedPeriod(`${now.getFullYear()}-${(now.getMonth() + 1).toString().padStart(2, '0')}`);
              }
            }}>
              <SelectTrigger className="w-32 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectItem value="monthly" className="text-white">Mensal</SelectItem>
                <SelectItem value="yearly" className="text-white">Anual</SelectItem>
              </SelectContent>
            </Select>

            <Calendar className="h-5 w-5 text-gray-400" />
            <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
              <SelectTrigger className="w-48 bg-gray-800 border-gray-700 text-white">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                {generatePeriodOptions().map((period) => (
                  <SelectItem key={period.value} value={period.value} className="text-white">
                    {period.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Resumo das Despesas */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Total de Despesas</CardTitle>
              <DollarSign className="h-4 w-4 text-red-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-400">
                R$ {totalExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-400">
                {monthlyExpenses.length} despesa(s) no período
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">Despesas Pagas</CardTitle>
              <Receipt className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                R$ {paidExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-400">
                {monthlyExpenses.filter(t => t.is_paid).length} paga(s)
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-300">A Pagar</CardTitle>
              <Calendar className="h-4 w-4 text-orange-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-400">
                R$ {unpaidExpenses.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-400">
                {monthlyExpenses.filter(t => !t.is_paid).length} pendente(s)
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Categorias */}
          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader className="flex flex-row items-center justify-between">
              <CardTitle className="text-white">Categorias de Despesa</CardTitle>
              <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                <DialogTrigger asChild>
                  <Button className="bg-green-600 hover:bg-green-700">
                    <Plus className="h-4 w-4 mr-2" />
                    Nova Categoria
                  </Button>
                </DialogTrigger>
                <DialogContent className="bg-gray-900 border-gray-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Nova Categoria</DialogTitle>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div>
                      <Label htmlFor="name" className="text-gray-300">Nome</Label>
                      <Input
                        id="name"
                        value={newCategory.name}
                        onChange={(e) => setNewCategory({...newCategory, name: e.target.value})}
                        className="bg-gray-800 border-gray-700 text-white"
                        placeholder="Nome da categoria"
                      />
                    </div>
                    <div>
                      <Label htmlFor="color" className="text-gray-300">Cor</Label>
                      <Input
                        id="color"
                        type="color"
                        value={newCategory.color}
                        onChange={(e) => setNewCategory({...newCategory, color: e.target.value})}
                        className="bg-gray-800 border-gray-700 h-12 w-full"
                      />
                    </div>
                    <Button 
                      onClick={handleAddCategory}
                      disabled={saving}
                      className="w-full bg-green-600 hover:bg-green-700"
                    >
                      {saving ? 'Salvando...' : 'Criar Categoria'}
                    </Button>
                  </div>
                </DialogContent>
              </Dialog>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {categories.map((category) => (
                  <div key={category.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg">
                    <div className="flex items-center space-x-3">
                      <button
                        onClick={() => setEditingCategory(category)}
                        className="flex items-center space-x-3 hover:bg-gray-700/50 p-1 rounded transition-colors"
                      >
                        <div 
                          className="w-4 h-4 rounded-full" 
                          style={{ backgroundColor: category.color }}
                        ></div>
                        <span className="text-white font-medium">{category.name}</span>
                      </button>
                    </div>
                    <div className="flex space-x-2">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => setEditingCategory(category)}
                        className="text-gray-400 hover:text-white"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteCategory(category.id)}
                        className="text-red-400 hover:text-red-300"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Despesas */}
        <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
          <CardHeader>
            <CardTitle className="text-white">Despesas do Período</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {monthlyExpenses.length > 0 ? (
                monthlyExpenses.map((expense) => {
                  const category = categories.find(c => c.id === expense.category_id);
                  return (
                    <div key={expense.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg">
                      <div className="flex-1">
                        <div className="flex items-center space-x-3">
                          <div 
                            className="w-3 h-3 rounded-full" 
                            style={{ backgroundColor: category?.color || '#6B7280' }}
                          ></div>
                          <div>
                            <h4 className="text-white font-medium">{expense.description}</h4>
                            <p className="text-sm text-gray-400">
                              {category?.name} • {new Date(expense.date).toLocaleDateString('pt-BR')}
                              {expense.is_recurring && (
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
                          <p className="text-lg font-bold text-red-400">
                            R$ {Number(expense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                          </p>
                          <p className="text-sm text-gray-400">
                            {expense.is_paid ? 'Pago' : 'Pendente'}
                          </p>
                        </div>
                        
                        <div className="flex space-x-2">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setEditingTransaction({
                              ...expense,
                              amount: expense.amount.toString()
                            })}
                            className="text-gray-400 hover:text-white"
                          >
                            <Edit className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => handleDeleteTransaction(expense.id)}
                            className="text-red-400 hover:text-red-300"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  );
                })
              ) : (
                <div className="text-center text-gray-400 py-8">
                  <Receipt className="h-12 w-12 mx-auto mb-4 opacity-50" />
                  <p>Nenhuma despesa encontrada para este período.</p>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dialog para editar categoria */}
        {editingCategory && (
          <Dialog open={!!editingCategory} onOpenChange={() => setEditingCategory(null)}>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Editar Categoria</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="edit-name" className="text-gray-300">Nome</Label>
                  <Input
                    id="edit-name"
                    value={editingCategory.name}
                    onChange={(e) => setEditingCategory({...editingCategory, name: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                  />
                </div>
                <div>
                  <Label htmlFor="edit-color" className="text-gray-300">Cor</Label>
                  <Input
                    id="edit-color"
                    type="color"
                    value={editingCategory.color}
                    onChange={(e) => setEditingCategory({...editingCategory, color: e.target.value})}
                    className="bg-gray-800 border-gray-700 h-12 w-full"
                  />
                </div>
                <Button 
                  onClick={handleEditCategory}
                  disabled={saving}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {saving ? 'Salvando...' : 'Salvar Alterações'}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        )}

        {/* Dialog para editar despesa */}
        {editingTransaction && (
          <Dialog open={!!editingTransaction} onOpenChange={() => setEditingTransaction(null)}>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Editar Despesa</DialogTitle>
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
                <div>
                  <Label htmlFor="edit-category" className="text-gray-300">Categoria</Label>
                  <Select
                    value={editingTransaction.category_id || ''}
                    onValueChange={(value) => setEditingTransaction({...editingTransaction, category_id: value})}
                  >
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

export default Expenses;
