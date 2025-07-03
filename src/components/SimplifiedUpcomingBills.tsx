
import React, { useState } from 'react';
import { useSimplifiedFinancialData } from '@/hooks/useSimplifiedFinancialData';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Clock, CheckCircle, AlertTriangle } from 'lucide-react';
import { toast } from '@/components/ui/use-toast';

interface SimplifiedUpcomingBillsProps {
  onUpdate: () => void;
}

const SimplifiedUpcomingBills = ({ onUpdate }: SimplifiedUpcomingBillsProps) => {
  const { transactions, markTransactionAsPaid } = useSimplifiedFinancialData();
  const [payingTransaction, setPayingTransaction] = useState<string | null>(null);

  const getDaysUntilDue = (dueDate: string) => {
    const today = new Date();
    const due = new Date(dueDate);
    const diffTime = due.getTime() - today.getTime();
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays;
  };

  const getDaysText = (days: number) => {
    if (days < 0) return `${Math.abs(days)} dias em atraso`;
    if (days === 0) return 'Vence hoje';
    if (days === 1) return '1 dia para vencer';
    return `${days} dias para vencer`;
  };

  const getDaysColor = (days: number) => {
    if (days < 0) return 'text-red-400';
    if (days === 0) return 'text-orange-400';
    if (days <= 7) return 'text-yellow-400';
    return 'text-gray-400';
  };

  const currentMonth = new Date().getMonth() + 1;
  const currentYear = new Date().getFullYear();

  const upcomingExpenses = transactions
    .filter(t => 
      t.type === 'expense' && 
      !t.is_paid 
      // t.competence_month === currentMonth && // SELECIONA APENAS UMA DESPESA DO MÊS EM CURSO
      // t.competence_year === currentYear // SELECIONA APENAS UMA DESPESA DO ANO EM VIGOR
      // t.due_date &&  // Filtra despesas que tem data de vencimento
    )
    .sort((a, b) => {
      // Se 'a' tem data mas 'b' não, 'a' vem primeiro.
      if (a.due_date && !b.due_date) return -1;
      // Se 'b' tem data mas 'a' não, 'b' vem primeiro.
      if (!a.due_date && b.due_date) return 1;
      // Se ambas têm data, ordena pela data.
      if (a.due_date && b.due_date) {
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }
      // Se nenhuma tem data, mantém a ordem original.
      return 0;
    })
    .slice(0, 5);

  const handleMarkAsPaid = async (transactionId: string) => {
    setPayingTransaction(transactionId);
    try {
      const result = await markTransactionAsPaid(transactionId);
      if (result.error) {
        throw result.error;
      }
      toast({
        title: "Despesa paga!",
        description: "A despesa foi marcada como paga com sucesso.",
      });
      onUpdate();
    } catch (error: any) {
      toast({
        title: "Erro",
        description: error.message || "Erro ao marcar despesa como paga.",
        variant: "destructive",
      });
    } finally {
      setPayingTransaction(null);
    }
  };

  return (
    <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Clock className="mr-2 h-5 w-5 text-yellow-400" />
          Despesas a Vencer
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {upcomingExpenses.map((expense) => {
            // Inicializa as variáveis. Elas só serão preenchidas se houver data.
            let daysUntilDue = null;
            let daysText = null;
            let daysColor = 'text-gray-400';

            // Verifica se a data de vencimento existe
            if (expense.due_date) {
              daysUntilDue = getDaysUntilDue(expense.due_date);
              daysText = getDaysText(daysUntilDue);
              daysColor = getDaysColor(daysUntilDue);
            }

            return (
              <div key={expense.id} className="flex items-center justify-between p-3 bg-gray-800/50 rounded-lg border border-gray-700/50">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-1">
                    {/* O ícone também será condicional */}
                    {expense.due_date ? (
                      daysUntilDue < 0 ? (
                        <AlertTriangle className="h-4 w-4 text-red-400" />
                      ) : (
                        <Clock className="h-4 w-4 text-yellow-400" />
                      )
                    ) : (
                      // Ícone para despesas sem data de vencimento definida
                      <CheckCircle className="h-4 w-4 text-gray-500" />
                    )}
                    <span className="text-white font-medium text-sm">
                      {expense.description}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-red-400 font-bold">
                      R$ {Number(expense.amount).toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                    </span>
                    {/* Só mostra o texto de vencimento se ele existir */}
                    {daysText && (
                      <span className={`text-xs ${daysColor} font-medium`}>
                        {daysText}
                      </span>
                    )}
                  </div>
                  {/* Só mostra a data de vencimento se ela existir */}
                  {expense.due_date && (
                    <p className="text-xs text-gray-400 mt-1">
                      Vence em {new Date(expense.due_date).toLocaleDateString('pt-BR')}
                    </p>
                  )}
                </div>
                {/* O botão de pagar continua igual */}
                <Button
                  size="sm"
                  onClick={() => handleMarkAsPaid(expense.id)}
                  disabled={payingTransaction === expense.id}
                  className="ml-3 bg-green-600 hover:bg-green-700 text-white"
                >
                  {payingTransaction === expense.id ? (
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                  ) : (
                    <CheckCircle className="h-4 w-4" />
                  )}
                </Button>
              </div>
            );
          })}
          
          {upcomingExpenses.length === 0 && (
            <div className="text-center py-6">
              <CheckCircle className="mx-auto h-12 w-12 text-green-400 mb-3" />
              <p className="text-gray-400">Nenhuma despesa a vencer</p>
              <p className="text-sm text-gray-500 mt-1">Todas as contas estão em dia!</p>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

export default SimplifiedUpcomingBills;
