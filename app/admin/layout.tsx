import { Suspense } from "react";
import { DashShell, type NavGroup } from "@/components/dash/shell";
import { UserMenu } from "@/components/dash/user-menu";
import { getViewer } from "@/lib/session";

const NAV: NavGroup[] = [
  { links: [{ href: "/admin", label: "Overview", icon: "LayoutDashboard", exact: true }] },
  {
    title: "Case desk",
    links: [
      { href: "/admin/reports", label: "Reports", icon: "Inbox" },
      { href: "/admin/enquiries", label: "Enquiries", icon: "MessagesSquare" },
      { href: "/admin/people", label: "People", icon: "Users" },
    ],
  },
  {
    title: "Studio",
    links: [
      { href: "/admin/studio/pages", label: "Pages", icon: "FileText" },
      { href: "/admin/studio/posts", label: "Posts", icon: "Newspaper" },
      { href: "/admin/studio/media", label: "Media", icon: "ImageIcon" },
      { href: "/admin/studio/settings", label: "Settings", icon: "Settings" },
    ],
  },
];

async function Me() {
  const v = await getViewer();
  return v ? <UserMenu name={v.name} email={v.email} role={v.role} /> : null;
}

export default function AdminLayout({ children }: LayoutProps<"/admin">) {
  return (
    <DashShell nav={NAV} title="Staff dashboard" user={<Suspense fallback={<div className="h-12" />}><Me /></Suspense>}>
      {children}
    </DashShell>
  );
}
