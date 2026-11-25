export default function ExploreLoading() {
  return (
    <div className="flex h-[60vh] items-center justify-center">
      <div className="flex flex-col items-center gap-3 text-muted">
        <span className="h-2 w-2 animate-pulse rounded-full bg-accent" />
        <span className="text-sm">Loading the session…</span>
      </div>
    </div>
  );
}
