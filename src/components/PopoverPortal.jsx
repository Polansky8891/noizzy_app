// PopoverPortal.jsx
import { useEffect, useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function PopoverPortal({ anchorRef, open, onClose, children, offset = 8, align = "bottom" }) {
  const elRef = useRef(document.createElement("div"));
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const el = elRef.current;
    el.style.position = "fixed";
    el.style.zIndex = 9999;
    document.body.appendChild(el);
    setMounted(true);
    return () => { document.body.removeChild(el); };
  }, []);

  const place = () => {
    const a = anchorRef?.current;
    const el = elRef.current;
    if (!a || !el) return;
    const r = a.getBoundingClientRect();

    if (align === "right") {
      el.style.left = `${r.right + offset}px`;
      el.style.top  = `${r.top + r.height / 2}px`;
      el.style.transform = "translateY(-50%)";
    } else {
      // bottom-center
      el.style.left = `${r.left + r.width / 2}px`;
      el.style.top  = `${r.bottom + offset}px`;
      el.style.transform = "translateX(-50%)";
    }
  };

  useLayoutEffect(() => {
    if (!open) return;
    place();
    const onScrollOrResize = () => place();
    window.addEventListener("resize", onScrollOrResize);
    window.addEventListener("scroll", onScrollOrResize, true);
    return () => {
      window.removeEventListener("resize", onScrollOrResize);
      window.removeEventListener("scroll", onScrollOrResize, true);
    };
  }, [open, anchorRef, align, offset]);

  useEffect(() => {
    const handler = (e) => {
      if (!open) return;
      const a = anchorRef?.current;
      if (a && (a === e.target || a.contains(e.target))) return;
      if (!elRef.current.contains(e.target)) onClose?.();
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [open, anchorRef, onClose]);

  if (!mounted || !open) return null;
  return createPortal(children, elRef.current);
}
