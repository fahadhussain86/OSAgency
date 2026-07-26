import { NextRequest, NextResponse } from "next/server";
import { createClient } from "@/lib/supabase/server";
import { createAdminClient } from "@/lib/supabase/admin";
import { inspectInternalMessage } from "@/lib/privacy";

export async function POST(request: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id: projectId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) return NextResponse.json({ error: "Not authenticated" }, { status: 401 });

  const { data: project } = await supabase.from("Project").select("id, organizationId").eq("id", projectId).single();
  if (!project) return NextResponse.json({ error: "Project not found" }, { status: 404 });

  const { data: membership } = await supabase.from("Membership").select("id").eq("organizationId", project.organizationId).eq("userId", user.id).eq("isActive", true).single();
  if (!membership) return NextResponse.json({ error: "Not a member of this workspace" }, { status: 403 });

  const { body } = (await request.json()) as { body?: string };
  const text = (body ?? "").trim();
  if (!text || text.length > 4000) return NextResponse.json({ error: "Message must be between 1 and 4000 characters" }, { status: 400 });

  const violations = inspectInternalMessage(text);
  const admin = createAdminClient();
  const messageId = crypto.randomUUID().replaceAll("-", "");

  const { error: insertError } = await admin.from("ChatMessage").insert({ id: messageId, projectId, authorId: membership.id, body: text, isBlocked: violations.length > 0, violations });
  if (insertError) return NextResponse.json({ error: insertError.message }, { status: 500 });

  if (violations.length > 0) {
    await admin.from("AuditLog").insert({ id: crypto.randomUUID().replaceAll("-", ""), organizationId: project.organizationId, actorId: user.id, action: "chat_violation_blocked", entityType: "ChatMessage", entityId: messageId, metadata: { projectId, violations } });
    const { data: superAdmins } = await admin.from("Membership").select("id").eq("organizationId", project.organizationId).eq("role", "SUPER_ADMIN").eq("isActive", true);
    if (superAdmins?.length) await admin.from("Notification").insert(superAdmins.map((a) => ({ id: crypto.randomUUID().replaceAll("-", ""), organizationId: project.organizationId, recipientId: a.id, type: "chat_violation", title: "Privacy policy violation blocked", body: `A message in a project chat was blocked for containing: ${violations.join(", ")}.`, entityType: "Project", entityId: projectId })));
    return NextResponse.json({ blocked: true, violations }, { status: 200 });
  }

  return NextResponse.json({ blocked: false, id: messageId }, { status: 201 });
}
