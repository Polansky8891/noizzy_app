// src/auth/AuthListener.jsx
import { useEffect, useRef } from "react";
import { useDispatch } from "react-redux";
import { onAuthStateChanged, onIdTokenChanged } from "firebase/auth";
import { FirebaseAuth } from "../../firebase/config";
import { login, logout, setToken, checkingCredentials } from "./authSlice";
// (opcional) si usas axios global
// import api from "../../api/axios";

export default function AuthListener() {
  const dispatch = useDispatch();
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;

    // 0) Arrancamos en "checking" para evitar parpadeos no-autenticados
    dispatch(checkingCredentials());

    // 1) Escucha principal de sesión
    const unsubAuth = onAuthStateChanged(FirebaseAuth, async (user) => {
      if (!mountedRef.current) return;

      if (!user) {
        // Sin usuario -> estado NO autenticado + limpiar token
        dispatch(setToken(null));
        dispatch(logout());
        // if (api?.defaults?.headers?.common) delete api.defaults.headers.common.Authorization;
        return;
      }

      // Con usuario -> obtenemos token inicial y cargamos datos
      try {
        const t = await user.getIdToken(false);
        dispatch(setToken(t));
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
    });

    // 2) Rotación de token: mantener store sincronizado
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
