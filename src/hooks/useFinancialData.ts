
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
  is_bill?: boolean;
  bill_closing_date?: string;
  bill_due_date?: string;
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
  is_user_created?: boolean;
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

interface UpcomingBill {
  id: string;
  name: string;
  amount: number;
  due_date: string;
  category_id?: string;
  is_paid: boolean;
}

interface Budget {
  id: string;
  name: string;
  amount: number;
  category_id?: string;
  period: string;
}

export const useFinancialData = () => {
  const { user } = useAuth();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [goals, setGoals] = useState<Goal[]>([]);
  const [categories, setCategories] = useState<ExpenseCategory[]>([]);
  const [investments, setInvestments] = useState<Investment[]>([]);
  const [investmentTypes, setInvestmentTypes] = useState<InvestmentType[]>([]);
  const [upcomingBills, setUpcomingBills] = useState<UpcomingBill[]>([]);
  const [budgets, setBudgets] = useState<Budget[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchAllData();
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
    setUpcomingBills([]);
    setBudgets([]);
    setLoading(false);
  };

  const fetchAllData = async () => {
    if (!user) return;

    try {
      const [
        transactionsData,
        goalsData,
        categoriesData,
        investmentsData,
        investmentTypesData,
        upcomingBillsData,
        budgetsData
      ] = await Promise.all([
        supabase.from('transactions').select('*').eq('user_id', user.id).order('date', { ascending: false }),
        supabase.from('financial_goals').select('*').eq('user_id', user.id),
        supabase.from('expense_categories').select('*').eq('user_id', user.id),
        supabase.from('investments').select('*, investment_types(name)').eq('user_id', user.id),
        supabase.from('investment_types').select('*'),
        supabase.from('upcoming_bills').select('*').eq('user_id', user.id).order('due_date'),
        supabase.from('budgets').select('*').eq('user_id', user.id)
      ]);

      // Verificar erros
      [transactionsData, goalsData, categoriesData, investmentsData, investmentTypesData, upcomingBillsData, budgetsData].forEach(result => {
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
      setUpcomingBills(upcomingBillsData.data || []);
      setBudgets(budgetsData.data || []);
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

  const getNetWorth = () => {
    return getTotalInvestments() + getTotalGoals();
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

  const getMonthlyBalance = (month?: number, year?: number) => {
    return getMonthlyIncome(month, year) - getMonthlyExpenses(month, year);
  };

  const getProjectedBalance = (month?: number, year?: number) => {
    const currentBalance = getMonthlyBalance(month, year);
    const unpaidExpenses = getUnpaidExpenses(month, year);
    return currentBalance - unpaidExpenses;
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
        expenses: getMonthlyExpenses(month, year),
        balance: getMonthlyBalance(month, year)
      });
    }
    
    return data;
  };

  const getInvestmentsByType = () => {
    const investmentsByType = investmentTypes.map(type => {
      const typeInvestments = investments.filter(inv => inv.asset_type_id === type.id);
      const total = typeInvestments.reduce((sum, inv) => sum + Number(inv.total_invested), 0);
      
      return {
        name: type.name,
        value: total,
        count: typeInvestments.length
      };
    }).filter(item => item.value > 0);

    return investmentsByType;
  };

  const addTransaction = async (transaction: Omit<Transaction, 'id'>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const transactionDate = new Date();
      const competenceMonth = transaction.competence_month || transactionDate.getMonth() + 1;
      const competenceYear = transaction.competence_year || transactionDate.getFullYear();

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

  const addInvestment = async (investment: Omit<Investment, 'id' | 'total_invested'>) => {
    if (!user) return { error: 'No user logged in' };

    try {
      const { error } = await supabase
        .from('investments')
        .insert({ ...investment, user_id: user.id });

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
    upcomingBills,
    budgets,
    loading,
    getTotalInvestments,
    getTotalGoals,
    getNetWorth,
    getMonthlyIncome,
    getMonthlyExpenses,
    getUnpaidExpenses,
    getMonthlyBalance,
    getProjectedBalance,
    getExpensesByCategory,
    getMonthlyData,
    getInvestmentsByType,
    addTransaction,
    markTransactionAsPaid,
    addInvestment,
    refetch: fetchAllData
  };
};
