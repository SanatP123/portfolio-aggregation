import { NextResponse } from "next/server";
import { createSupabaseServerClient } from "@/lib/supabaseServer";
import { jsonError, requireUserId } from "@/src/server/api";

type RouteContext = {
  params: Promise<{
    connectionId: string;
  }>;
};

export async function DELETE(_request: Request, context: RouteContext) {
  const { userId, response } = await requireUserId();
  if (response) return response;

  try {
    const { connectionId } = await context.params;
    const supabase = createSupabaseServerClient();

    const { error } = await supabase
      .from("brokerage_connections")
      .update({
        status: "disconnected",
        access_token: null,
        last_synced_at: new Date().toISOString(),
      })
      .eq("id", connectionId)
      .eq("user_id", userId);

    if (error) throw new Error(error.message);

    return NextResponse.json({ ok: true });
  } catch (error) {
    return jsonError(error);
  }
}
