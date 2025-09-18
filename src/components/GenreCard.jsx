import { useEffect, useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import axios from "axios";
import { usePlayer } from "./PlayerContext";

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
  jazz: "Jazz",
};

const BRAND_GRADIENT_3 = "bg-[linear-gradient(90deg,_#240A3D_0%,_#3B0F66_12%,_#5A1E95_26%,_#7A2CC6_40%,_#AC4BEB_52%,_#7A2CC6_66%,_#3B0F66_84%,_#240A3D_100%)]";
export const HEADER_CLASS = {
  Rock:   BRAND_GRADIENT_3,
  Pop:    BRAND_GRADIENT_3,
  Blues:  BRAND_GRADIENT_3,
  Classic:BRAND_GRADIENT_3,
  Dubstep:BRAND_GRADIENT_3,
  Electro:BRAND_GRADIENT_3,
  HipHop: BRAND_GRADIENT_3,
  Reggae: BRAND_GRADIENT_3,
  House:  BRAND_GRADIENT_3,
  Jazz:   BRAND_GRADIENT_3,
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";          
const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE_URL || API_URL;     

const toMMSS = (s) => {
  const n = Math.max(0, Math.floor(Number(s) || 0));
  const m = Math.floor(n / 60);
  const r = String(n % 60).padStart(2, "0");
  return `${m}:${r}`;
};


const toAbsoluteUrl = (p, base = MEDIA_BASE) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  try { return new URL(p, base).href; } catch { return p; }
};

export const GenreCard = () => {
  const { slug } = useParams();
  const genre = SLUG_TO_GENRE[slug];
  if (!genre) return <Navigate to="/" replace />;

  const { playTrack, currentTrack, togglePlay, isPlaying, pauseTrack } = usePlayer();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);

const columns = useMemo(() => ([
  {
    name: "",
    cell: (row) => {
      const src = toAbsoluteUrl(row.coverUrl || row.cover || row.image);
      const audioPath = toAbsoluteUrl(row.audioUrl);
      const isActive = currentTrack && toAbsoluteUrl(row.audioUrl) === currentTrack.audioPath;

      const onClick = (e) => {
        e.stopPropagation();
        if (isActive && typeof togglePlay === "function") {
          togglePlay();               // pausa/reanuda si está disponible
        } else {
          handlePlayRow(row);         // reproduce la pista
        }
      };

      const onKeyDown = (e) => {
        if (e.key === "Enter" || e.key === " ") {
          e.preventDefault();
          onClick(e);
        }
      };

      return (
        <div
          className={`relative w-12 h-12 rounded-md overflow-hidden ${isActive ? "ring-2 ring-emerald-400" : ""}`}
        >
          <img
            src={src}
            alt={row.title}
            className="w-full h-full object-cover"
            loading="lazy"
            onError={(e) => { e.currentTarget.src = "/placeholder-cover.png"; }}
          />

          {/* Overlay con botón */}
          <button
            aria-label={isActive ? (isPlaying ? "Pausar" : "Reanudar") : "Reproducir"}
            onClick={onClick}
            onKeyDown={onKeyDown}
            className="absolute inset-0 flex items-center justify-center bg-black/40 opacity-0 hover:opacity-100 focus:opacity-100 transition-opacity outline-none"
          >
            <span className="inline-flex items-center justify-center w-7 h-7 rounded-full bg-white/90 shadow">
              {/* Icono Play/Pause en SVG */}
              {isActive && isPlaying ? (
                // pause
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <rect x="6" y="5" width="4" height="14"></rect>
                  <rect x="14" y="5" width="4" height="14"></rect>
                </svg>
              ) : (
                // play
                <svg viewBox="0 0 24 24" width="16" height="16" aria-hidden="true">
                  <path d="M8 5v14l11-7z"></path>
                </svg>
              )}
            </span>
          </button>
        </div>
      );
    },
    width: "64px",
    allowOverflow: true,
    button: true,
  },
  { name: "Title", selector: r => r.title },
  { name: "Artist", selector: r => r.artist },
  {
    name: "Duration",
    selector: r => r.duration,
    cell: r => toMMSS(r.duration),
    right: true,
    maxWidth: "120px",
  },
]), [currentTrack, isPlaying]);

  const key = (g) => `tracks:${g}`;

  useEffect(() => {
    let ignore = false;
    (async () => {

      const cached = sessionStorage.getItem(key(genre));
      if (cached) setRows(JSON.parse(cached));

      try {
        setLoading(true);
        const res = await axios.get(`${API_URL}/tracks`, { params: { genre } });
        const items = res.data?.items ?? [];
        sessionStorage.setItem(key(genre), JSON.stringify(items));
        if (!ignore) setRows(items);
      } finally {
        if (!ignore) {
          setLoading(false);
          setFirstLoad(false); 
        }
      }
    })();
    return () => { ignore = true; };
  }, [genre]);

  const customStyles = {
    table: { style: { backgroundColor: '#000' } },

    headRow: {
        style: {
        backgroundColor: '#000',
        borderBottomStyle: 'solid',
        borderBottomWidth: '1px',
        borderBottomColor: 'rgba(255,255,255,0.25)',
        },
    },

    rows: {
        style: {
        backgroundColor: '#000',
        borderBottomStyle: 'solid',          // ← importante
        borderBottomWidth: '1px',            // ← importante
        borderBottomColor: 'rgba(255,255,255,0.18)', // ← color de línea
        },
        highlightOnHoverStyle: {
        backgroundColor: 'rgba(29,240,216,0.08)',
        },
    },

    headCells: { style: { color: '#AC4BEB', fontWeight: 700 } },
    cells:     { style: { color: '#AC4BEB' } },
    };

  const conditionalRowStyles = [
  {
    when: (r) => currentTrack && toAbsoluteUrl(r.audioUrl) === currentTrack.audioPath,
    style: { backgroundColor: "rgba(29, 240, 216, 0.08)" },
  },
];

  const handlePlayRow = (row) => {
  const audioPath = toAbsoluteUrl(row.audioUrl);    
  if (!audioPath) {
    console.warn("[GenreCard] Fila sin audioUrl:", row);
    return;
  }
  playTrack({
    id: row._id || row.id,
    title: row.title,
    artist: row.artist,
    audioPath,                                      
    cover: toAbsoluteUrl(row.coverUrl) || row.cover || row.image || null,
  });
};

  const handleRowDoubleClick = (row) => handlePlayRow(row);

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
          onRowDoubleClicked={handleRowDoubleClick}                              // ✅ doble click nativo
          onRowClicked={(row, e) => { if (e?.detail === 2) handlePlayRow(row); }} // ✅ fallback (y útil en móviles)
        />
        {!firstLoad && loading && (
          <div className="absolute inset-0 bg-white/60 dark:bg-black/40 animate-pulse pointer-events-none rounded-md" />
        )}
      </div>
    </>
  );
};
