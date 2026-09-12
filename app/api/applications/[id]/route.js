import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function PUT(request, { params }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const body = await request.json();

  const { data, error } = await supabase
    .from("applications")
    .update(body)
    .eq("id", id)
    .eq("user_id", user.id)
    .select();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  if (data.length === 0) {
    return Response.json({ error: "Application not found" }, { status: 404 });
  }

  return Response.json(data[0], { status: 200 });
}

export async function DELETE(request, { params }) {
  const { id } = await params;
  const supabase = await createServerSupabaseClient();

  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  const { error } = await supabase
    .from("applications")
    .delete()
    .eq("id", id)
    .eq("user_id", user.id);

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json({ success: true }, { status: 200 });
}