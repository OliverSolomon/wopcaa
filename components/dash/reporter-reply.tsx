"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { Loader2, Send } from "lucide-react";
import { replyAsReporter } from "@/app/actions/reports";

export function ReporterReply({ id }: { id: string }) {
  const [text, setText] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, start] = useTransition();
  const router = useRouter();
  return (
    <div className="hairline mt-6 border-t pt-5">
      <textarea rows={3} value={text} onChange={(e) => setText(e.target.value)} className="input" placeholder="Write to the case team…" />
      {error ? <p className="mt-2 text-xs text-[var(--d-ochre)]">{error}</p> : null}
      <div className="mt-3 flex justify-end">
        <button
          disabled={pending || text.trim().length < 2}
          onClick={() => start(async () => {
            setError(null);
            const r = await replyAsReporter(id, text);
            if (r.ok) { setText(""); router.refresh(); } else setError(r.error ?? "Could not send.");
          })}
          className="btn btn-primary"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Send className="size-4" />} Send
        </button>
      </div>
    </div>
  );
}
