import { cn, formatDate } from "@/lib/utils";

export type ThreadItem = { id: string; body: string; author_kind: string; kind: string; created_at: string; author_name?: string | null };

/** The conversation on a report. `side` decides whose messages sit on the right. */
export function Thread({ items, side, dash }: { items: ThreadItem[]; side: "reporter" | "admin"; dash?: boolean }) {
  return (
    <ol className="grid gap-4">
      {items.map((m) => {
        if (m.kind === "status" || m.kind === "assignment" || m.author_kind === "system") {
          return (
            <li key={m.id} className={cn("flex items-center gap-3 text-xs", dash ? "faint" : "text-slate-soft")}>
              <span className={cn("h-px flex-1", dash ? "bg-[var(--d-border)]" : "bg-forest/10")} />
              <span className="max-w-[70%] text-center">{m.body} · {formatDate(m.created_at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}</span>
              <span className={cn("h-px flex-1", dash ? "bg-[var(--d-border)]" : "bg-forest/10")} />
            </li>
          );
        }
        const mine = m.author_kind === side;
        const note = m.kind === "note";
        return (
          <li key={m.id} className={cn("flex", mine ? "justify-end" : "justify-start")}>
            <div className={cn(
              "max-w-[85%] rounded-2xl px-4 py-3",
              note ? "border border-dashed border-[var(--d-ochre)] bg-[var(--d-ochre-soft)]" :
              dash ? (mine ? "bg-[var(--d-accent)] text-[var(--d-panel)]" : "bg-[var(--d-panel-2)] border border-[var(--d-border)]") :
              mine ? "bg-forest text-mist" : "bg-white",
            )}>
              <p className={cn("mb-1 text-[11px] font-semibold opacity-70")}>
                {note ? "Internal note · " : ""}{m.author_kind === "admin" ? (m.author_name || "Case team") : side === "reporter" ? "You" : "Reporter"}
                {" · "}{formatDate(m.created_at, { day: "numeric", month: "short", hour: "numeric", minute: "2-digit" })}
              </p>
              <p className="whitespace-pre-wrap text-[14.5px] leading-relaxed">{m.body}</p>
            </div>
          </li>
        );
      })}
    </ol>
  );
}
