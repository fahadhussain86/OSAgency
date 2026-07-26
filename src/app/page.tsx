"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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

const projects = [
  { name: "Northstar Studios", service: "Brand identity & website", owner: "AL", due: "Today", color: "#f4b64c", status: "In review", progress: 84 },
  { name: "Kora Health", service: "Product design", owner: "MK", due: "Aug 02", color: "#e98b70", status: "In progress", progress: 52 },
  { name: "Onward Finance", service: "Web development", owner: "JP", due: "Aug 08", color: "#8ca6ed", status: "In progress", progress: 38 },
  { name: "Common Ground", service: "Growth campaign", owner: "RB", due: "Aug 14", color: "#9fc986", status: "Planning", progress: 18 },
];

export default function Home() {
  const router = useRouter();
  const [active, setActive] = useState("Overview");
  const [dark, setDark] = useState(false);
  const [notice, setNotice] = useState(false);
  const nav = [["Overview", "grid"], ["Projects", "folder"], ["Team", "people"], ["Inbox", "message"], ["Reports", "chart"]] as const;
  return <main className={dark ? "app dark" : "app"}>
    <aside className="sidebar">
      <div className="brand"><span className="brand-mark">A</span><span>AgencyOS</span></div>
      <div className="workspace"><span className="workspace-dot"/> Northstar Agency <span className="chevron">⌄</span></div>
      <nav>{nav.map(([label, icon]) => <button onClick={() => setActive(label)} className={active === label ? "nav-item active" : "nav-item"} key={label}><Icon name={icon}/><span>{label}</span>{label === "Inbox" && <b>3</b>}</button>)}</nav>
      <div className="sidebar-bottom"><button className="nav-item" onClick={() => setActive("Settings")}><Icon name="settings"/><span>Settings</span></button><div className="profile"><div className="avatar dark-avatar">SK</div><div><strong>Sarah Kim</strong><small>Project Manager</small></div><span className="dots">•••</span></div></div>
    </aside>
    <section className="content">
      <header><div className="mobile-brand"><span className="brand-mark">A</span> AgencyOS</div><div className="search"><Icon name="search" size={18}/><span>Search projects, people, or files</span><kbd>⌘ K</kbd></div><div className="header-actions"><button className="icon-button" onClick={() => setDark(!dark)} aria-label="Toggle theme"><Icon name="sun" size={19}/></button><button className="icon-button notification" onClick={() => setNotice(!notice)} aria-label="Notifications"><Icon name="bell" size={19}/><i/></button><button className="new-button" onClick={() => router.push("/projects/new")}><Icon name="plus" size={17}/> New project</button></div></header>
      <div className="page">
        <div className="page-title"><div><p className="eyebrow">MONDAY, JULY 25</p><h1>Good morning, Sarah <span>✦</span></h1><p className="subtitle">Here&apos;s what&apos;s happening across your agency.</p></div><button className="text-button">View activity <Icon name="arrow" size={16}/></button></div>
        {notice && <div className="toast"><Icon name="shield" size={18}/><span>Privacy monitoring is active. No policy violations today.</span><button onClick={() => setNotice(false)}>×</button></div>}
        <div className="metrics"><Metric value="12" label="Active projects" trend="+2 this month"/><Metric value="87%" label="On-track delivery" trend="↑ 6% from last month" positive/><Metric value="$48.2k" label="Projected revenue" trend="↑ 12% from last month" positive/><Metric value="24" label="Open tasks" trend="8 due this week"/></div>
        <div className="grid-main"><section className="panel project-panel"><div className="panel-head"><div><h2>Active projects</h2><p>Keep momentum across your work.</p></div><button className="small-link" onClick={() => setActive("Projects")}>All projects <Icon name="arrow" size={15}/></button></div><div className="project-list">{projects.map(p => <div className="project" key={p.name}><div className="project-icon" style={{background:p.color}}>{p.name.slice(0,1)}</div><div className="project-details"><strong>{p.name}</strong><span>{p.service}</span><div className="progress"><i style={{width:`${p.progress}%`, background:p.color}}/></div></div><span className={`status ${p.status.toLowerCase().replace(" ", "-")}`}>{p.status}</span><div className="assignee"><span className="avatar" style={{background:p.color}}>{p.owner}</span><small>{p.due}</small></div><button className="more"><Icon name="more" size={19}/></button></div>)}</div></section>
          <section className="panel focus"><div className="panel-head"><div><h2>Today&apos;s focus</h2><p>Three things that need attention.</p></div><button className="more"><Icon name="more" size={19}/></button></div><Task color="#e89072" title="Review Northstar homepage" meta="Northstar Studios · 10:30 AM" checked/><Task color="#91a9ef" title="Send Kora design proposal" meta="Kora Health · 1:00 PM"/><Task color="#a5c987" title="Sprint planning with dev team" meta="Internal · 3:30 PM"/><button className="add-task"><Icon name="plus" size={16}/> Add a task</button></section>
        </div>
        <div className="grid-bottom"><section className="panel workload"><div className="panel-head"><div><h2>Team workload</h2><p>Active projects by team member.</p></div><button className="small-link">Manage team <Icon name="arrow" size={15}/></button></div><div className="workload-row"><Work name="Alex Morgan" initials="AM" n={4} max={5} color="#f3b85c"/><Work name="Jamie Park" initials="JP" n={3} max={5} color="#95aae9"/><Work name="Riley Brooks" initials="RB" n={2} max={5} color="#a8cf94"/></div></section><section className="panel activity"><div className="panel-head"><div><h2>Recent activity</h2><p>A quick pulse on the workspace.</p></div></div><div className="activity-line"><span className="mini-avatar blue">JP</span><p><b>Jamie</b> completed <strong>API integration</strong><small>12 minutes ago</small></p></div><div className="activity-line"><span className="mini-avatar orange">AL</span><p><b>Alex</b> shared a new file in <strong>Northstar Studios</strong><small>36 minutes ago</small></p></div></section></div>
      </div>
    </section>
  </main>;
}
function Metric({value,label,trend,positive}: {value:string;label:string;trend:string;positive?:boolean}) {return <div className="metric"><div className="metric-top"><span>{label}</span><button>•••</button></div><strong>{value}</strong><small className={positive?"positive":""}>{trend}</small></div>}
function Task({color,title,meta,checked}: {color:string;title:string;meta:string;checked?:boolean}) {return <div className="task"><button className={checked?"check checked":"check"}>{checked && "✓"}</button><span className="task-dot" style={{background:color}}/><div><strong>{title}</strong><small>{meta}</small></div></div>}
function Work({name,initials,n,max,color}:{name:string;initials:string;n:number;max:number;color:string}) {return <div className="work"><span className="avatar" style={{background:color}}>{initials}</span><div><strong>{name}</strong><small>{n} active projects</small></div><div className="bars">{Array.from({length:max},(_,i)=><i key={i} style={{background:i<n?color:"#e8ebe9"}}/>)}</div></div>}
