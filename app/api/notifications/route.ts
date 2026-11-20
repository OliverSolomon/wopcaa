import { getViewer } from "@/lib/session";
import { one, query } from "@/lib/db";

export async function GET() {
  const v = await getViewer();
  if (!v) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const [items, count] = await Promise.all([
    query("select id, title, body, link, read_at, created_at from notifications where user_id = $1 order by created_at desc limit 15", [v.id]),
    one<{ n: number }>("select count(*)::int as n from notifications where user_id = $1 and read_at is null", [v.id]),
  ]);
  return Response.json({ items, unread: count?.n ?? 0 }, { headers: { "Cache-Control": "private, no-store" } });
}

export async function POST(req: Request) {
  const v = await getViewer();
  if (!v) return Response.json({ error: "Unauthorized" }, { status: 401 });
  const body = (await req.json().catch(() => ({}))) as { id?: string; all?: boolean };
  if (body.all) await query("update notifications set read_at = now() where user_id = $1 and read_at is null", [v.id]);
  else if (body.id) await query("update notifications set read_at = now() where id = $1 and user_id = $2", [body.id, v.id]);
  return Response.json({ ok: true });
}
