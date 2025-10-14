// App.jsx
import { BrowserRouter, Routes, Route } from "react-router-dom";
import AuthListener from "./store/auth/AuthListener";
import { SideBar } from "./components/SideBar";
import { MusicPlayer } from "./components/MusicPlayer";
import { useEffect, useRef, useState } from "react";
import MobileNav from "./components/MobileNav";
import { MobileHeader } from "./components/MobileHeader";

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
import AuthGate from "./components/AuthGate";
import { useSelector } from "react-redux";
import { selectAuth, selectIdToken } from "./store/auth/authSlice";
import { FirebaseAuth } from "./firebase/config";


export default function App() {

  const { status } = useSelector(selectAuth);
  const token = useSelector(selectIdToken);
  const fbUser = FirebaseAuth?.currentUser || null;
  const isAuthed = !!fbUser && status === "authenticated" && !!token;

  const [mobileNavOpen, setMobileNavOpen] = useState(false);

  const playerRef = useRef(null);
  const [playerH, setPlayerH] = useState(0);

  useEffect(() => {
    const setVar = (h) => {
      document.documentElement.style.setProperty('--player-h', `${h}px`);
    };

    if (!isAuthed) {
      setPlayerH(0);
      setVar(0);
      return;
    }

    const update = () => {
      const h = playerRef.current?.offsetHeight || 0;
      setPlayerH(h);
      setVar(h)
    };

    update();

    const ro = new ResizeObserver(update);
    if (playerRef.current) ro.observe(playerRef.current);

    window.addEventListener('resize', update);
    return () => {
      window.removeEventListener('resize', update);
      ro.disconnect();
    };
  }, [isAuthed]);

  return (
    <BrowserRouter>
      <AuthListener />

      <div className="min-h-dvh bg-black text-white overflow-x-hidden">
        {/* Header móvil */}
        <MobileHeader onToggle={() => setMobileNavOpen(v => !v)} />
        <MobileNav open={mobileNavOpen} onClose={() => setMobileNavOpen(false)} />

        {/* ✅ Sidebar fija en desktop (fuera del flujo) */}
        <aside className="hidden lg:block fixed inset-y-0 left-0 w-60 z-40">
          <SideBar />
        </aside>

        {/* ✅ Contenido desplazado a la derecha de la sidebar fija */}
        <div className="lg:ml-60">
          <main
            className="flex-1 min-w-0 px-3 sm:px-6 lg:px-8 py-4 lg:h-dvh lg:overflow-y-auto"
            style={{ paddingBottom: `calc(${playerH}px + env(safe-area-inset-bottom))` }}
            onClick={() => setMobileNavOpen(false)}
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

        {/* Player sólo si hay sesión */}
        {isAuthed &&(
          <div ref={playerRef} className="fixed bottom-0 inset-x-0 z-50">
          <MusicPlayer />
          </div>
        )}
        <AuthGate />
      </div>
    </BrowserRouter>
  );
}