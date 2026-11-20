"use client";

import { useEffect } from "react";
import { LogOut } from "lucide-react";

/**
 * Leaves the site at once for a neutral page and replaces this entry in the
 * history, so the back button does not return here. Also on Esc pressed twice.
 */
function leave() {
  try { sessionStorage.clear(); } catch {}
  window.open("https://www.google.com/search?q=weather", "_blank", "noopener");
  window.location.replace("https://www.google.com/search?q=weather");
}

export function QuickExit() {
  useEffect(() => {
    let last = 0;
    const on = (e: KeyboardEvent) => {
      if (e.key !== "Escape") return;
      const now = Date.now();
      if (now - last < 600) leave();
      last = now;
    };
    window.addEventListener("keydown", on);
    return () => window.removeEventListener("keydown", on);
  }, []);
  return (
    <button
      onClick={leave}
      className="fixed bottom-5 right-5 z-[60] inline-flex items-center gap-2 rounded-full bg-forest px-5 py-3 text-sm font-semibold text-white shadow-2xl ring-1 ring-white/10 transition hover:bg-black"
      title="Leave this site now (or press Esc twice)"
    >
      <LogOut className="size-4" /> Leave quickly
    </button>
  );
}
