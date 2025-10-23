export default function SkeletonGrid({ rows = 2, cols = 6 }) {
  const n = rows * cols;
  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-3">
      {Array.from({ length: n }).map((_, i) => (
        <div key={i} className="rounded-xl bg-[#1C1C1C] p-2 animate-pulse">
          <div className="aspect-square rounded-lg bg-white/10" />
          <div className="mt-2 h-4 rounded bg-white/10" />
          <div className="mt-1 h-3 w-2/3 rounded bg-white/10" />
        </div>
      ))}
    </div>
  );
}
