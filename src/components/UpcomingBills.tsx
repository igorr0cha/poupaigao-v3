
import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Clock, AlertTriangle, CheckCircle } from 'lucide-react';
import { useFinancialData } from '@/hooks/useFinancialData';
import { differenceInDays, parseISO } from 'date-fns';

const UpcomingBills = () => {
  const { upcomingBills } = useFinancialData();

  const sortedBills = upcomingBills
    .filter(bill => !bill.is_paid)
    .sort((a, b) => new Date(a.due_date).getTime() - new Date(b.due_date).getTime())
    .slice(0, 5);

  const getBadgeVariant = (dueDate: string) => {
    const days = differenceInDays(parseISO(dueDate), new Date());
    if (days < 0) return 'destructive';
    if (days <= 3) return 'destructive';
    if (days <= 7) return 'secondary';
    return 'default';
  };

  const getBadgeText = (dueDate: string) => {
    const days = differenceInDays(parseISO(dueDate), new Date());
    if (days < 0) return `${Math.abs(days)} dias em atraso`;
    if (days === 0) return 'Vence hoje';
    if (days === 1) return 'Vence amanhã';
    return `${days} dias`;
  };

  return (
    <Card className="backdrop-blur-sm bg-black/40 border-green-800/30">
      <CardHeader>
        <CardTitle className="text-white flex items-center">
          <Clock className="mr-2 h-5 w-5 text-yellow-400" />
          Contas a Vencer
        </CardTitle>
      </CardHeader>
      <CardContent>
        {sortedBills.length > 0 ? (
          <div className="space-y-3">
            {sortedBills.map((bill) => (
              <div key={bill.id} className="flex justify-between items-center p-3 bg-gray-800/50 rounded-lg">
                <div>
                  <p className="font-medium text-white">{bill.name}</p>
                  <p className="text-sm text-gray-400">
                    Vencimento: {new Date(bill.due_date).toLocaleDateString('pt-BR')}
                  </p>
                </div>
                <div className="text-right flex flex-col items-end space-y-1">
                  <p className="font-bold text-white">
                    R$ {bill.amount.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
                  </p>
                  <Badge variant={getBadgeVariant(bill.due_date)} className="text-xs">
                    {getBadgeText(bill.due_date)}
                  </Badge>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center text-gray-400 py-8">
            <CheckCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
            <p>Nenhuma conta pendente</p>
            <p className="text-sm mt-1">Você está em dia!</p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};

export default UpcomingBills;
