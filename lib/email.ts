import "server-only";

/**
 * Optional email through Resend's HTTP API. Without RESEND_API_KEY nothing is
 * sent and in-app notifications carry the alert on their own.
 */
export async function sendEmail({ to, subject, text }: { to: string; subject: string; text: string }) {
  const key = process.env.RESEND_API_KEY;
  if (!key) return false;
  try {
    const res = await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({ from: process.env.EMAIL_FROM ?? "WOPCAA <no-reply@wopcaa.org>", to, subject, text }),
    });
    if (!res.ok) console.error("[email]", res.status, await res.text());
    return res.ok;
  } catch (e) {
    console.error("[email]", (e as Error).message);
    return false;
  }
}
