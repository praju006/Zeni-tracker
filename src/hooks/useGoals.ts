import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export function useGoals() {
  const { user } = useAuth();

  return useQuery({
    queryKey: ["goals", user?.id],
    enabled: !!user,
    queryFn: async () => {
      const { data } = await supabase
        .from("goals")
        .select("*")
        .eq("user_id", user!.id);
      return data || [];
    },
  });
}

export function useAddGoal() {
  const { user } = useAuth();
  const qc = useQueryClient();

  return useMutation({
    mutationFn: async ({ title, amount }: any) => {
      await supabase.from("goals").insert({
        user_id: user!.id,
        title,
        target_amount: amount,
      });
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ["goals"] }),
  });
}