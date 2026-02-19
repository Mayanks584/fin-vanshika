import { supabase } from "@/lib/supabase";

export interface Transaction {
    id: string;
    user_id: string;
    type: "income" | "expense";
    amount: number;
    category: string;
    description: string;
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

export async function getTransactionsByDateRange(
    userId: string,
    startDate: string,
    endDate: string
): Promise<Transaction[]> {
    const { data, error } = await supabase
        .from("transactions")
        .select("*")
        .eq("user_id", userId)
        .gte("date", startDate)
        .lte("date", endDate)
        .order("date", { ascending: false });

    if (error) throw error;
    return data || [];
}

export function exportToCSV(transactions: Transaction[], filename = "transactions.csv"): void {
    const headers = ["Date", "Type", "Category", "Description", "Amount"];
    const rows = transactions.map((t) => [
        t.date,
        t.type,
        t.category,
        `"${t.description.replace(/"/g, '""')}"`,
        t.amount.toString(),
    ]);

    const csvContent = [headers.join(","), ...rows.map((r) => r.join(","))].join("\n");
    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", filename);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
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

export async function updateTransaction(
    id: string,
    updates: Partial<Pick<Transaction, "amount" | "category" | "description" | "date" | "type">>
): Promise<Transaction> {
    const { data, error } = await supabase
        .from("transactions")
        .update(updates)
        .eq("id", id)
        .select()
        .single();

    if (error) throw error;
    return data;
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
        savings: totalIncome - totalExpense,
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
