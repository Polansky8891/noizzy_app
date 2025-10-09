// src/pages/Favorites.jsx
import { useEffect, useMemo, useRef, useState, useCallback } from "react";
import DataTable from "react-data-table-component";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFavoriteTracks,
  removeFavorite,
  selectFavoriteTracks,
  selectFavoritesLoading,
} from "../store/favoritesSlice";
import { usePlayer } from "../components/PlayerContext";
import { FiTrash2 } from "react-icons/fi";
import { API_BASE } from "../api/base";

const API_URL = API_BASE;
const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE_URL || API_URL;
const BRAND_BLUE = "#0A84FF";

const toAbs = (p, base = MEDIA_BASE) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  try { return new URL(p, base).href; } catch { return p; }
};

export const Favorites = () => {
  const dispatch = useDispatch();
  const tracks = useSelector(selectFavoriteTracks);
  const loading = useSelector(selectFavoritesLoading);
  const { onPlay } = usePlayer();
  const hasFetchedOnce = useSelector((s) => s.favorites?.hasFetchedOnce);

  // Mantener últimas filas buenas para evitar flashes en recargas
  const lastGoodRowsRef = useRef([]);
  useEffect(() => {
    if (Array.isArray(tracks) && tracks.length > 0) {
      lastGoodRowsRef.current = tracks;
    }
  }, [tracks]);

  // 1ª carga: marcar cuando finaliza (éxito o error)
  const [firstFetchDone, setFirstFetchDone] = useState(false);
  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!hasFetchedOnce) {
        try {
          await dispatch(fetchFavoriteTracks());
        } finally {
          if (mounted) setFirstFetchDone(true);
        }
      } else {
        if (mounted) setFirstFetchDone(true);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [dispatch, hasFetchedOnce]);

  // ✅ DEFINIMOS rows (faltaba)
  const rows = useMemo(() => {
    if (Array.isArray(tracks) && tracks.length > 0) return tracks;
    if (lastGoodRowsRef.current?.length > 0) return lastGoodRowsRef.current;
    return [];
  }, [tracks]);

  // Mostrar tabla si hay filas o si está cargando; empty sólo cuando sabemos seguro que está vacío
  const showTable = rows.length > 0;
  const showEmpty = firstFetchDone && !loading && rows.length === 0;

  // Estilos DataTable (tema oscuro + azul)
  const customStyles = {
    table: { style: { backgroundColor: "transparent" } },
    headRow: {
      style: {
        backgroundColor: "#161616",
        color: "#E5E7EB",
        borderBottom: `1px solid ${BRAND_BLUE}55`,
      },
    },
    headCells: { style: { fontWeight: 600, fontSize: "0.85rem" } },
    rows: {
      style: {
        backgroundColor: "#0F0F0F",
        color: "#D1D5DB",
        minHeight: "56px",
        borderBottom: "1px solid rgba(255,255,255,0.06)",
      },
      highlightOnHoverStyle: {
        backgroundColor: "rgba(255,255,255,0.06)",
        transitionDuration: "200ms",
        outline: `1px solid ${BRAND_BLUE}33`,
      },
    },
    cells: { style: { fontSize: "0.95rem" } },
    pagination: {
      style: {
        backgroundColor: "#0F0F0F",
        color: "#D1D5DB",
        borderTop: `1px solid ${BRAND_BLUE}33`,
      },
      pageButtonsStyle: {
        fill: "#D1D5DB",
        "&:disabled": { fill: "#6B7280" },
      },
    },
  };

  const handleRemove = useCallback(async (trackId) => {
    try { await dispatch(removeFavorite(trackId)); }
    catch { console.warn("Error removing favorite:", trackId); }
  }, [dispatch]);

  const columns = useMemo(() => [
    {
      name: "Cover",
      width: "78px",
      cell: (r) => (
        <div className="p-1">
          <img
            src={toAbs(r.coverUrl || r.coverPath)}
            alt=""
            width={44}
            height={44}
            className="w-11 h-11 rounded-xl object-cover ring-1 ring-white/10 hover:ring-[#0A84FF]/60 transition"
            loading="lazy"
            decoding="async"
            onError={(e) => { e.currentTarget.style.visibility = "hidden"; }}
          />
        </div>
      ),
      ignoreRowClick: true,
      sortable: false,
    },
    {
      name: "Title",
      selector: (r) => r.title,
      sortable: true,
      grow: 2,
      cell: (r) => <span className="text-gray-100">{r.title}</span>,
    },
    {
      name: "Artist",
      selector: (r) => r.artist,
      sortable: true,
      grow: 1.5,
      cell: (r) => <span className="text-gray-300">{r.artist}</span>,
    },
    {
      name: "Dur.",
      selector: (r) => r.duration || r.durationMs,
      sortable: true,
      width: "84px",
      cell: (r) => {
        const ms = typeof r.durationMs === "number" ? r.durationMs : (r.duration ?? 0) * 1000;
        const m = Math.floor(ms / 60000);
        const s = Math.round((ms % 60000) / 1000).toString().padStart(2, "0");
        return <span className="tabular-nums text-gray-300">{m}:{s}</span>;
      },
    },
    {
      name: "",
      width: "56px",
      cell: (r) => (
        <button
          className="p-2 rounded-lg hover:bg-white/10 hover:text-white transition"
          onClick={(e) => { e.stopPropagation(); handleRemove(r._id || r.id); }}
          title="Remove from favorites"
        >
          <FiTrash2 />
        </button>
      ),
      ignoreRowClick: true,
    },
  ], [handleRemove]);

  const handleRowClick = useCallback((r) => { onPlay?.(r); }, [onPlay]);

  return (
    <div className="min-h-[60vh] p-4 sm:p-6">
      <div className="bg-[#0F0F0F] border border-[#0A84FF]/60 rounded-2xl shadow-[0_0_20px_rgba(10,132,255,0.08)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#0A84FF]/30">
          <h2 className="text-lg font-semibold text-[#E0FFFF]">Your Favorites</h2>
        </div>

        <div className="p-2 sm:p-4">
          <div className={`min-h-[240px] transition-opacity duration-200 ${showTable ? "opacity-100" : "opacity-0"}`}>
            {showTable && (
              <DataTable
                columns={columns}
                data={rows}
                onRowClicked={handleRowClick}
                pointerOnHover
                highlightOnHover
                dense
                persistTableHead
                customStyles={customStyles}
                noDataComponent={null}
                progressPending={false}
                keyField="_id"
              />
            )}

            {showEmpty && (
              <div className="py-12 text-center">
                <p className="text-gray-300">
                  You haven&apos;t added any songs to your favourites yet.
                </p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>   
  );
};

export default Favorites;
