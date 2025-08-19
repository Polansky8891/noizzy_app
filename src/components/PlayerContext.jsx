import { createContext, useState, useContext, useRef, useEffect, useCallback } from "react"
import { BsSkipBackward } from "react-icons/bs";

const PlayerContext = createContext();

export const usePlayer = () => useContext(PlayerContext);

export const PlayerProvider = ({ children }) => {
    const audioRef = useRef(new Audio());
    const [currentTrack, setCurrentTrack] = useState(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [progress, setProgress] = useState(0);
    const [duration, setDuration] = useState(0);

    useEffect(() => {
        const a = audioRef.current;

        const onTimeUpdate = () => setProgress(a.currentTime || 0);
        const onLoaded = () => setDuration(a.duration || 0);
        const onPlay = () => setIsPlaying(true);
        const onPause = () => setIsPlaying(false);
        const onEnded = () => setIsPlaying(false);

        const onError = () => {
            const err = a.error;
            console.error("[Audio error]", err, "src:", a.src);
        };
        a.addEventListener("error", onError);
        a.removeEventListener("error", onError);

        a.addEventListener("timeupdate", onTimeUpdate);
        a.addEventListener("loadedmetadata", onLoaded);
        a.addEventListener("play", onPlay);
        a.addEventListener("pause", onPause);
        a.addEventListener("ended", onEnded);

        return () => {
            a.removeEventListener("timeupdate", onTimeUpdate);
            a.removeEventListener("loadedmetadata", onLoaded);
            a.removeEventListener("play", onPlay);
            a.removeEventListener("pause", onPause);
            a.removeEventListener("ended", onEnded);
        };
    }, []);

    const playTrack = useCallback(async (track) => {
        const a = audioRef.current;
        if (!currentTrack || currentTrack.audioPath !== track.audioPath) {
            a.src = track.audioPath;
            setCurrentTrack(track);
            setProgress(0);
        }
        await a.play().catch(() => {});
    }, [currentTrack]);

    const pauseTrack = () => {
        audioRef.current.pause();
    };

    const seek = (seconds) => {
        const a = audioRef.current;
        const target = Math.min(Math.max(0, seconds), duration || 0);

        if (typeof a.fastSeek === "function") {
            a.fastSeek(target);
        } else {
            a.currentTime = target;
        }
        setProgress(a.currentTime);
    };

    const skip = (delta = 10) => {
        seek(progress + delta);
    };
    const skipForward = (step = 10) => skip(step);
    const skipBackward = (step = 10) => skip(-step);

    const [volume, setVolume] = useState(1);
    const [muted, setMuted] = useState(false);

    useEffect(() => {
        const a =audioRef.current;
        a.volume = Math.min(1, Math.max(0, volume));
        a.muted = muted;
    }, [volume, muted]);

    const toggleMute = () => setMuted(m => !m);
  
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
            toggleMute
        }}
    >
        {children}
    </PlayerContext.Provider>
  );
};
