// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthListener from "./store/auth/AuthListener";
import { SideBar } from "./components/SideBar";
import { MusicPlayer } from "./components/MusicPlayer";
import { useEffect, useRef, useState } from "react";

import { Home } from "./pages/Home";
import { Library } from "./pages/Library";
import { Register } from "./auth/pages/Register";
import { Login } from "./auth/pages/Login";
import { PersonalInformation } from "./components/PersonalInformation";
import { SubscriptionManagement } from "./components/SubscriptionManagement";
import { ChangePassword } from "./components/ChangePassword";
import { Notifications } from "./components/Notifications";
import { Address } from "./components/Address";
import { CancelSubscription } from "./components/CancelSubscription";
import { GenreCard } from "./components/GenreCard";
import { Favorites } from "./pages/Favorites";
import RequireAuth from "./auth/components/RequireAuth";
import { Stats } from "./pages/Stats";
import { Account } from "./components/Account";
import { Rock } from "./pages/Rock";
import { Pop } from "./pages/Pop";
import { Blues } from "./pages/Blues";
import { Classic } from "./pages/Classic";
import { Dubstep } from "./pages/Dubstep";
import { Electro } from "./pages/Electro";
import { HipHop } from "./pages/HipHop";
import { Reggae } from "./pages/Reggae";
import { House } from "./pages/House";
import { Jazz } from "./pages/Jazz";

import { FaBars } from "react-icons/fa";

function MobileHeader({ onOpen }) {
  return (
    <header className="lg:hidden sticky top-0 z-20 w-full border-b border-white/10
                       bg-black/70 backdrop-blur supports-[backdrop-filter]:bg-black/50 px-4 py-3">
        <div className="flex items-center gap-3">
          <button 
            onClick={onOpen}
            aria-label='Abrir menú'
            className="inline-flex items justify-center w-9 h-9 rounded-md
                       border border-white/15 text-emerald-300 hover:bg-white/5"
          >
            <FaBars className="w-5 h-5" />
          </button>
          <span className="text-lg font-medium text-emerald-300">Menu</span>
        </div>
    </header>
  );
}

export default function App() {
  const [drawerOpen, setDrawerOpen] = useState(false);

  const playerRef = useRef(null);
  const [playerH, setPlayerH] = useState(0);

  useEffect(() => {
    const update = () => {
      const h = playerRef.current?.offsetHeight || 0;
      setPlayerH;
    };
    update();

    window.addEventListener('resize', update);
    const ro = new ResizeObserver(update);
    if (playerRef.current) ro.observe(playerRef.current);
    return () => {
      window.removeEventListener('resize', update);
      ro.disconnect();
    };
  }, []);

  return (
    <BrowserRouter>
      <AuthListener />

      <div className="min-h-dvh bg-black text-white overflow-x-hidden">
        
        <MobileHeader onOpen={() => setDrawerOpen(true)} />
        <div className="flex">
          <aside className="hidden lg:block w-60 shrink-0 h-dvh sticky top-0">
            <SideBar />
          </aside>

          {/* Contenido principal */}
          <main
            className="flex-1 min-w-0 px-3 sm:px-6 lg:px-8 py-4"
            // deja hueco para que el player fijo no tape nada
            style={{ paddingBottom: `calc(${playerH}px + env(safe-area-inset-bottom))` }}
          >
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/library" element={<Library />} />
              <Route path="/profile" element={<Register />} />
              <Route path="/login" element={<Login />} />
              <Route path="/account" element={<Account />} />
              <Route path="/personal_information" element={<PersonalInformation />} />
              <Route path="/subscription_management" element={<SubscriptionManagement />} />
              <Route path="/change_password" element={<ChangePassword />} />
              <Route path="/notifications" element={<Notifications />} />
              <Route path="/address" element={<Address />} />
              <Route path="/cancel_subscription" element={<CancelSubscription />} />
              <Route path="/rock" element={<Rock />} />
              <Route path="/pop" element={<Pop />} />
              <Route path="/blues" element={<Blues />} />
              <Route path="/classic" element={<Classic />} />
              <Route path="/dubstep" element={<Dubstep />} />
              <Route path="/electro" element={<Electro />} />
              <Route path="/hiphop" element={<HipHop />} />
              <Route path="/reggae" element={<Reggae />} />
              <Route path="/house" element={<House />} />
              <Route path="/jazz" element={<Jazz />} />
              <Route path="/genre/:slug" element={<GenreCard />} />
              <Route path="/favorites" element={<Favorites />} />
              <Route
                path="/stats"
                element={
                  <RequireAuth>
                    <Stats />
                  </RequireAuth>
                }
              />
            </Routes>
          </main>
        </div>

        {drawerOpen && (
          <div className="lg:hidden fixed inset-0 z-40">
            <div
              className="absolute inset-0 bg-black/50"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="absolute inset-y-0 left-0 w-72 max-w-[85vw] bg-[#111] shadow-xl p-4">
              <button
                className="mb-3 inline-flex items-center gap-2 text-sm text-gray-300"
                onClick={() => setDrawerOpen(false)}
              >
                <span>x</span> Close
              </button>

              <SideBar onNavigate={() => setDrawerOpen(false)} />
            </div>
          </div>
        )}
        <div ref={playerRef} className="fixed bottom-0 inset-x-0 z-30">
            <MusicPlayer />
        </div>
      </div>
    </BrowserRouter>
  );
}
