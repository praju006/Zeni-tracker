export const CATEGORIES = {
  income: [
    { value: 'salary', label: 'Salary', icon: '💰' },
    { value: 'freelance', label: 'Freelance', icon: '💻' },
    { value: 'investments', label: 'Investments', icon: '📈' },
    { value: 'gifts', label: 'Gifts', icon: '🎁' },
    { value: 'other_income', label: 'Other', icon: '💵' },
  ],
  expense: [
    { value: 'food', label: 'Food & Dining', icon: '🍕' },
    { value: 'transport', label: 'Transport', icon: '🚗' },
    { value: 'shopping', label: 'Shopping', icon: '🛍️' },
    { value: 'bills', label: 'Bills & Utilities', icon: '📄' },
    { value: 'entertainment', label: 'Entertainment', icon: '🎬' },
    { value: 'health', label: 'Health', icon: '🏥' },
    { value: 'travel', label: 'Travel', icon: '✈️' },
    { value: 'education', label: 'Education', icon: '📚' },
    { value: 'rent', label: 'Rent', icon: '🏠' },
    { value: 'other_expense', label: 'Other', icon: '📦' },
  ],
} as const;

export const ALL_CATEGORIES = [...CATEGORIES.income, ...CATEGORIES.expense];

export function getCategoryInfo(value: string) {
  return ALL_CATEGORIES.find(c => c.value === value) || { value, label: value, icon: '📦' };
}

export function formatCurrency(amount: number, currency = 'USD') {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(amount);
}
