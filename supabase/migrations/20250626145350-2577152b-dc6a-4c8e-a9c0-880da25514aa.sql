
-- Adicionar colunas para gestão avançada de despesas na tabela transactions
ALTER TABLE public.transactions 
ADD COLUMN competence_month INTEGER,
ADD COLUMN competence_year INTEGER,
ADD COLUMN due_date DATE,
ADD COLUMN is_recurring BOOLEAN DEFAULT false,
ADD COLUMN recurring_day INTEGER,
ADD COLUMN is_bill BOOLEAN DEFAULT false,
ADD COLUMN bill_closing_date DATE,
ADD COLUMN bill_due_date DATE,
ADD COLUMN is_paid BOOLEAN DEFAULT true;

-- Atualizar transações existentes para terem competência do mês atual
UPDATE public.transactions 
SET 
  competence_month = EXTRACT(MONTH FROM date),
  competence_year = EXTRACT(YEAR FROM date)
WHERE competence_month IS NULL OR competence_year IS NULL;

-- Tornar as colunas de competência obrigatórias
ALTER TABLE public.transactions 
ALTER COLUMN competence_month SET NOT NULL,
ALTER COLUMN competence_year SET NOT NULL;

-- Criar índices para melhor performance
CREATE INDEX idx_transactions_competence ON public.transactions(user_id, competence_year, competence_month);
CREATE INDEX idx_transactions_due_date ON public.transactions(user_id, due_date) WHERE due_date IS NOT NULL;

-- Adicionar coluna para marcar categorias como editáveis pelo usuário
ALTER TABLE public.expense_categories 
ADD COLUMN is_user_created BOOLEAN DEFAULT true;

-- Marcar categorias existentes como criadas pelo usuário
UPDATE public.expense_categories SET is_user_created = true;

-- Criar tabela para histórico de alterações de saldo das contas
CREATE TABLE public.account_balance_adjustments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  account_id UUID REFERENCES public.accounts(id) NOT NULL,
  old_balance NUMERIC NOT NULL,
  new_balance NUMERIC NOT NULL,
  reason TEXT DEFAULT 'Manual adjustment',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS à tabela de ajustes de saldo
ALTER TABLE public.account_balance_adjustments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own balance adjustments" 
  ON public.account_balance_adjustments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own balance adjustments" 
  ON public.account_balance_adjustments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);
