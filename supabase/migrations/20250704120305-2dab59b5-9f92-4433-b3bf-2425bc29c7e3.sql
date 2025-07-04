
-- Adicionar coluna account_balance na tabela profiles
ALTER TABLE public.profiles 
ADD COLUMN account_balance NUMERIC DEFAULT 0;

-- Atualizar registros existentes para ter saldo 0 caso não tenham valor
UPDATE public.profiles 
SET account_balance = 0 
WHERE account_balance IS NULL;
