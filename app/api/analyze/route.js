// Full structured analysis, now with:
// - A real auth check (route previously had none at all)
// - Rate limiting: max 10 analyses per user per rolling hour

import { createServerSupabaseClient } from "@/lib/supabase-server";

const MAX_JD_LENGTH = 6000;
const RATE_LIMIT = 10; // requests
const RATE_WINDOW_MS = 60 * 60 * 1000; // 1 hour

const PROFILE = `
CS major (Math minor), Arkansas State University, expected Dec 2028, on F1 visa status (CPT-eligible now, OPT after graduation).
Languages: Python, C++, JavaScript.
Backend/infra-leaning full-stack projects:
- Personal portfolio (Next.js, Supabase, Redis/Upstash, Anthropic Claude API): live AI chat feature with server-side request routing and prompt design; Redis caching layer cutting repeat-request latency ~4x; Supabase backend with Resend email, including diagnosing and fixing a Row-Level Security misconfiguration.
- Job application tracker (Next.js, Supabase Auth incl. Google OAuth): full-stack CRUD app with authentication, protected routes, and Row-Level Security policies enforcing per-user data isolation; custom SMTP email delivery workflow with Resend.
Actively practicing data structures & algorithms (LeetCode - arrays, hashing, linked lists, two pointers) and object-oriented Python.
Experience: Math/Stats tutor at Arkansas State; IT support intern at Lyon College (hardware/network troubleshooting, workstation deployment).
No prior formal software engineering internship yet.
`.trim();

const SYSTEM_PROMPT = `You are a blunt, practical internship-fit reviewer for a CS undergrad. You will be given a job posting description and the student's profile. Assess the fit honestly — don't inflate it, this is for the student's own planning, not a cover letter. Respond with ONLY valid JSON, no markdown code fences, no commentary outside the JSON, in exactly this shape:
{"matchScore": <integer 1-10>, "strengths": [<2-4 short strings, each a real specific overlap between the posting and the student's actual projects/skills>], "gaps": [<1-3 short strings, real gaps or unknowns relative to the posting>], "tailoringTip": "<one concrete sentence on what to emphasize for THIS posting specifically>"}`;

export async function POST(request) {
  // --- Step A: who is actually calling this? ---
  const supabase = await createServerSupabaseClient();
  const { data: { user }, error: authError } = await supabase.auth.getUser();

  if (authError || !user) {
    return Response.json({ error: "You must be logged in to use this." }, { status: 401 });
  }

  // --- Step B: count backward — how many times has THIS user
  //     signed in to this route in the last hour? ---
  const windowStart = new Date(Date.now() - RATE_WINDOW_MS).toISOString();

const { data: recentRequests, error: countError } = await supabase
  .from("analyze_requests")
  .select("id")
  .eq("user_id", user.id)
  .gte("created_at", windowStart);

console.log("Authenticated user id:", user.id);
console.log("Rate limit window start:", windowStart);

if (countError) {
  console.error("Rate limit check failed. Full error object:");
  console.error(countError);
  return Response.json({ error: "Server error" }, { status: 500 });
}

const count = recentRequests.length;
  if (count >= RATE_LIMIT) {
    return Response.json(
      { error: `You've hit the limit of ${RATE_LIMIT} analyses per hour. Try again later.` },
      { status: 429 }
    );
  }

  // --- Parse the actual request body ---
  let body;
  try {
    body = await request.json();
  } catch {
    return Response.json({ error: "Invalid request body" }, { status: 400 });
  }

  const { jobDescription, roleTitle, company } = body || {};

  if (!jobDescription || !jobDescription.trim()) {
    return Response.json({ error: "Job description is required" }, { status: 400 });
  }

  if (!process.env.ANTHROPIC_API_KEY) {
    return Response.json({ error: "Server is missing ANTHROPIC_API_KEY" }, { status: 500 });
  }

  // --- Step C: write to the sign-in sheet BEFORE the expensive call,
  //     so it counts even if the Anthropic call fails partway. ---
  await supabase.from("analyze_requests").insert({ user_id: user.id });

  const trimmedJD = jobDescription.slice(0, MAX_JD_LENGTH);

  const userContent = `Role: ${roleTitle || "Unknown role"} at ${company || "Unknown company"}

Job description:
${trimmedJD}

Student profile:
${PROFILE}`;

  try {
    const anthropicRes = await fetch("https://api.anthropic.com/v1/messages", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": process.env.ANTHROPIC_API_KEY,
        "anthropic-version": "2023-06-01",
      },
      body: JSON.stringify({
        model: "claude-haiku-4-5-20251001",
        max_tokens: 600,
        system: SYSTEM_PROMPT,
        messages: [{ role: "user", content: userContent }],
      }),
    });

    if (!anthropicRes.ok) {
      const errText = await anthropicRes.text();
      console.error("Anthropic API error:", anthropicRes.status, errText);
      return Response.json({ error: "Analysis failed upstream" }, { status: 502 });
    }

    const data = await anthropicRes.json();
    const textBlock = (data.content || []).find((b) => b.type === "text");
    const raw = (textBlock?.text || "").trim();
    const cleaned = raw.replace(/^```json\s*|^```\s*|```$/g, "").trim();

    let parsed;
    try {
      parsed = JSON.parse(cleaned);
    } catch {
      console.error("Could not parse model output as JSON:", raw);
      return Response.json({ error: "Could not parse analysis" }, { status: 502 });
    }

    return Response.json(parsed);
  } catch (err) {
    console.error("Analyze route error:", err);
    return Response.json({ error: "Server error" }, { status: 500 });
  }
}