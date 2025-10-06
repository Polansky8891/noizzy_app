import { useEffect, useState, useCallback, memo } from "react";
import { useParams, Navigate } from "react-router-dom";
import { usePlayer } from "./PlayerContext";
import api from "../api/axios";

/* ───────────────────────────── utils ───────────────────────────── */

const SLUG_TO_GENRE = {
  rock: "Rock",
  pop: "Pop",
  blues: "Blues",
  classic: "Classical",
  dubstep: "Dubstep",
  electro: "Electro",
  hiphop: "Hip-Hop",
  reggae: "Reggae",
  house: "House",
};

const BRAND_GRADIENT_3 =
  "bg-[linear-gradient(90deg,_#001020_0%,_#003366_25%,_#0A84FF_50%,_#003366_75%,_#001020_100%)]";
export const HEADER_CLASS = Object.fromEntries(
  Object.values(SLUG_TO_GENRE).map((g) => [g, BRAND_GRADIENT_3])
);

// Absolutiza rutas relativas contra tu base (API o media)
const toAbs = (
  p,
  base =
    import.meta.env.VITE_MEDIA_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:4000/api"
) =>
  !p
    ? ""
    : /^https?:\/\//i.test(p)
    ? p
    : (() => { try { return new URL(p, base).href; } catch { return p; } })();

/* Cloudinary thumbs (48x48). Variante ÚNICA ultra ligera para cache 1:1 */
const withCloudinaryTransforms = (url, t) =>
  url && url.includes("/upload/") ? url.replace("/upload/", `/upload/${t}/`) : url || "";

// 🔴 dpr fijo (1), calidad baja para velocidad y misma URL siempre
const CL_THUMB = (url) =>
  withCloudinaryTransforms(
    url,
    "c_fill,w_48,h_48,f_auto,q_auto:low,dpr_1,e_sharpen:40"
  );

/* Orden estable + comparación NORMALIZADA para evitar updates fantasma */
const stableSort = (arr = []) =>
  [...arr].sort((a, b) => String(a._id || a.id).localeCompare(String(b._id || b.id)));

const normalizeRow = (r) => ({
  id: String(r._id || r.id || ""),
  title: String(r.title || ""),
  artist: String(r.artist || ""),
  audio: toAbs(r.audioUrl || ""),
  cover: toAbs(r.coverUrl || r.cover || r.image || ""),
});
const sameList = (a, b) => {
  if (!Array.isArray(a) || !Array.isArray(b)) return false;
  if (a.length !== b.length) return false;
  for (let i = 0; i < a.length; i++) {
    const A = normalizeRow(a[i]);
    const B = normalizeRow(b[i]);
    if (
      A.id !== B.id ||
      A.title !== B.title ||
      A.artist !== B.artist ||
      A.audio !== B.audio ||
      A.cover !== B.cover
    ) return false;
  }
  return true;
};

/* ───────────────── Celdas/Fila MEMO (sin transiciones) ───────────────── */

const CoverImg = memo(function CoverImg({ src, isActive, onClick, title, priority }) {
  const thumb = CL_THUMB(src);
  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={isActive ? "Pausar/Reanudar" : "Reproducir"}
      className="relative w-12 h-12 rounded-md overflow-hidden block bg-[#111]"
      title={title}
      style={{ boxShadow: isActive ? "0 0 0 2px #0A84FF inset" : "none" }}
    >
      <img
        src={thumb || src || "/placeholder-cover.png"}
        alt={title || "cover"}
        width={48}
        height={48}
        loading={priority ? "eager" : "lazy"}
        fetchpriority={priority ? "high" : "auto"}
        decoding="async"
        draggable={false}
        className="w-full h-full object-cover block"
      />
    </button>
  );
}, (a, b) =>
  a.src === b.src && a.isActive === b.isActive && a.onClick === b.onClick && a.title === b.title && a.priority === b.priority
);

const TitleCell = memo(
  ({ title, isActive }) => (
    <div className={`pr-2 whitespace-normal break-words leading-snug${isActive ? " text-[#E0FFFF]" : ""}`}>
      {title}
    </div>
  ),
  (a, b) => a.title === b.title && a.isActive === b.isActive
);

const ArtistCell = memo(
  ({ artist }) => (
    <div className="pr-2 whitespace-normal break-words leading-snug text-neutral-300">
      {artist}
    </div>
  ),
  (a, b) => a.artist === b.artist
);

const RowItem = memo(function RowItem({ row, activeAudio, onPlay, onToggle, priority }) {
  const n = normalizeRow(row);
  const isActive = !!activeAudio && n.audio === activeAudio;

  const onClickCover = (e) => {
    e.stopPropagation();
    if (isActive && typeof onToggle === "function") onToggle();
    else onPlay(row);
  };

  return (
    <div
      className="grid grid-cols-[64px_minmax(0,1fr)_minmax(0,1fr)] gap-3 items-start px-3 py-2 border-b border-white/20 bg-black"
      role="row"
    >
      <div role="gridcell">
        <CoverImg src={n.cover} isActive={isActive} onClick={onClickCover} title={n.title} priority={priority} />
      </div>
      <div role="gridcell">
        <TitleCell title={n.title} isActive={isActive} />
      </div>
      <div role="gridcell">
        <ArtistCell artist={n.artist} />
      </div>
    </div>
  );
}, (a, b) => {
  const A = normalizeRow(a.row);
  const B = normalizeRow(b.row);
  const activeA = !!a.activeAudio && A.audio === a.activeAudio;
  const activeB = !!b.activeAudio && B.audio === b.activeAudio;
  return (
    activeA === activeB &&
    A.id === B.id &&
    A.title === B.title &&
    A.artist === B.artist &&
    A.cover === B.cover &&
    a.priority === b.priority
  );
});

/* ─────────────────────────── componente ────────────────────────── */

export const GenreCard = () => {
  const { slug } = useParams();
  const genre = SLUG_TO_GENRE[slug];
  if (!genre) return <Navigate to="/" replace />;

  const { playTrack, currentTrack, togglePlay } = usePlayer();

  const [rows, setRows] = useState([]);

  const handlePlayRow = useCallback(
    (row) => {
      const audioPath = toAbs(row.audioUrl);
      if (!audioPath) return;
      playTrack({
        id: row._id || row.id,
        title: row.title,
        artist: row.artist,
        audioPath,
        genre,
        cover: toAbs(row.coverUrl) || row.cover || row.image || null,
      });
    },
    [playTrack, genre]
  );

  // Monta instantáneo con cache; actualiza SOLO si cambia realmente
  useEffect(() => {
    let ignore = false;
    const ac = new AbortController();

    const cacheKey = `tracks:${genre}`;
    const cachedRaw = sessionStorage.getItem(cacheKey);
    if (cachedRaw) {
      try {
        const cached = stableSort(JSON.parse(cachedRaw) || []);
        if (!ignore) setRows(cached);
      } catch {}
    } else {
      setRows([]);
    }

    (async () => {
      try {
        const { data } = await api.get("/tracks", {
          params: { genre },
          signal: ac.signal,
        });
        const items = stableSort(data?.items ?? []);
        if (ignore) return;

        const prev = cachedRaw ? stableSort(JSON.parse(cachedRaw) || []) : rows;
        if (!sameList(items, prev)) {
          sessionStorage.setItem(cacheKey, JSON.stringify(items));
          setRows(items);
        }
      } catch {/* silencioso */}
    })();

    return () => { ignore = true; ac.abort(); };
  }, [genre]);

  const activeAudio = currentTrack?.audioPath || "";

  // Priorizamos solo lo visible (primeras N filas)
  const ROW_H = 56;
  const visibleCount =
    typeof window !== "undefined" ? Math.max(6, Math.ceil(window.innerHeight / ROW_H)) : 8;

  return (
    <>
      <div
        className={`bg-gradient-to-b ${HEADER_CLASS[genre] ?? "from-gray-700 to-gray-900"} w-full h-[100px] p-6 rounded-lg flex items-end`}
      >
        <h2 className="text-5xl">{genre}</h2>
      </div>

      <div className="mt-6 w-full rounded-md overflow-hidden bg-black">
        {/* Cabecera (sin Cover y sin Duration) */}
        <div
          role="row"
          className="grid grid-cols-[64px_minmax(0,1fr)_minmax(0,1fr)] gap-3 px-3 h-[40px] items-center border-b border-white/25 bg-black"
        >
          <div />
          <div className="text-[#0A84FF] text-sm font-semibold">Title</div>
          <div className="text-[#0A84FF] text-sm font-semibold">Artist</div>
        </div>

        {/* Filas */}
        <div role="rowgroup">
          {rows.map((row, i) => (
            <RowItem
              key={row._id || row.id}
              row={row}
              activeAudio={activeAudio}
              onPlay={handlePlayRow}
              onToggle={togglePlay}
              priority={i < visibleCount}   // 👈 alta prioridad para lo visible
            />
          ))}
          {rows.length === 0 && (
            <div className="py-8 text-center text-[#0A84FF]">Sin canciones todavía</div>
          )}
        </div>
      </div>
    </>
  );
};
