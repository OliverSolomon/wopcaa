export function DashLoading() {
  return (
    <div className="animate-pulse space-y-6" aria-busy>
      <div className="h-9 w-64 rounded-lg bg-[var(--d-hover)]" />
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => <div key={i} className="panel h-28" />)}
      </div>
      <div className="panel h-80" />
    </div>
  );
}
