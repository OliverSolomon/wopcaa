import { Users } from "lucide-react";
import { requireCaseTeam } from "@/lib/session";
import { query } from "@/lib/db";
import { formatDate, cn } from "@/lib/utils";
import { PageTitle, Pill, Empty } from "@/components/dash/ui";
import { AddPerson, PersonActions } from "@/components/dash/people-manager";

export const metadata = { title: "People" };

type Role = "reporter" | "editor" | "admin" | "super_admin";

export default async function People({ searchParams }: PageProps<"/admin/people">) {
  const v = await requireCaseTeam();
  const sp = await searchParams;
  const q = typeof sp.q === "string" ? sp.q.trim() : "";
  const roleFilter = typeof sp.role === "string" && ["reporter", "editor", "admin", "super_admin", "staff"].includes(sp.role) ? sp.role : "";
  const rows = await query<{ id: string; name: string | null; email: string; role: Role | null; banned: boolean | null; ban_reason: string | null; created_at: string; reports: number }>(
    `select u.id, coalesce(p.full_name, u.name) name, u.email, p.role, u.banned, u."banReason" ban_reason, u."createdAt" created_at,
       (select count(*)::int from reports r where r.reporter_user_id = u.id) reports
     from neon_auth."user" u left join profiles p on p.user_id = u.id
     where ($1 = '' or u.email ilike '%' || $1 || '%' or u.name ilike '%' || $1 || '%' or p.full_name ilike '%' || $1 || '%')
       and ($2 = '' or ($2 = 'staff' and p.role in ('editor','admin','super_admin')) or coalesce(p.role, 'reporter') = $2)
     order by case p.role when 'super_admin' then 0 when 'admin' then 1 when 'editor' then 2 else 3 end, u."createdAt" desc limit 500`,
    [q, roleFilter],
  );
  const canManage = v.role === "super_admin";
  const tabs = [{ id: "", label: "Everyone" }, { id: "staff", label: "Staff" }, { id: "reporter", label: "Reporters" }];
  return (
    <>
      <PageTitle
        title="People"
        sub={canManage ? "Add staff, change roles, suspend or remove accounts, and reset passwords." : "Only a super admin can manage people. You can see who has access."}
        actions={canManage ? <AddPerson /> : null}
      />
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <div className="panel flex gap-1 p-1">
          {tabs.map((t) => (
            <a key={t.id} href={`/admin/people${t.id ? `?role=${t.id}` : ""}`} className={cn("rounded-md px-3 py-1.5 text-[13px]", roleFilter === t.id ? "bg-[var(--d-active)] font-semibold" : "muted hover:bg-[var(--d-hover)]")}>{t.label}</a>
          ))}
        </div>
        <form className="ml-auto flex gap-2">
          {roleFilter ? <input type="hidden" name="role" value={roleFilter} /> : null}
          <input name="q" defaultValue={q} placeholder="Search name or email" className="input !w-64" />
          <button className="btn btn-ghost">Search</button>
        </form>
      </div>
      <div className="panel overflow-x-auto">
        {rows.length ? (
          <table className="w-full min-w-[760px] text-sm">
            <thead className="hairline border-b"><tr>{["Person", "Access", "Status", "Reports", "Joined"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="hairline border-b last:border-0">
                  <td className="px-4 py-3"><p className="font-semibold">{p.name || "No name"}</p><p className="faint text-xs">{p.email}</p></td>
                  <td className="px-4 py-3"><PersonActions id={p.id} name={p.name || p.email} role={p.role ?? "reporter"} banned={!!p.banned} canManage={canManage} isSelf={p.id === v.id} /></td>
                  <td className="px-4 py-3">{p.banned ? <span title={p.ban_reason ?? ""}><Pill tone="red">Suspended</Pill></span> : <Pill tone="green">Active</Pill>}</td>
                  <td className="muted px-4 py-3 tabular-nums">{p.reports}</td>
                  <td className="muted px-4 py-3">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <Empty icon={Users} title="No one found" body="Try another search." />}
      </div>
    </>
  );
}
