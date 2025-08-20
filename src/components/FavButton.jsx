import { useDispatch, useSelector } from "react-redux";
import { addFavorite, removeFavorite, toggleLocal } from "../store/favoritesSlice";
import { FaRegHeart } from "react-icons/fa";


export const FavButton = ({ trackId, size = 16, className = ''}) => {
    const dispatch = useDispatch();
    const favs = useSelector((s) => s.favorites.ids);
    const isFav = favs.includes(trackId);
    const isAuth = useSelector((s) => s.auth.isAuthenticated);

    const onToggle = async (e) => {
        e.stopPropagation();
        if (!isAuth) return;

        dispatch(toggleLocal(trackId));
        try {
            if (isFav) {
                await dispatch(removeFavorite(trackId)).unwrap();
            } else {
                await dispatch(addFavorite(trackId)).unwrap();
            }
        } catch (error) {
            dispatch(toggleLocal(trackId));
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
}
