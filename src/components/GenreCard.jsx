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

const HEADER_CLASS = {
  Rock:   "from-[#3da9f2] to-[#165a9e]",
  Pop:    "from-[#fce38a] to-[#f38181]",
  Blues:  "from-[#e35749] to-[#a13e35]",
  Classic:"from-[#cbd5e1] to-[#475569]",
  Dubstep:"from-[#34d399] to-[#065f46]",
  Electro:"from-[#a78bfa] to-[#4c1d95]",
  HipHop:"from-[#f59e0b] to-[#b45309]",
  Reggae: "from-[#34d399] to-[#059669]",
  House:  "from-[#60a5fa] to-[#1d4ed8]",
  Jazz:   "from-[#f472b6] to-[#be185d]",
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

  const { playTrack, currentTrack } = usePlayer();

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);

  const columns = useMemo(() => ([
    { name: "Title", selector: r => r.title, sortable: false },
    { name: "Artist", selector: r => r.artist, sortable: false },
    {
      name: "Duration",
      selector: r => r.duration,
      cell: r => toMMSS(r.duration),
      right: true,
      maxWidth: "120px",
    },
  ]), []);

  const customStyles = { headCells: { style: { fontWeight: "bold", fontSize: "16px" } } };

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
    title: row.title,
    artist: row.artist,
    audioPath,                                      
    cover: toAbsoluteUrl(row.coverUrl) || row.cover || row.image || null,
  });
};

  const handleRowDoubleClick = (row) => handlePlayRow(row);

  return (
    <>
      <div className={`bg-gradient-to-b ${HEADER_CLASS[genre] ?? "from-gray-700 to-gray-900"} w-full h-[200px] p-6 rounded-lg flex items-end`}>
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
