import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createServerSupabaseClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const { data, error } = await supabase
    .from("applications")
    .select("status")
    .eq("user_id", user.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  const counts = { Applied: 0, OA: 0, Interview: 0, Offer: 0, Rejected: 0 };
  for (const app of data) {
    if (counts[app.status] !== undefined) {
      counts[app.status]++;
    }
  }

  return Response.json(counts, { status: 200 });
}