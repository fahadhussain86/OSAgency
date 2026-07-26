import { redirect } from "next/navigation";
import Link from "next/link";
import { createClient } from "@/lib/supabase/server";
import { Role } from "@/lib/roles";
import BrandingForm from "./branding-form";

export default async function BrandingSettingsPage() {
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();
  if (!user) redirect("/auth");

  const { data: memberships } = await supabase.from("Membership").select("role, organizationId").eq("userId", user.id).eq("isActive", true).limit(1);
  const membership = memberships?.[0] as { role: Role; organizationId: string } | undefined;
  if (!membership) redirect("/onboarding");
  if (membership.role !== "SUPER_ADMIN") redirect("/");

  const { data: org } = await supabase.from("Organization").select("id, name, logoUrl, primaryColor, featureFlags").eq("id", membership.organizationId).single();
  if (!org) redirect("/");

  return <main className="min-h-screen bg-[#f7f8f6] px-5 py-10 text-[#202523]">
    <div className="mx-auto max-w-2xl">
      <Link href="/" className="text-sm font-bold text-[#286a5a]">&larr; Dashboard</Link>
      <header className="mt-5"><p className="text-xs font-bold tracking-[.15em] text-[#5f796f]">SETTINGS</p><h1 className="mt-2 font-serif text-4xl">Branding &amp; features</h1><p className="mt-2 text-sm text-[#718079]">Controls how this workspace looks and which modules are enabled &mdash; visible to your whole team.</p></header>
      <BrandingForm organizationId={org.id} initialName={org.name} initialLogoUrl={org.logoUrl} initialColor={org.primaryColor} initialFlags={(org.featureFlags ?? {}) as Record<string, boolean>}/>
    </div>
  </main>;
}
