"use client";

import { useState } from "react";
import { createClient } from "@/lib/supabase-browser";

export default function LoginPage() {
  const supabase = createClient();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState("");

  async function handleSignUp() {
    const { error } = await supabase.auth.signUp({ email, password });
    setMessage(error ? error.message : "Check your email to confirm sign up!");
  }

  async function handleLogin() {
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    setMessage(error ? error.message : "Logged in!");
  }

  return (
    <div style={{ maxWidth: "400px", margin: "80px auto", padding: "24px" }}>
      <h1>Job Tracker Login</h1>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "12px", padding: "8px" }}
      />
      <input
        type="password"
        placeholder="Password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        style={{ display: "block", width: "100%", marginBottom: "12px", padding: "8px" }}
      />
      <button onClick={handleSignUp} style={{ marginRight: "8px" }}>Sign Up</button>
      <button onClick={handleLogin}>Log In</button>
      <p>{message}</p>
    </div>
  );
}