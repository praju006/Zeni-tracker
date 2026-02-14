import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import { getCategoryInfo, formatCurrency } from '@/lib/constants';
import type { Transaction } from '@/hooks/useTransactions';

const COLORS = ['#10b981', '#3b82f6', '#8b5cf6', '#f59e0b', '#ec4899', '#06b6d4', '#ef4444', '#84cc16'];

interface Props {
  transactions: Transaction[];
}

export function SpendingPieChart({ transactions }: Props) {
  const expenses = transactions.filter(t => t.type === 'expense');
  const byCategory = expenses.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + Number(tx.amount);
    return acc;
  }, {} as Record<string, number>);

  const data = Object.entries(byCategory)
    .map(([category, value]) => ({
      name: getCategoryInfo(category).label,
      icon: getCategoryInfo(category).icon,
      value,
    }))
    .sort((a, b) => b.value - a.value);

  if (data.length === 0) {
    return (
      <div className="glass rounded-xl p-6">
        <h3 className="text-lg font-semibold text-foreground mb-4">Spending by Category</h3>
        <p className="text-muted-foreground text-sm text-center py-12">No expense data yet</p>
      </div>
    );
  }

  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">Spending by Category</h3>
      <ResponsiveContainer width="100%" height={250}>
        <PieChart>
          <Pie
            data={data}
            cx="50%"
            cy="50%"
            innerRadius={60}
            outerRadius={100}
            paddingAngle={3}
            dataKey="value"
          >
            {data.map((_, i) => (
              <Cell key={i} fill={COLORS[i % COLORS.length]} />
            ))}
          </Pie>
          <Tooltip
            contentStyle={{ background: 'hsl(222 47% 9%)', border: '1px solid hsl(222 20% 18%)', borderRadius: '8px' }}
            labelStyle={{ color: 'hsl(210 40% 96%)' }}
            formatter={(value: number) => formatCurrency(value)}
          />
        </PieChart>
      </ResponsiveContainer>
      <div className="grid grid-cols-2 gap-2 mt-4">
        {data.slice(0, 6).map((item, i) => (
          <div key={item.name} className="flex items-center gap-2 text-xs">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
            <span className="text-muted-foreground truncate">{item.icon} {item.name}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
