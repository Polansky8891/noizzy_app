import { useNavigate } from "react-router-dom";
import { logout } from "../store/auth/authSlice";
import { useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { FirebaseAuth } from "../firebase/config";
import { useState } from "react";

export const SettingsMenu = ({ closeMenu, loginPath = "/login" }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();
  const [loggingOut, setLoggingOut] = useState(false);

  const handleLogout = async () => {
    if (loggingOut) return;
    setLoggingOut(true);
    try {
      await signOut(FirebaseAuth);
    } catch (error) {
      console.warn("Firebase signOut error:", error);
    } finally {
      dispatch(logout());
      // dispatch(resetFavorites());
      closeMenu?.();
      navigate(loginPath, { replace: true });
      setLoggingOut(false);
    }
  };

  return (
    <div className="bg-[#1C1C1C] text-white rounded-xl shadow-lg border border-white/10 p-3 w-56">
      <ul className="space-y-1">
        <li>
          <button
            onClick={() => { navigate("/account"); closeMenu?.(); }}
            className="w-full text-left text-white px-4 py-2 hover:bg-[#1DF0D8]"
          >
            Account
          </button>
        </li>
        <li>
          <button
            onClick={() => { alert("Option 2 clicked"); closeMenu?.(); }}
            className="w-full text-left text-white px-4 py-2 hover:bg-[#1DF0D8]"
          >
            Settings
          </button>
        </li>
        <li>
          <button
            onClick={handleLogout}
            disabled={loggingOut}
            className="w-full text-left text-white px-4 py-2 hover:bg-[#1DF0D8] disabled:opacity-50"
          >
            {loggingOut ? "Logging out…" : "Log out"}
          </button>
        </li>
      </ul>
    </div>
  );
};