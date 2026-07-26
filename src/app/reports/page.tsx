import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Role } from "@/lib/roles";

const statusLabel = (s: string) => s.replaceAll("_", " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());

export default async function ReportsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: memberships } = await supabase.from("Membership").select("id, role, organizationId").eq("userId", user.id).eq("isActive", true).limit(1);
  const membership = memberships?.[0] as { id: string; role: Role; organizationId: string } | undefined;
  if (!membership) redirect("/onboarding");
  if (membership.role !== "SUPER_ADMIN" && membership.role !== "PROJECT_MANAGER") redirect("/");

  const orgId = membership.organizationId;
  const { data: projects } = await supabase.from("Project").select("id, name, status, priority, deadline, revisionCount, developerId").eq("organizationId", orgId);
  const all = projects ?? [];

  const statusCounts = all.reduce<Record<string, number>>((acc, p) => { acc[p.status] = (acc[p.status] ?? 0) + 1; return acc; }, {});
  const priorityCounts = all.reduce<Record<string, number>>((acc, p) => { acc[p.priority] = (acc[p.priority] ?? 0) + 1; return acc; }, {});
  const activeStatuses = ["INTAKE", "PLANNING", "IN_PROGRESS", "IN_REVIEW", "REVISION"];
  const overdue = all.filter((p) => p.deadline && activeStatuses.includes(p.status) && new Date(p.deadline) < new Date()).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()).slice(0, 6);
  const topRevised = [...all].filter((p) => p.revisionCount > 0).sort((a, b) => b.revisionCount - a.revisionCount).slice(0, 5);
  const completionRate = all.length ? Math.round((statusCounts.COMPLETE ?? 0) / all.length * 100) : 0;

  const { data: developers } = await supabase.from("Membership").select("id, displayName").eq("organizationId", orgId).eq("role", "DEVELOPER").eq("isActive", true);
  const devCounts = new Map<string, number>();
  for (const p of all) if (p.developerId && activeStatuses.includes(p.status)) devCounts.set(p.developerId, (devCounts.get(p.developerId) ?? 0) + 1);
  const workload = (developers ?? []).map((d) => ({ name: d.displayName, count: devCounts.get(d.id) ?? 0 })).sort((a, b) => b.count - a.count);

  let auditLog: { id: string; action: string; entityType: string; createdAt: string }[] = [];
  if (membership.role === "SUPER_ADMIN") { const { data } = await supabase.from("AuditLog").select("id, action, entityType, createdAt").eq("organizationId", orgId).order("createdAt", { ascending: false }).limit(12); auditLog = data ?? []; }

  const maxStatus = Math.max(1, ...Object.values(statusCounts));
  const statusOrder = ["INTAKE", "PLANNING", "IN_PROGRESS", "IN_REVIEW", "REVISION", "COMPLETE", "ON_HOLD", "CANCELLED"];

  return <main className="min-h-screen bg-[#f7f8f6] px-5 py-10 text-[#202523]">
    <div className="mx-auto max-w-5xl">
      <Link href="/" className="text-sm font-bold text-[#286a5a]">&larr; Dashboard</Link>
      <header className="mt-5"><p className="text-xs font-bold tracking-[.15em] text-[#5f796f]">AGENCYOS</p><h1 className="mt-2 font-serif text-4xl">Reports</h1><p className="mt-2 text-sm text-[#718079]">A read-only snapshot of delivery health across the workspace.</p></header>

      <div className="mt-8 grid gap-4 sm:grid-cols-3">
        <div className="rounded-xl border border-[#e0e5e1] bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#809089]">Total projects</p><p className="mt-2 font-serif text-3xl">{all.length}</p></div>
        <div className="rounded-xl border border-[#e0e5e1] bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#809089]">Completion rate</p><p className="mt-2 font-serif text-3xl">{completionRate}%</p></div>
        <div className="rounded-xl border border-[#e0e5e1] bg-white p-5"><p className="text-xs font-bold uppercase tracking-wider text-[#809089]">Overdue</p><p className="mt-2 font-serif text-3xl">{overdue.length}</p></div>
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-2">
        <section className="rounded-xl border border-[#e0e5e1] bg-white p-6">
          <h2 className="font-serif text-xl">Projects by status</h2>
          <div className="mt-5 space-y-3">{statusOrder.filter((s) => statusCounts[s]).map((s) => <div key={s}><div className="flex justify-between text-sm"><span>{statusLabel(s)}</span><span className="font-bold">{statusCounts[s]}</span></div><div className="mt-1 h-2 rounded-full bg-[#eef1ef]"><div className="h-2 rounded-full bg-[#1d443b]" style={{ width: `${(statusCounts[s] / maxStatus) * 100}%` }}/></div></div>)}
          {all.length === 0 && <p className="text-sm text-[#718079]">No projects yet.</p>}</div>
        </section>

        <section className="rounded-xl border border-[#e0e5e1] bg-white p-6">
          <h2 className="font-serif text-xl">Projects by priority</h2>
          <div className="mt-5 space-y-3">{["URGENT", "HIGH", "MEDIUM", "LOW"].filter((p) => priorityCounts[p]).map((p) => <div key={p} className="flex items-center justify-between border-b border-[#f3f5f3] pb-2 text-sm last:border-0"><span>{p}</span><span className="rounded-full bg-[#eff2e9] px-2.5 py-1 text-xs font-bold">{priorityCounts[p]}</span></div>)}
          {all.length === 0 && <p className="text-sm text-[#718079]">No projects yet.</p>}</div>
        </section>

        <section className="rounded-xl border border-[#e0e5e1] bg-white p-6">
          <h2 className="font-serif text-xl">Overdue projects</h2>
          <div className="mt-5 space-y-3">{overdue.map((p) => <Link key={p.id} href={`/projects/${p.id}`} className="block border-b border-[#f3f5f3] pb-2 text-sm last:border-0 hover:text-[#286a5a]"><strong>{p.name}</strong><span className="ml-2 text-xs text-[#a34c3b]">Due {new Date(p.deadline!).toLocaleDateString()}</span></Link>)}
          {overdue.length === 0 && <p className="text-sm text-[#718079]">Nothing overdue &mdash; nice work.</p>}</div>
        </section>

        <section className="rounded-xl border border-[#e0e5e1] bg-white p-6">
          <h2 className="font-serif text-xl">Most revised</h2>
          <div className="mt-5 space-y-3">{topRevised.map((p) => <Link key={p.id} href={`/projects/${p.id}`} className="flex items-center justify-between border-b border-[#f3f5f3] pb-2 text-sm last:border-0 hover:text-[#286a5a]"><span>{p.name}</span><span className="rounded-full bg-[#fff0ed] px-2.5 py-1 text-xs font-bold text-[#a34c3b]">{p.revisionCount} revisions</span></Link>)}
          {topRevised.length === 0 && <p className="text-sm text-[#718079]">No revision requests yet.</p>}</div>
        </section>

        <section className="rounded-xl border border-[#e0e5e1] bg-white p-6">
          <h2 className="font-serif text-xl">Team workload</h2>
          <div className="mt-5 space-y-3">{workload.map((w) => <div key={w.name} className="flex items-center justify-between border-b border-[#f3f5f3] pb-2 text-sm last:border-0"><span>{w.name}</span><span className="font-bold">{w.count} active</span></div>)}
          {workload.length === 0 && <p className="text-sm text-[#718079]">No developers on the team yet.</p>}</div>
        </section>

        {membership.role === "SUPER_ADMIN" && <section className="rounded-xl border border-[#e0e5e1] bg-white p-6">
          <h2 className="font-serif text-xl">Recent audit activity</h2>
          <div className="mt-5 space-y-3">{auditLog.map((a) => <div key={a.id} className="border-b border-[#f3f5f3] pb-2 text-sm last:border-0"><strong>{a.action.replaceAll("_", " ")}</strong><span className="ml-2 text-xs text-[#a3b0aa]">{a.entityType} &middot; {new Date(a.createdAt).toLocaleString()}</span></div>)}
          {auditLog.length === 0 && <p className="text-sm text-[#718079]">No audit events yet.</p>}</div>
        </section>}
      </div>
    </div>
  </main>;
}
