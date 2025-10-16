import { useState } from "react";
import { Header } from "./Header";
import { SideBar } from "./SideBar";
import AuthGate from "./AuthGate";

export default function AppLayout({ children, player }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  return (
    // min-h-0 es CLAVE para permitir que el <main> hijo pueda scrollear
    <div className="bg-black text-white min-h-dvh lg:grid lg:grid-cols-[15rem,1fr] lg:grid-rows-[auto,1fr,auto]">
      {/* Sidebar desktop (col 1, toda la altura de la grid) */}
      <aside className="hidden lg:block lg:row-[1/4] lg:col-[1] border-r border-neutral-800 min-h-0">
        <SideBar />
      </aside>

      {/* Header (mobile y desktop) */}
      <header className="lg:col-[2] lg:row-[1]">
        <div className="lg:hidden">
          <Header onOpenSideBar={() => setSidebarOpen(true)} />
        </div>
        <div className="hidden lg:block">
          {/* Si no quieres header en desktop, quita este bloque */}
          <Header onOpenSideBar={() => {}} />
        </div>
      </header>

      {/* Contenido scrolleable (SU PROPIA FILA) */}
      <main className="lg:col-[2] lg:row-[2] overflow-y-auto min-h-0 px-3 sm:px-6 lg:px-8 py-4">
        {children}
      </main>

      {/* Player ocupa su fila propia, NO es fixed */}
      <footer className="lg:col-[2] lg:row-[3] border-t border-neutral-800">
        {player}
      </footer>


      {/* Drawer móvil */}
      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-50">
          <div className="absolute inset-0 bg-black/50" onClick={() => setSidebarOpen(false)} />
          <div className="absolute inset-y-0 left-0 w-72 bg-[#111] shadow-xl p-4">
            <button
              className="mb-2 inline-flex items-center gap-2 text-sm text-gray-300"
              onClick={() => setSidebarOpen(false)}
            >
              <span>x</span> Close
            </button>
            <SideBar onNavigate={() => setSidebarOpen(false)} compact />
          </div>
        </div>
      )}
      <AuthGate />
    </div>
  );
}
