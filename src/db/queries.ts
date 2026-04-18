import { supabase } from "@/lib/supabaseClient";

export async function getUserHoldings(userId: string) {
  const { data, error } = await supabase
    .from("holdings")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function addTransaction(transaction: {
  user_id: string;
  asset: string;
  amount: number;
  date: string;
}) {
  const { data, error } = await supabase.from("transactions").insert([transaction]);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function getPerformanceData(userId: string) {
  const { data, error } = await supabase
    .from("performance")
    .select("*")
    .eq("user_id", userId);

  if (error) {
    throw new Error(error.message);
  }

  return data;
}

export async function upsertUserData(userId: string, data: Record<string, unknown>) {
  const { data: result, error } = await supabase
    .from("users_data")
    .upsert({ user_id: userId, data }, { onConflict: "user_id" });

  if (error) {
    throw new Error(error.message);
  }

  return result;
}

export async function getUserData(userId: string) {
  const { data, error } = await supabase
    .from("users_data")
    .select("*")
    .eq("user_id", userId)
    .single();

  if (error) {
    throw new Error(error.message);
  }

  return data;
}