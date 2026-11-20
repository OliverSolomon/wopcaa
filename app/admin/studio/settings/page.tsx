import { requireStaff } from "@/lib/session";
import { one } from "@/lib/db";
import { DEFAULT_SETTINGS, type SiteSettings } from "@/lib/content/schema";
import { SettingsEditor } from "@/components/studio/settings-editor";

export const metadata = { title: "Settings · Studio" };

export default async function Settings() {
  await requireStaff();
  const row = await one<{ data: Partial<SiteSettings> }>("select data from site_settings where id = 'site'");
  return <SettingsEditor initial={{ ...DEFAULT_SETTINGS, ...(row?.data ?? {}) }} />;
}
