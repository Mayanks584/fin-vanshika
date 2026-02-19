import { useState } from "react";
import { mockBudgets, type Budget } from "@/data/mockData";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { AlertTriangle, Wallet } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { motion } from "framer-motion";

export default function BudgetPage() {
  const [budgets, setBudgets] = useState<Budget[]>(mockBudgets);
  const [overallBudget, setOverallBudget] = useState("3000");
  const { toast } = useToast();

  const totalSpent = budgets.reduce((s, b) => s + b.spent, 0);
  const totalLimit = Number(overallBudget) || 0;

  const handleLimitChange = (category: string, newLimit: string) => {
    setBudgets(prev => prev.map(b => b.category === category ? { ...b, limit: Number(newLimit) || 0 } : b));
  };

  const handleSave = () => {
    toast({ title: "Budget saved!", description: "Your budget limits have been updated." });
  };

  return (
    <div className="space-y-6 lg:space-y-8 max-w-3xl mx-auto">
      <div>
        <h1 className="text-2xl sm:text-3xl font-bold text-foreground">Budget Management</h1>
        <p className="text-sm text-muted-foreground mt-1">Set and track your monthly budgets</p>
      </div>

      {/* Overall Budget */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="bg-card rounded-xl p-6 finance-card-shadow"
      >
        <div className="flex items-center gap-3 mb-4">
          <div className="w-10 h-10 rounded-lg bg-savings-muted text-savings flex items-center justify-center">
            <Wallet className="w-5 h-5" />
          </div>
          <h2 className="text-lg font-semibold text-foreground">Overall Monthly Budget</h2>
        </div>
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          <div className="flex-1 space-y-2 w-full">
            <Label>Budget Limit ($)</Label>
            <Input type="number" value={overallBudget} onChange={e => setOverallBudget(e.target.value)} />
          </div>
          <div className="flex-1 w-full">
            <div className="flex justify-between text-sm mb-1">
              <span className="text-muted-foreground">Spent: ${totalSpent.toLocaleString()}</span>
              <span className={totalSpent > totalLimit ? "text-destructive font-medium" : "text-muted-foreground"}>
                {totalLimit > 0 ? Math.round((totalSpent / totalLimit) * 100) : 0}%
              </span>
            </div>
            <Progress value={totalLimit > 0 ? Math.min((totalSpent / totalLimit) * 100, 100) : 0} className="h-3" />
          </div>
        </div>
        {totalSpent > totalLimit && totalLimit > 0 && (
          <div className="mt-4 flex items-center gap-2 p-3 rounded-lg bg-warning-muted text-warning text-sm font-medium">
            <AlertTriangle className="w-4 h-4 shrink-0" />
            You've exceeded your overall budget by ${(totalSpent - totalLimit).toLocaleString()}!
          </div>
        )}
      </motion.div>

      {/* Category Budgets */}
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: 0.15 }}
        className="bg-card rounded-xl p-6 finance-card-shadow space-y-5"
      >
        <h2 className="text-lg font-semibold text-foreground">Category-wise Budgets</h2>

        {budgets.map(b => {
          const pct = b.limit > 0 ? Math.round((b.spent / b.limit) * 100) : 0;
          const exceeded = b.spent > b.limit;
          return (
            <div key={b.category} className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium text-foreground">{b.category}</span>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">Limit: $</span>
                  <Input
                    type="number"
                    value={b.limit}
                    onChange={e => handleLimitChange(b.category, e.target.value)}
                    className="w-24 h-8 text-sm"
                  />
                </div>
              </div>
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Spent: ${b.spent.toLocaleString()}</span>
                <span className={exceeded ? "text-destructive font-medium" : ""}>{pct}%</span>
              </div>
              <Progress value={Math.min(pct, 100)} className="h-2.5" />
              {exceeded && (
                <div className="flex items-center gap-1.5 text-xs text-destructive font-medium">
                  <AlertTriangle className="w-3 h-3" />
                  Exceeded by ${(b.spent - b.limit).toLocaleString()}
                </div>
              )}
            </div>
          );
        })}

        <Button onClick={handleSave} className="w-full">Save Budget</Button>
      </motion.div>
    </div>
  );
}
