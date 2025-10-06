// src/components/SmartImage.jsx
import { useEffect } from "react";

/* Absolutiza rutas relativas (igual que en GenreCard) */
const toAbs = (
  p,
  base =
    import.meta.env.VITE_MEDIA_BASE_URL ||
    import.meta.env.VITE_API_URL ||
    "http://localhost:4000/api"
) =>
  !p ? "" : /^https?:\/\//i.test(p) ? p : (() => { try { return new URL(p, base).href; } catch { return p; } })();

/* Aplica transformaciones Cloudinary solo si la URL contiene /upload/ */
const withCloudinaryTransforms = (url, t) =>
  url && url.includes("/upload/") ? url.replace("/upload/", `/upload/${t}/`) : url || "";

/**
 * SmartImage optimizada para carrusel:
 * - c_limit (NO recorta; escala por ancho)
 * - dpr_1 + f_auto para URL estable y ligera
 * - q_auto:good si priority, si no eco
 * - srcSet con varios anchos para que el navegador elija el mínimo válido
 * - Reserva espacio con `ratio` o width/height → sin saltos de layout
 */
export default function SmartImage({
  src,
  alt = "",
  // reserva de espacio
  width,
  height,
  ratio = "16 / 9",
  // prioridad (primeras slides): eager + preload
  priority = false,
  // anchos disponibles (ajusta a tu layout real)
  widths = [480, 720, 960, 1280],
  sizes = "(min-width: 1024px) 720px, 92vw",
  className = "",
  rounded = "rounded-xl",
  style,
}) {
  const abs = toAbs(src);
  const quality = priority ? "good" : "eco";
  const make = (w) => withCloudinaryTransforms(abs, `c_limit,w_${w},f_auto,q_auto:${quality},dpr_1`);
  const srcSet = widths.map((w) => `${make(w)} ${w}w`).join(", ");
  // Por defecto usamos un ancho medio para arrancar
  const defaultW = widths[Math.min(1, widths.length - 1)] || widths[0]; // 720 si existe, si no el primero
  const defaultSrc = make(defaultW);

  // Preload de la imagen prioritaria para ganar ~300–600ms en primera vista
  useEffect(() => {
    if (!priority) return;
    const l = document.createElement("link");
    l.rel = "preload";
    l.as = "image";
    l.href = defaultSrc;
    l.crossOrigin = "anonymous";
    document.head.appendChild(l);
    return () => document.head.removeChild(l);
  }, [priority, defaultSrc]);

  const boxStyle = width && height ? { width, height, ...style } : { aspectRatio: ratio, ...style };

  return (
    <div className={`relative overflow-hidden ${rounded} bg-white/5 ${className}`} style={boxStyle}>
      <img
        src={defaultSrc}
        srcSet={srcSet}
        sizes={sizes}
        alt={alt}
        loading={priority ? "eager" : "lazy"}
        fetchpriority={priority ? "high" : "auto"}
        decoding="async"
        draggable={false}
        className="absolute inset-0 w-full h-full object-cover"
      />
    </div>
  );
}
