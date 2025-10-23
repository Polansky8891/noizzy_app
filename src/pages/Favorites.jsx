// src/pages/Favorites.jsx
import { useEffect, useMemo, useRef, useCallback, useState } from "react";
import DataTable from "react-data-table-component";
import { useDispatch, useSelector } from "react-redux";
import {
  fetchFavoriteTracks,
  removeFavorite,
  selectFavoriteTracks,
  selectFavoritesLoading,
  hydrateFavoritesFromCache,
} from "../store/favoritesSlice";
import { usePlayer } from "../components/PlayerContext";
import { FiTrash2 } from "react-icons/fi";
import { API_BASE } from "../api/base";
import { selectAuth } from "../store/auth/authSlice";
import SmartImage from "../components/SmartImage";
import useDelayedVisible from "../hooks/useDelayedVisible";

const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE_URL || API_BASE;
const BRAND_BLUE = "#0A84FF";

// Helpers Cloudinary (fallback seguros si no es Cloudinary)
const clThumb = (url) => {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", "/upload/w_60,q_10,blur:100,f_auto/");
};
const clCover = (url, width = 320) => {
  if (!url || !url.includes("/upload/")) return url;
  return url.replace("/upload/", `/upload/w_${width},q_auto:eco,f_auto/`);
};

const toAbs = (p, base = MEDIA_BASE) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  try { return new URL(p, base).href; } catch { return p; }
};

// Skeletons para la tabla (filas shimmer)
function SkeletonRow() {
  return (
    <div className="flex items-center gap-3 px-3 py-2 border-b border-white/5">
      <div className="w-11 aspect-square rounded bg-white/10 animate-pulse" />
      <div className="flex-1">
        <div className="h-4 w-1/3 bg-white/10 rounded animate-pulse" />
        <div className="h-3 w-1/5 bg-white/10 rounded mt-2 animate-pulse" />
      </div>
      <div className="w-10 h-8 bg-white/10 rounded animate-pulse" />
    </div>
  );
}
function SkeletonTable({ rows = 10 }) {
  return (
    <div className="rounded-xl overflow-hidden bg-[#0F0F0F]">
      {Array.from({ length: rows }).map((_, i) => <SkeletonRow key={i} />)}
    </div>
  );
}

export const Favorites = () => {
  const dispatch = useDispatch();
  const tracks = useSelector(selectFavoriteTracks);
  const loading = useSelector(selectFavoritesLoading);
  const hasFetchedOnce = useSelector((s) => s.favorites?.hasFetchedOnce);

  const { onPlay } = usePlayer();
  const { status, token } = useSelector(selectAuth);
  const uid = useSelector((s) => s.auth?.user?.id || s.auth?.user?.uid || s.auth?.uid || s.auth?.email);

  // Mantener últimas filas buenas para evitar flashes en recargas
  const lastGoodRowsRef = useRef([]);
  useEffect(() => {
    if (Array.isArray(tracks) && tracks.length > 0) {
      lastGoodRowsRef.current = tracks;
    }
  }, [tracks]);

  // Hidratar desde cache (snapshot síncrono del slice) en cuanto haya UID
  useEffect(() => {
    if (uid) dispatch(hydrateFavoritesFromCache());
  }, [uid, dispatch]);

  // Primera carga real desde API (si aún no se hizo)
  useEffect(() => {
    if (status === "authenticated" && token && !hasFetchedOnce && !loading) {
      dispatch(fetchFavoriteTracks());
    }
  }, [status, token, hasFetchedOnce, loading, dispatch]);

  // Filas a mostrar
  const rows = useMemo(() => {
    if (Array.isArray(tracks) && tracks.length > 0) return tracks;
    if (lastGoodRowsRef.current?.length > 0) return lastGoodRowsRef.current;
    return [];
  }, [tracks]);

  // Skeleton con retardo: sólo si no hay filas aún
  const showSkeleton = useDelayedVisible(loading && rows.length === 0, 220);

  // Estilos DataTable
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
      name: "",
      width: "70px",
      cell: (r, idx) => {
        const raw = r.coverUrl || r.coverPath || r.image;
        const abs = toAbs(raw);
        const thumb = clThumb(abs);
        const cover = clCover(abs, 320);
        // Prioridad a las primeras 6 para pintar ya
        const priority = idx < 6;
        return (
          <div className="p-1">
            <div className="w-11 aspect-square overflow-hidden rounded-none ring-1 ring-white/10 hover:ring-[#0A84FF]/60 transition">
              <SmartImage
                src={cover}
                placeholderSrc={thumb}
                alt={r.title || ""}
                ratio="1 / 1"
                widths={[120, 180, 240, 320]}
                sizes="44px"
                rounded="rounded-none"
                className="bg-[#111]"
                priority={priority}
              />
            </div>
          </div>
        );
      },
      ignoreRowClick: true,
      sortable: false,
    },
    {
      name: "",
      selector: (r) => r.title,
      grow: 3,
      sortable: true,
      cell: (r) => (
        <div className="flex flex-col min-w-0 pr-2">
          <span className="font-semibold text-[#0A84FF] truncate">{r.title}</span>
          <span className="text-sm text-[#0A84FF] truncate">{r.artist}</span>
        </div>
      ),
    },
    {
      name: "",
      width: "60px",
      right: true,
      cell: (r) => (
        <button
          className="p-2 rounded-lg hover:bg-white/10 hover:text-white transition"
          onClick={(e) => { e.stopPropagation(); handleRemove(r._id || r.id); }}
          title="Remove from favorites"
        >
          <FiTrash2 className="text-[#0A84FF]" />
        </button>
      ),
      ignoreRowClick: true,
      sortable: false,
    },
  ], [handleRemove]);

  const handleRowClick = useCallback((r) => { onPlay?.(r); }, [onPlay]);

  return (
    <div className="min-h-[60vh] p-4 sm:p-6">
      <div className="bg-[#0F0F0F] border border-[#0A84FF]/60 rounded-2xl shadow-[0_0_20px_rgba(10,132,255,0.08)] overflow-hidden">
        <div className="px-4 py-3 border-b border-[#0A84FF]/30">
          <h2 className="text-lg font-semibold text-[#0A84FF]">Your Favorites</h2>
        </div>

        <div className="p-2 sm:p-4">
          {showSkeleton ? (
            <SkeletonTable rows={10} />
          ) : rows.length > 0 ? (
            <div className="transition-opacity duration-200 opacity-100">
              <DataTable
                columns={columns}
                data={rows}
                onRowClicked={handleRowClick}
                pointerOnHover
                highlightOnHover
                dense
                persistTableHead
                noTableHead
                customStyles={customStyles}
                noDataComponent={null}
                progressPending={false}
                keyField="_id"
              />
            </div>
          ) : hasFetchedOnce && !loading ? (
            <div className="py-12 text-center">
              <p className="text-gray-300">
                You haven&apos;t added any songs to your favourites yet.
              </p>
            </div>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default Favorites;
