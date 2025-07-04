import React, { useState } from 'react';
import { useSimplifiedFinancialData } from '@/hooks/useSimplifiedFinancialData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { TrendingUp, Plus, Trash2, Edit, DollarSign } from 'lucide-react';
import { toast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

const Investments = () => {
  const { user } = useAuth();
  const { investments, investmentTypes, loading, refetch } = useSimplifiedFinancialData();
  const [newInvestment, setNewInvestment] = useState({
    asset_name: '',
    asset_type_id: '',
    quantity: '',
    average_price: ''
  });
  const [editingInvestment, setEditingInvestment] = useState(null);
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [saving, setSaving] = useState(false);

  const handleCreateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const totalInvested = parseFloat(newInvestment.quantity) * parseFloat(newInvestment.average_price);
      
      const { error } = await supabase
        .from('investments')
        .insert({
          asset_name: newInvestment.asset_name,
          asset_type_id: newInvestment.asset_type_id,
          quantity: parseFloat(newInvestment.quantity),
          average_price: parseFloat(newInvestment.average_price),
          // total_invested: totalInvested,
          user_id: user?.id
        });

      if (error) throw error;

      toast({
        title: "Investimento adicionado!",
        description: "Seu investimento foi registrado com sucesso.",
      });

      setNewInvestment({ asset_name: '', asset_type_id: '', quantity: '', average_price: '' });
      setIsDialogOpen(false);
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

  const handleEditInvestment = (investment: any) => {
    setEditingInvestment({
      id: investment.id,
      asset_name: investment.asset_name,
      asset_type_id: investment.asset_type_id,
      quantity: investment.quantity.toString(),
      average_price: investment.average_price.toString()
    });
    setIsEditDialogOpen(true);
  };

  const handleUpdateInvestment = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);

    try {
      const totalInvested = parseFloat(editingInvestment.quantity) * parseFloat(editingInvestment.average_price);
      
      const { error } = await supabase
        .from('investments')
        .update({
          asset_name: editingInvestment.asset_name,
          asset_type_id: editingInvestment.asset_type_id,
          quantity: parseFloat(editingInvestment.quantity),
          average_price: parseFloat(editingInvestment.average_price),
          total_invested: totalInvested,
        })
        .eq('id', editingInvestment.id);

      if (error) throw error;

      toast({
        title: "Investimento atualizado!",
        description: "Seu investimento foi atualizado com sucesso.",
      });

      setEditingInvestment(null);
      setIsEditDialogOpen(false);
      await refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao atualizar investimento.",
        variant: "destructive",
      });
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteInvestment = async (id: string) => {
    if (!confirm('Tem certeza que deseja excluir este investimento?')) return;

    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id);

      if (error) throw error;

      toast({
        title: "Investimento excluído!",
        description: "Investimento removido com sucesso.",
      });

      await refetch();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao excluir investimento.",
        variant: "destructive",
      });
    }
  };

  const getInvestmentsByType = () => {
    const typeMap = new Map();
    
    investments.forEach(investment => {
      const typeName = investment.asset_type?.name || 'Outros';
      const currentValue = typeMap.get(typeName) || 0;
      typeMap.set(typeName, currentValue + Number(investment.total_invested));
    });

    const colors = ['#10B981', '#3B82F6', '#EF4444', '#F59E0B', '#8B5CF6', '#EC4899', '#06B6D4', '#84CC16'];
    
    return Array.from(typeMap.entries()).map(([name, value], index) => ({
      name,
      value,
      color: colors[index % colors.length]
    }));
  };

  const investmentByType = getInvestmentsByType();
  const totalInvested = investments.reduce((sum, inv) => sum + Number(inv.total_invested), 0);

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0];
      const percentage = ((data.value / totalInvested) * 100).toFixed(1);
      return (
        <div className="bg-gray-900 border border-green-500/30 rounded-lg p-4 shadow-xl">
          <div className="flex items-center space-x-2 mb-2">
            <div 
              className="w-4 h-4 rounded-full shadow-sm" 
              style={{ backgroundColor: data.payload.color }}
            />
            <span className="text-white font-medium">{data.payload.name}</span>
          </div>
          <div className="space-y-1">
            <p className="text-green-400 font-bold text-lg">
              R$ {data.value.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
            </p>
            <p className="text-gray-400 text-sm">
              {percentage}% do portfólio
            </p>
            <p className="text-blue-400 text-sm">
              {investments.filter(inv => inv.asset_type?.name === data.payload.name).length} ativos
            </p>
          </div>
        </div>
      );
    }
    return null;
  };

  const CustomLegend = ({ payload }: any) => {
    return (
      <div className="flex flex-wrap justify-center gap-4 mt-6">
        {payload.map((entry: any, index: number) => {
          const percentage = ((entry.payload.value / totalInvested) * 100).toFixed(1);
          return (
            <div key={index} className="flex items-center space-x-2 bg-gray-800/50 px-3 py-2 rounded-lg">
              <div 
                className="w-4 h-4 rounded-full shadow-sm" 
                style={{ backgroundColor: entry.color }}
              />
              <div className="text-left">
                <span className="text-white text-sm font-medium block">{entry.value}</span>
                <span className="text-gray-400 text-xs">{percentage}%</span>
              </div>
            </div>
          );
        })}
      </div>
    );
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
              <TrendingUp className="mr-3 h-8 w-8 text-green-400" />
              Investimentos
            </h1>
            <p className="text-gray-400 mt-2">Gerencie sua carteira de investimentos</p>
          </div>

          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="bg-green-600 hover:bg-green-700">
                <Plus className="h-4 w-4 mr-2" />
                Novo Investimento
              </Button>
            </DialogTrigger>
            <DialogContent className="bg-gray-900 border-gray-700">
              <DialogHeader>
                <DialogTitle className="text-white">Adicionar Investimento</DialogTitle>
              </DialogHeader>
              <form onSubmit={handleCreateInvestment} className="space-y-4">
                <div>
                  <Label htmlFor="asset_name" className="text-gray-300">Nome do Ativo</Label>
                  <Input
                    id="asset_name"
                    value={newInvestment.asset_name}
                    onChange={(e) => setNewInvestment({...newInvestment, asset_name: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Ex: PETR4, Bitcoin, Tesouro Direto"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="asset_type_id" className="text-gray-300">Tipo de Investimento</Label>
                  <Select
                    value={newInvestment.asset_type_id}
                    onValueChange={(value) => setNewInvestment({...newInvestment, asset_type_id: value})}
                  >
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
                    value={newInvestment.quantity}
                    onChange={(e) => setNewInvestment({...newInvestment, quantity: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="average_price" className="text-gray-300">Preço Médio</Label>
                  <Input
                    id="average_price"
                    type="number"
                    step="0.01"
                    value={newInvestment.average_price}
                    onChange={(e) => setNewInvestment({...newInvestment, average_price: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="0.00"
                    required
                  />
                </div>
                <Button 
                  type="submit"
                  disabled={saving}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  {saving ? 'Adicionando...' : 'Adicionar Investimento'}
                </Button>
              </form>
            </DialogContent>
          </Dialog>
        </div>

        {/* Resumo dos Investimentos */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Total Investido</CardTitle>
              <DollarSign className="h-4 w-4 text-green-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-400">
                R$ {totalInvested.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Em {investments.length} ativos
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Tipos de Ativos</CardTitle>
              <TrendingUp className="h-4 w-4 text-blue-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-400">
                {investmentByType.length}
              </div>
              <p className="text-xs text-gray-400 mt-1">
                Diversificação
              </p>
            </CardContent>
          </Card>

          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-gray-400">Maior Posição</CardTitle>
              <TrendingUp className="h-4 w-4 text-purple-400" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-400">
                {investmentByType.length > 0 ? 
                  `${((Math.max(...investmentByType.map(i => i.value)) / totalInvested) * 100).toFixed(1)}%` 
                  : '0%'
                }
              </div>
              <p className="text-xs text-gray-400 mt-1">
                {investmentByType.length > 0 ? 
                  investmentByType.reduce((max, curr) => curr.value > max.value ? curr : max).name 
                  : 'Nenhum ativo'
                }
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Gráfico de Distribuição Melhorado */}
          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader>
              <CardTitle className="text-white">Distribuição por Tipo</CardTitle>
            </CardHeader>
            <CardContent>
              {investmentByType.length > 0 ? (
                <div className="h-96">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <defs>
                        {investmentByType.map((entry, index) => (
                          <linearGradient key={index} id={`investmentGradient-${index}`} x1="0%" y1="0%" x2="100%" y2="100%">
                            <stop offset="0%" stopColor={entry.color} stopOpacity={0.9} />
                            <stop offset="100%" stopColor={entry.color} stopOpacity={0.7} />
                          </linearGradient>
                        ))}
                      </defs>
                      <Pie
                        data={investmentByType}
                        cx="50%"
                        cy="40%"
                        innerRadius={60}
                        outerRadius={120}
                        paddingAngle={4}
                        dataKey="value"
                        stroke="#374151"
                        strokeWidth={2}
                      >
                        {investmentByType.map((entry, index) => (
                          <Cell 
                            key={`cell-${index}`} 
                            fill={`url(#investmentGradient-${index})`}
                            className="hover:opacity-80 transition-opacity duration-200 cursor-pointer"
                            style={{
                              filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.3))'
                            }}
                          />
                        ))}
                      </Pie>
                      <Tooltip content={<CustomTooltip />} />
                      <Legend content={<CustomLegend />} />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              ) : (
                <div className="text-center py-12">
                  <TrendingUp className="mx-auto h-16 w-16 text-gray-400 mb-4" />
                  <h3 className="text-xl font-medium text-white mb-2">Nenhum investimento</h3>
                  <p className="text-gray-400">Adicione seus investimentos para ver a distribuição</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Lista de Investimentos */}
          <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
            <CardHeader>
              <CardTitle className="text-white">Carteira de Investimentos</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {investments.map((investment) => (
                  <div key={investment.id} className="flex items-center justify-between p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
                    <div className="flex-1">
                      <h4 className="text-white font-medium">{investment.asset_name}</h4>
                      <p className="text-sm text-gray-400">{investment.asset_type?.name}</p>
                      <p className="text-xs text-gray-500">
                        {Number(investment.quantity).toLocaleString('pt-BR')} × R$ {Number(investment.average_price).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                      </p>
                    </div>
                    <div className="flex items-center space-x-3">
                      <div className="text-right">
                        <p className="text-green-400 font-bold">
                          R$ {Number(investment.total_invested).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                        </p>
                        <p className="text-xs text-gray-400">
                          {((Number(investment.total_invested) / totalInvested) * 100).toFixed(1)}%
                        </p>
                      </div>
                      <div className="flex space-x-2">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleEditInvestment(investment)}
                          className="text-blue-400 hover:text-blue-300 hover:bg-blue-500/20"
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteInvestment(investment.id)}
                          className="text-red-400 hover:text-red-300 hover:bg-red-500/20"
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
                
                {investments.length === 0 && (
                  <div className="text-center py-8">
                    <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <p className="text-gray-400">Nenhum investimento cadastrado</p>
                    <p className="text-sm text-gray-500 mt-1">Adicione seus investimentos para começar</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Diálogo de Edição */}
        <Dialog open={isEditDialogOpen} onOpenChange={setIsEditDialogOpen}>
          <DialogContent className="bg-gray-900 border-gray-700">
            <DialogHeader>
              <DialogTitle className="text-white">Editar Investimento</DialogTitle>
            </DialogHeader>
            {editingInvestment && (
              <form onSubmit={handleUpdateInvestment} className="space-y-4">
                <div>
                  <Label htmlFor="edit_asset_name" className="text-gray-300">Nome do Ativo</Label>
                  <Input
                    id="edit_asset_name"
                    value={editingInvestment.asset_name}
                    onChange={(e) => setEditingInvestment({...editingInvestment, asset_name: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="Ex: PETR4, Bitcoin, Tesouro Direto"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_asset_type_id" className="text-gray-300">Tipo de Investimento</Label>
                  <Select
                    value={editingInvestment.asset_type_id}
                    onValueChange={(value) => setEditingInvestment({...editingInvestment, asset_type_id: value})}
                  >
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
                  <Label htmlFor="edit_quantity" className="text-gray-300">Quantidade</Label>
                  <Input
                    id="edit_quantity"
                    type="number"
                    step="0.01"
                    value={editingInvestment.quantity}
                    onChange={(e) => setEditingInvestment({...editingInvestment, quantity: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div>
                  <Label htmlFor="edit_average_price" className="text-gray-300">Preço Médio</Label>
                  <Input
                    id="edit_average_price"
                    type="number"
                    step="0.01"
                    value={editingInvestment.average_price}
                    onChange={(e) => setEditingInvestment({...editingInvestment, average_price: e.target.value})}
                    className="bg-gray-800 border-gray-700 text-white"
                    placeholder="0.00"
                    required
                  />
                </div>
                <div className="flex space-x-3">
                  <Button 
                    type="button"
                    variant="outline"
                    onClick={() => setIsEditDialogOpen(false)}
                    className="flex-1 border-gray-600 text-gray-300 hover:bg-gray-800"
                  >
                    Cancelar
                  </Button>
                  <Button 
                    type="submit"
                    disabled={saving}
                    className="flex-1 bg-green-600 hover:bg-green-700"
                  >
                    {saving ? 'Salvando...' : 'Salvar Alterações'}
                  </Button>
                </div>
              </form>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Investments;
