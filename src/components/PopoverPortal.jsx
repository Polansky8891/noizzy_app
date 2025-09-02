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

  useEffect(() => {
    const el = elRef.current;
    if (!el) return;
    document.body.appendChild(el);
    setMounted(true);

    const stop = (e) => e.stopPropagation();
    el.addEventListener("mousedown", stop);
    el.addEventListener("click", stop);

    return () => {
      el.removeEventListener("mousedown", stop);
      el.removeEventListener("click", stop);
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

  useEffect(() => {
    if (!open) return;

    const handleDocClick = (e) => {
      const root = elRef.current;
      const anchor = anchorRef?.current;
      if (!root) return;

      if (anchor && (anchor === e.target || anchor.contains(e.target))) return;

      setTimeout(() => onClose?.(), 0);
    };

    const handleKey = (e) => {
      if (e.key === "Escape") onClose?.();
    };

    document.addEventListener("click", handleDocClick, false);
    document.addEventListener("keydown", handleKey);

    return () => {
      document.removeEventListener("click", handleDocClick, false);
      document.removeEventListener("keydown", handleKey);
    };
  }, [open, anchorRef, onClose]);

  if (!mounted || !open) return null;
  return createPortal(children, elRef.current);
}
