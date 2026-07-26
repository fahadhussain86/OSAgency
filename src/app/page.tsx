import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { Role } from "@/lib/roles";
import DashboardClient, { ActivityItem, Metrics, ProjectRow, WorkloadRow } from "./dashboard-client";

export default async function Home() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: memberships } = await supabase.from("Membership").select("id, role, displayName, organizationId, organization:Organization(name)").eq("userId", user.id).eq("isActive", true).limit(1);
  const membership = memberships?.[0] as { id: string; role: Role; displayName: string; organizationId: string; organization: { name: string } | null } | undefined;
  if (!membership) redirect("/onboarding");

  const role = membership.role;
  const orgId = membership.organizationId;
  const isLead = role === "SUPER_ADMIN" || role === "PROJECT_MANAGER";

  let projectsQuery = supabase.from("Project").select("id, name, clientName, status, priority, deadline, updatedAt, developer:Membership!Project_developerId_fkey(displayName)").eq("organizationId", orgId).order("updatedAt", { ascending: false }).limit(6);
  if (role === "DEVELOPER") projectsQuery = projectsQuery.eq("developerId", membership.id);
  const { data: rawProjects } = await projectsQuery;
  const projects: ProjectRow[] = (rawProjects ?? []).map((p) => { const dev = Array.isArray(p.developer) ? p.developer[0] : p.developer; return { id: p.id, name: p.name, clientName: p.clientName, status: p.status, priority: p.priority, deadline: p.deadline, developerName: (dev as { displayName: string } | undefined)?.displayName ?? null }; });

  const { data: rawActivity } = await supabase.from("Activity").select("id, action, createdAt, project:Project!inner(name, organizationId)").eq("project.organizationId", orgId).order("createdAt", { ascending: false }).limit(6);
  const activity: ActivityItem[] = (rawActivity ?? []).map((a) => ({ id: a.id, action: a.action, createdAt: a.createdAt, projectName: (a.project as unknown as { name: string }).name }));

  const activeFilter = ["INTAKE", "PLANNING", "IN_PROGRESS", "IN_REVIEW", "REVISION"];
  let activeCountQuery = supabase.from("Project").select("id", { count: "exact", head: true }).eq("organizationId", orgId).in("status", activeFilter);
  let inReviewCountQuery = supabase.from("Project").select("id", { count: "exact", head: true }).eq("organizationId", orgId).eq("status", "IN_REVIEW");
  let overdueCountQuery = supabase.from("Project").select("id", { count: "exact", head: true }).eq("organizationId", orgId).in("status", activeFilter).lt("deadline", new Date().toISOString());
  if (role === "DEVELOPER") { activeCountQuery = activeCountQuery.eq("developerId", membership.id); inReviewCountQuery = inReviewCountQuery.eq("developerId", membership.id); overdueCountQuery = overdueCountQuery.eq("developerId", membership.id); }
  const [{ count: activeCount }, { count: inReviewCount }, { count: overdueCount }, { count: teamCount }] = await Promise.all([activeCountQuery, inReviewCountQuery, overdueCountQuery, supabase.from("Membership").select("id", { count: "exact", head: true }).eq("organizationId", orgId).eq("isActive", true)]);
  const metrics: Metrics = { active: activeCount ?? 0, inReview: inReviewCount ?? 0, overdue: overdueCount ?? 0, team: teamCount ?? 0 };

  let workload: WorkloadRow[] = [];
  if (isLead) {
    const { data: developers } = await supabase.from("Membership").select("id, displayName").eq("organizationId", orgId).eq("role", "DEVELOPER").eq("isActive", true);
    const { data: activeDevProjects } = await supabase.from("Project").select("developerId").eq("organizationId", orgId).in("status", activeFilter).not("developerId", "is", null);
    const counts = new Map<string, number>();
    for (const row of activeDevProjects ?? []) { const id = row.developerId as string; counts.set(id, (counts.get(id) ?? 0) + 1); }
    workload = (developers ?? []).map((d) => ({ id: d.id, name: d.displayName, count: counts.get(d.id) ?? 0 }));
  }

  return <DashboardClient displayName={membership.displayName} role={role} orgName={membership.organization?.name ?? "Workspace"} projects={projects} activity={activity} metrics={metrics} workload={workload} />;
}
