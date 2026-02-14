import { useTransactions } from '@/hooks/useTransactions';
import { SpendingPieChart } from '@/components/charts/SpendingPieChart';
import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart';
import { IncomeExpenseChart } from '@/components/charts/IncomeExpenseChart';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { formatCurrency, getCategoryInfo } from '@/lib/constants';

const Analytics = () => {
  const { data: transactions = [], isLoading } = useTransactions();

  const expenses = transactions.filter(t => t.type === 'expense');
  const byCategory = expenses.reduce((acc, tx) => {
    acc[tx.category] = (acc[tx.category] || 0) + Number(tx.amount);
    return acc;
  }, {} as Record<string, number>);

  const topCategory = Object.entries(byCategory).sort(([, a], [, b]) => b - a)[0];

  const totalIncome = transactions.filter(t => t.type === 'income').reduce((s, t) => s + Number(t.amount), 0);
  const totalExpense = expenses.reduce((s, t) => s + Number(t.amount), 0);
  const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome * 100) : 0;

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto">
      <div className="flex items-center gap-3 mb-8">
        <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
        <div>
          <h2 className="text-2xl font-bold text-foreground">Analytics</h2>
          <p className="text-sm text-muted-foreground">Deep insights into your spending</p>
        </div>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Summary cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="stat-card animate-fade-in">
              <p className="text-sm text-muted-foreground mb-2">Top Spending Category</p>
              <p className="text-xl font-bold text-foreground">
                {topCategory ? `${getCategoryInfo(topCategory[0]).icon} ${getCategoryInfo(topCategory[0]).label}` : 'N/A'}
              </p>
              {topCategory && <p className="text-sm text-destructive mt-1">{formatCurrency(topCategory[1])}</p>}
            </div>
            <div className="stat-card animate-fade-in" style={{ animationDelay: '100ms' }}>
              <p className="text-sm text-muted-foreground mb-2">Savings Rate</p>
              <p className="text-xl font-bold text-foreground">{savingsRate.toFixed(1)}%</p>
              <p className="text-xs text-muted-foreground mt-1">of total income</p>
            </div>
            <div className="stat-card animate-fade-in" style={{ animationDelay: '200ms' }}>
              <p className="text-sm text-muted-foreground mb-2">Total Transactions</p>
              <p className="text-xl font-bold text-foreground">{transactions.length}</p>
              <p className="text-xs text-muted-foreground mt-1">{expenses.length} expenses • {transactions.length - expenses.length} income</p>
            </div>
          </div>

          <IncomeExpenseChart transactions={transactions} />

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingPieChart transactions={transactions} />
            <MonthlyTrendChart transactions={transactions} />
          </div>
        </div>
      )}
    </div>
  );
};

export default Analytics;
