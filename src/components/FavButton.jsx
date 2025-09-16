import { useDispatch, useSelector } from "react-redux";
import { addFavorite, removeFavorite, toggleLocal } from "../store/favoritesSlice";
import { FaRegHeart } from "react-icons/fa";
import { selectIsAuthenticated, selectToken } from "../store/auth/authSlice";


export const FavButton = ({ trackId, size = 16, className = "" }) => {
  const dispatch = useDispatch();
  const isAuth = useSelector(selectIsAuthenticated);
  const token  = useSelector(selectToken);
  const favs   = useSelector((s) => s.favorites.ids || []);

  const id = String(trackId ?? "");
  const isFav = id && favs.includes(id);
  const canToggle = isAuth && !!token && !!id;

  const onToggle = async (e) => {
    e.stopPropagation();
    if (!canToggle) {
      // aquí podrías abrir login modal o navegar a /login si quieres
      // navigate('/login', { state: { from: location } });
      return;
    }

    // optimista
    dispatch(toggleLocal(id));
    try {
      if (isFav) {
        await dispatch(removeFavorite(id)).unwrap();
      } else {
        await dispatch(addFavorite(id)).unwrap();
      }
    } catch {
      // revert en error
      dispatch(toggleLocal(id));
    }
  };

  return (
    <button
      type="button"
      aria-label={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
      aria-pressed={isFav}
      onClick={onToggle}
      disabled={!canToggle}
      className={`rounded-full p-2 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DF0D8]/60 disabled:opacity-50 ${className}`}
      title={isFav ? "Quitar de favoritos" : "Añadir a favoritos"}
    >
      {/* usa color en vez de fill para asegurar estilo en los íconos */}
      <FaRegHeart size={size} className={isFav ? "text-[#1DF0D8]" : "text-white/40"} />
    </button>
  );
};