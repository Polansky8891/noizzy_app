import { useNavigate } from "react-router-dom";
import { logout } from "../store/auth/authSlice";
import { useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { FirebaseAuth } from "../firebase/config";
import api from "../api/axios";
import { flushSync } from "react-dom";

export const SettingsMenu = ({ closeMenu }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const closeNow = () => {
    try {
      flushSync(() => {
        closeMenu?.();
      });
    } catch {
      closeMenu?.();
    }
  };

  const goAccount = (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeNow();                 // desmonta YA
    navigate("/account");       // navega de forma imperativa
  };

  const handleLogout = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    closeNow();                 // desmonta YA

    try {
      await signOut(FirebaseAuth);
    } catch (error) {
      console.warn("Firebase signOut error:", error);
    }

    try {
      localStorage.removeItem("token");
      localStorage.removeItem("uid");
      localStorage.removeItem("name");
      localStorage.removeItem("email");
      localStorage.removeItem("photoURL");
      if (api?.defaults?.headers?.common) {
        delete api.defaults.headers.common.Authorization;
      }
      dispatch(logout());
    } finally {
      navigate("/profile", { replace: true });
    }
  };

  return (
    <div
      className="bg-[#1C1C1C] text-white rounded-xl shadow-lg border border-white/10 p-3 w-56"
      role="menu"
    >
      <ul className="space-y-1">
        <li>
          {/* Usamos button + pointerdown: cierre + navegación inmediata */}
          <button
            type="button"
            role="menuitem"
            onPointerDown={goAccount}
            onClick={(e) => e.preventDefault()} // evitar segundo click
            className="w-full text-left text-[#0A84FF] px-4 py-2 rounded-md border border-transparent transition-colors duration-200 hover:border-[#0A84FF]"
          >
            Account
          </button>
        </li>

        <li>
          <button
            type="button"
            role="menuitem"
            onPointerDown={handleLogout}
            onClick={(e) => e.preventDefault()}
            className="w-full text-left text-[#0A84FF] px-4 py-2 rounded-md border border-transparent transition-colors duration-200 hover:border-[#0A84FF]"
          >
            Log out
          </button>
        </li>
      </ul>
    </div>
  );
};
