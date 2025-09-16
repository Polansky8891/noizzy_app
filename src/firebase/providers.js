import { GoogleAuthProvider, signInWithPopup, signOut } from "firebase/auth";
import { FirebaseAuth } from "./config";


        
const googleProvider = new GoogleAuthProvider();

googleProvider.setCustomParameters({
    prompt: 'select_account'
});

function mapAuthError(e) {
  const code = e?.code || '';
  if (code.includes('popup-closed-by-user')) return 'Se cerró la ventana de Google';
  return e?.message || 'Error de autenticación';
}

export async function signInWithGoogle() {
  try {
    const result = await signInWithPopup(FirebaseAuth, googleProvider);
    const user = result.user;
    const token = await user.getIdToken(false);
    return {
      ok: true,
      uid: user.uid,
      email: user.email,
      displayName: user.displayName || '',
      photoURL: user.photoURL || null,
      token,
    }
  } catch (error) {
    return { ok: false, errorMessage: mapAuthError(error)};
  }
}

export async function logoutFirebase() {
  await signOut(FirebaseAuth);
}