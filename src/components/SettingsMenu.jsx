import { useNavigate } from "react-router-dom";
import { logout } from "../store/auth/authSlice";
import { useDispatch } from "react-redux";
import { signOut } from "firebase/auth";
import { FirebaseAuth } from "../firebase/config";
import api from "../api/axios";

export const SettingsMenu = ({ closeMenu }) => {
  const navigate = useNavigate();
  const dispatch = useDispatch();

  const handleClick = async () => {
    try {
      await signOut(FirebaseAuth);
    } catch (error) {
      console.warn("Firebase signOut error:", error);
    }

    localStorage.removeItem("token");
    localStorage.removeItem("uid");
    localStorage.removeItem("name");
    localStorage.removeItem("email");
    localStorage.removeItem("photoURL");

    if (api?.defaults?.headers?.common) {
      delete api.defaults.headers.common.Authorization;
    }

    dispatch(logout());

    closeMenu?.();
    navigate("/profile", { replace: true });
  };

  return (
    <div className="bg-[#1C1C1C] text-white rounded-xl shadow-lg border border-white/10 p-3 w-56">
      <ul className="space-y-1">
        <li>
          <button
            onClick={() => {
              navigate("/account");
              closeMenu?.();
            }}
            className="w-full text-left text-[#0A84FF] px-4 py-2 transition-all duration-200 hover:text-lg"
          >
            Account
          </button>
        </li>
        <li>
          <button
            onClick={() => {
              alert("Option 2 clicked");
              closeMenu();
            }}
            className="w-full text-left text-[#0A84FF] px-4 py-2 transition-all duration-200 hover:text-lg"
          >
            Settings
          </button>
        </li>
        <li>
          <button
            onClick={handleClick}
            className="w-full text-left text-[#0A84FF] px-4 py-2 transition-all duration-200 hover:text-lg"
          >
            Log out
          </button>
        </li>
      </ul>
    </div>
  );
};
