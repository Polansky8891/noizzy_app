import { FaBars } from "react-icons/fa";
import { CgProfile } from "react-icons/cg";
import { useSelector } from "react-redux";
import { useRef, useState, useEffect } from "react";
import { SettingsMenu } from "./SettingsMenu";
import { Link } from "react-router-dom";

export function MobileHeader({ onToggle }) {
  const { status, photoURL: photoURLFromRedux, displayName } = useSelector((s) => s.auth);
  const photoURL = photoURLFromRedux || localStorage.getItem("photoURL") || "";

  const [openMenu, setOpenMenu] = useState(false);
  const menuRef = useRef(null);

  // Cierre por click/touch fuera (usa pointerdown para móviles)
  useEffect(() => {
    const handleOutside = (e) => {
      if (!openMenu) return;
      const root = menuRef.current;
      if (root && !root.contains(e.target)) {
        setOpenMenu(false);
      }
    };
    document.addEventListener("pointerdown", handleOutside, true);
    return () => document.removeEventListener("pointerdown", handleOutside, true);
  }, [openMenu]);

  return (
    <header
      className="lg:hidden sticky top-0 z-20 w-full border-b border-white/10
                 bg-black/70 backdrop-blur supports-[backdrop-filter]:bg-black/50 px-4 py-3"
    >
      <div className="flex items-center justify-between">
        <button
          onClick={onToggle}
          aria-label="Abrir menú"
          className="inline-flex items-center justify-center w-9 h-9 rounded-md
                     border border-white/15 text-[#0A84FF] hover:bg-white/5"
        >
          <FaBars className="w-5 h-5" />
        </button>

        {status === "authenticated" ? (
          <div className="relative" ref={menuRef}>
            <button
              onClick={() => setOpenMenu((v) => !v)}
              aria-haspopup="menu"
              aria-expanded={openMenu}
              className="inline-flex items-center justify-center w-9 h-9 rounded-full border border-white/15 hover:bg-white/5"
              title={displayName || "Settings"}
            >
              {photoURL ? (
                <img
                  src={photoURL}
                  alt={displayName || "Profile"}
                  className="w-8 h-8 rounded-full object-cover"
                  referrerPolicy="no-referrer"
                />
              ) : (
                <CgProfile className="w-6 h-6 text-[#0A84FF]" />
              )}
            </button>

            {openMenu && (
              <div role="menu" className="absolute right-0 mt-2 min-w-48">
                <SettingsMenu
                  // ✅ nombre de prop correcto para que el menú pueda cerrarse
                  closeMenu={() => setOpenMenu(false)}
                />
              </div>
            )}
          </div>
        ) : (
          <Link to="/profile" className="text-lg px-4 no-underline" aria-label="Iniciar sesión">
            <CgProfile className="w-6 h-6 text-[#0A84FF]" />
          </Link>
        )}
      </div>
    </header>
  );
}
