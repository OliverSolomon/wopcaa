export default function Loading() {
  return (
    <div className="mx-auto max-w-[1400px] animate-pulse px-5 pt-44 md:px-8" aria-busy>
      <div className="h-3 w-32 rounded bg-line" />
      <div className="mt-8 h-20 w-3/4 rounded-2xl bg-line" />
      <div className="mt-14 aspect-[21/9] rounded-[28px] bg-line" />
    </div>
  );
}
