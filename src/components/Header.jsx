import { useCallback } from "react"
import { Logo } from "./Logo"
import { Nav } from "./Nav"



export const Header = ({ onOpenSideBar }) => {
  const open = useCallback(() => onOpenSideBar?.(), [onOpenSideBar]);
  return (
    <header className="sticky top-0 z-20 w-full border-b border-white/10
                       bg-black/70 backdrop-blur supports-[backdrop-filter]:bg-black/50
                       px-4 sm:px-6 lg:px-8 py-3">
      <div className="mx-auto max-w-screen-2xl flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            className="lg:hidden inline-flex items-center justify-center w-9 h-9 rounded-md
                       border border-white/15 text-emerald-300 hover:bg-white/5" 
            aria-label='Abrir menú'
            onClick={open}
          >
            <svg width='20' height='20' viewBox="0 0 24 24" aria-hidden='true'>
              <path d="M4 7h16M4 12h16M4 17h16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
          </button>

          <Logo />
        </div>

        <div className="hidden lg:block">
            <Nav />
        </div>
      </div>
    </header>
  );
};
