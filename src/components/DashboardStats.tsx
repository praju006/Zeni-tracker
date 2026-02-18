import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/hooks/useAuth";

export default function WalletDashboard() {
  const { user } = useAuth();

  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(false);

  // ---------- FETCH TRANSACTIONS ----------
  const fetchTransactions = async () => {
    if (!user) return;
    setLoading(true);

    const { data, error } = await supabase
      .from("transactions")
      .select("*")
      .eq("user_id", user.id)
      .order("created_at", { ascending: false });

    if (!error) setTransactions(data || []);
    setLoading(false);
  };

  useEffect(() => {
    fetchTransactions();
  }, [user]);

  // ---------- WALLET CALCULATION ----------
  const totalIncome = transactions
    .filter((t) => t.type === "income")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter((t) => t.type === "expense")
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const walletBalance = totalIncome - totalExpense;

  useEffect(() => {
  if (!user) return;

  fetchTransactions();

  const channel = supabase
    .channel("realtime-transactions")
    .on(
      "postgres_changes",
      {
        event: "*",
        schema: "public",
        table: "transactions",
        filter: `user_id=eq.${user.id}`,
      },
      () => {
        fetchTransactions(); // auto refresh
      }
    )
    .subscribe();

  return () => {
    supabase.removeChannel(channel);
  };
}, [user]);

  // ---------- ADD TRANSACTION ----------
  const addTransaction = async (newTx) => {
    await supabase.from("transactions").insert([
      {
        ...newTx,
        user_id: user.id,
      },
    ]);

    fetchTransactions(); // refresh
  };

  // ---------- DELETE TRANSACTION ----------
  const deleteTransaction = async (id) => {
    await supabase.from("transactions").delete().eq("id", id);
    fetchTransactions();
  };

  // ---------- RESET WALLET ----------
  const resetWallet = async () => {
    await supabase
      .from("transactions")
      .delete()
      .eq("user_id", user.id);

    fetchTransactions();
  };

  return (
    <div className="p-6 space-y-4">
      <h2 className="text-2xl font-bold">Wallet Balance</h2>

      {loading ? (
        <p>Loading...</p>
      ) : (
        <h1 className="text-4xl font-semibold">₹ {walletBalance}</h1>
      )}

      <div className="flex gap-4">
        <p className="text-green-500">Income: ₹ {totalIncome}</p>
        <p className="text-red-500">Expense: ₹ {totalExpense}</p>
      </div>

      <button
        onClick={resetWallet}
        className="bg-red-500 text-white px-4 py-2 rounded"
      >
        Reset Wallet
      </button>

      <div className="mt-6">
        <h3 className="text-xl font-semibold">Transactions</h3>

        {transactions.map((t) => (
          <div
            key={t.id}
            className="flex justify-between border p-2 rounded mt-2"
          >
            <span>
              {t.title} — ₹ {t.amount}
            </span>

            <button
              onClick={() => deleteTransaction(t.id)}
              className="text-red-500"
            >
              Delete
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}