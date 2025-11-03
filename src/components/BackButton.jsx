import { useCallback } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { IoChevronBackOutline } from "react-icons/io5";

export default function BackButton({
  to = "/",
  replace = true,
  size = 22,
  className = "",
  iconClassName = "",
  onBeforeBack,
  onAfterBack,
  ...rest
}) {
  const navigate = useNavigate();
  const location = useLocation();

  const canGoBack = (() => {
    try {
      const idx = window?.history?.state?.idx ?? 0;
      return idx > 0;
    } catch {
      return false;
    }
  })();

  const handleClick = useCallback(
    (e) => {
      e?.preventDefault?.();
      e?.stopPropagation?.();

      if (typeof onBeforeBack === "function") {
        const ok = onBeforeBack();
        if (ok === false) return;
      }

      if (canGoBack) navigate(-1);
      else navigate(to, { replace });

      if (typeof onAfterBack === "function") {
        queueMicrotask(() => onAfterBack({ from: location.pathname }));
      }
    },
    [canGoBack, navigate, to, replace, onBeforeBack, onAfterBack, location.pathname]
  );

  return (
    <button
      type="button"
      onClick={handleClick}
      aria-label="Atrás"
      title="Atrás"
      // Sin “look de botón”: sin fondo, sin borde, sin sombra, sin padding
      className={[
        "inline-flex items-center justify-center",
        "bg-transparent border-0 shadow-none p-0",
        "cursor-pointer select-none",
        // Indicador de foco minimalista (no anillo grueso)
        "focus-visible:outline-none focus-visible:[&_svg]:opacity-80",
        className,
      ].join(" ")}
      {...rest}
    >
      <IoChevronBackOutline
        size={size}
        className={[
          "opacity-80 hover:opacity-100 transition-opacity",
          "align-middle",
          iconClassName,
        ].join(" ")}
      />
    </button>
  );
}