import { IoHomeOutline } from "react-icons/io5";
import { CgProfile } from "react-icons/cg";
import { Link } from "react-router-dom";
import { SearchBar } from "./SearchBar";

export const Nav = () => {
  return (
    <nav className="w-full h-16 bg-green-200 flex items-center justify-between px-4">
      <div className="h-16 flex items-center justify-between">
        {/* Logo */}
        <div className="text-3xl font-bold px-4">Logo</div>
        <SearchBar />
        {/* Menú */}
        <div className="flex items-center">
          
          <Link to="/" className="px-4 no-underline">
            <IoHomeOutline className="w-8 h-8" /> {/* Aumenta o ajusta el tamaño */}
          </Link>
          <Link to="/library" className="text-lg px-4 no-underline">LIBRARY</Link>
          <Link to="/profile" className="text-lg px-4 no-underline"><CgProfile className="w-8 h-8" /></Link>
        </div>
      </div>
    </nav>
  );
};
