"use client";
import { FormEvent, useMemo, useState } from "react";
import { createClient } from "@/lib/supabase/client";
function slugify(value: string) { return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, ""); }
export default function OnboardingPage() {
  const [name, setName] = useState(""); const [slug, setSlug] = useState(""); const [message, setMessage] = useState(""); const [saving, setSaving] = useState(false);
  const suggestedSlug = useMemo(() => slug || slugify(name), [name, slug]);
  async function createWorkspace(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setSaving(true); setMessage(""); const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser();
    if (!user) { location.assign("/auth"); return; }
    const { error } = await supabase.rpc("create_workspace", { workspace_name: name, workspace_slug: suggestedSlug });
    if (error) { setMessage(error.message); setSaving(false); return; } location.assign("/");
  }
  return <main className="auth-page"><section className="auth-card"><div className="auth-mark">A</div><p className="auth-kicker">SET UP YOUR WORKSPACE</p><h1>Make it yours</h1><p>Create your agency workspace. You&apos;ll become its Super Admin and can invite your team afterward.</p><form onSubmit={createWorkspace}><label>Agency name<input value={name} onChange={(event) => setName(event.target.value)} required minLength={2} maxLength={100} placeholder="Northstar Agency" /></label><label className="field-gap">Workspace URL<input value={slug} onChange={(event) => setSlug(slugify(event.target.value))} required minLength={2} placeholder={suggestedSlug || "northstar-agency"} /></label><button type="submit" disabled={saving}>{saving ? "Creating workspace…" : "Create workspace"}</button></form>{message && <div className="auth-message error">{message}</div>}</section></main>;
}
