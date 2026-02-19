import { useMemo, useState } from "react";
import { format, isWithinInterval, parseISO, startOfMonth, endOfMonth, subMonths } from "date-fns";
import { CalendarIcon, Download, TrendingUp, TrendingDown, BarChart3, PieChart as PieChartIcon } from "lucide-react";
import {
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, Legend, AreaChart, Area,
} from "recharts";
import { mockTransactions, expenseCategories } from "@/data/mockData";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { cn } from "@/lib/utils";
import { useToast } from "@/hooks/use-toast";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

function downloadCSV(data: typeof mockTransactions, filename: string) {
  const headers = ["Date", "Type", "Category", "Description", "Amount", "Source"];
  const rows = data.map(t => [
    t.date,
    t.type,
    t.category,
    t.description,
    t.amount.toString(),
    t.source || "",
  ]);
  const csv = [headers, ...rows].map(r => r.map(c => `"${c}"`).join(",")).join("\n");
  const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export default function Reports() {
  const { toast } = useToast();
  const now = new Date();
  const [startDate, setStartDate] = useState<Date>(startOfMonth(subMonths(now, 5)));
  const [endDate, setEndDate] = useState<Date>(endOfMonth(now));

  const filtered = useMemo(() => {
    return mockTransactions.filter(t => {
      const d = parseISO(t.date);
      return isWithinInterval(d, { start: startDate, end: endDate });
    });
  }, [startDate, endDate]);

  const totalIncome = useMemo(() => filtered.filter(t => t.type === "income").reduce((s, t) => s + t.amount, 0), [filtered]);
  const totalExpense = useMemo(() => filtered.filter(t => t.type === "expense").reduce((s, t) => s + t.amount, 0), [filtered]);
  const netSavings = totalIncome - totalExpense;
  const savingsRate = totalIncome > 0 ? Math.round((netSavings / totalIncome) * 100) : 0;

  // Category breakdown
  const categoryData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter(t => t.type === "expense").forEach(t => {
      map[t.category] = (map[t.category] || 0) + t.amount;
    });
    const colors = [
      "hsl(174, 62%, 38%)", "hsl(217, 70%, 55%)", "hsl(38, 92%, 50%)",
      "hsl(0, 72%, 55%)", "hsl(152, 60%, 42%)",
    ];
    return Object.entries(map).map(([name, value], i) => ({
      name, value, color: colors[i % colors.length],
    }));
  }, [filtered]);

  // Income source breakdown
  const incomeSourceData = useMemo(() => {
    const map: Record<string, number> = {};
    filtered.filter(t => t.type === "income").forEach(t => {
      const src = t.source || t.category;
      map[src] = (map[src] || 0) + t.amount;
    });
    const colors = ["hsl(152, 60%, 42%)", "hsl(174, 62%, 38%)", "hsl(217, 70%, 55%)", "hsl(38, 92%, 50%)"];
    return Object.entries(map).map(([name, value], i) => ({
      name, value, color: colors[i % colors.length],
    }));
  }, [filtered]);

  // Daily spending trend
  const dailyTrend = useMemo(() => {
    const map: Record<string, { date: string; income: number; expense: number }> = {};
    filtered.forEach(t => {
      if (!map[t.date]) map[t.date] = { date: t.date, income: 0, expense: 0 };
      map[t.date][t.type] += t.amount;
    });
    return Object.values(map).sort((a, b) => a.date.localeCompare(b.date));
  }, [filtered]);

  const handleExport = () => {
    downloadCSV(filtered, `finance-report-${format(startDate, "yyyy-MM-dd")}-to-${format(endDate, "yyyy-MM-dd")}.csv`);
    toast({ title: "Report exported", description: `${filtered.length} transactions exported as CSV.` });
  };

  const stats = [
    { label: "Total Income", value: totalIncome, icon: TrendingUp, colorClass: "bg-income-muted text-income", prefix: "$" },
    { label: "Total Expense", value: totalExpense, icon: TrendingDown, colorClass: "bg-expense-muted text-expense", prefix: "$" },
    { label: "Net Savings", value: netSavings, icon: BarChart3, colorClass: "bg-savings-muted text-savings", prefix: "$" },
    { label: "Savings Rate", value: savingsRate, icon: PieChartIcon, colorClass: "bg-accent text-accent-foreground", suffix: "%" },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Reports</h1>
          <p className="text-sm text-muted-foreground mt-1">Detailed financial analytics & export</p>
        </div>
        <Button onClick={handleExport} className="gap-2 w-fit">
          <Download className="w-4 h-4" />
          Export CSV
        </Button>
      </div>

      {/* Date Range Filter */}
      <motion.div {...fadeUp} className="bg-card rounded-xl p-4 sm:p-5 finance-card-shadow flex flex-wrap items-center gap-3">
        <span className="text-sm font-medium text-muted-foreground">Date Range:</span>
        <DatePicker label="From" date={startDate} onSelect={(d) => d && setStartDate(d)} />
        <span className="text-muted-foreground">—</span>
        <DatePicker label="To" date={endDate} onSelect={(d) => d && setEndDate(d)} />
        <span className="text-xs text-muted-foreground ml-auto">{filtered.length} transactions</span>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {stats.map((s, i) => (
          <motion.div
            key={s.label}
            {...fadeUp}
            transition={{ ...fadeUp.transition, delay: i * 0.08 }}
            className="bg-card rounded-xl p-5 finance-card-shadow"
          >
            <div className="flex items-center justify-between mb-3">
              <span className="text-sm font-medium text-muted-foreground">{s.label}</span>
              <div className={`w-9 h-9 rounded-lg ${s.colorClass} flex items-center justify-center`}>
                <s.icon className="w-4.5 h-4.5" />
              </div>
            </div>
            <p className="text-2xl font-bold text-foreground">
              {s.prefix}{s.value.toLocaleString()}{s.suffix}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Spending trend */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }} className="bg-card rounded-xl p-5 sm:p-6 finance-card-shadow">
          <h3 className="text-base font-semibold text-foreground mb-4">Spending Trend</h3>
          <ResponsiveContainer width="100%" height={280}>
            <AreaChart data={dailyTrend}>
              <defs>
                <linearGradient id="incomeGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(152, 60%, 42%)" stopOpacity={0} />
                </linearGradient>
                <linearGradient id="expenseGrad" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="hsl(0, 72%, 55%)" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "hsl(215, 15%, 50%)" }} tickFormatter={(v) => format(parseISO(v), "MMM d")} />
              <YAxis tick={{ fontSize: 11, fill: "hsl(215, 15%, 50%)" }} />
              <Tooltip contentStyle={{ borderRadius: "8px", fontSize: "13px", border: "1px solid hsl(214, 20%, 90%)" }} labelFormatter={(v) => format(parseISO(v as string), "PPP")} />
              <Legend />
              <Area type="monotone" dataKey="income" name="Income" stroke="hsl(152, 60%, 42%)" fill="url(#incomeGrad)" strokeWidth={2} />
              <Area type="monotone" dataKey="expense" name="Expense" stroke="hsl(0, 72%, 55%)" fill="url(#expenseGrad)" strokeWidth={2} />
            </AreaChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Expense by category */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.4 }} className="bg-card rounded-xl p-5 sm:p-6 finance-card-shadow">
          <h3 className="text-base font-semibold text-foreground mb-4">Expense by Category</h3>
          {categoryData.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <PieChart>
                <Pie data={categoryData} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" nameKey="name">
                  {categoryData.map((entry, i) => (
                    <Cell key={i} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: "8px", fontSize: "13px" }} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-16 text-center">No expense data in selected range</p>
          )}
        </motion.div>
      </div>

      {/* Income sources & top expenses */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Income sources */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.5 }} className="bg-card rounded-xl p-5 sm:p-6 finance-card-shadow">
          <h3 className="text-base font-semibold text-foreground mb-4">Income Sources</h3>
          {incomeSourceData.length > 0 ? (
            <ResponsiveContainer width="100%" height={250}>
              <BarChart data={incomeSourceData} layout="vertical">
                <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
                <XAxis type="number" tick={{ fontSize: 11, fill: "hsl(215, 15%, 50%)" }} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} width={80} />
                <Tooltip formatter={(v: number) => `$${v.toLocaleString()}`} contentStyle={{ borderRadius: "8px", fontSize: "13px" }} />
                <Bar dataKey="value" name="Amount" fill="hsl(152, 60%, 42%)" radius={[0, 4, 4, 0]} />
              </BarChart>
            </ResponsiveContainer>
          ) : (
            <p className="text-sm text-muted-foreground py-16 text-center">No income data in selected range</p>
          )}
        </motion.div>

        {/* Top Expenses table */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.6 }} className="bg-card rounded-xl p-5 sm:p-6 finance-card-shadow">
          <h3 className="text-base font-semibold text-foreground mb-4">Top Expenses</h3>
          <div className="space-y-3">
            {filtered
              .filter(t => t.type === "expense")
              .sort((a, b) => b.amount - a.amount)
              .slice(0, 6)
              .map(t => (
                <div key={t.id} className="flex items-center justify-between py-2.5 border-b border-border last:border-0">
                  <div>
                    <p className="text-sm font-medium text-foreground">{t.description}</p>
                    <p className="text-xs text-muted-foreground">{t.category} · {format(parseISO(t.date), "MMM d, yyyy")}</p>
                  </div>
                  <span className="text-sm font-semibold text-expense">-${t.amount.toLocaleString()}</span>
                </div>
              ))}
            {filtered.filter(t => t.type === "expense").length === 0 && (
              <p className="text-sm text-muted-foreground py-8 text-center">No expenses in selected range</p>
            )}
          </div>
        </motion.div>
      </div>
    </div>
  );
}

function DatePicker({ label, date, onSelect }: { label: string; date: Date; onSelect: (d: Date | undefined) => void }) {
  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button variant="outline" className={cn("w-[160px] justify-start text-left font-normal text-sm gap-2")}>
          <CalendarIcon className="w-3.5 h-3.5" />
          {format(date, "MMM d, yyyy")}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar mode="single" selected={date} onSelect={onSelect} initialFocus className="p-3 pointer-events-auto" />
      </PopoverContent>
    </Popover>
  );
}
