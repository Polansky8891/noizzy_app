// src/auth/AuthListener.jsx
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged, onIdTokenChanged } from 'firebase/auth';
import { FirebaseAuth } from '../../firebase/config';
import { login, logout, setToken, checkingCredentials } from './authSlice';

export default function AuthListener() {
  const dispatch = useDispatch();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // 1) Entra/sale usuario
    const unsubAuth = onAuthStateChanged(FirebaseAuth, async (user) => {
      if (!mountedRef.current) return;

      if (!user) {
        dispatch(setToken(null));
        dispatch(logout());
        return;
      }

      // Cargamos un token inicial (no forzamos refresh)
      let t = null;
      try { t = await user.getIdToken(false); } catch { t = null; }
      dispatch(setToken(t));
      dispatch(
        login({
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          photoURL: user.photoURL,
        })
      );
    });

    // 2) Cuando Firebase rote el token, lo actualizamos en el store
    const unsubTok = onIdTokenChanged(FirebaseAuth, async (user) => {
      if (!mountedRef.current) return;
      let t = null;
      try { t = user ? await user.getIdToken(false) : null; } catch { t = null; }
      dispatch(setToken(t));
    });

    return () => {
      mountedRef.current = false;
      unsubAuth();
      unsubTok();
    };
  }, [dispatch]);

  return null;
}