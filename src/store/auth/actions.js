import { logout } from "./authSlice";
import { resetFavorites } from "../favoritesSlice";


export const doLogout = () => (dispatch) => {
  try {
    localStorage.removeItem('token');
    localStorage.removeItem('uid');
    localStorage.removeItem('name');
    localStorage.removeItem('email');
    localStorage.removeItem('photoURL');
  } finally {
    dispatch(resetFavorites());
    dispatch(logout());
  }
};
