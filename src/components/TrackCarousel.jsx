import { usePlayer } from "./PlayerContext";
import { useFeelTracks } from "../hooks/useFeelTracks";

function TrackCard({ t, onPlay }) {
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
        <img src={t.coverUrl} alt={t.title} className="w-full h-full object-cover" />
      </div>
      <div className="mt-2">
        <p className="text-sm text-[#0A84FF] truncate">{t.title}</p>
        <p className="text-xs text-[#0A84FF] truncate">{t.artist}</p>
      </div>
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
  const { items, loading, error } = useFeelTracks(feel, { limit });

  return (
    <section className="mt-8">
      {title && <h2 className="text-2xl font-exo font-light text-[#0A84FF] mb-3">{title}</h2>}

      {loading && <p className="text-gray-400">Cargando…</p>}
      {error && <p className="text-red-400">{error}</p>}

      {!loading && !error && items.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory [scrollbar-width:none] [-ms-overflow-style:none]">
          <style>{`.overflow-x-auto::-webkit-scrollbar{display:none}`}</style>
          {items.map((t) => (
            <div key={t._id} className="snap-start">
              <TrackCard t={t} onPlay={playTrack} />
            </div>
          ))}
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <p className="text-gray-400">{emptyText}</p>
      )}
    </section>
  );
}