import { useEffect } from "react";
import { createPortal } from "react-dom";
import { useSelector } from "react-redux";
import { useLocation, useNavigate } from "react-router-dom";
import { selectAuth, selectIdToken, selectHydrated } from "../store/auth/authSlice";
import { FirebaseAuth } from "../firebase/config";



export default function AuthGate() {
  const { status } = useSelector(selectAuth);
  const token = useSelector(selectIdToken);
  const fbUser = FirebaseAuth?.currentUser || null;

  const isFullyAuthed = !!fbUser && status === "authenticated" && !!token;

  const location = useLocation();
  const AUTH_ROUTES = ["/login", "/profile"]; // ← tus rutas de auth
  const isAuthRoute = AUTH_ROUTES.some((p) => location.pathname.startsWith(p));

  const hydrated = useSelector(selectHydrated);
  const show = hydrated && !isFullyAuthed && !isAuthRoute;

  // Mostrar overlay SOLO si no hay sesión y NO estamos ya en /login o /profile
  

  // Bloquear scroll mientras esté visible
  useEffect(() => {
    if (!show) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => { document.body.style.overflow = prev; };
  }, [show]);

  if (!show) return null;

  return createPortal(<GatePopup />, document.body);
}

/* UI del popup con CTAs para navegar */
function GatePopup() {
  const navigate = useNavigate();

  return (
    <div
      role="dialog"
      aria-modal="true"
      className="fixed inset-0 z-[99999] bg-black/60 backdrop-blur-md flex items-center justify-center p-4"
    >
      <div className="w-full max-w-md rounded-2xl bg-[black] border border-[#0A84FF]/40 shadow-2xl overflow-hidden">
        <div className="px-5 py-4 border-b border-[#0A84FF]/30">
          <h2 className="text-[#0A84FF] text-lg font-semibold">Welcome to Noizzy</h2>
          <p className="text-sm text-white/70">Log in or create an account to continue</p>
        </div>

        <div className="p-5 space-y-4">
          <button
            onClick={() => navigate("/login")}
            className="w-full px-4 py-2 rounded-lg border border-[#0A84FF]/60 text-[#0A84FF] hover:bg-white/5 transition"
          >
            Log in
          </button>
          <button
            onClick={() => navigate("/profile")}
            className="w-full px-4 py-2 rounded-lg border border-[#0A84FF]/60 text-[#0A84FF] hover:bg-white/5 transition"
          >
            Create account
          </button>

          
        </div>
      </div>
    </div>
  );
}