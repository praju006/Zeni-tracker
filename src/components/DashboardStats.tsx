import { TrendingUp, TrendingDown, Wallet, ArrowUpRight } from 'lucide-react';
import { formatCurrency } from '@/lib/constants';
import type { Transaction } from '@/hooks/useTransactions';

interface Props {
  transactions: Transaction[];
}

export function DashboardStats({ transactions }: Props) {
  const totalIncome = transactions
    .filter(t => t.type === 'income')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const totalExpense = transactions
    .filter(t => t.type === 'expense')
    .reduce((sum, t) => sum + Number(t.amount), 0);

  const balance = totalIncome - totalExpense;

  const stats = [
    {
      label: 'Total Balance',
      value: formatCurrency(balance),
      icon: Wallet,
      trend: balance >= 0 ? 'positive' : 'negative',
      className: 'glow-emerald',
    },
    {
      label: 'Total Income',
      value: formatCurrency(totalIncome),
      icon: TrendingUp,
      trend: 'positive' as const,
      className: '',
    },
    {
      label: 'Total Expense',
      value: formatCurrency(totalExpense),
      icon: TrendingDown,
      trend: 'negative' as const,
      className: '',
    },
  ];

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {stats.map((stat, i) => (
        <div
          key={stat.label}
          className={`stat-card animate-fade-in ${stat.className}`}
          style={{ animationDelay: `${i * 100}ms` }}
        >
          <div className="flex items-center justify-between mb-4">
            <span className="text-sm text-muted-foreground">{stat.label}</span>
            <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
              stat.trend === 'positive' ? 'bg-primary/10' : 'bg-destructive/10'
            }`}>
              <stat.icon className={`w-5 h-5 ${
                stat.trend === 'positive' ? 'text-primary' : 'text-destructive'
              }`} />
            </div>
          </div>
          <p className="text-2xl font-bold text-foreground animate-count-up">{stat.value}</p>
        </div>
      ))}
    </div>
  );
}
