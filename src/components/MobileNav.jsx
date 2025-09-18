import { NavLink } from "react-router-dom";
import { HiHome } from "react-icons/hi2";
import { MdLibraryMusic, MdFavoriteBorder } from "react-icons/md";
import { BsGraphUp } from "react-icons/bs";

function Item({ to, icon: Icon, label, onClick }) {
  return (
    <NavLink to={to} onClick={onClick}>
      {({ isActive }) => (
        <div className={`flex flex-col items-center justify-center w-16 px-1 py-1
                         ${isActive ? "text-gray-300" : "text-[#AC4BEB]"}`}>
          <Icon className="w-5 h-5" />
          <span className="text-[11px] mt-0.5 leading-none">{label}</span>
          <span className={`mt-1 h-[2px] w-6 rounded-full ${isActive ? "text-[#AC4BEB]" : "bg-transparent"}`} />
        </div>
      )}
    </NavLink>
  );
}

export default function MobileNav({ open, onClose }) {
  return (
    <div
      className={`lg:hidden fixed top-0 inset-x-0 z-30 transition-transform duration-200
                  ${open ? "translate-y-0" : "-translate-y-full"}`}
      aria-hidden={!open}
    >
      <nav className="bg-[#0b0b0b] border-b border-white/10 shadow-lg
                      pt-[env(safe-area-inset-top)]">
        <ul className="flex items-center justify-around py-2">
          <li><Item to="/" icon={HiHome} label="Home" onClick={onClose} /></li>
          <li><Item to="/library" icon={MdLibraryMusic} label="Library" onClick={onClose} /></li>
          <li><Item to="/favorites" icon={MdFavoriteBorder} label="Favorites" onClick={onClose} /></li>
          <li><Item to="/stats" icon={BsGraphUp} label="Stats" onClick={onClose} /></li>
        </ul>
      </nav>
    </div>
  );
}