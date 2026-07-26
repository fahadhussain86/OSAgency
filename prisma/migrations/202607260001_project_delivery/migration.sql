CREATE POLICY "permitted members create revisions"
ON "Revision" FOR INSERT
WITH CHECK (EXISTS (SELECT 1 FROM "Project" p WHERE p.id = "Revision"."projectId" AND public.can_manage_projects(p."organizationId")));
