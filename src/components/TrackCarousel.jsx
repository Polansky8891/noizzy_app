import { usePlayer } from "./PlayerContext";
import SmartImage from "./SmartImage";                 // 👈 imagen optimizada (carruseles)
import { useCachedTracks } from "../hooks/useCachedTracks"; // 👈 cache SWR con Cache Storage

function TrackCard({ t, onPlay, priority }) {
  return (
    <div className="w-30 shrink-0 rounded-xl bg-[#1C1C1C] p-2 border border-transparent hover:border-[#0A84FF] transition">
      <div
        className="relative aspect-square rounded-lg overflow-hidden cursor-pointer"
        onClick={() => onPlay?.(t)}
        onKeyDown={(e) => (e.key === "Enter" || e.key === " ") && onPlay?.(t)}
        role="button"
        tabIndex={0}
        title={t.title}
      >
        <SmartImage
          src={t.coverUrl || t.cover || t.image}
          alt={t.title}
          ratio="1 / 1"
          widths={[160, 240, 320, 480]}
          sizes="160px"
          rounded="rounded-lg"
          className="bg-[#111]"
          priority={priority} // 🔥 das prioridad a las 2 primeras
        />
      </div>
      <div className="mt-2">
        <p className="text-sm text-[#0A84FF] truncate">{t.title}</p>
        <p className="text-xs text-[#0A84FF] truncate">{t.artist}</p>
      </div>
    </div>
  );
}

function SkeletonCard() {
  return (
    <div className="w-30 shrink-0 rounded-xl bg-[#1C1C1C] p-2">
      <div className="aspect-square rounded-lg bg-white/10" />
      <div className="mt-2 h-4 rounded bg-white/10" />
      <div className="mt-1 h-3 w-2/3 rounded bg-white/10" />
    </div>
  );
}

export default function TrackCarousel({
  feel,
  title,
  limit = 24,
  emptyText = "No hay temas disponibles.",
}) {
  const { playTrack } = usePlayer();

  // 👇 Cache Storage (SWR): pinta cache al instante, revalida en background
  const { items, loading } = useCachedTracks({ feel, limit });

  return (
    <section className="mt-8">
      {title && (
        <h2 className="text-2xl font-exo font-light text-[#0A84FF] mb-3">
          {title}
        </h2>
      )}

      <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none]">
        <style>{`.overflow-x-auto::-webkit-scrollbar{display:none}`}</style>

        {(loading && items.length === 0 ? Array.from({ length: 10 }) : items).map((t, i) => (
          <div key={(t && (t._id || t.id)) ?? i} className="snap-start">
            {loading && items.length === 0 ? (
              <SkeletonCard />
            ) : (
              <TrackCard
                t={t}
                onPlay={playTrack}   // ✅ igual que tenías (no rompemos tu Player)
                priority={i < 2}     // ✅ primeras dos imágenes con prioridad real
              />
            )}
          </div>
        ))}
      </div>

      {!loading && items.length === 0 && (
        <p className="text-gray-400">{emptyText}</p>
      )}
    </section>
  );
}
