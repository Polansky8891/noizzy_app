import { useDispatch, useSelector } from "react-redux";
import { addFavorite, removeFavorite, toggleLocal } from "../store/favoritesSlice";
import { FaRegHeart } from "react-icons/fa";


const isObjectId = (s) => typeof s === "string" && /^[0-9a-fA-F]{24}$/.test(s);

export const FavButton = ({ trackId, size = 16, className = '' }) => {
  const dispatch = useDispatch();
  const favs = useSelector((s) => s.favorites.ids);
  const isFav = favs.includes(trackId);
  const isAuth = useSelector((s) => s.auth.status === 'authenticated');

  const onToggle = async (e) => {
    e.stopPropagation();

    // 🚫 Nada de localStorage ni token: el interceptor de axios añade el Bearer.
    // Guardias mínimas y definitivas
    if (!isAuth || !isObjectId(trackId)) {
      console.warn('[FavButton] bloqueado por guard:', {
        noAuth: !isAuth,
        badId: !isObjectId(trackId),
      });
      return;
    }

    // Optimista
    dispatch(toggleLocal(trackId));
    try {
      if (isFav) {
        await dispatch(removeFavorite(trackId)).unwrap();
      } else {
        await dispatch(addFavorite(trackId)).unwrap();
      }
    } catch (error) {
      // Revertir si falla
      dispatch(toggleLocal(trackId));
      console.warn('[FavButton] error al persistir favorito:', error);
    }
  };

  return (
    <button
      aria-label={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
      onClick={onToggle}
      className={`rounded-full p-2 hover:bg-white/10 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#1DF0D8]/60 ${className}`}
      title={isFav ? 'Quitar de favoritos' : 'Añadir a favoritos'}
    >
      <FaRegHeart size={size} className={isFav ? 'fill-[#1DF0D8]' : 'fill-white/40'} />
    </button>
  );
};