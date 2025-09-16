import { signInWithGoogle, logoutFirebase } from "../../firebase/providers";
import { checkingCredentials, login, logout, setToken } from "./authSlice"


export const startGoogleSignIn = () => {
    return async (dispatch) => {
      dispatch(checkingCredentials());
      const res = await signInWithGoogle();
      if (!res.ok) return dispatch(logout({ errorMessage: res.errorMessage }));
      dispatch(login(res));
      dispatch(setToken(res.token));
  };
};

export const startLogout = () => {
  return async (dispatch) => {
    try { await logoutFirebase(); } finally { dispatch(logout()); }
  };
};