import { useEffect, useMemo, useState, useCallback } from "react";
import { useParams, Navigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import { usePlayer } from "./PlayerContext";
import api from "../api/axios";

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

const BRAND_GRADIENT_3 = "bg-[linear-gradient(90deg,_#001020_0%,_#003366_25%,_#0A84FF_50%,_#003366_75%,_#001020_100%)]";
export const HEADER_CLASS = { Rock:BRAND_GRADIENT_3, Pop:BRAND_GRADIENT_3, Blues:BRAND_GRADIENT_3, Classic:BRAND_GRADIENT_3, Dubstep:BRAND_GRADIENT_3, Electro:BRAND_GRADIENT_3, HipHop:BRAND_GRADIENT_3, Reggae:BRAND_GRADIENT_3, House:BRAND_GRADIENT_3, Jazz:BRAND_GRADIENT_3 };

const toMMSS = (s) => { const n = Math.max(0, Math.floor(Number(s)||0)); const m = Math.floor(n/60); const r = String(n%60).padStart(2,"0"); return `${m}:${r}`; };
const toAbs = (p, base = import.meta.env.VITE_MEDIA_BASE_URL || import.meta.env.VITE_API_URL || "http://localhost:4000/api") => (!p ? "" : /^https?:\/\//i.test(p) ? p : (()=>{ try { return new URL(p, base).href; } catch { return p; }})());


const isCoarsePointer = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(pointer: coarse)")?.matches ||
    navigator.maxTouchPoints > 0
  );
};

export const GenreCard = () => {
  const { slug } = useParams();
  const genre = SLUG_TO_GENRE[slug];
  if (!genre) return <Navigate to="/" replace />;

  const { playTrack, currentTrack, togglePlay, isPlaying } = usePlayer();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);

  const handlePlayRow = useCallback((row) => {
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
}, [playTrack, genre]);

  const columns = useMemo(() => ([
    {
      name: "",
      cell: (row) => {
        const src = toAbs(row.coverUrl || row.cover || row.image);
        const isActive = currentTrack && toAbs(row.audioUrl) === currentTrack.audioPath;

        const onClick = (e) => {
          e.stopPropagation();
          if (isActive && typeof togglePlay === "function") togglePlay();
          else handlePlayRow(row);
        };
        const onKeyDown = (e) => { if (e.key === "Enter" || e.key === " ") { e.preventDefault(); onClick(e); } };

        return (
          <div className={`relative w-12 h-12 rounded-md overflow-hidden ${isActive ? "ring-2 ring-[#0A84FF]" : ""}`}>
            <img src={src} alt={row.title} className="w-full h-full object-cover" loading="lazy"
                 onError={(e) => { e.currentTarget.src = "/placeholder-cover.png"; }} />
            <button type="button" aria-label={isActive ? (isPlaying ? "Pausar" : "Reanudar") : "Reproducir"}
                    onClick={onClick} onKeyDown={onKeyDown}
                    className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity outline-none">
              <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/90 shadow">
                {isActive && isPlaying ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><rect x="6" y="5" width="4" height="14"/><rect x="14" y="5" width="4" height="14"/></svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true"><path d="M8 5v14l11-7z"/></svg>
                )}
              </span>
            </button>
          </div>
        );
      },
      width: "64px",        // ✅ OK
      // ❌ nada de allowOverflow / button
    },
    { name: "Title", selector: r => r.title },
    { name: "Artist", selector: r => r.artist },
    {
      name: "Duration",
      selector: r => r.duration,
      cell: r => <div className="w-[120px] text-right tabular-nums">{toMMSS(r.duration)}</div>, // ✅ sin right/maxWidth
    },
  ]), [currentTrack, isPlaying, togglePlay, handlePlayRow]);

  useEffect(() => {
    let ignore = false;
    (async () => {
      const cacheKey = `tracks:${genre}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) setRows(JSON.parse(cached));

      try {
        setLoading(true);
        const { data } = await api.get("/tracks", { params: { genre } });
        const items = data?.items ?? [];
        sessionStorage.setItem(cacheKey, JSON.stringify(items));
        if (!ignore) setRows(items);
      } finally {
        if (!ignore) { setLoading(false); setFirstLoad(false); }
      }
    })();
    return () => { ignore = true; };
  }, [genre]);

  const customStyles = {
    table: { style: { backgroundColor: "#000" } },
    headRow: { style: { backgroundColor: "#000", borderBottom: "1px solid rgba(255,255,255,0.25)" } },
    rows:   { style: { backgroundColor: "#000", borderBottom: "1px solid rgba(255,255,255,0.18)" },
              highlightOnHoverStyle: { backgroundColor: "rgba(29,240,216,0.08)" } },
    headCells: { style: { color: "#0A84FF", fontWeight: 700 } },
    cells:     { style: { color: "#0A84FF" } },
  };

  const conditionalRowStyles = [
    { when: (r) => currentTrack && toAbs(r.audioUrl) === currentTrack.audioPath,
      style: { backgroundColor: "rgba(29, 240, 216, 0.08)" } },
  ];

  return (
    <>
      <div className={`bg-gradient-to-b ${HEADER_CLASS[genre] ?? "from-gray-700 to-gray-900"} w-full h-[100px] p-6 rounded-lg flex items-end`}>
        <h2 className="text-5xl">{genre}</h2>
      </div>
      <div className="mt-6">
        <DataTable
  columns={columns}
  data={rows}
  customStyles={customStyles}
  progressPending={firstLoad && loading}
  persistTableHead
  dense
  pointerOnHover
  highlightOnHover
  conditionalRowStyles={conditionalRowStyles}

  // desktop: doble click para reproducir
  onRowDoubleClicked={handlePlayRow}

  // móvil: un toque en cualquier punto de la fila reproduce
  onRowClicked={(row, e) => {
    const pointer = e?.nativeEvent?.pointerType;
    const touchLike = pointer === "touch" || pointer === "pen" || isCoarsePointer();

    if (touchLike) {
      const isActive = currentTrack && toAbs(row.audioUrl) === currentTrack.audioPath;
      if (isActive && typeof togglePlay === "function") {
        togglePlay();           // si ya es la pista activa, alterna play/pause
      } else {
        handlePlayRow(row);     // si no, empieza a reproducirla
      }
    } else if (e?.detail >= 2) {
      // en desktop mantenemos doble click (por si alguien hace doble click rápido)
      handlePlayRow(row);
    }
  }}
/>
        {!firstLoad && loading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/40 animate-pulse pointer-events-none rounded-md" />
        )}
      </div>
    </>
  );
};
