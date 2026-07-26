"use client";
import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/lib/supabase/client";
import { timeAgo } from "@/lib/roles";

type Notice = { id: string; type: string; title: string; body: string | null; entityType: string | null; entityId: string | null; isRead: boolean; createdAt: string };

export default function NotificationsBell({ membershipId }: { membershipId: string }) {
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notices, setNotices] = useState<Notice[]>([]);

  useEffect(() => {
    const supabase = createClient();
    supabase.from("Notification").select("id,type,title,body,entityType,entityId,isRead,createdAt").eq("recipientId", membershipId).order("createdAt", { ascending: false }).limit(20).then(({ data }) => setNotices(data ?? []));
    const channel = supabase.channel(`notifications:${membershipId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "Notification", filter: `recipientId=eq.${membershipId}` }, (payload) => setNotices((prev) => [payload.new as Notice, ...prev])).subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [membershipId]);

  const unread = notices.filter((n) => !n.isRead).length;

  async function openNotice(n: Notice) {
    if (!n.isRead) { const supabase = createClient(); await supabase.from("Notification").update({ isRead: true }).eq("id", n.id); setNotices((prev) => prev.map((x) => (x.id === n.id ? { ...x, isRead: true } : x))); }
    if (n.entityType === "Project" && n.entityId) router.push(`/projects/${n.entityId}`);
    setOpen(false);
  }

  return <div style={{ position: "relative" }}>
    <button className="icon-button notification" onClick={() => setOpen(!open)} aria-label="Notifications"><svg width="19" height="19" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden><path d="M18 9a6 6 0 1 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 22h4"/></svg>{unread > 0 && <i/>}</button>
    {open && <div style={{ position: "absolute", right: 0, top: "calc(100% + 8px)", width: 320, maxHeight: 380, overflowY: "auto", background: "#fff", border: "1px solid #e0e5e1", borderRadius: 12, boxShadow: "0 12px 32px rgba(20,30,26,.14)", zIndex: 50 }}>
      <div style={{ padding: "12px 16px", borderBottom: "1px solid #edf0ee", fontWeight: 700, fontSize: 13 }}>Notifications {unread > 0 && `(${unread} unread)`}</div>
      {notices.length === 0 && <p style={{ padding: 16, fontSize: 13, color: "#7c8a83" }}>No notifications yet.</p>}
      {notices.map((n) => <button key={n.id} onClick={() => openNotice(n)} style={{ display: "block", width: "100%", textAlign: "left", padding: "12px 16px", borderBottom: "1px solid #f3f5f3", background: n.isRead ? "transparent" : "#f7faf8", cursor: "pointer" }}>
        <strong style={{ fontSize: 13 }}>{n.title}</strong>
        {n.body && <p style={{ margin: "4px 0 0", fontSize: 12, color: "#6b7a73" }}>{n.body}</p>}
        <small style={{ fontSize: 11, color: "#a3b0aa" }}>{timeAgo(n.createdAt)}</small>
      </button>)}
    </div>}
  </div>;
}
