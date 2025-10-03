import { useEffect, useMemo, useState, useCallback, useRef } from "react";
import { useParams, Navigate } from "react-router-dom";
import DataTable from "react-data-table-component";
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
  "bg-[linear-gradient(90deg,_#001020_0%,_#003366_25%,_#0A84FF_50%,_#003366_75%,_#001020_100%)]"; // (arreglado 003366)
export const HEADER_CLASS = {
  Rock: BRAND_GRADIENT_3,
  Pop: BRAND_GRADIENT_3,
  Blues: BRAND_GRADIENT_3,
  Classic: BRAND_GRADIENT_3,
  Dubstep: BRAND_GRADIENT_3,
  Electro: BRAND_GRADIENT_3,
  "Hip-Hop": BRAND_GRADIENT_3,
  Reggae: BRAND_GRADIENT_3,
  House: BRAND_GRADIENT_3,
  Jazz: BRAND_GRADIENT_3,
};

const toMMSS = (s) => {
  const n = Math.max(0, Math.floor(Number(s) || 0));
  const m = Math.floor(n / 60);
  const r = String(n % 60).padStart(2, "0");
  return `${m}:${r}`;
};
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
    : (() => {
        try {
          return new URL(p, base).href;
        } catch {
          return p;
        }
      })();

const isCoarsePointer = () => {
  if (typeof window === "undefined") return false;
  return (
    window.matchMedia?.("(pointer: coarse)")?.matches ||
    navigator.maxTouchPoints > 0
  );
};

/* LQIP (Cloudinary): capa borrosa instantánea + fade-in de la buena */
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
        width={48}
        height={48}
        className="absolute inset-0 w-full h-full object-cover opacity-100"
        aria-hidden
      />
      {url && (
        <img
          src={url}
          alt={alt}
          width={48}
          height={48}
          loading="lazy"
          decoding="async"
          className="absolute inset-0 w-full h-full object-cover opacity-0 transition-opacity duration-200"
          onLoad={(e) => {
            e.currentTarget.style.opacity = 1;
          }}
          onError={(e) => {
            e.currentTarget.remove(); // dejamos la borrosa/placeholder
          }}
        />
      )}
    </div>
  );
};

/* ─────────────────────────── componente ────────────────────────── */

export const GenreCard = () => {
  const { slug } = useParams();
  const genre = SLUG_TO_GENRE[slug];
  if (!genre) return <Navigate to="/" replace />;

  const { playTrack, currentTrack, togglePlay, isPlaying } = usePlayer();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);

  /* handler play */
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

  /* refs para tener columnas estables */
  const stateRef = useRef({ currentTrack: null, isPlaying: false });
  const handlersRef = useRef({ handlePlayRow: () => {}, togglePlay: () => {} });

  useEffect(() => {
    stateRef.current = { currentTrack, isPlaying };
    handlersRef.current = { handlePlayRow, togglePlay };
  }, [currentTrack, isPlaying, handlePlayRow, togglePlay]);

  /* columnas (deps vacías) */
  const columns = useMemo(
    () => [
      {
        name: "",
        width: "64px",
        cell: (row) => {
          const src = toAbs(row.coverUrl || row.cover || row.image);
          const { currentTrack, isPlaying } = stateRef.current;
          const { handlePlayRow, togglePlay } = handlersRef.current;

          const isActive =
            currentTrack && toAbs(row.audioUrl) === currentTrack.audioPath;

          const onClick = (e) => {
            e.stopPropagation();
            isActive && typeof togglePlay === "function"
              ? togglePlay()
              : handlePlayRow(row);
          };
          const onKeyDown = (e) => {
            if (e.key === "Enter" || e.key === " ") {
              e.preventDefault();
              onClick(e);
            }
          };

          return (
            <div
              className={`relative w-12 h-12 rounded-md overflow-hidden ${
                isActive ? "ring-2 ring-[#0A84FF]" : ""
              }`}
            >
              <Cover url={src} alt={row.title} />
              <button
                type="button"
                aria-label={
                  isActive ? (isPlaying ? "Pausar" : "Reanudar") : "Reproducir"
                }
                onClick={onClick}
                onKeyDown={onKeyDown}
                className="absolute inset-0 z-10 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity outline-none"
              >
                <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/90 shadow">
                  {isActive && isPlaying ? (
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <rect x="6" y="5" width="4" height="14" />
                      <rect x="14" y="5" width="4" height="14" />
                    </svg>
                  ) : (
                    <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                      <path d="M8 5v14l11-7z" />
                    </svg>
                  )}
                </span>
              </button>
            </div>
          );
        },
      },
      { name: "Title", selector: (r) => r.title },
      { name: "Artist", selector: (r) => r.artist },
      {
        name: "Duration",
        selector: (r) => r.duration,
        cell: (r) => (
          <div className="w-[120px] text-right tabular-nums">{toMMSS(r.duration)}</div>
        ),
      },
    ],
    []
  );

  /* fetch con cache por género (sin loaders internos de la tabla) */
  useEffect(() => {
    let ignore = false;
    const ac = new AbortController();
    setLoading(true);

    (async () => {
      const cacheKey = `tracks:${genre}`;
      const cached = sessionStorage.getItem(cacheKey);
      if (cached) {
        try {
          const parsed = JSON.parse(cached);
          if (!ignore) setRows(parsed);
        } catch {}
      }

      try {
        const { data } = await api.get("/tracks", {
          params: { genre },
          signal: ac.signal,
        });
        const items = data?.items ?? [];
        sessionStorage.setItem(cacheKey, JSON.stringify(items));
        if (!ignore) setRows(items);
      } catch {
        /* opcional: error */
      } finally {
        if (!ignore) {
          setLoading(false);
          setFirstLoad(false);
        }
      }
    })();

    return () => {
      ignore = true;
      ac.abort();
    };
  }, [genre]);

  /* estilos tabla */
  const ROW_H = 56;
  const customStyles = {
    table: { style: { backgroundColor: "#000" } },
    headRow: {
      style: {
        backgroundColor: "#000",
        borderBottom: "1px solid rgba(255,255,255,0.25)",
      },
    },
    rows: {
      style: {
        backgroundColor: "#000",
        borderBottom: "1px solid rgba(255,255,255,0.18)",
        minHeight: `${ROW_H}px`,
      },
      highlightOnHoverStyle: { backgroundColor: "rgba(29,240,216,0.08)" },
    },
    headCells: { style: { color: "#0A84FF", fontWeight: 700 } },
    cells: { style: { color: "#0A84FF" } },
  };

  const conditionalRowStyles = [
    {
      when: (r) =>
        currentTrack && toAbs(r.audioUrl) === currentTrack.audioPath,
      style: { backgroundColor: "rgba(29, 240, 216, 0.08)" },
    },
  ];

  /* ─────────────────────────── render ─────────────────────────── */

  return (
    <>
      <div
        className={`bg-gradient-to-b ${
          HEADER_CLASS[genre] ?? "from-gray-700 to-gray-900"
        } w-full h-[100px] p-6 rounded-lg flex items-end`}
      >
        <h2 className="text-5xl">{genre}</h2>
      </div>

      <div className="mt-6 relative" style={{ willChange: "opacity" }}>
        <div
          className={
            loading && !firstLoad
              ? "opacity-90 transition-opacity duration-150"
              : "opacity-100 transition-opacity duration-150"
          }
        >
          <DataTable
            keyField="_id"
            columns={columns}
            data={rows}
            customStyles={customStyles}
            progressPending={false}              /* sin loader blanco */
            progressComponent={<span />}         /* seguridad extra */
            noDataComponent={
              <div className="w-full text-center py-8 text-[#0A84FF] bg-black">
                Sin canciones todavía
              </div>
            }
            persistTableHead
            dense
            pointerOnHover
            highlightOnHover
            conditionalRowStyles={conditionalRowStyles}
            onRowDoubleClicked={handlePlayRow}
            onRowClicked={(row, e) => {
              const pointer = e?.nativeEvent?.pointerType;
              const touchLike =
                pointer === "touch" || pointer === "pen" || isCoarsePointer();
              const isActive =
                currentTrack && toAbs(row.audioUrl) === currentTrack.audioPath;
              if (touchLike) {
                isActive && typeof togglePlay === "function"
                  ? togglePlay()
                  : handlePlayRow(row);
              } else if (e?.detail >= 2) {
                handlePlayRow(row);
              }
            }}
          />
        </div>

        {/* overlay sólo en 1ª carga (oscuro, sin “saltos”) */}
        {firstLoad && loading && (
          <div className="absolute inset-0 rounded-md bg-black/70 pointer-events-none">
            <div className="p-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="h-14 rounded-lg bg-white/10 animate-pulse" />
              ))}
            </div>
          </div>
        )}
      </div>
    </>
  );
};