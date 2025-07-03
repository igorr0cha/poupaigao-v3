
import React, { useState } from 'react';
import { useSimplifiedFinancialData } from '@/hooks/useSimplifiedFinancialData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Progress } from '@/components/ui/progress';
import { Target, Plus, Trash2, AlertCircle, Edit } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Goals = () => {
  const { user } = useAuth();
  const { goals, loading, refetch } = useSimplifiedFinancialData();
  const [newGoal, setNewGoal] = useState({
    name: '',
    target_amount: '',
    priority: 'medium' as 'high' | 'medium' | 'low'
  });
  const [editingGoal, setEditingGoal] = useState<any>(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

  const handleCreateGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('financial_goals')
        .insert({
          name: newGoal.name,
          target_amount: parseFloat(newGoal.target_amount),
          priority: newGoal.priority,
          user_id: user?.id,
          current_amount: 0
        });

      if (error) throw error;

      toast({
        title: "Meta criada!",
        description: "Sua nova meta foi adicionada com sucesso.",
      });

      setNewGoal({ name: '', target_amount: '', priority: 'medium' });
      setIsDialogOpen(false);
      await refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao criar meta.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleEditGoal = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const { error } = await supabase
        .from('financial_goals')
        .update({
          name: editingGoal.name,
          target_amount: parseFloat(editingGoal.target_amount),
          priority: editingGoal.priority,
          current_amount: parseFloat(editingGoal.current_amount)
        })
        .eq('id', editingGoal.id);

      if (error) throw error;

      toast({
        title: "Meta atualizada!",
        description: "As alterações foram salvas com sucesso.",
      });

      setEditingGoal(null);
      setIsEditDialogOpen(false);
      await refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar meta.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteGoal = async (goalId: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('financial_goals')
        .delete()
        .eq('id', goalId);

      if (error) throw error;

      toast({
        title: "Meta excluída!",
        description: "Meta removida com sucesso.",
      });

      setDeleteConfirm(null);
      await refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir meta.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const openEditDialog = (goal: any) => {
    setEditingGoal({
      id: goal.id,
      name: goal.name,
      target_amount: goal.target_amount.toString(),
      current_amount: goal.current_amount.toString(),
      priority: goal.priority
    });
    setIsEditDialogOpen(true);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500 bg-red-500/10';
      case 'medium': return 'border-yellow-500 bg-yellow-500/10';
      case 'low': return 'border-green-500 bg-green-500/10';
      default: return 'border-gray-500 bg-gray-500/10';
    }
  };

  const getPriorityText = (priority: string) => {
    switch (priority) {
      case 'high': return 'Alta';
      case 'medium': return 'Média';
      case 'low': return 'Baixa';
      default: return 'Não definida';
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
              <Target className="mr-3 h-8 w-8 text-green-400" />
              Metas Financeiras
            </h1>
            <p className="text-gray-400 mt-2">Defina e acompanhe seus objetivos financeiros</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Nova Meta
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Criar Nova Meta</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateGoal} className="space-y-4">
                <div>
                  <Label htmlFor="name" className="text-gray-300">Nome da Meta</Label>
                  <Input
                    id="name"
                    value={newGoal.name}
                    onChange={(e) => setNewGoal({...newGoal, name: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Ex: Viagem de férias"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="target_amount" className="text-gray-300">Valor Objetivo</Label>
                  <Input
                    id="target_amount"
                    type="number"
                    step="0.01"
                    value={newGoal.target_amount}
                    onChange={(e) => setNewGoal({...newGoal, target_amount: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="priority" className="text-gray-300">Prioridade</Label>
                  <Select
                    value={newGoal.priority}
                    onValueChange={(value: 'high' | 'medium' | 'low') => setNewGoal({...newGoal, priority: value})}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="high" className="text-white">Alta</SelectItem>
                      <SelectItem value="medium" className="text-white">Média</SelectItem>
                      <SelectItem value="low" className="text-white">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <Button 
                  type="submit"
                  disabled={saving}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {saving ? 'Criando...' : 'Criar Meta'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {goals.map((goal) => {
            const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
            
            return (
              <Card key={goal.id} className={`backdrop-blur-sm bg-black/40 border-2 ${getPriorityColor(goal.priority)}`}>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-white text-lg">{goal.name}</CardTitle>
                  <div className="flex items-center space-x-2">
                    <span className="text-xs text-gray-400 bg-gray-800 px-2 py-1 rounded">
                      {getPriorityText(goal.priority)}
                    </span>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => openEditDialog(goal)}
                      className="text-blue-400 hover:text-blue-300 p-1"
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={() => setDeleteConfirm(goal.id)}
                      className="text-red-400 hover:text-red-300 p-1"
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-2">
                      <span className="text-gray-300">Progresso</span>
                      <span className="text-green-400 font-bold">{progress.toFixed(1)}%</span>
                    </div>
                    <Progress value={progress} className="h-2" />
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <div>
                      <p className="text-sm text-gray-400">Atual</p>
                      <p className="text-lg font-bold text-green-400">
                        R$ {Number(goal.current_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-gray-400">Meta</p>
                      <p className="text-lg font-bold text-white">
                        R$ {Number(goal.target_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>

        {goals.length === 0 && (
          <div className="text-center py-12">
            <Target className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-medium text-white mb-2">Nenhuma meta criada</h3>
            <p className="text-gray-400">Comece criando sua primeira meta financeira!</p>
          </div>
        )}

        {/* Dialog de edição */}
        {editingGoal && (
          <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Editar Meta</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleEditGoal} className="space-y-4">
                <div>
                  <Label htmlFor="edit_name" className="text-gray-300">Nome da Meta</Label>
                  <Input
                    id="edit_name"
                    value={editingGoal.name}
                    onChange={(e) => setEditingGoal({...editingGoal, name: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_target_amount" className="text-gray-300">Valor Objetivo</Label>
                  <Input
                    id="edit_target_amount"
                    type="number"
                    step="0.01"
                    value={editingGoal.target_amount}
                    onChange={(e) => setEditingGoal({...editingGoal, target_amount: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_current_amount" className="text-gray-300">Valor Atual</Label>
                  <Input
                    id="edit_current_amount"
                    type="number"
                    step="0.01"
                    value={editingGoal.current_amount}
                    onChange={(e) => setEditingGoal({...editingGoal, current_amount: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_priority" className="text-gray-300">Prioridade</Label>
                  <Select
                    value={editingGoal.priority}
                    onValueChange={(value: 'high' | 'medium' | 'low') => setEditingGoal({...editingGoal, priority: value})}
                  >
                    <SelectTrigger className="bg-gray-800 border-gray-700 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-gray-800 border-gray-700">
                      <SelectItem value="high" className="text-white">Alta</SelectItem>
                      <SelectItem value="medium" className="text-white">Média</SelectItem>
                      <SelectItem value="low" className="text-white">Baixa</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={saving}
                    className="bg-green-600 hover:bg-green-700"
                  >
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        )}

        {/* Dialog de confirmação de exclusão */}
        {deleteConfirm && (
          <Dialog open={!!deleteConfirm} onOpenChange={() => setDeleteConfirm(null)}>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-red-400" />
                  Confirmar Exclusão
                </DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <p className="text-gray-300">
                  Tem certeza que deseja excluir esta meta? Esta ação não pode ser desfeita.
                </p>
                <div className="flex justify-end space-x-2">
                  <Button
                    variant="outline"
                    onClick={() => setDeleteConfirm(null)}
                    className="border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancelar
                  </Button>
                  <Button
                    onClick={() => handleDeleteGoal(deleteConfirm)}
                    disabled={saving}
                    className="bg-red-600 hover:bg-red-700"
                  >
                    {saving ? 'Excluindo...' : 'Excluir Meta'}
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  );
};

export default Goals;
