import { useEffect, useMemo, useRef, useState } from "react";
import { usePlayer } from "./PlayerContext";
import SmartImage from "./SmartImage";
import { useCachedTracks } from "../hooks/useCachedTracks";
import useDelayedVisible from "../hooks/useDelayedVisible";
import api from "../api/axios";

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
          priority={priority}
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
      <div className="aspect-square rounded-lg bg-white/10 animate-pulse" />
      <div className="mt-2 h-4 rounded bg白/10 animate-pulse" />
      <div className="mt-1 h-3 w-2/3 rounded bg-white/10 animate-pulse" />
    </div>
  );
}

export default function TrackCarousel({
  feel,
  title,
  limit = 18,
  emptyText = "No hay temas disponibles.",
  initialItems,
}) {
  const { playTrack } = usePlayer();

  // Seed para evitar parpadeo
  const hasSeed = Array.isArray(initialItems) && initialItems.length > 0;

  // Datos del hook (SWR-like)
  const { items: hookItems, loading: hookLoading } = useCachedTracks({ feel, limit });

  // Fallback: si el hook termina y viene vacío, probamos una vez fetch directo
  const [fallbackItems, setFallbackItems] = useState([]);
  const triedFallbackRef = useRef(false);

  useEffect(() => {
    if (!hookLoading && (!hookItems || hookItems.length === 0) && !triedFallbackRef.current) {
      triedFallbackRef.current = true;
      (async () => {
        try {
          const { data } = await api.get("/tracks", { params: { feel, limit } });
          const items = data?.items ?? [];
          if (items.length > 0) setFallbackItems(items);
        } catch {}
      })();
    }
  }, [hookLoading, hookItems, feel, limit]);

  // Qué mostramos: prioridad fallback > hook > seed
  const displayItems = useMemo(() => {
    if (fallbackItems.length > 0) return fallbackItems;
    if (hookItems && hookItems.length > 0) return hookItems;
    if (hasSeed) return initialItems;
    return [];
  }, [fallbackItems, hookItems, hasSeed, initialItems]);

  // Loading efectivo: con seed no mostramos skeleton
  const effectiveLoading = hasSeed ? false : hookLoading && displayItems.length === 0;
  const showSkeleton = useDelayedVisible(effectiveLoading, 220);

  return (
    <section className="mt-8">
      {title && (
        <h2 className="text-2xl font-exo font-light text-[#0A84FF] mb-3">
          {title}
        </h2>
      )}

      <div className="min-h-[11rem]">
        {showSkeleton ? (
          <div className="flex gap-3 overflow-x-hidden pb-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="snap-start">
                <SkeletonCard />
              </div>
            ))}
          </div>
        ) : (
          <div className="flex gap-3 overflow-x-auto pb-2 snap-x snap-mandatory transition-opacity duration-200 will-change-opacity [scrollbar-width:none] [-ms-overflow-style:none]">
            <style>{`.overflow-x-auto::-webkit-scrollbar{display:none}`}</style>
            {displayItems.map((t, i) => (
              <div key={(t && (t._id || t.id)) ?? i} className="snap-start">
                <TrackCard t={t} onPlay={playTrack} priority={i < 2} />
              </div>
            ))}
          </div>
        )}
      </div>

      {!effectiveLoading && displayItems.length === 0 && (
        <p className="text-gray-400">{emptyText}</p>
      )}
    </section>
  );
}
