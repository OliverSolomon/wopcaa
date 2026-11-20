import { Suspense } from "react";
import { DashShell, type NavGroup } from "@/components/dash/shell";
import { UserMenu } from "@/components/dash/user-menu";
import { getViewer, isStaff } from "@/lib/session";

async function Me() {
  const v = await getViewer();
  return v ? <UserMenu name={v.name} email={v.email} role={v.role} /> : null;
}

async function StaffLink() {
  const v = await getViewer();
  return v && isStaff(v.role) ? <a href="/admin" className="nav-item">↗ Staff dashboard</a> : null;
}

const NAV: NavGroup[] = [
  {
    links: [
      { href: "/account", label: "My reports", icon: "Inbox", exact: true },
      { href: "/report", label: "New report", icon: "FilePlus2" },
      { href: "/account/profile", label: "Profile & safety", icon: "UserRound" },
    ],
  },
];

export default function AccountLayout({ children }: LayoutProps<"/account">) {
  return (
    <DashShell nav={NAV} title="My space" user={<Suspense fallback={<div className="h-12" />}><StaffLink /><Me /></Suspense>}>
      {children}
    </DashShell>
  );
}
