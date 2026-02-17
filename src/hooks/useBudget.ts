import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

/* ---------------- GET BUDGET ---------------- */

export function useBudget(month: string) {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["budget", month, user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", user!.id)
        .eq("month", month)
        .maybeSingle(); // SAFER THAN .single()

      if (error) throw error;

      return data; // can be null — that’s OK
    },
  });
}

/* ---------------- SET / UPDATE BUDGET ---------------- */

export function useSetBudget() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      month,
      amount,
    }: {
      month: string;
      amount: number;
    }) => {
      const { error } = await supabase.from("budgets").upsert({
        user_id: user!.id,
        month,
        limit_amount: amount,
      });

      if (error) throw error;
    },

    onSuccess: () => {
      // refresh budget query after update
      queryClient.invalidateQueries({ queryKey: ["budget"] });
    },
  });
}