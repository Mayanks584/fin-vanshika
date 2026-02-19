import { supabase } from "@/lib/supabase";

export interface Transaction {
    id: string;
    user_id: string;
    type: "income" | "expense";
    amount: number;
    category: string;
    description: string;
    source?: string;
    date: string;
    created_at: string;
}

export async function getTransactions(userId: string): Promise<Transaction[]> {
    const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .order("date", { ascending: false });

    if (error) throw error;
    return data || [];
}

export async function addTransaction(
    transaction: Omit<Transaction, "id" | "created_at">
): Promise<Transaction> {
    const { data, error } = await supabase
        .from("transactions")
        .insert(transaction)
        .select()
        .single();

    if (error) throw error;
    return data;
}

export async function deleteTransaction(id: string): Promise<void> {
    const { error } = await supabase
        .from("transactions")
        .delete()
        .eq("id", id);

    if (error) throw error;
}

export function computeSummary(transactions: Transaction[]) {
    const totalIncome = transactions
        .filter((t) => t.type === "income")
        .reduce((s, t) => s + t.amount, 0);
    const totalExpense = transactions
        .filter((t) => t.type === "expense")
        .reduce((s, t) => s + t.amount, 0);
    return {
        totalIncome,
        totalExpense,
        balance: totalIncome - totalExpense,
        savings: Math.round((totalIncome - totalExpense) * 0.6),
    };
}

export function computeCategoryExpenses(transactions: Transaction[]) {
    const expenses = transactions.filter((t) => t.type === "expense");
    const categoryMap: Record<string, number> = {};
    expenses.forEach((t) => {
        categoryMap[t.category] = (categoryMap[t.category] || 0) + t.amount;
    });

    const colors: Record<string, string> = {
        Food: "hsl(174, 62%, 38%)",
        Rent: "hsl(217, 70%, 55%)",
        Travel: "hsl(38, 92%, 50%)",
        Shopping: "hsl(0, 72%, 55%)",
        Others: "hsl(152, 60%, 42%)",
    };

    return Object.entries(categoryMap).map(([name, value]) => ({
        name,
        value,
        color: colors[name] || `hsl(${Math.random() * 360}, 60%, 50%)`,
    }));
}

export function computeMonthlyData(transactions: Transaction[]) {
    const monthMap: Record<string, { income: number; expense: number }> = {};

    transactions.forEach((t) => {
        const month = t.date.substring(0, 7); // YYYY-MM
        if (!monthMap[month]) monthMap[month] = { income: 0, expense: 0 };
        if (t.type === "income") monthMap[month].income += t.amount;
        else monthMap[month].expense += t.amount;
    });

    const monthNames = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];

    return Object.entries(monthMap)
        .sort(([a], [b]) => a.localeCompare(b))
        .slice(-6)
        .map(([key, val]) => ({
            month: monthNames[parseInt(key.split("-")[1]) - 1],
            income: val.income,
            expense: val.expense,
        }));
}
