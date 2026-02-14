import { useState } from 'react';
import { useTransactions, useDeleteTransaction } from '@/hooks/useTransactions';
import { formatCurrency, getCategoryInfo, CATEGORIES } from '@/lib/constants';
import { AddTransactionDialog } from '@/components/AddTransactionDialog';
import { SidebarTrigger } from '@/components/ui/sidebar';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Search } from 'lucide-react';
import { format } from 'date-fns';

const Transactions = () => {
  const { data: transactions = [], isLoading } = useTransactions();
  const deleteTx = useDeleteTransaction();
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState<string>('all');
  const [filterCategory, setFilterCategory] = useState<string>('all');

  const filtered = transactions.filter(tx => {
    if (filterType !== 'all' && tx.type !== filterType) return false;
    if (filterCategory !== 'all' && tx.category !== filterCategory) return false;
    if (search) {
      const q = search.toLowerCase();
      return (
        (tx.description?.toLowerCase().includes(q)) ||
        tx.category.toLowerCase().includes(q) ||
        String(tx.amount).includes(q)
      );
    }
    return true;
  });

  const allCategories = [...CATEGORIES.income, ...CATEGORIES.expense];

  return (
    <div className="flex-1 p-4 md:p-8 overflow-auto">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <SidebarTrigger className="text-muted-foreground hover:text-foreground" />
          <div>
            <h2 className="text-2xl font-bold text-foreground">Transactions</h2>
            <p className="text-sm text-muted-foreground">{transactions.length} total transactions</p>
          </div>
        </div>
        <AddTransactionDialog />
      </div>

      {/* Filters */}
      <div className="glass rounded-xl p-4 mb-6 flex flex-wrap gap-3">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Search transactions..."
            value={search}
            onChange={e => setSearch(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={filterType} onValueChange={setFilterType}>
          <SelectTrigger className="w-[140px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Types</SelectItem>
            <SelectItem value="income">Income</SelectItem>
            <SelectItem value="expense">Expense</SelectItem>
          </SelectContent>
        </Select>
        <Select value={filterCategory} onValueChange={setFilterCategory}>
          <SelectTrigger className="w-[180px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            {allCategories.map(c => (
              <SelectItem key={c.value} value={c.value}>{c.icon} {c.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>

      {/* Transaction list */}
      <div className="glass rounded-xl overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center h-32">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin" />
          </div>
        ) : filtered.length === 0 ? (
          <p className="text-muted-foreground text-sm text-center py-12">No transactions found</p>
        ) : (
          <div className="divide-y divide-border/40">
            {filtered.map((tx, i) => {
              const cat = getCategoryInfo(tx.category);
              return (
                <div
                  key={tx.id}
                  className="flex items-center justify-between p-4 hover:bg-secondary/20 transition-colors animate-fade-in"
                  style={{ animationDelay: `${i * 30}ms` }}
                >
                  <div className="flex items-center gap-4">
                    <span className="text-2xl">{cat.icon}</span>
                    <div>
                      <p className="font-medium text-foreground">{tx.description || cat.label}</p>
                      <div className="flex items-center gap-2 text-xs text-muted-foreground">
                        <span>{format(new Date(tx.transaction_date), 'MMM dd, yyyy')}</span>
                        <span>•</span>
                        <span className="capitalize">{cat.label}</span>
                      </div>
                      {tx.notes && <p className="text-xs text-muted-foreground mt-1">{tx.notes}</p>}
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className={`font-semibold ${tx.type === 'income' ? 'text-primary' : 'text-destructive'}`}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(Number(tx.amount))}
                    </span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-muted-foreground hover:text-destructive"
                      onClick={() => deleteTx.mutate(tx.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default Transactions;
