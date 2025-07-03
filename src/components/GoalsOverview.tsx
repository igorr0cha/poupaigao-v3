
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Target } from 'lucide-react';

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  priority: 'high' | 'medium' | 'low';
}

interface GoalsOverviewProps {
  goals: Goal[];
}

export const GoalsOverview = ({ goals }: GoalsOverviewProps) => {
  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'high': return 'border-red-500/30 bg-red-500/5';
      case 'medium': return 'border-yellow-500/30 bg-yellow-500/5';
      case 'low': return 'border-green-500/30 bg-green-500/5';
      default: return 'border-gray-500/30 bg-gray-500/5';
    }
  };

  const getPriorityIndicator = (priority: string) => {
    switch (priority) {
      case 'high': return '🔴';
      case 'medium': return '🟡';
      case 'low': return '🟢';
      default: return '⚪';
    }
  };

  if (goals.length === 0) {
    return (
      <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <Target className="mr-2 h-5 w-5 text-green-400" />
            Metas Financeiras
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <Target className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <p className="text-gray-400">Nenhuma meta criada</p>
            <p className="text-sm text-gray-500 mt-1">Defina suas metas financeiras</p>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Target className="mr-2 h-5 w-5 text-green-400" />
          Metas Financeiras
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4 max-h-64 overflow-y-auto">
          {goals.slice(0, 5).map((goal) => {
            const progress = (Number(goal.current_amount) / Number(goal.target_amount)) * 100;
            
            return (
              <div key={goal.id} className={`p-3 rounded-lg border ${getPriorityColor(goal.priority)}`}>
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span>{getPriorityIndicator(goal.priority)}</span>
                    <span className="text-white font-medium text-sm">{goal.name}</span>
                  </div>
                  <span className="text-xs text-green-400 font-bold">
                    {progress.toFixed(1)}%
                  </span>
                </div>
                
                <Progress value={progress} className="h-2 mb-2" />
                
                <div className="flex justify-between text-xs">
                  <span className="text-gray-400">
                    R$ {Number(goal.current_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                  <span className="text-gray-300">
                    R$ {Number(goal.target_amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </span>
                </div>
              </div>
            );
          })}
          
          {goals.length > 5 && (
            <div className="text-center text-sm text-gray-400 pt-2">
              +{goals.length - 5} metas adicionais
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};
