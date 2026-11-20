"use client";

import { useTransition } from "react";
import { Check, Loader2 } from "lucide-react";
import { markEnquiry } from "@/app/actions/admin";

export function MarkHandled({ id, handled }: { id: string; handled: boolean }) {
  const [pending, start] = useTransition();
  return (
    <button disabled={pending} onClick={() => start(async () => { await markEnquiry(id, !handled); })} className="btn btn-ghost self-start">
      {pending ? <Loader2 className="size-4 animate-spin" /> : <Check className="size-4" />} {handled ? "Reopen" : "Mark handled"}
    </button>
  );
}
