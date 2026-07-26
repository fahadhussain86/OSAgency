CREATE TABLE "ChatMessage" (
  "id" TEXT NOT NULL,
  "projectId" TEXT NOT NULL,
  "authorId" TEXT NOT NULL,
  "body" TEXT NOT NULL,
  "isBlocked" BOOLEAN NOT NULL DEFAULT false,
  "violations" JSONB NOT NULL DEFAULT '[]',
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "ChatMessage_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "ChatMessage_projectId_createdAt_idx" ON "ChatMessage"("projectId", "createdAt");

ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_projectId_fkey" FOREIGN KEY ("projectId") REFERENCES "Project"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "ChatMessage" ADD CONSTRAINT "ChatMessage_authorId_fkey" FOREIGN KEY ("authorId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "ChatMessage" ENABLE ROW LEVEL SECURITY;

-- Blocked messages are only ever visible to Super Admins (audit trail); everyone else sees only clean messages.
CREATE POLICY "members read clean chat" ON "ChatMessage" FOR SELECT USING (
  "isBlocked" = false AND EXISTS (SELECT 1 FROM "Project" p WHERE p.id = "ChatMessage"."projectId" AND public.is_org_member(p."organizationId"))
);
CREATE POLICY "admins read all chat" ON "ChatMessage" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "Project" p JOIN "Membership" m ON m."organizationId" = p."organizationId" WHERE p.id = "ChatMessage"."projectId" AND m."userId" = auth.uid()::text AND m.role = 'SUPER_ADMIN' AND m."isActive" = true)
);

-- Inserts happen only via the server (service role) after moderation, so no direct client INSERT policy is granted.
