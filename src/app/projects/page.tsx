"use client";

import Link from "next/link";
import { useEffect, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type Project = { id: string; name: string; clientName: string; status: string; priority: string; deadline: string | null; packageName: string | null };

export default function ProjectsPage() {
  const [projects, setProjects] = useState<Project[]>([]);
  const [message, setMessage] = useState("Loading projects…");
  useEffect(() => { const load = async () => {
    const supabase = createClient(); const { data: { user } } = await supabase.auth.getUser(); if (!user) { location.assign("/auth"); return; }
    const { data: memberships, error: membershipError } = await supabase.from("Membership").select("organizationId").eq("userId", user.id).limit(1);
    if (membershipError || !memberships?.length) { setMessage("Create your workspace before adding projects."); return; }
    const { data, error } = await supabase.from("Project").select("id,name,clientName,status,priority,deadline,packageName").eq("organizationId", memberships[0].organizationId).order("createdAt", { ascending: false });
    if (error) { setMessage(error.message); return; } setProjects(data ?? []); setMessage("");
  }; load(); }, []);
  return <main className="min-h-screen bg-[#f7f8f6] px-5 py-10 text-[#202523]"><div className="mx-auto max-w-5xl"><header className="mb-10 flex items-center justify-between"><div><p className="mb-2 text-xs font-bold tracking-[.15em] text-[#5f796f]">AGENCYOS</p><h1 className="font-serif text-4xl">Projects</h1></div><Link href="/projects/new" className="rounded-lg bg-[#1d443b] px-4 py-3 text-sm font-bold text-white">+ New project</Link></header>{message && <div className="rounded-lg border border-[#dce4df] bg-white p-5 text-sm text-[#66756f]">{message}{message.startsWith("Create") && <Link className="ml-2 font-bold text-[#286a5a]" href="/onboarding">Set up workspace</Link>}</div>}{projects.length > 0 && <div className="overflow-hidden rounded-xl border border-[#e0e5e1] bg-white"><div className="grid grid-cols-[1.6fr_1fr_1fr_auto] gap-3 border-b border-[#e7ece8] px-5 py-3 text-xs font-bold uppercase tracking-wider text-[#809089]"><span>Project</span><span>Status</span><span>Deadline</span><span>Priority</span></div>{projects.map((project) => <div key={project.id} className="grid grid-cols-[1.6fr_1fr_1fr_auto] gap-3 border-b border-[#eef1ef] px-5 py-4 text-sm last:border-0"><div><Link href={`/projects/${project.id}`} className="block font-bold hover:text-[#286a5a]">{project.name}</Link><span className="text-xs text-[#75817d]">{project.clientName}{project.packageName ? ` · ${project.packageName}` : ""}</span></div><span className="text-[#406c60]">{project.status.replaceAll("_", " ")}</span><span>{project.deadline ? new Date(project.deadline).toLocaleDateString() : "—"}</span><span>{project.priority}</span></div>)}</div>}</div></main>;
}
