import { supabase } from "@/lib/supabaseClient";

// Get user holdings from users_data table
export async function getUserHoldings(userId: string) {
  const { data, error } = await supabase
    .from("users_data")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching holdings:", error);
    return [];
  }

  // Extract holdings from the JSON data
  if (data && data.data && data.data.holdings) {
    return data.data.holdings;
  }

  return [];
}

// Add transaction (this will need a separate transactions table if you want to track them)
export async function addTransaction(transaction: {
  user_id: string;
  asset: string;
  amount: number;
  date: string;
}) {
  // For now, we'll just log this as we don't have a transactions table
  console.log("Transaction would be added:", transaction);
  
  // If you want to implement this, you'd need to create a transactions table
  // or update the users_data JSON to include transaction history
  return [];
}

// Get performance data from users_data table
export async function getPerformanceData(userId: string) {
  const { data, error } = await supabase
    .from("users_data")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching performance:", error);
    return [];
  }

  // Extract performance data if available
  if (data && data.data && data.data.performance) {
    return data.data.performance;
  }

  // Calculate performance from holdings if available
  if (data && data.data && data.data.holdings) {
    const totalValue = data.data.totalValue || 0;
    return [
      {
        date: new Date().toISOString(),
        value: totalValue
      }
    ];
  }

  return [];
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
  const normalizedUserId = userId.trim();

  const { data, error } = await supabase
    .from("users_data")
    .select("*")
    .eq("user_id", normalizedUserId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching user data:", error);
    return null;
  }

  if (data) {
    return data;
  }

  return null;
}

// Helper to get total portfolio value
export async function getPortfolioValue(userId: string) {
  const { data, error } = await supabase
    .from("users_data")
    .select("data")
    .eq("user_id", userId)
    .maybeSingle();

  if (error) {
    console.error("Error fetching portfolio value:", error);
    return 0;
  }

  if (data && data.data && data.data.totalValue) {
    return data.data.totalValue;
  }

  return 0;
}
