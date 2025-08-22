// src/auth/AuthListener.jsx
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged, setPersistence, browserLocalPersistence } from 'firebase/auth';
import { FirebaseAuth } from '../../firebase/config';
import { login, logout } from './authSlice';

export default function AuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    console.log('[AuthListener] mount'); // 👀 para verificar que se monta

    // Persistencia local (sesión tras recargar)
    setPersistence(FirebaseAuth, browserLocalPersistence).catch((e) => {
      console.warn('[AuthListener] setPersistence error:', e);
    });

    const unsub = onAuthStateChanged(FirebaseAuth, (user) => {
      console.log('[AuthListener] onAuthStateChanged user:', user);
      if (user) {
        const { uid, email, displayName } = user;
        const photoURL =
          user.photoURL ||
          user.providerData?.[0]?.photoURL ||
          null;

        console.log('[AuthListener] resolved photoURL:', photoURL);
        dispatch(login({ uid, email, displayName, photoURL }));
      } else {
        dispatch(logout());
      }
    });

    return () => {
      console.log('[AuthListener] unmount');
      unsub();
    };
  }, [dispatch]);

  return null; // no pinta nada, sólo escucha
}
