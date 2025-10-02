import { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavoriteTracks, removeFavorite, selectFavoriteTracks, selectFavoritesLoading } from "../store/favoritesSlice";
import { usePlayer } from "../components/PlayerContext";
import { FiTrash2 } from 'react-icons/fi';
import { API_BASE } from "../api/base";



const API_URL = API_BASE;
const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE_URL || API_URL;

const toAbsoluteUrl = (p, base = MEDIA_BASE) => {
  if (!p) return "";
  if (/^https?:\/\//i.test(p)) return p;
  try {
    return new URL(p, base).href;
  } catch {
    return p;
  }
};

export const Favorites = () => {
  const dispatch = useDispatch();
  const tracks = useSelector(selectFavoriteTracks);
  const loading = useSelector(selectFavoritesLoading);
  const isAuth = useSelector((s) => s.auth.status === "authenticated");

  const { playTrack, currentTrack, togglePlay } = usePlayer();
  const [firstLoad, setFirstLoad] = useState(true);

  const COARSE = useMemo(() => {
    if (typeof window === "undefined") return false;
    return (
      window.matchMedia?.("(pointer: coarse)")?.matches ||
      navigator.maxTouchPoints > 0
    );
  }, []);

  useEffect(() => {
    let ignore = false;
    (async () => {
      if (!isAuth) return;
      try {
        await dispatch(fetchFavoriteTracks());
      } finally {
        if (!ignore) setFirstLoad(false);
      }
    })();
    return () => {
      ignore = true;
    };
  }, [dispatch, isAuth]);

  const handlePlayRow = (row) => {
    const audioPath = toAbsoluteUrl(row.audioUrl);
    if (!audioPath) return;
    playTrack({
      id: row._id || row.id,
      title: row.title,
      artist: row.artist,
      audioPath,
      cover: toAbsoluteUrl(row.coverUrl) || row.cover || row.image || null,
    });
  };

  const columns = useMemo(
    () => [
      // ⬅️ NUEVA: cover al inicio
      {
        name: "",
        width: "60px",
        sortable: false,
        cell: (r) => {
          const src = toAbsoluteUrl(r.coverUrl || r.cover || r.image);
          const isActive =
            currentTrack && toAbsoluteUrl(r.audioUrl) === currentTrack.audioPath;
          return (
            <div
              className={`w-10 h-10 rounded-md overflow-hidden ${
                isActive ? "ring-2 ring-[#0A84FF]" : ""
              }`}
              title={r.title}
            >
              <img
                src={src || "/placeholder-cover.png"}
                alt={r.title}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => {
                  e.currentTarget.src = "/placeholder-cover.png";
                }}
              />
            </div>
          );
        },
      },
      { name: "Title", selector: (r) => r.title, sortable: false },
      { name: "Artist", selector: (r) => r.artist, sortable: false },

      // 🗑️ acciones
      {
        name: "",
        width: "56px",                 // antes 88px → más estrecha
        ignoreRowClick: true,
        cell: (r) => {
          const id = r._id || r.id;
          return (
            // centrado en mobile, a la derecha en ≥ md
            <div className="flex items-center justify-center md:justify-end pr-1">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  dispatch(removeFavorite(id));
                }}
                title="Remove from favourites"
                aria-label="Remove from favourites"
                className="group p-2 rounded-full border border-white/10"
              >
                <FiTrash2 className="w-4 h-4 text-[#0A84FF] group-hover:text-white" />
              </button>
            </div>
          );
        },
      },
    ],
    [dispatch, currentTrack]
  );

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
      },
      highlightOnHoverStyle: { backgroundColor: "rgba(29,240,216,0.08)" },
    },
    headCells: { style: { color: "#0A84FF", fontWeight: 700 } },
    cells: { style: { color: "#0A84FF" } },
  };

  const conditionalRowStyles = [
    {
      when: (r) =>
        currentTrack && toAbsoluteUrl(r.audioUrl) === currentTrack.audioPath,
      style: { backgroundColor: "rgba(29,240,216,0.08)" },
    },
  ];

  if (!isAuth) {
    return (
      <div className="p-4 text-gray-300">
        You must login to see your favourites.
      </div>
    );
  }

  if (!firstLoad && !loading && (!tracks || tracks.length === 0)) {
    return (
      <div className="p-4 text-gray-400">
        You haven't added any songs to your favourites yet.
      </div>
    );
  }

  return (
    <div className="mt-6">
      <h2 className="text-[#0A84FF] text-xl mb-4">My favourites</h2>
      <DataTable
        columns={columns}
        data={tracks || []}
        customStyles={customStyles}
        progressPending={firstLoad && loading}
        persistTableHead
        dense
        pointerOnHover
        highlightOnHover
        conditionalRowStyles={conditionalRowStyles}
        onRowDoubleClicked={handlePlayRow}
        onRowClicked={(row, e) => {
          // móvil/tablet: un toque reproduce (o hace toggle si ya está activa)
          const pointer = e?.nativeEvent?.pointerType;
          const touchLike = pointer === "touch" || pointer === "pen" || COARSE;

          if (touchLike) {
            const isActive =
              currentTrack && toAbsoluteUrl(row.audioUrl) === currentTrack.audioPath;
            if (isActive && typeof togglePlay === "function") {
              togglePlay();
            } else {
              handlePlayRow(row);
            }
          } else if (e?.detail >= 2) {
            // desktop: doble clic mantiene el comportamiento anterior
            handlePlayRow(row);
          }
        }}
      />
    </div>
  );
};