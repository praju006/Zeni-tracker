import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';

export interface Transaction {
  id: string;
  user_id: string;
  type: 'income' | 'expense';
  amount: number;
  category: string;
  description: string | null;
  notes: string | null;
  transaction_date: string;
  created_at: string;
  updated_at: string;
}

/* ---------------- FETCH TRANSACTIONS ---------------- */

export function useTransactions() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ['transactions', user?.id],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('transactions')
        .select('*')
        .eq('user_id', user!.id)   // IMPORTANT
        .order('transaction_date', { ascending: false });

      if (error) throw error;
      return data as Transaction[];
    },
    enabled: !!user,
  });
}

/* ---------------- ADD TRANSACTION ---------------- */

export function useAddTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (
      tx: Omit<Transaction, 'id' | 'user_id' | 'created_at' | 'updated_at'>
    ) => {
      const { data, error } = await supabase
        .from('transactions')
        .insert({ ...tx, user_id: user!.id }) // already correct
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      toast.success('Transaction added!');
    },
    onError: (e: any) => toast.error(e.message),
  });
}

/* ---------------- UPDATE TRANSACTION ---------------- */

export function useUpdateTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async ({ id, ...tx }: Partial<Transaction> & { id: string }) => {
      const { data, error } = await supabase
        .from('transactions')
        .update(tx)
        .eq('id', id)
        .eq('user_id', user!.id)   // IMPORTANT SECURITY
        .select()
        .single();

      if (error) throw error;
      return data;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      toast.success('Transaction updated!');
    },
    onError: (e: any) => toast.error(e.message),
  });
}

/* ---------------- DELETE TRANSACTION ---------------- */

export function useDeleteTransaction() {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (id: string) => {
      const { error } = await supabase
        .from('transactions')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id); // IMPORTANT SECURITY

      if (error) throw error;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['transactions', user?.id] });
      toast.success('Transaction deleted!');
    },
    onError: (e: any) => toast.error(e.message),
  });
}