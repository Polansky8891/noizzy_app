// src/auth/AuthListener.jsx
import { useEffect, useRef } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged, onIdTokenChanged } from 'firebase/auth';
import { FirebaseAuth } from '../../firebase/config';
import { login, logout, setToken } from './authSlice';

export default function AuthListener() {
  const dispatch = useDispatch();
  const mountedRef = useRef(true);
  const lastUidRef = useRef(null);

  useEffect(() => {
    mountedRef.current = true;

    const unsubAuth = onAuthStateChanged(FirebaseAuth, async (user) => {
      if (!mountedRef.current) return;

      if (!user) {
        lastUidRef.current = null;
        dispatch(setToken(null)); 
        dispatch(logout());
        return;
      }

      if (lastUidRef.current !== user.uid) {
        lastUidRef.current = user.uid;
        const { uid, email, displayName, photoURL } = user;
        dispatch(
          login({
            uid,
            email: email || '',
            displayName: displayName || '',
            photoURL: photoURL || null,
          })
        );
        try {
          const t = await user.getIdToken(false);
          if (mountedRef.current) dispatch(setToken(t));
        } catch {
          if (mountedRef.current) dispatch(setToken(null));
        }
      }
    });

    const unsubToken = onIdTokenChanged(FirebaseAuth, async (user) => {
      if (!mountedRef.current) return;

      if (!user) {
        dispatch(setToken(null));
        return;
      }
      try {
        const t = await user.getIdToken(false);
        if (mountedRef.current) dispatch(setToken(t));
      } catch {
        if (mountedRef.current) dispatch(setToken(null));
      }
    });

    return () => {
      mountedRef.current = false;
      unsubAuth(); 
      unsubToken();
    };
  }, [dispatch]);

  return null;
}