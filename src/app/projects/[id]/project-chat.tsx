"use client";
import { FormEvent, useEffect, useRef, useState } from "react";
import { createClient } from "@/lib/supabase/client";

type ChatMessage = { id: string; body: string; authorId: string; createdAt: string };

export default function ProjectChat({ projectId, membershipId }: { projectId: string; membershipId: string }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [text, setText] = useState("");
  const [sending, setSending] = useState(false);
  const [warning, setWarning] = useState("");
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const supabase = createClient();
    let active = true;
    supabase.from("ChatMessage").select("id, body, authorId, createdAt").eq("projectId", projectId).order("createdAt", { ascending: true }).limit(100).then(({ data }) => { if (active) setMessages(data ?? []); });
    const channel = supabase.channel(`chat:${projectId}`).on("postgres_changes", { event: "INSERT", schema: "public", table: "ChatMessage", filter: `projectId=eq.${projectId}` }, (payload) => { setMessages((prev) => [...prev, payload.new as ChatMessage]); }).subscribe();
    return () => { active = false; supabase.removeChannel(channel); };
  }, [projectId]);

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }); }, [messages.length]);

  async function send(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const body = text.trim();
    if (!body || sending) return;
    setSending(true); setWarning("");
    const res = await fetch(`/api/projects/${projectId}/messages`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ body }) });
    const data = await res.json();
    if (res.ok && data.blocked) setWarning("Message blocked: internal chat can't include email addresses or Pakistani phone numbers. Super Admin has been notified.");
    else if (!res.ok) setWarning(data.error || "Could not send message.");
    else setText("");
    setSending(false);
  }

  return <article className="rounded-xl border border-[#e0e5e1] bg-white p-6">
    <h2 className="font-serif text-xl">Internal chat</h2>
    <p className="mt-1 text-xs text-[#809089]">Emails and Pakistani phone numbers are blocked automatically.</p>
    <div className="mt-4 max-h-80 space-y-3 overflow-y-auto rounded-lg bg-[#f7f8f6] p-4">
      {messages.length === 0 && <p className="text-sm text-[#718079]">No messages yet — say hello to the team.</p>}
      {messages.map((m) => <div key={m.id} className={`max-w-[85%] rounded-lg px-3 py-2 text-sm ${m.authorId === membershipId ? "ml-auto bg-[#1d443b] text-white" : "bg-white border border-[#e7ece8]"}`}><p className="whitespace-pre-wrap break-words">{m.body}</p><small className={`mt-1 block text-[10px] ${m.authorId === membershipId ? "text-[#c6d6d0]" : "text-[#a3b0aa]"}`}>{new Date(m.createdAt).toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}</small></div>)}
      <div ref={bottomRef}/>
    </div>
    {warning && <p className="mt-3 rounded-lg bg-[#fff0ed] p-3 text-sm text-[#a34c3b]">{warning}</p>}
    <form onSubmit={send} className="mt-3 flex gap-2">
      <input value={text} onChange={(e) => setText(e.target.value)} placeholder="Message the team…" maxLength={4000} className="flex-1 rounded-lg border border-[#dce4df] px-3 py-2.5 text-sm outline-none focus:border-[#39745f]"/>
      <button disabled={sending || !text.trim()} className="rounded-lg bg-[#1d443b] px-4 py-2.5 text-sm font-bold text-white disabled:opacity-60">Send</button>
    </form>
  </article>;
}
