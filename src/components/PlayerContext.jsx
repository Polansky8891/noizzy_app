import { createContext, useState, useContext, useRef, useEffect, useCallback } from "react";
import { configureTickBuffer, startTicking, stopTicking } from "../utils/tickBuffer";
import { API_BASE } from "../api/base";

const PlayerContext = createContext();
export const usePlayer = () => useContext(PlayerContext);

const getAuthToken = () => localStorage.getItem("token");

export const PlayerProvider = ({ children }) => {
  const audioRef = useRef(new Audio());

  const [currentTrack, setCurrentTrack] = useState(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [duration, setDuration] = useState(0);
  const [volume, setVolume] = useState(1);
  const [muted, setMuted] = useState(false);

  // Refs para evitar estado obsoleto en tickBuffer
  const isPlayingRef = useRef(isPlaying);
  const currentTrackRef = useRef(currentTrack);
  useEffect(() => { isPlayingRef.current = isPlaying; }, [isPlaying]);
  useEffect(() => { currentTrackRef.current = currentTrack; }, [currentTrack]);

  // Evitar duplicar PlayEvent si reanudan la misma pista
  const lastPlayedTrackIdRef = useRef(null);

  const normalizeGenre = (g) => {
    if (!g) return null;
    const s = String(g).trim().toLowerCase();
    const map = {
      'hip hop': 'Hip-Hop',
      'hip-hop': 'Hip-Hop',
      'techno': 'Techno',
      'rock': 'Rock',
      'pop': 'Pop',
      'electro': 'Electro',
      'jazz': 'Jazz',
      'blues': 'Blues',
      'classical': 'Classical',
      'dubstep': 'Dubstep',
      'house': 'House',
      'reggae': 'Reggae'
    };
    return map[s] ?? s.replace(/\b\w/g, m => m.toUpperCase());
  };

  const pickGenre = (t = {}) => {
  const raw =
    t.genre ??
    t.genres?.[0] ??
    t.metadata?.genre ??
    t.tags?.genre ??
    t.category ??
    t.primaryGenreName ??
    null;
  return normalizeGenre(raw);
};




  function normalizeTrack(t = {}) {
    return {
      _id: t._id || t.id || "",     
      id: String(t._id || t.id || ""),
      title: t.title || "",
      artist: t.artist || "",
      genre: pickGenre(t),
      audioPath: t.audioPath || t.audioUrl || "",
      cover: t.cover || t.coverUrl || t.image || null,
    };
  }

  async function logPlay(track) {
    try {
      const token = getAuthToken();
      const headers = { "Content-Type": "application/json" };
      if (token) headers.Authorization = `Bearer ${token}`;
      await fetch(`${API_BASE}/stats/play`, {
        method: "POST",
        headers: { 'Content-Type': 'application/json', ...(token ? { 'x-token': token } : {}) },
        body: JSON.stringify({ trackId: track._id, genre: track.genre }),
      });
    } catch (_) {}
  }

  // Configurar tick buffer (lee estado desde refs para no quedarse viejo)
  useEffect(() => {
    const getStateFn = () => ({ isPlaying: isPlayingRef.current, currentTrack: currentTrackRef.current });
    const getTokenFn = () => getAuthToken();
    configureTickBuffer({ getStateFn, getTokenFn, endpoint: `${API_BASE}/stats/tick` });
    startTicking();
    return () => stopTicking();
  }, []);

  // Eventos del <audio>
  useEffect(() => {
    const a = audioRef.current;

    const onTimeUpdate = () => setProgress(a.currentTime || 0);
    const onLoaded = () => setDuration(a.duration || 0);
    const onPlay = () => setIsPlaying(true);
    const onPause = () => setIsPlaying(false);
    const onEnded = () => setIsPlaying(false);
    const onError = () => console.error("[Audio error]", a.error, "src:", a.src);

    a.addEventListener("error", onError);
    a.addEventListener("timeupdate", onTimeUpdate);
    a.addEventListener("loadedmetadata", onLoaded);
    a.addEventListener("play", onPlay);
    a.addEventListener("pause", onPause);
    a.addEventListener("ended", onEnded);

    return () => {
      a.removeEventListener("error", onError);
      a.removeEventListener("timeupdate", onTimeUpdate);
      a.removeEventListener("loadedmetadata", onLoaded);
      a.removeEventListener("play", onPlay);
      a.removeEventListener("pause", onPause);
      a.removeEventListener("ended", onEnded);
    };
  }, []);

  const playTrack = useCallback(async (rawTrack) => {
    const a = audioRef.current;
    const t = normalizeTrack(rawTrack);

    // Si cambia de pista, actualiza src y estados
    const isNewTrack = !currentTrack || currentTrack.audioPath !== t.audioPath;
    if (isNewTrack) {
      a.src = t.audioPath;
      setCurrentTrack(t);
      setProgress(0);

      // Registra PlayEvent solo la primera vez que empieza esta pista
      if (t._id && t._id !== lastPlayedTrackIdRef.current) {
        lastPlayedTrackIdRef.current = t._id;
        logPlay(t); // <— AHORA sí se usa logPlay
      }
    }

    try { await a.play(); } catch (_) {}
  }, [currentTrack]);

  const pauseTrack = () => { audioRef.current.pause(); };

  const seek = (seconds) => {
    const a = audioRef.current;
    const target = Math.min(Math.max(0, seconds), duration || 0);
    if (typeof a.fastSeek === "function") a.fastSeek(target);
    else a.currentTime = target;
    setProgress(a.currentTime);
  };

  const skip = (delta = 10) => seek(progress + delta);
  const skipForward = (step = 10) => skip(step);
  const skipBackward = (step = 10) => skip(-step);

  useEffect(() => {
    const a = audioRef.current;
    a.volume = Math.min(1, Math.max(0, volume));
    a.muted = muted;
  }, [volume, muted]);

  const toggleMute = () => setMuted((m) => !m);

  return (
    <PlayerContext.Provider
      value={{
        currentTrack,
        isPlaying,
        progress,
        duration,
        playTrack,
        pauseTrack,
        seek,
        skipForward,
        skipBackward,
        volume,
        setVolume,
        muted,
        toggleMute,
      }}
    >
      {children}
    </PlayerContext.Provider>
  );
};
