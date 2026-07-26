-- Storage bucket for project files. Private; access is gated by RLS below.
INSERT INTO storage.buckets (id, name, public) VALUES ('project-files', 'project-files', false) ON CONFLICT (id) DO NOTHING;

-- Objects are stored as {organizationId}/{projectId}/{filename}. Any active org member can
-- read or upload; this mirrors the app-level "file:manage" / "file:manage:assigned" permissions.
CREATE POLICY "org members read project files" ON storage.objects FOR SELECT USING (
  bucket_id = 'project-files' AND public.is_org_member((storage.foldername(name))[1])
);
CREATE POLICY "org members upload project files" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'project-files' AND public.is_org_member((storage.foldername(name))[1])
);

-- ProjectFile rows: SELECT policy already exists from init migration. Add INSERT so members
-- can register a file after uploading it to storage.
CREATE POLICY "org members create project files" ON "ProjectFile" FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM "Project" p WHERE p.id = "ProjectFile"."projectId" AND public.is_org_member(p."organizationId"))
);
