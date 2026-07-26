"use client";
import { ChangeEvent, FormEvent, useState } from "react";
import { createClient } from "@/lib/supabase/client";

const flagDefs = [
  { key: "chatEnabled", label: "Internal chat", hint: "Project-level team chat with automatic privacy moderation." },
  { key: "revisionsEnabled", label: "Revisions", hint: "Clients/PMs can log revision requests against a project." },
  { key: "fileUploadsEnabled", label: "File uploads", hint: "Team members can upload and version project files." },
  { key: "reportsEnabled", label: "Reports", hint: "Super Admins and PMs can view the Reports dashboard." },
];

export default function BrandingForm({ organizationId, initialName, initialLogoUrl, initialColor, initialFlags }: { organizationId: string; initialName: string; initialLogoUrl: string | null; initialColor: string; initialFlags: Record<string, boolean> }) {
  const [name, setName] = useState(initialName);
  const [color, setColor] = useState(initialColor);
  const [logoUrl, setLogoUrl] = useState(initialLogoUrl);
  const [flags, setFlags] = useState<Record<string, boolean>>({ chatEnabled: true, revisionsEnabled: true, fileUploadsEnabled: true, reportsEnabled: true, ...initialFlags });
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  async function uploadLogo(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true); setMessage("");
    const supabase = createClient();
    const path = `${organizationId}/${Date.now()}-${file.name}`;
    const { error } = await supabase.storage.from("branding").upload(path, file, { upsert: true });
    if (error) { setMessage(error.message); setUploading(false); return; }
    const { data } = supabase.storage.from("branding").getPublicUrl(path);
    setLogoUrl(data.publicUrl);
    setUploading(false);
  }

  async function save(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSaving(true); setMessage("");
    const supabase = createClient();
    const { error } = await supabase.from("Organization").update({ name: name.trim(), primaryColor: color, logoUrl, featureFlags: flags, updatedAt: new Date().toISOString() }).eq("id", organizationId);
    setSaving(false);
    setMessage(error ? error.message : "Saved.");
  }

  return <form onSubmit={save} className="mt-8 space-y-6">
    <div className="rounded-xl border border-[#e0e5e1] bg-white p-6">
      <h2 className="font-serif text-xl">Identity</h2>
      <label className="mt-5 block text-sm font-bold">Workspace name<input value={name} onChange={(e) => setName(e.target.value)} required minLength={2} className="mt-1 w-full rounded-lg border border-[#dce4df] px-3 py-2.5 text-sm outline-none focus:border-[#39745f]"/></label>
      <div className="mt-5 flex items-center gap-4">
        <div>
          <p className="text-sm font-bold">Logo</p>
          {logoUrl ? <img src={logoUrl} alt="Workspace logo" className="mt-2 h-14 w-14 rounded-lg border border-[#e0e5e1] object-contain"/> : <div className="mt-2 flex h-14 w-14 items-center justify-center rounded-lg border border-dashed border-[#dce4df] text-xs text-[#a3b0aa]">None</div>}
        </div>
        <label className="cursor-pointer rounded-lg bg-[#1d443b] px-3 py-2 text-xs font-bold text-white">{uploading ? "Uploading…" : "Upload logo"}<input type="file" accept="image/*" onChange={uploadLogo} disabled={uploading} className="hidden"/></label>
      </div>
      <label className="mt-5 block text-sm font-bold">Primary color<div className="mt-1 flex items-center gap-3"><input type="color" value={color} onChange={(e) => setColor(e.target.value)} className="h-10 w-14 rounded-lg border border-[#dce4df]"/><span className="text-sm text-[#718079]">{color}</span></div></label>
    </div>

    <div className="rounded-xl border border-[#e0e5e1] bg-white p-6">
      <h2 className="font-serif text-xl">Feature flags</h2>
      <div className="mt-5 space-y-4">{flagDefs.map((f) => <label key={f.key} className="flex items-start gap-3 text-sm"><input type="checkbox" checked={flags[f.key] ?? true} onChange={(e) => setFlags({ ...flags, [f.key]: e.target.checked })} className="mt-1"/><span><strong>{f.label}</strong><br/><span className="text-xs text-[#809089]">{f.hint}</span></span></label>)}</div>
    </div>

    {message && <p className={`rounded-lg p-3 text-sm ${message === "Saved." ? "bg-[#eff2e9] text-[#386b5d]" : "bg-[#fff0ed] text-[#a34c3b]"}`}>{message}</p>}
    <button disabled={saving} className="rounded-lg bg-[#1d443b] px-5 py-3 text-sm font-bold text-white disabled:opacity-60">{saving ? "Saving…" : "Save changes"}</button>
  </form>;
}
