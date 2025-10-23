export default function SkeletonCarousel({ title = "Loading…" }) {
  return (
    <div className="p-4">
      <div className="h-6 w-48 rounded bg-[#0A84FF]/20 mb-3 animate-pulse" />
      <div className="flex gap-3 overflow-hidden">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="w-36 h-36 rounded-xl bg-[#0A84FF]/10 animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

