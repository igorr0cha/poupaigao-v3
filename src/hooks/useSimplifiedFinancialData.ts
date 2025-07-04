import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';

export const useSimplifiedFinancialData = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [transactions, setTransactions] = useState([]);
  const [categories, setCategories] = useState([]);
  const [goals, setGoals] = useState([]);
  const [investments, setInvestments] = useState([]);
  const [investmentTypes, setInvestmentTypes] = useState([]);
  const [accountBalance, setAccountBalance] = useState(0);

  const fetchData = useCallback(async () => {
    if (!user) return;

    try {
      setLoading(true);
      
      // Fetch all data in parallel
      const [
        transactionsRes,
        categoriesRes,
        goalsRes,
        investmentsRes,
        investmentTypesRes,
        profileRes
      ] = await Promise.all([
        supabase
          .from('transactions')
          .select('*')
          .eq('user_id', user.id)
          .order('date', { ascending: false }),
        supabase
          .from('expense_categories')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('financial_goals')
          .select('*')
          .eq('user_id', user.id),
        supabase
          .from('investments')
          .select(`
            *,
            asset_type:investment_types(name)
          `)
          .eq('user_id', user.id),
        supabase
          .from('investment_types')
          .select('*'),
        supabase
          .from('profiles')
          .select('account_balance')
          .eq('id', user.id)
          .single()
      ]);

      if (transactionsRes.error) throw transactionsRes.error;
      if (categoriesRes.error) throw categoriesRes.error;
      if (goalsRes.error) throw goalsRes.error;
      if (investmentsRes.error) throw investmentsRes.error;
      if (investmentTypesRes.error) throw investmentTypesRes.error;

      setTransactions(transactionsRes.data || []);
      setCategories(categoriesRes.data || []);
      setGoals(goalsRes.data || []);
      setInvestments(investmentsRes.data || []);
      setInvestmentTypes(investmentTypesRes.data || []);

      // Set account balance from profiles table, default to 0 if not found
      if (profileRes.data) {
        setAccountBalance(Number(profileRes.data.account_balance) || 0);
      } else {
        // Create profile if it doesn't exist
        const { error: insertError } = await supabase
          .from('profiles')
          .insert({
            id: user.id,
            account_balance: 0
          });
        
        if (!insertError) {
          setAccountBalance(0);
        }
      }

    } catch (error) {
      console.error('Error fetching data:', error);
      toast({
        title: "Erro",
        description: "Erro ao carregar dados financeiros.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    fetchData();
  }, [fetchData]);

  const addInvestment = async (investmentData: {
    asset_name: string;
    asset_type_id: string;
    quantity: number;
    average_price: number;
  }) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      // Calculate total_invested automatically
      const total_invested = investmentData.quantity * investmentData.average_price;
      
      const { error } = await supabase
        .from('investments')
        .insert({
          asset_name: investmentData.asset_name,
          asset_type_id: investmentData.asset_type_id,
          quantity: investmentData.quantity,
          average_price: investmentData.average_price,
          total_invested: total_invested,
          user_id: user.id
        });

      if (error) return { error };
      
      await fetchData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateInvestment = async (id: string, updates: any) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      // If quantity or average_price is being updated, recalculate total_invested
      if (updates.quantity !== undefined || updates.average_price !== undefined) {
        const investment = investments.find(inv => inv.id === id);
        if (investment) {
          const newQuantity = updates.quantity !== undefined ? updates.quantity : investment.quantity;
          const newPrice = updates.average_price !== undefined ? updates.average_price : investment.average_price;
          updates.total_invested = newQuantity * newPrice;
        }
      }

      const { error } = await supabase
        .from('investments')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) return { error };
      
      await fetchData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteInvestment = async (id: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { error } = await supabase
        .from('investments')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) return { error };
      
      await fetchData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const getMonthlyIncome = (month?: number, year?: number) => {
    const now = new Date();
    const targetMonth = month !== undefined ? month : now.getMonth();
    const targetYear = year !== undefined ? year : now.getFullYear();
    
    return transactions
      .filter(t => 
        t.type === 'income' && 
        t.competence_month === targetMonth + 1 && 
        t.competence_year === targetYear
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const getMonthlyExpenses = (month?: number, year?: number) => {
    const now = new Date();
    const targetMonth = month !== undefined ? month : now.getMonth();
    const targetYear = year !== undefined ? year : now.getFullYear();
    
    return transactions
      .filter(t => 
        t.type === 'expense' && 
        t.is_paid === true && // Apenas despesas pagas
        t.competence_month === targetMonth + 1 && 
        t.competence_year === targetYear
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const getUnpaidExpenses = (month?: number, year?: number) => {
    const now = new Date();
    const targetMonth = month !== undefined ? month : now.getMonth();
    const targetYear = year !== undefined ? year : now.getFullYear();
    
    return transactions
      .filter(t => 
        t.type === 'expense' && 
        !t.is_paid && 
        t.competence_month === targetMonth + 1 && 
        t.competence_year === targetYear
      )
      .reduce((sum, t) => sum + Number(t.amount), 0);
  };

  const getTotalInvestments = () => {
    return investments.reduce((sum, inv) => sum + (Number(inv.total_invested) || Number(inv.quantity) * Number(inv.average_price)), 0);
  };

  const getTotalGoals = () => {
    return goals.reduce((sum, goal) => sum + Number(goal.current_amount), 0);
  };

  const getAccountBalance = () => {
    return accountBalance;
  };

  const getCurrentBalance = () => {
    const currentMonth = new Date().getMonth();
    const currentYear = new Date().getFullYear();
    const paidExpenses = getMonthlyExpenses(currentMonth, currentYear);
    
    return accountBalance - paidExpenses;
  };

  const getProjectedBalance = () => {
    const currentBalance = getCurrentBalance();
    const unpaidExpenses = getUnpaidExpenses();
    return currentBalance - unpaidExpenses;
  };

  const getNetWorth = () => {
    const totalInvestments = getTotalInvestments();
    const totalGoals = getTotalGoals();
    return accountBalance + totalGoals + totalInvestments;
  };

  const getMonthlyData = () => {
    const monthlyData = [];
    for (let i = 11; i >= 0; i--) {
      const date = new Date();
      date.setMonth(date.getMonth() - i);
      const month = date.getMonth();
      const year = date.getFullYear();
      
      const income = getMonthlyIncome(month, year);
      const expenses = getMonthlyExpenses(month, year);
      
      monthlyData.push({
        month: date.toLocaleDateString('pt-BR', { month: 'short' }),
        income,
        expenses,
        balance: income - expenses
      });
    }
    return monthlyData;
  };

  const getExpensesByCategory = (month?: number, year?: number) => {
    const now = new Date();
    const targetMonth = month !== undefined ? month : now.getMonth();
    const targetYear = year !== undefined ? year : now.getFullYear();
    
    const expensesByCategory = new Map();
    
    transactions
      .filter(t => 
        t.type === 'expense' && 
        t.is_paid === true && // Apenas despesas pagas
        t.competence_month === targetMonth + 1 && 
        t.competence_year === targetYear
      )
      .forEach(transaction => {
        const category = categories.find(c => c.id === transaction.category_id);
        const categoryName = category?.name || 'Outros';
        const categoryColor = category?.color || '#8B5CF6';
        
        const current = expensesByCategory.get(categoryName) || 0;
        expensesByCategory.set(categoryName, current + Number(transaction.amount));
      });

    return Array.from(expensesByCategory.entries()).map(([name, value]) => ({
      name,
      value,
      color: categories.find(c => c.name === name)?.color || '#8B5CF6'
    }));
  };

  const addMoneyToGoal = async (goalId: string, amount: number) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const goal = goals.find(g => g.id === goalId);
      if (!goal) return { error: new Error('Goal not found') };

      const newAmount = Number(goal.current_amount) + amount;

      const { error } = await supabase
        .from('financial_goals')
        .update({ current_amount: newAmount })
        .eq('id', goalId)
        .eq('user_id', user.id);

      if (error) return { error };
      
      await fetchData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const adjustAccountBalance = async (newBalance: number) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { error } = await supabase
        .from('profiles')
        .update({ account_balance: newBalance })
        .eq('id', user.id);

      if (error) return { error };
      
      await fetchData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const markTransactionAsPaid = async (transactionId: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { error } = await supabase
        .from('transactions')
        .update({ is_paid: true })
        .eq('id', transactionId)
        .eq('user_id', user.id);

      if (error) return { error };
      
      await fetchData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const addTransaction = async (transactionData: any) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { error } = await supabase
        .from('transactions')
        .insert({
          ...transactionData,
          user_id: user.id
        });

      if (error) return { error };
      
      await fetchData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateTransaction = async (id: string, updates: any) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { error } = await supabase
        .from('transactions')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) return { error };
      
      await fetchData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const deleteTransaction = async (id: string) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) return { error };
      
      await fetchData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const updateGoal = async (id: string, updates: any) => {
    if (!user) return { error: new Error('User not authenticated') };

    try {
      const { error } = await supabase
        .from('financial_goals')
        .update(updates)
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) return { error };
      
      await fetchData();
      return { error: null };
    } catch (error) {
      return { error };
    }
  };

  const refetch = fetchData;

  return {
    getMonthlyIncome,
    getMonthlyExpenses,
    getUnpaidExpenses,
    getTotalInvestments,
    getTotalGoals,
    getAccountBalance,
    getCurrentBalance,
    getProjectedBalance,
    getNetWorth,
    getMonthlyData,
    getExpensesByCategory,
    addMoneyToGoal,
    adjustAccountBalance,
    markTransactionAsPaid,
    addTransaction,
    updateTransaction,
    deleteTransaction,
    updateGoal,
    addInvestment,
    updateInvestment,
    deleteInvestment,
    transactions,
    categories,
    goals,
    investments,
    investmentTypes,
    accountBalance,
    loading,
    refetch
  };
};
