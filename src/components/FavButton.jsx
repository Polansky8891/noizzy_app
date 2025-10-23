import { useDispatch, useSelector } from "react-redux";
import { FaRegHeart } from "react-icons/fa";
import { addFavorite, removeFavorite, toggleLocal } from "../store/favoritesSlice";

export const FavButton = ({ trackId, track, size = 16, className = "" }) => {
  const dispatch = useDispatch();
  const isAuth = useSelector((s) => s.auth.status === "authenticated");
  const ids = useSelector((s) => s.favorites.ids || []);

  // normaliza id a string y garantiza que el track tenga _id e id
  const sid = String(track?._id || track?.id || trackId || "");
  const isFav = ids.includes(sid);
  const optimisticTrack = track
    ? { _id: sid, id: sid, ...track }
    : { _id: sid, id: sid, title: "Unknown", artist: "", coverUrl: null };

  const onToggle = async (e) => {
    e.stopPropagation();
    if (!isAuth || !sid) return;

    // Optimista: ids + items (con track)
    dispatch(toggleLocal({ id: sid, track: optimisticTrack }));

    try {
      if (isFav) {
        await dispatch(removeFavorite(sid)).unwrap();
      } else {
        await dispatch(addFavorite(sid)).unwrap();
      }
    } catch (err) {
      // rollback
      dispatch(toggleLocal({ id: sid, track: optimisticTrack }));
      console.warn("[FavButton] persist error → rollback", err);
    }
  };

  return (
    <button
      aria-label={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
      onClick={onToggle}
      className={`rounded-full p-2 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DF0D8]/60 ${className}`}
      title={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
      aria-pressed={isFav}
    >
      <FaRegHeart size={size} className={isFav ? "fill-[#1DF0D8]" : "fill-white/40"} />
    </button>
  );
};
