"use client";

import { FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [state, setState] = useState<"idle" | "sent" | "error">("idle");
  async function signIn(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setState("idle");
    const { error } = await createClient().auth.signInWithOtp({ email, options: { emailRedirectTo: `${location.origin}/auth/callback` } });
    setState(error ? "error" : "sent");
  }
  return <main className="auth-page"><section className="auth-card"><div className="auth-mark">A</div><p className="auth-kicker">AGENCYOS</p><h1>Welcome back</h1><p>Sign in securely to access your agency workspace.</p><form onSubmit={signIn}><label>Email address<input type="email" required value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@agency.com" /></label><button type="submit">Send secure sign-in link</button></form>{state === "sent" && <div className="auth-message success">Check your inbox for your secure sign-in link.</div>}{state === "error" && <div className="auth-message error">We couldn&apos;t send the sign-in link. Check your Supabase Auth email settings.</div>}</section></main>;
}
