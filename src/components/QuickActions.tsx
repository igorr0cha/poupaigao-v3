
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Plus, TrendingUp, CreditCard, Target } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const QuickActions = () => {
  const navigate = useNavigate();

  const actions = [
    {
      title: 'Nova Transação',
      description: 'Registre receitas e despesas',
      icon: Plus,
      onClick: () => navigate('/transacao'),
      color: 'from-green-500 to-emerald-600'
    },
    {
      title: 'Investimentos',
      description: 'Gerencie seu portfólio',
      icon: TrendingUp,
      onClick: () => navigate('/investimentos'),
      color: 'from-blue-500 to-blue-600'
    },
    {
      title: 'Contas',
      description: 'Administre suas contas',
      icon: CreditCard,
      onClick: () => navigate('/contas'),
      color: 'from-purple-500 to-purple-600'
    },
    {
      title: 'Metas',
      description: 'Acompanhe seus objetivos',
      icon: Target,
      onClick: () => navigate('/metas'),
      color: 'from-orange-500 to-orange-600'
    }
  ];

  return (
    <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
      <CardHeader>
        <CardTitle className="text-white">Ações Rápidas</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-2 gap-3">
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
        </div>
      </CardContent>
    </Card>
  );
};

export default QuickActions;
