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
    <div className="w-full bg-black backdrop-blur-md py-6 px-6 flex items-center justify-center shadow-lg rounded-3xl border-2 border-[#1C1C1C]">
      <div className="flex items-center gap-6 w-full max-w-5xl">
        {/* Columna izquierda: portada grande */}
        <div className="w-32 h-32 rounded-xl overflow-hidden bg-neutral-800 flex-shrink-0">
          {currentTrack ? (
            <img
              src={currentTrack.cover || "/placeholder-cover.png"}
              alt={currentTrack.title || "Cover"}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={(e) => { e.currentTarget.src = "/placeholder-cover.png"; }}
            />
          ) : (
            <div className="w-full h-full animate-pulse" />
          )}
        </div>

        {/* Columna derecha: info + barra + controles */}
        <div className="flex-1 flex flex-col items-center">
          {/* Título + artista + fav */}
          <div className="mb-2 flex items-center justify-center gap-2">
            <div className="min-w-0 text-center">
              <div className="text-[#1DF0D8] text-sm truncate max-w-[min(60vw,28rem)]">
                {currentTrack?.title}
              </div>
              <div className="text-xs text-[#1DF0D8] truncate max-w-[min(60vw,28rem)]">
                {currentTrack?.artist || ""}
              </div>
            </div>
            {currentTrack && <FavButton trackId={trackId} size={18} />}
          </div>

          {/* Barra de progreso */}
          <div className="w-full mb-3 flex items-center text-xs text-[#1DF0D8] select-none">
            <span className="w-12 text-left">{fmt(progress)}</span>

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

            <span className="w-12 text-right">{fmt(duration)}</span>
          </div>

          {/* Controles */}
          <div className='flex items-center space-x-6 bg-[#1C1C1C] px-6 py-3 rounded-2xl shadow-inner backdrop-blur-sm'>
            <button
              onClick={() => skipBackward(10)}
              disabled={controlsDisabled}
              className='disabled:opacity-40 disabled:cursor-not-allowed'
              title="Retroceder 10s"
              aria-label="Retroceder 10 segundos"
            >
              <FaStepBackward className='text-[#1DF0D8] hover:text-white cursor-pointer text-lg' />
            </button>

            <button
              onClick={togglePlay}
              disabled={controlsDisabled}
              className='border border-[#1DF0D8] text-[#1DF0D8] p-3 rounded-full cursor-pointer shadow-md transition hover:text-white hover:border-white disabled:opacity-40 disabled:cursor-not-allowed'
              aria-label={isPlaying ? "Pausar" : "Reproducir"}
            >
              {isPlaying ? <FaPause /> : <FaPlay />}
            </button>

            <button
              onClick={() => skipForward(10)}
              disabled={controlsDisabled}
              className='disabled:opacity-40 disabled:cursor-not-allowed'
              title="Avanzar 10s"
              aria-label="Avanzar 10 segundos"
            >
              <FaStepForward className='text-[#1DF0D8] hover:text-white cursor-pointer text-base' />
            </button>

            <div className="h-6 w-px bg-white/10 mx-1" />

            <button
              onClick={toggleMute}
              disabled={controlsDisabled}
              className="disabled:opacity-40 disabled:cursor-not-allowed"
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

            <div className="flex items-center gap-2">
              <input
                type="range"
                min={0}
                max={1}
                step={0.01}
                value={volume}
                onChange={(e) => setVolume(+e.target.value)}
                disabled={controlsDisabled}
                className="w-32 accent-[#1DF0D8] disabled:opacity-40"
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
  );
};