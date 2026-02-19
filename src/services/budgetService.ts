import { supabase } from "@/lib/supabase";

export interface Budget {
    id: string;
    user_id: string;
    category: string;
    limit_amount: number;
    created_at: string;
}

export async function getBudgets(userId: string): Promise<Budget[]> {
    const { data, error } = await supabase
        .from("budgets")
        .select("*")
        .eq("user_id", userId)
        .order("category", { ascending: true });

    if (error) throw error;
    return data || [];
}

export async function upsertBudget(
    budget: { user_id: string; category: string; limit_amount: number }
): Promise<Budget> {
    // Check if budget exists for this user + category
    const { data: existing } = await supabase
        .from("budgets")
        .select("id")
        .eq("user_id", budget.user_id)
        .eq("category", budget.category)
        .single();

    if (existing) {
        const { data, error } = await supabase
            .from("budgets")
            .update({ limit_amount: budget.limit_amount })
            .eq("id", existing.id)
            .select()
            .single();
        if (error) throw error;
        return data;
    } else {
        const { data, error } = await supabase
            .from("budgets")
            .insert(budget)
            .select()
            .single();
        if (error) throw error;
        return data;
    }
}

export async function deleteBudget(id: string): Promise<void> {
    const { error } = await supabase.from("budgets").delete().eq("id", id);
    if (error) throw error;
}
