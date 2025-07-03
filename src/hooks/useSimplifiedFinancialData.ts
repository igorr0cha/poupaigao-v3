import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

interface Transaction {
  id: string;
  type: 'income' | 'expense';
  amount: number;
  description: string;
  date: string;
  category_id?: string;
  competence_month?: number;
  competence_year?: number;
  due_date?: string;
  is_recurring?: boolean;
  recurring_day?: number;
  is_paid?: boolean;
}

interface Goal {
  id: string;
  name: string;
  target_amount: number;
  current_amount: number;
  priority: 'high' | 'medium' | 'low';
}

interface ExpenseCategory {
  id: string;
  name: string;
  color: string;
}

interface Investment {
  id: string;
  asset_name: string;
  asset_type_id: string;
  quantity: number;
  average_price: number;
  total_invested: number;
  asset_type?: { name: string };
}

interface InvestmentType {
  id: string;
  name: string;
}

export const useSimplifiedFinancialData = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);
  const [accountBalance, setAccountBalance] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllData();
      loadAccountBalance();
    } else {
      resetData();
    }
  }, [user]);

  const resetData = () => {
    setTransactions([]);
    setGoals([]);
    setCategories([]);
    setInvestments([]);
    setInvestmentTypes([]);
    setAccountBalance(0);
    setLoading(false);
  };

  const loadAccountBalance = () => {
    const savedBalance = localStorage.getItem(`account_balance_${user?.id}`);
    if (savedBalance) {
      setAccountBalance(parseFloat(savedBalance));
    }
  };

  const fetchAllData = async () => {
    if (!user) return;

    try {
      const [
        transactionsData,
        goalsData,
        categoriesData,
        investmentsData,
        investmentTypesData
      ] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('financial_goals').select('*').eq('user_id', user.id),
        supabase.from('expense_categories').select('*').eq('user_id', user.id),
        supabase.from('investments').select('*, investment_types(name)').eq('user_id', user.id),
        supabase.from('investment_types').select('*')
      ]);

      [transactionsData, goalsData, categoriesData, investmentsData, investmentTypesData].forEach(result => {
        if (result.error) throw result.error;
      });

      setTransactions((transactionsData.data || []).map(t => ({
        ...t,
        type: t.type as 'income' | 'expense'
      })));
      setGoals((goalsData.data || []).map(g => ({
        ...g,
        priority: g.priority as 'high' | 'medium' | 'low'
      })));
      setCategories(categoriesData.data || []);
      setInvestments(investmentsData.data || []);
      setInvestmentTypes(investmentTypesData.data || []);

      loadAccountBalance();
    } catch (error) {
      console.error('Error fetching financial data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTotalInvestments = () => {
    return investments.reduce((sum, investment) => sum + Number(investment.total_invested), 0);
  };

  const getTotalGoals = () => {
    return goals.reduce((sum, goal) => sum + Number(goal.current_amount), 0);
  };

  // Patrimônio líquido = Investimentos + Metas + Valor em conta
  const getNetWorth = () => {
    return getTotalInvestments() + getTotalGoals() + accountBalance;
  };

  const getMonthlyIncome = (month?: number, year?: number) => {
    const targetMonth = month ?? new Date().getMonth();
    const targetYear = year ?? new Date().getFullYear();
    
    return transactions
      .filter(t => {
        return t.type === 'income' && 
               t.competence_month === (targetMonth + 1) && 
               t.competence_year === targetYear &&
               t.is_paid;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const getMonthlyExpenses = (month?: number, year?: number) => {
    const targetMonth = month ?? new Date().getMonth();
    const targetYear = year ?? new Date().getFullYear();
    
    return transactions
      .filter(t => {
        return t.type === 'expense' && 
               t.competence_month === (targetMonth + 1) && 
               t.competence_year === targetYear &&
               t.is_paid;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const getUnpaidExpenses = (month?: number, year?: number) => {
    const targetMonth = month ?? new Date().getMonth();
    const targetYear = year ?? new Date().getFullYear();
    
    return transactions
      .filter(t => {
        return t.type === 'expense' && 
               t.competence_month === (targetMonth + 1) && 
               t.competence_year === targetYear &&
               !t.is_paid;
      })
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  // Valor em conta (manual)
  const getAccountBalance = () => {
    return accountBalance;
  };

  // Saldo atual = Valor em conta - Despesas pagas do mês atual
  const getCurrentBalance = () => {
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    const totalPaidExpensesThisMonth = transactions
      .filter(t => 
        t.type === 'expense' && 
        t.is_paid &&
        t.competence_month === currentMonth &&
        t.competence_year === currentYear
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
    return accountBalance - totalPaidExpensesThisMonth;
  };

  // Saldo projetado = Saldo atual - Despesas pendentes do mês atual
  const getProjectedBalance = () => {
    const unpaidExpensesThisMonth = getUnpaidExpenses(); // A sua função getUnpaidExpenses já filtra pelo mês atual
    return getCurrentBalance() - unpaidExpensesThisMonth;
  };

  const getExpensesByCategory = (month?: number, year?: number) => {
    const targetMonth = month ?? new Date().getMonth();
    const targetYear = year ?? new Date().getFullYear();
    
    const monthlyExpenses = transactions.filter(t => {
      return t.type === 'expense' && 
             t.competence_month === (targetMonth + 1) && 
             t.competence_year === targetYear &&
             t.is_paid;
    });

    const categoryTotals = categories.map(category => {
      const total = monthlyExpenses
        .filter(t => t.category_id === category.id)
        .reduce((sum, t) => sum + Number(t.amount), 0);
      
      return {
        name: category.name,
        value: total,
        color: category.color,
        category_id: category.id
      };
    }).filter(item => item.value > 0);

    return categoryTotals;
  };

  const getMonthlyData = (months: number = 6) => {
    const data = [];
    const currentDate = new Date();
    
    for (let i = months - 1; i >= 0; i--) {
      const date = new Date(currentDate.getFullYear(), currentDate.getMonth() - i, 1);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      data.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short', year: '2-digit' }),
        income: getMonthlyIncome(month, year),
        expenses: getMonthlyExpenses(month, year)
      });
    }
    
    return data;
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const transactionDate = new Date(transaction.date);
      
      const competenceMonth = transaction.competence_month ?? (transactionDate.getMonth() + 1);
      const competenceYear = transaction.competence_year ?? transactionDate.getFullYear();

      const { error } = await supabase
        .from('transactions')
        .insert({ 
          ...transaction, 
          user_id: user.id,
          competence_month: competenceMonth,
          competence_year: competenceYear
        });

      if (error) throw error;
      await fetchAllData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateTransaction = async (transactionId: string, updates: Partial<Transaction>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', transactionId);

      if (error) throw error;
      await fetchAllData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteTransaction = async (transactionId: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', transactionId);

      if (error) throw error;
      await fetchAllData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const markTransactionAsPaid = async (transactionId: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('transactions')
        .update({ is_paid: true })
        .eq('id', transactionId);

      if (error) throw error;
      await fetchAllData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const adjustAccountBalance = async (newBalance: number) => {
    if (!user) return { error: 'No user logged in' };

    try {
      setAccountBalance(newBalance);
      localStorage.setItem(`account_balance_${user.id}`, newBalance.toString());
      
      // Forçar atualização dos dados após ajustar o saldo
      await fetchAllData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const addMoneyToGoal = async (goalId: string, amount: number) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) throw new Error('Meta não encontrada');

      const { error } = await supabase
        .from('financial_goals')
        .update({ current_amount: Number(goal.current_amount) + amount })
        .eq('id', goalId);

      if (error) throw error;
      await fetchAllData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateGoal = async (goalId: string, updates: Partial<Goal>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('financial_goals')
        .update(updates)
        .eq('id', goalId);

      if (error) throw error;
      await fetchAllData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateInvestment = async (investmentId: string, updates: Partial<Investment>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      // Se quantidade ou preço médio foram atualizados, recalcular total_invested
      if (updates.quantity !== undefined || updates.average_price !== undefined) {
        const currentInvestment = investments.find(inv => inv.id === investmentId);
        if (currentInvestment) {
          const newQuantity = updates.quantity !== undefined ? updates.quantity : currentInvestment.quantity;
          const newAveragePrice = updates.average_price !== undefined ? updates.average_price : currentInvestment.average_price;
          updates.total_invested = Number(newQuantity) * Number(newAveragePrice);
        }
      }

      const { error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', investmentId);

      if (error) throw error;
      await fetchAllData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteInvestment = async (investmentId: string) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', investmentId);

      if (error) throw error;
      await fetchAllData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const addInvestment = async (investment: Omit<Investment, 'id' | 'total_invested'>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      // Calcular o total_invested baseado na quantidade e preço médio
      const totalInvested = Number(investment.quantity) * Number(investment.average_price);
      
      const { error } = await supabase
        .from('investments')
        .insert({ 
          ...investment, 
          user_id: user.id,
          total_invested: totalInvested
        });

      if (error) throw error;
      await fetchAllData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  return {
    transactions,
    goals,
    categories,
    investments,
    investmentTypes,
    accountBalance,
    loading,
    getTotalInvestments,
    getTotalGoals,
    getNetWorth,
    getMonthlyIncome,
    getMonthlyExpenses,
    getUnpaidExpenses,
    getAccountBalance,
    getCurrentBalance,
    getProjectedBalance,
    getExpensesByCategory,
    getMonthlyData,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    markTransactionAsPaid,
    adjustAccountBalance,
    addMoneyToGoal,
    updateGoal,
    updateInvestment,
    deleteInvestment,
    addInvestment,
    refetch: fetchAllData
  };
};
