import { requireUser } from "@/lib/session";
import { one } from "@/lib/db";
import { PageTitle } from "@/components/dash/ui";
import { ProfileForm } from "@/components/dash/profile-form";

export const metadata = { title: "Profile & safety" };

export default async function Profile() {
  const v = await requireUser("/account/profile");
  const p = await one<{ full_name: string | null; county: string | null }>("select full_name, county from profiles where user_id = $1", [v.id]);
  return (
    <>
      <PageTitle title="Profile & safety" sub="A nickname is fine. The case team sees this name on reports you make with this account." />
      <div className="grid gap-4 lg:grid-cols-3">
        <section className="panel p-6 lg:col-span-2"><ProfileForm name={p?.full_name ?? v.name} county={p?.county ?? ""} email={v.email} /></section>
        <section className="panel space-y-3 p-6 text-sm">
          <p className="font-semibold">Staying safe online</p>
          <p className="muted">If someone else uses this device, sign out when you finish and clear your browser history.</p>
          <p className="muted">On report pages, press <kbd className="rounded border px-1 text-xs">Esc</kbd> twice to leave the site instantly.</p>
          <p className="muted">Use an email address that only you can open.</p>
        </section>
      </div>
    </>
  );
}
