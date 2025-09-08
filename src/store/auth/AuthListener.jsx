// src/auth/AuthListener.jsx
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { onAuthStateChanged } from 'firebase/auth';
import { FirebaseAuth } from '../../firebase/config';
import { login, logout } from './authSlice';

export default function AuthListener() {
  const dispatch = useDispatch();

  useEffect(() => {
    // 1) Hidrata Redux una sola vez desde localStorage
    const token = localStorage.getItem('token');
    if (token) {
      dispatch(login({
        uid: localStorage.getItem('uid') || '',
        email: localStorage.getItem('email') || '',
        displayName: localStorage.getItem('name') || '',
        photoURL: localStorage.getItem('photoURL') || null,
      }));
    } else {
      dispatch(logout());
    }

    // 2) Listener de Firebase: si no hay token, aseguramos logout
    const unsub = onAuthStateChanged(FirebaseAuth, () => {
      const hasToken = !!localStorage.getItem('token');
      if (!hasToken) dispatch(logout());
      // Si hay token, no tocamos Redux aquí (ya está hidratado)
    });

    return unsub;
  }, [dispatch]);

  return null;
}