import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function PopoverPortal({
  anchorRef,
  open,
  onClose,
  children,
  offset = 8,
  align = "bottom",
}) {
  const elRef = useRef(null);
  const [mounted, setMounted] = useState(false);

  if (!elRef.current && typeof document !== "undefined") {
    const el = document.createElement("div");
    el.style.position = "fixed";
    el.style.zIndex = 9999;
    elRef.current = el;
  }

  // Monta / desmonta contenedor del portal
  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    document.body.appendChild(el);
    setMounted(true);
    return () => {
      if (el.parentNode) el.parentNode.removeChild(el);
    };
  }, []);

  const place = () => {
    const a = anchorRef?.current;
    const el = elRef.current;
    if (!a || !el) return;
    const r = a.getBoundingClientRect();

    if (align === "right") {
      el.style.left = `${r.right + offset}px`;
      el.style.top = `${r.top + r.height / 2}px`;
      el.style.transform = "translateY(-50%)";
    } else {
      el.style.left = `${r.left + r.width / 2}px`;
      el.style.top = `${r.bottom + offset}px`;
      el.style.transform = "translateX(-50%)";
    }
  };

  // Reposicionar al abrir / scroll / resize
  useLayoutEffect(() => {
    if (!open) return;
    let raf = null;
    const schedule = () => {
      if (raf) return;
      raf = requestAnimationFrame(() => {
        raf = null;
        place();
      });
    };
    schedule();
    window.addEventListener("resize", schedule);
    window.addEventListener("scroll", schedule, true);
    return () => {
      if (raf) cancelAnimationFrame(raf);
      window.removeEventListener("resize", schedule);
      window.removeEventListener("scroll", schedule, true);
    };
  }, [open, anchorRef, align, offset]);

  // Cerrar por outside (overlay) y Escape
  useEffect(() => {
    if (!open) return;
    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };
    document.addEventListener("keydown", handleKey);
    return () => document.removeEventListener("keydown", handleKey);
  }, [open, onClose]);

  if (!mounted || !open) return null;

  // Renderizamos un overlay click-through para cerrar por fuera + el popover
  // Nota: el overlay está en el MISMO portal para no depender del DOM del padre.
  return createPortal(
    <>
      <div
        className="fixed inset-0"
        onPointerDown={onClose}
        onMouseDown={onClose}
        aria-hidden="true"
        style={{ cursor: "default" }}
      />
      <div>
        {children}
      </div>
    </>,
    elRef.current
  );
}
