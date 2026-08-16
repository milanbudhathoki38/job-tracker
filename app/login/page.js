"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import Script from "next/script";
import { createClient } from "@/lib/supabase-browser";

const RECAPTCHA_SITE_KEY = process.env.NEXT_PUBLIC_RECAPTCHA_SITE_KEY;

export default function LoginPage() {
  const supabase = createClient();
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");
  const [busy, setBusy] = useState(false);

  async function passesRecaptcha(action) {
    if (!RECAPTCHA_SITE_KEY) {
      console.warn("NEXT_PUBLIC_RECAPTCHA_SITE_KEY is not set; skipping reCAPTCHA check.");
      return true;
    }

    if (typeof window === "undefined" || !window.grecaptcha) {
      setMessage("Security check didn't load. Refresh and try again.");
      return false;
    }

    try {
      const token = await new Promise((resolve, reject) => {
        window.grecaptcha.ready(() => {
          window.grecaptcha
            .execute(RECAPTCHA_SITE_KEY, { action })
            .then(resolve)
            .catch(reject);
        });
      });

      const res = await fetch("/api/verify-recaptcha", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token }),
      });
      const result = await res.json();
      return result.success === true;
    } catch (err) {
      console.error("reCAPTCHA check failed:", err);
      setMessage("Security check failed. Try again.");
      return false;
    }
  }

  async function handleSignUp() {
    setMessage("");
    setBusy(true);
    try {
      const ok = await passesRecaptcha("signup");
      if (!ok) return;

      const { error } = await supabase.auth.signUp({ email, password });
      setMessage(error ? error.message : "Check your email to confirm sign up!");
    } finally {
      setBusy(false);
    }
  }

  async function handleLogin() {
    setMessage("");
    setBusy(true);
    try {
      const ok = await passesRecaptcha("login");
      if (!ok) return;

      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) {
        setMessage(error.message);
      } else {
        router.push("/dashboard");
      }
    } finally {
      setBusy(false);
    }
  }

  async function handleGoogleLogin() {
    setMessage("");
    const { error } = await supabase.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/dashboard`,
      },
    });
    if (error) setMessage(error.message);
  }

  return (
    <>
      {RECAPTCHA_SITE_KEY && (
        <Script
          src={`https://www.google.com/recaptcha/api.js?render=${RECAPTCHA_SITE_KEY}`}
          strategy="afterInteractive"
        />
      )}
      <div style={{ minHeight: "100vh", background: "#F7F4EC", fontFamily: "Inter, sans-serif", display: "flex", alignItems: "center", justifyContent: "center", padding: "24px" }}>
        <div style={{ width: "100%", maxWidth: "380px", background: "#ffffff", border: "1px solid #D8D2C2", borderRadius: "10px", padding: "32px" }}>
          <div
            style={{
              display: "inline-block",
              border: "2px solid #B8451A",
              borderRadius: "50%",
              padding: "8px 14px",
              transform: "rotate(-4deg)",
              marginBottom: "20px",
            }}
          >
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.12em", textTransform: "uppercase", color: "#B8451A", fontWeight: 700 }}>
              Job Tracker
            </span>
          </div>

          <h1 style={{ fontFamily: "'Zilla Slab', serif", fontSize: "26px", color: "#1B2430", margin: "0 0 24px 0" }}>
            Sign in
          </h1>

          <button
            onClick={handleGoogleLogin}
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: "10px",
              width: "100%",
              padding: "10px 14px",
              marginBottom: "20px",
              background: "#ffffff",
              border: "1px solid #D8D2C2",
              borderRadius: "6px",
              fontFamily: "Inter, sans-serif",
              fontSize: "14px",
              fontWeight: 500,
              color: "#1B2430",
              cursor: "pointer",
            }}
          >
            <GoogleIcon />
            Continue with Google
          </button>

          <div style={{ display: "flex", alignItems: "center", gap: "10px", marginBottom: "20px" }}>
            <div style={{ flex: 1, height: "1px", background: "#D8D2C2" }} />
            <span style={{ fontFamily: "'IBM Plex Mono', monospace", fontSize: "11px", letterSpacing: "0.05em", textTransform: "uppercase", color: "#9c9384" }}>or</span>
            <div style={{ flex: 1, height: "1px", background: "#D8D2C2" }} />
          </div>

          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={inputStyle}
          />
          <input
            type="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            style={{ ...inputStyle, marginBottom: "16px" }}
          />

          <div style={{ display: "flex", gap: "8px" }}>
            <button onClick={handleLogin} disabled={busy} style={{ ...primaryBtnStyle, flex: 1, opacity: busy ? 0.6 : 1 }}>
              Log In
            </button>
            <button onClick={handleSignUp} disabled={busy} style={{ ...secondaryBtnStyle, flex: 1, opacity: busy ? 0.6 : 1 }}>
              Sign Up
            </button>
          </div>

          {message && (
            <p style={{ fontSize: "13px", color: "#B8451A", marginTop: "16px", marginBottom: 0 }}>{message}</p>
          )}

          <p style={{ fontSize: "11px", color: "#9c9384", marginTop: "20px", marginBottom: 0 }}>
            Protected by reCAPTCHA — Google&apos;s{" "}
            <a href="https://policies.google.com/privacy" target="_blank" rel="noopener noreferrer" style={{ color: "#9c9384" }}>Privacy Policy</a>{" "}
            and{" "}
            <a href="https://policies.google.com/terms" target="_blank" rel="noopener noreferrer" style={{ color: "#9c9384" }}>Terms</a>{" "}
            apply.
          </p>
        </div>
      </div>
    </>
  );
}

function GoogleIcon() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18">
      <path fill="#4285F4" d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.71v2.26h2.9c1.7-1.57 2.7-3.87 2.7-6.61z" />
      <path fill="#34A853" d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.9-2.26c-.81.54-1.84.86-3.06.86-2.35 0-4.34-1.59-5.05-3.72H.96v2.33A9 9 0 0 0 9 18z" />
      <path fill="#FBBC05" d="M3.95 10.7A5.4 5.4 0 0 1 3.67 9c0-.59.1-1.17.28-1.7V4.97H.96A9 9 0 0 0 0 9c0 1.45.35 2.83.96 4.03l2.99-2.33z" />
      <path fill="#EA4335" d="M9 3.58c1.32 0 2.51.45 3.44 1.35l2.58-2.58C13.46.89 11.43 0 9 0A9 9 0 0 0 .96 4.97l2.99 2.33C4.66 5.17 6.65 3.58 9 3.58z" />
    </svg>
  );
}

const inputStyle = {
  display: "block",
  width: "100%",
  marginBottom: "12px",
  padding: "10px 12px",
  border: "1px solid #D8D2C2",
  borderRadius: "6px",
  fontFamily: "Inter, sans-serif",
  fontSize: "14px",
  color: "#1B2430",
  background: "#F7F4EC",
  outline: "none",
  boxSizing: "border-box",
};

const primaryBtnStyle = {
  background: "#1B2430",
  color: "#F7F4EC",
  border: "none",
  borderRadius: "6px",
  padding: "10px 20px",
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: "13px",
  cursor: "pointer",
};

const secondaryBtnStyle = {
  background: "none",
  border: "1px solid #D8D2C2",
  color: "#5B5346",
  borderRadius: "6px",
  padding: "10px 20px",
  fontFamily: "'IBM Plex Mono', monospace",
  fontSize: "13px",
  cursor: "pointer",
};