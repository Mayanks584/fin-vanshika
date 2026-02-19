import { useMemo } from "react";
import { TrendingUp, TrendingDown, Wallet, PiggyBank, ArrowUpRight, ArrowDownRight } from "lucide-react";
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from "recharts";
import { mockTransactions, getSummary, monthlyData, categoryExpenses } from "@/data/mockData";
import { motion } from "framer-motion";

const fadeUp = {
  initial: { opacity: 0, y: 16 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.4 },
};

export default function Dashboard() {
  const summary = useMemo(() => getSummary(mockTransactions), []);
  const recentTransactions = mockTransactions.slice(0, 5);

  const summaryCards = [
    { label: "Total Income", value: summary.totalIncome, icon: TrendingUp, colorClass: "bg-income-muted text-income", prefix: "$" },
    { label: "Total Expense", value: summary.totalExpense, icon: TrendingDown, colorClass: "bg-expense-muted text-expense", prefix: "$" },
    { label: "Current Balance", value: summary.balance, icon: Wallet, colorClass: "bg-savings-muted text-savings", prefix: "$" },
    { label: "Savings", value: summary.savings, icon: PiggyBank, colorClass: "bg-accent text-accent-foreground", prefix: "$" },
  ];

  return (
    <div className="space-y-6 lg:space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Dashboard</h1>
        <p className="text-sm text-muted-foreground mt-1">Your financial overview at a glance</p>
      </div>

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
            <p className="text-2xl font-bold text-foreground">
              {card.prefix}{card.value.toLocaleString()}
            </p>
          </motion.div>
        ))}
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bar Chart */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.3 }} className="bg-card rounded-xl p-5 sm:p-6 finance-card-shadow">
          <h3 className="text-base font-semibold text-foreground mb-4">Income vs Expense</h3>
          <ResponsiveContainer width="100%" height={280}>
            <BarChart data={monthlyData} barGap={4}>
              <CartesianGrid strokeDasharray="3 3" stroke="hsl(214, 20%, 90%)" />
              <XAxis dataKey="month" tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} />
              <YAxis tick={{ fontSize: 12, fill: "hsl(215, 15%, 50%)" }} />
              <Tooltip
                contentStyle={{
                  background: "hsl(0, 0%, 100%)",
                  border: "1px solid hsl(214, 20%, 90%)",
                  borderRadius: "8px",
                  fontSize: "13px",
                }}
              />
              <Legend />
              <Bar dataKey="income" name="Income" fill="hsl(152, 60%, 42%)" radius={[4, 4, 0, 0]} />
              <Bar dataKey="expense" name="Expense" fill="hsl(0, 72%, 55%)" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        {/* Pie Chart */}
        <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.4 }} className="bg-card rounded-xl p-5 sm:p-6 finance-card-shadow">
          <h3 className="text-base font-semibold text-foreground mb-4">Expense by Category</h3>
          <ResponsiveContainer width="100%" height={280}>
            <PieChart>
              <Pie data={categoryExpenses} cx="50%" cy="50%" innerRadius={60} outerRadius={100} paddingAngle={3} dataKey="value" nameKey="name">
                {categoryExpenses.map((entry, index) => (
                  <Cell key={index} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip formatter={(value: number) => `$${value}`} contentStyle={{ borderRadius: "8px", fontSize: "13px" }} />
              <Legend />
            </PieChart>
          </ResponsiveContainer>
        </motion.div>
      </div>

      {/* Recent Transactions */}
      <motion.div {...fadeUp} transition={{ ...fadeUp.transition, delay: 0.5 }} className="bg-card rounded-xl p-5 sm:p-6 finance-card-shadow">
        <h3 className="text-base font-semibold text-foreground mb-4">Recent Transactions</h3>
        <div className="space-y-3">
          {recentTransactions.map(t => (
            <div key={t.id} className="flex items-center justify-between py-3 border-b border-border last:border-0">
              <div className="flex items-center gap-3">
                <div className={`w-9 h-9 rounded-lg flex items-center justify-center ${t.type === "income" ? "bg-income-muted text-income" : "bg-expense-muted text-expense"}`}>
                  {t.type === "income" ? <ArrowUpRight className="w-4 h-4" /> : <ArrowDownRight className="w-4 h-4" />}
                </div>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.description}</p>
                  <p className="text-xs text-muted-foreground">{t.category} · {t.date}</p>
                </div>
              </div>
              <span className={`text-sm font-semibold ${t.type === "income" ? "text-income" : "text-expense"}`}>
                {t.type === "income" ? "+" : "-"}${t.amount.toLocaleString()}
              </span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
