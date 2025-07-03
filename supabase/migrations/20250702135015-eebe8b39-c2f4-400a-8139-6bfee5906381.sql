-- Create function to delete user account and all related data
CREATE OR REPLACE FUNCTION delete_user()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  current_user_id uuid;
BEGIN
  -- Get the current user id
  current_user_id := auth.uid();
  
  -- Check if user is authenticated
  IF current_user_id IS NULL THEN
    RAISE EXCEPTION 'Not authenticated';
  END IF;
  
  -- Delete user data in order (respecting foreign key constraints)
  DELETE FROM public.budgets WHERE user_id = current_user_id;
  DELETE FROM public.upcoming_bills WHERE user_id = current_user_id;
  DELETE FROM public.transactions WHERE user_id = current_user_id;
  DELETE FROM public.investments WHERE user_id = current_user_id;
  DELETE FROM public.financial_goals WHERE user_id = current_user_id;
  DELETE FROM public.expense_categories WHERE user_id = current_user_id;
  DELETE FROM public.profiles WHERE id = current_user_id;
  
  -- Delete from auth.users (this will cascade and delete everything else)
  DELETE FROM auth.users WHERE id = current_user_id;
END;
$$;