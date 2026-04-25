import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { jsonError, requireUserId } from "@/src/server/api";

export async function GET() {
  const { userId, response } = await requireUserId();
  if (response) return response;

  try {
    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("brokerage_connections")
      .select("id,provider,institution_name,status,last_synced_at,created_at")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) throw new Error(error.message);

    return NextResponse.json({ connections: data ?? [] });
  } catch (error) {
    return jsonError(error);
  }
}

export async function POST(request: Request) {
  const { userId, response } = await requireUserId();
  if (response) return response;

  try {
    const body = await request.json().catch(() => ({}));
    const provider = typeof body.provider === "string" ? body.provider : "manual";
    const institutionName = typeof body.institutionName === "string" ? body.institutionName : "Manual portfolio";
    const providerConnectionId =
      typeof body.providerConnectionId === "string"
        ? body.providerConnectionId
        : `${provider}-${userId}`;

    const supabase = createSupabaseServerClient();
    const { data, error } = await supabase
      .from("brokerage_connections")
      .upsert(
        {
          user_id: userId,
          provider,
          provider_connection_id: providerConnectionId,
          institution_name: institutionName,
          status: "connected",
          last_synced_at: new Date().toISOString(),
        },
        { onConflict: "provider,provider_connection_id" }
      )
      .select("id,provider,institution_name,status,last_synced_at,created_at")
      .single();

    if (error) throw new Error(error.message);

    return NextResponse.json({ connection: data }, { status: 201 });
  } catch (error) {
    return jsonError(error);
  }
}
