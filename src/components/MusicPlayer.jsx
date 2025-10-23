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
    <div className="w-full bg-black/90 backdrop-blur-md pb-[env(safe-area-inset-bottom)]">
      <div className="mx-auto w-full max-w-screen-2xl px-3 sm:px-6 py-3 sm:py-4">
        <div className="flex items-center gap-4 lg:gap-6">
          {/* Cover SOLO escritorio */}
          {currentTrack && (
            <div className="hidden lg:block w-24 h-24 xl:w-28 xl:h-28 rounded-xl overflow-hidden flex-shrink-0">
              <img
                src={currentTrack.cover || "/placeholder-cover.png"}
                alt={currentTrack.title || "Cover"}
                className="w-full h-full object-cover"
                loading="lazy"
                onError={(e) => { e.currentTarget.src = "/placeholder-cover.png"; }}
              />
            </div>
          )}

          {/* Columna derecha */}
          <div className="flex-1 min-w-0">
            {/* === Título + artista + fav (mobile con cover izquierda y fav derecha; desktop como antes) === */}
            <div className="mb-1">
            {/* MOBILE */}
            {currentTrack && (
              <div className="lg:hidden flex items-center gap-3">
                {/* cover (ancho fijo) */}
                <div className="w-10 h-10 rounded-md overflow-hidden flex-shrink-0 border border-[#0A84FF]/40">
                  <img
                    src={currentTrack.cover || "/placeholder-cover.png"}
                    alt={currentTrack.title || "Cover"}
                    className="w-full h-full object-cover"
                    loading="lazy"
                    onError={(e) => { e.currentTarget.src = "/placeholder-cover.png"; }}
                  />
                </div>

                  {/* textos centrados */}
                <div className="flex-1 min-w-0 text-center">
                  <div className="text-[#0A84FF] text-sm truncate">
                    {currentTrack?.title}
                  </div>
                  <div className="text-[11px] text-[#0A84FF]/80 truncate">
                    {currentTrack?.artist || ""}
                  </div>
                </div>

                  {/* fav a la derecha */}
                  <div className="ml-auto">
                    <FavButton trackId={trackId} track={currentTrack} size={16} />
                  </div>
                </div>
              )}

              {/* DESKTOP (tu versión actual) */}
              <div className="hidden lg:block relative pr-10">
                <div className="mx-auto max-w-[80vw] lg:max-w-3xl text-center">
                  <div className="text-[#0A84FF] text-sm truncate">
                    {currentTrack?.title}
                  </div>
                  <div className="text-xs text-[#0A84FF]/80 truncate">
                    {currentTrack?.artist || ""}
                  </div>
                </div>

                {currentTrack && (
                  <div className="lg:absolute lg:right-0 lg:top-1/2 lg:-translate-y-1/2">
                    <FavButton trackId={trackId} track={currentTrack} size={16} />
                  </div>
                )}
              </div>
            </div>

            {/* Barra de progreso */}
            <div className="mx-auto max-w-3xl flex items-center justify-center text-[11px] sm:text-xs text-[#0A84FF] select-none">
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
                  className="h-full bg-[#0A84FF] rounded-full transition-all"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="w-10 text-right">{fmt(duration)}</span>
            </div>

            {/* Controles compactos en móvil */}
            <div
              className="
                mt-2 flex items-center justify-center gap-4 sm:gap-6
                bg-[#0B0B0B] px-4 py-2 sm:px-6 sm:py-3 rounded-2xl border border-[#0A84FF]
                text-[#0A84FF]"
            >
              <button
                onClick={() => skipBackward(10)}
                disabled={controlsDisabled}
                className="disabled:cursor-not-allowed disabled:pointer-events-none"
                title="Retroceder 10s"
                aria-label="Retroceder 10 segundos"
              >
                <FaStepBackward className="hover:text-white text-base sm:text-lg" />
              </button>

              <button
                onClick={togglePlay}
                disabled={controlsDisabled}
                className="
                  text-[#0A84FF] p-2 sm:p-3 rounded-full cursor-pointer transition
                hover:text-white focus:outline-none
                  disabled:cursor-not-allowed disabled:pointer-events-none
                "
                aria-label={isPlaying ? "Pausar" : "Reproducir"}
              >
                {isPlaying ? <FaPause className="text-lg" /> : <FaPlay className="text-lg" />}
              </button>

              <button
                onClick={() => skipForward(10)}
                disabled={controlsDisabled}
                className="cursor-pointer disabled:cursor-not-allowed disabled:pointer-events-none"
                title="Avanzar 10s"
                aria-label="Avanzar 10 segundos"
              >
                <FaStepForward className="text-[#0A84FF] hover:text-white text-base sm:text-lg" />
              </button>

              <div className="h-6 w-px bg-white/10 mx-1 hidden sm:block" />

              <button
                onClick={toggleMute}
                disabled={controlsDisabled}
                className="disabled:cursor-not-allowed disabled:pointer-events-none hidden sm:block"
                aria-pressed={muted}
                title={muted ? "Quitar silencio" : "Silenciar"}
                aria-label={muted ? "Quitar silencio" : "Silenciar"}
              >
                {muted || volume === 0 ? (
                  <IoMdVolumeOff className="text-[#0A84FF] hover:text-white text-lg" />
                ) : (
                  <IoMdVolumeMute className="text-[#0A84FF] hover:text-white text-lg" />
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
                  className="w-28 accent-[#0A84FF] disabled:cursor-not-allowed disabled:pointer-events-none"
                  aria-label="Volumen"
                />
                <span className="text-xs text-[#0A84FF] w-10 text-right">
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