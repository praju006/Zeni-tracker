import { TrendingUp, TrendingDown, Wallet, RotateCcw } from 'lucide-react';
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { toast } from 'sonner';
import type { Transaction } from '@/hooks/useTransactions';
import { Button } from '@/components/ui/button';
import { useBudget, useSetBudget } from '@/hooks/useBudget';
import { useGoals } from '@/hooks/useGoals';
import { GoalCard } from '@/components/GoalCard'; // NEW
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';

interface Props {
  transactions: Transaction[];
  onCurrencyChange?: (currency: string) => void;
}

export function DashboardStats({ transactions, onCurrencyChange }: Props) {
  const { data: goals } = useGoals(); // HOOK OK HERE
  const { user } = useAuth();
  const [currency, setCurrency] = useState('INR');

  /* ----------- BUDGET STATE ----------- */
  const [budgetOpen, setBudgetOpen] = useState(false);
  const [budgetValue, setBudgetValue] = useState('');

  const month = new Date().toISOString().slice(0, 7);
  const { data: budget } = useBudget(month);
  const setBudget = useSetBudget();

  /* ----------- CALCULATIONS ----------- */
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  /* ----------- BUDGET WARNING ----------- */
  useEffect(() => {
    if (!budget?.limit_amount) return;

    const percent = totalExpense / budget.limit_amount;

    if (percent > 1) toast.error('Budget Exceeded!');
    else if (percent > 0.8) toast.warning('80% Budget Used');
  }, [totalExpense, budget]);

  /* ----------- FORMAT MONEY ----------- */
  const formatMoney = (amount: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency || 'INR',
    }).format(amount);

  /* ----------- RESET WALLET ----------- */
  const handleResetWallet = async () => {
    if (!confirm('Delete all transactions?')) return;

    const { error } = await supabase
      .from('transactions')
      .delete()
      .eq('user_id', user?.id);

    if (!error) {
      toast.success('Wallet Reset!');
      window.location.reload();
    }
  };

  const stats = [
    {
      label: 'Total Balance',
      value: formatMoney(balance),
      icon: Wallet,
      trend: balance >= 0 ? 'positive' : 'negative',
      className: 'glow-purple',
    },
    {
      label: 'Total Income',
      value: formatMoney(totalIncome),
      icon: TrendingUp,
      trend: 'positive' as const,
      className: '',
    },
    {
      label: 'Total Expense',
      value: formatMoney(totalExpense),
      icon: TrendingDown,
      trend: 'negative' as const,
      className: '',
    },
  ];

  return (
    <>
      {/* TOP CONTROLS */}
      <div className="flex flex-wrap gap-3 mb-4 justify-between items-center">
        <Select
          value={currency}
          onValueChange={(val) => {
            setCurrency(val);
            onCurrencyChange?.(val);
          }}
        >
          <SelectTrigger className="w-32">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="INR">₹ INR</SelectItem>
            <SelectItem value="USD">$ USD</SelectItem>
            <SelectItem value="EUR">€ EUR</SelectItem>
          </SelectContent>
        </Select>

        <div className="flex gap-2">
          <Button variant="outline" onClick={() => setBudgetOpen(true)}>
            Set Budget
          </Button>

          <Button variant="destructive" onClick={handleResetWallet} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Reset Wallet
          </Button>
        </div>
      </div>

      {/* STAT CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {stats.map((stat, i) => (
          <div
            key={stat.label}
            className={`stat-card animate-fade-in ${stat.className}`}
            style={{ animationDelay: `${i * 100}ms` }}
          >
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm text-muted-foreground">{stat.label}</span>
              <div
                className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                  stat.trend === 'positive' ? 'bg-primary/10' : 'bg-destructive/10'
                }`}
              >
                <stat.icon
                  className={`w-5 h-5 ${
                    stat.trend === 'positive' ? 'text-primary' : 'text-destructive'
                  }`}
                />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground animate-count-up">
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* GOALS SECTION */}
      <div className="mt-6 grid gap-3">
        {goals?.map((g: any) => (
          <GoalCard
            key={g.id}
            title={g.title}
            saved={balance}
            target={g.target_amount}
          />
        ))}
      </div>

      {/* BUDGET MODAL */}
      <Dialog open={budgetOpen} onOpenChange={setBudgetOpen}>
        <DialogContent className="glass sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Set Monthly Budget</DialogTitle>
          </DialogHeader>

          <Input
            type="number"
            placeholder="₹ Enter amount..."
            value={budgetValue}
            onChange={(e) => setBudgetValue(e.target.value)}
            className="mt-2"
          />

          <Button
            className="mt-4 w-full"
            onClick={() => {
              if (!budgetValue) return;
              setBudget.mutate({
                month,
                amount: Number(budgetValue),
              });
              setBudgetOpen(false);
              setBudgetValue('');
              toast.success('Budget Saved!');
            }}
          >
            Save Budget
          </Button>
        </DialogContent>
      </Dialog>
    </>
  );
}