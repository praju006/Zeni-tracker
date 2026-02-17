import { getCategoryInfo } from '@/lib/constants';
import type { Transaction } from '@/hooks/useTransactions';
import { format } from 'date-fns';

interface Props {
  transactions: Transaction[];
  currency: string; // NEW
}

export function RecentTransactions({ transactions, currency }: Props) {
  const recent = transactions.slice(0, 5);

  /* -------- CURRENCY FORMATTER -------- */
 const formatMoney = (amount: number) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'INR', // fallback
  }).format(amount);
  return (
    <div className="glass rounded-xl p-6">
      <h3 className="text-lg font-semibold text-foreground mb-4">
        Recent Transactions
      </h3>

      {recent.length === 0 ? (
        <p className="text-muted-foreground text-sm text-center py-8">
          No transactions yet. Add one to get started!
        </p>
      ) : (
        <div className="space-y-3">
          {recent.map((tx, i) => {
            const cat = getCategoryInfo(tx.category);

            return (
              <div
                key={tx.id}
                className="flex items-center justify-between p-3 rounded-lg hover:bg-secondary/30 transition-colors animate-slide-in"
                style={{ animationDelay: `${i * 50}ms` }}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{cat.icon}</span>
                  <div>
                    <p className="text-sm font-medium text-foreground">
                      {tx.description || cat.label}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {format(new Date(tx.transaction_date), 'MMM dd, yyyy')}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-sm font-semibold ${
                    tx.type === 'income' ? 'text-primary' : 'text-destructive'
                  }`}
                >
                  {tx.type === 'income' ? '+' : '-'}
                  {formatMoney(Number(tx.amount))}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}