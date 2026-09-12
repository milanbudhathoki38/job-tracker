import { createServerSupabaseClient } from "@/lib/supabase-server";

export async function GET() {
  const supabase = await createServerSupabaseClient();

  // Step 2 from the picture: "who's asking? check they're logged in"
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  // Step 3: "okay, get me THEIR applications" — not everyone's
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("user_id", user.id)
    .order("created_at", { ascending: false });

  // Step 4: something went wrong talking to Supabase
  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  // Step 5: hand the list back to the browser
  return Response.json(data, { status: 200 });
}

export async function POST(request) {
  const supabase = await createServerSupabaseClient();

  // Step 2 again: who's asking?
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) {
    return Response.json({ error: "Not logged in" }, { status: 401 });
  }

  // New idea: read the data the browser is SENDING us
  const body = await request.json();

  // Basic check: don't let empty submissions through
  if (!body.company || !body.role_title) {
    return Response.json(
      { error: "Company and role title are required" },
      { status: 400 }
    );
  }

  // Insert it — same shape your dashboard already builds
  const { data, error } = await supabase
    .from("applications")
    .insert({
      user_id: user.id,
      company: body.company,
      role_title: body.role_title,
      job_id: body.job_id || null,
      location: body.location || null,
      posting_url: body.posting_url || null,
      notes: body.notes || null,
      job_description: body.job_description || null,
    })
    .select();

  if (error) {
    return Response.json({ error: error.message }, { status: 500 });
  }

  return Response.json(data[0], { status: 201 });
}