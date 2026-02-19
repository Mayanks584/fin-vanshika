import { useState, useEffect } from "react";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { updateTransaction, type Transaction } from "@/services/transactionService";

const incomeCategories = ["Salary", "Freelance", "Investment", "Others"];
const expenseCategories = ["Food", "Travel", "Shopping", "Rent", "Others"];

interface EditTransactionDialogProps {
    transaction: Transaction | null;
    open: boolean;
    onClose: () => void;
    onUpdated: (updated: Transaction) => void;
}

export default function EditTransactionDialog({
    transaction,
    open,
    onClose,
    onUpdated,
}: EditTransactionDialogProps) {
    const { toast } = useToast();
    const [amount, setAmount] = useState("");
    const [category, setCategory] = useState("");
    const [description, setDescription] = useState("");
    const [date, setDate] = useState("");
    const [type, setType] = useState<"income" | "expense">("expense");
    const [saving, setSaving] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Populate form when a transaction is selected
    useEffect(() => {
        if (transaction) {
            setAmount(String(transaction.amount));
            setCategory(transaction.category);
            setDescription(transaction.description);
            setDate(transaction.date);
            setType(transaction.type);
            setErrors({});
        }
    }, [transaction]);

    const categories = type === "income" ? incomeCategories : expenseCategories;

    const validate = () => {
        const e: Record<string, string> = {};
        if (!amount || Number(amount) <= 0) e.amount = "Enter a positive amount";
        if (!category) e.category = "Select a category";
        if (!date) e.date = "Date is required";
        setErrors(e);
        return Object.keys(e).length === 0;
    };

    const handleSave = async () => {
        if (!transaction || !validate()) return;
        setSaving(true);
        try {
            const updated = await updateTransaction(transaction.id, {
                amount: Number(amount),
                category,
                description,
                date,
                type,
            });
            onUpdated(updated);
            toast({ title: "Transaction updated", description: "Changes saved successfully." });
            onClose();
        } catch (err: any) {
            toast({ title: "Error", description: err?.message || "Failed to update transaction", variant: "destructive" });
        } finally {
            setSaving(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(o) => { if (!o) onClose(); }}>
            <DialogContent className="sm:max-w-md">
                <DialogHeader>
                    <DialogTitle>Edit Transaction</DialogTitle>
                </DialogHeader>

                <div className="space-y-4 py-2">
                    {/* Type */}
                    <div className="space-y-2">
                        <Label>Type</Label>
                        <Select
                            value={type}
                            onValueChange={(v) => {
                                setType(v as "income" | "expense");
                                setCategory(""); // reset category when type changes
                            }}
                        >
                            <SelectTrigger>
                                <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="income">Income</SelectItem>
                                <SelectItem value="expense">Expense</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>

                    {/* Amount */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-amount">Amount (₹)</Label>
                        <Input
                            id="edit-amount"
                            type="number"
                            min="0"
                            step="0.01"
                            value={amount}
                            onChange={(e) => setAmount(e.target.value)}
                            className={errors.amount ? "border-destructive" : ""}
                        />
                        {errors.amount && <p className="text-xs text-destructive">{errors.amount}</p>}
                    </div>

                    {/* Category */}
                    <div className="space-y-2">
                        <Label>Category</Label>
                        <Select value={category} onValueChange={setCategory}>
                            <SelectTrigger className={errors.category ? "border-destructive" : ""}>
                                <SelectValue placeholder="Select category" />
                            </SelectTrigger>
                            <SelectContent>
                                {categories.map((c) => (
                                    <SelectItem key={c} value={c}>{c}</SelectItem>
                                ))}
                            </SelectContent>
                        </Select>
                        {errors.category && <p className="text-xs text-destructive">{errors.category}</p>}
                    </div>

                    {/* Description */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-description">Description</Label>
                        <Textarea
                            id="edit-description"
                            placeholder="What was this transaction for?"
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            rows={2}
                        />
                    </div>

                    {/* Date */}
                    <div className="space-y-2">
                        <Label htmlFor="edit-date">Date</Label>
                        <Input
                            id="edit-date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={errors.date ? "border-destructive" : ""}
                        />
                        {errors.date && <p className="text-xs text-destructive">{errors.date}</p>}
                    </div>
                </div>

                <DialogFooter className="gap-2">
                    <Button variant="outline" onClick={onClose} disabled={saving}>Cancel</Button>
                    <Button onClick={handleSave} disabled={saving}>
                        {saving ? "Saving..." : "Save Changes"}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
