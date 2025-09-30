import { useEffect, useMemo, useState } from "react";
import DataTable from "react-data-table-component";
import { useDispatch, useSelector } from "react-redux";
import { fetchFavoriteTracks, removeFavorite, selectFavoriteTracks, selectFavoritesLoading } from "../store/favoritesSlice";
import { usePlayer } from "../components/PlayerContext";
import { FiTrash2 } from 'react-icons/fi';
import { API_BASE } from "../api/base";



const API_URL = API_BASE;
const MEDIA_BASE = import.meta.env.VITE_MEDIA_BASE_URL || API_URL;

const fmt = (sec) => {
  const s = Math.floor(sec || 0);
  const m = Math.floor(s / 60);
  const r = String(s % 60).padStart(2, "0");
  return `${m}:${r}`;
};

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

  const { playTrack, currentTrack } = usePlayer();
  const [firstLoad, setFirstLoad] = useState(true);

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
      { name: "Title", selector: (r) => r.title, sortable: false },
      { name: "Artist", selector: (r) => r.artist, sortable: false },
      {
        name: "Duration",
        selector: (r) => r.duration,
        cell: (r) => (
          <div className="w-[120px] text-right tabular-nums">{fmt(r.duration)}</div>
        ),
      },
      {
        name: "",
        width: "88px", // OK mantener (lo usa la lib internamente)
        ignoreRowClick: true,
        cell: (r) => {
          const id = r._id || r.id;
          return (
            <div className="w-full flex items-center justify-end gap-2">
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
    [dispatch]
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
    return <div className="p-4 text-gray-300">You must login to see your favourites.</div>;
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
          if (e?.detail === 2) handlePlayRow(row);
        }}
      />
    </div>
  );
};