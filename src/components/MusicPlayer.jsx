import { FaPlay, FaStepForward, FaStepBackward, FaHeart } from 'react-icons/fa';
import { useState } from 'react';

export const MusicPlayer = () => {
  const [progress, setProgress] = useState(42); // segundos
  const duration = 215;

  const formatTime = (time) => {
    const mins = Math.floor(time / 60);
    const secs = ('0' + (time % 60)).slice(-2);
    return `${mins}:${secs}`;
  };

  return (
    <div className="w-full bg-black backdrop-blur-md py-6 px-6 flex flex-col items-center justify-center shadow-lg rounded-3xl border-2 border-[#1C1C1C]">
      {/* Barra superior: tiempos y progreso */}
      <div className="flex items-center w-full max-w-2xl mb-3 text-xs text-[#1DF0D8]">
        <span className="w-12 text-left">{formatTime(progress)}</span>
        <div className="flex-1 h-2 mx-2 bg-gradient-to-r from-gray-600 to-gray-800 rounded-full overflow-hidden">
          <div
            className="h-full bg-[#1DF0D8] rounded-full transition-all"
            style={{ width: `${(progress / duration) * 100}%`,
                     color: '#1DF0D8'
          }}
          ></div>
        </div>
        <span className="w-12 text-right">{formatTime(duration)}</span>
      </div>

      {/* Controles en burbuja */}
      <div className="flex items-center space-x-6 bg-[#1C1C1C] px-6 py-3 rounded-2xl shadow-inner backdrop-blur-sm">
        <FaStepBackward className="text-[#1DF0D8] hover:text-white cursor-pointer text-lg" />
        <button className="bg-#1DF0D8 border-1 border-[#1DF0D8] text-[#1DF0D8] p-3 rounded-full cursor-pointer shadow-md transition hover:text-white hover:border-white">
          <FaPlay />
        </button>
        <FaStepForward className="text-[#1DF0D8] hover:text-white cursor-pointer text-lg" />
        <FaHeart className="text-[#1DF0D8] hover:text-white cursor-pointer text-base ml-3" />
      </div>
    </div>
  );
};