import { FaPlay, FaStepForward, FaStepBackward, FaPause } from 'react-icons/fa';
import { IoMdVolumeOff,IoMdVolumeMute  } from "react-icons/io";
import { usePlayer } from './PlayerContext';
import { FavButton } from './FavButton';

export const MusicPlayer = () => {

  const {
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
  } = usePlayer();

  const trackId = currentTrack?._id || currentTrack?.id;

  const fmt = (time) => {
    if (!Number.isFinite(time)) return "0:00";
    const mins = Math.floor(time / 60);
    const secs = String(Math.floor(time % 60)).padStart(2, "0");
    return `${mins}:${secs}`;
  };

  const pct = duration ? (progress / duration) * 100 : 0;

  const handleBarClick = (e) => {
    if (!duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const ratio = Math.max(0, Math.min(1, x / rect.width));
    seek(ratio * duration);
  };


  const togglePlay = () => {
    if (!currentTrack) return;
    if (isPlaying) {
      pauseTrack();
    } else {
      if (duration && progress >= duration - 0.25) seek(0);
      playTrack(currentTrack);
    }
  };

  const controlsDisabled = !currentTrack;
  
  return (
    <div
      className="
        w-full bg-black/90 backdrop-blur-md border-t border-white/10
        pb-[env(safe-area-inset-bottom)]
      "
    >
      <div className="mx-auto w-full max-w-screen-2xl px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Cover SOLO escritorio */}
          <div className="hidden lg:block w-24 h-24 xl:w-28 xl:h-28 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0">
            {currentTrack ? (
              <img
                src={currentTrack.cover || "/placeholder-cover.png"}
                alt={currentTrack.title || "Cover"}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { e.currentTarget.src = "/placeholder-cover.png"; }}
              />
            ) : (
              <div className="w-full h-full" />
            )}
          </div>

          {/* Columna derecha */}
          <div className="flex-1 min-w-0">
            {/* Título + artista + fav */}
            <div className="mb-1 relative pr-8 lg:pr-10"> {/* pr para que el fav no tape el texto */}
            <div className="mx-auto max-w-[80vw] lg:max-w-3xl text-center">
              <div className="text-[#1DF0D8] text-xs sm:text-sm truncate">
                {currentTrack?.title}
              </div>
              <div className="text-[11px] sm:text-xs text-[#1DF0D8]/80 truncate">
                {currentTrack?.artist || ""}
              </div>
            </div>

            {currentTrack && (
              <div
                className="
                  ml-2 inline-flex items-center justify-center
                  lg:ml-0 lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2
                "
              >
                <FavButton trackId={trackId} size={16} />
              </div>
            )}
          </div>

            {/* Barra de progreso */}
            <div className="mx-auto max-w-3xl flex items-center justify-center text-[11px] sm:text-xs text-[#1DF0D8] select-none">
              <span className="w-10 text-left">{fmt(progress)}</span>
              <div
                className="flex-1 h-2 mx-2 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full overflow-hidden cursor-pointer"
                onClick={handleBarClick}
                role="progressbar"
                aria-label="Barra de progreso"
                aria-valuemin={0}
                aria-valuemax={duration || 0}
                aria-valuenow={progress || 0}
              >
                <div
                  className="h-full bg-[#1DF0D8] rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-10 text-right">{fmt(duration)}</span>
            </div>

            {/* Controles compactos en móvil */}
            <div className="
                mt-2 flex items-center justify-center gap-4 sm:gap-6
              bg-[#1C1C1C] px-4 py-2 sm:px-6 sm:py-3 rounded-2xl shadow-inner
            ">
              <button
                onClick={() => skipBackward(10)}
                disabled={controlsDisabled}
                className="disabled:opacity-40 disabled:cursor-not-allowed"
                title="Retroceder 10s"
                aria-label="Retroceder 10 segundos"
              >
                <FaStepBackward className="text-[#1DF0D8] hover:text-white text-base sm:text-lg" />
              </button>

              <button
                onClick={togglePlay}
                disabled={controlsDisabled}
                className="
                  border border-[#1DF0D8] text-[#1DF0D8]
                  p-2 sm:p-3 rounded-full cursor-pointer shadow-md transition
                  hover:text-white hover:border-white
                  disabled:opacity-40 disabled:cursor-not-allowed
                "
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? <FaPause className="text-lg" /> : <FaPlay className="text-lg" />}
              </button>

              <button
                onClick={() => skipForward(10)}
                disabled={controlsDisabled}
                className="disabled:opacity-40 disabled:cursor-not-allowed"
                title="Avanzar 10s"
                aria-label="Avanzar 10 segundos"
              >
                <FaStepForward className="text-[#1DF0D8] hover:text-white text-base sm:text-lg" />
              </button>

              <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

              <button
                onClick={toggleMute}
                disabled={controlsDisabled}
                className="disabled:opacity-40 disabled:cursor-not-allowed hidden sm:block"
                aria-pressed={muted}
                title={muted ? "Quitar silencio" : "Silenciar"}
                aria-label={muted ? "Quitar silencio" : "Silenciar"}
              >
                {muted || volume === 0 ? (
                  <IoMdVolumeOff className="text-[#1DF0D8] hover:text-white text-lg" />
                ) : (
                  <IoMdVolumeMute className="text-[#1DF0D8] hover:text-white text-lg" />
                )}
              </button>

              <div className="items-center gap-2 hidden sm:flex">
                <input
                  type="range"
                  min={0}
                  max={1}
                  step={0.01}
                  value={volume}
                  onChange={(e) => setVolume(+e.target.value)}
                  disabled={controlsDisabled}
                  className="w-28 accent-[#1DF0D8] disabled:opacity-40"
                  aria-label="Volumen"
                />
                <span className="text-xs text-gray-400 w-10 text-right">
                  {Math.round(volume * 100)}%
                </span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};