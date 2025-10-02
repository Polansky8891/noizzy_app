import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";

export default function SelectField({
  label,
  value,
  onChange,
  options,
  placeholder = "Select…",
  className = "",
}) {
  const btnRef = useRef(null);
  const listRef = useRef(null);
  const lastPosRef = useRef({ top: 0, left: 0, width: 0, openUp: false });

  const [open, setOpen] = useState(false);
  const [pos, setPos] = useState({ top: 0, left: 0, width: 0, openUp: false });
  const [highlight, setHighlight] = useState(-1);

  // ✅ items memoizados (la identidad NO cambia en cada render)
  const items = useMemo(
    () =>
      (options || []).map((o) =>
        typeof o === "string" ? { label: o, value: o } : o
      ),
    [options]
  );
  const current = items.find((o) => o.value === value) || null;

  const close = () => {
    setOpen(false);
    setHighlight(-1);
  };

  const recalcPos = () => {
    const r = btnRef.current?.getBoundingClientRect();
    if (!r) return;
    const gap = 6;
    const maxList = 280;
    const openUp = r.bottom + gap + maxList > window.innerHeight;
    const next = {
      left: Math.round(r.left),
      width: Math.round(r.width),
      top: Math.round(openUp ? r.top - gap : r.bottom + gap),
      openUp,
    };
    const prev = lastPosRef.current;
    if (
      next.left !== prev.left ||
      next.width !== prev.width ||
      next.top !== prev.top ||
      next.openUp !== prev.openUp
    ) {
      lastPosRef.current = next;
      setPos(next);
    }
  };

  // ✅ Efecto sólo cuando está abierto (evita loops)
  useEffect(() => {
    if (!open) return;

    recalcPos();

    const onScroll = () => recalcPos();
    const onResize = () => recalcPos();
    const onClickAway = (e) => {
      if (
        !btnRef.current?.contains(e.target) &&
        !listRef.current?.contains(e.target)
      ) {
        close();
      }
    };
    const onKey = (e) => {
      if (e.key === "Escape") { e.preventDefault(); close(); }
      if (e.key === "ArrowDown") { e.preventDefault(); setHighlight((h) => Math.min(items.length - 1, h + 1)); }
      if (e.key === "ArrowUp") { e.preventDefault(); setHighlight((h) => Math.max(0, (h < 0 ? items.length : h) - 1)); }
      if (e.key === "Enter" && highlight >= 0) {
        e.preventDefault();
        onChange?.(items[highlight].value);
        close();
      }
    };

    window.addEventListener("scroll", onScroll, true);
    window.addEventListener("resize", onResize);
    window.addEventListener("click", onClickAway);
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("scroll", onScroll, true);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("click", onClickAway);
      window.removeEventListener("keydown", onKey);
    };
    // ⬇️ sólo depende de `open`
  }, [open]); // eslint-disable-line react-hooks/exhaustive-deps

  const dropdown =
    open &&
    createPortal(
      <div
        ref={listRef}
        style={{
          position: "fixed",
          top: pos.openUp ? undefined : pos.top,
          left: pos.left,
          bottom: pos.openUp ? window.innerHeight - pos.top : undefined,
          width: pos.width,
          maxHeight: 280,
        }}
        className="z-[9999] bg-[#1C1C1C] border border-[#0A84FF] rounded-md shadow-xl overflow-auto"
        role="listbox"
      >
        {items.map((opt, i) => {
          const selected = value === opt.value;
          const active = i === highlight;
          return (
            <div
              key={opt.value}
              role="option"
              aria-selected={selected}
              onMouseEnter={() => setHighlight(i)}
              onMouseDown={(e) => {
                e.preventDefault();
                onChange?.(opt.value);
                close();
              }}
              className={`px-3 py-2 text-sm text-[#0A84FF] cursor-pointer
                          ${active ? "bg-black/40" : ""} ${selected ? "font-semibold" : ""}`}
            >
              {opt.label}
            </div>
          );
        })}
      </div>,
      document.body
    );

  return (
    <div className={className}>
      {label && (
        <label className="flex justify-start text-sm font-medium text-[#0A84FF] mb-1">
          {label}
        </label>
      )}
      <button
        type="button"
        ref={btnRef}
        onClick={() => setOpen((v) => !v)}
        className="w-full p-3 border border-[#0A84FF] rounded-md text-left text-[#0A84FF]
                   focus:outline-none focus:ring focus:ring-[#0A84FF] relative"
        aria-haspopup="listbox"
        aria-expanded={open}
      >
        <span className={current ? "" : "opacity-60"}>
          {current ? current.label : placeholder}
        </span>
        {/* flecha eliminada */}
      </button>
      {dropdown}
    </div>
  );
}
