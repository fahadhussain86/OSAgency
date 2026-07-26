-- Run this migration in Supabase Dashboard → SQL Editor after the initial migration.
CREATE FUNCTION public.create_workspace(workspace_name TEXT, workspace_slug TEXT)
RETURNS TEXT LANGUAGE plpgsql SECURITY DEFINER SET search_path = public AS $$
DECLARE created_org_id TEXT;
BEGIN
  IF auth.uid() IS NULL THEN RAISE EXCEPTION 'Authentication is required'; END IF;
  IF length(trim(workspace_name)) < 2 OR length(trim(workspace_name)) > 100 THEN RAISE EXCEPTION 'Workspace name must be between 2 and 100 characters'; END IF;
  IF workspace_slug !~ '^[a-z0-9]+(?:-[a-z0-9]+)*$' THEN RAISE EXCEPTION 'Workspace URL must contain lowercase letters, numbers, and hyphens only'; END IF;
  INSERT INTO "Organization" ("id", "name", "slug", "updatedAt") VALUES (replace(gen_random_uuid()::text, '-', ''), trim(workspace_name), workspace_slug, now()) RETURNING "id" INTO created_org_id;
  INSERT INTO "Membership" ("id", "organizationId", "userId", "displayName", "role") VALUES (replace(gen_random_uuid()::text, '-', ''), created_org_id, auth.uid()::text, coalesce(nullif(split_part(auth.jwt() ->> 'email', '@', 1), ''), 'Administrator'), 'SUPER_ADMIN');
  RETURN created_org_id;
END;
$$;

CREATE FUNCTION public.can_manage_projects(org_id TEXT)
RETURNS BOOLEAN LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  SELECT EXISTS (SELECT 1 FROM "Membership" WHERE "organizationId" = org_id AND "userId" = auth.uid()::text AND "isActive" = true AND "role" IN ('SUPER_ADMIN', 'PROJECT_MANAGER', 'SALES_AGENT'))
$$;

CREATE POLICY "permitted members create projects" ON "Project" FOR INSERT WITH CHECK (public.can_manage_projects("organizationId"));
CREATE POLICY "permitted members update projects" ON "Project" FOR UPDATE USING (public.can_manage_projects("organizationId")) WITH CHECK (public.can_manage_projects("organizationId"));
CREATE POLICY "permitted members create activity" ON "Activity" FOR INSERT WITH CHECK (EXISTS (SELECT 1 FROM "Project" p WHERE p.id = "Activity"."projectId" AND public.can_manage_projects(p."organizationId")));
