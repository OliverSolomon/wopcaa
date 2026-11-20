import { getViewer, isStaff } from "@/lib/session";

/** After sign-in: staff land on the admin dashboard, everyone else on their own. */
export async function GET(req: Request) {
  const v = await getViewer();
  const to = !v ? "/sign-in" : isStaff(v.role) ? "/admin" : "/account";
  return Response.redirect(new URL(to, req.url), 303);
}
