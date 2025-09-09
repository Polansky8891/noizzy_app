import { SideBarButton } from "./SideBarButton";
import { HiHome } from "react-icons/hi2";
import { MdLibraryMusic, MdFavoriteBorder } from "react-icons/md";
import { BsGraphUp } from "react-icons/bs";
import { SettingsMenu } from "./SettingsMenu";
import { useRef, useState, useEffect } from "react";
import { CgProfile } from "react-icons/cg";
import { Link } from "react-router-dom";
import { useSelector } from "react-redux";
import PopoverPortal from "./PopoverPortal";

export const SideBar = () => {
  const [collapsed, setCollapsed] = useState(false);

  const avatarWrapRef = useRef(null);
  const avatarBtnRef  = useRef(null);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [animateClose, setAnimateClose] = useState(false);

  const { status, photoURL: photoURLFromRedux, displayName } = useSelector((s) => s.auth);
  const photoURL = photoURLFromRedux || localStorage.getItem("photoURL") || "";

  useEffect(() => {
    const handleClickOutside = (e) => {
      const wrap = avatarWrapRef.current;
      const btn = avatarBtnRef.current;
      if (wrap && !wrap.containts(e.target) && btn && !btn.contains(e.target)) {
        setIsMenuOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleAvatarMouseDown = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleAvatarMouseUp = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setIsMenuOpen((v) => !v);
  };

  const closeMenu = () => {
    setAnimateClose(true);
    setTimeout(() => {
      setIsMenuOpen(false);
      setAnimateClose(false);
    }, 200);
  };

  const handleDoubleClick = (e) => {
    if (e.target.closest("a")) return;
    setCollapsed((v) => !v);
  };

  return (
    <aside
      onDoubleClick={handleDoubleClick}
      className={`${collapsed ? "w-20" : "w-64"} h-full bg-[#1C1C1C] text-white p-4 rounded-3xl flex flex-col transition-all duration-300 ease-in-out overflow-visible`}
    >
      <div className="text-lg font-semibold mb-2" />

      <div className="flex flex-col items-center">
        {!collapsed && (
          status === "authenticated" ? (
            <div className="relative" ref={avatarWrapRef}>
              <button
                type="button"
                ref={avatarBtnRef}
                onMouseDown={handleAvatarMouseDown}
                onMouseUp={handleAvatarMouseUp}
                className="text-lg px-4 rounded-full focus:outline-none focus:ring-2 focus:ring-[#1DF0D8]/50"
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
              <PopoverPortal anchorRef={avatarBtnRef} open={isMenuOpen} onClose={closeMenu} align="bottom">
                  <div 
                    className={`mt-2 transition-all duration-200 ${
                    isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2 pointer-events-none'
                  }`}
                  onMouseDown={(e) => e.stopPropagation()}
                  onClick={(e) => e.stopPropagation()}
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
        )}
      </div>

      <div className="flex-1 flex items-center justify-center">
        <ul className="flex flex-col items-center gap-4">
          <li>
            <span className="text-[#1DF0D8] text-xl leading-none">
              <SideBarButton title={collapsed ? "" : "Home"} to="/" icon={<HiHome />} iconClassName="text-[#1DF0D8]" />
            </span>
          </li>
          <li>
            <SideBarButton title={collapsed ? "" : "Library"} to="/library" icon={<MdLibraryMusic />} iconClassName="text-[#1DF0D8]" />
          </li>
          <li>
            <SideBarButton title={collapsed ? "" : "Favorites"} to="/favorites" icon={<MdFavoriteBorder />} iconClassName="text-[#1DF0D8]" />
          </li>
          <li>
            <SideBarButton title={collapsed ? "" : "Stats"} to="/stats" icon={<BsGraphUp />} iconClassName="text-[#1DF0D8]" />
          </li>
        </ul>
      </div>
    </aside>
  );
};
