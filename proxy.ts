import type { NextRequest } from "next/server";
import { auth } from "@/lib/auth/server";

/**
 * Only the dashboards need a session. Signed-out visitors are sent to sign-in;
 * roles are checked again on every page and action, close to the data.
 */
let guard: ReturnType<typeof auth.middleware> | null = null;

export default function proxy(request: NextRequest) {
  guard ??= auth.middleware({ loginUrl: "/sign-in" });
  return guard(request);
}

export const config = {
  matcher: ["/admin/:path*", "/account/:path*", "/preview/:path*"],
};
