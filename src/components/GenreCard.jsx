import { useEffect, useMemo, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import DataTable from "react-data-table-component";
import axios from "axios";

const SLUG_TO_GENRE = {
  "rock": "Rock",
  "pop": "Pop",
  "blues": "Blues",
  "classic": "Classic",
  "dubstep": "Dubstep",
  "electro": "Electro",
  "hip-hop": "Hip-Hop",
  "reggae": "Reggae",
  "house": "House",
  "jazz": "Jazz",
};

const HEADER_CLASS = {
  Rock:   "from-[#3da9f2] to-[#165a9e]",
  Pop:    "from-[#fce38a] to-[#f38181]",
  Blues:  "from-[#e35749] to-[#a13e35]",   // ajusta a tu gusto
  Classic:"from-[#cbd5e1] to-[#475569]",
  Dubstep:"from-[#34d399] to-[#065f46]",
  Electro:"from-[#a78bfa] to-[#4c1d95]",
  "Hip-Hop":"from-[#f59e0b] to-[#b45309]",
  Reggae: "from-[#34d399] to-[#059669]",
  House:  "from-[#60a5fa] to-[#1d4ed8]",
  Jazz:   "from-[#f472b6] to-[#be185d]",
};

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:4000/api";

const toMMSS = (s) => {
  const n = Numer(s) || 0;
  const m = Math.floor(n/60);
  const r = String(n%60).padStart(2, "0");
  return `${m}:${r}`;
};

export const GenreCard = () => {

  const { slug } = useParams();
  const genre = SLUG_TO_GENRE[slug];

  if (!genre) return <Navigate to="/" replace />;

  const [rows, setRows] = useState([]);
  const [pending, setPending] = useState(true);
  const [error, setError] = useState(null);

  const columns = useMemo(() => ([
    { name: "Title", selector: r => r.title, sortable: false},
    { name: "Artist", selector: r => r.artist, sortable: false},
    { name: "Duration", selector: r => r.duration, cell: r => toMMSS(r.duration), right: true, maxWidth: "120px" },
  ]), []);

  const customStyles = { headCells: { style: { fontWeight: "bold", fontSize: "16px"} } };

  useEffect(() => {
    let ignore = false;
    (async () => {
      try {
        setPending(true);
        setError(null);
        const res = await axios.get(`${API_URL}/tracks`, {
          params: { genre, fields: "title,artist,duration"},
        });
        if (!ignore) setRows(res.data.items ?? []);
      } catch (e) {
        if (!ignore) setError(e?.message || "error loading tracks");
      } finally {
        if (!ignore) setPending(false);
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
          {error && <div className="mb-4 rounded-md border border-red-400 bg-red-50 p-3 text-red-700">{error}</div>}
          <DataTable 
            columns={columns}
            data={rows}
            customStyles={customStyles}
            progressPending={pending}
            pagination={false}
            highlightOnHover
            dense
            />
        </div>
      </>
  );
};