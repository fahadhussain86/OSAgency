-- Only Super Admins may edit workspace branding/feature flags.
CREATE POLICY "admins update organization" ON "Organization" FOR UPDATE USING (
  EXISTS (SELECT 1 FROM "Membership" m WHERE m."organizationId" = "Organization".id AND m."userId" = auth.uid()::text AND m.role = 'SUPER_ADMIN' AND m."isActive" = true)
) WITH CHECK (
  EXISTS (SELECT 1 FROM "Membership" m WHERE m."organizationId" = "Organization".id AND m."userId" = auth.uid()::text AND m.role = 'SUPER_ADMIN' AND m."isActive" = true)
);

-- Public bucket for org logos (safe to be public; logos aren't sensitive). Path convention:
-- {organizationId}/{filename}. Anyone can read (needed for <img> tags), only Super Admins upload.
INSERT INTO storage.buckets (id, name, public) VALUES ('branding', 'branding', true) ON CONFLICT (id) DO NOTHING;

CREATE POLICY "public reads branding assets" ON storage.objects FOR SELECT USING (bucket_id = 'branding');
CREATE POLICY "admins upload branding assets" ON storage.objects FOR INSERT WITH CHECK (
  bucket_id = 'branding' AND EXISTS (SELECT 1 FROM "Membership" m WHERE m."organizationId" = (storage.foldername(name))[1] AND m."userId" = auth.uid()::text AND m.role = 'SUPER_ADMIN' AND m."isActive" = true)
);
