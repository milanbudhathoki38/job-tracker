import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";

// Used inside API routes (not client components) to read the logged-in
// user's session from their cookies, so the route knows WHO is calling it.
export async function createServerSupabaseClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Route handlers can't always set cookies — safe to ignore here,
            // since we're only reading the session, not refreshing it.
          }
        },
      },
    }
  );
}