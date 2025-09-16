import { logout } from "./authSlice";
import { resetFavorites } from "../favoritesSlice";
import { signOut } from "firebase/auth";
import { FirebaseAuth } from "../../firebase/config";


export const doLogout = () => async (dispatch) => {
  try {
    await signOut(FirebaseAuth); 
  } catch (e) {
    console.warn("Firebase signOut error:", e);
  } finally {
    dispatch(resetFavorites());
    dispatch(logout());
  }
};