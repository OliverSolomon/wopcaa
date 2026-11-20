import { Users } from "lucide-react";
import { requireCaseTeam } from "@/lib/session";
import { query } from "@/lib/db";
import { formatDate } from "@/lib/utils";
import { PageTitle, Empty } from "@/components/dash/ui";
import { RoleSelect } from "@/components/dash/small-actions";

export const metadata = { title: "People" };

export default async function People({ searchParams }: PageProps<"/admin/people">) {
  const v = await requireCaseTeam();
  const q = typeof (await searchParams).q === "string" ? ((await searchParams).q as string).trim() : "";
  const rows = await query<{ id: string; name: string | null; email: string; role: string | null; created_at: string; reports: number }>(
    `select u.id, coalesce(p.full_name, u.name) name, u.email, p.role, u."createdAt" created_at,
       (select count(*)::int from reports r where r.reporter_user_id = u.id) reports
     from neon_auth."user" u left join profiles p on p.user_id = u.id
     where ($1 = '' or u.email ilike '%' || $1 || '%' or u.name ilike '%' || $1 || '%')
     order by case p.role when 'super_admin' then 0 when 'admin' then 1 when 'editor' then 2 else 3 end, u."createdAt" desc limit 300`,
    [q],
  );
  const canEdit = v.role === "super_admin";
  return (
    <>
      <PageTitle title="People" sub={canEdit ? "Give staff access by changing their role. Reporters only see their own reports." : "Only a super admin can change roles."} />
      <form className="mb-4 flex max-w-sm gap-2"><input name="q" defaultValue={q} placeholder="Search name or email" className="input" /><button className="btn btn-ghost">Search</button></form>
      <div className="panel overflow-x-auto">
        {rows.length ? (
          <table className="w-full min-w-[700px] text-sm">
            <thead className="hairline border-b"><tr>{["Person", "Role", "Reports", "Joined"].map((h) => <th key={h} className="px-4 py-3">{h}</th>)}</tr></thead>
            <tbody>
              {rows.map((p) => (
                <tr key={p.id} className="hairline border-b last:border-0">
                  <td className="px-4 py-3"><p className="font-medium">{p.name || "—"}</p><p className="faint text-xs">{p.email}</p></td>
                  <td className="px-4 py-3"><RoleSelect userId={p.id} role={p.role ?? "reporter"} disabled={!canEdit || p.id === v.id} /></td>
                  <td className="muted px-4 py-3 tabular-nums">{p.reports}</td>
                  <td className="muted px-4 py-3">{formatDate(p.created_at)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        ) : <Empty icon={Users} title="No people found" />}
      </div>
    </>
  );
}
