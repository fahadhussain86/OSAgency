export type Role = "SUPER_ADMIN" | "PROJECT_MANAGER" | "SALES_AGENT" | "DEVELOPER";
export const roleLabel: Record<Role, string> = { SUPER_ADMIN: "Super Admin", PROJECT_MANAGER: "Project Manager", SALES_AGENT: "Sales Agent", DEVELOPER: "Developer" };
export const navByRole: Record<Role, [string, string][]> = {
  SUPER_ADMIN: [["Overview", "grid"], ["Projects", "folder"], ["Team", "people"], ["Inbox", "message"], ["Reports", "chart"]],
  PROJECT_MANAGER: [["Overview", "grid"], ["Projects", "folder"], ["Team", "people"], ["Inbox", "message"], ["Reports", "chart"]],
  SALES_AGENT: [["Overview", "grid"], ["Projects", "folder"], ["Inbox", "message"]],
  DEVELOPER: [["Overview", "grid"], ["My Projects", "folder"], ["Inbox", "message"]],
};
export function initials(name: string) { return name.trim().split(/\s+/).slice(0, 2).map((p) => p[0]?.toUpperCase() ?? "").join(""); }
export function timeAgo(iso: string) {
  const diffMs = Date.now() - new Date(iso).getTime(); const min = Math.round(diffMs / 60000);
  if (min < 1) return "just now"; if (min < 60) return `${min} minute${min === 1 ? "" : "s"} ago`;
  const hr = Math.round(min / 60); if (hr < 24) return `${hr} hour${hr === 1 ? "" : "s"} ago`;
  const day = Math.round(hr / 24); return `${day} day${day === 1 ? "" : "s"} ago`;
}
