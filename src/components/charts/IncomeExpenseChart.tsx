import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { format, parseISO, startOfMonth } from 'date-fns';
import { formatCurrency } from '@/lib/constants';
import type { Transaction } from '@/hooks/useTransactions';

interface Props {
  transactions: Transaction[];
}

export function IncomeExpenseChart({ transactions }: Props) {
  const byMonth = transactions.reduce((acc, tx) => {
    const month = format(startOfMonth(parseISO(tx.transaction_date)), 'yyyy-MM');
    if (!acc[month]) acc[month] = { income: 0, expense: 0 };
    acc[month][tx.type] += Number(tx.amount);
    return acc;
  }, {} as Record<string, { income: number; expense: number }>);

  const data = Object.entries(byMonth)
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, values]) => ({
      month: format(parseISO(month + '-01'), 'MMM'),
      Income: values.income,
      Expense: values.expense,
    }));

  if (data.length === 0) {
    return (
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Income vs Expense</h3>
        <p className="text-muted-foreground text-sm text-center py-12">No data yet</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Income vs Expense</h3>
      <ResponsiveContainer width="100%" height={300}>
        <BarChart data={data}>
          <CartesianGrid strokeDasharray="3 3" stroke="hsl(222 20% 18%)" />
          <XAxis dataKey="month" stroke="hsl(215 20% 55%)" fontSize={12} />
          <YAxis stroke="hsl(215 20% 55%)" fontSize={12} />
          <Tooltip
            contentStyle={{ background: 'hsl(222 47% 9%)', border: '1px solid hsl(222 20% 18%)', borderRadius: '8px' }}
            formatter={(value: number) => formatCurrency(value)}
          />
          <Legend />
          <Bar dataKey="Income" fill="#10b981" radius={[4, 4, 0, 0]} />
          <Bar dataKey="Expense" fill="#ef4444" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
