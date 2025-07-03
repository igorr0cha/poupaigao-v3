
import { useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export const useRecurringTransactions = () => {
  const { user } = useAuth();

  useEffect(() => {
    if (!user) return;

    const createRecurringTransactions = async () => {
      try {
        // Buscar todas as transações recorrentes do usuário
        const { data: recurringTransactions, error } = await supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .eq('is_recurring', true);

        if (error) throw error;

        const today = new Date();
        const currentMonth = today.getMonth() + 1;
        const currentYear = today.getFullYear();
        const currentDay = today.getDate();

        for (const transaction of recurringTransactions || []) {
          if (transaction.recurring_day && currentDay === transaction.recurring_day) {
            // Verificar se já existe uma transação para este mês
            const { data: existingTransaction } = await supabase
              .from('transactions')
              .select('id')
              .eq('user_id', user.id)
              .eq('description', transaction.description)
              .eq('competence_month', currentMonth)
              .eq('competence_year', currentYear)
              .single();

            if (!existingTransaction) {
              // Criar nova transação recorrente
              await supabase
                .from('transactions')
                .insert({
                  user_id: user.id,
                  type: transaction.type,
                  amount: transaction.amount,
                  description: transaction.description,
                  category_id: transaction.category_id,
                  competence_month: currentMonth,
                  competence_year: currentYear,
                  date: today.toISOString().split('T')[0],
                  is_recurring: true,
                  recurring_day: transaction.recurring_day,
                  is_paid: false,
                  due_date: transaction.due_date ? new Date(currentYear, currentMonth - 1, transaction.recurring_day).toISOString().split('T')[0] : null
                });
            }
          }
        }
      } catch (error) {
        console.error('Erro ao criar transações recorrentes:', error);
      }
    };

    // Executar a verificação diariamente
    createRecurringTransactions();
    
    // Configurar verificação a cada 24 horas
    const interval = setInterval(createRecurringTransactions, 24 * 60 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);
};
