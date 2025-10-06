import { useEffect, useRef, useState } from "react";

export default function SmartImage({
  src,
  alt = "",
  width,
  height,
  ratio = "1 / 1",
  placeholder = "",
  className = "",
  rounded = "rounded-xl",
}) {
  const [loaded, setLoaded] = useState(false);
  const [errored, setErrored] = useState(false);
  const imgRef = useRef(null);

  useEffect(() => {
    if (!src) return;
    let cancelled = false;

    const img = new Image();
    img.src = src;
    img.decoding = "async";
    img.onload = async () => {
      try {
        // Garantiza que esté decodificada antes de pintar
        if (img.decode) await img.decode();
      } catch {/* safari a veces lanza */}
      if (!cancelled) setLoaded(true);
    };
    img.onerror = () => {
      if (!cancelled) setErrored(true);
    };

    return () => { cancelled = true; };
  }, [src]);

  // Contenedor: reserva espacio para evitar saltos de layout
  const styleBox = width && height
    ? { width, height }
    : { aspectRatio: ratio };

  return (
    <div
      className={`relative overflow-hidden ${rounded} bg-white/5`}
      style={styleBox}
    >
      {/* Skeleton / Blur-up */}
      <div
        className={`absolute inset-0 transition-opacity duration-300 ${
          loaded ? "opacity-0" : "opacity-100"
        }`}
        aria-hidden="true"
      >
        {placeholder ? (
          <img
            src={placeholder}
            alt=""
            className={`w-full h-full object-cover blur-md scale-105 ${rounded}`}
            loading="eager"
          />
        ) : (
          <div className="w-full h-full animate-pulse bg-gradient-to-br from-neutral-800 to-neutral-700" />
        )}
      </div>

      {/* Final */}
      {!errored && (
        <img
          ref={imgRef}
          src={src}
          alt={alt}
          className={`absolute inset-0 w-full h-full object-cover transition-opacity duration-300 ${
            loaded ? "opacity-100" : "opacity-0"
          } ${className} ${rounded}`}
          draggable={false}
          loading="lazy"
        />
      )}

      {/* Fallback si falla */}
      {errored && (
        <div className="absolute inset-0 flex items-center justify-center text-neutral-400 text-xs">
          no cover
        </div>
      )}
    </div>
  );
}