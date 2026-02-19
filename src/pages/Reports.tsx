import { useState, useEffect, useMemo } from "react";
import {
    BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    PieChart, Pie, Cell, Legend,
} from "recharts";
import { motion } from "framer-motion";
import {
    TrendingUp, TrendingDown, Wallet, Percent, Download, CalendarRange,
    ArrowUpRight, ArrowDownRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import {
    getTransactions,
    computeSummary,
    computeMonthlyData,
    computeCategoryExpenses,
    exportToCSV,
    type Transaction,
} from "@/services/transactionService";

const CATEGORY_COLORS: Record<string, string> = {
    Food: "hsl(174, 62%, 38%)",
    Rent: "hsl(217, 70%, 55%)",
    Travel: "hsl(38, 92%, 50%)",
    Shopping: "hsl(0, 72%, 55%)",
    Others: "hsl(152, 60%, 42%)",
    Salary: "hsl(195, 70%, 45%)",
    Freelance: "hsl(270, 60%, 55%)",
    Investment: "hsl(45, 85%, 50%)",
};

const PRESETS = [
    { label: "This Month", getValue: () => { const n = new Date(); return { start: `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-01`, end: today() }; } },
    { label: "Last Month", getValue: () => { const n = new Date(); n.setMonth(n.getMonth() - 1); const y = n.getFullYear(), m = String(n.getMonth() + 1).padStart(2, "0"), last = new Date(y, n.getMonth() + 1, 0).getDate(); return { start: `${y}-${m}-01`, end: `${y}-${m}-${last}` }; } },
    { label: "Last 3 Months", getValue: () => { const n = new Date(); const s = new Date(n.getFullYear(), n.getMonth() - 2, 1); return { start: s.toISOString().slice(0, 10), end: today() }; } },
    { label: "This Year", getValue: () => ({ start: `${new Date().getFullYear()}-01-01`, end: today() }) },
    { label: "All Time", getValue: () => ({ start: "2000-01-01", end: today() }) },
];

function today() {
    return new Date().toISOString().slice(0, 10);
}

function thisMonthStart() {
    const n = new Date();
    return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-01`;
}

const fadeUp = { initial: { opacity: 0, y: 16 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.4 } };

export default function Reports() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [allTransactions, setAllTransactions] = useState<Transaction[]>([]);
    const [loading, setLoading] = useState(true);
    const [startDate, setStartDate] = useState(thisMonthStart());
    const [endDate, setEndDate] = useState(today());
    const [activePreset, setActivePreset] = useState("This Month");

    useEffect(() => {
        if (!user) return;
        getTransactions(user.id)
            .then(setAllTransactions)
            .catch(console.error)
            .finally(() => setLoading(false));
    }, [user]);

    const filtered = useMemo(
        () => allTransactions.filter(t => t.date >= startDate && t.date <= endDate),
        [allTransactions, startDate, endDate]
    );

    const summary = useMemo(() => computeSummary(filtered), [filtered]);
    const monthlyData = useMemo(() => computeMonthlyData(filtered), [filtered]);
    const categoryExpenses = useMemo(() => computeCategoryExpenses(filtered), [filtered]);

    const savingsRate = useMemo(() => {
        if (summary.totalIncome === 0) return 0;
        return Math.round(((summary.totalIncome - summary.totalExpense) / summary.totalIncome) * 100);
    }, [summary]);

    const topCategories = useMemo(
        () => [...categoryExpenses].sort((a, b) => b.value - a.value).slice(0, 5),
        [categoryExpenses]
    );

    const maxCategoryValue = topCategories[0]?.value || 1;

    const applyPreset = (preset: typeof PRESETS[0]) => {
        const { start, end } = preset.getValue();
        setStartDate(start);
        setEndDate(end);
        setActivePreset(preset.label);
    };

    const handleExport = () => {
        if (filtered.length === 0) {
            toast({ title: "Nothing to export", description: "No transactions in the selected date range.", variant: "destructive" });
            return;
        }
        const from = startDate.replace(/-/g, "");
        const to = endDate.replace(/-/g, "");
        exportToCSV(filtered, `transactions_${from}_${to}.csv`);
        toast({ title: "CSV Exported", description: `${filtered.length} transaction(s) downloaded.` });
    };

    const handleStartChange = (v: string) => { setStartDate(v); setActivePreset(""); };
    const handleEndChange = (v: string) => { setEndDate(v); setActivePreset(""); };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-20">
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin" />
            </div>
        );
    }

    const summaryCards = [
        { label: "Total Income", value: `₹${summary.totalIncome.toLocaleString()}`, icon: TrendingUp, colorClass: "bg-income-muted text-income" },
        { label: "Total Expense", value: `₹${summary.totalExpense.toLocaleString()}`, icon: TrendingDown, colorClass: "bg-expense-muted text-expense" },
        { label: "Net Balance", value: `₹${summary.balance.toLocaleString()}`, icon: Wallet, colorClass: summary.balance >= 0 ? "bg-savings-muted text-savings" : "bg-expense-muted text-expense" },
        { label: "Savings Rate", value: `${savingsRate}%`, icon: Percent, colorClass: "bg-accent text-accent-foreground" },
    ];

    return (
        <div className="space-y-6 lg:space-y-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div>
                    <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Reports</h1>
                    <p className="text-sm text-muted-foreground mt-1">Detailed financial analytics for any date range</p>
                </div>
                <Button
                    onClick={handleExport}
                    className="flex items-center gap-2 self-start sm:self-auto"
                    id="export-csv-btn"
                >
                    <Download className="w-4 h-4" />
                    Download CSV
                </Button>
            </div>

            {/* Date Range Filters */}
            <motion.div
                {...fadeUp}
                className="bg-card rounded-xl p-5 finance-card-shadow space-y-4"
            >
                <div className="flex items-center gap-2 text-sm font-semibold text-foreground mb-1">
                    <CalendarRange className="w-4 h-4 text-primary" />
                    Date Range
                </div>
                {/* Quick Presets */}
                <div className="flex flex-wrap gap-2">
                    {PRESETS.map(p => (
                        <button
                            key={p.label}
                            onClick={() => applyPreset(p)}
                            id={`preset-${p.label.replace(/\s+/g, "-").toLowerCase()}`}
                            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all duration-200 ${activePreset === p.label
                                    ? "bg-primary text-primary-foreground border-primary shadow-sm"
                                    : "bg-background text-muted-foreground border-border hover:border-primary hover:text-foreground"
                                }`}
                        >
                            {p.label}
                        </button>
                    ))}
                </div>
                {/* Custom Date Inputs */}
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="start-date" className="text-xs text-muted-foreground font-medium">From</label>
                        <input
                            id="start-date"
                            type="date"
                            value={startDate}
                            max={endDate}
                            onChange={e => handleStartChange(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                        />
                    </div>
                    <div className="flex flex-col gap-1.5">
                        <label htmlFor="end-date" className="text-xs text-muted-foreground font-medium">To</label>
                        <input
                            id="end-date"
                            type="date"
                            value={endDate}
                            min={startDate}
                            max={today()}
                            onChange={e => handleEndChange(e.target.value)}
                            className="px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-colors"
                        />
                    </div>
                    <div className="flex items-end">
                        <span className="text-xs text-muted-foreground pb-2.5">
                            {filtered.length} transaction{filtered.length !== 1 ? "s" : ""} found
                        </span>
                    </div>
                </div>
            </motion.div>

            {/* Summary Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {summaryCards.map((card, i) => (
                    <motion.div
                        key={card.label}
                        {...fadeUp}
                        transition={{ ...fadeUp.transition, delay: i * 0.08 }}
                        className="bg-card rounded-xl p-5 finance-card-shadow hover:finance-card-shadow-hover transition-shadow duration-300"
                    >
                        <div className="flex items-center justify-between mb-3">
                            <span className="text-sm font-medium text-muted-foreground">{card.label}</span>
                            <div className={`w-9 h-9 rounded-lg ${card.colorClass} flex items-center justify-center`}>
                                <card.icon className="w-4.5 h-4.5" />
                            </div>
                        </div>
                        <p className="text-2xl font-bold text-foreground">{card.value}</p>
                    </motion.div>
                ))}
            </div>

            {/* Charts Row */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Bar Chart – Income vs Expense */}
                <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }} className="bg-card rounded-xl p-5 sm:p-6 finance-card-shadow">
                    <h3 className="text-base font-semibold text-foreground mb-4">Income vs Expense</h3>
                    {monthlyData.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <BarChart data={monthlyData} barGap={4}>
                                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} />
                                <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} tickFormatter={v => `₹${v >= 1000 ? `${(v / 1000).toFixed(0)}k` : v}`} />
                                <Tooltip
                                    formatter={(value: number) => `₹${value.toLocaleString()}`}
                                    contentStyle={{ background: "hsl(0,0%,100%)", border: "1px solid hsl(214,20%,90%)", borderRadius: "8px", fontSize: "13px" }}
                                />
                                <Legend />
                                <Bar dataKey="income" name="Income" fill="hsl(152, 60%, 42%)" radius={[4, 4, 0, 0]} />
                                <Bar dataKey="expense" name="Expense" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
                            No data in the selected range.
                        </div>
                    )}
                </motion.div>

                {/* Pie Chart – Expense by Category */}
                <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.4 }} className="bg-card rounded-xl p-5 sm:p-6 finance-card-shadow">
                    <h3 className="text-base font-semibold text-foreground mb-4">Expense by Category</h3>
                    {categoryExpenses.length > 0 ? (
                        <ResponsiveContainer width="100%" height={260}>
                            <PieChart>
                                <Pie data={categoryExpenses} cx="50%" cy="50%" innerRadius={55} outerRadius={95} paddingAngle={3} dataKey="value" nameKey="name">
                                    {categoryExpenses.map((entry, index) => (
                                        <Cell key={index} fill={CATEGORY_COLORS[entry.name] || entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip formatter={(value: number) => `₹${value.toLocaleString()}`} contentStyle={{ borderRadius: "8px", fontSize: "13px" }} />
                                <Legend />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <div className="flex items-center justify-center h-[260px] text-muted-foreground text-sm">
                            No expenses in the selected range.
                        </div>
                    )}
                </motion.div>
            </div>

            {/* Top Spending Categories */}
            {topCategories.length > 0 && (
                <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.45 }} className="bg-card rounded-xl p-5 sm:p-6 finance-card-shadow">
                    <h3 className="text-base font-semibold text-foreground mb-5">Top Spending Categories</h3>
                    <div className="space-y-4">
                        {topCategories.map((cat, i) => {
                            const pct = Math.round((cat.value / maxCategoryValue) * 100);
                            const color = CATEGORY_COLORS[cat.name] || cat.color;
                            return (
                                <div key={cat.name}>
                                    <div className="flex items-center justify-between mb-1.5">
                                        <div className="flex items-center gap-2">
                                            <span className="text-xs font-semibold text-muted-foreground w-5">#{i + 1}</span>
                                            <span className="text-sm font-medium text-foreground">{cat.name}</span>
                                        </div>
                                        <span className="text-sm font-semibold text-foreground">₹{cat.value.toLocaleString()}</span>
                                    </div>
                                    <div className="w-full h-2 bg-muted rounded-full overflow-hidden">
                                        <div
                                            className="h-full rounded-full transition-all duration-500"
                                            style={{ width: `${pct}%`, background: color }}
                                        />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </motion.div>
            )}

            {/* Transactions Table */}
            <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.5 }} className="bg-card rounded-xl finance-card-shadow overflow-hidden">
                <div className="px-5 py-4 border-b border-border flex items-center justify-between">
                    <h3 className="text-base font-semibold text-foreground">Transactions in Range</h3>
                    <span className="text-xs text-muted-foreground">{filtered.length} records</span>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                        <thead className="bg-muted/40">
                            <tr>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Date</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Type</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Category</th>
                                <th className="px-4 py-3 text-left text-xs font-semibold text-muted-foreground">Description</th>
                                <th className="px-4 py-3 text-right text-xs font-semibold text-muted-foreground">Amount</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-border">
                            {filtered.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="text-center text-muted-foreground py-12">
                                        No transactions in the selected date range.
                                    </td>
                                </tr>
                            ) : (
                                filtered.map(t => (
                                    <tr key={t.id} className="hover:bg-muted/30 transition-colors">
                                        <td className="px-4 py-3 text-foreground">{t.date}</td>
                                        <td className="px-4 py-3">
                                            <span className={`inline-flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-full ${t.type === "income" ? "bg-income-muted text-income" : "bg-expense-muted text-expense"}`}>
                                                {t.type === "income" ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownRight className="w-3 h-3" />}
                                                {t.type === "income" ? "Income" : "Expense"}
                                            </span>
                                        </td>
                                        <td className="px-4 py-3 text-foreground">{t.category}</td>
                                        <td className="px-4 py-3 text-muted-foreground">{t.description}</td>
                                        <td className={`px-4 py-3 text-right font-semibold ${t.type === "income" ? "text-income" : "text-expense"}`}>
                                            {t.type === "income" ? "+" : "-"}₹{t.amount.toLocaleString()}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </motion.div>
        </div>
    );
}
