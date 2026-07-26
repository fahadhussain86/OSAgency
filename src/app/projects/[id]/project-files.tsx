"use client";
import { ChangeEvent, useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type FileRow = { id: string; kind: string; name: string; storageKey: string; version: number; createdAt: string };
const kinds = ["BRIEF", "ASSET", "CONTRACT", "INVOICE", "REFERENCE", "DELIVERABLE", "OTHER"];

async function fetchFiles(projectId: string) {
  const supabase = createClient();
  const { data } = await supabase.from("ProjectFile").select("id,kind,name,storageKey,version,createdAt").eq("projectId", projectId).order("name").order("version", { ascending: false });
  return data ?? [];
}

export default function ProjectFiles({ projectId, organizationId }: { projectId: string; organizationId: string }) {
  const [files, setFiles] = useState<FileRow[]>([]);
  const [kind, setKind] = useState("DELIVERABLE");
  const [uploading, setUploading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => { fetchFiles(projectId).then(setFiles); }, [projectId]);

  async function upload(event: ChangeEvent<HTMLInputElement>) {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploading(true); setMessage("");
    const supabase = createClient();
    const { data: { user } } = await supabase.auth.getUser();
    const existing = files.filter((f) => f.name === file.name);
    const version = existing.length ? Math.max(...existing.map((f) => f.version)) + 1 : 1;
    const storageKey = `${organizationId}/${projectId}/${Date.now()}-${file.name}`;
    const { error: uploadError } = await supabase.storage.from("project-files").upload(storageKey, file);
    if (uploadError) { setMessage(uploadError.message); setUploading(false); return; }
    const { error: insertError } = await supabase.from("ProjectFile").insert({ id: crypto.randomUUID().replaceAll("-", ""), projectId, kind, name: file.name, storageKey, version });
    if (insertError) { setMessage(insertError.message); setUploading(false); return; }
    if (user) await supabase.from("Activity").insert({ id: crypto.randomUUID().replaceAll("-", ""), projectId, actorId: user.id, action: `Uploaded ${file.name} (v${version})` });
    event.target.value = "";
    setUploading(false);
    fetchFiles(projectId).then(setFiles);
  }

  async function download(storageKey: string) {
    const supabase = createClient();
    const { data, error } = await supabase.storage.from("project-files").createSignedUrl(storageKey, 60);
    if (error || !data) { setMessage(error?.message || "Could not generate download link."); return; }
    window.open(data.signedUrl, "_blank");
  }

  const grouped = Object.values(files.reduce<Record<string, FileRow[]>>((acc, f) => { (acc[f.name] ??= []).push(f); return acc; }, {}));

  return <article className="rounded-xl border border-[#e0e5e1] bg-white p-6">
    <div className="flex items-center justify-between"><h2 className="font-serif text-xl">Files</h2>
      <div className="flex items-center gap-2">
        <select value={kind} onChange={(e) => setKind(e.target.value)} className="rounded-lg border border-[#dce4df] px-2 py-2 text-xs font-bold">{kinds.map((k) => <option key={k} value={k}>{k}</option>)}</select>
        <label className="cursor-pointer rounded-lg bg-[#1d443b] px-3 py-2 text-xs font-bold text-white">{uploading ? "Uploading…" : "Upload"}<input type="file" onChange={upload} disabled={uploading} className="hidden"/></label>
      </div>
    </div>
    {message && <p className="mt-3 rounded-lg bg-[#fff0ed] p-3 text-sm text-[#a34c3b]">{message}</p>}
    <div className="mt-4 space-y-3">
      {grouped.length === 0 && <p className="text-sm text-[#718079]">No files uploaded yet.</p>}
      {grouped.map((versions) => { const latest = versions[0]; return <div key={latest.name} className="flex items-center justify-between border-t border-[#edf0ee] pt-3 first:border-0 first:pt-0">
        <div><button onClick={() => download(latest.storageKey)} className="text-sm font-bold text-[#286a5a] hover:underline">{latest.name}</button><div className="mt-1 text-xs text-[#809089]">{latest.kind} · v{latest.version}{versions.length > 1 && ` · ${versions.length} versions`} · {new Date(latest.createdAt).toLocaleDateString()}</div></div>
      </div>; })}
    </div>
  </article>;
}
