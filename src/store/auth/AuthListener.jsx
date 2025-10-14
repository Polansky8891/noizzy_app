// src/auth/AuthListener.jsx
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged, onIdTokenChanged } from "firebase/auth";
import { FirebaseAuth } from "../../firebase/config";
import { login, logout, setToken, checkingCredentials, setHydrated } from "./authSlice";
// (opcional) si usas axios global
// import api from "../../api/axios";

export default function AuthListener() {
  const dispatch = useDispatch();
  const mountedRef = useRef(true);
  const firstFiredRef = useRef(false); // ← NUEVO: sabremos cuándo Firebase respondió 1ª vez

  useEffect(() => {
    mountedRef.current = true;

    // Evita parpadeos: estado "checking" hasta que Firebase responda
    dispatch(checkingCredentials());

    // 1) Escucha principal de sesión
    const unsubAuth = onAuthStateChanged(FirebaseAuth, async (user) => {
      if (!mountedRef.current) return;

      if (!user) {
        dispatch(setToken(null));
        dispatch(logout());
        // if (api?.defaults?.headers?.common) delete api.defaults.headers.common.Authorization;
      } else {
        try {
          const t = await user.getIdToken(false);
          dispatch(setToken(t));
          // if (api?.defaults?.headers?.common) api.defaults.headers.common.Authorization = `Bearer ${t}`;
        } catch {
          dispatch(setToken(null));
        }

        dispatch(
          login({
            uid: user.uid,
            email: user.email,
            displayName: user.displayName,
            photoURL: user.photoURL,
          })
        );
      }

      // ← NUEVO: marcar hidratado tras la PRIMERA respuesta de Firebase
      if (!firstFiredRef.current) {
        firstFiredRef.current = true;
        dispatch(setHydrated(true));
      }
    });

    // 2) Rotación de token
    const unsubTok = onIdTokenChanged(FirebaseAuth, async (user) => {
      if (!mountedRef.current) return;
      try {
        const t = user ? await user.getIdToken(false) : null;
        dispatch(setToken(t));
        // if (t && api?.defaults?.headers?.common) api.defaults.headers.common.Authorization = `Bearer ${t}`;
        // else if (api?.defaults?.headers?.common) delete api.defaults.headers.common.Authorization;
      } catch {
        dispatch(setToken(null));
      }
    });

    return () => {
      mountedRef.current = false;
      unsubAuth();
      unsubTok();
    };
  }, [dispatch]);

  return null;
}