// src/layout/AppLayout.jsx
import { useState, useEffect, useRef } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Header } from "./Header";
import { SideBar } from "./SideBar";

// 🔹 importa tu selector de auth y la thunk de favoritos
import { selectAuth } from "../store/auth/authSlice";
import { fetchFavoriteTracks } from "../store/favoritesSlice";

export default function AppLayout({ children, player }) {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  // 🔹 prefetch de favoritos cuando el usuario está logueado
  const dispatch = useDispatch();
  const { status } = useSelector(selectAuth);
  const hasFetchedOnce = useSelector((s) => s.favorites?.hasFetchedOnce);
  const isFetchingFavs = useSelector((s) => s.favorites?.loading);

  // evita dobles llamadas en modo Strict de React (dev)
  const didPrefetchRef = useRef(false);

  useEffect(() => {
    if (
      status === "authenticated" &&
      !hasFetchedOnce &&
      !isFetchingFavs &&
      !didPrefetchRef.current
    ) {
      didPrefetchRef.current = true;
      dispatch(fetchFavoriteTracks());
    }
  }, [status, hasFetchedOnce, isFetchingFavs, dispatch]);

  return (
    <div className="min-h-dvh bg-black text-white">
      <div className="lg:hidden">
        <Header onOpenSideBar={() => setSidebarOpen(true)} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[240px,1fr]">
        <aside className="hidden lg:block lg:h-dvh lg:sticky lg:top-0">
          <SideBar />
        </aside>

        <main className="min-h-[calc(100dvh-96px)] px-3 sm:px-6 lg:px-8 py-4">
          {children}
        </main>
      </div>

      {sidebarOpen && (
        <div className="lg:hidden fixed inset-0 z-40">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setSidebarOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-72 bg-[#111] shadow-xl p-4">
            <button
              className="mb-2 inline-flex items-center gap-2 text-sm text-gray-300"
              onClick={() => setSidebarOpen(false)}
            >
              <span>x</span> Close
            </button>
            <SideBar onNavigate={() => setSidebarOpen(false)} />
          </div>
        </div>
      )}

      <div className="fixed bottom-0 inset-x-0 z-30">{player}</div>
    </div>
  );
}
