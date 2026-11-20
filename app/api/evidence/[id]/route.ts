import { one } from "@/lib/db";
import { getViewer, isCaseTeam, audit } from "@/lib/session";
import { signDownload } from "@/lib/storage";

/** Case team only: a two-minute signed link to one attachment, logged. */
export async function GET(_req: Request, ctx: RouteContext<"/api/evidence/[id]">) {
  const viewer = await getViewer();
  if (!viewer || !isCaseTeam(viewer.role)) return new Response("Not allowed", { status: 403 });
  const { id } = await ctx.params;
  const file = await one<{ object_key: string; file_name: string; report_id: string }>("select object_key, file_name, report_id from report_attachments where id = $1", [id]);
  if (!file) return new Response("Not found", { status: 404 });
  await audit(viewer.id, "evidence.download", file.report_id, { attachment: id });
  return Response.redirect(await signDownload("evidence", file.object_key, file.file_name), 302);
}
