"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Role, initials, navByRole, roleLabel, timeAgo } from "@/lib/roles";

export type ProjectRow = { id: string; name: string; clientName: string; status: string; priority: string; deadline: string | null; developerName: string | null };
export type ActivityItem = { id: string; action: string; createdAt: string; projectName: string };
export type Metrics = { active: number; inReview: number; overdue: number; team: number };
export type WorkloadRow = { id: string; name: string; count: number };

type IconName = "grid" | "folder" | "people" | "message" | "chart" | "settings" | "search" | "bell" | "plus" | "arrow" | "more" | "sun" | "shield";

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  const paths: Record<IconName, React.ReactNode> = {
    grid: <><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></>,
    folder: <><path d="M3 6.5A2.5 2.5 0 0 1 5.5 4H10l2 2h6.5A2.5 2.5 0 0 1 21 8.5v9a2.5 2.5 0 0 1-2.5 2.5h-13A2.5 2.5 0 0 1 3 17.5z"/><path d="M3 9h18"/></>,
    people: <><circle cx="9" cy="8" r="3"/><path d="M3.5 20v-1.5a5.5 5.5 0 0 1 11 0V20"/><path d="M16 5.5a3 3 0 0 1 0 5.7M20.5 20v-1.5a5.5 5.5 0 0 0-3.2-5"/></>,
    message: <><path d="M20.5 11.5a7.5 7.5 0 0 1-8 7.5 9.5 9.5 0 0 1-3.5-.7L4 20l1.5-4a7.3 7.3 0 0 1-2-5 7.5 7.5 0 0 1 8-7.5 7.5 7.5 0 0 1 9 8z"/></>,
    chart: <><path d="M4 20V4M4 20h17"/><path d="m7 15 4-4 3 2 6-7"/></>,
    settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.1 2.1-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.5v.2h-3v-.2a1.7 1.7 0 0 0-1-1.5 1.7 1.7 0 0 0-1.9.3l-.1.1-2.1-2.1.1-.1A1.7 1.7 0 0 0 7 15a1.7 1.7 0 0 0-1.5-1H5.3v-3h.2A1.7 1.7 0 0 0 7 10a1.7 1.7 0 0 0-.3-1.9l-.1-.1 2.1-2.1.1.1a1.7 1.7 0 0 0 1.9.3 1.7 1.7 0 0 0 1-1.5v-.2h3v.2a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.9-.3l.1-.1 2.1 2.1-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.5 1h.2v3h-.2a1.7 1.7 0 0 0-1.6 1z"/></>,
    search: <><circle cx="10.5" cy="10.5" r="6.5"/><path d="m16 16 4.5 4.5"/></>, bell: <><path d="M18 9a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4"/></>,
    plus: <><path d="M12 5v14M5 12h14"/></>, arrow: <><path d="M5 12h14M13 6l6 6-6 6"/></>, more: <><circle cx="5" cy="12" r="1" fill="currentColor"/><circle cx="12" cy="12" r="1" fill="currentColor"/><circle cx="19" cy="12" r="1" fill="currentColor"/></>,
    sun: <><circle cx="12" cy="12" r="3.5"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
    shield: <><path d="M12 3 20 6v5c0 5-3.4 8.4-8 10-4.6-1.6-8-5-8-10V6z"/><path d="m8.5 12 2.2 2.2 4.8-5"/></>,
  };
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden>{paths[name]}</svg>;
}

const palette = ["#f4b64c", "#e98b70", "#8ca6ed", "#9fc986", "#d69fe0", "#7fc4c9"];
const statusLabel = (s: string) => s.replaceAll("_", " ").toLowerCase().replace(/^./, (c) => c.toUpperCase());
const statusClass = (s: string) => s.toLowerCase().replaceAll("_", "-");

export default function DashboardClient({ displayName, role, orgName, projects, activity, metrics, workload }: { displayName: string; role: Role; orgName: string; projects: ProjectRow[]; activity: ActivityItem[]; metrics: Metrics; workload: WorkloadRow[] }) {
  const router = useRouter();
  const [active, setActive] = useState("Overview");
  const [dark, setDark] = useState(false);
  const [notice, setNotice] = useState(false);
  const nav = navByRole[role];
  const isLead = role === "SUPER_ADMIN" || role === "PROJECT_MANAGER";
  const deadlines = projects.filter((p) => p.deadline).sort((a, b) => new Date(a.deadline!).getTime() - new Date(b.deadline!).getTime()).slice(0, 3);
  const today = new Date().toLocaleDateString("en-US", { weekday: "long", month: "long", day: "numeric" }).toUpperCase();
  const firstName = displayName.split(" ")[0];
  const maxWorkload = Math.max(1, ...workload.map((w) => w.count), 5);

  return <main className={dark ? "app dark" : "app"}>
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">A</span><span>AgencyOS</span></div>
      <div className="workspace"><span className="workspace-dot"/> {orgName} <span className="chevron">⌄</span></div>
      <nav>{nav.map(([label, icon]) => <button onClick={() => { setActive(label); if (label !== "Overview") router.push(label === "Projects" || label === "My Projects" ? "/projects" : "/projects"); }} className={active === label ? "nav-item active" : "nav-item"} key={label}><Icon name={icon as IconName}/><span>{label}</span></button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item" onClick={() => setActive("Settings")}><Icon name="settings"/><span>Settings</span></button><div className="profile"><div className="avatar dark-avatar">{initials(displayName)}</div><div><strong>{firstName}</strong><small>{roleLabel[role]}</small></div><span className="dots">•••</span></div></div>
    </aside>
    <section className="content">
      <header><div className="mobile-brand"><span className="brand-mark">A</span> AgencyOS</div><div className="search"><Icon name="search" size={18}/><span>Search projects, people, or files</span><kbd>⌘ K</kbd></div><div className="header-actions"><button className="icon-button" onClick={() => setDark(!dark)} aria-label="Toggle theme"><Icon name="sun" size={19}/></button><button className="icon-button notification" onClick={() => setNotice(!notice)} aria-label="Notifications"><Icon name="bell" size={19}/><i/></button>{role !== "DEVELOPER" && <button className="new-button" onClick={() => router.push("/projects/new")}><Icon name="plus" size={17}/> New project</button>}</div></header>
      <div className="page">
        <div className="page-title"><div><p className="eyebrow">{today}</p><h1>Good morning, {firstName} <span>✦</span></h1><p className="subtitle">{role === "DEVELOPER" ? "Here's what's on your plate today." : "Here's what's happening across your agency."}</p></div><button className="text-button" onClick={() => router.push("/projects")}>View all projects <Icon name="arrow" size={16}/></button></div>
        {notice && <div className="toast"><Icon name="shield" size={18}/><span>Privacy monitoring is active. No policy violations today.</span><button onClick={() => setNotice(false)}>×</button></div>}
        <div className="metrics">
          <Metric value={String(metrics.active)} label={role === "DEVELOPER" ? "Your active projects" : "Active projects"}/>
          <Metric value={String(metrics.inReview)} label="In review"/>
          <Metric value={String(metrics.overdue)} label="Overdue" trend={metrics.overdue > 0 ? "Needs attention" : "None — on track"} positive={metrics.overdue === 0}/>
          {isLead ? <Metric value={String(metrics.team)} label="Active team members"/> : <Metric value={String(deadlines.length)} label="Upcoming deadlines"/>}
        </div>
        <div className="grid-main">
          <section className="panel project-panel"><div className="panel-head"><div><h2>{role === "DEVELOPER" ? "Assigned to you" : "Active projects"}</h2><p>Keep momentum across your work.</p></div><button className="small-link" onClick={() => router.push("/projects")}>All projects <Icon name="arrow" size={15}/></button></div>
            <div className="project-list">{projects.length === 0 && <p style={{ padding: "16px 4px", color: "#7c8a83", fontSize: 14 }}>No projects yet.</p>}{projects.map((p, i) => <div className="project" key={p.id} onClick={() => router.push(`/projects/${p.id}`)}><div className="project-icon" style={{ background: palette[i % palette.length] }}>{p.name.slice(0, 1)}</div><div className="project-details"><strong>{p.name}</strong><span>{p.clientName}</span></div><span className={`status ${statusClass(p.status)}`}>{statusLabel(p.status)}</span><div className="assignee"><span className="avatar" style={{ background: palette[i % palette.length] }}>{p.developerName ? initials(p.developerName) : "—"}</span><small>{p.deadline ? new Date(p.deadline).toLocaleDateString() : "No deadline"}</small></div><button className="more"><Icon name="more" size={19}/></button></div>)}</div>
          </section>
          <section className="panel focus"><div className="panel-head"><div><h2>Upcoming deadlines</h2><p>What&apos;s due soonest.</p></div></div>
            {deadlines.length === 0 && <p style={{ padding: "8px 4px", color: "#7c8a83", fontSize: 14 }}>Nothing on the calendar yet.</p>}
            {deadlines.map((p, i) => <Task key={p.id} color={palette[i % palette.length]} title={p.name} meta={`${p.clientName} · ${new Date(p.deadline!).toLocaleDateString()}`}/>)}
          </section>
        </div>
        {(isLead || activity.length > 0) && <div className="grid-bottom">
          {isLead && <section className="panel workload"><div className="panel-head"><div><h2>Team workload</h2><p>Active projects by developer.</p></div><button className="small-link" onClick={() => router.push("/projects")}>Manage team <Icon name="arrow" size={15}/></button></div><div className="workload-row">{workload.length === 0 && <p style={{ color: "#7c8a83", fontSize: 14 }}>No developers on the team yet.</p>}{workload.map((w, i) => <Work key={w.id} name={w.name} initials={initials(w.name)} n={w.count} max={maxWorkload} color={palette[i % palette.length]}/>)}</div></section>}
          <section className="panel activity"><div className="panel-head"><div><h2>Recent activity</h2><p>A quick pulse on the workspace.</p></div></div>
            {activity.length === 0 && <p style={{ color: "#7c8a83", fontSize: 14 }}>No activity yet.</p>}
            {activity.map((a, i) => <div className="activity-line" key={a.id}><span className={`mini-avatar ${i % 2 === 0 ? "blue" : "orange"}`}>{initials(a.projectName)}</span><p><b>{a.action}</b><small>{a.projectName} · {timeAgo(a.createdAt)}</small></p></div>)}
          </section>
        </div>}
      </div>
    </section>
  </main>;
}

function Metric({ value, label, trend, positive }: { value: string; label: string; trend?: string; positive?: boolean }) { return <div className="metric"><div className="metric-top"><span>{label}</span></div><strong>{value}</strong>{trend && <small className={positive ? "positive" : ""}>{trend}</small>}</div>; }
function Task({ color, title, meta }: { color: string; title: string; meta: string }) { return <div className="task"><span className="task-dot" style={{ background: color }}/><div><strong>{title}</strong><small>{meta}</small></div></div>; }
function Work({ name, initials, n, max, color }: { name: string; initials: string; n: number; max: number; color: string }) { return <div className="work"><span className="avatar" style={{ background: color }}>{initials}</span><div><strong>{name}</strong><small>{n} active project{n === 1 ? "" : "s"}</small></div><div className="bars">{Array.from({ length: max }, (_, i) => <i key={i} style={{ background: i < n ? color : "#e8ebe9" }}/>)}</div></div>; }
