
-- Criar tabela para tipos de ativos de investimento
CREATE TABLE public.investment_types (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Inserir tipos de ativos padrão
INSERT INTO public.investment_types (name) VALUES 
('Ações'),
('FIIs'),
('Renda Fixa'),
('Cripto'),
('Fundos'),
('ETFs');

-- Criar tabela para investimentos
CREATE TABLE public.investments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  asset_name TEXT NOT NULL,
  asset_type_id UUID REFERENCES public.investment_types(id) NOT NULL,
  quantity NUMERIC NOT NULL DEFAULT 0,
  average_price NUMERIC NOT NULL DEFAULT 0,
  total_invested NUMERIC GENERATED ALWAYS AS (quantity * average_price) STORED,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS à tabela de investimentos
ALTER TABLE public.investments ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para investimentos
CREATE POLICY "Users can view their own investments" 
  ON public.investments 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own investments" 
  ON public.investments 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own investments" 
  ON public.investments 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own investments" 
  ON public.investments 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Permitir leitura dos tipos de investimento para todos os usuários autenticados
ALTER TABLE public.investment_types ENABLE ROW LEVEL SECURITY;

CREATE POLICY "All authenticated users can view investment types" 
  ON public.investment_types 
  FOR SELECT 
  TO authenticated
  USING (true);

-- Criar tabela para orçamentos
CREATE TABLE public.budgets (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  category_id UUID REFERENCES public.expense_categories(id),
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  period TEXT NOT NULL DEFAULT 'monthly', -- 'monthly', 'yearly'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS à tabela de orçamentos
ALTER TABLE public.budgets ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para orçamentos
CREATE POLICY "Users can view their own budgets" 
  ON public.budgets 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own budgets" 
  ON public.budgets 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own budgets" 
  ON public.budgets 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budgets" 
  ON public.budgets 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Criar tabela para contas a vencer
CREATE TABLE public.upcoming_bills (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users NOT NULL,
  name TEXT NOT NULL,
  amount NUMERIC NOT NULL,
  due_date DATE NOT NULL,
  category_id UUID REFERENCES public.expense_categories(id),
  is_paid BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Adicionar RLS à tabela de contas a vencer
ALTER TABLE public.upcoming_bills ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para contas a vencer
CREATE POLICY "Users can view their own upcoming bills" 
  ON public.upcoming_bills 
  FOR SELECT 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own upcoming bills" 
  ON public.upcoming_bills 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own upcoming bills" 
  ON public.upcoming_bills 
  FOR UPDATE 
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own upcoming bills" 
  ON public.upcoming_bills 
  FOR DELETE 
  USING (auth.uid() = user_id);
