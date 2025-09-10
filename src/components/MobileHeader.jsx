import { FaBars } from "react-icons/fa";

export function MobileHeader({ onToggle }) {
  return (
    <header className="lg:hidden sticky top-0 z-20 w-full border-b border-white/10
                       bg-black/70 backdrop-blur supports-[backdrop-filter]:bg-black/50 px-4 py-3">
      <div className="flex items-center gap-3">
        <button
          onClick={onToggle}
          aria-label="Abrir menú"
          className="inline-flex items-center justify-center w-9 h-9 rounded-md
                     border border-white/15 text-emerald-300 hover:bg-white/5"
        >
          <FaBars className="w-5 h-5" />
        </button>
        <span className="text-lg font-medium text-emerald-300"></span>
      </div>
    </header>
  );
}
