import { useEffect, useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import axios from "axios";

const SLUG_TO_GENRE = {
  "rock": "Rock",
  "pop": "Pop",
  "blues": "Blues",
  "classic": "Classical",
  "dubstep": "Dubstep",
  "electro": "Electro",
  "hiphop": "Hip-Hop",
  "reggae": "Reggae",
  "house": "House",
  "jazz": "Jazz",
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

const toMMSS = (s) => {
  const n = Math.max(0, Math.floor(Number(s) || 0));
  const m = Math.floor(n/60);
  const r = String(n%60).padStart(2, "0");
  return `${m}:${r}`;
};

const parseDuration = (d) => {
  if (typeof d === "number" && Number.isFinite(d)) return d;
  if (typeof d === "string") {
    const m = d.match(/^(\d{1,2}):([0-5]\d)$/);
    if (m) return (+m[1]) * 60 + (+m[2]);
    const n = Number(d);
    if (!Number.isNaN(n)) return n;
  }
  if (typeof d === "object" && d) {
    if ("seconds" in d) return Number(d.seconds) || 0;
    if ("length" in d) return Number(d.length) || 0;
  }
  return 0;
}

export const GenreCard = () => {

  const { slug } = useParams();
  const genre = SLUG_TO_GENRE[slug];

  if (!genre) return <Navigate to="/" replace />;

  const [rows, setRows] = useState([]);
  const [loading, setLoading] = useState(true);
  const [firstLoad, setFirstLoad] = useState(true);

  const columns = useMemo(() => ([
    { name: "Title", selector: r => r.title, sortable: false},
    { name: "Artist", selector: r => r.artist, sortable: false},
    { name: "Duration", selector: r => r.duration, cell: r => toMMSS(r.duration), right: true, maxWidth: "120px" },
  ]), []);

  const customStyles = { headCells: { style: { fontWeight: "bold", fontSize: "16px"} } };

  const key = (g) => `tracks:${g}`;

useEffect(() => {
  let ignore = false;
  (async () => {
    // 1) pinta caché instantánea si existe
    const cached = sessionStorage.getItem(key(genre));
    if (cached) setRows(JSON.parse(cached));

    // 2) refresca en background
    try {
      setLoading(true);
      const res = await axios.get(`${API_URL}/tracks`, { params: { genre } });
      const items = res.data?.items ?? [];
      sessionStorage.setItem(key(genre), JSON.stringify(items));
      if (!ignore) setRows(items);
    } finally {
      if (!ignore) setLoading(false);
    }
  })();
  return () => { ignore = true; };
}, [genre]);

       

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
            />
            {!firstLoad && loading && (
              <div className="absolute inset-0 bg-white/60 dark:bg-black/40 animate-pulse pointer-events-none rounded-md" />
            )}
        </div>
      </>
  );
};