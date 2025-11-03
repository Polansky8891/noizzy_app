import { SideBarButton } from "./SideBarButton";
import { HiHome } from "react-icons/hi2";
import { MdFavoriteBorder } from "react-icons/md";
import { BsGraphUp } from "react-icons/bs";
import { SettingsMenu } from "./SettingsMenu";
import { useRef, useState, useEffect } from "react";
import { CgProfile } from "react-icons/cg";
import { Link, useLocation } from "react-router-dom";
import { useSelector } from "react-redux";
import PopoverPortal from "./PopoverPortal";
import { flushSync } from "react-dom";

export const SideBar = ({ compact = false, onNavigate }) => {
  const [collapsed, setCollapsed] = useState(false);
  const avatarWrapRef = useRef(null);
  const avatarBtnRef  = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const { status, photoURL: photoURLFromRedux, displayName } = useSelector((s) => s.auth);
  const photoURL = photoURLFromRedux || localStorage.getItem("photoURL") || "";
  const location = useLocation();

  useEffect(() => {
    const handleClickOutside = (e) => {
      const wrap = avatarWrapRef.current;
      const btn = avatarBtnRef.current;
      if (wrap && !wrap.contains(e.target) && btn && !btn.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setIsMenuOpen(false);
  }, [location.key]);

  // ⬅️ cierre sincrónico: se desmonta ANTES de que ocurra la navegación/click
  const closeMenu = () => {
    flushSync(() => {
      setIsMenuOpen(false);
    });
  };

  const handleDoubleClick = (e) => {
    if (e.target.closest("a")) return;
    if (!compact) setCollapsed((v) => !v);
  };

  const padClass   = compact ? "p-3" : "p-4";
  const roundClass = compact ? "rounded-xl" : "rounded-3xl";
  const gapClass   = compact ? "gap-2" : "gap-4";
  const itemPad    = compact ? "px-3 py-2 text-sm" : "px-4 py-3 text-base";

  return (
    <aside
      onDoubleClick={handleDoubleClick}
      className={`w-full h-full bg-[#111111] ${padClass} ${roundClass} flex flex-col transition-all duration-300 ease-in-out`}
    >
      <div className="text-lg font-semibold mb-2" />

      <div className="flex flex-col items-center">
        {!compact && (
          !collapsed && (
            status === "authenticated" ? (
              <div className="relative" ref={avatarWrapRef}>
                <button
                  type="button"
                  ref={avatarBtnRef}
                  onClick={() => setIsMenuOpen((v) => !v)}
                  className="text-lg px-4 rounded-full"
                  aria-haspopup="menu"
                  aria-expanded={isMenuOpen}
                  aria-label="Abrir ajustes"
                >
                  {photoURL ? (
                    <img
                      src={photoURL}
                      alt={displayName || "Profile"}
                      className="w-10 h-10 rounded-full object-cover border border-white/10"
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <CgProfile className="w-8 h-8" />
                  )}
                </button>

                <PopoverPortal
                  anchorRef={avatarBtnRef}
                  open={isMenuOpen}
                  onClose={closeMenu}
                  align="bottom"
                >
                  <div
                    className={`mt-2 transition-all duration-200 ${
                      isMenuOpen ? "opacity-100 translate-y-0" : "opacity-0 translate-y-2 pointer-events-none"
                    }`}
                  >
                    <SettingsMenu closeMenu={closeMenu} />
                  </div>
                </PopoverPortal>
              </div>
            ) : (
              <Link to="/profile" className="text-lg px-4 no-underline" aria-label="Iniciar sesión">
                <CgProfile className="w-8 h-8" />
              </Link>
            )
          )
        )}

        {compact && (
          <div className="mb-1 text-gray-300 text-sm self-start">Menu</div>
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <ul className={`flex flex-col items-center ${gapClass}`}>
          <li>
            <span className="text-[#AC4BEB] text-xl leading-none">
              <SideBarButton
                title={compact ? "Home" : (collapsed ? "" : "Home")}
                to="/"
                icon={<HiHome />}
                iconClassName="text-[#AC4BEB]"
                onClick={onNavigate}
                className={itemPad}
              />
            </span>
          </li>
          <li>
            <SideBarButton
              title={compact ? "Favorites" : (collapsed ? "" : "Favorites")}
              to="/favorites"
              icon={<MdFavoriteBorder />}
              iconClassName="text-[#1DF0D8]"
              onClick={onNavigate}
              className={itemPad}
            />
          </li>
          <li>
            <SideBarButton
              title={compact ? "Stats" : (collapsed ? "" : "Stats")}
              to="/stats"
              icon={<BsGraphUp />}
              iconClassName="text-[#1DF0D8]"
              onClick={onNavigate}
              className={itemPad}
            />
          </li>
        </ul>
      </div>
    </aside>
  );
};
