// src/auth/AuthListener.jsx
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged, onIdTokenChanged } from 'firebase/auth';
import { FirebaseAuth } from '../../firebase/config';
import { login, logout, setToken, checkingCredentials } from './authSlice';

export default function AuthListener() {
  const dispatch = useDispatch();
  const mountedRef = useRef(true);
  const lastTokenRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;
    dispatch(checkingCredentials());

    const safeSetToken = (t) => {
      if (!mountedRef.current) return;
      if (t && lastTokenRef.current === t) return;
      lastTokenRef.current = t || null;
      dispatch(setToken(t || null));
    };

    const unsubAuth = onAuthStateChanged(FirebaseAuth, async (user) => {
      if (!mountedRef.current) return;

      if (!user) {
        lastTokenRef.current = null;
        dispatch(setToken(null));
        dispatch(logout());
        return;
      }
      try {
        const t = await user.getIdToken();
        safeSetToken(t);
        dispatch(
          login({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          })
        );
      } catch {
        safeSetToken(null);
      }
    });

    const unsubId = onIdTokenChanged(FirebaseAuth, async (user) => {
      if (!mountedRef.current || !user) return;
      try {
        const t = await user.getIdToken();
        safeSetToken(t);
      } catch {
        safeSetToken(null);
      }
    });

    const onFocus = async () => {
      const u = FirebaseAuth.currentUser;
      if (!u) return;
      try {
        const t = await u.getIdToken(true);
        safeSetToken(t);
      } catch {
        safeSetToken(null);
      }
    };
    window.addEventListener('focus', onFocus);

    return () => {
      mountedRef.current = false;
      unsubAuth?.();
      unsubId?.();
      window.removeEventListener('focus', onFocus);
    };
  }, [dispatch]);
  
  return null;
}