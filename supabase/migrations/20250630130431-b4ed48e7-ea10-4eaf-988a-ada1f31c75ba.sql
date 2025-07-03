
-- Remove todas as tabelas relacionadas a contas
DROP TABLE IF EXISTS public.account_balance_adjustments CASCADE;
DROP TABLE IF EXISTS public.accounts CASCADE;

-- Remove a coluna account_id da tabela transactions (não é mais necessária)
ALTER TABLE public.transactions DROP COLUMN IF EXISTS account_id;
