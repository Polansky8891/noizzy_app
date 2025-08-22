import { signInWithGoogle } from "../../firebase/providers";
import { checkingCredentials, login, logout } from "./authSlice"


export const checkingAuthentication = () => {
    return async( dispatch ) => {

        dispatch( checkingCredentials() );
    }
}


export const startGoogleSignIn = () => {
    return async (dispatch) => {
    dispatch(checkingCredentials());
    try {
      const result = await signInWithGoogle();
      if (!result.ok) return dispatch(logout({ errorMessage: result.errorMessage }));
      // OJO: el observer de App también hará login; este dispatch es opcional.
      dispatch(login(result));
      // si quieres navegar aquí, puedes hacerlo desde el componente cuando vea auth.authenticated
    } catch (err) {
      dispatch(logout({ errorMessage: err.message }));
    }
  };
};