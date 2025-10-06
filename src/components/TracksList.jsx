// TracksList.jsx
import { useEffect, useRef, useState, useMemo, useCallback } from "react";

// LQIP (Cloudinary) helper
const clBlur = (url) =>
  url && url.includes("/upload/")
    ? url.replace("/upload/", "/upload/e_blur:200,q_10/")
    : url;

const Cover = ({ url, alt }) => {
  const low = clBlur(url);
  return (
    <div className="relative w-12 h-12 rounded-md overflow-hidden bg-black/40">
      <img
        src={low || url || "/placeholder-cover.png"}
        alt={alt}
        className="absolute inset-0 w-full h-full object-cover opacity-100"
        aria-hidden
        width={48}
        height={48}
      />
      {url && (
        <img
          src={url}
          alt={alt}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-200"
          onLoad={(e) => { e.currentTarget.style.opacity = 1; }}
          onError={(e) => { e.currentTarget.remove(); }}
          width={48}
          height={48}
        />
      )}
    </div>
  );
};

// util
const toMMSS = (s) => {
  const n = Math.max(0, Math.floor(Number(s) || 0));
  const m = Math.floor(n / 60);
  const r = String(n % 60).padStart(2, "0");
  return `${m}:${r}`;
};
const toAbs = (p, base =
  import.meta.env.VITE_MEDIA_BASE_URL ||
  import.meta.env.VITE_API_URL ||
  "http://localhost:4000/api"
) => (!p ? "" : /^https?:\/\//i.test(p) ? p : (()=>{ try { return new URL(p, base).href; } catch { return p; }})());

// Fila
const Row = ({ track, isActive, isPlaying, onPlayToggle }) => {
  const src = toAbs(track.coverUrl || track.cover || track.image);
  const handleKey = (e) => {
    if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onPlayToggle(); }
  };
  return (
    <div
      className={`grid grid-cols-[48px,1fr,1fr,88px] gap-4 items-center px-3 h-14 rounded-md
                  hover:bg-white/5 focus-within:bg-white/5 transition-colors ${
                    isActive ? "bg-[rgba(29,240,216,0.08)]" : ""
                  }`}
      role="button"
      tabIndex={0}
      onKeyDown={handleKey}
      onDoubleClick={onPlayToggle}
      onClick={(e) => {
        // en pantallas táctiles un toque hace play/pause
        const pointer = e?.nativeEvent?.pointerType;
        const touchLike = pointer === "touch" || pointer === "pen";
        if (touchLike) onPlayToggle();
      }}
    >
      <div className={`relative ${isActive ? "ring-2 ring-[#0A84FF] rounded-md" : ""}`}>
        <Cover url={src} alt={track.title} />
        <button
          type="button"
          aria-label={isActive ? (isPlaying ? "Pausar" : "Reanudar") : "Reproducir"}
          onClick={(e) => { e.stopPropagation(); onPlayToggle(); }}
          className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity outline-none"
        >
          <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/90 shadow">
            {isActive && isPlaying ? (
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <rect x="6" y="5" width="4" height="14" /><rect x="14" y="5" width="4" height="14" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                <path d="M8 5v14l11-7z" />
              </svg>
            )}
          </span>
        </button>
      </div>

      <div className="truncate text-[#0A84FF]">{track.title}</div>
      <div className="truncate text-[#0A84FF]/90">{track.artist}</div>
      <div className="text-right tabular-nums text-[#0A84FF]/80">{toMMSS(track.duration)}</div>
    </div>
  );
};

/**
 * TracksList
 * Props:
 *  - rows: array de canciones
 *  - loading: boolean
 *  - currentTrack, isPlaying
 *  - onPlayRow(row) → reproduce/pausa
 *
 * Hace cross-fade entre datasets para que nunca se vea “por detrás”.
 */
export default function TracksList({ rows = [], loading, currentTrack, isPlaying, onPlayRow, togglePlay }) {
  const [viewRows, setViewRows] = useState(rows);
  const [prevRows, setPrevRows] = useState(null);
  const [fading, setFading] = useState(false);

  // cuando cambia rows externamente, cross-fade
  useEffect(() => {
    // primera vez: pinta directo
    if (!viewRows?.length && rows?.length && !loading) {
      setViewRows(rows);
      return;
    }
    if (rows === viewRows) return;

    setPrevRows(viewRows);
    setViewRows(rows);
    setFading(true);
    const t = setTimeout(() => setFading(false), 180); // duración del fade
    return () => clearTimeout(t);
  }, [rows, loading]); // eslint-disable-line

  const renderLayer = useCallback((data, extra = "") => (
    <div className={`space-y-2 ${extra}`}>
      {data.map((track) => {
        const isActive = currentTrack && toAbs(track.audioUrl) === currentTrack.audioPath;
        return (
          <Row
            key={track._id || track.id || `${track.title}-${track.artist}`}
            track={track}
            isActive={!!isActive}
            isPlaying={isActive && isPlaying}
            onPlayToggle={() => {
              if (isActive && typeof togglePlay === "function") togglePlay();
              else onPlayRow(track);
            }}
          />
        );
      })}
    </div>
  ), [currentTrack, isPlaying, onPlayRow, togglePlay]);

  return (
    <div className="relative">
      {/* capa anterior (se desvanece) */}
      {prevRows && fading && (
        <div className="absolute inset-0 pointer-events-none opacity-100 transition-opacity duration-200">
          {renderLayer(prevRows)}
        </div>
      )}

      {/* capa actual */}
      <div className={fading ? "opacity-0 transition-opacity duration-200" : "opacity-100 transition-opacity duration-200"}>
        {renderLayer(viewRows)}
      </div>

      {/* overlay de carga: tapa todo mientras loading */}
      {loading && (
        <div className="absolute inset-0 rounded-md bg-black/90 z-20 pointer-events-none">
          <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {Array.from({ length: 9 }).map((_, i) => (
              <div key={i} className="h-14 rounded-lg bg-white/10 animate-pulse" />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
