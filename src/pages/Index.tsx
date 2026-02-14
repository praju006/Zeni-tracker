import { DashboardStats } from '@/components/DashboardStats';
import { RecentTransactions } from '@/components/RecentTransactions';
import { SpendingPieChart } from '@/components/charts/SpendingPieChart';
import { MonthlyTrendChart } from '@/components/charts/MonthlyTrendChart';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { useTransactions } from '@/hooks/useTransactions';
import { SidebarTrigger } from '@/components/ui/sidebar';

const Dashboard = () => {
  const { data: transactions = [], isLoading } = useTransactions();

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Dashboard</h2>
            <p className="text-sm text-muted-foreground">Track your finances at a glance</p>
          </div>
        </div>
        <AddTransactionDialog />
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center h-64">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
        </div>
      ) : (
        <div className="space-y-6">
          <DashboardStats transactions={transactions} />
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <SpendingPieChart transactions={transactions} />
            <MonthlyTrendChart transactions={transactions} />
          </div>
          <RecentTransactions transactions={transactions} />
        </div>
      )}
    </div>
  );
};

export default Dashboard;
