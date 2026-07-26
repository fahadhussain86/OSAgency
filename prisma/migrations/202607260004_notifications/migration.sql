CREATE TABLE "Notification" (
  "id" TEXT NOT NULL,
  "organizationId" TEXT NOT NULL,
  "recipientId" TEXT NOT NULL,
  "type" TEXT NOT NULL,
  "title" TEXT NOT NULL,
  "body" TEXT,
  "entityType" TEXT,
  "entityId" TEXT,
  "isRead" BOOLEAN NOT NULL DEFAULT false,
  "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
  CONSTRAINT "Notification_pkey" PRIMARY KEY ("id")
);

CREATE INDEX "Notification_recipientId_isRead_idx" ON "Notification"("recipientId", "isRead");

ALTER TABLE "Notification" ADD CONSTRAINT "Notification_organizationId_fkey" FOREIGN KEY ("organizationId") REFERENCES "Organization"("id") ON DELETE CASCADE ON UPDATE CASCADE;
ALTER TABLE "Notification" ADD CONSTRAINT "Notification_recipientId_fkey" FOREIGN KEY ("recipientId") REFERENCES "Membership"("id") ON DELETE CASCADE ON UPDATE CASCADE;

ALTER TABLE "Notification" ENABLE ROW LEVEL SECURITY;

CREATE POLICY "recipient reads own notifications" ON "Notification" FOR SELECT USING (
  EXISTS (SELECT 1 FROM "Membership" m WHERE m.id = "Notification"."recipientId" AND m."userId" = auth.uid()::text)
);
CREATE POLICY "recipient updates own notifications" ON "Notification" FOR UPDATE USING (
  EXISTS (SELECT 1 FROM "Membership" m WHERE m.id = "Notification"."recipientId" AND m."userId" = auth.uid()::text)
) WITH CHECK (
  EXISTS (SELECT 1 FROM "Membership" m WHERE m.id = "Notification"."recipientId" AND m."userId" = auth.uid()::text)
);
-- Org members can notify other members of the same org (e.g. revision requests). Chat-violation
-- alerts to Super Admins are written by the service-role client in the moderation route instead.
CREATE POLICY "org members create notifications" ON "Notification" FOR INSERT WITH CHECK (
  public.is_org_member("organizationId") AND EXISTS (SELECT 1 FROM "Membership" r WHERE r.id = "Notification"."recipientId" AND r."organizationId" = "Notification"."organizationId")
);
