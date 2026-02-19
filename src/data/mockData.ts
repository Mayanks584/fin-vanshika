// Mock data for the Personal Finance Manager

export interface Transaction {
  id: string;
  type: "income" | "expense";
  amount: number;
  category: string;
  description: string;
  date: string;
  source?: string;
}

export interface Budget {
  category: string;
  limit: number;
  spent: number;
}

export const mockTransactions: Transaction[] = [
  { id: "1", type: "income", amount: 5000, category: "Salary", description: "Monthly salary", date: "2025-02-01", source: "Company" },
  { id: "2", type: "expense", amount: 1200, category: "Rent", description: "Monthly rent", date: "2025-02-02" },
  { id: "3", type: "expense", amount: 350, category: "Food", description: "Groceries", date: "2025-02-03" },
  { id: "4", type: "income", amount: 800, category: "Freelance", description: "Web design project", date: "2025-02-05", source: "Upwork" },
  { id: "5", type: "expense", amount: 150, category: "Travel", description: "Uber rides", date: "2025-02-06" },
  { id: "6", type: "expense", amount: 500, category: "Shopping", description: "New clothes", date: "2025-02-08" },
  { id: "7", type: "expense", amount: 200, category: "Food", description: "Restaurant dinners", date: "2025-02-10" },
  { id: "8", type: "income", amount: 300, category: "Investment", description: "Dividend income", date: "2025-02-12", source: "Stocks" },
  { id: "9", type: "expense", amount: 100, category: "Others", description: "Subscription services", date: "2025-02-14" },
  { id: "10", type: "expense", amount: 250, category: "Shopping", description: "Electronics", date: "2025-02-15" },
];

export const mockBudgets: Budget[] = [
  { category: "Food", limit: 800, spent: 550 },
  { category: "Travel", limit: 300, spent: 150 },
  { category: "Shopping", limit: 600, spent: 750 },
  { category: "Rent", limit: 1200, spent: 1200 },
  { category: "Others", limit: 200, spent: 100 },
];

export const expenseCategories = ["Food", "Travel", "Shopping", "Rent", "Others"] as const;

export const monthlyData = [
  { month: "Sep", income: 5200, expense: 3100 },
  { month: "Oct", income: 5500, expense: 3400 },
  { month: "Nov", income: 5000, expense: 2900 },
  { month: "Dec", income: 6200, expense: 4100 },
  { month: "Jan", income: 5800, expense: 3600 },
  { month: "Feb", income: 6100, expense: 2750 },
];

export const categoryExpenses = [
  { name: "Food", value: 550, color: "hsl(174, 62%, 38%)" },
  { name: "Rent", value: 1200, color: "hsl(217, 70%, 55%)" },
  { name: "Travel", value: 150, color: "hsl(38, 92%, 50%)" },
  { name: "Shopping", value: 750, color: "hsl(0, 72%, 55%)" },
  { name: "Others", value: 100, color: "hsl(152, 60%, 42%)" },
];

export function getSummary(transactions: Transaction[]) {
  const totalIncome = transactions.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0);
  const totalExpense = transactions.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0);
  return {
    totalIncome,
    totalExpense,
    balance: totalIncome - totalExpense,
    savings: Math.round((totalIncome - totalExpense) * 0.6),
  };
}
